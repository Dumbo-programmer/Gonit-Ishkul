"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Eye, Lightbulb, Puzzle, Send, XCircle } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { ContestCountdown } from "@/components/ContestCountdown";
import { MathContent } from "@/components/MathContent";
import { INITIAL_PUZZLE_STATE } from "@/lib/arena";
import { submitPuzzleAnswer } from "@/app/problems/gonit-bhaiya/actions";

export interface PuzzleItem {
  id: string;
  titleBn: string;
  titleEn: string;
  promptBn: string;
  promptEn: string;
  hintBn: string;
  hintEn: string;
  revealAt: string;
  answer: string;
  solutionBn: string;
  solutionEn: string;
  revealed: boolean;
}

export interface PuzzleSubmissionView {
  content: string;
  isCorrect: boolean;
}

function Submit() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Send className="h-4 w-4" />
      {pending ? "…" : t("arena.puzzleSubmit")}
    </button>
  );
}

export function PuzzleHub({
  current,
  submission,
  past,
}: {
  current: PuzzleItem;
  submission: PuzzleSubmissionView | null;
  past: PuzzleItem[];
}) {
  const { lang, t } = useLang();
  const [state, action] = useFormState(submitPuzzleAnswer, INITIAL_PUZZLE_STATE);
  const [showHint, setShowHint] = useState(false);

  const title = lang === "bn" ? current.titleBn : current.titleEn;
  const prompt = lang === "bn" ? current.promptBn : current.promptEn;
  const hint = lang === "bn" ? current.hintBn : current.hintEn;
  const solution = lang === "bn" ? current.solutionBn : current.solutionEn;
  const correct = state.ok && state.correct !== undefined ? state.correct : submission?.isCorrect;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-14">
      <div className="text-center">
        <span className="badge bg-brand-orange/10 text-brand-orange">
          <Puzzle className="h-4 w-4" />
          {t("arena.puzzleTitle")}
        </span>
        <h1 className="section-title title-accent center mt-4">{t("arena.puzzleTitle")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-charcoal/65">{t("arena.puzzleSubtitle")}</p>
      </div>

      <article className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-brand-blue">{title}</h2>
          {current.revealed ? (
            <span className="badge bg-emerald-100 text-emerald-700">{t("arena.puzzleRevealed")}</span>
          ) : (
            <span className="badge bg-brand-blue/10 text-brand-blue">
              {t("arena.puzzleRevealIn")}: <ContestCountdown to={current.revealAt} className="ml-1" />
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-brand-purple/5 px-4 py-4 leading-relaxed">
          <MathContent text={prompt} />
        </div>

        {hint && (
          <div>
            <button
              type="button"
              onClick={() => setShowHint((s) => !s)}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-blue hover:text-brand-orange"
            >
              <Lightbulb className="h-4 w-4" />
              {t("arena.puzzleHint")}
            </button>
            {showHint && (
              <p className="mt-2 rounded-2xl bg-brand-blue/5 px-4 py-2 text-sm">
                <MathContent text={hint} />
              </p>
            )}
          </div>
        )}

        {!current.revealed && (
          <form action={action} className="space-y-3">
            <input type="hidden" name="puzzleId" value={current.id} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                name="content"
                className="field-input flex-1"
                placeholder={t("arena.puzzleAnswerPlaceholder")}
                autoComplete="off"
                required
              />
              <Submit />
            </div>
            {state.message && (
              <p className="rounded-2xl bg-brand-blue/10 px-4 py-2 text-sm font-semibold text-brand-blue">
                {state.message}
              </p>
            )}
            {submission && (
              <p className="text-sm text-brand-charcoal/60">
                {t("arena.puzzleYourAnswer")}: <span className="font-semibold">{submission.content}</span>
              </p>
            )}
          </form>
        )}

        {current.revealed && (
          <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 px-4 py-4">
            <p className="font-display text-lg font-bold text-emerald-800">
              {t("arena.puzzleAnswerLabel")}: <MathContent text={`$${current.answer}$`} />
            </p>
            {solution && (
              <div className="text-sm leading-relaxed text-brand-charcoal/80">
                <MathContent text={solution} />
              </div>
            )}
            {submission && (
              <p className={`inline-flex items-center gap-1.5 text-sm font-bold ${correct ? "text-emerald-700" : "text-brand-red"}`}>
                {correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {t("arena.puzzleYourAnswer")}: {submission.content}
              </p>
            )}
          </div>
        )}
      </article>

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="section-title title-accent mt-1 !text-2xl">{t("arena.puzzlePast")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {past.map((p) => (
              <article key={p.id} className="card card-glow space-y-2 transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-brand-blue">
                    {lang === "bn" ? p.titleBn : p.titleEn}
                  </h3>
                  <span className="badge bg-emerald-100 text-emerald-700">
                    <Eye className="h-3.5 w-3.5" />
                    {t("arena.puzzleAnswerLabel")}: {p.answer}
                  </span>
                </div>
                <div className="text-sm leading-relaxed text-brand-charcoal/70">
                  <MathContent text={lang === "bn" ? p.promptBn : p.promptEn} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
