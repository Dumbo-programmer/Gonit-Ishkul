import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getProblemBySlug,
  getUserSubmission,
} from "@/lib/repositories/problems";
import { ProblemDetail } from "@/components/ProblemDetail";

export default async function ProblemDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const problem = getProblemBySlug(params.slug);
  if (!problem) notFound();

  const session = await getServerSession(authOptions);
  const submission = session?.user
    ? getUserSubmission(session.user.uid, problem.id)
    : undefined;

  return (
    <ProblemDetail
      problem={{
        id: problem.id,
        slug: problem.slug,
        titleBn: problem.titleBn,
        titleEn: problem.titleEn,
        statementBn: problem.statementBn,
        statementEn: problem.statementEn,
        topic: problem.topic,
        levels: problem.levels,
        difficulty: problem.difficulty,
        source: problem.source,
        kind: problem.kind,
        basePoints: problem.basePoints,
        solutionBn: problem.solutionBn,
        solutionEn: problem.solutionEn,
      }}
      loggedIn={Boolean(session?.user)}
      submission={
        submission
          ? {
              verdict: submission.verdict,
              content: submission.content,
              feedback: submission.feedback,
              createdAt: submission.createdAt,
            }
          : null
      }
      showSolution={submission?.verdict === "ACCEPTED"}
    />
  );
}
