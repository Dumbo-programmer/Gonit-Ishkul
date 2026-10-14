"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogIn, LayoutDashboard, LogOut, Menu, X, ShieldCheck, UserRound } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { LangToggle } from "./LangToggle";
import { cn } from "@/lib/utils";

export function SiteNavbar() {
  const { t } = useLang();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", key: "common.home" },
    { href: "/gonit-doot", key: "common.ambassador" },
    { href: "/courses", key: "common.courses" },
    { href: "/problems", key: "common.problems" },
    { href: "/contests", key: "common.contests" },
    { href: "/articles", key: "common.articles" },
    { href: "/resources", key: "common.resources" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-brand-lavender/25 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt="Prothom Alo Gonit Ishkul"
            width={48}
            height={48}
            className="h-11 w-11 rounded-full object-contain"
            priority
          />
          <span className="hidden font-display text-lg font-bold leading-tight sm:block">
            <span className="text-brand-orange">গণিত</span>{" "}
            <span className="text-brand-blue">ইশকুল</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-brand-charcoal/80 transition hover:bg-brand-lavender/15 hover:text-brand-blue"
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LangToggle />
          {status === "authenticated" ? (
            <div className="flex items-center gap-2">
              {(session.user as { role?: string }).role === "ADMIN" && (
                <Link href="/admin" className="btn-ghost !px-3 !py-2" title={t("common.admin")}>
                  <ShieldCheck className="h-4 w-4" />
                </Link>
              )}
              <Link href="/account" className="btn-ghost !px-3 !py-2" title={t("common.account")}>
                <UserRound className="h-4 w-4" />
              </Link>
              <Link href="/gonit-doot/dashboard" className="btn-secondary !px-4 !py-2">
                <LayoutDashboard className="h-4 w-4" />
                {t("common.dashboard")}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-ghost !px-3 !py-2"
                aria-label={t("common.logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/auth/signin" className="btn-primary !px-5 !py-2">
              <LogIn className="h-4 w-4" />
              {t("common.login")}
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-brand-blue lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-brand-lavender/20 bg-white lg:hidden",
          open ? "max-h-[28rem]" : "max-h-0",
          "transition-all duration-300",
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-brand-charcoal/80 hover:bg-brand-lavender/15"
            >
              {t(link.key)}
            </Link>
          ))}
          <div className="mt-2 flex items-center justify-between">
            <LangToggle />
            {status === "authenticated" ? (
              <div className="flex items-center gap-2">
                {(session.user as { role?: string }).role === "ADMIN" && (
                  <Link href="/admin" className="btn-ghost !px-4 !py-2">
                    {t("common.admin")}
                  </Link>
                )}
                <Link href="/account" className="btn-ghost !px-4 !py-2">
                  {t("common.account")}
                </Link>
                <Link href="/gonit-doot/dashboard" className="btn-secondary !px-4 !py-2">
                  {t("common.dashboard")}
                </Link>
              </div>
            ) : (
              <Link href="/auth/signin" className="btn-primary !px-4 !py-2">
                {t("common.login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}