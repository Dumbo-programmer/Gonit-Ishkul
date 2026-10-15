"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { MathDoodles } from "@/components/MathDoodles";

export function HomeCta() {
  const { lang } = useLang();
  const bn = lang === "bn";

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0e1730] via-[#141b3a] to-[#1b2455] px-6 py-16 text-center text-white shadow-lift sm:px-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-mesh opacity-30 motion-safe:animate-pulse-glow" />
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand-orange/25 blur-3xl motion-safe:animate-blob" />
          <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-brand-purple/30 blur-3xl motion-safe:animate-blob" />
        </div>
        <MathDoodles tone="light" className="-z-10" />

        <div className="relative mx-auto max-w-2xl">
          <span className="badge bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            <Sparkles className="h-4 w-4 text-brand-orange" />
            {bn ? "সম্পূর্ণ ফ্রি" : "Completely free"}
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
            {bn
              ? "আজই তোমার গণিতের যাত্রা শুরু করো"
              : "Start your math journey today"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            {bn
              ? "শেখা, সমাধান, কনটেস্ট আর লেখা — সব এক জায়গায়, একেবারে ফ্রি।"
              : "Learning, solving, contests and writing — all in one place, totally free."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/courses" className="btn-primary group">
              {bn ? "শেখা শুরু করো" : "Start learning"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/gonit-doot/apply"
              className="btn bg-white/10 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/20"
            >
              <Users className="h-5 w-5" />
              {bn ? "গণিত দূত হও" : "Become a Gonit Doot"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
