import { AppShell } from "@/components/layout/app-shell";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";

export default async function EmployeesPage() {
  const serverOnlyMode = isServerOnlyMode();
  let employees: Array<{
    id: string;
    full_name: string;
    username: string;
    phone: string | null;
    email: string | null;
    active: boolean;
    created_at: string;
    user_roles: Array<{ role_id: string; roles: Array<{ code: string; name_uz: string }> | null }>;
  }> = [];

  if (!serverOnlyMode) {
    await requirePermission("employees.view");
    const supabase = await createClient();

    const { data } = await supabase
      .from("users")
      .select("id, full_name, username, phone, email, active, created_at, user_roles(role_id, roles(code, name_uz))")
      .order("created_at", { ascending: false })
      .limit(40);

    employees = (data ?? []) as typeof employees;
  }

  return (
    <AppShell>
      <section>
        <h1 className="text-3xl font-black text-[#3e2d1f]">Ходимлар</h1>
        <p className="mt-2 text-sm text-[#6d5a45]">Фойдаланувчилар, роллар ва фаоллик назорати.</p>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[#d9cab1] bg-[#fffaf0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f4e7d1] text-left text-[#5f4a33]">
            <tr>
              <th className="px-4 py-3">ФИШ</th>
              <th className="px-4 py-3">Логин</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Роллар</th>
              <th className="px-4 py-3">Ҳолат</th>
            </tr>
          </thead>
          <tbody>
            {(employees ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[#ebdfcb]">
                <td className="px-4 py-3 font-semibold">{row.full_name}</td>
                <td className="px-4 py-3">{row.username}</td>
                <td className="px-4 py-3">{row.phone ?? "-"}</td>
                <td className="px-4 py-3">
                  {row.user_roles
                    ?.flatMap((ur) => ur.roles ?? [])
                    .map((role) => role.name_uz ?? role.code)
                    .filter(Boolean)
                    .join(", ") || "-"}
                </td>
                <td className="px-4 py-3">{row.active ? "Фаол" : "Нофаол"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(employees ?? []).length === 0 && <p className="p-4 text-sm text-[#755f46]">Ҳозирча ходимлар йўқ.</p>}
      </section>
    </AppShell>
  );
}
