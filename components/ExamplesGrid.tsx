"use client";

import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";
import { getPresetMarketingImage } from "@/lib/marketing-images";

const examples = ["luxury", "streetwear", "wedding", "office", "gym", "anime", "celebrity", "casual"];

export function ExamplesGrid() {
  const { t, tm } = useLanguage();
  const labels = tm<string[]>("upload.presets");
  const safeLabels = Array.isArray(labels) ? labels : [];
  const rowOne = examples.slice(0, 5);
  const rowTwo = examples.slice(3);

  return (
    <section className="overflow-hidden bg-white py-24" id="examples">
      <div className="section-shell mb-12 flex items-end justify-between gap-6">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-700">{t("examples.eyebrow")}</p>
          <h2 className="section-title">{t("examples.title")}</h2>
        </div>
      </div>
      <div className="space-y-6">
        <div className="relative flex overflow-hidden">
          <div className="marquee-track flex min-w-max gap-4 pe-4">
            {[...rowOne, ...rowOne].map((example, index) => (
              <div key={`${example}-${index}`} className="w-64 shrink-0 overflow-hidden rounded-[1.5rem] shadow-md">
                <div className="relative aspect-[4/5]">
                  <Image src={getPresetMarketingImage(example)} alt={`${example} AI outfit example`} fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex overflow-hidden">
          <div className="marquee-track-reverse flex min-w-max gap-4 pe-4">
            {[...rowTwo, ...rowTwo].map((example, index) => (
              <div key={`${example}-reverse-${index}`} className="w-64 shrink-0 overflow-hidden rounded-[1.5rem] shadow-md">
                <div className="relative aspect-[4/5]">
                  <Image src={getPresetMarketingImage(example)} alt={`${example} AI outfit example`} fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
