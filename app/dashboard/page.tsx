import Image from "next/image";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatsCards } from "@/components/StatsCards";
import { UploadGenerator } from "@/components/UploadGenerator";

const history = [
  { title: "Wedding couture", date: "2 minutes ago", src: "/examples/wedding.svg" },
  { title: "Celebrity leather set", date: "12 minutes ago", src: "/examples/celebrity.svg" },
  { title: "Office capsule", date: "Yesterday", src: "/examples/office.svg" }
];

export default function DashboardPage() {
  return (
    <main className="section-shell py-16">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Dashboard</p>
            <h1 className="section-title">Generate, monitor credits, and turn results into repeat usage.</h1>
          </div>

          <StatsCards />

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <UploadGenerator />
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Recent results</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Download HD on paid plans</p>
                </div>
                <span className="rounded-full bg-accentSoft px-4 py-2 text-xs font-semibold text-accent">3 of 28 credits used</span>
              </div>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.title} className="flex gap-4 rounded-[1.5rem] border border-slate-200 p-4 dark:border-white/10">
                    <div className="relative size-24 overflow-hidden rounded-[1.2rem]">
                      <Image src={item.src} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.date}</p>
                      </div>
                      <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
