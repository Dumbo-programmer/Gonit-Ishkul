import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listCourses, listLectures, getProgressMap, isEnrolled } from "@/lib/repositories/courses";
import { computeCourseProgress } from "@/lib/learning";
import { CourseStorefront } from "@/components/CourseStorefront";
import type { CourseCardData } from "@/components/CourseCard";

export const metadata = {
  title: "কোর্স ও ব্যাচ · Gonit Ishkul",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const courses = listCourses();

  const cards: CourseCardData[] = courses.map((course) => {
    const lectures = listLectures(course.id);
    const learning = lectures.map((l) => ({
      id: l.id,
      order: l.order,
      durationSec: l.durationSec,
    }));
    const enrolled = session?.user ? isEnrolled(session.user.uid, course.id) : false;
    const progress = session?.user ? getProgressMap(session.user.uid, course.id) : {};
    const percent = computeCourseProgress(learning, progress).percent;
    return {
      id: course.id,
      slug: course.slug,
      titleBn: course.titleBn,
      titleEn: course.titleEn,
      level: course.level,
      category: course.category,
      descBn: course.descBn,
      descEn: course.descEn,
      instructor: course.instructor,
      lectureCount: lectures.length,
      durationMin: Math.round(
        lectures.reduce((sum, l) => sum + l.durationSec, 0) / 60,
      ),
      enrolled,
      percent,
    };
  });

  return (
    <div className="math-bg min-h-[80vh] bg-brand-purple/5">
      <CourseStorefront courses={cards} />
    </div>
  );
}
