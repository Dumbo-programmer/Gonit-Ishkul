"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  createArticle,
  deleteArticle,
  reviewArticle,
  updateArticle,
  type ArticleInput,
} from "@/lib/repositories/articles";
import type { ArticleAudience, CourseCategory } from "@/lib/types";
import type { ArticleFormState } from "@/lib/articleForm";

const CATEGORIES = ["TRIVIA", "SOLUTIONS", "MO_TRAINING", "ARTICLE_WRITING"] as const;

const articleSchema = z.object({
  title: z.string().trim().min(6, "শিরোনাম অন্তত ৬ অক্ষরের হতে হবে"),
  summary: z.string().trim().min(20, "সারসংক্ষেপ অন্তত ২০ অক্ষরের হতে হবে"),
  body: z.string().trim().min(80, "মূল লেখা অন্তত ৮০ অক্ষরের হতে হবে"),
  category: z.enum(CATEGORIES),
  audience: z.enum(["PUBLIC", "AMBASSADOR"]),
  tags: z.string().trim().optional().or(z.literal("")),
  coverUrl: z.string().trim().url("সঠিক লিংক দিন").optional().or(z.literal("")),
});

function canUseAmbassadorChannel(role: string | undefined): boolean {
  return role === "AMBASSADOR" || role === "ADMIN" || role === "MENTOR";
}

function parseInput(formData: FormData): {
  data?: ArticleInput;
  errors?: Record<string, string>;
} {
  const raw = Object.fromEntries(formData.entries());
  const parsed = articleSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { errors };
  }
  const audience = parsed.data.audience as ArticleAudience;
  return {
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      body: parsed.data.body,
      category: parsed.data.category as CourseCategory,
      audience,
      tags: (parsed.data.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverUrl: parsed.data.coverUrl || undefined,
    },
  };
}

export async function submitArticleAction(
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/articles/new");
  if (!can(session.user.role, "articles.submit")) {
    return { ok: false, message: "আপনার লেখা জমা দেওয়ার অনুমতি নেই।" };
  }

  const { data, errors } = parseInput(formData);
  if (!data || errors) return { ok: false, message: "ফর্মে ত্রুটি আছে", errors };

  const allowedAmbassador = canUseAmbassadorChannel(session.user.role);
  if (data.audience === "AMBASSADOR" && !allowedAmbassador) {
    data.audience = "PUBLIC";
  }

  createArticle({ id: session.user.uid, name: session.user.name ?? "Anonymous" }, data);
  revalidatePath("/articles");
  revalidatePath("/account");
  redirect("/account?submitted=1");
}

export async function updateArticleAction(
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const id = String(formData.get("id") ?? "");

  const { data, errors } = parseInput(formData);
  if (!data || errors) return { ok: false, message: "ফর্মে ত্রুটি আছে", errors };

  const allowedAmbassador = canUseAmbassadorChannel(session.user.role);
  if (data.audience === "AMBASSADOR" && !allowedAmbassador) {
    data.audience = "PUBLIC";
  }

  const updated = updateArticle(id, session.user.uid, data);
  if (!updated) {
    return { ok: false, message: "লেখা সম্পাদনা করা যায়নি।" };
  }
  revalidatePath("/account");
  revalidatePath(`/articles/${updated.slug}`);
  redirect("/account?updated=1");
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const id = String(formData.get("id") ?? "");
  deleteArticle(id, session.user.uid);
  revalidatePath("/account");
}

export async function reviewArticleAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "articles.review")) {
    redirect("/auth/signin");
  }
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("reviewerNote") ?? "").trim();
  if (decision !== "PUBLISHED" && decision !== "REJECTED") return;
  reviewArticle(id, decision, note || undefined);
  revalidatePath("/admin");
  revalidatePath("/articles");
}
