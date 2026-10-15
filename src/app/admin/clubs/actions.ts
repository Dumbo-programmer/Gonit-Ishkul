"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  deleteClub,
  deleteClubEntry,
  getClubById,
  getClubEntryById,
  reviewClub,
  reviewClubEntry,
  setClubPublished,
  type ClubEntryInput,
} from "@/lib/repositories/clubs";
import { updateUserRole } from "@/lib/repositories/users";
import type {
  ClubEntryType,
  ClubStatus,
  ModerationStatus,
  ProblemLevel,
  ProblemTopic,
} from "@/lib/types";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "admin.all")) {
    redirect("/auth/signin?callbackUrl=/admin/clubs");
  }
  return session;
}

function revalidateClub(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/clubs");
  revalidatePath("/clubs");
  revalidatePath("/clubs/dashboard");
  if (slug) revalidatePath(`/clubs/${slug}`);
}

const CLUB_DECISIONS: ClubStatus[] = ["APPROVED", "REJECTED", "SUSPENDED"];

export async function reviewClubAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("clubId") ?? "");
  const decision = String(formData.get("decision") ?? "") as ClubStatus;
  const note = String(formData.get("reviewerNote") ?? "").trim() || undefined;
  if (!id || !CLUB_DECISIONS.includes(decision)) return;

  const club = getClubById(id);
  const updated = reviewClub(id, decision as Extract<ClubStatus, "APPROVED" | "REJECTED" | "SUSPENDED">, note);

  if (decision === "APPROVED" && club?.representativeUserId) {
    updateUserRole(club.representativeUserId, "CLUB");
  }
  revalidateClub(updated?.slug);
}

export async function toggleClubPublishAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("clubId") ?? "");
  const published = String(formData.get("published") ?? "") === "true";
  const updated = setClubPublished(id, published);
  revalidateClub(updated?.slug);
}

export async function deleteClubAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("clubId") ?? "");
  deleteClub(id);
  revalidatePath("/admin/clubs");
  revalidatePath("/clubs");
  redirect("/admin/clubs");
}

const ENTRY_DECISIONS: ModerationStatus[] = ["APPROVED", "REJECTED"];

function parseEdits(formData: FormData): Partial<ClubEntryInput> {
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const edits: Partial<ClubEntryInput> = {};
  const title = str("title");
  const body = str("body");
  if (title) edits.title = title;
  if (body) edits.body = body;
  const summary = str("summary");
  edits.summary = summary || undefined;
  const type = str("type") as ClubEntryType;
  if (type) edits.type = type;
  const topic = str("topic") as ProblemTopic;
  edits.topic = topic ? topic : undefined;
  const level = str("level") as ProblemLevel;
  edits.level = level ? level : undefined;
  const difficulty = Number(str("difficulty"));
  if (Number.isFinite(difficulty) && difficulty > 0) edits.difficulty = difficulty;
  edits.answer = str("answer") || undefined;
  edits.eventDate = str("eventDate") || undefined;
  edits.location = str("location") || undefined;
  const tags = str("tags");
  edits.tags = tags
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  return edits;
}

export async function reviewClubEntryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("entryId") ?? "");
  const decision = String(formData.get("decision") ?? "") as ModerationStatus;
  const note = String(formData.get("reviewerNote") ?? "").trim() || undefined;
  if (!id || !ENTRY_DECISIONS.includes(decision)) return;

  const entry = getClubEntryById(id);
  const edits = decision === "APPROVED" ? parseEdits(formData) : undefined;
  reviewClubEntry(id, decision as Extract<ModerationStatus, "APPROVED" | "REJECTED">, note, edits);

  const club = entry ? getClubById(entry.clubId) : undefined;
  revalidateClub(club?.slug);
}

export async function deleteClubEntryAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("entryId") ?? "");
  const entry = getClubEntryById(id);
  const club = entry ? getClubById(entry.clubId) : undefined;
  deleteClubEntry(id);
  revalidateClub(club?.slug);
}
