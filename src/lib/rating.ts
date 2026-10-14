export const DEFAULT_RATING = 1200;
export const K_FACTOR = 32;

/** Standard Elo expected score of `rating` against `opponent`. */
export function expectedScore(rating: number, opponent: number): number {
  return 1 / (1 + Math.pow(10, (opponent - rating) / 400));
}

/** Mean expected score against a field (0.5 when there are no opponents). */
export function averageExpected(rating: number, opponents: number[]): number {
  if (opponents.length === 0) return 0.5;
  const sum = opponents.reduce((acc, o) => acc + expectedScore(rating, o), 0);
  return sum / opponents.length;
}

/**
 * New rating after a contest where `actual` is the normalized result
 * (score / max score, in [0,1]) and `expected` the pre-computed expectation.
 */
export function updateRating(
  rating: number,
  actual: number,
  expected: number,
  k = K_FACTOR,
): number {
  const clampedActual = Math.max(0, Math.min(1, actual));
  return Math.round(rating + k * (clampedActual - expected));
}

export function ratingDelta(before: number, after: number): number {
  return after - before;
}

export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}
