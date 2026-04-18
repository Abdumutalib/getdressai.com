"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function ExitIntentOffer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let shown = false;

    const onMouseLeave = (event: MouseEvent) => {
      if (shown || event.clientY > 24) {
        return;
      }
      shown = true;
      setOpen(true);
      trackEvent("exit_discount_shown", { trigger: "mouseleave" });
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/50 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Limited offer</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Wait! Get 30% Off Today</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Unlock the founder discount before you leave. Keep your credits, faster queue, and HD downloads.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
            aria-label="Close offer"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/pricing"
            onClick={() => trackEvent("checkout_opened", { source: "exit_offer" })}
            className="btn-primary inline-flex flex-1 items-center justify-center rounded-full px-5 py-4 text-sm font-semibold"
          >
            Claim 30% Discount
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
