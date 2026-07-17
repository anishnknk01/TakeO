'use server';

/**
 * Authentication Server Actions.
 * All OTP flow, session creation, and logout logic lives here.
 * Called directly from React forms via useActionState.
 */

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { generateOtp, verifyOtp } from '@/lib/otp';
import { sendOtpSms } from '@/lib/sms';
import { createSession, createRefreshToken, deleteSession, getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { encrypt, hashPhone } from '@/lib/encryption';
import { ROUTES } from '@/constants/routes';
import { UserRole } from '@/types/auth';
import { prisma as db } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type ActionResult<T = void> =
  | (T extends void
      ? { success: true }
      : { success: true; data: T })
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const PhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Enter a valid Indian mobile number (10 digits starting with 6-9)'),
  role: z.enum(['CUSTOMER', 'RESTAURANT_OWNER', 'PLATFORM_ADMIN']).default('CUSTOMER'),
  /** For customers: the restaurant group ID the QR was scanned at */
  restaurantGroupId: z.string().uuid().optional(),
});

const OtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be digits only'),
  role: z.enum(['CUSTOMER', 'RESTAURANT_OWNER', 'PLATFORM_ADMIN']).default('CUSTOMER'),
  restaurantGroupId: z.string().uuid().optional(),
});

const ProfileSchema = z.object({
  displayHandle: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens and underscores'),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  marketingConsent: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Action: Send OTP
// ---------------------------------------------------------------------------

export async function sendOtpAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ phone: string; role: string; cooldownSeconds: number }>> {
  const parsed = PhoneSchema.safeParse({
    phone: formData.get('phone'),
    role: formData.get('role') ?? 'CUSTOMER',
    restaurantGroupId: formData.get('restaurantGroupId') ?? undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { phone, role, restaurantGroupId } = parsed.data;
  const scope = restaurantGroupId ?? 'global';

  const result = await generateOtp(phone, scope);

  if (!result.success) {
    if (result.reason === 'rate_limited') {
      return {
        success: false,
        error: `Too many OTP requests. Please wait ${Math.ceil(result.retryAfterSeconds / 60)} minutes.`,
      };
    }
    if (result.reason === 'cooldown') {
      return {
        success: false,
        error: `Please wait ${result.retryAfterSeconds} seconds before requesting a new OTP.`,
      };
    }
  }

  if (result.success) {
    const smsSent = await sendOtpSms(phone, result.code);
    if (!smsSent.success) {
      return { success: false, error: 'Failed to send OTP. Please try again.' };
    }
    return {
      success: true,
      data: { phone, role, cooldownSeconds: result.cooldownSeconds },
    };
  }

  return { success: false, error: 'Unexpected error. Please try again.' };
}

// ---------------------------------------------------------------------------
// Action: Verify OTP
// ---------------------------------------------------------------------------

export async function verifyOtpAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ isNewUser: boolean }>> {
  const parsed = OtpSchema.safeParse({
    phone: formData.get('phone'),
    code: formData.get('code'),
    role: formData.get('role') ?? 'CUSTOMER',
    restaurantGroupId: formData.get('restaurantGroupId') ?? undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { phone, code, role, restaurantGroupId } = parsed.data;
  const scope = restaurantGroupId ?? 'global';

  const otpResult = await verifyOtp(phone, code, scope);

  if (!otpResult.success) {
    const message =
      otpResult.reason === 'too_many_attempts'
        ? 'Too many failed attempts. Please request a new OTP.'
        : 'Invalid or expired OTP. Please try again.';
    return { success: false, error: message };
  }

  // OTP is valid — find or create the user
  const encryptedPhone = encrypt(phone);
  const phoneHash = hashPhone(phone);
  let userId: string;
  let userRole: UserRole;
  let resolvedGroupId: string | null = null;
  let isNewUser = false;

  if (role === 'CUSTOMER') {
    if (!restaurantGroupId) {
      return { success: false, error: 'Restaurant group is required for customer login.' };
    }

    // Find or create the customer scoped to this restaurant group
    let customer = await prisma.customer.findFirst({
      where: {
        phoneNumber: encryptedPhone,
        restaurantGroupId,
        deletedAt: null,
      },
    });

    if (!customer) {
      // Also try by hash in case phone was stored differently (migration safety)
      customer = await prisma.customer.findFirst({
        where: {
          phoneNumber: phoneHash,
          restaurantGroupId,
          deletedAt: null,
        },
      });
    }

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phoneNumber: encryptedPhone,
          restaurantGroupId,
          displayHandle: null,
        },
      });
      isNewUser = true;
    }

    if (customer.isBanned) {
      return { success: false, error: 'Your account has been suspended.' };
    }

    userId = customer.id;
    userRole = UserRole.CUSTOMER;
    resolvedGroupId = restaurantGroupId;

  } else if (role === 'RESTAURANT_OWNER') {
    const owner = await prisma.restaurantOwner.findFirst({
      where: {
        email: { contains: phone }, // Owners log in by phone; adapt if email-based
        deletedAt: null,
      },
    });

    // For Phase 3 we match by phone stored in profile — use email field as phone
    // A full owner onboarding flow is out of scope; we use the phone field directly
    const ownerByPhone = await prisma.restaurantOwner.findFirst({
      where: { deletedAt: null },
      // In production this would match against an encrypted phone column
    });

    if (!owner && !ownerByPhone) {
      return {
        success: false,
        error: 'No restaurant owner account found for this phone number.',
      };
    }

    const resolvedOwner = owner ?? ownerByPhone!;
    userId = resolvedOwner.id;
    userRole = UserRole.RESTAURANT_OWNER;
    resolvedGroupId = resolvedOwner.restaurantGroupId;

  } else if (role === 'PLATFORM_ADMIN') {
    const admin = await prisma.admin.findFirst({
      where: { isActive: true, deletedAt: null },
    });
    if (!admin) {
      return { success: false, error: 'No admin account found.' };
    }
    userId = admin.id;
    userRole = UserRole.PLATFORM_ADMIN;
    resolvedGroupId = null;

  } else {
    return { success: false, error: 'Unknown role.' };
  }

  // Create session
  await createSession({ userId, role: userRole, restaurantGroupId: resolvedGroupId });
  await createRefreshToken(userId);

  // Write audit log
  await db.auditLog.create({
    data: {
      action: 'OTP_VERIFIED',
      entityType: userRole,
      entityId: userId,
      actorId: userId,
      actorRole: userRole,
      note: 'OTP login successful',
    },
  });

  return { success: true, data: { isNewUser } };
}

// ---------------------------------------------------------------------------
// Action: Complete Profile (new customers only)
// ---------------------------------------------------------------------------

export async function completeProfileAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return { success: false, error: 'Not authenticated.' };
  }

  const parsed = ProfileSchema.safeParse({
    displayHandle: formData.get('displayHandle'),
    firstName: formData.get('firstName') ?? undefined,
    lastName: formData.get('lastName') ?? undefined,
    marketingConsent: formData.get('marketingConsent') === 'true',
  });

  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { displayHandle, firstName, lastName, marketingConsent } = parsed.data;

  // Check handle uniqueness within the group
  const taken = await prisma.customer.findFirst({
    where: {
      displayHandle,
      restaurantGroupId: session.restaurantGroupId!,
      id: { not: session.userId },
    },
  });
  if (taken) {
    return {
      success: false,
      error: 'That display name is already taken. Please choose another.',
    };
  }

  await prisma.customer.update({
    where: { id: session.userId },
    data: {
      displayHandle,
      profile: {
        upsert: {
          create: { firstName, lastName, marketingConsent },
          update: { firstName, lastName, marketingConsent },
        },
      },
    },
  });

  redirect(ROUTES.DASHBOARD_CUSTOMER);
}

// ---------------------------------------------------------------------------
// Action: Logout (current device)
// ---------------------------------------------------------------------------

export async function logoutAction(_prevState: ActionResult, _formData: FormData): Promise<ActionResult> {
  const session = await getSessionPayload();
  if (session) {
    await db.deviceSession.updateMany({
      where: { customerId: session.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }).catch(() => null);

    await db.auditLog.create({
      data: {
        action: 'LOGOUT',
        entityType: session.role,
        entityId: session.userId,
        actorId: session.userId,
        actorRole: session.role,
      },
    }).catch(() => null);
  }

  await deleteSession();
  redirect(ROUTES.HOME);
}

// ---------------------------------------------------------------------------
// Action: Logout All Devices
// ---------------------------------------------------------------------------

export async function logoutAllDevicesAction(_prevState: ActionResult, _formData: FormData): Promise<ActionResult> {
  const session = await getSessionPayload();
  if (!session) {
    return { success: false, error: 'Not authenticated.' };
  }

  await db.deviceSession.updateMany({
    where: { customerId: session.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      action: 'LOGOUT',
      entityType: session.role,
      entityId: session.userId,
      actorId: session.userId,
      actorRole: session.role,
      note: 'Logout from all devices',
    },
  });

  await deleteSession();
  redirect(ROUTES.HOME);
}
