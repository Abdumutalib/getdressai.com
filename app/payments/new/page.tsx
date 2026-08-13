import { AppShell } from "@/components/layout/app-shell";
import { PaymentForm } from "@/features/transactions/payment-form";

export default function NewPaymentPage() {
  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Янги тўлов</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Мижоз ёки supplier тўловини расмийлаштириш.</p>
      </section>

      <section className="mt-6">
        <PaymentForm />
      </section>
    </AppShell>
  );
}
