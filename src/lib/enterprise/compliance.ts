/**
 * Enterprise: GDPR Compliance — data export, deletion, consent management.
 */
import 'server-only';
import { prisma } from '@/lib/prisma';

export async function requestDataExport(customerId: string, email: string, restaurantGroupId?: string) {
  return prisma.dataRequest.create({
    data: {
      type: 'EXPORT',
      requesterId: customerId,
      requesterEmail: email,
      restaurantGroupId,
    },
  });
}

export async function requestDataDeletion(customerId: string, email: string, restaurantGroupId?: string) {
  return prisma.dataRequest.create({
    data: {
      type: 'DELETION',
      requesterId: customerId,
      requesterEmail: email,
      restaurantGroupId,
    },
  });
}

export async function processDataExport(requestId: string): Promise<void> {
  const req = await prisma.dataRequest.findUnique({ where: { id: requestId } });
  if (!req || req.type !== 'EXPORT') return;

  await prisma.dataRequest.update({ where: { id: requestId }, data: { status: 'PROCESSING' } });

  // Collect all customer data
  const customer = await prisma.customer.findUnique({
    where: { id: req.requesterId },
    include: {
      profile: true,
      visits: { take: 100, orderBy: { checkInAt: 'desc' } },
      gameSessions: { take: 100, orderBy: { startedAt: 'desc' }, select: { id: true, gameId: true, finalScore: true, startedAt: true } },
      rewardClaims: { take: 50 },
      spinHistory: { take: 50 },
    },
  });

  // In production: generate a JSON/ZIP file, upload to secure storage, set resultUrl
  const resultUrl = `/api/enterprise/compliance/download/${requestId}`;

  await prisma.dataRequest.update({
    where: { id: requestId },
    data: { status: 'COMPLETED', resultUrl, completedAt: new Date() },
  });
}

export async function processDataDeletion(requestId: string): Promise<void> {
  const req = await prisma.dataRequest.findUnique({ where: { id: requestId } });
  if (!req || req.type !== 'DELETION') return;

  await prisma.dataRequest.update({ where: { id: requestId }, data: { status: 'PROCESSING' } });

  // Soft-delete + anonymize the customer
  await prisma.customer.update({
    where: { id: req.requesterId },
    data: {
      deletedAt: new Date(),
      phoneNumber: `deleted_${req.requesterId}`,
      displayHandle: null,
      isActive: false,
    },
  });

  // Delete profile
  await prisma.customerProfile.deleteMany({ where: { customerId: req.requesterId } });

  // Delete consent records
  await prisma.consentRecord.deleteMany({ where: { customerId: req.requesterId } });

  await prisma.dataRequest.update({
    where: { id: requestId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
}

export async function recordConsent(opts: {
  customerId: string;
  consentType: string;
  isGranted: boolean;
  ipAddress?: string;
  userAgent?: string;
}) {
  // Revoke existing consent of same type
  if (!opts.isGranted) {
    await prisma.consentRecord.updateMany({
      where: { customerId: opts.customerId, consentType: opts.consentType, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  return prisma.consentRecord.create({
    data: {
      customerId: opts.customerId,
      consentType: opts.consentType,
      isGranted: opts.isGranted,
      ipAddress: opts.ipAddress ?? null,
      userAgent: opts.userAgent ?? null,
    },
  });
}

export async function getConsentStatus(customerId: string) {
  const records = await prisma.consentRecord.findMany({
    where: { customerId, revokedAt: null },
    orderBy: { grantedAt: 'desc' },
  });

  const consents: Record<string, boolean> = {};
  for (const r of records) {
    if (!(r.consentType in consents)) {
      consents[r.consentType] = r.isGranted;
    }
  }
  return consents;
}
