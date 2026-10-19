# Docket: Baştan Sona Proje Raporu

Bu raporda Docket projesini 9 Temmuz 2026'daki ilk commit'ten 20 Temmuz 2026'ya kadar (74 commit) nasıl geliştirdiğimi, hangi kararları neden aldığımı ve uygulamanın bugün nasıl çalıştığını anlatıyorum.

## 1. Proje nedir?

Docket, rol tabanlı (yönetici/çalışan) bir ekip görev takip sistemidir. Kullanıcılar proje ve kategori oluşturur, görevleri kişilere atar ve Kanban panosunda takip eder. Her görevde yorum, geçmiş ve dosya eki tutulur. İsteğe bağlı olarak yüklenen PDF/DOCX dokümanları hakkında bir yapay zeka asistanına soru da sorulabilir. Uygulama hem kurulumsuz demo modda (tarayıcı LocalStorage) hem de gerçek bir veritabanıyla (Supabase/PostgreSQL) çalışıyor.

Klasik bir yapılacaklar listesinden farkı, görevlerin proje, kategori, kullanıcı, rol, öncelik, süre, durum ve teslim tarihi gibi birçok bilgiyle izlenebilmesi. Bunun yanında çok kullanıcılı, güvenli bir backend'i de var.

## 2. Amaç ve kapsam

Projede şunları hedefledim:

- Proje, kategori ve görev CRUD işlemlerini eksiksiz yapmak.
- Görevleri kullanıcılarla ve görevi veren kişilerle ilişkilendirmek.
- Görev durumlarını liste ve Kanban görünümünde takip edilebilir hâle getirmek.
- Görev geçmişini ve yorumlarını saklamak.
- Öncelik ağırlıklı bir başarı oranı hesaplamak.
- Kurulum gerektirmeyen bir demo mod sunmak.
- Gerçek bir Supabase/PostgreSQL altyapısına bağlanabilmek.
- Masaüstü ve mobil ekranlarda kullanılabilir bir arayüz sunmak.
- İsteğe bağlı olarak, göreve eklenen dokümanlar hakkında soru sorulabilen bir yapay zeka asistanı eklemek.

## 3. Kullanılan teknolojiler ve neden seçildiler

| Katman | Teknoloji | Neden |
|---|---|---|
| Arayüz | Saf HTML/CSS/JavaScript (framework yok) | Bağımlılık yönetimi ve build adımı gerektirmeden doğrudan tarayıcıda çalışsın; `index.html`'i açmak demo modda göstermek için yeterli. DOM, event handling ve state yönetimi gibi temel kavramları bir framework'ün arkasına saklamadan kendim uyguladım. |
| Yerel veri | `localStorage` | Kurulum gerektirmeyen "demo mod" için. İnternet ya da veritabanı olmadan da tüm özellikler çalışsın. |
| Veritabanı | Supabase (yönetilen PostgreSQL) | Ücretsiz katmanı var. Gerçek bir SQL veritabanı, kimlik doğrulama (Authentication) ve dosya depolama (Storage) tek serviste geliyor, böylece gerçek bir "backend" deneyimi yaşıyorum. |
| Yetkilendirme | Supabase Row Level Security (RLS) + PostgreSQL trigger'ları | Güvenlik veritabanı seviyesinde olsun. Yetkiyi yalnızca arayüzde gizlemekle kalmayıp kimin neyi değiştirebileceğini sunucu tarafında da garanti altına almak istedim. |
| Yapay zeka | Google Gemini (metin üretimi) + Voyage AI (vektörleştirme/embedding) | Doküman asistanı özelliği için. İkisinin de ücretsiz katmanı var. İlk denemede başka bir LLM API'sini kullandım, kredi kartsız ücretsiz deneme kalkınca Gemini'ye geçtim (ayrıntısı 4.1'de). |
| Backend (asistan için) | Node.js + Express | Gemini ve Voyage API anahtarları tarayıcıda değil, sunucuda saklanmalı. |
| Test | Playwright (uçtan uca tarayıcı testleri) + Node.js `node --test` (birim testleri) | Gerçek bir tarayıcıda gerçek tıklama ve form doldurma senaryolarını otomatik test etmek için. |
| Diyagram | Mermaid, Draw.io | ER diyagramı ve mimari şemalar için. |

## 4. Geliştirme süreci: 10 faz, kronolojik

Projeyi 9 Temmuz'da başlattım ve 20 Temmuz'a kadar 74 commit ile geliştirdim. Süreci 10 mantıksal faza ayırdım:

| Faz | Tarih | Ne yaptım |
|---|---|---|
| 1. Temel | 9 Tem | İlk proje iskeleti, Kanban sürükle-bırak, görev detayları |
| 2. Çok kullanıcı altyapısı | 12 Tem | Görev yönetimi deneyimi, panel sadeleştirme, testler, Supabase üyelik/canlı güncelleme, proje üyeliği/davet, kodun modüllere ayrılması |
| 3. Erişilebilirlik | 13 Tem | Klavye ile kullanılabilirlik, görev formu iyileştirmeleri |
| 4. Yapay zeka entegrasyonu | 14 Tem | Backend eklendi, Gemini'ye geçiş, Supabase projesine bağlanma, plpgsql hata düzeltmesi |
| 5. Doküman asistanı olgunlaştırma | 15 Tem | 8 gerçek hata bulunup düzeltildi, asistan sohbet-öncelikli arayüze geçti |
| 6. Zengin görev özellikleri | 16 Tem | Etiketler, çoklu atanan kişi, tekrarlayan görevler, Gelen Kutusu, hızlı ekle, takvim |
| 7. Arayüz/gezinme cilası | 17 Tem | Trello tarzı renkler, takvim planlayıcı, çekmece menü, bildirim zili |
| 8. Geliştirme otomasyonu | 18 Tem | Test, yol haritası ve güvenlik kontrolleri için iş akışı düzenlendi |
| 9. Kalite ve dayanıklılık | 19 Tem | WCAG AA kontrast denetimi, çevrimdışı modun tam devreye alınması, koyu tema |
| 10. Görev ekranı UX iyileştirmeleri | 20 Tem | 13 ayrı kullanılabilirlik iyileştirmesi |

[[IMG:rapor-gorseller/gelisim-zaman-cizelgesi.png|Şekil: 9-20 Temmuz arası 10 fazlı geliştirme süreci]]

Teknik olarak en yoğun üç fazı (4, 5 ve 10), karşılaştığım sorunlar ve çözümleriyle birlikte aşağıda daha ayrıntılı anlatıyorum.

### 4.1 Faz 4 detayı: Yapay zeka entegrasyonunun kurulumu (14 Temmuz)

Doküman asistanının kodu önceden yazılmıştı ama hiç uçtan uca çalıştırılıp test edilmemişti. Bu fazda şunları yaptım:

- Projeyi GitHub'daki depoya bağladım; değişiklikleri buradan commit edip gönderiyorum.
- LLM sağlayıcısını değiştirdim. İlk planım başka bir sağlayıcı kullanmaktı ama o sağlayıcı kredi kartsız ücretsiz deneme vermiyordu. Bunun yerine ücretsiz katmanı olan Google Gemini'ye geçtim ve `server/services/anthropic-service.js` dosyasını `server/services/llm-service.js` olarak yeniden yazdım. Voyage AI (embedding) ve Supabase'in ücretsiz katmanları da yetti.
- Supabase projesini kurdum (`ftmacdltuyaxjxwodfbj.supabase.co`) ve `supabase-schema.sql` dosyasını canlı projeye uyguladım.
- Gerçek bir hata buldum. `validate_task_attachment` fonksiyonunda bir `CASE...END` ifadesinin hemen ardından `THEN` geliyordu ve bu PL/pgSQL ayrıştırıcısını (parser) şaşırtıp `"syntax error at end of input"` hatasına yol açıyordu. `CASE` ifadesini parantez içine alınca düzeldi.
- İlk yönetici hesabımı oluşturdum ve veritabanında elle `admin` rolüne yükselttim (README'de belgelenen adım bu).
- Proje oluşturma hatasını buldum. "Üst kategori" alanı arayüzde zorunlu görünüyordu ama veritabanında kategori isteğe bağlıydı. Ayrıca Supabase senkronizasyon katmanı kategorisiz projeleri sessizce siliyordu. Görevlerde bu doğru yapılmıştı, projelerde atlanmıştı. İkisini de düzelttim.

### 4.2 Faz 5 detayı: Doküman asistanını sağlamlaştırma (15 Temmuz)

Gerçek testler yaparken art arda 8 hata buldum ve düzelttim:

1. RLS "upsert" hata sınıfı. Postgres, `INSERT ... ON CONFLICT DO UPDATE` çalıştırırken satır gerçekten güncelleniyor olsa bile INSERT güvenlik kuralını da işletiyor. Bu yüzden `users`, `tasks`, `task_assignments`, `task_attachments`, `task_history` ve `task_comments` tablolarında "var olan kendi verini güncelleyemiyorsun" hatası çıkıyordu. Hepsine ek izin ekledim.
2. Mapper kod hatası. `app-supabase-mapper.js` içindeki `toRemoteRows`, `task_attachments` eşlemesinde `task` değişkenine kapsamının dışından erişmeye çalışıyordu (`ReferenceError`). Bir görevde dosya eki olduğu anda tüm senkronizasyon sessizce kilitleniyordu.
3. Aynı tarayıcıda çoklu sekme sorunu. Supabase oturumu tüm sekmeler arasında paylaşıldığı için aynı pencerede iki farklı kullanıcı sekmesi açınca oturumlar karışıyordu. İki farklı rolü test ederken artık ayrı pencere kullanıyorum, biri gizli sekme oluyor.
4. CORS hatası. Backend yalnızca `127.0.0.1:4173`'ten gelen istekleri kabul ediyordu. VS Code Live Server'ı (`127.0.0.1:5501`) kullanınca "Failed to fetch" hatası aldım. `.env` içindeki `CORS_ORIGIN`'e 5501'i de ekledim.
5. Gemini API erişim sorunu. İlk denediğim anahtarlar üniversite Google Workspace hesabına bağlıydı ve kurum hesabın Gemini API erişimini tamamen engellemişti (`403 PERMISSION_DENIED`). Başka proje ve anahtar denemek işe yaramadı, kişisel Gmail hesabımdan yeni bir anahtar alınca sorun çözüldü. Bundan, kodun doğru olmasının yetmediğini, dış servislere erişebilmenin de bir bağımlılık olduğunu öğrendim.
6. Model kararlılığı. `gemini-flash-latest` ve `gemini-3.5-flash` sürekli `503 UNAVAILABLE` verdi, `gemini-2.5-flash` ise yeni projeler için kapatılmıştı. `gemini-3.1-flash-lite` kararlı çalıştı ve hâlâ onu kullanıyorum.
7. Sayfa sayısı hatası. Asistan "kaç sayfa" sorusuna kendi ürettiği "[Bölüm N]" etiketlerini sayarak cevap veriyordu ve bu yanlış olabiliyordu. Artık `pdf-parse`'ın verdiği gerçek sayfa sayısını `task_attachments.page_count` sütununda saklıyorum. Bu sayı hem ekranda hem asistanın bağlamında kullanılıyor.
8. Trigger alan kıyaslama hatası. `assigned_at` alanı istemciden saat bilgisi olmadan gelince veritabanındaki tam zaman damgasıyla "farklı" görünüyordu. Bu da normal kullanıcıların kendi görev atamalarını senkronize etmesini engelliyordu. `assigned_at`'ı katı kıyaslamadan çıkardım.

Bu fazda doküman asistanını "Dokümanı Özetle" panelinden sohbet-öncelikli bir arayüze taşıdım. Asistan artık görev başlığını ve açıklamasını da biliyor. Ayrıca kullanıcının kendi şifresini değiştirmesini ve yöneticinin kullanıcı oluşturmasını ekledim.

### 4.3 Faz 10 detayı: Görev ekranı UX iyileştirmeleri (20 Temmuz)

Bugünkü çalışmam "Görev Yönetimi" ekranındaki kullanılabilirlik sorunlarına odaklandı: 13 değişiklik, 5 git commit. Her maddede önce koda bakıp kök nedeni buldum, sonra düzelttim, sonra otomatik testlerle (30 test) ve Playwright ile gerçek tarayıcıda doğruladım.

1. Geçmişteki gereksiz tekrar kayıtları. Görev formunu hiçbir alanı değiştirmeden kaydetmek bile geçmişe yeni bir satır ekliyordu, çünkü `updateTaskFromForm` koşulsuz `state.history.push(...)` çağırıyordu. Alan bazlı bir değişiklik tespiti ekledim. Değişiklik yoksa geçmişe kayıt eklenmiyor, varsa not neyin değiştiğini tam olarak yazıyor (`"Görev güncellendi: başlık, öncelik."`).
2. Görev detayının yanlış yerden açılması. Modal açılırken yorum kutusuna verilen klavye odağı, tarayıcının sayfayı otomatik olarak en alta kaydırmasına neden oluyordu. Odağı en üstteki "Kapat" butonuna verdim ve `scrollTop = 0` ekledim.
3. Açıklayıcı yardım metinleri. "Alt görevler" ve "Yorumlar" başlıklarının altına ne işe yaradıklarını anlatan kısa cümleler ekledim. Kullanırken okunabilirlik sorunu fark ettiğim için metin rengini birkaç kez koyulaştırdım.
4. Boş görev tamamlamada onay. Hiç alt görev, yorum ya da dosya eklenmeden "Tamamla"ya basılınca artık bir onay penceresi çıkıyor. Bu değişiklik mevcut bir test dosyasını (`offline-sync-test.mjs`) bozdu, onu da düzelttim (diyalog otomatik kabul ediliyor).
5. Atanan kullanıcıya sınırlı düzenleme yetkisi. Görev sahibi artık kendi görevine alt görev ve dosya ekleyebiliyor. Yönetimsel alanlar (başlık, tarih, öncelik) arayüzde `disabled`, ayrıca JS katmanında da korunuyor. Gerçek güvenlik sınırı yine veritabanındaki trigger'da (bkz. bölüm 5.2).
6. Durum modelinin sadeleştirilmesi. "Bekliyor" ve "Devam ediyor" durumlarını "Yapılacak" altında birleştirdim, Kanban artık 2 sütun. Eski kayıtlar için otomatik bir veri geçişi (migration) yazdım ve veri kaybı olmadı.
7. Doküman asistanı sunucusunun çalışmaması. "Gönder" butonu pasif kalıyordu, çünkü arka plan sunucusu (`server/index.js`) o an kapalıydı. `node server/index.js` ile başlattım ve `/api/health` adresinden `200 OK` alarak doğruladım. Bu sunucuyu şu an ihtiyaç oldukça elle başlatıyorum (bkz. bölüm 8).
8. Gereksiz "Metni işle" butonu. Doküman zaten otomatik işleniyor, buton yalnızca hata durumunda gerekliydi. Artık sadece işleme başarısız olduğunda görünüyor.
9. Geçmiş bölümünün akordeona alınması. Uzun geçmiş listeleri göz yorduğu için bölümü varsayılan olarak kapalı, tıklanınca açılan bir akordeona çevirdim.
10. Varsayılan görev tarihleri. Yeni görevde başlangıç tarihi "bugün+1", bitiş tarihi "başlangıç+1" olarak otomatik geliyor.
11. Saat dilimi hatası. Bunu test ederken kendi başına gerçek bir hata buldum: `today()` fonksiyonu Türkiye yerel saatini (UTC+3) değil, UTC'yi kullanıyordu. Gece 00:00 ile 03:00 arasında "bugün" bir gün geriden hesaplanıyordu. Bu durum geciken görev tespitini, geçmiş zaman damgalarını ve görev oluşturma tarihlerini de etkiliyordu. `Date` nesnesinin yerel bileşenlerini kullanacak şekilde düzelttim ve tam regresyon testi yaptım.
12. Hızlı ekle sözdizimi rehberi. Doğal dile yakın "hızlı ekle" kutusu `#Proje`, `@etiket`, `!öncelik`, `bugün/yarın` ve `her hafta` gibi kalıpları anlayan bir regex ayrıştırıcıyla çalışıyor. Bu kuralları anlatan, varsayılan olarak kapalı bir akordeon ekledim.
13. Gereksiz buton temizliği. Görev detayında işlevsiz kalmış bir butonu kaldırdım.

Her değişiklikten sonra uyguladığım test yöntemini bölüm 6'da anlatıyorum.

## 5. Mimari nasıl çalışıyor?

### 5.1 İki çalışma modu

Uygulama tek bir kod tabanıyla iki farklı şekilde çalışabiliyor:

- Demo mod: `supabase-config.js` boş bırakılırsa uygulama otomatik olarak bu moda geçer. Hiçbir veri dışarı gitmez, her şey tarayıcının `localStorage`'ında saklanır ve kurulum gerekmez.
- Supabase modu: Uygulama gerçek bir PostgreSQL veritabanına, gerçek kullanıcı hesaplarıyla (Supabase Authentication) bağlanır. Veriler kalıcı ve çok kullanıcılıdır.

Geçişi tek bir değişken (`supabaseReady`) kontrol ediyor. Aynı arayüz kodu iki modda da çalıştığı için kod tekrarı yok.

[[IMG:rapor-gorseller/iki-calisma-modu.png|Şekil: Aynı kod tabanının iki çalışma moduna dallanması]]

### 5.2 Rol tabanlı yetkilendirme: iki katmanlı savunma

Projede sık döndüğüm bir mimari ilke var:

> "Arayüz (UI) katmanı kullanıcı deneyimi içindir, gerçek güvenlik sınırı veritabanı katmanındadır."

Örneğin bir çalışan (admin olmayan kullanıcı) bir görevin başlığını değiştiremez. Bu kural iki yerde uygulanıyor:

1. Arayüzde ilgili form alanı `disabled` yapılıyor ve buton görünmüyor, böylece kullanıcı yanlışlıkla yasak bir işlem denemiyor.
2. Veritabanında, `supabase-schema.sql` içindeki `protect_task_management_fields` adlı bir PostgreSQL trigger fonksiyonu, admin olmayan biri yasak bir alanı değiştirmeye çalıştığında işlemi reddedip hata fırlatıyor. Arayüzdeki kontrol atlatılsa bile (örneğin tarayıcı geliştirici konsolundan) veri değişmiyor.

Yazılım güvenliğinde buna "defense in depth" (katmanlı savunma) deniyor: tek bir noktaya güvenmiyorsunuz.

[[IMG:rapor-gorseller/iki-katmanli-savunma.png|Şekil: UI ve veritabanı katmanlarının birlikte çalışması]]

### 5.3 Veri modeli

`users` (kullanıcılar) → `projects` (projeler) → `tasks` (görevler) ilişkisi var. Görevler ayrıca `task_assignments` (kime atandı), `task_givers` (kim verdi), `task_history` (durum geçmişi), `task_comments` (yorumlar) ve `task_attachments` (dosya ekleri) tablolarına bağlı. Her tablo RLS (Row Level Security) ile korunuyor, bir kullanıcı yalnızca kendisiyle ilişkili verileri görebiliyor (atandığı, oluşturduğu ya da üyesi olduğu projelerin verileri). Tam ER diyagramı `docket/docket-er-diyagram.drawio` dosyasında.

[[IMG:rapor-gorseller/veri-modeli-er.png|Şekil: Docket veri modeli, sadeleştirilmiş ER diyagramı]]

### 5.4 Çevrimdışı senkronizasyon: projenin en karmaşık parçası

19 Temmuz'da tamamladığım bu özellik, projenin teknik olarak en derin kısmı:

- Uygulama "yerel-öncelikli" (local-first) çalışıyor. Her değişiklik önce cihaza yazılıyor, sonra buluta gönderiliyor. İnternet yokken bile görev ekleme, düzenleme ve silme çalışıyor.
- Yerel ve bulut tarafı aynı anda değişiklik yaptıysa sistem "taban + yerel + bulut" üç yönlü birleştirme (three-way merge) algoritmasını kullanıyor (`app-sync-merge.js`, 15 birim testle doğrulandı). Bir alanı yalnızca bir taraf değiştirdiyse o taraf otomatik kazanıyor. İki taraf da aynı alanı farklı değiştirdiyse kullanıcıya "Hangisi kalsın?" diye soran bir çakışma kartı çıkıyor ve hiçbir veri sessizce kaybolmuyor.
- Bu mantık Git'teki "merge conflict" mantığına çok benziyor: ortak bir "taban" (base) sürüme göre iki tarafın farkına bakılıyor.

[[IMG:rapor-gorseller/offline-sync-uc-yonlu-birlestirme.png|Şekil: Üç yönlü birleştirme akışı]]

### 5.5 Doküman asistanı mimarisi (RAG, Retrieval-Augmented Generation)

- Kullanıcı bir göreve PDF/DOCX/TXT yüklediğinde backend dokümanın metnini çıkarıyor.
- Kısa dokümanlar doğrudan yapay zekaya (Gemini) bağlam olarak veriliyor.
- Uzun dokümanlar parçalara bölünüyor (chunking). Her parça Voyage AI ile bir vektöre (embedding) dönüştürülüp Supabase'in `pgvector` eklentisinde saklanıyor. Kullanıcı soru sorduğunda sorunun kendisi de vektöre çevriliyor, benzerlik araması ile en alakalı parçalar bulunuyor ve Gemini'ye yalnızca bunlar gönderiliyor.
- Büyük dokümanları modelin bağlam penceresine sığdırmak için yaygın kullanılan bu yönteme RAG (Retrieval-Augmented Generation) deniyor.
- Güvenlik tarafında backend, kullanıcının RLS erişimi olmayan bir dokümanın varlığını bile göstermiyor (o durumda da 404 ile aynı hata dönüyor).

[[IMG:rapor-gorseller/rag-dokuman-asistani.png|Şekil: Doküman asistanının RAG akışı]]

## 6. Test ve kalite güvence yaklaşımım

Proje boyunca 4 katmanlı bir test düzeni uyguladım:

1. Statik kontrol: `node --check` ile her JavaScript dosyasının sözdizimsel geçerliliğine bakıyorum.
2. Otomatik test paketi (`npm test` ve `npm run test:server`, toplam 30 test):
   - `tests/sync-merge.test.mjs`: senkronizasyon/birleştirme mantığı için 15 birim testi.
   - `scripts/smoke-test.mjs`: Playwright ile gerçek tarayıcıda uçtan uca temel akış testi.
   - `scripts/offline-sync-test.mjs`: sahte Supabase oturumuyla çevrimdışı senaryolar.
   - `server/tests/*.test.js`: health, RLS, doküman işleme ve prompt güvenliği için 14 backend testi.
3. Hedefli manuel/Playwright doğrulama: otomatik paketin henüz kapsamadığı senaryoları her yeni özellik için geçici script'lerle gerçek tarayıcıda test ettim. Bunu özellikle bugünkü 10. fazda çok kullandım.
4. Regresyon kontrolü: her değişiklikten sonra tüm test paketini yeniden çalıştırdım. 20 Temmuz'da boş görev onayı testi bozulmuştu, onu hemen düzelttim.

[[IMG:screenshots/04-gorevler-ekrani.png|Şekil: Görev listesi, filtreler ve Kanban panosu]]

## 7. Ekran görüntüleri: uygulamanın güncel hâli

Aşağıdaki görüntülerin hepsini uygulamanın bugünkü (20 Temmuz) hâlinden, demo modda aldım.

### 7.1 Giriş ekranı

[[IMG:screenshots/01-giris-ekrani.png|Giriş ekranı]]

Uygulama açıldığında karşılaşılan ilk ekran bu. Solda ürünü tanıtan bir vitrin bölümü, sağda giriş/kayıt kartı var. Giriş türü olarak "Yönetici" ya da "Kullanıcı" seçilebiliyor. Demo hesap bilgileri (e-posta/şifre) formun altında hazır duruyor, bu yüzden kurulum yapmadan hemen denenebiliyor.

### 7.2 Yönetici paneli: genel bakış

[[IMG:screenshots/02-istatistik-ekrani.png|Yönetici paneli: istatistik kartları]]

Giriş yapınca açılan ana ekran. "Toplam görev", "Tamamlanan", "Başarı oranı" (öncelik ağırlıklı) ve "Geciken görev" kartlarını gösteriyor. Üstte koyu/açık tema butonu ve bildirim zili var. Bölüm 5.1'de anlattığım iki çalışma modundan hangisinde olunduğu da ("Demo mod · Yerel kayıt") üstte yazıyor.

### 7.3 Proje ve kategori yönetimi

[[IMG:screenshots/03-projeler-kategoriler.png|Proje oluşturma, kategori yönetimi ve proje davet formu]]

Sol menüden erişilen bu ekranda proje oluşturma formu, kategori oluşturma formu ve bir projeye başka bir kullanıcıyı davet etme formu bir arada. Sağ tarafta, 4. bölümdeki 7. fazda (arayüz cilası) eklediğim Trello tarzı renkli proje kartları görülüyor. Her kartta ilerleme yüzdesi, görev sayısı ve teslim tarihi var.

### 7.4 Kanban panosu

[[IMG:screenshots/06-kanban-panosu.png|Kanban panosu: 2 sütunlu görev akışı]]

Görevler ekranının pano görünümü. Bölüm 4.3'te anlattığım durum sadeleştirmesinden sonra iki sütun kaldı: "Yapılacak" ve "Tamamlandı". Kartlar sürükle-bırakla ya da durum butonlarıyla taşınabiliyor.

### 7.5 Görev detayı, geçmiş ve yorumlar

[[IMG:screenshots/05-gorev-detayi-yorumlar.png|Görev detayı modalı: bilgiler, alt görevler, yorumlar, dosyalar]]

Bir göreve tıklayınca açılan detay modalı. Görevin tüm bilgileri (durum, öncelik, süre, teslim tarihi, atanan ve veren kişiler), alt görev listesi, yorum alanı ve dosya yükleme alanı tek ekranda duruyor. Bölüm 4.3'te anlattığım gibi modal artık her zaman en üstten, yani bilgiler kısmından açılıyor.

### 7.6 Dashboard: geçmiş (aktivite) sekmesi

[[IMG:screenshots/11-gecmis-ekrani.png|Dashboard'daki "Geçmiş" sekmesi: son görev hareketleri]]

Yönetici panelindeki "Geçmiş" sekmesi, kimin hangi görevi ne zaman hangi duruma taşıdığını listeliyor (örnekte "ER diyagramını hazırla" görevinin "Yapılacak → Tamamlandı" hareketi). Bölüm 4.3'ün 1. maddesindeki tekrar kayıtlarını önleme düzeltmesi sayesinde burada artık yalnızca gerçek değişiklikler görünüyor.

### 7.7 Görev çekmece formu

[[IMG:screenshots/07-gorev-cekmece-formu.png|Sağdan açılan görev oluşturma/düzenleme çekmecesi]]

Yeni görev oluşturma ve var olan görevi düzenleme formu, sayfanın sağından kayarak açılan bir "çekmece" (drawer) olarak tasarlandı. Başlık, tarihler ve atanan kişi(ler) gibi temel alanlar üstte duruyor. Daha az kullanılan alanlar, formu yoğun göstermemek için "Detayları göster" ile açılan bir akordeonun arkasında.

### 7.8 Proje üyelikleri ve davet ekranı

[[IMG:screenshots/12-proje-uyelikleri.png|Sol menü, kategori/proje yönetimi ve davet formu bir arada]]

Sol menünün çekmece olarak nasıl açıldığını (4. bölümdeki 7. faz, arayüz/gezinme cilası) ve aynı ekrandaki proje, kategori ve davet formlarını gösteriyor. Menüde "Bugün", "Takvim", "Erişim davet", "Proje yönetimi", "Kategori Ekle" ve "Görev yönetimi" gibi kısayollar var.

### 7.9 Mobil görünüm

[[IMG:screenshots/08-mobil-genel-bakis.png|Mobil genel bakış: dar ekranda istatistik kartları]]

390px genişliğinde (ortalama bir telefon ekranı) dashboard görünümü. Kartlar tek sütuna iniyor, üstte hamburger menü ve bildirim zili var. Bu, 4. bölümdeki 3. fazda yaptığım erişilebilirlik ve mobil uyum çalışmasının sonucu.

### 7.10 Mobil yan menü

[[IMG:screenshots/09-mobil-yan-menu.png|Mobil yan menü: hamburger menüye basınca açılan çekmece]]

Hamburger menü ikonuna basınca soldan açılan gezinme menüsü. Masaüstündeki çekmece bileşeninin (bölüm 7.8) aynısı burada da kullanılıyor, yani kodu tekrarlamadan responsive hâle getirdim.

## 8. Bilinen sınırlar

- Doküman asistanı backend'i (`server/index.js`) otomatik başlamıyor, şu an ihtiyaç oldukça elle (`node server/index.js`) başlatıyorum. Bunu bilerek böyle bıraktım, görev zamanlayıcı gibi bir otomatik başlatma henüz kurmadım.
- Otomatik test paketi (`smoke-test.mjs`) her yeni özelliği kapsamıyor. Yeni davranışları geçici Playwright script'leriyle ayrıca doğrulayıp kalıcı teste eklemeden siliyorum. İstenirse kalıcı hâle getirilebilir.
- `app.js` hâlâ büyük tek bir dosya. Bazı yardımcı modüller ayrılmış durumda (`app-utils.js`, `app-supabase.js`, `app-storage.js`, `app-task-model.js`, `app-sync-merge.js`, `app-quick-add-parser.js`, `app-supabase-mapper.js`, `app-document-assistant.js`), ama ana dosya (auth, render, event handling) hâlâ tek parça.
- Supabase modunda demo kullanıcı ekleme/sıfırlama işlemleri üretime alınmadan kapatılmalı.

## 9. Sık sorulan sorular

**S: "Bu projeyi neden framework (React/Vue/Angular) kullanmadan yazdın?"**
C: Bilerek böyle yaptım. Saf JavaScript build/derleme adımı gerektirmeden doğrudan tarayıcıda çalışıyor. Ayrıca DOM manipülasyonu, event handling ve state yönetimi gibi temel kavramları bir framework'ün arkasına saklamadan kendim uygulamamı sağladı.

**S: "Neden hem demo hem Supabase modu var, tek mod yeterli değil miydi?"**
C: Demo mod, projeyi kurulum, internet ya da hesap gerektirmeden hemen gösterebilmek için. Supabase modu ise çok kullanıcılı, kalıcı ve güvenli gerçek bir backend'i göstermek için. İkisi birlikte projenin hem her yerde çalışan basit bir demo hem de gerçek bir üretim mimarisi olduğunu gösteriyor.

**S: "Veritabanı güvenliğini nasıl sağlıyorsun?"**
C: PostgreSQL'in Row Level Security (RLS) özelliğiyle. Her tabloda "bir kullanıcı hangi satırları görebilir ya da değiştirebilir" kuralları veritabanı seviyesinde tanımlı. Bazı alanlar için ek `trigger` fonksiyonları da var. RLS'in "satır var mı yok mu" kontrolünün ötesinde, "hangi *alan* değişebilir" gibi daha ince kuralları bunlar uyguluyor.

**S: "Çevrimdışı çalışma teknik olarak nasıl çalışıyor?"**
C: Bölüm 5.4'te anlattığım gibi, yerel-öncelikli mimari ve üç yönlü birleştirme algoritmasıyla. İsterseniz canlı gösterebilirim: internet bağlantısını kapatıp görev ekliyorum, bağlantıyı açınca otomatik senkronize oluyor.

**S: "Yapay zeka kısmı gerçekten çalışıyor mu, yoksa sahte mi (mock)?"**
C: Gerçek çalışıyor. Google Gemini API'sine gerçek istekler gidiyor, Voyage AI ile gerçek vektörleştirme yapılıyor ve Supabase'in `pgvector` eklentisiyle gerçek benzerlik araması çalışıyor. Şu an bu backend'i göstermek için `node server/index.js` komutuyla ayrıca başlatmam gerekiyor (bölüm 8'de not ettim).

**S: "Testlerini nasıl yazdın / test kapsamın nedir?"**
C: Bölüm 6'da anlattığım gibi 4 katmanlı: statik kontrol, 30 otomatik testten oluşan bir paket (birim ve uçtan uca tarayıcı testleri), hedefli manuel Playwright doğrulamaları ve her değişiklik sonrası regresyon kontrolü.

**S: "Projenin en zor/ilginç kısmı neydi?"**
C: İki aday var. Biri, çevrimdışı senkronizasyon için üç yönlü birleştirme algoritmasını doğru çalıştırmaktı. Bu, Git'in merge mantığına benzeyen bir problemdi: çakışmaları veri kaybetmeden yönetmek gerekiyordu. Diğeri, Gemini API erişiminin üniversite hesabında kurumsal politika yüzünden tamamen engellenmesiydi. Bunu kişisel hesaba geçerek çözdüm. Bu olay bana, kodun doğru olmasının yetmediğini, dış servislere erişebilmenin de bir bağımlılık olduğunu öğretti.

## 10. Sonuç

Docket, 9-20 Temmuz arasında 74 commit'le gelişti. Basit bir Kanban görev takibiyle başladı, sonunda çok kullanıcılı rol tabanlı yetkilendirme, RAG tabanlı bir doküman asistanı, çalışan bir çevrimdışı senkronizasyon motoru, erişilebilirlik ve koyu tema desteği ile otomatik test altyapısına sahip oldu. Karşılaştığım hataları (API erişim engelleri, RLS/trigger hataları, saat dilimi hatası vb.) kök nedenlerine inerek çözdüm ve her değişikliği otomatik ve manuel testlerle doğruladım.
