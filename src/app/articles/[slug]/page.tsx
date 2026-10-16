import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Eye, Tag, UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  getArticleBySlug,
  incrementArticleViews,
} from "@/lib/repositories/articles";
import { MathContent } from "@/components/MathContent";
import { courseCategoryMeta } from "@/lib/learning";
import { formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const session = await getServerSession(authOptions);
  const viewer = session?.user as
    | { uid?: string; role?: string }
    | undefined;
  const isOwner = viewer?.uid === article.authorId;
  const isAdmin = viewer?.role === "ADMIN";

  if (article.status !== "PUBLISHED" && !isOwner && !isAdmin) {
    notFound();
  }

  if (article.status === "PUBLISHED" && !isOwner) {
    await incrementArticleViews(article.id);
  }

  const meta = courseCategoryMeta(article.category);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-orange"
      >
        <ArrowLeft className="h-4 w-4" /> সব আর্টিকেল
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="badge text-white" style={{ backgroundColor: meta.tint }}>
          {meta.bn}
        </span>
        {article.audience === "AMBASSADOR" && (
          <span className="badge bg-brand-blue/10 text-brand-blue">দূত চ্যানেল</span>
        )}
        {article.status !== "PUBLISHED" && (
          <span className="badge bg-amber-100 text-amber-700">
            {article.status === "PENDING" ? "পর্যালোচনায়" : article.status}
          </span>
        )}
      </div>

      <h1 className="mt-4 font-display text-3xl font-extrabold text-brand-blue">
        {article.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-brand-charcoal/60">
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="h-4 w-4" /> {article.authorName}
        </span>
        <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-4 w-4" /> {formatNumber(article.views)}
        </span>
      </div>

      {article.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverUrl}
          alt={article.title}
          className="mt-8 w-full rounded-3xl object-cover"
        />
      )}

      <p className="mt-8 rounded-3xl bg-brand-lavender/10 px-5 py-4 text-base font-semibold text-brand-charcoal/80">
        {article.summary}
      </p>

      <div className="prose-math mt-8 text-lg leading-relaxed text-brand-charcoal/90">
        <MathContent text={article.body} />
      </div>

      {article.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-brand-charcoal/50" />
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-lavender/15 px-3 py-1 text-xs font-semibold text-brand-charcoal/70"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
