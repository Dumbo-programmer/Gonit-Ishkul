import { getStore, persistStore, uid } from "@/lib/store";
import type {
  ProblemKind,
  ProblemRecord,
  SubmissionRecord,
  SubmissionVerdict,
} from "@/lib/types";
import { answersMatch, scoreForVerdict, verdictForNumeric } from "@/lib/judge";

export async function listProblems(): Promise<ProblemRecord[]> {
  return (await getStore())
    .problems.filter((p) => p.published)
    .map((p) => ({ ...p }));
}

export async function getProblemBySlug(slug: string): Promise<ProblemRecord | undefined> {
  return (await getStore()).problems.find((p) => p.slug === slug);
}

export async function getProblemById(id: string): Promise<ProblemRecord | undefined> {
  return (await getStore()).problems.find((p) => p.id === id);
}

export async function listProblemsByIds(ids: string[]): Promise<ProblemRecord[]> {
  const all = (await getStore()).problems;
  return ids
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is ProblemRecord => Boolean(p));
}

export async function listSubmissionsByProblem(problemId: string): Promise<SubmissionRecord[]> {
  return (await getStore())
    .submissions.filter((s) => s.problemId === problemId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listSubmissionsByUser(userId: string): Promise<SubmissionRecord[]> {
  return (await getStore())
    .submissions.filter((s) => s.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUserSubmission(
  userId: string,
  problemId: string,
): Promise<SubmissionRecord | undefined> {
  return (await getStore())
    .submissions.filter((s) => s.userId === userId && s.problemId === problemId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export async function listPendingSubmissions(): Promise<SubmissionRecord[]> {
  return (await getStore())
    .submissions.filter((s) => s.verdict === "PENDING")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function userSolved(userId: string, problemId: string): Promise<boolean> {
  return (await getStore()).submissions.some(
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
export async function createSubmission(input: CreateSubmissionInput): Promise<SubmissionRecord> {
  const store = (await getStore());
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
  await persistStore(store);
  return record;
}

export async function gradeSubmission(
  id: string,
  verdict: Exclude<SubmissionVerdict, "PENDING">,
  feedback: string | undefined,
  gradedById: string,
): Promise<SubmissionRecord | undefined> {
  const store = (await getStore());
  const submission = store.submissions.find((s) => s.id === id);
  if (!submission) return undefined;
  const problem = store.problems.find((p) => p.id === submission.problemId);
  const basePoints = problem?.basePoints ?? 0;
  submission.verdict = verdict;
  submission.score = scoreForVerdict(verdict, basePoints);
  submission.feedback = feedback;
  submission.gradedById = gradedById;
  submission.updatedAt = new Date().toISOString();
  await persistStore(store);
  return submission;
}
