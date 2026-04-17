"use client";

import { Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "getdressai-language";

const languages = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "uz", label: "O'zbek" }
];

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? "en";
    setLanguage(stored);
    document.documentElement.lang = stored;
  }, []);

  const onChange = (value: string) => {
    setLanguage(value);
    window.localStorage.setItem(STORAGE_KEY, value);
    document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = value;
  };

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-soft transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
        compact && "px-3 py-2",
        className
      )}
    >
      <Languages className="size-4 shrink-0" />
      <select
        value={language}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-sm font-medium outline-none"
        aria-label="Select language"
      >
        {languages.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
