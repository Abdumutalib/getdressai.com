"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Amelia Hart",
    role: "UGC Creator",
    quote: "We switched from a generic try-on app and our landing page conversion jumped within the first week."
  },
  {
    name: "Noor Rahman",
    role: "Fashion Founder",
    quote: "GetDressAI feels premium enough to sell at startup prices and fast enough to keep viral momentum."
  },
  {
    name: "Mila Sato",
    role: "TikTok Stylist",
    quote: "The before-and-after output gets posted directly. That watermark loop alone brings us new users daily."
  }
];

export function Testimonials() {
  return (
    <section className="section-shell py-24">
      <div className="mb-10 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Loved by growth teams</p>
        <h2 className="section-title">Social proof that feels specific, human, and believable.</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
            className="glass-panel rounded-[2rem] p-8"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-accentSoft text-lg font-semibold text-accent">
                {item.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{item.role}</p>
              </div>
            </div>
            <p className="text-base leading-8 text-slate-700 dark:text-slate-200">“{item.quote}”</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
