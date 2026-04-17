"use client";

import { Check, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: 0,
    subtitle: "1 preview with watermark",
    features: ["1 preview credit", "Made with GetDressAI watermark", "Standard queue"],
    cta: "Start Free",
    plan: "starter"
  },
  {
    name: "Starter",
    price: 9,
    subtitle: "10 credits for first wins",
    features: ["10 credits", "Faster queue", "HD download", "No watermark"],
    cta: "Get Starter",
    plan: "starter"
  },
  {
    name: "Popular",
    price: 19,
    subtitle: "30 credits for creators",
    features: ["30 credits", "Priority queue", "Referral multipliers", "Early prompt packs"],
    cta: "Choose Popular",
    plan: "popular",
    highlight: true
  },
  {
    name: "Pro",
    price: 49,
    subtitle: "Unlimited monthly fair use",
    features: ["Unlimited fair use", "Batch generation", "Upsell portal access", "Priority support"],
    cta: "Go Pro",
    plan: "pro"
  }
];

export function PricingCards() {
  return (
    <section className="section-shell py-24" id="pricing">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Pricing</p>
        <h2 className="section-title">Built to convert first-time users into expanding paid cohorts.</h2>
      </div>
      <div className="grid gap-6 xl:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[2rem] border p-8 shadow-soft ${
              plan.highlight
                ? "border-accent bg-ink text-white"
                : "glass-panel text-slate-950 dark:text-white"
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
                  Most Popular
                </span>
              ) : null}
            </div>

            <div className="mt-8">
              <span className="text-5xl font-semibold">{formatCurrency(plan.price)}</span>
              <span className={`ms-2 text-sm ${plan.highlight ? "text-white/70" : "text-slate-500 dark:text-slate-300"}`}>
                / month
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
                plan.highlight
                  ? "bg-white text-slate-950 hover:bg-white/90"
                  : "bg-ink text-white hover:opacity-90"
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
