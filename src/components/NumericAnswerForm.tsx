"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Send, XCircle } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { submitNumericAnswer } from "@/app/problems/actions";
import { INITIAL_ANSWER_STATE } from "@/lib/arena";

function Submit() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Send className="h-4 w-4" />
      {pending ? "…" : t("arena.submitAnswer")}
    </button>
  );
}

export function NumericAnswerForm({
  problemId,
  slug,
}: {
  problemId: string;
  slug: string;
}) {
  const { t } = useLang();
  const [state, action] = useFormState(submitNumericAnswer, INITIAL_ANSWER_STATE);

  return (
    <form action={action} className="card">
      <input type="hidden" name="problemId" value={problemId} />
      <input type="hidden" name="slug" value={slug} />
      <label className="field-label" htmlFor="numeric-answer">
        {t("arena.numericAnswer")}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="numeric-answer"
          name="answer"
          inputMode="text"
          autoComplete="off"
          placeholder={t("arena.numericPlaceholder")}
          className="field-input flex-1"
          required
        />
        <Submit />
      </div>

      {state.message && (
        <p className="mt-3 rounded-2xl bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red">
          {state.message}
        </p>
      )}
      {state.ok && state.correct !== undefined && (
        <p
          className={`mt-3 flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
            state.correct ? "bg-emerald-50 text-emerald-700" : "bg-brand-red/10 text-brand-red"
          }`}
        >
          {state.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {state.correct ? t("arena.correct") : t("arena.wrong")}
        </p>
      )}
    </form>
  );
}
