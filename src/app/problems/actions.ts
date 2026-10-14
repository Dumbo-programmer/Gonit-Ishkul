"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  createSubmission,
  getProblemById,
  gradeSubmission,
} from "@/lib/repositories/problems";
import type { AnswerState } from "@/lib/arena";
import type { SubmissionVerdict } from "@/lib/types";

export async function submitNumericAnswer(
  _prev: AnswerState,
  formData: FormData,
): Promise<AnswerState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, message: "লগ ইন করা প্রয়োজন।" };

  const problemId = String(formData.get("problemId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const answer = String(formData.get("answer") ?? "");
  const problem = getProblemById(problemId);
  if (!problem || problem.kind !== "NUMERIC") {
    return { ok: false, message: "সমস্যা পাওয়া যায়নি।" };
  }
  if (!answer.trim()) return { ok: false, message: "উত্তর লিখুন।" };

  const record = createSubmission({
    problemId,
    userId: session.user.uid,
    kind: "NUMERIC",
    content: answer,
  });

  revalidatePath(`/problems/${slug}`);
  return { ok: true, correct: record.verdict === "ACCEPTED" };
}

const proofSchema = z.object({
  problemId: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().trim().min(10, "প্রমাণ অন্তত ১০ অক্ষরের হতে হবে"),
  attachments: z.string().optional(),
});

export async function submitProof(
  _prev: AnswerState,
  formData: FormData,
): Promise<AnswerState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, message: "লগ ইন করা প্রয়োজন।" };

  const parsed = proofSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "ফর্মে ত্রুটি আছে।" };
  }
  const problem = getProblemById(parsed.data.problemId);
  if (!problem || problem.kind !== "PROOF") {
    return { ok: false, message: "সমস্যা পাওয়া যায়নি।" };
  }

  const attachments = (parsed.data.attachments ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  createSubmission({
    problemId: parsed.data.problemId,
    userId: session.user.uid,
    kind: "PROOF",
    content: parsed.data.content,
    attachments,
  });

  revalidatePath(`/problems/${parsed.data.slug}`);
  revalidatePath("/problems/grading");
  return { ok: true, message: "জমা হয়েছে — একজন মেন্টর মূল্যায়ন করবেন।" };
}

export async function gradeSubmissionAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "contests.grade")) return;

  const submissionId = String(formData.get("submissionId") ?? "");
  const verdict = String(formData.get("verdict") ?? "") as SubmissionVerdict;
  const feedback = String(formData.get("feedback") ?? "").trim() || undefined;
  if (!submissionId || !["ACCEPTED", "PARTIAL", "WRONG"].includes(verdict)) return;

  gradeSubmission(submissionId, verdict as "ACCEPTED" | "PARTIAL" | "WRONG", feedback, session.user.uid);
  revalidatePath("/problems/grading");
}
