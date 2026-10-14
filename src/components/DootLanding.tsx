"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  ClipboardList,
  Crown,
  FileCheck2,
  Gift,
  Medal,
  Target,
  Trophy,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { AmbassadorMap } from "@/components/AmbassadorMap";
import { cn, formatNumber } from "@/lib/utils";

interface LeaderRow {
  rank: number;
  userId: string;
  name: string;
  district: string;
  points: number;
}

export function DootLanding({
  coverage,
  leaderboard,
  schools,
}: {
  coverage: Record<string, number>;
  leaderboard: LeaderRow[];
  schools: Record<string, number>;
}) {
  const { t, tList, lang } = useLang();
  const mom = leaderboard[0];
  const totalDoots = Object.values(coverage).reduce((a, b) => a + b, 0);

  return (
    <div className="math-bg">
      <section className="bg-brand-gradient text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="badge bg-white/15 text-white ring-1 ring-white/30">
              <Target className="h-4 w-4" /> {t("doot.subtitle")}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
              {t("doot.head")}
            </h1>
            <p className="mt-4 max-w-2xl text-white/90">{t("doot.summary")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/gonit-doot/apply" className="btn-primary">
                {t("doot.apply")}
              </Link>
              <Link
                href="/gonit-doot/status"
                className="btn bg-white/15 text-white ring-1 ring-white/40 hover:bg-white/25"
              >
                {t("doot.statusBadge")}
              </Link>
            </div>
            <dl className="mt-8 flex flex-wrap gap-6">
              <Stat label={lang === "bn" ? "সক্রিয় দূত" : "Active doots"} value={totalDoots} />
              <Stat
                label={lang === "bn" ? "জেলা কভারেজ" : "Districts covered"}
                value={Object.values(coverage).filter((v) => v > 0).length}
              />
              <Stat label={t("doot.schoolsCovered")} value={48} />
            </dl>
          </div>

          {mom && (
            <div className="card bg-white/95 text-brand-charcoal">
              <div className="mb-3 flex items-center gap-2 text-brand-orange">
                <Crown className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wide">
                  {t("doot.ambassadorOfMonth")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Image
                  src="/brand/gonit-bhaiya.jpeg"
                  alt="Gonit Bhaiya"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-orange/40"
                />
                <div>
                  <p className="text-lg font-bold text-brand-blue">{mom.name}</p>
                  <p className="text-sm text-brand-charcoal/60">{mom.district}</p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-lavender/10 px-4 py-3 text-sm font-semibold text-brand-blue">
                <Trophy className="h-4 w-4 text-brand-orange" />
                {formatNumber(mom.points, lang === "bn" ? "bn-BD" : "en-US")} {t("dashboard.points")}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          <InfoCard
            icon={<ClipboardList className="h-6 w-6" />}
            title={t("doot.eligibilityTitle")}
            items={tList("doot.eligibility")}
            accent="text-brand-orange"
          />
          <InfoCard
            icon={<Gift className="h-6 w-6" />}
            title={t("doot.perksTitle")}
            items={tList("doot.perks")}
            accent="text-brand-purple"
          />
          <InfoCard
            icon={<Target className="h-6 w-6" />}
            title={t("doot.expectationsTitle")}
            items={tList("doot.expectations")}
            accent="text-brand-blue"
          />
        </div>

        <div className="mt-14">
          <h2 className="section-title mb-6 text-center">{t("doot.processTitle")}</h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {[
              { bn: "আবেদন জমা", en: "Submit application", icon: ClipboardList },
              { bn: "রিভিউ ও যাচাই", en: "Review & verification", icon: FileCheck2 },
              { bn: "সাক্ষাৎকার", en: "Interview", icon: Target },
              { bn: "দূত হিসেবে যাত্রা", en: "Onboarding as doot", icon: Award },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={i} className="card text-center">
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="text-xs font-bold text-brand-orange">
                    {lang === "bn" ? `ধাপ ${i + 1}` : `Step ${i + 1}`}
                  </p>
                  <p className="mt-1 font-semibold text-brand-blue">
                    {lang === "bn" ? s.bn : s.en}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-14">
          <div className="mb-6 text-center">
            <h2 className="section-title">{t("doot.mapTitle")}</h2>
            <p className="mt-2 text-brand-charcoal/70">{t("doot.mapSubtitle")}</p>
          </div>
          <AmbassadorMap coverage={coverage} schools={schools} />
        </div>

        <div className="mt-14">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Medal className="h-6 w-6 text-brand-orange" />
            <h2 className="section-title">{t("doot.boardTitle")}</h2>
          </div>
          <div className="card overflow-hidden !p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-blue text-white">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">{lang === "bn" ? "দূত" : "Ambassador"}</th>
                  <th className="px-5 py-3 hidden sm:table-cell">{t("status.district")}</th>
                  <th className="px-5 py-3 text-right">{t("dashboard.points")}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 8).map((row) => (
                  <tr
                    key={row.userId}
                    className={cn(
                      "border-b border-brand-lavender/15 last:border-0",
                      row.rank === 1 && "bg-brand-orange/5",
                    )}
                  >
                    <td className="px-5 py-3 font-bold text-brand-orange">{row.rank}</td>
                    <td className="px-5 py-3 font-semibold text-brand-blue">
                      {row.rank === 1 && <Crown className="mr-1 inline h-4 w-4 text-brand-orange" />}
                      {row.name}
                    </td>
                    <td className="px-5 py-3 hidden text-brand-charcoal/70 sm:table-cell">
                      {row.district}
                    </td>
                    <td className="px-5 py-3 text-right font-bold">
                      {formatNumber(row.points, lang === "bn" ? "bn-BD" : "en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const { lang } = useLang();
  return (
    <div>
      <dd className="font-display text-3xl font-extrabold text-brand-orange">
        {formatNumber(value, lang === "bn" ? "bn-BD" : "en-US")}+
      </dd>
      <dt className="text-xs uppercase tracking-wide text-white/80">{label}</dt>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  items,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  items: { bn: string; en: string }[];
  accent: string;
}) {
  const { lang } = useLang();
  return (
    <div className="card">
      <span className={cn("mb-4 inline-flex", accent)}>{icon}</span>
      <h3 className="mb-4 text-xl font-bold text-brand-blue">{title}</h3>
      <ul className="space-y-3 text-sm text-brand-charcoal/80">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full bg-current", accent)} />
            <span>{lang === "bn" ? item.bn : item.en}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}