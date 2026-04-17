import { Camera, Layers3, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Upload photo",
    copy: "Drop a clear front-facing image. We secure it with signed URLs and private storage policies.",
    icon: Camera
  },
  {
    title: "Choose style",
    copy: "Use premium presets like luxury, wedding, gym, office, anime, or write your own prompt.",
    icon: Layers3
  },
  {
    title: "Generate result",
    copy: "Get a studio-grade AI transformation, watermark for free users, and HD downloads for paid plans.",
    icon: Sparkles
  }
];

export function HowItWorks() {
  return (
    <section className="section-shell py-24" id="how-it-works">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">How it works</p>
        <h2 className="section-title">From upload to premium shareable result in three fast steps.</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="glass-panel rounded-[2rem] p-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accentSoft text-accent">
                  <Icon className="size-5" />
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-semibold text-slate-950 dark:text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.copy}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
