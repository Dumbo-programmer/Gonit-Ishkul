import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, PauseCircle, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getClubById, listClubEntries } from "@/lib/repositories/clubs";
import { clubStatusMeta } from "@/lib/clubs";
import { formatDate } from "@/lib/utils";
import { ClubProfileForm } from "@/components/ClubProfileForm";
import { ClubEntryModeration } from "@/components/ClubEntryModeration";
import {
  deleteClubAdminAction,
  reviewClubAction,
  toggleClubPublishAction,
} from "@/app/admin/clubs/actions";

export const dynamic = "force-dynamic";

export default async function AdminClubDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "admin.all")) {
    redirect(`/auth/signin?callbackUrl=/admin/clubs/${params.id}`);
  }

  const club = await getClubById(params.id);
  if (!club) notFound();

  const entries = await listClubEntries(club.id);
  const status = clubStatusMeta(club.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <Link href="/admin/clubs" className="btn-ghost !px-3 !py-1.5 text-xs">
        <ArrowLeft className="h-3.5 w-3.5" /> ক্লাব তালিকা
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="badge bg-brand-purple/10 text-brand-purple">
          <ShieldCheck className="h-4 w-4" /> ক্লাব পরিচালনা
        </span>
        <span className="badge" style={{ backgroundColor: `${status.tint}1a`, color: status.tint }}>
          {status.bn}
        </span>
        <span className="badge bg-brand-blue/10 text-brand-blue">
          {club.published ? "সর্বজনীন" : "অপ্রকাশিত"}
        </span>
      </div>
      <h1 className="section-title title-accent mt-3">{club.nameBn}</h1>
      <p className="mt-1 text-sm text-brand-charcoal/60">
        {club.name} · {club.institution} · {club.district}
      </p>
      <p className="mt-1 text-xs text-brand-charcoal/50">
        প্রতিনিধি: {club.representativeName ?? "—"} · হালনাগাদ {formatDate(club.updatedAt)}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/clubs/${club.slug}`} className="btn-ghost !px-3 !py-2 text-sm">
          সর্বজনীন পাতা
        </Link>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="font-display text-lg font-bold text-brand-blue">নিবন্ধন পর্যালোচনা</h2>
          <form action={reviewClubAction} className="space-y-3">
            <input type="hidden" name="clubId" value={club.id} />
            <input
              name="reviewerNote"
              className="field-input"
              placeholder="পর্যালোচকের মন্তব্য"
              defaultValue={club.reviewerNote}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" name="decision" value="APPROVED" className="btn-primary">
                <CheckCircle2 className="h-4 w-4" /> অনুমোদন
              </button>
              <button type="submit" name="decision" value="REJECTED" className="btn-ghost text-brand-red">
                <XCircle className="h-4 w-4" /> বাতিল
              </button>
              <button type="submit" name="decision" value="SUSPENDED" className="btn-ghost">
                <PauseCircle className="h-4 w-4" /> স্থগিত
              </button>
            </div>
          </form>
        </div>

        <div className="card space-y-3">
          <h2 className="font-display text-lg font-bold text-brand-blue">প্রকাশ নিয়ন্ত্রণ</h2>
          <p className="text-sm text-brand-charcoal/65">
            অনুমোদিত ক্লাব সর্বজনীনভাবে দেখাতে প্রকাশ করুন বা লুকান।
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <form action={toggleClubPublishAction}>
              <input type="hidden" name="clubId" value={club.id} />
              <input type="hidden" name="published" value={club.published ? "false" : "true"} />
              <button type="submit" className="btn-secondary">
                {club.published ? (
                  <>
                    <EyeOff className="h-4 w-4" /> লুকাও
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" /> প্রকাশ করো
                  </>
                )}
              </button>
            </form>
            <form action={deleteClubAdminAction}>
              <input type="hidden" name="clubId" value={club.id} />
              <button type="submit" className="btn-ghost text-brand-red">
                <Trash2 className="h-4 w-4" /> ক্লাব মুছে ফেলো
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-brand-blue">ক্লাবের তথ্য সম্পাদনা</h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          অ্যাডমিন সম্পাদনা পুনরায় পর্যালোচনার প্রয়োজন হয় না।
        </p>
        <div className="mt-5">
          <ClubProfileForm club={club} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          কনটেন্ট ({entries.length})
        </h2>
        <div className="mt-5 space-y-5">
          {entries.map((entry) => (
            <ClubEntryModeration key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 && (
            <p className="text-brand-charcoal/60">এই ক্লাবের কোনো কনটেন্ট নেই।</p>
          )}
        </div>
      </section>
    </div>
  );
}
