"use client";

import Image from "next/image";
import {
  Award,
  Download,
  FileText,
  Medal,
  Megaphone,
  Star,
  Trophy,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { ActivityReportForm } from "@/components/ActivityReportForm";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import type {
  ActivityRecord,
  BulletinRecord,
  ResourceItem,
  ActivityStatus,
} from "@/lib/types";

interface DashboardProps {
  ambassador: { name: string; district: string };
  stats: { total: number; approved: number; points: number };
  tier: { bn: string; en: string };
  rank: number;
  activities: ActivityRecord[];
  resources: ResourceItem[];
  bulletins: BulletinRecord[];
  leaderboard: { rank: number; userId: string; name: string; district: string; points: number }[];
  canReview: boolean;
}

const STATUS_STYLES: Record<ActivityStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-brand-red/10 text-brand-red",
};

export function DootDashboard({
  ambassador,
  stats,
  tier,
  rank,
  activities,
  resources,
  bulletins,
  leaderboard,
  canReview,
}: DashboardProps) {
  const { t, lang } = useLang();

  const statusLabel = (s: ActivityStatus) =>
    lang === "bn"
      ? { PENDING: t("dashboard.pending"), APPROVED: t("dashboard.approved"), REJECTED: t("dashboard.rejected") }[s]
      : { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" }[s];

  return (
    <div className="math-bg">
      <section className="bg-brand-gradient text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-12">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/gonit-bhaiya.jpeg"
              alt="Gonit Bhaiya"
              width={72}
              height={72}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-white/40"
            />
            <div>
              <p className="text-sm text-white/80">{t("dashboard.welcome")},</p>
              <h1 className="font-display text-2xl font-extrabold">{ambassador.name}</h1>
              <p className="text-sm text-white/80">{ambassador.district}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge bg-white/15 text-white ring-1 ring-white/30">
              <Star className="h-4 w-4" />
              {lang === "bn" ? tier.bn : tier.en}
            </span>
            <span className="badge bg-brand-orange text-white">
              <Trophy className="h-4 w-4" />
              {lang === "bn" ? `র‍্যাংক #${rank}` : `Rank #${rank}`}
            </span>
            {canReview && (
              <a href="/gonit-doot/review" className="btn bg-white/15 text-white ring-1 ring-white/40">
                <Award className="h-4 w-4" />
                {lang === "bn" ? "রিভিউ কিউ" : "Review queue"}
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            label={t("dashboard.points")}
            value={formatNumber(stats.points, lang === "bn" ? "bn-BD" : "en-US")}
            accent="text-brand-orange"
            icon={<Trophy className="h-6 w-6" />}
          />
          <StatCard
            label={t("dashboard.approvedActs")}
            value={formatNumber(stats.approved, lang === "bn" ? "bn-BD" : "en-US")}
            accent="text-brand-blue"
            icon={<Award className="h-6 w-6" />}
          />
          <StatCard
            label={t("dashboard.totalActs")}
            value={formatNumber(stats.total, lang === "bn" ? "bn-BD" : "en-US")}
            accent="text-brand-purple"
            icon={<FileText className="h-6 w-6" />}
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">
            <ActivityReportForm defaultDistrict={ambassador.district} />

            <div className="card">
              <h2 className="mb-4 text-lg font-bold text-brand-blue">
                {t("dashboard.activityLead")}
              </h2>
              {activities.length === 0 ? (
                <p className="text-sm text-brand-charcoal/60">{t("dashboard.noActivity")}</p>
              ) : (
                <ul className="space-y-3">
                  {activities.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brand-lavender/20 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-brand-blue">{a.title}</p>
                        <p className="text-xs text-brand-charcoal/60">
                          {a.district} · {formatDate(a.createdAt, lang === "bn" ? "bn-BD" : "en-GB")} ·{" "}
                          {a.participants} {lang === "bn" ? "জন" : "ppl"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-brand-orange">
                          +{a.points}
                        </span>
                        <span className={cn("badge", STATUS_STYLES[a.status])}>
                          {statusLabel(a.status)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-8">
            <div className="card">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-blue">
                <Download className="h-5 w-5 text-brand-orange" />
                {t("dashboard.resourceKit")}
              </h2>
              <ul className="space-y-3">
                {resources.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-brand-lavender/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-brand-blue">{r.title}</p>
                      <p className="text-xs text-brand-charcoal/60">
                        {r.category} · {(r.fileSizeKb / 1024).toFixed(1)} MB ·{" "}
                        {formatNumber(r.downloads, lang === "bn" ? "bn-BD" : "en-US")}{" "}
                        {lang === "bn" ? "ডাউনলোড" : "downloads"}
                      </p>
                    </div>
                    <a
                      href={`/api/resources/${r.id}`}
                      className="btn-ghost !px-3 !py-2"
                      aria-label="Download"
                      download
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-blue">
                <Megaphone className="h-5 w-5 text-brand-red" />
                {t("dashboard.bulletins")}
              </h2>
              <ul className="space-y-3">
                {bulletins.map((b) => (
                  <li
                    key={b.id}
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      b.pinned ? "bg-brand-orange/10" : "bg-brand-lavender/10",
                    )}
                  >
                    <p className="text-sm font-semibold text-brand-blue">{b.title}</p>
                    <p className="mt-1 text-xs text-brand-charcoal/70">{b.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-blue">
                <Medal className="h-5 w-5 text-brand-orange" />
                {t("dashboard.leadership")}
              </h2>
              <ol className="space-y-2">
                {leaderboard.slice(0, 5).map((row) => (
                  <li
                    key={row.userId}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-sm",
                      row.rank === 1 ? "bg-brand-orange/10 font-bold" : "bg-brand-lavender/5",
                    )}
                  >
                    <span className="flex items-center gap-2 text-brand-blue">
                      <span className="font-mono text-brand-orange">#{row.rank}</span>
                      {row.name}
                    </span>
                    <span className="font-semibold">
                      {formatNumber(row.points, lang === "bn" ? "bn-BD" : "en-US")}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card flex items-center gap-4">
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-lavender/15", accent)}>
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-brand-charcoal/50">{label}</p>
        <p className={cn("font-display text-2xl font-extrabold", accent)}>{value}</p>
      </div>
    </div>
  );
}