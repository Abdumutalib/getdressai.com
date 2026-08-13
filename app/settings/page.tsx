import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";

export default async function SettingsPage() {
  const serverOnlyMode = isServerOnlyMode();
  let setting: {
    company_name: string;
    company_phone: string | null;
    default_currency: string;
    currency_symbol: string;
    timezone: string;
    offline_negative_stock_allowed: boolean;
    setup_completed: boolean;
  } | null = null;

  if (!serverOnlyMode) {
    await requirePermission("settings.manage");
    const supabase = await createClient();

    const { data } = await supabase
      .from("settings")
      .select("company_name, company_phone, default_currency, currency_symbol, timezone, offline_negative_stock_allowed, setup_completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setting = data;
  } else {
    setting = {
      company_name: "AKBEL CRM (Server-Only)",
      company_phone: null,
      default_currency: "UZS",
      currency_symbol: "сўм",
      timezone: "Asia/Tashkent",
      offline_negative_stock_allowed: false,
      setup_completed: true,
    };
  }

  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Созламалар</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Компания параметрлари ва offline сиёсат.</p>
      </section>

      <section className="mt-6 rounded-2xl border border-[#d9cab1] bg-[#fffaf0] p-5 text-sm">
        {!setting ? (
          <p className="text-[#755f46]">Созлама маълумоти топилмади.</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[#7a6248]">Компания</dt>
              <dd className="font-semibold text-[#3e2d1f]">{setting.company_name}</dd>
            </div>
            <div>
              <dt className="text-[#7a6248]">Телефон</dt>
              <dd className="font-semibold text-[#3e2d1f]">{setting.company_phone ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-[#7a6248]">Валюта</dt>
              <dd className="font-semibold text-[#3e2d1f]">{setting.default_currency} ({setting.currency_symbol})</dd>
            </div>
            <div>
              <dt className="text-[#7a6248]">Timezone</dt>
              <dd className="font-semibold text-[#3e2d1f]">{setting.timezone}</dd>
            </div>
            <div>
              <dt className="text-[#7a6248]">Negative stock</dt>
              <dd className="font-semibold text-[#3e2d1f]">{setting.offline_negative_stock_allowed ? "Рухсат" : "Тақиқланган"}</dd>
            </div>
            <div>
              <dt className="text-[#7a6248]">Setup</dt>
              <dd className="font-semibold text-[#3e2d1f]">{setting.setup_completed ? "Якунланган" : "Тўлиқ эмас"}</dd>
            </div>
          </dl>
        )}
      </section>
    </AppShell>
  );
}
