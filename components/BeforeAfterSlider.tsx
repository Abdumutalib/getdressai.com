"use client";

import Image from "next/image";
import { memo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  beforeSrc: string;
  afterSrc: string;
};

export const BeforeAfterSlider = memo(function BeforeAfterSlider({ beforeSrc, afterSrc }: Props) {
  const { t } = useLanguage();
  const [position, setPosition] = useState(50);

  return (
    <div className="marketing-card relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-slate-100 dark:bg-slate-900">
        <Image
          src={beforeSrc}
          alt="19 y.o. model before"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 48vw"
        />

        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <Image
            src={afterSrc}
            alt="19 y.o. model after AI transformation"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 48vw"
          />
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <div className="rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            Original
          </div>
          <div className="rounded-full bg-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-fuchsia-500/25">
            AI Generated
          </div>
        </div>

        <div className="absolute inset-y-0 z-10" style={{ left: `${position}%` }}>
          <div className="h-full w-1 rounded-full bg-white/90 shadow-[0_0_14px_rgba(255,255,255,0.45)]" />
          <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-xs font-semibold text-fuchsia-700 shadow-xl">
            {t("slider.drag")}
          </div>
        </div>

        <input
          type="range"
          min={8}
          max={92}
          value={position}
          onInput={(event) => setPosition(Number((event.target as HTMLInputElement).value))}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="absolute inset-x-6 bottom-6 z-20 accent-fuchsia-600"
          aria-label="Before after slider"
        />
      </div>
    </div>
  );
});
