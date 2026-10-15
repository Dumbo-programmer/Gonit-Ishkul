"use client";

import Link from "next/link";
import { BookOpen, PlayCircle, Sparkles, Users } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { courseCategoryMeta } from "@/lib/learning";
import { ProgressBar } from "@/components/ProgressBar";
import type { CourseCategory } from "@/lib/types";

export interface CourseCardData {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  level: string;
  category: string;
  descBn: string;
  descEn: string;
  instructor: string;
  lectureCount: number;
  durationMin: number;
  enrolled: boolean;
  percent: number;
}

export function CourseCard({ course }: { course: CourseCardData }) {
  const { lang, t } = useLang();
  const category = courseCategoryMeta(course.category as CourseCategory);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card card-glow group relative flex h-full flex-col gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, var(--brand-orange), var(--brand-purple), var(--brand-blue))",
        }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <span
          className="badge text-white"
          style={{ backgroundColor: category.tint }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {lang === "bn" ? category.bn : category.en}
        </span>
        <span className="badge bg-emerald-100 text-emerald-700">
          {t("courses.free")}
        </span>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-brand-blue group-hover:text-brand-orange">
          {lang === "bn" ? course.titleBn : course.titleEn}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-brand-charcoal/65">
          {lang === "bn" ? course.descBn : course.descEn}
        </p>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-brand-charcoal/60">
          <span className="inline-flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5 text-brand-purple" />
            {course.lectureCount} {t("courses.lecturesCount")}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-brand-purple" />
            {course.durationMin} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-brand-purple" />
            {course.instructor}
          </span>
        </div>

        {course.enrolled ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-brand-blue">
              <span>{t("courses.progress")}</span>
              <span>{course.percent}%</span>
            </div>
            <ProgressBar percent={course.percent} />
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-orange">
            {t("courses.enroll")} →
          </span>
        )}
      </div>
    </Link>
  );
}
