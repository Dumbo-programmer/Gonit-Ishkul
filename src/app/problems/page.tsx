import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listProblems, userSolved } from "@/lib/repositories/problems";
import { ProblemArchive, type ProblemArchiveItem } from "@/components/ProblemArchive";

export const metadata = {
  title: "সমস্যা ভান্ডার · গণিত ইশকুল",
};

export default async function ProblemsPage() {
  const session = await getServerSession(authOptions);
  const problems = await listProblems();
  const items: ProblemArchiveItem[] = await Promise.all(
    problems.map(async (p) => ({
      id: p.id,
      slug: p.slug,
      titleBn: p.titleBn,
      titleEn: p.titleEn,
      topic: p.topic,
      levels: p.levels,
      difficulty: p.difficulty,
      kind: p.kind,
      basePoints: p.basePoints,
      source: p.source,
      solved: session?.user ? await userSolved(session.user.uid, p.id) : false,
      attempts: 0,
    })),
  );

  return <ProblemArchive problems={items} />;
}
