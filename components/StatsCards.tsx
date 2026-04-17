"use client";

import { useLanguage } from "@/components/LanguageProvider";

const values = ["28", "142", "$380", "19.2%"];

export function StatsCards() {
  const { tm } = useLanguage();
  const stats = tm<{ label: string; note: string }[]>("dashboard.stats");

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={stat.label} className="glass-panel rounded-[2rem] p-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">{stat.label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{values[index]}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{stat.note}</p>
        </div>
      ))}
    </div>
  );
}
