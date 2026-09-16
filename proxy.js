/**
 * PROXY KE GOOGLE APPS SCRIPT
 * ---------------------------
 * File ini adalah "jembatan" yang jalan di server Vercel (bukan di browser user),
 * supaya browser cukup manggil domain sendiri (stamphub-ntc.vercel.app/api/proxy),
 * bukan langsung ke script.google.com. Aturan CORS browser cuma berlaku untuk
 * request yang dikirim LANGSUNG dari JavaScript di browser ke domain lain -- request
 * server-ke-server (dari sini ke Google) sama sekali TIDAK kena aturan itu.
 *
 * Ganti TARGET di bawah kalau suatu saat kamu redeploy Apps Script-nya dan dapat
 * URL exec yang baru (jarang terjadi selama kamu selalu pakai "New version", bukan
 * bikin deployment baru).
 */
const TARGET = 'https://script.google.com/macros/s/AKfycbwCJy7nttB731S_pJiAUfY6XUvXMAWW8fYaoIKJpZuFhE8RyxlR-nk2RKcwlfPOccnbjg/exec';

export const config = {
  api: {
    bodyParser: false, // baca body mentah sendiri, biar diteruskan apa adanya ke Apps Script.
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  try {
    const qIndex = req.url.indexOf('?');
    const query = qIndex >= 0 ? req.url.slice(qIndex) : '';

    let target = TARGET + query;
    const method = req.method || 'GET';
    const body = method === 'POST' ? await readRawBody(req) : undefined;

    // Ikuti redirect Apps Script MANUAL, method & body TETAP DIPERTAHANKAN apa pun
    // jenis redirect-nya (301/302/303/307/308) -- fetch bawaan suka mengubah POST
    // jadi GET saat mengikuti redirect otomatis, itu bikin Login/Save/Review kehilangan
    // body-nya di tengah jalan.
    let response;
    let redirectsLeft = 5;
    while (true) {
      response = await fetch(target, {
        method,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
        redirect: 'manual',
      });

      const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
      if (isRedirect && redirectsLeft > 0) {
        const location = response.headers.get('location');
        if (!location) break;
        target = new URL(location, target).toString();
        redirectsLeft--;
        continue;
      }
      break;
    }

    const text = await response.text();
    res.status(response.status || 200);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
    res.send(text);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Proxy error: ' + err.message });
  }
}
