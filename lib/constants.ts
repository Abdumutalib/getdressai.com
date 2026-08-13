export const APP_NAME = "AKBEL CRM";
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "2.0.0";

export const DEFAULT_CURRENCY = "UZS";
export const DEFAULT_CURRENCY_SYMBOL = "сўм";

export const OFFLINE_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
  SYNCING: "syncing",
} as const;

export type OfflineStatus = (typeof OFFLINE_STATUS)[keyof typeof OFFLINE_STATUS];

export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
] as const;

export const DELIVERY_STATUSES = [
  "ready",
  "on_way",
  "delivered",
  "not_received",
  "cancelled",
] as const;

export const PAYMENT_METHODS = ["Нақд", "Карта", "Банк", "Click", "Payme", "Бошқа"] as const;
