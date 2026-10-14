"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { LangProvider } from "@/lib/i18n/LangContext";
import type { Lang } from "@/lib/i18n/dictionary";

export function Providers({
  children,
  initialLang = "bn",
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  return (
    <SessionProvider>
      <LangProvider initialLang={initialLang}>{children}</LangProvider>
    </SessionProvider>
  );
}