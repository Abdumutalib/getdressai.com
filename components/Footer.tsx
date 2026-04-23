"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-white pb-8 pt-16 dark:border-white/10 dark:bg-slate-950">
      <div className="section-shell grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-brand flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20">AI</span>
            <p className="font-[var(--font-heading)] text-xl font-bold text-slate-950 dark:text-white">GetDressAI</p>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">{t("footer.description")}</p>
          <LanguageSwitcher />
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium text-slate-950 dark:text-white">{t("footer.product")}</p>
          <Link href="/pricing" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {t("navbar.pricing")}
          </Link>
          <Link href="/examples" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {t("navbar.examples")}
          </Link>
          <Link href="/login?next=/dashboard" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {t("footer.dashboard")}
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium text-slate-950 dark:text-white">{t("footer.company")}</p>
          <Link href="/privacy" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {t("footer.privacy")}
          </Link>
          <Link href="/terms" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {t("footer.terms")}
          </Link>
          <Link href="/refund-policy" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {t("footer.refundPolicy")}
          </Link>
          <Link href="/admin" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {t("footer.admin")}
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-medium text-slate-950 dark:text-white">{t("footer.growth")}</p>
          <Link href="/referrals" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            {t("footer.referralProgram")}
          </Link>
          <p className="text-slate-600 dark:text-slate-300">support@getdressai.com</p>
          <p className="text-slate-600 dark:text-slate-300">{t("footer.copyright")}</p>
        </div>
      </div>
      <div className="section-shell mt-12 border-t border-slate-200 pt-6 text-sm text-slate-400 dark:border-white/10">
        {t("footer.madeWithCare")}
      </div>
    </footer>
  );
}
