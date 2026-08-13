import { AppShell } from "@/components/layout/app-shell";
import { ExpenseForm } from "@/features/transactions/expense-form";

export default function NewExpensePage() {
  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Янги харажат</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Ижара, ёқилғи, реклама ва бошқа харажатлар.</p>
      </section>

      <section className="mt-6">
        <ExpenseForm />
      </section>
    </AppShell>
  );
}
