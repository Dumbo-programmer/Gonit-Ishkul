import { getStore, persistStore, uid } from "@/lib/store";
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

function uniqueSlug(store: ReturnType<typeof getStore>, base: string): string {
  const root = slugify(base) || `article-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (store.articles.some((a) => a.slug === slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export function listPublishedArticles(filter?: {
  audience?: ArticleAudience;
  category?: CourseCategory;
}): ArticleRecord[] {
  return getStore()
    .articles.filter((a) => a.status === "PUBLISHED")
    .filter((a) => (filter?.audience ? a.audience === filter.audience : true))
    .filter((a) => (filter?.category ? a.category === filter.category : true))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export function getArticleBySlug(slug: string): ArticleRecord | undefined {
  return getStore().articles.find((a) => a.slug === slug);
}

export function getArticleById(id: string): ArticleRecord | undefined {
  return getStore().articles.find((a) => a.id === id);
}

export function listArticlesByAuthor(authorId: string): ArticleRecord[] {
  return getStore()
    .articles.filter((a) => a.authorId === authorId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listArticlesByStatus(status: ArticleStatus): ArticleRecord[] {
  return getStore()
    .articles.filter((a) => a.status === status)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listAllArticles(): ArticleRecord[] {
  return [...getStore().articles].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function incrementArticleViews(id: string): void {
  const store = getStore();
  const article = store.articles.find((a) => a.id === id);
  if (!article) return;
  article.views += 1;
  persistStore(store);
}

export function createArticle(
  author: { id: string; name: string },
  input: ArticleInput,
  status: ArticleStatus = "PENDING",
): ArticleRecord {
  const store = getStore();
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
  persistStore(store);
  return record;
}

export function updateArticle(
  id: string,
  authorId: string,
  input: ArticleInput,
  status: ArticleStatus = "PENDING",
): ArticleRecord | undefined {
  const store = getStore();
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
  persistStore(store);
  return article;
}

export function reviewArticle(
  id: string,
  decision: Extract<ArticleStatus, "PUBLISHED" | "REJECTED">,
  reviewerNote?: string,
): ArticleRecord | undefined {
  const store = getStore();
  const article = store.articles.find((a) => a.id === id);
  if (!article) return undefined;
  const now = new Date().toISOString();
  article.status = decision;
  article.reviewerNote = reviewerNote;
  article.updatedAt = now;
  if (decision === "PUBLISHED") article.publishedAt = now;
  persistStore(store);
  return article;
}

export function deleteArticle(id: string, authorId: string): boolean {
  const store = getStore();
  const index = store.articles.findIndex(
    (a) => a.id === id && a.authorId === authorId && a.status !== "PUBLISHED",
  );
  if (index === -1) return false;
  store.articles.splice(index, 1);
  persistStore(store);
  return true;
}
