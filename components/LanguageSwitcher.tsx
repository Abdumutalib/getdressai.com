"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { supportedLanguages } from "@/lib/translations";

const languages = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "uz", label: "O'zbek" },
  { value: "tr", label: "Türkçe" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" }
];

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 p-1.5 text-sm text-slate-700 shadow-soft transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
        compact && "w-full justify-between rounded-2xl p-2",
        className
      )}
    >
      <Languages className="size-4 shrink-0" />
      <div className={cn("flex flex-wrap items-center gap-1", compact && "flex-1 justify-end")}>
        {languages
          .filter((item) => supportedLanguages.includes(item.value as (typeof supportedLanguages)[number]))
          .map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setLanguage(item.value as (typeof supportedLanguages)[number])}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-semibold transition",
                language === item.value
                  ? "bg-ink text-white shadow-glow"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              )}
              aria-pressed={language === item.value}
            >
              {item.label}
            </button>
          ))}
      </div>
    </div>
  );
}
