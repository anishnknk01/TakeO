# PlayBite — Phase 2 Database Design

## Entity Relationship Overview

This document explains the full schema produced for Phase 2.
The Prisma schema lives in `prisma/schema.prisma`.
All IDs are UUIDs. All tables have `createdAt`; mutable tables have `updatedAt`.
Soft deletes use a `deletedAt DateTime?` column where data must be preserved.

---

## Domain Groups

### Platform

| Model | Purpose |
|---|---|
| `Admin` | Platform-wide super-user. Soft-deleted. Has `AuditLog[]` back-ref. |
| `SubscriptionPlan` | Named plan tiers (Starter/Growth/Enterprise). Defines feature flags and limits. |
| `Subscription` | One active subscription per `RestaurantGroup`. One-to-one enforced by `@unique` on `restaurantGroupId`. |

### Restaurant Group

| Model | Purpose |
|---|---|
| `RestaurantGroup` | Top-level tenant boundary. Customer identity, points, and leaderboards are scoped here. |
| `Restaurant` | A brand entity (e.g. "Taco Fiesta Brooklyn"). Belongs to one `RestaurantGroup`. |
| `Branch` | A physical location. Stores timezone for local leaderboard day rollover. Soft-deleted. |
| `RestaurantSettings` | One-to-one with `Restaurant`. Holds anti-cheat thresholds, check-in method toggles, and QR rotation config. |

### Restaurant Users

| Model | Purpose |
|---|---|
| `RestaurantOwner` | Owner of a group. Many-to-many with `Restaurant` via implicit join. Soft-deleted. |
| `RestaurantStaff` | Staff member scoped to one restaurant. Many-to-many with `Branch` via `StaffBranchAssignment`. |
| `StaffBranchAssignment` | Join table. Adds `canRedeem` permission per assignment. Composite `@@unique([staffId, branchId])`. |

### Customer

| Model | Purpose |
|---|---|
| `Customer` | Core identity. `@@unique([phoneNumber, restaurantGroupId])` enforces one identity per group. `totalPoints` is a denormalised counter updated on each game session. Soft-deleted. |
| `CustomerProfile` | Extended optional data (name, email, DOB, marketing consent). One-to-one. |
| `CustomerDevice` | Hashed device fingerprints for fraud detection. `@@unique([customerId, deviceHash])`. |

### Visit System

| Model | Purpose |
|---|---|
| `RestaurantVisit` | Outer envelope of a customer's stay at a branch. Holds `status`, `pointsEarned`, check-in/out times. |
| `CheckInSession` | Records *how* presence was verified (QR, NFC, Wi-Fi, Bluetooth). One-to-one with `RestaurantVisit`. |

### Games

| Model | Purpose |
|---|---|
| `GameCategory` | Groups games by type (Puzzle, Trivia, Arcade, …). |
| `Game` | Catalog entry. `bundleUrl` points to the hosted HTML5 bundle. `maxScore` and `minDurationSecs` drive anti-cheat. Soft-deleted. |
| `RestaurantGame` | Activation record: which `Game` is enabled at which `Branch`. `@@unique([gameId, branchId])`. |
| `GameSession` | One play. Holds the server-issued `nonce` (unique, prevents replay), raw/final scores, duration, anti-cheat `flagReason`. |
| `GameScore` | Immutable validated score. Written once. One-to-one with `GameSession`. |

### Leaderboard

| Model | Purpose |
|---|---|
| `DailyLeaderboard` | Header per (group, branch?, date). `isFrozen` set at day-end. `@@unique([restaurantGroupId, branchId, date])`. |
| `DailyLeaderboardEntry` | One row per customer per daily board. Updated on each point event. `@@unique([leaderboardId, customerId])`. |
| `WeeklyLeaderboard` | Aggregate per group per ISO week. Header only — entries computed from daily data. |
| `LifetimeLeaderboard` | One row per group. `@@unique` on `restaurantGroupId`. Entries are derived from `Customer.totalPoints`. |

### Rewards

| Model | Purpose |
|---|---|
| `Reward` | Definition configured by owner. Supports percent/fixed discount, free item, badge, spin, multiplier. Soft-deleted. |
| `RewardClaim` | An issued reward instance. Contains unique `redemptionCode`. Status: PENDING → REDEEMED/EXPIRED/VOIDED. |
| `Coupon` | Standalone discount codes independent of the reward system. |
| `SpinWheelPrize` | One slot on the spin wheel. `probability` weights must sum to 1.0 per group (enforced at application layer). |
| `SpinHistory` | Immutable record of every spin draw. Stores `drawSeed` for audit trail. |

### Notifications

| Model | Purpose |
|---|---|
| `Notification` | Queued or sent message per customer. Tracks `isRead` and `readAt`. |
| `NotificationPreference` | Per-customer per-channel opt-in/out. `@@unique([customerId, channel])`. |

### Analytics

| Model | Purpose |
|---|---|
| `DailyAnalytics` | Pre-aggregated daily metrics per group. Written by a background job. Fast dashboard reads without joins. |
| `CustomerActivity` | Fine-grained event log with a `Json` metadata field. Supports future funnel analysis. |

### Security

| Model | Purpose |
|---|---|
| `AuditLog` | Immutable append-only table. Every write and security event lands here. `diff` stores before/after JSON. |
| `DeviceSession` | Active JWT sessions per customer. `tokenHash` is unique. Used for single-session enforcement. |

### Auth.js Adapter

| Model | Purpose |
|---|---|
| `Account` | Polymorphic OAuth/credential link to any user type. |
| `AuthSession` | Server-side sessions (used when switching from JWT to database strategy). |
| `VerificationToken` | OTP / magic-link tokens for Auth.js flows. |

---

## Key Design Decisions

**UUID primary keys** — chosen for security (non-sequential IDs prevent enumeration) and distributed-safe ID generation.

**Soft deletes** — applied to `Admin`, `RestaurantGroup`, `Restaurant`, `Branch`, `RestaurantOwner`, `RestaurantStaff`, `Customer`, `Game`, and `Reward`. Preserves history for audit and analytics. All queries on soft-deletable tables should filter `deletedAt IS NULL`.

**Denormalised `totalPoints`** — stored directly on `Customer` to avoid a SUM aggregation on millions of `GameSession` rows for leaderboard reads. Updated atomically via `prisma.$transaction` + `increment`.

**Composite unique constraints** — `Customer(phoneNumber, restaurantGroupId)` prevents cross-group leakage. `RestaurantGame(gameId, branchId)` prevents duplicate activations. `DailyLeaderboard(restaurantGroupId, branchId, date)` prevents duplicate boards.

**`DailyAnalytics` pre-aggregation** — avoids expensive GROUP BY on the hot `GameSession` and `RestaurantVisit` tables for dashboard queries. Updated by a scheduled job.

**Nonce on `GameSession`** — server-issued, single-use, `@unique`. Prevents score replay attacks without a separate nonce table.

---

## Index Strategy

Every foreign key has an index. Additional indexes for common query patterns:

| Table | Index columns | Rationale |
|---|---|---|
| `customers` | `(restaurantGroupId)` | Fetch all customers for a group |
| `customers` | `(totalPoints)` | Leaderboard sort |
| `customers` | `(deletedAt)` | Exclude soft-deleted in list queries |
| `daily_leaderboard_entries` | `(leaderboardId, points)` | Ranked sort for leaderboard reads |
| `game_sessions` | `(customerId)`, `(branchId)`, `(startedAt)` | Analytics and anti-cheat queries |
| `game_sessions` | `(status)` | Filter INVALID sessions |
| `reward_claims` | `(customerId, status)` | Fetch pending claims per customer |
| `reward_claims` | `(redemptionCode)` | Redemption lookup by code |
| `audit_logs` | `(entityType, entityId)`, `(occurredAt)`, `(action)` | Security investigations |
| `daily_analytics` | `(restaurantGroupId, date)` | Dashboard date-range queries |
| `device_sessions` | `(customerId)`, `(expiresAt)` | Active session lookup and cleanup |

---

## Migration & Seed

```bash
# Apply schema to the database
npx prisma migrate dev --name phase2-full-schema

# Or push without creating a migration file (dev only)
npx prisma db push

# Run the seed script
npm run db:seed
# or: npx prisma db seed
```

The seed creates:
- 1 Platform Admin
- 3 Subscription Plans
- 2 Restaurant Groups (1 independent, 1 chain)
- 5 Restaurants + 5 Branches
- 2 Restaurant Owners + 3 Staff
- 20 Customers (10 per group)
- 3 Game Categories + 10 Games (all ACTIVE)
- 5 Rewards + 7 Spin Wheel Prizes
- 5 Sample Visits + Game Sessions + Scores
- 1 Daily Leaderboard with 5 entries
- 3 Sample Reward Claims
- 1 Daily Analytics snapshot
- 1 Audit Log entry

---

## Scalability Notes

- **Partitioning**: `daily_leaderboard_entries`, `game_sessions`, `customer_activity`, and `audit_logs` should be range-partitioned by date at ~10M+ rows.
- **Connection pooling**: Use PgBouncer in transaction mode between Next.js and PostgreSQL.
- **Read replicas**: `DailyAnalytics`, leaderboard reads, and customer activity queries should hit a read replica.
- **Redis cache layer** (Phase 3): Cache active leaderboard rankings (`ZSET` per board) and spin wheel prize state to avoid DB contention under high concurrency.
- **Archival**: Freeze `DailyLeaderboard` rows and move entries older than 90 days to a cold analytics store. `AuditLog` retained ≥ 12 months per Requirement 18.
