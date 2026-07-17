/**
 * POST /api/enterprise/compliance — Request data export or deletion
 * GET  /api/enterprise/compliance — Get request status
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { requestDataExport, requestDataDeletion, recordConsent, getConsentStatus } from '@/lib/enterprise/compliance';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

const RequestBody = z.object({
  type: z.enum(['EXPORT', 'DELETION']),
  email: z.string().email().optional(),
});

const ConsentBody = z.object({
  consentType: z.string().min(1),
  isGranted: z.boolean(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const action = request.nextUrl.searchParams.get('action');

  if (action === 'consent') {
    const consents = await getConsentStatus(session.userId);
    return NextResponse.json({ consents });
  }

  // List data requests for this user
  const requests = await prisma.dataRequest.findMany({
    where: { requesterId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, type: true, status: true, resultUrl: true, createdAt: true, completedAt: true },
  });

  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  // Consent recording
  const consentParsed = ConsentBody.safeParse(body);
  if (consentParsed.success) {
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const consent = await recordConsent({
      customerId: session.userId,
      consentType: consentParsed.data.consentType,
      isGranted: consentParsed.data.isGranted,
      ipAddress: ipAddress ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
    return NextResponse.json({ consent: { id: consent.id } }, { status: 201 });
  }

  // Data request
  const parsed = RequestBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  const email = parsed.data.email ?? 'unknown@playbite.io';
  const groupId = session.restaurantGroupId ?? undefined;

  if (parsed.data.type === 'EXPORT') {
    const req = await requestDataExport(session.userId, email, groupId);
    return NextResponse.json({ requestId: req.id, status: req.status }, { status: 202 });
  } else {
    const req = await requestDataDeletion(session.userId, email, groupId);
    return NextResponse.json({ requestId: req.id, status: req.status }, { status: 202 });
  }
}
