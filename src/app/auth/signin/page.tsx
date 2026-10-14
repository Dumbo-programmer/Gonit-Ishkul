"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLang();
  const [email, setEmail] = useState("admin@gonitishkul.local");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t("common.login") + " ✕");
      return;
    }
    router.push(params.get("callbackUrl") ?? "/gonit-doot/dashboard");
    router.refresh();
  }

  return (
    <div className="math-bg min-h-[80vh] bg-brand-purple/10">
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="card">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-white">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-brand-blue">
                {t("common.login")}
              </h1>
              <p className="text-xs text-brand-charcoal/60">
                Prothom Alo Gonit Ishkul
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="email">
                {t("apply.fields.email")}
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
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Password
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

          <div className="mt-6 rounded-2xl bg-brand-lavender/10 p-4 text-xs text-brand-charcoal/70">
            <p className="font-semibold text-brand-blue">Demo accounts</p>
            <ul className="mt-1 space-y-0.5">
              <li>admin@gonitishkul.local / Admin@12345</li>
              <li>mentor@gonitishkul.local / Mentor@12345</li>
              <li>sakib@example.com / Doot@12345</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}