"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  createClubEntry,
  deleteClubEntry,
  getClubById,
  updateClub,
  updateClubEntry,
  type ClubEntryInput,
  type ClubInput,
} from "@/lib/repositories/clubs";
import type { ClubEntryType, ProblemLevel, ProblemTopic } from "@/lib/types";
import type { ClubFormState } from "@/lib/clubForm";

const optionalUrl = z.string().trim().url("সঠিক লিংক দিন").optional().or(z.literal(""));

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(min).max(max).optional(),
  );

const clubSchema = z.object({
  name: z.string().trim().min(2, "ক্লাবের ইংরেজি নাম দিন"),
  nameBn: z.string().trim().min(2, "ক্লাবের বাংলা নাম দিন"),
  institution: z.string().trim().min(2, "প্রতিষ্ঠানের নাম দিন"),
  district: z.string().trim().min(2, "জেলা নির্বাচন করুন"),
  about: z.string().trim().min(30, "পরিচিতি অন্তত ৩০ অক্ষরের হতে হবে"),
  aboutEn: z.string().trim().optional().or(z.literal("")),
  foundedYear: optionalInt(1900, 2100),
  logoUrl: optionalUrl,
  website: optionalUrl,
  facebook: optionalUrl,
  contactEmail: z.string().trim().email("সঠিক ইমেইল দিন"),
  contactPhone: z.string().trim().optional().or(z.literal("")),
});

const ENTRY_TYPES = ["PROBLEM", "NOTE", "ARTICLE", "EVENT"] as const;
const TOPICS = [
  "NUMBER_THEORY",
  "GEOMETRY",
  "COMBINATORICS",
  "ALGEBRA",
  "PROOFS",
] as const;
const LEVELS = [
  "PRIMARY",
  "JUNIOR",
  "SECONDARY",
  "HIGHER_SECONDARY",
  "BDMO_REGIONAL",
  "BDMO_NATIONAL",
  "IMO",
] as const;

const entrySchema = z.object({
  clubId: z.string().trim().min(1),
  type: z.enum(ENTRY_TYPES),
  title: z.string().trim().min(4, "শিরোনাম অন্তত ৪ অক্ষরের হতে হবে"),
  summary: z.string().trim().optional().or(z.literal("")),
  body: z.string().trim().min(20, "বিবরণ অন্তত ২০ অক্ষরের হতে হবে"),
  topic: z.enum(TOPICS).optional().or(z.literal("")),
  level: z.enum(LEVELS).optional().or(z.literal("")),
  difficulty: optionalInt(1, 5),
  answer: z.string().trim().optional().or(z.literal("")),
  eventDate: z.string().trim().optional().or(z.literal("")),
  location: z.string().trim().optional().or(z.literal("")),
  linkUrl: optionalUrl,
  imageUrl: optionalUrl,
  tags: z.string().trim().optional().or(z.literal("")),
});

function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] = issue.message;
  return errors;
}

function parseClub(formData: FormData): { data?: ClubInput; errors?: Record<string, string> } {
  const parsed = clubSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  return {
    data: {
      name: parsed.data.name,
      nameBn: parsed.data.nameBn,
      logoUrl: parsed.data.logoUrl || undefined,
      about: parsed.data.about,
      aboutEn: parsed.data.aboutEn || undefined,
      district: parsed.data.district,
      institution: parsed.data.institution,
      foundedYear: parsed.data.foundedYear,
      website: parsed.data.website || undefined,
      facebook: parsed.data.facebook || undefined,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone || undefined,
    },
  };
}

function parseEntry(formData: FormData): { data?: ClubEntryInput; errors?: Record<string, string> } {
  const parsed = entrySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  return {
    data: {
      clubId: parsed.data.clubId,
      type: parsed.data.type as ClubEntryType,
      title: parsed.data.title,
      summary: parsed.data.summary || undefined,
      body: parsed.data.body,
      topic: (parsed.data.topic || undefined) as ProblemTopic | undefined,
      level: (parsed.data.level || undefined) as ProblemLevel | undefined,
      difficulty: parsed.data.difficulty,
      answer: parsed.data.answer || undefined,
      eventDate: parsed.data.eventDate || undefined,
      location: parsed.data.location || undefined,
      linkUrl: parsed.data.linkUrl || undefined,
      imageUrl: parsed.data.imageUrl || undefined,
      tags: (parsed.data.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    },
  };
}

export async function updateClubProfileAction(
  _prev: ClubFormState,
  formData: FormData,
): Promise<ClubFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const clubId = String(formData.get("clubId") ?? "");
  const club = await getClubById(clubId);
  if (!club) return { ok: false, message: "ক্লাব পাওয়া যায়নি।" };

  const isAdmin = can(session.user.role, "admin.all");
  const isRep = club.representativeUserId === session.user.uid;
  if (!isAdmin && !isRep) return { ok: false, message: "আপনার অনুমতি নেই।" };

  const { data, errors } = parseClub(formData);
  if (!data || errors) return { ok: false, message: "ফর্মে ত্রুটি আছে", errors };

  await updateClub(clubId, data, { requireReview: !isAdmin });
  revalidatePath("/clubs/dashboard");
  revalidatePath("/clubs");
  revalidatePath(`/clubs/${club.slug}`);
  revalidatePath("/admin/clubs");
  return { ok: true, message: "ক্লাবের তথ্য সংরক্ষণ হয়েছে; অনুমোদনের অপেক্ষায়।" };
}

async function resolveManagedClub(clubId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "unauthorized" as const };
  const club = await getClubById(clubId);
  if (!club) return { error: "notfound" as const };
  const isAdmin = can(session.user.role, "admin.all");
  const isRep = club.representativeUserId === session.user.uid;
  if (!isAdmin && !isRep) return { error: "forbidden" as const };
  return { session, club };
}

export async function createClubEntryAction(
  _prev: ClubFormState,
  formData: FormData,
): Promise<ClubFormState> {
  const clubId = String(formData.get("clubId") ?? "");
  const managed = await resolveManagedClub(clubId);
  if ("error" in managed) {
    if (managed.error === "unauthorized") redirect("/auth/signin?callbackUrl=/clubs/dashboard");
    return { ok: false, message: "আপনার অনুমতি নেই।" };
  }

  const { data, errors } = parseEntry(formData);
  if (!data || errors) return { ok: false, message: "ফর্মে ত্রুটি আছে", errors };

  await createClubEntry(data, {
    id: managed.session.user.uid,
    name: managed.session.user.name ?? "প্রতিনিধি",
  });
  revalidatePath("/clubs/dashboard");
  revalidatePath(`/clubs/${managed.club.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/clubs");
  return { ok: true, message: "জমা হয়েছে; অনুমোদনের অপেক্ষায়।" };
}

export async function updateClubEntryAction(
  _prev: ClubFormState,
  formData: FormData,
): Promise<ClubFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const id = String(formData.get("id") ?? "");
  const clubId = String(formData.get("clubId") ?? "");
  const managed = await resolveManagedClub(clubId);
  if ("error" in managed) return { ok: false, message: "আপনার অনুমতি নেই।" };

  const { data, errors } = parseEntry(formData);
  if (!data || errors) return { ok: false, message: "ফর্মে ত্রুটি আছে", errors };

  const updated = await updateClubEntry(id, session.user.uid, data);
  if (!updated) return { ok: false, message: "জমাটি সম্পাদনা করা যায়নি।" };
  revalidatePath("/clubs/dashboard");
  revalidatePath(`/clubs/${managed.club.slug}`);
  return { ok: true, message: "সংরক্ষণ হয়েছে; পুনরায় অনুমোদনের অপেক্ষায়।" };
}

export async function deleteClubEntryAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const id = String(formData.get("id") ?? "");
  const clubId = String(formData.get("clubId") ?? "");
  const managed = await resolveManagedClub(clubId);
  if ("error" in managed) return;
  await deleteClubEntry(id, session.user.uid);
  revalidatePath("/clubs/dashboard");
  revalidatePath(`/clubs/${managed.club.slug}`);
}
