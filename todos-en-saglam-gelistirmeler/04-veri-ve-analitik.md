# 04: Veri ve Analitik

## 1. Piyasadaki üretkenlik istatistiği örnekleri

### Todoist Karma ([resmî sayfa](https://www.todoist.com/karma), [yardım](https://www.todoist.com/help/articles/introduction-to-karma-OgWkWy))
- Görevleri zamanında tamamlayınca, etiket/tekrar/hatırlatma gibi özellikleri kullanınca ve
  kendi koyduğun günlük/haftalık hedefe ulaşınca puan kazanılıyor.
- 4+ gün gecikmiş görevler puan kaybettiriyor (nazik bir baskı).
- Günlük/haftalık hedefe art arda ulaşmak seri (streak) oluşturuyor; puan biriktikçe
  "Acemi → Aydınlanmış" arası seviyeler atlanıyor.
- Üretkenlik görünümünde gün/hafta bazında tamamlanan görev grafikleri ve Karma eğilim çizgisi var
  ([Productivity view](https://www.todoist.com/help/articles/use-the-productivity-view-in-todoist-6S63uAa9)).
- Hafif dokunuşlu gamification'ın iyi dengelenmiş örneği sayılıyor
  ([Trophy'nin Todoist incelemesi](https://trophy.so/blog/todoist-gamification-case-study)).

### TickTick
Başarı skoru, tamamlama grafikleri, odak (pomodoro) süresi istatistikleri ve aylık özet sunuyor.
Takvim/istatistik derinliği premium'a bağlı ([TickTick özellikler](https://ticktick.com/features?language=en_us)).

## 2. Docket'te durum ve fırsat

✅ Zaten var: öncelik puanı sistemi, kişi başına atanan/tamamlanan sayısı ve tamamlama oranı
(`app-task-model.js` içindeki istatistik fonksiyonu), panoda "Başarı analizi" bölümü,
`gunluk-raporlar` klasörüyle rapor üretme alışkanlığı.

Eksik olan üç katman:

1. **Seri (streak):** "Üst üste N gün en az bir görev tamamladın." Todoist ve Duolingo'nun
   kanıtlanmış retention mekaniği. Mevcut tamamlanma verisinden tek sorguyla hesaplanır.
   Tasarım dersi: haftada 1 seri dondurma hakkı ver. Duolingo'da bu özellik riskli
   kullanıcılarda kaybı %21 azalttı. Seri kırılınca da suçlayan değil, dönüşü kutlayan bir dil
   kullan ([Trophy Duolingo analizi](https://trophy.so/blog/duolingo-gamification-case-study),
   [streak psikolojisi](https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature)).
2. **Kişisel içgörüler:** veriden çıkan, 1-2 cümlelik, eyleme dönük gözlemler:
   - "En verimli saatlerin 09:00-11:00, yüksek öncelikli işleri sabaha koy."
   - "Salı günleri tamamlama oranın %40 düşüyor."
   - "Bu görevi 3 kez erteledin, parçalara bölmek ister misin?" (alt görev önerisiyle)

   Hesaplar basit gruplama. İstenirse cümleye dökme işini mevcut Gemini altyapısı yapar.
3. **Haftalık özet:** Pazartesi sabahı bildirim merkezine düşen bir kart: geçen hafta
   tamamlananlar, seri durumu, bu haftanın en yoğun günü. E-posta gerekmiyor, mevcut panel yeter.

## 3. Raporlama ve dışa aktarma

| Format | Ne için | Uygulama notu |
|---|---|---|
| CSV | Excel'e dökme, yedek | En ucuz kazanım: görevleri filtreli halleriyle indir |
| ICS (takvim beslemesi) | Görevlerin son tarihlerini Google/Outlook takviminde görme | Salt-okunur abone linki; 2 yönlü senkron derdi yok (bkz. 02, Entegrasyonlar) |
| PDF raporu | Haftalık/proje raporu paylaşımı | `pdfkit` zaten projede kurulu (ekran görüntüsü altyapısında kullanılıyor), rapor şablonuna bağlamak kaldı |
| JSON tam yedek | Veri sahipliği/taşınabilirlik güveni | "Verini indir" düğmesi güven verir; rakiplerde kilitlenme şikâyeti yaygın |

## 4. Tasarım ilkeleri (istatistik gösterişe dönüşmesin)

- Her metrik bir karara bağlanmalı ("ne yapmalıyım?"), yoksa süs olur.
- Kıyas her zaman kişinin kendisiyle olsun ("geçen haftana göre"), başkalarıyla değil.
- Az ama isabetli göster: 3 sayı, 1 grafik ve 1 içgörü cümlesi, 12 grafikli panodan iyidir.
- Boş veri durumunu tasarla. İlk hafta boş grafik göstermek yerine "istatistik için 7 gün veri birikiyor" yaz.
