"use client";

import { Check, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

export function PricingCards() {
  const { t, tm } = useLanguage();
  const localizedPlans = tm<{ name: string; subtitle: string; features: string[]; cta: string }[]>("pricing.plans");
  const plans = localizedPlans.map((plan, index) => ({
    ...plan,
    price: [0, 9, 19, 49][index],
    plan: ["starter", "starter", "popular", "pro"][index],
    highlight: index === 2
  }));

  return (
    <section className="section-shell py-24" id="pricing">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("pricing.eyebrow")}</p>
        <h2 className="section-title">{t("pricing.title")}</h2>
      </div>
      <div className="grid gap-6 xl:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[2rem] border p-8 shadow-soft ${
              plan.highlight ? "border-accent bg-ink text-white" : "glass-panel text-slate-950 dark:text-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xl font-semibold">{plan.name}</p>
                <p className={`mt-2 text-sm ${plan.highlight ? "text-white/70" : "text-slate-500 dark:text-slate-300"}`}>
                  {plan.subtitle}
                </p>
              </div>
              {plan.highlight ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="size-3.5" />
                  {t("pricing.popular")}
                </span>
              ) : null}
            </div>

            <div className="mt-8">
              <span className="text-5xl font-semibold">{formatCurrency(plan.price)}</span>
              <span className={`ms-2 text-sm ${plan.highlight ? "text-white/70" : "text-slate-500 dark:text-slate-300"}`}>
                {t("pricing.perMonth")}
              </span>
            </div>

            <ul className="mt-8 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <Check className={`mt-0.5 size-4 shrink-0 ${plan.highlight ? "text-emerald-300" : "text-emerald-500"}`} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              data-plan={plan.plan}
              className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                plan.highlight ? "bg-white text-slate-950 hover:bg-white/90" : "bg-ink text-white hover:opacity-90"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
