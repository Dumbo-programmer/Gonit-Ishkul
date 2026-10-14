import type { CourseCategory, CourseLevel, QuizQuestion } from "@/lib/types";

export interface QuizState {
  ok: boolean;
  message?: string;
  correct?: number;
  total?: number;
  percent?: number;
  passed?: boolean;
  results?: (boolean | null)[];
}

export const INITIAL_QUIZ_STATE: QuizState = { ok: false };

export interface ProgressEntry {
  watchedSec: number;
  completed: boolean;
  quizPassed: boolean;
}

export type ProgressMap = Record<string, ProgressEntry>;

export interface LearningLecture {
  id: string;
  order: number;
  durationSec: number;
}

/** Completion threshold: 90% of the lecture watched counts as "seen". */
export const WATCH_COMPLETE_RATIO = 0.9;

export const LEVELS: { value: CourseLevel; bn: string; en: string; tint: string }[] = [
  { value: "PRIMARY", bn: "প্রাথমিক", en: "Primary", tint: "#FF781E" },
  { value: "JUNIOR", bn: "জুনিয়র", en: "Junior", tint: "#7952B3" },
  { value: "SECONDARY", bn: "সেকেন্ডারি", en: "Secondary", tint: "#1B4594" },
  { value: "HIGHER_SECONDARY", bn: "উচ্চ মাধ্যমিক", en: "Higher Secondary", tint: "#0EA5A5" },
  { value: "BDMO_PREP", bn: "বিডিএমও প্রস্তুতি", en: "BdMO Prep", tint: "#ED1C24" },
];

export function levelMeta(level: CourseLevel) {
  return LEVELS.find((l) => l.value === level) ?? LEVELS[0];
}

export const COURSE_CATEGORIES: {
  value: CourseCategory;
  bn: string;
  en: string;
  tint: string;
}[] = [
  { value: "TRIVIA", bn: "ট্রিভিয়া ভিডিও", en: "Trivia Videos", tint: "#FF781E" },
  { value: "SOLUTIONS", bn: "সমস্যা সমাধান", en: "Problem Solutions", tint: "#7952B3" },
  { value: "MO_TRAINING", bn: "MO প্রশিক্ষণ", en: "MO Training", tint: "#1B4594" },
  { value: "ARTICLE_WRITING", bn: "আর্টিকেল রাইটিং", en: "Article Writing", tint: "#0EA5A5" },
];

export function courseCategoryMeta(category: CourseCategory) {
  return COURSE_CATEGORIES.find((c) => c.value === category) ?? COURSE_CATEGORIES[0];
}

export function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function isWatchedComplete(watchedSec: number, durationSec: number): boolean {
  if (durationSec <= 0) return false;
  return watchedSec / durationSec >= WATCH_COMPLETE_RATIO;
}

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: (number | null | undefined)[],
  passPercent: number,
): { correct: number; total: number; percent: number; passed: boolean } {
  const total = questions.length;
  let correct = 0;
  questions.forEach((question, i) => {
    if (answers[i] === question.answerIndex) correct += 1;
  });
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent, passed: percent >= passPercent };
}

export function computeCourseProgress(
  lectures: LearningLecture[],
  progress: ProgressMap,
): { completed: number; total: number; percent: number; watchedSec: number } {
  const total = lectures.length;
  let completed = 0;
  let watchedSec = 0;
  for (const lecture of lectures) {
    const p = progress[lecture.id];
    if (p?.completed) completed += 1;
    if (p?.watchedSec) watchedSec += Math.min(p.watchedSec, lecture.durationSec);
  }
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent, watchedSec };
}

/**
 * Sequential gating: the first lecture is always open; every later lecture
 * unlocks only after the previous one is watched AND its quiz is passed.
 * When `quizzedLectureIds` is provided, a lecture without a quiz only needs
 * to be watched (so instructor-created lectures stay usable before a quiz is added).
 */
export function isLectureUnlocked(
  lectures: LearningLecture[],
  progress: ProgressMap,
  index: number,
  quizzedLectureIds?: Set<string>,
): boolean {
  if (index <= 0) return true;
  const prev = lectures[index - 1];
  const p = progress[prev.id];
  if (!p?.completed) return false;
  return quizSatisfied(prev.id, progress, quizzedLectureIds);
}

function quizSatisfied(
  lectureId: string,
  progress: ProgressMap,
  quizzedLectureIds?: Set<string>,
): boolean {
  const p = progress[lectureId];
  if (!p) return false;
  if (quizzedLectureIds && !quizzedLectureIds.has(lectureId)) return true;
  return p.quizPassed;
}

export function lectureStatus(
  lectures: LearningLecture[],
  progress: ProgressMap,
  index: number,
  quizzedLectureIds?: Set<string>,
): "locked" | "available" | "in_progress" | "completed" {
  if (!isLectureUnlocked(lectures, progress, index, quizzedLectureIds)) return "locked";
  const p = progress[lectures[index].id];
  if (p?.completed && quizSatisfied(lectures[index].id, progress, quizzedLectureIds)) {
    return "completed";
  }
  if (p && (p.watchedSec > 0 || p.completed)) return "in_progress";
  return "available";
}

export function firstUnlockedIncomplete(
  lectures: LearningLecture[],
  progress: ProgressMap,
  quizzedLectureIds?: Set<string>,
): string | undefined {
  for (let i = 0; i < lectures.length; i += 1) {
    if (!isLectureUnlocked(lectures, progress, i, quizzedLectureIds)) break;
    const p = progress[lectures[i].id];
    if (!(p?.completed && quizSatisfied(lectures[i].id, progress, quizzedLectureIds))) {
      return lectures[i].id;
    }
  }
  return lectures[lectures.length - 1]?.id;
}
