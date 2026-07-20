"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function PushOptInButton() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(ok);
    if (!ok) return;
    void navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setEnabled(Boolean(sub));
    });
  }, []);

  if (!supported) return null;

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      const keyRes = await fetch("/api/driver/push/vapid");
      const keyData = (await keyRes.json()) as { publicKey?: string; configured?: boolean };
      if (!keyData.publicKey) {
        setMessage("Push not configured yet (add VAPID keys).");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notification permission denied.");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });
      const json = sub.toJSON();
      await fetch("/api/driver/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      setEnabled(true);
      setMessage("Push alerts on.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to enable push.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/driver/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEnabled(false);
      setMessage("Push alerts off.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        disabled={busy}
        onClick={() => void (enabled ? disable() : enable())}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #e4dfd5",
          background: "#fff",
          fontFamily: "var(--font-hanken), system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "#1b231e",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : enabled ? <BellOff size={14} /> : <Bell size={14} />}
        {enabled ? "Disable push alerts" : "Enable push alerts"}
      </button>
      {message ? (
        <p style={{ marginTop: 8, fontSize: 12, color: "#6e746b", textAlign: "center" }}>{message}</p>
      ) : null}
    </div>
  );
}
