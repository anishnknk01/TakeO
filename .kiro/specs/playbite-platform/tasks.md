# Implementation Plan: PlayBite Platform Phase 1

## Overview

12 tasks covering the complete Phase 1 scaffold. Each task is independently executable in one developer session. Task 1 (scaffold) must complete before Tasks 2–12. Tasks 2, 3, 4, and 6 can run in parallel after Task 1. Tasks 7–11 can run in parallel once their prerequisites are done. Task 12 is the integration gate.

## Tasks

- [x] 1. Initialize Next.js 15 project with TypeScript, Tailwind CSS, ESLint, and Prettier
  - [x] 1.1 Run create-next-app with App Router, TypeScript, and Tailwind CSS flags
  - [x] 1.2 Configure .eslintrc.json to extend Next.js defaults and add the Prettier plugin
  - [x] 1.3 Create .prettierrc with singleQuote, tabWidth 2, and trailingComma all
  - [x] 1.4 Update tailwind.config.ts with correct content paths and brand color tokens
  - [x] 1.5 Update tsconfig.json to enable strict mode and add path alias @/* to ./src/*
  - [x] 1.6 Update next.config.ts to enable reactStrictMode
  - [x] 1.7 Create src/styles/globals.css with Tailwind directives and CSS custom properties
  - [x] 1.8 Create minimal src/app/layout.tsx RootLayout stub (html, body, globals import)
  - [x] 1.9 Create minimal src/app/page.tsx placeholder returning a main element with PlayBite text
  - [x] 1.10 Add Prettier and lint-staged to package.json and configure all required scripts

- [ ] 2. Set up Prisma ORM with PostgreSQL and the Phase 1 identity schema
  - [ ] 2.1 Install prisma and @prisma/client packages
  - [ ] 2.2 Create prisma/schema.prisma with PostgreSQL provider and all enums (UserRole, PlanTier, SubscriptionStatus)
  - [ ] 2.3 Add Plan and Subscription models to prisma/schema.prisma
  - [ ] 2.4 Add RestaurantGroup, Restaurant, and Branch models to prisma/schema.prisma
  - [ ] 2.5 Add PlatformAdmin, RestaurantOwner, Staff, and StaffBranchAssignment models
  - [ ] 2.6 Add Customer model with @@unique on phoneNumber and restaurantGroupId
  - [ ] 2.7 Add Auth.js adapter models: Account, Session, VerificationToken
  - [ ] 2.8 Create src/lib/prisma.ts with a singleton PrismaClient instance using the global cache pattern
  - [ ] 2.9 Add db:generate, db:migrate, and db:push scripts to package.json
  - [ ] 2.10 Run npx prisma migrate dev --name init to create the initial migration

- [ ] 3. Create environment variable configuration and route constants
  - [ ] 3.1 Create .env.example with documented entries for DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, and NODE_ENV
  - [ ] 3.2 Add commented Phase 2 placeholder entries to .env.example for SMS provider, ENCRYPTION_KEY, Stripe, and Redis
  - [ ] 3.3 Create .env.local with development values (gitignored)
  - [ ] 3.4 Update .gitignore to exclude .env.local, .env, node_modules/, and .next/
  - [ ] 3.5 Create src/constants/routes.ts exporting a ROUTES object with string constants for all 10 app routes

- [ ] 4. Configure Auth.js v5 with JWT session strategy and role-aware callbacks
  - [ ] 4.1 Install next-auth v5 package
  - [ ] 4.2 Create src/types/auth.ts with UserRole enum, SessionUser interface, and NextAuth module augmentation
  - [ ] 4.3 Create src/types/index.ts re-exporting from all type files
  - [ ] 4.4 Create src/lib/auth.ts with a Credentials provider skeleton where authorize returns null
  - [ ] 4.5 Add JWT session strategy (session: { strategy: "jwt" }) to auth config
  - [ ] 4.6 Add jwt callback to auth config that embeds role and userId into the token
  - [ ] 4.7 Add session callback to auth config that exposes role and id on session.user
  - [ ] 4.8 Add redirect callback to auth config that routes users to their role-specific dashboard after sign-in
  - [ ] 4.9 Create src/app/api/auth/[...nextauth]/route.ts re-exporting GET and POST from Auth.js handlers

- [ ] 5. Implement RootLayout, DashboardLayout, and role-specific layout variants
  - [ ] 5.1 Update src/app/layout.tsx with html lang="en", body, Inter font from next/font, and metadata export
  - [ ] 5.2 Create src/app/dashboard/layout.tsx that reads session with auth() and renders Sidebar plus children
  - [ ] 5.3 Create src/components/layout/DashboardLayout.tsx layout shell with sidebar and main content slots
  - [ ] 5.4 Create src/components/layout/CustomerDashboardLayout.tsx as a customer-specific layout stub
  - [ ] 5.5 Create src/components/layout/RestaurantDashboardLayout.tsx as a restaurant-specific layout stub
  - [ ] 5.6 Create src/components/layout/AdminDashboardLayout.tsx as an admin-specific layout stub

- [ ] 6. Build Button, Card, Modal, and LoadingSpinner UI primitives
  - [ ] 6.1 Install clsx and tailwind-merge packages
  - [ ] 6.2 Create src/lib/utils.ts with a cn() utility combining clsx and tailwind-merge
  - [ ] 6.3 Create src/components/ui/Button.tsx with variant, size, isLoading, leftIcon, and rightIcon props using forwardRef
  - [ ] 6.4 Create src/components/ui/Card.tsx with padding, shadow, and border variant props
  - [ ] 6.5 Create src/components/ui/Modal.tsx that renders in a React portal on document.body with focus trap and Escape key dismiss
  - [ ] 6.6 Create src/components/ui/LoadingSpinner.tsx with size prop and aria-label accessibility attribute
  - [ ] 6.7 Create src/components/ui/index.ts barrel exporting all four components

- [ ] 7. Build Navbar, Sidebar, and Footer navigation components
  - [ ] 7.1 Create src/components/navigation/Navbar.tsx with logo, links to /features /pricing /contact, and login dropdown with three role entries
  - [ ] 7.2 Add mobile hamburger menu toggle to Navbar using useState (use client directive)
  - [ ] 7.3 Create src/components/navigation/Sidebar.tsx rendering role-specific nav items based on the role prop (use client directive)
  - [ ] 7.4 Add collapse/expand toggle to Sidebar with useState
  - [ ] 7.5 Create src/components/navigation/Footer.tsx with links, copyright text, and social icon placeholders
  - [ ] 7.6 Create src/components/navigation/index.ts barrel export for all three components
  - [ ] 7.7 Update src/app/layout.tsx to render Navbar above and Footer below the children slot

- [ ] 8. Create Landing, Pricing, Features, and Contact public placeholder pages
  - [ ] 8.1 Update src/app/page.tsx with generateMetadata, an h1 containing PlayBite, tagline text, and two CTA Button stubs
  - [ ] 8.2 Create src/app/pricing/page.tsx with generateMetadata, h1 containing Pricing, and three placeholder Card components for plan tiers
  - [ ] 8.3 Create src/app/features/page.tsx with generateMetadata, h1 containing Features, and placeholder feature list using Card
  - [ ] 8.4 Create src/app/contact/page.tsx with generateMetadata, h1 containing Contact, and a form shell with name, email, message inputs and a Button

- [ ] 9. Create Customer, Restaurant, and Admin auth placeholder login pages
  - [ ] 9.1 Create src/components/auth/CustomerLoginForm.tsx with phone number input and submit Button (use client)
  - [ ] 9.2 Create src/components/auth/RestaurantLoginForm.tsx with email input and submit Button (use client)
  - [ ] 9.3 Create src/components/auth/AdminLoginForm.tsx with email input and submit Button (use client)
  - [ ] 9.4 Create src/app/auth/customer/login/page.tsx with generateMetadata and CustomerLoginForm; redirect authenticated users to /dashboard/customer
  - [ ] 9.5 Create src/app/auth/restaurant/login/page.tsx with generateMetadata and RestaurantLoginForm; redirect authenticated users to /dashboard/restaurant
  - [ ] 9.6 Create src/app/auth/admin/login/page.tsx with generateMetadata and AdminLoginForm; redirect authenticated users to /dashboard/admin

- [ ] 10. Create Customer, Restaurant, and Admin dashboard placeholder pages
  - [ ] 10.1 Create src/app/dashboard/customer/page.tsx with a welcome heading, session user role display, and three placeholder Card components for Points, Rewards, and Recent Games
  - [ ] 10.2 Create src/app/dashboard/restaurant/page.tsx with a welcome heading, session user role display, and three placeholder Card components for Active Sessions, Daily Visits, and Top Game
  - [ ] 10.3 Create src/app/dashboard/admin/page.tsx with a welcome heading, session user role display, and three placeholder Card components for Active Restaurants, Total Customers, and Game Plays Today

- [ ] 11. Implement route protection proxy with JWT decode and role-aware redirects
  - [ ] 11.1 Create proxy.ts at the project root (Next.js 16: replaces deprecated middleware.ts; runs on Node.js runtime; export function named `proxy`)
  - [ ] 11.2 Add a matcher config to proxy.ts that targets /dashboard/* paths only
  - [ ] 11.3 Implement JWT session cookie decoding in proxy.ts to extract role and userId (cookies() is async in Next.js 16 — await it)
  - [ ] 11.4 Add redirect logic for requests without a valid JWT that redirects to the role-appropriate login page
  - [ ] 11.5 Add redirect logic for requests where the JWT role does not match the requested dashboard route
  - [ ] 11.6 Ensure public routes (/, /pricing, /features, /contact) and /auth/* routes are not intercepted

- [ ] 12. Run integration verification to confirm the complete Phase 1 scaffold is correct
  - [ ] 12.1 Confirm package.json contains all required scripts: dev, build, start, lint, format, format:check, type-check, db:generate, db:migrate, db:push, db:studio
  - [ ] 12.2 Run npx tsc --noEmit and resolve any type errors until it exits 0
  - [ ] 12.3 Run npm run lint and resolve any ESLint errors until it exits 0
  - [ ] 12.4 Run npm run format:check and apply fixes until it exits 0
  - [ ] 12.5 Run npx prisma validate and resolve any schema errors until it exits 0
  - [ ] 12.6 Run npx prisma generate and confirm the TypeScript client is produced
  - [ ] 12.7 Run npm run build and resolve any build errors until it exits 0
  - [ ] 12.8 Start the dev server and verify GET / returns 200
  - [ ] 12.9 Verify GET /pricing, /features, and /contact each return 200
  - [ ] 12.10 Verify GET /auth/customer/login, /auth/restaurant/login, and /auth/admin/login each return 200
  - [ ] 12.11 Verify GET /dashboard/customer, /dashboard/restaurant, and /dashboard/admin without a session cookie each return a 302 or 307 redirect
  - [ ] 12.12 Verify GET /api/auth/session returns 200

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1"],
      "description": "Project scaffold — must complete before all other tasks"
    },
    {
      "wave": 2,
      "tasks": ["2", "3", "4", "6"],
      "description": "Core infrastructure — can run in parallel after Task 1"
    },
    {
      "wave": 3,
      "tasks": ["5"],
      "description": "Layouts — depends on Task 4 (Auth.js auth() helper)"
    },
    {
      "wave": 4,
      "tasks": ["7", "8", "9", "10", "11"],
      "description": "Pages and middleware — can run in parallel; all depend on Task 5 or Task 4; Task 9 and 10 also need Task 6"
    },
    {
      "wave": 5,
      "tasks": ["12"],
      "description": "Integration verification — depends on all previous tasks"
    }
  ]
}
```

## Notes

- Phase 1 intentionally omits OTP, games, scoring, leaderboards, rewards, spin wheel, presence verification, payments, analytics, and email — these are Phase 2+ features.
- The Prisma schema supports zero-migration-breaking Phase 2 additions via new migration files.
- Auth.js uses JWT strategy in Phase 1. Switching to the Prisma database adapter in Phase 2 only requires changing session.strategy to "database" — the Session table already exists in the schema.
- Visual design polish and branding are Phase 2 concerns; Phase 1 components are functional stubs.
