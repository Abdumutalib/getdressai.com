import { PricingCards } from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <main className="section-shell py-20">
      <div className="max-w-2xl space-y-4 pb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Pricing</p>
        <h1 className="section-title">Choose the plan that matches your content velocity.</h1>
        <p className="section-copy">
          Free for first proof. Paid plans for serious creators, teams, and high-frequency wardrobe testing.
        </p>
      </div>
      <PricingCards />
    </main>
  );
}
