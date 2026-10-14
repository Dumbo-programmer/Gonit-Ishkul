import { describe, expect, it } from "vitest";
import {
  averageExpected,
  expectedScore,
  formatDelta,
  ratingDelta,
  updateRating,
} from "@/lib/rating";

describe("expectedScore", () => {
  it("is 0.5 for equal ratings", () => {
    expect(expectedScore(1200, 1200)).toBe(0.5);
  });

  it("favours the higher-rated player", () => {
    expect(expectedScore(1400, 1200)).toBeGreaterThan(0.5);
    expect(expectedScore(1000, 1200)).toBeLessThan(0.5);
  });
});

describe("averageExpected", () => {
  it("uses 0.5 for an empty field", () => {
    expect(averageExpected(1200, [])).toBe(0.5);
  });

  it("averages across opponents", () => {
    const value = averageExpected(1200, [1200, 1200]);
    expect(value).toBeCloseTo(0.5, 5);
  });
});

describe("updateRating", () => {
  it("gains points for beating expectation", () => {
    expect(updateRating(1200, 1, 0.5, 32)).toBe(1216);
  });

  it("loses points for missing expectation", () => {
    expect(updateRating(1200, 0, 0.5, 32)).toBe(1184);
  });

  it("clamps actual into [0,1]", () => {
    expect(updateRating(1200, 2, 0.5, 32)).toBe(1216);
    expect(updateRating(1200, -1, 0.5, 32)).toBe(1184);
  });
});

describe("ratingDelta / formatDelta", () => {
  it("computes and formats deltas", () => {
    expect(ratingDelta(1200, 1216)).toBe(16);
    expect(formatDelta(16)).toBe("+16");
    expect(formatDelta(-16)).toBe("-16");
    expect(formatDelta(0)).toBe("0");
  });
});
