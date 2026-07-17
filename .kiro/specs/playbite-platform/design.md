# Design Document — PlayBite Platform (Phase 1)

## Overview

Phase 1 establishes the complete scaffold of the PlayBite SaaS platform: project structure, database identity schema, authentication skeleton, layouts, navigation, placeholder pages, shared UI components, and route-protection middleware. No game logic, scoring, rewards, leaderboards, presence verification, OTP delivery, or billing is implemented in this phase. Every architectural decision is made to ensure Phase 2 features can be layered on without restructuring.

The system is a multi-tenant SaaS with four user roles (Platform Admin, Restaurant Owner, Restaurant Staff, Customer) and three distinct dashboard surfaces. The customer-facing experience is mobile-first. The restaurant and admin surfaces are desktop-first responsive layouts.

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Browser / Client                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  Public Pages│  │ Auth Pages   │  │ Dashboard Pages│ │
│  │  (Next.js)   │  │ (Next.js)    │  │ (Next.js)      │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │ HTTPS / TLS 1.2+
┌─────────────────────────────────────────────────────────┐
│                  Next.js 16 App Router                  │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐ │
│  │  proxy.ts  │  │ Route Handler│  │  Server Actions  │ │
│  │ (auth gate)│  │ (API Routes) │  │  (future phase)  │ │
│  └────────────┘  └─────────────┘  └──────────────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │                   Auth.js                        │   │
│  │  (session management, role-based callbacks)      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                     Prisma ORM                          │
│           (type-safe DB client + migrations)            │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                    │
│  (identity schema: RestaurantGroup, Restaurant, Branch, │
│   Customer, Staff, RestaurantOwner, PlatformAdmin,      │
│   Session, Plan, Subscription)                          │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Next.js App Router**: All pages use the `/app` directory with React Server Components as the default. Client components are marked `"use client"` only where interactivity requires it.
- **Proxy for Auth Gate**: In Next.js 16, `middleware.ts` is deprecated and replaced by `proxy.ts`. The proxy function runs on the **Node.js runtime** (Edge runtime is no longer supported in proxy) and intercepts every request to `/dashboard/*` before the page renders. The exported function must be named `proxy` (not `middleware`). The `config.matcher` export still controls which paths are intercepted.
- **Auth.js (NextAuth v5)**: Session strategy is **JWT** for Phase 1 (no DB adapter required yet). Phase 2 will switch to the Prisma adapter when session persistence is needed.
- **Prisma**: All DB access goes through the Prisma client. Raw SQL is forbidden in application code.
- **Role stored in JWT**: The user's role (`PLATFORM_ADMIN | RESTAURANT_OWNER | RESTAURANT_STAFF | CUSTOMER`) is embedded in the JWT session token so middleware can gate routes without a DB query.

---

## Folder Structure

Full annotated tree of the `src/` directory (and adjacent project-root files):

```
playbite/
├── prisma/
│   ├── schema.prisma          # All DB models — Phase 1 identity tables
│   └── migrations/            # Auto-generated migration files
│
├── public/
│   └── images/                # Static assets
│
├── src/
│   ├── app/                   # Next.js App Router root
│   │   ├── layout.tsx         # RootLayout — html/body, global providers
│   │   ├── page.tsx           # Landing page  /
│   │   ├── pricing/
│   │   │   └── page.tsx       # /pricing
│   │   ├── features/
│   │   │   └── page.tsx       # /features
│   │   ├── contact/
│   │   │   └── page.tsx       # /contact
│   │   │
│   │   ├── auth/
│   │   │   ├── customer/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx   # /auth/customer/login
│   │   │   ├── restaurant/
│   │   │   │   └── login/
│   │   │   │       └── page.tsx   # /auth/restaurant/login
│   │   │   └── admin/
│   │   │       └── login/
│   │   │           └── page.tsx   # /auth/admin/login
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # DashboardLayout — sidebar + top bar
│   │   │   ├── customer/
│   │   │   │   └── page.tsx       # /dashboard/customer
│   │   │   ├── restaurant/
│   │   │   │   └── page.tsx       # /dashboard/restaurant
│   │   │   └── admin/
│   │   │       └── page.tsx       # /dashboard/admin
│   │   │
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts   # Auth.js catch-all handler
│   │
│   ├── components/
│   │   ├── ui/                    # Headless / design-system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── layout/                # Page-level layout shells
│   │   │   ├── RootLayout.tsx     # (re-exported from app/layout.tsx)
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── CustomerDashboardLayout.tsx
│   │   │   ├── RestaurantDashboardLayout.tsx
│   │   │   └── AdminDashboardLayout.tsx
│   │   │
│   │   ├── navigation/            # Navigation chrome
│   │   │   ├── Navbar.tsx         # Public-facing top nav
│   │   │   ├── Sidebar.tsx        # Dashboard sidebar (role-aware)
│   │   │   └── Footer.tsx         # Site-wide footer
│   │   │
│   │   └── auth/                  # Auth form shells (Phase 2 fills these)
│   │       ├── CustomerLoginForm.tsx
│   │       ├── RestaurantLoginForm.tsx
│   │       └── AdminLoginForm.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts                # Auth.js config — providers, callbacks, session
│   │   ├── prisma.ts              # Prisma client singleton
│   │   └── utils.ts               # Shared utility functions (cn, formatDate, etc.)
│   │
│   ├── types/
│   │   ├── auth.ts                # UserRole enum, Session user type augmentation
│   │   ├── restaurant.ts          # RestaurantGroup, Restaurant, Branch types
│   │   └── index.ts               # Re-exports
│   │
│   ├── hooks/                     # Custom React hooks (client-side)
│   │   └── useCurrentUser.ts      # Returns session user with role
│   │
│   ├── constants/
│   │   └── routes.ts              # Centralised route strings
│   │
│   └── styles/
│       └── globals.css            # Tailwind directives + CSS variables
│
├── proxy.ts                   # Next.js 16 route-protection proxy (replaces middleware.ts)
├── next.config.ts                 # Next.js config
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json
├── .env.example                   # All required env vars documented
├── .env.local                     # Local secrets (gitignored)
├── .eslintrc.json
├── .prettierrc
└── package.json
```

---

## Database Schema

This is the complete `prisma/schema.prisma` content for Phase 1. It covers all identity and structural entities. Game, Score, Reward, Leaderboard, and OTP tables are intentionally omitted — they will be added in Phase 2 as separate migration files.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum UserRole {
  PLATFORM_ADMIN
  RESTAURANT_OWNER
  RESTAURANT_STAFF
  CUSTOMER
}

enum PlanTier {
  STARTER
  GROWTH
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  SUSPENDED
  CANCELLED
  EXPIRED
}

// ─── Subscription / Billing (identity side only) ─────────────────────────────

model Plan {
  id          String   @id @default(cuid())
  name        String   @unique
  tier        PlanTier
  description String?
  // Feature flags — Phase 2 will add more
  maxBranches Int      @default(1)
  maxGames    Int      @default(3)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subscriptions Subscription[]
}

model Subscription {
  id                String             @id @default(cuid())
  status            SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime
  currentPeriodEnd  DateTime
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  planId            String
  plan              Plan               @relation(fields: [planId], references: [id])

  restaurantGroupId String             @unique
  restaurantGroup   RestaurantGroup    @relation(fields: [restaurantGroupId], references: [id])
}

// ─── Restaurant Hierarchy ────────────────────────────────────────────────────

model RestaurantGroup {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  restaurants  Restaurant[]
  customers    Customer[]
  owners       RestaurantOwner[]
  subscription Subscription?

  @@index([slug])
}

model Restaurant {
  id          String   @id @default(cuid())
  name        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  restaurantGroupId String
  restaurantGroup   RestaurantGroup @relation(fields: [restaurantGroupId], references: [id])

  branches Branch[]

  @@index([restaurantGroupId])
}

model Branch {
  id          String   @id @default(cuid())
  name        String
  address     String?
  timezone    String   @default("UTC")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  staffAssignments StaffBranchAssignment[]

  @@index([restaurantId])
}

// ─── Users ───────────────────────────────────────────────────────────────────

model PlatformAdmin {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(PLATFORM_ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  accounts Account[]
}

model RestaurantOwner {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(RESTAURANT_OWNER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  restaurantGroupId String
  restaurantGroup   RestaurantGroup @relation(fields: [restaurantGroupId], references: [id])

  accounts Account[]

  @@index([restaurantGroupId])
}

model Staff {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(RESTAURANT_STAFF)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  branchAssignments StaffBranchAssignment[]
  accounts          Account[]
}

model StaffBranchAssignment {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  staffId  String
  staff    Staff  @relation(fields: [staffId], references: [id])
  branchId String
  branch   Branch @relation(fields: [branchId], references: [id])

  @@unique([staffId, branchId])
}

model Customer {
  id          String   @id @default(cuid())
  phoneNumber String   // Encrypted at rest — AES-256 (Phase 2)
  displayHandle String?
  role        UserRole @default(CUSTOMER)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  restaurantGroupId String
  restaurantGroup   RestaurantGroup @relation(fields: [restaurantGroupId], references: [id])

  accounts Account[]

  @@unique([phoneNumber, restaurantGroupId])
  @@index([restaurantGroupId])
}

// ─── Auth.js adapter tables ──────────────────────────────────────────────────
// These are the standard NextAuth Prisma adapter models.
// They support OAuth providers and magic links in addition to our custom OTP flow.

model Account {
  id                String  @id @default(cuid())
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  // Polymorphic owner references — exactly one will be non-null
  platformAdminId   String?
  platformAdmin     PlatformAdmin?   @relation(fields: [platformAdminId], references: [id])
  restaurantOwnerId String?
  restaurantOwner   RestaurantOwner? @relation(fields: [restaurantOwnerId], references: [id])
  staffId           String?
  staff             Staff?           @relation(fields: [staffId], references: [id])
  customerId        String?
  customer          Customer?        @relation(fields: [customerId], references: [id])

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Session owner role and ID (denormalised for fast auth middleware lookups)
  userRole     UserRole
  userId       String    // ID in the role-specific table
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Schema Design Notes

- **No game/reward tables**: Intentionally absent. Phase 2 adds `GamePlay`, `Points`, `SpinWheel`, `Reward`, `Leaderboard` via new migration files.
- **Polymorphic Account**: Rather than a single unified `User` table (which would require nullable role-specific columns), each role has its own table. The `Account` table links auth providers to any of the four user types via nullable FK columns. This keeps each user table clean while maintaining Auth.js compatibility.
- **Session table**: Denormalised `userRole` and `userId` fields allow the middleware to decode the JWT and route without a DB lookup in the hot path.
- **Phone number storage**: The `Customer.phoneNumber` column will be encrypted at the application layer in Phase 2. The column is plain text in Phase 1 since no real phone numbers will be stored yet.
- **Timezone per Branch**: Required for correct Daily Leaderboard rollover logic in Phase 2.

---

## Authentication Architecture

### Auth.js Configuration

Auth.js (NextAuth v5) is configured in `src/lib/auth.ts` with a **JWT session strategy** for Phase 1.

```
Session Flow:
  User submits credentials
    → Auth.js `authorize` callback validates
    → JWT issued with { id, role, restaurantGroupId }
    → JWT stored in HttpOnly cookie (session cookie)
    → Middleware decodes JWT on every /dashboard/* request
    → Role-based redirect logic applied
```

### Session Token Structure

The JWT payload embeds:

```typescript
interface SessionPayload {
  sub: string;           // User ID in the role-specific table
  role: UserRole;        // PLATFORM_ADMIN | RESTAURANT_OWNER | RESTAURANT_STAFF | CUSTOMER
  restaurantGroupId?: string; // Null for PLATFORM_ADMIN
  name?: string;
  email?: string;
  iat: number;
  exp: number;
}
```

### Role-Based Redirect Logic

| Authenticated Role  | Redirect Target              |
|---------------------|------------------------------|
| `PLATFORM_ADMIN`    | `/dashboard/admin`           |
| `RESTAURANT_OWNER`  | `/dashboard/restaurant`      |
| `RESTAURANT_STAFF`  | `/dashboard/restaurant`      |
| `CUSTOMER`          | `/dashboard/customer`        |

### Provider Strategy

- **Phase 1**: Credentials provider skeleton only (no real validation — placeholder returns null). Structure is in place for Phase 2 OTP provider.
- **Phase 2**: Custom OTP provider added to the same `providers` array.
- **Phase 3+**: Optional OAuth providers (Google, etc.) for Restaurant Owner / Admin if needed.

### Auth.js Callbacks

```
callbacks:
  jwt  → embed role + restaurantGroupId into token
  session → expose role on client session object
  redirect → role-aware post-login redirect
```

---

## Route Map

| Route                        | Layout              | Auth Required | Role Gate               |
|------------------------------|---------------------|---------------|-------------------------|
| `/`                          | RootLayout          | No            | —                       |
| `/pricing`                   | RootLayout          | No            | —                       |
| `/features`                  | RootLayout          | No            | —                       |
| `/contact`                   | RootLayout          | No            | —                       |
| `/auth/customer/login`       | RootLayout          | No            | Redirect if authed      |
| `/auth/restaurant/login`     | RootLayout          | No            | Redirect if authed      |
| `/auth/admin/login`          | RootLayout          | No            | Redirect if authed      |
| `/dashboard/customer`        | DashboardLayout     | Yes           | `CUSTOMER`              |
| `/dashboard/restaurant`      | DashboardLayout     | Yes           | `RESTAURANT_OWNER` / `RESTAURANT_STAFF` |
| `/dashboard/admin`           | DashboardLayout     | Yes           | `PLATFORM_ADMIN`        |
| `/api/auth/[...nextauth]`    | —                   | —             | Auth.js handler         |

### Middleware Routing Logic

```
request → middleware.ts
  if path starts with /dashboard/*
    decode JWT from cookie
    if no valid JWT → redirect to role-appropriate login page
    if JWT valid but wrong role for route → redirect to correct dashboard
  pass through
```

---

## Components and Interfaces

### UI Primitives (`src/components/ui/`)

#### Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

#### Card

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}
```

#### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
}
```

#### LoadingSpinner

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string; // aria-label for accessibility
}
```

### Navigation (`src/components/navigation/`)

#### Navbar (Public)

```typescript
interface NavbarProps {
  transparent?: boolean;  // for hero sections
}
```

Links: Logo → `/`, Features → `/features`, Pricing → `/pricing`, Contact → `/contact`, Login (dropdown: Customer / Restaurant / Admin)

#### Sidebar (Dashboard)

```typescript
interface SidebarProps {
  role: UserRole;
  restaurantGroupName?: string;
  collapsed?: boolean;
  onCollapse?: () => void;
}
```

The sidebar renders role-specific navigation items:
- **CUSTOMER**: Home, My Points, My Rewards (Phase 2 fills content)
- **RESTAURANT_OWNER / STAFF**: Overview, Branches, Games, Rewards, Staff, Analytics
- **PLATFORM_ADMIN**: Dashboard, Restaurants, Users, Games, Plans, Settings

#### Footer

```typescript
interface FooterProps {
  variant?: 'full' | 'minimal';
}
```

### Layout Components

#### DashboardLayout

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  // Role derived from session — not passed as prop
}
```

Renders: `<Sidebar role={session.role} />` + `<main>{children}</main>` + optional top bar.

---

## Environment Variables

Full `.env.example`:

```bash
# ─── Database ──────────────────────────────────────────────────────
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/playbite?schema=public"

# ─── Auth.js ───────────────────────────────────────────────────────
# Random secret used to sign JWTs and encrypt cookies.
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"

# Full URL of the deployed app (no trailing slash)
NEXTAUTH_URL="http://localhost:3000"

# ─── Application ───────────────────────────────────────────────────
# Environment identifier
NODE_ENV="development"

# ─── Phase 2 Placeholders (document now, implement later) ──────────

# SMS provider for OTP delivery (Twilio, AWS SNS, etc.)
# SMS_PROVIDER_API_KEY=""
# SMS_PROVIDER_ACCOUNT_SID=""
# SMS_FROM_NUMBER=""

# Encryption key for Customer phone numbers at rest (AES-256, 32 bytes hex)
# ENCRYPTION_KEY=""

# Payment provider (Stripe)
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# ─── Optional: Redis (Phase 2 rate limiting / session store) ───────
# REDIS_URL="redis://localhost:6379"
```

---

## Tech Stack Rationale

| Technology       | Justification                                                                  |
|------------------|--------------------------------------------------------------------------------|
| Next.js 15       | App Router enables RSC, streaming, and Edge middleware — critical for auth gate performance |
| React            | Component model with server/client boundary fits multi-surface UI (public + 3 dashboards) |
| TypeScript       | Type-safe Prisma client + Auth.js session types prevent entire classes of runtime errors |
| Tailwind CSS     | Utility-first avoids style conflicts across multi-tenant UI surfaces; JIT keeps bundle small |
| PostgreSQL       | ACID transactions required for Points/Reward integrity; row-level security supports multi-tenancy |
| Prisma ORM       | Type-safe queries, auto-generated migrations, and schema-as-source-of-truth reduce DB drift |
| Auth.js v5       | Handles JWT lifecycle, CSRF, cookie security out of the box; provider model fits OTP in Phase 2 |
| ESLint + Prettier| Enforced code style prevents review noise and catches bugs at write time |

---

## Phase 2 Extension Points

The Phase 1 scaffold is designed so every Phase 2 feature plugs in without restructuring:

**Next.js 16 Breaking Changes Applied:**
- `middleware.ts` is deprecated → replaced by `proxy.ts` with exported function named `proxy`
- `proxy` runs on Node.js runtime (not Edge) — `runtime` config option is not available
- `cookies()`, `headers()`, `params`, `searchParams` are fully async — must `await` all of them
- ESLint uses flat config (`eslint.config.mjs`) — no `.eslintrc.json`
- `eslint` CLI directly replaces `next lint` in scripts
- `turbopack` config is top-level in `next.config.ts` (not under `experimental`)
- Turbopack is enabled by default for `next dev` and `next build`

| Phase 2 Feature               | Extension Point                                                          |
|-------------------------------|--------------------------------------------------------------------------|
| OTP authentication            | Add `CredentialsProvider` with OTP logic to `src/lib/auth.ts` `providers[]` |
| SMS delivery                  | Add `src/lib/sms.ts` — called from the OTP Credentials provider         |
| Game engine                   | Add `src/app/dashboard/customer/play/[gameId]/page.tsx` + `prisma/schema.prisma` GamePlay model |
| Presence verification (QR/NFC)| Add `src/app/api/verify/route.ts` + Branch artifact tables in Prisma     |
| Spin Wheel                    | Add `src/components/game/SpinWheel.tsx` + SpinWheel Prisma model         |
| Leaderboard                   | Add `src/app/dashboard/customer/leaderboard/page.tsx` + Leaderboard model |
| Anti-cheat engine             | Add `src/lib/antiCheat.ts` — called from GameScore submission endpoint   |
| Analytics dashboard           | Add `src/app/dashboard/restaurant/analytics/page.tsx` — reads from existing Session/Points data |
| Prisma adapter for Auth.js    | Switch `session: { strategy: "database" }` in `src/lib/auth.ts`; migrations already have Session table |
| Rate limiting                 | Add Redis-backed middleware layer using existing `middleware.ts` hook points |
| Billing / Subscriptions       | Plan + Subscription tables already exist in Phase 1 schema; add Stripe webhook handler |

---

## Data Models

See the **Database Schema** section above for the complete Prisma schema. This section summarises the TypeScript-level data model interfaces derived from that schema, used across the application.

### Core TypeScript Interfaces

```typescript
// src/types/auth.ts
export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  RESTAURANT_STAFF = 'RESTAURANT_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export interface SessionUser {
  id: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
  restaurantGroupId?: string | null;
}
```

```typescript
// src/types/restaurant.ts
export interface RestaurantGroupSummary {
  id: string;
  name: string;
  slug: string;
}

export interface BranchSummary {
  id: string;
  name: string;
  address?: string | null;
  timezone: string;
  isActive: boolean;
  restaurantId: string;
}
```

All full entity types (including relations) are generated by Prisma and imported from `@prisma/client`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Phase 1 is a scaffold: no game engine, no OTP flow, no scoring. The meaningful testable surface is the **middleware routing logic**, the **JWT session callback**, the **DB schema constraints**, and the **role redirect mapping**. These are pure functions or simple constraint checks where property-based testing adds real value — input variation (different roles, different paths, different data shapes) reveals branches that example-based tests miss.

---

### Property 1: JWT callback embeds role and userId for every role

*For any* authenticated user with any valid `UserRole` value, the Auth.js `jwt()` callback must return a token that contains both a non-null `role` field and a non-null `userId` field matching the user's identity.

**Validates: Requirements 2.1, 2.2** (four distinct roles; exactly one role per account)

---

### Property 2: Middleware redirects any unauthenticated request to a dashboard route

*For any* URL path that begins with `/dashboard/` and any request that does not carry a valid, unexpired JWT session cookie, the middleware must return an HTTP redirect response pointing to a non-empty login URL and must never pass the request through to the page handler.

**Validates: Requirements 2.3, 2.4** (authorization enforced before action; unauthorized actions denied)

---

### Property 3: Role-to-dashboard redirect is total and correct

*For any* `UserRole` enum value, the role-redirect utility function must return a defined, non-empty route string that corresponds to the dashboard for that role, with no role mapping to another role's dashboard.

**Validates: Requirements 2.3, 2.5, 2.6, 2.8** (role-scoped permissions; customers cannot access restaurant/admin surfaces)

---

### Property 4: Customer identity is unique per (phoneNumber, restaurantGroup)

*For any* pair of `(phoneNumber, restaurantGroupId)`, the database must reject any attempt to insert a second `Customer` row with the same pair — and must also reject any attempt to insert a `Customer` row with a null `restaurantGroupId`, ensuring cross-group leakage is impossible at the schema level.

**Validates: Requirements 3.4, 3.5** (single Customer identity per phone number per group; separate identities across groups)

---

### Property 5: A RestaurantGroup can have at most one Subscription record

*For any* `RestaurantGroup`, the database must reject any attempt to insert a second `Subscription` row referencing the same `restaurantGroupId`, enforcing the one-active-subscription invariant at the schema level.

**Validates: Requirements 14.1** (exactly one active Subscription per RestaurantGroup at any time)

---

## Error Handling

### Authentication Errors

| Scenario | Behaviour |
|---|---|
| Missing session cookie on `/dashboard/*` | Middleware redirects to role-appropriate login |
| Expired JWT | Middleware treats as unauthenticated; redirects to login |
| Malformed JWT | Middleware treats as unauthenticated; does not throw |
| Role mismatch for route | Middleware redirects to user's correct dashboard |

### Database Errors

| Scenario | Behaviour |
|---|---|
| Unique constraint violation (Customer phone+group) | Prisma throws `P2002`; application returns 409 |
| Unique constraint violation (Subscription per group) | Prisma throws `P2002`; application returns 409 |
| FK violation (Branch without Restaurant) | Prisma throws `P2003`; application returns 400 |
| DB connection failure | Prisma throws `P1001`; application returns 503 |

### Environment Configuration Errors

- If `DATABASE_URL` is missing, `prisma generate` fails at build time — caught before deployment.
- If `NEXTAUTH_SECRET` is missing, Auth.js throws at startup — caught before first request.
- If `NEXTAUTH_URL` is missing, redirect callbacks fall back to request origin (acceptable for Phase 1).

---

## Testing Strategy

### Approach

Phase 1 uses a **dual testing approach**:

1. **Property-based tests** — verify universal invariants for the five properties above using [fast-check](https://fast-check.io/) (TypeScript-native PBT library).
2. **Example-based unit tests** — verify specific component rendering, specific middleware scenarios, and edge cases using [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/).
3. **Smoke checks** — verify project builds, lints, and type-checks cleanly (covered by Task 12).

### Property-Based Tests (fast-check, minimum 100 iterations each)

Each property test references its design property above.

```
Feature: playbite-platform, Property 1: JWT callback embeds role and userId for every role
  → Generate: arbitrary UserRole value + matching user object
  → Assert: jwt(token, user).role === user.role && jwt(token, user).userId !== null

Feature: playbite-platform, Property 2: Middleware redirects unauthenticated dashboard requests
  → Generate: arbitrary /dashboard/* path + absent/expired/malformed cookie
  → Assert: middleware(request).status === 307 | 302

Feature: playbite-platform, Property 3: Role-to-dashboard redirect is total
  → Generate: arbitrary UserRole value
  → Assert: getRoleRedirect(role) is a non-empty string starting with /dashboard/

Feature: playbite-platform, Property 4: Customer uniqueness constraint
  → Generate: arbitrary (phoneNumber, restaurantGroupId) pair
  → Assert: second insert with same pair throws Prisma P2002

Feature: playbite-platform, Property 5: Subscription uniqueness per group
  → Generate: arbitrary RestaurantGroup ID
  → Assert: second Subscription insert for same group throws Prisma P2002
```

### Example-Based Unit Tests (Vitest + Testing Library)

- **Button**: renders for each variant × size combination (12 cases); loading state disables button
- **Card**: renders children with correct padding class per `padding` prop
- **Modal**: closes on backdrop click when `closeOnBackdropClick=true`; does not close when false
- **LoadingSpinner**: sets `aria-label` from `label` prop
- **Navbar**: renders all nav links; login dropdown contains three role links
- **Sidebar**: renders correct nav items for each role
- **Middleware**: authenticated request with correct role passes through (no redirect)

### Integration Tests (Phase 2)

Full auth flow, DB writes, and presence verification will be integration-tested in Phase 2 against a test PostgreSQL instance.

### Configuration (fast-check)

```typescript
// vitest.config.ts
fc.configureGlobal({ numRuns: 100 });
```
