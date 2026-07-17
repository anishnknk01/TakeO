/**
 * V2 Feature 15: Marketplace — browse and install items.
 */
import 'server-only';
import { prisma } from '@/lib/prisma';

export async function getMarketplaceItems(opts: {
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { type, search, page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(type ? { type: type as 'GAME' | 'THEME' | 'REWARD_TEMPLATE' | 'MARKETING_TEMPLATE' } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.marketplaceItem.findMany({ where, skip, take: limit, orderBy: { downloads: 'desc' } }),
    prisma.marketplaceItem.count({ where }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function installMarketplaceItem(itemId: string, restaurantGroupId: string) {
  const item = await prisma.marketplaceItem.findFirst({ where: { id: itemId, isPublished: true } });
  if (!item) throw new Error('Item not found.');

  await prisma.marketplaceInstall.upsert({
    where: { itemId_restaurantGroupId: { itemId, restaurantGroupId } },
    create: { itemId, restaurantGroupId },
    update: {},
  });

  await prisma.marketplaceItem.update({ where: { id: itemId }, data: { downloads: { increment: 1 } } });
}
