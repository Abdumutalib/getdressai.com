import Image from "next/image";

const examples = [
  "luxury",
  "streetwear",
  "wedding",
  "office",
  "gym",
  "anime",
  "celebrity",
  "casual"
];

export function ExamplesGrid() {
  return (
    <section className="section-shell py-24" id="examples">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Examples</p>
          <h2 className="section-title">High-intent looks designed to trigger curiosity, screenshots, and shares.</h2>
        </div>
      </div>
      <div className="columns-1 gap-4 md:columns-2 xl:columns-4">
        {examples.map((example, index) => (
          <div
            key={example}
            className="glass-panel mb-4 break-inside-avoid overflow-hidden rounded-[2rem] p-3"
          >
            <div className={`relative overflow-hidden rounded-[1.5rem] ${index % 3 === 0 ? "aspect-[4/5]" : "aspect-square"}`}>
              <Image
                src={`/examples/${example}.svg`}
                alt={`${example} AI outfit example`}
                fill
                className="object-cover"
              />
            </div>
            <div className="px-2 pb-2 pt-4">
              <p className="text-lg font-semibold capitalize text-slate-950 dark:text-white">{example}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Viral-ready transformation preset for {example} moments.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
