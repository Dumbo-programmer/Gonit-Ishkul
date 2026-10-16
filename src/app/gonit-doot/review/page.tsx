import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PageHeading } from "@/components/PageHeading";
import { ReviewQueue } from "@/components/ReviewQueue";
import { listActivities, listApplications } from "@/lib/repositories/ambassador";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/gonit-doot/review");
  }
  if (!can(session.user.role, "ambassador.review")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="section-title text-brand-red">403 — Access denied</h1>
        <p className="mt-3 text-brand-charcoal/70">
          Only mentors and administrators can access the review queue.
        </p>
      </div>
    );
  }

  const pending = (await listActivities()).filter((a) => a.status === "PENDING");
  const applications = await listApplications();

  return (
    <div className="math-bg min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <PageHeading
          titleKey="dashboard.title"
          subtitle="Mentor & Admin Review Queue"
          align="left"
        />
        <div className="mt-8">
          <ReviewQueue applications={applications} activities={pending} />
        </div>
      </div>
    </div>
  );
}