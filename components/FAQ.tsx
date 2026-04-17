const faqs = [
  {
    q: "How realistic are the generations?",
    a: "The app is tuned for conversion-grade realism: clean body alignment, sharper outfit boundaries, and prompt-safe upscale delivery."
  },
  {
    q: "Do free images include a watermark?",
    a: "Yes. Free outputs include a Made with GetDressAI watermark to create a built-in viral loop."
  },
  {
    q: "Can I cancel Paddle subscriptions anytime?",
    a: "Yes. Billing portal, upgrade, downgrade, and cancellation are handled through Paddle-backed subscription sync."
  },
  {
    q: "Are uploads private?",
    a: "Uploads use secure buckets, signed URLs, auth-guarded access, and server-side validation before generation."
  }
];

export function FAQ() {
  return (
    <section className="section-shell py-24">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">FAQ</p>
        <h2 className="section-title">Answers that remove buying friction fast.</h2>
      </div>
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <details key={faq.q} className="glass-panel rounded-[2rem] px-6 py-5">
            <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950 dark:text-white">
              {faq.q}
            </summary>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
