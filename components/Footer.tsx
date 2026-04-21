"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-white py-14 dark:border-white/10 dark:bg-slate-950">
      <div className="section-shell grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-lg font-semibold text-slate-950 dark:text-white">GetDressAI</p>
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
            Privacy
          </Link>
          <Link href="/terms" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Terms
          </Link>
          <Link href="/refund-policy" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Refund Policy
          </Link>
          <Link href="/admin" className="block text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Admin
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
    </footer>
  );
}
