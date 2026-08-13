import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";

export type DashboardStats = {
  todaySales: number;
  todayProfit: number;
  todayDebtSales: number;
  todayExpenses: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isServerOnlyMode()) {
    return {
      todaySales: 0,
      todayProfit: 0,
      todayDebtSales: 0,
      todayExpenses: 0,
    };
  }

  const supabase = await createClient();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startISO = start.toISOString();

  const [salesRes, expensesRes] = await Promise.all([
    supabase
      .from("sales")
      .select("total, gross_profit, debt_amount")
      .eq("status", "confirmed")
      .gte("created_at", startISO),
    supabase.from("expenses").select("amount").gte("created_at", startISO),
  ]);

  const sales = salesRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const todaySales = sales.reduce((sum, x) => sum + Number(x.total ?? 0), 0);
  const todayProfit = sales.reduce((sum, x) => sum + Number(x.gross_profit ?? 0), 0);
  const todayDebtSales = sales.reduce((sum, x) => sum + Number(x.debt_amount ?? 0), 0);
  const todayExpenses = expenses.reduce((sum, x) => sum + Number(x.amount ?? 0), 0);

  return {
    todaySales,
    todayProfit,
    todayDebtSales,
    todayExpenses,
  };
}
