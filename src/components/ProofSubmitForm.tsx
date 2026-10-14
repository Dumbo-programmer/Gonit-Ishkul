"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Eye, Send, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { submitProof } from "@/app/problems/actions";
import { INITIAL_ANSWER_STATE } from "@/lib/arena";
import { MathContent } from "@/components/MathContent";

function Submit() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-secondary">
      <Send className="h-4 w-4" />
      {pending ? "…" : t("arena.submitProof")}
    </button>
  );
}

export function ProofSubmitForm({
  problemId,
  slug,
}: {
  problemId: string;
  slug: string;
}) {
  const { t } = useLang();
  const [state, action] = useFormState(submitProof, INITIAL_ANSWER_STATE);
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);

  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="problemId" value={problemId} />
      <input type="hidden" name="slug" value={slug} />

      <div className="flex items-center justify-between gap-2">
        <span className="field-label !mb-0">{t("arena.proofAnswer")}</span>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange"
        >
          <Eye className="h-3.5 w-3.5" />
          {t("arena.proofAnswer")}
        </button>
      </div>

      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("arena.proofPlaceholder")}
        className="field-input min-h-[160px] font-mono text-sm"
        required
        minLength={10}
      />

      {preview && content.trim() && (
        <div className="rounded-2xl border-2 border-brand-lavender/25 bg-brand-purple/5 px-4 py-3 text-sm leading-relaxed">
          <MathContent text={content} />
        </div>
      )}

      <label className="block">
        <span className="field-label">{t("arena.attachments")}</span>
        <input
          name="attachments"
          className="field-input"
          placeholder={t("arena.attachmentsPlaceholder")}
        />
      </label>

      {state.message && (
        <p
          className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
            state.ok ? "bg-emerald-50 text-emerald-700" : "bg-brand-red/10 text-brand-red"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Submit />
        {state.ok && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> {t("arena.proofPending")}
          </span>
        )}
      </div>
    </form>
  );
}
