import { getStore, persistStore, uid } from "@/lib/store";
import type { StoreShape } from "@/lib/store";
import { slugify } from "@/lib/utils";
import type {
  ArticleAudience,
  ArticleRecord,
  ArticleStatus,
  CourseCategory,
} from "@/lib/types";

export interface ArticleInput {
  title: string;
  summary: string;
  body: string;
  category: CourseCategory;
  audience: ArticleAudience;
  tags: string[];
  coverUrl?: string;
}

function uniqueSlug(store: StoreShape, base: string): string {
  const root = slugify(base) || `article-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (store.articles.some((a) => a.slug === slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export async function listPublishedArticles(filter?: {
  audience?: ArticleAudience;
  category?: CourseCategory;
}): Promise<ArticleRecord[]> {
  return (await getStore())
    .articles.filter((a) => a.status === "PUBLISHED")
    .filter((a) => (filter?.audience ? a.audience === filter.audience : true))
    .filter((a) => (filter?.category ? a.category === filter.category : true))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function getArticleBySlug(slug: string): Promise<ArticleRecord | undefined> {
  return (await getStore()).articles.find((a) => a.slug === slug);
}

export async function getArticleById(id: string): Promise<ArticleRecord | undefined> {
  return (await getStore()).articles.find((a) => a.id === id);
}

export async function listArticlesByAuthor(authorId: string): Promise<ArticleRecord[]> {
  return (await getStore())
    .articles.filter((a) => a.authorId === authorId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listArticlesByStatus(status: ArticleStatus): Promise<ArticleRecord[]> {
  return (await getStore())
    .articles.filter((a) => a.status === status)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listAllArticles(): Promise<ArticleRecord[]> {
  return [...(await getStore()).articles].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function incrementArticleViews(id: string): Promise<void> {
  const store = await getStore();
  const article = store.articles.find((a) => a.id === id);
  if (!article) return;
  article.views += 1;
  await persistStore(store);
}

export async function createArticle(
  author: { id: string; name: string },
  input: ArticleInput,
  status: ArticleStatus = "PENDING",
): Promise<ArticleRecord> {
  const store = await getStore();
  const now = new Date().toISOString();
  const record: ArticleRecord = {
    id: uid("art"),
    slug: uniqueSlug(store, input.title),
    title: input.title,
    summary: input.summary,
    body: input.body,
    category: input.category,
    audience: input.audience,
    tags: input.tags,
    coverUrl: input.coverUrl,
    authorId: author.id,
    authorName: author.name,
    status,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };
  store.articles.push(record);
  await persistStore(store);
  return record;
}

export async function updateArticle(
  id: string,
  authorId: string,
  input: ArticleInput,
  status: ArticleStatus = "PENDING",
): Promise<ArticleRecord | undefined> {
  const store = await getStore();
  const article = store.articles.find((a) => a.id === id);
  if (!article || article.authorId !== authorId) return undefined;
  if (article.status === "PUBLISHED") return undefined;
  article.title = input.title;
  article.summary = input.summary;
  article.body = input.body;
  article.category = input.category;
  article.audience = input.audience;
  article.tags = input.tags;
  article.coverUrl = input.coverUrl;
  article.status = status;
  article.reviewerNote = undefined;
  article.updatedAt = new Date().toISOString();
  await persistStore(store);
  return article;
}

export async function reviewArticle(
  id: string,
  decision: Extract<ArticleStatus, "PUBLISHED" | "REJECTED">,
  reviewerNote?: string,
): Promise<ArticleRecord | undefined> {
  const store = await getStore();
  const article = store.articles.find((a) => a.id === id);
  if (!article) return undefined;
  const now = new Date().toISOString();
  article.status = decision;
  article.reviewerNote = reviewerNote;
  article.updatedAt = now;
  if (decision === "PUBLISHED") article.publishedAt = now;
  await persistStore(store);
  return article;
}

export async function deleteArticle(id: string, authorId: string): Promise<boolean> {
  const store = await getStore();
  const index = store.articles.findIndex(
    (a) => a.id === id && a.authorId === authorId && a.status !== "PUBLISHED",
  );
  if (index === -1) return false;
  store.articles.splice(index, 1);
  await persistStore(store);
  return true;
}
