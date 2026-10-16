import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { DootDashboard } from "@/components/DootDashboard";
import {
  findApplicationByEmail,
  getAmbassadorStats,
  getLeaderboard,
  listActivities,
} from "@/lib/repositories/ambassador";
import { listBulletins, listResourceKit } from "@/lib/repositories/resources";
import { tierForPoints } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/gonit-doot/dashboard");
  }

  const uid = session.user.uid;
  const application = session.user.email
    ? await findApplicationByEmail(session.user.email)
    : undefined;

  const stats = await getAmbassadorStats(uid);
  const leaderboard = await getLeaderboard();
  const rank = leaderboard.findIndex((r) => r.userId === uid) + 1;
  const totalPoints = leaderboard.find((r) => r.userId === uid)?.points ?? stats.points;
  const activities = await listActivities(uid);
  const resources = await listResourceKit();
  const bulletins = await listBulletins();

  return (
    <DootDashboard
      ambassador={{
        name: session.user.name ?? "Gonit Doot",
        district: application?.district ?? "Dhaka",
      }}
      stats={stats}
      tier={tierForPoints(totalPoints)}
      rank={rank > 0 ? rank : leaderboard.length + 1}
      activities={activities}
      resources={resources}
      bulletins={bulletins}
      leaderboard={leaderboard}
      canReview={can(session.user.role, "ambassador.review")}
    />
  );
}