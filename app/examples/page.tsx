import { ExamplesGrid } from "@/components/ExamplesGrid";

export default function ExamplesPage() {
  return (
    <main className="py-20">
      <div className="section-shell max-w-3xl space-y-4 pb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Examples</p>
        <h1 className="section-title">Explore transformations that feel premium enough to convert and viral enough to share.</h1>
      </div>
      <ExamplesGrid />
    </main>
  );
}
