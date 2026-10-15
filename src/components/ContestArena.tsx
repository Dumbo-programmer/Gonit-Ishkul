"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertTriangle,
  CircleDashed,
  Play,
  Send,
  Trophy,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { ContestCountdown } from "@/components/ContestCountdown";
import { MathContent } from "@/components/MathContent";
import type { ContestPhase } from "@/lib/arena";
import { saveContestAnswerAction, startContestAction, submitContestAction } from "@/app/contests/actions";
import type { ProblemKind } from "@/lib/types";

export interface ArenaProblem {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  statementBn: string;
  statementEn: string;
  kind: ProblemKind;
  basePoints: number;
}

export interface ArenaStanding {
  rank: number;
  name: string;
  score: number;
  rating: number;
  isYou: boolean;
}

export interface ContestArenaProps {
  contest: {
    id: string;
    slug: string;
    titleBn: string;
    titleEn: string;
    phase: ContestPhase;
    durationMinutes: number;
    editorialBn: string;
    editorialEn: string;
  };
  problems: ArenaProblem[];
  entry:
    | {
        startedAt: string;
        submittedAt?: string;
        score: number;
        answers: Record<string, string>;
      }
    | null;
  deadline: string;
  loggedIn: boolean;
  standings: ArenaStanding[];
}

function SubmitContest() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Send className="h-4 w-4" />
      {pending ? "…" : t("arena.submitContest")}
    </button>
  );
}

function StartButton() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Play className="h-4 w-4" />
      {pending ? "…" : t("arena.enterContest")}
    </button>
  );
}

export function ContestArena(props: ContestArenaProps) {
  const { contest, problems, entry, deadline, loggedIn, standings } = props;
  const { lang, t } = useLang();
  const [answers, setAnswers] = useState<Record<string, string>>(entry?.answers ?? {});
  const [savingId, setSavingId] = useState<string | null>(null);

  const title = lang === "bn" ? contest.titleBn : contest.titleEn;

  async function persist(problemId: string, value: string) {
    setSavingId(problemId);
    try {
      await saveContestAnswerAction(contest.id, problemId, value);
    } finally {
      setSavingId(null);
    }
  }

  if (contest.phase === "upcoming") {
    return (
      <Notice
        icon={<CircleDashed className="h-6 w-6" />}
        text={t("arena.contestNotStarted")}
        extra={<ContestCountdown to={deadline} className="font-display text-2xl font-bold text-brand-blue" />}
      />
    );
  }

  const active = contest.phase === "live" && !!entry && !entry.submittedAt;
  const submitted = !!entry?.submittedAt;

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-blue">{title}</h1>
          <p className="text-sm text-brand-charcoal/60">
            {problems.length} {lang === "bn" ? "সমস্যা" : "problems"} · {contest.durationMinutes} min
          </p>
        </div>
        {active && (
          <div className="text-right">
            <span className="field-label !mb-0">{t("arena.timeLeft")}</span>
            <ContestCountdown to={deadline} className="block font-display text-3xl font-extrabold text-brand-red" />
          </div>
        )}
        {submitted && (
          <span className="badge bg-emerald-100 text-emerald-700">
            <Trophy className="h-4 w-4" />
            {t("arena.contestSubmitted")} · {entry?.score}
          </span>
        )}
      </div>

      {contest.phase === "ended" && !entry && (
        <Notice icon={<AlertTriangle className="h-6 w-6" />} text={t("arena.contestClosed")} />
      )}

      {contest.phase === "live" && !entry && loggedIn && (
        <div className="card text-center">
          <p className="mb-4 text-brand-charcoal/70">{t("arena.enterContest")}</p>
          <form action={startContestAction} className="flex justify-center">
            <input type="hidden" name="slug" value={contest.slug} />
            <StartButton />
          </form>
        </div>
      )}

      {contest.phase === "live" && !entry && !loggedIn && (
        <Notice icon={<AlertTriangle className="h-6 w-6" />} text={t("arena.enterContestLogin")} />
      )}

      {active && (
        <>
          <div className="space-y-5">
            {problems.map((p) => (
              <article key={p.id} className="card space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-brand-blue">
                    {lang === "bn" ? p.titleBn : p.titleEn}
                  </h2>
                  <span className="badge bg-brand-orange/10 text-brand-orange">+{p.basePoints}</span>
                </div>
                <div className="rounded-2xl bg-brand-purple/5 px-4 py-3 text-sm leading-relaxed">
                  <MathContent text={lang === "bn" ? p.statementBn : p.statementEn} />
                </div>
                <label className="block">
                  <span className="field-label">
                    {t("arena.numericAnswer")}
                    {savingId === p.id && <span className="ml-2 text-xs text-brand-charcoal/40">…</span>}
                  </span>
                  {p.kind === "PROOF" ? (
                    <textarea
                      className="field-input min-h-[110px] font-mono text-sm"
                      value={answers[p.id] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [p.id]: e.target.value }))}
                      onBlur={(e) => persist(p.id, e.target.value)}
                    />
                  ) : (
                    <input
                      className="field-input"
                      inputMode="text"
                      autoComplete="off"
                      value={answers[p.id] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [p.id]: e.target.value }))}
                      onBlur={(e) => persist(p.id, e.target.value)}
                    />
                  )}
                </label>
              </article>
            ))}
          </div>

          <form action={submitContestAction} className="flex justify-end">
            <input type="hidden" name="slug" value={contest.slug} />
            <SubmitContest />
          </form>
        </>
      )}

      <StandingsStandalone standings={standings} />
    </div>
  );
}

function StandingsStandalone({ standings }: { standings: ArenaStanding[] }) {
  const { t } = useLang();
  if (standings.length === 0) return null;
  return (
    <div className="card">
        <h2 className="section-title title-accent mt-2">{t("arena.standings")}</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-brand-lavender/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-purple/10 font-display text-brand-charcoal/70">
            <tr>
              <th className="px-4 py-2">{t("arena.rank")}</th>
              <th className="px-4 py-2">{t("arena.name")}</th>
              <th className="px-4 py-2 text-right">{t("arena.score")}</th>
              <th className="px-4 py-2 text-right">{t("arena.rating")}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr
                key={row.rank}
                className={row.isYou ? "bg-brand-orange/10 font-bold" : "odd:bg-white even:bg-brand-purple/5"}
              >
                <td className="px-4 py-2">{row.rank}</td>
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2 text-right">{row.score}</td>
                <td className="px-4 py-2 text-right">{row.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Notice({
  icon,
  text,
  extra,
}: {
  icon: React.ReactNode;
  text: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <span className="text-brand-orange">{icon}</span>
      <p className="font-semibold text-brand-charcoal/70">{text}</p>
      {extra}
    </div>
  );
}
