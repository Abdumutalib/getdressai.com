import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { getReportsSummary } from "@/lib/reports";
import { formatMoney } from "@/utils/currency";

const QUICK_ACTIONS = [
  { href: "/sales/cash", title: "Нақд сотув" },
  { href: "/sales/new", title: "Сотув" },
  { href: "/purchases/new", title: "Кирим" },
  { href: "/warehouse/expense", title: "Чиқим" },
  { href: "/payments/new", title: "Тўлов" },
  { href: "/expenses/new", title: "Харажат" },
  { href: "/orders/new", title: "Буюртма" },
] as const satisfies ReadonlyArray<{ href: Route; title: string }>;

export default async function DashboardPage() {
  const summary = await getReportsSummary();

  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Бошқарув панели</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Бугунги бизнес кўрсаткичлари ва тезкор операциялар.</p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Бугунги савдо", value: formatMoney(summary.todaySales) },
          { title: "Бугунги фойда", value: formatMoney(summary.todayProfit) },
          { title: "Ойлик савдо", value: formatMoney(summary.monthSales) },
          { title: "Ойлик харажат", value: formatMoney(summary.monthExpenses) },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6e4f]">{card.title}</p>
            <p className="mt-3 text-2xl font-black text-[#3d2d1f]">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
          <h2 className="text-xl font-extrabold text-[#3e2d1f]">Сўнгги 7 кун</h2>
          <div className="mt-4 space-y-2">
            {summary.weeklySeries.map((point) => (
              <div key={point.label} className="grid grid-cols-[80px_1fr_1fr] items-center gap-3 rounded-xl bg-[#f6eddc] px-4 py-3 text-sm">
                <span className="font-semibold text-[#4a3725]">{point.label}</span>
                <span>Савдо: {formatMoney(point.sales)}</span>
                <span>Фойда: {formatMoney(point.profit)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
          <h2 className="text-xl font-extrabold text-[#3e2d1f]">Тезкор амаллар</h2>
          <div className="mt-4 grid gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-2xl border border-[#d9cab1] bg-gradient-to-br from-[#f9edd9] to-[#efe2cc] p-4 text-center text-sm font-bold text-[#5c4026] hover:from-[#f7e8cf] hover:to-[#e9dac0]"
              >
                {action.title}
              </Link>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
