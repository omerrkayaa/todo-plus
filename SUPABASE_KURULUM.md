# Supabase Kurulum Notları

Bu dosya, ToDo+ projesinde Supabase veritabanı yapısının nasıl kurulacağını açıklar.

## 1. Supabase Projesi Oluşturma

1. Supabase hesabına giriş yapılır.
2. Yeni proje oluşturulur.
3. Proje adı örnek olarak `todo-plus` seçilebilir.
4. Veritabanı şifresi belirlenir.
5. Proje oluşturulduktan sonra SQL Editor ekranına geçilir.

## 2. SQL Şemasını Çalıştırma

Proje klasöründeki `supabase-schema.sql` dosyası açılır.

Dosya yolu:

```text
<proje-klasörü>\supabase-schema.sql
```

Bu dosyanın içeriği Supabase SQL Editor alanına yapıştırılır ve çalıştırılır.

Bu işlem sonucunda şu tablolar oluşur:

- `users`
- `projects`
- `categories`
- `tasks`
- `task_givers`
- `task_assignments`
- `task_history`

Ayrıca şu yapılar da oluşur:

- Görev önceliğine göre puan hesaplayan `priority_score` fonksiyonu
- Kullanıcı başarı oranını hesaplayan `user_success_stats` view yapısı
- Temel Row Level Security ayarları

## 3. Authentication Ayarı

Supabase Authentication ekranından e-posta ile kullanıcı girişi aktif bırakılır.

Uygulamada kullanıcı kayıt olduğunda `auth.users` tablosunda kullanıcı oluşur. Profil bilgileri için ayrıca `public.users` tablosu kullanılır.

## 4. Uygulama Bağlantısı

Supabase bağlantısı için proje ayarlarından şu bilgiler alınır:

- Project URL
- anon public key

Bu bilgiler JavaScript tarafında Supabase istemcisi oluşturmak için kullanılır.

Örnek yapı:

```js
const supabaseUrl = "SUPABASE_PROJECT_URL";
const supabaseAnonKey = "SUPABASE_ANON_KEY";
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
```

## 5. LocalStorage ve Supabase Farkı

Mevcut prototip tarayıcıdaki `localStorage` üzerinde çalışır. Bu yapı internet bağlantısı olmadan hızlı test yapmak için kullanılmıştır.

Supabase bağlantısı eklendiğinde:

- Projeler Supabase `projects` tablosundan alınır.
- Görevler Supabase `tasks` tablosundan alınır.
- Görevi veren kişiler `task_givers` tablosunda tutulur.
- Görev atamaları `task_assignments` tablosunda tutulur.
- Görev geçmişi `task_history` tablosunda saklanır.
- Kullanıcı girişi Supabase Authentication ile yapılır.

## 6. Başarı Oranı

Başarı oranı Supabase tarafında `user_success_stats` view yapısı ile hesaplanabilir.

Formül:

```text
başarı_oranı = tamamlanan_görevlerin_puanı / atanmış_tüm_görevlerin_puanı * 100
```

Puanlama:

```text
Düşük öncelik = 1 puan
Orta öncelik = 2 puan
Yüksek öncelik = 3 puan
```
