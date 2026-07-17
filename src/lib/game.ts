/**
 * Game Engine core logic — session management, secure score submission,
 * anti-cheat validation, personal best tracking, cooldown enforcement.
 *
 * Server-only. All functions run on the server; client never sees raw scores.
 */
import 'server-only';

import { createHash, randomBytes } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { getActiveVisit } from '@/lib/checkin';
import { updateAllLeaderboards, detectAbnormalFrequency } from '@/lib/leaderboard';
import type { GameSessionStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Nonce lifetime — must complete game within this window */
const NONCE_TTL_MINUTES = 30;

/** Minimum cooldown between plays of the same game (seconds) */
const PLAY_COOLDOWN_SECONDS = 10;

function getGameKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? 'dev-secret';
  return new TextEncoder().encode(`game-nonce:${secret}`);
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class GameError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'GameError';
  }
}

// ---------------------------------------------------------------------------
// Nonce — server-issued, single-use, bound to (customerId, gameId)
// ---------------------------------------------------------------------------

interface NoncePayload {
  customerId: string;
  gameId: string;
  branchId: string;
  visitId: string;
  jti: string;
  iat: number;
}

/**
 * Issues a server-signed nonce JWT for a game play start.
 * The nonce is stored in GameSession.nonce (unique) to prevent replay.
 */
export async function issueGameNonce(
  customerId: string,
  gameId: string,
  branchId: string,
  visitId: string,
): Promise<string> {
  const jti = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + NONCE_TTL_MINUTES * 60 * 1000);

  return new SignJWT({ customerId, gameId, branchId, visitId, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .setJti(jti)
    .sign(getGameKey());
}

/**
 * Verifies and decodes a nonce JWT.
 * Returns the payload or throws GameError.
 */
async function verifyNonce(nonce: string): Promise<NoncePayload> {
  try {
    const { payload } = await jwtVerify(nonce, getGameKey(), { algorithms: ['HS256'] });
    return payload as unknown as NoncePayload;
  } catch {
    throw new GameError('nonce_invalid', 'Game session token is invalid or has expired.');
  }
}

// ---------------------------------------------------------------------------
// Guard: customer must have an active visit
// ---------------------------------------------------------------------------

export async function requireActiveVisit(customerId: string) {
  const visit = await getActiveVisit(customerId);
  if (!visit) {
    throw new GameError('no_active_session', 'You must check in to a restaurant before playing.');
  }
  return visit;
}

// ---------------------------------------------------------------------------
// Guard: game must be enabled for this branch
// ---------------------------------------------------------------------------

export async function requireGameEnabled(gameId: string, branchId: string) {
  const rg = await prisma.restaurantGame.findFirst({
    where: { gameId, branchId, isActive: true },
    include: { game: true },
  });
  if (!rg || rg.game.status !== 'ACTIVE') {
    throw new GameError('game_not_available', 'This game is not available at this location.');
  }
  return rg;
}

// ---------------------------------------------------------------------------
// Guard: daily play limit
// ---------------------------------------------------------------------------

async function checkDailyLimit(
  customerId: string,
  gameId: string,
  branchId: string,
  maxPlaysPerDay: number | null,
  globalMaxPlaysPerDay: number,
): Promise<void> {
  const limit = maxPlaysPerDay ?? globalMaxPlaysPerDay;
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const count = await prisma.gameSession.count({
    where: {
      customerId,
      gameId,
      branchId,
      startedAt: { gte: dayStart },
      status: { in: ['COMPLETED', 'STARTED'] },
    },
  });

  if (count >= limit) {
    throw new GameError(
      'daily_limit_reached',
      `You have reached the daily play limit (${limit}) for this game.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Guard: cooldown between plays
// ---------------------------------------------------------------------------

async function checkCooldown(customerId: string, gameId: string): Promise<void> {
  const last = await prisma.gameSession.findFirst({
    where: { customerId, gameId, status: { in: ['COMPLETED', 'INVALID'] } },
    orderBy: { completedAt: 'desc' },
    select: { completedAt: true },
  });

  if (!last?.completedAt) return;
  const msSinceLast = Date.now() - last.completedAt.getTime();
  if (msSinceLast < PLAY_COOLDOWN_SECONDS * 1000) {
    throw new GameError(
      'cooldown_active',
      `Please wait ${PLAY_COOLDOWN_SECONDS} seconds before playing again.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Start a game session
// ---------------------------------------------------------------------------

export interface StartGameResult {
  gameSessionId: string;
  nonce: string;
  game: {
    id: string;
    name: string;
    bundleUrl: string;
    maxScore: number;
    minDurationSecs: number;
    estimatedPlaySecs: number;
  };
}

export async function startGameSession(
  customerId: string,
  gameId: string,
): Promise<StartGameResult> {
  // 1. Active visit guard
  const visit = await requireActiveVisit(customerId);

  // 2. Game enabled for this branch guard
  const rg = await requireGameEnabled(gameId, visit.branchId);
  const { game } = rg;

  // 3. Restaurant settings for daily limit
  const settings = await prisma.restaurantSettings.findFirst({
    where: { restaurant: { branches: { some: { id: visit.branchId } } } },
    select: { maxPlaysPerDay: true },
  });

  await checkDailyLimit(customerId, gameId, visit.branchId, rg.maxPlaysPerDay, settings?.maxPlaysPerDay ?? 10);

  // 4. Cooldown guard
  await checkCooldown(customerId, gameId);

  // 5. Issue nonce
  const nonce = await issueGameNonce(customerId, gameId, visit.branchId, visit.id);
  const nonceHash = createHash('sha256').update(nonce).digest('hex');

  // 6. Create GameSession row — use nonce hash as the stored unique value
  const session = await prisma.gameSession.create({
    data: {
      customerId,
      gameId,
      branchId: visit.branchId,
      visitId: visit.id,
      nonce: nonceHash,
      status: 'STARTED',
      startedAt: new Date(),
    },
  });

  return {
    gameSessionId: session.id,
    nonce, // returned to client; full JWT — client must submit it back on score
    game: {
      id: game.id,
      name: game.name,
      bundleUrl: game.bundleUrl,
      maxScore: game.maxScore,
      minDurationSecs: game.minDurationSecs,
      estimatedPlaySecs: game.estimatedPlaySecs,
    },
  };
}

// ---------------------------------------------------------------------------
// Anti-cheat validation
// ---------------------------------------------------------------------------

interface AntiCheatResult {
  valid: boolean;
  reason?: string;
  adjustedScore: number;
}

function validateScore(
  rawScore: number,
  durationSecs: number,
  maxScore: number,
  minDurationSecs: number,
  scoreMultiplier: number,
): AntiCheatResult {
  // 1. Score out of range
  if (rawScore < 0) return { valid: false, reason: 'negative_score', adjustedScore: 0 };
  if (rawScore > maxScore) return { valid: false, reason: 'score_exceeds_max', adjustedScore: 0 };

  // 2. Duration too short (impossible play speed)
  if (durationSecs < minDurationSecs) {
    return { valid: false, reason: 'duration_too_short', adjustedScore: 0 };
  }

  // 3. Plausibility: score per second can't be too extreme
  // (allow some leeway for burst combos — 10× theoretical max rate)
  const maxRatePerSec = maxScore / Math.max(minDurationSecs, 1);
  const actualRatePerSec = rawScore / Math.max(durationSecs, 1);
  if (actualRatePerSec > maxRatePerSec * 10) {
    return { valid: false, reason: 'score_rate_implausible', adjustedScore: 0 };
  }

  const adjustedScore = Math.round(rawScore * scoreMultiplier);
  return { valid: true, adjustedScore };
}

// ---------------------------------------------------------------------------
// Submit score and complete session
// ---------------------------------------------------------------------------

export interface SubmitScoreResult {
  pointsAwarded: number;
  finalScore: number;
  isPersonalBest: boolean;
  status: GameSessionStatus;
}

export async function submitGameScore(
  gameSessionId: string,
  customerId: string,
  /** The full nonce JWT returned from startGameSession */
  nonce: string,
  rawScore: number,
): Promise<SubmitScoreResult> {
  // 1. Verify nonce JWT
  const noncePayload = await verifyNonce(nonce);
  if (noncePayload.customerId !== customerId) {
    throw new GameError('nonce_mismatch', 'Session token does not match your account.');
  }

  // 2. Load the game session
  const session = await prisma.gameSession.findFirst({
    where: { id: gameSessionId, customerId, status: 'STARTED' },
    include: {
      game: true,
      visit: true,
    },
  });
  if (!session) throw new GameError('session_not_found', 'Game session not found or already completed.');

  // 3. Verify nonce hash matches stored value
  const expectedHash = createHash('sha256').update(nonce).digest('hex');
  if (session.nonce !== expectedHash) {
    throw new GameError('nonce_mismatch', 'Session token mismatch — possible replay attempt.');
  }

  // 4. Check visit is still active
  if (session.visit.status !== 'ACTIVE') {
    throw new GameError('session_expired', 'Your check-in session has expired. Please check in again.');
  }

  const completedAt = new Date();
  const durationSecs = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);

  // 5. Get score multiplier for this branch
  const rg = await prisma.restaurantGame.findFirst({
    where: { gameId: session.gameId, branchId: session.branchId },
    select: { scoreMultiplier: true },
  });
  const multiplier = rg?.scoreMultiplier ?? 1.0;

  // 6. Anti-cheat validation
  const { valid, reason, adjustedScore } = validateScore(
    rawScore,
    durationSecs,
    session.game.maxScore,
    session.game.minDurationSecs,
    multiplier,
  );

  const finalStatus: GameSessionStatus = valid ? 'COMPLETED' : 'INVALID';
  const finalScore = valid ? adjustedScore : 0;
  const pointsAwarded = valid ? Math.round(finalScore * session.game.pointsPerScore) : 0;

  // 7. Atomic update: session + score record + personal best + customer points
  let isPersonalBest = false;

  await prisma.$transaction(async (tx) => {
    // Update session
    await tx.gameSession.update({
      where: { id: gameSessionId },
      data: {
        status: finalStatus,
        completedAt,
        durationSecs,
        rawScore,
        finalScore,
        pointsAwarded,
        flagReason: reason ?? null,
      },
    });

    // Create immutable score record
    await tx.gameScore.create({
      data: { sessionId: gameSessionId, score: finalScore },
    });

    if (valid && finalScore > 0) {
      // Update personal best if higher
      const existing = await tx.personalBest.findUnique({
        where: { customerId_gameId: { customerId, gameId: session.gameId } },
        select: { score: true },
      });

      if (!existing) {
        await tx.personalBest.create({
          data: { customerId, gameId: session.gameId, score: finalScore },
        });
        isPersonalBest = true;
      } else if (finalScore > existing.score) {
        await tx.personalBest.update({
          where: { customerId_gameId: { customerId, gameId: session.gameId } },
          data: { score: finalScore },
        });
        isPersonalBest = true;
      }

      // Credit points to customer
      if (pointsAwarded > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { totalPoints: { increment: pointsAwarded } },
        });
      }
    }
  });

  // 8. Update leaderboards (after transaction — non-fatal)
  if (valid && pointsAwarded > 0) {
    const branch = await prisma.branch.findUnique({
      where: { id: session.branchId },
      select: { restaurant: { select: { restaurantGroupId: true } } },
    });
    const restaurantGroupId = branch?.restaurant.restaurantGroupId;
    if (restaurantGroupId) {
      await updateAllLeaderboards({
        customerId,
        branchId: session.branchId,
        restaurantGroupId,
        pointsAwarded,
      }).catch(() => null);

      await detectAbnormalFrequency(customerId, restaurantGroupId).catch(() => null);
    }
  }

  // 9. Audit log (non-fatal)
  await prisma.auditLog.create({
    data: {
      action: valid ? 'CREATE' : 'ANTI_CHEAT_FLAG',
      entityType: 'GameSession',
      entityId: gameSessionId,
      actorId: customerId,
      actorRole: 'CUSTOMER',
      note: valid
        ? `Score ${finalScore} points ${pointsAwarded}`
        : `Rejected: ${reason ?? 'unknown'}`,
    },
  }).catch(() => null);

  return { pointsAwarded, finalScore, isPersonalBest, status: finalStatus };
}

// ---------------------------------------------------------------------------
// Abandon a session (customer leaves mid-game)
// ---------------------------------------------------------------------------

export async function abandonGameSession(
  gameSessionId: string,
  customerId: string,
): Promise<void> {
  const session = await prisma.gameSession.findFirst({
    where: { id: gameSessionId, customerId, status: 'STARTED' },
  });
  if (!session) return; // already completed or not found

  await prisma.gameSession.update({
    where: { id: gameSessionId },
    data: {
      status: 'ABANDONED',
      completedAt: new Date(),
      durationSecs: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    },
  });
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/** Returns games available at a branch for a given customer (active visit required check is done by callers). */
export async function getAvailableGames(branchId: string) {
  return prisma.restaurantGame.findMany({
    where: { branchId, isActive: true, game: { status: 'ACTIVE', deletedAt: null } },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { game: { name: 'asc' } }],
    select: {
      id: true,
      isFeatured: true,
      maxPlaysPerDay: true,
      scoreMultiplier: true,
      game: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          thumbnailUrl: true,
          difficulty: true,
          estimatedPlaySecs: true,
          maxScore: true,
          version: true,
          category: { select: { name: true, type: true } },
        },
      },
    },
  });
}

/** Returns a customer's game history (paginated). */
export async function getGameHistory(
  customerId: string,
  page = 1,
  limit = 20,
) {
  const skip = (page - 1) * limit;
  const [sessions, total] = await Promise.all([
    prisma.gameSession.findMany({
      where: { customerId, status: { in: ['COMPLETED', 'ABANDONED', 'INVALID'] } },
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        durationSecs: true,
        finalScore: true,
        pointsAwarded: true,
        game: { select: { id: true, name: true, slug: true, thumbnailUrl: true } },
        branch: { select: { name: true, restaurant: { select: { name: true } } } },
      },
    }),
    prisma.gameSession.count({
      where: { customerId, status: { in: ['COMPLETED', 'ABANDONED', 'INVALID'] } },
    }),
  ]);
  return { sessions, total, page, limit, pages: Math.ceil(total / limit) };
}

/** Returns personal bests for a customer (all games). */
export async function getPersonalBests(customerId: string) {
  return prisma.personalBest.findMany({
    where: { customerId },
    orderBy: { score: 'desc' },
    select: {
      score: true,
      updatedAt: true,
      game: { select: { id: true, name: true, slug: true, thumbnailUrl: true } },
    },
  });
}
