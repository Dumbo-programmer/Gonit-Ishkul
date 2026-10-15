"use client";

import Link from "next/link";
import { ArrowRight, Eye, PenLine } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { courseCategoryMeta } from "@/lib/learning";
import { formatDate, formatNumber } from "@/lib/utils";
import type { CourseCategory } from "@/lib/types";

export interface LatestArticleItem {
  slug: string;
  title: string;
  summary: string;
  category: string;
  authorName: string;
  views: number;
  publishedAt?: string;
}

export function LatestArticles({ articles }: { articles: LatestArticleItem[] }) {
  const { lang } = useLang();
  const bn = lang === "bn";

  if (articles.length === 0) return null;

  return (
    <section className="bg-brand-blue/5">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="badge bg-brand-purple/10 text-brand-purple">
              <PenLine className="h-4 w-4" />
              {bn ? "নতুন লেখা" : "Fresh writing"}
            </span>
            <h2 className="section-title title-accent mt-4">
              {bn ? "সাম্প্রতিক আর্টিকেল" : "Latest articles"}
            </h2>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-orange"
          >
            {bn ? "সব আর্টিকেল" : "All articles"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const meta = courseCategoryMeta(article.category as CourseCategory);
            return (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="card card-glow flex h-full flex-col gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <span
                  className="badge w-fit text-white"
                  style={{ backgroundColor: meta.tint }}
                >
                  {bn ? meta.bn : meta.en}
                </span>
                <h3 className="font-display text-lg font-bold text-brand-blue">
                  {article.title}
                </h3>
                <p className="line-clamp-3 text-sm text-brand-charcoal/65">
                  {article.summary}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs font-semibold text-brand-charcoal/55">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatNumber(article.views)}
                  </span>
                  <span>{article.authorName}</span>
                  {article.publishedAt && (
                    <span className="text-brand-charcoal/45">
                      {formatDate(article.publishedAt)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
