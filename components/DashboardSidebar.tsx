"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Gift, History, Settings, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", icon: Sparkles },
  { href: "/dashboard#history", icon: History },
  { href: "/pricing", icon: CreditCard },
  { href: "/referrals", icon: Gift },
  { href: "/dashboard#settings", icon: Settings }
];

export function DashboardSidebar() {
  const { tm } = useLanguage();
  const pathname = usePathname();
  const labels = tm<string[]>("dashboard.sidebar");

  return (
    <aside className="glass-panel rounded-[2rem] p-4">
      <div className="mb-4 rounded-[1.5rem] bg-ink p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Pro workflow</p>
        <p className="mt-2 text-lg font-semibold">Generate, track, and monetize every look.</p>
      </div>
      <nav className="space-y-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href.split("#")[0]);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
                active && "bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white"
              )}
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
