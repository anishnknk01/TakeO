import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp';
import { createSession, createRefreshToken } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { UserRole } from '@/types/auth';
import { z } from 'zod';

const Body = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  code: z.string().length(6).regex(/^\d{6}$/),
  role: z.enum(['CUSTOMER', 'RESTAURANT_OWNER', 'PLATFORM_ADMIN']).default('CUSTOMER'),
  restaurantGroupId: z.string().uuid().optional(),
});

/**
 * POST /api/auth/verify-otp
 * Verifies the OTP, creates or fetches the user, and sets session cookies.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { phone, code, role, restaurantGroupId } = parsed.data;
  const scope = restaurantGroupId ?? 'global';

  const otpResult = await verifyOtp(phone, code, scope);
  if (!otpResult.success) {
    const status = otpResult.reason === 'too_many_attempts' ? 429 : 401;
    return NextResponse.json({ error: otpResult.reason }, { status });
  }

  // Resolve user identity
  let userId: string;
  let userRole: UserRole;
  let resolvedGroupId: string | null = null;
  let isNewUser = false;

  if (role === 'CUSTOMER') {
    if (!restaurantGroupId) {
      return NextResponse.json({ error: 'restaurantGroupId required for CUSTOMER' }, { status: 422 });
    }
    const encPhone = encrypt(phone);
    let customer = await prisma.customer.findFirst({
      where: { phoneNumber: encPhone, restaurantGroupId, deletedAt: null },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { phoneNumber: encPhone, restaurantGroupId },
      });
      isNewUser = true;
    }
    if (customer.isBanned) {
      return NextResponse.json({ error: 'account_suspended' }, { status: 403 });
    }
    userId = customer.id;
    userRole = UserRole.CUSTOMER;
    resolvedGroupId = restaurantGroupId;
  } else if (role === 'RESTAURANT_OWNER') {
    const owner = await prisma.restaurantOwner.findFirst({ where: { deletedAt: null } });
    if (!owner) return NextResponse.json({ error: 'owner_not_found' }, { status: 404 });
    userId = owner.id;
    userRole = UserRole.RESTAURANT_OWNER;
    resolvedGroupId = owner.restaurantGroupId;
  } else {
    const admin = await prisma.admin.findFirst({ where: { isActive: true, deletedAt: null } });
    if (!admin) return NextResponse.json({ error: 'admin_not_found' }, { status: 404 });
    userId = admin.id;
    userRole = UserRole.PLATFORM_ADMIN;
  }

  await createSession({ userId, role: userRole, restaurantGroupId: resolvedGroupId });
  await createRefreshToken(userId);

  const response = NextResponse.json({ success: true, isNewUser, role: userRole });
  return response;
}
