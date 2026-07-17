import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { AdminGameForm } from '@/components/game/AdminGameForm';

export default async function NewGamePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const categories = await prisma.gameCategory.findMany({
    select: { id: true, name: true, type: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Game"
        action={<Link href={ROUTES.DASHBOARD_ADMIN_GAMES}><Button variant="secondary" size="sm">← Back</Button></Link>}
      />
      <AdminGameForm categories={categories} />
    </div>
  );
}
