import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowDown, ArrowLeft, ArrowUp, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  getCourseById,
  listLectures,
} from "@/lib/repositories/courses";
import { formatDuration } from "@/lib/learning";
import { CourseAdminForm } from "@/components/CourseAdminForm";
import { LectureAdminForm } from "@/components/LectureAdminForm";
import {
  deleteLectureAction,
  moveLectureAction,
} from "@/app/admin/courses/actions";

export const dynamic = "force-dynamic";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "courses.manage")) {
    redirect("/auth/signin?callbackUrl=/admin/courses");
  }

  const course = getCourseById(params.id);
  if (!course) notFound();

  const lectures = listLectures(course.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-orange"
      >
        <ArrowLeft className="h-4 w-4" /> সব কোর্স
      </Link>

      <h1 className="section-title mt-4">কোর্স সম্পাদনা</h1>
      <p className="mt-1 text-sm text-brand-charcoal/60">
        স্লাগ: <span className="font-mono">{course.slug}</span>
      </p>

      <div className="mt-6">
        <CourseAdminForm
          mode="edit"
          values={{
            id: course.id,
            titleBn: course.titleBn,
            titleEn: course.titleEn,
            level: course.level,
            category: course.category,
            descBn: course.descBn,
            descEn: course.descEn,
            instructor: course.instructor,
            published: course.published,
          }}
        />
      </div>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          লেকচার ({lectures.length})
        </h2>

        <div className="mt-5 space-y-3">
          {lectures.map((lecture, index) => (
            <div key={lecture.id} className="card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="badge bg-brand-lavender/20 text-brand-charcoal/70">
                    #{lecture.order}
                  </span>
                  <span className="ml-2 font-semibold text-brand-charcoal/85">
                    {lecture.titleBn}
                  </span>
                  <span className="ml-2 text-xs text-brand-charcoal/50">
                    {lecture.titleEn} · {formatDuration(lecture.durationSec)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <form action={moveLectureAction}>
                    <input type="hidden" name="id" value={lecture.id} />
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="btn-ghost !px-2 !py-1.5 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={moveLectureAction}>
                    <input type="hidden" name="id" value={lecture.id} />
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === lectures.length - 1}
                      className="btn-ghost !px-2 !py-1.5 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={deleteLectureAction}>
                    <input type="hidden" name="id" value={lecture.id} />
                    <input type="hidden" name="courseId" value={course.id} />
                    <button
                      type="submit"
                      className="btn-ghost !px-2 !py-1.5 text-brand-red"
                      aria-label="Delete lecture"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>

              <details>
                <summary className="cursor-pointer text-sm font-semibold text-brand-blue">
                  সম্পাদনা
                </summary>
                <div className="mt-3">
                  <LectureAdminForm
                    mode="edit"
                    courseId={course.id}
                    values={{
                      id: lecture.id,
                      titleBn: lecture.titleBn,
                      titleEn: lecture.titleEn,
                      videoUrl: lecture.videoUrl,
                      poster: lecture.poster,
                      durationSec: lecture.durationSec,
                    }}
                  />
                </div>
              </details>
            </div>
          ))}
          {lectures.length === 0 && (
            <p className="text-brand-charcoal/60">এখনো কোনো লেকচার নেই।</p>
          )}
        </div>

        <div className="mt-8 rounded-3xl border-2 border-dashed border-brand-lavender/40 p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-brand-blue">
            নতুন লেকচার
          </h3>
          <LectureAdminForm courseId={course.id} />
        </div>
      </section>
    </div>
  );
}
