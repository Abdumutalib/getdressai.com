"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { clearPinAuthRecord, readPinAuthRecord, savePinAuthRecord, verifyPinAuthRecord } from "@/lib/pin-auth";
import { createBrowserSafeSupabase } from "@/lib/supabase-browser";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSafeSupabase(), []);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [savedPinEmail, setSavedPinEmail] = useState("");
  const [pinLogin, setPinLogin] = useState("");
  const [pinSessionReady, setPinSessionReady] = useState(false);

  useEffect(() => {
    const record = readPinAuthRecord();
    if (record) {
      setSavedPinEmail(record.email);
      setPinSessionReady(true);
    }
  }, []);

  function resetFeedback() {
    setMessage("");
    setError("");
  }

  function resetFormFields() {
    setEmail("");
    setPassword("");
    setPin("");
    setPinConfirm("");
    setPinLogin("");
    setPinEnabled(false);
  }

  async function savePinIfNeeded(nextEmail: string, session: Awaited<ReturnType<NonNullable<typeof supabase>["auth"]["getSession"]>>["data"]["session"]) {
    if (!pinEnabled) {
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      throw new Error(t("login.pinInvalid"));
    }

    if (pin !== pinConfirm) {
      throw new Error(t("login.pinMismatch"));
    }

    if (!session) {
      throw new Error(t("login.pinSessionMissing"));
    }

    await savePinAuthRecord(nextEmail, pin, session);
    setSavedPinEmail(nextEmail);
    setPinSessionReady(true);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    resetFeedback();

    if (!supabase) {
      setError(t("login.unavailable"));
      setBusy(false);
      return;
    }

    try {
      if (authMode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          await savePinIfNeeded(email, data.session);
          setMessage(pinEnabled ? t("login.signupSuccessWithPin") : t("login.signupSuccess"));
          router.push("/dashboard");
          router.refresh();
          return;
        }

        setMessage(t("login.signupPending"));
        setAuthMode("login");
        setPin("");
        setPinConfirm("");
        setBusy(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      await savePinIfNeeded(email, data.session);
      router.push("/dashboard");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("login.genericError"));
      setBusy(false);
    }
  }

  async function handlePinLogin() {
    setBusy(true);
    resetFeedback();

    if (!supabase) {
      setError(t("login.unavailable"));
      setBusy(false);
      return;
    }

    try {
      const unlocked = await verifyPinAuthRecord(pinLogin);
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: unlocked.accessToken,
        refresh_token: unlocked.refreshToken
      });

      if (sessionError) {
        throw sessionError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("login.pinLoginError"));
      setBusy(false);
    }
  }

  async function sendResetLink() {
    if (!email) {
      setError(t("login.emailRequired"));
      return;
    }

    setBusy(true);
    resetFeedback();

    if (!supabase) {
      setError(t("login.resetUnavailable"));
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

  async function removeSavedPin() {
    if (supabase) {
      await supabase.auth.signOut({ scope: "local" });
    }

    clearPinAuthRecord();
    setSavedPinEmail("");
    setPinSessionReady(false);
    resetFormFields();
    setMessage(t("login.pinRemoved"));
    setError("");
  }

  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-md space-y-6">
        {savedPinEmail ? (
          <div className="glass-panel rounded-[2rem] p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("login.pinEyebrow")}</p>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{t("login.pinTitle")}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t("login.pinCopy")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {pinSessionReady ? t("login.pinReady") : t("login.pinNeedsPassword")}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <input
                type="password"
                inputMode="numeric"
                pattern="\d*"
                maxLength={4}
                placeholder={t("login.pinPlaceholder")}
                value={pinLogin}
                onChange={(event) => setPinLogin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
              />
              <button
                type="button"
                onClick={handlePinLogin}
                disabled={busy}
                className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white"
              >
                {busy ? t("login.sending") : t("login.pinButton")}
              </button>
              <button
                type="button"
                onClick={removeSavedPin}
                className="w-full text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              >
                {t("login.pinRemove")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="glass-panel rounded-[2rem] p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("login.eyebrow")}</p>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">{t("login.title")}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t("login.copy")}</p>
          </div>

          <div className="mt-6 flex gap-2 rounded-full bg-slate-100 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                resetFormFields();
                resetFeedback();
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                authMode === "login" ? "bg-white text-slate-950 shadow-soft dark:bg-white dark:text-slate-950" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {t("login.loginTab")}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                resetFormFields();
                resetFeedback();
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                authMode === "signup" ? "bg-white text-slate-950 shadow-soft dark:bg-white dark:text-slate-950" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {t("login.signupTab")}
            </button>
          </div>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <input
              type="email"
              autoComplete="username"
              placeholder={t("login.email")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
            />
            <input
              type="password"
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              placeholder={t("login.password")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
            />

            <label className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
              <input
                type="checkbox"
                checked={pinEnabled}
                onChange={(event) => setPinEnabled(event.target.checked)}
                className="mt-1"
              />
              <span className="text-slate-700 dark:text-slate-200">{t("login.pinEnable")}</span>
            </label>

            {pinEnabled ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="\d*"
                  maxLength={4}
                  placeholder={t("login.pinPlaceholder")}
                  value={pin}
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="\d*"
                  maxLength={4}
                  placeholder={t("login.pinConfirm")}
                  value={pinConfirm}
                  onChange={(event) => setPinConfirm(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
                />
              </div>
            ) : null}

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
              {busy ? t("login.sending") : authMode === "signup" ? t("login.signupButton") : t("login.button")}
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
      </div>
    </main>
  );
}
