"use client";

import Image from "next/image";
import { ExamplesGrid } from "@/components/ExamplesGrid";
import { useLanguage } from "@/components/LanguageProvider";

const qualityExamples = [
  { id: 1, src: "/hero-demo.webp", label: "Яхши сифат", status: "v" },
  { id: 2, src: "/examples/before.svg", label: "Паст сифат", status: "x" }
] as const;

export default function ExamplesPage() {
  const { t } = useLanguage();

  return (
    <main className="py-20">
      <div className="section-shell max-w-3xl space-y-4 pb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("examples.eyebrow")}</p>
        <h1 className="section-title">{t("examples.pageTitle")}</h1>
      </div>

      <section className="section-shell pb-4">
        <div className="grid gap-4 md:grid-cols-2">
          {qualityExamples.map((item) => (
            <div key={item.id} className="glass-panel rounded-[2rem] p-4 shadow-soft">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-white/10">
                <Image src={item.src} alt={item.label} fill className="object-cover" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-slate-950 dark:text-white">{item.label}</span>
                <span
                  className={`inline-flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                    item.status === "v"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ExamplesGrid />
    </main>
  );
}
