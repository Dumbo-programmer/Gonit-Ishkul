import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-lavender/15 text-brand-purple">
        <Compass className="h-7 w-7" />
      </span>
      <p className="text-4xl font-black text-brand-charcoal">৪০৪</p>
      <h1 className="text-lg font-bold text-brand-charcoal">পেজটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-sm text-brand-charcoal/60">
        আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে ফেলা হয়েছে।
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-blue/90"
      >
        হোমে ফিরে যান
      </Link>
    </div>
  );
}
