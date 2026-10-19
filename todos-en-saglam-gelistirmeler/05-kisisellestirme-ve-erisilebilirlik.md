# 05: Kişiselleştirme ve Erişilebilirlik

## 1. Görünüm modları

Piyasa standardı, aynı görev verisini birden çok görünümde gösterebilmek
([TickTick görünümler yardımı](https://help.ticktick.com/articles/7055782381696843776)):

| Görünüm | Kim iyi yapıyor | Docket durumu |
|---|---|---|
| Liste | Herkes | ✅ var |
| Kanban | Trello, TickTick ([Kanban yardımı](https://help.ticktick.com/articles/7055782353376903168)) | ✅ var |
| Takvim | TickTick (rakiplerinden üstün bulunuyor, [Morgen](https://www.morgen.so/blog-posts/ticktick-vs-todoist)) | ❌ yok, en değerli eksik görünüm |
| Eisenhower Matrisi (acil/önemli 4 çeyrek) | TickTick, çeyrek kurallarını liste/etiket/tarih/önceliğe göre otomatik dolduruyor ([yardım](https://help.ticktick.com/articles/7055782055577124864)) | ❌ yok. Öncelik alanımız olduğu için ucuz kazanım: 4 kolonlu CSS grid + mevcut öncelik verisi |
| Zaman çizelgesi (hafif Gantt) | TickTick, ClickUp | Başlangıç + son tarih alanları ✅ olduğu için ileride mümkün; öncelik değil |

Her görünüm aynı filtrelerle çalışmalı (görünüm değişince filtre kaybolmasın) ve son seçilen
görünüm hatırlanmalı.

## 2. Tema ve görünüm tercihleri

- Koyu tema artık lüks değil, beklenti. CSS değişkenleriyle (custom properties) aydınlık/koyu/sistem
  seçeneği sun, tercihi yerelde sakla.
- Yoğunluk ayarı: "rahat / sıkışık" satır yüksekliği. Çok görevli kullanıcının küçük ama
  çok sevilen isteği.
- 2-3 vurgu rengi yeterli. Sonsuz özelleştirme (Notion tuzağı) bakım yükü getirir.

**Durum (2026-07-19): Koyu tema yapıldı.** Üst çubukta ay/güneş simgesiyle Aydınlık/Koyu/Sistem
arasında geçiş var. Tercih `localStorage`'da saklanıyor ve sayfa boyanmadan önce uygulanıyor,
yani yanıp sönme yok. "Sistem" seçiliyken işletim sistemi tercihini saf CSS (`prefers-color-scheme`)
canlı izliyor. `styles.css`'teki ~300 sabit renk kodu CSS değişkenlerine taşındı, ayrı bir koyu
palet tanımlandı ve iki palet de WCAG AA (4.5:1 metin, 3:1 UI sınırı) için otomatik bir betikle
doğrulandı. Bazı renkler (buton üzerindeki beyaz metin gibi) koyu temada özel "buton-güvenli"
tonlar kullanıyor, çünkü metin için parlatılmış rengin üzerindeki beyaz yazı yeterince
okunmuyordu. Bilerek değiştirmediğim yerler: her zaman koyu kalan kenar çubuğu, giriş
ekranındaki tanıtım paneli ve bildirim balonu (toast). Bunlar tema ne olursa olsun aynı görünüyor.
Yoğunluk ayarı ve ek renk temaları hâlâ yapılmadı.

## 3. Klavye kısayolları ve hızlı komutlar

- Todoist, TickTick ve Things'in ortak gücü fare olmadan tam kullanım. Asgari set: `Q` hızlı
  ekleme, `/` arama, `↑↓` gezinme, `E` tamamla, `1-4` öncelik, `?` kısayol listesi.
- Komut paleti (Ctrl+K): Linear'ın popülerleştirdiği desen, tüm eylemler tek kutudan.
  Hızlı Ekleme kutusu yapılırken aynı bileşen komut paletine genişletilebilir.
- Sesli giriş: tarayıcının Web Speech API'siyle "konuşarak görev ekle". TickTick'in sevilen
  özelliği, web'de ücretsiz denenebilir (Chrome'da iyi, diğerlerinde kademeli düşüş).

## 4. Erişilebilirlik (a11y)

Mevcut durum: ✅ arayüzde `aria-label` kullanımı var (filtre bölümünde gördüm). İyi bir
başlangıç ama sistematikleştirmek gerek.

- **Sürükle-bırakın klavye alternatifi (en kritik madde):** WCAG 2.2'nin 2.5.7 kriteri,
  sürüklemeyle yapılan her işlemin sürüklemesiz de yapılabilmesini şart koşuyor. Kanban'da kartı
  taşımak için "Taşı → durum seç" menüsü veya ok tuşları eklenmeli
  ([TPGI, erişilebilir sürükle-bırak](https://www.tpgi.com/the-road-to-accessible-drag-and-drop-part-1/),
  [WCAG 2.2 ve sürükleme](https://orases.com/blog/wcag-2-2-drag-and-drop-accessibility/)).
- **Ekran okuyucu duyuruları:** görev tamamlanınca/taşınınca `aria-live` bölgesiyle "Görev
  tamamlandı" duyurusu; Kanban kolonlarına `role` ve durum bilgisi.
- **Görünür odak:** Tab ile gezinirken odaklanan öğe belirgin bir çerçeve almalı (WCAG 2.4.7).
- **Renge yaslanma:** öncelik yalnızca renkle gösterilmesin, yanına ikon/etiket gelsin
  (renk körü kullanıcılar için; `!`, `!!`, `!!!` gibi).
- **Kontrast:** metin/arka plan oranı en az 4.5:1 olmalı; koyu tema yapılırken birlikte test edilmeli.

Bunlar yalnızca engelli kullanıcılara yönelik özellikler değil. Klavye kısayolu isteyen güçlü
kullanıcıyla ekran okuyucu kullanıcısı aynı altyapıdan faydalanıyor.
