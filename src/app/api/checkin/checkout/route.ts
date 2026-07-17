/**
 * POST /api/checkin/checkout
 * Ends the customer's active visit session.
 */
import { NextResponse } from 'next/server';
import { checkoutVisit, CheckInError } from '@/lib/checkin';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

export async function POST(): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.CUSTOMER) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  // Find active visit
  const visit = await prisma.restaurantVisit.findFirst({
    where: { customerId: session.userId, status: 'ACTIVE' },
    select: { id: true },
  });

  if (!visit) {
    return NextResponse.json({ error: 'no_active_visit', message: 'No active visit to check out from.' }, { status: 404 });
  }

  try {
    await checkoutVisit(visit.id, session.userId);
  } catch (err) {
    const e = err as CheckInError;
    return NextResponse.json({ error: e.code, message: e.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
