"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  Lock,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/LangContext";
import {
  computeCourseProgress,
  firstUnlockedIncomplete,
  formatDuration,
  isWatchedComplete,
  lectureStatus,
  type ProgressMap,
} from "@/lib/learning";
import type { LectureRecord, QuizRecord } from "@/lib/types";
import { VideoPlayer } from "@/components/VideoPlayer";
import { QuizPanel } from "@/components/QuizPanel";
import { ProgressBar } from "@/components/ProgressBar";
import { saveWatchProgressAction } from "@/app/courses/actions";

export interface ClassroomCourse {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  instructor: string;
}

export function Classroom({
  course,
  lectures,
  quizzes,
  progress: initialProgress,
  initialLectureId,
}: {
  course: ClassroomCourse;
  lectures: LectureRecord[];
  quizzes: QuizRecord[];
  progress: ProgressMap;
  initialLectureId?: string;
}) {
  const { lang, t } = useLang();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const learningLectures = useMemo(
    () => lectures.map((l) => ({ id: l.id, order: l.order, durationSec: l.durationSec })),
    [lectures],
  );

  const quizzedIds = useMemo(
    () => new Set(quizzes.map((q) => q.lectureId)),
    [quizzes],
  );

  const [progress, setProgress] = useState<ProgressMap>(initialProgress);
  useEffect(() => setProgress(initialProgress), [initialProgress]);

  const defaultId =
    initialLectureId && lectures.some((l) => l.id === initialLectureId)
      ? initialLectureId
      : firstUnlockedIncomplete(learningLectures, progress, quizzedIds) ?? lectures[0]?.id;

  const [activeId, setActiveId] = useState(defaultId);

  const activeIndex = lectures.findIndex((l) => l.id === activeId);
  const active = lectures[activeIndex];
  const quiz = quizzes.find((q) => q.lectureId === activeId);
  const activeProgress = progress[activeId];

  const courseProgress = computeCourseProgress(learningLectures, progress);

  const handleProgress = useCallback(
    (seconds: number) => {
      if (!active) return;
      setProgress((prev) => {
        const watchedSec = Math.max(prev[active.id]?.watchedSec ?? 0, seconds);
        return {
          ...prev,
          [active.id]: {
            watchedSec,
            completed:
              prev[active.id]?.completed ??
              isWatchedComplete(watchedSec, active.durationSec),
            quizPassed: prev[active.id]?.quizPassed ?? false,
          },
        };
      });
      void saveWatchProgressAction(course.id, active.id, seconds);
    },
    [active, course.id],
  );

  const handleCompleted = useCallback(() => {
    if (!active) return;
    setProgress((prev) => {
      const entry = prev[active.id];
      return {
        ...prev,
        [active.id]: {
          watchedSec: Math.max(entry?.watchedSec ?? 0, active.durationSec),
          completed: true,
          quizPassed: entry?.quizPassed ?? false,
        },
      };
    });
    void saveWatchProgressAction(course.id, active.id, active.durationSec).then(() => {
      startTransition(() => router.refresh());
    });
  }, [active, course.id, router]);

  const handlePassed = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      [activeId]: {
        watchedSec: prev[activeId]?.watchedSec ?? 0,
        completed: prev[activeId]?.completed ?? false,
        quizPassed: true,
      },
    }));
    startTransition(() => router.refresh());
  }, [activeId, router]);

  const goNext = () => {
    const next = lectures[activeIndex + 1];
    if (next && lectureStatus(learningLectures, progress, activeIndex + 1, quizzedIds) !== "locked") {
      setActiveId(next.id);
    }
  };
  const goPrev = () => {
    const prev = lectures[activeIndex - 1];
    if (prev) setActiveId(prev.id);
  };

  if (!active) {
    return <p className="p-10 text-center text-brand-charcoal/60">{t("courses.noCourses")}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href={`/courses/${course.slug}`} className="btn-ghost !px-4 !py-2 text-xs">
          <ArrowLeft className="h-4 w-4" />
          {t("courses.aboutCourse")}
        </Link>
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold text-brand-blue">
            {lang === "bn" ? course.titleBn : course.titleEn}
          </h1>
          <p className="text-xs text-brand-charcoal/55">
            {t("courses.instructor")}: {course.instructor}
          </p>
        </div>
        <div className="ml-auto w-full sm:w-56">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-brand-blue">
            <span>{t("courses.progress")}</span>
            <span>
              {courseProgress.completed}/{courseProgress.total} · {courseProgress.percent}%
            </span>
          </div>
          <ProgressBar percent={courseProgress.percent} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <VideoPlayer
            key={active.id}
            videoUrl={active.videoUrl}
            poster={active.poster}
            title={lang === "bn" ? active.titleBn : active.titleEn}
            chapters={active.chapters}
            initialTime={activeProgress?.watchedSec ?? 0}
            onProgress={handleProgress}
            onCompleted={handleCompleted}
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="btn-ghost !px-4 !py-2 text-xs disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              {lang === "bn" ? "পূর্ববর্তী" : "Previous"}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={
                activeIndex >= lectures.length - 1 ||
                lectureStatus(learningLectures, progress, activeIndex + 1, quizzedIds) === "locked"
              }
              className="btn-secondary !px-4 !py-2 text-xs disabled:opacity-40"
            >
              {lang === "bn" ? "পরবর্তী" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="card">
            <h2 className="flex items-center gap-2 text-lg font-bold text-brand-blue">
              <Download className="h-5 w-5 text-brand-orange" />
              {t("courses.resources")}
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {active.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  download
                  className="flex items-center gap-3 rounded-2xl border-2 border-brand-lavender/25 px-3 py-2.5 text-sm transition hover:border-brand-orange hover:bg-brand-orange/5"
                >
                  <FileText className="h-5 w-5 shrink-0 text-brand-purple" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-brand-charcoal/80">
                    {lang === "bn" ? att.titleBn : att.titleEn}
                  </span>
                  <span className="text-xs text-brand-charcoal/45">{att.sizeKb}KB</span>
                  <Download className="h-4 w-4 shrink-0 text-brand-orange" />
                </a>
              ))}
            </div>
          </div>

          {quiz && (
            <QuizPanel
              courseId={course.id}
              slug={course.slug}
              lectureId={active.id}
              passPercent={quiz.passPercent}
              questions={quiz.questions}
              alreadyPassed={Boolean(activeProgress?.quizPassed)}
              onPassed={handlePassed}
            />
          )}
        </div>

        <aside className="card h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-brand-blue">{t("courses.curriculum")}</h2>
          <ol className="mt-4 space-y-1.5">
            {lectures.map((lec, i) => {
              const status = lectureStatus(learningLectures, progress, i, quizzedIds);
              const isActive = lec.id === active.id;
              return (
                <li key={lec.id}>
                  <button
                    type="button"
                    disabled={status === "locked"}
                    onClick={() => setActiveId(lec.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-brand-orange/10 ring-2 ring-brand-orange/40"
                        : status === "locked"
                          ? "cursor-not-allowed opacity-55"
                          : "hover:bg-brand-purple/5"
                    }`}
                  >
                    <span className="mt-0.5">
                      {status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : status === "locked" ? (
                        <Lock className="h-5 w-5 text-brand-charcoal/40" />
                      ) : status === "in_progress" ? (
                        <PlayCircle className="h-5 w-5 text-brand-orange" />
                      ) : (
                        <Circle className="h-5 w-5 text-brand-lavender" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-brand-charcoal/85">
                        {lec.order}. {lang === "bn" ? lec.titleBn : lec.titleEn}
                      </span>
                      <span className="text-xs text-brand-charcoal/50">
                        {formatDuration(lec.durationSec)}
                        {status === "completed" && ` · ${t("courses.completed")}`}
                        {status === "in_progress" && ` · ${t("courses.inProgress")}`}
                        {status === "locked" && ` · ${t("courses.locked")}`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}
