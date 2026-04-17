"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTranslationValue, supportedLanguages, type SupportedLanguage } from "@/lib/translations";

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
  tm: <T>(key: string) => T;
};

const STORAGE_KEY = "getdressai-language";
const RTL_LANGUAGES = new Set<SupportedLanguage>(["ar"]);

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage
}: {
  children: React.ReactNode;
  initialLanguage: SupportedLanguage;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (stored && supportedLanguages.includes(stored)) {
      setLanguageState(stored);
      document.documentElement.lang = stored;
      document.documentElement.dir = RTL_LANGUAGES.has(stored) ? "rtl" : "ltr";
      return;
    }
    document.documentElement.lang = initialLanguage;
    document.documentElement.dir = RTL_LANGUAGES.has(initialLanguage) ? "rtl" : "ltr";
  }, [initialLanguage]);

  const setLanguage = (nextLanguage: SupportedLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    document.cookie = `${STORAGE_KEY}=${nextLanguage}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = RTL_LANGUAGES.has(nextLanguage) ? "rtl" : "ltr";
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => {
        const translated = getTranslationValue(language, key);
        return typeof translated === "string" ? translated : key;
      },
      tm: <T,>(key: string) => getTranslationValue(language, key) as T
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
