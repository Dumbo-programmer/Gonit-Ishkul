import { contestPhase } from "@/lib/arena";
import { listContests, listContestEntries, ratingLeaderboard } from "@/lib/repositories/contests";
import { ContestBoard } from "@/components/ContestBoard";
import type { ContestListItem } from "@/components/ContestList";

export const metadata = {
  title: "কনটেস্ট অ্যারিনা · গণিত ইশকুল",
};

export default async function ContestsPage() {
  const contests: ContestListItem[] = (await Promise.all((await listContests()).map(async (c) => ({
    slug: c.slug,
    titleBn: c.titleBn,
    titleEn: c.titleEn,
    descriptionBn: c.descBn,
    descriptionEn: c.descEn,
    startsAt: c.startAt,
    endsAt: c.endAt,
    problemCount: c.problemIds.length,
    participants: (await listContestEntries(c.id)).length,
    phase: contestPhase(c),
  }))))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const ratings = await ratingLeaderboard();

  return <ContestBoard contests={contests} ratings={ratings} />;
}
