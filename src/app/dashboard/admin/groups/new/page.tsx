import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { AdminCreateGroupForm } from '@/components/restaurant/AdminCreateGroupForm';

export default async function NewGroupPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Restaurant Group"
        description="Set up a new tenant with an owner account"
        action={<Link href={ROUTES.DASHBOARD_ADMIN_GROUPS}><Button variant="secondary" size="sm">← Back</Button></Link>}
      />
      <AdminCreateGroupForm />
    </div>
  );
}
