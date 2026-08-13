"use client";

import { create } from "zustand";
import { OFFLINE_STATUS, OfflineStatus } from "@/lib/constants";

const IS_SERVER_ONLY_MODE =
  process.env.NEXT_PUBLIC_APP_MODE === "server_only" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type NetworkState = {
  status: OfflineStatus;
  pendingCount: number;
  setStatus: (status: OfflineStatus) => void;
  setPendingCount: (count: number) => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  status: IS_SERVER_ONLY_MODE
    ? OFFLINE_STATUS.OFFLINE
    : typeof navigator === "undefined" || navigator.onLine
      ? OFFLINE_STATUS.ONLINE
      : OFFLINE_STATUS.OFFLINE,
  pendingCount: 0,
  setStatus: (status) => set({ status }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
}));
