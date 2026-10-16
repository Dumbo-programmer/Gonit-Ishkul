import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Layers,
  ShieldCheck,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getStore } from "@/lib/store";
import { listAllArticles } from "@/lib/repositories/articles";
import {
  getLeaderboard,
  listActivities,
  listApplications,
} from "@/lib/repositories/ambassador";
import {
  clubModerationSummary,
  listClubsByStatus,
  listClubEntriesByStatus,
} from "@/lib/repositories/clubs";
import { listUsers } from "@/lib/repositories/users";
import { reviewArticleAction } from "@/app/articles/actions";
import { setUserRoleAction } from "@/app/admin/actions";
import { reviewClubAction } from "@/app/admin/clubs/actions";
import { resolveActivityAction, reviewApplicationAction } from "@/app/gonit-doot/actions";
import { ClubEntryModeration } from "@/components/ClubEntryModeration";
import { courseCategoryMeta } from "@/lib/learning";
import { formatDate, formatNumber } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/rbac";
import type { ActivityType, ApplicationStatus, Role } from "@/lib/types";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["STUDENT", "AMBASSADOR", "CLUB", "MENTOR", "INSTRUCTOR", "ADMIN"];

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "ACCEPTED",
  "REJECTED",
];

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  CAMPUS_CIRCLE: "ক্যাম্পাস সার্কেল",
  WORKSHOP: "কর্মশালা",
  SOCIAL_MEDIA: "সোশ্যাল মিডিয়া",
  SCHOOL_VISIT: "স্কুল সফর",
  CONTEST_HOSTED: "কনটেস্ট আয়োজন",
  ARTICLE_PUBLISHED: "আর্টিকেল প্রকাশ",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "metrics.view")) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const store = await getStore();
  const users = await listUsers();
  const articles = await listAllArticles();
  const pendingArticles = articles.filter((a) => a.status === "PENDING");
  const applications = await listApplications();
  const pendingApplications = applications.filter(
    (a) => a.status !== "ACCEPTED" && a.status !== "REJECTED",
  );
  const activities = await listActivities();
  const pendingActivities = activities.filter((a) => a.status === "PENDING");
  const leaderboard = await getLeaderboard();
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

  const clubSummary = await clubModerationSummary();
  const pendingClubs = await listClubsByStatus("PENDING");
  const pendingClubEntries = await listClubEntriesByStatus("PENDING");
  const allClubs = (await getStore()).clubs;
  const clubName = (id: string) => allClubs.find((c) => c.id === id)?.nameBn;

  const metrics = [
    { label: "ব্যবহারকারী", value: users.length, icon: Users },
    { label: "শিক্ষার্থী", value: users.filter((u) => u.role === "STUDENT").length, icon: Users },
    { label: "ক্যাম্পাস দূত", value: users.filter((u) => u.role === "AMBASSADOR").length, icon: Users },
    { label: "পার্টনার ক্লাব", value: clubSummary.totalClubs, icon: Building2 },
    { label: "কোর্স", value: store.courses.length, icon: BookOpen },
    { label: "লেকচার", value: store.lectures.length, icon: Layers },
    { label: "এনরোলমেন্ট", value: store.enrollments.length, icon: Layers },
    { label: "সমস্যা", value: store.problems.length, icon: FileText },
    { label: "মূল্যায়ন অপেক্ষমাণ", value: store.submissions.length, icon: FileText },
    { label: "কনটেস্ট", value: store.contests.length, icon: Trophy },
    { label: "ধাঁধা", value: store.puzzles.length, icon: FileText },
    { label: "আর্টিকেল", value: articles.length, icon: FileText },
    { label: "মোট আর্টিকেল ভিউ", value: totalViews, icon: ShieldCheck },
  ];

  const queueBadges = [
    { label: "ক্লাব নিবন্ধন", value: clubSummary.pendingClubs },
    { label: "ক্লাব কনটেন্ট", value: clubSummary.pendingEntries },
    { label: "আর্টিকেল", value: pendingArticles.length },
    { label: "দূত আবেদন", value: pendingApplications.length },
    { label: "ক্যার্যক্রম রিপোর্ট", value: pendingActivities.length },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex items-center gap-3">
        <span className="badge bg-brand-blue/10 text-brand-blue">
          <ShieldCheck className="h-4 w-4" /> ইউনিভার্সাল অ্যাডমিন
        </span>
        <span className="text-sm text-brand-charcoal/60">
          {session.user.name} · {session.user.email}
        </span>
      </div>
      <h1 className="section-title title-accent mt-3">প্ল্যাটফর্ম কন্ট্রোল সেন্টার</h1>
      <p className="mt-2 text-brand-charcoal/65">
        সব মেট্রিক ও মডারেশন কিউ — ক্লাব, কনটেন্ট, আর্টিকেল, দূত আবেদন ও কার্যক্রম রিপোর্ট — এক
        জায়গায়।
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/courses" className="btn-primary">
          <BookOpen className="h-4 w-4" /> কোর্স ও লেকচার ব্যবস্থাপনা
        </Link>
        <Link href="/admin/clubs" className="btn-secondary">
          <Building2 className="h-4 w-4" /> ক্লাব ব্যবস্থাপনা
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {queueBadges.map((q) => (
          <span
            key={q.label}
            className={`badge ${
              q.value > 0 ? "bg-brand-orange/15 text-brand-orange" : "bg-brand-lavender/15 text-brand-charcoal/60"
            }`}
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> {q.label}: {formatNumber(q.value)}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="card">
            <m.icon className="h-5 w-5 text-brand-purple" />
            <p className="mt-2 font-display text-2xl font-extrabold text-brand-blue">
              {formatNumber(m.value)}
            </p>
            <p className="text-xs font-semibold text-brand-charcoal/60">{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── Club moderation ─────────────────────────────────────────────── */}
      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-brand-blue">
            ক্লাব মডারেশন ({clubSummary.pendingClubs + clubSummary.pendingEntries})
          </h2>
          <Link href="/admin/clubs" className="btn-ghost !px-3 !py-1.5 text-xs">
            সব ক্লাব দেখুন
          </Link>
        </div>

        <h3 className="mt-5 font-semibold text-brand-purple">নিবন্ধন পর্যালোচনা ({pendingClubs.length})</h3>
        {pendingClubs.length === 0 ? (
          <p className="mt-2 text-sm text-brand-charcoal/60">পর্যালোচনার অপেক্ষায় কোনো ক্লাব নেই।</p>
        ) : (
          <div className="mt-4 space-y-5">
            {pendingClubs.map((club) => (
              <div key={club.id} className="card space-y-3">
                <h4 className="font-display text-lg font-bold text-brand-blue">{club.nameBn}</h4>
                <p className="text-xs text-brand-charcoal/60">
                  {club.institution} · {club.district} · প্রতিনিধি {club.representativeName ?? "—"}
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
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}

        <h3 className="mt-8 font-semibold text-brand-purple">
          ক্লাব কনটেন্ট পর্যালোচনা ({pendingClubEntries.length})
        </h3>
        {pendingClubEntries.length === 0 ? (
          <p className="mt-2 text-sm text-brand-charcoal/60">পর্যালোচনার অপেক্ষায় কোনো কনটেন্ট নেই।</p>
        ) : (
          <div className="mt-4 space-y-5">
            {pendingClubEntries.slice(0, 6).map((entry) => (
              <ClubEntryModeration key={entry.id} entry={entry} clubName={clubName(entry.clubId)} />
            ))}
            {pendingClubEntries.length > 6 && (
              <Link href="/admin/clubs" className="text-sm font-semibold text-brand-blue hover:underline">
                আরও {pendingClubEntries.length - 6}টি দেখুন →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ── Article review ──────────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          আর্টিকেল পর্যালোচনা ({pendingArticles.length})
        </h2>
        {pendingArticles.length === 0 ? (
          <p className="mt-4 text-brand-charcoal/60">পর্যালোচনার অপেক্ষায় কোনো লেখা নেই।</p>
        ) : (
          <div className="mt-6 space-y-5">
            {pendingArticles.map((article) => {
              const meta = courseCategoryMeta(article.category);
              return (
                <div key={article.id} className="card space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge text-white" style={{ backgroundColor: meta.tint }}>
                      {meta.bn}
                    </span>
                    <span className="badge bg-brand-blue/10 text-brand-blue">
                      {article.audience === "AMBASSADOR" ? "দূত চ্যানেল" : "পাবলিক"}
                    </span>
                    <span className="text-xs text-brand-charcoal/50">
                      {article.authorName} · {formatDate(article.updatedAt)}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-brand-blue">{article.title}</h3>
                  <p className="text-sm text-brand-charcoal/70">{article.summary}</p>
                  <details className="rounded-2xl bg-brand-lavender/10 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-brand-blue">
                      সম্পূর্ণ লেখা দেখুন
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-brand-charcoal/80">
                      {article.body}
                    </p>
                  </details>
                  <form action={reviewArticleAction} className="space-y-3">
                    <input type="hidden" name="id" value={article.id} />
                    <input
                      name="reviewerNote"
                      className="field-input"
                      placeholder="পর্যালোচকের মন্তব্য (ঐচ্ছিক)"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="submit" name="decision" value="PUBLISHED" className="btn-primary">
                        <CheckCircle2 className="h-4 w-4" /> অনুমোদন
                      </button>
                      <button type="submit" name="decision" value="REJECTED" className="btn-ghost">
                        <XCircle className="h-4 w-4" /> বাতিল
                      </button>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Application review ──────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          দূত আবেদন পর্যালোচনা ({pendingApplications.length})
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          আবেদনের স্ট্যাটাস পরিবর্তন করুন — টাইমলাইন স্বয়ংক্রিয়ভাবে হালনাগাদ হবে। মোট আবেদন:{" "}
          {formatNumber(applications.length)}।
        </p>
        {pendingApplications.length === 0 ? (
          <p className="mt-4 text-brand-charcoal/60">পর্যালোচনার অপেক্ষায় কোনো আবেদন নেই।</p>
        ) : (
          <div className="mt-6 space-y-5">
            {pendingApplications.map((app) => (
              <div key={app.id} className="card space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-brand-blue/10 text-brand-blue">{app.status}</span>
                  <span className="text-xs text-brand-charcoal/50">
                    {app.trackingCode} · {formatDate(app.createdAt)}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-brand-blue">
                  {app.fullName} — {app.university}
                </h3>
                <p className="text-xs text-brand-charcoal/60">
                  {app.email} · {app.phone} · {app.district}, {app.division}
                </p>
                <details className="rounded-2xl bg-brand-lavender/10 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-brand-blue">
                    আবেদনপত্র দেখুন
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-brand-charcoal/80">
                    {app.statement}
                  </p>
                </details>
                <form action={reviewApplicationAction} className="space-y-3">
                  <input type="hidden" name="applicationId" value={app.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select name="status" className="field-input" defaultValue={app.status}>
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input name="note" className="field-input" placeholder="মন্তব্য (ঐচ্ছিক)" />
                  </div>
                  <button type="submit" className="btn-primary">
                    স্ট্যাটাস হালনাগাদ
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Activity review ─────────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          কার্যক্রম রিপোর্ট পর্যালোচনা ({pendingActivities.length})
        </h2>
        {pendingActivities.length === 0 ? (
          <p className="mt-4 text-brand-charcoal/60">পর্যালোচনার অপেক্ষায় কোনো রিপোর্ট নেই।</p>
        ) : (
          <div className="mt-6 space-y-5">
            {pendingActivities.map((activity) => (
              <div key={activity.id} className="card space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-brand-purple/10 text-brand-purple">
                    {ACTIVITY_LABELS[activity.type]}
                  </span>
                  <span className="text-xs text-brand-charcoal/50">
                    {activity.district} · {activity.participants} জন · {formatDate(activity.createdAt)}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-brand-blue">{activity.title}</h3>
                <p className="text-sm text-brand-charcoal/70">{activity.description}</p>
                {activity.proofUrl && (
                  <a href={activity.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-blue hover:underline">
                    প্রমাণ দেখুন
                  </a>
                )}
                <form action={resolveActivityAction} className="flex flex-wrap items-center gap-3">
                  <input type="hidden" name="activityId" value={activity.id} />
                  <button type="submit" name="decision" value="approve" className="btn-primary">
                    <CheckCircle2 className="h-4 w-4" /> অনুমোদন ({activity.points} পয়েন্ট)
                  </button>
                  <button type="submit" name="decision" value="reject" className="btn-ghost text-brand-red">
                    <XCircle className="h-4 w-4" /> বাতিল
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Leaderboard & roles ─────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">ব্যবহারকারী ব্যবস্থাপনা</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-brand-blue">
              <Trophy className="h-4 w-4 text-brand-orange" /> লিডারবোর্ড
            </h3>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-brand-charcoal/60">এখনো কোনো পয়েন্ট নেই।</p>
            ) : (
              <ul className="space-y-2">
                {leaderboard.map((row) => (
                  <li
                    key={row.userId}
                    className="flex items-center justify-between rounded-2xl bg-brand-lavender/10 px-4 py-2 text-sm"
                  >
                    <span className="font-semibold text-brand-charcoal/80">
                      #{row.rank} {row.name}
                      <span className="ml-2 text-xs text-brand-charcoal/50">{row.district}</span>
                    </span>
                    <span className="font-bold text-brand-orange">{formatNumber(row.points)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-brand-blue">
              <Users className="h-4 w-4 text-brand-purple" /> ব্যবহারকারীর ভূমিকা
            </h3>
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-charcoal/80">
                    {user.name}
                    <span className="ml-2 text-xs text-brand-charcoal/50">{user.email}</span>
                  </span>
                  <form action={setUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="field-input !w-auto !py-1 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r].bn}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-secondary !px-3 !py-1 text-xs">
                      সংরক্ষণ
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
