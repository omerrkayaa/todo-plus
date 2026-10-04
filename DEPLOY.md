# Yayına Alma (ücretsiz katmanlarla)

Uygulama iki parçadır: **statik arayüz** (HTML/JS/CSS) ve **doküman asistanı sunucusu** (`server/`, Express).
Arayüz tek başına çalışır (görev yönetimi, çevrimdışı mod, Supabase). Asistan ve "yönetici kullanıcı oluştur"
özelliği sunucu ister.

## 1. Arayüz → GitHub Pages
1. Repo: Settings → Pages → Source: **GitHub Actions**.
2. Actions sekmesi → "Arayüzü GitHub Pages'e yayınla" → **Run workflow**.
3. Adres: `https://<kullanıcı>.github.io/todo-plus/`. Uygulama göreli yollar kullandığı için alt dizinde çalışır.
4. Supabase panelinde Authentication → URL Configuration → Site URL / Redirect URL'ye bu adresi ekle.

## 2. Sunucu → Render (ücretsiz)
1. Render'da New → **Blueprint** → bu repoyu seç (`render.yaml` otomatik okunur).
2. Panelde şu değerleri gir: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`,
   `VOYAGE_API_KEY`, `CORS_ORIGIN` (= Pages adresi, ör. `https://<kullanıcı>.github.io`).
3. Yayın sonrası `https://<servis>.onrender.com/api/health` → `{"status":"ok"}` dönmeli.
4. Arayüze sunucu adresini bildir: `supabase-config.js` içine ekle ve commit'le:
   ```js
   window.TODO_PLUS_SUPABASE = {
     url: "...",
     anonKey: "...",
     assistantApiUrl: "https://<servis>.onrender.com/api",
   };
   ```
5. Ücretsiz plan boşta uyur: ilk istek 30-60 sn sürebilir.

Alternatif: Fly.io, Railway veya Cloud Run (aynı `Dockerfile`).

## Güvenlik hatırlatmaları
- `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucu ortam değişkeninde durmalı; hiçbir arayüz dosyasına yazılmamalı.
- Canlıda `ASSISTANT_DAILY_LIMIT` ile kullanıcı başına günlük asistan isteği sınırlanır (varsayılan 300).
- Gerçek kullanıcılarla yayından önce README'deki "Teslim Kontrol Listesi"ndeki açık maddeleri kapat
  (gerçek Supabase'de RLS testi, profil/e-posta görünürlüğü).
