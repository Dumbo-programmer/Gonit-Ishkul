"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "./dictionary";
import { t, tList } from "./dictionary";

const LANG_COOKIE = "gi_lang";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
  tList: (key: string) => { bn: string; en: string }[];
}

const LangContext = createContext<LangContextValue>({
  lang: "bn",
  setLang: () => {},
  toggle: () => {},
  t: (key) => key,
  tList: (key) => [],
});

export function LangProvider({
  initialLang = "bn",
  children,
}: {
  initialLang?: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const stored = readCookie(LANG_COOKIE);
    if (stored === "bn" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeCookie(LANG_COOKIE, next);
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "bn" ? "en" : "bn";
      writeCookie(LANG_COOKIE, next);
      return next;
    });
  }, []);

  const value: LangContextValue = {
    lang,
    setLang,
    toggle,
    t: (key) => t(key, lang),
    tList: (key) => tList(key, lang),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function cnLang(value: string, lang: Lang) {
  return lang === "bn" ? value : value;
}