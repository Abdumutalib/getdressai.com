import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { isSupportedLang, MOBILE_STRINGS, type AppLangId } from '@/lib/mobile-i18n';

const STORAGE_KEY = 'getdressai_mobile_lang_v1';

type LocaleValue = {
  lang: AppLangId;
  setLang: (id: string) => Promise<void>;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLangId>('en');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw && isSupportedLang(raw)) {
          setLangState(raw);
        }
      } catch {
        /* noop */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = useCallback(async (id: string) => {
    const next: AppLangId = isSupportedLang(id) ? id : 'en';
    setLangState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      const pack = MOBILE_STRINGS[lang];
      return pack[key] || MOBILE_STRINGS.en[key] || key;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
