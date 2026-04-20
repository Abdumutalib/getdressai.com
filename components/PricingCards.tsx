"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { trackEvent } from "@/lib/analytics";
import { createBrowserSafeSupabase } from "@/lib/supabase-browser";

type BillingCycle = "yearly" | "monthly";

type CycleCopy = {
  yearly: string;
  monthly: string;
  yearlyBadge: string;
  yearlyHint: string;
  yearlyPlan: string;
  monthlyPlan: string;
  perMonth: string;
  saveLabel: string;
  yearlyWas: string;
};

const cycleCopy: Record<string, CycleCopy> = {
  en: {
    yearly: "Yearly",
    monthly: "Monthly",
    yearlyBadge: "Yearly first",
    yearlyHint: "Annual billing is selected by default for better value.",
    yearlyPlan: "Billed yearly",
    monthlyPlan: "Billed monthly",
    perMonth: "/ month",
    saveLabel: "Save 15%",
    yearlyWas: "Regular yearly price",
  },
  ru: {
    yearly: "Годовая",
    monthly: "Месячная",
    yearlyBadge: "Сначала годовая",
    yearlyHint: "По умолчанию выбрана годовая подписка как более выгодная.",
    yearlyPlan: "Списывается раз в год",
    monthlyPlan: "Списывается раз в месяц",
    perMonth: "/ месяц",
    saveLabel: "Скидка 15%",
    yearlyWas: "Обычная цена за год",
  },
  uz: {
    yearly: "Yillik",
    monthly: "Oylik",
    yearlyBadge: "Yillik ustuvor",
    yearlyHint: "Ko'proq foyda uchun default holatda yillik obuna tanlangan.",
    yearlyPlan: "Yiliga bir marta yechiladi",
    monthlyPlan: "Oyiga bir marta yechiladi",
    perMonth: "/ oy",
    saveLabel: "15% chegirma",
    yearlyWas: "Oddiy yillik narx",
  },
  tr: {
    yearly: "Yillik",
    monthly: "Aylik",
    yearlyBadge: "Yillik once",
    yearlyHint: "Daha iyi deger icin varsayilan olarak yillik abonelik secildi.",
    yearlyPlan: "Yilda bir kez faturalandirilir",
    monthlyPlan: "Ayda bir kez faturalandirilir",
    perMonth: "/ ay",
    saveLabel: "%15 indirim",
    yearlyWas: "Normal yillik fiyat",
  },
  es: {
    yearly: "Anual",
    monthly: "Mensual",
    yearlyBadge: "Anual primero",
    yearlyHint: "La suscripcion anual viene seleccionada por defecto por mejor valor.",
    yearlyPlan: "Se cobra una vez al ano",
    monthlyPlan: "Se cobra una vez al mes",
    perMonth: "/ mes",
    saveLabel: "15% de descuento",
    yearlyWas: "Precio anual normal",
  },
  fr: {
    yearly: "Annuel",
    monthly: "Mensuel",
    yearlyBadge: "Annuel d'abord",
    yearlyHint: "La facturation annuelle est selectionnee par defaut pour une meilleure valeur.",
    yearlyPlan: "Facture une fois par an",
    monthlyPlan: "Facture une fois par mois",
    perMonth: "/ mois",
    saveLabel: "-15%",
    yearlyWas: "Prix annuel normal",
  },
  de: {
    yearly: "Jahrlich",
    monthly: "Monatlich",
    yearlyBadge: "Jahrlich zuerst",
    yearlyHint: "Jahrliche Abrechnung ist standardmassig vorausgewahlt fur mehr Wert.",
    yearlyPlan: "Wird jahrlich abgerechnet",
    monthlyPlan: "Wird monatlich abgerechnet",
    perMonth: "/ Monat",
    saveLabel: "15% Rabatt",
    yearlyWas: "Normaler Jahrespreis",
  },
  ar: {
    yearly: "سنوي",
    monthly: "شهري",
    yearlyBadge: "السنوي اولا",
    yearlyHint: "تم اختيار الاشتراك السنوي افتراضيا لانه افضل قيمة.",
    yearlyPlan: "تتم الفوترة مرة كل سنة",
    monthlyPlan: "تتم الفوترة مرة كل شهر",
    perMonth: "/ شهر",
    saveLabel: "خصم 15%",
    yearlyWas: "السعر السنوي العادي",
  },
};

export function PricingCards() {
  const { language, t, tm } = useLanguage();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSafeSupabase(), []);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const localizedPlans = tm<{ name: string; subtitle: string; features: string[]; cta: string }[]>("pricing.plans");
  const safeLocalizedPlans = Array.isArray(localizedPlans) ? localizedPlans : [];
  const localizedCycleCopy = cycleCopy[language] ?? cycleCopy.en;
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
          billingCycle,
          email: user.email,
          userId: user.id,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("pricing.checkoutFailed"));
      }

      const checkoutUrl =
        data?.data?.checkout?.url ||
        data?.data?.checkout_url ||
        data?.data?.url ||
        data?.checkout?.url ||
        data?.url;

      if (!checkoutUrl) {
        throw new Error(t("pricing.checkoutUrlMissing"));
      }

      window.location.href = checkoutUrl;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("pricing.checkoutFailed"));
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section className="section-shell py-24" id="pricing">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("pricing.eyebrow")}</p>
        <h2 className="section-title">{t("pricing.title")}</h2>
        <div className="inline-flex rounded-full border border-slate-200 bg-white/80 p-1 shadow-soft dark:border-white/10 dark:bg-white/5">
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              billingCycle === "yearly" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 dark:text-slate-300"
            }`}
          >
            {localizedCycleCopy.yearly}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              billingCycle === "monthly" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 dark:text-slate-300"
            }`}
          >
            {localizedCycleCopy.monthly}
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-300">{localizedCycleCopy.yearlyHint}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-4">
        {plans.map((plan) => {
          const monthlyPrice = plan.price;
          const regularYearlyPrice = monthlyPrice * 12;
          const discountedMonthlyPrice = Number((monthlyPrice * 0.85).toFixed(2));
          const shownPrice = billingCycle === "yearly" ? discountedMonthlyPrice : monthlyPrice;
          const shownPeriod = billingCycle === "yearly" ? localizedCycleCopy.perMonth : t("pricing.perMonth");

          return (
            <div
              key={plan.name}
              className={`rounded-[2rem] border p-8 shadow-soft ${
                plan.highlight ? "border-accent bg-gradient-to-br from-accent to-[#847DFF] text-white" : "glass-panel text-slate-950 dark:text-white"
              }`}
            >
              {plan.highlight ? (
                <div className="mb-4 inline-flex rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                  {billingCycle === "yearly" ? localizedCycleCopy.yearlyBadge : t("pricing.bestValue")}
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
                <span className="text-5xl font-semibold">{formatCurrency(shownPrice)}</span>
                <span className={`ms-2 text-sm ${plan.highlight ? "text-white/70" : "text-slate-500 dark:text-slate-300"}`}>
                  {shownPeriod}
                </span>
              </div>
              {plan.plan !== "free" && billingCycle === "yearly" ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`text-sm line-through ${plan.highlight ? "text-white/70" : "text-slate-400 dark:text-slate-500"}`}>
                    {formatCurrency(monthlyPrice)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.highlight ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
                    {localizedCycleCopy.saveLabel}
                  </span>
                </div>
              ) : null}
              {plan.plan !== "free" ? (
                <p className={`mt-2 text-xs font-medium uppercase tracking-[0.16em] ${plan.highlight ? "text-white/70" : "text-slate-500 dark:text-slate-300"}`}>
                  {billingCycle === "yearly" ? localizedCycleCopy.yearlyPlan : localizedCycleCopy.monthlyPlan}
                </p>
              ) : null}
              {plan.plan !== "free" && billingCycle === "yearly" ? (
                <p className={`mt-1 text-xs ${plan.highlight ? "text-white/70" : "text-slate-500 dark:text-slate-300"}`}>
                  {localizedCycleCopy.yearlyWas}: {formatCurrency(regularYearlyPrice)}
                </p>
              ) : null}

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
                  plan.highlight ? "bg-white text-slate-950 hover:bg-white/90" : "btn-primary"
                } ${loadingPlan === plan.plan ? "cursor-wait opacity-70" : ""}`}
              >
                {loadingPlan === plan.plan ? t("pricing.loading") : plan.cta}
              </button>
              <p className={`mt-3 text-xs ${plan.highlight ? "text-white/60" : "text-slate-500 dark:text-slate-300"}`}>
                {plan.highlight ? t("pricing.highlightNote") : t("pricing.defaultNote")}
              </p>
            </div>
          );
        })}
      </div>
      {error ? <p className="mt-6 text-sm font-medium text-rose-500">{error}</p> : null}
    </section>
  );
}
