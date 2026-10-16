"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ListChecks, Search, Sigma, Target } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { EmptyState } from "@/components/EmptyState";
import { PROBLEM_LEVELS, PROBLEM_TOPICS, difficultyLabel, levelLabel, topicMeta } from "@/lib/arena";
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

export function ProblemArchive({ problems }: { problems: ProblemArchiveItem[] }) {
  const { lang, t } = useLang();
  const [topic, setTopic] = useState<ProblemTopic | "ALL">("ALL");
  const [level, setLevel] = useState<ProblemLevel | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (topic !== "ALL" && p.topic !== topic) return false;
      if (level !== "ALL" && !p.levels.includes(level)) return false;
      if (q) {
        const hay = `${p.titleBn} ${p.titleEn} ${p.source}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [problems, topic, level, query]);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of problems) counts[p.topic] = (counts[p.topic] ?? 0) + 1;
    return counts;
  }, [problems]);

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
        <Link
          href="/problems/practice"
          className="btn-primary mx-auto mt-5 w-fit"
        >
          <ListChecks className="h-4 w-4" />
          {lang === "bn" ? "প্র্যাকটিস টেস্ট বানাও" : "Build a practice test"}
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div className="relative mx-auto w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-charcoal/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("arena.search")}
            className="field-input !pl-9"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Chip active={topic === "ALL"} onClick={() => setTopic("ALL")} label={t("arena.allTopics")} tint="#222222" />
          {PROBLEM_TOPICS.map((tp) => (
            <Chip
              key={tp.value}
              active={topic === tp.value}
              onClick={() => setTopic(tp.value)}
              label={`${lang === "bn" ? tp.bn : tp.en} (${topicCounts[tp.value] ?? 0})`}
              tint={tp.tint}
            />
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Chip active={level === "ALL"} onClick={() => setLevel("ALL")} label={t("arena.allLevels")} tint="#7952B3" small />
          {PROBLEM_LEVELS.map((lv) => (
            <Chip
              key={lv.value}
              active={level === lv.value}
              onClick={() => setLevel(lv.value)}
              label={lang === "bn" ? lv.bn : lv.en}
              tint="#1B4594"
              small
            />
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => {
          const tm = topicMeta(p.topic);
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
                  {"▲".repeat(Math.max(1, Math.min(5, p.difficulty)))}
                </span>
                <span>{difficultyLabel(p.difficulty)}</span>
                {p.kind === "PROOF" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-red/10 px-2.5 py-1 text-brand-red">
                    <Target className="h-3 w-3" />
                    {lang === "bn" ? "প্রমাণ" : "Proof"}
                  </span>
                )}
                <span className="ml-auto">{levelLabel(p.levels[0]).en}…</span>
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
