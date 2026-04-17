"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { trackEvent } from "@/lib/analytics";
import { createBrowserSafeSupabase } from "@/lib/supabase-browser";

export function PricingCards() {
  const { t, tm } = useLanguage();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSafeSupabase(), []);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const localizedPlans = tm<{ name: string; subtitle: string; features: string[]; cta: string }[]>("pricing.plans");
  const safeLocalizedPlans = Array.isArray(localizedPlans) ? localizedPlans : [];
  const plans = safeLocalizedPlans.map((plan, index) => ({
    ...plan,
    price: [0, 9, 19, 49][index],
    plan: ["free", "starter", "popular", "pro"][index],
    highlight: index === 2
  }));

  async function handlePlanClick(plan: "free" | "starter" | "popular" | "pro") {
    setError("");
    setLoadingPlan(plan);

    try {
      if (plan === "free") {
        trackEvent("cta_clicked", { source: "pricing_cards", plan });
        router.push("/login?plan=free");
        return;
      }

      if (!supabase) {
        router.push(`/login?plan=${plan}`);
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user?.email) {
        router.push(`/login?plan=${plan}`);
        return;
      }

      trackEvent("checkout_opened", { plan, source: "pricing_cards" });

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plan,
          email: user.email,
          userId: user.id,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed.");
      }

      const checkoutUrl =
        data?.data?.checkout?.url ||
        data?.data?.checkout_url ||
        data?.data?.url ||
        data?.checkout?.url ||
        data?.url;

      if (!checkoutUrl) {
        throw new Error("Checkout URL not returned.");
      }

      window.location.href = checkoutUrl;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Checkout failed.");
    } finally {
      setLoadingPlan(null);
    }
  }

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
            {plan.highlight ? (
              <div className="mb-4 inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                Best value for creators
              </div>
            ) : null}
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
              onClick={() => handlePlanClick(plan.plan as "free" | "starter" | "popular" | "pro")}
              disabled={loadingPlan === plan.plan}
              className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                plan.highlight ? "bg-white text-slate-950 hover:bg-white/90" : "bg-ink text-white hover:opacity-90"
              } ${loadingPlan === plan.plan ? "cursor-wait opacity-70" : ""}`}
            >
              {loadingPlan === plan.plan ? "Loading..." : plan.cta}
            </button>
            <p className={`mt-3 text-xs ${plan.highlight ? "text-white/60" : "text-slate-500 dark:text-slate-300"}`}>
              {plan.highlight ? "Most creators upgrade here after the first free try." : "Instant activation. Cancel or upgrade anytime."}
            </p>
          </div>
        ))}
      </div>
      {error ? <p className="mt-6 text-sm font-medium text-rose-500">{error}</p> : null}
    </section>
  );
}
