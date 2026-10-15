import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Pencil } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getArticleById } from "@/lib/repositories/articles";
import { ArticleForm } from "@/components/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/account`);
  }

  const article = getArticleById(params.id);
  if (!article || article.authorId !== session.user.uid) notFound();
  if (article.status === "PUBLISHED") {
    redirect(`/articles/${article.slug}`);
  }

  const role = (session.user as { role?: string }).role;
  const canAmbassadorChannel =
    role === "AMBASSADOR" || role === "MENTOR" || role === "ADMIN";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <span className="badge bg-brand-blue/10 text-brand-blue">
        <Pencil className="h-4 w-4" /> লেখা সম্পাদনা
      </span>
      <h1 className="section-title title-accent mt-3">আর্টিকেল সম্পাদনা করো</h1>
      <p className="mt-2 text-brand-charcoal/65">
        সম্পাদনা করার পর লেখা আবার পর্যালোচনার জন্য পাঠানো হবে।
      </p>

      <div className="mt-8">
        <ArticleForm
          mode="edit"
          canAmbassadorChannel={canAmbassadorChannel}
          values={{
            id: article.id,
            title: article.title,
            summary: article.summary,
            body: article.body,
            category: article.category,
            audience: article.audience,
            tags: article.tags,
            coverUrl: article.coverUrl,
          }}
        />
      </div>
    </div>
  );
}
