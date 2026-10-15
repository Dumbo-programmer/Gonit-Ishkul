import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Building2,
  Calendar,
  CalendarDays,
  Globe,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  Newspaper,
  NotebookPen,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  getClubBySlug,
  listApprovedClubEntries,
  listClubEntries,
} from "@/lib/repositories/clubs";
import { clubEntryTypeMeta, moderationStatusMeta } from "@/lib/clubs";
import { cn, formatDate } from "@/lib/utils";
import type { ClubEntryRecord, ClubEntryType } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPE_ICON: Record<ClubEntryType, typeof Lightbulb> = {
  PROBLEM: Lightbulb,
  NOTE: NotebookPen,
  ARTICLE: Newspaper,
  EVENT: CalendarDays,
};

const ORDER: ClubEntryType[] = ["PROBLEM", "NOTE", "ARTICLE", "EVENT"];

function EntryCard({ entry, showStatus }: { entry: ClubEntryRecord; showStatus: boolean }) {
  const meta = clubEntryTypeMeta(entry.type);
  const Status = moderationStatusMeta(entry.status);
  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge text-white" style={{ backgroundColor: meta.tint }}>
          {meta.bn}
        </span>
        {showStatus && (
          <span className="badge" style={{ backgroundColor: `${Status.tint}1a`, color: Status.tint }}>
            {Status.bn}
          </span>
        )}
        {entry.type === "EVENT" && entry.eventDate && (
          <span className="inline-flex items-center gap-1 text-xs text-brand-charcoal/60">
            <Calendar className="h-3.5 w-3.5 text-brand-orange" /> {formatDate(entry.eventDate)}
          </span>
        )}
        {entry.type === "EVENT" && entry.location && (
          <span className="inline-flex items-center gap-1 text-xs text-brand-charcoal/60">
            <MapPin className="h-3.5 w-3.5 text-brand-purple" /> {entry.location}
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-bold text-brand-blue">{entry.title}</h3>
      {entry.summary && <p className="text-sm text-brand-charcoal/70">{entry.summary}</p>}
      <details className="rounded-2xl bg-brand-lavender/10 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand-blue">
          বিস্তারিত দেখুন
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-sm text-brand-charcoal/80">{entry.body}</p>
        {entry.type === "PROBLEM" && entry.answer && (
          <p className="mt-2 text-sm text-brand-charcoal/80">
            <span className="font-semibold">উত্তর:</span> {entry.answer}
          </p>
        )}
      </details>
      {entry.reviewerNote && showStatus && (
        <p className="rounded-2xl bg-brand-orange/10 px-3 py-2 text-xs text-brand-charcoal/70">
          পর্যালোচকের মন্তব্য: {entry.reviewerNote}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-xs text-brand-charcoal/50">
        <span>{entry.submittedByName}</span>
        {entry.linkUrl && (
          <a href={entry.linkUrl} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">
            লিংক
          </a>
        )}
      </div>
    </div>
  );
}

export default async function ClubProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const club = getClubBySlug(params.slug);
  if (!club) notFound();

  const session = await getServerSession(authOptions);
  const canManage =
    !!session?.user &&
    (can(session.user.role, "admin.all") || club.representativeUserId === session.user.uid);

  if (!club.published && club.status !== "APPROVED" && !canManage) notFound();

  const entries = canManage ? listClubEntries(club.id) : listApprovedClubEntries(club.id);

  return (
    <div className="math-bg bg-brand-blue/5">
      <div className="mx-auto max-w-5xl px-4 py-14">
        {canManage && club.status !== "APPROVED" && (
          <p className="mb-6 rounded-2xl bg-brand-orange/15 px-4 py-3 text-sm font-semibold text-brand-charcoal/80">
            এই ক্লাবটি এখনো সর্বজনীনভাবে প্রকাশিত নয় — অ্যাডমিন অনুমোদনের অপেক্ষায় (স্ট্যাটাস:{" "}
            {club.status}).
          </p>
        )}

        <div className="card flex flex-wrap items-start gap-6">
          <span className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-brand-lavender/15 ring-1 ring-brand-lavender/30">
            {club.logoUrl ? (
              <Image src={club.logoUrl} alt={club.nameBn} width={96} height={96} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-10 w-10 text-brand-purple" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold text-brand-blue sm:text-3xl">
              {club.nameBn}
            </h1>
            <p className="text-sm text-brand-charcoal/60">{club.name}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-charcoal/70">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4 text-brand-purple" /> {club.institution}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-brand-orange" /> {club.district}
              </span>
              {club.foundedYear && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-brand-blue" /> প্রতিষ্ঠা {club.foundedYear}
                </span>
              )}
              {club.website && (
                <a href={club.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-blue hover:underline">
                  <Globe className="h-4 w-4" /> ওয়েবসাইট
                </a>
              )}
            </div>
            {club.representativeName && (
              <p className="mt-2 text-xs text-brand-charcoal/50">
                প্রতিনিধি: {club.representativeName}
              </p>
            )}
            {canManage && (
              <Link href="/clubs/dashboard" className="btn-secondary mt-4 !px-4 !py-2 text-sm">
                <LayoutDashboard className="h-4 w-4" /> ড্যাশবোর্ড
              </Link>
            )}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-brand-blue">ক্লাব পরিচিতি</h2>
          <p className="mt-2 whitespace-pre-wrap text-brand-charcoal/75">{club.about}</p>
          {club.aboutEn && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-brand-charcoal/55">{club.aboutEn}</p>
          )}
        </section>

        {entries.length === 0 ? (
          <p className="mt-10 text-brand-charcoal/60">এই ক্লাব এখনো কোনো কনটেন্ট প্রকাশ করেনি।</p>
        ) : (
          ORDER.map((type) => {
            const rows = entries.filter((e) => e.type === type);
            if (rows.length === 0) return null;
            const meta = clubEntryTypeMeta(type);
            const Icon = TYPE_ICON[type];
            return (
              <section key={type} className="mt-12">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-brand-blue">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: meta.tint }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {meta.bn} ({rows.length})
                </h2>
                <div className={cn("mt-5 grid gap-5", type === "EVENT" ? "lg:grid-cols-2" : "")}>
                  {rows.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} showStatus={canManage} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
