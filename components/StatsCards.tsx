const stats = [
  { label: "Credits", value: "28", note: "5 bonus credits expiring in 2 days" },
  { label: "Generations", value: "142", note: "12 today, 38 this week" },
  { label: "Referral revenue", value: "$380", note: "11 referred purchases this month" },
  { label: "Upgrade rate", value: "19.2%", note: "Best cohort: organic social" }
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-panel rounded-[2rem] p-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">{stat.label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{stat.value}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{stat.note}</p>
        </div>
      ))}
    </div>
  );
}
