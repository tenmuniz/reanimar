// Função para registrar o service worker

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(error => {
          console.log('Falha ao registrar Service Worker:', error);
        });
    });
  }
}

// Exporta a função para ser usada no main.tsx
export default registerServiceWorker;