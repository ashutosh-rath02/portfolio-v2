"use client";
import { useEffect } from "react";

export default function UTMTracker() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get("utm_source");
      const utm_campaign = params.get("utm_campaign");
      const utm_medium = params.get("utm_medium");
      const utm_content = params.get("utm_content");
      if (utm_source || utm_campaign || utm_medium || utm_content) {
        fetch(process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL as string, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            utm_source,
            utm_campaign,
            utm_medium,
            utm_content,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
          }),
        });
      }
    }
  }, []);

  return null;
}
