import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Eye, EyeOff, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { listAllCourses, listLectures } from "@/lib/repositories/courses";
import { courseCategoryMeta, levelMeta } from "@/lib/learning";
import { CourseAdminForm } from "@/components/CourseAdminForm";
import {
  deleteCourseAction,
  toggleCoursePublishAction,
} from "@/app/admin/courses/actions";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "courses.manage")) {
    redirect("/auth/signin?callbackUrl=/admin/courses");
  }

  const courses = await listAllCourses();
  const lectureCounts = new Map(
    await Promise.all(
      courses.map(async (course) => [course.id, (await listLectures(course.id)).length] as const),
    ),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-orange"
      >
        <ArrowLeft className="h-4 w-4" /> অ্যাডমিন কনসোল
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <span className="badge bg-brand-blue/10 text-brand-blue">
          <Pencil className="h-4 w-4" /> কোর্স ব্যবস্থাপনা
        </span>
        <span className="badge bg-emerald-100 text-emerald-700">মোট {courses.length}</span>
      </div>
      <h1 className="section-title title-accent mt-3">কোর্স ও লেকচার</h1>
      <p className="mt-2 text-brand-charcoal/65">
        নতুন ফ্রি ট্র্যাক তৈরি করুন, এবং প্রতিটির ভিডিও লেকচার পরিচালনা করুন।
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-brand-blue">
            বিদ্যমান কোর্স
          </h2>
          <div className="space-y-3">
            {courses.map((course) => {
              const meta = courseCategoryMeta(course.category);
              const level = levelMeta(course.level);
              const lectureCount = lectureCounts.get(course.id) ?? 0;
              return (
                <div key={course.id} className="card flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="badge text-white"
                      style={{ backgroundColor: meta.tint }}
                    >
                      {meta.bn}
                    </span>
                    <span className="badge bg-brand-lavender/20 text-brand-charcoal/70">
                      {level.bn}
                    </span>
                    <span
                      className={
                        course.published
                          ? "badge bg-emerald-100 text-emerald-700"
                          : "badge bg-amber-100 text-amber-700"
                      }
                    >
                      {course.published ? "প্রকাশিত" : "খসড়া"}
                    </span>
                  </div>
                  <div>
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="font-display text-lg font-bold text-brand-blue hover:text-brand-orange"
                    >
                      {course.titleBn}
                    </Link>
                    <p className="text-xs text-brand-charcoal/50">{course.titleEn}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-3 text-xs font-semibold text-brand-charcoal/60">
                    <span>{lectureCount} লেকচার</span>
                    <span>·</span>
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="btn-secondary !px-3 !py-1.5 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" /> সম্পাদনা
                    </Link>
                    <form action={toggleCoursePublishAction}>
                      <input type="hidden" name="id" value={course.id} />
                      <input type="hidden" name="published" value={String(!course.published)} />
                      <button type="submit" className="btn-ghost !px-3 !py-1.5 text-xs">
                        {course.published ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> অপ্রকাশ
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" /> প্রকাশ
                          </>
                        )}
                      </button>
                    </form>
                    <form action={deleteCourseAction}>
                      <input type="hidden" name="id" value={course.id} />
                      <button type="submit" className="btn-ghost !px-3 !py-1.5 text-xs text-brand-red">
                        <Trash2 className="h-3.5 w-3.5" /> মুছুন
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
            {courses.length === 0 && (
              <p className="text-brand-charcoal/60">এখনো কোনো কোর্স নেই।</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-brand-blue">
            <PlusCircle className="h-5 w-5 text-brand-orange" /> নতুন কোর্স
          </h2>
          <CourseAdminForm mode="create" />
        </section>
      </div>
    </div>
  );
}
