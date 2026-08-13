import { AppShell } from "@/components/layout/app-shell";

export function ModulePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">{title}</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">{description}</p>
      </section>

      <section className="mt-6 rounded-2xl border border-[#d9cab1] bg-[#fffaf0] p-5 text-sm text-[#6f5b42]">
        Ушбу модулнинг кейинги бизнес логикаси ва offline-sync workflow босқичма-босқич қўшилмоқда.
      </section>
    </AppShell>
  );
}
