// Service Worker para PWA - Hela Carrys
const CACHE_NAME = 'hela-carrys-v1'
const urlsToCache = [
  '/',
  '/offline',
  '/globals.css'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
  self.skipWaiting()
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Skip requests de API e autenticação
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/auth/')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna resposta
        if (response) {
          return response
        }

        return fetch(event.request).then((response) => {
          // Não cachear respostas inválidas
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone da resposta
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })

          return response
        })
      })
      .catch(() => {
        // Se offline, retornar página offline
        return caches.match('/offline')
      })
  )
})

// Notificações Push
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

