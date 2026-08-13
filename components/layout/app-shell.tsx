"use client";

import Link from "next/link";
import type { Route } from "next";
import { type ReactNode } from "react";
import { OfflineStatusBanner } from "@/components/shared/offline-status-banner";

const SIDEBAR = [
  { href: "/dashboard", label: "Бош саҳифа" },
  { href: "/products", label: "Товарлар" },
  { href: "/warehouses", label: "Омбор" },
  { href: "/sales", label: "Сотув" },
  { href: "/purchases", label: "Харид" },
  { href: "/customers", label: "Мижозлар" },
  { href: "/orders", label: "Буюртмалар" },
  { href: "/reports", label: "Ҳисоботлар" },
  { href: "/sync", label: "Синхрон" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

const MOBILE_NAV = [
  { href: "/dashboard", label: "🏠 Бош саҳифа" },
  { href: "/sales", label: "🛒 Сотув" },
  { href: "/warehouses", label: "📦 Омбор" },
  { href: "/customers", label: "👥 Мижозлар" },
  { href: "/settings", label: "☰ Бошқа" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1f2937]">
      <OfflineStatusBanner />
      <div className="mx-auto grid min-h-[calc(100vh-40px)] max-w-[1600px] grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-[#d7cfbe] bg-[#f8f5ee] p-4 md:block">
          <p className="mb-6 text-xl font-black tracking-wide">AKBEL CRM</p>
          <nav className="flex flex-col gap-2">
            {SIDEBAR.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[#e7decb]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="p-4 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-[#d7cfbe] bg-[#f8f5ee] md:hidden">
        {MOBILE_NAV.map((item) => (
          <Link key={item.href} href={item.href} className="px-2 py-3 text-center text-xs font-semibold">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
