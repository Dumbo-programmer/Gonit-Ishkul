"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  createClub,
  deleteClub,
  deleteClubEntry,
  getClubById,
  getClubEntryById,
  reviewClub,
  reviewClubEntry,
  setClubPublished,
  type ClubEntryInput,
  type ClubInput,
} from "@/lib/repositories/clubs";
import { createUser, findUserByEmail, updateUserRole } from "@/lib/repositories/users";
import type { ClubFormState } from "@/lib/clubForm";
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

const optionalUrl = z.string().trim().url("সঠিক লিংক দিন").optional().or(z.literal(""));
const optionalYear = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
  z.number().int().min(1900).max(2100).optional(),
);

const adminClubSchema = z.object({
  name: z.string().trim().min(2, "ক্লাবের ইংরেজি নাম দিন"),
  nameBn: z.string().trim().min(2, "ক্লাবের বাংলা নাম দিন"),
  institution: z.string().trim().min(2, "প্রতিষ্ঠানের নাম দিন"),
  district: z.string().trim().min(2, "জেলা নির্বাচন করুন"),
  about: z.string().trim().min(30, "পরিচিতি অন্তত ৩০ অক্ষরের হতে হবে"),
  aboutEn: z.string().trim().optional().or(z.literal("")),
  foundedYear: optionalYear,
  logoUrl: optionalUrl,
  website: optionalUrl,
  facebook: optionalUrl,
  contactEmail: z.string().trim().email("সঠিক ইমেইল দিন"),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  repName: z.string().trim().min(2, "প্রতিনিধির নাম দিন"),
  repEmail: z.string().trim().email("প্রতিনিধির সঠিক ইমেইল দিন"),
  repPassword: z.string().min(6, "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে"),
});

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] = issue.message;
  return errors;
}

export async function createClubWithRepAction(
  _prev: ClubFormState,
  formData: FormData,
): Promise<ClubFormState> {
  await requireAdmin();
  const parsed = adminClubSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "ফর্মে ত্রুটি আছে", errors: zodFieldErrors(parsed.error) };

  const d = parsed.data;
  if (await findUserByEmail(d.repEmail)) {
    return { ok: false, message: "এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।", errors: { repEmail: "already registered" } };
  }

  const rep = await createUser({ name: d.repName, email: d.repEmail, password: d.repPassword, role: "CLUB" });
  const club = await createClub(
    {
      name: d.name,
      nameBn: d.nameBn,
      logoUrl: d.logoUrl || undefined,
      about: d.about,
      aboutEn: d.aboutEn || undefined,
      district: d.district,
      institution: d.institution,
      foundedYear: d.foundedYear,
      website: d.website || undefined,
      facebook: d.facebook || undefined,
      contactEmail: d.contactEmail,
      contactPhone: d.contactPhone || undefined,
    } satisfies ClubInput,
    { id: rep.id, name: rep.name },
  );
  await reviewClub(club.id, "APPROVED");
  revalidateClub(club.slug);
  return {
    ok: true,
    message: `ক্লাব “${club.nameBn}” তৈরি ও প্রকাশিত হয়েছে। প্রতিনিধি ${rep.email} দিয়ে লগইন করতে পারবেন।`,
  };
}

export async function reviewClubAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("clubId") ?? "");
  const decision = String(formData.get("decision") ?? "") as ClubStatus;
  const note = String(formData.get("reviewerNote") ?? "").trim() || undefined;
  if (!id || !CLUB_DECISIONS.includes(decision)) return;

  const club = await getClubById(id);
  const updated = await reviewClub(id, decision as Extract<ClubStatus, "APPROVED" | "REJECTED" | "SUSPENDED">, note);

  if (decision === "APPROVED" && club?.representativeUserId) {
    await updateUserRole(club.representativeUserId, "CLUB");
  }
  revalidateClub(updated?.slug);
}

export async function toggleClubPublishAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("clubId") ?? "");
  const published = String(formData.get("published") ?? "") === "true";
  const updated = await setClubPublished(id, published);
  revalidateClub(updated?.slug);
}

export async function deleteClubAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("clubId") ?? "");
  await deleteClub(id);
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

  const entry = await getClubEntryById(id);
  const edits = decision === "APPROVED" ? parseEdits(formData) : undefined;
  await reviewClubEntry(id, decision as Extract<ModerationStatus, "APPROVED" | "REJECTED">, note, edits);

  const club = entry ? await getClubById(entry.clubId) : undefined;
  revalidateClub(club?.slug);
}

export async function deleteClubEntryAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("entryId") ?? "");
  const entry = await getClubEntryById(id);
  const club = entry ? await getClubById(entry.clubId) : undefined;
  await deleteClubEntry(id);
  revalidateClub(club?.slug);
}
