"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ApplyForm } from "@/components/ApplyForm";
import { useLang } from "@/lib/i18n/LangContext";

export default function ApplyPage() {
  const { t, tList, lang } = useLang();

  return (
    <div className="math-bg">
      <section className="bg-brand-blue text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Link href="/gonit-doot" className="text-sm text-white/80 hover:text-brand-orange">
            ← {t("common.back")}
          </Link>
          <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            {t("apply.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-white/85">{t("doot.summary")}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.6fr_1fr]">
        <ApplyForm />

        <aside className="space-y-6">
          <div className="card">
            <h2 className="mb-4 text-lg font-bold text-brand-blue">
              {t("doot.eligibilityTitle")}
            </h2>
            <ul className="space-y-3 text-sm">
              {tList("doot.eligibility").map((item, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                  <span>{lang === "bn" ? item.bn : item.en}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card bg-brand-lavender/10">
            <h2 className="mb-2 text-lg font-bold text-brand-blue">
              {t("doot.processTitle")}
            </h2>
            <p className="text-sm text-brand-charcoal/75">
              {lang === "bn"
                ? "জমা দেওয়ার পর তুমি ট্র্যাকিং কোড পাবে। সেটি দিয়ে যেকোনো সময় স্ট্যাটাস দেখতে পারবে।"
                : "After submitting you'll get a tracking code. Use it to check your status anytime."}
            </p>
            <Link href="/gonit-doot/status" className="btn-secondary mt-4 w-full">
              {t("doot.statusBadge")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}