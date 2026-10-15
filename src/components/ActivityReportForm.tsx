"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, PlusCircle } from "lucide-react";
import { submitActivityReport } from "@/app/gonit-doot/actions";
import { INITIAL_FORM_STATE } from "@/lib/ambassadorForm";
import { useLang } from "@/lib/i18n/LangContext";
import { DISTRICTS } from "@/lib/districts";
import type { ActivityType } from "@/lib/types";

const ACTIVITY_LABELS: Record<ActivityType, { bn: string; en: string }> = {
  CAMPUS_CIRCLE: { bn: "ক্যাম্পাস সার্কেল", en: "Campus circle" },
  WORKSHOP: { bn: "কর্মশালা", en: "Workshop" },
  SCHOOL_VISIT: { bn: "স্কুল সফর", en: "School visit" },
  CONTEST_HOSTED: { bn: "কনটেস্ট আয়োজন", en: "Hosted contest" },
  ARTICLE_PUBLISHED: { bn: "আর্টিকেল প্রকাশ", en: "Article published" },
  SOCIAL_MEDIA: { bn: "সোশ্যাল ক্যাম্পেইন", en: "Social campaign" },
};

function Submit() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <PlusCircle className="h-4 w-4" />
      {pending ? "…" : t("dashboard.submitReport")}
    </button>
  );
}

export function ActivityReportForm({ defaultDistrict }: { defaultDistrict: string }) {
  const { t, lang } = useLang();
  const [state, action] = useFormState(submitActivityReport, INITIAL_FORM_STATE);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        <PlusCircle className="h-4 w-4" />
        {t("dashboard.reportTitle")}
      </button>
    );
  }

  return (
    <form action={action} className="card space-y-4">
      <h3 className="text-lg font-bold text-brand-blue">{t("dashboard.reportTitle")}</h3>

      {state.message && (
        <p
          className={
            state.ok
              ? "rounded-2xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700"
              : "rounded-2xl bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red"
          }
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{t("dashboard.activityType")}</span>
          <select name="type" className="field-input" defaultValue="CAMPUS_CIRCLE">
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {lang === "bn" ? label.bn : label.en}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">{t("apply.fields.district")}</span>
          <select name="district" className="field-input" defaultValue={defaultDistrict}>
            {DISTRICTS.map((d) => (
              <option key={d.en} value={d.en}>
                {lang === "bn" ? d.bn : d.en}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="field-label">{t("dashboard.reportFieldTitle")}</span>
        <input name="title" className="field-input" required minLength={4} />
      </label>

      <label className="block">
        <span className="field-label">{t("dashboard.description")}</span>
        <textarea name="description" className="field-input min-h-[100px]" required minLength={10} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{t("dashboard.participants")}</span>
          <input
            name="participants"
            type="number"
            min={0}
            defaultValue={0}
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="field-label">
            {lang === "bn" ? "প্রমাণ / ছবির লিংক" : "Proof / photo link"}
          </span>
          <input name="proofUrl" className="field-input" placeholder="https://…" />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Submit />
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          {t("common.back")}
        </button>
      </div>

      {state.ok && (
        <p className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" /> {t("dashboard.pending")}
        </p>
      )}
    </form>
  );
}