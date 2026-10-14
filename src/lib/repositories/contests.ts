import { getStore, persistStore, uid } from "@/lib/store";
import type { ContestEntryRecord, ContestRecord } from "@/lib/types";
import { answersMatch } from "@/lib/judge";
import { DEFAULT_RATING, averageExpected, updateRating } from "@/lib/rating";
import { listProblemsByIds } from "@/lib/repositories/problems";
import { findUserById } from "@/lib/repositories/users";

export function listContests(): ContestRecord[] {
  return getStore()
    .contests.filter((c) => c.published)
    .map((c) => ({ ...c }));
}

export function getContestBySlug(slug: string): ContestRecord | undefined {
  return getStore().contests.find((c) => c.slug === slug);
}

export function getContestById(id: string): ContestRecord | undefined {
  return getStore().contests.find((c) => c.id === id);
}

export function listContestEntries(contestId: string): ContestEntryRecord[] {
  return getStore()
    .contestEntries.filter((e) => e.contestId === contestId)
    .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt));
}

export function getEntry(contestId: string, userId: string): ContestEntryRecord | undefined {
  return getStore().contestEntries.find(
    (e) => e.contestId === contestId && e.userId === userId,
  );
}

export function startContest(userId: string, contestId: string): ContestEntryRecord {
  const store = getStore();
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
  persistStore(store);
  return record;
}

export function saveContestAnswer(
  contestId: string,
  userId: string,
  problemId: string,
  answer: string,
): ContestEntryRecord | undefined {
  const store = getStore();
  const entry = store.contestEntries.find(
    (e) => e.contestId === contestId && e.userId === userId,
  );
  if (!entry || entry.submittedAt) return entry;
  entry.answers[problemId] = answer;
  persistStore(store);
  return entry;
}

export function getRating(userId: string): number {
  const record = getStore().ratings.find((r) => r.userId === userId);
  return record?.rating ?? DEFAULT_RATING;
}

export function setRating(userId: string, rating: number, contestIncrement = 0): void {
  const store = getStore();
  let record = store.ratings.find((r) => r.userId === userId);
  const now = new Date().toISOString();
  if (!record) {
    record = { id: uid("rtg"), userId, rating, contests: 0, updatedAt: now };
    store.ratings.push(record);
  }
  record.rating = rating;
  record.contests += contestIncrement;
  record.updatedAt = now;
  persistStore(store);
}

/** Auto-grades numeric contest answers and applies an Elo update vs the field. */
export function submitContest(
  contestId: string,
  userId: string,
): ContestEntryRecord | undefined {
  const store = getStore();
  const entry = store.contestEntries.find(
    (e) => e.contestId === contestId && e.userId === userId,
  );
  const contest = store.contests.find((c) => c.id === contestId);
  if (!entry || !contest || entry.submittedAt) return entry;

  const problems = listProblemsByIds(contest.problemIds);
  const maxScore = problems.reduce((sum, p) => sum + p.basePoints, 0);

  let score = 0;
  for (const problem of problems) {
    const answer = entry.answers[problem.id];
    if (!answer) continue;
    if (problem.kind === "NUMERIC" && answersMatch(problem.answer ?? "", answer, problem.tolerance)) {
      score += problem.basePoints;
    }
  }

  const before = getRating(userId);
  const opponents = store.contestEntries
    .filter((e) => e.contestId === contestId && e.id !== entry.id && e.submittedAt)
    .map((e) => e.ratingAfter ?? getRating(e.userId));
  const expected = averageExpected(before, opponents);
  const actual = maxScore > 0 ? score / maxScore : 0;
  const after = updateRating(before, actual, expected);

  const now = new Date().toISOString();
  entry.score = score;
  entry.submittedAt = now;
  entry.ratingBefore = before;
  entry.ratingAfter = after;
  persistStore(store);
  setRating(userId, after, 1);
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

export function contestStandings(contestId: string): StandingRow[] {
  const contest = getContestById(contestId);
  const maxScore = contest
    ? listProblemsByIds(contest.problemIds).reduce((s, p) => s + p.basePoints, 0)
    : 0;
  return listContestEntries(contestId)
    .map((entry, i) => ({
      rank: i + 1,
      userId: entry.userId,
      name: findUserById(entry.userId)?.name ?? "—",
      score: entry.score,
      maxScore,
      rating: entry.ratingAfter ?? getRating(entry.userId),
      submitted: Boolean(entry.submittedAt),
    }));
}

export function ratingLeaderboard(): { userId: string; name: string; rating: number; contests: number }[] {
  return getStore()
    .ratings.slice()
    .sort((a, b) => b.rating - a.rating)
    .map((r) => ({
      userId: r.userId,
      name: findUserById(r.userId)?.name ?? "—",
      rating: r.rating,
      contests: r.contests,
    }));
}
