"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { BadgeCheck, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { submitQuizAction } from "@/app/courses/actions";
import { INITIAL_QUIZ_STATE } from "@/lib/learning";
import type { QuizQuestion } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <BadgeCheck className="h-4 w-4" />
      {pending ? "…" : label}
    </button>
  );
}

export function QuizPanel({
  courseId,
  slug,
  lectureId,
  passPercent,
  questions,
  alreadyPassed,
  onPassed,
}: {
  courseId: string;
  slug: string;
  lectureId: string;
  passPercent: number;
  questions: QuizQuestion[];
  alreadyPassed: boolean;
  onPassed?: () => void;
}) {
  const { lang, t } = useLang();
  const [state, action] = useFormState(submitQuizAction, INITIAL_QUIZ_STATE);
  const [answers, setAnswers] = useState<(number | null)[]>(
    questions.map(() => null),
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (state.passed) onPassed?.();
  }, [state.passed, onPassed]);

  if (alreadyPassed && !state.ok) {
    return (
      <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
        <p className="mt-2 font-bold text-emerald-700">{t("courses.passed")}</p>
        <p className="mt-1 text-sm text-emerald-700/80">{t("courses.quizIntro")}</p>
      </div>
    );
  }

  const answeredAll = answers.every((a) => a !== null);

  return (
    <form action={action} key={attempt} className="card">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="lectureId" value={lectureId} />

      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-brand-orange" />
        <h3 className="text-lg font-bold text-brand-blue">{t("courses.quiz")}</h3>
        <span className="badge ml-auto bg-brand-orange/10 text-brand-orange">
          pass ≥ {passPercent}%
        </span>
      </div>
      <p className="mt-1 text-sm text-brand-charcoal/60">{t("courses.quizIntro")}</p>

      {state.message && (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
            state.passed
              ? "bg-emerald-50 text-emerald-700"
              : "bg-brand-red/10 text-brand-red"
          }`}
        >
          {state.ok && state.total ? (
            <span>
              {t("courses.youScored")}: {state.correct}/{state.total} ({state.percent}%) —{" "}
              {state.passed ? t("courses.passed") : t("courses.failed")}
            </span>
          ) : (
            state.message
          )}
        </div>
      )}

      <ol className="mt-4 space-y-5">
        {questions.map((q, qi) => {
          const correct = state.results?.[qi];
          return (
            <li key={q.id}>
              <p className="font-semibold text-brand-charcoal">
                <span className="mr-2 text-brand-purple">
                  {t("courses.question")} {qi + 1}.
                </span>
                {lang === "bn" ? q.promptBn : q.promptEn}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const isPicked = answers[qi] === oi;
                  const showResult = state.ok && state.results;
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm transition ${
                        showResult
                          ? correct === undefined
                            ? ""
                            : isPicked
                              ? correct
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-brand-red/50 bg-brand-red/5"
                              : "border-brand-lavender/20"
                          : isPicked
                            ? "border-brand-orange bg-brand-orange/5"
                            : "border-brand-lavender/25 hover:border-brand-lavender/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`answer_${qi}`}
                        value={oi}
                        checked={isPicked}
                        onChange={() =>
                          setAnswers((prev) => {
                            const next = [...prev];
                            next[qi] = oi;
                            return next;
                          })
                        }
                        className="accent-brand-orange"
                      />
                      <span className="flex-1">{lang === "bn" ? opt.bn : opt.en}</span>
                      {showResult && isPicked && correct !== undefined && (
                        correct ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-brand-red" />
                        )
                      )}
                    </label>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SubmitButton label={state.ok ? t("courses.retake") : t("courses.submitQuiz")} />
        {!answeredAll && (
          <span className="text-xs font-semibold text-brand-charcoal/50">
            {lang === "bn" ? "সব প্রশ্নের উত্তর দিন" : "Answer all questions"}
          </span>
        )}
        {state.ok && !state.passed && (
          <button
            type="button"
            onClick={() => {
              setAnswers(questions.map(() => null));
              setAttempt((a) => a + 1);
            }}
            className="btn-ghost"
          >
            {t("courses.retake")}
          </button>
        )}
      </div>
    </form>
  );
}
