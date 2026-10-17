import type { ProblemLevel, ProblemRecord, ProblemTopic } from "@/lib/types";
import { answersMatch } from "@/lib/judge";
import { isCategoryLevel, isCompetitionLevel } from "@/lib/arena";

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

  // Levels live on two independent axes. Within an axis a selection is an OR
  // (Junior *or* Secondary), but across axes it is an AND: picking
  // "Primary" + "BdMO Regional" means primary-grade problems from the regional
  // contest, not the union of both.
  const categories = config.levels.filter(isCategoryLevel);
  const competitions = config.levels.filter(isCompetitionLevel);

  if (categories.length > 0 && !problem.levels.some((l) => categories.includes(l))) {
    return false;
  }
  if (competitions.length > 0 && !problem.levels.some((l) => competitions.includes(l))) {
    return false;
  }

  if (problem.difficulty < config.difficultyMin) return false;
  if (problem.difficulty > config.difficultyMax) return false;
  return true;
}

/**
 * Levels on one axis that still have at least one problem once the topics,
 * difficulty range and the selections on the *other* axis are applied.
 * Used to disable chips that would only ever produce an empty result.
 */
export function availableLevelsFor(
  pool: PracticeFilterable[],
  config: PracticeFilterConfig,
  axis: "category" | "competition",
): Set<ProblemLevel> {
  const predicate = axis === "category" ? isCategoryLevel : isCompetitionLevel;
  const otherPredicate = axis === "category" ? isCompetitionLevel : isCategoryLevel;
  const otherSelections = config.levels.filter(otherPredicate);
  const available = new Set<ProblemLevel>();
  for (const problem of pool) {
    if (config.topics.length > 0 && !config.topics.includes(problem.topic)) continue;
    if (problem.difficulty < config.difficultyMin) continue;
    if (problem.difficulty > config.difficultyMax) continue;
    if (
      otherSelections.length > 0 &&
      !problem.levels.some((l) => otherPredicate(l) && otherSelections.includes(l))
    ) {
      continue;
    }
    for (const level of problem.levels) {
      if (predicate(level)) available.add(level);
    }
  }
  return available;
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
