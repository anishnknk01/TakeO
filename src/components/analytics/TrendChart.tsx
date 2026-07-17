'use client';

/**
 * Simple bar chart for 7-day trend data.
 * Uses pure CSS/Tailwind — no charting library needed for Phase 9.
 * In production, swap with Recharts or Chart.js for full interactivity.
 */

interface TrendData {
  date: Date;
  totalVisits: number;
  totalGamePlays: number;
  totalRewardsRedeemed: number;
}

export function TrendChart({ data }: { data: TrendData[] }) {
  if (data.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">No trend data available yet.</p>;
  }

  const maxVisits = Math.max(...data.map((d) => d.totalVisits), 1);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-brand-500" />Visits</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-blue-400" />Games</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-green-400" />Rewards</span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => {
          const visitHeight = (d.totalVisits / maxVisits) * 100;
          const gameHeight = maxVisits > 0 ? (d.totalGamePlays / maxVisits) * 100 : 0;
          const rewardHeight = maxVisits > 0 ? (d.totalRewardsRedeemed / maxVisits) * 100 : 0;
          const dayLabel = new Date(d.date).toLocaleDateString('en', { weekday: 'short' });

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-0.5 h-32">
                <div className="w-2 bg-brand-500 rounded-t transition-all" style={{ height: `${visitHeight}%` }} title={`Visits: ${d.totalVisits}`} />
                <div className="w-2 bg-blue-400 rounded-t transition-all" style={{ height: `${gameHeight}%` }} title={`Games: ${d.totalGamePlays}`} />
                <div className="w-2 bg-green-400 rounded-t transition-all" style={{ height: `${rewardHeight}%` }} title={`Rewards: ${d.totalRewardsRedeemed}`} />
              </div>
              <span className="text-[10px] text-gray-400">{dayLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
