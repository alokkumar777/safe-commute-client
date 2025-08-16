import http from "./api/http";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) throw new Error("SW not supported");
  const reg = await navigator.serviceWorker.register("/sw.js");
  return reg;
}

export async function subscribePush(reg) {
  if (!("PushManager" in window)) throw new Error("Push not supported");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Permission denied");

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC
    ),
  });

  await http.post("/push/subscribe", sub.toJSON());
  return sub;
}

export async function unsubscribePush(reg) {
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;
  await http.post("/push/unsubscribe", { endpoint: sub.endpoint });
  await sub.unsubscribe();
  return true;
}
