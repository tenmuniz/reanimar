// Este é um service worker básico para funcionar como PWA

const cacheName = 'escala-pmf-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-police.svg',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png'
];

// Instalar e cache dos arquivos principais
self.addEventListener('install', event => {
  console.log('Service Worker sendo instalado');
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log('Cache dos arquivos principais');
        return cache.addAll(filesToCache);
      })
  );
});

// Ativar o service worker
self.addEventListener('activate', event => {
  console.log('Service Worker ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== cacheName) {
            console.log('Service Worker: limpando cache antigo');
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Interceptar requisições para servir do cache quando possível
self.addEventListener('fetch', event => {
  console.log('Service Worker: fetch', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }
        // Não está no cache, vai buscar na rede
        return fetch(event.request);
      })
      .catch(error => {
        console.log('Falha ao recuperar o recurso:', error);
      })
  );
});