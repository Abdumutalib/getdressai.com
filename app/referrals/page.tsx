export default function ReferralsPage() {
  return (
    <main className="section-shell py-20">
      <div className="max-w-4xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Referrals</p>
        <h1 className="section-title">Build a compounding credit loop.</h1>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "+2 credits", note: "Friend joins through your link" },
            { title: "+5 credits", note: "Friend completes first purchase" },
            { title: "18.7%", note: "Average invite-to-signup conversion" }
          ].map((item) => (
            <div key={item.title} className="glass-panel rounded-[2rem] p-6">
              <p className="text-3xl font-semibold text-slate-950 dark:text-white">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
