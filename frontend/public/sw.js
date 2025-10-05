/**
 * Service Worker para funcionalidad offline
 * Cachea recursos estáticos y maneja peticiones offline
 */

const CACHE_NAME = 'qr-units-v1';
const STATIC_CACHE = 'qr-units-static-v1';

// Recursos para cachear
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// URLs de la API que se pueden cachear
const API_CACHE_PATTERNS = [
  /^\/api\/v1\/units\/[^\/]+$/,  // GET unit info
  /^\/health$/  // Health check
];

/**
 * Instalar Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {credentials: 'same-origin'})));
    }).catch((error) => {
      console.error('[SW] Failed to cache static assets:', error);
    })
  );
  
  self.skipWaiting();
});

/**
 * Activar Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

/**
 * Interceptar peticiones
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar peticiones del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia para recursos estáticos
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Solo cachear respuestas exitosas
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Si falla y es una página, devolver página offline
          if (request.destination === 'document') {
            return new Response(
              `<!DOCTYPE html>
              <html>
                <head>
                  <title>Sin conexión - QR Units</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline { color: #666; }
                  </style>
                </head>
                <body>
                  <div class="offline">
                    <h1>Sin conexión</h1>
                    <p>No se pudo cargar la página. Verifica tu conexión a internet.</p>
                    <button onclick="location.reload()">Reintentar</button>
                  </div>
                </body>
              </html>`,
              { 
                headers: { 'Content-Type': 'text/html' },
                status: 200
              }
            );
          }
        });
      })
    );
    return;
  }

  // Estrategia para peticiones de API
  if (url.pathname.startsWith('/api/v1/')) {
    // GET requests - cache first, network fallback
    if (request.method === 'GET') {
      const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
      
      if (shouldCache) {
        event.respondWith(
          caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            });
            
            return cachedResponse || fetchPromise;
          }).catch(() => {
            return new Response(
              JSON.stringify({ 
                error: 'Sin conexión', 
                offline: true,
                message: 'Esta información no está disponible offline'
              }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          })
        );
      }
    }
    
    // POST requests - network only (eventos se manejan en el cliente)
    if (request.method === 'POST') {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({ 
              error: 'Sin conexión', 
              offline: true,
              message: 'El evento se guardará localmente y se sincronizará cuando recuperes la conexión'
            }),
            { 
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
      );
    }
  }
});

/**
 * Manejo de mensajes
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

/**
 * Manejo de sincronización en background
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      // Aquí se podría notificar al cliente para sincronizar eventos pendientes
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_EVENTS' });
        });
      })
    );
  }
});

/**
 * Notificar actualizaciones disponibles
 */
self.addEventListener('controllerchange', () => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'UPDATE_AVAILABLE' });
    });
  });
});
