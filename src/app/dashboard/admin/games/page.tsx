import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getCurrentAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function AdminGamesPage(props: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ROUTES.AUTH_ADMIN_LOGIN);

  const { search = '', status = '', page: pageStr = '1' } = await props.searchParams;
  const page = Math.max(1, parseInt(pageStr, 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [games, total, categories] = await Promise.all([
    prisma.game.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        _count: { select: { gameSessions: true, restaurantGames: { where: { isActive: true } } } },
      },
    }),
    prisma.game.count({ where }),
    prisma.gameCategory.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  const pages = Math.ceil(total / limit);

  const statusColor: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
    ACTIVE: 'green',
    PENDING_REVIEW: 'yellow',
    INACTIVE: 'gray',
    ARCHIVED: 'red',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Game Catalog"
        description={`${total} game${total !== 1 ? 's' : ''} in the platform`}
        action={
          <Link href={ROUTES.DASHBOARD_ADMIN_GAMES_NEW}>
            <Button size="sm">+ Add Game</Button>
          </Link>
        }
      />

      <form method="GET" className="flex flex-wrap gap-2">
        <input name="search" defaultValue={search} placeholder="Search games…"
          className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <select name="status" defaultValue={status}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All statuses</option>
          {['PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'ARCHIVED'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary" size="sm">Filter</Button>
      </form>

      {games.length === 0 ? (
        <EmptyState title="No games found" action={<Link href={ROUTES.DASHBOARD_ADMIN_GAMES_NEW}><Button>Add First Game</Button></Link>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Game</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Version</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sessions</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Branches</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-400">{g.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g.category.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColor[g.status] ?? 'gray'}>{g.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{g.version}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g._count.gameSessions}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{g._count.restaurantGames}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`${ROUTES.DASHBOARD_ADMIN_GAMES}/${g.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex gap-2">
          {page > 1 && <Link href={`?page=${page - 1}`}><Button variant="secondary" size="sm">Previous</Button></Link>}
          {page < pages && <Link href={`?page=${page + 1}`}><Button variant="secondary" size="sm">Next</Button></Link>}
        </div>
      )}
    </div>
  );
}
