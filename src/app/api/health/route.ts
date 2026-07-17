/**
 * GET /api/health
 * Health check endpoint for load balancers, monitoring, and Docker HEALTHCHECK.
 * Returns 200 with basic status info.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
  let dbOk = false;
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const status = dbOk ? 'healthy' : 'degraded';
  const httpStatus = dbOk ? 200 : 503;

  return NextResponse.json(
    {
      status,
      version: process.env.npm_package_version ?? '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: { database: dbOk ? 'ok' : 'unreachable' },
    },
    { status: httpStatus },
  );
}
