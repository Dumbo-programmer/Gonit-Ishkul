import Image from "next/image";
import Link from "next/link";
import { Building2, CalendarDays, Lightbulb, MapPin, Newspaper, NotebookPen } from "lucide-react";
import type { ClubRecord } from "@/lib/types";
import type { ClubEntryCounts } from "@/lib/repositories/clubs";

export function ClubCard({ club, counts }: { club: ClubRecord; counts: ClubEntryCounts }) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="card group flex flex-col transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-center gap-4">
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-lavender/15 ring-1 ring-brand-lavender/30">
          {club.logoUrl ? (
            <Image src={club.logoUrl} alt={club.nameBn} width={64} height={64} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-7 w-7 text-brand-purple" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-brand-blue group-hover:text-brand-orange">
            {club.nameBn}
          </h3>
          <p className="truncate text-xs text-brand-charcoal/60">{club.name}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 flex-1 text-sm text-brand-charcoal/70">{club.about}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-charcoal/60">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5 text-brand-purple" /> {club.institution}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-brand-orange" /> {club.district}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-lavender/25 pt-4 text-xs font-semibold text-brand-charcoal/70">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2.5 py-1 text-brand-blue">
          <Lightbulb className="h-3.5 w-3.5" /> সমস্যা {counts.PROBLEM}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple/10 px-2.5 py-1 text-brand-purple">
          <NotebookPen className="h-3.5 w-3.5" /> নোট {counts.NOTE}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#0EA5A5]/10 px-2.5 py-1 text-[#0EA5A5]">
          <Newspaper className="h-3.5 w-3.5" /> আর্টিকেল {counts.ARTICLE}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-2.5 py-1 text-brand-orange">
          <CalendarDays className="h-3.5 w-3.5" /> ইভেন্ট {counts.EVENT}
        </span>
      </div>
    </Link>
  );
}
