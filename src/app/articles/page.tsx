import Link from "next/link";
import { getServerSession } from "next-auth";
import { Eye, PenLine } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { listPublishedArticles } from "@/lib/repositories/articles";
import { COURSE_CATEGORIES, courseCategoryMeta } from "@/lib/learning";
import { formatDate, formatNumber } from "@/lib/utils";
import type { CourseCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const AMBASSADOR_ROLES = ["AMBASSADOR", "MENTOR", "ADMIN", "INSTRUCTOR"];

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role ?? "STUDENT";
  const canSeeAmbassador = AMBASSADOR_ROLES.includes(role);

  const category = COURSE_CATEGORIES.some((c) => c.value === searchParams?.category)
    ? (searchParams?.category as CourseCategory)
    : undefined;

  const articles = listPublishedArticles({ category }).filter((a) =>
    a.audience === "PUBLIC" ? true : canSeeAmbassador,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="badge bg-brand-purple/10 text-brand-purple">
            <PenLine className="h-4 w-4" /> আর্টিকেল ও জ্ঞান
          </span>
          <h1 className="section-title mt-3">গণিতের আর্টিকেল ও ভাবনা</h1>
          <p className="mt-2 max-w-2xl text-brand-charcoal/65">
            শিক্ষার্থী ও ক্যাম্পাস দূতদের লেখা ফ্রি আর্টিকেল — পড়া শেখা, সমস্যার সমাধান আর
            অলিম্পিয়াড ভাবনা।
          </p>
        </div>
        <Link href="/articles/new" className="btn-primary">
          <PenLine className="h-4 w-4" /> লেখা জমা দিন
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Chip href="/articles" active={!category} label="সব ক্যাটাগরি" />
        {COURSE_CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            href={`/articles?category=${c.value}`}
            active={category === c.value}
            label={c.bn}
          />
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="mt-12 text-center text-brand-charcoal/60">
          এখনো কোনো আর্টিকেল প্রকাশিত হয়নি।
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const meta = courseCategoryMeta(article.category);
            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="card flex h-full flex-col gap-3 transition hover:-translate-y-1 hover:shadow-bubble"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="badge text-white"
                    style={{ backgroundColor: meta.tint }}
                  >
                    {meta.bn}
                  </span>
                  {article.audience === "AMBASSADOR" && (
                    <span className="badge bg-brand-blue/10 text-brand-blue">
                      দূত চ্যানেল
                    </span>
                  )}
                </div>
                <h2 className="font-display text-lg font-bold text-brand-blue">
                  {article.title}
                </h2>
                <p className="line-clamp-3 text-sm text-brand-charcoal/65">
                  {article.summary}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs font-semibold text-brand-charcoal/55">
                  <span>{article.authorName}</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatNumber(article.views)}
                  </span>
                </div>
                <span className="text-xs text-brand-charcoal/45">
                  {article.publishedAt ? formatDate(article.publishedAt) : ""}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-transparent bg-brand-blue text-white"
          : "border-brand-lavender/30 bg-white text-brand-charcoal/70 hover:border-brand-lavender/60"
      }`}
    >
      {label}
    </Link>
  );
}
