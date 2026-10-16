import { HeroBanner } from "@/components/HeroBanner";
import { HomeSections } from "@/components/HomeSections";
import { listCourses } from "@/lib/repositories/courses";
import { listProblems } from "@/lib/repositories/problems";
import { listUsers } from "@/lib/repositories/users";
import { coverageByDistrict } from "@/lib/repositories/ambassador";
import { listPublishedArticles } from "@/lib/repositories/articles";
import type { LatestArticleItem } from "@/components/LatestArticles";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = {
    learners: (await listUsers()).length,
    courses: (await listCourses()).length,
    problems: (await listProblems()).length,
    districts: (await coverageByDistrict()).size,
  };

  const articles: LatestArticleItem[] = (await listPublishedArticles())
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      category: a.category,
      authorName: a.authorName,
      views: a.views,
      publishedAt: a.publishedAt,
    }));

  return (
    <>
      <HeroBanner stats={stats} />
      <HomeSections articles={articles} />
    </>
  );
}
