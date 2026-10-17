"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ListChecks, RotateCcw, Search, Sigma, Target } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { EmptyState } from "@/components/EmptyState";
import {
  PROBLEM_CATEGORIES,
  PROBLEM_COMPETITIONS,
  PROBLEM_TOPICS,
  difficultyLabel,
  topicMeta,
} from "@/lib/arena";
import { matchesFilters, type PracticeFilterConfig } from "@/lib/practice";
import type { ProblemKind, ProblemLevel, ProblemTopic } from "@/lib/types";

export interface ProblemArchiveItem {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  topic: ProblemTopic;
  levels: ProblemLevel[];
  difficulty: number;
  kind: ProblemKind;
  basePoints: number;
  source: string;
  solved: boolean;
  attempts: number;
}

interface ArchiveFilters {
  topics: ProblemTopic[];
  categories: ProblemLevel[];
  competitions: ProblemLevel[];
  difficultyMin: number;
  difficultyMax: number;
}

const EMPTY_FILTERS: ArchiveFilters = {
  topics: [],
  categories: [],
  competitions: [],
  difficultyMin: 1,
  difficultyMax: 5,
};

function toFilterConfig(filters: ArchiveFilters): PracticeFilterConfig {
  return {
    topics: filters.topics,
    levels: [...filters.categories, ...filters.competitions],
    difficultyMin: filters.difficultyMin,
    difficultyMax: filters.difficultyMax,
  };
}

export function ProblemArchive({ problems }: { problems: ProblemArchiveItem[] }) {
  const { lang, t } = useLang();
  const [filters, setFilters] = useState<ArchiveFilters>(EMPTY_FILTERS);
  const [query, setQuery] = useState("");

  const filteredBySearch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return problems;
    return problems.filter((p) =>
      `${p.titleBn} ${p.titleEn} ${p.source}`.toLowerCase().includes(q),
    );
  }, [problems, query]);

  const visible = useMemo(() => {
    const config = toFilterConfig(filters);
    return filteredBySearch.filter((p) => matchesFilters(p, config));
  }, [filteredBySearch, filters]);

  const counts = useMemo(() => {
    const withOverride = (override: Partial<ArchiveFilters>): number => {
      const config = toFilterConfig({ ...filters, ...override });
      return filteredBySearch.filter((p) => matchesFilters(p, config)).length;
    };
    const topicCounts: Record<string, number> = {};
    for (const tp of PROBLEM_TOPICS) {
      topicCounts[tp.value] = withOverride({ topics: [tp.value] });
    }
    const categoryCounts: Record<string, number> = {};
    for (const c of PROBLEM_CATEGORIES) {
      categoryCounts[c.value] = withOverride({ categories: [c.value] });
    }
    const competitionCounts: Record<string, number> = {};
    for (const c of PROBLEM_COMPETITIONS) {
      competitionCounts[c.value] = withOverride({ competitions: [c.value] });
    }
    return { topicCounts, categoryCounts, competitionCounts };
  }, [filteredBySearch, filters]);

  const isFiltered =
    query.trim().length > 0 ||
    filters.topics.length > 0 ||
    filters.categories.length > 0 ||
    filters.competitions.length > 0 ||
    filters.difficultyMin > 1 ||
    filters.difficultyMax < 5;

  const toggle = <K extends "topics" | "categories" | "competitions">(
    key: K,
    value: ArchiveFilters[K][number],
  ) =>
    setFilters((f) => {
      const list = f[key] as ArchiveFilters[K][number][];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...f, [key]: next } as ArchiveFilters;
    });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <span className="badge bg-brand-purple/10 text-brand-purple">
          <Sigma className="h-4 w-4" />
          {t("arena.archiveTitle")}
        </span>
        <h1 className="section-title title-accent center mt-4">{t("arena.archiveTitle")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-charcoal/65">
          {t("arena.archiveSubtitle")}
        </p>
        <Link href="/problems/practice" className="btn-primary mx-auto mt-5 w-fit">
          <ListChecks className="h-4 w-4" />
          {lang === "bn" ? "প্র্যাকটিস টেস্ট বানাও" : "Build a practice test"}
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        <div className="relative mx-auto w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-charcoal/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("arena.search")}
            className="field-input !pl-9"
          />
        </div>

        <FilterRow label={t("arena.filterTopic")}>
          <Chip
            active={filters.topics.length === 0}
            onClick={() => setFilters((f) => ({ ...f, topics: [] }))}
            label={t("arena.allTopics")}
            tint="#222222"
          />
          {PROBLEM_TOPICS.map((tp) => (
            <Chip
              key={tp.value}
              active={filters.topics.includes(tp.value)}
              onClick={() => toggle("topics", tp.value)}
              label={`${lang === "bn" ? tp.bn : tp.en} (${counts.topicCounts[tp.value] ?? 0})`}
              tint={tp.tint}
            />
          ))}
        </FilterRow>

        <FilterRow label={t("arena.filterCategory")}>
          <Chip
            active={filters.categories.length === 0}
            onClick={() => setFilters((f) => ({ ...f, categories: [] }))}
            label={t("arena.allCategories")}
            tint="#1B4594"
            small
          />
          {PROBLEM_CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              active={filters.categories.includes(c.value)}
              onClick={() => toggle("categories", c.value)}
              label={`${lang === "bn" ? c.bn : c.en} (${counts.categoryCounts[c.value] ?? 0})`}
              tint="#1B4594"
              small
            />
          ))}
        </FilterRow>

        <FilterRow label={t("arena.filterCompetition")}>
          <Chip
            active={filters.competitions.length === 0}
            onClick={() => setFilters((f) => ({ ...f, competitions: [] }))}
            label={t("arena.allCompetitions")}
            tint="#7952B3"
            small
          />
          {PROBLEM_COMPETITIONS.map((c) => (
            <Chip
              key={c.value}
              active={filters.competitions.includes(c.value)}
              onClick={() => toggle("competitions", c.value)}
              label={`${lang === "bn" ? c.bn : c.en} (${counts.competitionCounts[c.value] ?? 0})`}
              tint="#7952B3"
              small
            />
          ))}
        </FilterRow>

        <FilterRow label={t("arena.filterDifficulty")}>
          <select
            value={filters.difficultyMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFilters((f) => ({ ...f, difficultyMin: v, difficultyMax: Math.max(v, f.difficultyMax) }));
            }}
            className="field-input !w-auto"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {difficultyLabel(n, lang)}
              </option>
            ))}
          </select>
          <span className="text-brand-charcoal/40">—</span>
          <select
            value={filters.difficultyMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFilters((f) => ({ ...f, difficultyMax: v, difficultyMin: Math.min(v, f.difficultyMin) }));
            }}
            className="field-input !w-auto"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {difficultyLabel(n, lang)}
              </option>
            ))}
          </select>
        </FilterRow>

        <div className="flex items-center justify-center gap-3 text-sm text-brand-charcoal/55">
          <span className="font-semibold">
            {visible.length} {t("arena.matchingCount")}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setQuery("");
              }}
              className="inline-flex items-center gap-1 rounded-full border-2 border-brand-lavender/30 bg-white px-3 py-1 text-xs font-bold text-brand-charcoal/70 transition hover:border-brand-lavender/60"
            >
              <RotateCcw className="h-3 w-3" />
              {t("arena.clearFilters")}
            </button>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => {
          const tm = topicMeta(p.topic);
          const category = PROBLEM_CATEGORIES.filter((c) => p.levels.includes(c.value));
          const competition = PROBLEM_COMPETITIONS.filter((c) => p.levels.includes(c.value));
          return (
            <Link
              key={p.id}
              href={`/problems/${p.slug}`}
              className="card card-glow group flex h-full flex-col gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="badge text-white" style={{ backgroundColor: tm.tint }}>
                  {lang === "bn" ? tm.bn : tm.en}
                </span>
                {p.solved ? (
                  <span className="badge bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("arena.solved")}
                  </span>
                ) : (
                  <span className="badge bg-brand-orange/10 text-brand-orange">
                    +{p.basePoints} {t("arena.points")}
                  </span>
                )}
              </div>

              <h3 className="font-display text-lg font-bold text-brand-blue group-hover:text-brand-orange">
                {lang === "bn" ? p.titleBn : p.titleEn}
              </h3>

              <div className="mt-auto flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-charcoal/55">
                <span className="rounded-full bg-brand-lavender/15 px-2.5 py-1">
                  {"●".repeat(Math.max(1, Math.min(5, p.difficulty)))}
                </span>
                <span>{difficultyLabel(p.difficulty, lang)}</span>
                {p.kind === "PROOF" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-red/10 px-2.5 py-1 text-brand-red">
                    <Target className="h-3 w-3" />
                    {lang === "bn" ? "প্রমাণ" : "Proof"}
                  </span>
                )}
                {category.map((c) => (
                  <span key={c.value} className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-brand-blue">
                    {lang === "bn" ? c.bn : c.en}
                  </span>
                ))}
                {competition.map((c) => (
                  <span key={c.value} className="rounded-full bg-brand-purple/10 px-2.5 py-1 text-brand-purple">
                    {lang === "bn" ? c.bn : c.en}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="mt-12">
          <EmptyState icon={Search} title={t("arena.noProblems")} />
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="field-label !mb-0 text-center">{label}</span>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  tint,
  small,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tint: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 font-bold transition ${
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${
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
