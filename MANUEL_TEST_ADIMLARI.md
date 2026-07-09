# ToDo+ Manuel Test Adımları

Bu dosya, uygulamanın temel özelliklerini hızlıca kontrol etmek için kullanılabilir.

## 1. Uygulamayı Açma

Tarayıcıda şu adres açılır:

```text
http://127.0.0.1:4173/
```

## 2. Giriş Testi

Demo hesap ile giriş yapılır:

```text
E-posta: omer@example.com
Şifre: 123456
```

Beklenen sonuç:

- Giriş ekranı kapanır.
- Ana panel açılır.
- Sol menüde İstatistik, Projeler ve Görevler sekmeleri görünür.

## 3. Kayıt Testi

Giriş ekranında Kayıt sekmesi açılır.

Örnek bilgiler:

```text
Ad soyad: Test Kullanıcı
E-posta: test@example.com
Şifre: 123456
```

Beklenen sonuç:

- Kullanıcı kaydedilir.
- Ana panele giriş yapılır.
- Yeni kullanıcı aktif kullanıcı olarak görünür.

## 4. Proje Testi

Projeler sekmesine geçilir.

Yapılacak işlemler:

1. Yeni proje oluşturulur.
2. Oluşturulan proje listede kontrol edilir.
3. Proje düzenlenir.
4. Proje silinir.

Beklenen sonuç:

- Proje ekleme, düzenleme ve silme işlemleri çalışır.

## 5. Kategori Testi

Projeler sekmesindeki kategori alanı kullanılır.

Yapılacak işlemler:

1. Yeni kategori oluşturulur.
2. Kategori listede kontrol edilir.
3. Kategori düzenlenir.
4. Kategori silinir.

Beklenen sonuç:

- Kategori ekleme, düzenleme ve silme işlemleri çalışır.

## 6. Görev Testi

Görevler sekmesine geçilir.

Yapılacak işlemler:

1. Yeni görev oluşturulur.
2. Proje seçilir.
3. Kategori seçilir.
4. Görevi yapan kişi seçilir.
5. Görevi veren kişi veya kişiler seçilir.
6. Öncelik seçilir.
7. Durum seçilir.
8. Son teslim tarihi girilir.
9. Görev kaydedilir.

Beklenen sonuç:

- Görev listede görünür.
- Kart üzerinde proje, kategori, görevi veren kişi, atanan kişi, öncelik, durum, puan ve teslim tarihi görünür.

## 7. Görev Düzenleme Testi

Bir görev kartında Düzenle butonuna basılır.

Yapılacak işlemler:

1. Başlık değiştirilir.
2. Öncelik değiştirilir.
3. Durum değiştirilir.
4. Değişiklikler kaydedilir.

Beklenen sonuç:

- Görev kartı güncellenir.
- İstatistik ekranındaki başarı oranı güncellenir.
- Son görev hareketleri alanında güncelleme kaydı oluşur.

## 8. Filtreleme Testi

Görevler sekmesinde:

1. Arama alanına görev başlığı yazılır.
2. Durum filtresi seçilir.
3. Öncelik filtresi seçilir.

Beklenen sonuç:

- Görev listesi seçilen arama ve filtre değerlerine göre güncellenir.

## 9. Başarı Oranı Testi

Bir görev tamamlandı durumuna alınır.

Beklenen sonuç:

- Tamamlanan görev sayısı artar.
- Kullanıcı başarı oranı güncellenir.
- Yüksek öncelikli görevler başarı oranını daha fazla etkiler.

## 10. Çıkış Testi

Sol menüde Çıkış yap butonuna basılır.

Beklenen sonuç:

- Ana panel kapanır.
- Giriş ekranı tekrar görünür.

## 11. Demo Verilerini Sıfırlama Testi

Ana panele giriş yapıldıktan sonra sol menüde Demo verileri sıfırla butonuna basılır.

Beklenen sonuç:

- Demo projeler, kategoriler, görevler ve kullanıcılar başlangıç haline döner.
- İstatistik ekranı varsayılan demo verileriyle tekrar hesaplanır.
