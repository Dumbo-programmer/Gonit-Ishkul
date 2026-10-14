"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileSearch,
  MessageSquare,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { cn, formatDate } from "@/lib/utils";
import type { ApplicationRecord, ApplicationStatus } from "@/lib/types";

const FLOW: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "ACCEPTED",
];

const LABELS: Record<ApplicationStatus, { bn: string; en: string }> = {
  SUBMITTED: { bn: "আবেদন জমা", en: "Submitted" },
  UNDER_REVIEW: { bn: "পর্যালোচনাধীন", en: "Under Review" },
  SHORTLISTED: { bn: "শর্টলিস্টেড", en: "Shortlisted" },
  INTERVIEW: { bn: "সাক্ষাৎকার", en: "Interview" },
  ACCEPTED: { bn: "গৃহীত", en: "Accepted" },
  REJECTED: { bn: "বাতিল", en: "Rejected" },
};

const ICONS: Record<ApplicationStatus, typeof Circle> = {
  SUBMITTED: FileSearch,
  UNDER_REVIEW: Clock,
  SHORTLISTED: MessageSquare,
  INTERVIEW: UserCheck,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
};

export function StatusResult({
  application,
  query,
}: {
  application: ApplicationRecord | null;
  query?: string;
}) {
  const { t, lang } = useLang();

  if (!application) {
    return (
      <div className="card border-brand-red/30 text-center">
        <XCircle className="mx-auto mb-3 h-12 w-12 text-brand-red" />
        <h2 className="text-lg font-bold text-brand-red">{t("status.notFound")}</h2>
        {query && (
          <p className="mt-2 text-sm text-brand-charcoal/60">
            &ldquo;{query}&rdquo;
          </p>
        )}
        <Link href="/gonit-doot/apply" className="btn-primary mt-6">
          {t("doot.apply")}
        </Link>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(application.status);
  const rejected = application.status === "REJECTED";

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-charcoal/50">
              {t("status.code")}
            </p>
            <p className="font-mono text-2xl font-bold tracking-widest text-brand-blue">
              {application.trackingCode}
            </p>
          </div>
          <span
            className={cn(
              "badge text-white",
              rejected ? "bg-brand-red" : "bg-brand-orange",
            )}
          >
            {lang === "bn" ? LABELS[application.status].bn : LABELS[application.status].en}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <Detail label={t("status.name")} value={application.fullName} />
          <Detail
            label={t("status.district")}
            value={application.district}
          />
          <Detail
            label={t("status.submittedOn")}
            value={formatDate(application.createdAt, lang === "bn" ? "bn-BD" : "en-GB")}
          />
        </dl>
      </div>

      <div className="card">
        <h2 className="mb-6 text-lg font-bold text-brand-blue">
          {t("status.timeline")}
        </h2>
        <ol className="relative space-y-6 border-l-2 border-brand-lavender/30 pl-6">
          {FLOW.map((status, i) => {
            const reached = !rejected && i <= currentIndex;
            const Icon = ICONS[status];
            const entry = application.timeline.find((tl) => tl.status === status);
            return (
              <li key={status} className="relative">
                <span
                  className={cn(
                    "absolute -left-[2.15rem] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white",
                    reached ? "bg-brand-orange text-white" : "bg-brand-lavender/25 text-brand-blue/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p
                  className={cn(
                    "font-semibold",
                    reached ? "text-brand-blue" : "text-brand-charcoal/40",
                  )}
                >
                  {lang === "bn" ? LABELS[status].bn : LABELS[status].en}
                </p>
                {entry && (
                  <p className="text-xs text-brand-charcoal/60">
                    {formatDate(entry.createdAt, lang === "bn" ? "bn-BD" : "en-GB")}
                    {entry.note ? ` — ${entry.note}` : ""}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        {rejected && (
          <p className="mt-4 rounded-2xl bg-brand-red/10 px-4 py-3 text-sm font-semibold text-brand-red">
            {application.reviewerNote ??
              (lang === "bn"
                ? "পরবর্তী মৌসুমে আবার আবেদন করতে পারবে।"
                : "You may apply again next season.")}
          </p>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-brand-lavender/10 px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-brand-charcoal/50">{label}</dt>
      <dd className="mt-1 font-semibold text-brand-blue">{value}</dd>
    </div>
  );
}