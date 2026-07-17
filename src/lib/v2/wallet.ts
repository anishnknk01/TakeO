/**
 * V2 Feature 11: Digital Wallet.
 */
import 'server-only';
import { prisma } from '@/lib/prisma';

export async function getWallet(customerId: string) {
  const [items, totalPoints] = await Promise.all([
    prisma.walletItem.findMany({
      where: { customerId, isUsed: false, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.findUnique({ where: { id: customerId }, select: { totalPoints: true } }),
  ]);

  return {
    points: totalPoints?.totalPoints ?? 0,
    items,
    counts: {
      coupons: items.filter((i) => i.type === 'COUPON').length,
      giftCards: items.filter((i) => i.type === 'GIFT_CARD').length,
      rewards: items.filter((i) => i.type === 'REWARD').length,
      badges: items.filter((i) => i.type === 'BADGE').length,
    },
  };
}

export async function addWalletItem(opts: {
  customerId: string;
  type: 'POINTS' | 'COUPON' | 'GIFT_CARD' | 'REWARD' | 'BADGE';
  label: string;
  value?: number;
  referenceId?: string;
  expiresAt?: Date;
}) {
  return prisma.walletItem.create({ data: opts });
}
