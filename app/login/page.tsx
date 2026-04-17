export default function LoginPage() {
  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-md glass-panel rounded-[2rem] p-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Login</p>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Sign in to GetDressAI</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Supabase Auth powers secure email and magic-link access for dashboard, billing, and referrals.
          </p>
        </div>
        <form className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
          />
          <button type="submit" className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
