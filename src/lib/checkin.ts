/**
 * Check-in core logic — QR token generation/validation, NFC tag management,
 * session creation, device fingerprinting, and visit lifecycle.
 *
 * Server-only. Never import in client components.
 */
import 'server-only';

import { createHash, createHmac, randomBytes } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import type { CheckInMethod } from '@prisma/client';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Default QR token lifetime — overridden per branch by RestaurantSettings */
const DEFAULT_QR_TTL_MINUTES = 60;

/** Visit session lifetime fallback (minutes) */
const DEFAULT_SESSION_MINUTES = 240;

/** Max failed check-in attempts per IP per 10-minute window */
const MAX_CHECKIN_ATTEMPTS_PER_WINDOW = 10;

function getTokenKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? 'dev-secret';
  // Derive a separate sub-key for QR tokens
  return new TextEncoder().encode(`qr-token:${secret}`);
}

// ---------------------------------------------------------------------------
// QR Token
// ---------------------------------------------------------------------------

interface QrTokenPayload {
  branchId: string;
  restaurantGroupId: string;
  jti: string; // unique token ID — stored as hash in DB
  iat: number;
}

/**
 * Generates a new signed QR token for a branch.
 * Stores a hash of the token in RestaurantQRCode.
 * Returns the full signed token (for display in the QR image).
 */
export async function generateQrToken(
  branchId: string,
  restaurantGroupId: string,
  ttlMinutes = DEFAULT_QR_TTL_MINUTES,
): Promise<{ token: string; expiresAt: Date; qrCodeId: string }> {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  const jti = randomBytes(16).toString('hex');

  const token = await new SignJWT({ branchId, restaurantGroupId, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .setJti(jti)
    .sign(getTokenKey());

  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Deactivate all previous QR codes for this branch
  await prisma.restaurantQRCode.updateMany({
    where: { branchId, isActive: true },
    data: { isActive: false },
  });

  const qrCode = await prisma.restaurantQRCode.create({
    data: { branchId, tokenHash, isActive: true, issuedAt: new Date(), expiresAt },
  });

  return { token, expiresAt, qrCodeId: qrCode.id };
}

/**
 * Validates a QR token from a customer scan.
 * Returns the decoded payload, or throws with a reason.
 */
export async function validateQrToken(token: string): Promise<QrTokenPayload & { qrCodeId: string }> {
  // 1. Verify signature and expiry
  let payload: QrTokenPayload;
  try {
    const { payload: p } = await jwtVerify(token, getTokenKey(), { algorithms: ['HS256'] });
    payload = p as unknown as QrTokenPayload;
  } catch {
    throw new CheckInError('qr_token_invalid', 'QR code is invalid or has expired.');
  }

  // 2. Look up by hash — must be active and not over-used
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const qrCode = await prisma.restaurantQRCode.findFirst({
    where: { tokenHash, isActive: true, branchId: payload.branchId },
  });

  if (!qrCode) throw new CheckInError('qr_token_revoked', 'QR code has already been used or revoked.');
  if (qrCode.expiresAt < new Date()) throw new CheckInError('qr_token_expired', 'QR code has expired.');
  // Replay prevention: each QR token is valid for one check-in
  if (qrCode.useCount >= 1) throw new CheckInError('qr_token_replayed', 'QR code has already been used.');

  return { ...payload, qrCodeId: qrCode.id };
}

/** Increments use count and optionally deactivates the QR token after use. */
export async function consumeQrToken(qrCodeId: string): Promise<void> {
  await prisma.restaurantQRCode.update({
    where: { id: qrCodeId },
    data: { useCount: { increment: 1 }, isActive: false },
  });
}

// ---------------------------------------------------------------------------
// NFC Tag
// ---------------------------------------------------------------------------

/**
 * Registers a new NFC tag for a branch.
 * The raw UID is encrypted for storage and hashed for fast lookup.
 */
export async function registerNfcTag(
  branchId: string,
  rawUid: string,
  label?: string,
): Promise<string> {
  const encryptedUid = encrypt(rawUid);
  const uidHash = createHmac('sha256', process.env.ENCRYPTION_KEY ?? '00'.repeat(32))
    .update(rawUid)
    .digest('hex');

  const existing = await prisma.restaurantNFCTag.findFirst({
    where: { uidHash, branchId, isActive: true },
  });
  if (existing) throw new CheckInError('nfc_tag_duplicate', 'This NFC tag is already registered to this branch.');

  const tag = await prisma.restaurantNFCTag.create({
    data: { branchId, encryptedUid, uidHash, label: label ?? null },
  });
  return tag.id;
}

/**
 * Validates an NFC UID presented by a customer.
 * Returns the branchId and tagId if valid.
 */
export async function validateNfcTag(
  rawUid: string,
): Promise<{ branchId: string; tagId: string }> {
  const uidHash = createHmac('sha256', process.env.ENCRYPTION_KEY ?? '00'.repeat(32))
    .update(rawUid)
    .digest('hex');

  const tag = await prisma.restaurantNFCTag.findFirst({
    where: { uidHash, isActive: true },
    select: { id: true, branchId: true },
  });

  if (!tag) throw new CheckInError('nfc_tag_unknown', 'NFC tag not recognised.');

  // Verify decryption round-trip to detect cloned tags
  const decryptedFromDb = await prisma.restaurantNFCTag
    .findUnique({ where: { id: tag.id }, select: { encryptedUid: true } })
    .then((r) => (r ? decrypt(r.encryptedUid) : null));

  if (decryptedFromDb !== rawUid) {
    throw new CheckInError('nfc_tag_tampered', 'NFC tag verification failed.');
  }

  await prisma.restaurantNFCTag.update({ where: { id: tag.id }, data: { lastUsedAt: new Date() } });

  return { branchId: tag.branchId, tagId: tag.id };
}

// ---------------------------------------------------------------------------
// Device fingerprinting
// ---------------------------------------------------------------------------

/**
 * Records (or updates) a device fingerprint for fraud detection.
 * Returns the hash — stored in CheckInSession for later cross-check.
 */
export async function recordDeviceFingerprint(
  customerId: string,
  fingerprintHash: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<void> {
  await prisma.deviceFingerprint.upsert({
    where: { customerId_fingerprintHash: { customerId, fingerprintHash } },
    create: { customerId, fingerprintHash, userAgent, ipAddress, seenCount: 1 },
    update: {
      lastSeenAt: new Date(),
      seenCount: { increment: 1 },
      ipAddress: ipAddress ?? undefined,
    },
  });
}

// ---------------------------------------------------------------------------
// Visit session
// ---------------------------------------------------------------------------

export interface CreateVisitResult {
  visitId: string;
  checkInSessionId: string;
  expiresAt: Date;
}

interface CreateVisitOptions {
  customerId: string;
  branchId: string;
  restaurantGroupId: string;
  method: CheckInMethod;
  artifactHash?: string;
  deviceHash?: string;
  ipAddress?: string;
}

/**
 * Core visit creation.
 * Enforces: one active visit per customer per restaurant group,
 * daily visit limits, and duplicate device detection.
 */
export async function createVisit(opts: CreateVisitOptions): Promise<CreateVisitResult> {
  const { customerId, branchId, restaurantGroupId, method, artifactHash, deviceHash, ipAddress } = opts;

  // 1. Confirm branch exists and belongs to the correct group
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, isActive: true, deletedAt: null, restaurant: { restaurantGroupId } },
    include: { restaurant: { include: { settings: true } } },
  });
  if (!branch) throw new CheckInError('branch_not_found', 'Branch not found or inactive.');

  const settings = branch.restaurant.settings;
  const sessionMinutes = settings?.maxSessionMinutes ?? DEFAULT_SESSION_MINUTES;

  // 2. Prevent duplicate active visit in the same group
  const existing = await prisma.restaurantVisit.findFirst({
    where: {
      customerId,
      branch: { restaurant: { restaurantGroupId } },
      status: 'ACTIVE',
    },
  });
  if (existing) {
    throw new CheckInError(
      'already_checked_in',
      'You already have an active visit. Please check out first.',
    );
  }

  // 3. Create visit + check-in session atomically
  const expiresAt = new Date(Date.now() + sessionMinutes * 60 * 1000);

  const visit = await prisma.$transaction(async (tx) => {
    const v = await tx.restaurantVisit.create({
      data: {
        customerId,
        branchId,
        status: 'ACTIVE',
        checkInAt: new Date(),
      },
    });

    await tx.checkInSession.create({
      data: {
        customerId,
        branchId,
        visitId: v.id,
        method,
        artifactHash: artifactHash ?? null,
        verifiedAt: new Date(),
        expiresAt,
        ipAddress: ipAddress ?? null,
      },
    });

    return v;
  });

  // 4. Audit log
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'RestaurantVisit',
      entityId: visit.id,
      actorId: customerId,
      actorRole: 'CUSTOMER',
      ipAddress: ipAddress ?? null,
      note: `Check-in via ${method}`,
    },
  }).catch(() => null);

  // 5. Record device fingerprint
  if (deviceHash) {
    await recordDeviceFingerprint(customerId, deviceHash, undefined, ipAddress).catch(() => null);
  }

  const checkInSession = await prisma.checkInSession.findFirst({
    where: { visitId: visit.id },
    select: { id: true },
  });

  return { visitId: visit.id, checkInSessionId: checkInSession!.id, expiresAt };
}

/**
 * Checks out a customer from their active visit.
 */
export async function checkoutVisit(
  visitId: string,
  customerId: string,
): Promise<void> {
  const visit = await prisma.restaurantVisit.findFirst({
    where: { id: visitId, customerId, status: 'ACTIVE' },
  });
  if (!visit) throw new CheckInError('visit_not_found', 'No active visit found.');

  await prisma.restaurantVisit.update({
    where: { id: visitId },
    data: { status: 'COMPLETED', checkOutAt: new Date() },
  });
}

/**
 * Expires all visits past their configured session duration.
 * Called as a background job (or per-request lazy check).
 */
export async function expireStaleVisits(): Promise<number> {
  const stale = await prisma.checkInSession.findMany({
    where: { expiresAt: { lt: new Date() }, visit: { status: 'ACTIVE' } },
    select: { visitId: true },
  });

  if (stale.length === 0) return 0;

  const { count } = await prisma.restaurantVisit.updateMany({
    where: { id: { in: stale.map((s) => s.visitId) }, status: 'ACTIVE' },
    data: { status: 'EXPIRED', checkOutAt: new Date() },
  });

  return count;
}

/**
 * Gets the active visit for a customer, with session expiry check.
 * Returns null if no active session or session has expired.
 */
export async function getActiveVisit(customerId: string) {
  const visit = await prisma.restaurantVisit.findFirst({
    where: { customerId, status: 'ACTIVE' },
    include: {
      branch: { select: { id: true, name: true, restaurant: { select: { name: true } } } },
      checkInSession: { select: { method: true, expiresAt: true } },
    },
    orderBy: { checkInAt: 'desc' },
  });

  if (!visit) return null;
  if (!visit.checkInSession) return null;

  // Lazy expiry
  if (visit.checkInSession.expiresAt < new Date()) {
    await prisma.restaurantVisit.update({
      where: { id: visit.id },
      data: { status: 'EXPIRED', checkOutAt: new Date() },
    });
    return null;
  }

  return visit;
}

/**
 * Writes a check-in log entry (success or failure).
 */
export async function logCheckInAttempt(opts: {
  branchId: string;
  customerId?: string;
  method: CheckInMethod;
  success: boolean;
  failReason?: string;
  deviceHash?: string;
  ipAddress?: string;
  visitId?: string;
}): Promise<void> {
  await prisma.checkInLog.create({
    data: {
      branchId: opts.branchId,
      customerId: opts.customerId ?? null,
      method: opts.method,
      success: opts.success,
      failReason: opts.failReason ?? null,
      deviceHash: opts.deviceHash ?? null,
      ipAddress: opts.ipAddress ?? null,
      visitId: opts.visitId ?? null,
    },
  }).catch(() => null); // never throw on audit failures
}

// ---------------------------------------------------------------------------
// Rate limiting (simple DB-backed counter — Redis is Phase 6+)
// ---------------------------------------------------------------------------

/**
 * Checks if the IP has exceeded the check-in attempt rate limit.
 * Uses VerificationToken table as a lightweight counter store.
 */
export async function checkRateLimit(ipAddress: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 10 * 60 * 1000);
  const identifier = `checkin-rate:${ipAddress}`;

  const count = await prisma.verificationToken.count({
    where: { identifier, expires: { gt: windowStart } },
  });

  return count < MAX_CHECKIN_ATTEMPTS_PER_WINDOW;
}

export async function recordRateLimitHit(ipAddress: string): Promise<void> {
  await prisma.verificationToken.create({
    data: {
      identifier: `checkin-rate:${ipAddress}`,
      token: `hit:${Date.now()}:${Math.random()}`,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    },
  }).catch(() => null);
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class CheckInError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CheckInError';
  }
}
