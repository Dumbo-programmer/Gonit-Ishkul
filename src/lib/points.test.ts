import { describe, expect, it } from "vitest";
import {
  ACTIVITY_BASE_POINTS,
  MAX_PARTICIPANT_BONUS,
  buildLeaderboard,
  calculateActivityPoints,
  pointsForStatus,
  tierForPoints,
} from "@/lib/points";

describe("calculateActivityPoints", () => {
  it("returns base points with zero participants", () => {
    expect(calculateActivityPoints({ type: "CAMPUS_CIRCLE", participants: 0 })).toBe(
      ACTIVITY_BASE_POINTS.CAMPUS_CIRCLE,
    );
  });

  it("adds participant bonus", () => {
    expect(calculateActivityPoints({ type: "WORKSHOP", participants: 20 })).toBe(
      ACTIVITY_BASE_POINTS.WORKSHOP + 10,
    );
  });

  it("caps the participant bonus", () => {
    const huge = calculateActivityPoints({ type: "SCHOOL_VISIT", participants: 100000 });
    expect(huge).toBe(ACTIVITY_BASE_POINTS.SCHOOL_VISIT + MAX_PARTICIPANT_BONUS);
  });

  it("ignores negative participant counts", () => {
    expect(calculateActivityPoints({ type: "SOCIAL_MEDIA", participants: -5 })).toBe(
      ACTIVITY_BASE_POINTS.SOCIAL_MEDIA,
    );
  });
});

describe("pointsForStatus", () => {
  it("awards points only when approved", () => {
    expect(pointsForStatus("APPROVED", 60)).toBe(60);
    expect(pointsForStatus("PENDING", 60)).toBe(0);
    expect(pointsForStatus("REJECTED", 60)).toBe(0);
  });
});

describe("buildLeaderboard", () => {
  it("aggregates per user and sorts descending with ranks", () => {
    const rows = buildLeaderboard(
      [
        { userId: "a", points: 50 },
        { userId: "b", points: 120 },
        { userId: "a", points: 30 },
      ],
      { a: { name: "A", district: "Dhaka" }, b: { name: "B", district: "Sylhet" } },
    );
    expect(rows[0]).toMatchObject({ userId: "b", points: 120, rank: 1 });
    expect(rows[1]).toMatchObject({ userId: "a", points: 80, rank: 2 });
  });
});

describe("tierForPoints", () => {
  it("maps points to the correct tier", () => {
    expect(tierForPoints(600).en).toBe("Campus Legend");
    expect(tierForPoints(320).en).toBe("Math Envoy");
    expect(tierForPoints(160).en).toBe("Active Doot");
    expect(tierForPoints(10).en).toBe("Rising Doot");
  });
});