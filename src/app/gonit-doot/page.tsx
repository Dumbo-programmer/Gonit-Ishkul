import { DootLanding } from "@/components/DootLanding";
import { DISTRICTS } from "@/lib/districts";
import {
  coverageByDistrict,
  getLeaderboard,
  listActivities,
} from "@/lib/repositories/ambassador";

export const dynamic = "force-dynamic";

export default async function GonitDootPage() {
  const coverage: Record<string, number> = {};
  for (const [district, count] of await coverageByDistrict()) {
    coverage[district] = count;
  }

  const divisionByDistrict = new Map(DISTRICTS.map((d) => [d.en, d.division]));
  const schools: Record<string, number> = {};
  for (const activity of await listActivities()) {
    const division = divisionByDistrict.get(activity.district);
    if (division) schools[division] = (schools[division] ?? 0) + 1;
  }

  const leaderboard = await getLeaderboard();

  return (
    <DootLanding
      coverage={coverage}
      leaderboard={leaderboard}
      schools={schools}
    />
  );
}