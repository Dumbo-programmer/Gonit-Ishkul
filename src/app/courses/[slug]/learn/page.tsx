import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getCourseBySlug,
  listLectures,
  getQuiz,
  getProgressMap,
  isEnrolled,
} from "@/lib/repositories/courses";
import { Classroom } from "@/components/Classroom";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { lecture?: string };
}) {
  const session = await getServerSession(authOptions);
  const course = getCourseBySlug(params.slug);
  if (!course) notFound();

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/courses/${course.slug}/learn`)}`);
  }
  if (!isEnrolled(session.user.uid, course.id)) {
    redirect(`/courses/${course.slug}`);
  }

  const lectures = listLectures(course.id);
  const quizzes = lectures
    .map((l) => getQuiz(l.id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));
  const progress = getProgressMap(session.user.uid, course.id);

  return (
    <div className="bg-brand-purple/5">
      <Classroom
        course={{
          id: course.id,
          slug: course.slug,
          titleBn: course.titleBn,
          titleEn: course.titleEn,
          instructor: course.instructor,
        }}
        lectures={lectures}
        quizzes={quizzes}
        progress={progress}
        initialLectureId={searchParams.lecture}
      />
    </div>
  );
}
