"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  createApplication,
  reportActivity,
  resolveActivity,
  updateApplicationStatus,
} from "@/lib/repositories/ambassador";
import { findUserByEmail, createUser } from "@/lib/repositories/users";
import type { ActivityType } from "@/lib/types";
import type { FormState } from "@/lib/ambassadorForm";

const applicationSchema = z.object({
  fullName: z.string().trim().min(3, "নাম অন্তত ৩ অক্ষরের হতে হবে"),
  email: z.string().trim().email("সঠিক ইমেইল দিন"),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন (যেমন 017xxxxxxxx)"),
  university: z.string().trim().min(2, "প্রতিষ্ঠানের নাম দিন"),
  department: z.string().trim().min(2, "বিষয় দিন"),
  district: z.string().trim().min(2, "জেলা নির্বাচন করুন"),
  division: z.string().trim().min(2, "বিভাগ নির্বাচন করুন"),
  studentId: z.string().trim().optional().or(z.literal("")),
  statement: z
    .string()
    .trim()
    .min(80, "আবেদনপত্র অন্তত ৮০ অক্ষরের হতে হবে"),
  resumeUrl: z.string().trim().url("সঠিক লিংক দিন").optional().or(z.literal("")),
  shareUrl: z.string().trim().url("সঠিক লিংক দিন").optional().or(z.literal("")),
});

export async function submitApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = applicationSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, message: "ফর্মে ত্রুটি আছে", errors };
  }

  const email = parsed.data.email.toLowerCase();
  if ((await findUserByEmail(email))?.role === "AMBASSADOR") {
    return {
      ok: false,
      message: "এই ইমেইল দিয়ে ইতিমধ্যে একজন দূত নিবন্ধিত।",
    };
  }

  const application = await createApplication({
    ...parsed.data,
    studentId: parsed.data.studentId || undefined,
    resumeUrl: parsed.data.resumeUrl || undefined,
    shareUrl: parsed.data.shareUrl || undefined,
  });

  revalidatePath("/gonit-doot/status");
  return {
    ok: true,
    message: "আবেদন সফলভাবে জমা হয়েছে!",
    trackingCode: application.trackingCode,
  };
}

const activitySchema = z.object({
  type: z.enum([
    "CAMPUS_CIRCLE",
    "WORKSHOP",
    "SOCIAL_MEDIA",
    "SCHOOL_VISIT",
    "CONTEST_HOSTED",
    "ARTICLE_PUBLISHED",
  ]),
  title: z.string().trim().min(4, "শিরোনাম দিন"),
  description: z.string().trim().min(10, "বিস্তারিত লিখুন"),
  district: z.string().trim().min(2, "জেলা দিন"),
  participants: z.coerce.number().int().min(0).max(10000),
  proofUrl: z.string().trim().url("সঠিক লিংক দিন").optional().or(z.literal("")),
});

export async function submitActivityReport(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false, message: "লগ ইন করা প্রয়োজন।" };
  }
  if (!can(session.user.role, "ambassador.reportActivity")) {
    return { ok: false, message: "আপনার এই কাজের অনুমতি নেই।" };
  }

  const parsed = activitySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, message: "ফর্মে ত্রুটি আছে", errors };
  }

  await reportActivity({
    ambassadorId: session.user.uid,
    type: parsed.data.type as ActivityType,
    title: parsed.data.title,
    description: parsed.data.description,
    district: parsed.data.district,
    participants: parsed.data.participants,
    proofUrl: parsed.data.proofUrl || undefined,
  });

  revalidatePath("/gonit-doot/dashboard");
  revalidatePath("/gonit-doot/review");
  return { ok: true, message: "রিপোর্ট জমা হয়েছে; অনুমোদনের অপেক্ষায়।" };
}

export async function resolveActivityAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "ambassador.review")) return;

  const id = String(formData.get("activityId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!id) return;

  await resolveActivity(id, decision === "approve");
  revalidatePath("/gonit-doot/review");
  revalidatePath("/gonit-doot/dashboard");
}

/** Ensures a Student user exists for a submitted application (kept for later phases). */
export async function reviewApplicationAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "ambassador.review")) return;
  const id = String(formData.get("applicationId") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "UNDER_REVIEW"
    | "SHORTLISTED"
    | "INTERVIEW"
    | "ACCEPTED"
    | "REJECTED";
  const note = String(formData.get("note") ?? "") || undefined;
  if (!id || !status) return;
  await updateApplicationStatus(id, status, note);
  revalidatePath("/gonit-doot/review");
  revalidatePath("/gonit-doot/status");
}

/** Ensures a Student user exists for a submitted application (kept for later phases). */
export async function ensureApplicantUser(email: string, name: string) {
  if ((await findUserByEmail(email))) return;
  await createUser({ name, email, password: "ChangeMe@12345", role: "STUDENT" });
}