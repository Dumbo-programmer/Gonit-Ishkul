"use client";

import { Languages } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { cn } from "@/lib/utils";

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-brand-lavender/40 bg-white p-1",
        className,
      )}
      role="group"
      aria-label="Language toggle"
    >
      <Languages className="mx-1 h-4 w-4 text-brand-purple" aria-hidden />
      {(["bn", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold transition",
            lang === code
              ? "bg-brand-blue text-white"
              : "text-brand-blue/70 hover:bg-brand-lavender/15",
          )}
        >
          {code === "bn" ? "বাংলা" : "EN"}
        </button>
      ))}
    </div>
  );
}