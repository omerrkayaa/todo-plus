# 02: Fonksiyonel / Özellik Geliştirmeleri

## 1. Otomasyon

### Tekrarlayan görevler
✅ Docket'te var, bir adım ileri taşınabilir. Todoist'te iki mod var ([tekrarlayan tarihler](https://www.todoist.com/help/articles/introduction-to-recurring-dates-YUYVJJAV)):
- `her hafta`: bir sonraki tekrar planlanan tarihten hesaplanır (toplantı gibi sabit ritim).
- `her hafta!` (ünlem): tamamlanma tarihinden hesaplanır (çim biçme gibi "yaptıktan X gün sonra" işleri).

Docket'e "tamamlandıktan sonra tekrarla" seçeneği eklemek, gecikmiş tekrarların üst üste
yığılması sorununu çözer. Bu, tekrarlayan görev kullanıcılarının 1 numaralı şikâyeti.

### Koşullu / akıllı hatırlatmalar
- **Konum bazlı:** "markete varınca hatırlat". Todoist'te Pro özelliği
  ([Todoist konum hatırlatmaları](https://www.todoist.com/help/articles/use-location-reminders-in-todoist-uGcwH2AJ6)),
  TickTick'te ücretsiz katmanda bile var ([karşılaştırma](https://versus.com/en/ticktick-vs-todoist/location-based-reminders)).
  Web uygulaması için zor (jeofence mobil ister), o yüzden düşük öncelik. PWA'ya geçilirse düşünülür.
- **Bağımlılık bazlı:** "X tamamlanınca Y'yi hatırlat / kilidini aç". Web'de kolay uygulanır,
  proje şablonlarıyla birleşince güçlü.
- **Eskalasyon:** son tarihe 24 saat kala ikinci bildirim; 4+ gün gecikmiş görevleri sabah
  özetinde öne çıkar.

### Yapay zekâ destekli önceliklendirme
Piyasada iki uç var ([Motion vs Reclaim karşılaştırması](https://www.morgen.so/blog-posts/motion-vs-reclaim), [Efficient App](https://efficient.app/compare/motion-vs-reclaim)):
- Motion takvimi "tek doğruluk kaynağı" yapıyor. Öncelik, son tarih ve bağımlılığa göre günü
  otomatik kuruyor, yetişmeyeni kendi yeniden planlıyor.
- Reclaim mevcut araçların üstüne "takvim zekâsı" katmanı ekliyor; alışkanlıklara ve odak
  zamanına koruma koyuyor.

❌ "Günümü planla" (Gemini destekli) fikrini istemediğim için iptal ettim, yapılmayacak.

## 2. Bildirim sistemi

- **Sabah özeti (daily digest):** "Bugün 3 görev + 1 geciken var." Todoist bunu e-postayla yapıyor.
  Bizde bildirim merkezi ✅ zaten var, içine "günaydın özeti" kartı eklemek düşük maliyetli.
- **Akıllı zamanlama:** kullanıcının görevleri genelde tamamladığı saatlere göre hatırlatma
  saati önermek (ör. "bu görevi akşam 20:00'de hatırlatayım mı? Genelde o saatte kapatıyorsun").
  Tamamlanma zamanları zaten toplanıyor, basit bir istatistik yeter.
- **Web push:** tarayıcı kapalıyken de bildirim için Web Push API (ücretsiz, kendi sunucumuzdan).
  İzin istemeden önce değer göstermek gerek ("hatırlatma kurmak ister misin?" anına bağlanabilir).

## 3. İşbirliği özellikleri

Mevcut durum: ✅ çoklu kişi atama + kişi bazlı istatistik var. Üç şey eksik:

1. **Yorumlar + @bahsetme:** görev detayına yorum akışı; `@Ömer` yazınca o kişiye bildirim.
   Asana ve Todoist'te işbirliğinin bel kemiği bu.
2. **Gerçek zamanlı senkronizasyon:** Supabase Realtime zaten elimizde (ücretsiz katmanda var).
   `tasks` tablosuna abone olunca iki tarayıcı arasında canlı güncelleme birkaç saatlik iş.
   Rakiplerin "premium" sattığı özelliği bedavaya alıyoruz.
3. **Aktivite akışı:** "Ali görevi tamamladı, Ayşe son tarihi değiştirdi" listesi. Bildirim
   merkezi paneli buna doğal bir ev.

## 4. Entegrasyonlar

| Entegrasyon | Piyasa durumu | Docket önerisi |
|---|---|---|
| Takvim | TickTick'in gömülü takvimi Todoist'inkinden üstün bulunuyor; Todoist'in 2 yönlü Google Calendar senkronu "sık bozuluyor" diye eleştiriliyor ([Morgen karşılaştırması](https://www.morgen.so/blog-posts/ticktick-vs-todoist), [TechWise](https://techwiseinsider.com/todoist-vs-ticktick-ive-tried-them-both-and-heres-the-winner/)) | Önce salt-okunur ICS beslemesi yayınla (Google/Outlook'a abone linki). 2 yönlü senkronun bakım yükü olmadan değerin %80'i |
| E-posta → görev | Todoist/TickTick'te proje başına e-posta adresi | Orta vadede; Supabase Edge Function ile yapılabilir |
| Slack/Teams | Mesajı göreve çevirme | Kullanıcı tabanı isterse; webhook altyapısı önce gelsin |
| Zapier/Make | Standart beklenti | Basit bir webhook + REST API yayınlamak tüm otomasyon araçlarına kapı açar (Zapier'e özel iş yapmadan) |

## 5. Offline çalışma ve senkronizasyon çakışması

Yerel-öncelikli (local-first) mimarinin özü şu: cihazdaki veri ana kopyadır, sunucu senkron
noktasıdır. Okuma anında, yazma önce yerelde olur ([AppScale local-first rehberi](https://appscale.blog/en/blog/local-first-architecture-crdts-sync-engines-offline-first-2026)).

Çakışma çözüm stratejileri:
- **Son yazan kazanır (LWW):** basit ama sessizce veri yok ediyor. İki kişi aynı görevi
  düzenlerse biri kayboluyor ([Adalo senkron yazısı](https://www.adalo.com/posts/offline-vs-real-time-sync-managing-data-conflicts)).
- **Alan bazlı birleştirme:** görevin başlığı ile son tarihi ayrı ayrı karşılaştırılır, çoğu
  çakışma kendiliğinden çözülür. Todo uygulaması için ideal orta yol bu.
- **CRDT (Automerge/Yjs):** çevrimdışı düzenlemeler matematiksel olarak garantiyle birleşir.
  İşbirlikçi metin düzenleme için şart ama bir todo uygulaması için genelde aşırı mühendislik
  ([smallstack CRDT yazısı](https://dev.to/smallstack/crdts-and-local-first-architecture-how-smallstack-handles-offline-conflict-resolution-338c), [tonsky](https://tonsky.me/blog/crdt-filesync/)).

Docket için yol haritası: (1) yerel depolama zaten var, üstüne çevrimdışı kuyruk eklenecek
(bağlantı yokken yapılan değişiklikler sıraya girer), (2) bağlantı gelince alan bazlı
birleştirme, (3) çözülemeyen çakışmada kullanıcıya sade bir "hangisi kalsın?" kartı.

**Durum (19 Tem 2026):** Üç adım da tamamlandı. Bkz. [09-cevrimdisi-mod-adim-adim.md](09-cevrimdisi-mod-adim-adim.md) ve [07 numaralı dosya, madde 10](07-oneriler-ve-oncelik-matrisi.md).

### Fikir (henüz yapılmadı): Service Worker ile "tam çevrimdışı açılış"

Şu an uygulama sayfası (index.html, app.js vb.) genelde yerel bir geliştirme sunucusundan
(ör. VS Code Live Server) yükleniyor. Sayfa açıkken çevrimdışı kalmak sorunsuz çalışıyor.
Ama internet tamamen giderse (ya da test için DevTools'taki "Offline" kutusu kullanılırsa)
sayfayı yeniden yüklemek başarısız olabiliyor, çünkü tarayıcı sayfanın kendi dosyalarını bile
sunucudan çekemiyor. 19 Tem 2026'da bunu yaşadım. Kök neden ve normal kullanımdaki etkisi için
[09 numaralı dosyadaki "Test için pratik not"](09-cevrimdisi-mod-adim-adim.md)a bakılabilir.
Gerçek uçak modunda localhost'a erişim genelde etkilenmediği için günlük kullanımda bu sorun
büyük ihtimalle çıkmaz.

Çözülebilir mi? Evet. Bir Service Worker ile sayfanın kendi dosyaları (HTML/CSS/JS)
tarayıcıya önceden kaydedilir, sunucuya hiç ulaşılamasa bile sayfa açılır (klasik PWA "app
shell" tekniği). Supabase verisi ayrı bir konu olarak zaten çözüldü (yerel-öncelikli + alan
bazlı birleştirme).

Neden şimdi yapmadım: "sadece doğru test et" seçeneğini tercih ettim. Gerçek uçak modu ya da
`index.html`'i doğrudan dosya olarak açmak günlük kullanım için yeterli. Service Worker ayrı
bir altyapı kararı (önbellek geçersiz kılma, sürüm güncellemesi gibi kendi karmaşıklığı var) ve
şu an öncelik değil. İleride "sunucu bile olmadan her koşulda açılsın" istenirse buraya dönülebilir.
