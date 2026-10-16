import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { listProblems } from "@/lib/repositories/problems";
import { listPracticeTests } from "@/lib/repositories/practice";
import { PracticeStart, type PracticeHistoryItem } from "@/components/PracticeStart";
import type { PracticeFilterable } from "@/lib/practice";

export const metadata = {
  title: "প্র্যাকটিস টেস্ট · গণিত ইশকুল",
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent("/problems/practice")}`);
  }

  const problems = await listProblems();
  const pool: PracticeFilterable[] = problems
    .filter((p) => p.kind === "NUMERIC")
    .map((p) => ({ topic: p.topic, levels: p.levels, difficulty: p.difficulty }));

  const tests = await listPracticeTests(session.user.uid);
  const history: PracticeHistoryItem[] = tests.map((t) => ({
    id: t.id,
    title: t.title,
    size: t.problemIds.length,
    timed: t.timed,
    durationMin: t.durationMin,
    score: t.score,
    maxScore: t.maxScore,
    submittedAt: t.submittedAt,
    startedAt: t.startedAt,
  }));

  return <PracticeStart pool={pool} history={history} error={searchParams.error} />;
}
