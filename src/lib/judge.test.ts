import { describe, expect, it } from "vitest";
import {
  answersMatch,
  normalizeAnswer,
  parseNumeric,
  scoreForVerdict,
  verdictForNumeric,
  verdictFromScore,
} from "@/lib/judge";

describe("normalizeAnswer", () => {
  it("converts Bangla digits and strips noise", () => {
    expect(normalizeAnswer(" ৫০৫০ ")).toBe("5050");
    expect(normalizeAnswer("5,050")).toBe("5050");
    expect(normalizeAnswer("A B")).toBe("ab");
  });
});

describe("parseNumeric", () => {
  it("parses integers and decimals", () => {
    expect(parseNumeric("5050")).toBe(5050);
    expect(parseNumeric("12.0")).toBe(12);
    expect(parseNumeric("-3")).toBe(-3);
  });

  it("parses simple fractions", () => {
    expect(parseNumeric("1/2")).toBe(0.5);
    expect(parseNumeric("3/4")).toBe(0.75);
  });

  it("returns null for non-numeric and zero denominators", () => {
    expect(parseNumeric("abc")).toBeNull();
    expect(parseNumeric("1/0")).toBeNull();
    expect(parseNumeric("")).toBeNull();
  });
});

describe("answersMatch", () => {
  it("matches equivalent numbers within tolerance", () => {
    expect(answersMatch("5050", "5,050")).toBe(true);
    expect(answersMatch("0.5", "1/2")).toBe(true);
    expect(answersMatch("12", "12.0")).toBe(true);
    expect(answersMatch("12", "13")).toBe(false);
  });

  it("falls back to normalized string comparison", () => {
    expect(answersMatch("Yes", "yes")).toBe(true);
    expect(answersMatch("Euclid", "euclid.")).toBe(false);
  });
});

describe("verdict helpers", () => {
  it("maps correctness to a verdict", () => {
    expect(verdictForNumeric(true)).toBe("ACCEPTED");
    expect(verdictForNumeric(false)).toBe("WRONG");
  });

  it("scores full, half and zero", () => {
    expect(scoreForVerdict("ACCEPTED", 20)).toBe(20);
    expect(scoreForVerdict("PARTIAL", 20)).toBe(10);
    expect(scoreForVerdict("WRONG", 20)).toBe(0);
  });

  it("derives a verdict from a score", () => {
    expect(verdictFromScore(20, 20)).toBe("ACCEPTED");
    expect(verdictFromScore(10, 20)).toBe("PARTIAL");
    expect(verdictFromScore(0, 20)).toBe("WRONG");
  });
});
