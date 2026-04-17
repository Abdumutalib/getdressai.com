"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App runtime error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-slate-950">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">GetDressAI</p>
        <h1 className="mt-4 text-3xl font-semibold">The page hit a runtime error.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          We switched to a safe fallback so the site stays reachable. Try reloading this page or open the login page
          directly.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Reload page
          </button>
          <Link
            href="/login"
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900"
          >
            Open login
          </Link>
        </div>
      </div>
    </main>
  );
}
