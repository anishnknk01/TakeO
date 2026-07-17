import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentOwner } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';

export default async function CheckInOverviewPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect(ROUTES.AUTH_RESTAURANT_LOGIN);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeVisits, todayVisits, activeQRCodes] = await Promise.all([
    prisma.restaurantVisit.count({
      where: {
        status: 'ACTIVE',
        branch: { restaurant: { restaurantGroupId: owner.restaurantGroupId } },
      },
    }),
    prisma.restaurantVisit.count({
      where: {
        checkInAt: { gte: today },
        branch: { restaurant: { restaurantGroupId: owner.restaurantGroupId } },
      },
    }),
    prisma.restaurantQRCode.count({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
        branch: { restaurant: { restaurantGroupId: owner.restaurantGroupId } },
      },
    }),
  ]);

  const sections = [
    { label: 'QR Management', href: ROUTES.DASHBOARD_RESTAURANT_QR, icon: '📲', description: 'Generate and regenerate QR tokens for each branch' },
    { label: 'NFC Management', href: ROUTES.DASHBOARD_RESTAURANT_NFC, icon: '📡', description: 'Register and manage NFC tags' },
    { label: 'Active Visitors', href: ROUTES.DASHBOARD_RESTAURANT_VISITORS, icon: '👥', description: 'See customers currently checked in' },
    { label: 'Visit History', href: ROUTES.DASHBOARD_RESTAURANT_VISIT_HISTORY, icon: '📋', description: 'Browse all visits and check-in logs' },
    { label: 'Check-in Settings', href: ROUTES.DASHBOARD_RESTAURANT_CHECKIN_SETTINGS, icon: '⚙️', description: 'Session duration, daily limits, and method toggles' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Check-in System" description="Manage customer presence verification" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Active Visitors</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{activeVisits}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Visits Today</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{todayVisits}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Active QR Codes</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{activeQRCodes}</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900">{s.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{s.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
