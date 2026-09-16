/**
 * SERVICE WORKER "SELF-DESTRUCT"
 * -------------------------------
 * File ini SENGAJA tidak lagi berfungsi sebagai service worker offline biasa.
 * Tujuannya cuma satu: menghapus dirinya sendiri (dan semua cache yang pernah
 * dia buat) dari device siapa pun yang masih menjalankan versi sw.js yang lama.
 *
 * Kenapa perlu ini: service worker lama mengontrol request di device user dan
 * bisa melayani index.html versi LAMA dari cache, walau kode terbaru sudah
 * di-push ke GitHub/Apps Script. Update biasa (isi ulang sw.js) tidak cukup,
 * karena device yang masih dikontrol versi lama itu bisa saja tidak pernah
 * benar-benar "sadar" ada versi baru sampai user install ulang manual.
 *
 * File ini memaksa semua device keluar dari mode service worker sepenuhnya,
 * satu kali untuk selamanya -- sesudah ini aktif di semua device, boleh hapus
 * baris pendaftaran service worker (navigator.serviceWorker.register) dari
 * index.html juga, supaya tidak ada yang install service worker baru lagi.
 */

self.addEventListener('install', () => {
  // Langsung aktif tanpa nunggu tab lama ditutup dulu.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Hapus semua Cache Storage yang pernah dibuat versi sw.js sebelumnya.
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));

      // 2. Cabut diri sendiri -- setelah ini, tidak ada service worker aktif
      //    lagi untuk origin ini, request kembali langsung ke server seperti
      //    situs web biasa tanpa perantara.
      await self.registration.unregister();

      // 3. Paksa reload semua tab yang sedang membuka app ini, supaya mereka
      //    langsung ambil ulang index.html terbaru dari server (bukan cache),
      //    tanpa perlu user reload manual.
      const allClients = await self.clients.matchAll({ type: 'window' });
      allClients.forEach((client) => client.navigate(client.url));
    })()
  );
});

// SENGAJA tidak ada listener 'fetch' -- service worker ini tidak melayani/
// meng-intersep request apa pun. Satu-satunya tugasnya adalah membersihkan diri
// sendiri lewat 'install'/'activate' di atas, lalu berhenti berlaku.
