import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  Lightbulb,
  Newspaper,
  NotebookPen,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getClubByRepresentative, listClubEntries } from "@/lib/repositories/clubs";
import { clubEntryTypeMeta, clubStatusMeta, moderationStatusMeta } from "@/lib/clubs";
import { formatDate } from "@/lib/utils";
import { ClubProfileForm } from "@/components/ClubProfileForm";
import { ClubEntryForm } from "@/components/ClubEntryForm";
import { deleteClubEntryAction } from "@/app/clubs/actions";
import type { ClubEntryType } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPE_ICON: Record<ClubEntryType, typeof Lightbulb> = {
  PROBLEM: Lightbulb,
  NOTE: NotebookPen,
  ARTICLE: Newspaper,
  EVENT: CalendarDays,
};

export default async function ClubDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/clubs/dashboard");
  }

  const club = await getClubByRepresentative(session.user.uid);
  const isAdmin = can(session.user.role, "admin.all");

  if (!club) {
    return (
      <div className="math-bg bg-brand-purple/5">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <Building2 className="mx-auto h-10 w-10 text-brand-purple" />
          <h1 className="section-title title-accent mt-4">ক্লাব প্রতিনিধি ড্যাশবোর্ড</h1>
          <p className="mx-auto mt-3 max-w-xl text-brand-charcoal/65">
            {isAdmin
              ? "তুমি অ্যাডমিন — সব ক্লাব পরিচালনা করতে পারবে অ্যাডমিন প্যানেল থেকে।"
              : "তোমার নামে এখনো কোনো ক্লাব নিবন্ধিত নেই। ক্লাব প্রতিনিধি অ্যাকাউন্ট প্রশাসনিকভাবে তৈরি ও প্রদান করা হয় — অ্যাডমিন টিমের সাথে যোগাযোগ করো।"}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/admin/clubs" className="btn-ghost">
              ক্লাব ব্যবস্থাপনা
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const entries = await listClubEntries(club.id);
  const status = clubStatusMeta(club.status);

  return (
    <div className="math-bg bg-brand-purple/5">
      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge bg-brand-blue/10 text-brand-blue">
            <Building2 className="h-4 w-4" /> ক্লাব প্রতিনিধি
          </span>
          <span className="badge" style={{ backgroundColor: `${status.tint}1a`, color: status.tint }}>
            {status.bn}
          </span>
          <Link href={`/clubs/${club.slug}`} className="btn-ghost !px-3 !py-1.5 text-xs">
            <ExternalLink className="h-3.5 w-3.5" /> সর্বজনীন পাতা
          </Link>
        </div>

        <h1 className="section-title title-accent mt-3">{club.nameBn}</h1>
        <p className="mt-2 text-brand-charcoal/65">
          ক্লাবের তথ্য সম্পাদনা করো এবং সমস্যা, নোট, আর্টিকেল ও ইভেন্ট জমা দাও। প্রতিটি জমা অ্যাডমিন
          অনুমোদনের পর সর্বজনীন হবে।
        </p>

        {club.reviewerNote && (
          <p className="mt-4 rounded-2xl bg-brand-orange/15 px-4 py-3 text-sm text-brand-charcoal/80">
            পর্যালোচকের মন্তব্য: {club.reviewerNote}
          </p>
        )}

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-blue">ক্লাবের তথ্য</h2>
          <p className="mt-1 text-sm text-brand-charcoal/60">
            তথ্য পরিবর্তন করলে ক্লাবটি পুনরায় অনুমোদনের জন্য পাঠানো হবে।
          </p>
          <div className="mt-5">
            <ClubProfileForm club={club} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-brand-blue">নতুন কনটেন্ট জমা দাও</h2>
          <details className="mt-5">
            <summary className="btn-primary w-fit cursor-pointer">
              <PlusCircle className="h-4 w-4" /> নতুন জমা
            </summary>
            <div className="mt-5">
              <ClubEntryForm clubId={club.id} mode="create" />
            </div>
          </details>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-brand-blue">
            জমা দেওয়া কনটেন্ট ({entries.length})
          </h2>
          {entries.length === 0 ? (
            <p className="mt-4 text-brand-charcoal/60">এখনো কোনো কনটেন্ট জমা দেওয়া হয়নি।</p>
          ) : (
            <div className="mt-5 space-y-5">
              {entries.map((entry) => {
                const meta = clubEntryTypeMeta(entry.type);
                const Status = moderationStatusMeta(entry.status);
                const Icon = TYPE_ICON[entry.type];
                return (
                  <div key={entry.id} className="card space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge text-white" style={{ backgroundColor: meta.tint }}>
                        <Icon className="h-3.5 w-3.5" /> {meta.bn}
                      </span>
                      <span className="badge" style={{ backgroundColor: `${Status.tint}1a`, color: Status.tint }}>
                        {Status.bn}
                      </span>
                      <span className="text-xs text-brand-charcoal/50">
                        হালনাগাদ {formatDate(entry.updatedAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-brand-blue">{entry.title}</h3>
                    {entry.summary && <p className="text-sm text-brand-charcoal/70">{entry.summary}</p>}
                    {entry.reviewerNote && (
                      <p className="rounded-2xl bg-brand-orange/10 px-3 py-2 text-xs text-brand-charcoal/70">
                        পর্যালোচকের মন্তব্য: {entry.reviewerNote}
                      </p>
                    )}

                    <details>
                      <summary className="cursor-pointer text-sm font-semibold text-brand-blue">
                        সম্পাদনা করো
                      </summary>
                      <div className="mt-4">
                        <ClubEntryForm clubId={club.id} mode="edit" values={entry} />
                      </div>
                    </details>

                    <form action={deleteClubEntryAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="clubId" value={club.id} />
                      <button type="submit" className="btn-ghost !px-3 !py-1.5 text-xs text-brand-red">
                        <Trash2 className="h-3.5 w-3.5" /> মুছে ফেলো
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
