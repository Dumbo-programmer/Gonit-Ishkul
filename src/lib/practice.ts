import type { ProblemLevel, ProblemRecord, ProblemTopic } from "@/lib/types";
import { answersMatch } from "@/lib/judge";

export interface PracticeConfig {
  topics: ProblemTopic[];
  levels: ProblemLevel[];
  difficultyMin: number;
  difficultyMax: number;
  size: number;
  timed: boolean;
  durationMin?: number;
}

export const PRACTICE_MIN_SIZE = 3;
export const PRACTICE_MAX_SIZE = 25;
export const PRACTICE_DEFAULT_SIZE = 10;
export const PRACTICE_DURATIONS = [15, 30, 45, 60, 90, 120];

/** The subset of a problem needed to apply the topic/level/difficulty filters. */
export interface PracticeFilterable {
  topic: ProblemTopic;
  levels: ProblemLevel[];
  difficulty: number;
}

export type PracticeFilterConfig = Pick<
  PracticeConfig,
  "topics" | "levels" | "difficultyMin" | "difficultyMax"
>;

export function matchesFilters(
  problem: PracticeFilterable,
  config: PracticeFilterConfig,
): boolean {
  if (config.topics.length > 0 && !config.topics.includes(problem.topic)) return false;
  if (config.levels.length > 0 && !problem.levels.some((l) => config.levels.includes(l))) {
    return false;
  }
  if (problem.difficulty < config.difficultyMin) return false;
  if (problem.difficulty > config.difficultyMax) return false;
  return true;
}

/** Numeric-only, published problems matching the chosen topic/level/difficulty filters. */
export function isEligible(problem: ProblemRecord, config: PracticeConfig): boolean {
  if (!problem.published) return false;
  if (problem.kind !== "NUMERIC") return false;
  return matchesFilters(problem, config);
}

export function eligibleProblems(
  problems: ProblemRecord[],
  config: PracticeConfig,
): ProblemRecord[] {
  return problems.filter((p) => isEligible(p, config));
}

/** Fisher–Yates shuffle; accepts a `random` source so it stays testable. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Randomly picks up to `config.size` eligible problems. */
export function pickProblems(
  problems: ProblemRecord[],
  config: PracticeConfig,
  random: () => number = Math.random,
): ProblemRecord[] {
  const pool = eligibleProblems(problems, config);
  const size = Math.max(0, Math.min(config.size, pool.length));
  return shuffle(pool, random).slice(0, size);
}

export interface PracticeGrade {
  score: number;
  maxScore: number;
  results: Record<string, boolean>;
  correct: number;
}

/** Auto-grades a numeric practice attempt. Unanswered problems count as wrong. */
export function gradePractice(
  problems: ProblemRecord[],
  answers: Record<string, string>,
): PracticeGrade {
  const results: Record<string, boolean> = {};
  let score = 0;
  let maxScore = 0;
  let correct = 0;
  for (const problem of problems) {
    maxScore += problem.basePoints;
    const answer = answers[problem.id] ?? "";
    const ok =
      answer.trim().length > 0 &&
      answersMatch(problem.answer ?? "", answer, problem.tolerance);
    results[problem.id] = ok;
    if (ok) {
      score += problem.basePoints;
      correct += 1;
    }
  }
  return { score, maxScore, results, correct };
}

export interface PracticeTopicStat {
  topic: ProblemTopic;
  total: number;
  correct: number;
  score: number;
  maxScore: number;
}

export function topicBreakdown(
  problems: ProblemRecord[],
  results: Record<string, boolean>,
): PracticeTopicStat[] {
  const map = new Map<ProblemTopic, PracticeTopicStat>();
  for (const problem of problems) {
    let stat = map.get(problem.topic);
    if (!stat) {
      stat = { topic: problem.topic, total: 0, correct: 0, score: 0, maxScore: 0 };
      map.set(problem.topic, stat);
    }
    stat.total += 1;
    stat.maxScore += problem.basePoints;
    if (results[problem.id]) {
      stat.correct += 1;
      stat.score += problem.basePoints;
    }
  }
  return [...map.values()];
}
