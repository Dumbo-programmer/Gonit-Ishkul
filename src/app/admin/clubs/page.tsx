import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Settings2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  clubModerationSummary,
  listClubs,
  listClubEntriesByStatus,
} from "@/lib/repositories/clubs";
import { clubStatusMeta } from "@/lib/clubs";
import { formatDate, formatNumber } from "@/lib/utils";
import { reviewClubAction } from "@/app/admin/clubs/actions";
import { ClubEntryModeration } from "@/components/ClubEntryModeration";
import { AdminCreateClubForm } from "@/components/AdminCreateClubForm";

export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "admin.all")) {
    redirect("/auth/signin?callbackUrl=/admin/clubs");
  }

  const summary = await clubModerationSummary();
  const pendingClubs = (await listClubs()).filter((c) => c.status === "PENDING");
  const clubs = await listClubs();
  const pendingEntries = await listClubEntriesByStatus("PENDING");
  const clubName = (id: string) => clubs.find((c) => c.id === id)?.nameBn;

  const metrics = [
    { label: "মোট ক্লাব", value: summary.totalClubs },
    { label: "নিবন্ধন পর্যালোচনা", value: summary.pendingClubs },
    { label: "মোট কজমাটি", value: summary.totalEntries },
    { label: "কনটেন্ট পর্যালোচনা", value: summary.pendingEntries },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-wrap items-center gap-3">
        <span className="badge bg-brand-purple/10 text-brand-purple">
          <ShieldCheck className="h-4 w-4" /> ক্লাব মডারেশন
        </span>
        <Link href="/admin" className="btn-ghost !px-3 !py-1.5 text-xs">
          অ্যাডমিন হোম
        </Link>
      </div>
      <h1 className="section-title title-accent mt-3">পার্টনার ক্লাব ব্যবস্থাপনা</h1>
      <p className="mt-2 text-brand-charcoal/65">
        ক্লাব নিবন্ধন অনুমোদন, ক্লাবের তথ্য সম্পাদনা এবং প্রতিনিধিদের জমা দেওয়া কনটেন্ট
        (পরিবর্তনসহ অনুমোদন বা বাতিল) এক জায়গায়।
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="card">
            <Building2 className="h-5 w-5 text-brand-purple" />
            <p className="mt-2 font-display text-2xl font-extrabold text-brand-blue">
              {formatNumber(m.value)}
            </p>
            <p className="text-xs font-semibold text-brand-charcoal/60">{m.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">নতুন ক্লাব ও প্রতিনিধি</h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          ক্লাব প্রতিনিধির অ্যাকাউন্ট প্রশাসনিকভাবে তৈরি হয়। নতুন ক্লাব যোগ করে এর প্রতিনিধির লগইন
          শংসাপত্র নির্ধারণ করুন — ক্লাবটি সাথে সাথেই অনুমোদিত ও প্রকাশিত হবে।
        </p>
        <details className="mt-5">
          <summary className="btn-primary w-fit cursor-pointer">
            <Building2 className="h-4 w-4" /> নতুন ক্লাব তৈরি করো
          </summary>
          <div className="mt-5">
            <AdminCreateClubForm />
          </div>
        </details>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          ক্লাব নিবন্ধন পর্যালোচনা ({pendingClubs.length})
        </h2>
        {pendingClubs.length === 0 ? (
          <p className="mt-4 text-brand-charcoal/60">পর্যালোচনার অপেক্ষায় কোনো ক্লাব নেই।</p>
        ) : (
          <div className="mt-6 space-y-5">
            {pendingClubs.map((club) => (
              <div key={club.id} className="card space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-brand-orange/15 text-brand-orange">
                    {clubStatusMeta(club.status).bn}
                  </span>
                  <span className="text-xs text-brand-charcoal/50">
                    {club.representativeName} · {formatDate(club.updatedAt)}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-brand-blue">{club.nameBn}</h3>
                <p className="text-xs text-brand-charcoal/60">
                  {club.name} · {club.institution} · {club.district} · {club.contactEmail}
                </p>
                <p className="text-sm text-brand-charcoal/70">{club.about}</p>
                <form action={reviewClubAction} className="space-y-3">
                  <input type="hidden" name="clubId" value={club.id} />
                  <input name="reviewerNote" className="field-input" placeholder="পর্যালোচকের মন্তব্য (ঐচ্ছিক)" />
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" name="decision" value="APPROVED" className="btn-primary">
                      <CheckCircle2 className="h-4 w-4" /> অনুমোদন
                    </button>
                    <button type="submit" name="decision" value="REJECTED" className="btn-ghost text-brand-red">
                      <XCircle className="h-4 w-4" /> বাতিল
                    </button>
                    <Link href={`/admin/clubs/${club.id}`} className="btn-ghost !px-3 !py-1.5 text-xs">
                      <Settings2 className="h-3.5 w-3.5" /> পরিচালনা
                    </Link>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          কনটেন্ট পর্যালোচনা ({pendingEntries.length})
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          প্রতিনিধিদের জমা দেওয়া সমস্যা, নোট, আর্টিকেল ও ইভেন্ট যাচাই করুন — প্রয়োজনে সম্পাদনা করে
          অনুমোদন দিন।
        </p>
        {pendingEntries.length === 0 ? (
          <p className="mt-4 text-brand-charcoal/60">পর্যালোচনার অপেক্ষায় কোনো কনটেন্ট নেই।</p>
        ) : (
          <div className="mt-6 space-y-5">
            {pendingEntries.map((entry) => (
              <ClubEntryModeration key={entry.id} entry={entry} clubName={clubName(entry.clubId)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">সব ক্লাব ({clubs.length})</h2>
        <div className="mt-6 space-y-3">
          {clubs.map((club) => {
            const meta = clubStatusMeta(club.status);
            return (
              <div
                key={club.id}
                className="card flex flex-wrap items-center justify-between gap-3 !py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-brand-blue">{club.nameBn}</p>
                  <p className="text-xs text-brand-charcoal/55">
                    {club.institution} · {club.district} · {club.representativeName ?? "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge" style={{ backgroundColor: `${meta.tint}1a`, color: meta.tint }}>
                    {meta.bn}
                  </span>
                  <span className="badge bg-brand-blue/10 text-brand-blue">
                    {club.published ? "সর্বজনীন" : "অপ্রকাশিত"}
                  </span>
                  <Link href={`/clubs/${club.slug}`} className="btn-ghost !px-3 !py-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" /> দেখুন
                  </Link>
                  <Link href={`/admin/clubs/${club.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                    <Settings2 className="h-3.5 w-3.5" /> পরিচালনা
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
