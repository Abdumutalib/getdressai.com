"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";

export function Testimonials() {
  const { t, tm } = useLanguage();
  const testimonials = tm<{ name: string; role: string; quote: string }[]>("testimonials.items");
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];

  return (
    <section className="section-shell py-24">
      <div className="mb-10 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("testimonials.eyebrow")}</p>
        <h2 className="section-title">{t("testimonials.title")}</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {safeTestimonials.map((item, index) => (
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
            <p className="text-base leading-8 text-slate-700 dark:text-slate-200">"{item.quote}"</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
