// Demo modunda yerel sunucu: supabase-config.js boş döner, böylece uygulama gerçek Supabase'e
// bağlanmadan localStorage ile çalışır (demo hesapları: omer@example.com / 123456).
// Kullanım: npm run demo  →  http://127.0.0.1:4174/
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const port = Number(process.env.PORT) || 4174;
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml",
};

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (pathname === "/supabase-config.js") {
    response.writeHead(200, { "Content-Type": types[".js"], "Cache-Control": "no-store" });
    return response.end("window.TODO_PLUS_SUPABASE = null;\n");
  }
  if (pathname === "/sw.js") { // demo sunucusunda önbellek karışmasın
    response.writeHead(200, { "Content-Type": types[".js"], "Cache-Control": "no-store" });
    return response.end("self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));\n");
  }
  const relative = normalize(pathname === "/" ? "index.html" : pathname.slice(1));
  const blocked = relative.startsWith("..") || /^(\.|server|node_modules)/.test(relative);
  try {
    if (blocked) throw new Error("blocked");
    const body = await readFile(join(root, relative));
    response.writeHead(200, { "Content-Type": types[extname(relative)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Bulunamadı");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Docket DEMO modu: http://127.0.0.1:${port}/  (omer@example.com / 123456, giriş türü: Yönetici)`);
});
