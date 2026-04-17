"use client";

import { Camera, Layers3, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const icons = [Camera, Layers3, Sparkles];

export function HowItWorks() {
  const { t, tm } = useLanguage();
  const steps = tm<{ title: string; copy: string }[]>("howItWorks.steps");
  const safeSteps = Array.isArray(steps) ? steps : [];

  return (
    <section className="section-shell py-24" id="how-it-works">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("howItWorks.eyebrow")}</p>
        <h2 className="section-title">{t("howItWorks.title")}</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {safeSteps.map((step, index) => {
          const Icon = icons[index];
          return (
            <div key={step.title} className="glass-panel rounded-[2rem] p-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accentSoft text-accent">
                  <Icon className="size-5" />
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-semibold text-slate-950 dark:text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.copy}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
