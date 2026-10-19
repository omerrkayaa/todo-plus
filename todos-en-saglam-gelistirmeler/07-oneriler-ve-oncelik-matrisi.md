# 07: Somut Geliştirme Önerileri ve Öncelik Matrisi

Araştırmanın tamamından süzdüğüm 10 öneri, kolay uygulanandan zora doğru sıralı. Bitirdikçe
kutucuğu işaretliyorum. Gerekçelerin ayrıntısı ilgili bölüm dosyalarında.

## Öneri listesi (kolay → zor)

- [x] 1. Gelen Kutusu (Inbox): *Çaba: Düşük · Etki: Yüksek*
  Projesiz görevler "Gelen Kutusu"na düşsün, kenar çubuğunda en üstte dursun. Görev eklerken
  "hangi proje?" sorusu ortadan kalkar (GTD'nin "önce yakala" deseni, Todoist ve Things'in temeli).
  → [01 numaralı dosya](01-arayuz-gorev-proje-olusturma.md), madde 2.2

- [x] 2. "Görevi projeye dönüştür" düğmesi: *Çaba: Düşük · Etki: Orta*
  Büyüyen görev tek tıkla projeye yükselsin (alt görevleri görev olur). Görev/proje ikilemini
  çözer (Asana deseni). → [01](01-arayuz-gorev-proje-olusturma.md), madde 2.3

- [x] 3. Tamamlananları arşivleme + temel indeksler: *Çaba: Düşük · Etki: Yüksek (uzun vadede)*
  Aktif liste yalnızca açık görevleri çizsin, tamamlananlar sayfalı "Arşiv"e gitsin. Supabase'de
  `project_id`, `due_date`, `status` kolonlarına indeks eklensin. Binlerce görevde hızın sigortası.
  → [03](03-performans-ve-teknik-altyapi.md), madde 1

- [x] 4. "Bugün / Yaklaşan" akıllı görünümleri: *Çaba: Orta · Etki: Çok yüksek*
  Mevcut başlangıç tarihi ve son tarih alanlarını Things'in övülen "When/Deadline" desenine bağla:
  "Bugün" = başlangıcı bugün olanlar + son tarihi bugün veya geçmiş olanlar. Günlük alışkanlık
  döngüsünün, yani her sabah uygulamayı açma sebebinin kalbi. → [01](01-arayuz-gorev-proje-olusturma.md), madde 2.4

- [x] 5. Hızlı Ekleme + Türkçe doğal dil ayrıştırma: *Çaba: Orta · Etki: Çok yüksek*
  Küresel kısayollu tek satır: `"raporu bitir yarın 14:00 #Pazarlama @rapor !yüksek her hafta"`.
  Ayrıştırılan kısımlar yazarken renklensin, yanlış ayrıştırma tıklanıp kapatılabilsin.
  Türkçe doğal dil desteği rakiplerde zayıf, bu bizim için fark yaratma fırsatı.
  Not: "tamamlandıktan sonra tekrarla" modu da buraya eklenebilir (Todoist'in `her hafta!`i).
  → [01](01-arayuz-gorev-proje-olusturma.md) madde 4, [02](02-ozellik-gelistirmeleri.md) madde 1

- [x] 6. Seri (streak) + haftalık özet: *Çaba: Orta · Etki: Yüksek (retention)*
  Mevcut puan/istatistik altyapısının üstüne: günlük seri, haftada 1 "seri dondurma" hakkı,
  pazartesi günü bildirim merkezine haftalık özet kartı, 1-2 kişisel içgörü cümlesi
  ("en verimli saatlerin 09-11"). Kapatılabilir olsun. → [04](04-veri-ve-analitik.md), [06](06-is-modeli-ve-retention.md) madde 3

- [x] 7. Takvim görünümü + ICS dışa aktarımı: *Çaba: Orta · Etki: Yüksek*
  Ay/hafta ızgarasında son tarihli görevler görünsün, sürükleyince tarih değişsin. Yanına
  salt-okunur ICS abone linki gelsin (Google/Outlook'ta görünür). 2 yönlü senkronun derdi
  olmadan değerin %80'i. TickTick'in Todoist'i geçtiği alan. → [05](05-kisisellestirme-ve-erisilebilirlik.md) madde 1, [02](02-ozellik-gelistirmeleri.md) madde 4
  Not: Abone-ol (canlı senkron) ICS linki, doküman asistanı sunucusu genel bir adrese taşınana
  kadar çalışmaz (şu an `http://127.0.0.1:3000`). Bu yüzden önce anında çalışan tek seferlik
  ".ics indir" butonunu ekledim. Dosyayı Google/Outlook Takvim'e içe aktarabilirsin.

- ~~8. Gemini ile "Günümü planla"~~: ❌ İptal ettim, istemediğim için yapılmayacak.

- [x] 9. Yorumlar + @bahsetme + Supabase Realtime canlı senkron: *Çaba: Orta-Yüksek · Etki: Yüksek (ekip kullanımı)*
  Görev detayına yorum akışı, `@kişi` bildirimi, aktivite kaydı; Supabase Realtime aboneliğiyle
  iki cihaz arasında canlı güncelleme (ücretsiz katmanda var). Çoklu atama özelliğini gerçek
  işbirliğine tamamlar. → [02](02-ozellik-gelistirmeleri.md), madde 3
  Not: Yorum akışı, aktivite kaydı (Geçmiş) ve Realtime canlı senkron zaten vardı. Bu turda
  eksik olan @bahsetmeyi ekledim: yazarken otomatik tamamlama, yorumda vurgulu gösterim ve
  bahsedilen kişiye bildirim merkezi kartı.

- [x] 10. Çevrimdışı mod + çakışma yönetimi: *Çaba: Yüksek · Etki: Orta-Yüksek*
  Çevrimdışı değişiklik kuyruğu → bağlantı gelince alan bazlı birleştirme → çözülemeyende
  "hangisi kalsın?" kartı. "Son yazan kazanır" tuzağına (sessiz veri kaybı) düşmemek lazım.
  En son yapılacak iş, 3. ve 9. maddelerin üstüne kurulur. → [02](02-ozellik-gelistirmeleri.md), madde 5
  Uygulama planı: [09 numaralı dosyada](09-cevrimdisi-mod-adim-adim.md), 8 adımlık işaretlenebilir liste.
  *(2026-07: Tamamlandı. Alan bazlı üç yönlü birleştirme, çakışma kartı ve çevrimdışı açılış
  (vendored supabase-js) hazır, bkz. [09-cevrimdisi-mod-adim-adim.md](09-cevrimdisi-mod-adim-adim.md).)*

Bunlara ek olarak sürekli bir iş var, belirli bir sırası yok: erişilebilirlik borcunu kapatmak.
Kanban'a klavye alternatifi (WCAG 2.5.7), `aria-live` duyuruları, görünür odak, önceliğe renk
yanında ikon. → [05](05-kisisellestirme-ve-erisilebilirlik.md), madde 4

İlk turda şunlar bitti: Kanban kartlarında ◀/▶ durum taşıma düğmeleri, güçlendirilmiş
`:focus-visible` odak halkası, takvim çiplerinde `!`/`!!`/`!!!` öncelik işaretleri, sütunlara
ekran okuyucu etiketleri, durum değişiminde görev adıyla `aria-live` duyurusu. 2026-07-19'da
mevcut (tek) temanın kontrast denetimini yaptım: `.eyebrow` ve `.stat-kicker` etiketleri
(2.7:1 ve 2.5:1 idi) ile success/danger rozet renkleri 4.5:1 eşiğinin üstüne çıktı.
*(2026-07: Koyu tema eklendi, bkz. [05 numaralı dosya, madde 2](05-kisisellestirme-ve-erisilebilirlik.md).
~300 sabit renk kodu CSS değişkenlerine taşındı, ayrı bir koyu palet tanımlandı (Aydınlık/Koyu/Sistem,
tercih cihazda saklanır) ve iki palet de WCAG AA (4.5:1 metin, 3:1 UI sınırı) için otomatik bir
betikle doğrulandı. Erişilebilirlik borcunun bu kısmı kapandı.)*

## Öncelik matrisi

| | Düşük çaba | Orta çaba | Yüksek çaba |
|---|---|---|---|
| Çok yüksek etki | | † 4. Bugün/Yaklaşan · † 5. Hızlı Ekleme+NLP | |
| Yüksek etki | † 1. Gelen Kutusu · 3. Arşiv+indeks | † 6. Seri+özet · 7. Takvim+ICS | 9. Yorum+Realtime |
| Orta etki | 2. Projeye dönüştür | | 10. Çevrimdışı mod |

† = ilk dalgada yapılması önerilenler. Sıralama mantığı: önce sürtünmeyi azalt (1→5),
sonra alışkanlık kur (4, 6), sonra genişle (7→10).

## En çok fark yaratacak 3 alan

### 1. Hızlı Yakalama Paketi (öneriler 1 + 2 + 5)
Araştırmanın en net bulgusu şu: kazanan uygulamaların ortak çekirdeği, görev eklemenin saniyeler
sürmesi (Todoist Quick Add, Things Magic Plus). ClickUp ve Notion'ın en büyük şikâyet kaynağı da
tam tersi, yani eklemeden önce düşünmeye zorlamaları. Türkçe doğal dil ayrıştırma pazarda zayıf,
elimizdeki en somut farklılaşma kartı bu.

### 2. Günlük Alışkanlık Döngüsü (öneriler 4 + 3)
"Bugün" görünümü, kullanıcının uygulamayı her sabah açma sebebi. Retention'ın temeli özellik
bolluğu değil, bu döngü. Things'in en övülen deseni (When/Deadline) bizim veri modelimizde zaten
hazır, sadece görünüm eksikti. Arşivleme de bu görünümü kalıcı olarak hızlı tutuyor.

### 3. Motivasyon ve İçgörü (öneri 6)
Kanıt net: hafif gamification çoğunlukla işe yarıyor (Hamari'de %62,5 olumlu), seri mekaniği
dönüş oranını dramatik artırıyor (Duolingo), af mekanizması churn'ü düşürüyor (−%21).
Puan altyapısı hazır olduğu için maliyet düşük, retention getirisi yüksek.
