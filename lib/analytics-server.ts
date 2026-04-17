import { PostHog } from "posthog-node";

export function getServerAnalytics() {
  const key = process.env.POSTHOG_PERSONAL_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  if (!key) {
    return null;
  }

  return new PostHog(key, { host });
}
