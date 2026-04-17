import posthog from "posthog-js";

export type AnalyticsEvent =
  | "cta_clicked"
  | "view_examples_clicked"
  | "upload_started"
  | "generation_started"
  | "generation_completed"
  | "checkout_opened"
  | "purchase_completed"
  | "referral_shared"
  | "exit_discount_shown"
  | "dropoff_detected";

export function initAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  const client = posthog as typeof posthog & { __loaded?: boolean };

  if (typeof window !== "undefined" && key && !client.__loaded) {
    client.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true
    });
  }

  return client;
}

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const client = initAnalytics();
  if (client && typeof client.capture === "function") {
    client.capture(event, properties);
  }
}
