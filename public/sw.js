const CACHE_NAME = 'loop-pwa-cache-v1'
const OFFLINE_URL = '/offline.html'

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/manifest.json',
  '/next.svg',
  '/vercel.svg',
]

// 1. Install service worker and pre-cache fallback HTML page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

// 2. Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// 3. Intercept fetch requests and handle fallbacks
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // Skip chrome-extension or internal schemes
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in the background to update cache (stale-while-revalidate)
        event.waitUntil(
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                return caches.open(CACHE_NAME).then((cache) => {
                  return cache.put(event.request, networkResponse)
                })
              }
            })
            .catch(() => {
              /* ignore background fetch failures */
            })
        )
        return cachedResponse
      }

      // If not cached, fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache successful responses for static assets/images
          const isStaticAsset =
            event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|json)$/) ||
            event.request.url.includes('/_next/')

          if (networkResponse.status === 200 && isStaticAsset) {
            const responseCopy = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseCopy)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // If network fetch fails for document navigation, return offline page
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_URL)
          }
          throw new Error('Network request failed and no cache fallback available.')
        })
    })
  )
})
