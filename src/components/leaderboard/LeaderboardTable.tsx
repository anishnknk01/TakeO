import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface LBEntry {
  rank: number | null;
  points: number;
  gamesPlayed?: number;
  customer: { id: string; displayHandle: string | null };
}

interface LeaderboardTableProps {
  entries: LBEntry[];
  myCustomerId?: string;
  title: string;
  period: string;
  date?: string;
  isFrozen: boolean;
  totalParticipants: number;
  showGamesPlayed?: boolean;
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function LeaderboardTable({
  entries,
  myCustomerId,
  title,
  period,
  date,
  isFrozen,
  totalParticipants,
  showGamesPlayed = false,
}: LeaderboardTableProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {date && <p className="text-xs text-gray-400">{date}</p>}
        </div>
        <div className="flex items-center gap-2">
          {isFrozen && <Badge variant="gray">Archived</Badge>}
          <span className="text-xs text-gray-400">{totalParticipants} players</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">
          No entries yet. Be the first to play!
        </div>
      ) : (
        <div>
          {/* Podium: top 3 */}
          {entries.slice(0, 3).length > 0 && (
            <div className="flex items-end justify-center gap-4 bg-gradient-to-b from-gray-50 to-white px-4 py-5">
              {/* 2nd */}
              {entries[1] && (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                    {entries[1].customer.displayHandle?.slice(0, 2).toUpperCase() ?? '??'}
                  </div>
                  <p className="text-xs font-medium text-gray-600 max-w-[70px] truncate text-center">
                    {entries[1].customer.displayHandle ?? 'Player'}
                  </p>
                  <p className="text-sm font-bold text-gray-700">{entries[1].points.toLocaleString()}</p>
                  <span className="text-xl">🥈</span>
                  <div className="h-12 w-14 rounded-t-lg bg-gray-200" />
                </div>
              )}
              {/* 1st */}
              {entries[0] && (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 ring-2 ring-brand-400">
                    {entries[0].customer.displayHandle?.slice(0, 2).toUpperCase() ?? '??'}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 max-w-[80px] truncate text-center">
                    {entries[0].customer.displayHandle ?? 'Player'}
                  </p>
                  <p className="text-base font-bold text-brand-600">{entries[0].points.toLocaleString()}</p>
                  <span className="text-2xl">🥇</span>
                  <div className="h-16 w-14 rounded-t-lg bg-brand-200" />
                </div>
              )}
              {/* 3rd */}
              {entries[2] && (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-500">
                    {entries[2].customer.displayHandle?.slice(0, 2).toUpperCase() ?? '??'}
                  </div>
                  <p className="text-xs font-medium text-gray-600 max-w-[70px] truncate text-center">
                    {entries[2].customer.displayHandle ?? 'Player'}
                  </p>
                  <p className="text-sm font-bold text-gray-700">{entries[2].points.toLocaleString()}</p>
                  <span className="text-xl">🥉</span>
                  <div className="h-8 w-14 rounded-t-lg bg-orange-100" />
                </div>
              )}
            </div>
          )}

          {/* Full list (ranks 4+, or all if no podium display) */}
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-10">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Player</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Points</th>
                {showGamesPlayed && (
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Games</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, idx) => {
                const isMe = entry.customer.id === myCustomerId;
                const rank = entry.rank ?? idx + 1;
                return (
                  <tr
                    key={entry.customer.id}
                    className={`${isMe ? 'bg-brand-50 font-semibold' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-2 text-sm">
                      {MEDAL[rank] ?? <span className="text-gray-500">#{rank}</span>}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={isMe ? 'text-brand-700' : 'text-gray-800'}>
                        {entry.customer.displayHandle ?? 'Player'}
                        {isMe && <span className="ml-1 text-xs text-brand-500">(you)</span>}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium">
                      <span className={isMe ? 'text-brand-600' : 'text-gray-800'}>
                        {entry.points.toLocaleString()}
                      </span>
                    </td>
                    {showGamesPlayed && (
                      <td className="px-4 py-2 text-right text-sm text-gray-500">
                        {entry.gamesPlayed ?? 0}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
