import { describe, expect, it } from "vitest";
import type { ProblemRecord } from "@/lib/types";
import {
  gradePractice,
  matchesFilters,
  pickProblems,
  topicBreakdown,
  type PracticeConfig,
} from "@/lib/practice";

function problem(overrides: Partial<ProblemRecord> = {}): ProblemRecord {
  return {
    id: "prb_x",
    slug: "x",
    titleBn: "শিরোনাম",
    titleEn: "Title",
    statementBn: "প্রশ্ন",
    statementEn: "Statement",
    topic: "NUMBER_THEORY",
    levels: ["JUNIOR"],
    difficulty: 2,
    source: "test",
    kind: "NUMERIC",
    answer: "42",
    tolerance: 0.0001,
    basePoints: 10,
    published: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const baseConfig: PracticeConfig = {
  topics: [],
  levels: [],
  difficultyMin: 1,
  difficultyMax: 5,
  size: 10,
  timed: false,
};

describe("matchesFilters", () => {
  it("matches everything when no topic/level filters are set", () => {
    expect(matchesFilters(problem(), baseConfig)).toBe(true);
  });

  it("respects topic, level and difficulty filters", () => {
    const p = problem({ topic: "GEOMETRY", levels: ["IMO"], difficulty: 5 });
    expect(matchesFilters(p, { ...baseConfig, topics: ["GEOMETRY"] })).toBe(true);
    expect(matchesFilters(p, { ...baseConfig, topics: ["ALGEBRA"] })).toBe(false);
    expect(matchesFilters(p, { ...baseConfig, levels: ["JUNIOR"] })).toBe(false);
    expect(matchesFilters(p, { ...baseConfig, levels: ["IMO", "JUNIOR"] })).toBe(true);
    expect(matchesFilters(p, { ...baseConfig, difficultyMax: 4 })).toBe(false);
  });
});

describe("pickProblems", () => {
  it("only samples published numeric problems and caps at size", () => {
    const pool = [
      problem({ id: "a", slug: "a" }),
      problem({ id: "b", slug: "b" }),
      problem({ id: "c", slug: "c", kind: "PROOF" }),
      problem({ id: "d", slug: "d", published: false }),
    ];
    const picked = pickProblems(pool, { ...baseConfig, size: 2 }, () => 0.5);
    expect(picked).toHaveLength(2);
    expect(picked.every((p) => p.kind === "NUMERIC" && p.published)).toBe(true);
  });

  it("is deterministic with a fixed random source", () => {
    const pool = [
      problem({ id: "a", slug: "a" }),
      problem({ id: "b", slug: "b" }),
      problem({ id: "c", slug: "c" }),
    ];
    const first = pickProblems(pool, baseConfig, () => 0).map((p) => p.id);
    const second = pickProblems(pool, baseConfig, () => 0).map((p) => p.id);
    expect(first).toEqual(second);
  });
});

describe("gradePractice", () => {
  const a = problem({ id: "a", answer: "42", basePoints: 10 });
  const b = problem({ id: "b", answer: "9/2", basePoints: 12 });

  it("grades numbers within tolerance (fraction vs decimal)", () => {
    const graded = gradePractice([a, b], { a: "42", b: "4.5" });
    expect(graded.score).toBe(22);
    expect(graded.correct).toBe(2);
    expect(graded.maxScore).toBe(22);
  });

  it("counts unanswered problems as wrong but still tracks max score", () => {
    const graded = gradePractice([a], {});
    expect(graded.score).toBe(0);
    expect(graded.maxScore).toBe(10);
    expect(graded.results.a).toBe(false);
  });

  it("marks a wrong answer as incorrect", () => {
    const graded = gradePractice([a], { a: "41" });
    expect(graded.results.a).toBe(false);
    expect(graded.correct).toBe(0);
  });
});

describe("topicBreakdown", () => {
  it("groups results by topic", () => {
    const a = problem({ id: "a", topic: "ALGEBRA", basePoints: 10 });
    const b = problem({ id: "b", topic: "ALGEBRA", basePoints: 5 });
    const c = problem({ id: "c", topic: "GEOMETRY", basePoints: 8 });
    const rows = topicBreakdown([a, b, c], { a: true, b: false, c: true });
    const algebra = rows.find((r) => r.topic === "ALGEBRA");
    expect(algebra).toEqual({ topic: "ALGEBRA", total: 2, correct: 1, score: 10, maxScore: 15 });
  });
});
