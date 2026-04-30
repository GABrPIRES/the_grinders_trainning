"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";

export type PushStatus = "unsupported" | "loading" | "denied" | "active" | "inactive";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const getPushReg = useCallback(async (): Promise<ServiceWorkerRegistration> => {
    // Usa sempre o push-sw.js dedicado — sem dependências de build, ativa em ms
    const reg = await navigator.serviceWorker.register("/push-sw.js");

    if (reg.active) return reg;

    // Aguarda ativação (skipWaiting + claim no push-sw.js — muito rápido)
    return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Push SW não ativou.")), 8_000);
      const finish = () => { clearTimeout(timer); resolve(reg); };
      const sw = reg.installing ?? reg.waiting;
      if (sw) {
        sw.addEventListener("statechange", function onState() {
          if (this.state === "activated") { sw.removeEventListener("statechange", onState); finish(); }
        });
      } else {
        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing!;
          newSW.addEventListener("statechange", function onState() {
            if (this.state === "activated") { newSW.removeEventListener("statechange", onState); finish(); }
          });
        });
      }
    });
  }, []);

  const checkStatus = useCallback(async () => {
    if (!("PushManager" in window) || !("serviceWorker" in navigator) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register("/push-sw.js");
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setSubscription(existing);
        setStatus("active");
      } else {
        setStatus(Notification.permission === "denied" ? "denied" : "inactive");
      }
    } catch {
      setStatus(Notification.permission === "denied" ? "denied" : "inactive");
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const subscribe = useCallback(async () => {
    const { vapid_public_key } = await fetchWithAuth("push_subscriptions/vapid_public_key");

    const reg = await getPushReg();

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(vapid_public_key),
    });

    const subJson = sub.toJSON();
    await fetchWithAuth("push_subscriptions", {
      method: "POST",
      body: JSON.stringify({
        subscription: {
          endpoint: subJson.endpoint,
          p256dh:   subJson.keys?.p256dh,
          auth:     subJson.keys?.auth,
        },
      }),
    });
    setSubscription(sub);
    setStatus("active");
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    await fetchWithAuth("push_subscriptions", {
      method: "DELETE",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
    setSubscription(null);
    setStatus("inactive");
  }, [subscription]);

  return { status, subscribe, unsubscribe };
}
