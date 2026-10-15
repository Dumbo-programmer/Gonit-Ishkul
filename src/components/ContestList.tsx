"use client";

import Link from "next/link";
import { CalendarClock, Swords, Trophy, Users } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { ContestCountdown } from "@/components/ContestCountdown";
import { EmptyState } from "@/components/EmptyState";
import type { ContestPhase } from "@/lib/arena";

export interface ContestListItem {
  slug: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  startsAt: string;
  endsAt: string;
  problemCount: number;
  participants: number;
  phase: ContestPhase;
}

const STATUS_STYLES: Record<ContestPhase, string> = {
  live: "bg-emerald-100 text-emerald-700",
  upcoming: "bg-brand-blue/10 text-brand-blue",
  ended: "bg-brand-charcoal/10 text-brand-charcoal/60",
};

export function ContestList({ contests }: { contests: ContestListItem[] }) {
  const { lang, t } = useLang();

  if (contests.length === 0) {
    return <EmptyState icon={Swords} title={t("arena.noContests")} />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {contests.map((c) => {
        const statusLabel =
          c.phase === "live"
            ? t("arena.statusLive")
            : c.phase === "upcoming"
              ? t("arena.statusUpcoming")
              : t("arena.statusEnded");
        return (
          <Link
            key={c.slug}
            href={`/contests/${c.slug}`}
            className="card card-glow group flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`badge ${STATUS_STYLES[c.phase]}`}>
                {c.phase === "live" && <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
                {statusLabel}
              </span>
              <span className="badge bg-brand-purple/10 text-brand-purple">
                <Swords className="h-3.5 w-3.5" />
                {c.problemCount} {lang === "bn" ? "সমস্যা" : "problems"}
              </span>
            </div>

            <h3 className="font-display text-xl font-bold text-brand-blue group-hover:text-brand-orange">
              {lang === "bn" ? c.titleBn : c.titleEn}
            </h3>
            <p className="text-sm text-brand-charcoal/60">{lang === "bn" ? c.descriptionBn : c.descriptionEn}</p>

            <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-brand-lavender/20 pt-3 text-sm font-semibold text-brand-charcoal/70">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4 text-brand-orange" />
                {c.phase === "live" && (
                  <>
                    {t("arena.endsIn")}: <ContestCountdown to={c.endsAt} />
                  </>
                )}
                {c.phase === "upcoming" && (
                  <>
                    {t("arena.startsIn")}: <ContestCountdown to={c.startsAt} />
                  </>
                )}
                {c.phase === "ended" && (
                  <span className="inline-flex items-center gap-1.5">
                    <Trophy className="h-4 w-4" />
                    {t("arena.statusEnded")}
                  </span>
                )}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-purple" />
                {c.participants}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
