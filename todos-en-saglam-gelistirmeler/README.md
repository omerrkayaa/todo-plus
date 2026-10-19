# Docket: en sağlam geliştirmeler araştırması

Bu klasör, Docket'i bir adım ileri taşımak için yaptığım pazar ve UX araştırmasının notlarını
içeriyor. Todoist, TickTick, Things 3, Notion, ClickUp, Asana ve Trello'ya baktım; kullanıcı
şikâyetlerini, UX makalelerini ve akademik çalışmaları da ekledim. Geliştirmeye devam
ederken yol haritası olarak bunu kullanacağım.

*Hazırlanma tarihi: 16 Temmuz 2026*

## Dosyalar

| Dosya | İçerik |
|---|---|
| [01: Arayüz: Görev/Proje Oluşturma](01-arayuz-gorev-proje-olusturma.md) | 7 uygulamanın oluşturma akışları, karışıklık noktaları, hızlı ekleme ve doğal dil desenleri, arayüz önerileri |
| [02: Özellik Geliştirmeleri](02-ozellik-gelistirmeleri.md) | Otomasyon, akıllı bildirimler, işbirliği, entegrasyonlar, offline çalışma |
| [03: Performans ve Teknik Altyapı](03-performans-ve-teknik-altyapi.md) | Binlerce görevde hız, senkronizasyon tutarlılığı, arama/filtreleme performansı |
| [04: Veri ve Analitik](04-veri-ve-analitik.md) | Üretkenlik istatistikleri, kişisel içgörüler, raporlama/dışa aktarma |
| [05: Kişiselleştirme ve Erişilebilirlik](05-kisisellestirme-ve-erisilebilirlik.md) | Görünüm modları, tema, klavye kısayolları, erişilebilirlik |
| [06: İş Modeli ve Retention](06-is-modeli-ve-retention.md) | Ücretsiz/premium ayrımı, onboarding, gamification örnekleri ve etkinliği |
| [07: Öneriler ve Öncelik Matrisi](07-oneriler-ve-oncelik-matrisi.md) | Ana çıktı: kolaydan zora sıralı 10 somut öneri, öncelik matrisi ve ilk 3 odak alanı |
| [08: Kaynaklar](08-kaynaklar.md) | Tüm bölümlerde kullandığım kaynakların toplu listesi |
| [09: Çevrimdışı Mod: Adım Adım Plan](09-cevrimdisi-mod-adim-adim.md) | 10 numaralı önerinin (çevrimdışı mod + çakışma yönetimi) uygulama planı, 8 adımlık işaretlenebilir liste |

## Nasıl kullanıyorum?

1. Sıradaki işi 07 numaralı dosyadan seçiyorum.
2. Bir öneri bitince 07'deki kutucuğu `[x]` yapıyorum.
3. Yeni fikirleri ilgili bölüm dosyasına not düşüyorum. Klasör zamanla büyüyen bir belge.

## Docket'te şu an ne var?

Uygulamanın temeli sağlam, araştırmadaki öneriler bunun üstüne kuruldu:

- ✅ Projeler (arşivleme + proje son tarihi)
- ✅ Görevler: alt görevler, dosya ekleri, öncelik puanları
- ✅ Serbest etiketler ve etikete göre filtreleme
- ✅ Bir göreve birden fazla kişi atama + kişi bazlı tamamlama istatistiği
- ✅ Başlangıç tarihi ile son tarih ayrımı
- ✅ Tekrarlayan görevler
- ✅ Kanban panosu ve gelişmiş filtreler (durum/öncelik/proje/kişi/etiket)
- ✅ Uygulama içi bildirim merkezi
- ✅ Belge asistanı (Gemini + Voyage + Supabase, ücretsiz katman)
- ✅ Supabase senkronizasyonu + yerel depolama

## En çok fark yaratacak 3 alan

Gerekçesi [07 numaralı dosyada](07-oneriler-ve-oncelik-matrisi.md):

1. Hızlı Yakalama Paketi: doğal dilli Hızlı Ekleme, Gelen Kutusu ve "görevi projeye dönüştür".
   Rakiplerin en sevilen çekirdek özelliği bu, görev eklemenin sürtünmesini sıfıra indiriyor.
2. Akıllı Görünümler + Performans Temeli: "Bugün / Yaklaşan" görünümleri, tamamlananları
   arşivleme, liste sanallaştırma. Günlük alışkanlık döngüsünü kuruyor, binlerce görevde de
   hızı koruyor.
3. Motivasyon ve İçgörü: seri (streak), "seri dondurma" ve haftalık özet. Retention için
   kanıtlanmış, ucuz bir mekanik (Duolingo'da churn'ü %21 azalttı, Todoist de Karma ile aynı yolda).
