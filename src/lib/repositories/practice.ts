import { getStore, persistStore, uid } from "@/lib/store";
import type { PracticeTestRecord, ProblemRecord } from "@/lib/types";
import {
  gradePractice,
  pickProblems,
  PRACTICE_MIN_SIZE,
  type PracticeConfig,
} from "@/lib/practice";
import { topicMeta } from "@/lib/arena";

function buildTitle(config: PracticeConfig, size: number): string {
  const label =
    config.topics.length > 0
      ? config.topics.map((t) => topicMeta(t).en).join(", ")
      : "Mixed topics";
  return `${label} — ${size} problems`;
}

export async function listPracticeTests(userId: string): Promise<PracticeTestRecord[]> {
  return (await getStore())
    .practiceTests.filter((t) => t.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((t) => ({ ...t }));
}

export async function getPracticeTest(
  id: string,
  userId: string,
): Promise<PracticeTestRecord | undefined> {
  return (await getStore()).practiceTests.find((t) => t.id === id && t.userId === userId);
}

export async function generatePracticeTest(
  userId: string,
  config: PracticeConfig,
): Promise<PracticeTestRecord> {
  const store = await getStore();
  const picked = pickProblems(store.problems, config);
  if (picked.length < Math.min(config.size, PRACTICE_MIN_SIZE)) {
    throw new Error("এই ফিল্টারে যথেষ্ট সমস্যা নেই।");
  }

  const now = new Date().toISOString();
  const record: PracticeTestRecord = {
    id: uid("ptt"),
    userId,
    title: buildTitle(config, picked.length),
    topics: config.topics,
    levels: config.levels,
    difficultyMin: config.difficultyMin,
    difficultyMax: config.difficultyMax,
    timed: config.timed,
    durationMin: config.timed ? config.durationMin : undefined,
    deadlineAt:
      config.timed && config.durationMin
        ? new Date(Date.parse(now) + config.durationMin * 60_000).toISOString()
        : undefined,
    problemIds: picked.map((p) => p.id),
    startedAt: now,
    answers: {},
    score: 0,
    maxScore: picked.reduce((sum, p) => sum + p.basePoints, 0),
    results: {},
    createdAt: now,
  };

  store.practiceTests.push(record);
  await persistStore(store);
  return record;
}

function isExpired(test: PracticeTestRecord): boolean {
  return Boolean(test.deadlineAt && Date.now() > Date.parse(test.deadlineAt));
}

export async function savePracticeAnswer(
  testId: string,
  userId: string,
  problemId: string,
  answer: string,
): Promise<{ ok: boolean; locked?: boolean }> {
  const store = await getStore();
  const test = store.practiceTests.find((t) => t.id === testId && t.userId === userId);
  if (!test || test.submittedAt || isExpired(test)) return { ok: false, locked: true };
  test.answers[problemId] = answer;
  await persistStore(store);
  return { ok: true };
}

export async function submitPracticeTest(
  id: string,
  userId: string,
  answers?: Record<string, string>,
): Promise<PracticeTestRecord | undefined> {
  const store = await getStore();
  const record = store.practiceTests.find((t) => t.id === id && t.userId === userId);
  if (!record || record.submittedAt) return record;

  if (answers) {
    for (const [problemId, value] of Object.entries(answers)) {
      record.answers[problemId] = value;
    }
  }

  const problems: ProblemRecord[] = record.problemIds
    .map((pid) => store.problems.find((p) => p.id === pid))
    .filter((p): p is ProblemRecord => Boolean(p));

  const graded = gradePractice(problems, record.answers);
  record.score = graded.score;
  record.maxScore = graded.maxScore;
  record.results = graded.results;
  record.submittedAt = new Date().toISOString();
  await persistStore(store);
  return record;
}

export async function deletePracticeTest(id: string, userId: string): Promise<void> {
  const store = await getStore();
  store.practiceTests = store.practiceTests.filter(
    (t) => !(t.id === id && t.userId === userId),
  );
  await persistStore(store);
}
