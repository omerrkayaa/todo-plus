# 10: Tema ve Görünüm Çalışması: Durum Notu

19 Temmuz 2026'da yaptığım tema çalışmasının eksiksiz durumunu tutuyorum. İş bugün bitmezse
ya da yarına sarkarsa buradan devam edeceğim. İki ayrı iş var: (1) koyu tema, bitti;
(2) "rota ve raf" projesinin kağıt paletine geçiş, işleniyor.

*Son güncelleme: 19 Temmuz 2026, akşam*

## Nasıl başladı

Koyu temayı nasıl test edeceğimi düşünürken Docket'te koyu tema hiç olmadığını fark ettim.
Roadmap'e baktım ([05-kisisellestirme-ve-erisilebilirlik.md](05-kisisellestirme-ve-erisilebilirlik.md),
"Koyu tema artık beklenti, lüks değil") ve koyu temayı baştan sona yaptım. Sonra masaüstündeki
ayrı projem "rota and raf"ın renk ve yazı uyumunu beğendiğimi fark ettim ve Docket'in ona
yaklaşmasını istedim.

## Bölüm 1: Koyu tema (light/dark/system): tamamlandı

- Commit: `4af62a7`, "Add dark theme (light/dark/system) with full color-token migration"
- ~300 sabit renk kodu (217'si) CSS değişkenine taşındı. Kalan ~78'ini bilerek sabit bıraktım
  (her zaman koyu kalan kenar çubuğu, giriş ekranı tanıtım paneli, toast'lar).
- Sağ üstte ay/güneş ikonlu bir düğme Aydınlık / Koyu / Sistem seçimini veriyor. Seçim
  `data-theme` özniteliğiyle uygulanıyor, `todo_plus_theme_v1` anahtarıyla yerelde saklanıyor ve
  sayfa ilk boyanmadan önce senkron bir betikle uygulanıyor (yanıp sönme yok).
- Kontrast: WCAG AA (4.5:1) doğrulandı. Koyu modda beyaz metinli düğmeler için ayrı
  `--primary-solid`/`--danger-solid` token'ları ekledim. Parlatılmış `--primary`/`--danger`
  renkleri metin için iyiydi ama düğme zemini olarak kontrastı düşürüyordu.
- Testler: `npm run test:server` (14/14), `npm test` (15 birim + smoke + offline e2e), hepsi yeşil.
- Bilinen sınırlama (uygulama hatası değil): Live Server + DevTools "Offline" kutusuyla test
  ederken F5 sayfayı hiç yükleyemiyor, çünkü yerel sunucuya giden istekler de kesiliyor. Gerçek
  uçak modunda bu sorun büyük ihtimalle çıkmaz. Ayrıntı: [09 numaralı dosya, "Test için pratik
  not"](09-cevrimdisi-mod-adim-adim.md).
- Gelecek fikri (henüz yapılmadı, ayrı not): Service Worker ile "sunucu bile olmasa açılsın".
  Bkz. [02-ozellik-gelistirmeleri.md, madde 5](02-ozellik-gelistirmeleri.md).

## Bölüm 2: "Rota ve raf" kağıt paleti: işleniyor

Karar süreci: Önce bir karşılaştırma sayfası hazırlayıp üç seçeneğe baktım. "Şu an" bugünkü
mor/mavi Docket. "A: sadece uyum ödünç al" seçeneğinde nötrler ısınıyor, belirgin renkli
Trello tarzı paneller ve mor marka rengi aynen kalıyor. "B: tam kapsamlı cilalama" ise
rota-ve-raf'ın kağıt paleti ve serif başlıkları, panel renkleri de yumuşuyor. B'yi seçtim.

Önemli gerilim: Birkaç gün önce proje/kategori panellerinin ve kanban sütunlarının belirgin,
doygun renkte olmasını özellikle istemiştim. B bu tercihi bilerek yumuşatıyor, panel renkleri
artık kağıt tonlarında, doygun değil. Bu geriye dönük bir hata değil, bilinçli yeni tercihim.

Uygulanan tam palet:

| Token | Açık | Koyu |
|---|---|---|
| `--bg` | `#f4f0e8` | `#121513` |
| `--surface` (kağıt) | `#fffaf1` | `#1b201d` |
| `--text` (mürekkep) | `#151515` | `#f4efe5` |
| `--muted` | `#666052` | `#b9b1a2` |
| `--primary` / `--success` / Kategori | `#21473a` (yeşil) | `#79a58d` |
| `--danger` | `#a94432` (kırmızı) | `#e2836d` |
| `--warning` / `--note` / Davet | `#b48a45` (altın) | `#d5aa62` |
| Proje / "devam ediyor" (`--accent-blue`) | `#3d5a75` (gömme mavisi) | `#7fa3c2` |
| Marka/oluşturma / "@bahsetme" (`--accent-purple`) | `#5c3f52` (mürdüm) | `#b48aa3` |
| `--radius` | 16px → 12px (rota-ve-raf'ın daha keskin köşelerine yaklaşıldı) | |

Rota-ve-raf'ta yalnızca 3 vurgu rengi var (yeşil/kırmızı/altın), ama Docket'te aynı anda yan
yana görünmesi gereken 4 farklı panel var: dashboard'da 4 panel, kanban'da "devam ediyor" ile
"tamamlandı" yan yana. Bu yüzden aynı sıcak, toprak tonlu dile sadık kalıp iki soluk ton
ekledim (gömme mavisi ve mürdüm). Hepsini yeşile boğmak, yan yana duran panelleri ayırt
edilemez yapardı.

Başlıklarda serif (Georgia) var. Rota-ve-raf'taki gibi yalnızca yapısal başlıklar (h1-h3, marka
adı) serif olacak. Buton, etiket ve görev metni gibi geri kalan her şey sans-serif (Inter) kalacak.

Şu anki durum: Bu değişiklikler arka planda işleniyor. Tamamlanınca:

- [ ] Commit hash'i buraya eklenecek
- [ ] Ekran görüntüleri kontrol edilecek (dashboard, kanban, projeler sayfası). Kanban'daki
      "devam ediyor"/"tamamlandı" ile dashboard'daki 4 panelin hâlâ birbirinden ayırt
      edilebildiğine özellikle bakılmalı
- [ ] `npm test` sonucu doğrulanacak
- [ ] Tarayıcıda el testi için kısa adımlar yazılacak
- [ ] "Belirgin doygun renk" tercihimin bu paneller özelinde "kağıt tonu, yumuşak renk" yönünde
      evrildiği not edilecek (tamamen terk mi ettim, yoksa geneli mi kapsıyor, sonuçtan sonra
      netleşecek)
- [ ] Bu dosyanın en üstündeki durum satırı "tamamlandı" olarak güncellenecek

## Yarın buradan devam edersem

1. Önce bu dosyayı okuyacağım. Üstteki tabloda tüm renk kararları ve gerekçeleri var, tekrar
   sorgulamaya gerek yok.
2. İş bitmiş mi diye son commit'lere bakacağım (`git log --oneline -5`). "rota", "raf" ya da
   "kağıt" geçen bir commit varsa bitmiştir.
3. Bitmemişse ya da yarım kalmışsa yukarıdaki tablo ve gerekçelerle devam edeceğim, sıfırdan
   tasarım kararı vermeye gerek yok.
4. Bitmişse yukarıdaki kontrol listesini tamamlayıp bu dosyayı "tamamlandı" yapacağım.
