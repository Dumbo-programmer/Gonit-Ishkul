import type { ActivityType, ActivityStatus } from "./types";

// Base points awarded per verified activity type.
export const ACTIVITY_BASE_POINTS: Record<ActivityType, number> = {
  CAMPUS_CIRCLE: 50,
  WORKSHOP: 40,
  SCHOOL_VISIT: 30,
  CONTEST_HOSTED: 60,
  ARTICLE_PUBLISHED: 45,
  SOCIAL_MEDIA: 15,
};

// Verified reach scales points, capped so a single report cannot dominate.
export const PARTICIPANT_BONUS_PER_HEAD = 0.5;
export const MAX_PARTICIPANT_BONUS = 50;

export const POINTS_PER_CONTEST_SOLVE = 12;
export const POINTS_PER_ARTICLE = 45;

export interface ActivityScoringInput {
  type: ActivityType;
  participants: number;
}

/**
 * Deterministic points calculation for a single ambassador activity report.
 * Only APPROVED reports contribute to the leaderboard.
 */
export function calculateActivityPoints(input: ActivityScoringInput): number {
  const base = ACTIVITY_BASE_POINTS[input.type] ?? 0;
  const participants = Math.max(0, Math.floor(input.participants || 0));
  const bonus = Math.min(
    participants * PARTICIPANT_BONUS_PER_HEAD,
    MAX_PARTICIPANT_BONUS,
  );
  return Math.round(base + bonus);
}

export function pointsForStatus(
  status: ActivityStatus,
  computed: number,
): number {
  return status === "APPROVED" ? computed : 0;
}

/**
 * Aggregates a leaderboard from raw point entries, returning ranked rows.
 */
export function buildLeaderboard(
  entries: { userId: string; points: number }[],
  meta: Record<string, { name: string; district: string }> = {},
) {
  const totals = new Map<string, number>();
  for (const e of entries) {
    totals.set(e.userId, (totals.get(e.userId) ?? 0) + e.points);
  }
  return [...totals.entries()]
    .map(([userId, points]) => ({
      userId,
      points,
      name: meta[userId]?.name ?? "—",
      district: meta[userId]?.district ?? "—",
    }))
    .sort((a, b) => b.points - a.points)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export const SCORING_TIERS = [
  { min: 500, bn: "ক্যাম্পাস লিজেন্ড", en: "Campus Legend" },
  { min: 300, bn: "গণিত দূত", en: "Math Envoy" },
  { min: 150, bn: "সক্রিয় দূত", en: "Active Doot" },
  { min: 0, bn: "নতুন দূত", en: "Rising Doot" },
];

export function tierForPoints(points: number) {
  return SCORING_TIERS.find((t) => points >= t.min) ?? SCORING_TIERS[3];
}
