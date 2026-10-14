"use client";

import { deletePushSubscriptionAction, savePushSubscriptionAction } from "@/app/(app)/notifications/_actions";

export type PushState = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration("/")) ?? null;
}

/** Current push state for this device, without prompting. */
export async function readPushState(): Promise<PushState> {
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !!VAPID_PUBLIC;
  if (!supported) return isIos() && !isStandalone() ? "ios-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub && Notification.permission === "granted") {
    // keep the server copy fresh (keys can rotate, account may have changed)
    void savePushSubscriptionAction(sub.toJSON(), navigator.userAgent);
    return "on";
  }
  return "off";
}

/** Asks for permission (must run from a tap) and saves the subscription. */
export async function enablePush(): Promise<PushState> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";
  const reg = (await registration()) ?? (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC) }));
  const res = await savePushSubscriptionAction(sub.toJSON(), navigator.userAgent);
  if (!res.ok) throw new Error("save_failed");
  return "on";
}

/** Stops pushes to this device (also used on sign-out). Never throws. */
export async function disablePush(): Promise<PushState> {
  try {
    const sub = await (await registration())?.pushManager.getSubscription();
    if (sub) {
      await deletePushSubscriptionAction(sub.endpoint);
      await sub.unsubscribe();
    }
  } catch {
    /* best effort */
  }
  return "off";
}
