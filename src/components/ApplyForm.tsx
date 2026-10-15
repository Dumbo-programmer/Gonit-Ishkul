"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { submitApplication } from "@/app/gonit-doot/actions";
import { INITIAL_FORM_STATE } from "@/lib/ambassadorForm";
import { useLang } from "@/lib/i18n/LangContext";
import { DISTRICTS, DIVISIONS, DISTRICT_BY_EN } from "@/lib/districts";
import { useState } from "react";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
      {pending ? "…" : label}
    </button>
  );
}

export function ApplyForm() {
  const { t, lang } = useLang();
  const [state, formAction] = useFormState(submitApplication, INITIAL_FORM_STATE);
  const [division, setDivision] = useState("Dhaka");
  const districts = DISTRICTS.filter((d) => d.division === division);

  if (state.ok && state.trackingCode) {
    return (
      <div className="card text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-brand-orange" />
        <h2 className="text-2xl font-bold text-brand-blue">{t("apply.success")}</h2>
        <p className="mt-2 text-brand-charcoal/80">{t("apply.tracked")}</p>
        <p className="mt-3 inline-block rounded-2xl bg-brand-lavender/15 px-6 py-3 font-mono text-2xl font-bold tracking-widest text-brand-blue">
          {state.trackingCode}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/gonit-doot/status?code=${state.trackingCode}`}
            className="btn-secondary"
          >
            {t("doot.statusBadge")}
          </Link>
          <Link href="/gonit-doot" className="btn-ghost">
            {t("common.back")}
          </Link>
        </div>
      </div>
    );
  }

  const err = (name: string) => state.errors?.[name];

  return (
    <form action={formAction} className="card space-y-5">
      {state.message && !state.ok && (
        <p className="flex items-center gap-2 rounded-2xl bg-brand-red/10 px-4 py-3 text-sm font-semibold text-brand-red">
          <AlertCircle className="h-4 w-4" /> {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("apply.fields.fullName")} error={err("fullName")}>
          <input name="fullName" className="field-input" required minLength={3} />
        </Field>
        <Field label={t("apply.fields.email")} error={err("email")}>
          <input name="email" type="email" className="field-input" required />
        </Field>
        <Field label={t("apply.fields.phone")} error={err("phone")}>
          <input
            name="phone"
            className="field-input"
            placeholder="01XXXXXXXXX"
            required
          />
        </Field>
        <Field label={t("apply.fields.studentId")} hint={t("common.optional")}>
          <input name="studentId" className="field-input" />
        </Field>
        <Field label={t("apply.fields.university")} error={err("university")}>
          <input name="university" className="field-input" required />
        </Field>
        <Field label={t("apply.fields.department")} error={err("department")}>
          <input name="department" className="field-input" required />
        </Field>
        <Field label={t("apply.fields.division")}>
          <select
            name="division"
            className="field-input"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          >
            {DIVISIONS.map((d) => (
              <option key={d.en} value={d.en}>
                {lang === "bn" ? d.bn : d.en}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("apply.fields.district")} error={err("district")}>
          <select name="district" className="field-input" required>
            {districts.map((d) => (
              <option key={d.en} value={d.en}>
                {lang === "bn" ? d.bn : d.en}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label={t("apply.fields.statement")}
        error={err("statement")}
        hint={lang === "bn" ? "২০০–৪০০ শব্দ" : "200–400 words"}
      >
        <textarea name="statement" className="field-input min-h-[140px]" required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("apply.fields.resumeUrl")} error={err("resumeUrl")} hint={t("common.optional")}>
          <input name="resumeUrl" className="field-input" placeholder="https://…" />
        </Field>
        <Field label={t("apply.fields.shareUrl")} error={err("shareUrl")} hint={t("common.optional")}>
          <input name="shareUrl" className="field-input" placeholder="https://facebook.com/…" />
        </Field>
      </div>

      <p className="text-xs text-brand-charcoal/60">
        {lang === "bn"
          ? "নির্বাচিত হলে তোমার দেওয়া ইমেইলে যোগাযোগ করা হবে। আবেদন জমা দিয়ে ট্র্যাকিং কোড সংরক্ষণ করো।"
          : "If shortlisted we will contact you at the email provided. Save your tracking code after submitting."}
      </p>

      <SubmitButton label={t("common.submit")} />
      <span className="hidden">{DISTRICT_BY_EN.size}</span>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label flex items-center justify-between">
        {label}
        {hint && <span className="text-[11px] font-normal text-brand-charcoal/50">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-brand-red">{error}</span>}
    </label>
  );
}