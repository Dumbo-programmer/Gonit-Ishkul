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

export async function createApplication(
  input: ApplicationInput,
  userId?: string | null,
): Promise<ApplicationRecord> {
  const store = (await getStore());
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
  await persistStore(store);
  return app;
}

export async function findApplicationByTrackingCode(
  trackingCode: string,
): Promise<ApplicationRecord | undefined> {
  const code = trackingCode.trim().toUpperCase();
  return (await getStore()).applications.find((a) => a.trackingCode === code);
}

export async function findApplicationByEmail(
  email: string,
): Promise<ApplicationRecord | undefined> {
  const normalized = email.trim().toLowerCase();
  return (await getStore()).applications.find((a) => a.email === normalized);
}

export async function listApplications(): Promise<ApplicationRecord[]> {
  return [...(await getStore()).applications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function updateApplicationStatus(
  appId: string,
  status: ApplicationStatus,
  note?: string,
): Promise<ApplicationRecord | undefined> {
  const store = (await getStore());
  const app = store.applications.find((a) => a.id === appId);
  if (!app) return undefined;
  const now = new Date().toISOString();
  app.status = status;
  app.reviewerNote = note;
  app.updatedAt = now;
  app.timeline.push({ status, note, createdAt: now });
  await persistStore(store);
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

export async function reportActivity(input: ActivityInput): Promise<ActivityRecord> {
  const store = (await getStore());
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
  await persistStore(store);
  return activity;
}

export async function listActivities(ambassadorId?: string): Promise<ActivityRecord[]> {
  const all = (await getStore()).activities;
  const rows = ambassadorId
    ? all.filter((a) => a.ambassadorId === ambassadorId)
    : all;
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listApprovedActivities(): Promise<ActivityRecord[]> {
  return (await getStore()).activities.filter((a) => a.status === "APPROVED");
}

export async function resolveActivity(activityId: string, approved: boolean, note?: string) {
  const store = (await getStore());
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
  await persistStore(store);
  return activity;
}

export async function getLeaderboard() {
  const store = (await getStore());
  const meta: Record<string, { name: string; district: string }> = {};
  for (const user of store.users) {
    meta[user.id] = { name: user.name, district: await getDistrict(user.id) };
  }
  const entries = store.pointEntries.map((p) => ({
    userId: p.userId,
    points: p.points,
  }));
  return buildLeaderboard(entries, meta);
}

export async function getAmbassadorStats(userId: string) {
  const all = (await getStore()).activities.filter((a) => a.ambassadorId === userId);
  const approved = all.filter((a) => a.status === "APPROVED");
  const points = (await getStore())
    .pointEntries.filter((p) => p.userId === userId && p.source === "ACTIVITY")
    .reduce((sum, p) => sum + p.points, 0);
  return { total: all.length, approved: approved.length, points };
}

async function getDistrict(userId: string) {
  const app = (await getStore()).applications.find((a) => a.userId === userId);
  return app?.district ?? "—";
}

export async function coverageByDistrict() {
  const store = (await getStore());
  const districtCounts = new Map<string, number>();
  for (const app of store.applications) {
    if (app.status === "ACCEPTED") {
      districtCounts.set(app.district, (districtCounts.get(app.district) ?? 0) + 1);
    }
  }
  return districtCounts;
}

export async function addPoints(
  userId: string,
  source: PointSource,
  points: number,
  reason: string,
) {
  const store = (await getStore());
  store.pointEntries.push({
    id: uid("pt"),
    userId,
    source,
    points,
    reason,
    createdAt: new Date().toISOString(),
  });
  await persistStore(store);
}