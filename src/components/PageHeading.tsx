"use client";

import { useLang } from "@/lib/i18n/LangContext";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeading({
  titleKey,
  subtitle,
  align = "center",
}: {
  titleKey: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const { t } = useLang();
  const centered = align === "center";
  return (
    <div className={cn("animate-fade-up", centered ? "text-center" : "text-left")}>
      <span
        className={cn(
          "badge bg-brand-gradient-soft text-brand-purple ring-1 ring-brand-lavender/30",
          centered && "mx-auto",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {t("hero.badge")}
      </span>
      <h1 className={cn("section-title title-accent mt-4", centered && "center")}>
        {t(titleKey)}
      </h1>
      {subtitle && (
        <p className={cn("mt-4 text-brand-charcoal/70", centered && "mx-auto max-w-2xl")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}