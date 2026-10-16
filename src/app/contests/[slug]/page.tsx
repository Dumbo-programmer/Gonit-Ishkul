import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contestPhase, deadlineFor } from "@/lib/arena";
import {
  contestStandings,
  getContestBySlug,
  getEntry,
} from "@/lib/repositories/contests";
import { listProblemsByIds } from "@/lib/repositories/problems";
import { ContestArena, type ArenaStanding } from "@/components/ContestArena";

export default async function ContestDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const contest = await getContestBySlug(params.slug);
  if (!contest) notFound();

  const session = await getServerSession(authOptions);
  const phase = contestPhase(contest);
  const entry =
    session?.user ? await getEntry(contest.id, session.user.uid) : undefined;

  const problems = (await listProblemsByIds(contest.problemIds)).map((p) => ({
    id: p.id,
    slug: p.slug,
    titleBn: p.titleBn,
    titleEn: p.titleEn,
    statementBn: p.statementBn,
    statementEn: p.statementEn,
    kind: p.kind,
    basePoints: p.basePoints,
  }));

  const deadline =
    phase === "upcoming"
      ? contest.startAt
      : entry
        ? new Date(deadlineFor(contest, entry.startedAt)).toISOString()
        : contest.endAt;

  const standings: ArenaStanding[] = (await contestStandings(contest.id)).map((row) => ({
    rank: row.rank,
    name: row.name,
    score: row.score,
    rating: row.rating,
    isYou: row.userId === session?.user?.uid,
  }));

  return (
    <ContestArena
      contest={{
        id: contest.id,
        slug: contest.slug,
        titleBn: contest.titleBn,
        titleEn: contest.titleEn,
        phase,
        durationMinutes: contest.durationMin,
        editorialBn: contest.editorialBn ?? "",
        editorialEn: contest.editorialEn ?? "",
      }}
      problems={problems}
      entry={
        entry
          ? {
              startedAt: entry.startedAt,
              submittedAt: entry.submittedAt,
              score: entry.score,
              answers: entry.answers,
            }
          : null
      }
      deadline={deadline}
      loggedIn={Boolean(session?.user)}
      standings={standings}
    />
  );
}
