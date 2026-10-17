"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogIn, LayoutDashboard, LogOut, Menu, X, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { LangToggle } from "./LangToggle";
import { can, homePathForRole, ROLE_LABELS } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export function SiteNavbar() {
  const { t, lang } = useLang();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const role = (session?.user as { role?: Role } | undefined)?.role;
  const home = homePathForRole(role);

  const links = [
    { href: "/", key: "common.home" },
    { href: "/gonit-doot", key: "common.ambassador" },
    { href: "/courses", key: "common.courses" },
    { href: "/problems", key: "common.problems" },
    { href: "/contests", key: "common.contests" },
    { href: "/clubs", key: "common.clubs" },
    { href: "/articles", key: "common.articles" },
    { href: "/resources", key: "common.resources" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-lavender/25 bg-white/80 backdrop-blur-xl">
      <span className="hairline-gradient pointer-events-none absolute inset-x-0 bottom-0 h-px" aria-hidden />
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative">
            <span className="absolute inset-0 rounded-full bg-brand-orange/30 blur-md transition group-hover:bg-brand-orange/50" />
            <Image
              src="/brand/logo.png"
              alt="Prothom Alo Gonit Ishkul"
              width={48}
              height={48}
              className="relative h-11 w-11 rounded-full object-contain ring-1 ring-brand-lavender/30 transition group-hover:-rotate-6"
              priority
            />
          </span>
          <span className="hidden font-display text-lg font-bold leading-tight sm:block">
            <span className="text-brand-orange">গণিত</span>{" "}
            <span className="text-brand-blue">ইশকুল</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "text-brand-blue"
                    : "text-brand-charcoal/80 hover:bg-brand-lavender/15 hover:text-brand-blue",
                )}
              >
                {t(link.key)}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-purple" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LangToggle />
          {status === "authenticated" ? (
            <div className="flex items-center gap-2">
              {role && (
                <span className="badge hidden bg-brand-lavender/15 text-[11px] text-brand-charcoal/70 xl:inline-flex">
                  {ROLE_LABELS[role][lang]}
                </span>
              )}
              {role && can(role, "metrics.view") && (
                <Link href="/admin" className="btn-ghost !px-3 !py-2" title={t("common.admin")}>
                  <ShieldCheck className="h-4 w-4" />
                </Link>
              )}
              {role !== "STUDENT" && (
                <Link href="/account" className="btn-ghost !px-3 !py-2" title={t("common.account")}>
                  <UserRound className="h-4 w-4" />
                </Link>
              )}
              <Link href={home} className="btn-secondary !px-4 !py-2">
                <LayoutDashboard className="h-4 w-4" />
                {role === "STUDENT" ? t("common.account") : t("common.dashboard")}
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
            <div className="flex items-center gap-2">
              <Link href="/auth/signup" className="btn-ghost !px-4 !py-2">
                <UserPlus className="h-4 w-4" />
                {t("common.signup")}
              </Link>
              <Link href="/auth/signin" className="btn-primary !px-5 !py-2">
                <LogIn className="h-4 w-4" />
                {t("common.login")}
              </Link>
            </div>
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
          open ? "max-h-[34rem]" : "max-h-0",
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
                {role && can(role, "metrics.view") && (
                  <Link href="/admin" className="btn-ghost !px-4 !py-2">
                    {t("common.admin")}
                  </Link>
                )}
                {role !== "STUDENT" && (
                  <Link href="/account" className="btn-ghost !px-4 !py-2">
                    {t("common.account")}
                  </Link>
                )}
                <Link href={home} className="btn-secondary !px-4 !py-2">
                  {role === "STUDENT" ? t("common.account") : t("common.dashboard")}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signup" className="btn-ghost !px-4 !py-2">
                  {t("common.signup")}
                </Link>
                <Link href="/auth/signin" className="btn-primary !px-4 !py-2">
                  {t("common.login")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}