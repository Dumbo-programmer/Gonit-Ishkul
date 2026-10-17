import Link from "next/link";
import { getServerSession } from "next-auth";
import { Building2, LayoutDashboard } from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  clubEntryCounts,
  getClubByRepresentative,
  listPublishedClubs,
} from "@/lib/repositories/clubs";
import { ClubCard } from "@/components/ClubCard";

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const clubs = await listPublishedClubs();
  const session = await getServerSession(authOptions);
  const myClub = session?.user ? await getClubByRepresentative(session.user.uid) : undefined;
  const clubsWithCounts = await Promise.all(
    clubs.map(async (club) => ({ club, counts: await clubEntryCounts(club.id) })),
  );

  return (
    <div className="math-bg bg-brand-purple/5">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge bg-brand-purple/10 text-brand-purple">
            <Building2 className="h-4 w-4" /> পার্টনার ক্লাব
          </span>
        </div>
        <h1 className="section-title title-accent mt-3">গণিত ক্লাব নেটওয়ার্ক</h1>
        <p className="mt-2 max-w-3xl text-brand-charcoal/65">
          সারা দেশের অনুমোদিত গণিত ক্লাবগুলোর সমস্যা, নোট, আর্টিকেল ও ইভেন্ট এক জায়গায়।
          প্রতিটি ক্লাবের প্রতিনিধি নিজের কনটেন্ট জমা দেন; অ্যাডমিন অনুমোদনের পর তা সর্বজনীন হয়।
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {myClub ? (
            <>
              <Link href="/clubs/dashboard" className="btn-primary">
                <LayoutDashboard className="h-4 w-4" /> আমার ক্লাব ড্যাশবোর্ড
              </Link>
              <Link href={`/clubs/${myClub.slug}`} className="btn-ghost">
                <Building2 className="h-4 w-4" /> আমার ক্লাবের পাতা
              </Link>
            </>
          ) : (
            <>
              <Link href="/clubs/dashboard" className="btn-secondary">
                <LayoutDashboard className="h-4 w-4" /> প্রতিনিধি ড্যাশবোর্ড
              </Link>
              <p className="text-xs text-brand-charcoal/55">
                ক্লাব প্রতিনিধি অ্যাকাউন্ট প্রশাসনিকভাবে তৈরি ও প্রদান করা হয় — নিবন্ধনের জন্য অ্যাডমিন টিমের সাথে যোগাযোগ করো।
              </p>
            </>
          )}
        </div>

        {clubs.length === 0 ? (
          <p className="mt-12 text-brand-charcoal/60">এখনো কোনো অনুমোদিত ক্লাব নেই।</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clubsWithCounts.map(({ club, counts }) => (
              <ClubCard key={club.id} club={club} counts={counts} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
