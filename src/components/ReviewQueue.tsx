"use client";

import { Check, ChevronRight, X } from "lucide-react";
import {
  resolveActivityAction,
  reviewApplicationAction,
} from "@/app/gonit-doot/actions";
import { useLang } from "@/lib/i18n/LangContext";
import { cn, formatDate } from "@/lib/utils";
import type { ActivityRecord, ApplicationRecord, ApplicationStatus } from "@/lib/types";

const NEXT_STATUS: { status: ApplicationStatus; bn: string; en: string }[] = [
  { status: "UNDER_REVIEW", bn: "পর্যালোচনায়", en: "Under review" },
  { status: "SHORTLISTED", bn: "শর্টলিস্ট", en: "Shortlist" },
  { status: "INTERVIEW", bn: "সাক্ষাৎকার", en: "Interview" },
  { status: "ACCEPTED", bn: "গৃহীত", en: "Accept" },
  { status: "REJECTED", bn: "বাতিল", en: "Reject" },
];

export function ReviewQueue({
  applications,
  activities,
}: {
  applications: ApplicationRecord[];
  activities: ActivityRecord[];
}) {
  const { t, lang } = useLang();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="card">
        <h2 className="mb-4 text-lg font-bold text-brand-blue">
          {lang === "bn" ? "অপেক্ষমাণ কার্যক্রম" : "Pending activities"}
        </h2>
        {activities.length === 0 ? (
          <p className="text-sm text-brand-charcoal/60">
            {lang === "bn" ? "কোনো অপেক্ষমাণ রিপোর্ট নেই।" : "No pending reports."}
          </p>
        ) : (
          <ul className="space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="rounded-2xl border border-brand-lavender/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-blue">{a.title}</p>
                    <p className="text-xs text-brand-charcoal/60">
                      {a.district} · {a.participants}{" "}
                      {lang === "bn" ? "জন" : "people"} ·{" "}
                      {formatDate(a.createdAt, lang === "bn" ? "bn-BD" : "en-GB")}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-brand-charcoal/70">
                      {a.description}
                    </p>
                  </div>
                  <span className="badge bg-amber-100 text-amber-700">
                    +{a.points}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <form action={resolveActivityAction}>
                    <input type="hidden" name="activityId" value={a.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button type="submit" className="btn-primary !px-4 !py-2">
                      <Check className="h-4 w-4" /> {t("dashboard.approved")}
                    </button>
                  </form>
                  <form action={resolveActivityAction}>
                    <input type="hidden" name="activityId" value={a.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button type="submit" className="btn-ghost !px-4 !py-2">
                      <X className="h-4 w-4" /> {t("dashboard.rejected")}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="mb-4 text-lg font-bold text-brand-blue">
          {lang === "bn" ? "আবেদনসমূহ" : "Applications"}
        </h2>
        <ul className="space-y-3">
          {applications.map((app) => (
            <li key={app.id} className="rounded-2xl border border-brand-lavender/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-brand-blue">{app.fullName}</p>
                  <p className="text-xs text-brand-charcoal/60">
                    {app.district} · {app.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "badge",
                    app.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700"
                      : app.status === "REJECTED"
                        ? "bg-brand-red/10 text-brand-red"
                        : "bg-brand-blue/10 text-brand-blue",
                  )}
                >
                  {app.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {NEXT_STATUS.map((step) => (
                  <form key={step.status} action={reviewApplicationAction}>
                    <input type="hidden" name="applicationId" value={app.id} />
                    <input type="hidden" name="status" value={step.status} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-full border border-brand-lavender/40 px-3 py-1.5 text-xs font-semibold text-brand-blue transition hover:border-brand-orange hover:text-brand-orange"
                    >
                      {lang === "bn" ? step.bn : step.en}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}