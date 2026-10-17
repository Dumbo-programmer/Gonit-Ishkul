"use client";

import { Suspense, useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";
import { PageLoader } from "@/components/PageLoader";
import { signupAction } from "@/app/auth/actions";
import { emptyAuthForm } from "@/lib/authForm";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t, lang } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? t("common.loading") : lang === "bn" ? "অ্যাকাউন্ট খুলুন" : "Create account"}
    </button>
  );
}

function SignupForm() {
  const params = useSearchParams();
  const { t, lang } = useLang();
  const [state, formAction] = useFormState(signupAction, emptyAuthForm);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const callbackUrl = params.get("callbackUrl");

  useEffect(() => {
    if (!state.ok) return;
    let active = true;
    (async () => {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (!active) return;
      const target = callbackUrl ?? "/account";
      if (res?.error) {
        window.location.assign(`/auth/signin?registered=1&callbackUrl=${encodeURIComponent(target)}`);
        return;
      }
      window.location.assign(target);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  const err = (name: string) => state.errors?.[name];

  return (
    <div className="card">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-orange text-white">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-black text-brand-charcoal">
            {lang === "bn" ? "নতুন অ্যাকাউন্ট" : "Create your account"}
          </h1>
          <p className="text-xs font-semibold text-brand-charcoal/50">
            {lang === "bn"
              ? "গণিত ইশকুলে যোগ দাও — সম্পূর্ণ বিনামূল্যে"
              : "Join Gonit Ishkul — it's free"}
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {state.message && !state.ok && (
          <p className="rounded-2xl bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red">
            {state.message}
          </p>
        )}

        <div>
          <label htmlFor="name" className="field-label">
            {lang === "bn" ? "নাম" : "Name"}
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-brand-lavender" />
            <input
              id="name"
              name="name"
              required
              minLength={3}
              className="field-input pl-11"
              placeholder={lang === "bn" ? "তোমার নাম" : "Your name"}
              autoComplete="name"
            />
          </div>
          {err("name") && <span className="mt-1 block text-xs font-semibold text-brand-red">{err("name")}</span>}
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            ইমেইল
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-brand-lavender" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input pl-11"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {err("email") && <span className="mt-1 block text-xs font-semibold text-brand-red">{err("email")}</span>}
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            পাসওয়ার্ড
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-brand-lavender" />
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input pl-11"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          {err("password") && (
            <span className="mt-1 block text-xs font-semibold text-brand-red">{err("password")}</span>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="field-label">
            {lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করো" : "Confirm password"}
          </label>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-brand-lavender" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="field-input pl-11"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          {err("confirmPassword") && (
            <span className="mt-1 block text-xs font-semibold text-brand-red">{err("confirmPassword")}</span>
          )}
        </div>

        {state.message && !state.ok && !state.errors && (
          <p className="rounded-2xl bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red">{state.message}</p>
        )}

        <SubmitButton />
      </form>

      <p className="mt-5 text-center text-sm text-brand-charcoal/70">
        {lang === "bn" ? "আগে থেকেই অ্যাকাউন্ট আছে? " : "Already have an account? "}
        <Link
          href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-semibold text-brand-blue hover:text-brand-orange"
        >
          {t("common.login")}
        </Link>
      </p>

      <p className="mt-4 rounded-2xl bg-brand-lavender/10 px-4 py-3 text-center text-xs text-brand-charcoal/60">
        {lang === "bn"
          ? "নতুন অ্যাকাউন্ট সাধারণ ব্যবহারকারী হিসেবে তৈরি হয়। ক্যাম্পাস অ্যাম্বাসাডর বা ক্লাব প্রতিনিধি হতে চাইলে আগে অ্যাকাউন্ট খুলে আবেদন করো।"
          : "New accounts start as a regular User. To become a Campus Ambassador or Club Representative, sign up first, then apply."}
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="math-bg min-h-[80vh] bg-brand-orange/10">
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <Suspense fallback={<PageLoader label="লোড হচ্ছে…" />}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
