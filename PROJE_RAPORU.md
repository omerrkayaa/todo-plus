# ToDo+ Görev Takip Sistemi - Proje Raporu

## 1. Projenin Amacı

Bu projenin amacı, klasik bir yapılacaklar listesi uygulamasından daha gelişmiş bir görev takip sistemi geliştirmektir. Uygulamada kullanıcılar sisteme giriş yapabilecek, proje oluşturabilecek, projelere görev ekleyebilecek, görevlerin durumunu takip edebilecek ve kullanıcıların başarı oranlarını görüntüleyebilecektir.

Proje yalnızca görev ekleme ve silme işlemlerinden oluşmaz. Görevlerin öncelik seviyesi, son teslim tarihi, tahmini süresi, durumu, kategorisi ve hangi kullanıcıya atandığı gibi bilgiler de sistemde tutulur.

## 2. Proje Gereksinimleri

Proje kapsamında yer alan temel gereksinimler şunlardır:

- Kullanıcı girişi
- Proje oluşturma
- Görev oluşturma
- Görev önceliği belirleme
- Görev süresi girme
- Görev durumu takip etme
- Son teslim tarihi belirleme
- Arama işlemi
- Filtreleme işlemi
- İstatistik ekranı
- Veritabanı kullanımı
- ER diyagramı hazırlama
- CRUD işlemleri
- Authentication yapısı
- Web application geliştirme
- Gerekli görülürse mobile application yapısına uygun genişletilebilir tasarım

## 3. Kullanılan Veritabanı

Veritabanı olarak Supabase kullanılması planlanmıştır.

Supabase seçilme nedenleri:

- PostgreSQL tabanlı olduğu için ilişkisel veritabanı mantığına uygundur.
- ER diyagramı ve tablo ilişkileri net şekilde gösterilebilir.
- Authentication desteği hazır olarak gelir.
- Web uygulaması ile kolay entegre olur.
- Ücretsiz planı öğrenci projesi için yeterlidir.
- Tablo, ilişki ve SQL mantığını göstermek için uygundur.

## 4. Proje Klasör Yapısı

Proje dosyaları masaüstünde ayrı bir klasör altında tutulmuştur.

Proje klasörü:

```text
<proje-klasörü>
```

Hazırlanan dosyalar:

```text
todo app uygulaması/
  index.html
  app.js
  styles.css
  supabase-config.js
  README.md
  PROJE_RAPORU.md
  SUPABASE_KURULUM.md
  TESLIM_KONTROL_LISTESI.md
  MANUEL_TEST_ADIMLARI.md
  supabase-schema.sql
  screenshots/
  scripts/
  todo-plus/
    todo-plus-er-diyagram.drawio
    veritabani-diyagramlari.html
    veritabani-diyagramlari.md
```

## 5. Hazırlanan Diyagramlar

Proje için veritabanı diyagramları hazırlanmıştır.

Hazırlanan diyagram dosyaları:

- `veritabani-diyagramlari.md`
- `veritabani-diyagramlari.html`
- `todo-plus-er-diyagram.drawio`
- `supabase-schema.sql`

`drawio` dosyası diagrams.net veya draw.io uygulamasında açılabilecek şekilde hazırlanmıştır. Bu dosya üzerinden diyagram düzenlenebilir, PNG veya PDF olarak dışa aktarılabilir.

`supabase-schema.sql` dosyası, Supabase üzerinde oluşturulacak tabloları, ilişkileri, kontrol kurallarını, başarı oranı hesaplama view yapısını ve temel Row Level Security kurallarını içerir.

`SUPABASE_KURULUM.md` dosyası, Supabase projesi oluşturma, SQL şemasını çalıştırma ve uygulama bağlantısında kullanılacak temel adımları içerir.

`TESLIM_KONTROL_LISTESI.md` dosyası, uygulamanın teslim öncesi kontrol edilecek özelliklerini listeler.

`MANUEL_TEST_ADIMLARI.md` dosyası, uygulamanın temel özelliklerini test etmek için izlenecek adımları içerir.

`supabase-config.js` dosyası, Supabase Project URL ve anon key bilgilerinin girileceği yapılandırma dosyasıdır.

`screenshots` klasörü, uygulamadan alınan ekran görüntülerini içerir.

## 6. Veritabanı Tabloları

Projede kullanılacak temel tablolar şunlardır:

- `users`
- `projects`
- `categories`
- `tasks`
- `task_givers`
- `task_assignments`
- `task_history`

### 6.1 Users Tablosu

Kullanıcı bilgilerini tutar.

Örnek alanlar:

- `id`
- `full_name`
- `email`
- `created_at`

Supabase Auth kullanıldığında giriş ve kayıt işlemleri Supabase tarafından yönetilir. Bu tablo kullanıcıya ait profil bilgilerini tutmak için kullanılır.

### 6.2 Projects Tablosu

Kullanıcıların oluşturduğu projeleri tutar.

Örnek alanlar:

- `id`
- `user_id`
- `name`
- `description`
- `created_at`
- `updated_at`

Bir kullanıcı birden fazla proje oluşturabilir.

### 6.3 Categories Tablosu

Görevleri sınıflandırmak için kullanılır.

Örnek kategoriler:

- Okul
- İş
- Kişisel
- Acil

Örnek alanlar:

- `id`
- `user_id`
- `name`
- `color`
- `created_at`

### 6.4 Tasks Tablosu

Uygulamanın ana tablosudur. Görev bilgileri burada tutulur.

Örnek alanlar:

- `id`
- `project_id`
- `category_id`
- `created_by`
- `title`
- `description`
- `priority`
- `status`
- `estimated_minutes`
- `due_date`
- `created_at`
- `updated_at`

Görev durumları:

- `bekliyor`
- `devam_ediyor`
- `tamamlandi`

Görev öncelikleri:

- `dusuk`
- `orta`
- `yuksek`

### 6.5 TaskAssignments Tablosu

Görevlerin hangi kullanıcıya atandığını, yani görevi kimin yapacağını tutar. Başarı oranı hesaplanabilmesi için görev atama bilgisinin ayrı bir tabloda tutulması gerekir. Bu yapı sayesinde bir görevin kime atandığı, kullanıcının görevi tamamlayıp tamamlamadığı ve görevden kaç puan kazandığı takip edilebilir.

Örnek alanlar:

- `id`
- `task_id`
- `user_id`
- `is_completed`
- `completed_at`
- `earned_score`
- `assigned_at`

### 6.6 TaskGivers Tablosu

Görevi veren kişi veya kişileri tutar. Bir görev birden fazla kişi tarafından verilebilir. Aynı şekilde bir kullanıcı da birden fazla görevin veren kişisi olabilir. Bu yapı okul, bölüm veya ekip içinde birden fazla yöneticinin aynı görevi tanımlayabilmesi için kullanılır.

Örnek alanlar:

- `id`
- `task_id`
- `user_id`
- `assigned_at`

### 6.7 TaskHistory Tablosu

Görevlerde yapılan durum değişikliklerini tutar.

Örnek alanlar:

- `id`
- `task_id`
- `changed_by`
- `old_status`
- `new_status`
- `note`
- `changed_at`

Bu tablo sayesinde bir görevin geçmişte hangi durumdan hangi duruma geçtiği takip edilebilir.

## 7. Tablo İlişkileri

Veritabanı ilişkileri şu şekildedir:

- Bir kullanıcı birden fazla proje oluşturabilir.
- Bir proje birden fazla görev içerebilir.
- Bir kullanıcı birden fazla görev oluşturabilir.
- Bir görev bir veya birden fazla kişi tarafından verilebilir.
- Bir görev bir veya birden fazla kullanıcıya atanabilir.
- Bir kullanıcının birden fazla atanmış görevi olabilir.
- Bir kategori birden fazla göreve atanabilir.
- Bir görevin birden fazla geçmiş kaydı olabilir.

Ana akış:

```text
users -> projects -> tasks -> task_assignments
tasks -> task_givers
tasks -> task_history
categories -> tasks
```

## 8. Başarı Oranı Hesaplama Mantığı

Projede görev yapan kullanıcıların başarı oranı istatistik ekranında gösterilir.

Başarı oranı yalnızca tamamlanan görev sayısına göre hesaplanmaz. Görevin önemine göre ağırlıklı olarak hesaplanır.

Öncelik puanları:

```text
Düşük öncelik = 1 puan
Orta öncelik = 2 puan
Yüksek öncelik = 3 puan
```

Hesaplama formülü:

```text
başarı_oranı = tamamlanan_görevlerin_puanı / atanmış_tüm_görevlerin_puanı * 100
```

Örnek:

Bir kullanıcıya 3 görev atanmış olsun:

```text
Yüksek öncelikli görev = 3 puan
Orta öncelikli görev = 2 puan
Düşük öncelikli görev = 1 puan
Toplam hedef puan = 6 puan
```

Kullanıcı yüksek ve düşük öncelikli görevi tamamlarsa:

```text
Kazanılan puan = 3 + 1 = 4
Başarı oranı = 4 / 6 * 100 = %66.6
```

Bu yöntemle yüksek öncelikli görevlerin etkisi daha fazla olur. Böylece başarı oranı daha adil ve anlamlı hesaplanır.

## 9. Uygulama Ekranları

Web uygulaması için temel ekran yapısı hazırlanmıştır.

Planlanan ekranlar:

- İstatistik ekranı
- Projeler ekranı
- Proje düzenleme işlemi
- Görevler ekranı
- Kullanıcı seçimi
- Kullanıcı giriş ekranı
- Kullanıcı kayıt ekranı
- Kategori oluşturma
- Kategori listeleme
- Kategori düzenleme işlemi
- Görev arama
- Görev filtreleme
- Görev ekleme formu
- Görev düzenleme işlemi
- Proje ekleme formu
- Görevi veren kişi veya kişileri seçme alanı

### 9.1 İstatistik Ekranı

Bu ekranda şu bilgiler gösterilecektir:

- Toplam görev sayısı
- Tamamlanan görev sayısı
- Devam eden görev sayısı
- Başarı oranı
- Kullanıcı bazlı başarı puanları
- Yaklaşan teslim tarihleri
- Son görev hareketleri

### 9.2 Projeler Ekranı

Bu ekranda kullanıcı yeni proje oluşturabilecek ve mevcut projeleri görebilecektir.

Projeler ekranında kategori oluşturma ve kategori listeleme alanları da bulunur. Kategoriler görevleri sınıflandırmak için kullanılır.

### 9.3 Görevler Ekranı

Bu ekranda kullanıcı görev ekleyebilecek, görevleri listeleyebilecek, arama ve filtreleme yapabilecektir.

Filtreleme alanları:

- Durum
- Öncelik
- Arama metni
- Kategori bilgisi

## 10. Gerçekleştirilen Çalışmalar

Proje kapsamında gerçekleştirilen çalışmalar:

1. Proje gereksinimleri incelendi.
2. Projenin ToDo+ görev takip sistemi olarak tasarlanmasına karar verildi.
3. Veritabanı olarak Supabase kullanılmasına karar verildi.
4. İlişkisel veritabanı yapısı planlandı.
5. ER diyagramı hazırlandı.
6. Draw.io ile açılabilecek diyagram dosyası oluşturuldu.
7. Başarı oranı hesabı için `task_assignments` tablosu tasarlandı.
8. Görev önemine göre başarı katsayısı mantığı oluşturuldu.
9. Proje dosyaları masaüstünde ayrı bir klasörde düzenlendi.
10. Supabase için SQL veritabanı şeması hazırlandı.
11. Web uygulaması için `index.html` dosyası hazırlandı.
12. Web uygulaması için `styles.css` dosyası hazırlandı.
13. Web uygulaması için `app.js` dosyası hazırlandı.
14. LocalStorage üzerinde çalışan ilk prototip oluşturuldu.
15. Uygulama yerel sunucu üzerinden açılarak temel kontroller yapıldı.
16. Görev geçmişini gösteren TaskHistory paneli arayüze eklendi.
17. Bir görevin birden fazla kişi tarafından verilebilmesi için `task_givers` yapısı eklendi.
18. Demo kullanıcı giriş ve kayıt ekranı eklendi.
19. Oturumdan çıkış işlemi eklendi.
20. Kategori oluşturma ve listeleme arayüzü eklendi.
21. Görev oluştururken kategori seçme özelliği eklendi.
22. Görev düzenleme özelliği eklendi.
23. Proje düzenleme özelliği eklendi.
24. Kategori düzenleme özelliği eklendi.
25. Demo verilerini sıfırlama özelliği eklendi.
26. Supabase kurulum adımları için `SUPABASE_KURULUM.md` dosyası oluşturuldu.
27. Teslim öncesi kontrol için `TESLIM_KONTROL_LISTESI.md` dosyası oluşturuldu.
28. Manuel test adımları için `MANUEL_TEST_ADIMLARI.md` dosyası oluşturuldu.
29. Supabase bağlantı bilgileri için `supabase-config.js` dosyası oluşturuldu.
30. Uygulama ekran görüntüleri oluşturuldu.
31. Proje kullanım açıklamaları için `README.md` dosyası oluşturuldu.
32. Proje raporu oluşturuldu.
33. Açık kaynak görev yönetimi repoları incelenerek geliştirme yönü belirlendi.
34. Plane, OpenProject, Kanboard, Vikunja ve Supabase örneklerinden görev akışı, Kanban görünümü, güvenli işlem ve çok kullanıcılı yapı fikirleri çıkarıldı.
35. Görevler ekranına duruma göre ayrılan Kanban panosu eklendi.
36. Kanban panosu mevcut arama, durum ve öncelik filtreleriyle birlikte çalışacak şekilde geliştirildi.
37. Görev, proje ve kategori silme işlemlerine onay penceresi eklendi.
38. Son teslim tarihi rozetleri geliştirildi; geciken ve yaklaşan görevler görsel olarak ayrıştırıldı.

## 10.1 GitHub Repo Taramasına Göre Geliştirme Analizi

Uygulama geliştirilirken benzer açık kaynak proje ve görev yönetimi uygulamaları incelenmiştir. İncelenen başlıca repolar şunlardır:

- `makeplane/plane`: Modern proje yönetimi, iş öğeleri, sprint/cycle, modül, görünüm ve analitik yapıları için incelendi.
- `opf/openproject`: Kurumsal proje yönetimi, Kanban, Gantt, iş paketi, zaman takibi ve rol/izin mantığı için incelendi.
- `kanboard/kanboard`: Basit ve anlaşılır Kanban metodolojisi için incelendi.
- `go-vikunja/vikunja`: Self-hosted todo ve görev yönetimi yapısı için incelendi.
- `supabase/supabase/examples`: Supabase Authentication, Realtime, Storage ve todo-list örnekleri için incelendi.

Bu inceleme sonucunda ToDo+ uygulamasında öncelikli olarak aşağıdaki geliştirmelerin yapılmasına karar verilmiştir:

- Görevleri sadece liste şeklinde değil, durum kolonları üzerinden de göstermek.
- Silme gibi geri dönüşü zor işlemlerde kullanıcıdan onay almak.
- Teslim tarihi yaklaşan veya geciken görevleri daha görünür hale getirmek.
- İlerleyen aşamada Supabase Row Level Security kurallarını çok kullanıcılı takım yapısına göre güçlendirmek.
- Uygulama büyüdükçe `app.js` dosyasını modüllere ayırmak.
- Otomatik test ve Vite tabanlı geliştirme ortamı eklemek.

## 11. Sonraki Aşamalar

Planlanan sonraki çalışmalar:

1. Supabase Row Level Security kuralları atanan kullanıcı, görevi veren kullanıcı ve proje üyeliği mantığına göre geliştirilecek.
2. Demo authentication yapısı tamamen Supabase Authentication ile değiştirilecek.
3. Veriler localStorage yerine Supabase üzerinden satır bazlı senkronize edilecek.
4. `app.js` dosyası `auth`, `state`, `render`, `tasks`, `projects` ve `supabase` gibi modüllere ayrılacak.
5. Vite, Vitest ve Playwright ile otomatik test altyapısı eklenecek.
6. Görev yorumları, alt görevler ve dosya ekleri geliştirilecek.
7. Ekran görüntüleri yeni Kanban panosu ile güncellenecek.

## 12. Genel Proje Özeti

Bu projede klasik ToDo uygulamasından daha gelişmiş bir görev takip sistemi tasarlanmıştır. Kullanıcılar sisteme giriş yaparak projeler oluşturabilir ve bu projelere görevler ekleyebilir. Görevlerin durum, öncelik, süre, kategori ve son teslim tarihi bilgileri tutulur.

Ek olarak görevler kullanıcılara atanabilir. Kullanıcıların başarı oranı, görevlerin öncelik seviyesine göre ağırlıklı hesaplanır. Düşük öncelikli görev 1 puan, orta öncelikli görev 2 puan, yüksek öncelikli görev 3 puan kabul edilir. Böylece daha önemli görevleri tamamlayan kullanıcıların başarı oranı daha fazla artar.

Veritabanı tarafında Supabase/PostgreSQL kullanılması planlanmıştır. ER diyagramında kullanıcılar, projeler, görevler, kategoriler, görev atamaları ve görev geçmişi arasındaki ilişkiler gösterilmiştir.

## 13. Kullanılan Yapılar

Projede kullanılan temel yapılar şunlardır:

- Supabase/PostgreSQL veritabanı
- Kullanıcı girişi için authentication mantığı
- Demo kullanıcı giriş ve kayıt ekranı
- ER diyagramı
- CRUD işlemleri
- Proje yönetimi
- Görev yönetimi
- Kategori yönetimi
- Çoklu görev veren kişi yapısı
- Arama ve filtreleme
- İstatistik ekranı
- TaskHistory görev geçmişi paneli
- Görev önceliğine göre ağırlıklı başarı oranı hesabı
- Draw.io ile düzenlenebilir veritabanı diyagramı
- Supabase SQL tablo şeması
- Supabase bağlantı yapılandırması
- Supabase kurulum dokümantasyonu
- HTML, CSS ve JavaScript tabanlı web uygulaması arayüzü
