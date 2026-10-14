import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  PlayCircle,
  UserRound,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  getCourseBySlug,
  listLectures,
  getQuiz,
  getProgressMap,
  isEnrolled,
} from "@/lib/repositories/courses";
import { computeCourseProgress, courseCategoryMeta, formatDuration, isLectureUnlocked, levelMeta } from "@/lib/learning";
import { enrollAction } from "@/app/courses/actions";
import { ProgressBar } from "@/components/ProgressBar";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = getCourseBySlug(params.slug);
  if (!course) notFound();

  const lectures = listLectures(course.id);
  const level = levelMeta(course.level);
  const category = courseCategoryMeta(course.category);
  const totalSec = lectures.reduce((sum, l) => sum + l.durationSec, 0);

  const session = await getServerSession(authOptions);
  const enrolled = session?.user ? isEnrolled(session.user.uid, course.id) : false;
  const progress = session?.user ? getProgressMap(session.user.uid, course.id) : {};

  const learning = lectures.map((l) => ({
    id: l.id,
    order: l.order,
    durationSec: l.durationSec,
  }));
  const courseProgress = computeCourseProgress(learning, progress);
  const quizzedIds = new Set(
    lectures.filter((l) => Boolean(getQuiz(l.id))).map((l) => l.id),
  );

  return (
    <div className="math-bg min-h-[80vh] bg-brand-purple/5">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <nav className="mb-4 text-xs font-semibold text-brand-charcoal/50">
          <Link href="/courses" className="hover:text-brand-orange">
            কোর্স
          </Link>{" "}
          / <span className="text-brand-charcoal/70">{course.titleBn}</span>
        </nav>

        <header className="card overflow-hidden p-0">
          <div
            className="px-6 py-8 text-white sm:px-8"
            style={{ background: `linear-gradient(135deg, ${level.tint}, #1b4594)` }}
          >
            <span className="badge bg-white/20 text-white">{level.bn} · {level.en}</span>
            <span className="badge ml-2 bg-white/20 text-white">
              {category.bn} · {category.en}
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold">{course.titleBn}</h1>
            <p className="mt-1 text-lg font-semibold text-white/85">{course.titleEn}</p>
            <p className="mt-3 max-w-2xl text-sm text-white/85">{course.descBn}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" /> {course.instructor}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {lectures.length} লেকচার
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {formatDuration(totalSec)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> সম্পূর্ণ ফ্রি
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            {enrolled ? (
              <>
                <div className="w-full sm:max-w-xs">
                  <div className="mb-1 flex items-center justify-between text-xs font-bold text-brand-blue">
                    <span>আপনার প্রগ্রেস</span>
                    <span>{courseProgress.percent}%</span>
                  </div>
                  <ProgressBar percent={courseProgress.percent} />
                </div>
                <Link href={`/courses/${course.slug}/learn`} className="btn-primary">
                  <PlayCircle className="h-4 w-4" /> শেখা চালিয়ে যান
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-brand-charcoal/65">
                  কোর্সে ভর্তি হয়ে সব লেকচার, PDF নোট ও কুইজ আনলক করুন।
                </p>
                <form action={enrollAction}>
                  <input type="hidden" name="slug" value={course.slug} />
                  <button type="submit" className="btn-primary">
                    ফ্রি ভর্তি হোন
                  </button>
                </form>
              </>
            )}
          </div>
        </header>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-brand-blue">কোর্স কারিকুলাম</h2>
          <ol className="mt-4 space-y-3">
            {lectures.map((lec, i) => {
              const unlocked = isLectureUnlocked(learning, progress, i, quizzedIds);
              const done = Boolean(progress[lec.id]?.completed && progress[lec.id]?.quizPassed);
              return (
                <li
                  key={lec.id}
                  className="card flex items-center gap-4 !py-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-purple/10 font-bold text-brand-purple">
                    {lec.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-brand-charcoal/85">{lec.titleBn}</p>
                    <p className="text-xs text-brand-charcoal/50">{lec.titleEn}</p>
                  </div>
                  <span className="hidden text-xs font-semibold text-brand-charcoal/50 sm:block">
                    {formatDuration(lec.durationSec)}
                  </span>
                  {enrolled ? (
                    done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : unlocked ? (
                      <PlayCircle className="h-5 w-5 text-brand-orange" />
                    ) : (
                      <Lock className="h-5 w-5 text-brand-charcoal/40" />
                    )
                  ) : (
                    <Lock className="h-5 w-5 text-brand-charcoal/40" />
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
