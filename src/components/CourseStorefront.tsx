"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { COURSE_CATEGORIES } from "@/lib/learning";
import { CourseCard, type CourseCardData } from "@/components/CourseCard";
import { EmptyState } from "@/components/EmptyState";

export function CourseStorefront({ courses }: { courses: CourseCardData[] }) {
  const { lang, t } = useLang();
  const [filter, setFilter] = useState<string>("ALL");

  const categories = COURSE_CATEGORIES.filter((c) =>
    courses.some((course) => course.category === c.value),
  );
  const visible =
    filter === "ALL" ? courses : courses.filter((c) => c.category === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <span className="badge bg-brand-purple/10 text-brand-purple">
          <LayoutGrid className="h-4 w-4" />
          {t("courses.title")}
        </span>
        <h1 className="section-title title-accent center mt-4">{t("courses.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-charcoal/65">
          {t("courses.subtitle")}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <FilterChip
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          label={t("courses.allCategories")}
          tint="#222222"
        />
        {categories.map((c) => (
          <FilterChip
            key={c.value}
            active={filter === c.value}
            onClick={() => setFilter(c.value)}
            label={lang === "bn" ? c.bn : c.en}
            tint={c.tint}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="mt-12">
          <EmptyState icon={LayoutGrid} title={t("courses.emptyState")} />
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  tint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-transparent text-white shadow-bubble"
          : "border-brand-lavender/30 bg-white text-brand-charcoal/70 hover:border-brand-lavender/60"
      }`}
      style={active ? { backgroundColor: tint } : undefined}
    >
      {label}
    </button>
  );
}
