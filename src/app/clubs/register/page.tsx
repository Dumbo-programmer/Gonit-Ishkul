import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Building2, LayoutDashboard } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getClubByRepresentative } from "@/lib/repositories/clubs";
import { RegisterClubForm } from "@/components/RegisterClubForm";

export const dynamic = "force-dynamic";

export default async function RegisterClubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/clubs/register");
  }
  const existing = getClubByRepresentative(session.user.uid);

  return (
    <div className="math-bg bg-brand-purple/5">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <span className="badge bg-brand-purple/10 text-brand-purple">
          <Building2 className="h-4 w-4" /> ক্লাব নিবন্ধন
        </span>
        <h1 className="section-title title-accent mt-3">তোমার গণিত ক্লাব নিবন্ধন করো</h1>
        <p className="mt-2 text-brand-charcoal/65">
          স্কুল, কলেজ বা বিশ্ববিদ্যালয়ের গণিত ক্লাবের তথ্য জমা দাও। অ্যাডমিন অনুমোদনের পর ক্লাবটি
          সর্বজনীন হবে এবং তুমি এর প্রতিনিধি হিসেবে কনটেন্ট পরিচালনা করতে পারবে।
        </p>

        {existing ? (
          <div className="card mt-8 space-y-4">
            <p className="text-sm text-brand-charcoal/70">
              তুমি ইতিমধ্যে <span className="font-bold">{existing.nameBn}</span> ক্লাবের প্রতিনিধি
              (স্ট্যাটাস: {existing.status})।
            </p>
            <Link href="/clubs/dashboard" className="btn-primary w-fit">
              <LayoutDashboard className="h-4 w-4" /> ড্যাশবোর্ডে যাও
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <RegisterClubForm />
          </div>
        )}
      </div>
    </div>
  );
}
