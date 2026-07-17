/**
 * GET /api/billing/invoices
 * Returns invoices for the current owner's restaurant group.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || (session.role !== UserRole.RESTAURANT_OWNER && session.role !== UserRole.PLATFORM_ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const groupId =
    session.role === UserRole.PLATFORM_ADMIN
      ? searchParams.get('restaurantGroupId') ?? undefined
      : session.restaurantGroupId!;

  const where = groupId ? { restaurantGroupId: groupId } : {};

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, invoiceNumber: true, status: true,
        amountDue: true, amountPaid: true, currency: true,
        periodStart: true, periodEnd: true, paidAt: true, dueAt: true,
        provider: true, createdAt: true,
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({ invoices, total, page, limit, pages: Math.ceil(total / limit) });
}
