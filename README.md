# ToDo+ Görev Takip Sistemi

Bu proje, kullanıcıların proje oluşturabildiği, projelere görev ekleyebildiği, görevleri takip edebildiği ve kullanıcı başarı oranlarını görebildiği bir web uygulaması olarak tasarlanmıştır.

## Kullanılan Teknolojiler

- HTML
- CSS
- JavaScript
- Supabase/PostgreSQL
- Draw.io
- Markdown

## Dosya Yapısı

```text
todo app uygulaması/
  index.html
  styles.css
  app.js
  supabase-config.js
  supabase-schema.sql
  SUPABASE_KURULUM.md
  TESLIM_KONTROL_LISTESI.md
  MANUEL_TEST_ADIMLARI.md
  PROJE_RAPORU.md
  screenshots/
  scripts/
  todo-plus/
    todo-plus-er-diyagram.drawio
    veritabani-diyagramlari.html
    veritabani-diyagramlari.md
```

## Dosyaların Görevleri

- `index.html`: Uygulamanın sayfa iskeleti.
- `styles.css`: Uygulamanın görsel tasarımı.
- `app.js`: Proje, görev, kullanıcı, filtreleme ve başarı oranı işlemleri.
- `supabase-config.js`: Supabase Project URL ve anon key bilgilerinin girileceği dosya.
- `supabase-schema.sql`: Supabase/PostgreSQL tablo yapısı.
- `SUPABASE_KURULUM.md`: Supabase proje kurulum adımları.
- `TESLIM_KONTROL_LISTESI.md`: Teslim öncesi özellik kontrol listesi.
- `MANUEL_TEST_ADIMLARI.md`: Uygulama özelliklerini kontrol etmek için manuel test adımları.
- `PROJE_RAPORU.md`: Proje raporu.
- `screenshots/`: Uygulama ekran görüntüleri.
- `scripts/capture-screenshots.mjs`: Ekran görüntüsü oluşturma script’i.
- `todo-plus-er-diyagram.drawio`: Draw.io ile açılabilen ER diyagramı.

## Uygulamayı Açma

VS Code ile proje klasörü açılır:

```text
<proje-klasörü>
```

Ardından `index.html` dosyası tarayıcıda açılır. İstenirse VS Code içinde Live Server eklentisi ile de çalıştırılabilir.

## Mevcut Özellikler

- Kullanıcı seçimi
- Demo kullanıcı girişi
- Demo kullanıcı kaydı
- Oturumdan çıkış
- Kullanıcı ekleme
- Demo verilerini sıfırlama
- Proje oluşturma
- Proje düzenleme
- Proje silme
- Kategori oluşturma
- Kategori düzenleme
- Kategori silme
- Görev oluşturma
- Görev düzenleme
- Göreve kategori seçme
- Görevi bir veya birden fazla kişi tarafından verilmiş olarak tanımlama
- Görev silme
- Görev durumunu tamamlama veya tekrar açma
- Görev arama
- Duruma göre filtreleme
- Önceliğe göre filtreleme
- İstatistik kartları
- Kullanıcı bazlı başarı oranı
- Son görev hareketleri
- Görev önceliğine göre ağırlıklı başarı puanı
- LocalStorage ile tarayıcıda veri saklama

## Demo Giriş Bilgisi

Uygulama şu an demo authentication ile çalışır. Varsayılan hesap:

```text
E-posta: omer@example.com
Şifre: 123456
```

Bu yapı Supabase Authentication bağlantısı eklenmeden önce arayüz ve işlem akışını test etmek için kullanılır.

## Başarı Oranı Mantığı

Görevlerin başarıya etkisi öncelik değerine göre hesaplanır:

```text
Düşük öncelik = 1 puan
Orta öncelik = 2 puan
Yüksek öncelik = 3 puan
```

Formül:

```text
başarı_oranı = tamamlanan_görevlerin_puanı / atanmış_tüm_görevlerin_puanı * 100
```

## Sonraki Geliştirme Aşaması

İlk prototip LocalStorage ve demo authentication ile çalışmaktadır. Sonraki aşamada Supabase bağlantısı eklenerek kullanıcı girişinin ve verilerin gerçek veritabanı üzerinden yönetilmesi planlanmaktadır.

## Supabase Bağlantısı

Gerçek Supabase bağlantısı için `supabase-config.js` dosyasında şu alanlar doldurulur:

```js
window.TODO_PLUS_SUPABASE = {
  url: "SUPABASE_PROJECT_URL",
  anonKey: "SUPABASE_ANON_KEY",
};
```

Bu bilgiler girildiğinde uygulama Supabase Authentication ve Supabase tabloları ile çalışacak şekilde hazırlanmıştır. Bilgiler boş bırakıldığında demo mod çalışmaya devam eder.
