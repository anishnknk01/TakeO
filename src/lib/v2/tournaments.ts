/**
 * V2 Features 4 & 5: Tournaments & Team Battles.
 */
import 'server-only';
import { prisma } from '@/lib/prisma';

export async function getActiveTournaments(restaurantGroupId: string) {
  return prisma.tournament.findMany({
    where: { restaurantGroupId, status: { in: ['UPCOMING', 'ACTIVE'] } },
    include: { _count: { select: { participants: true } } },
    orderBy: { startsAt: 'asc' },
  });
}

export async function joinTournament(tournamentId: string, customerId: string, teamId?: string) {
  const tournament = await prisma.tournament.findFirst({ where: { id: tournamentId, status: { in: ['UPCOMING', 'ACTIVE'] } } });
  if (!tournament) throw new Error('Tournament not found or not active.');
  if (tournament.maxPlayers) {
    const count = await prisma.tournamentParticipant.count({ where: { tournamentId } });
    if (count >= tournament.maxPlayers) throw new Error('Tournament is full.');
  }

  return prisma.tournamentParticipant.upsert({
    where: { tournamentId_customerId: { tournamentId, customerId } },
    create: { tournamentId, customerId, teamId },
    update: {},
  });
}

export async function updateTournamentScore(tournamentId: string, customerId: string, score: number) {
  await prisma.tournamentParticipant.updateMany({
    where: { tournamentId, customerId },
    data: { score: { increment: score } },
  });

  // Update team total if team-based
  const participant = await prisma.tournamentParticipant.findFirst({ where: { tournamentId, customerId }, select: { teamId: true, score: true } });
  if (participant?.teamId) {
    const teamTotal = await prisma.tournamentParticipant.aggregate({ where: { teamId: participant.teamId }, _sum: { score: true } });
    await prisma.tournamentTeam.update({
      where: { id: participant.teamId },
      data: { totalScore: teamTotal._sum.score ?? 0 },
    });
  }
}

export async function getTournamentLeaderboard(tournamentId: string, limit = 20) {
  return prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    orderBy: { score: 'desc' },
    take: limit,
    include: { customer: { select: { displayHandle: true } }, team: { select: { name: true } } },
  });
}
