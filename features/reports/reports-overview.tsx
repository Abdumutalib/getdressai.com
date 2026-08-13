"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/utils/currency";
import type { ReportsSummary } from "@/lib/reports";

export function ReportsOverview({ summary }: { summary: ReportsSummary }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Бугунги савдо", value: formatMoney(summary.todaySales) },
          { title: "Бугунги фойда", value: formatMoney(summary.todayProfit) },
          { title: "Бугунги харажат", value: formatMoney(summary.todayExpenses) },
          { title: "Ойлик савдо", value: formatMoney(summary.monthSales) },
          { title: "Ойлик фойда", value: formatMoney(summary.monthProfit) },
          { title: "Ойлик харажат", value: formatMoney(summary.monthExpenses) },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6e4f]">{card.title}</p>
            <p className="mt-3 text-2xl font-black text-[#3d2d1f]">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
          <h2 className="text-lg font-extrabold text-[#3e2d1f]">Сўнгги 7 кун</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.weeklySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2d8c6" />
                <XAxis dataKey="label" stroke="#70553d" />
                <YAxis stroke="#70553d" />
                <Tooltip formatter={(value) => formatMoney(Number(value ?? 0))} />
                <Bar dataKey="sales" fill="#8b5e34" radius={[8, 8, 0, 0]} />
                <Bar dataKey="profit" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
          <h2 className="text-lg font-extrabold text-[#3e2d1f]">Энг кўп сотилган товарлар</h2>
          <div className="mt-4 space-y-3">
            {summary.topProducts.length === 0 ? (
              <p className="text-sm text-[#6d5a45]">Маълумот йўқ.</p>
            ) : (
              summary.topProducts.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl bg-[#f6eddc] px-4 py-3 text-sm font-semibold">
                  <span>{item.name}</span>
                  <span>{item.quantity.toLocaleString("uz-UZ")} та</span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
          <h2 className="text-lg font-extrabold text-[#3e2d1f]">Энг яхши мижозлар</h2>
          <div className="mt-4 space-y-3">
            {summary.topCustomers.length === 0 ? (
              <p className="text-sm text-[#6d5a45]">Маълумот йўқ.</p>
            ) : (
              summary.topCustomers.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl bg-[#f6eddc] px-4 py-3 text-sm font-semibold">
                  <span>{item.name}</span>
                  <span>{formatMoney(item.total)}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbcdb6] bg-[#fffaf0] p-5">
          <h2 className="text-lg font-extrabold text-[#3e2d1f]">Экспорт</h2>
          <p className="mt-2 text-sm text-[#6d5a45]">CSV/Excel export кейинги итерацияда қўшилади.</p>
          <div className="mt-4 rounded-xl bg-[#f6eddc] p-4 text-sm text-[#6d5a45]">
            Ҳафталик график ва топ-ривожланиш блоклари реал database data асосида қурилди.
          </div>
        </article>
      </section>
    </div>
  );
}
