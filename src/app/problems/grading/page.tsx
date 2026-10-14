import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getProblemById, listPendingSubmissions } from "@/lib/repositories/problems";
import { findUserById } from "@/lib/repositories/users";
import { GradingQueue, type GradingItem } from "@/components/GradingQueue";

export const metadata = {
  title: "মূল্যায়ন কিউ · গণিত ইশকুল",
};

export default async function GradingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/problems/grading");
  if (!can(session.user.role, "contests.grade")) notFound();

  const items: GradingItem[] = listPendingSubmissions().map((sub) => {
    const problem = getProblemById(sub.problemId);
    return {
      id: sub.id,
      problemTitleBn: problem?.titleBn ?? "—",
      problemTitleEn: problem?.titleEn ?? "—",
      studentName: findUserById(sub.userId)?.name ?? "—",
      content: sub.content,
      attachments: sub.attachments,
      submittedAt: sub.createdAt,
    };
  });

  return <GradingQueue items={items} />;
}
