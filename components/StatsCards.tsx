"use client";

import { useLanguage } from "@/components/LanguageProvider";

const values = ["28", "142", "$380", "19.2%"];

export function StatsCards() {
  const { tm } = useLanguage();
  const stats = tm<{ label: string; note: string }[]>("dashboard.stats");
  const safeStats = Array.isArray(stats) ? stats : [];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {safeStats.map((stat, index) => (
        <div key={stat.label} className="glass-panel rounded-[1.5rem] p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
              {stat.label}
            </p>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
              +12%
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold leading-none text-slate-950 dark:text-white">{values[index]}</p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{stat.note}</p>
        </div>
      ))}
    </div>
  );
}
