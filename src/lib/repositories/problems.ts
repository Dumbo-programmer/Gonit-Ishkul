import { getStore, persistStore, uid } from "@/lib/store";
import type {
  ProblemKind,
  ProblemRecord,
  SubmissionRecord,
  SubmissionVerdict,
} from "@/lib/types";
import { answersMatch, scoreForVerdict, verdictForNumeric } from "@/lib/judge";

export function listProblems(): ProblemRecord[] {
  return getStore()
    .problems.filter((p) => p.published)
    .map((p) => ({ ...p }));
}

export function getProblemBySlug(slug: string): ProblemRecord | undefined {
  return getStore().problems.find((p) => p.slug === slug);
}

export function getProblemById(id: string): ProblemRecord | undefined {
  return getStore().problems.find((p) => p.id === id);
}

export function listProblemsByIds(ids: string[]): ProblemRecord[] {
  const all = getStore().problems;
  return ids
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is ProblemRecord => Boolean(p));
}

export function listSubmissionsByProblem(problemId: string): SubmissionRecord[] {
  return getStore()
    .submissions.filter((s) => s.problemId === problemId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listSubmissionsByUser(userId: string): SubmissionRecord[] {
  return getStore()
    .submissions.filter((s) => s.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUserSubmission(
  userId: string,
  problemId: string,
): SubmissionRecord | undefined {
  return getStore()
    .submissions.filter((s) => s.userId === userId && s.problemId === problemId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function listPendingSubmissions(): SubmissionRecord[] {
  return getStore()
    .submissions.filter((s) => s.verdict === "PENDING")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function userSolved(userId: string, problemId: string): boolean {
  return getStore().submissions.some(
    (s) => s.userId === userId && s.problemId === problemId && s.verdict === "ACCEPTED",
  );
}

export interface CreateSubmissionInput {
  problemId: string;
  userId: string;
  kind: ProblemKind;
  content: string;
  attachments?: string[];
}

/** Creates a submission; numeric answers are auto-graded immediately. */
export function createSubmission(input: CreateSubmissionInput): SubmissionRecord {
  const store = getStore();
  const problem = store.problems.find((p) => p.id === input.problemId);
  const now = new Date().toISOString();

  let verdict: SubmissionVerdict = "PENDING";
  let score = 0;
  if (problem && problem.kind === "NUMERIC") {
    const correct = answersMatch(
      problem.answer ?? "",
      input.content,
      problem.tolerance,
    );
    verdict = verdictForNumeric(correct);
    score = scoreForVerdict(verdict, problem.basePoints);
  }

  const record: SubmissionRecord = {
    id: uid("sub"),
    problemId: input.problemId,
    userId: input.userId,
    kind: input.kind,
    content: input.content,
    attachments: input.attachments ?? [],
    verdict,
    score,
    createdAt: now,
    updatedAt: now,
  };
  store.submissions.push(record);
  persistStore(store);
  return record;
}

export function gradeSubmission(
  id: string,
  verdict: Exclude<SubmissionVerdict, "PENDING">,
  feedback: string | undefined,
  gradedById: string,
): SubmissionRecord | undefined {
  const store = getStore();
  const submission = store.submissions.find((s) => s.id === id);
  if (!submission) return undefined;
  const problem = store.problems.find((p) => p.id === submission.problemId);
  const basePoints = problem?.basePoints ?? 0;
  submission.verdict = verdict;
  submission.score = scoreForVerdict(verdict, basePoints);
  submission.feedback = feedback;
  submission.gradedById = gradedById;
  submission.updatedAt = new Date().toISOString();
  persistStore(store);
  return submission;
}
