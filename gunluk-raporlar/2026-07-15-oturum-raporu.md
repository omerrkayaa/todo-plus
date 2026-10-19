# Docket geliştirme günlüğü (2026-07-15)

## Genel durum

Dün (14 Temmuz) Doküman Asistanı kod olarak hazırdı ama canlı ortamda uçtan uca test etmemiştim. Bugün gerçek testler yaptım. Yolda çok sayıda hata bulup düzelttim, iki de yeni özellik ekledim: şifre değiştirme ve yönetici tarafından kullanıcı oluşturma.

## Bulunan ve düzeltilen hatalar

1. RLS "upsert" hata sınıfı. Postgres, `INSERT ... ON CONFLICT DO UPDATE` (upsert) yaparken, işlem aslında bir güncelleme olsa bile INSERT güvenlik kuralını (RLS policy) satırın üzerinde çalıştırıyor. Bu yüzden `users`, `tasks`, `task_assignments`, `task_attachments`, `task_history` ve `task_comments` tablolarında "var olan kendi verini güncelleyemiyorsun" hatası çıkıyordu. Admin ve ilgili kullanıcı için ek izin ekleyerek hepsini düzelttim.
2. `app-supabase-mapper.js` kod hatası. `toRemoteRows` içindeki `task_attachments` eşlemesi, `task` değişkenine kapsamının dışından erişmeye çalışıyordu (`ReferenceError`). Herhangi bir görevde dosya eki olduğu anda tüm senkronizasyon sessizce kilitleniyordu.
3. Aynı tarayıcıda çoklu sekme sorunu. Supabase oturumu (auth session) `localStorage` üzerinden bütün sekmeler arasında paylaşılıyor. Aynı pencerede admin ve test kullanıcısı için iki sekme açınca oturumlar birbirine karıştı ve dosya yükleme 400 hatası verdi. Kalıcı not olarak yazıyorum: iki farklı rolü test ederken aynı pencerede sekme açmayacağım, biri normal biri gizli (InPrivate) iki ayrı pencere kullanacağım.
4. CORS. Backend yalnızca `127.0.0.1:4173`'ten gelen isteklere izin veriyordu. VS Code'un Live Server'ını (`127.0.0.1:5501`) kullanınca "Failed to fetch" hatası aldım. `.env` içindeki `CORS_ORIGIN`'e 5501'i de ekledim.
5. Gemini API erişim sorunu. İlk iki anahtar üniversite (Google Workspace for Education) hesabına bağlıydı. Kurum, hesabın Gemini API'ye erişimini tamamen kapatmış (`403 PERMISSION_DENIED: Your project has been denied access`) ve başka proje ya da anahtar denemek bir şey değiştirmedi. Kişisel Gmail hesabımdan yeni bir anahtar oluşturunca sorun çözüldü.
6. Model seçimi. `gemini-flash-latest` ve `gemini-3.5-flash` sürekli `503 UNAVAILABLE` (yoğunluk) hatası verdi. `gemini-2.5-flash` yeni projeler için `404 "no longer available to new users"` döndürdü. Stabil çalışan `gemini-3.1-flash-lite` oldu, şu an onu kullanıyorum.
7. Sayfa sayısı sorunu. Asistan "kaç sayfa" sorusuna, dokümanın içinde kendi uydurduğu "[Bölüm N]" etiketlerinin sayısına bakarak cevap veriyordu ve bu yanlış çıkabiliyordu. `pdf-parse`'ın verdiği gerçek sayfa sayısını (`result.total`) hiç kaydetmiyordum. Artık `task_attachments.page_count` sütununda saklanıyor; hem ekranda hem asistanın bağlamında gerçek veri olarak kullanılıyor.
8. `protect_assignment_management_fields` trigger hatası. İstemci tarafı `assigned_at` alanını saat bilgisi olmadan, yalnızca tarihe indirip geri gönderiyordu. Veritabanındaki tam zaman damgasıyla "farklı" göründüğü için normal kullanıcılar kendi görev atamalarını senkronize edemiyordu (`"Calisan gorev atamasini degistiremez."`). `assigned_at` alanını katı kıyaslamadan çıkardım.

## Eklenen özellikler

1. Doküman Asistanı artık sohbet öncelikli. Ayrı "Dokümanı Özetle" butonunu ve panelini kaldırıp yerine sohbet ekranı koydum. Sohbet boşken karşılama mesajı görünüyor: "Merhaba! Yüklediğiniz doküman hakkında merak ettiğiniz her şeyi bana sorabilirsiniz."
2. Görev bağlamı entegrasyonu. Asistan artık yalnızca dokümanı değil, görevin başlığını ve açıklamasını da bağlam olarak kullanıyor. "Bu görevde benden ne bekleniyor, son tarih ne" gibi sorulara görev açıklamasından doğru cevap veriyor.
3. Şifre değiştir. Sol menüye, yöneticinin de kullanıcının da kendi şifresini değiştirebileceği bir buton ve modal ekledim. Supabase modunda `auth.updateUser`, yerel demo modda `authAccounts` üzerinden çalışıyor.
4. Yönetici tarafından kullanıcı oluşturma. "Kullanıcı ekle" artık Supabase modunda da çalışıyor. Ad, e-posta ve rol girilince backend (`POST /api/users`, service-role ile, yalnızca adminlere açık) gerçek bir Supabase Auth hesabı ve profil satırı oluşturuyor. Güvenli, rastgele bir geçici şifre üretip ekranda gösteriyor. Kullanıcı bu şifreyle girip "Şifre değiştir" ile kendi şifresini belirleyebiliyor.
5. Demo ve test verisi. 5 yeni antik kent projesi (Troya, Pergamon, Aspendos, Hierapolis, Perge; biri bilerek kategorisiz bırakıldı), 3 yeni kategori ve 10 yeni görev ekledim. Görevlerde öncelik, durum ve atama karışık.

## Şu anki canlı yapılandırma (`.env`)

- `GEMINI_API_KEY` ve `GEMINI_MODEL=gemini-3.1-flash-lite`: kişisel Gmail hesabımdan, çalışıyor.
- `CORS_ORIGIN`: hem `4173` hem `5501` portlarına izinli.
- Supabase projesi: `ftmacdltuyaxjxwodfbj.supabase.co` (değişmedi).

## Hesaplar

- Yönetici: kendi e-posta hesabım (adres ve şifre buraya yazılmadı).
- Test kullanıcı: aynı adresin `+etiket` takma adı (şifre buraya yazılmadı).

## Sunucular

- Backend: `npm start` ile `http://127.0.0.1:3000`. Terminal kapanınca durur, yeniden başlatmak gerekir. `.env` ya da `server/` altında bir değişiklik olduğunda da yeniden başlatmak gerekiyor, çünkü hot-reload yok.
- Frontend: `python -m http.server 4173 --bind 127.0.0.1` ile `http://127.0.0.1:4173`. VS Code Live Server ile `127.0.0.1:5501` de kullanılabiliyor, CORS artık ikisine de izin veriyor.

## Sıradaki olası adımlar

- Doküman Asistanı'nı yeni eklenen antik kent projelerinden biriyle (örneğin Troya) de denemek.
- İstenirse, yönetici tarafından oluşturulan kullanıcıya geçici şifreyi e-postayla göndermek. Şu an şifre yalnızca admin ekranında görünüyor ve admin elle iletiyor.
- Ücretli plana geçmeyi gerektiren hiçbir servis kullanmamak.
