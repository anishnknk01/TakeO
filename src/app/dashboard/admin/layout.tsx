import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { requireRole } from '@/lib/dal';
import { UserRole } from '@/types/auth';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(UserRole.PLATFORM_ADMIN).catch(() => null);
  if (!session) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div />
          <span className="text-xs text-gray-400 uppercase tracking-wider">Platform Admin</span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
