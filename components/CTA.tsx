import Link from "next/link";

export function CTA() {
  return (
    <section className="section-shell py-24">
      <div className="overflow-hidden rounded-[2.25rem] bg-ink px-8 py-14 text-white shadow-glow sm:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Final CTA</p>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Try your next viral outfit before someone else captures the trend.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-white/70">
              Free preview, instant sharing, premium upgrades, and referral credits all wired into one premium stack.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950"
            >
              Try Free Now
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-white"
            >
              Unlock 30% today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
