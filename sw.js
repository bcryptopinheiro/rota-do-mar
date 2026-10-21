/* Service worker da Rota do Mar: guarda o jogo no telemóvel para funcionar sem internet.
   PARA PUBLICAR UMA ATUALIZAÇÃO: muda o número da versão abaixo (v1 → v2 → v3...). */
const VERSION = 'v6';
const CACHE = `rota-do-mar-${VERSION}`;
const FONTS = 'rota-do-mar-fonts'; // fontes do Google (guardadas à parte, não mudam)

// Ficheiros do próprio jogo, guardados logo na instalação.
// ATENÇÃO: se criares um ficheiro novo, acrescenta-o também aqui (testes/verificar.mjs avisa).
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

// Alguns servidores redirecionam index.html → ./ ; uma resposta "redirecionada" não pode abrir a página,
// por isso guarda-se sempre uma cópia limpa.
const limpa = (res) => (res.redirected ? res.blob().then((b) => new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers })) : Promise.resolve(res));

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(FILES.map((f) => fetch(new Request(f, { cache: 'reload' })).then((res) => {
        if (!res.ok) throw new Error(`Falha a guardar ${f}`);
        return limpa(res).then((r) => c.put(f, r));
      }))))
      .then(() => self.skipWaiting())
  );
});

// Apaga as caches de versões antigas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: usa a cópia guardada; se não houver e estiver offline,
  // o navegador usa as fontes de recurso (Georgia / system-ui).
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONTS).then((c) =>
        c.match(req).then((hit) => {
          const net = fetch(req)
            .then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; })
            .catch(() => hit || Response.error());
          return hit || net;
        })
      )
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // Ficheiros do jogo: tenta sempre a internet primeiro (assim vem sempre a versão mais recente) e guarda uma cópia; sem internet usa a cópia guardada.
  const nav = req.mode === 'navigate';
  const key = nav ? './' : req;
  e.respondWith(
    fetch(nav ? req.url : req, { cache: 'no-cache' })
      .then((res) => { if (res.ok) { const copy = res.clone(); limpa(copy).then((r) => caches.open(CACHE).then((c) => c.put(key, r))); } return res; })
      .catch(() => caches.match(key, { ignoreSearch: true })
        .then((hit) => hit || (nav ? caches.match('./index.html', { ignoreSearch: true }) : undefined))
        .then((hit) => hit || Response.error()))
  );
});
