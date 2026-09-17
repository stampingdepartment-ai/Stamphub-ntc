/**
 * SERVICE WORKER -- versi "polos" khusus buat memenuhi syarat teknis PWA supaya
 * tombol Install muncul di browser (Chrome/Edge/Android mewajibkan ada service worker
 * dengan listener 'fetch' terdaftar, sebelum mau menampilkan prompt install).
 *
 * SENGAJA TIDAK MENYIMPAN CACHE APA PUN. Semua request diteruskan langsung ke jaringan
 * (network-only passthrough) -- ini untuk menghindari masalah yang pernah terjadi
 * sebelumnya, di mana service worker versi lama menyimpan cache dan bikin device
 * "nyangkut" di versi aplikasi yang sudah basi. Kalau nanti mau nambah dukungan
 * offline/cache beneran, harus dipikirkan matang-matang strategi invalidasi-nya dulu,
 * jangan asal cache semua.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Langsung ke jaringan, tidak pernah dijawab dari cache.
  event.respondWith(fetch(event.request));
});
