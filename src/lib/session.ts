/**
 * Session management — stateless JWT stored in an HttpOnly cookie.
 * Uses `jose` for signing/verification (Node.js runtime compatible).
 * Must only run on the server.
 */
import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserRole } from '@/types/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionPayload {
  userId: string;
  role: UserRole;
  restaurantGroupId: string | null;
  /** ISO string — used for sliding expiry logic */
  expiresAt: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SESSION_COOKIE = 'pb_session';
const REFRESH_COOKIE = 'pb_refresh';

/** Session JWT lifetime — 24 hours */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
/** Refresh token lifetime — 30 days */
const REFRESH_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
/** Slide the session when fewer than this many ms remain */
const SESSION_SLIDE_THRESHOLD_MS = 6 * 60 * 60 * 1000;

function getEncodedKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET environment variable is not set');
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Encrypt / Decrypt
// ---------------------------------------------------------------------------

export async function encryptSession(payload: SessionPayload): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  return new SignJWT({ ...payload, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getEncodedKey());
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

export async function createSession(data: Omit<SessionPayload, 'expiresAt'>): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const payload: SessionPayload = { ...data, expiresAt: expiresAt.toISOString() };
  const token = await encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function createRefreshToken(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + REFRESH_DURATION_MS);
  const token = await new SignJWT({ userId, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getEncodedKey());

  const cookieStore = await cookies();
  cookieStore.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
  return token;
}

/** Slide the session expiry if it will expire within the threshold window. */
export async function refreshSessionIfNeeded(): Promise<void> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await decryptSession(raw);
  if (!payload) return;

  const expiresAt = new Date(payload.expiresAt);
  const msRemaining = expiresAt.getTime() - Date.now();
  if (msRemaining < SESSION_SLIDE_THRESHOLD_MS) {
    await createSession({
      userId: payload.userId,
      role: payload.role,
      restaurantGroupId: payload.restaurantGroupId,
    });
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  return decryptSession(raw);
}
