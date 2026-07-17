import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getSessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { LogoutButtons } from '@/components/auth/LogoutButtons';

export const metadata: Metadata = {
  title: 'Session Manager — PlayBite',
  description: 'Manage your active sessions',
};

export default async function SessionManagerPage() {
  const session = await getSessionPayload();
  if (!session) redirect(ROUTES.AUTH_CUSTOMER_LOGIN);

  const activeSessions = await prisma.deviceSession.findMany({
    where: { customerId: session.userId, revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, userAgent: true, ipAddress: true, lastActiveAt: true, createdAt: true },
    orderBy: { lastActiveAt: 'desc' },
  });

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
      <p className="mt-1 text-sm text-gray-500">
        You have {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}.
      </p>

      <ul className="mt-6 space-y-3">
        {activeSessions.map((s) => (
          <li key={s.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="truncate text-sm font-medium text-gray-800">
              {s.userAgent ?? 'Unknown device'}
            </p>
            <p className="text-xs text-gray-400">{s.ipAddress ?? 'Unknown IP'}</p>
            <p className="mt-1 text-xs text-gray-400">
              Last active: {new Date(s.lastActiveAt).toLocaleString()}
            </p>
          </li>
        ))}
        {activeSessions.length === 0 && (
          <p className="text-sm text-gray-400">No tracked sessions found.</p>
        )}
      </ul>

      <div className="mt-8">
        <LogoutButtons />
      </div>
    </main>
  );
}
