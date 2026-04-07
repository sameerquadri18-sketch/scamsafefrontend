// ScamSafe Service Worker v2 - Network-first strategy
// This version clears all old caches on install to fix stale bundle issues

const CACHE_NAME = 'scamsafe-v2';

// Install: skip waiting and clear ALL old caches
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: claim clients immediately and purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          console.log('Deleting cache:', name);
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first — never serve stale HTML or JS from cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always go to network for navigation (HTML) and JS/CSS assets
  if (event.request.mode === 'navigate' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Only fall back to cache if network fails
        return caches.match(event.request);
      })
    );
    return;
  }

  // For images and static assets: cache-first is fine
  if (event.request.destination === 'image' ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.ico')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New ScamSafe update',
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
  };
  event.waitUntil(
    self.registration.showNotification('ScamSafe', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://scamsafe.in/dashboard'));
});
