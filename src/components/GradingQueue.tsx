"use client";

import { useFormStatus } from "react-dom";
import { ClipboardCheck, Link2, User } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { gradeSubmissionAction } from "@/app/problems/actions";
import { MathContent } from "@/components/MathContent";
import { EmptyState } from "@/components/EmptyState";

export interface GradingItem {
  id: string;
  problemTitleBn: string;
  problemTitleEn: string;
  studentName: string;
  content: string;
  attachments: string[];
  submittedAt: string;
}

function GradeButton() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary !px-4 !py-2 text-sm">
      <ClipboardCheck className="h-4 w-4" />
      {pending ? "…" : t("arena.grade")}
    </button>
  );
}

export function GradingQueue({ items }: { items: GradingItem[] }) {
  const { lang, t } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="text-center">
        <span className="badge bg-brand-purple/10 text-brand-purple">
          <ClipboardCheck className="h-4 w-4" />
          {t("arena.gradingTitle")}
        </span>
        <h1 className="section-title title-accent center mt-4">{t("arena.gradingTitle")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-charcoal/65">{t("arena.gradingSubtitle")}</p>
      </div>

      <div className="mt-8 space-y-5">
        {items.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title={t("arena.gradingEmpty")} />
        ) : (
          items.map((item) => (
            <GradingCard key={item.id} item={item} lang={lang} t={t} />
          ))
        )}
      </div>
    </div>
  );
}

function GradingCard({
  item,
  lang,
  t,
}: {
  item: GradingItem;
  lang: "bn" | "en";
  t: (key: string) => string;
}) {
  return (
    <article className="card space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="badge bg-brand-purple/10 text-brand-purple">
          <User className="h-3.5 w-3.5" />
          {item.studentName}
        </span>
        <span className="font-display font-bold text-brand-blue">
          {lang === "bn" ? item.problemTitleBn : item.problemTitleEn}
        </span>
        <span className="ml-auto text-xs text-brand-charcoal/50">
          {new Date(item.submittedAt).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}
        </span>
      </div>

      <div className="rounded-2xl bg-brand-purple/5 px-4 py-3 text-sm leading-relaxed">
        <MathContent text={item.content} />
      </div>

      {item.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.attachments.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="badge bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20"
            >
              <Link2 className="h-3.5 w-3.5" />
              {url.replace(/^https?:\/\//, "").slice(0, 40)}
            </a>
          ))}
        </div>
      )}

      <form action={gradeSubmissionAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="submissionId" value={item.id} />
        <label className="block sm:w-48">
          <span className="field-label">{t("arena.verdictLabel")}</span>
          <select name="verdict" className="field-input" defaultValue="ACCEPTED">
            <option value="ACCEPTED">{t("arena.graderAccept")}</option>
            <option value="PARTIAL">{t("arena.graderPartial")}</option>
            <option value="WRONG">{t("arena.graderWrong")}</option>
          </select>
        </label>
        <label className="block flex-1">
          <span className="field-label">{t("arena.feedback")}</span>
          <input name="feedback" className="field-input" placeholder={t("arena.feedback")} />
        </label>
        <GradeButton />
      </form>
    </article>
  );
}
