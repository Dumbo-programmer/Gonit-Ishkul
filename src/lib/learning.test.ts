import { describe, expect, it } from "vitest";
import {
  computeCourseProgress,
  firstUnlockedIncomplete,
  formatDuration,
  gradeQuiz,
  isLectureUnlocked,
  isWatchedComplete,
  lectureStatus,
  type ProgressMap,
} from "@/lib/learning";
import type { QuizQuestion } from "@/lib/types";

const lectures = [
  { id: "l1", order: 1, durationSec: 100 },
  { id: "l2", order: 2, durationSec: 200 },
  { id: "l3", order: 3, durationSec: 300 },
];

const questions: QuizQuestion[] = [
  {
    id: "q1",
    promptBn: "১",
    promptEn: "1",
    options: [
      { bn: "a", en: "a" },
      { bn: "b", en: "b" },
    ],
    answerIndex: 1,
  },
  {
    id: "q2",
    promptBn: "২",
    promptEn: "2",
    options: [
      { bn: "a", en: "a" },
      { bn: "b", en: "b" },
    ],
    answerIndex: 0,
  },
];

describe("formatDuration", () => {
  it("formats minutes and seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
  });

  it("formats hours", () => {
    expect(formatDuration(3725)).toBe("1:02:05");
  });
});

describe("isWatchedComplete", () => {
  it("uses the 90% threshold", () => {
    expect(isWatchedComplete(90, 100)).toBe(true);
    expect(isWatchedComplete(89, 100)).toBe(false);
    expect(isWatchedComplete(5, 0)).toBe(false);
  });
});

describe("gradeQuiz", () => {
  it("passes when the score meets the threshold", () => {
    expect(gradeQuiz(questions, [1, 0], 60)).toEqual({
      correct: 2,
      total: 2,
      percent: 100,
      passed: true,
    });
  });

  it("fails on partial answers", () => {
    const result = gradeQuiz(questions, [0, 0], 60);
    expect(result.correct).toBe(1);
    expect(result.percent).toBe(50);
    expect(result.passed).toBe(false);
  });

  it("treats null answers as incorrect", () => {
    expect(gradeQuiz(questions, [null, null], 50).correct).toBe(0);
  });
});

describe("computeCourseProgress", () => {
  it("aggregates completed lectures and clamps watched time", () => {
    const progress: ProgressMap = {
      l1: { watchedSec: 999, completed: true, quizPassed: true },
      l2: { watchedSec: 100, completed: false, quizPassed: false },
    };
    const result = computeCourseProgress(lectures, progress);
    expect(result.completed).toBe(1);
    expect(result.total).toBe(3);
    expect(result.percent).toBe(33);
    expect(result.watchedSec).toBe(200);
  });

  it("is zero with no progress", () => {
    expect(computeCourseProgress(lectures, {}).percent).toBe(0);
  });
});

describe("isLectureUnlocked", () => {
  it("always unlocks the first lecture", () => {
    expect(isLectureUnlocked(lectures, {}, 0)).toBe(true);
  });

  it("locks later lectures until the previous one is done", () => {
    expect(isLectureUnlocked(lectures, {}, 1)).toBe(false);
    const progress: ProgressMap = {
      l1: { watchedSec: 100, completed: true, quizPassed: true },
    };
    expect(isLectureUnlocked(lectures, progress, 1)).toBe(true);
    expect(isLectureUnlocked(lectures, progress, 2)).toBe(false);
  });

  it("requires the quiz to pass, not just completion", () => {
    const progress: ProgressMap = {
      l1: { watchedSec: 100, completed: true, quizPassed: false },
    };
    expect(isLectureUnlocked(lectures, progress, 1)).toBe(false);
  });

  it("waives the quiz requirement for lectures without a quiz", () => {
    const progress: ProgressMap = {
      l1: { watchedSec: 100, completed: true, quizPassed: false },
    };
    const quizzed = new Set<string>();
    expect(isLectureUnlocked(lectures, progress, 1, quizzed)).toBe(true);
    expect(lectureStatus(lectures, progress, 0, quizzed)).toBe("completed");
    expect(firstUnlockedIncomplete(lectures, progress, quizzed)).toBe("l2");
  });
});

describe("lectureStatus", () => {
  it("distinguishes locked, available, in_progress and completed", () => {
    expect(lectureStatus(lectures, {}, 0)).toBe("available");
    expect(lectureStatus(lectures, {}, 1)).toBe("locked");
    const progress: ProgressMap = {
      l1: { watchedSec: 40, completed: false, quizPassed: false },
    };
    expect(lectureStatus(lectures, progress, 0)).toBe("in_progress");
    const done: ProgressMap = {
      l1: { watchedSec: 100, completed: true, quizPassed: true },
    };
    expect(lectureStatus(lectures, done, 0)).toBe("completed");
  });
});

describe("firstUnlockedIncomplete", () => {
  it("returns the first lecture needing attention", () => {
    expect(firstUnlockedIncomplete(lectures, {})).toBe("l1");
    const progress: ProgressMap = {
      l1: { watchedSec: 100, completed: true, quizPassed: true },
    };
    expect(firstUnlockedIncomplete(lectures, progress)).toBe("l2");
  });
});
