# 03: Performans ve Teknik Altyapı

## 1. Büyük veri setlerinde hız (binlerce görev)

### Kötü örnek: Notion
Büyük çalışma alanlarında yavaşlamasının nedenleri ders niteliğinde
([Notion hız rehberi](https://www.notioneverything.com/blog/notion-slow), [Super.so](https://super.so/blog/how-to-make-notion-faster)):
- Varsayılan ayar tüm kayıtları birden yüklüyor;
- iç içe ilişkiler/formüller her açılışta yeniden hesaplanıyor;
- tam çözünürlüklü görseller olduğu gibi indiriliyor.

### İyi örnek: Things 3
Yerel veritabanı ve arka planda senkron sayesinde her etkileşim anında. Hız, incelemelerde
başlı başına övgü konusu ([MacStories](https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/)).

### Docket için üç katmanlı plan

1. **Tamamlananları arşivle.** Aktif listede yalnızca açık görevler dursun; tamamlananlar
   "Arşiv" görünümünde sayfalanarak yüklensin. En ucuz ve en etkili adım, hem DOM hem sorgu küçülür.
2. **Liste sanallaştırma (windowing).** Yalnızca ekranda görünen satırlar DOM'a çizilir,
   kaydırdıkça geri dönüştürülür. Binlerce DOM düğümü stil hesaplarını ve her güncellemeyi
   yavaşlatır ([web.dev sanallaştırma](https://web.dev/articles/virtualize-long-lists-react-window),
   [patterns.dev, vanilla JS örneği](https://www.patterns.dev/vanilla/virtual-lists/)).
   Docket vanilla JS olduğu için patterns.dev'deki kütüphanesiz yaklaşım birebir uyuyor.
3. **Veritabanı indeksleri.** Supabase (Postgres) tarafında en sık filtrelenen kolonlara indeks:
   `project_id`, `due_date`, `status`, `assignee`. `supabase-schema.sql` dosyasına eklenecek.
   Maliyeti sıfır, etkisi liste büyüdükçe artıyor.

## 2. Çoklu cihaz senkronizasyonu ve veri tutarlılığı

- **İyimser arayüz (optimistic UI):** değişikliği önce ekranda göster, sunucu onayını arkada
  bekle; hata gelirse geri al ve kullanıcıya bildir. "Uygulama hızlı" hissinin sırrı bu.
- **Supabase Realtime:** açık iki sekme/cihaz arasında canlı güncelleme. Ücretsiz katmanda var,
  ayrı sunucu istemiyor (ayrıntı: [02 numaralı dosya](02-ozellik-gelistirmeleri.md), İşbirliği bölümü).
- **Sıralı işlem kuyruğu:** çevrimdışıyken biriken değişiklikler sırayla uygulanır; çakışmada
  alan bazlı birleştirme (ayrıntı yine 02'de).
- Tutarlılık kuralı: tek doğruluk kaynağı Supabase. Yerel depolama önbellek ve kuyruk, asla
  ikinci bir "ana kopya" değil.

## 3. Arama ve filtreleme performansı

Mevcut durum: ✅ durum/öncelik/proje/kişi/etiket filtreleri ve sıralama var. Eksik olan hızlı
metin araması:

| Teknik | Ne zaman | Not |
|---|---|---|
| İstemci tarafı fuzzy arama (örn. Fuse.js veya basit skorlamalı kendi fonksiyonumuz) | Birkaç bin göreve kadar | Görevler zaten bellekteyse anında sonuç; yazım hatasını tolere eder |
| Postgres tam metin arama (`to_tsvector` + GIN indeks) | On binlerce görev / sunucu taraflı arama | Supabase'de hazır; Türkçe için `simple` sözlük + `unaccent` |
| `pg_trgm` (üçlü harf benzerliği) | "Bulanık" eşleşme sunucuda gerekiyorsa | `ILIKE '%…%'` sorgularını indekslenebilir yapar |

Pratik kurallar:
- Arama kutusuna debounce koy (yazma bitene kadar 150-250 ms bekle), her tuşta sorgu atma.
- Filtre kombinasyonlarını URL'ye yaz; hem paylaşılabilir olur hem geri tuşu çalışır.
- Sık kullanılan kombinasyonlar için kayıtlı filtre ekle ("Bu hafta + Yüksek öncelik + Ben").
  Todoist bunu ücretli satıyor, bizde ücretsiz olması fark yaratır.

## 4. Ölçüm olmadan optimizasyon olmaz

- Basit bir eşik koy: liste çizimi 16 ms'yi (60fps) aşarsa konsola uyarı yazan bir ölçüm sarmalayıcısı.
- Playwright zaten kurulu (`scripts/smoke-test.mjs`). Smoke teste "1.000 görevle liste açılışı
  < 2 sn" gibi bir performans senaryosu eklenebilir; gerileme olursa test haber verir.
