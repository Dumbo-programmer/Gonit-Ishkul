"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Award,
  BookOpen,
  CalendarDays,
  Swords,
  Users,
  Brain,
  ArrowRight,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { Gallery } from "@/components/Gallery";

const FEATURES = [
  {
    icon: Users,
    href: "/gonit-doot",
    bn: { title: "গণিত দূত", desc: "স্টুডেন্ট অ্যাম্বাসাডর প্রোগ্রাম — তোমার জেলায় গণিতের আন্দোলন গড়ো।" },
    en: { title: "Gonit Doot", desc: "Student ambassador program — lead a math movement in your district." },
    accent: "from-brand-orange to-brand-red",
  },
  {
    icon: BookOpen,
    href: "/courses",
    bn: { title: "ফ্রি লার্নিং ট্র্যাক", desc: "ট্রিভিয়া ভিডিও, এলোমেলো সমস্যার সমাধান, MO প্রশিক্ষণ ও আর্টিকেল — সব ফ্রি।" },
    en: { title: "Free Learning Tracks", desc: "Trivia videos, random problem solutions, MO training and articles — all free." },
    accent: "from-brand-blue to-brand-purple",
  },
  {
    icon: Swords,
    href: "/problems",
    bn: { title: "সমস্যা ও কনটেস্ট", desc: "অলিম্পিয়াড আর্কাইভ, অনলাইন জাজ ও লাইভ কনটেস্ট অ্যারিনা।" },
    en: { title: "Problems & Contests", desc: "Olympiad archive, online judge, and live contest arena." },
    accent: "from-brand-purple to-brand-blue",
  },
  {
    icon: Brain,
    href: "/problems/gonit-bhaiya",
    bn: { title: "গণিত ভাইয়া", desc: "সাপ্তাহিক ধাঁধা হাব — সমাধান জমা দাও, র‍্যাংকিংয়ে উঠে আসো।" },
    en: { title: "Gonit Bhaiya", desc: "Weekly puzzle hub — submit solutions, climb the ranks." },
    accent: "from-brand-orange to-brand-purple",
  },
  {
    icon: Award,
    href: "/articles",
    bn: { title: "আর্টিকেল ও জ্ঞান", desc: "শিক্ষার্থী ও দূতদের লেখা পড়া, লেখা ও শেয়ার করার জায়গা।" },
    en: { title: "Articles & Knowledge", desc: "A place for students and ambassadors to read, write and share." },
    accent: "from-brand-blue to-brand-orange",
  },
  {
    icon: CalendarDays,
    href: "/events",
    bn: { title: "ইভেন্ট ও স্কুল নেটওয়ার্ক", desc: "কেন্দ্রীয় ক্যালেন্ডার, ই-পাস QR ও স্কুল ক্লাব রেজিস্ট্রি।" },
    en: { title: "Events & School Network", desc: "Central calendar, QR e-pass, and school club registry." },
    accent: "from-brand-red to-brand-purple",
  },
];

export function HomeSections() {
  const { t, lang } = useLang();

  return (
    <>
      <section id="explore" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="section-title">
            {lang === "bn" ? "এক প্ল্যাটফর্মে সবকিছু" : "Everything in one platform"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-charcoal/70">
            {lang === "bn"
              ? "অ্যাম্বাসাডর প্রোগ্রাম থেকে শুরু করে ফ্রি ভিডিও ট্র্যাক, অনলাইন জাজ আর কনটেস্ট — গণিত ইশকুলের সবকিছু এখন অনলাইনে।"
              : "From the ambassador program to free video tracks, the online judge and contests — all of Gonit Ishkul, online."}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const copy = lang === "bn" ? f.bn : f.en;
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group card flex flex-col transition hover:-translate-y-1 hover:border-brand-orange/40"
              >
                <span
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.accent} text-white`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-brand-blue">{copy.title}</h3>
                <p className="mt-2 flex-1 text-sm text-brand-charcoal/70">{copy.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange">
                  {t("common.viewAll")}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-gradient px-6 py-12 text-white shadow-bubble sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 math-bg opacity-20" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-orange/30 blur-3xl" />
            <div className="absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-brand-lavender/30 blur-3xl" />
          </div>

          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="badge bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">
                <Users className="h-4 w-4" />
                {t("doot.subtitle")}
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                {t("doot.head")}
              </h2>
              <p className="mt-4 max-w-2xl text-white/85">
                {t("doot.summary")}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:w-60">
              <Link href="/gonit-doot/apply" className="btn-primary group">
                {t("doot.apply")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/gonit-doot"
                className="btn bg-white/15 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/25"
              >
                {t("common.viewAll")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-blue/5">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <Image
            src="/brand/gonit-bhaiya.jpeg"
            alt="গণিত ভাইয়া"
            width={420}
            height={420}
            className="mx-auto h-64 w-64 rounded-[2rem] object-cover ring-4 ring-brand-orange/30 sm:h-80 sm:w-80"
          />
          <div>
            <span className="badge bg-brand-orange/15 text-brand-orange">
              {lang === "bn" ? "সাপ্তাহিক ধাঁধা" : "Weekly puzzle"}
            </span>
            <h2 className="section-title mt-4">
              {lang === "bn" ? "গণিত ভাইয়ার সাথে ধাঁধা ভাঙো" : "Crack puzzles with Gonit Bhaiya"}
            </h2>
            <p className="mt-4 text-brand-charcoal/75">
              {lang === "bn"
                ? "প্রতি সপ্তাহে নতুন ধাঁধা, সাপ্তাহিক লিডারবোর্ড আর সমাধান আলোচনা। তোমার স্ক্র্যাচপ্যাডে এঁকে সমাধান জমা দাও।"
                : "A new puzzle each week, weekly leaderboards and solution discussions. Sketch your solution on the scratchpad and submit."}
            </p>
            <Link href="/problems/gonit-bhaiya" className="btn-primary mt-6">
              {lang === "bn" ? "ধাঁধা দেখুন" : "See the puzzle"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Gallery />
    </>
  );
}
