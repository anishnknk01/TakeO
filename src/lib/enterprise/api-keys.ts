/**
 * Enterprise: API Key management.
 * Keys are hashed (SHA-256) before storage; only the prefix is shown to users.
 */
import 'server-only';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `pb_${randomBytes(24).toString('hex')}`;
  const hash = createHash('sha256').update(raw).digest('hex');
  const prefix = raw.slice(0, 11); // "pb_" + first 8 hex chars
  return { raw, hash, prefix };
}

export async function createApiKey(opts: {
  restaurantGroupId: string;
  name: string;
  scopes?: string[];
  expiresAt?: Date;
}) {
  const { raw, hash, prefix } = generateApiKey();
  const key = await prisma.aPIKey.create({
    data: {
      name: opts.name,
      keyHash: hash,
      keyPrefix: prefix,
      scopes: opts.scopes ?? ['read'],
      expiresAt: opts.expiresAt ?? null,
      restaurantGroupId: opts.restaurantGroupId,
    },
  });
  // Return raw key only once — never stored or retrievable again
  return { id: key.id, rawKey: raw, prefix, name: key.name };
}

export async function validateApiKey(rawKey: string): Promise<{
  valid: boolean;
  restaurantGroupId?: string;
  scopes?: string[];
}> {
  const hash = createHash('sha256').update(rawKey).digest('hex');
  const key = await prisma.aPIKey.findFirst({
    where: { keyHash: hash, isActive: true },
    select: { id: true, restaurantGroupId: true, scopes: true, expiresAt: true },
  });

  if (!key) return { valid: false };
  if (key.expiresAt && key.expiresAt < new Date()) return { valid: false };

  // Update last used
  await prisma.aPIKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => null);

  return { valid: true, restaurantGroupId: key.restaurantGroupId, scopes: key.scopes as string[] };
}

export async function revokeApiKey(keyId: string, restaurantGroupId: string) {
  await prisma.aPIKey.updateMany({
    where: { id: keyId, restaurantGroupId },
    data: { isActive: false },
  });
}

export async function listApiKeys(restaurantGroupId: string) {
  return prisma.aPIKey.findMany({
    where: { restaurantGroupId, isActive: true },
    select: { id: true, name: true, keyPrefix: true, scopes: true, lastUsedAt: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: 'desc' },
  });
}
