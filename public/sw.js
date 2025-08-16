/* global self, clients */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "Safe Commute", body: "Alert" };
  }

  const title = data.title || "Safe Commute";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png", // optional: place icons in /public
    badge: "/badge.png",
    data: { url: data.url || "/", extra: data },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus if a tab already open
        for (const client of clientList) {
          if (client.url.includes(location.origin) && "focus" in client)
            return client.focus();
        }
        // Else open a new tab
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
