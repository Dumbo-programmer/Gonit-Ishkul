"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-red/10 text-brand-red">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="text-xl font-black text-brand-charcoal">
        কিছু একটা ভুল হয়েছে
      </h1>
      <p className="text-sm text-brand-charcoal/60">
        পেজটি লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা কিছুক্ষণ পর ফিরে আসুন।
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        <RotateCcw className="h-4 w-4" />
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}
