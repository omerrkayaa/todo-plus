# 09: Çevrimdışı Mod: Adım Adım Uygulama Planı

[07 numaralı dosyadaki](07-oneriler-ve-oncelik-matrisi.md) son açık madde olan "10. Çevrimdışı
mod + çakışma yönetimi" bu adımlarla yapıldı. Her adım bitince kutucuğu `[x]` yapıp commit
attım, böylece yarım kalan iş görünür oldu. Gemini "Günümü planla" fikri iptal edildi, bu planda
yok ve yapılmayacak.

*Hazırlanma tarihi: 19 Temmuz 2026*

## Şu an elimizde ne var? (plan neden böyle)

İyi haber şu: uygulama zaten "önce yerel kayıt" mantığıyla çalışıyor. Her değişiklik önce
tarayıcının kendi deposuna (localStorage) yazılıyor, sonra buluta (Supabase) gönderiliyor.
Silinen kayıtlar için bir bekleme kuyruğu ve başarısız gönderimde otomatik yeniden deneme
(1 sn → 2 sn → 4 sn … en fazla 30 sn arayla) da var.

Eksik olan üç şey vardı:

1. **Sessiz veri kaybı riski.** Bulut verisi yüklenirken (girişte ve her canlı güncellemede)
   bulut kopyası yerel kopyanın üzerine yazılıyordu. Çevrimdışıyken yaptığım değişiklikler,
   bağlantı gelip bulut verisi yüklendiğinde kaybolabilirdi. Araştırmanın uyardığı "son yazan
   kazanır" tuzağı tam olarak buydu.
2. **Çevrimdışı açılış sorunu.** Supabase kütüphanesi internetten (CDN) yükleniyordu. İnternet
   yokken sayfayı yenilersem uygulama sessizce "demo moda" düşüyor ve bağlantı gelse bile sayfa
   yenilenene kadar buluta bağlanmıyordu.
3. **Çakışma yönetimi yoktu.** İki cihaz aynı görevi farklı şekilde değiştirirse kullanıcıya
   sorulmuyor, biri sessizce kayboluyordu.

## Adımlar (kolay → zor)

- [x] Adım 1: Supabase kütüphanesini projenin içine al *(19 Tem 2026)*
  CDN yerine kütüphanenin kopyasını repoya koy (`vendor/` klasörü), `index.html` oradan yüklesin.
  Böylece internet yokken sayfa yenilense bile uygulama Supabase modunda kalır, bağlantı gelince
  kaldığı yerden devam eder. Ücretsiz, çünkü kütüphane zaten `node_modules` içinde duruyor.
  Doğrulama: İnternet kapalıyken sayfa yenilenince sağ üstteki durum rozeti "Demo mod" yerine
  "Çevrimdışı" göstermeli.

- [x] Adım 2: Daha dürüst çevrimdışı göstergesi *(19 Tem 2026)*
  Rozet şu an yalnızca tarayıcının "bağlantı gitti" olayını dinliyor. Sayfa çevrimdışı açılırsa
  da doğru rozeti göstersin. Ayrıca "son başarılı eşitleme saati" tutulsun ve çevrimdışıyken
  rozette görünsün ("Çevrimdışı · Son eşitleme 14:03"). İlk çevrimdışı değişiklikte bir kez kısa
  bilgi mesajı çıksın: "Değişiklikler cihazında saklandı, bağlantı gelince gönderilecek."
  Doğrulama: Uçak modunda görev ekleyince bu mesajı görmeliyim, rozette de son eşitleme saati yazmalı.

- [x] Adım 3: Senkron tabanı: "en son ikimizin de bildiği hâl"i sakla *(19 Tem 2026)*
  Her başarılı tam eşitlemeden sonra verinin bir anlık görüntüsünü yerel depoya kaydet. Bu görüntü,
  "hangi tarafın neyi değiştirdiğini" anlamanın anahtarı. Bir sonraki adımdaki birleştirme motoru
  üç kopyayı karşılaştıracak: taban (ortak geçmiş), yerel (benim cihazım) ve bulut.
  Görünür bir değişiklik yok, temel hazırlığı.
  Doğrulama: Tarayıcı deposunda yeni bir "senkron tabanı" kaydı oluşmalı (geliştirici
  kontrolüyle), uygulama davranışı değişmemeli.

- [x] Adım 4: Alan bazlı birleştirme motoru (işin kalbi) *(19 Tem 2026, 15 birim testiyle)*
  Yeni, bağımsız bir dosya: `app-sync-merge.js`. Kural seti:
  - Bir alanı (ör. görevin başlığı) yalnızca ben değiştirmişsem, benimki alınır.
  - Yalnızca bulut değiştirmişse, buluttaki alınır.
  - İkimiz de farklı değiştirmişsek, o alan "çakışma listesine" girer (Adım 6'daki kart).
  - Çevrimdışı oluşturduğum görev/proje korunur ve buluta gönderilir (bugünkü gibi silinmez).
  - Yorumlar ve geçmiş kayıtları gibi "yalnızca eklenen" listeler iki taraftan birleştirilir.
  - Silme kuyruğundaki kayıtlar geri dirilmez.

  Motor saf hesap yapan, ekrana dokunmayan bir parça olacak ve birim testleriyle birlikte
  yazılacak (testler `npm test` çatısına eklenecek).
  Doğrulama: Birim testleri geçmeli. "İki taraf ayrı alanları değiştirdi → kendiliğinden
  birleşti" ve "aynı alanı değiştirdi → çakışma çıktı" gibi senaryolar var.

- [x] Adım 5: Bulut yüklemesini birleştirme motorundan geçir *(19 Tem 2026)*
  Girişte ve canlı güncelleme (Realtime) olaylarında bulut verisi artık yerelin üzerine
  yazılmayacak. Taban + yerel + bulut üçlüsü motora girecek, çıkan birleşik sonuç uygulanacak ve
  gerekiyorsa buluta geri gönderilecek. Yukarıdaki 1 numaralı sessiz veri kaybı riski burada kapanıyor.
  Doğrulama: Uçak modunda görev ekle ve mevcut bir görevin adını değiştir, sonra bağlantıyı aç.
  İkisi de durmalı ve buluta gitmeli (ikinci cihazda/sekmede görünmeli).

- [x] Adım 6: "Hangisi kalsın?" çakışma kartı *(19 Tem 2026)*
  Motor "ikimiz de aynı alanı farklı değiştirmişiz" derse sade bir kart açılır: görev adı,
  çakışan alan(lar), iki sürüm yan yana ve "Benimki kalsın" / "Buluttaki kalsın" düğmeleri.
  Karar verilince seçim uygulanır ve buluta gönderilir. Kart kapatılırsa güvenli taraf seçilir:
  bulut sürümü kalır ama benim sürümüm de görevin geçmişine not düşülür, yani hiçbir şey
  sessizce yok olmaz.
  Doğrulama: İki tarayıcı sekmesiyle aynı görevin başlığını (biri çevrimdışıyken) farklı
  değiştirip bağlantıyı açınca kart çıkmalı, seçim ne ise o kalmalı.

- [x] Adım 7: Uçtan uca test *(19 Tem 2026; otomatik testler tamam, el ile uçak modu denemesi bende kaldı)*
  - Birleştirme motoru birim testleri (Adım 4'te yazıldı, burada hepsi koşulur).
  - Playwright duman testine çevrimdışı senaryosu: bağlantıyı kes → değişiklik yap → bağlan →
    veri duruyor mu?
  - Tam test koşusu ve el ile uçak modu denemesi.

  Doğrulama: `npm test` yeşil olmalı, el testi listesindeki senaryolar işaretli olmalı.

- [x] Adım 8: Belgeleme + yol haritası işareti *(19 Tem 2026)*
  README'ye kısa bir "Çevrimdışı çalışma" bölümü (ne çalışır, ne çalışmaz); bilinen sınırlar
  aşağıya işlenir; [07 numaralı dosyada](07-oneriler-ve-oncelik-matrisi.md) 10. madde `[x]`
  yapılır.

## Bilinen sınırlar (bilerek kapsam dışı)

- **Çevrimdışıyken ilk giriş yapılamaz.** Şifre kontrolü Supabase'de olduğu için internet
  ister. Açık oturum çevrimdışı çalışmaya devam eder. (Çözümü ayrı ve riskli bir konu, gerekirse
  ileride ele alırım.)
- **Doküman asistanı çevrimdışı çalışmaz.** Gemini/Voyage internet ister, rozet bunu belli ediyor.
- **Dosya ekleri** çevrimdışıyken buluta yüklenemez, bağlantı gelince gönderilir.
- CRDT gibi ağır çözümleri bilerek kullanmıyorum. Todo uygulaması için aşırı mühendislik olur
  (bkz. [02 numaralı dosya, madde 5](02-ozellik-gelistirmeleri.md)).

## Test için pratik not

Uçak modu denemesi için: tarayıcıda F12 → "Network/Ağ" sekmesi → "No throttling" yazan kutudan
"Offline" seç. Gerçek uçak modundan daha pratik; iş bitince aynı kutudan geri al.

Önemli bir sınırlama (19 Tem 2026'da fark ettim): Uygulamayı VS Code'un Live Server eklentisiyle
(yerel sunucu, `127.0.0.1:...`) açıyorsam, DevTools'taki "Offline" kutusu o yerel sunucuya giden
istekleri de kesiyor. Gerçek uçak modu böyle değil, orada localhost genelde etkilenmiyor.
Sonuç olarak "Offline" açıkken F5 yaparsam tarayıcı sayfayı hiç yükleyemiyor (Chrome'un kendi
"bağlantı yok" ekranı çıkıyor). Bu bir uygulama hatası değil. Veriler LocalStorage'da güvende
kalıyor; "Offline"ı kapatıp tekrar F5 yapınca her şey geri geliyor.
Sayfa yenileme adımını (Adım 8'deki "çevrimdışıyken F5") test ederken ya gerçek uçak modunu
kullan (WiFi'yi fiilen kapat) ya da `index.html`'i Live Server olmadan, çift tıklayıp doğrudan
dosya olarak aç. İkisinde de F5 sorunsuz çalışıyor.
