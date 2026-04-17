import posthog from "posthog-js";
import { PostHog } from "posthog-node";

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

export function getServerAnalytics() {
  const key = process.env.POSTHOG_PERSONAL_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  if (!key) {
    return null;
  }

  return new PostHog(key, { host });
}
