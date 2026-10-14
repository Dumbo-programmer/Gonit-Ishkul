import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  currentPuzzle,
  getUserPuzzleSubmission,
  isRevealed,
  listPuzzles,
} from "@/lib/repositories/puzzles";
import { PuzzleHub, type PuzzleItem } from "@/components/PuzzleHub";
import type { PuzzleRecord } from "@/lib/types";

export const metadata = {
  title: "গণিত ভাইয়া · সাপ্তাহিক ধাঁধা",
};

function toItem(p: PuzzleRecord, revealed: boolean): PuzzleItem {
  return {
    id: p.id,
    titleBn: p.weekLabel,
    titleEn: p.weekLabel,
    promptBn: p.questionBn,
    promptEn: p.questionEn,
    hintBn: p.hintBn ?? "",
    hintEn: p.hintEn ?? "",
    revealAt: p.revealAt,
    answer: revealed ? p.answer : "",
    solutionBn: "",
    solutionEn: "",
    revealed,
  };
}

export default async function GonitBhaiyaPage() {
  const puzzle = currentPuzzle();
  if (!puzzle) redirect("/problems");

  const session = await getServerSession(authOptions);
  const revealed = isRevealed(puzzle);
  const submission = session?.user
    ? getUserPuzzleSubmission(puzzle.id, session.user.uid)
    : undefined;

  const past = listPuzzles()
    .filter((p) => p.id !== puzzle.id && isRevealed(p))
    .map((p) => toItem(p, true));

  return (
    <PuzzleHub
      current={toItem(puzzle, revealed)}
      submission={submission ? { content: submission.content, isCorrect: revealed ? submission.isCorrect : false } : null}
      past={past}
    />
  );
}
