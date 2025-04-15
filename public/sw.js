// Este é o Service Worker para o Sistema de Gestão de Extras - 20ª CIPM
const CACHE_NAME = 'extras-cipm-v1';

// Arquivos para cache inicial
const INITIAL_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon-police.svg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(INITIAL_CACHE_URLS);
      })
      .then(() => {
        // Força o service worker a tornar-se ativo
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            // Remover caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Toma controle de clientes sem recarregar
      return self.clients.claim();
    })
  );
});

// Intercepta requisições e verifica no cache primeiro
self.addEventListener('fetch', (event) => {
  // Ignorar requisições a APIs ou outras origens
  if (
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/socket.io/')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        // Clonar a requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Verificar se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar a resposta
            const responseToCache = response.clone();

            // Adicionar ao cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Se falhar a requisição de rede e for uma requisição de página, tenta retornar a página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // Se for uma imagem, pode retornar uma imagem de fallback
            if (event.request.destination === 'image') {
              return caches.match('/favicon-police.svg');
            }
            
            // Se não encontrar no cache e não tiver conexão
            return new Response('Sem conexão com a internet.');
          });
      })
  );
});

// Receber mensagem do cliente (útil para forçar atualizações)
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});