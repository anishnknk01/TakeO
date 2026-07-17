# PlayBite — Deployment Guide

## Prerequisites

- Node.js 20+ (LTS)
- PostgreSQL 16+
- Redis 7+ (optional for dev, required for production)
- Docker & Docker Compose (for containerised deployment)

## Quick Start (Development)

```bash
# 1. Clone and install
git clone <repo-url>
cd Restugames
npm install

# 2. Copy environment file
cp .env.example .env.local
# Edit .env.local with your database credentials

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database (dev only — use migrations in production)
npx prisma db push

# 5. Seed sample data (optional)
npm run db:seed

# 6. Start dev server
npm run dev
```

## Docker Deployment

```bash
# Build and start all services
docker compose up -d

# Run migrations inside the container
docker compose exec app npx prisma migrate deploy

# Seed (optional)
docker compose exec app npx tsx prisma/seed.ts
```

## Production Checklist

### Environment Variables (required)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | 32+ char secret for JWT signing (`openssl rand -base64 32`) |
| `AUTH_URL` | Full public URL of the app (no trailing slash) |
| `ENCRYPTION_KEY` | 64-char hex string for AES-256 (`openssl rand -hex 32`) |
| `PAYMENT_PROVIDER` | `STRIPE`, `RAZORPAY`, `PAYPAL`, or `MANUAL` |
| `REDIS_URL` | Redis connection string |
| `NODE_ENV` | `production` |

### Security Headers

Automatically applied via `next.config.ts`:
- HSTS (strict transport security)
- X-Frame-Options (clickjacking prevention)
- X-Content-Type-Options (MIME sniffing prevention)
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Database Migrations

Always use migrations in production (never `db push`):

```bash
npx prisma migrate deploy
```

### Health Check

`GET /api/health` returns:
- 200 with `{ status: "healthy" }` if DB is reachable
- 503 with `{ status: "degraded" }` if DB is unreachable

### Scheduled Jobs (Cron)

Configure these in your deployment platform (Vercel Cron, AWS EventBridge, etc.):

| Schedule | Endpoint | Method | Description |
|---|---|---|---|
| Daily at midnight | `/api/analytics/compute` | POST | Compute daily analytics snapshots |
| Daily at midnight | `/api/leaderboard/recalculate` | POST | Reset daily leaderboards |
| Weekly on Monday | `/api/leaderboard/recalculate` | POST | Reset weekly leaderboards |
| Monthly on 1st | `/api/leaderboard/recalculate` | POST | Reset monthly leaderboards |

All cron endpoints require a valid Platform Admin session cookie or an API key header (configure in production).

### Scaling

- **Horizontal**: The app is stateless — add instances behind a load balancer
- **Database**: Use read replicas for analytics queries; connection pool via PgBouncer
- **Caching**: Redis for leaderboard reads, rate limiting, and session validation
- **CDN**: Serve static assets and game bundles via CDN (configure `CDN_URL`)
- **Background jobs**: For heavy computations, offload to a job queue (Bull/BullMQ with Redis)

### Monitoring

- Structured logs via Next.js server-side console (pipe to your log aggregator)
- `/api/health` for uptime monitoring
- Audit logs in `audit_logs` table for security investigations
- Payment events in `payment_events` table for billing reconciliation

## Architecture

```
[Browser] → [CDN/Edge] → [Next.js App (standalone)] → [PostgreSQL]
                                    ↓                       ↑
                              [Redis Cache]          [PgBouncer]
                                    ↓
                         [Background Worker (optional)]
```

## Multi-Tenant Isolation

- Every query is scoped to `restaurantGroupId` at the DAL layer
- Proxy (`proxy.ts`) validates JWT and restricts dashboard routes by role
- API routes verify session + group ownership before data access
- No cross-tenant data leakage is possible through documented APIs
