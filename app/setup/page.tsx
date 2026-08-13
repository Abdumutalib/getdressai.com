export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#f9e8d0_0,#efe9dd_40%,#e6dfcf_100%)] p-6">
      <div className="mx-auto flex min-h-[90vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-[#d6c8af] bg-[#fffaf0]/90 p-8 shadow-[0_20px_70px_-35px_rgba(80,45,10,0.45)] backdrop-blur">
          <h1 className="text-3xl font-black tracking-wide text-[#5b3f25]">AKBEL CRM Setup</h1>
          <p className="mt-2 text-sm text-[#6a5b47]">
            Тизим ишлаши учун Supabase муҳит ўзгарувчилари тўлдирилмаган. Шунинг учун экран бўш ёки хато бўлиб кўринган.
          </p>

          <div className="mt-6 rounded-2xl border border-[#e6d8bf] bg-[#f8efde] p-4 text-sm text-[#4b3d2d]">
            <p className="font-semibold">Керакли қадамлар:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Лойиҳа ичида .env.local файл очинг.</li>
              <li>NEXT_PUBLIC_SUPABASE_URL ни тўлдиринг.</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY ни тўлдиринг.</li>
              <li>Ихтиёрий: SUPABASE_SERVICE_ROLE_KEY ни API интеграциялар учун қўшинг.</li>
              <li>Dev server’ни қайта ишга туширинг.</li>
            </ol>
          </div>

          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#2e261f] p-4 text-xs text-[#f7ead5]">
{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY`}
          </pre>

          <p className="mt-4 text-xs text-[#6a5b47]">Supabase Dashboard → Project Settings → API</p>
        </div>
      </div>
    </div>
  );
}
