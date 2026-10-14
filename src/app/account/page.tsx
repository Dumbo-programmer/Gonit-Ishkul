import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Eye, Pencil, PenLine, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { listArticlesByAuthor } from "@/lib/repositories/articles";
import { courseCategoryMeta } from "@/lib/learning";
import { formatDate } from "@/lib/utils";
import { deleteArticleAction } from "@/app/articles/actions";
import type { ArticleStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<ArticleStatus, { label: string; className: string }> = {
  DRAFT: { label: "খসড়া", className: "bg-brand-lavender/20 text-brand-charcoal/70" },
  PENDING: { label: "পর্যালোচনায়", className: "bg-amber-100 text-amber-700" },
  PUBLISHED: { label: "প্রকাশিত", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "বাতিল", className: "bg-brand-red/10 text-brand-red" },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: { submitted?: string; updated?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/account");
  }

  const articles = listArticlesByAuthor(session.user.uid);
  const published = articles.filter((a) => a.status === "PUBLISHED").length;
  const pending = articles.filter((a) => a.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="badge bg-brand-blue/10 text-brand-blue">
            <PenLine className="h-4 w-4" /> আমার অ্যাকাউন্ট
          </span>
          <h1 className="section-title mt-3">স্বাগতম, {session.user.name}</h1>
          <p className="mt-2 text-brand-charcoal/65">
            এখান থেকে তুমি তোমার জমা দেওয়া আর্টিকেল ট্র্যাক, দেখা ও সম্পাদনা করতে পারো।
          </p>
        </div>
        <Link href="/articles/new" className="btn-primary">
          <PenLine className="h-4 w-4" /> নতুন আর্টিকেল
        </Link>
      </div>

      {(searchParams?.submitted || searchParams?.updated) && (
        <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {searchParams.submitted
            ? "লেখা জমা হয়েছে — পর্যালোচনার জন্য অপেক্ষমাণ।"
            : "লেখা হালনাগাদ হয়েছে — আবার পর্যালোচনায় যাবে।"}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="মোট লেখা" value={articles.length} />
        <Stat label="প্রকাশিত" value={published} />
        <Stat label="পর্যালোচনায়" value={pending} />
      </div>

      <h2 className="mt-12 font-display text-xl font-bold text-brand-blue">
        আমার আর্টিকেল
      </h2>

      {articles.length === 0 ? (
        <p className="mt-4 text-brand-charcoal/60">
          এখনো কোনো লেখা জমা দাওনি।{" "}
          <Link href="/articles/new" className="font-semibold text-brand-orange">
            প্রথম লেখা শুরু করো →
          </Link>
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {articles.map((article) => {
            const status = STATUS_LABELS[article.status];
            const meta = courseCategoryMeta(article.category);
            return (
              <div key={article.id} className="card flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge text-white" style={{ backgroundColor: meta.tint }}>
                    {meta.bn}
                  </span>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                  <span className="text-xs text-brand-charcoal/50">
                    {formatDate(article.updatedAt)}
                  </span>
                </div>

                <Link
                  href={`/articles/${article.slug}`}
                  className="font-display text-lg font-bold text-brand-blue hover:text-brand-orange"
                >
                  {article.title}
                </Link>
                <p className="line-clamp-2 text-sm text-brand-charcoal/65">
                  {article.summary}
                </p>

                {article.reviewerNote && article.status === "REJECTED" && (
                  <p className="rounded-2xl bg-brand-red/10 px-4 py-2 text-sm text-brand-red">
                    পর্যালোচকের মন্তব্য: {article.reviewerNote}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-charcoal/55">
                    <Eye className="h-3.5 w-3.5" /> {article.views} ভিউ
                  </span>
                  {article.status !== "PUBLISHED" && (
                    <>
                      <Link
                        href={`/account/articles/${article.id}/edit`}
                        className="btn-secondary !px-4 !py-2"
                      >
                        <Pencil className="h-4 w-4" /> সম্পাদনা
                      </Link>
                      <form action={deleteArticleAction}>
                        <input type="hidden" name="id" value={article.id} />
                        <button type="submit" className="btn-ghost !px-3 !py-2">
                          <Trash2 className="h-4 w-4" /> মুছুন
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <p className="font-display text-3xl font-extrabold text-brand-orange">{value}</p>
      <p className="mt-1 text-sm font-semibold text-brand-charcoal/60">{label}</p>
    </div>
  );
}
