"use client";

import { useLang } from "@/lib/i18n/LangContext";

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
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <h1 className="section-title">{t(titleKey)}</h1>
      {subtitle && <p className="mt-2 text-brand-charcoal/70">{subtitle}</p>}
    </div>
  );
}