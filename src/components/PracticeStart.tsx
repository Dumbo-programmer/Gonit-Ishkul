"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { History, ListChecks, Play, Sparkles, Timer, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { Spinner } from "@/components/PageLoader";
import { PROBLEM_LEVELS, PROBLEM_TOPICS, difficultyLabel } from "@/lib/arena";
import {
  PRACTICE_DURATIONS,
  PRACTICE_MAX_SIZE,
  PRACTICE_MIN_SIZE,
  matchesFilters,
  type PracticeFilterConfig,
  type PracticeFilterable,
} from "@/lib/practice";
import type { ProblemLevel, ProblemTopic } from "@/lib/types";
import { startPracticeTestAction, deletePracticeTestAction } from "@/app/problems/practice/actions";

export interface PracticeHistoryItem {
  id: string;
  title: string;
  size: number;
  timed: boolean;
  durationMin?: number;
  score: number;
  maxScore: number;
  submittedAt?: string;
  startedAt: string;
}

export interface PracticeStartProps {
  pool: PracticeFilterable[];
  history: PracticeHistoryItem[];
  error?: string;
}

function StartButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const { lang } = useLang();
  return (
    <button type="submit" disabled={pending || disabled} className="btn-primary w-full disabled:opacity-50">
      {pending ? <Spinner className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {pending
        ? lang === "bn"
          ? "পরীক্ষা তৈরি হচ্ছে…"
          : "Creating test…"
        : lang === "bn"
          ? "পরীক্ষা শুরু করো"
          : "Start test"}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-ghost !px-3 !py-2 disabled:opacity-50"
      aria-label="Delete"
    >
      {pending ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

export function PracticeStart({ pool, history, error }: PracticeStartProps) {
  const { lang } = useLang();
  const [topics, setTopics] = useState<ProblemTopic[]>([]);
  const [levels, setLevels] = useState<ProblemLevel[]>([]);
  const [difficultyMin, setDifficultyMin] = useState(1);
  const [difficultyMax, setDifficultyMax] = useState(5);
  const [size, setSize] = useState(10);
  const [timed, setTimed] = useState(false);
  const [durationMin, setDurationMin] = useState(30);

  const eligibleCount = useMemo(
    () => countEligible(pool, { topics, levels, difficultyMin, difficultyMax }),
    [pool, topics, levels, difficultyMin, difficultyMax],
  );

  // A level is only offerable if some problem at that level also falls inside the
  // chosen difficulty range (and matches the selected topics). This stops
  // contradictory picks like "Easy" + "IMO", which would otherwise match nothing.
  const availableLevels = useMemo(() => {
    const set = new Set<ProblemLevel>();
    for (const problem of pool) {
      if (topics.length > 0 && !topics.includes(problem.topic)) continue;
      if (problem.difficulty < difficultyMin || problem.difficulty > difficultyMax) continue;
      for (const level of problem.levels) set.add(level);
    }
    return set;
  }, [pool, topics, difficultyMin, difficultyMax]);

  useEffect(() => {
    setLevels((list) => {
      const next = list.filter((level) => availableLevels.has(level));
      return next.length === list.length ? list : next;
    });
  }, [availableLevels]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <span className="badge bg-brand-orange/10 text-brand-orange">
          <Sparkles className="h-4 w-4" />
          {lang === "bn" ? "মক টেস্ট জেনারেটর" : "Mock Test Generator"}
        </span>
        <h1 className="section-title title-accent center mt-4">
          {lang === "bn" ? "নিজের প্র্যাকটিস টেস্ট বানাও" : "Build your own practice test"}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-charcoal/65">
          {lang === "bn"
            ? "বিষয়, স্তর ও কঠিনতা বেছে নাও — সিস্টেম এলোমেলোভাবে সমস্যা বাছাই করে একটি মক পরীক্ষা তৈরি করবে, জমা দিলে সাথে সাথে উত্তর যাচাই হবে।"
            : "Pick topics, levels and difficulty — we'll assemble a random mock exam and auto-grade your answers the moment you submit."}
        </p>
      </div>

      {error === "insufficient" && (
        <p className="mx-auto mt-6 max-w-2xl rounded-2xl bg-brand-red/10 px-4 py-3 text-center text-sm font-semibold text-brand-red">
          {lang === "bn"
            ? "নির্বাচিত ফিল্টারে যথেষ্ট সমস্যা নেই। একটু শিথিল করে আবার চেষ্টা করো।"
            : "Not enough problems match those filters. Loosen them and try again."}
        </p>
      )}

      <form action={startPracticeTestAction} className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card space-y-6">
          <div>
            <p className="field-label">{lang === "bn" ? "বিষয় (একাধিক)" : "Topics (multi-select)"}</p>
            <div className="flex flex-wrap gap-2">
              {PROBLEM_TOPICS.map((tp) => (
                <Toggle
                  key={tp.value}
                  active={topics.includes(tp.value)}
                  tint={tp.tint}
                  onClick={() => setTopics((list) => (list.includes(tp.value) ? list.filter((v) => v !== tp.value) : [...list, tp.value]))}
                  label={lang === "bn" ? tp.bn : tp.en}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-brand-charcoal/45">
              {topics.length === 0
                ? lang === "bn"
                  ? "কিছু নির্বাচন না করলে সব বিষয় ধরা হবে।"
                  : "None selected = all topics."
                : null}
            </p>
          </div>

          <div>
            <p className="field-label">{lang === "bn" ? "স্তর (একাধিক)" : "Levels (multi-select)"}</p>
            <div className="flex flex-wrap gap-2">
              {PROBLEM_LEVELS.map((lv) => (
                <Toggle
                  key={lv.value}
                  small
                  active={levels.includes(lv.value)}
                  disabled={!availableLevels.has(lv.value)}
                  tint="#1B4594"
                  onClick={() => setLevels((list) => (list.includes(lv.value) ? list.filter((v) => v !== lv.value) : [...list, lv.value]))}
                  label={lang === "bn" ? lv.bn : lv.en}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-brand-charcoal/45">
              {lang === "bn"
                ? "নির্বাচিত কঠিনতার সাথে মেলে না এমন স্তর নিষ্ক্রিয় থাকে — যেমন সহজ কঠিনতায় IMO নয়।"
                : "Levels that don't match the chosen difficulty are disabled — e.g. no IMO under Easy."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="field-label">{lang === "bn" ? "সর্বনিম্ন কঠিনতা" : "Min difficulty"}</span>
              <select
                name="difficultyMin"
                value={difficultyMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDifficultyMin(v);
                  if (v > difficultyMax) setDifficultyMax(v);
                }}
                className="field-input"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {difficultyLabel(n, lang)} ({n})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">{lang === "bn" ? "সর্বোচ্চ কঠিনতা" : "Max difficulty"}</span>
              <select
                name="difficultyMax"
                value={difficultyMax}
                onChange={(e) => setDifficultyMax(Number(e.target.value))}
                className="field-input"
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {difficultyLabel(d, lang)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="field-label">{lang === "bn" ? "সমস্যার সংখ্যা" : "Number of problems"}</span>
              <input
                type="number"
                name="size"
                min={PRACTICE_MIN_SIZE}
                max={PRACTICE_MAX_SIZE}
                value={size}
                onChange={(e) => setSize(Math.max(PRACTICE_MIN_SIZE, Math.min(PRACTICE_MAX_SIZE, Number(e.target.value) || PRACTICE_MIN_SIZE)))}
                className="field-input"
              />
            </label>
          </div>
          <p className="text-xs text-brand-charcoal/45">
            {lang === "bn"
              ? "শুধুমাত্র সংখ্যাগত উত্তরসহ সমস্যা যুক্ত হবে (স্বয়ংক্রিয় যাচাই)।"
              : "Only numeric-answer problems are included (for auto-grading)."}
          </p>

          <div className="hidden">
            {topics.map((tp) => (
              <input key={tp} type="hidden" name="topics" value={tp} />
            ))}
            {levels.map((lv) => (
              <input key={lv} type="hidden" name="levels" value={lv} />
            ))}
          </div>
        </div>

        <div className="card flex flex-col gap-5">
          <div className="rounded-2xl bg-brand-purple/5 p-4">
            <span className="field-label !mb-1">{lang === "bn" ? "মিলে যাওয়া সমস্যা" : "Matching problems"}</span>
            <p className="font-display text-4xl font-black text-brand-blue">{eligibleCount}</p>
            <p className="text-xs text-brand-charcoal/50">
              {lang === "bn" ? `যার মধ্যে থেকে সর্বোচ্চ ${size}টি বাছাই হবে` : `up to ${size} will be selected`}
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border-2 border-brand-lavender/25 px-4 py-3">
            <input
              type="checkbox"
              name="timed"
              checked={timed}
              onChange={(e) => setTimed(e.target.checked)}
              className="h-4 w-4 accent-[#FF781E]"
            />
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal/80">
              <Timer className="h-4 w-4 text-brand-orange" />
              {lang === "bn" ? "সময়সীমা সহ" : "Add a time limit"}
            </span>
          </label>

          {timed && (
            <label className="block">
              <span className="field-label">{lang === "bn" ? "সময়সীমা (মিনিট)" : "Duration (minutes)"}</span>
              <select
                name="durationMin"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="field-input"
              >
                {PRACTICE_DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} {lang === "bn" ? "মিনিট" : "min"}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="mt-auto">
            <StartButton disabled={eligibleCount < Math.min(size, PRACTICE_MIN_SIZE)} />
          </div>
        </div>
      </form>

      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-brand-charcoal">
            <History className="h-5 w-5 text-brand-purple" />
            {lang === "bn" ? "তোমার আগের পরীক্ষাগুলো" : "Your previous tests"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((h) => (
              <div key={h.id} className="card flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="badge bg-brand-lavender/15 text-brand-purple">
                    <ListChecks className="h-3.5 w-3.5" />
                    {h.size}
                  </span>
                  {h.submittedAt ? (
                    <span className="badge bg-emerald-100 text-emerald-700">
                      {h.score}/{h.maxScore}
                    </span>
                  ) : (
                    <span className="badge bg-brand-orange/10 text-brand-orange">
                      {lang === "bn" ? "অসম্পূর্ণ" : "In progress"}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-sm font-semibold text-brand-charcoal/80">{h.title}</p>
                <div className="mt-auto flex items-center gap-2">
                  <Link
                    href={`/problems/practice/${h.id}`}
                    className="btn-secondary flex-1 !px-3 !py-2 text-center text-sm"
                  >
                    {h.submittedAt
                      ? lang === "bn"
                        ? "ফলাফল"
                        : "Results"
                      : lang === "bn"
                        ? "চালিয়ে যাও"
                        : "Resume"}
                  </Link>
                  <form action={deletePracticeTestAction}>
                    <input type="hidden" name="testId" value={h.id} />
                    <DeleteButton />
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function countEligible(pool: PracticeFilterable[], config: PracticeFilterConfig): number {
  return pool.filter((p) => matchesFilters(p, config)).length;
}

function Toggle({
  active,
  onClick,
  label,
  tint,
  small,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tint: string;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? label : undefined}
      className={`rounded-full border-2 font-bold transition ${
        small ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
      } ${
        disabled
          ? "cursor-not-allowed border-brand-charcoal/10 text-brand-charcoal/25 line-through"
          : `border-brand-lavender/40 ${
              active ? "text-white" : "text-brand-charcoal/70 hover:border-brand-lavender"
            }`
      }`}
      style={!disabled && active ? { borderColor: tint, backgroundColor: tint } : undefined}
    >
      {label}
    </button>
  );
}
