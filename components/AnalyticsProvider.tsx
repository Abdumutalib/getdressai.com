"use client";

import { useEffect } from "react";
import { initAnalytics, trackEvent } from "@/lib/analytics";

export function AnalyticsProvider() {
  useEffect(() => {
    try {
      initAnalytics();
    } catch {
      return;
    }

    const handleVisibility = () => {
      try {
        if (document.visibilityState === "hidden") {
          trackEvent("dropoff_detected", {
            path: window.location.pathname
          });
        }
      } catch {
        return;
      }
    };

    try {
      document.addEventListener("visibilitychange", handleVisibility);
    } catch {
      return;
    }

    return () => {
      try {
        document.removeEventListener("visibilitychange", handleVisibility);
      } catch {
        return;
      }
    };
  }, []);

  return null;
}
