export const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";
export const DEFAULT_TOLERANCE = 0.0001;

export type Verdict = "ACCEPTED" | "PARTIAL" | "WRONG";

/** Converts Bangla digits to ASCII and strips whitespace/commas/case noise. */
export function normalizeAnswer(raw: string): string {
  return raw
    .replace(/[০-৯]/g, (d) => String(BENGALI_DIGITS.indexOf(d)))
    .trim()
    .toLowerCase()
    .replace(/[\s,]/g, "");
}

/** Parses a plain number or a simple `a/b` fraction; returns null if not numeric. */
export function parseNumeric(raw: string): number | null {
  const s = normalizeAnswer(raw);
  if (!s) return null;
  const fraction = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fraction) {
    const denom = Number(fraction[2]);
    if (denom === 0) return null;
    return Number(fraction[1]) / denom;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
  return null;
}

/**
 * Judges a submitted answer against the expected one. Numbers are compared
 * within a tolerance (so `0.5` ≈ `1/2`); everything else falls back to a
 * normalized string comparison.
 */
export function answersMatch(
  expected: string,
  submitted: string,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  const a = parseNumeric(expected);
  const b = parseNumeric(submitted);
  if (a !== null && b !== null) return Math.abs(a - b) <= tolerance;
  return normalizeAnswer(expected) === normalizeAnswer(submitted);
}

export function verdictForNumeric(correct: boolean): Verdict {
  return correct ? "ACCEPTED" : "WRONG";
}

/** Points awarded for a manual verdict: full, half (partial), or none. */
export function scoreForVerdict(verdict: Verdict, basePoints: number): number {
  if (verdict === "ACCEPTED") return basePoints;
  if (verdict === "PARTIAL") return Math.round(basePoints / 2);
  return 0;
}

export function verdictFromScore(score: number, basePoints: number): Verdict {
  if (score >= basePoints) return "ACCEPTED";
  if (score > 0) return "PARTIAL";
  return "WRONG";
}
