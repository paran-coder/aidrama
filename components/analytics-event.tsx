"use client";

import { useEffect } from "react";

export function AnalyticsEvent({ name }: { name: string }) {
  useEffect(() => {
    void fetch("/api/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, path: window.location.pathname }), keepalive: true });
  }, [name]);
  return null;
}
