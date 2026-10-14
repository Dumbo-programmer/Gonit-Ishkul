"use client";

import Image from "next/image";
import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { useSession } from "next-auth/react";

export function PhasePlaceholder({
  phase,
  titleBn,
  titleEn,
  descBn,
  descEn,
  checklist,
}: {
  phase: number;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  checklist: { bn: string; en: string }[];
}) {
  const { lang, t } = useLang();
  const { data: session } = useSession();

  return (
    <div className="math-bg min-h-[80vh] bg-brand-purple/5">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Image
          src="/brand/gonit-bhaiya.jpeg"
          alt="গণিত ভাইয়া"
          width={96}
          height={96}
          className="mx-auto mb-5 h-24 w-24 animate-float rounded-full object-cover ring-4 ring-brand-orange/30"
        />
        <span className="badge bg-brand-blue/10 text-brand-blue">
          <Construction className="h-4 w-4" />
          {lang === "bn" ? `ফেজ ${phase}` : `Phase ${phase}`}
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-brand-blue sm:text-4xl">
          {lang === "bn" ? titleBn : titleEn}
        </h1>
        <p className="mt-3 text-brand-charcoal/70">{lang === "bn" ? descBn : descEn}</p>
        {session?.user && (
          <p className="mt-2 text-xs text-brand-charcoal/50">
            {lang === "bn" ? "লগ ইন করা:" : "Signed in as:"} {session.user.email}
          </p>
        )}

        <ul className="card mx-auto mt-8 max-w-xl space-y-3 text-left">
          {checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-brand-charcoal/80">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-orange" />
              {lang === "bn" ? item.bn : item.en}
            </li>
          ))}
        </ul>

        <Link href="/gonit-doot" className="btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" />
          {t("common.ambassador")}
        </Link>
      </div>
    </div>
  );
}