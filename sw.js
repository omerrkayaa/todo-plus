// ToDo+ service worker: uygulama kabuğunu önbelleğe alır, böylece çevrimdışıyken de açılır.
// Strateji "önce ağ, olmazsa önbellek": çevrimiçiyken hep güncel dosya gelir (geliştirirken eski kod
// görünmez), çevrimdışıyken son görülen sürüm kullanılır. Yalnızca aynı kaynaktaki GET istekleri ele
// alınır; Supabase ve doküman asistanı API çağrılarına dokunulmaz.
const CACHE_NAME = "todo-plus-shell-v1";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./vendor/supabase.js",
  "./supabase-config.js",
  "./app-config.js",
  "./app-demo-data.js",
  "./app-utils.js",
  "./app-quick-add-parser.js",
  "./app-storage.js",
  "./app-task-model.js",
  "./app-supabase-mapper.js",
  "./app-sync-merge.js",
  "./app-supabase.js",
  "./app-document-assistant.js",
  "./app.js",
];

self.addEventListener("install", (event) => {
  // Tek bir dosya eksik olsa bile kurulum başarısız olmasın.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined))),
    ).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html"))),
  );
});
