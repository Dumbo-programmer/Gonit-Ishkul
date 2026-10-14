import { getStore, persistStore, uid } from "@/lib/store";
import type { PuzzleRecord, PuzzleSubmissionRecord } from "@/lib/types";
import { answersMatch } from "@/lib/judge";

export function listPuzzles(): PuzzleRecord[] {
  return getStore()
    .puzzles.filter((p) => p.published)
    .sort((a, b) => b.revealAt.localeCompare(a.revealAt));
}

export function getPuzzleById(id: string): PuzzleRecord | undefined {
  return getStore().puzzles.find((p) => p.id === id);
}

export function isRevealed(puzzle: PuzzleRecord, now: number = Date.now()): boolean {
  return now >= Date.parse(puzzle.revealAt);
}

/** The active weekly puzzle: the nearest unrevealed one, else the latest revealed. */
export function currentPuzzle(now: number = Date.now()): PuzzleRecord | undefined {
  const puzzles = listPuzzles();
  const upcoming = puzzles
    .filter((p) => !isRevealed(p, now))
    .sort((a, b) => a.revealAt.localeCompare(b.revealAt));
  if (upcoming.length > 0) return upcoming[0];
  return puzzles[0];
}

export function listPuzzleSubmissions(puzzleId: string): PuzzleSubmissionRecord[] {
  return getStore()
    .puzzleSubmissions.filter((s) => s.puzzleId === puzzleId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUserPuzzleSubmission(
  puzzleId: string,
  userId: string,
): PuzzleSubmissionRecord | undefined {
  return getStore().puzzleSubmissions.find(
    (s) => s.puzzleId === puzzleId && s.userId === userId,
  );
}

export function createPuzzleSubmission(
  puzzleId: string,
  userId: string,
  content: string,
): PuzzleSubmissionRecord | undefined {
  const store = getStore();
  const puzzle = store.puzzles.find((p) => p.id === puzzleId);
  if (!puzzle) return undefined;
  const now = new Date().toISOString();
  const existing = store.puzzleSubmissions.find(
    (s) => s.puzzleId === puzzleId && s.userId === userId,
  );
  const isCorrect = answersMatch(puzzle.answer, content);
  if (existing) {
    existing.content = content;
    existing.isCorrect = isCorrect;
    persistStore(store);
    return existing;
  }
  const record: PuzzleSubmissionRecord = {
    id: uid("psub"),
    puzzleId,
    userId,
    content,
    isCorrect,
    createdAt: now,
  };
  store.puzzleSubmissions.push(record);
  persistStore(store);
  return record;
}
