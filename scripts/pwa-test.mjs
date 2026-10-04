// Service worker testi: sayfa bir kez yüklendikten sonra ağ kesilip yenilendiğinde uygulama açılmalı.
import { chromium } from "playwright";

const baseUrl = process.env.TODO_PLUS_URL || "http://127.0.0.1:4173/";

async function launch() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    return chromium.launch({ headless: true, channel: "chrome" });
  }
}

const browser = await launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "load" });
  await page.waitForFunction(() => navigator.serviceWorker?.controller || navigator.serviceWorker?.ready.then(() => true), null, { timeout: 15000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  // İlk yüklemede sayfa henüz SW denetiminde olmayabilir; bir yenileme ile denetim altına al.
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });

  const cachedUrls = await page.evaluate(async () => {
    const keys = await caches.keys();
    const cache = await caches.open(keys[0]);
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  for (const required of ["/index.html", "/app.js", "/styles.css", "/vendor/supabase.js", "/app-demo-data.js"]) {
    if (!cachedUrls.includes(required)) throw new Error(`Önbellekte yok: ${required}`);
  }

  await context.setOffline(true);
  await page.reload({ waitUntil: "load" });
  const authVisible = await page.locator("#authScreen").isVisible();
  if (!authVisible) throw new Error("Çevrimdışıyken uygulama açılmadı.");
  if (errors.length) throw new Error(`Çevrimdışı açılışta sayfa hatası: ${errors.join(" | ")}`);

  console.log(`PWA testi başarılı: ${cachedUrls.length} dosya önbellekte, çevrimdışı yenilemede uygulama açıldı.`);
} finally {
  await browser.close();
}
