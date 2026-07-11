/**
 * GoalChain Service Worker — sw.js
 * Cache strategy: stale-while-revalidate for assets, network-first for API.
 * Non-blocking by design — errors are logged, never throw.
 */

const CACHE_NAME = 'goalchain-v1';
const ASSET_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/data/players.json',
];

// ─── Install: pre-cache critical assets ────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Best-effort pre-cache — don't fail SW if some assets are missing.
      return cache.addAll(ASSET_URLS).catch((err) => {
        console.warn('[SW] Pre-cache failed (non-fatal):', err);
      });
    })
  );
  // Activate immediately without waiting for old tabs to close.
  self.skipWaiting();
});

// ─── Activate: prune old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => {
      // Take control of all pages immediately.
      self.clients.claim();
    })
  );
});

// ─── Fetch: stale-while-revalidate for assets, network-first for API ────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GETs from same origin or known CDN domains.
  if (request.method !== 'GET') return;
  if (!url.origin.startsWith(self.location.origin) &&
      !url.hostname.includes('solana') &&
      !url.hostname.includes('github.com')) return;

  // API calls: network-first, fall back to cache.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request).then((res) => {
        if (res.ok) cache.put(request, res.clone());
        return res;
      }).catch(() => null);

      // Return cached version immediately; update cache in background.
      if (cached) {
        networkFetch; // non-blocking background refresh
        return cached;
      }
      // No cache — wait for network.
      return networkFetch || new Response('Offline', { status: 503 });
    })
  );
});

// ─── Message: allow app to trigger cache purge ──────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});