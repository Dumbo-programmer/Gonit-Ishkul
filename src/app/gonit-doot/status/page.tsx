import { StatusTracker } from "@/components/StatusTracker";
import { StatusResult } from "@/components/StatusResult";
import { PageHeading } from "@/components/PageHeading";
import {
  findApplicationByEmail,
  findApplicationByTrackingCode,
} from "@/lib/repositories/ambassador";

export const dynamic = "force-dynamic";

export default function StatusPage({
  searchParams,
}: {
  searchParams: { code?: string; email?: string };
}) {
  const query = searchParams.code ?? searchParams.email;

  let application = null;
  if (query) {
    application = query.includes("@")
      ? findApplicationByEmail(query) ?? null
      : findApplicationByTrackingCode(query) ?? null;
  }

  return (
    <div className="min-h-[70vh] bg-brand-purple/10">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <PageHeading titleKey="status.title" subtitle="Prothom Alo Gonit Ishkul" />
        <div className="mt-6">
          <StatusTracker initial={query ?? ""} />
        </div>
        {query && (
          <div className="mt-8">
            <StatusResult application={application} query={query} />
          </div>
        )}
      </div>
    </div>
  );
}