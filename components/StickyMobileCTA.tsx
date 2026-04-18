"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/components/LanguageProvider";

export function StickyMobileCTA() {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden dark:border-white/10 dark:bg-slate-950/95">
      <Link
        href="/login"
        onClick={() => trackEvent("cta_clicked", { location: "sticky_mobile_cta" })}
        className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold"
      >
        {t("navbar.tryFree")}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
