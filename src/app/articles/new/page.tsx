import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { PenLine } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { ArticleForm } from "@/components/ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/articles/new");
  }
  const role = (session.user as { role?: string }).role;
  const canAmbassadorChannel =
    role === "AMBASSADOR" || role === "MENTOR" || role === "ADMIN";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <span className="badge bg-brand-purple/10 text-brand-purple">
        <PenLine className="h-4 w-4" /> নতুন আর্টিকেল
      </span>
      <h1 className="section-title mt-3">তোমার লেখা জমা দাও</h1>
      <p className="mt-2 text-brand-charcoal/65">
        {canAmbassadorChannel
          ? "সবার জন্য পাবলিক আর্টিকেল, কিংবা ক্যাম্পাস দূত চ্যানেলে লেখা — দুটোই জমা দিতে পারো।"
          : "তোমার গণিত-ভাবনা সবার জন্য পাবলিক আর্টিকেল হিসেবে জমা দাও।"}
      </p>

      <div className="mt-8">
        <ArticleForm mode="create" canAmbassadorChannel={canAmbassadorChannel} />
      </div>
    </div>
  );
}
