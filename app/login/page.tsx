"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { createBrowserSafeSupabase } from "@/lib/supabase-browser";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSafeSupabase(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    if (!supabase) {
      setError("Login is temporarily unavailable. Supabase is not configured.");
      setBusy(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function sendResetLink() {
    if (!email) {
      setError(t("login.email"));
      return;
    }

    setBusy(true);
    setMessage("");
    setError("");

    if (!supabase) {
      setError("Password reset is temporarily unavailable. Supabase is not configured.");
      setBusy(false);
      return;
    }

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (resetError) {
      setError(resetError.message);
      setBusy(false);
      return;
    }

    setMessage(t("login.resetSent"));
    setBusy(false);
  }

  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-md glass-panel rounded-[2rem] p-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("login.eyebrow")}</p>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">{t("login.title")}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("login.copy")}</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            placeholder={t("login.email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
          <input
            type="password"
            placeholder={t("login.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={sendResetLink}
              className="text-sm font-medium text-accent transition hover:opacity-80"
              disabled={busy}
            >
              {busy ? t("login.sending") : t("login.forgotPassword")}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-300">{t("login.resetHint")}</span>
          </div>
          <button type="submit" className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white">
            {busy ? t("login.sending") : t("login.button")}
          </button>
          {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
        </form>
        <div className="mt-6 text-sm text-slate-500 dark:text-slate-300">
          <Link href="/reset-password" className="font-medium text-accent transition hover:opacity-80">
            {t("login.sendReset")}
          </Link>
        </div>
      </div>
    </main>
  );
}
