self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
});

// SENGAJA tidak ada listener 'fetch' -- service worker ini tidak melayani/
// meng-intersep request apa pun. Satu-satunya tugasnya adalah membersihkan diri
// sendiri lewat 'install'/'activate' di atas, lalu berhenti berlaku.
