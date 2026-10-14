"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";

export function StatusTracker({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const { t } = useLang();
  const [value, setValue] = useState(initial);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = trimmed.includes("@") ? "email" : "code";
    router.push(`/gonit-doot/status?${key}=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-brand-lavender" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="GD-XXXXXXXX / you@example.com"
          className="field-input pl-11"
          aria-label={t("status.hint")}
        />
      </div>
      <button type="submit" className="btn-secondary">
        {t("status.search")}
      </button>
    </form>
  );
}