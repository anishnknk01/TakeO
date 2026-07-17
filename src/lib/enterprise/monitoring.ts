/**
 * Enterprise: System monitoring — metrics recording and querying.
 */
import 'server-only';
import { prisma } from '@/lib/prisma';

export async function recordMetric(opts: {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}) {
  await prisma.systemMetric.create({
    data: {
      name: opts.name,
      value: opts.value,
      unit: opts.unit ?? null,
      tags: (opts.tags as Record<string, string> | undefined) ?? undefined,
    },
  }).catch(() => null); // Non-blocking
}

export async function getMetrics(opts: {
  name: string;
  since?: Date;
  limit?: number;
}) {
  const { name, since, limit = 100 } = opts;
  return prisma.systemMetric.findMany({
    where: {
      name,
      ...(since ? { recordedAt: { gte: since } } : {}),
    },
    orderBy: { recordedAt: 'desc' },
    take: limit,
    select: { value: true, unit: true, tags: true, recordedAt: true },
  });
}

export async function getSystemHealth() {
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const [errorRate, avgLatency, activeConnections] = await Promise.all([
    prisma.systemMetric.aggregate({ where: { name: 'error_rate', recordedAt: { gte: fiveMinAgo } }, _avg: { value: true } }),
    prisma.systemMetric.aggregate({ where: { name: 'api_latency_p95', recordedAt: { gte: fiveMinAgo } }, _avg: { value: true } }),
    prisma.systemMetric.findFirst({ where: { name: 'active_connections' }, orderBy: { recordedAt: 'desc' }, select: { value: true } }),
  ]);

  return {
    errorRate: errorRate._avg.value ?? 0,
    avgLatencyMs: avgLatency._avg.value ?? 0,
    activeConnections: activeConnections?.value ?? 0,
    timestamp: now.toISOString(),
  };
}
