"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = languages.find((item) => item.value === language) ?? languages[0];
  const options = languages.filter(
    (item) =>
      supportedLanguages.includes(item.value as (typeof supportedLanguages)[number]) && item.value !== language
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", compact && "w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-soft transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
          compact && "w-full justify-between rounded-2xl px-4 py-3"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Select language"
      >
        <span className="inline-flex items-center gap-2">
          <Languages className="size-4 shrink-0" />
          <span>{current.label}</span>
        </span>
        <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-56 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-950",
            compact && "left-0 min-w-0"
          )}
          role="menu"
        >
          <div className="space-y-1">
            <div className="rounded-[1rem] bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 dark:bg-white/10 dark:text-white">
              {current.label}
            </div>
            {options.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setLanguage(item.value as (typeof supportedLanguages)[number]);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-[1rem] px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                role="menuitem"
              >
                <span>{item.label}</span>
                <Check className="size-4 opacity-0" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
