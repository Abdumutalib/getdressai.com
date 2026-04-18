"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Ruler, Share2, UploadCloud, Wand2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { trackEvent } from "@/lib/analytics";

type GeneratorMode = "photo" | "mannequin";
type GenderOption = "female" | "male" | "unisex";

type Measurements = {
  height: string;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
};

type GenerateResponse = {
  mode: GeneratorMode;
  gender: GenderOption;
  prompt: string;
  preset: string;
  resultUrl: string;
  summary: string;
  measurements?: Record<string, number> | null;
  watermark: boolean;
  tookMs: number;
};

const defaultMeasurements: Measurements = {
  height: "170",
  chest: "92",
  waist: "74",
  hips: "98",
  inseam: "78"
};

export function UploadGenerator() {
  const { t, tm, language } = useLanguage();
  const presets = tm<string[]>("upload.presets");
  const safePresets = Array.isArray(presets) ? presets : [];
  const [mode, setMode] = useState<GeneratorMode>("photo");
  const [gender, setGender] = useState<GenderOption>("female");
  const [selected, setSelected] = useState(safePresets[0] ?? "Luxury");
  const [prompt, setPrompt] = useState(t("upload.defaultPrompt"));
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [measurements, setMeasurements] = useState<Measurements>(defaultMeasurements);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSelected(safePresets[0] ?? "Luxury");
    setPrompt(t("upload.defaultPrompt"));
  }, [language, safePresets, t]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const measurementFields = useMemo(
    () => [
      { key: "height", label: t("upload.measurementHeight") },
      { key: "chest", label: t("upload.measurementChest") },
      { key: "waist", label: t("upload.measurementWaist") },
      { key: "hips", label: t("upload.measurementHips") },
      { key: "inseam", label: t("upload.measurementInseam") }
    ] as const,
    [t]
  );

  const genderOptions = useMemo(
    () =>
      ([
        { value: "female", label: t("upload.genderFemale") },
        { value: "male", label: t("upload.genderMale") },
        { value: "unisex", label: t("upload.genderUnisex") }
      ] as const),
    [t]
  );

  const mannequinSummary = `${measurements.height}${t("upload.measurementUnit")} • ${measurements.chest}/${measurements.waist}/${measurements.hips}`;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(nextFile.type);
    const maxSize = 10 * 1024 * 1024;

    if (!isValidType || nextFile.size > maxSize) {
      setError(t("upload.formats"));
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(nextFile);
    setPhotoFile(nextFile);
    setPhotoPreview(previewUrl);
    setResult(null);
    setError("");
    trackEvent("upload_started", { mode: "photo", fileType: nextFile.type, size: nextFile.size });
  }

  async function handleGenerate() {
    if (mode === "photo" && !photoFile) {
      setError(t("upload.dropPhoto"));
      return;
    }

    setGenerating(true);
    setProgress(12);
    setError("");
    trackEvent("generation_started", {
      mode,
      preset: selected,
      gender
    });

    try {
      const payload = {
        mode,
        gender,
        prompt,
        preset: selected,
        imagePath: mode === "photo" ? photoFile?.name || "uploaded-photo" : undefined,
        measurements:
          mode === "mannequin"
            ? Object.fromEntries(
                Object.entries(measurements).map(([key, value]) => [key, Number(value)])
              )
            : undefined
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setProgress(68);

      const data = (await response.json()) as GenerateResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : t("upload.generationFailed"));
      }

      setResult(data);
      setProgress(100);
      trackEvent("generation_completed", {
        mode: data.mode,
        preset: data.preset,
        gender: data.gender,
        tookMs: data.tookMs
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("upload.generationFailed"));
      setProgress(0);
    } finally {
      setGenerating(false);
    }
  }

  async function shareResult() {
    if (!result) {
      return;
    }

    trackEvent("referral_shared", {
      source: "generator_result",
      mode: result.mode
    });

    const shareData = {
      title: t("upload.shareTitle"),
      text: t("upload.shareText"),
      url: typeof window !== "undefined" ? window.location.href : ""
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(shareData.url);
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 rounded-[1.5rem] bg-slate-100 p-2 dark:bg-white/5">
          {([
            { value: "photo", label: t("upload.modePhoto") },
            { value: "mannequin", label: t("upload.modeMannequin") }
          ] as const).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === item.value
                  ? "bg-ink text-white shadow-glow"
                  : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{t("upload.genderLabel")}</p>
            <span className="text-xs text-slate-500 dark:text-slate-300">{t("upload.genderHint")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  gender === option.value
                    ? "bg-ink text-white shadow-glow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "photo" ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-white/10 dark:bg-white/5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoPreview ? (
              <div className="space-y-4">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/60">
                  <Image src={photoPreview} alt="Uploaded photo preview" fill className="object-cover" unoptimized />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-950 dark:text-white">{photoFile?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">{t("upload.formats")}</p>
                </div>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                >
                  <UploadCloud className="size-4" />
                  {t("upload.modePhoto")}
                </button>
              </div>
            ) : (
              <button type="button" onClick={openFilePicker} className="block w-full">
                <UploadCloud className="mx-auto size-8 text-slate-500" />
                <p className="mt-4 text-sm font-medium text-slate-950 dark:text-white">{t("upload.dropPhoto")}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("upload.formats")}</p>
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.25rem] bg-white p-4 shadow-soft dark:bg-slate-950/60">
                <div className="flex h-full min-h-56 items-end justify-center rounded-[1rem] bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]">
                  <div className="relative flex h-48 w-28 items-center justify-center">
                    <div className="absolute top-0 size-10 rounded-full border-4 border-slate-300 dark:border-slate-600" />
                    <div className="absolute top-10 h-20 w-16 rounded-t-[2rem] rounded-b-[1rem] border-4 border-slate-300 dark:border-slate-600" />
                    <div className="absolute top-[4.6rem] left-0 h-16 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute top-[4.6rem] right-0 h-16 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute bottom-0 left-[2.2rem] h-20 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute bottom-0 right-[2.2rem] h-20 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute top-[3.8rem] h-24 w-20 rounded-[1.5rem] bg-gradient-to-b from-slate-900 via-slate-700 to-slate-500 opacity-90" />
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{t("upload.mannequinTitle")}</p>
                <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-300">{mannequinSummary}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{t("upload.mannequinTitle")}</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-300">{t("upload.mannequinCopy")}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {measurementFields.map((field) => (
                    <label key={field.key} className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                        {field.label}
                      </span>
                      <div className="flex items-center rounded-[1rem] border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-slate-950/60">
                        <Ruler className="mr-2 size-4 text-slate-400" />
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={measurements[field.key]}
                          onChange={(event) =>
                            setMeasurements((current) => ({
                              ...current,
                              [field.key]: event.target.value
                            }))
                          }
                          className="w-full bg-transparent text-sm outline-none"
                        />
                        <span className="text-xs text-slate-400">{t("upload.measurementUnit")}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs leading-6 text-slate-500 dark:text-slate-300">{t("upload.mannequinHint")}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {safePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setSelected(preset);
                trackEvent("upload_started", { preset, mode });
              }}
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
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-accent dark:border-white/10 dark:bg-white/5"
        />

        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white shadow-glow"
        >
          {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          {generating ? t("upload.generating") : t("upload.generate")}
        </button>
        {generating ? (
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-sky-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-[1.25rem] bg-slate-100 dark:bg-white/5" />
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}

        {result ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{t("upload.resultTitle")}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  {result.mode === "mannequin" ? t("upload.resultModeMannequin") : t("upload.resultModePhoto")}
                </p>
              </div>
              <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
                {result.preset}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-[120px_1fr] md:items-center">
              <div className="relative aspect-square overflow-hidden rounded-[1.25rem] border border-slate-200 dark:border-white/10">
                <Image src={result.resultUrl} alt={result.preset} fill className="object-cover" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {t("upload.genderLabel")}: {t(`upload.genderValue.${result.gender}`)}
                </p>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {result.mode === "mannequin" ? t("upload.resultSummaryMannequin") : t("upload.resultSummaryPhoto")}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{result.tookMs} ms</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={shareResult}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                  >
                    <Share2 className="size-4" />
                    {t("upload.shareButton")}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                  >
                    {t("upload.downloadHd")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
