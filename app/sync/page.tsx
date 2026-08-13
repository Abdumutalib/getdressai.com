import { AppShell } from "@/components/layout/app-shell";
import { SyncPageClient } from "@/features/sync/sync-page-client";

export default function SyncPage() {
  return (
    <AppShell>
      <SyncPageClient />
    </AppShell>
  );
}
