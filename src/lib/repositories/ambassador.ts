import { getStore, persistStore, uid } from "@/lib/store";
import { calculateActivityPoints, buildLeaderboard } from "@/lib/points";
import type {
  ApplicationRecord,
  ApplicationStatus,
  ActivityRecord,
  ActivityType,
  PointSource,
} from "@/lib/types";
import { makeTrackingCode } from "@/lib/utils";

export interface ApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  district: string;
  division: string;
  studentId?: string;
  statement: string;
  resumeUrl?: string;
  shareUrl?: string;
}

export function createApplication(
  input: ApplicationInput,
  userId?: string | null,
): ApplicationRecord {
  const store = getStore();
  const now = new Date().toISOString();
  const app: ApplicationRecord = {
    id: uid("app"),
    trackingCode: makeTrackingCode(),
    ...input,
    status: "SUBMITTED",
    timeline: [{ status: "SUBMITTED", note: "আবেদন জমা হয়েছে।", createdAt: now }],
    userId: userId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  store.applications.push(app);
  persistStore(store);
  return app;
}

export function findApplicationByTrackingCode(
  trackingCode: string,
): ApplicationRecord | undefined {
  const code = trackingCode.trim().toUpperCase();
  return getStore().applications.find((a) => a.trackingCode === code);
}

export function findApplicationByEmail(
  email: string,
): ApplicationRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return getStore().applications.find((a) => a.email === normalized);
}

export function listApplications(): ApplicationRecord[] {
  return [...getStore().applications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function updateApplicationStatus(
  appId: string,
  status: ApplicationStatus,
  note?: string,
): ApplicationRecord | undefined {
  const store = getStore();
  const app = store.applications.find((a) => a.id === appId);
  if (!app) return undefined;
  const now = new Date().toISOString();
  app.status = status;
  app.reviewerNote = note;
  app.updatedAt = now;
  app.timeline.push({ status, note, createdAt: now });
  persistStore(store);
  return app;
}

export interface ActivityInput {
  ambassadorId: string;
  type: ActivityType;
  title: string;
  description: string;
  district: string;
  participants: number;
  proofUrl?: string;
}

export function reportActivity(input: ActivityInput): ActivityRecord {
  const store = getStore();
  const now = new Date().toISOString();
  const computed = calculateActivityPoints({
    type: input.type,
    participants: input.participants,
  });
  const activity: ActivityRecord = {
    id: uid("act"),
    ...input,
    points: computed,
    status: "PENDING",
    createdAt: now,
  };
  store.activities.push(activity);
  persistStore(store);
  return activity;
}

export function listActivities(ambassadorId?: string): ActivityRecord[] {
  const all = getStore().activities;
  const rows = ambassadorId
    ? all.filter((a) => a.ambassadorId === ambassadorId)
    : all;
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listApprovedActivities(): ActivityRecord[] {
  return getStore().activities.filter((a) => a.status === "APPROVED");
}

export function resolveActivity(activityId: string, approved: boolean, note?: string) {
  const store = getStore();
  const activity = store.activities.find((a) => a.id === activityId);
  if (!activity) return undefined;
  activity.status = approved ? "APPROVED" : "REJECTED";
  activity.reviewNote = note;
  if (approved && activity.points > 0) {
    store.pointEntries.push({
      id: uid("pt"),
      userId: activity.ambassadorId,
      source: "ACTIVITY",
      points: activity.points,
      reason: activity.title,
      createdAt: new Date().toISOString(),
    });
  }
  persistStore(store);
  return activity;
}

export function getLeaderboard() {
  const store = getStore();
  const meta: Record<string, { name: string; district: string }> = {};
  for (const user of store.users) {
    meta[user.id] = { name: user.name, district: getDistrict(user.id) };
  }
  const entries = store.pointEntries.map((p) => ({
    userId: p.userId,
    points: p.points,
  }));
  return buildLeaderboard(entries, meta);
}

export function getAmbassadorStats(userId: string) {
  const all = getStore().activities.filter((a) => a.ambassadorId === userId);
  const approved = all.filter((a) => a.status === "APPROVED");
  const points = getStore()
    .pointEntries.filter((p) => p.userId === userId && p.source === "ACTIVITY")
    .reduce((sum, p) => sum + p.points, 0);
  return { total: all.length, approved: approved.length, points };
}

function getDistrict(userId: string) {
  const app = getStore().applications.find((a) => a.userId === userId);
  return app?.district ?? "—";
}

export function coverageByDistrict() {
  const store = getStore();
  const districtCounts = new Map<string, number>();
  for (const app of store.applications) {
    if (app.status === "ACCEPTED") {
      districtCounts.set(app.district, (districtCounts.get(app.district) ?? 0) + 1);
    }
  }
  return districtCounts;
}

export function addPoints(
  userId: string,
  source: PointSource,
  points: number,
  reason: string,
) {
  const store = getStore();
  store.pointEntries.push({
    id: uid("pt"),
    userId,
    source,
    points,
    reason,
    createdAt: new Date().toISOString(),
  });
  persistStore(store);
}