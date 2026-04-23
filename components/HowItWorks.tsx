"use client";

import { Camera, Layers3, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const icons = [Camera, Layers3, Sparkles];

export function HowItWorks() {
  const { t, tm } = useLanguage();
  const steps = tm<{ title: string; copy: string }[]>("howItWorks.steps");
  const safeSteps = Array.isArray(steps) ? steps : [];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white" id="how-it-works">
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="section-shell relative">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">{t("howItWorks.eyebrow")}</p>
        <h2 className="font-[var(--font-heading)] text-4xl font-bold tracking-tight text-white sm:text-5xl">{t("howItWorks.title")}</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {safeSteps.map((step, index) => {
          const Icon = icons[index];
          return (
            <div key={step.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-fuchsia-300">
                  <Icon className="size-5" />
                </span>
              </div>
              <h3 className="mt-8 font-[var(--font-heading)] text-2xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.copy}</p>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
