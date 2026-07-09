# ToDo+ Teslim Kontrol Listesi

Bu dosya, projenin teslim veya sunum öncesi kontrol edilmesi gereken parçalarını özetler.

## 1. Uygulama Dosyaları

- [x] `index.html` hazırlandı.
- [x] `styles.css` hazırlandı.
- [x] `app.js` hazırlandı.
- [x] `supabase-config.js` hazırlandı.
- [x] Uygulama yerel sunucuda çalışacak şekilde düzenlendi.
- [x] Demo giriş/kayıt ekranı eklendi.
- [x] LocalStorage ile veri saklama eklendi.

## 2. Kullanıcı İşlemleri

- [x] Demo giriş yapma
- [x] Demo kayıt olma
- [x] Oturumdan çıkış yapma
- [x] Aktif kullanıcı seçme
- [x] Yeni kullanıcı ekleme
- [x] Demo verilerini sıfırlama

Varsayılan demo hesap:

```text
E-posta: omer@example.com
Şifre: 123456
```

## 3. Proje İşlemleri

- [x] Proje oluşturma
- [x] Proje listeleme
- [x] Proje düzenleme
- [x] Proje silme

## 4. Kategori İşlemleri

- [x] Kategori oluşturma
- [x] Kategori listeleme
- [x] Kategori düzenleme
- [x] Kategori silme
- [x] Göreve kategori atama

## 5. Görev İşlemleri

- [x] Görev oluşturma
- [x] Görev listeleme
- [x] Görev düzenleme
- [x] Görev silme
- [x] Görev tamamlama
- [x] Tamamlanan görevi tekrar açma
- [x] Görevi bir veya birden fazla kişi tarafından verilmiş olarak tanımlama
- [x] Görevi bir kullanıcıya atama
- [x] Görev süresi girme
- [x] Son teslim tarihi girme
- [x] Öncelik belirleme
- [x] Durum belirleme

## 6. Arama ve Filtreleme

- [x] Görev arama
- [x] Duruma göre filtreleme
- [x] Önceliğe göre filtreleme

## 7. İstatistik ve Başarı Oranı

- [x] Toplam görev sayısı
- [x] Tamamlanan görev sayısı
- [x] Devam eden görev sayısı
- [x] Kullanıcı başarı oranı
- [x] Kullanıcı bazlı başarı listesi
- [x] Yaklaşan teslim tarihleri
- [x] Son görev hareketleri

Başarı oranı formülü:

```text
başarı_oranı = tamamlanan_görevlerin_puanı / atanmış_tüm_görevlerin_puanı * 100
```

Öncelik puanları:

```text
Düşük = 1
Orta = 2
Yüksek = 3
```

## 8. Veritabanı ve Diyagramlar

- [x] Supabase/PostgreSQL seçildi.
- [x] ER diyagramı hazırlandı.
- [x] Draw.io dosyası hazırlandı.
- [x] Supabase SQL şeması hazırlandı.
- [x] Supabase bağlantı config dosyası hazırlandı.
- [x] Supabase kurulum notları hazırlandı.

İlgili dosyalar:

- `supabase-schema.sql`
- `SUPABASE_KURULUM.md`
- `todo-plus/todo-plus-er-diyagram.drawio`
- `todo-plus/veritabani-diyagramlari.md`
- `todo-plus/veritabani-diyagramlari.html`

## 9. Rapor ve Dokümantasyon

- [x] `README.md` hazırlandı.
- [x] `PROJE_RAPORU.md` hazırlandı.
- [x] `SUPABASE_KURULUM.md` hazırlandı.
- [x] `TESLIM_KONTROL_LISTESI.md` hazırlandı.
- [x] Uygulama ekran görüntüleri oluşturuldu.

## 10. Bilinen Durum

Bu sürüm, Supabase bağlantısından önceki çalışan demo sürümdür.

Mevcut durumda:

- Kullanıcı giriş/kayıt sistemi demo olarak çalışır.
- Veriler tarayıcıdaki LocalStorage alanında tutulur.
- Supabase tablo yapısı hazırdır.
- Supabase proje bilgileri `supabase-config.js` dosyasına girildiğinde uygulama gerçek Supabase Authentication ve Supabase tabloları ile çalışacak şekilde hazırlanmıştır.
