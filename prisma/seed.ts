/**
 * PlayBite — Database Seed Script (Phase 2)
 *
 * Creates:
 *   - 1 Platform Admin
 *   - 3 Subscription Plans (Starter, Growth, Enterprise)
 *   - 2 Restaurant Groups  (one independent, one chain)
 *   - 5 Restaurants / Branches
 *   - 2 Restaurant Owners + 3 Staff
 *   - 20 Customers
 *   - 3 Game Categories + 10 Games
 *   - Sample Rewards + Spin Wheel Prizes
 *   - Sample Game Sessions and Leaderboard entries
 *
 * Run with:  npx tsx prisma/seed.ts
 * (or add "prisma": { "seed": "npx tsx prisma/seed.ts" } to package.json)
 */

import { PrismaClient } from '@prisma/client';

// Use type-only imports for enums to avoid runtime issues
type PlanTier = 'FREE_TRIAL' | 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
type GameStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
type GameCategoryType = 'PUZZLE' | 'TRIVIA' | 'ARCADE' | 'SPEED' | 'MEMORY' | 'QUIZ' | 'REACTION' | 'SPORTS' | 'CASUAL' | 'OTHER';
type RewardType = 'DISCOUNT_PERCENT' | 'DISCOUNT_FIXED' | 'FREE_ITEM' | 'BUY_ONE_GET_ONE' | 'SPIN_WHEEL' | 'BADGE' | 'POINTS_MULTIPLIER' | 'CASHBACK' | 'GIFT_VOUCHER' | 'MYSTERY';
type CheckInMethod = 'QR_CODE' | 'NFC_TAG' | 'WIFI' | 'BLUETOOTH_BEACON' | 'STAFF_MANUAL';
type VisitStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'FLAGGED';
type GameSessionStatus = 'STARTED' | 'COMPLETED' | 'ABANDONED' | 'INVALID';
type ClaimStatus = 'PENDING' | 'REDEEMED' | 'EXPIRED' | 'VOIDED';

// ---------------------------------------------------------------------------
// Client bootstrap - Simple connection for deployment
// ---------------------------------------------------------------------------
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function randomHandle(i: number) {
  const adjectives = ['Swift', 'Bold', 'Lucky', 'Cool', 'Ace', 'Prime', 'Ninja', 'Flash', 'Star', 'Wild'];
  const nouns = ['Gamer', 'Player', 'Biter', 'Hero', 'Wizard', 'Champ', 'Boss', 'Ace', 'Rex', 'Fox'];
  return `${adjectives[i % adjectives.length]}${nouns[i % nouns.length]}${i + 1}`;
}

// Fake encrypted phone (in production this is AES-256 ciphertext)
function fakePhone(i: number) {
  return `enc:+1555000${String(i).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱  Seeding PlayBite database…\n');

  // ── Cleanup (idempotent re-runs) ─────────────────────────────────────────
  // Delete in reverse FK dependency order
  await prisma.spinHistory.deleteMany();
  await prisma.spinWheelPrize.deleteMany();
  await prisma.rewardClaim.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.gameScore.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.restaurantGame.deleteMany();
  await prisma.game.deleteMany();
  await prisma.gameCategory.deleteMany();
  await prisma.dailyLeaderboardEntry.deleteMany();
  await prisma.dailyLeaderboard.deleteMany();
  await prisma.weeklyLeaderboard.deleteMany();
  await prisma.lifetimeLeaderboard.deleteMany();
  await prisma.checkInSession.deleteMany();
  await prisma.restaurantVisit.deleteMany();
  await prisma.customerActivity.deleteMany();
  await prisma.deviceSession.deleteMany();
  await prisma.customerDevice.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.staffBranchAssignment.deleteMany();
  await prisma.restaurantStaff.deleteMany();
  await prisma.restaurantOwner.deleteMany();
  await prisma.restaurantSettings.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.dailyAnalytics.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.restaurantGroup.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.account.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.verificationToken.deleteMany();

  console.log('✅  Cleared existing data');

  // ── 1. Subscription Plans ─────────────────────────────────────────────────
  const [planStarter, planGrowth, planEnterprise] = await Promise.all([
    prisma.subscriptionPlan.create({
      data: {
        name: 'Starter',
        tier: 'STARTER',
        description: 'Perfect for independent restaurants getting started.',
        priceMonthly: 2900,
        maxBranches: 1,
        maxGames: 3,
        maxPrizes: 3,
        hasLeaderboard: false,
        hasAnalytics: false,
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'Growth',
        tier: 'GROWTH',
        description: 'Ideal for growing restaurants with multiple locations.',
        priceMonthly: 7900,
        maxBranches: 5,
        maxGames: 10,
        maxPrizes: 10,
        hasLeaderboard: true,
        hasAnalytics: true,
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'Enterprise',
        tier: 'ENTERPRISE',
        description: 'Full-featured for large chains and franchises.',
        priceMonthly: 24900,
        maxBranches: 100,
        maxGames: 50,
        maxPrizes: 50,
        hasLeaderboard: true,
        hasAnalytics: true,
      },
    }),
  ]);
  console.log('✅  Subscription plans created');

  // ── 2. Platform Admin ────────────────────────────────────────────────────
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@playbite.io',
      name: 'PlayBite Admin',
      isActive: true,
    },
  });
  console.log('✅  Platform admin created:', admin.email);

  // ── 3. Restaurant Groups ─────────────────────────────────────────────────
  // Group A — independent restaurant (single-member group)
  const groupA = await prisma.restaurantGroup.create({
    data: {
      name: 'The Burger Lab',
      slug: 'the-burger-lab',
      isChain: false,
    },
  });

  // Group B — restaurant chain (multi-branch)
  const groupB = await prisma.restaurantGroup.create({
    data: {
      name: 'Taco Fiesta Chain',
      slug: 'taco-fiesta-chain',
      isChain: true,
    },
  });
  console.log('✅  Restaurant groups created:', groupA.name, '/', groupB.name);

  // ── 4. Subscriptions ─────────────────────────────────────────────────────
  const now = new Date();
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  await prisma.subscription.create({
    data: {
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: oneYearLater,
      planId: planStarter.id,
      restaurantGroupId: groupA.id,
    },
  });
  await prisma.subscription.create({
    data: {
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: oneYearLater,
      planId: planEnterprise.id,
      restaurantGroupId: groupB.id,
    },
  });
  console.log('✅  Subscriptions created');

  // ── 5. Restaurants & Branches ────────────────────────────────────────────
  // Group A — 1 restaurant, 1 branch
  const restA = await prisma.restaurant.create({
    data: {
      name: 'The Burger Lab — Downtown',
      restaurantGroupId: groupA.id,
      settings: {
        create: {
          maxSessionMinutes: 240,
          maxPlaysPerDay: 5,
          qrRotationMinutes: 30,
          nfcEnabled: true,
        },
      },
    },
  });
  const branchA1 = await prisma.branch.create({
    data: {
      name: 'Downtown Branch',
      address: '123 Main St',
      city: 'New York',
      country: 'US',
      timezone: 'America/New_York',
      isActive: true,
      restaurantId: restA.id,
    },
  });

  // Group B — 4 restaurants (chain), one restaurant has 2 branches
  const restB1 = await prisma.restaurant.create({
    data: { name: 'Taco Fiesta — Midtown', restaurantGroupId: groupB.id },
  });
  const restB2 = await prisma.restaurant.create({
    data: { name: 'Taco Fiesta — Brooklyn', restaurantGroupId: groupB.id },
  });
  const restB3 = await prisma.restaurant.create({
    data: { name: 'Taco Fiesta — Queens', restaurantGroupId: groupB.id },
  });
  const restB4 = await prisma.restaurant.create({
    data: { name: 'Taco Fiesta — Bronx', restaurantGroupId: groupB.id },
  });

  const [branchB1, branchB2, branchB3, branchB4] = await Promise.all([
    prisma.branch.create({
      data: {
        name: 'Midtown Branch',
        address: '456 7th Ave',
        city: 'New York',
        country: 'US',
        timezone: 'America/New_York',
        restaurantId: restB1.id,
      },
    }),
    prisma.branch.create({
      data: {
        name: 'Brooklyn Branch',
        address: '78 Atlantic Ave',
        city: 'Brooklyn',
        country: 'US',
        timezone: 'America/New_York',
        restaurantId: restB2.id,
      },
    }),
    prisma.branch.create({
      data: {
        name: 'Queens Branch',
        address: '99 Queens Blvd',
        city: 'Queens',
        country: 'US',
        timezone: 'America/New_York',
        restaurantId: restB3.id,
      },
    }),
    prisma.branch.create({
      data: {
        name: 'Bronx Branch',
        address: '11 Grand Concourse',
        city: 'Bronx',
        country: 'US',
        timezone: 'America/New_York',
        restaurantId: restB4.id,
      },
    }),
  ]);

  const branches = [branchA1, branchB1, branchB2, branchB3, branchB4];
  console.log(`✅  ${5} restaurants, ${branches.length} branches created`);

  // ── 6. Owners & Staff ────────────────────────────────────────────────────
  const ownerA = await prisma.restaurantOwner.create({
    data: {
      email: 'owner@burgerlab.com',
      name: 'Alice Owner',
      restaurantGroupId: groupA.id,
      restaurants: { connect: { id: restA.id } },
    },
  });

  const ownerB = await prisma.restaurantOwner.create({
    data: {
      email: 'owner@tacofiesta.com',
      name: 'Bob Fiesta',
      restaurantGroupId: groupB.id,
      restaurants: { connect: [{ id: restB1.id }, { id: restB2.id }, { id: restB3.id }, { id: restB4.id }] },
    },
  });

  const staffData = [
    { email: 'staff1@burgerlab.com', name: 'Carlos Staff', restaurantId: restA.id, branchId: branchA1.id },
    { email: 'staff2@tacofiesta.com', name: 'Diana Staff', restaurantId: restB1.id, branchId: branchB1.id },
    { email: 'staff3@tacofiesta.com', name: 'Ethan Staff', restaurantId: restB2.id, branchId: branchB2.id },
  ];

  for (const s of staffData) {
    const staff = await prisma.restaurantStaff.create({
      data: {
        email: s.email,
        name: s.name,
        restaurantId: s.restaurantId,
        branchAssignments: { create: { branchId: s.branchId } },
      },
    });
    void staff;
  }
  console.log('✅  2 owners, 3 staff created');

  // ── 7. Game Categories & Games ───────────────────────────────────────────
  const [catPuzzle, catTrivia, catArcade] = await Promise.all([
    prisma.gameCategory.create({ data: { name: 'Puzzle', type: 'PUZZLE', sortOrder: 1 } }),
    prisma.gameCategory.create({ data: { name: 'Trivia', type: 'TRIVIA', sortOrder: 2 } }),
    prisma.gameCategory.create({ data: { name: 'Arcade', type: 'ARCADE', sortOrder: 3 } }),
  ]);

  const gameSeeds = [
    { name: 'Burger Stack', slug: 'burger-stack', cat: catPuzzle.id, max: 5000, min: 10, pps: 2 },
    { name: 'Taco Quiz', slug: 'taco-quiz', cat: catTrivia.id, max: 1000, min: 15, pps: 5 },
    { name: 'Coin Blaster', slug: 'coin-blaster', cat: catArcade.id, max: 9999, min: 5, pps: 1 },
    { name: 'Word Wrap', slug: 'word-wrap', cat: catPuzzle.id, max: 3000, min: 20, pps: 3 },
    { name: 'Food Trivia Pro', slug: 'food-trivia-pro', cat: catTrivia.id, max: 2000, min: 20, pps: 4 },
    { name: 'Speed Tapper', slug: 'speed-tapper', cat: catArcade.id, max: 500, min: 5, pps: 2 },
    { name: 'Memory Match', slug: 'memory-match', cat: catPuzzle.id, max: 1500, min: 30, pps: 3 },
    { name: 'Sushi Slide', slug: 'sushi-slide', cat: catArcade.id, max: 7500, min: 8, pps: 1 },
    { name: 'Chef Challenge', slug: 'chef-challenge', cat: catTrivia.id, max: 1000, min: 25, pps: 5 },
    { name: 'Emoji Blast', slug: 'emoji-blast', cat: catArcade.id, max: 4000, min: 6, pps: 2 },
  ];

  const games = await Promise.all(
    gameSeeds.map((g) =>
      prisma.game.create({
        data: {
          name: g.name,
          slug: g.slug,
          bundleUrl: `https://cdn.playbite.io/games/${g.slug}/index.html`,
          status: 'ACTIVE',
          maxScore: g.max,
          minDurationSecs: g.min,
          pointsPerScore: g.pps,
          categoryId: g.cat,
        },
      })
    )
  );
  console.log(`✅  3 game categories, ${games.length} games created`);

  // Activate first 3 games on all branches
  for (const branch of branches) {
    for (const game of games.slice(0, 3)) {
      await prisma.restaurantGame.create({
        data: { gameId: game.id, branchId: branch.id, isActive: true },
      });
    }
  }

  // ── 8. Rewards & Spin Wheel Prizes ────────────────────────────────────────
  const rewardsGroupA = await Promise.all([
    prisma.reward.create({
      data: {
        name: '10% Off Next Burger',
        type: 'DISCOUNT_PERCENT',
        value: 10,
        inventory: 100,
        restaurantGroupId: groupA.id,
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Free Fries',
        type: 'FREE_ITEM',
        inventory: 50,
        restaurantGroupId: groupA.id,
      },
    }),
  ]);

  const rewardsGroupB = await Promise.all([
    prisma.reward.create({
      data: {
        name: '15% Off Tacos',
        type: 'DISCOUNT_PERCENT',
        value: 15,
        inventory: 200,
        restaurantGroupId: groupB.id,
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Free Drink',
        type: 'FREE_ITEM',
        inventory: 100,
        restaurantGroupId: groupB.id,
      },
    }),
    prisma.reward.create({
      data: {
        name: '2x Points Boost',
        type: 'POINTS_MULTIPLIER',
        value: 2,
        restaurantGroupId: groupB.id,
      },
    }),
  ]);

  // Spin wheel for Group A
  await Promise.all([
    prisma.spinWheelPrize.create({
      data: { label: '10% Discount', probability: 0.4, inventory: 100, restaurantGroupId: groupA.id, rewardId: rewardsGroupA[0].id },
    }),
    prisma.spinWheelPrize.create({
      data: { label: 'Free Fries', probability: 0.3, inventory: 50, restaurantGroupId: groupA.id, rewardId: rewardsGroupA[1].id },
    }),
    prisma.spinWheelPrize.create({
      data: { label: 'Better Luck Next Time', probability: 0.3, inventory: null, restaurantGroupId: groupA.id, rewardId: rewardsGroupA[0].id },
    }),
  ]);

  // Spin wheel for Group B
  await Promise.all([
    prisma.spinWheelPrize.create({
      data: { label: '15% Discount', probability: 0.3, inventory: 200, restaurantGroupId: groupB.id, rewardId: rewardsGroupB[0].id },
    }),
    prisma.spinWheelPrize.create({
      data: { label: 'Free Drink', probability: 0.25, inventory: 100, restaurantGroupId: groupB.id, rewardId: rewardsGroupB[1].id },
    }),
    prisma.spinWheelPrize.create({
      data: { label: '2x Points', probability: 0.15, inventory: null, restaurantGroupId: groupB.id, rewardId: rewardsGroupB[2].id },
    }),
    prisma.spinWheelPrize.create({
      data: { label: 'Try Again', probability: 0.3, inventory: null, restaurantGroupId: groupB.id, rewardId: rewardsGroupB[0].id },
    }),
  ]);
  console.log('✅  Rewards and spin wheel prizes created');

  // ── 9. Customers (20 total) ──────────────────────────────────────────────
  // 10 for Group A, 10 for Group B
  const customersA: Awaited<ReturnType<typeof prisma.customer.create>>[] = [];
  const customersB: Awaited<ReturnType<typeof prisma.customer.create>>[] = [];

  for (let i = 0; i < 10; i++) {
    const c = await prisma.customer.create({
      data: {
        phoneNumber: fakePhone(i),
        displayHandle: randomHandle(i),
        totalPoints: Math.floor(Math.random() * 2000),
        restaurantGroupId: groupA.id,
        profile: { create: { marketingConsent: i % 2 === 0 } },
      },
    });
    customersA.push(c);
  }

  for (let i = 10; i < 20; i++) {
    const c = await prisma.customer.create({
      data: {
        phoneNumber: fakePhone(i),
        displayHandle: randomHandle(i),
        totalPoints: Math.floor(Math.random() * 5000),
        restaurantGroupId: groupB.id,
        profile: { create: { marketingConsent: i % 2 === 0 } },
      },
    });
    customersB.push(c);
  }
  console.log(`✅  20 customers created (10 per group)`);

  // ── 10. Sample Visits, Game Sessions & Scores ────────────────────────────
  // Create one visit + one game session per first 5 customers in Group A
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 5; i++) {
    const customer = customersA[i];
    const visit = await prisma.restaurantVisit.create({
      data: {
        customerId: customer.id,
        branchId: branchA1.id,
        status: 'COMPLETED',
        pointsEarned: 150 + i * 50,
        checkInAt: new Date(today.getTime() + i * 3600000),
        checkOutAt: new Date(today.getTime() + i * 3600000 + 1800000),
        checkInSession: {
          create: {
            method: 'QR_CODE',
            customerId: customer.id,
            branchId: branchA1.id,
            verifiedAt: new Date(today.getTime() + i * 3600000),
            expiresAt: new Date(today.getTime() + i * 3600000 + 14400000),
            ipAddress: `192.168.1.${i + 1}`,
          },
        },
      },
    });

    const game = games[i % games.length];
    const duration = 30 + i * 10;
    const score = 200 + i * 100;
    const gs = await prisma.gameSession.create({
      data: {
        customerId: customer.id,
        gameId: game.id,
        branchId: branchA1.id,
        visitId: visit.id,
        status: 'COMPLETED',
        nonce: `nonce-seed-${customer.id}-${i}`,
        startedAt: new Date(today.getTime() + i * 3600000 + 300000),
        completedAt: new Date(today.getTime() + i * 3600000 + 300000 + duration * 1000),
        durationSecs: duration,
        rawScore: score,
        finalScore: score,
        pointsAwarded: Math.round(score * game.pointsPerScore),
      },
    });

    await prisma.gameScore.create({ data: { sessionId: gs.id, score } });
  }
  console.log('✅  Sample visits, game sessions, and scores created');

  // ── 11. Daily Leaderboard ────────────────────────────────────────────────
  const lb = await prisma.dailyLeaderboard.create({
    data: {
      date: today,
      restaurantGroupId: groupA.id,
      branchId: branchA1.id,
    },
  });

  for (let i = 0; i < 5; i++) {
    await prisma.dailyLeaderboardEntry.create({
      data: {
        leaderboardId: lb.id,
        customerId: customersA[i].id,
        points: 150 + i * 50,
        rank: 5 - i,
      },
    });
  }
  console.log('✅  Daily leaderboard seeded');

  // ── 12. Sample Reward Claims ─────────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    await prisma.rewardClaim.create({
      data: {
        customerId: customersA[i].id,
        rewardId: rewardsGroupA[0].id,
        status: i === 0 ? 'REDEEMED' : 'PENDING',
        redemptionCode: `BRGRLAB${String(1000 + i)}`,
        issuedAt: new Date(),
        redeemedAt: i === 0 ? new Date() : null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅  Sample reward claims created');

  // ── 13. Analytics snapshot ───────────────────────────────────────────────
  await prisma.dailyAnalytics.create({
    data: {
      restaurantGroupId: groupA.id,
      date: today,
      totalVisits: 5,
      uniqueCustomers: 5,
      totalGamePlays: 5,
      totalPointsAwarded: 5 * 200,
      totalRewardsIssued: 3,
      totalRewardsRedeemed: 1,
    },
  });
  console.log('✅  Daily analytics snapshot created');

  // ── 14. Audit log entries ────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'Restaurant',
      entityId: restA.id,
      actorId: admin.id,
      actorRole: 'PLATFORM_ADMIN',
      adminId: admin.id,
      note: 'Seed: created restaurant group A',
    },
  });
  console.log('✅  Audit log entry created');

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log('\n🎉  Seed complete!\n');
  console.log('Summary:');
  console.log('  Platform admins:    1');
  console.log('  Subscription plans: 3');
  console.log('  Restaurant groups:  2');
  console.log('  Restaurants:        5');
  console.log('  Branches:           5');
  console.log('  Restaurant owners:  2');
  console.log('  Restaurant staff:   3');
  console.log('  Customers:         20');
  console.log('  Games:             10');
  console.log('  Rewards:            5');
  console.log('  Spin prizes:        7');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
