"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Gift, History, Settings, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";
import { marketingImages } from "@/lib/marketing-images";

const items = [
  { href: "/dashboard#generate", icon: Sparkles },
  { href: "/dashboard#history", icon: History },
  { href: "/pricing", icon: CreditCard },
  { href: "/referrals", icon: Gift },
  { href: "/dashboard#settings", icon: Settings }
];

export function DashboardSidebar() {
  const { tm } = useLanguage();
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const labels = tm<string[]>("dashboard.sidebar");
  const safeLabels = Array.isArray(labels) ? labels : ["Generate", "History", "Billing", "Referrals", "Settings"];

  useEffect(() => {
    const updateHash = () => {
      setHash(typeof window !== "undefined" ? window.location.hash : "");
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  return (
    <aside className="space-y-4">
      <div className="overflow-hidden rounded-[2rem]">
        <BeforeAfterSlider beforeSrc={marketingImages.before} afterSrc={marketingImages.luxury} />
      </div>
      <nav className="glass-panel rounded-[2rem] p-4 space-y-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          const [basePath, itemHash = ""] = item.href.split("#");
          const active = itemHash
            ? pathname === basePath && (hash === `#${itemHash}` || (itemHash === "generate" && !hash))
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
                !active && "surface-soft",
                active && "bg-accentSoft text-accent dark:bg-white/10 dark:text-white"
              )}
            >
              <Icon className="size-4" />
              {safeLabels[index] ?? item.href}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
