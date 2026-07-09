# ToDo+ Geliştirme Önerileri

Bu dosya, uygulamaya sonraki aşamalarda eklenebilecek özellikleri sade bir yapılacaklar listesi şeklinde toplar. Proje raporu final aşamasında ayrıca düzenlenecektir.

## 1. Görev Yönetimi

- Kanban panosu daha gelişmiş hale getirilebilir.
- Görevler sürükle-bırak ile farklı durum kolonlarına taşınabilir.
- Görevlere alt görev ekleme özelliği getirilebilir.
- Görevlere yorum ekleme alanı yapılabilir.
- Görev geçmişi daha detaylı gösterilebilir.
- Görevlerde etiket sistemi eklenebilir.
- Görevler için dosya eki ekleme özelliği yapılabilir.
- Tekrarlayan görevler oluşturulabilir.
- Görevler arasında bağımlılık kurulabilir.
- Görev tamamlandığında otomatik geçmiş kaydı oluşturma daha ayrıntılı hale getirilebilir.

## 2. Proje Yönetimi

- Proje üyeleri eklenebilir.
- Her projeye özel görev panosu oluşturulabilir.
- Proje ilerleme yüzdesi gösterilebilir.
- Proje bazlı görev istatistikleri eklenebilir.
- Proje arşivleme özelliği yapılabilir.
- Proje içinde kategori, görev ve kullanıcı dağılımı özetlenebilir.

## 3. Kullanıcı ve Yetki Sistemi

- Demo giriş sistemi tamamen gerçek kullanıcı girişine dönüştürülebilir.
- Kullanıcılara rol verilebilir.
- Yönetici, görev veren ve görev yapan kullanıcı ayrımı eklenebilir.
- Her kullanıcının sadece yetkili olduğu projeleri ve görevleri görmesi sağlanabilir.
- Kullanıcı profil ekranı eklenebilir.
- Şifre sıfırlama ve e-posta doğrulama akışları eklenebilir.

## 4. Supabase ve Veritabanı

- Veriler localStorage yerine tamamen Supabase üzerinden yönetilebilir.
- Veritabanı işlemleri satır bazlı yapılabilir.
- Çok kullanıcılı veri güvenliği için Row Level Security kuralları geliştirilebilir.
- Görev, proje ve kategori işlemlerinde hata mesajları kullanıcıya açıkça gösterilebilir.
- Gerçek zamanlı güncelleme eklenebilir.
- Görev değişiklikleri farklı kullanıcılarda sayfa yenilemeden görünebilir.

## 5. Arayüz ve Kullanım Kolaylığı

- Mobil görünüm daha detaylı iyileştirilebilir.
- Görev kartları daha okunabilir hale getirilebilir.
- Filtreleme alanına kategori ve atanan kullanıcı filtresi eklenebilir.
- Görevler tarih, öncelik veya proje adına göre sıralanabilir.
- Geciken görevler ayrı bir alanda gösterilebilir.
- Yaklaşan teslim tarihleri için daha belirgin uyarı yapılabilir.
- Boş ekran mesajları daha açıklayıcı hale getirilebilir.

## 6. İstatistik ve Raporlama

- Kullanıcı bazlı tamamlanan görev grafiği eklenebilir.
- Proje bazlı başarı oranı gösterilebilir.
- Önceliklere göre görev dağılımı gösterilebilir.
- Geciken görev sayısı istatistik kartı olarak eklenebilir.
- Haftalık veya aylık görev özeti hazırlanabilir.
- Tamamlanan görevler için zaman çizelgesi oluşturulabilir.

## 7. Teknik İyileştirmeler

- `app.js` daha küçük modüllere ayrılabilir.
- Auth, görev, proje, kategori, render ve Supabase işlemleri ayrı dosyalara taşınabilir.
- Otomatik test altyapısı eklenebilir.
- Manuel test dosyası otomatik testlerle desteklenebilir.
- Geliştirme sunucusu ve paket yapısı eklenebilir.
- Kod içinde tekrar eden görev kartı ve listeleme yapıları sadeleştirilebilir.

## 8. Öncelikli Uygulama Sırası

1. Supabase kullanıcı ve yetki sistemi güçlendirilecek.
2. Kanban panosuna sürükle-bırak eklenecek.
3. Görev yorumları ve alt görevler eklenecek.
4. Kategori, kullanıcı ve teslim tarihi filtreleri genişletilecek.
5. İstatistik ekranına proje bazlı raporlar eklenecek.
6. Kod modüllere ayrılacak.
7. Otomatik test altyapısı kurulacak.
