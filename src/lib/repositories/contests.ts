import { getStore, persistStore, uid } from "@/lib/store";
import type { ContestEntryRecord, ContestRecord } from "@/lib/types";
import { answersMatch } from "@/lib/judge";
import { DEFAULT_RATING, averageExpected, updateRating } from "@/lib/rating";
import { listProblemsByIds } from "@/lib/repositories/problems";
import { findUserById } from "@/lib/repositories/users";

export async function listContests(): Promise<ContestRecord[]> {
  return (await getStore())
    .contests.filter((c) => c.published)
    .map((c) => ({ ...c }));
}

export async function getContestBySlug(slug: string): Promise<ContestRecord | undefined> {
  return (await getStore()).contests.find((c) => c.slug === slug);
}

export async function getContestById(id: string): Promise<ContestRecord | undefined> {
  return (await getStore()).contests.find((c) => c.id === id);
}

export async function listContestEntries(
  contestId: string,
): Promise<ContestEntryRecord[]> {
  return (await getStore())
    .contestEntries.filter((e) => e.contestId === contestId)
    .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt));
}

export async function getEntry(
  contestId: string,
  userId: string,
): Promise<ContestEntryRecord | undefined> {
  return (await getStore()).contestEntries.find(
    (e) => e.contestId === contestId && e.userId === userId,
  );
}

export async function startContest(
  userId: string,
  contestId: string,
): Promise<ContestEntryRecord> {
  const store = await getStore();
  const existing = store.contestEntries.find(
    (e) => e.contestId === contestId && e.userId === userId,
  );
  if (existing) return existing;
  const record: ContestEntryRecord = {
    id: uid("cen"),
    contestId,
    userId,
    startedAt: new Date().toISOString(),
    answers: {},
    score: 0,
    createdAt: new Date().toISOString(),
  };
  store.contestEntries.push(record);
  await persistStore(store);
  return record;
}

export async function saveContestAnswer(
  contestId: string,
  userId: string,
  problemId: string,
  answer: string,
): Promise<ContestEntryRecord | undefined> {
  const store = await getStore();
  const entry = store.contestEntries.find(
    (e) => e.contestId === contestId && e.userId === userId,
  );
  if (!entry || entry.submittedAt) return entry;
  entry.answers[problemId] = answer;
  await persistStore(store);
  return entry;
}

export async function getRating(userId: string): Promise<number> {
  const record = (await getStore()).ratings.find((r) => r.userId === userId);
  return record?.rating ?? DEFAULT_RATING;
}

export async function setRating(
  userId: string,
  rating: number,
  contestIncrement = 0,
): Promise<void> {
  const store = await getStore();
  let record = store.ratings.find((r) => r.userId === userId);
  const now = new Date().toISOString();
  if (!record) {
    record = { id: uid("rtg"), userId, rating, contests: 0, updatedAt: now };
    store.ratings.push(record);
  }
  record.rating = rating;
  record.contests += contestIncrement;
  record.updatedAt = now;
  await persistStore(store);
}

/** Auto-grades numeric contest answers and applies an Elo update vs the field. */
export async function submitContest(
  contestId: string,
  userId: string,
): Promise<ContestEntryRecord | undefined> {
  const store = await getStore();
  const entry = store.contestEntries.find(
    (e) => e.contestId === contestId && e.userId === userId,
  );
  const contest = store.contests.find((c) => c.id === contestId);
  if (!entry || !contest || entry.submittedAt) return entry;

  const problems = await listProblemsByIds(contest.problemIds);
  const maxScore = problems.reduce((sum, p) => sum + p.basePoints, 0);

  let score = 0;
  for (const problem of problems) {
    const answer = entry.answers[problem.id];
    if (!answer) continue;
    if (problem.kind === "NUMERIC" && answersMatch(problem.answer ?? "", answer, problem.tolerance)) {
      score += problem.basePoints;
    }
  }

  const before = await getRating(userId);
  const opponents = await Promise.all(
    store.contestEntries
      .filter((e) => e.contestId === contestId && e.id !== entry.id && e.submittedAt)
      .map(async (e) => e.ratingAfter ?? (await getRating(e.userId))),
  );
  const expected = averageExpected(before, opponents);
  const actual = maxScore > 0 ? score / maxScore : 0;
  const after = updateRating(before, actual, expected);

  const now = new Date().toISOString();
  entry.score = score;
  entry.submittedAt = now;
  entry.ratingBefore = before;
  entry.ratingAfter = after;
  await persistStore(store);
  await setRating(userId, after, 1);
  return entry;
}

export interface StandingRow {
  rank: number;
  userId: string;
  name: string;
  score: number;
  maxScore: number;
  rating: number;
  submitted: boolean;
}

export async function contestStandings(contestId: string): Promise<StandingRow[]> {
  const contest = await getContestById(contestId);
  const maxScore = contest
    ? (await listProblemsByIds(contest.problemIds)).reduce((s, p) => s + p.basePoints, 0)
    : 0;
  const entries = await listContestEntries(contestId);
  return Promise.all(
    entries.map(async (entry, i) => ({
      rank: i + 1,
      userId: entry.userId,
      name: (await findUserById(entry.userId))?.name ?? "—",
      score: entry.score,
      maxScore,
      rating: entry.ratingAfter ?? (await getRating(entry.userId)),
      submitted: Boolean(entry.submittedAt),
    })),
  );
}

export async function ratingLeaderboard(): Promise<
  { userId: string; name: string; rating: number; contests: number }[]
> {
  const ratings = (await getStore()).ratings.slice().sort((a, b) => b.rating - a.rating);
  return Promise.all(
    ratings.map(async (r) => ({
      userId: r.userId,
      name: (await findUserById(r.userId))?.name ?? "—",
      rating: r.rating,
      contests: r.contests,
    })),
  );
}
