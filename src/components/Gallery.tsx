"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";

const GALLERY = [
  {
    src: "/brand/slogan-4.png",
    width: 2640,
    height: 1296,
    bn: "গণিতকে ভালোবাসার ইশকুল",
    en: "A school that loves math",
  },
  {
    src: "/brand/gonit-bhaiya.jpeg",
    width: 1600,
    height: 1600,
    bn: "গণিত ভাইয়া",
    en: "Gonit Bhaiya",
  },
  {
    src: "/brand/slogan-2.png",
    width: 3508,
    height: 2480,
    bn: "সবার জন্য গণিত",
    en: "Mathematics for everyone",
  },
  {
    src: "/brand/logo.png",
    width: 2250,
    height: 2250,
    bn: "গণিত ইশকুল",
    en: "Gonit Ishkul",
  },
  {
    src: "/brand/slogan-3.png",
    width: 2392,
    height: 1284,
    bn: "শেখো, সমাধান করো",
    en: "Learn & solve",
  },
  {
    src: "/brand/slogan-5.png",
    width: 2661,
    height: 1478,
    bn: "অলিম্পিয়াড প্রস্তুতি",
    en: "Olympiad preparation",
  },
];

export function Gallery() {
  const { t, lang } = useLang();
  const bn = lang === "bn";
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const current = active === null ? null : GALLERY[active];

  return (
    <section id="gallery" className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="section-title">{t("gallery.title")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-brand-charcoal/70">
          {t("gallery.subtitle")}
        </p>
      </div>

      <div className="columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
        {GALLERY.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActive(i)}
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-3xl ring-1 ring-brand-lavender/20 transition hover:ring-brand-orange/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-orange/40"
            aria-label={bn ? item.bn : item.en}
          >
            <Image
              src={item.src}
              alt={bn ? item.bn : item.en}
              width={item.width}
              height={item.height}
              sizes="(max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4 text-left text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
              {bn ? item.bn : item.en}
              <ZoomIn className="h-4 w-4 shrink-0" />
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label={t("gallery.close")}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 transition hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
          <figure
            className="relative flex max-h-[88vh] w-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={bn ? current.bn : current.en}
              width={current.width}
              height={current.height}
              sizes="90vw"
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-bubble"
            />
            <figcaption className="mt-4 text-center text-sm font-semibold text-white/85">
              {bn ? current.bn : current.en}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
