"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { clearPinAuthRecord, readPinAuthRecord, savePinAuthRecord, verifyPinAuthRecord } from "@/lib/pin-auth";
import { createBrowserSafeSupabase } from "@/lib/supabase-browser";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [pinLogin, setPinLogin] = useState("");
  const [pinSessionReady, setPinSessionReady] = useState(false);
  const [passwordFallback, setPasswordFallback] = useState(false);
  const pinInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const record = readPinAuthRecord();
    if (record) {
      setSavedPinEmail(record.email);
      setPinSessionReady(true);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("pin") === "1") {
      setMessage(t("login.signupSuccessWithPin"));
      setError("");
    }
  }, [searchParams, t]);

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

  function updatePinLoginDigit(index: number, rawValue: string) {
    const nextDigit = rawValue.replace(/\D/g, "").slice(-1);
    const digits = Array.from({ length: 4 }, (_, digitIndex) => pinLogin[digitIndex] || "");
    digits[index] = nextDigit;
    const nextPin = digits.join("");
    setPinLogin(nextPin);

    if (nextDigit && index < pinInputsRef.current.length - 1) {
      pinInputsRef.current[index + 1]?.focus();
    }
  }

  function handlePinKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !pinLogin[index] && index > 0) {
      pinInputsRef.current[index - 1]?.focus();
    }
  }

  function openPasswordFallback() {
    setAuthMode("login");
    setPasswordFallback(true);
    setEmail(savedPinEmail);
    setPassword("");
    setPin("");
    setPinConfirm("");
    setPinEnabled(false);
    resetFeedback();
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
    setPasswordFallback(false);
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
          if (pinEnabled) {
            await supabase.auth.signOut({ scope: "local" });
            setSavedPinEmail(email);
            setPinSessionReady(true);
            setPasswordFallback(false);
            setPinLogin("");
            setPassword("");
            setPin("");
            setPinConfirm("");
            router.replace("/login?pin=1");
            router.refresh();
            return;
          }

          setMessage(t("login.signupSuccess"));
          router.push("/dashboard");
          router.refresh();
          return;
        }

        setPendingVerificationEmail(email);
        setMessage(pinEnabled ? t("login.signupPendingWithPin") : t("login.signupPending"));
        setAuthMode("login");
        setPin("");
        setPinConfirm("");
        setPinEnabled(false);
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
      setPendingVerificationEmail("");
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
      if (nextError instanceof Error && nextError.message === "Saved PIN login expired.") {
        setSavedPinEmail("");
        setPinSessionReady(false);
        setPasswordFallback(false);
        setPinLogin("");
        setError(t("login.pinExpired"));
      } else {
        setError(nextError instanceof Error ? nextError.message : t("login.pinLoginError"));
      }
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
    setPasswordFallback(false);
    setPendingVerificationEmail("");
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
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      pinInputsRef.current[index] = element;
                    }}
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    pattern="\d*"
                    maxLength={1}
                    aria-label={`${t("login.pinPlaceholder")} ${index + 1}`}
                    value={pinLogin[index] || ""}
                    onChange={(event) => updatePinLoginDigit(index, event.target.value)}
                    onKeyDown={(event) => handlePinKeyDown(index, event)}
                    className="h-16 rounded-[1.25rem] border border-slate-200 bg-white text-center text-2xl font-semibold tracking-[0.2em] outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
                  />
                ))}
              </div>
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
              <button
                type="button"
                onClick={openPasswordFallback}
                className="w-full text-sm font-medium text-accent transition hover:opacity-80"
              >
                {t("login.pinForgot")}
              </button>
            </div>
          </div>
        ) : null}

        {!savedPinEmail || passwordFallback ? (
        <div className="glass-panel rounded-[2rem] p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("login.eyebrow")}</p>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">{t("login.title")}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {passwordFallback ? t("login.pinPasswordFallback") : t("login.copy")}
            </p>
          </div>

          {!passwordFallback ? (
          <div className="mt-6 flex gap-2 rounded-full bg-slate-100 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setPasswordFallback(false);
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
                setPasswordFallback(false);
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
          ) : null}

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <input
              type="email"
              autoComplete="username"
              placeholder={t("login.email")}
              value={email}
              onChange={(event) => {
                if (!passwordFallback) {
                  setEmail(event.target.value);
                }
              }}
              readOnly={passwordFallback}
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
              <span className="text-slate-700 dark:text-slate-200">
                {passwordFallback ? t("login.pinReset") : t("login.pinEnable")}
              </span>
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

          {pendingVerificationEmail ? (
            <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">{t("login.verifyTitle")}</p>
              <p className="mt-1">{t("login.verifyCopy")}</p>
              <p className="mt-2 font-medium">{pendingVerificationEmail}</p>
            </div>
          ) : null}

          <div className="mt-6 text-sm text-slate-500 dark:text-slate-300">
            <Link href="/reset-password" className="font-medium text-accent transition hover:opacity-80">
              {t("login.sendReset")}
            </Link>
          </div>
        </div>
        ) : null}
      </div>
    </main>
  );
}
