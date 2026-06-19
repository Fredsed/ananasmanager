// AnanasManager — Service Worker v2
const CACHE = 'ananasmanager-v2'; // ← changer ce numéro à chaque mise à jour

self.addEventListener('install', e => {
  self.skipWaiting(); // prend effet immédiatement
});

self.addEventListener('activate', e => {
  // Supprime TOUS les anciens caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Ne met RIEN en cache — toujours chercher le réseau en premier
  // Sauf Google Sheets qu'on ignore
  if(e.request.url.includes('script.google.com')) return;
  if(e.request.url.includes('fonts.googleapis.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Met à jour le cache avec la nouvelle version
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      })
      .catch(() => caches.match(e.request)) // hors ligne : utilise le cache
  );
});
