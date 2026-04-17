"use client";

import Link from "next/link";
import { CreditCard, Gift, History, Settings, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const items = [
  { href: "/dashboard", icon: Sparkles },
  { href: "/dashboard#history", icon: History },
  { href: "/pricing", icon: CreditCard },
  { href: "/referrals", icon: Gift },
  { href: "/dashboard#settings", icon: Settings }
];

export function DashboardSidebar() {
  const { tm } = useLanguage();
  const labels = tm<string[]>("dashboard.sidebar");

  return (
    <aside className="glass-panel rounded-[2rem] p-4">
      <nav className="space-y-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <Icon className="size-4" />
              {labels[index]}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
