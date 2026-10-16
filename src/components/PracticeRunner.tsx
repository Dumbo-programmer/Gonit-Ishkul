"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Timer,
  XCircle,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { MathContent } from "@/components/MathContent";
import { difficultyLabel, topicMeta } from "@/lib/arena";
import {
  savePracticeAnswerAction,
  submitPracticeTestAction,
} from "@/app/problems/practice/actions";
import type { ProblemLevel, ProblemTopic } from "@/lib/types";

export interface RunnerProblem {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  statementBn: string;
  statementEn: string;
  topic: ProblemTopic;
  levels: ProblemLevel[];
  difficulty: number;
  basePoints: number;
  answer?: string;
  solutionBn?: string;
  solutionEn?: string;
}

export interface PracticeRunnerTest {
  id: string;
  title: string;
  timed: boolean;
  durationMin?: number;
  deadlineAt?: string;
  submittedAt?: string;
  score: number;
  maxScore: number;
  results: Record<string, boolean>;
  answers: Record<string, string>;
  startedAt: string;
}

function SubmitTestButton() {
  const { pending } = useFormStatus();
  const { lang } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Send className="h-4 w-4" />
      {pending ? "…" : lang === "bn" ? "জমা দাও" : "Submit"}
    </button>
  );
}

function useCountdown(deadlineAt?: string) {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (!deadlineAt) return;
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.parse(deadlineAt) - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineAt]);
  return seconds;
}

function formatClock(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${h > 0 ? `${pad(h)}:` : ""}${pad(m)}:${pad(s)}`;
}

export function PracticeRunner({ test, problems }: { test: PracticeRunnerTest; problems: RunnerProblem[] }) {
  const { lang } = useLang();
  const submitted = Boolean(test.submittedAt);
  const [answers, setAnswers] = useState<Record<string, string>>(test.answers ?? {});
  const [savingId, setSavingId] = useState<string | null>(null);
  const answersRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const autoSubmitted = useRef(false);

  const seconds = useCountdown(test.timed && !submitted ? test.deadlineAt : undefined);

  useEffect(() => {
    if (answersRef.current) answersRef.current.value = JSON.stringify(answers);
  }, [answers]);

  useEffect(() => {
    if (submitted || !test.timed || seconds === null) return;
    if (seconds <= 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      if (answersRef.current) answersRef.current.value = JSON.stringify(answers);
      formRef.current?.requestSubmit();
    }
  }, [seconds, submitted, test.timed, answers]);

  const correctCount = useMemo(
    () => problems.filter((p) => test.results?.[p.id]).length,
    [problems, test.results],
  );

  const breakdown = useMemo(() => {
    const map = new Map<ProblemTopic, { total: number; correct: number }>();
    for (const p of problems) {
      const row = map.get(p.topic) ?? { total: 0, correct: 0 };
      row.total += 1;
      if (test.results?.[p.id]) row.correct += 1;
      map.set(p.topic, row);
    }
    return [...map.entries()];
  }, [problems, test.results]);

  async function persist(problemId: string, value: string) {
    setSavingId(problemId);
    try {
      await savePracticeAnswerAction(test.id, problemId, value);
    } finally {
      setSavingId(null);
    }
  }

  if (submitted) {
    const pct = test.maxScore > 0 ? Math.round((test.score / test.maxScore) * 100) : 0;
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <Link href="/problems/practice" className="btn-ghost mb-6 !px-3 !py-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          {lang === "bn" ? "নতুন পরীক্ষা" : "New test"}
        </Link>

        <div className="card text-center">
          <span className="badge bg-brand-purple/10 text-brand-purple">
            <Sparkles className="h-4 w-4" />
            {lang === "bn" ? "ফলাফল" : "Results"}
          </span>
          <h1 className="mt-3 font-display text-2xl font-black text-brand-charcoal">{test.title}</h1>
          <p className="mt-6 font-display text-5xl font-black text-brand-blue">
            {test.score}
            <span className="text-2xl text-brand-charcoal/40"> / {test.maxScore}</span>
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-charcoal/60">
            {correctCount} / {problems.length} {lang === "bn" ? "সঠিক" : "correct"} · {pct}%
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {breakdown.map(([topic, row]) => {
              const tm = topicMeta(topic);
              return (
                <span
                  key={topic}
                  className="rounded-full px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: tm.tint }}
                >
                  {lang === "bn" ? tm.bn : tm.en} · {row.correct}/{row.total}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {problems.map((p, i) => {
            const ok = Boolean(test.results?.[p.id]);
            const given = test.answers?.[p.id] ?? "";
            return (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {ok ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-brand-red" />
                    )}
                    <span className="text-xs font-bold text-brand-charcoal/40">#{i + 1}</span>
                    <h2 className="font-display text-lg font-bold text-brand-charcoal">
                      {lang === "bn" ? p.titleBn : p.titleEn}
                    </h2>
                  </div>
                  <span className="badge bg-brand-orange/10 text-brand-orange">
                    {ok ? p.basePoints : 0}/{p.basePoints}
                  </span>
                </div>
                <div className="mt-3 rounded-2xl bg-brand-purple/5 px-4 py-3 text-sm leading-relaxed">
                  <MathContent text={lang === "bn" ? p.statementBn : p.statementEn} />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p className="rounded-xl bg-brand-charcoal/5 px-4 py-2 text-sm">
                    <span className="font-bold text-brand-charcoal/60">
                      {lang === "bn" ? "তোমার উত্তর: " : "Your answer: "}
                    </span>
                    <span className={ok ? "font-mono text-emerald-700" : "font-mono text-brand-red"}>
                      {given || "—"}
                    </span>
                  </p>
                  <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm">
                    <span className="font-bold text-emerald-700/70">
                      {lang === "bn" ? "সঠিক উত্তর: " : "Correct answer: "}
                    </span>
                    <span className="font-mono text-emerald-700">{p.answer}</span>
                  </p>
                </div>
                {(p.solutionBn || p.solutionEn) && (
                  <p className="mt-3 text-sm leading-relaxed text-brand-charcoal/70">
                    <span className="font-bold text-brand-blue">
                      {lang === "bn" ? "সমাধান: " : "Solution: "}
                    </span>
                    <MathContent text={(lang === "bn" ? p.solutionBn : p.solutionEn) ?? ""} />
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const lowTime = seconds !== null && seconds <= 60;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/problems/practice" className="text-xs font-semibold text-brand-charcoal/50 hover:text-brand-blue">
            ← {lang === "bn" ? "প্র্যাকটিস হোম" : "Practice home"}
          </Link>
          <h1 className="font-display text-xl font-black text-brand-charcoal">{test.title}</h1>
          <p className="text-sm text-brand-charcoal/55">
            {problems.length} {lang === "bn" ? "টি সমস্যা" : "problems"}
          </p>
        </div>
        {test.timed && seconds !== null && (
          <div className="text-right">
            <span className="field-label !mb-0">
              <Timer className="mr-1 inline h-3.5 w-3.5" />
              {lang === "bn" ? "বাকি সময়" : "Time left"}
            </span>
            <p className={`font-display text-3xl font-black ${lowTime ? "text-brand-red" : "text-brand-blue"}`}>
              {formatClock(seconds)}
            </p>
          </div>
        )}
      </div>

      <form ref={formRef} action={submitPracticeTestAction} className="mt-6">
        <input type="hidden" name="testId" value={test.id} />
        <input ref={answersRef} type="hidden" name="answers" defaultValue={JSON.stringify(answers)} />

        <div className="space-y-5">
          {problems.map((p, i) => {
            const tm = topicMeta(p.topic);
            return (
              <div key={p.id} className="card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge text-white" style={{ backgroundColor: tm.tint }}>
                    {lang === "bn" ? tm.bn : tm.en}
                  </span>
                  <span className="text-xs font-semibold text-brand-charcoal/45">
                    ▲ {difficultyLabel(p.difficulty)}
                  </span>
                  <span className="ml-auto text-xs font-bold text-brand-charcoal/40">#{i + 1}</span>
                </div>
                <h2 className="mt-2 font-display text-lg font-bold text-brand-charcoal">
                  {lang === "bn" ? p.titleBn : p.titleEn}
                </h2>
                <div className="mt-2 rounded-2xl bg-brand-purple/5 px-4 py-3 text-sm leading-relaxed">
                  <MathContent text={lang === "bn" ? p.statementBn : p.statementEn} />
                </div>
                <label className="mt-3 block">
                  <span className="field-label">
                    {lang === "bn" ? "তোমার উত্তর" : "Your answer"}
                    {savingId === p.id && <span className="ml-2 text-xs text-brand-charcoal/40">…</span>}
                  </span>
                  <input
                    className="field-input"
                    inputMode="text"
                    autoComplete="off"
                    value={answers[p.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [p.id]: e.target.value }))}
                    onBlur={(e) => persist(p.id, e.target.value)}
                  />
                </label>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <p className="mr-auto flex items-center gap-1.5 text-xs text-brand-charcoal/45">
            <Clock className="h-3.5 w-3.5" />
            {lang === "bn"
              ? "উত্তর টাইপ করার পর ফাঁকা জায়গায় ক্লিক করলে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।"
              : "Answers save automatically when you tap away."}
          </p>
          <SubmitTestButton />
        </div>
      </form>
    </div>
  );
}
