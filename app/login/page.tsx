"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { clearPinAuthRecord, readPinAuthRecord, savePinAuthRecord, verifyPinAuthRecord } from "@/lib/pin-auth";
import { createBrowserSafeSupabase } from "@/lib/supabase-browser";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserSafeSupabase(), []);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [savedPinEmail, setSavedPinEmail] = useState("");
  const [pinLogin, setPinLogin] = useState("");
  const [pinSessionReady, setPinSessionReady] = useState(false);
  const [passwordFallback, setPasswordFallback] = useState(false);
  const [pinAutoSubmitting, setPinAutoSubmitting] = useState(false);
  const pinInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const nextPath = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    const record = readPinAuthRecord();
    if (record) {
      setSavedPinEmail(record.email);
      setPinSessionReady(true);
      return;
    }

    setSavedPinEmail("");
    setPinSessionReady(false);
    setPasswordFallback(false);
  }, []);

  useEffect(() => {
    if (searchParams.get("pin") === "1") {
      setMessage(t("login.signupSuccessWithPin"));
      setError("");
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled || !data.session) {
        return;
      }

      void persistServerSessionCookie().then(() => {
        if (!cancelled) {
          completeAuthRedirect();
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, nextPath]);

  useEffect(() => {
    if (!savedPinEmail || pinLogin.length !== 4 || authBusy || pinAutoSubmitting) {
      return;
    }

    setPinAutoSubmitting(true);
    void handlePinLogin().finally(() => {
      setPinAutoSubmitting(false);
    });
  }, [savedPinEmail, pinLogin, authBusy, pinAutoSubmitting]);

  function resetFeedback() {
    setMessage("");
    setError("");
  }

  function switchMode(nextMode: AuthMode) {
    setAuthMode(nextMode);
    setPasswordFallback(false);
    resetFormFields();
    resetFeedback();
    setPinEnabled(nextMode === "signup");
  }

  async function clearAllAuthState() {
    if (supabase) {
      await supabase.auth.signOut({ scope: "local" });
    }

    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "same-origin"
    });

    clearPinAuthRecord();
    setSavedPinEmail("");
    setPinSessionReady(false);
    setPasswordFallback(false);
    setAuthMode("login");
    resetFormFields();
    resetFeedback();
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
      return;
    }

    if (event.key === "Enter" && pinLogin.length === 4 && !authBusy) {
      event.preventDefault();
      void handlePinLogin();
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

  function duplicateEmailMessage() {
    switch (language) {
      case "ru":
        return "Этот email уже зарегистрирован. Просто войдите ниже.";
      case "uz":
        return "Bu email allaqachon ro'yxatdan o'tgan. Pastda kirib qo'ying.";
      case "tr":
        return "Bu e-posta zaten ro'yhatga olingan. Pastdan kirish kifoya.";
      case "es":
        return "Este correo ya esta registrado. Solo entra abajo.";
      case "fr":
        return "Cet email est deja inscrit. Connectez-vous ci-dessous.";
      case "de":
        return "Diese E-Mail ist schon registriert. Bitte unten einloggen.";
      case "ar":
        return "هذا البريد مسجل بالفعل. فقط سجل الدخول بالاسفل.";
      default:
        return "This email is already registered. Just sign in below.";
    }
  }

  function completeAuthRedirect() {
    if (typeof window !== "undefined") {
      window.location.assign(nextPath);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  async function persistServerSessionCookie() {
    await fetch("/api/auth/session", {
      method: "POST",
      credentials: "same-origin"
    });
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
    setAuthBusy(true);
    resetFeedback();

    if (!supabase) {
      setError(t("login.unavailable"));
      setAuthBusy(false);
      return;
    }

    try {
      if (authMode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const payload = (await response.json()) as {
          error?: string;
          code?: string;
          session?: { access_token: string; refresh_token: string };
        };

        if (!response.ok || !payload.session) {
          if (payload.code === "EMAIL_EXISTS") {
            setAuthMode("login");
            setPinEnabled(false);
            setPin("");
            setPinConfirm("");
            setMessage(duplicateEmailMessage());
            setAuthBusy(false);
            return;
          }

          throw new Error(payload.error || t("login.genericError"));
        }

        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: payload.session.access_token,
          refresh_token: payload.session.refresh_token
        });

        if (setSessionError) {
          throw setSessionError;
        }

        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (session) {
          await persistServerSessionCookie();
          await savePinIfNeeded(email, session);
          if (pinEnabled) {
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
          completeAuthRedirect();
          return;
        }
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const payload = (await response.json()) as {
        error?: string;
        session?: { access_token: string; refresh_token: string };
      };

      if (!response.ok || !payload.session) {
        throw new Error(payload.error || t("login.genericError"));
      }

      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: payload.session.access_token,
        refresh_token: payload.session.refresh_token
      });

      if (setSessionError) {
        throw setSessionError;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      await persistServerSessionCookie();
      await savePinIfNeeded(email, session);
      completeAuthRedirect();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("login.genericError"));
      setAuthBusy(false);
    }
  }

  async function handlePinLogin() {
    setAuthBusy(true);
    resetFeedback();

    if (!supabase) {
      setError(t("login.unavailable"));
      setAuthBusy(false);
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

      await persistServerSessionCookie();
      completeAuthRedirect();
    } catch (nextError) {
      const errorMessage = nextError instanceof Error ? nextError.message : "";

      if (
        errorMessage === "Saved PIN login expired." ||
        /refresh token|invalid.*token|session/i.test(errorMessage)
      ) {
        clearPinAuthRecord();
        setSavedPinEmail("");
        setPinSessionReady(false);
        setPasswordFallback(false);
        setPinLogin("");
        setError(t("login.pinExpired"));
      } else {
        setError(nextError instanceof Error ? nextError.message : t("login.pinLoginError"));
      }
      setAuthBusy(false);
    }
  }

  async function sendResetLink() {
    if (!email) {
      setError(t("login.emailRequired"));
      return;
    }

    setResetBusy(true);
    resetFeedback();

    if (!supabase) {
      setError(t("login.resetUnavailable"));
      setResetBusy(false);
      return;
    }

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (resetError) {
      setError(resetError.message);
      setResetBusy(false);
      return;
    }

    setMessage(t("login.resetSent"));
    setResetBusy(false);
  }

  async function removeSavedPin() {
    await clearAllAuthState();
    setMessage(t("login.pinRemoved"));
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
                disabled={authBusy}
                className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white"
              >
                {authBusy ? t("login.sending") : t("login.pinButton")}
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
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
              {passwordFallback
                ? t("login.passwordTitle")
                : authMode === "signup"
                  ? t("login.signupTitle")
                  : t("login.title")}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {passwordFallback
                ? t("login.pinPasswordFallback")
                : authMode === "signup"
                  ? t("login.signupCopy")
                  : t("login.copy")}
            </p>
          </div>

          {!passwordFallback ? (
          <div className="mt-6 flex gap-2 rounded-full bg-slate-100 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                authMode === "login" ? "bg-white text-slate-950 shadow-soft dark:bg-white dark:text-slate-950" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {t("login.loginTab")}
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
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

            {authMode === "signup" || passwordFallback ? (
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
            ) : null}

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

            {authMode === "login" || passwordFallback ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={sendResetLink}
                  className="text-sm font-medium text-accent transition hover:opacity-80"
                  disabled={resetBusy || authBusy}
                >
                  {resetBusy ? t("login.sending") : t("login.forgotPassword")}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-300">{t("login.resetHint")}</span>
              </div>
            ) : null}

            <button type="submit" className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white">
              {authBusy ? t("login.sending") : authMode === "signup" ? t("login.signupButton") : t("login.button")}
            </button>
            {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
            {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
          </form>

          <div className="mt-6 flex justify-end text-sm text-slate-500 dark:text-slate-300">
            <button
              type="button"
              onClick={clearAllAuthState}
              className="font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {t("login.clearAll")}
            </button>
          </div>
        </div>
        ) : null}
      </div>
    </main>
  );
}
