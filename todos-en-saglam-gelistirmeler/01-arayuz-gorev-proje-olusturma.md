# 01: Arayüz (UI/UX): Görev/Proje Oluşturma Akışları

7 popüler uygulamanın görev ve proje oluşturma akışlarını karşılaştırdım, kullanıcıları en çok
karıştıran noktaları çıkardım ve Docket için somut arayüz önerileri yazdım.

## 1. Uygulama karşılaştırması

| Uygulama | Görev oluşturma | Proje oluşturma | Hiyerarşi | Öne çıkan / sorunlu yönü |
|---|---|---|---|---|
| Todoist | Tek satır "Quick Add" (küresel kısayol), doğal dil: "yarın 16:00 #İş @telefon p1" | Kenar çubuğunda ayrı, küçük "+ Proje" | Proje → Bölüm → Görev → Alt görev | Doğal dil ayrıştırmada sınıfının en iyisi. Yazdıkça tarih/etiket canlı vurgulanır, cihaz üzerinde çevrimdışı bile çalışır ([Todoist yardım](https://www.todoist.com/help/articles/introduction-to-dates-and-time-q7VobO), [Calmevo rehberi](https://calmevo.com/todoist-natural-language-input-guide/)) |
| TickTick | Quick Add + doğal dil + sesli giriş + e-postayı göreve çevirme | Liste (proje) + Klasör | Klasör → Liste → Görev → Alt görev | Liste/Klasör/Etiket/Filtre kavram bolluğu yeni kullanıcıyı yorabiliyor; takvim ve alışkanlık takibi gömülü ([TickTick özellikler](https://ticktick.com/features?language=en_us)) |
| Things 3 | "Magic Plus" butonu: sürüklenip listede tam istenen yere bırakılıyor; boşluğa bırakınca Gelen Kutusu'na gider | Proje de "tamamlanabilir" bir şeydir; ilerledikçe dolan pasta grafiği olur | Alan (Area) → Proje → Görev → Kontrol listesi | Apple Design Award'lı, en çok övülen tasarım. "When" (ne zaman yapacağım) ile "Deadline" (son tarih) ayrımı kafa karışıklığını bitiren desen ([MacStories incelemesi](https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/), [Magic + yazısı](https://curtismchale.ca/2020/10/26/magic-button-things-3/)) |
| Notion | Görev = veritabanı satırı; önce yapı kurmak gerekir | Sayfa/veritabanı, kullanıcı kendi kurar | Sonsuz esnek (sayfa içinde sayfa) | Esneklik kurulum yüküne dönüşüyor; hızlı yakalama zayıf, büyük veritabanlarında yavaşlama şikâyetleri var ([Notion hız rehberi](https://www.notioneverything.com/blog/notion-slow)) |
| ClickUp | Her seviyede "+ Görev", ama önce Liste seçmek zorunlu | Space → Folder → List zinciri kurulmadan görev eklenemez | Workspace → Space → Folder → List → Görev → Alt görev → Kontrol listesi (7 seviye) | Reddit'te en sık şikâyet: bunaltıcı, öğrenme eğrisi dik, basit iş için fazla. Doğal dil girişi hâlâ kullanıcıların talep listesinde ([ClickUp özellik isteği](https://clickup.canny.io/feature-requests/p/natural-language-for-entering-task-due-dates-priority-tags-and-project)) |
| Asana | Görev projesiz de yaşayabilir ("My Tasks"e düşer) | Görev tek tıkla projeye dönüştürülebilir | Proje → Bölüm → Görev → Alt görev; bir görev birden çok projede olabilir (multi-homing) | Multi-homing güçlü ama kafa karıştırıcı; alt görevlerin proje listesinde görünmemesi klasik şikâyet ([Asana multi-homing](https://help.asana.com/s/article/how-to-multi-home-tasks?language=en_US), [görevden projeye dönüştürme tartışması](https://forum.asana.com/t/automatically-multi-home-when-task-converted-to-project/1019238)) |
| Trello | Kart = görev; listeye tek tıkla eklenir | Board = proje | Board → Liste → Kart → Kontrol listesi | Model o kadar basit ki karışıklık yok, ama büyüyünce yetersiz kalıyor (alt görev yok, hiyerarşi yok) |

## 2. Kullanıcıları en çok karıştıran noktalar

1. **Kavram enflasyonu.** ClickUp'ın 7 seviyeli hiyerarşisi ve Notion'ın "önce sistem kur"
   yaklaşımı, "sadece görev ekleyeyim" diyen kullanıcıyı kaçırıyor. Hiyerarşiyi 3 seviyede
   tutmak (Proje → Görev → Alt görev), gerisini etiket ve filtreyle çözmek mantıklı.
2. **Zorunlu konum seçimi.** "Bu görev hangi listeye?" sorusu daha yazarken akışı bozuyor.
   Çözüm Gelen Kutusu (Inbox) deseni: önce yakala, sonra organize et. GTD yaklaşımı bu;
   Todoist ve Things de temel akışını buna dayandırıyor.
3. **Görev mi proje mi ikilemi.** "Ev taşınması" görev mi proje mi? İki çözüm var: Things'in
   tamamlanabilir projesi ve Asana'nın "görevi projeye dönüştür" düğmesi. İkisi de sınırı
   akışkan yapıyor.
4. **Başlangıç/son tarih karmaşası.** Kullanıcı "bugün yapmak istediğim" ile "bugün teslim"
   ayrımını istiyor. Things'in When/Deadline ayrımı incelemelerde en çok övülen detay
   ([MacStories](https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/)).
   ✅ Docket'te başlangıç tarihi alanı zaten var, eksik olan "Bugün" görünümü (bkz. 07 numaralı dosya, öneri 4).

## 3. Hiyerarşi görselleştirme yöntemleri

| Yöntem | Kim kullanıyor | Ne zaman iyi |
|---|---|---|
| Kenar çubuğu ağacı (girintili) | Todoist, ClickUp, TickTick | Çok projeli kullanıcı; her an genel bakış |
| İlerleme pastası (proje = dolan daire) | Things 3 | Projenin "bitebilir" olduğunu hissettirir |
| Breadcrumb (Alan / Proje / Görev yolu) | ClickUp, Notion | Derin hiyerarşide "neredeyim?" sorusunu çözer |
| Kanban kolonları | Trello, TickTick ([Kanban yardımı](https://help.ticktick.com/articles/7055782353376903168)) | Durum odaklı akış. ✅ Docket'te var |
| Proje etiketi çipleri (multi-home) | Asana | Görev birden çok bağlamda yaşıyorsa |

## 4. Hızlı ekleme (Quick Capture) ve doğal dil desenleri

En iyi örnek Todoist'in Quick Add'i ([resmî sayfa](https://www.todoist.com/help/articles/introduction-to-dates-and-time-q7VobO)):

- Tek metin kutusu her şeyi alıyor: `"raporu bitir yarın 14:00 #Pazarlama @derin-iş p1 her hafta"`
- Ayrıştırılan tarih/etiket yazarken renkleniyor; yanlış ayrıştırmayı tıklayıp kapatabiliyorsun.
  Bu güven veren bir geri bildirim.
- Tekrarlayan ifadeleri de anlıyor, mesela "her ayın 3. salısı"
  ([Todoist tekrarlayan tarihler](https://www.todoist.com/help/articles/introduction-to-recurring-dates-YUYVJJAV)).
- Cihaz üzerinde çalışıyor, internet yokken bile ayrıştırma yapıyor.
- Uygulamanın her yerinden çalışan küresel klavye kısayolu var; mobilde widget/paylaşım menüsü.

Diğer yakalama kanalları: sesli giriş (TickTick), e-postayı göreve çevirme (TickTick/Todoist),
tarayıcı eklentisi, Things'te "Magic Plus" ile sürükleyip tam yerine ekleme.

## 5. Docket için arayüz önerileri

1. **Tek "+" düğmesi, tek metin kutusu.** Görev/proje ayrımını sorma, her şey görev olarak
   başlasın. Kutunun altında sade bir ipucu: `#proje  @etiket  !öncelik  "yarın 14:00"`.
2. **Gelen Kutusu.** Projesiz görevler otomatik buraya düşsün, kenar çubuğunda en üstte dursun.
   Boş Gelen Kutusu "sıfır sürtünmeli yakalama" mesajı versin.
3. **"Projeye dönüştür."** Görev detayında tek düğme: alt görevleri göreve, görevi projeye
   yükseltsin (Asana deseni). Tersi de olsun, küçülen proje göreve indirgensin.
4. **Türkçe doğal dil ayrıştırma.** "yarın", "salı 09:00", "her hafta", "gelecek ay" gibi
   ifadeleri tarihe çevirsin, ayrıştırılan kısım giriş kutusunda renklensin. Todoist 16+ dili
   destekliyor ama Türkçe desteği zayıf, bu bizim için fark yaratma fırsatı.
5. **Hiyerarşiyi 3 seviyede sabitle.** Proje → Görev → Alt görev. Daha derine inmek isteyene
   etiket + kayıtlı filtre öner. ClickUp'ın düştüğü tuzağa düşmemek lazım.
6. **Proje kartında ilerleme göstergesi.** Things'in pasta grafiği gibi tamamlanan/toplam görev
   oranı gösterilsin, proje "bitebilir bir şey" gibi hissettirsin. Kişi bazlı puan istatistiği
   zaten var, aynı hesap proje kartına taşınabilir.
