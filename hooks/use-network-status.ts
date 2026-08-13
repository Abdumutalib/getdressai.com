"use client";

import { useEffect } from "react";
import { OFFLINE_STATUS } from "@/lib/constants";
import { useNetworkStore } from "@/stores/network-store";

const IS_SERVER_ONLY_MODE =
  process.env.NEXT_PUBLIC_APP_MODE === "server_only" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function useNetworkStatus() {
  const { status, setStatus } = useNetworkStore();

  useEffect(() => {
    if (IS_SERVER_ONLY_MODE) {
      setStatus(OFFLINE_STATUS.OFFLINE);
      return;
    }

    const onOnline = () => setStatus(OFFLINE_STATUS.ONLINE);
    const onOffline = () => setStatus(OFFLINE_STATUS.OFFLINE);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [setStatus]);

  return status;
}
