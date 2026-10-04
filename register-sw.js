// Service worker kaydı. Başarısız olursa uygulama normal şekilde (çevrimdışı kabuk olmadan) çalışır.
(function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker kaydedilemedi:", error);
    });
  });
})();
