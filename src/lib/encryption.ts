/**
 * AES-256-GCM symmetric encryption for sensitive fields (e.g. phone numbers).
 * Key is 32 bytes stored as a 64-char hex string in ENCRYPTION_KEY env var.
 * Server-only module — never import in client components.
 */
import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16; // used by decipheriv implicitly

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    // In development without a key, use a deterministic dev key (never in prod)
    if (process.env.NODE_ENV !== 'production') {
      return Buffer.from('00'.repeat(32), 'hex');
    }
    throw new Error('ENCRYPTION_KEY must be a 64-char hex string (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

/** Encrypts a plaintext string. Returns `iv:tag:ciphertext` in hex. */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const key = getKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/** Decrypts a value produced by `encrypt`. Returns null if decryption fails. */
export function decrypt(ciphertext: string): string | null {
  try {
    const [ivHex, tagHex, dataHex] = ciphertext.split(':');
    if (!ivHex || !tagHex || !dataHex) return null;
    const key = getKey();
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

/**
 * Hash a phone number for indexing without storing plaintext.
 * Uses SHA-256 with an HMAC key so it is not reversible without the key.
 */
import { createHmac } from 'crypto';

export function hashPhone(phone: string): string {
  const secret = process.env.ENCRYPTION_KEY ?? '00'.repeat(32);
  return createHmac('sha256', secret).update(phone).digest('hex');
}
