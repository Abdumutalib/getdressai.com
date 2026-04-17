type PostHogClient = {
  init: (key: string, options: Record<string, unknown>) => void;
  capture?: (event: string, properties?: Record<string, unknown>) => void;
  __loaded?: boolean;
};

let browserClient: PostHogClient | null = null;
let initPromise: Promise<PostHogClient | null> | null = null;

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

export async function initAnalytics() {
  if (typeof window === "undefined") {
    return null;
  }

  if (browserClient?.__loaded) {
    return browserClient;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

      if (!key) {
        return null;
      }

      const module = await import("posthog-js");
      const client = module.default as PostHogClient;

      if (!client.__loaded) {
        client.init(key, {
          api_host: host,
          capture_pageview: true,
          capture_pageleave: true
        });
        client.__loaded = true;
      }

      browserClient = client;
      return client;
    } catch {
      browserClient = null;
      return null;
    }
  })();

  return initPromise;
}

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") {
      return;
    }

    if (browserClient?.capture) {
      browserClient.capture(event, properties);
      return;
    }

    void initAnalytics().then((client) => {
      client?.capture?.(event, properties);
    });
  } catch {
    return;
  }
}
