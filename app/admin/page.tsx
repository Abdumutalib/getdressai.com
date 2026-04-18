import { requireAdmin } from "@/lib/auth";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  await requireAdmin();
  return <AdminClient />;
}
