import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";

export type ReportSeriesPoint = {
  label: string;
  sales: number;
  profit: number;
  expenses: number;
};

export type ReportsSummary = {
  todaySales: number;
  todayProfit: number;
  todayExpenses: number;
  monthSales: number;
  monthProfit: number;
  monthExpenses: number;
  weeklySeries: ReportSeriesPoint[];
  topProducts: Array<{ name: string; quantity: number }>;
  topCustomers: Array<{ name: string; total: number }>;
};

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

export async function getReportsSummary(): Promise<ReportsSummary> {
  if (isServerOnlyMode()) {
    const now = new Date();
    const weeklySeries: ReportSeriesPoint[] = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      weeklySeries.push({
        label: date.toLocaleDateString("uz-UZ", { weekday: "short" }),
        sales: 0,
        profit: 0,
        expenses: 0,
      });
    }

    return {
      todaySales: 0,
      todayProfit: 0,
      todayExpenses: 0,
      monthSales: 0,
      monthProfit: 0,
      monthExpenses: 0,
      weeklySeries,
      topProducts: [],
      topCustomers: [],
    };
  }

  const supabase = await createClient();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const [todaySalesRes, todayExpensesRes, monthSalesRes, monthExpensesRes, weekSalesRes, topProductsRes, topCustomersRes] = await Promise.all([
    supabase.from("sales").select("total, gross_profit").eq("status", "confirmed").gte("created_at", startOfToday.toISOString()),
    supabase.from("expenses").select("amount").gte("created_at", startOfToday.toISOString()),
    supabase.from("sales").select("total, gross_profit").eq("status", "confirmed").gte("created_at", startOfMonth.toISOString()),
    supabase.from("expenses").select("amount").gte("created_at", startOfMonth.toISOString()),
    supabase.from("sales").select("total, gross_profit, created_at").eq("status", "confirmed").gte("created_at", startOfWeek.toISOString()),
    supabase.from("sale_items").select("quantity, product:products(name)").limit(1000),
    supabase.from("sales").select("total, customer:customers(company_name)").eq("status", "confirmed").limit(1000),
  ]);

  const todaySales = (todaySalesRes.data ?? []).reduce((sum, row) => sum + toNumber(row.total), 0);
  const todayProfit = (todaySalesRes.data ?? []).reduce((sum, row) => sum + toNumber(row.gross_profit), 0);
  const todayExpenses = (todayExpensesRes.data ?? []).reduce((sum, row) => sum + toNumber(row.amount), 0);
  const monthSales = (monthSalesRes.data ?? []).reduce((sum, row) => sum + toNumber(row.total), 0);
  const monthProfit = (monthSalesRes.data ?? []).reduce((sum, row) => sum + toNumber(row.gross_profit), 0);
  const monthExpenses = (monthExpensesRes.data ?? []).reduce((sum, row) => sum + toNumber(row.amount), 0);

  const weekMap = new Map<string, ReportSeriesPoint>();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const label = date.toLocaleDateString("uz-UZ", { weekday: "short" });
    weekMap.set(date.toISOString().slice(0, 10), { label, sales: 0, profit: 0, expenses: 0 });
  }

  for (const row of weekSalesRes.data ?? []) {
    const key = String(row.created_at).slice(0, 10);
    const point = weekMap.get(key);
    if (point) {
      point.sales += toNumber(row.total);
      point.profit += toNumber(row.gross_profit);
    }
  }

  const weeklySeries = Array.from(weekMap.values());

  const productTotals = new Map<string, number>();
  for (const row of topProductsRes.data ?? []) {
    const name = row.product && typeof row.product === "object" ? String((row.product as { name?: string }).name ?? "Товар") : "Товар";
    productTotals.set(name, (productTotals.get(name) ?? 0) + toNumber(row.quantity));
  }

  const customerTotals = new Map<string, number>();
  for (const row of topCustomersRes.data ?? []) {
    const name = row.customer && typeof row.customer === "object" ? String((row.customer as { company_name?: string }).company_name ?? "Мижоз") : "Мижоз";
    customerTotals.set(name, (customerTotals.get(name) ?? 0) + toNumber(row.total));
  }

  return {
    todaySales,
    todayProfit,
    todayExpenses,
    monthSales,
    monthProfit,
    monthExpenses,
    weeklySeries,
    topProducts: Array.from(productTotals.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5),
    topCustomers: Array.from(customerTotals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
  };
}
