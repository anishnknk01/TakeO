/**
 * V2 Feature 3: Referral System.
 */
import 'server-only';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function generateReferralCode(customerId: string, restaurantGroupId: string): Promise<string> {
  const existing = await prisma.referral.findFirst({ where: { referrerId: customerId, restaurantGroupId, isActive: true } });
  if (existing) return existing.code;

  const code = randomBytes(4).toString('hex').toUpperCase();
  await prisma.referral.create({
    data: { code, referrerId: customerId, restaurantGroupId },
  });
  return code;
}

export async function redeemReferralCode(code: string, refereeId: string): Promise<{ success: boolean; error?: string }> {
  const referral = await prisma.referral.findFirst({ where: { code: code.toUpperCase(), isActive: true } });
  if (!referral) return { success: false, error: 'Invalid referral code.' };
  if (referral.referrerId === refereeId) return { success: false, error: 'Cannot refer yourself.' };
  if (referral.maxUses && referral.usedCount >= referral.maxUses) return { success: false, error: 'Code has reached max uses.' };

  const alreadyUsed = await prisma.referralRedemption.findFirst({ where: { referralId: referral.id, refereeId } });
  if (alreadyUsed) return { success: false, error: 'Already used this code.' };

  await prisma.$transaction([
    prisma.referralRedemption.create({ data: { referralId: referral.id, refereeId } }),
    prisma.referral.update({ where: { id: referral.id }, data: { usedCount: { increment: 1 } } }),
    prisma.customer.update({ where: { id: referral.referrerId }, data: { totalPoints: { increment: referral.referrerBonus } } }),
    prisma.customer.update({ where: { id: refereeId }, data: { totalPoints: { increment: referral.refereeBonus } } }),
  ]);

  return { success: true };
}
