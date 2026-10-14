import { contestPhase } from "@/lib/arena";
import { listContests, listContestEntries, ratingLeaderboard } from "@/lib/repositories/contests";
import { ContestBoard } from "@/components/ContestBoard";
import type { ContestListItem } from "@/components/ContestList";

export const metadata = {
  title: "কনটেস্ট অ্যারিনা · গণিত ইশকুল",
};

export default function ContestsPage() {
  const contests: ContestListItem[] = listContests()
    .map((c) => ({
      slug: c.slug,
      titleBn: c.titleBn,
      titleEn: c.titleEn,
      descriptionBn: c.descBn,
      descriptionEn: c.descEn,
      startsAt: c.startAt,
      endsAt: c.endAt,
      problemCount: c.problemIds.length,
      participants: listContestEntries(c.id).length,
      phase: contestPhase(c),
    }))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return <ContestBoard contests={contests} ratings={ratingLeaderboard()} />;
}
