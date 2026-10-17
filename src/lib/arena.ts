import type { ContestRecord, ProblemLevel, ProblemTopic } from "@/lib/types";

export interface AnswerState {
  ok: boolean;
  correct?: boolean;
  message?: string;
}

export const INITIAL_ANSWER_STATE: AnswerState = { ok: false };

export interface PuzzleState {
  ok: boolean;
  correct?: boolean;
  message?: string;
}

export const INITIAL_PUZZLE_STATE: PuzzleState = { ok: false };

export const PROBLEM_TOPICS: {
  value: ProblemTopic;
  bn: string;
  en: string;
  tint: string;
}[] = [
  { value: "NUMBER_THEORY", bn: "সংখ্যাতত্ত্ব", en: "Number Theory", tint: "#FF781E" },
  { value: "GEOMETRY", bn: "জ্যামিতি", en: "Geometry", tint: "#1B4594" },
  { value: "COMBINATORICS", bn: "সমাবেশ", en: "Combinatorics", tint: "#7952B3" },
  { value: "ALGEBRA", bn: "বীজগণিত", en: "Algebra", tint: "#0EA5A5" },
  { value: "PROOFS", bn: "প্রমাণ", en: "Proofs", tint: "#ED1C24" },
];

export interface ProblemLevelMeta {
  value: ProblemLevel;
  bn: string;
  en: string;
}

/**
 * "Category" answers *who* the problem is for (school class band).
 * "Competition" answers *where* it came from (contest tier).
 *
 * They are independent dimensions: a BdMO Regional problem aimed at primary
 * students carries both `PRIMARY` (category) and `BDMO_REGIONAL` (competition).
 */
export const PROBLEM_CATEGORIES: ProblemLevelMeta[] = [
  { value: "PRIMARY", bn: "প্রাথমিক", en: "Primary" },
  { value: "JUNIOR", bn: "জুনিয়র", en: "Junior" },
  { value: "SECONDARY", bn: "সেকেন্ডারি", en: "Secondary" },
  { value: "HIGHER_SECONDARY", bn: "উচ্চ মাধ্যমিক", en: "Higher Secondary" },
];

export const PROBLEM_COMPETITIONS: ProblemLevelMeta[] = [
  { value: "BDMO_REGIONAL", bn: "BdMO আঞ্চলিক", en: "BdMO Regional" },
  { value: "BDMO_NATIONAL", bn: "BdMO জাতীয়", en: "BdMO National" },
  { value: "IMO", bn: "IMO", en: "IMO" },
];

export const PROBLEM_LEVELS: ProblemLevelMeta[] = [
  ...PROBLEM_CATEGORIES,
  ...PROBLEM_COMPETITIONS,
];

const CATEGORY_VALUES = new Set<ProblemLevel>(PROBLEM_CATEGORIES.map((c) => c.value));
const COMPETITION_VALUES = new Set<ProblemLevel>(PROBLEM_COMPETITIONS.map((c) => c.value));

export function isCategoryLevel(level: ProblemLevel): boolean {
  return CATEGORY_VALUES.has(level);
}

export function isCompetitionLevel(level: ProblemLevel): boolean {
  return COMPETITION_VALUES.has(level);
}

export function categoryMeta(level: ProblemLevel) {
  return PROBLEM_CATEGORIES.find((c) => c.value === level);
}

export function competitionMeta(level: ProblemLevel) {
  return PROBLEM_COMPETITIONS.find((c) => c.value === level);
}

export function topicMeta(topic: ProblemTopic) {
  return PROBLEM_TOPICS.find((t) => t.value === topic) ?? PROBLEM_TOPICS[0];
}

export function levelLabel(level: ProblemLevel) {
  return PROBLEM_LEVELS.find((l) => l.value === level) ?? PROBLEM_LEVELS[1];
}

const DIFFICULTY_LABELS: Record<"bn" | "en", string[]> = {
  bn: ["", "সহজ", "মধ্যম", "কঠিন", "খুব কঠিন", "অলিম্পিয়াড"],
  en: ["", "Easy", "Medium", "Hard", "Very Hard", "Olympiad"],
};

export function difficultyLabel(n: number, lang: "bn" | "en" = "bn") {
  const index = Math.max(0, Math.min(5, Math.round(n)));
  return DIFFICULTY_LABELS[lang][index] ?? "";
}

export type ContestPhase = "upcoming" | "live" | "ended";

export function contestPhase(contest: ContestRecord, now: number = Date.now()): ContestPhase {
  const start = Date.parse(contest.startAt);
  const end = Date.parse(contest.endAt);
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "live";
}

/** Per-participant deadline: capped by contest end and the contest duration. */
export function deadlineFor(contest: ContestRecord, startedAtIso: string): number {
  const end = Date.parse(contest.endAt);
  const started = Date.parse(startedAtIso);
  return Math.min(end, started + contest.durationMin * 60_000);
}

export function maxContestScore(problemPoints: number[]): number {
  return problemPoints.reduce((sum, p) => sum + p, 0);
}
