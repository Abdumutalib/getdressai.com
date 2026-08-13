import { AppShell } from "@/components/layout/app-shell";
import { ProductsPageClient } from "@/features/products/products-page-client";

export default function ProductsPage() {
  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Товарлар</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Товарларни қўшиш, излаш ва бошқариш.</p>
      </section>

      <section className="mt-6">
        <ProductsPageClient />
      </section>
    </AppShell>
  );
}
