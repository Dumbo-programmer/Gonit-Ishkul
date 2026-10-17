"use client";

import { Suspense, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { homePathForRole } from "@/lib/rbac";
import { PageLoader } from "@/components/PageLoader";
import type { Role } from "@/lib/types";

function SignInForm() {
  const params = useSearchParams();
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const registered = params.get("registered") === "1";
  const callbackUrl = params.get("callbackUrl");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (!res || res.error) {
      setLoading(false);
      setError(lang === "bn" ? "ইমেইল বা পাসওয়ার্ড ভুল" : "Invalid email or password");
      return;
    }
    let target = callbackUrl;
    if (!target) {
      const session = await getSession();
      target = homePathForRole((session?.user as { role?: Role } | undefined)?.role);
    }
    window.location.assign(target);
  }

  return (
    <div className="card">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-black text-brand-charcoal">
            {t("common.login")}
          </h1>
          <p className="text-xs font-semibold text-brand-charcoal/50">
            Gonit Ishkul অ্যাকাউন্টে প্রবেশ করুন
          </p>
        </div>
      </div>

      {registered && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {lang === "bn" ? "অ্যাকাউন্ট তৈরি হয়েছে — এখন লগ ইন করুন।" : "Account created — please log in."}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="field-label">
            ইমেইল
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-brand-lavender" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input pl-11"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            পাসওয়ার্ড
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-brand-lavender" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input pl-11"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-2xl bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("common.loading") : t("common.login")}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-brand-charcoal/70">
        {lang === "bn" ? "নতুন ব্যবহারকারী? " : "New here? "}
        <Link
          href={`/auth/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-semibold text-brand-orange hover:underline"
        >
          {lang === "bn" ? "অ্যাকাউন্ট খুলুন" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="math-bg min-h-[80vh] bg-brand-purple/10">
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <Suspense fallback={<PageLoader label="লোড হচ্ছে…" />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
