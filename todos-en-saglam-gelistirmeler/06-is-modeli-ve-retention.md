# 06: İş Modeli ve Kullanıcı Elde Tutma (Retention)

## 1. Ücretsiz/premium ayrımı nasıl yapılıyor, neye kızılıyor?

### Todoist: "sayaç" modeli
Ücretsiz (Beginner) planda 5 aktif kişisel proje, projede 300 aktif görev, 3 filtre görünümü
ve 1 haftalık aktivite geçmişi var ([resmî limitler](https://www.todoist.com/help/articles/usage-limits-in-todoist-e5rcSY), [fiyatlandırma](https://www.todoist.com/pricing)).
Pro, Aralık 2025 zammıyla yıllıkta ayda 5 $ ([analiz](https://get-alfred.ai/blog/todoist-pricing)).

Şikâyet desenleri ([derleme](https://www.usecarly.com/blog/todoist-free-plan-limits/), [Morgen](https://www.morgen.so/blog-posts/todoist-pricing)):
- Limit aşılınca projeler salt-okunur kilitleniyor. "Verim rehin alındı" hissi veriyor, en sert tepki bu.
- 5 proje limiti "daha denerken" dolduğu için değerlendirme aşamasını sabote ediyor.
- Sık yükseltme istemleri günlük kullanımı rahatsız ediyor.

### TickTick: "ucuz ama takvim kilitli" modeli
Premium yıllık ~36 $ ile rakiplerden ucuz. Ama en güçlü kozu olan takvim görünümünün premium
olması, ücretsiz kullanıcının tam da en çok istediği şeyi kilitliyor
([Morgen karşılaştırması](https://www.morgen.so/blog-posts/ticktick-vs-todoist)).

### Things 3: tek seferlik ödeme
Platform başına tek ödeme (Mac 50 $, iPhone 10 $, iPad 20 $), abonelik yok
([fiyat analizi](https://richardriviere.com/things-3-pricing)). "Abonelik yorgunluğu" çağında
büyük övgü alıyor; iki yıldan uzun kullanımda Todoist Pro'dan ucuza geliyor. Eleştiriler: deneme
sürümü yok, ürün evrimi yavaş ([Calmevo incelemesi](https://calmevo.com/things-3-review/),
[Digital PM](https://thedigitalprojectmanager.com/tools/things-3-review/)).

### Docket için ders
Şimdilik ücretsiz bir proje. İleride bir ayrım yapılırsa kural net olmalı: günlük çekirdek
döngüyü (görev ekle/tamamla/hatırla) asla kilitleme. Adil bir çizgi şöyle olabilir: sınırsız
kişisel kullanım ücretsiz, ekip özellikleri (çok kullanıcılı proje, aktivite geçmişi), otomasyon
ve gelişmiş AI premium. "Salt-okunur kilit" gibi cezalandırıcı mekaniklerden uzak durmak lazım.

## 2. Onboarding (ilk kullanım deneyimi)

Araştırmanın özü şu: kullanıcı "aha anına" (ürünün değerini ilk hissettiği an) ne kadar hızlı
ulaşırsa o kadar kalıcı oluyor ([ProductLed](https://productled.com/blog/how-to-use-aha-moments-to-drive-onboarding-success), [Appcues](https://www.appcues.com/blog/aha-moment-guide)).
Bir todo uygulamasında aha anı belli: ilk görevi ekleyip tamamlamak.

Somut desenler:
- **Boş ekranı öğretmene çevir.** Boş durum (empty state), onboarding'in en değerli yüzeyi.
  Boş liste yerine "ilk görevini ekle" çağrısı ve tek bir örnek koy
  ([UserOnboard](https://www.useronboard.com/onboarding-ux-patterns/empty-states/),
  [72Technologies](https://www.72technologies.com/blog/empty-states-as-onboarding-surface)).
- **Örnek projeyle başlat.** Trello'nun "Welcome Board"u gibi, silinebilir, 3-4 görevlik bir
  "Docket'i keşfet" projesi. Kullanıcı tıklaya tıklaya öğrenir
  ([Appcues desen listesi](https://www.appcues.com/blog/user-onboarding-ui-ux-patterns)).
- **Kademeli açıklama (progressive disclosure).** İlk gün Kanban'ı, filtreleri, istatistiği
  anlatma. Kullanıcı 5+ görev ekleyince "bunları panoda görmek ister misin?" de.
- Uzun turlardan kaçın: 3 dakikayı aşan tanıtım turu atlanan tur demek.

## 3. Gamification: ne çalışıyor, ne geri tepiyor?

### Kanıt ne diyor?
- Alanın temel çalışması (Hamari ve ark., 24 deneysel çalışmanın incelemesi): gamification
  çoğunlukla olumlu sonuç veriyor (çalışmaların %62,5'inde), ama etki bağlama ve kullanıcıya
  çok bağlı, titiz deneylerde de küçülüyor
  ([makale PDF](http://creativegames.org.uk/modules/Gamification/Hamari_etal_Does_gamification_work-2014.pdf),
  [IEEE kaydı](https://ieeexplore.ieee.org/document/6758978/), [özet](https://drimify.com/en/resources/gamification-hamari-koivisto-sarsa-review/)).
- Eğitimde meta-analiz küçük-orta olumlu etki buluyor ([Springer](https://link.springer.com/article/10.1007/s10648-019-09498-w));
  fiziksel aktivite RCT meta-analizi de benzer yönde ([JMIR](https://www.jmir.org/2022/1/e26779)).
- Sonuç: hafif ve iyi tasarlanmış gamification işe yarıyor, oyunlaştırma yığını yaramıyor.

### İki uç örnek
- **Todoist Karma (hafif uç):** puan, seviye ve seri var; günlük akışa karışmıyor, isteyen kapatabiliyor.
  Dengeli bulunuyor ([Trophy vaka analizi](https://trophy.so/blog/todoist-gamification-case-study)).
- **Duolingo (yoğun uç):** seri mekaniği kayıptan kaçınma psikolojisiyle çalışıyor ve ertesi gün
  dönüş oranını dramatik artırdı. En önemli iki dersi: "seri dondurma" affı (riskli
  kullanıcılarda churn −%21) ve seri kırılınca suçlamak yerine dönüşü kutlamak
  ([Trophy Duolingo analizi](https://trophy.so/blog/duolingo-gamification-case-study),
  [DEV yazısı](https://dev.to/pocket_linguist/why-duolingos-gamification-works-and-when-it-doesnt-1d4)).
  Uyarı: mekanik amaca dönüşebilir. Seriyi korumak için kolay derse koşmak gibi, "boş görev
  ekleyip kapatma" davranışını teşvik etmemek gerek. Seriyi anlamlı tamamlanmaya bağlamalı.

### Docket için reçete
1. Seri + haftalık hedef + nazik seviye sistemi (Karma modeli). ✅ Puan altyapısı zaten var.
2. Haftada 1 otomatik "seri dondurma" hakkı.
3. Seri kırılınca: "5 günlük seri güzeldi, bugün yenisini başlat" (suçlama yok).
4. Hepsi kapatılabilir olsun. Gamification istemeyen kullanıcıya saygı göstermek retention'ı artırır.
