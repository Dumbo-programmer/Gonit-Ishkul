"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  PenLine,
  Swords,
  UserPlus,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { MathDoodles } from "@/components/MathDoodles";

const STEPS = [
  {
    icon: UserPlus,
    href: "/gonit-doot/apply",
    bn: {
      title: "গণিত দূত হিসেবে যোগ দাও",
      desc: "আবেদন করো, ক্যাম্পাসে দূত হয়ে গণিতের আন্দোলন গড়ে তোলো।",
    },
    en: {
      title: "Join as a Gonit Doot",
      desc: "Apply and lead a mathematics movement on your campus.",
    },
  },
  {
    icon: BookOpen,
    href: "/courses",
    bn: {
      title: "ফ্রি ট্র্যাক থেকে শেখো",
      desc: "ট্রিভিয়া ভিডিও, এলোমেলো সমাধান আর MO প্রশিক্ষণ — সব সম্পূর্ণ ফ্রি।",
    },
    en: {
      title: "Learn from free tracks",
      desc: "Trivia videos, random solutions and MO training — completely free.",
    },
  },
  {
    icon: Swords,
    href: "/problems",
    bn: {
      title: "সমস্যা ও কনটেস্ট",
      desc: "আর্কাইভ থেকে সমাধান জমা দাও, কনটেস্টে রেটিং তুলে নাও।",
    },
    en: {
      title: "Solve & compete",
      desc: "Submit solutions from the archive and climb the contest ratings.",
    },
  },
  {
    icon: PenLine,
    href: "/articles",
    bn: {
      title: "লেখো ও শেয়ার করো",
      desc: "নিজের গণিত-ভাবনা আর্টিকেল আকারে সবার সাথে ভাগ করো।",
    },
    en: {
      title: "Write & share",
      desc: "Turn your math ideas into articles and share them with everyone.",
    },
  },
];

export function HowItWorks() {
  const { lang } = useLang();
  const bn = lang === "bn";

  return (
    <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-4 py-16">
      <MathDoodles className="-z-10" />
      <div className="relative text-center">
        <span className="badge bg-brand-gradient-soft text-brand-purple ring-1 ring-brand-lavender/30">
          {bn ? "যেভাবে এগোবে" : "How it works"}
        </span>
        <h2 className="section-title title-accent center mt-4">
          {bn ? "চার ধাপে গণিতের যাত্রা" : "Your math journey in four steps"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-brand-charcoal/70">
          {bn
            ? "জেলার একজন দূত থেকে শুরু করে সমাধানকারী আর লেখক — যেকোনো ধাপে শুরু করতে পারো।"
            : "Start anywhere — from a district ambassador to a solver and a writer."}
        </p>
      </div>

      <ol className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <span
          className="pointer-events-none absolute left-10 right-10 top-9 hidden h-px bg-gradient-to-r from-brand-orange/0 via-brand-purple/40 to-brand-blue/0 lg:block"
          aria-hidden
        />
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const copy = bn ? step.bn : step.en;
          return (
            <li key={step.href} className="relative">
              <Link
                href={step.href}
                className="card card-glow group flex h-full flex-col items-center gap-3 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-orange to-brand-purple text-white shadow-glow transition group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-extrabold text-brand-blue ring-1 ring-brand-lavender/30">
                    {i + 1}
                  </span>
                </span>
                <h3 className="font-display text-base font-bold text-brand-blue">
                  {copy.title}
                </h3>
                <p className="text-sm text-brand-charcoal/65">{copy.desc}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-brand-orange">
                  {bn ? "শুরু করো" : "Start"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
