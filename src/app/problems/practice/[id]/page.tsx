import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listProblemsByIds } from "@/lib/repositories/problems";
import { getPracticeTest } from "@/lib/repositories/practice";
import { PracticeRunner, type RunnerProblem } from "@/components/PracticeRunner";

export const metadata = {
  title: "প্র্যাকটিস পরীক্ষা · গণিত ইশকুল",
};

export default async function PracticeTestPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/problems/practice/${params.id}`)}`);
  }

  const test = await getPracticeTest(params.id, session.user.uid);
  if (!test) notFound();

  const problems = await listProblemsByIds(test.problemIds);
  const runnerProblems: RunnerProblem[] = problems.map((p) => ({
    id: p.id,
    slug: p.slug,
    titleBn: p.titleBn,
    titleEn: p.titleEn,
    statementBn: p.statementBn,
    statementEn: p.statementEn,
    topic: p.topic,
    levels: p.levels,
    difficulty: p.difficulty,
    basePoints: p.basePoints,
    answer: p.answer,
    solutionBn: p.solutionBn,
    solutionEn: p.solutionEn,
  }));

  return (
    <PracticeRunner
      test={{
        id: test.id,
        title: test.title,
        timed: test.timed,
        durationMin: test.durationMin,
        deadlineAt: test.deadlineAt,
        submittedAt: test.submittedAt,
        score: test.score,
        maxScore: test.maxScore,
        results: test.results,
        answers: test.answers,
        startedAt: test.startedAt,
      }}
      problems={runnerProblems}
    />
  );
}
