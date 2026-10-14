"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getContestBySlug,
  getContestById,
  getEntry,
  saveContestAnswer,
  startContest,
  submitContest,
} from "@/lib/repositories/contests";
import { contestPhase, deadlineFor } from "@/lib/arena";

export async function startContestAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const slug = String(formData.get("slug") ?? "");
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/contests/${slug}`)}`);
  }
  const contest = getContestBySlug(slug);
  if (!contest) redirect("/contests");
  if (contestPhase(contest) !== "live") redirect(`/contests/${slug}`);

  startContest(session.user.uid, contest.id);
  revalidatePath(`/contests/${slug}`);
  redirect(`/contests/${slug}`);
}

export async function saveContestAnswerAction(
  contestId: string,
  problemId: string,
  answer: string,
): Promise<{ ok: boolean; locked?: boolean }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false };
  const contest = getContestById(contestId);
  const entry = getEntry(contestId, session.user.uid);
  if (!contest || !entry || entry.submittedAt) return { ok: false, locked: true };
  if (Date.now() > deadlineFor(contest, entry.startedAt)) return { ok: false, locked: true };

  saveContestAnswer(contestId, session.user.uid, problemId, answer);
  return { ok: true };
}

export async function submitContestAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;
  const slug = String(formData.get("slug") ?? "");
  const contest = getContestBySlug(slug);
  if (!contest) return;
  submitContest(contest.id, session.user.uid);
  revalidatePath(`/contests/${slug}`);
  revalidatePath("/contests");
}
