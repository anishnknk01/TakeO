/**
 * GET /api/checkin/visit-history
 * Returns paginated visit history for the authenticated customer.
 * Restaurant owners can also query by branchId.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPayload } from '@/lib/session';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const skip = (page - 1) * limit;

  let where: Record<string, unknown>;

  if (session.role === UserRole.CUSTOMER) {
    where = { customerId: session.userId };
  } else if (session.role === UserRole.RESTAURANT_OWNER || session.role === UserRole.RESTAURANT_STAFF) {
    const branchId = searchParams.get('branchId');
    where = {
      branch: { restaurant: { restaurantGroupId: session.restaurantGroupId } },
      ...(branchId ? { branchId } : {}),
    };
  } else if (session.role === UserRole.PLATFORM_ADMIN) {
    where = {};
  } else {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const [visits, total] = await Promise.all([
    prisma.restaurantVisit.findMany({
      where,
      skip,
      take: limit,
      orderBy: { checkInAt: 'desc' },
      select: {
        id: true,
        status: true,
        checkInAt: true,
        checkOutAt: true,
        pointsEarned: true,
        branch: { select: { name: true, restaurant: { select: { name: true } } } },
        checkInSession: { select: { method: true, expiresAt: true } },
        customer: session.role !== UserRole.CUSTOMER
          ? { select: { displayHandle: true } }
          : false,
      },
    }),
    prisma.restaurantVisit.count({ where }),
  ]);

  return NextResponse.json({ visits, total, page, limit, pages: Math.ceil(total / limit) });
}
