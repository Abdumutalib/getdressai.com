import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";

export default async function NewOrderPage() {
  await requirePermission("orders.create");

  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Янги буюртма канали</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">
          Буюртма киритиш Telegram/API каналлари орқали автомат қабул қилинади. Оператор учун қўлда киритиш пайплайни ҳам шу ердан бошқарилади.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#d9cab1] bg-[#fffaf0] p-5">
          <h2 className="text-lg font-bold text-[#3e2d1f]">Telegram интеграция</h2>
          <p className="mt-2 text-sm text-[#6d5a45]">Бот орқали келган буюртмалар автомат парсингдан ўтади.</p>
          <div className="mt-4 rounded-xl bg-[#f6eddc] p-3 text-xs text-[#6b543b]">POST /api/telegram/order endpoint тайёр.</div>
        </article>

        <article className="rounded-2xl border border-[#d9cab1] bg-[#fffaf0] p-5">
          <h2 className="text-lg font-bold text-[#3e2d1f]">Оператор ҳаракати</h2>
          <p className="mt-2 text-sm text-[#6d5a45]">Мавжуд буюртмаларни текшириш, тасдиқлаш ва delivery’га узатиш.</p>
          <Link href="/orders" className="mt-4 inline-block rounded-xl bg-[#6b4f33] px-4 py-2 text-sm font-semibold text-white">Буюртмалар рўйхатига ўтиш</Link>
        </article>
      </section>
    </AppShell>
  );
}
