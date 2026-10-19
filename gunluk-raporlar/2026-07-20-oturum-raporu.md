# Docket geliştirme günlüğü (2026-07-20)

## Bugün ne yaptım?

Bugünkü çalışma iki bölümden oluştu. İlk kısımda "Görev Yönetimi" ekranındaki kullanıcı deneyimi sorunlarıyla uğraştım: 13 ayrı değişiklik, 5 git commit. Her değişiklikte önce koda bakıp sorunun kök nedenini buldum, sonra düzelttim, sonra da otomatik testlerle (30 test) ve Playwright ile gerçek tarayıcıda gerçekten çalışıp çalışmadığını kontrol ettim (madde 1-11). İkinci kısmı projenin kapsamlı Word raporuna ayırdım: 6 git commit, rapor içeriği, 5 mimari diyagram ve 11 ekran görüntüsü (madde 12). Kod değişikliklerini aşağıda önce sorunu, sonra nedenini, çözümü ve doğrulamayı anlatarak yazdım. Rapor sürecini kronolojik sırayla anlattım, en sonda da sık sorulan sorular var.

Commit'ler kronolojik sırayla:

| Commit | Saat | Konu |
|---|---|---|
| `3e89c3f` | 01:36 | Görev geçmişindeki gereksiz tekrar kayıtlarını önleme |
| `bb24597` | 01:59 | Görev ekranı: açılış kaydırma, boş tamamlama onayı, sınırlı düzenleme, durum sadeleştirme |
| `ce4d945` | 02:23 | Gereksiz buton kaldırma, geçmişi akordeona alma, metin koyulaştırma |
| `29efa6e` | 02:36 | Varsayılan görev tarihleri, saat dilimi hatası düzeltmesi |
| `4d1e4c3` | 02:50 | Hızlı ekle sözdizimi rehberi |
| `8baf575` | 03:24 | Genel proje raporu ve bugünkü oturum raporu eklendi, README güncellendi |
| `c6ecdf4` | 03:36 | Kapsamlı Word raporu (.docx) üretildi, eski ara rapor/scriptler temizlendi |
| `381f83a` | 03:53 | Rapor birinci ağızdan yeniden yazıldı, 5 mimari diyagram eklendi |
| `be9879f` | 03:57 | Eski/güncel olmayan geliştirme süreci ara raporu silindi |
| `35663b3` | 04:06 | Ekran görüntüleri güncellendi, 2 yeni görüntü eklendi |
| `c8387c9` | 04:23 | Devasa/bozuk ekran görüntüleri düzeltildi, her görsele açıklama eklendi |

İlk 5 commit uygulama koduna dokunuyor. 03:24'ten sonrakiler Word raporuyla ilgili: kod değişmedi, yalnızca dokümantasyon, rapor ve görsel üretildi. Aşağıdaki 1-11. maddeler kod değişikliklerini, 12. madde rapor hazırlama sürecini anlatıyor.

---

## 1. Görev geçmişindeki gereksiz tekrar kayıtlarını önleme (`3e89c3f`)

Bir görevi düzenleyip "Kaydet"e bastığımda, hiçbir alanı değiştirmemiş olsam bile geçmişe (History) her seferinde yeni bir "Görev bilgileri güncellendi. Bekliyor → Bekliyor" satırı ekleniyordu. Ekran görüntüsünde onlarca aynı satır birikmişti.

Sebep `app.js` içindeki `updateTaskFromForm` fonksiyonuydu: formun her kaydında hangi alanların değiştiğine bakmadan koşulsuz `state.history.push(...)` çağırıyordu.

Fonksiyona bir değişiklik tespiti ekledim. Görevin eski hâli ile formdan gelen yeni hâli alan alan (başlık, açıklama, öncelik, tarihler, atananlar vb.) karşılaştırılıyor. Hiçbir alan değişmemişse geçmişe kayıt eklenmiyor ve sadece "Değişiklik yapılmadı; görev aynı kaldı." uyarısı çıkıyor. Değişiklik varsa not artık neyin değiştiğini söylüyor, örneğin `"Görev güncellendi: başlık, öncelik."` Durum aynı kaldıysa rozet `Bekliyor → Bekliyor` yerine tek bir `Bekliyor` gösteriyor. Ayrıca `getTaskHistoryItems` fonksiyonuna, geçmişte birikmiş birebir aynı ardışık eski kayıtları (aynı not, durum, kişi ve tarih) görünümde tek satıra indiren bir filtre koydum. Böylece eski veri de temizlenmiş oldu.

Önce `node --check` ile sözdizimine baktım, sonra gerçek tarayıcıda üç şeyi denedim: hiçbir alanı değiştirmeden kaydettiğimde geçmişe kayıt eklenmedi; başlık ve önceliği değiştirip kaydettiğimde not tam olarak `"Görev güncellendi: başlık, öncelik."` çıktı; aynı gün iki kez aynı değişikliği yaptığımda görünümde tek satıra indi. 4 test komutu (server 14/14, sync-merge 15/15, smoke test, offline test) ve 10 hedefli tarayıcı kontrolünün hepsi geçti.

---

## 2. Görev detayının en üstten açılması (`bb24597`)

Bir göreve tıklayıp detayını açtığımda ekran en üstten (başlık ve açıklama) değil, en alttan (geçmiş ve yorum kutusu) açılıyordu. Başka bir ekrana düşmüş gibi hissettiriyordu.

`openTaskDetail` fonksiyonu modal açılırken klavye odağını doğrudan yorum yazma kutusuna (`taskCommentText`) veriyordu. O kutu görev detayının en altında olduğu için tarayıcı, odaklanan elemanı görünür yapmak adına sayfayı otomatik olarak en alta kaydırıyordu. `element.focus()` çağrıldığında tarayıcı o elemanı ekrana getirmeye çalışır, bu da JavaScript'in bilinen bir davranışı.

Odak hedefini en üstteki "Kapat" butonuna (`closeTaskDetailBtn`) çevirdim ve gövdenin açılışta kesin olarak en üstte durması için `taskDetailBody.scrollTop = 0` satırını ekledim.

Playwright ile modal açıldığında `scrollTop === 0` olduğunu ve odağın kapat butonunda durduğunu ölçtüm. Yorumlarla dolu, kaydırma gerektiren bir görevde de denedim, geçti.

---

## 3. Alt görevler ve Yorumlar bölümlerine açıklama metni (`bb24597`, sonra `ce4d945`'te koyulaştırıldı)

İlk kez kullanan biri görev detayındaki "Alt görevler" ve "Yorumlar" başlıklarının ne işe yaradığını anlamayabilir. İki başlığın altına da kısa birer açıklama cümlesi ekledim:

- Alt görevler: *"Bu görevi küçük adımlara böl; her adımı bitirdikçe işaretle, üstte kaçının tamamlandığını gör."*
- Yorumlar: *"Görevle ilgili not bırak; birinden bahsetmek için @ad yaz, ona bildirim gitsin."*

Bu metinler için CSS'te yeni bir `.section-hint` sınıfı tanımladım. İlk halini soluk gri ve italik (`--muted` rengi) yapmıştım, ama okuması zordu. Önce `--text-secondary`'ye, sonra bir tık daha koyulaştırıp en koyu tona (`--text`) çektim. Aynısını görev açıklaması metni için de (`.detail-block p`) yaptım.

Doğrulama olarak görsel ve erişilebilirlik kontrolü yaptım, Playwright ile de bu metinlerin DOM'da bulunduğunu doğruladım.

---

## 4. Boş görev tamamlamada onay isteme (`bb24597`)

Hiçbir alt görev, yorum ya da dosya eklemeden doğrudan "Tamamla"ya basmak mümkündü. Bu, boş ödev göndermek gibi hissettiriyordu ve yanlışlıkla erken tamamlama riski vardı.

`updateTaskStatus` fonksiyonuna bir kontrol ekledim. Görev "tamamlandı" yapılmak istendiğinde, o görevde hiç alt görev, yorum ve dosya eki yoksa tarayıcının yerleşik `confirm()` penceresi şunu soruyor: *"Bu görevde henüz alt görev, yorum veya dosya eklemediniz. Yine de tamamlandı olarak işaretlensin mi?"* "İptal" dersem görev tamamlanmıyor ve durumu değişmiyor. Kontrol tek bir fonksiyonda durduğu için görev kartındaki "Tamamla" butonu, Kanban'daki ok butonları ve görev detayındaki durum seçici kendiliğinden bu kurala tabi oldu, kod tekrarı da olmadı.

Playwright ile alt görevi ve yorumu olmayan bir görevde "Tamamla"ya bastım: `confirm()` penceresi açıldı, "İptal"te görev `bekliyor` durumunda kaldı, "Tamam"da `tamamlandi` oldu.

Testte bir yan etki de çıktı. Mevcut `scripts/offline-sync-test.mjs` bu yeni onay penceresini beklemiyordu ve test görevinde alt görev ya da yorum olmadığı için 15 saniye sonra zaman aşımına düşüyordu. O dosyaya `page.on("dialog", (dialog) => dialog.accept())` satırını ekledim; test artık pencereyi otomatik kabul ediyor ve geçiyor.

---

## 5. Atanan kullanıcıya kendi görevinde sınırlı düzenleme yetkisi (`bb24597`)

Görev düzenleme (✎ butonu) yalnızca yöneticilere açıktı. Normal bir kullanıcı, kendisine atanan görevi tamamladıktan sonra bile üzerinde hiçbir şey yapamıyordu: alt görev ekleyemiyor, dosya yükleyemiyordu. Bunu iki katmanda çözdüm.

Arayüz katmanında, görev kartında artık atanan kullanıcı için de "✎ Düzenle" butonu görünüyor (`isTaskAssignee(task)` kontrolünü ekledim). Form açıldığında kullanıcı yönetici değilse başlık, açıklama, proje, öncelik, tarihler, süre, tekrar aralığı, atanan/veren kişi seçimi ve etiket alanları `disabled` yapılıyor (`applyTaskFormPermissions` fonksiyonu). Yalnızca alt görev ekleme/düzenleme ve dosya yükleme açık kalıyor. Formun üstünde de bunu açıklayan bir uyarı çıkıyor: *"Bu görev size ait olduğu için yalnızca alt görev ve dosya ekleyebilirsiniz..."*

Mantık katmanında, `updateTaskFromForm` içinde yönetici olmayan bir kullanıcıdan gelen veri işlenirken yönetimsel alanları (başlık, tarih, öncelik vb.) görevin mevcut değerine sabitliyorum. Biri tarayıcı geliştirici araçlarıyla `disabled` özelliğini elle kaldırsa bile formdan ne gönderirse göndersin bu alanlar değişmiyor.

Bu JS kontrolü tarayıcıda çalıştığı için tek başına gerçek bir güvenlik sınırı sayılmaz, çünkü kullanıcı JS kodunu değiştirip atlatabilir. Gerçek sınır zaten veritabanında: `supabase-schema.sql` içindeki `protect_task_management_fields` adlı trigger fonksiyonu, yönetici olmayan biri görev üzerinde `UPDATE` yapmaya kalktığında başlık, açıklama, öncelik ya da tarih gibi alanlardan biri değişmişse işlemi reddedip hata fırlatıyor (`'Calisan yalnizca gorev durumunu degistirebilir.'`). Bugün eklediğim JS katmanı yalnızca deneyimi iyileştiriyor: kullanıcı "yasak" bir işlemi baştan denemesin, denerse de anlaşılır bir açıklama görsün. Yazılımda buna katmanlı savunma (defense in depth) deniyor.

Playwright ile normal kullanıcı olarak (`ayse@example.com` demo hesabıyla) girdim. Kendine atanan görevde düzenle butonunu gördüm, form açılınca başlık alanının `disabled`, alt görev giriş kutusunun ise aktif olduğunu doğruladım.

---

## 6. "Bekliyor" ve "Devam ediyor" durumlarının birleştirilmesi (`bb24597`)

"Bekliyor" ve "Devam ediyor" pratikte aynı anlama geliyordu, aradaki ayrım gereksizdi. Durum modelini 3'ten 2'ye indirdim: artık yalnızca "Yapılacak" (eski adıyla "bekliyor", teknik değeri değişmedi) ve "Tamamlandı" var. Etkilenen her yeri tek tek güncelledim:

- `app-config.js`: `statusLabels` sözlüğünden `devam_ediyor` çıktı, `bekliyor` etiketi "Yapılacak" oldu.
- Kanban panosu 2 sütuna indi (`grid-template-columns: repeat(2, ...)`).
- Dashboard'daki "Devam eden" istatistik kartını hem HTML'den hem JS'ten tamamen kaldırdım.
- Görev formundaki durum seçici, filtre dropdown'ı, durum rozetleri (badge) ve CSS renk kuralları güncellendi.
- Geriye dönük veri geçişi (migration) için: kullanıcının tarayıcısında `localStorage`'da "devam_ediyor" durumunda eski görevler kalmış olabilir. `migrateState` fonksiyonu uygulama her açıldığında bunları otomatik olarak "bekliyor"a çeviriyor. Kullanıcının bir şey yapması gerekmiyor, veri de kaybolmuyor.

Kanban'ın gerçekten 2 sütun olduğunu, eski `devam_ediyor` referanslarının kodda (JS, CSS, HTML ve test dosyaları) kalmadığını `grep` ile taradım. Sonra 30 testlik tam paketi ve canlı tarayıcı doğrulamasını çalıştırdım.

---

## 7. Doküman Asistanı chatbotunun çalışmaması

Doküman asistanı sohbetinde "Gönder" butonu sürekli pasif (tıklanamaz) kalıyordu.

Asistan, `app.js`'in çağırdığı ayrı bir backend sunucusu üzerinden çalışıyor: `server/index.js`, Gemini, Voyage ve Supabase kullanan bir Express.js / Node.js servisi. Sunucunun adresi `app-config.js` içinde `http://127.0.0.1:3000/api` olarak sabit yazılı. Sorun, o sunucunun o an çalışmıyor olmasıydı. `curl` ile bağlanmayı denediğimde "bağlantı reddedildi" hatası aldım. Durum bilgisini alacağı sunucuya hiç ulaşamadığı için "Gönder" butonu "doküman hazır" durumuna geçemiyordu.

`.env` dosyasındaki bütün API anahtarlarının (Gemini, Voyage, Supabase) dolu olduğunu doğruladım. Bunlar zaten kayıtlı ücretsiz anahtarlar, ücretli bir işlem yok. Sonra `node server/index.js` ile sunucuyu başlattım ve `/api/health` uç noktasından `200 OK` alarak çalıştığını gördüm.

Bu kalıcı bir çözüm değil: sunucu bilgisayar ya da terminal kapanınca duruyor. Şimdilik ihtiyaç oldukça `node server/index.js` ile elle başlatmaya karar verdim. Otomatik başlatma (görev zamanlayıcı vb.) kurmadım.

---

## 8. "Metni işle" butonunun gereksiz görünmesi (`ce4d945`)

Doküman asistanı panelindeki "Metni işle" butonu gereksizdi, çünkü doküman soru sorulduğunda ya da panel açıldığında zaten otomatik işleniyordu. Koda bakınca bunu doğruladım: `initializeDocumentAssistant` fonksiyonu, doküman durumu `"pending"` (bekliyor) ise `processDocumentAssistant`'ı kendisi çağırıyordu. Yani buton yalnızca işleme hata verirse (durum `"failed"`) yeniden denemek için gerekliydi, normal akışta işe yaramıyordu.

`applyAssistantStatus` fonksiyonunu güncelledim. Buton artık sadece `document.status === "failed"` olduğunda görünüyor (`classList.toggle("hidden", ...)`) ve adı her zaman "Tekrar işle". Bekliyor, işleniyor ve hazır durumlarında tamamen gizli.

---

## 9. "Geçmiş" bölümünün akordeona alınması (`ce4d945`)

Görev detayında "Geçmiş" listesi çok satır kapladığında, özellikle 1. maddedeki eski tekrar kayıtları birikince, göz yoruyordu. Varsayılan olarak kapalı gelip tıklanınca açılması daha iyiydi.

"Geçmiş" başlığını bir `<button>`'a çevirdim (`data-toggle-history`, erişilebilirlik için `aria-expanded` ile) ve altındaki liste `hidden` class'ıyla kapalı başlıyor. Açık/kapalı durumunu modül seviyesindeki bir `taskHistoryExpanded` değişkeni tutuyor. Her yeni görev detayı açıldığında bu değişken `false`'a sıfırlanıyor, yani her görevin geçmişi yeniden kapalı başlıyor ve önceki görevin durumunu hatırlamıyor. Bunu kafa karıştırmasın diye bilinçli yaptım.

Playwright ile varsayılan durumda `hidden` ve `aria-expanded="false"` olduğunu, tıklayınca açıldığını, tekrar tıklayınca kapandığını denedim. 4/4 test geçti.

---

## 10. Varsayılan görev tarihleri ve saat dilimi hatası (`29efa6e`)

Yeni görev eklerken başlangıç tarihinin "bugünden sonraki gün", bitiş (son teslim) tarihinin de "başlangıçtan sonraki gün" olarak kendiliğinden gelmesini istedim. `app-utils.js`'e `addDays(dateStr, days)` adında bir yardımcı fonksiyon ekledim ve `resetTaskForm()` içine şu mantığı koydum:

```js
const defaultStartDate = addDays(today(), 1);       // bugün + 1
elements.taskStartDate.value = defaultStartDate;
elements.taskDueDate.value = addDays(defaultStartDate, 1); // başlangıç + 1 = bugün + 2
```

Var olan bir görev düzenlenirken (`editTask`) bu varsayılanlar devreye girmiyor, görevin kayıtlı tarihleri gösteriliyor. Bunu da test ederek doğruladım.

Bu özelliği test ederken bağımsız ama gerçek bir hata ortaya çıktı: `today()` fonksiyonu yerel saati (Türkiye, UTC+3) değil UTC'yi (dünya standart saati) kullanıyordu.

```js
// ESKİ (hatalı):
function today() {
  return new Date().toISOString().slice(0, 10); // UTC tarihi döner
}
```

Türkiye saatiyle gece 00:00 ile 03:00 arasında UTC henüz bir önceki günde olduğu için uygulama "bugün"ü bir gün geriden hesaplıyordu. Etkilenen yalnızca yeni varsayılan tarihler değildi. Geciken görev tespiti (`isTaskOverdue`), geçmiş kayıt zaman damgaları (`history.changedAt`) ve görev oluşturma tarihleri de bundan etkileniyordu. Yani fark edilmemiş, eskiden beri duran bir hataydı. Testim bunu o anda yakaladı: test gece 02:33'te (TR saati) çalıştığı için eski kod 19 Temmuz diyordu, doğru olan 20 Temmuz'du.

Düzeltme, `Date` nesnesinin yerel (tarayıcının ya da bilgisayarın saat dilimine göre) yıl, ay ve gün bileşenlerini kullanmak. `toISOString()` gibi önce UTC'ye çevirmiyor:

```js
// YENİ (doğru):
function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
```

`today()` uygulamanın çok yerinde kullanıldığı için (seri hesaplama, haftalık istatistikler, geciken görev sayısı, dashboard) değişiklikten sonra tam regresyon testi yaptım. 30 otomatik test geçti. Gerçek tarayıcıda görev oluşturdum, geçmiş kaydına baktım ve dashboard'daki seri ile geciken görev sayılarının NaN ya da undefined olmadan düzgün göründüğünü kontrol ettim. Regresyon çıkmadı.

---

## 11. Hızlı ekle alanına sözdizimi rehberi (`4d1e4c3`)

"Hızlı ekle" kutusu, `"raporu bitir yarın #Mobil !yüksek her hafta"` gibi doğal dile yakın metinden görev oluşturuyor. Yeni bir kullanıcı için bu mini sözdizimini anlamak zor ve uygulama bunu hiçbir yerde açıklamıyordu.

`app-quick-add-parser.js` dosyasına baktım. Hızlı ekle metni regex tabanlı bir parser ile şu kurallara göre ayrıştırılıyor:

- `#Proje`: görevi bir projeye ekler.
- `@etiket`: serbest bir etiket ekler. Öncelik belirtmez; eski placeholder'daki `@acil` örneği bu yüzden yanıltıcıydı ve kaldırdım.
- `!öncelik` (`!düşük`, `!orta`, `!yüksek`): önceliği belirler.
- `bugün`, `yarın`, gün adları (`pazartesi`...`pazar`), `gelecek hafta`, `gelecek ay`: son teslim tarihini belirler. En yakın gelecekteki o günü buluyor.
- `her gün`, `her hafta`, `her ay`: görevi tekrarlayan yapar.
- Geri kalan düz metin görevin başlığı olur.

Hızlı ekle kutusunun altına, varsayılan olarak kapalı gelen (`hidden` class'lı) ve "Nasıl yazılır? ⌄" başlığına tıklayınca açılan bir akordeon ekledim. İçinde bu 5 kural örnekleriyle bir `<ul>` listesi olarak yer alıyor, altında da tam bir örnek cümlenin açıklaması var. Placeholder metnini de düzelttim (`@acil` çıktı).

Akordeon yaptım çünkü rehberin ayrıntılı olmasını istedim ama ekran zaten kalabalıktı (9. maddedeki geçmiş bölümü gibi). Bilgiyi saklamış olmuyorum, sadece zorla göstermiyorum: deneyimli kullanıcı rahatsız olmuyor, yeni kullanıcı tek tıkla her şeyi görüyor.

Playwright ile varsayılan durumda kapalı olduğunu, tıklayınca `#Proje`, `@etiket` ve `!öncelik` metinlerinin göründüğünü, tekrar tıklayınca kapandığını kontrol ettim. Yazarken altta çıkan renkli etiketlerden oluşan eski önizleme özelliği de hâlâ doğru çalışıyor, yani regresyon yok.

---

## Genel test ve doğrulama yöntemi

Her değişiklikten sonra dört katmanlı bir kontrol uyguladım.

1. Statik kontrol: `node --check app.js` ile dosyanın çalıştırmadan geçerli JavaScript olduğunu doğruladım.
2. Otomatik test paketi (`npm test` ve `npm run test:server`, toplam 30 test):
   - `tests/sync-merge.test.mjs` (15 test): çevrimdışı/çevrimiçi veri birleştirme mantığı.
   - `scripts/smoke-test.mjs`: Playwright ile gerçek bir tarayıcı açıp temel akışları (giriş, görev oluşturma, filtreleme, rol bazlı erişim) uçtan uca test eder.
   - `scripts/offline-sync-test.mjs`: çevrimdışı senaryoları, oturum yenilemeyi ve çakışma çözümünü test eder.
   - `server/tests/*.test.js` (14 test): backend API, RLS senaryoları, doküman işleme.
3. Hedefli manuel doğrulama: Otomatik paket her yeni özelliği kapsamadığı için (Geçmiş akordeonu ve boş görev onay penceresi gibi yeni davranışlar mevcut testlerde yoktu) her değişiklik için geçici bir Playwright script'i yazdım. Gerçek tarayıcıda buton tıklamalarını, form doldurmayı ve beklenen sonucu kontrol ettim, sonra bu geçici dosyaları sildim. Projeye kalıcı test olarak eklenmediler, istenirse eklenebilir.
4. Regresyon kontrolü: Her değişiklikten sonra 30 testin hepsini yeniden çalıştırıp önceki özelliklerin bozulmadığına baktım. Bir yerde gerçek bir regresyon çıktı (4. maddedeki `offline-sync-test.mjs` zaman aşımı) ve hemen düzelttim.

---

## Sık sorulan sorular

**Arayüzde `disabled` yapmak yeterli mi? Biri geliştirici konsolundan bunu değiştirip yönetici olmadan başlık değiştirebilir mi?**
Tarayıcıdaki `disabled` yalnızca kullanıcı deneyimi içindir, tek başına güvenlik sayılmaz. Bunu 5. maddede de yazdım. Gerçek sınır veritabanında: Supabase'deki `protect_task_management_fields` adlı PostgreSQL trigger'ı yetkisiz bir güncelleme denemesini reddediyor. Yani arayüz ve veritabanı birlikte iki katmanlı savunma oluşturuyor.

**Bugünün tarihi neden bazen yanlış çıkıyordu, bu ne tür bir hataydı?**
JavaScript'te `new Date().toISOString()` her zaman UTC saatini verir, kullanıcının saat dilimini değil. Türkiye UTC+3 olduğu için, örneğin yerel saatle gece 01:00'de UTC hâlâ bir önceki günün 22:00'sindedir ve "bugün" yanlış hesaplanıyordu. Çözüm, `Date` nesnesinin yerel tarih bileşenlerini (`getFullYear`, `getMonth`, `getDate`) kullanmaktı.

**"Bekliyor" ve "Devam ediyor" neden birleştirildi, veri kaybı oldu mu?**
Bu bir kullanıcı deneyimi kararıydı, çünkü iki durum arasındaki ayrım pratikte belirsizdi. Veri kaybı olmadı: eski kayıtlardaki "devam_ediyor" durumu, uygulama her açıldığında bir migration (veri geçişi) fonksiyonuyla otomatik olarak "bekliyor"a çevriliyor.

**Testler gerçekten her şeyi kapsıyor mu?**
Hayır. Mevcut otomatik paket (`smoke-test.mjs`) her yeni özelliği kapsamıyordu. Eksik kalan senaryoları geçici Playwright script'leriyle ayrıca elle doğruladım. İstenirse bu senaryolar kalıcı olarak test paketine eklenebilir. Zaman kazanmak için şimdilik eklemedim.

**Doküman Asistanı (chatbot) neden bazen çalışmıyor?**
Özellik ayrı bir arka plan sunucusuna (Node.js/Express; Gemini, Voyage ve Supabase kullanıyor) ihtiyaç duyuyor. Sunucu çalışmadığında chatbot durumu öğrenemediği için "Gönder" butonu pasif kalıyor. Şu an sunucuyu ihtiyaç oldukça `node server/index.js` ile elle başlatıyorum, otomatik başlatma henüz kurulu değil.

---

## 12. Proje raporunun hazırlanması (03:24 - 04:23)

Projeyi baştan sona anlatan kapsamlı bir Word raporu hazırladım. Proje klasöründeki işe yaramayan eski dosyaları da temizledim.

### Rapor altyapısı (`8baf575`, `c6ecdf4`)

`Docket_Genel_Proje_Raporu.md` dosyasını yazdım. Bu dosya 9-20 Temmuz arasındaki 10 fazlı süreci, mimariyi ve test yaklaşımını anlatan kaynak metin. `scripts/build_full_report.py` script'i `.md` dosyasını doğrudan parse edip Word (`.docx`) belgesine çeviriyor. İçeriği iki yerde elle tekrar yazmadığım için rapor güncellenirken bir yerin eksik kalma riski yok.

Eski ara rapor script'lerini (`scripts/build_word_report.py`, `scripts/build_progress_report.py`), onların ara görsellerini (`word_report_render/`, 1.7 MB) ve eski ara raporu (`ToDo_Plus_Gelistirme_Sureci_Raporu.docx`) sildim.

### Birinci ağızdan, bol görselli rapor (`381f83a`)

`gunluk-raporlar/` altındaki gerçek hata ve çözüm ayrıntılarını (Gemini API erişim engeli, RLS upsert hataları, saat dilimi hatası, PL/pgSQL parser hatası vb.) doğrudan rapor metnine işledim.

`scripts/generate_report_diagrams.py` ile matplotlib kullanarak 5 mimari diyagram ürettim (`rapor-gorseller/`): iki çalışma modu, iki katmanlı güvenlik, offline sync üç yönlü birleştirme, RAG doküman asistanı akışı ve 10 fazlı zaman çizelgesi. `build_full_report.py`'a `[[IMG:yol|açıklama]]` işaretleyicisini tanıyan bir parser ekledim. Böylece diyagramlar ve ekran görüntüleri raporun ilgili bölümlerinin içine gömülüyor.

### Ekran görüntülerinin güncellenmesi (`35663b3`)

`screenshots/` klasöründeki görüntüler 10 Temmuz'dan kalmaydı. Koyu temadan, renkli proje panellerinden, çekmece menüden ve bugünkü UX değişikliklerinden öncesine aitlerdi. `supabase-config.js`'i geçici olarak boşaltıp uygulamayı demo moduna aldım, `npm run screenshots` ile görüntüleri yeniden yakaladım, sonra config'i eski haline döndürdüm (`git diff` ile kontrol ettim). Rapora iki yeni görüntü ekledim: "Geçmiş" sekmesi ve "Proje üyelikleri/davet" ekranı.

### Bozuk görünen ekran görüntüleri (`c8387c9`)

Bu gerçek bir hataydı. `.docx` dosyasını LibreOffice ile PDF'e çevirdim (`soffice --headless --convert-to pdf`) ve PyMuPDF (`fitz`) ile sayfa sayfa görsele dönüştürüp inceledim. Bazı sayfalarda ekran görüntüsü hiç görünmüyor, sadece altyazısı kalıyordu.

Sebep `scripts/capture-screenshots.mjs` içindeydi: Playwright'ta `fullPage: true` ile ekran görüntüsü alıyordu ve uzun sayfalarda aşırı uzun görüntüler çıkıyordu. Örneğin `08-mobil-genel-bakis.png` 390×4824 pikseldi (12:1 en-boy oranı). Word'de 6.1 inç genişlikte gömülünce yaklaşık 76 inç boyunda oluyor ve sayfa akışını bozuyordu.

10 `page.screenshot()` çağrısının hepsinden `fullPage: true`'yu kaldırdım. Artık yalnızca görünen viewport yakalanıyor (masaüstü 1440×1000, mobil 390×844). Görüntüleri yeniden yakaladım, raporu yeniden ürettim, tekrar PDF'e çevirip bütün sayfaları gözle kontrol ettim ve sorun düzelmişti. "Ekran görüntüleri" bölümünü 10 alt başlığa ayırdım ve her görselin altına neyi gösterdiğini anlatan bir paragraf ekledim.

Pratik bir engel de çıktı: rapor script'i birkaç kez `PermissionError` verdi, çünkü `Docket_Proje_Raporu.docx` Word'de açıktı. Dosyayı kapatınca sorunsuz çalıştı.

### Sonuç

Proje kökünde tek güncel rapor var: `Docket_Proje_Raporu.docx`. Kaynakları `Docket_Genel_Proje_Raporu.md`, `scripts/build_full_report.py`, `scripts/generate_report_diagrams.py`, `rapor-gorseller/` ve `screenshots/`.

## Değiştirilen ve eklenen dosyalar

Kod (madde 1-11, gece yarısından 02:50'ye kadar):

- `app.js`: ana uygulama mantığı (en çok değişen dosya)
- `app-config.js`: durum etiketleri (statusLabels)
- `app-utils.js`: `today()` düzeltmesi, yeni `addDays()` fonksiyonu
- `index.html`: form/panel HTML yapısı (izin uyarısı, sözdizimi rehberi, akordeon)
- `styles.css`: yeni sınıflar (`.section-hint`, `.history-toggle`, `.quick-add-help` vb.), Kanban 2 sütun, renk düzeltmeleri
- `scripts/smoke-test.mjs`, `scripts/offline-sync-test.mjs`: mevcut testler yeni davranışlara uyarlandı

Rapor (madde 12, 03:24-04:23):

- `Docket_Genel_Proje_Raporu.md`: raporun kaynak metni (tek gerçek kaynak)
- `scripts/build_full_report.py`: `.md`'yi `.docx`'e çeviren üretici script (yeni)
- `scripts/generate_report_diagrams.py`: 5 mimari diyagramı üreten script (yeni)
- `rapor-gorseller/`: üretilen diyagram PNG'leri (yeni klasör)
- `scripts/capture-screenshots.mjs`: `fullPage: true` kaldırıldı (hata düzeltmesi)
- `screenshots/*.png`: tamamı yeniden yakalandı (11 görüntü)
- `Docket_Proje_Raporu.docx`: nihai teslim edilen rapor
- Silinenler: `scripts/build_word_report.py`, `scripts/build_progress_report.py`, `word_report_render/`, `tmp/`, `ToDo_Plus_Gelistirme_Sureci_Raporu.docx`

## Sıradaki olası adımlar

- Doküman Asistanı sunucusunun bilgisayar açılışında otomatik başlaması kurulabilir (şimdilik elle başlatıyorum).
- Yeni eklenen davranışlar (Geçmiş akordeonu, boş görev onayı, hızlı ekle rehberi vb.) istenirse kalıcı olarak `smoke-test.mjs`'e eklenebilir.
- Rapor `.md` dosyasından üretildiği için içerik değişirse `python scripts/build_full_report.py` yeterli. Ekran görüntüsü değişirse önce `supabase-config.js`'i geçici boşaltıp `npm run screenshots` çalıştırmak gerekiyor (README'ye bu adım not olarak eklenebilir).
- Ücretli plana geçmeyi gerektiren hiçbir servis kullanmamak.
