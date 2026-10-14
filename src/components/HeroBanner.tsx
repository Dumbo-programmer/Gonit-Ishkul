"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers,
  MapPin,
  PenLine,
  Puzzle,
  Sigma,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { formatNumber } from "@/lib/utils";

interface HeroStats {
  learners: number;
  courses: number;
  problems: number;
  districts: number;
}

const ROTATION = [
  { bn: "সংখ্যাতত্ত্ব", en: "Number Theory" },
  { bn: "জ্যামিতি", en: "Geometry" },
  { bn: "কম্বিনেটরিক্স", en: "Combinatorics" },
  { bn: "বীজগণিত", en: "Algebra" },
  { bn: "গাণিতিক প্রমাণ", en: "Mathematical Proofs" },
];

const TOPICS = [
  { bn: "সংখ্যাতত্ত্ব", en: "Number Theory" },
  { bn: "জ্যামিতি", en: "Geometry" },
  { bn: "কম্বিনেটরিক্স", en: "Combinatorics" },
  { bn: "বীজগণিত", en: "Algebra" },
  { bn: "প্রমাণ", en: "Proofs" },
  { bn: "অলিম্পিয়াড", en: "Olympiad" },
];

const PILLARS = [
  { icon: BookOpen, href: "/courses", key: "common.courses" },
  { icon: Swords, href: "/problems", key: "common.problems" },
  { icon: PenLine, href: "/articles", key: "common.articles" },
];

const CHIPS = [
  { sym: "∑", className: "left-[6%] top-[18%]", delay: "0s" },
  { sym: "π", className: "right-[8%] top-[12%]", delay: "1.2s" },
  { sym: "√x", className: "left-[10%] bottom-[24%]", delay: "2.1s" },
  { sym: "∞", className: "right-[12%] bottom-[18%]", delay: "0.7s" },
  { sym: "x²", className: "left-[46%] top-[6%]", delay: "1.7s" },
];

export function HeroBanner({ stats }: { stats: HeroStats }) {
  const { t, lang } = useLang();
  const bn = lang === "bn";
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % ROTATION.length),
      2400,
    );
    return () => window.clearInterval(id);
  }, []);

  const topic = bn ? ROTATION[idx].bn : ROTATION[idx].en;

  const statItems = [
    { icon: Users, value: stats.learners, bn: "শিক্ষার্থী", en: "Learners" },
    { icon: Layers, value: stats.courses, bn: "ফ্রি ট্র্যাক", en: "Free tracks" },
    { icon: Puzzle, value: stats.problems, bn: "সমস্যা", en: "Problems" },
    { icon: MapPin, value: stats.districts, bn: "জেলা", en: "Districts" },
  ];

  return (
    <section className="relative overflow-hidden bg-brand-gradient text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 math-bg opacity-25 motion-safe:animate-float-slow" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-orange/30 blur-3xl" />
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-brand-lavender/30 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-1/4 h-72 w-72 rounded-full bg-brand-blue/50 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-12 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pb-16 md:pt-24">
        <div className="animate-fade-up">
          <span className="badge bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">
            <GraduationCap className="h-4 w-4" />
            {t("hero.badge")}
          </span>

          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-brand-orange via-[#FFB27A] to-brand-orange bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,120,30,0.35)]">
                গণিত
              </span>
            </span>{" "}
            <span className="text-white drop-shadow-[0_2px_12px_rgba(27,69,148,0.5)]">
              ইশকুল
            </span>
          </h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-xl font-bold text-white/95 sm:text-2xl">
            <Sparkles className="h-5 w-5 shrink-0 text-brand-orange" />
            <span>{bn ? "শেখো" : "Master"}</span>
            <span className="relative inline-grid align-bottom">
              <span
                key={idx}
                className="animate-fade-up text-brand-orange motion-reduce:animate-none"
              >
                {topic}
              </span>
            </span>
          </p>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/90">
            {bn ? t("hero.taglineBn") : t("hero.taglineEn")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/courses" className="btn-primary group">
              {t("hero.startLearning")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/problems"
              className="btn bg-white/15 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/25"
            >
              <Swords className="h-5 w-5" />
              {t("hero.solveProblems")}
            </Link>
          </div>

          <ul className="mt-9 flex flex-wrap gap-3">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4 text-brand-orange" />
                    {t(p.key)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <a
            href="#explore"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 underline decoration-white/40 decoration-2 underline-offset-4 transition hover:text-white"
          >
            {t("hero.learnMore")}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="relative animate-fade-up">
          <div
            className="pointer-events-none absolute inset-0 -z-0 scale-95 rounded-[2.5rem] bg-white/10 blur-2xl"
            aria-hidden
          />
          <Image
            src="/brand/slogan-4.png"
            alt="প্রথম আলো গণিত ইশকুল — স্লোগান"
            width={2640}
            height={1296}
            priority
            quality={82}
            sizes="(max-width: 768px) 88vw, 44vw"
            className="relative z-10 h-auto w-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
          />
          <Image
            src="/brand/gonit-bhaiya.jpeg"
            alt="গণিত ভাইয়া"
            width={112}
            height={112}
            sizes="112px"
            className="absolute -bottom-6 -left-3 z-20 h-20 w-20 animate-float rounded-full border-4 border-white object-cover shadow-card sm:h-24 sm:w-24 motion-reduce:animate-none"
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-14">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statItems.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.en}
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <Icon className="h-5 w-5 text-brand-orange" />
                </span>
                <div className="min-w-0">
                  <dd className="font-display text-2xl font-extrabold leading-none">
                    {formatNumber(s.value, bn ? "bn-BD" : "en-US")}
                  </dd>
                  <dt className="mt-0.5 truncate text-xs font-medium text-white/70">
                    {bn ? s.bn : s.en}
                  </dt>
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        {CHIPS.map((c, i) => (
          <span
            key={i}
            className="absolute select-none font-display text-2xl font-bold text-white/20 motion-safe:animate-float sm:text-3xl"
            style={{ animationDelay: c.delay }}
          >
            <span className={c.className}>{c.sym}</span>
          </span>
        ))}
      </div>

      <div className="relative border-t border-white/15 bg-black/10 py-3 backdrop-blur">
        <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex min-w-full shrink-0 animate-marquee items-center gap-10 motion-reduce:animate-none">
            {[...TOPICS, ...TOPICS, ...TOPICS].map((topicItem, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center gap-2 text-sm font-semibold text-white/75"
              >
                <Sigma className="h-4 w-4 text-brand-orange" />
                {bn ? topicItem.bn : topicItem.en}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
