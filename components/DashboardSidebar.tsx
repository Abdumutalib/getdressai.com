import Link from "next/link";
import { CreditCard, Gift, History, Settings, Sparkles } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Generate", icon: Sparkles },
  { href: "/dashboard#history", label: "History", icon: History },
  { href: "/pricing", label: "Billing", icon: CreditCard },
  { href: "/referrals", label: "Referrals", icon: Gift },
  { href: "/dashboard#settings", label: "Settings", icon: Settings }
];

export function DashboardSidebar() {
  return (
    <aside className="glass-panel rounded-[2rem] p-4">
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
