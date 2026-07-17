import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload, deleteSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/logout
 * Clears session cookies. Optionally revokes all device sessions.
 *
 * Query param: ?all=true  →  revoke all active DeviceSession rows
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  const all = request.nextUrl.searchParams.get('all') === 'true';

  if (session) {
    if (all) {
      await prisma.deviceSession.updateMany({
        where: { customerId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }).catch(() => null);
    }

    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        entityType: session.role,
        entityId: session.userId,
        actorId: session.userId,
        actorRole: session.role,
        note: all ? 'Logout from all devices' : 'Logout from current device',
      },
    }).catch(() => null);
  }

  await deleteSession();
  return NextResponse.json({ success: true });
}
