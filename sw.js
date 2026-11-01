/* Garde la porte d'entrée et les bibliothèques libres pour ouvrir l'appli sans réseau.
   Réseau d'abord (pour les mises à jour), copie locale si le réseau manque. L'appli elle-même n'est jamais ici :
   elle est téléchargée depuis le dépôt privé avec la clé et gardée par la porte d'entrée. */
const CACHE = "tdp-porte-1";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "version.json",
  "jspdf.umd.min.js", "jspdf.plugin.autotable.min.js", "leaflet/leaflet.js", "leaflet/leaflet.css"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if(e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    if(r.ok){ const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch:true }).then(r => r || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error()))));
});
