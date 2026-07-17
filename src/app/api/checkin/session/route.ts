/**
 * GET /api/checkin/session
 * Returns the current active visit for the authenticated customer.
 */
import { NextResponse } from 'next/server';
import { getActiveVisit } from '@/lib/checkin';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

export async function GET(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const visit = await getActiveVisit(session.userId);

  if (!visit) {
    return NextResponse.json({ activeVisit: null });
  }

  return NextResponse.json({
    activeVisit: {
      id: visit.id,
      branchId: visit.branchId,
      branchName: visit.branch.name,
      restaurantName: visit.branch.restaurant.name,
      checkInAt: visit.checkInAt,
      expiresAt: visit.checkInSession?.expiresAt,
      method: visit.checkInSession?.method,
      status: visit.status,
    },
  });
}
