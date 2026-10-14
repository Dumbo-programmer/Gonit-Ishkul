"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createPuzzleSubmission,
  getPuzzleById,
  isRevealed,
} from "@/lib/repositories/puzzles";
import type { PuzzleState } from "@/lib/arena";

export async function submitPuzzleAnswer(
  _prev: PuzzleState,
  formData: FormData,
): Promise<PuzzleState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, message: "লগ ইন করা প্রয়োজন।" };

  const puzzleId = String(formData.get("puzzleId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const puzzle = getPuzzleById(puzzleId);
  if (!puzzle) return { ok: false, message: "ধাঁধা পাওয়া যায়নি।" };
  if (!content) return { ok: false, message: "উত্তর লিখুন।" };

  const submission = createPuzzleSubmission(puzzleId, session.user.uid, content);
  revalidatePath("/problems/gonit-bhaiya");
  if (!submission) return { ok: false, message: "জমা ব্যর্থ হয়েছে।" };

  const revealed = isRevealed(puzzle);
  return {
    ok: true,
    correct: revealed ? submission.isCorrect : undefined,
    message: revealed ? undefined : "উত্তর জমা হয়েছে — সমাধান প্রকাশে ফল দেখানো হবে।",
  };
}
