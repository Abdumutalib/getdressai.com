import Link from "next/link";
import { Hero } from "@/components/Hero";
import { TrustBadges } from "@/components/TrustBadges";
import { HowItWorks } from "@/components/HowItWorks";
import { ExamplesGrid } from "@/components/ExamplesGrid";
import { Testimonials } from "@/components/Testimonials";
import { PricingCards } from "@/components/PricingCards";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";

function WhyUs() {
  const rows = [
    ["Realistic outputs", "High-fidelity body-aware transformations", "Template-heavy outputs"],
    ["Growth loop", "Watermark + referral credits + exit offer", "No built-in viral acquisition"],
    ["Billing stack", "Paddle subscriptions and credit packs", "One-dimensional paywall"],
    ["Retention", "Email flows, low-credit warnings, winback triggers", "Weak lifecycle hooks"]
  ];

  return (
    <section className="section-shell py-24">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Why us</p>
        <h2 className="section-title">A premium AI SaaS stack built to outperform low-trust try-on tools.</h2>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-soft dark:border-white/10">
        <table className="w-full border-collapse bg-white text-left text-sm dark:bg-slate-950">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">GetDressAI</th>
              <th className="px-6 py-4 font-semibold">Typical competitor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-slate-100 last:border-none dark:border-white/5">
                {row.map((cell) => (
                  <td key={cell} className="px-6 py-5 text-slate-600 dark:text-slate-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReferralLoop() {
  return (
    <section className="section-shell py-24">
      <div className="glass-panel grid gap-8 rounded-[2.25rem] p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Referral loop</p>
          <h2 className="section-title">Invite friends. Earn credits. Turn free users into a growth engine.</h2>
          <p className="section-copy">
            Refer a friend and get +2 credits when they join, +5 credits when they buy. Combine that with shareable watermarked outputs and an exit pop-up that unlocks 30% off today.
          </p>
        </div>
        <div className="grid gap-4">
          {[
            "Free outputs include a shareable watermark",
            "Invite accepted = +2 credits",
            "First purchase = +5 credits",
            "Abandoned checkout email flow recovers lost revenue"
          ].map((item) => (
            <div key={item} className="rounded-[1.5rem] bg-white p-5 shadow-soft dark:bg-white/5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBadges />
      <HowItWorks />
      <ExamplesGrid />
      <WhyUs />
      <Testimonials />
      <PricingCards />
      <ReferralLoop />
      <FAQ />
      <CTA />
      <section className="section-shell pb-24">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-8 py-10 text-center dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Urgency trigger</p>
          <h3 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
            Wait! Get 30% Off Today
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            Limited-time founder offer for creators who activate within this session.
          </p>
          <div className="mt-6">
            <Link href="/pricing" className="inline-flex rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white">
              Unlock Discount
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
