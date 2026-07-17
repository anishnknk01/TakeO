/**
 * GET /api/enterprise/monitoring — System health and recent metrics
 * POST /api/enterprise/monitoring — Record a metric (internal use)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionPayload } from '@/lib/session';
import { getSystemHealth, getMetrics, recordMetric } from '@/lib/enterprise/monitoring';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const metricName = request.nextUrl.searchParams.get('name');
  if (metricName) {
    const since = new Date(Date.now() - 60 * 60 * 1000); // last hour
    const metrics = await getMetrics({ name: metricName, since });
    return NextResponse.json({ metrics });
  }

  const health = await getSystemHealth();
  return NextResponse.json({ health });
}

const MetricBody = z.object({
  name: z.string().min(1),
  value: z.number(),
  unit: z.string().optional(),
  tags: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionPayload();
  if (!session || session.role !== UserRole.PLATFORM_ADMIN) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const parsed = MetricBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'validation_failed' }, { status: 422 });

  await recordMetric(parsed.data);
  return NextResponse.json({ success: true }, { status: 201 });
}
