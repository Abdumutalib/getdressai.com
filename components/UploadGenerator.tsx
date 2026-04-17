"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, UploadCloud, Wand2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function UploadGenerator() {
  const { t, tm, language } = useLanguage();
  const presets = tm<string[]>("upload.presets");
  const [selected, setSelected] = useState(presets[0] ?? "Luxury");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setSelected(presets[0] ?? "Luxury");
  }, [language, presets]);

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
          <UploadCloud className="mx-auto size-8 text-slate-500" />
          <p className="mt-4 text-sm font-medium text-slate-950 dark:text-white">{t("upload.dropPhoto")}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("upload.formats")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSelected(preset)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selected === preset
                  ? "bg-ink text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <textarea
          rows={4}
          key={language}
          defaultValue={t("upload.defaultPrompt")}
          className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-accent dark:border-white/10 dark:bg-white/5"
        />
        <button
          type="button"
          onClick={() => {
            setGenerating(true);
            setTimeout(() => setGenerating(false), 1400);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white shadow-glow"
        >
          {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          {generating ? t("upload.generating") : t("upload.generate")}
        </button>
      </div>
    </div>
  );
}
