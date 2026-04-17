"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { TrustBadges } from "@/components/TrustBadges";
import { HowItWorks } from "@/components/HowItWorks";
import { useLanguage } from "@/components/LanguageProvider";

const ExamplesGrid = dynamic(() => import("@/components/ExamplesGrid").then((module) => module.ExamplesGrid));
const Testimonials = dynamic(() => import("@/components/Testimonials").then((module) => module.Testimonials));
const PricingCards = dynamic(() => import("@/components/PricingCards").then((module) => module.PricingCards));
const FAQ = dynamic(() => import("@/components/FAQ").then((module) => module.FAQ));
const CTA = dynamic(() => import("@/components/CTA").then((module) => module.CTA));

function WhyUs() {
  const { t, tm } = useLanguage();
  const rows = tm<string[][]>("whyUs.rows");
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <section className="section-shell py-24">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("whyUs.eyebrow")}</p>
        <h2 className="section-title">{t("whyUs.title")}</h2>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-soft dark:border-white/10">
        <table className="w-full border-collapse bg-white text-left text-sm dark:bg-slate-950">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="px-6 py-4 font-semibold">{t("whyUs.category")}</th>
              <th className="px-6 py-4 font-semibold">{t("whyUs.ours")}</th>
              <th className="px-6 py-4 font-semibold">{t("whyUs.competitor")}</th>
            </tr>
          </thead>
          <tbody>
            {safeRows.map((row) => (
              <tr key={row[0]} className="border-b border-slate-100 last:border-none dark:border-white/5">
                {row.map((cell) => (
                  <td key={cell} className="px-6 py-5 text-slate-600 dark:text-slate-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReferralLoop() {
  const { t, tm } = useLanguage();
  const bullets = tm<string[]>("referralLoop.bullets");
  const safeBullets = Array.isArray(bullets) ? bullets : [];

  return (
    <section className="section-shell py-24">
      <div className="glass-panel grid gap-8 rounded-[2.25rem] p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("referralLoop.eyebrow")}</p>
          <h2 className="section-title">{t("referralLoop.title")}</h2>
          <p className="section-copy">{t("referralLoop.copy")}</p>
        </div>
        <div className="grid gap-4">
          {safeBullets.map((item) => (
            <div key={item} className="rounded-[1.5rem] bg-white p-5 shadow-soft dark:bg-white/5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main>
      <Hero />
      <TrustBadges />
      <HowItWorks />
      <ExamplesGrid />
      <WhyUs />
      <Testimonials />
      <PricingCards />
      <ReferralLoop />
      <FAQ />
      <CTA />
      <section className="section-shell pb-24">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-8 py-10 text-center dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("urgency.eyebrow")}</p>
          <h3 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
            {t("urgency.title")}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            {t("urgency.copy")}
          </p>
          <div className="mt-6">
            <Link href="/pricing" className="inline-flex rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white">
              {t("urgency.button")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
