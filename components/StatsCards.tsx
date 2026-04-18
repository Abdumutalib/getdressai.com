"use client";

import { useLanguage } from "@/components/LanguageProvider";

const values = ["28", "142", "$380", "19.2%"];

export function StatsCards() {
  const { tm } = useLanguage();
  const stats = tm<{ label: string; note: string }[]>("dashboard.stats");
  const safeStats = Array.isArray(stats) ? stats : [];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {safeStats.map((stat, index) => (
        <div key={stat.label} className="rounded-[1rem] border border-slate-200/70 bg-white/75 px-3 py-2 shadow-soft dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
              {stat.label}
            </p>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
              +12%
            </span>
          </div>
          <p className="mt-1.5 text-base font-semibold leading-none text-slate-950 dark:text-white">{values[index]}</p>
          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-600 dark:text-slate-300">{stat.note}</p>
        </div>
      ))}
    </div>
  );
}
