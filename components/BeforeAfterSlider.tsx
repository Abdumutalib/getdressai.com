"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
};

export function BeforeAfterSlider({ beforeSrc, afterSrc }: Props) {
  const [position, setPosition] = useState(58);

  return (
    <div className="glass-panel relative overflow-hidden rounded-[2rem] border">
      <div className="relative aspect-[4/3]">
        <Image src={beforeSrc} alt="Before outfit transformation" fill className="object-cover" priority />
        <motion.div
          className="absolute inset-y-0 right-0 overflow-hidden"
          animate={{ width: `${100 - position}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 25 }}
        >
          <div className="relative h-full w-[calc(100vw)] max-w-none">
            <Image src={afterSrc} alt="After outfit transformation" fill className="object-cover" priority />
          </div>
        </motion.div>

        <div className="absolute inset-y-0 z-10" style={{ left: `${position}%` }}>
          <div className="h-full w-px bg-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" />
          <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-xs font-semibold text-slate-900 shadow-soft backdrop-blur">
            Drag
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
