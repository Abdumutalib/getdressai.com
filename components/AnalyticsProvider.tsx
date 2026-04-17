"use client";

import { useEffect } from "react";
import { initAnalytics, trackEvent } from "@/lib/analytics";

export function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics();

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        trackEvent("dropoff_detected", {
          path: window.location.pathname
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
