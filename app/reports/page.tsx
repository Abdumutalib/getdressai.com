import { AppShell } from "@/components/layout/app-shell";
import { ReportsOverview } from "@/features/reports/reports-overview";
import { getReportsSummary } from "@/lib/reports";

export default async function ReportsPage() {
  const summary = await getReportsSummary();

  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Ҳисоботлар</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Кунлик, ҳафталик ва ойлик бизнес аналитикаси.</p>
      </section>

      <section className="mt-6">
        <ReportsOverview summary={summary} />
      </section>
    </AppShell>
  );
}
