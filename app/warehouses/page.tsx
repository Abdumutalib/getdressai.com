import { AppShell } from "@/components/layout/app-shell";
import { WarehousesPageClient } from "@/features/warehouses/warehouses-page-client";

export default function WarehousesPage() {
  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Омбор</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Омборлар ва қолдиқлар бошқаруви.</p>
      </section>

      <section className="mt-6">
        <WarehousesPageClient />
      </section>
    </AppShell>
  );
}
