"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  deletePracticeTest,
  generatePracticeTest,
  savePracticeAnswer,
  submitPracticeTest,
} from "@/lib/repositories/practice";
import { PRACTICE_MAX_SIZE, PRACTICE_MIN_SIZE } from "@/lib/practice";
import type { PracticeConfig } from "@/lib/practice";

const TOPICS = ["NUMBER_THEORY", "GEOMETRY", "COMBINATORICS", "ALGEBRA", "PROOFS"] as const;
const LEVELS = [
  "PRIMARY",
  "JUNIOR",
  "SECONDARY",
  "HIGHER_SECONDARY",
  "BDMO_REGIONAL",
  "BDMO_NATIONAL",
  "IMO",
] as const;

const startSchema = z.object({
  topics: z.array(z.enum(TOPICS)).default([]),
  levels: z.array(z.enum(LEVELS)).default([]),
  difficultyMin: z.coerce.number().int().min(1).max(5).default(1),
  difficultyMax: z.coerce.number().int().min(1).max(5).default(5),
  size: z.coerce
    .number()
    .int()
    .min(PRACTICE_MIN_SIZE)
    .max(PRACTICE_MAX_SIZE)
    .default(10),
  timed: z.coerce.boolean().default(false),
  durationMin: z.coerce.number().int().min(5).max(300).optional(),
});

function parseConfig(formData: FormData): PracticeConfig {
  const parsed = startSchema.parse({
    topics: formData.getAll("topics").map(String),
    levels: formData.getAll("levels").map(String),
    difficultyMin: formData.get("difficultyMin") ?? 1,
    difficultyMax: formData.get("difficultyMax") ?? 5,
    size: formData.get("size") ?? 10,
    timed: formData.get("timed") === "on" || formData.get("timed") === "true",
    durationMin: formData.get("durationMin") || undefined,
  });
  const difficultyMin = Math.min(parsed.difficultyMin, parsed.difficultyMax);
  const difficultyMax = Math.max(parsed.difficultyMin, parsed.difficultyMax);
  return {
    topics: [...parsed.topics],
    levels: [...parsed.levels],
    difficultyMin,
    difficultyMax,
    size: parsed.size,
    timed: parsed.timed,
    durationMin: parsed.timed ? parsed.durationMin : undefined,
  };
}

export async function startPracticeTestAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent("/problems/practice")}`);
  }

  let testId: string;
  try {
    const config = parseConfig(formData);
    const test = await generatePracticeTest(session.user.uid, config);
    testId = test.id;
  } catch {
    redirect("/problems/practice?error=insufficient");
  }

  revalidatePath("/problems/practice");
  redirect(`/problems/practice/${testId}`);
}

export async function savePracticeAnswerAction(
  testId: string,
  problemId: string,
  answer: string,
): Promise<{ ok: boolean; locked?: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, locked: true };
  return savePracticeAnswer(testId, session.user.uid, problemId, answer);
}

export async function submitPracticeTestAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;
  const testId = String(formData.get("testId") ?? "");
  if (!testId) return;

  let answers: Record<string, string> | undefined;
  const raw = String(formData.get("answers") ?? "");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      answers = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "string") answers[key] = value;
      }
    } catch {
      answers = undefined;
    }
  }

  await submitPracticeTest(testId, session.user.uid, answers);
  revalidatePath(`/problems/practice/${testId}`);
  revalidatePath("/problems/practice");
  redirect(`/problems/practice/${testId}`);
}

export async function deletePracticeTestAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;
  const testId = String(formData.get("testId") ?? "");
  if (!testId) return;
  await deletePracticeTest(testId, session.user.uid);
  revalidatePath("/problems/practice");
  redirect("/problems/practice");
}
