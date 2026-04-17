"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MoonStar, Sparkles, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

export function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const links = [
    { href: "/pricing", label: t("navbar.pricing") },
    { href: "/examples", label: t("navbar.examples") },
    { href: "/referrals", label: t("navbar.referrals") },
    { href: "/login", label: t("navbar.login") }
  ];

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("getdressai-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextDark = stored ? stored === "dark" : prefersDark;
      setDark(nextDark);
      document.documentElement.classList.toggle("dark", nextDark);
    } catch {
      setDark(false);
    }
  }, []);

  const toggleTheme = () => {
    try {
      const nextDark = !dark;
      setDark(nextDark);
      document.documentElement.classList.toggle("dark", nextDark);
      window.localStorage.setItem("getdressai-theme", nextDark ? "dark" : "light");
    } catch {
      return;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="section-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-950 dark:text-white">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-ink text-white shadow-glow">
            <Sparkles className="size-5" />
          </span>
          <span className="text-lg tracking-tight">GetDressAI</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                pathname === link.href && "bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden md:inline-flex" />
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            aria-label="Toggle dark mode"
          >
            {dark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
          </button>
          <Link
            href="/dashboard"
            className="hidden rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 md:inline-flex"
          >
            {t("navbar.tryFree")}
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 md:hidden dark:border-white/10"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="section-shell flex flex-col gap-2 border-t border-slate-200/70 py-4 md:hidden dark:border-white/10">
          <LanguageSwitcher className="mb-2 w-full" compact />
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            {t("navbar.tryFree")}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
