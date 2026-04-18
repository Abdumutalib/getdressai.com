"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  beforeSrc: string;
  afterSrc: string;
};

export function BeforeAfterSlider({ beforeSrc, afterSrc }: Props) {
  const { t } = useLanguage();
  const [position, setPosition] = useState(58);

  return (
    <div className="glass-panel premium-ring relative overflow-hidden rounded-[2rem] border">
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900">
        <Image src={beforeSrc} alt="19 y.o. model before" fill className="object-cover" priority />

        <div className="absolute inset-y-0 right-0 overflow-hidden" style={{ width: `${100 - position}%` }}>
          <div className="relative h-full w-[calc(100vw)] max-w-none">
            <Image
              src={afterSrc}
              alt="19 y.o. model after AI transformation"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <div className="rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {t("slider.before")}
          </div>
          <div className="rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-950 backdrop-blur">
            {t("slider.after")}
          </div>
        </div>

        <div className="absolute inset-y-0 z-10" style={{ left: `${position}%` }}>
          <div className="h-full w-px bg-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" />
          <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-xs font-semibold text-slate-900 shadow-soft backdrop-blur">
            {t("slider.drag")}
          </div>
        </div>

        <input
          type="range"
          min={8}
          max={92}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="absolute inset-x-6 bottom-6 z-20 accent-accent"
          aria-label="Before after slider"
        />
      </div>
    </div>
  );
}
