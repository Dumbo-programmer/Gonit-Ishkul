"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, HeartHandshake, Sigma, Sparkles, Target, Trophy, Users } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";

const PILLARS = [
  {
    Icon: BookOpen,
    bn: "ভিডিও কোর্স",
    en: "Video Courses",
    descBn: "বাংলায় ধাপে ধাপে সাজানো পাঠ, যাচাইযোগ্য অ্যাসাইনমেন্ট ও অগ্রগতি ট্র্যাকিং।",
    descEn: "Structured Bangla lessons with graded assignments and progress tracking.",
  },
  {
    Icon: Sigma,
    bn: "সমস্যা সমাধান",
    en: "Problem Solving",
    descBn: "৭০+ সমস্যার ব্যাংক, মক টেস্ট জেনারেটর ও বিস্তারিত সমাধান।",
    descEn: "A 70+ problem bank, mock-test generator and worked solutions.",
  },
  {
    Icon: Trophy,
    bn: "কনটেস্ট অ্যারিনা",
    en: "Contest Arena",
    descBn: "অনলাইন কনটেস্ট, লাইভ স্কোরবোর্ড ও অটো-গ্রেডিং।",
    descEn: "Online contests with live scoreboards and auto-grading.",
  },
  {
    Icon: Sparkles,
    bn: "গণিত দূত প্রোগ্রাম",
    en: "Gonit Doot Program",
    descBn: "শিক্ষার্থী অ্যাম্বাসাডর যারা ক্যাম্পাস ও স্কুলে গণিতচর্চা ছড়িয়ে দেয়।",
    descEn: "Student ambassadors spreading a math culture across campuses and schools.",
  },
  {
    Icon: Users,
    bn: "গণিত ক্লাব",
    en: "Math Clubs",
    descBn: "স্কুল ও ক্যাম্পাসভিত্তিক ক্লাব নেটওয়ার্ক, ইভেন্ট ও শিক্ষা উপকরণ।",
    descEn: "A network of school and campus clubs with events and learning resources.",
  },
];

export default function AboutPage() {
  const { lang } = useLang();
  const bn = lang === "bn";

  return (
    <div className="pb-16">
      <section className="math-bg relative overflow-hidden bg-brand-orange/10">
        <span className="hairline-gradient absolute inset-x-0 bottom-0 h-1" aria-hidden />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <span className="badge mx-auto bg-brand-orange/15 text-brand-orange">
            <Sparkles className="h-3.5 w-3.5" />
            {bn ? "আমাদের সম্পর্কে" : "About Us"}
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight text-brand-charcoal sm:text-4xl">
            {bn ? (
              <>
                গণিতকে ভালোবাসার এক <span className="text-brand-orange">নতুন ইশকুল</span>
              </>
            ) : (
              <>
                A new school for the <span className="text-brand-orange">love of mathematics</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-charcoal/70">
            {bn
              ? "প্রথম আলো গণিত ইশকুল একটি শিক্ষামূলক প্ল্যাটফর্ম, যার লক্ষ্য গণিতকে সবার কাছে — বিশেষ করে বাংলাদেশের শিক্ষার্থীদের কাছে — সহজ, আনন্দদায়ক ও প্রাসঙ্গিক করে তোলা।"
              : "Prothom Alo Gonit Ishkul is an educational platform on a mission to make mathematics accessible, joyful and relevant for everyone — especially students across Bangladesh."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="card">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue/10 text-brand-blue">
              <Target className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-black text-brand-charcoal">
              {bn ? "আমাদের লক্ষ্য" : "Our mission"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-charcoal/70">
              {bn
                ? "গণিতভীতি দূর করে শিক্ষার্থীদের মধ্যে সমস্যা সমাধানের দক্ষতা, কৌতূহল ও আত্মবিশ্বাস গড়ে তোলা; দেশজুড়ে গণিতচর্চার একটি সক্রিয় কমিউনিটি তৈরি করা।"
                : "To replace math anxiety with curiosity and confidence — building problem-solving skills and a nationwide community that genuinely enjoys mathematics."}
            </p>
          </section>

          <section className="card">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-orange/10 text-brand-orange">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-black text-brand-charcoal">
              {bn ? "কে চালায়" : "Who runs it"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-charcoal/70">
              {bn
                ? "প্রথম আলো গণিত ইশকুল প্রথম আলোর একটি উদ্যোগ — যেখানে শিক্ষাবিদ, ইন্সট্রাক্টর, মেন্টর ও স্বেচ্ছাসেবী শিক্ষার্থীরা একসাথে কাজ করে।"
                : "Prothom Alo Gonit Ishkul is an initiative of Prothom Alo, powered together by educators, instructors, mentors and volunteer students."}
            </p>
          </section>
        </div>

        <section className="mt-14">
          <h2 className="text-center text-2xl font-black text-brand-charcoal">
            {bn ? "আমরা যা করি" : "What we do"}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div key={pillar.en} className="card">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-lavender/15 text-brand-purple">
                  <pillar.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-brand-charcoal">
                  {bn ? pillar.bn : pillar.en}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/65">
                  {bn ? pillar.descBn : pillar.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card mt-14 overflow-hidden bg-brand-blue text-white">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-brand-orange">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black">{bn ? "আজই শুরু করো" : "Start today"}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/85">
                {bn
                  ? "বিনামূল্যে অ্যাকাউন্ট খুলে কোর্স, সমস্যা ও কনটেস্টে যোগ দাও — অথবা ক্যাম্পাস অ্যাম্বাসাডর হয়ে গণিতচর্চা ছড়িয়ে দাও।"
                  : "Create a free account to join courses, problems and contests — or apply to become a campus ambassador and spread the math culture."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/auth/signup" className="btn-primary">
                <HeartHandshake className="h-4 w-4" />
                {bn ? "বিনামূল্যে অ্যাকাউন্ট খুলুন" : "Create a free account"}
              </Link>
              <Link
                href="/gonit-doot"
                className="btn-secondary !bg-white/10 !text-white ring-1 ring-white/25"
              >
                <GraduationCap className="h-4 w-4" />
                {bn ? "গণিত দূত হও" : "Become a Gonit Doot"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
