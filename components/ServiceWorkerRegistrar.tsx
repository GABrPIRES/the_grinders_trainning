"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("[SW] Falha ao registrar service worker:", err);
      });
    }
  }, []);

  return null;
}
