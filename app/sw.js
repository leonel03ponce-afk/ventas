var CACHE = "sistema-v6";
var ASSETS = ["./", "./index.html", "./config.js", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png", "./icono-maskable.png", "./apple-touch-icon.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Red primero y caché si no hay internet: la página y config.js (precios,
   links de pago), para que un cambio llegue a todos sin reinstalar */
function redPrimero(req, clave) {
  return fetch(req).then(function (res) {
    if (res && res.status === 200) { var c = res.clone(); caches.open(CACHE).then(function (k) { k.put(clave, c); }); }
    return res;
  }).catch(function () { return caches.match(clave).then(function (h) { return h || caches.match("./"); }); });
}
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/^\/(api|\.netlify)\//.test(url.pathname)) return; /* funciones del servidor: siempre a la red */
  if (req.mode === "navigate") { e.respondWith(redPrimero(req, /\/(index\.html)?$/.test(url.pathname) ? "./index.html" : url.pathname)); return; }
  if (/\/config\.js$/.test(url.pathname)) { e.respondWith(redPrimero(req, "./config.js")); return; }
  e.respondWith(caches.match(req).then(function (hit) {
    return hit || fetch(req).then(function (res) {
      if (res && res.status === 200) { var c = res.clone(); caches.open(CACHE).then(function (k) { k.put(req, c); }); }
      return res;
    });
  }));
});
