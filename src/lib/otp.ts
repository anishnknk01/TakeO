/**
 * OTP generation, storage, and verification.
 *
 * Storage strategy: uses the existing `VerificationToken` table.
 *   identifier = `otp:<e164phone>:<restaurantGroupId|"global">`
 *   token      = SHA-256 of the 6-digit code (never store plaintext)
 *   expires    = now + 5 minutes
 *
 * Rate-limiting state: stored as a VerificationToken with a special
 *   identifier prefix `ratelimit:<phone>` so no external store is needed.
 */
import 'server-only';

import { createHash, randomInt } from 'crypto';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OTP_DIGITS = 6;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILED_ATTEMPTS = 5;
const MAX_REQUESTS_PER_WINDOW = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const COOLDOWN_RESEND_SECONDS = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hashOtp(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

function otpIdentifier(phone: string, scope: string): string {
  return `otp:${phone}:${scope}`;
}

function rateLimitIdentifier(phone: string): string {
  return `ratelimit:${phone}`;
}

function failCountIdentifier(phone: string, scope: string): string {
  return `fails:${phone}:${scope}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type OtpSendResult =
  | { success: true; code: string; cooldownSeconds: number }
  | { success: false; reason: 'rate_limited'; retryAfterSeconds: number }
  | { success: false; reason: 'cooldown'; retryAfterSeconds: number };

/**
 * Generates a new OTP for the given phone number and scope.
 * Returns the plaintext code so the caller can hand it to the SMS provider.
 * In development (when NODE_ENV !== "production") the code is returned;
 * in production the caller must NOT log it.
 */
export async function generateOtp(phone: string, scope = 'global'): Promise<OtpSendResult> {
  const rateId = rateLimitIdentifier(phone);
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS);

  // Check rate limit — count requests in the current window
  const recentRequests = await prisma.verificationToken.count({
    where: {
      identifier: rateId,
      expires: { gt: windowStart },
    },
  });

  if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
    return {
      success: false,
      reason: 'rate_limited',
      retryAfterSeconds: Math.ceil(RATE_WINDOW_MS / 1000),
    };
  }

  // Check cooldown — look for an OTP issued within the cooldown window
  const cooldownStart = new Date(now.getTime() - COOLDOWN_RESEND_SECONDS * 1000);
  const existingOtp = await prisma.verificationToken.findFirst({
    where: {
      identifier: otpIdentifier(phone, scope),
      expires: { gt: cooldownStart },
    },
    orderBy: { expires: 'desc' },
  });

  if (existingOtp) {
    const issuedAt = new Date(existingOtp.expires.getTime() - OTP_TTL_MS);
    const cooldownEnd = new Date(issuedAt.getTime() + COOLDOWN_RESEND_SECONDS * 1000);
    const secondsLeft = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
    if (secondsLeft > 0) {
      return { success: false, reason: 'cooldown', retryAfterSeconds: secondsLeft };
    }
  }

  // Invalidate any prior OTPs and fail-count records for this phone+scope
  await prisma.verificationToken.deleteMany({
    where: { identifier: { in: [otpIdentifier(phone, scope), failCountIdentifier(phone, scope)] } },
  });

  // Generate new OTP
  const code = String(randomInt(10 ** (OTP_DIGITS - 1), 10 ** OTP_DIGITS)).padStart(OTP_DIGITS, '0');
  const hashed = hashOtp(code);
  const expires = new Date(now.getTime() + OTP_TTL_MS);

  // Store hashed OTP
  await prisma.verificationToken.create({
    data: { identifier: otpIdentifier(phone, scope), token: hashed, expires },
  });

  // Record rate-limit counter
  await prisma.verificationToken.create({
    data: {
      identifier: rateId,
      token: `req:${Date.now()}:${Math.random()}`,
      expires: new Date(now.getTime() + RATE_WINDOW_MS),
    },
  });

  return { success: true, code, cooldownSeconds: COOLDOWN_RESEND_SECONDS };
}

export type OtpVerifyResult =
  | { success: true }
  | { success: false; reason: 'invalid_or_expired' }
  | { success: false; reason: 'too_many_attempts' };

/** Verifies a submitted OTP code. Increments fail count on mismatch. */
export async function verifyOtp(phone: string, code: string, scope = 'global'): Promise<OtpVerifyResult> {
  const failId = failCountIdentifier(phone, scope);
  const otpId = otpIdentifier(phone, scope);
  const now = new Date();

  // Check fail count
  const failRecord = await prisma.verificationToken.findFirst({
    where: { identifier: failId },
  });
  const failCount = failRecord ? parseInt(failRecord.token, 10) : 0;

  if (failCount >= MAX_FAILED_ATTEMPTS) {
    // Invalidate the OTP so a fresh request is needed
    await prisma.verificationToken.deleteMany({
      where: { identifier: { in: [otpId, failId] } },
    });
    return { success: false, reason: 'too_many_attempts' };
  }

  // Look up the stored OTP
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: otpId, expires: { gt: now } },
  });

  if (!record || record.token !== hashOtp(code)) {
    // Increment fail count
    if (failRecord) {
      await prisma.verificationToken.update({
        where: { token: failRecord.token },
        data: { token: String(failCount + 1) },
      });
    } else {
      // Expire the fail counter when the OTP expires too
      const otpExpiry = record?.expires ?? new Date(now.getTime() + OTP_TTL_MS);
      await prisma.verificationToken.create({
        data: { identifier: failId, token: '1', expires: otpExpiry },
      });
    }
    return { success: false, reason: 'invalid_or_expired' };
  }

  // Valid — delete OTP and fail counter
  await prisma.verificationToken.deleteMany({
    where: { identifier: { in: [otpId, failId] } },
  });

  return { success: true };
}
