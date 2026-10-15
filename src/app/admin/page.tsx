import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  BookOpen,
  CheckCircle2,
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
import { listApplications, getLeaderboard } from "@/lib/repositories/ambassador";
import { listUsers } from "@/lib/repositories/users";
import { reviewArticleAction } from "@/app/articles/actions";
import { setUserRoleAction } from "@/app/admin/actions";
import { courseCategoryMeta } from "@/lib/learning";
import { formatDate, formatNumber } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["STUDENT", "AMBASSADOR", "MENTOR", "INSTRUCTOR", "ADMIN"];

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "metrics.view")) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const store = getStore();
  const users = listUsers();
  const articles = listAllArticles();
  const pending = articles.filter((a) => a.status === "PENDING");
  const applications = listApplications();
  const leaderboard = getLeaderboard();
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

  const metrics = [
    { label: "ব্যবহারকারী", value: users.length, icon: Users },
    {
      label: "শিক্ষার্থী",
      value: users.filter((u) => u.role === "STUDENT").length,
      icon: Users,
    },
    {
      label: "ক্যাম্পাস দূত",
      value: users.filter((u) => u.role === "AMBASSADOR").length,
      icon: Users,
    },
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
        সব মেট্রিক, আর্টিকেল পর্যালোচনা এবং ক্যাম্পাস দূত ব্যবস্থাপনা এক জায়গায়।
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/courses" className="btn-primary">
          <BookOpen className="h-4 w-4" /> কোর্স ও লেকচার ব্যবস্থাপনা
        </Link>
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

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          আর্টিকেল পর্যালোচনা ({pending.length})
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          শিক্ষার্থী ও দূতদের জমা দেওয়া লেখা অনুমোদন বা বাতিল করুন।
        </p>

        {pending.length === 0 ? (
          <p className="mt-4 text-brand-charcoal/60">পর্যালোচনার অপেক্ষায় কোনো লেখা নেই।</p>
        ) : (
          <div className="mt-6 space-y-5">
            {pending.map((article) => {
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
                  <h3 className="font-display text-lg font-bold text-brand-blue">
                    {article.title}
                  </h3>
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
                      <button
                        type="submit"
                        name="decision"
                        value="PUBLISHED"
                        className="btn-primary"
                      >
                        <CheckCircle2 className="h-4 w-4" /> অনুমোদন
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="REJECTED"
                        className="btn-ghost"
                      >
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

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          ক্যাম্পাস দূত ব্যবস্থাপনা
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          ব্যবহারকারীর ভূমিকা পরিবর্তন করে নতুন দূত যোগ করুন বা সরান। মোট আবেদন:{" "}
          {formatNumber(applications.length)}।
        </p>

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
                      <span className="ml-2 text-xs text-brand-charcoal/50">
                        {row.district}
                      </span>
                    </span>
                    <span className="font-bold text-brand-orange">
                      {formatNumber(row.points)}
                    </span>
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
