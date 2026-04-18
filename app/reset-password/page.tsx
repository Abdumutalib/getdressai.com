"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSafeSupabase } from "@/lib/supabase-browser";
import { useLanguage } from "@/components/LanguageProvider";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSafeSupabase(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrateRecoverySession() {
      if (!supabase) {
        if (mounted) {
          setError("Password reset is temporarily unavailable. Supabase is not configured.");
          setHasRecoverySession(false);
        }
        return;
      }

      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (accessToken && refreshToken && type === "recovery") {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          if (mounted) {
            setError(sessionError.message);
          }
          return;
        }

        window.history.replaceState({}, document.title, "/reset-password");
        if (mounted) {
          setHasRecoverySession(true);
        }
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (mounted) {
        setHasRecoverySession(Boolean(session));
      }
    }

    hydrateRecoverySession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError(t("resetPassword.minLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.mismatch"));
      return;
    }

    if (!hasRecoverySession) {
      setError(t("resetPassword.missingSession"));
      return;
    }

    if (!supabase) {
      setError("Password reset is temporarily unavailable. Supabase is not configured.");
      return;
    }

    setBusy(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    setMessage(t("resetPassword.success"));
    setBusy(false);
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-md glass-panel rounded-[2rem] p-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("resetPassword.eyebrow")}</p>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">{t("resetPassword.title")}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("resetPassword.copy")}</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <input
            type="password"
            placeholder={t("resetPassword.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
          <input
            type="password"
            placeholder={t("resetPassword.confirmPassword")}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
          <button type="submit" className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white">
            {busy ? t("resetPassword.saving") : t("resetPassword.button")}
          </button>
          {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
