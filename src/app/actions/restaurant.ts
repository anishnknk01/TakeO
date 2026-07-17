'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { ROUTES } from '@/constants/routes';
import { UserRole } from '@/types/auth';
import type { ActionResult } from '@/app/actions/auth';

// ---------------------------------------------------------------------------
// Auth guard helpers
// ---------------------------------------------------------------------------

async function requireOwner() {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.RESTAURANT_OWNER) {
    return { session: null, error: 'Not authorised.' as string };
  }
  return { session, error: null };
}

async function requireAdmin() {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) {
    return { session: null, error: 'Not authorised.' as string };
  }
  return { session, error: null };
}

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const RestaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const BranchSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2, 'ISO country code (2 letters)').default('US'),
  timezone: z.string().min(1, 'Timezone is required'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const StaffInviteSchema = z.object({
  email: z.string().email('Must be a valid email'),
  name: z.string().min(1, 'Name is required').max(100),
  branchId: z.string().uuid('Must select a branch'),
});

const SettingsSchema = z.object({
  maxSessionMinutes: z.coerce.number().int().min(15).max(480).default(360),
  maxPlaysPerDay: z.coerce.number().int().min(1).max(100).default(10),
  maxPointsPerDay: z.coerce.number().int().min(100).max(50000).default(5000),
  qrRotationMinutes: z.coerce.number().int().min(5).max(1440).default(60),
  nfcEnabled: z.boolean().default(false),
  wifiEnabled: z.boolean().default(false),
  beaconEnabled: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Restaurant actions
// ---------------------------------------------------------------------------

export async function createRestaurantAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const parsed = RestaurantSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? undefined,
    logoUrl: formData.get('logoUrl') ?? undefined,
  });
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, description, logoUrl } = parsed.data;

  // Prevent duplicate names within the group
  const existing = await prisma.restaurant.findFirst({
    where: { name, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
  });
  if (existing) {
    return { success: false, error: `A restaurant named "${name}" already exists in your group.` };
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      description,
      logoUrl: logoUrl || null,
      restaurantGroupId: session.restaurantGroupId!,
    },
  });

  await prisma.auditLog.create({
    data: { action: 'CREATE', entityType: 'Restaurant', entityId: restaurant.id, actorId: session.userId, actorRole: session.role },
  });

  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS);
  return { success: true, data: { id: restaurant.id } };
}

export async function updateRestaurantAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const id = formData.get('id') as string;
  if (!id) return { success: false, error: 'Restaurant ID is required.' };

  // Confirm ownership
  const restaurant = await prisma.restaurant.findFirst({
    where: { id, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
  });
  if (!restaurant) return { success: false, error: 'Restaurant not found.' };

  const parsed = RestaurantSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? undefined,
    logoUrl: formData.get('logoUrl') ?? undefined,
  });
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Check for name collision with another restaurant in the group
  const clash = await prisma.restaurant.findFirst({
    where: { name: parsed.data.name, restaurantGroupId: session.restaurantGroupId!, deletedAt: null, id: { not: id } },
  });
  if (clash) return { success: false, error: `Another restaurant named "${parsed.data.name}" already exists.` };

  await prisma.restaurant.update({
    where: { id },
    data: { name: parsed.data.name, description: parsed.data.description, logoUrl: parsed.data.logoUrl || null },
  });

  await prisma.auditLog.create({
    data: { action: 'UPDATE', entityType: 'Restaurant', entityId: id, actorId: session.userId, actorRole: session.role },
  });

  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS);
  return { success: true };
}

export async function deleteRestaurantAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const id = formData.get('id') as string;
  const restaurant = await prisma.restaurant.findFirst({
    where: { id, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
    include: { branches: { where: { deletedAt: null } } },
  });
  if (!restaurant) return { success: false, error: 'Restaurant not found.' };
  if (restaurant.branches.length > 0) {
    return { success: false, error: 'Delete all branches before deleting the restaurant.' };
  }

  await prisma.restaurant.update({ where: { id }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({
    data: { action: 'DELETE', entityType: 'Restaurant', entityId: id, actorId: session.userId, actorRole: session.role },
  });

  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_RESTAURANTS);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Branch actions
// ---------------------------------------------------------------------------

export async function createBranchAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const parsed = BranchSchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    name: formData.get('name'),
    address: formData.get('address') ?? undefined,
    city: formData.get('city') ?? undefined,
    country: formData.get('country') ?? 'US',
    timezone: formData.get('timezone') ?? 'UTC',
    latitude: formData.get('latitude') ?? undefined,
    longitude: formData.get('longitude') ?? undefined,
  });
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { restaurantId, name, ...rest } = parsed.data;

  // Confirm restaurant belongs to this owner's group
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
  });
  if (!restaurant) return { success: false, error: 'Restaurant not found.' };

  // Prevent duplicate branch name within the restaurant
  const existing = await prisma.branch.findFirst({
    where: { name, restaurantId, deletedAt: null },
  });
  if (existing) return { success: false, error: `A branch named "${name}" already exists in this restaurant.` };

  const branch = await prisma.branch.create({
    data: { name, restaurantId, ...rest },
  });

  // Create default settings for the branch's restaurant if not present
  await prisma.restaurantSettings.upsert({
    where: { restaurantId },
    create: { restaurantId },
    update: {},
  });

  await prisma.auditLog.create({
    data: { action: 'CREATE', entityType: 'Branch', entityId: branch.id, actorId: session.userId, actorRole: session.role },
  });

  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_BRANCHES);
  return { success: true, data: { id: branch.id } };
}

export async function updateBranchAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const id = formData.get('id') as string;
  const branch = await prisma.branch.findFirst({
    where: { id, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!branch) return { success: false, error: 'Branch not found.' };

  const parsed = BranchSchema.omit({ restaurantId: true }).safeParse({
    name: formData.get('name'),
    address: formData.get('address') ?? undefined,
    city: formData.get('city') ?? undefined,
    country: formData.get('country') ?? 'US',
    timezone: formData.get('timezone') ?? 'UTC',
    latitude: formData.get('latitude') ?? undefined,
    longitude: formData.get('longitude') ?? undefined,
  });
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.branch.update({ where: { id }, data: parsed.data });
  await prisma.auditLog.create({
    data: { action: 'UPDATE', entityType: 'Branch', entityId: id, actorId: session.userId, actorRole: session.role },
  });

  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_BRANCHES);
  return { success: true };
}

export async function deleteBranchAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const id = formData.get('id') as string;
  const branch = await prisma.branch.findFirst({
    where: { id, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!branch) return { success: false, error: 'Branch not found.' };

  await prisma.branch.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  await prisma.auditLog.create({
    data: { action: 'DELETE', entityType: 'Branch', entityId: id, actorId: session.userId, actorRole: session.role },
  });

  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_BRANCHES);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Staff actions
// ---------------------------------------------------------------------------

export async function inviteStaffAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const parsed = StaffInviteSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    branchId: formData.get('branchId'),
  });
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, name, branchId } = parsed.data;

  // Confirm branch belongs to this owner's group
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
    select: { id: true, restaurantId: true },
  });
  if (!branch) return { success: false, error: 'Branch not found.' };

  // Check if staff with this email already exists
  const existing = await prisma.restaurantStaff.findFirst({ where: { email, deletedAt: null } });
  if (existing) {
    // Just add the branch assignment if not already present
    await prisma.staffBranchAssignment.upsert({
      where: { staffId_branchId: { staffId: existing.id, branchId } },
      create: { staffId: existing.id, branchId },
      update: {},
    });
    revalidatePath(ROUTES.DASHBOARD_RESTAURANT_STAFF);
    return { success: true, data: { id: existing.id } };
  }

  const staff = await prisma.restaurantStaff.create({
    data: {
      email,
      name,
      restaurantId: branch.restaurantId,
      branchAssignments: { create: { branchId } },
    },
  });

  await prisma.auditLog.create({
    data: { action: 'CREATE', entityType: 'RestaurantStaff', entityId: staff.id, actorId: session.userId, actorRole: session.role },
  });

  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_STAFF);
  return { success: true, data: { id: staff.id } };
}

export async function removeStaffAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const staffId = formData.get('staffId') as string;
  const staff = await prisma.restaurantStaff.findFirst({
    where: { id: staffId, deletedAt: null, restaurant: { restaurantGroupId: session.restaurantGroupId! } },
  });
  if (!staff) return { success: false, error: 'Staff member not found.' };

  await prisma.restaurantStaff.update({ where: { id: staffId }, data: { deletedAt: new Date(), isActive: false } });
  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_STAFF);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Settings actions
// ---------------------------------------------------------------------------

export async function updateSettingsAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireOwner();
  if (!session) return { success: false, error: error! };

  const restaurantId = formData.get('restaurantId') as string;
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, restaurantGroupId: session.restaurantGroupId!, deletedAt: null },
  });
  if (!restaurant) return { success: false, error: 'Restaurant not found.' };

  const parsed = SettingsSchema.safeParse({
    maxSessionMinutes: formData.get('maxSessionMinutes'),
    maxPlaysPerDay: formData.get('maxPlaysPerDay'),
    maxPointsPerDay: formData.get('maxPointsPerDay'),
    qrRotationMinutes: formData.get('qrRotationMinutes'),
    nfcEnabled: formData.get('nfcEnabled') === 'true',
    wifiEnabled: formData.get('wifiEnabled') === 'true',
    beaconEnabled: formData.get('beaconEnabled') === 'true',
  });
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.restaurantSettings.upsert({
    where: { restaurantId },
    create: { restaurantId, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath(ROUTES.DASHBOARD_RESTAURANT_SETTINGS);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Admin actions
// ---------------------------------------------------------------------------

export async function adminApproveRestaurantGroupAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { success: false, error: error! };

  const groupId = formData.get('groupId') as string;
  await prisma.auditLog.create({
    data: { action: 'UPDATE', entityType: 'RestaurantGroup', entityId: groupId, actorId: session.userId, actorRole: session.role, note: 'Approved by admin' },
  });

  revalidatePath(ROUTES.DASHBOARD_ADMIN_GROUPS);
  return { success: true };
}

export async function adminSuspendRestaurantGroupAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { success: false, error: error! };

  const groupId = formData.get('groupId') as string;
  const group = await prisma.restaurantGroup.findFirst({ where: { id: groupId, deletedAt: null } });
  if (!group) return { success: false, error: 'Restaurant group not found.' };

  // Suspend by soft-deleting (admin can restore later)
  await prisma.restaurantGroup.update({ where: { id: groupId }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({
    data: { action: 'UPDATE', entityType: 'RestaurantGroup', entityId: groupId, actorId: session.userId, actorRole: session.role, note: 'Suspended by admin' },
  });

  revalidatePath(ROUTES.DASHBOARD_ADMIN_GROUPS);
  return { success: true };
}

export async function adminRestoreRestaurantGroupAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { success: false, error: error! };

  const groupId = formData.get('groupId') as string;
  await prisma.restaurantGroup.update({ where: { id: groupId }, data: { deletedAt: null } });
  await prisma.auditLog.create({
    data: { action: 'UPDATE', entityType: 'RestaurantGroup', entityId: groupId, actorId: session.userId, actorRole: session.role, note: 'Restored by admin' },
  });

  revalidatePath(ROUTES.DASHBOARD_ADMIN_GROUPS);
  return { success: true };
}

export async function adminCreateRestaurantGroupAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const { session, error } = await requireAdmin();
  if (!session) return { success: false, error: error! };

  const name = (formData.get('name') as string)?.trim();
  const isChain = formData.get('isChain') === 'true';
  const ownerEmail = (formData.get('ownerEmail') as string)?.trim();
  const ownerName = (formData.get('ownerName') as string)?.trim();

  if (!name || name.length < 2) return { success: false, error: 'Group name must be at least 2 characters.' };
  if (!ownerEmail || !ownerName) return { success: false, error: 'Owner email and name are required.' };

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const existingSlug = await prisma.restaurantGroup.findFirst({ where: { slug } });
  if (existingSlug) return { success: false, error: 'A restaurant group with a similar name already exists.' };

  const existingOwner = await prisma.restaurantOwner.findFirst({ where: { email: ownerEmail, deletedAt: null } });
  if (existingOwner) return { success: false, error: 'An owner with this email already exists.' };

  const group = await prisma.restaurantGroup.create({
    data: {
      name,
      slug,
      isChain,
      owners: { create: { email: ownerEmail, name: ownerName } },
    },
  });

  revalidatePath(ROUTES.DASHBOARD_ADMIN_GROUPS);
  redirect(`${ROUTES.DASHBOARD_ADMIN_GROUPS}/${group.id}`);
}
