# Yayına alma (ücretsiz katmanlarla)

Uygulama iki parçadan oluşuyor: statik arayüz (HTML/JS/CSS) ve doküman asistanı sunucusu (`server/`, Express). Arayüz tek başına çalışır; görev yönetimi, çevrimdışı mod ve Supabase buna dahil. Asistanın ve "yönetici kullanıcı oluştur" özelliğinin çalışması için sunucu gerekir.

## 1. Arayüz: GitHub Pages
1. Repo içinde Settings → Pages → Source kısmından GitHub Actions'ı seçin.
2. Actions sekmesinde "Arayüzü GitHub Pages'e yayınla" iş akışını Run workflow ile başlatın.
3. Adres `https://<kullanıcı>.github.io/todo-plus/` olur. Uygulama göreli yollar kullandığı için alt dizinde de çalışır.
4. Supabase panelinde Authentication → URL Configuration bölümünde Site URL ve Redirect URL'ye bu adresi ekleyin.

## 2. Sunucu: Render (ücretsiz)
1. Render'da New → Blueprint ile bu repoyu seçin. `render.yaml` otomatik okunur.
2. Panelde şu değerleri girin: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`,
   `VOYAGE_API_KEY` ve `CORS_ORIGIN` (Pages adresi, ör. `https://<kullanıcı>.github.io`).
3. Yayından sonra `https://<servis>.onrender.com/api/health` adresi `{"status":"ok"}` döndürmeli.
4. Arayüze sunucu adresini bildirmek için `supabase-config.js` dosyasına ekleyip commit'leyin:
   ```js
   window.TODO_PLUS_SUPABASE = {
     url: "...",
     anonKey: "...",
     assistantApiUrl: "https://<servis>.onrender.com/api",
   };
   ```
5. Ücretsiz plan boştayken uykuya geçer, bu yüzden ilk istek 30-60 sn sürebilir.

Fly.io, Railway veya Cloud Run da olur; aynı `Dockerfile` kullanılır.

## Güvenlik hatırlatmaları
- `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucunun ortam değişkeninde durmalı, hiçbir arayüz dosyasına yazılmamalı.
- Canlıda `ASSISTANT_DAILY_LIMIT` kullanıcı başına günlük asistan isteğini sınırlar (varsayılan 300).
- Gerçek kullanıcılarla yayına çıkmadan önce README'deki "Teslim kontrol listesi"nde açık kalan maddeleri kapatın (gerçek Supabase'de RLS testi, profil/e-posta görünürlüğü).
