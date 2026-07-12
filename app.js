const { storageKeys, priorityScores, priorityLabels, statusLabels, roleLabels } = window.TODO_PLUS_APP;
const STORAGE_KEY = storageKeys.state;
const AUTH_STORAGE_KEY = storageKeys.accounts;
const SESSION_STORAGE_KEY = storageKeys.session;
const DELETION_QUEUE_KEY = storageKeys.deletionQueue;

const sampleAttachmentDataUrl =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140"><rect width="240" height="140" rx="18" fill="#eaf2ff"/><rect x="18" y="18" width="204" height="104" rx="14" fill="#ffffff"/><path d="M40 88h160" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/><circle cx="72" cy="58" r="18" fill="#93c5fd"/><circle cx="120" cy="58" r="18" fill="#60a5fa"/><circle cx="168" cy="58" r="18" fill="#2563eb"/><text x="120" y="118" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700" fill="#1e3a8a">Örnek ek</text></svg>',
  );

const defaultState = {
  activeUserId: "user-1",
  users: [
    { id: "user-1", fullName: "Ömer Kaya", email: "omer@example.com", role: "admin" },
    { id: "user-2", fullName: "Ayşe Demir", email: "ayse@example.com", role: "user" },
    { id: "user-3", fullName: "Mehmet Yılmaz", email: "mehmet@example.com", role: "user" },
    { id: "user-4", fullName: "Zeynep Arslan", email: "zeynep@example.com", role: "admin" },
    { id: "user-5", fullName: "Can Aydın", email: "can@example.com", role: "user" },
    { id: "user-6", fullName: "Elif Şahin", email: "elif@example.com", role: "user" },
    { id: "user-7", fullName: "Burak Koç", email: "burak@example.com", role: "user" },
    { id: "user-8", fullName: "Selin Yıldız", email: "selin@example.com", role: "user" },
    { id: "user-9", fullName: "Mert Çelik", email: "mert@example.com", role: "user" },
    { id: "user-10", fullName: "Derya Akın", email: "derya@example.com", role: "user" },
    { id: "user-11", fullName: "Kerem Öz", email: "kerem@example.com", role: "user" },
    { id: "user-12", fullName: "İrem Güneş", email: "irem@example.com", role: "user" },
  ],
  projects: [
    {
      id: "project-1",
      userId: "user-1",
      categoryId: "category-2",
      name: "ToDo+ Proje Geliştirme",
      description: "Görev takip sistemi için analiz, tasarım ve uygulama süreci.",
      createdAt: "2026-07-09",
    },
    {
      id: "project-2",
      userId: "user-1",
      categoryId: "category-1",
      name: "Veritabanı Tasarımı",
      description: "Supabase tabloları, ER diyagramı ve başarı oranı hesabı.",
      createdAt: "2026-07-09",
    },
    { id: "project-3", userId: "user-4", categoryId: "category-4", name: "Mobil Uygulama", description: "Mobil deneyim, erişilebilirlik ve responsive kontroller.", createdAt: "2026-07-10" },
    { id: "project-4", userId: "user-4", categoryId: "category-7", name: "Canlıya Geçiş", description: "Test, güvenlik, Supabase ve yayın hazırlıkları.", createdAt: "2026-07-10" },
    { id: "project-5", userId: "user-1", categoryId: "category-8", name: "Motor Tasarımı", description: "Motor parçaları ve hareket sistemlerinin tasarımı.", createdAt: "2026-07-11" },
    { id: "project-6", userId: "user-4", categoryId: "category-8", name: "Hidrolik Sistem", description: "Pompa, valf ve basınç hattı çalışmaları.", createdAt: "2026-07-11" },
    { id: "project-7", userId: "user-1", categoryId: "category-8", name: "Dişli Kutusu", description: "Dişli oranları ve mekanik aktarım tasarımı.", createdAt: "2026-07-11" },
    { id: "project-8", userId: "user-1", categoryId: "category-1", name: "Satış Analiz Paneli", description: "Satış verilerinin temizlenmesi ve görselleştirilmesi.", createdAt: "2026-06-18" },
    { id: "project-9", userId: "user-4", categoryId: "category-2", name: "Müşteri Portalı", description: "Müşteriler için görev ve bildirim ekranları.", createdAt: "2026-06-22" },
    { id: "project-10", userId: "user-1", categoryId: "category-3", name: "Kullanıcı Kılavuzu", description: "Ürün kullanım ve kurulum belgelerinin hazırlanması.", createdAt: "2026-06-25" },
    { id: "project-11", userId: "user-4", categoryId: "category-4", name: "Saha Takip Uygulaması", description: "Saha ekipleri için mobil görev deneyimi.", createdAt: "2026-06-27" },
    { id: "project-12", userId: "user-1", categoryId: "category-5", name: "Erişilebilir Tasarım", description: "WCAG uyumlu bileşen ve gezinme çalışmaları.", createdAt: "2026-07-01" },
    { id: "project-13", userId: "user-4", categoryId: "category-6", name: "Regresyon Test Paketi", description: "Kritik kullanıcı akışları için otomatik testler.", createdAt: "2026-07-02" },
    { id: "project-14", userId: "user-1", categoryId: "category-7", name: "Yetki ve Güvenlik", description: "Rol, oturum ve erişim kontrollerinin güçlendirilmesi.", createdAt: "2026-07-04" },
    { id: "project-15", userId: "user-4", categoryId: "category-8", name: "Konveyör Sistemi", description: "Konveyör mekanizması ve taşıma kapasitesi tasarımı.", createdAt: "2026-07-05" },
    { id: "project-16", userId: "user-1", categoryId: "category-1", name: "Performans Raporlama", description: "Ekip performans metriklerinin analiz edilmesi.", createdAt: "2026-07-06" },
    { id: "project-17", userId: "user-4", categoryId: "category-2", name: "Yönetim Konsolu", description: "Yönetici kontrol ve raporlama arayüzü.", createdAt: "2026-07-07" },
    { id: "project-18", userId: "user-1", categoryId: "category-6", name: "API Test Otomasyonu", description: "Servis uçları için otomatik doğrulama paketi.", createdAt: "2026-07-08" },
  ],
  categories: [
    { id: "category-1", userId: "user-1", name: "Veri Analizi", color: "#2563eb" },
    { id: "category-2", userId: "user-1", name: "Arayüz Kodlama", color: "#15803d" },
    { id: "category-3", userId: "user-1", name: "Dokümantasyon", color: "#b45309" },
    { id: "category-4", userId: "user-4", name: "Mobil Tasarım", color: "#7c3aed" },
    { id: "category-5", userId: "user-4", name: "Erişilebilirlik", color: "#db2777" },
    { id: "category-6", userId: "user-4", name: "Otomatik Test", color: "#0891b2" },
    { id: "category-7", userId: "user-4", name: "Güvenlik", color: "#dc2626" },
    { id: "category-8", userId: "user-1", name: "Mekanik", color: "#475569" },
  ],
  tasks: [
    {
      id: "task-1",
      projectId: "project-2",
      categoryId: "category-1",
      createdBy: "user-1",
      title: "ER diyagramını hazırla",
      description: "Users, projects, tasks, categories ve history ilişkilerini göster.",
      priority: "yuksek",
      status: "tamamlandi",
      estimatedMinutes: 90,
      dueDate: "2026-07-10",
      createdAt: "2026-07-09",
    },
    {
      id: "task-2",
      projectId: "project-1",
      categoryId: "category-2",
      createdBy: "user-1",
      title: "Görev ekranını kodla",
      description: "Görev ekleme, filtreleme ve durum değiştirme işlemleri.",
      priority: "yuksek",
      status: "devam_ediyor",
      estimatedMinutes: 120,
      dueDate: "2026-07-12",
      attachments: [
        {
          id: "attachment-task-2-1",
          name: "gorev-akisi.svg",
          type: "image/svg+xml",
          size: 612,
          dataUrl: sampleAttachmentDataUrl,
          uploadedAt: "2026-07-09",
        },
      ],
      subtasks: [
        { id: "subtask-task-2-1", title: "Görev formu alanlarını bağla", completed: true },
        { id: "subtask-task-2-2", title: "Filtreleme ve arama ilişkisini doğrula", completed: false },
        { id: "subtask-task-2-3", title: "Kanban görünümünü test et", completed: false },
      ],
      createdAt: "2026-07-09",
    },
    {
      id: "task-3",
      projectId: "project-1",
      categoryId: "category-2",
      createdBy: "user-1",
      title: "Proje raporunu güncelle",
      description: "Yapılan çalışmaları ve kullanılan yapıları rapora ekle.",
      priority: "orta",
      status: "bekliyor",
      estimatedMinutes: 60,
      dueDate: "2026-07-14",
      createdAt: "2026-07-09",
    },
    { id: "task-4", projectId: "project-3", categoryId: "category-4", createdBy: "user-4", title: "Mobil menüyü test et", description: "390 px görünümde menü açma ve kapama akışını doğrula.", priority: "orta", status: "tamamlandi", estimatedMinutes: 45, dueDate: "2026-07-11", createdAt: "2026-07-10" },
    { id: "task-5", projectId: "project-3", categoryId: "category-4", createdBy: "user-4", title: "Klavye erişimini kontrol et", description: "Tab ve Escape tuşlarıyla tüm temel akışları denetle.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 75, dueDate: "2026-07-13", createdAt: "2026-07-10" },
    { id: "task-6", projectId: "project-4", categoryId: "category-7", createdBy: "user-4", title: "Smoke testleri çalıştır", description: "Giriş, proje, kategori, görev ve yorum akışlarını doğrula.", priority: "yuksek", status: "bekliyor", estimatedMinutes: 90, dueDate: "2026-07-15", createdAt: "2026-07-10" },
    { id: "task-7", projectId: "project-4", categoryId: "category-7", createdBy: "user-1", title: "RLS politikalarını denetle", description: "Kullanıcıların yalnızca ilişkili görevleri görebildiğini doğrula.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 120, dueDate: "2026-07-16", createdAt: "2026-07-10" },
    { id: "task-8", projectId: "project-1", categoryId: "category-2", createdBy: "user-1", title: "Filtreleme ekranını iyileştir", description: "Proje ve kategori ilişkisini görev formunda görünür yap.", priority: "orta", status: "bekliyor", estimatedMinutes: 60, dueDate: "2026-07-17", createdAt: "2026-07-11" },
    { id: "task-9", projectId: "project-5", categoryId: "category-8", createdBy: "user-1", title: "Mil ölçülerini kontrol et", description: "Motor mili ölçülerini teknik çizimle karşılaştır.", priority: "dusuk", status: "bekliyor", estimatedMinutes: 30, dueDate: "2026-07-18", createdAt: "2026-07-11" },
    { id: "task-10", projectId: "project-5", categoryId: "category-8", createdBy: "user-1", title: "Motor gövdesini modelle", description: "Motor gövdesinin üç boyutlu modelini hazırla.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 150, dueDate: "2026-07-19", createdAt: "2026-07-11" },
    { id: "task-11", projectId: "project-6", categoryId: "category-8", createdBy: "user-4", title: "Valf listesini hazırla", description: "Hidrolik devrede kullanılacak valfleri listele.", priority: "dusuk", status: "tamamlandi", estimatedMinutes: 40, dueDate: "2026-07-12", createdAt: "2026-07-11" },
    { id: "task-12", projectId: "project-6", categoryId: "category-8", createdBy: "user-4", title: "Basınç testini yap", description: "Hidrolik hattın çalışma basıncını doğrula.", priority: "yuksek", status: "bekliyor", estimatedMinutes: 90, dueDate: "2026-07-20", createdAt: "2026-07-11" },
    { id: "task-13", projectId: "project-7", categoryId: "category-8", createdBy: "user-1", title: "Dişli numaralarını düzenle", description: "Parça listesindeki dişli numaralarını sırala.", priority: "dusuk", status: "devam_ediyor", estimatedMinutes: 35, dueDate: "2026-07-21", createdAt: "2026-07-11" },
    { id: "task-14", projectId: "project-7", categoryId: "category-8", createdBy: "user-1", title: "Aktarım oranını hesapla", description: "Giriş ve çıkış dişlilerinin aktarım oranını hesapla.", priority: "orta", status: "tamamlandi", estimatedMinutes: 70, dueDate: "2026-07-13", createdAt: "2026-07-11" },
    { id: "task-15", projectId: "project-8", categoryId: "category-1", createdBy: "user-1", title: "Satış verilerini temizle", description: "Eksik ve yinelenen satış kayıtlarını düzenle.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 120, dueDate: "2026-07-22", createdAt: "2026-07-01" },
    { id: "task-16", projectId: "project-8", categoryId: "category-1", createdBy: "user-1", title: "Bölgesel satış grafiği oluştur", description: "Bölgelere göre aylık satış dağılımını göster.", priority: "orta", status: "bekliyor", estimatedMinutes: 75, dueDate: "2026-07-25", createdAt: "2026-07-02" },
    { id: "task-17", projectId: "project-9", categoryId: "category-2", createdBy: "user-4", title: "Portal ana sayfasını kodla", description: "Müşteri özet kartlarını ve görev listesini hazırla.", priority: "yuksek", status: "tamamlandi", estimatedMinutes: 180, dueDate: "2026-07-08", createdAt: "2026-06-24" },
    { id: "task-18", projectId: "project-9", categoryId: "category-2", createdBy: "user-4", title: "Bildirim menüsünü geliştir", description: "Okundu ve okunmadı bildirim durumlarını ekle.", priority: "dusuk", status: "devam_ediyor", estimatedMinutes: 60, dueDate: "2026-07-28", createdAt: "2026-07-03" },
    { id: "task-19", projectId: "project-10", categoryId: "category-3", createdBy: "user-1", title: "Kurulum bölümünü yaz", description: "Yerel ve bulut kurulum adımlarını belgeleyin.", priority: "orta", status: "tamamlandi", estimatedMinutes: 90, dueDate: "2026-07-05", createdAt: "2026-06-26" },
    { id: "task-20", projectId: "project-10", categoryId: "category-3", createdBy: "user-1", title: "Ekran görüntülerini güncelle", description: "Yeni arayüz ekranlarını kılavuza ekle.", priority: "dusuk", status: "bekliyor", estimatedMinutes: 45, dueDate: "2026-08-01", createdAt: "2026-07-04" },
    { id: "task-21", projectId: "project-11", categoryId: "category-4", createdBy: "user-4", title: "Çevrimdışı görev ekranını tasarla", description: "Bağlantı yokken görevlerin görüntülenmesini sağla.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 150, dueDate: "2026-07-24", createdAt: "2026-07-05" },
    { id: "task-22", projectId: "project-11", categoryId: "category-4", createdBy: "user-4", title: "Konum izinlerini test et", description: "Android ve iOS izin akışlarını doğrula.", priority: "orta", status: "bekliyor", estimatedMinutes: 80, dueDate: "2026-07-30", createdAt: "2026-07-06" },
    { id: "task-23", projectId: "project-12", categoryId: "category-5", createdBy: "user-1", title: "Renk kontrastlarını denetle", description: "Metin ve arka plan kontrast oranlarını ölç.", priority: "yuksek", status: "tamamlandi", estimatedMinutes: 70, dueDate: "2026-07-09", createdAt: "2026-07-01" },
    { id: "task-24", projectId: "project-12", categoryId: "category-5", createdBy: "user-1", title: "Ekran okuyucu etiketlerini ekle", description: "Form alanlarına erişilebilir adlar tanımla.", priority: "orta", status: "devam_ediyor", estimatedMinutes: 110, dueDate: "2026-07-26", createdAt: "2026-07-07" },
    { id: "task-25", projectId: "project-13", categoryId: "category-6", createdBy: "user-4", title: "Giriş testlerini otomatikleştir", description: "Başarılı ve hatalı giriş senaryolarını kapsa.", priority: "yuksek", status: "tamamlandi", estimatedMinutes: 130, dueDate: "2026-07-10", attachments: [{ id: "attachment-task-25-1", name: "test-senaryolari.png", type: "image/svg+xml", size: 598, dataUrl: sampleAttachmentDataUrl, uploadedAt: "2026-07-02" }], subtasks: [{ id: "subtask-task-25-1", title: "Başarılı giriş testini yaz", completed: true }, { id: "subtask-task-25-2", title: "Hatalı giriş durumunu kapsa", completed: true }, { id: "subtask-task-25-3", title: "Rapor çıktısını doğrula", completed: false }], createdAt: "2026-07-02" },
    { id: "task-26", projectId: "project-13", categoryId: "category-6", createdBy: "user-4", title: "Filtre regresyonlarını yaz", description: "Tüm filtre kombinasyonlarını otomatik doğrula.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 140, dueDate: "2026-07-23", createdAt: "2026-07-08" },
    { id: "task-27", projectId: "project-14", categoryId: "category-7", createdBy: "user-1", title: "Oturum süresini sınırla", description: "Hareketsiz oturumların güvenli biçimde kapanmasını sağla.", priority: "orta", status: "bekliyor", estimatedMinutes: 85, dueDate: "2026-08-03", createdAt: "2026-07-09" },
    { id: "task-28", projectId: "project-14", categoryId: "category-7", createdBy: "user-1", title: "Yetki matrisini doğrula", description: "Yönetici ve kullanıcı izinlerini karşılaştır.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 100, dueDate: "2026-07-27", createdAt: "2026-07-09" },
    { id: "task-29", projectId: "project-15", categoryId: "category-8", createdBy: "user-4", title: "Bant hızını hesapla", description: "Hedef kapasiteye göre konveyör hızını belirle.", priority: "orta", status: "tamamlandi", estimatedMinutes: 95, dueDate: "2026-07-07", createdAt: "2026-07-05" },
    { id: "task-30", projectId: "project-15", categoryId: "category-8", createdBy: "user-4", title: "Rulman seçimini yap", description: "Yük değerlerine uygun rulmanları listele.", priority: "dusuk", status: "bekliyor", estimatedMinutes: 55, dueDate: "2026-08-05", createdAt: "2026-07-10" },
    { id: "task-31", projectId: "project-16", categoryId: "category-1", createdBy: "user-1", title: "Başarı oranlarını karşılaştır", description: "Aylık ekip başarı oranlarını analiz et.", priority: "orta", status: "devam_ediyor", estimatedMinutes: 65, dueDate: "2026-07-29", createdAt: "2026-07-10" },
    { id: "task-32", projectId: "project-16", categoryId: "category-1", createdBy: "user-1", title: "Geciken görev raporu hazırla", description: "Proje ve kullanıcı bazında gecikmeleri grupla.", priority: "dusuk", status: "tamamlandi", estimatedMinutes: 50, dueDate: "2026-07-11", createdAt: "2026-07-10" },
    { id: "task-33", projectId: "project-17", categoryId: "category-2", createdBy: "user-4", title: "Yönetici tablosunu geliştir", description: "Sıralanabilir ekip ve görev tablosu ekle.", priority: "yuksek", status: "bekliyor", estimatedMinutes: 125, dueDate: "2026-08-02", createdAt: "2026-07-11" },
    { id: "task-34", projectId: "project-17", categoryId: "category-2", createdBy: "user-4", title: "Toplu işlem menüsünü ekle", description: "Seçilen görevlerin durumunu topluca güncelle.", priority: "dusuk", status: "devam_ediyor", estimatedMinutes: 100, dueDate: "2026-08-04", createdAt: "2026-07-11" },
    { id: "task-35", projectId: "project-18", categoryId: "category-6", createdBy: "user-1", title: "Görev API testlerini yaz", description: "Oluşturma, güncelleme ve silme uçlarını doğrula.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 160, dueDate: "2026-07-31", createdAt: "2026-07-11" },
    { id: "task-36", projectId: "project-18", categoryId: "category-6", createdBy: "user-1", title: "Hata yanıtlarını doğrula", description: "Geçersiz isteklerin hata kodlarını kontrol et.", priority: "orta", status: "bekliyor", estimatedMinutes: 80, dueDate: "2026-08-06", createdAt: "2026-07-11" },
    { id: "task-37", projectId: "project-9", categoryId: "category-2", createdBy: "user-4", title: "Müşteri destek notlarını ekle", description: "Sık sorulan sorular ve kısa yönlendirme metinleri yaz.", priority: "orta", status: "devam_ediyor", estimatedMinutes: 70, dueDate: "2026-07-18", createdAt: "2026-07-12" },
    { id: "task-38", projectId: "project-9", categoryId: "category-2", createdBy: "user-4", title: "Portal bildirimlerini grupla", description: "Önemli ve normal bildirimleri ayrı kartlarda göster.", priority: "yuksek", status: "bekliyor", estimatedMinutes: 95, dueDate: "2026-07-19", createdAt: "2026-07-12" },
    { id: "task-39", projectId: "project-10", categoryId: "category-3", createdBy: "user-1", title: "Kılavuz görsellerini yenile", description: "Eski ekran görüntülerini yeni sürümle değiştir.", priority: "dusuk", status: "bekliyor", estimatedMinutes: 55, dueDate: "2026-07-20", createdAt: "2026-07-12" },
    { id: "task-40", projectId: "project-11", categoryId: "category-4", createdBy: "user-4", title: "Saha raporu formunu düzenle", description: "Tek satırlık not ve konum alanlarını iyileştir.", priority: "orta", status: "devam_ediyor", estimatedMinutes: 85, dueDate: "2026-07-21", createdAt: "2026-07-12" },
    { id: "task-41", projectId: "project-12", categoryId: "category-5", createdBy: "user-1", title: "Klavyeyle gezinmeyi test et", description: "Formlar, menüler ve modal pencereler arasında dolaş.", priority: "yuksek", status: "bekliyor", estimatedMinutes: 100, dueDate: "2026-07-22", createdAt: "2026-07-12" },
    { id: "task-42", projectId: "project-13", categoryId: "category-6", createdBy: "user-4", title: "Ödeme akışı regresyonu", description: "Başarılı, hatalı ve iptal durumlarını otomatik doğrula.", priority: "yuksek", status: "devam_ediyor", estimatedMinutes: 140, dueDate: "2026-07-23", createdAt: "2026-07-12" },
    { id: "task-43", projectId: "project-16", categoryId: "category-1", createdBy: "user-1", title: "Raporu yönetime hazırla", description: "Özet metrikleri kısa yönetici notu haline getir.", priority: "orta", status: "bekliyor", estimatedMinutes: 75, dueDate: "2026-07-24", createdAt: "2026-07-12" },
    { id: "task-44", projectId: "project-18", categoryId: "category-6", createdBy: "user-1", title: "API sonuçlarını belgeye aktar", description: "Test çıktılarından kısa özet ve ekran notu hazırla.", priority: "dusuk", status: "bekliyor", estimatedMinutes: 60, dueDate: "2026-07-25", createdAt: "2026-07-12" },
  ],
  assignments: [
    {
      id: "assignment-1",
      taskId: "task-1",
      userId: "user-1",
      isCompleted: true,
      completedAt: "2026-07-09",
      earnedScore: 3,
      assignedAt: "2026-07-09",
    },
    {
      id: "assignment-2",
      taskId: "task-2",
      userId: "user-2",
      isCompleted: false,
      completedAt: "",
      earnedScore: 0,
      assignedAt: "2026-07-09",
    },
    {
      id: "assignment-3",
      taskId: "task-3",
      userId: "user-1",
      isCompleted: false,
      completedAt: "",
      earnedScore: 0,
      assignedAt: "2026-07-09",
    },
    { id: "assignment-4", taskId: "task-4", userId: "user-5", isCompleted: true, completedAt: "2026-07-11", earnedScore: 2, assignedAt: "2026-07-10" },
    { id: "assignment-5", taskId: "task-5", userId: "user-6", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-10" },
    { id: "assignment-6", taskId: "task-6", userId: "user-3", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-10" },
    { id: "assignment-7", taskId: "task-7", userId: "user-2", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-10" },
    { id: "assignment-8", taskId: "task-8", userId: "user-5", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-9", taskId: "task-9", userId: "user-2", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-10", taskId: "task-10", userId: "user-3", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-11", taskId: "task-11", userId: "user-5", isCompleted: true, completedAt: "2026-07-12", earnedScore: 1, assignedAt: "2026-07-11" },
    { id: "assignment-12", taskId: "task-12", userId: "user-6", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-13", taskId: "task-13", userId: "user-2", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-14", taskId: "task-14", userId: "user-3", isCompleted: true, completedAt: "2026-07-13", earnedScore: 2, assignedAt: "2026-07-11" },
    { id: "assignment-15", taskId: "task-15", userId: "user-7", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-01" },
    { id: "assignment-16", taskId: "task-16", userId: "user-8", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-02" },
    { id: "assignment-17", taskId: "task-17", userId: "user-9", isCompleted: true, completedAt: "2026-07-08", earnedScore: 3, assignedAt: "2026-06-24" },
    { id: "assignment-18", taskId: "task-18", userId: "user-10", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-03" },
    { id: "assignment-19", taskId: "task-19", userId: "user-11", isCompleted: true, completedAt: "2026-07-05", earnedScore: 2, assignedAt: "2026-06-26" },
    { id: "assignment-20", taskId: "task-20", userId: "user-12", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-04" },
    { id: "assignment-21", taskId: "task-21", userId: "user-7", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-05" },
    { id: "assignment-22", taskId: "task-22", userId: "user-8", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-06" },
    { id: "assignment-23", taskId: "task-23", userId: "user-9", isCompleted: true, completedAt: "2026-07-09", earnedScore: 3, assignedAt: "2026-07-01" },
    { id: "assignment-24", taskId: "task-24", userId: "user-10", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-07" },
    { id: "assignment-25", taskId: "task-25", userId: "user-11", isCompleted: true, completedAt: "2026-07-10", earnedScore: 3, assignedAt: "2026-07-02" },
    { id: "assignment-26", taskId: "task-26", userId: "user-12", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-08" },
    { id: "assignment-27", taskId: "task-27", userId: "user-7", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-09" },
    { id: "assignment-28", taskId: "task-28", userId: "user-8", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-09" },
    { id: "assignment-29", taskId: "task-29", userId: "user-9", isCompleted: true, completedAt: "2026-07-07", earnedScore: 2, assignedAt: "2026-07-05" },
    { id: "assignment-30", taskId: "task-30", userId: "user-10", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-10" },
    { id: "assignment-31", taskId: "task-31", userId: "user-11", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-10" },
    { id: "assignment-32", taskId: "task-32", userId: "user-12", isCompleted: true, completedAt: "2026-07-11", earnedScore: 1, assignedAt: "2026-07-10" },
    { id: "assignment-33", taskId: "task-33", userId: "user-7", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-34", taskId: "task-34", userId: "user-8", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-35", taskId: "task-35", userId: "user-9", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-36", taskId: "task-36", userId: "user-10", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-11" },
    { id: "assignment-37", taskId: "task-37", userId: "user-2", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-12" },
    { id: "assignment-38", taskId: "task-38", userId: "user-3", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-12" },
    { id: "assignment-39", taskId: "task-39", userId: "user-5", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-12" },
    { id: "assignment-40", taskId: "task-40", userId: "user-6", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-12" },
    { id: "assignment-41", taskId: "task-41", userId: "user-2", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-12" },
    { id: "assignment-42", taskId: "task-42", userId: "user-3", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-12" },
    { id: "assignment-43", taskId: "task-43", userId: "user-5", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-12" },
    { id: "assignment-44", taskId: "task-44", userId: "user-6", isCompleted: false, completedAt: "", earnedScore: 0, assignedAt: "2026-07-12" },
  ],
  taskGivers: [
    { id: "giver-1", taskId: "task-1", userId: "user-1", assignedAt: "2026-07-09" },
    { id: "giver-2", taskId: "task-2", userId: "user-1", assignedAt: "2026-07-09" },
    { id: "giver-3", taskId: "task-2", userId: "user-3", assignedAt: "2026-07-09" },
    { id: "giver-4", taskId: "task-3", userId: "user-1", assignedAt: "2026-07-09" },
    { id: "giver-5", taskId: "task-4", userId: "user-4", assignedAt: "2026-07-10" },
    { id: "giver-6", taskId: "task-5", userId: "user-4", assignedAt: "2026-07-10" },
    { id: "giver-7", taskId: "task-6", userId: "user-4", assignedAt: "2026-07-10" },
    { id: "giver-8", taskId: "task-7", userId: "user-1", assignedAt: "2026-07-10" },
    { id: "giver-9", taskId: "task-8", userId: "user-1", assignedAt: "2026-07-11" },
    { id: "giver-10", taskId: "task-9", userId: "user-1", assignedAt: "2026-07-11" },
    { id: "giver-11", taskId: "task-10", userId: "user-1", assignedAt: "2026-07-11" },
    { id: "giver-12", taskId: "task-11", userId: "user-4", assignedAt: "2026-07-11" },
    { id: "giver-13", taskId: "task-12", userId: "user-4", assignedAt: "2026-07-11" },
    { id: "giver-14", taskId: "task-13", userId: "user-1", assignedAt: "2026-07-11" },
    { id: "giver-15", taskId: "task-14", userId: "user-1", assignedAt: "2026-07-11" },
    ...Array.from({ length: 22 }, (_, index) => ({
      id: `giver-${index + 16}`,
      taskId: `task-${index + 15}`,
      userId: index % 2 === 0 ? "user-1" : "user-4",
      assignedAt: index < 6 ? "2026-07-01" : "2026-07-11",
    })),
    { id: "giver-38", taskId: "task-37", userId: "user-4", assignedAt: "2026-07-12" },
    { id: "giver-39", taskId: "task-38", userId: "user-1", assignedAt: "2026-07-12" },
    { id: "giver-40", taskId: "task-39", userId: "user-1", assignedAt: "2026-07-12" },
    { id: "giver-41", taskId: "task-40", userId: "user-4", assignedAt: "2026-07-12" },
    { id: "giver-42", taskId: "task-41", userId: "user-1", assignedAt: "2026-07-12" },
    { id: "giver-43", taskId: "task-42", userId: "user-4", assignedAt: "2026-07-12" },
    { id: "giver-44", taskId: "task-43", userId: "user-1", assignedAt: "2026-07-12" },
    { id: "giver-45", taskId: "task-44", userId: "user-1", assignedAt: "2026-07-12" },
  ],
  history: [
    {
      id: "history-1",
      taskId: "task-1",
      changedBy: "user-1",
      oldStatus: "devam_ediyor",
      newStatus: "tamamlandi",
      note: "ER diyagramı tamamlandı.",
      changedAt: "2026-07-09",
    },
  ],
  taskComments: [
    {
      id: "comment-1",
      taskId: "task-2",
      userId: "user-1",
      body: "Kanban akışı ve görev düzenleme kontrolleri birlikte test edilecek.",
      createdAt: "2026-07-09",
    },
  ],
};

const defaultAuthAccounts = [
  {
    id: "user-1",
    fullName: "Ömer Kaya",
    email: "omer@example.com",
    password: "123456",
    role: "admin",
  },
  { id: "user-2", fullName: "Ayşe Demir", email: "ayse@example.com", password: "123456", role: "user" },
  { id: "user-3", fullName: "Mehmet Yılmaz", email: "mehmet@example.com", password: "123456", role: "user" },
  { id: "user-4", fullName: "Zeynep Arslan", email: "zeynep@example.com", password: "123456", role: "admin" },
  { id: "user-5", fullName: "Can Aydın", email: "can@example.com", password: "123456", role: "user" },
  { id: "user-6", fullName: "Elif Şahin", email: "elif@example.com", password: "123456", role: "user" },
  { id: "user-7", fullName: "Burak Koç", email: "burak@example.com", password: "123456", role: "user" },
  { id: "user-8", fullName: "Selin Yıldız", email: "selin@example.com", password: "123456", role: "user" },
  { id: "user-9", fullName: "Mert Çelik", email: "mert@example.com", password: "123456", role: "user" },
  { id: "user-10", fullName: "Derya Akın", email: "derya@example.com", password: "123456", role: "user" },
  { id: "user-11", fullName: "Kerem Öz", email: "kerem@example.com", password: "123456", role: "user" },
  { id: "user-12", fullName: "İrem Güneş", email: "irem@example.com", password: "123456", role: "user" },
];

const state = loadState();
let authAccounts = loadAuthAccounts();
let currentSession = loadSession();
let editingProjectId = null;
let editingCategoryId = null;
let editingTaskId = null;
let activeDetailTaskId = null;
let draggedTaskId = null;
let taskDraftAttachments = [];
let activeAttachmentPreview = null;
let userModalMode = "create";
let supabaseClient = null;
let realtimeChannel = null;
let realtimeRefreshTimer = null;
let supabaseReady = false;
let isLoadingRemoteData = false;
let syncTimer = null;
let syncInFlight = null;
let syncRetryTimer = null;
let syncRetryCount = 0;
let pendingDeletions = loadPendingDeletions();
let toastTimer = null;

const elements = {
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  showLoginBtn: document.querySelector("#showLoginBtn"),
  showRegisterBtn: document.querySelector("#showRegisterBtn"),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  loginRole: document.querySelector("#loginRole"),
  registerName: document.querySelector("#registerName"),
  registerEmail: document.querySelector("#registerEmail"),
  registerPassword: document.querySelector("#registerPassword"),
  authMessage: document.querySelector("#authMessage"),
  sidebar: document.querySelector("#sidebar"),
  menuToggleBtn: document.querySelector("#menuToggleBtn"),
  sidebarBackdrop: document.querySelector("#sidebarBackdrop"),
  roleBadge: document.querySelector("#roleBadge"),
  activeUserLabel: document.querySelector("#activeUserLabel"),
  navRoleLabel: document.querySelector("#navRoleLabel"),
  dashboardNavText: document.querySelector("#dashboardNavText"),
  tasksNavText: document.querySelector("#tasksNavText"),
  connectionDot: document.querySelector("#connectionDot"),
  connectionStatus: document.querySelector("#connectionStatus"),
  toastRegion: document.querySelector("#toastRegion"),
  activeUser: document.querySelector("#activeUser"),
  addUserBtn: document.querySelector("#addUserBtn"),
  resetDemoBtn: document.querySelector("#resetDemoBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  navItems: document.querySelectorAll(".nav-item"),
  pageTitle: document.querySelector("#pageTitle"),
  pageSubtitle: document.querySelector("#pageSubtitle"),
  newTaskBtn: document.querySelector("#newTaskBtn"),
  dashboardView: document.querySelector("#dashboardView"),
  projectsView: document.querySelector("#projectsView"),
  tasksView: document.querySelector("#tasksView"),
  totalTasks: document.querySelector("#totalTasks"),
  completedTasks: document.querySelector("#completedTasks"),
  inProgressTasks: document.querySelector("#inProgressTasks"),
  successRate: document.querySelector("#successRate"),
  overdueTasks: document.querySelector("#overdueTasks"),
  focusTaskCount: document.querySelector("#focusTaskCount"),
  focusDueToday: document.querySelector("#focusDueToday"),
  focusOverdue: document.querySelector("#focusOverdue"),
  focusThisWeek: document.querySelector("#focusThisWeek"),
  focusNew: document.querySelector("#focusNew"),
  focusHigh: document.querySelector("#focusHigh"),
  focusTaskList: document.querySelector("#focusTaskList"),
  dashboardSectionTabs: document.querySelectorAll("[data-dashboard-tab]"),
  dashboardSectionPanels: document.querySelectorAll("[data-dashboard-panel]"),
  notificationCount: document.querySelector("#notificationCount"),
  notificationList: document.querySelector("#notificationList"),
  userScores: document.querySelector("#userScores"),
  workloadInsights: document.querySelector("#workloadInsights"),
  assignmentRecommendation: document.querySelector("#assignmentRecommendation"),
  upcomingTasks: document.querySelector("#upcomingTasks"),
  historyList: document.querySelector("#historyList"),
  projectForm: document.querySelector("#projectForm"),
  projectFormTitle: document.querySelector("#projectFormTitle"),
  projectSubmitBtn: document.querySelector("#projectSubmitBtn"),
  cancelProjectEditBtn: document.querySelector("#cancelProjectEditBtn"),
  projectName: document.querySelector("#projectName"),
  projectDescription: document.querySelector("#projectDescription"),
  projectCategory: document.querySelector("#projectCategory"),
  projectCount: document.querySelector("#projectCount"),
  projectList: document.querySelector("#projectList"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryFormTitle: document.querySelector("#categoryFormTitle"),
  categorySubmitBtn: document.querySelector("#categorySubmitBtn"),
  cancelCategoryEditBtn: document.querySelector("#cancelCategoryEditBtn"),
  categoryName: document.querySelector("#categoryName"),
  categoryColor: document.querySelector("#categoryColor"),
  categoryCount: document.querySelector("#categoryCount"),
  categoryList: document.querySelector("#categoryList"),
  categorySearchInput: document.querySelector("#categorySearchInput"),
  searchInput: document.querySelector("#searchInput"),
  taskFilters: document.querySelector("#taskFilters"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  projectFilter: document.querySelector("#projectFilter"),
  assigneeFilter: document.querySelector("#assigneeFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  clearFiltersBtn: document.querySelector("#clearFiltersBtn"),
  filterToggleBtn: document.querySelector("#filterToggleBtn"),
  activeFilterCount: document.querySelector("#activeFilterCount"),
  advancedFilters: document.querySelector("#advancedFilters"),
  filterScopeSummary: document.querySelector("#filterScopeSummary"),
  taskLayoutButtons: document.querySelectorAll("[data-task-layout]"),
  taskLayoutPanels: document.querySelectorAll("[data-task-layout-panel]"),
  taskForm: document.querySelector("#taskForm"),
  taskFormTitle: document.querySelector("#taskFormTitle"),
  taskSubmitBtn: document.querySelector("#taskSubmitBtn"),
  cancelTaskEditBtn: document.querySelector("#cancelTaskEditBtn"),
  closeTaskDrawerBtn: document.querySelector("#closeTaskDrawerBtn"),
  taskDrawerBackdrop: document.querySelector("#taskDrawerBackdrop"),
  taskTitle: document.querySelector("#taskTitle"),
  taskDescription: document.querySelector("#taskDescription"),
  taskSubtasks: document.querySelector("#taskSubtasks"),
  taskProject: document.querySelector("#taskProject"),
  taskCategory: document.querySelector("#taskCategory"),
  taskAssignee: document.querySelector("#taskAssignee"),
  taskGivers: document.querySelector("#taskGivers"),
  taskGiverChips: document.querySelector("#taskGiverChips"),
  taskDetailsToggle: document.querySelector("#taskDetailsToggle"),
  taskAdvancedFields: document.querySelector("#taskAdvancedFields"),
  taskPriority: document.querySelector("#taskPriority"),
  taskStatus: document.querySelector("#taskStatus"),
  taskMinutes: document.querySelector("#taskMinutes"),
  taskDueDate: document.querySelector("#taskDueDate"),
  taskFiles: document.querySelector("#taskFiles"),
  taskAttachmentDropzone: document.querySelector("#taskAttachmentDropzone"),
  taskAttachmentStatus: document.querySelector("#taskAttachmentStatus"),
  taskAttachmentPreview: document.querySelector("#taskAttachmentPreview"),
  taskCount: document.querySelector("#taskCount"),
  kanbanBoard: document.querySelector("#kanbanBoard"),
  taskList: document.querySelector("#taskList"),
  taskDetailModal: document.querySelector("#taskDetailModal"),
  closeTaskDetailBtn: document.querySelector("#closeTaskDetailBtn"),
  taskDetailTitle: document.querySelector("#taskDetailTitle"),
  taskDetailBody: document.querySelector("#taskDetailBody"),
  attachmentPreviewModal: document.querySelector("#attachmentPreviewModal"),
  closeAttachmentPreviewBtn: document.querySelector("#closeAttachmentPreviewBtn"),
  attachmentPreviewTitle: document.querySelector("#attachmentPreviewTitle"),
  attachmentPreviewBody: document.querySelector("#attachmentPreviewBody"),
  userModal: document.querySelector("#userModal"),
  closeUserModalBtn: document.querySelector("#closeUserModalBtn"),
  userForm: document.querySelector("#userForm"),
  userName: document.querySelector("#userName"),
  userRole: document.querySelector("#userRole"),
  userEmailPreview: document.querySelector("#userEmailPreview"),
  userSubmitBtn: document.querySelector("#userSubmitBtn"),
  cancelUserBtn: document.querySelector("#cancelUserBtn"),
  taskCommentForm: document.querySelector("#taskCommentForm"),
  taskCommentText: document.querySelector("#taskCommentText"),
  demoExamplesList: document.querySelector("#demoExamplesList"),
};

function loadState() {
  const storedState = localStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return structuredClone(defaultState);
  }

  try {
    const parsed = JSON.parse(storedState);
    const nextState = { ...structuredClone(defaultState), ...parsed };
    return migrateState(nextState, parsed);
  } catch {
    return structuredClone(defaultState);
  }
}

function migrateState(nextState, parsedState) {
  nextState.users = (nextState.users || []).map((user) => ({
    ...user,
    role: user.role || "user",
  }));
  nextState.projects = (nextState.projects || []).map((project) => ({
    ...project,
    categoryId:
      project.categoryId ||
      nextState.categories?.find((category) => category.projectId === project.id)?.id ||
      nextState.tasks?.find((task) => task.projectId === project.id)?.categoryId ||
      nextState.categories?.[0]?.id ||
      "",
  }));
  nextState.tasks = (nextState.tasks || []).map((task) => ({
    ...task,
    attachments: Array.isArray(task.attachments) ? task.attachments : [],
    subtasks: Array.isArray(task.subtasks)
      ? task.subtasks.map((subtask) => ({
          id: subtask.id || createId("subtask"),
          title: subtask.title || "",
          completed: Boolean(subtask.completed),
        }))
      : [],
  }));

  if (!Array.isArray(parsedState.taskGivers)) {
    nextState.taskGivers = nextState.tasks.map((task) => ({
      id: createId("giver"),
      taskId: task.id,
      userId: task.createdBy,
      assignedAt: task.createdAt || today(),
    }));
  }

  if (!Array.isArray(parsedState.taskComments)) {
    nextState.taskComments = [];
  }

  return nextState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (supabaseReady && currentSession?.userId && !isLoadingRemoteData) {
    scheduleSupabaseSync();
  }
}

function loadPendingDeletions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETION_QUEUE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePendingDeletions() {
  localStorage.setItem(DELETION_QUEUE_KEY, JSON.stringify(pendingDeletions));
}

async function flushPendingDeletions(client) {
  for (const deletion of [...pendingDeletions]) {
    const { error } = await client.from(deletion.tableName).delete().eq("id", deletion.rowId);
    if (error) throw error;
    pendingDeletions = pendingDeletions.filter((item) => item.key !== deletion.key);
    savePendingDeletions();
  }
}

function setConnectionStatus(status, message) {
  elements.connectionDot.className = `connection-dot ${status}`.trim();
  elements.connectionStatus.textContent = message;
}

function showToast(message, type = "success") {
  clearTimeout(toastTimer);
  elements.toastRegion.innerHTML = `<div class="toast ${type}">${escapeHtml(message)}</div>`;
  toastTimer = setTimeout(() => {
    elements.toastRegion.innerHTML = "";
  }, 3200);
}

function scheduleSupabaseSync() {
  if (!supabaseReady || !currentSession?.userId) return;
  clearTimeout(syncTimer);
  clearTimeout(syncRetryTimer);
  setConnectionStatus("syncing", "Supabase · Kaydediliyor…");
  syncTimer = setTimeout(() => {
    syncInFlight = (syncInFlight || Promise.resolve())
      .catch(() => undefined)
      .then(syncStateToSupabase)
      .then((synced) => {
        if (synced) {
          syncRetryCount = 0;
          return;
        }

        const retryDelay = Math.min(30000, 1000 * 2 ** syncRetryCount);
        syncRetryCount += 1;
        syncRetryTimer = setTimeout(scheduleSupabaseSync, retryDelay);
      })
      .finally(() => {
        syncInFlight = null;
      });
  }, 300);
}

function isSupabaseConfigured() {
  const config = window.TODO_PLUS_SUPABASE;
  return Boolean(
    window.supabase &&
      config?.url &&
      config?.anonKey &&
      config.url.startsWith("https://") &&
      config.anonKey.length > 20,
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      window.TODO_PLUS_SUPABASE.url,
      window.TODO_PLUS_SUPABASE.anonKey,
    );
  }

  return supabaseClient;
}

function stopRealtimeUpdates() {
  if (realtimeRefreshTimer) clearTimeout(realtimeRefreshTimer);
  realtimeRefreshTimer = null;
  if (realtimeChannel && supabaseClient) supabaseClient.removeChannel(realtimeChannel);
  realtimeChannel = null;
}

function startRealtimeUpdates(userId) {
  const client = getSupabaseClient();
  if (!client || !userId) return;
  stopRealtimeUpdates();
  const refresh = () => {
    clearTimeout(realtimeRefreshTimer);
    realtimeRefreshTimer = setTimeout(async () => {
      const loaded = await loadSupabaseData(userId);
      if (loaded) renderAll();
    }, 350);
  };
  realtimeChannel = ["projects", "categories", "tasks", "task_assignments", "task_givers", "task_history", "task_comments"]
    .reduce(
      (channel, table) => channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh),
      client.channel(`todo-plus-${userId}`),
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") setConnectionStatus("online", "Supabase · Canlı bağlı");
      if (status === "CHANNEL_ERROR") setConnectionStatus("error", "Supabase · Canlı bağlantı hatası");
    });
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function toSupabaseRows() {
  const allUsers = state.users.filter((user) => isUuid(user.id));
  const userIds = new Set(allUsers.map((user) => user.id));
  const allCategories = state.categories.filter(
    (category) => isUuid(category.id) && userIds.has(category.userId),
  );
  const categoryIds = new Set(allCategories.map((category) => category.id));
  const allProjects = state.projects.filter(
    (project) => isUuid(project.id) && userIds.has(project.userId) && categoryIds.has(project.categoryId),
  );
  const projectIds = new Set(allProjects.map((project) => project.id));
  const tasks = state.tasks.filter(
    (task) =>
      isUuid(task.id) &&
      projectIds.has(task.projectId) &&
      (!task.categoryId || categoryIds.has(task.categoryId)) &&
      userIds.has(task.createdBy),
  );
  const taskIds = new Set(tasks.map((task) => task.id));

  return {
    users: allUsers.map((user) => ({
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      role: user.role || "user",
    })),
    projects: allProjects.map((project) => ({
      id: project.id,
      user_id: project.userId,
      category_id: project.categoryId || null,
      name: project.name,
      description: project.description,
      created_at: project.createdAt,
      updated_at: project.updatedAt || project.createdAt,
    })),
    categories: allCategories.map((category) => ({
      id: category.id,
      user_id: category.userId,
      name: category.name,
      color: category.color,
      created_at: category.createdAt,
    })),
    tasks: tasks.map((task) => ({
      id: task.id,
      project_id: task.projectId,
      category_id: task.categoryId || null,
      created_by: task.createdBy,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      estimated_minutes: task.estimatedMinutes,
      due_date: task.dueDate || null,
      created_at: task.createdAt,
      updated_at: task.updatedAt || task.createdAt,
    })),
    task_assignments: state.assignments
      .filter((assignment) => isUuid(assignment.id) && taskIds.has(assignment.taskId) && userIds.has(assignment.userId))
      .map((assignment) => ({
        id: assignment.id,
        task_id: assignment.taskId,
        user_id: assignment.userId,
        is_completed: assignment.isCompleted,
        completed_at: assignment.completedAt || null,
        earned_score: assignment.earnedScore,
        assigned_at: assignment.assignedAt,
      })),
    task_givers: state.taskGivers
      .filter((giver) => isUuid(giver.id) && taskIds.has(giver.taskId) && userIds.has(giver.userId))
      .map((giver) => ({
        id: giver.id,
        task_id: giver.taskId,
        user_id: giver.userId,
        assigned_at: giver.assignedAt,
      })),
    task_history: state.history
      .filter((item) => isUuid(item.id) && taskIds.has(item.taskId) && userIds.has(item.changedBy))
      .map((item) => ({
        id: item.id,
        task_id: item.taskId,
        changed_by: item.changedBy,
        old_status: item.oldStatus || null,
        new_status: item.newStatus,
        note: item.note,
        changed_at: item.changedAt,
      })),
    task_comments: state.taskComments
      .filter((comment) => isUuid(comment.id) && taskIds.has(comment.taskId) && userIds.has(comment.userId))
      .map((comment) => ({
        id: comment.id,
        task_id: comment.taskId,
        user_id: comment.userId,
        body: comment.body,
        created_at: comment.createdAt,
      })),
  };
}

async function syncStateToSupabase() {
  const client = getSupabaseClient();
  if (!client) return false;

  const rows = toSupabaseRows();
  const upsertRows = async (tableName, tableRows, options = undefined) => {
    if (tableRows.length === 0) return;
    const { error } = await client.from(tableName).upsert(tableRows, options);
    if (error) throw error;
  };

  try {
    await flushPendingDeletions(client);

    const sessionUserId = currentSession?.userId;
    if (isAdmin()) {
      await upsertRows("users", rows.users);
      await upsertRows("categories", rows.categories);
      await upsertRows("projects", rows.projects);
      await upsertRows("tasks", rows.tasks);
      await upsertRows("task_assignments", rows.task_assignments);
      await upsertRows("task_givers", rows.task_givers);
      await upsertRows("task_history", rows.task_history, { ignoreDuplicates: true });
      await upsertRows("task_comments", rows.task_comments, { ignoreDuplicates: true });
    } else {
      const ownTaskIds = new Set(
        rows.task_assignments
          .filter((assignment) => assignment.user_id === sessionUserId)
          .map((assignment) => assignment.task_id),
      );
      await upsertRows("users", rows.users.filter((user) => user.id === sessionUserId));
      await upsertRows("tasks", rows.tasks.filter((task) => ownTaskIds.has(task.id)));
      await upsertRows(
        "task_assignments",
        rows.task_assignments.filter((assignment) => assignment.user_id === sessionUserId),
      );
      await upsertRows(
        "task_history",
        rows.task_history.filter((item) => item.changed_by === sessionUserId),
        { ignoreDuplicates: true },
      );
      await upsertRows(
        "task_comments",
        rows.task_comments.filter((comment) => comment.user_id === sessionUserId),
        { ignoreDuplicates: true },
      );
    }
    setConnectionStatus("online", "Supabase · Güncel");
    return true;
  } catch (error) {
    console.error("Supabase senkronizasyon hatası:", error);
    setConnectionStatus("error", "Supabase · Kayıt başarısız");
    showToast("Bulut kaydı başarısız oldu; veriler yerel olarak korundu.", "error");
    return false;
  }
}

async function deleteSupabaseRow(tableName, rowId) {
  const client = getSupabaseClient();
  if (!client || !rowId || !isUuid(rowId)) return;

  const deletion = { key: `${tableName}:${rowId}`, tableName, rowId };
  if (!pendingDeletions.some((item) => item.key === deletion.key)) {
    pendingDeletions.push(deletion);
    savePendingDeletions();
  }

  try {
    const { error } = await client.from(tableName).delete().eq("id", rowId);
    if (error) throw error;
    pendingDeletions = pendingDeletions.filter((item) => item.key !== deletion.key);
    savePendingDeletions();
  } catch (error) {
    console.error(`${tableName} silme hatası:`, error);
    setConnectionStatus("error", "Supabase · Silme başarısız");
    showToast("Bulut kaydı silinemedi. Bağlantınızı kontrol edin.", "error");
    scheduleSupabaseSync();
  }
}

async function loadSupabaseData(userId) {
  const client = getSupabaseClient();
  if (!client) return;

  isLoadingRemoteData = true;
  try {
    await flushPendingDeletions(client);
    const [
      usersResult,
      projectsResult,
      categoriesResult,
      tasksResult,
      assignmentsResult,
      giversResult,
      historyResult,
      commentsResult,
    ] = await Promise.all([
      client.from("users").select("*"),
      client.from("projects").select("*"),
      client.from("categories").select("*"),
      client.from("tasks").select("*"),
      client.from("task_assignments").select("*"),
      client.from("task_givers").select("*"),
      client.from("task_history").select("*"),
      client.from("task_comments").select("*"),
    ]);

    const failedResult = [
      usersResult,
      projectsResult,
      categoriesResult,
      tasksResult,
      assignmentsResult,
      giversResult,
      historyResult,
      commentsResult,
    ].find((result) => result.error);

    if (failedResult) throw failedResult.error;

    if (usersResult.data) {
      state.users = usersResult.data.map((user) => ({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role || "user",
      }));
    }

    if (projectsResult.data) {
      state.projects = projectsResult.data.map((project) => ({
        id: project.id,
        userId: project.user_id,
        categoryId: project.category_id || "",
        name: project.name,
        description: project.description || "",
        createdAt: project.created_at?.slice(0, 10) || today(),
        updatedAt: project.updated_at?.slice(0, 10) || today(),
      }));
    }

    if (categoriesResult.data) {
      state.categories = categoriesResult.data.map((category) => ({
        id: category.id,
        userId: category.user_id,
        name: category.name,
        color: category.color,
        createdAt: category.created_at?.slice(0, 10) || today(),
      }));
    }

    if (tasksResult.data) {
      state.tasks = tasksResult.data.map((task) => ({
        id: task.id,
        projectId: task.project_id,
        categoryId: task.category_id || "",
        createdBy: task.created_by,
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        estimatedMinutes: task.estimated_minutes,
        dueDate: task.due_date || "",
        createdAt: task.created_at?.slice(0, 10) || today(),
        updatedAt: task.updated_at?.slice(0, 10) || today(),
      }));
    }

    if (assignmentsResult.data) {
      state.assignments = assignmentsResult.data.map((assignment) => ({
        id: assignment.id,
        taskId: assignment.task_id,
        userId: assignment.user_id,
        isCompleted: assignment.is_completed,
        completedAt: assignment.completed_at?.slice(0, 10) || "",
        earnedScore: assignment.earned_score,
        assignedAt: assignment.assigned_at?.slice(0, 10) || today(),
      }));
    }

    if (giversResult.data) {
      state.taskGivers = giversResult.data.map((giver) => ({
        id: giver.id,
        taskId: giver.task_id,
        userId: giver.user_id,
        assignedAt: giver.assigned_at?.slice(0, 10) || today(),
      }));
    }

    if (historyResult.data) {
      state.history = historyResult.data.map((item) => ({
        id: item.id,
        taskId: item.task_id,
        changedBy: item.changed_by,
        oldStatus: item.old_status || "",
        newStatus: item.new_status,
        note: item.note || "",
        changedAt: item.changed_at?.slice(0, 10) || today(),
      }));
    }

    if (commentsResult.data) {
      state.taskComments = commentsResult.data.map((comment) => ({
        id: comment.id,
        taskId: comment.task_id,
        userId: comment.user_id,
        body: comment.body || "",
        createdAt: comment.created_at?.slice(0, 10) || today(),
      }));
    }

    state.activeUserId = userId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Supabase veri yükleme hatası:", error);
    setConnectionStatus("error", "Supabase · Yükleme başarısız");
    showToast("Bulut verileri yüklenemedi; son yerel veriler gösteriliyor.", "error");
    return false;
  } finally {
    isLoadingRemoteData = false;
  }
}

function loadAuthAccounts() {
  const storedAccounts = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAccounts) {
    return structuredClone(defaultAuthAccounts);
  }

  try {
    const parsed = JSON.parse(storedAccounts);
    if (!Array.isArray(parsed)) return structuredClone(defaultAuthAccounts);
    return parsed.map((account) => ({
      ...account,
      role: account.role || "user",
    }));
  } catch {
    return structuredClone(defaultAuthAccounts);
  }
}

function saveAuthAccounts() {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authAccounts));
}

function loadSession() {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    return null;
  }
}

function saveSession(userId) {
  currentSession = {
    userId,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
}

function clearSession() {
  currentSession = null;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function resetDemoData() {
  if (supabaseReady) {
    showToast("Demo verilerini sıfırlama Supabase modunda kapalıdır.", "error");
    return;
  }
  const freshState = structuredClone(defaultState);

  Object.keys(state).forEach((key) => {
    delete state[key];
  });

  Object.assign(state, freshState);
  authAccounts = structuredClone(defaultAuthAccounts);
  currentSession = {
    userId: state.activeUserId,
    loggedInAt: new Date().toISOString(),
  };

  saveAuthAccounts();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
  pendingDeletions = [];
  localStorage.removeItem(DELETION_QUEUE_KEY);
  resetProjectForm();
  resetCategoryForm();
  resetTaskForm();
  renderAll();
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (
      Number(char) ^
      (((window.crypto?.getRandomValues?.(new Uint8Array(1))[0] ?? Math.floor(Math.random() * 256)) &
        (15 >> (Number(char) / 4))))
    ).toString(16),
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getDueDateMeta(task) {
  if (!task.dueDate) {
    return { label: "Tarih yok", className: "" };
  }

  if (task.status === "tamamlandi") {
    return { label: formatDate(task.dueDate), className: "due-complete" };
  }

  const current = new Date(`${today()}T12:00:00`);
  const dueDate = new Date(`${task.dueDate}T12:00:00`);
  const remainingDays = Math.ceil((dueDate - current) / 86400000);

  if (remainingDays < 0) {
    return { label: `${formatDate(task.dueDate)} - gecikti`, className: "due-overdue" };
  }

  if (remainingDays <= 2) {
    return { label: `${formatDate(task.dueDate)} - yaklaşıyor`, className: "due-soon" };
  }

  return { label: formatDate(task.dueDate), className: "" };
}

function isTaskOverdue(task) {
  if (!task.dueDate || task.status === "tamamlandi") return false;
  return new Date(`${task.dueDate}T12:00:00`) < new Date(`${today()}T12:00:00`);
}

function getTaskAttachments(task) {
  return Array.isArray(task?.attachments) ? task.attachments : [];
}

function getTaskSubtasks(task) {
  return Array.isArray(task?.subtasks) ? task.subtasks : [];
}

function parseTaskSubtasks(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((title) => ({
      id: createId("subtask"),
      title,
      completed: false,
    }));
}

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round((size / 1048576) * 10) / 10} MB`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
}

function getAttachmentLabel(attachment) {
  if (!attachment?.type) return "Dosya";
  if (attachment.type.startsWith("image/")) return "Görsel";
  if (attachment.type.includes("pdf")) return "PDF";
  if (attachment.type.includes("spreadsheet") || attachment.name?.match(/\.(xlsx|xls|csv)$/i)) return "Tablo";
  if (attachment.name?.match(/\.(docx|doc)$/i)) return "Belge";
  return "Dosya";
}

function getAttachmentGroupLabel(attachment) {
  const label = getAttachmentLabel(attachment);
  if (label === "Görsel") return "Görseller";
  if (label === "PDF") return "PDF'ler";
  if (label === "Tablo") return "Tablolar";
  if (label === "Belge") return "Belgeler";
  return "Diğer ekler";
}

function getAttachmentGroupIcon(attachment) {
  const label = getAttachmentLabel(attachment);
  if (label === "Görsel") return "🖼";
  if (label === "PDF") return "PDF";
  if (label === "Tablo") return "▦";
  if (label === "Belge") return "DOC";
  return "📎";
}

function renderTaskAttachmentPreview() {
  if (!elements.taskAttachmentPreview) return;

  if (taskDraftAttachments.length === 0) {
    elements.taskAttachmentPreview.innerHTML = `<div class="empty-state attachment-empty">Seçili dosya yok.</div>`;
    return;
  }

  elements.taskAttachmentPreview.innerHTML = taskDraftAttachments
    .map(
      (attachment) => `
        <article class="attachment-preview-card">
          ${
            attachment.type?.startsWith("image/")
              ? `<img src="${attachment.dataUrl}" alt="${escapeHtml(attachment.name)}" class="attachment-thumb" />`
              : `<div class="attachment-thumb attachment-thumb-text">${escapeHtml(getAttachmentGroupIcon(attachment))}</div>`
          }
          <div class="attachment-preview-meta">
            <strong>${escapeHtml(attachment.name)}</strong>
            <p>${escapeHtml(getAttachmentLabel(attachment))} · ${formatFileSize(attachment.size)}</p>
          </div>
          <button class="small-button" type="button" data-remove-draft-attachment="${attachment.id}">Kaldır</button>
        </article>
      `,
    )
    .join("");
}

function clearTaskDraftAttachments() {
  taskDraftAttachments = [];
  if (elements.taskAttachmentStatus) {
    elements.taskAttachmentStatus.classList.add("hidden");
    const statusText = elements.taskAttachmentStatus.querySelector(".attachment-status-text");
    const statusBar = elements.taskAttachmentStatus.querySelector(".attachment-status-bar span");
    if (statusText) statusText.textContent = "Dosya hazırlanıyor";
    if (statusBar) statusBar.style.width = "0%";
  }
  renderTaskAttachmentPreview();
}

async function addAttachmentsToDraft(fileList) {
  const files = [...(fileList || [])];
  if (files.length === 0) return;

  const maxFiles = 5;
  const maxFileSize = 3 * 1024 * 1024;
  const remainingSlots = Math.max(0, maxFiles - taskDraftAttachments.length);
  const safeFiles = files.slice(0, remainingSlots);

  if (elements.taskAttachmentStatus) {
    elements.taskAttachmentStatus.classList.remove("hidden");
    const statusText = elements.taskAttachmentStatus.querySelector(".attachment-status-text");
    const statusBar = elements.taskAttachmentStatus.querySelector(".attachment-status-bar span");
    if (statusText) statusText.textContent = `${safeFiles.length} dosya yükleniyor`;
    if (statusBar) statusBar.style.width = "0%";
  }

  let loadedCount = 0;
  for (const file of safeFiles) {
    if (file.size > maxFileSize) {
      showToast(`"${file.name}" çok büyük. 3 MB altı dosya seçin.`, "error");
      continue;
    }

    const dataUrl = await readFileAsDataURL(file);
    taskDraftAttachments.push({
      id: createId("attachment"),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      dataUrl,
      uploadedAt: today(),
    });
    loadedCount += 1;
    if (elements.taskAttachmentStatus) {
      const statusText = elements.taskAttachmentStatus.querySelector(".attachment-status-text");
      const statusBar = elements.taskAttachmentStatus.querySelector(".attachment-status-bar span");
      const total = safeFiles.length || 1;
      const percent = Math.round((loadedCount / total) * 100);
      if (statusText) statusText.textContent = `${loadedCount}/${total} dosya hazır`;
      if (statusBar) statusBar.style.width = `${percent}%`;
    }
  }

  if (files.length > safeFiles.length) {
    showToast("En fazla 5 dosya eklenebilir.", "error");
  }

  if (elements.taskAttachmentStatus) {
    setTimeout(() => {
      if (elements.taskAttachmentStatus) {
        elements.taskAttachmentStatus.classList.add("hidden");
      }
    }, 900);
  }

  renderTaskAttachmentPreview();
}

async function readAttachmentsFromInput(input) {
  await addAttachmentsToDraft(input?.files || []);
  if (input) input.value = "";
  return [...taskDraftAttachments];
}

function getDateAtNoon(value) {
  return new Date(`${value}T12:00:00`);
}

function getDaysBetween(later, earlier) {
  return Math.round((getDateAtNoon(later) - getDateAtNoon(earlier)) / 86400000);
}

function isWithinDays(value, base, maxDays) {
  const diff = getDaysBetween(value, base);
  return diff >= 0 && diff <= maxDays;
}

function getTaskAssignmentDate(task) {
  return getTaskAssignment(task.id)?.assignedAt || task.createdAt || today();
}

function getDashboardFocusBuckets(tasks) {
  const currentDate = today();
  const upcomingWindow = 7;
  const focusItems = tasks
    .filter((task) => task.status !== "tamamlandi")
    .map((task) => {
      const dueDate = task.dueDate || "";
      const assignmentDate = getTaskAssignmentDate(task);
      const tags = [];
      let urgency = getTaskScore(task);

      if (dueDate && isTaskOverdue(task)) {
        tags.push("Gecikmiş");
        urgency += 100;
      } else if (dueDate === currentDate) {
        tags.push("Bugün");
        urgency += 80;
      } else if (dueDate && isWithinDays(dueDate, currentDate, upcomingWindow)) {
        tags.push("Bu hafta");
        urgency += 40;
      }

      if (assignmentDate && isWithinDays(assignmentDate, currentDate, 3)) {
        tags.push("Yeni atandı");
        urgency += 20;
      }

      if (task.priority === "yuksek") {
        tags.push("Yüksek öncelik");
      }

      return {
        task,
        tags,
        urgency,
        dueDate,
        assignmentDate,
      };
    })
    .filter((item) => item.tags.length > 0)
    .sort((a, b) => {
      if (b.urgency !== a.urgency) return b.urgency - a.urgency;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return (b.task.createdAt || "").localeCompare(a.task.createdAt || "");
    });

  return {
    items: focusItems,
    dueToday: tasks.filter((task) => task.status !== "tamamlandi" && task.dueDate === currentDate).length,
    overdue: tasks.filter(isTaskOverdue).length,
    thisWeek: tasks.filter(
      (task) =>
        task.status !== "tamamlandi" &&
        !!task.dueDate &&
        task.dueDate !== currentDate &&
        isWithinDays(task.dueDate, currentDate, upcomingWindow),
    ).length,
    newAssigned: tasks.filter((task) => {
      if (task.status === "tamamlandi") return false;
      const assignmentDate = getTaskAssignmentDate(task);
      return isWithinDays(assignmentDate, currentDate, 3);
    }).length,
    highPriority: tasks.filter((task) => task.status !== "tamamlandi" && task.priority === "yuksek").length,
  };
}

function getDashboardNotifications(tasks) {
  const currentDate = today();
  const visibleTaskIds = new Set(tasks.map((task) => task.id));
  const notifications = [];

  tasks.forEach((task) => {
    if (task.status !== "tamamlandi" && task.dueDate === currentDate) {
      notifications.push({
        id: `today-${task.id}`,
        type: "due_today",
        title: "Bugün teslim",
        message: `${task.title} görevi bugün teslim edilmeli.`,
        badge: "Bugün",
        date: task.dueDate,
        severity: 3,
      });
    } else if (isTaskOverdue(task)) {
      notifications.push({
        id: `overdue-${task.id}`,
        type: "overdue",
        title: "Geciken görev",
        message: `${task.title} görevi gecikti.`,
        badge: "Gecikti",
        date: task.dueDate,
        severity: 4,
      });
    } else if (task.status !== "tamamlandi" && task.dueDate && isWithinDays(task.dueDate, currentDate, 2)) {
      notifications.push({
        id: `soon-${task.id}`,
        type: "due_soon",
        title: "Yaklaşan teslim",
        message: `${task.title} görevi ${formatDate(task.dueDate)} tarihinde teslim edilecek.`,
        badge: "Yakın",
        date: task.dueDate,
        severity: 2,
      });
    }
  });

  state.taskComments
    .filter((comment) => visibleTaskIds.has(comment.taskId))
    .slice(-4)
    .forEach((comment) => {
      notifications.push({
        id: `comment-${comment.id}`,
        type: "comment",
        title: "Yeni yorum",
        message: `${getUserName(comment.userId)}: ${comment.body}`,
        badge: "Yorum",
        date: comment.createdAt,
        severity: 2,
      });
    });

  state.history
    .filter((item) => visibleTaskIds.has(item.taskId))
    .slice(-5)
    .forEach((item) => {
      notifications.push({
        id: `history-${item.id}`,
        type: "history",
        title: "Durum değişikliği",
        message: `${getTaskTitle(item.taskId)} için "${item.note}"`,
        badge: "Hareket",
        date: item.changedAt,
        severity: 1,
      });
    });

  return notifications
    .sort((a, b) => {
      if (b.severity !== a.severity) return b.severity - a.severity;
      return String(b.date || "").localeCompare(String(a.date || ""));
    })
    .slice(0, 8);
}

function getActiveUser() {
  return state.users.find((user) => user.id === state.activeUserId) || state.users[0];
}

function getSessionUser() {
  return state.users.find((user) => user.id === currentSession?.userId) || getActiveUser();
}

function getActiveUserRole() {
  return getSessionUser()?.role || "user";
}

function isAdmin() {
  return getActiveUserRole() === "admin";
}

function findUserByEmail(email) {
  return state.users.find((user) => user.email.toLocaleLowerCase("tr-TR") === email);
}

function getUserName(userId) {
  return state.users.find((user) => user.id === userId)?.fullName || "Bilinmeyen kullanıcı";
}

function getInitials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") || "")
    .join("");
}

function buildDemoUserEmail(fullName) {
  const normalized = String(fullName || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9çğıöşü\s.-]/gi, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".");
  return `${normalized || "yeni.kullanici"}@example.com`;
}

function getProjectName(projectId) {
  return state.projects.find((project) => project.id === projectId)?.name || "Proje yok";
}

function getCategory(categoryId) {
  return state.categories.find((category) => category.id === categoryId);
}

function getTaskCategory(task) {
  const project = state.projects.find((item) => item.id === task.projectId);
  return getCategory(task.categoryId || project?.categoryId);
}

function getTaskAssignment(taskId) {
  return state.assignments.find((assignment) => assignment.taskId === taskId);
}

function getTaskGivers(taskId) {
  return state.taskGivers.filter((giver) => giver.taskId === taskId);
}

function getTaskTitle(taskId) {
  return state.tasks.find((task) => task.id === taskId)?.title || "Silinmiş görev";
}

function getTaskScore(task) {
  return priorityScores[task.priority] || 1;
}

function calculateUserStats(userId) {
  const assignments = state.assignments.filter((assignment) => assignment.userId === userId);
  const assignedTasks = assignments
    .map((assignment) => state.tasks.find((task) => task.id === assignment.taskId))
    .filter(Boolean);

  const totalScore = assignedTasks.reduce((sum, task) => sum + getTaskScore(task), 0);
  const completedScore = assignments.reduce((sum, assignment) => {
    const task = state.tasks.find((item) => item.id === assignment.taskId);
    return assignment.isCompleted && task ? sum + getTaskScore(task) : sum;
  }, 0);

  const rate = totalScore === 0 ? 0 : Math.round((completedScore / totalScore) * 100);

  return {
    assignedCount: assignments.length,
    completedCount: assignments.filter((assignment) => assignment.isCompleted).length,
    totalScore,
    completedScore,
    rate,
  };
}

function calculateWorkload(userId) {
  const assignedTaskIds = new Set(
    state.assignments.filter((assignment) => assignment.userId === userId).map((assignment) => assignment.taskId),
  );
  const tasks = state.tasks.filter((task) => assignedTaskIds.has(task.id));
  const activeTasks = tasks.filter((task) => task.status !== "tamamlandi");
  const overdueCount = activeTasks.filter(isTaskOverdue).length;
  const activeMinutes = activeTasks.reduce((sum, task) => sum + (Number(task.estimatedMinutes) || 0), 0);
  const stats = calculateUserStats(userId);
  const readinessScore = Math.max(
    0,
    Math.round((stats.assignedCount ? stats.rate : 50) - activeTasks.length * 12 - overdueCount * 20),
  );

  return { ...stats, activeCount: activeTasks.length, overdueCount, activeMinutes, readinessScore };
}

function setView(viewName) {
  if (!isAdmin() && viewName === "projects") viewName = "dashboard";
  const titles = {
    dashboard: isAdmin() ? "Yönetici paneli" : "Kullanıcı paneli",
    projects: "Projeler",
    tasks: "Görevler",
  };
  const subtitles = {
    dashboard: isAdmin() ? "Ekibin iş yükünü ve performansını yönetin." : "Size atanan işleri ve kişisel ilerlemenizi görün.",
    projects: "Projelerinizi ve kategorilerinizi tek yerden yönetin.",
    tasks: "Önceliklerinizi düzenleyin ve işi akışta tutun.",
  };

  elements.pageTitle.textContent = titles[viewName];
  elements.pageSubtitle.textContent = subtitles[viewName];

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("active-view");
  });

  document.querySelector(`#${viewName}View`).classList.add("active-view");

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
    if (item.dataset.view === viewName) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

function renderUsers() {
  const currentAssigneeFilter = elements.assigneeFilter.value || "all";

  elements.activeUser.innerHTML = state.users
    .map((user) => {
      const role = roleLabels[user.role] || roleLabels.user;
      return `<option value="${user.id}">${escapeHtml(user.fullName)} (${role})</option>`;
    })
    .join("");
  elements.activeUser.value = state.activeUserId;
  elements.activeUser.disabled = !isAdmin();
  elements.activeUserLabel.textContent = isAdmin() ? "Ekip görünümü" : "Oturum sahibi";

  const sessionUser = getSessionUser();
  elements.roleBadge.textContent = `${roleLabels[sessionUser?.role] || roleLabels.user} · ${sessionUser?.fullName || ""}`;
  elements.addUserBtn.classList.toggle("hidden", !isAdmin() || supabaseReady);
  elements.resetDemoBtn.classList.toggle("hidden", supabaseReady);
  elements.appShell.classList.toggle("admin-panel", isAdmin());
  elements.appShell.classList.toggle("user-panel", !isAdmin());
  document.querySelectorAll(".admin-only").forEach((item) => item.classList.toggle("role-hidden", !isAdmin()));
  elements.navRoleLabel.textContent = isAdmin() ? "YÖNETİCİ PANELİ" : "KULLANICI PANELİ";
  elements.dashboardNavText.textContent = isAdmin() ? "Ekip özeti" : "Benim özetim";
  elements.tasksNavText.textContent = isAdmin() ? "Görev yönetimi" : "Görevlerim";
  elements.newTaskBtn.classList.toggle("role-hidden", !isAdmin());
  elements.assigneeFilter.classList.toggle("role-hidden", !isAdmin());

  elements.taskAssignee.innerHTML = state.users
    .map((user) => `<option value="${user.id}">${escapeHtml(user.fullName)}</option>`)
    .join("");

  elements.taskGivers.innerHTML = state.users
    .map((user) => `<option value="${user.id}">${escapeHtml(user.fullName)}</option>`)
    .join("");
  renderTaskGiverChips();

  elements.assigneeFilter.innerHTML = `
    <option value="all">Tüm kullanıcılar</option>
    ${state.users.map((user) => `<option value="${user.id}">${escapeHtml(user.fullName)}</option>`).join("")}
  `;
  elements.assigneeFilter.value = state.users.some((user) => user.id === currentAssigneeFilter)
    ? currentAssigneeFilter
    : "all";

  [...elements.taskGivers.options].forEach((option) => {
    option.selected = option.value === state.activeUserId;
  });
}

function renderProjectOptions() {
  if (state.projects.length === 0) {
    elements.taskProject.innerHTML = `<option value="">Önce proje ekleyin</option>`;
    return;
  }

  elements.taskProject.innerHTML = state.projects
    .map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`)
    .join("");
}

function renderCategoryOptions() {
  const currentCategoryFilter = elements.categoryFilter.value || "all";

  if (state.categories.length === 0) {
    elements.taskCategory.innerHTML = `<option value="">Kategori yok</option>`;
    elements.categoryFilter.innerHTML = `<option value="all">Tüm kategoriler</option>`;
    elements.projectCategory.innerHTML = `<option value="">Önce kategori ekleyin</option>`;
    return;
  }

  const selectedProjectId = elements.taskProject.value;
  const selectedProject = state.projects.find((project) => project.id === selectedProjectId);
  const projectCategories = state.categories.filter((category) => category.id === selectedProject?.categoryId);
  elements.taskCategory.innerHTML = `<option value="">Kategorisiz</option>${projectCategories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join("")}`;

  elements.categoryFilter.innerHTML = `
    <option value="all">Tüm kategoriler</option>
    ${state.categories
      .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
      .join("")}
  `;
  elements.projectCategory.innerHTML = state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join("");
  elements.categoryFilter.value = state.categories.some((category) => category.id === currentCategoryFilter)
    ? currentCategoryFilter
    : "all";
  renderProjectFilterOptions();
}

function renderProjectFilterOptions() {
  const currentProject = elements.projectFilter.value || "all";
  const categoryId = elements.categoryFilter.value;
  const availableProjects = state.projects.filter(
    (project) => categoryId === "all" || project.categoryId === categoryId,
  );
  elements.projectFilter.innerHTML = `
    <option value="all">Tüm projeler</option>
    ${availableProjects.map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join("")}
  `;
  elements.projectFilter.value = availableProjects.some((project) => project.id === currentProject)
    ? currentProject
    : "all";
}

function renderProjects() {
  elements.projectCount.textContent = `${state.projects.length} proje`;

  if (state.projects.length === 0) {
    elements.projectList.innerHTML = `<div class="empty-state">Henüz proje eklenmedi.</div>`;
    return;
  }

  elements.projectList.innerHTML = state.projects
    .map((project) => {
      const projectTasks = state.tasks.filter((task) => task.projectId === project.id);
      const taskCount = projectTasks.length;
      const completedCount = projectTasks.filter((task) => task.status === "tamamlandi").length;
      const progressRate = taskCount === 0 ? 0 : Math.round((completedCount / taskCount) * 100);
      const category = getCategory(project.categoryId);

      return `
        <article class="project-card">
          <h4>${escapeHtml(project.name)}</h4>
          <p>${escapeHtml(project.description || "Açıklama girilmedi.")}</p>
          <div class="project-progress">
            <strong>
              <span>İlerleme</span>
              <span>${progressRate}%</span>
            </strong>
            <div class="score-bar" aria-label="${escapeHtml(project.name)} ilerleme oranı">
              <div class="score-fill" style="width: ${progressRate}%"></div>
            </div>
          </div>
          <div class="task-meta">
            <span class="badge">${escapeHtml(category?.name || "Kategorisiz")}</span>
            <span class="badge">${taskCount} görev</span>
            <span class="badge">${completedCount} tamamlandı</span>
            <span class="badge">${formatDate(project.createdAt)}</span>
          </div>
          <div class="card-actions">
            <button class="small-button" type="button" data-edit-project="${project.id}">Düzenle</button>
            <button class="danger-button" type="button" data-delete-project="${project.id}">Sil</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCategories() {
  const query = elements.categorySearchInput.value.trim().toLocaleLowerCase("tr-TR");
  const visibleCategories = state.categories.filter((category) => {
    const linkedProjectNames = state.projects
      .filter((project) => project.categoryId === category.id)
      .map((project) => project.name)
      .join(" ")
      .toLocaleLowerCase("tr-TR");
    return !query || category.name.toLocaleLowerCase("tr-TR").includes(query) || linkedProjectNames.includes(query);
  });
  elements.categoryCount.textContent = query
    ? `${visibleCategories.length} / ${state.categories.length} kategori`
    : `${state.categories.length} kategori`;

  if (state.categories.length === 0) {
    elements.categoryList.innerHTML = `<div class="empty-state">Henüz kategori eklenmedi.</div>`;
    return;
  }

  if (visibleCategories.length === 0) {
    elements.categoryList.innerHTML = `<div class="empty-state">Aramayla eşleşen kategori veya proje bulunamadı.</div>`;
    return;
  }

  elements.categoryList.innerHTML = visibleCategories
    .map((category) => {
      const categoryProjects = state.projects.filter((project) => project.categoryId === category.id);
      const projectIds = new Set(categoryProjects.map((project) => project.id));
      const taskCount = state.tasks.filter((task) => projectIds.has(task.projectId)).length;

      return `
        <article class="category-card">
          <div>
            <h4>${escapeHtml(category.name)}</h4>
            <p>${categoryProjects.length} proje · ${taskCount} görev</p>
            <p>${categoryProjects.length ? categoryProjects.map((project) => escapeHtml(project.name)).join(" · ") : "Henüz bağlı proje yok"}</p>
          </div>
          <div class="category-actions">
            <span class="color-dot" style="background: ${category.color}"></span>
            <button class="small-button" type="button" data-edit-category="${category.id}">Düzenle</button>
            <button class="danger-button" type="button" data-delete-category="${category.id}">Sil</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function getFilteredTasks() {
  const query = elements.searchInput.value.trim().toLocaleLowerCase("tr-TR");
  const status = elements.statusFilter.value;
  const priority = elements.priorityFilter.value;
  const category = elements.categoryFilter.value;
  const projectId = elements.projectFilter.value;
  const assignee = elements.assigneeFilter.value;
  const sort = elements.sortFilter.value;

  const filteredTasks = state.tasks.filter((task) => {
    const assignment = getTaskAssignment(task.id);
    const taskCategory = getTaskCategory(task);
    const isVisibleToRole = isAdmin() || assignment?.userId === getSessionUser()?.id;
    const matchesText =
      !query ||
      (task.title || "").toLocaleLowerCase("tr-TR").includes(query) ||
      (task.description || "").toLocaleLowerCase("tr-TR").includes(query) ||
      getProjectName(task.projectId).toLocaleLowerCase("tr-TR").includes(query) ||
      (taskCategory?.name || "").toLocaleLowerCase("tr-TR").includes(query) ||
      (assignment ? getUserName(assignment.userId) : "").toLocaleLowerCase("tr-TR").includes(query);
    const matchesStatus = status === "all" || task.status === status;
    const matchesPriority = priority === "all" || task.priority === priority;
    const matchesCategory = category === "all" || taskCategory?.id === category;
    const matchesProject = projectId === "all" || task.projectId === projectId;
    const matchesAssignee = assignee === "all" || assignment?.userId === assignee;

    return isVisibleToRole && matchesText && matchesStatus && matchesPriority && matchesCategory && matchesProject && matchesAssignee;
  });

  return filteredTasks.sort((a, b) => {
    if (sort === "due_asc") {
      return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
    }

    if (sort === "priority_desc") {
      return getTaskScore(b) - getTaskScore(a);
    }

    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

function renderTaskCard(task, options = {}) {
  const assignment = getTaskAssignment(task.id);
  const assigneeName = assignment ? getUserName(assignment.userId) : "Atanmamış";
  const giverNames = getTaskGivers(task.id)
    .map((giver) => getUserName(giver.userId))
    .join(", ");
  const category = getTaskCategory(task);
  const nextStatus = task.status === "tamamlandi" ? "devam_ediyor" : "tamamlandi";
  const actionText = task.status === "tamamlandi" ? "Tekrar aç" : "Tamamla";
  const dueDate = getDueDateMeta(task);
  const attachmentCount = getTaskAttachments(task).length;
  const compactClass = options.compact ? " task-card-compact" : "";
  const draggableAttribute = options.compact && isAdmin() ? ' draggable="true"' : "";
  const assigneeInitials = getInitials(assigneeName);

  return `
    <article class="task-card${compactClass}"${draggableAttribute} data-task-card data-task-id="${task.id}">
      <div class="task-card-header">
        <div class="task-card-title">
          <span class="task-status-dot status-dot-${task.status}"></span>
          <h4>${escapeHtml(task.title)}</h4>
        </div>
        <span class="priority-chip priority-${task.priority}">${priorityLabels[task.priority]}</span>
      </div>
      <p>${escapeHtml(task.description || "Açıklama girilmedi.")}</p>
      <div class="task-context">
        <span class="task-project">${escapeHtml(getProjectName(task.projectId))}</span>
        <span class="context-separator">/</span>
        <span>${escapeHtml(category ? category.name : "Kategori yok")}</span>
      </div>
      <div class="task-card-footer">
        <div class="task-assignee" title="Atanan: ${escapeHtml(assigneeName)}">
          <span class="avatar avatar-sm">${escapeHtml(assigneeInitials)}</span>
          <span>${escapeHtml(assigneeName)}</span>
        </div>
        <div class="task-signals">
          <span class="due-signal ${dueDate.className}">${escapeHtml(dueDate.label)}</span>
          <span class="score-signal">${getTaskScore(task)}p</span>
          ${attachmentCount ? `<span class="score-signal">📎 ${attachmentCount}</span>` : ""}
        </div>
      </div>
      <div class="card-actions">
        <button class="small-button action-detail" type="button" data-detail-task="${task.id}">Detayı aç</button>
        <button class="small-button action-status" type="button" data-status-task="${task.id}" data-next-status="${nextStatus}">${actionText}</button>
        ${isAdmin() ? `<button class="icon-button" type="button" data-edit-task="${task.id}" aria-label="${escapeHtml(task.title)} görevini düzenle">✎</button>` : ""}
        ${isAdmin() ? `<button class="icon-button danger-icon" type="button" data-delete-task="${task.id}" aria-label="${escapeHtml(task.title)} görevini sil">×</button>` : ""}
      </div>
    </article>
  `;
}

function renderTasks() {
  const tasks = getFilteredTasks();
  elements.taskCount.textContent = `${tasks.length} görev`;

  if (tasks.length === 0) {
    const hasFilters = elements.searchInput.value.trim() || [elements.statusFilter, elements.priorityFilter, elements.categoryFilter, elements.projectFilter, elements.assigneeFilter].some((control) => control.value !== "all");
    elements.taskList.innerHTML = hasFilters
      ? `<div class="empty-state"><strong>Aradığın görev bulunamadı.</strong><span>Filtreleri temizleyerek tüm görevleri yeniden görebilirsin.</span><button class="small-button" type="button" data-clear-task-filters>Filtreleri temizle</button></div>`
      : `<div class="empty-state"><strong>Henüz görev yok.</strong><span>İlk işini planlamak için yeni bir görev oluştur.</span>${isAdmin() ? `<button class="primary-button" type="button" data-create-first-task>+ Yeni görev</button>` : ""}</div>`;
    return;
  }

  elements.taskList.innerHTML = tasks
    .map((task) => renderTaskCard(task))
    .join("");
}

function renderKanbanBoard() {
  const tasks = getFilteredTasks();
  const columns = ["bekliyor", "devam_ediyor", "tamamlandi"];

  elements.kanbanBoard.innerHTML = columns
    .map((status) => {
      const columnTasks = tasks.filter((task) => task.status === status);

      return `
        <section class="kanban-column">
          <div class="kanban-column-header">
            <h4>${statusLabels[status]}</h4>
            <span>${columnTasks.length}</span>
          </div>
          <div class="kanban-column-body" data-kanban-status="${status}">
            ${
              columnTasks.length === 0
                ? `<div class="empty-state kanban-empty">Görev yok.</div>`
                : columnTasks.map((task) => renderTaskCard(task, { compact: true })).join("")
            }
          </div>
        </section>
      `;
    })
    .join("");
}

function renderTaskViews() {
  renderFilterScopeSummary();
  updateActiveFilterCount();
  renderTasks();
  renderKanbanBoard();
}

function setDashboardSection(section) {
  elements.dashboardSectionTabs.forEach((tab) => {
    const active = tab.dataset.dashboardTab === section;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  elements.dashboardSectionPanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.dashboardPanel !== section);
  });
}

function updateActiveFilterCount() {
  const count = [elements.statusFilter, elements.priorityFilter, elements.categoryFilter, elements.projectFilter, elements.assigneeFilter]
    .filter((control) => control.value !== "all").length + (elements.sortFilter.value !== "created_desc" ? 1 : 0);
  elements.activeFilterCount.textContent = count;
  elements.activeFilterCount.classList.toggle("hidden", count === 0);
}

function renderTaskGiverChips() {
  if (!elements.taskGiverChips) return;
  const selectedIds = new Set([...elements.taskGivers.selectedOptions].map((option) => option.value));
  elements.taskGiverChips.innerHTML = state.users.map((user) => `
    <button class="selection-chip ${selectedIds.has(user.id) ? "selected" : ""}" type="button" data-giver-id="${user.id}" aria-pressed="${selectedIds.has(user.id)}">
      <span>${escapeHtml(user.fullName)}</span><span aria-hidden="true">${selectedIds.has(user.id) ? "✓" : "+"}</span>
    </button>
  `).join("");
}

function setTaskDetailsExpanded(expanded) {
  elements.taskAdvancedFields.classList.toggle("hidden", !expanded);
  elements.taskDetailsToggle.setAttribute("aria-expanded", String(expanded));
  elements.taskDetailsToggle.firstChild.textContent = expanded ? "Detayları gizle " : "Detayları göster ";
}

function renderFilterScopeSummary() {
  const query = elements.searchInput.value.trim();
  const categoryId = elements.categoryFilter.value;
  const projectId = elements.projectFilter.value;
  const status = elements.statusFilter.value;
  const priority = elements.priorityFilter.value;
  const assigneeId = elements.assigneeFilter.value;
  const filters = [];

  if (query) filters.push(`Arama: ${query}`);
  if (categoryId !== "all") filters.push(`Kategori: ${getCategory(categoryId)?.name || "Kategori"}`);
  if (projectId !== "all") filters.push(`Proje: ${getProjectName(projectId)}`);
  if (status !== "all") filters.push(`Durum: ${statusLabels[status]}`);
  if (priority !== "all") filters.push(`Öncelik: ${priorityLabels[priority]}`);
  if (assigneeId !== "all") filters.push(`Atanan: ${getUserName(assigneeId)}`);

  if (filters.length === 0) {
    elements.filterScopeSummary.classList.add("hidden");
    elements.filterScopeSummary.innerHTML = "";
    return;
  }

  const resultCount = getFilteredTasks().length;
  const projects = categoryId === "all" ? [] : state.projects.filter((project) => project.categoryId === categoryId);
  elements.filterScopeSummary.classList.remove("hidden");
  elements.filterScopeSummary.innerHTML = `
    <div class="panel-header">
      <div><p class="eyebrow">Etkin filtreler birlikte uygulanıyor</p><h3>${resultCount} görev bulundu</h3></div>
      ${categoryId !== "all" ? `<span>${projects.length} bağlı proje</span>` : ""}
    </div>
    <div class="task-meta">
      ${filters.map((filter) => `<span class="badge">${escapeHtml(filter)}</span>`).join("")}
      ${projects.map((project) => `<span class="badge">${escapeHtml(project.name)}</span>`).join("")}
    </div>
  `;
}

function getTaskComments(taskId) {
  return state.taskComments
    .filter((comment) => comment.taskId === taskId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getTaskHistoryItems(taskId) {
  return state.history
    .filter((item) => item.taskId === taskId)
    .slice()
    .reverse();
}

function renderTaskDetail() {
  if (!activeDetailTaskId) return;

  const task = state.tasks.find((item) => item.id === activeDetailTaskId);
  if (!task) {
    closeTaskDetail();
    return;
  }

  const assignment = getTaskAssignment(task.id);
  const category = getCategory(task.categoryId);
  const giverNames = getTaskGivers(task.id)
    .map((giver) => getUserName(giver.userId))
    .join(", ");
  const dueDate = getDueDateMeta(task);
  const comments = getTaskComments(task.id);
  const historyItems = getTaskHistoryItems(task.id);
  const attachments = getTaskAttachments(task);
  const subtasks = getTaskSubtasks(task);
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;
  const attachmentsByGroup = attachments.reduce((groups, attachment) => {
    const group = getAttachmentGroupLabel(attachment);
    if (!groups[group]) groups[group] = [];
    groups[group].push(attachment);
    return groups;
  }, {});
  const attachmentGroups = Object.entries(attachmentsByGroup);

  elements.taskDetailTitle.textContent = task.title;
  elements.taskDetailBody.innerHTML = `
    <div class="task-detail-grid">
      <section class="detail-block">
        <div class="detail-action-row">
          <h3>Bilgiler</h3>
          <label>Durumu değiştir
            <select data-detail-status="${task.id}" aria-label="Görev durumunu değiştir">
              <option value="bekliyor" ${task.status === "bekliyor" ? "selected" : ""}>Bekliyor</option>
              <option value="devam_ediyor" ${task.status === "devam_ediyor" ? "selected" : ""}>Devam ediyor</option>
              <option value="tamamlandi" ${task.status === "tamamlandi" ? "selected" : ""}>Tamamlandı</option>
            </select>
          </label>
        </div>
        <div class="detail-meta">
          <span class="badge">${escapeHtml(getProjectName(task.projectId))}</span>
          <span class="badge">${escapeHtml(category ? category.name : "Kategori yok")}</span>
          <span class="badge status-${task.status}">${statusLabels[task.status]}</span>
          <span class="badge priority-${task.priority}">${priorityLabels[task.priority]} öncelik</span>
          <span class="badge ${dueDate.className}">${escapeHtml(dueDate.label)}</span>
          <span class="badge">${task.estimatedMinutes} dakika</span>
        </div>
        <p>${escapeHtml(task.description || "Açıklama girilmedi.")}</p>
        <dl class="detail-list">
          <div>
            <dt>Atanan</dt>
            <dd>${escapeHtml(assignment ? getUserName(assignment.userId) : "Atanmamış")}</dd>
          </div>
          <div>
            <dt>Veren</dt>
            <dd>${escapeHtml(giverNames || getUserName(task.createdBy))}</dd>
          </div>
          <div>
            <dt>Puan</dt>
            <dd>${getTaskScore(task)}</dd>
          </div>
        </dl>
      </section>

      <section class="detail-block">
        <div class="panel-header detail-section-header">
          <h3>Alt görevler</h3>
          <span>${completedSubtasks}/${subtasks.length}</span>
        </div>
        <div class="checklist-list">
          ${
            subtasks.length === 0
              ? `<div class="empty-state">Bu görev için alt görev eklenmedi.</div>`
              : subtasks
                  .map(
                    (subtask) => `
                      <label class="checklist-item ${subtask.completed ? "completed" : ""}">
                        <input type="checkbox" data-toggle-subtask="${subtask.id}" data-task-id="${task.id}" ${subtask.completed ? "checked" : ""} />
                        <span>${escapeHtml(subtask.title)}</span>
                      </label>
                    `,
                  )
                  .join("")
          }
        </div>
      </section>

      <section class="detail-block">
        <h3>Yorumlar</h3>
        <div class="comment-list">
          ${
            comments.length === 0
              ? `<div class="empty-state">Henüz yorum yok.</div>`
              : comments
                  .map(
                    (comment) => `
                      <article class="comment-item">
                        <strong>${escapeHtml(getUserName(comment.userId))}</strong>
                        <p>${escapeHtml(comment.body)}</p>
                        <span>${formatDate(comment.createdAt)}</span>
                      </article>
                    `,
                  )
                  .join("")
          }
        </div>
      </section>
    </div>

    <section class="detail-block">
      <div class="panel-header detail-section-header">
        <h3>Dosyalar</h3>
        <span>${attachments.length} ek</span>
      </div>
      <div class="attachment-groups">
        ${
          attachments.length === 0
            ? `<div class="empty-state">Bu görev için henüz dosya eklenmedi.</div>`
            : attachmentGroups
                .map(
                  ([groupName, groupAttachments]) => `
                    <section class="attachment-group">
                      <div class="attachment-group-header">
                        <h4>${escapeHtml(groupName)}</h4>
                        <span>${groupAttachments.length}</span>
                      </div>
                      <div class="attachment-list">
                        ${groupAttachments
                          .map(
                            (attachment) => `
                              <article class="attachment-item" data-preview-attachment="${attachment.id}" data-task-id="${task.id}" role="button" tabindex="0" aria-label="${escapeHtml(attachment.name)} dosyasını aç">
                                ${
                                  attachment.type?.startsWith("image/")
                                    ? `<img class="attachment-item-thumb" src="${attachment.dataUrl}" alt="${escapeHtml(attachment.name)}" />`
                                    : `<div class="attachment-item-icon">${escapeHtml(getAttachmentGroupIcon(attachment))}</div>`
                                }
                                <div class="attachment-item-body">
                                  <strong>${escapeHtml(attachment.name)}</strong>
                                  <p>${escapeHtml(attachment.type || "Dosya")} · ${formatFileSize(attachment.size)} · ${formatDate(attachment.uploadedAt)}</p>
                                </div>
                                <div class="attachment-item-actions">
                                  <a class="small-button" href="${attachment.dataUrl}" download="${escapeHtml(attachment.name)}">İndir</a>
                                  ${
                                    canManageTaskAttachments(task)
                                      ? `<button class="danger-button" type="button" data-remove-attachment="${attachment.id}" data-task-id="${task.id}">Sil</button>`
                                      : ""
                                  }
                                </div>
                              </article>
                            `,
                          )
                          .join("")}
                      </div>
                    </section>
                  `,
                )
                .join("")
        }
      </div>
    </section>

    <section class="detail-block">
      <h3>Geçmiş</h3>
      <div class="history-list">
        ${
          historyItems.length === 0
            ? `<div class="empty-state">Henüz hareket yok.</div>`
            : historyItems
                .map((item) => {
                  const statusText = item.oldStatus
                    ? `${statusLabels[item.oldStatus]} → ${statusLabels[item.newStatus]}`
                    : statusLabels[item.newStatus];

                  return `
                    <article class="history-item">
                      <div>
                        <strong>${escapeHtml(item.note)}</strong>
                        <p>${escapeHtml(getUserName(item.changedBy))}</p>
                      </div>
                      <div class="history-meta">
                        <span class="badge">${statusText}</span>
                        <span>${formatDate(item.changedAt)}</span>
                      </div>
                    </article>
                  `;
                })
                .join("")
        }
      </div>
    </section>
  `;
}

function openTaskDetail(taskId) {
  activeDetailTaskId = taskId;
  elements.taskDetailModal.classList.remove("hidden");
  renderTaskDetail();
  elements.taskCommentText.value = "";
  elements.taskCommentText.focus();
}

function closeTaskDetail() {
  activeDetailTaskId = null;
  elements.taskDetailModal.classList.add("hidden");
  elements.taskCommentText.value = "";
}

function renderDashboard() {
  const dashboardUserId = isAdmin() ? state.activeUserId : getSessionUser()?.id;
  const visibleTasks = isAdmin()
    ? state.tasks
    : state.tasks.filter((task) => getTaskAssignment(task.id)?.userId === dashboardUserId);
  const totalTasks = visibleTasks.length;
  const completedTasks = visibleTasks.filter((task) => task.status === "tamamlandi").length;
  const inProgressTasks = visibleTasks.filter((task) => task.status === "devam_ediyor").length;
  const overdueTasks = visibleTasks.filter(isTaskOverdue).length;
  const activeStats = calculateUserStats(dashboardUserId);

  elements.totalTasks.textContent = totalTasks;
  elements.completedTasks.textContent = completedTasks;
  elements.inProgressTasks.textContent = inProgressTasks;
  elements.overdueTasks.textContent = overdueTasks;
  elements.successRate.textContent = `${activeStats.rate}%`;

  const focus = getDashboardFocusBuckets(visibleTasks);
  elements.focusTaskCount.textContent = `${focus.items.length} görev`;
  elements.focusDueToday.textContent = focus.dueToday;
  elements.focusOverdue.textContent = focus.overdue;
  elements.focusThisWeek.textContent = focus.thisWeek;
  elements.focusNew.textContent = focus.newAssigned;
  elements.focusHigh.textContent = focus.highPriority;
  elements.focusTaskList.innerHTML =
    focus.items.length === 0
      ? `<div class="empty-state">Bugün için öne çıkan bir görev yok.</div>`
      : focus.items
          .slice(0, 6)
          .map(({ task, tags }) => {
            const assignee = getTaskAssignment(task.id);
            const assigneeName = assignee ? getUserName(assignee.userId) : "Atanmamış";
            return `
              <article class="focus-card">
                <div class="focus-card-top">
                  <h4>${escapeHtml(task.title)}</h4>
                  <span class="badge priority-${task.priority}">${priorityLabels[task.priority]}</span>
                </div>
                <p>${escapeHtml(getProjectName(task.projectId))} · ${escapeHtml(getTaskCategory(task)?.name || "Kategori yok")}</p>
                <div class="task-meta">
                  ${tags.map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
                  <span class="badge">${escapeHtml(assigneeName)}</span>
                </div>
              </article>
            `;
          })
          .join("");

  elements.userScores.innerHTML = state.users
    .map((user) => {
      const stats = calculateUserStats(user.id);
      const canManageRole = isAdmin() && user.id !== getSessionUser()?.id;
      return `
        <article class="score-card">
          <strong>
            <span>${escapeHtml(user.fullName)} <small class="role-inline">${roleLabels[user.role] || roleLabels.user}</small></span>
            <span>${stats.rate}%</span>
          </strong>
          <div class="score-bar" aria-label="${user.fullName} başarı oranı">
            <div class="score-fill" style="width: ${stats.rate}%"></div>
          </div>
          <p>${stats.completedScore}/${stats.totalScore} puan - ${stats.completedCount}/${stats.assignedCount} görev</p>
          ${canManageRole ? `<button class="small-button role-action" type="button" data-toggle-role="${user.id}">${user.role === "admin" ? "Kullanıcı rolüne al" : "Yönetici yap"}</button>` : ""}
        </article>
      `;
    })
    .join("");

  if (isAdmin()) {
    const workloadRows = state.users
      .filter((user) => user.role !== "admin" || state.users.every((item) => item.role === "admin"))
      .map((user) => ({ user, workload: calculateWorkload(user.id) }))
      .sort((a, b) => b.workload.readinessScore - a.workload.readinessScore);
    const recommended = workloadRows[0];

    elements.assignmentRecommendation.textContent = recommended
      ? `Önerilen: ${recommended.user.fullName}`
      : "Uygun kullanıcı yok";
    elements.workloadInsights.innerHTML = workloadRows.length
      ? workloadRows
          .map(({ user, workload }, index) => `
            <article class="workload-card ${index === 0 ? "recommended" : ""}">
              <div class="workload-person">
                <span class="avatar">${escapeHtml(getInitials(user.fullName))}</span>
                <div><strong>${escapeHtml(user.fullName)}</strong><small>${index === 0 ? "Görev için önerilen kişi" : roleLabels[user.role] || roleLabels.user}</small></div>
              </div>
              <div class="workload-metrics">
                <span><strong>${workload.activeCount}</strong> aktif</span>
                <span class="${workload.overdueCount ? "metric-danger" : ""}"><strong>${workload.overdueCount}</strong> geciken</span>
                <span><strong>${workload.activeMinutes}</strong> dk yük</span>
                <span><strong>${workload.rate}%</strong> başarı</span>
              </div>
              <div class="readiness-bar" aria-label="${escapeHtml(user.fullName)} görev uygunluk puanı">
                <span style="width:${workload.readinessScore}%"></span>
              </div>
              <small class="readiness-label">Uygunluk puanı ${workload.readinessScore}/100</small>
            </article>
          `)
          .join("")
      : `<div class="empty-state">Analiz edilecek ekip üyesi bulunmuyor.</div>`;
  }

  const notifications = getDashboardNotifications(visibleTasks);
  elements.notificationCount.textContent = `${notifications.length} bildirim`;
  elements.notificationList.innerHTML =
    notifications.length === 0
      ? `<div class="empty-state">Şu anda yeni bildirim yok.</div>`
      : notifications
          .map(
            (notification) => `
              <article class="notification-item notification-${notification.type}">
                <div class="notification-main">
                  <strong>${escapeHtml(notification.title)}</strong>
                  <p>${escapeHtml(notification.message)}</p>
                </div>
                <div class="notification-meta">
                  <span class="badge">${escapeHtml(notification.badge)}</span>
                  <span>${formatDate(notification.date)}</span>
                </div>
              </article>
            `,
          )
          .join("");

  const upcomingTasks = [...visibleTasks]
    .filter((task) => task.dueDate && task.status !== "tamamlandi")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  elements.upcomingTasks.innerHTML =
    upcomingTasks.length === 0
      ? `<div class="empty-state">Yaklaşan teslim bulunmuyor.</div>`
      : upcomingTasks
          .map(
            (task) => `
              <article class="mini-card">
                <h4>${escapeHtml(task.title)}</h4>
                <p>${escapeHtml(getProjectName(task.projectId))} - ${formatDate(task.dueDate)}</p>
              </article>
            `,
          )
          .join("");

  const visibleTaskIds = new Set(visibleTasks.map((task) => task.id));
  const historyItems = state.history.filter((item) => visibleTaskIds.has(item.taskId)).reverse().slice(0, 6);

  elements.historyList.innerHTML =
    historyItems.length === 0
      ? `<div class="empty-state">Henüz görev hareketi yok.</div>`
      : historyItems
          .map((item) => {
            const statusText = item.oldStatus
              ? `${statusLabels[item.oldStatus]} → ${statusLabels[item.newStatus]}`
              : statusLabels[item.newStatus];

            return `
              <article class="history-item">
                <div>
                  <strong>${escapeHtml(getTaskTitle(item.taskId))}</strong>
                  <p>${escapeHtml(item.note)}</p>
                </div>
                <div class="history-meta">
                  <span class="badge">${statusText}</span>
                  <span>${escapeHtml(getUserName(item.changedBy))}</span>
                  <span>${formatDate(item.changedAt)}</span>
                </div>
              </article>
            `;
          })
          .join("");
}

function renderDemoExamples() {
  if (!elements.demoExamplesList) return;

  const dueSoonTasks = [...state.tasks]
    .filter((task) => task.dueDate && task.status !== "tamamlandi")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 2);
  const overdueTasks = state.tasks.filter(isTaskOverdue).slice(0, 2);
  const priorityExample = state.tasks.find((task) => task.priority === "yuksek" && task.status === "devam_ediyor");
  const examples = [
    {
      title: "Takvim görünümü",
      eyebrow: "Tarihe göre akış",
      text: "Teslim tarihlerini gün bazında göster ve yaklaşan işleri öne çıkar.",
      items: dueSoonTasks.length
        ? dueSoonTasks.map((task) => `${task.title} · ${formatDate(task.dueDate)}`)
        : ["Bugün teslim", "Bu hafta teslim", "Geciken görev"],
    },
    {
      title: "Bildirim merkezi",
      eyebrow: "Anlık uyarılar",
      text: "Geciken görev, yeni yorum ve durum değişikliği tek yerde toplansın.",
      items: overdueTasks.length
        ? overdueTasks.map((task) => `Gecikti: ${task.title}`)
        : ["Yeni yorum geldi", "Durum değişti", "Görev atandı"],
    },
    {
      title: "Kaydedilmiş filtre",
      eyebrow: "Tek tıkla aç",
      text: "Öncelik Yüksek + Durum Devam Ediyor + Kategori Güvenlik filtresini sakla.",
      items: ["Öncelik: Yüksek", "Durum: Devam Ediyor", "Kategori: Güvenlik"],
    },
    {
      title: "Alt görevler",
      eyebrow: "Parçalayarak ilerle",
      text: "Büyük işi analiz, kontrol ve yayın gibi küçük adımlara böl.",
      items: priorityExample
        ? [`Ana görev: ${priorityExample.title}`, "Alt adım: veri kontrolü", "Alt adım: sonuç onayı"]
        : ["Analiz", "Kontrol", "Yayın"],
    },
    {
      title: "Dosya ekleri",
      eyebrow: "Göreve bağlı belgeler",
      text: "PDF, görsel, tablo veya teknik notları doğrudan görevle ilişkilendir.",
      items: ["toplanti-notu.pdf", "ekran-goruntusu.png", "kontrol-listesi.xlsx"],
    },
  ];

  elements.demoExamplesList.innerHTML = examples
    .map(
      (example) => `
        <article class="demo-example-card">
          <div class="demo-example-top">
            <div>
              <p class="demo-example-eyebrow">${escapeHtml(example.eyebrow)}</p>
              <h4>${escapeHtml(example.title)}</h4>
            </div>
            <span class="badge">Örnek</span>
          </div>
          <p>${escapeHtml(example.text)}</p>
          <ul class="demo-example-list">
            ${example.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function renderAll() {
  renderUsers();
  renderProjectOptions();
  renderCategoryOptions();
  renderProjects();
  renderCategories();
  renderTaskViews();
  renderDashboard();
  renderDemoExamples();
  renderTaskDetail();
  const currentView = [...elements.navItems].find((item) => item.classList.contains("active"))?.dataset.view;
  setView(currentView || "dashboard");
}

function showAuthMessage(message, type = "error") {
  elements.authMessage.textContent = message;
  elements.authMessage.classList.toggle("success", type === "success");
}

function setAuthMode(mode) {
  const isLogin = mode === "login";

  elements.loginForm.classList.toggle("hidden", !isLogin);
  elements.registerForm.classList.toggle("hidden", isLogin);
  elements.showLoginBtn.classList.toggle("active", isLogin);
  elements.showRegisterBtn.classList.toggle("active", !isLogin);
  showAuthMessage("");
}

async function showApp() {
  elements.authScreen.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
  if (supabaseReady && currentSession?.userId) {
    setConnectionStatus("syncing", "Supabase · Yükleniyor…");
    const loaded = await loadSupabaseData(currentSession.userId);
    if (loaded) {
      setConnectionStatus("online", "Supabase · Bağlı");
      startRealtimeUpdates(currentSession.userId);
    }
  } else {
    setConnectionStatus("", "Demo mod · Yerel kayıt");
  }
  renderAll();
}

function showAuth() {
  elements.appShell.classList.add("hidden");
  elements.authScreen.classList.remove("hidden");
  setAuthMode("login");
}

function ensureUserExists(account) {
  const email = account.email.toLocaleLowerCase("tr-TR");
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    if (!existingUser.role) {
      existingUser.role = account.role || "user";
      saveState();
    }
    return existingUser.id;
  }

  state.users.push({
    id: account.id,
    fullName: account.fullName,
    email,
    role: account.role || "user",
  });

  saveState();
  return account.id;
}

async function upsertSupabaseUserProfile(account) {
  const client = getSupabaseClient();
  if (!client || !isUuid(account.id)) return;

  const { error } = await client.from("users").upsert({
    id: account.id,
    full_name: account.fullName,
    email: account.email.toLocaleLowerCase("tr-TR"),
    role: account.role || "user",
  });

  if (error) {
    console.error("Supabase kullanıcı profili kaydedilemedi:", error);
  }
}

async function login(email, password, requestedRole) {
  const normalizedEmail = email.trim().toLocaleLowerCase("tr-TR");

  if (supabaseReady) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      showAuthMessage("Supabase giriş hatası. E-posta veya şifre kontrol edilmelidir.");
      return;
    }

    const { data: profile } = await client.from("users").select("role").eq("id", data.user.id).maybeSingle();
    const actualRole = profile?.role || data.user.user_metadata?.role || "user";
    if (actualRole !== requestedRole) {
      await client.auth.signOut();
      showAuthMessage(`Bu hesap ${roleLabels[actualRole].toLocaleLowerCase("tr-TR")} hesabıdır. Doğru giriş türünü seçin.`);
      return;
    }

    const account = {
      id: data.user.id,
      fullName: data.user.user_metadata?.full_name || normalizedEmail,
      email: normalizedEmail,
      password: "",
      role: actualRole,
    };

    ensureUserExists(account);
    state.activeUserId = data.user.id;
    saveSession(data.user.id);
    await upsertSupabaseUserProfile(account);
    saveState();
    await showApp();
    return;
  }

  const account = authAccounts.find((item) => item.email === normalizedEmail);

  if (!account || account.password !== password) {
    showAuthMessage("E-posta veya şifre hatalı.");
    return;
  }

  if ((account.role || "user") !== requestedRole) {
    showAuthMessage(`Bu hesap ${roleLabels[account.role || "user"].toLocaleLowerCase("tr-TR")} hesabıdır. Doğru giriş türünü seçin.`);
    return;
  }

  const userId = ensureUserExists(account);
  state.activeUserId = userId;
  saveState();
  saveSession(userId);
  await showApp();
}

async function register(fullName, email, password) {
  const normalizedName = fullName.trim();
  const normalizedEmail = email.trim().toLocaleLowerCase("tr-TR");

  if (password.length < 6) {
    showAuthMessage("Şifre en az 6 karakter olmalıdır.");
    return;
  }

  if (supabaseReady) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: normalizedName,
          role: "user",
        },
      },
    });

    if (error || !data.user) {
      showAuthMessage("Supabase kayıt hatası. Bilgiler kontrol edilmelidir.");
      return;
    }

    const account = {
      id: data.user.id,
      fullName: normalizedName,
      email: normalizedEmail,
      password: "",
      role: "user",
    };

    ensureUserExists(account);
    state.activeUserId = data.user.id;
    await upsertSupabaseUserProfile(account);

    if (data.session) {
      saveSession(data.user.id);
      saveState();
      await showApp();
    } else {
      saveState();
      showAuthMessage("Kayıt oluşturuldu. Supabase e-posta doğrulaması istiyor olabilir.", "success");
      setAuthMode("login");
    }
    return;
  }

  const accountExists = authAccounts.some((account) => account.email === normalizedEmail);
  if (accountExists) {
    showAuthMessage("Bu e-posta ile kayıtlı kullanıcı var.");
    return;
  }

  const account = {
    id: createId("user"),
    fullName: normalizedName,
    email: normalizedEmail,
    password,
    role: "user",
  };

  authAccounts.push(account);
  saveAuthAccounts();

  state.users.push({
    id: account.id,
    fullName: account.fullName,
    email: account.email,
  });
  state.activeUserId = account.id;
  saveState();
  saveSession(account.id);
  await showApp();
}

async function initializeAuth() {
  supabaseReady = isSupabaseConfigured();
  saveAuthAccounts();

  if (supabaseReady) {
    const client = getSupabaseClient();
    const { data } = await client.auth.getSession();

    if (data.session?.user) {
      currentSession = {
        userId: data.session.user.id,
        loggedInAt: new Date().toISOString(),
      };
      state.activeUserId = data.session.user.id;
      await showApp();
      return;
    }

    clearSession();
    showAuth();
    return;
  }

  if (currentSession?.userId && state.users.some((user) => user.id === currentSession.userId)) {
    state.activeUserId = currentSession.userId;
    await showApp();
    return;
  }

  showAuth();
}

function setTaskLayout(layout) {
  elements.taskFilters.classList.toggle("board-filter-mode", layout === "board");
  elements.taskLayoutButtons.forEach((button) => {
    const isActive = button.dataset.taskLayout === layout;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  elements.taskLayoutPanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.taskLayoutPanel !== layout);
  });
}

function openSidebar() {
  elements.sidebar.classList.add("open");
  elements.sidebarBackdrop.classList.remove("hidden");
  elements.menuToggleBtn.setAttribute("aria-expanded", "true");
  elements.menuToggleBtn.setAttribute("aria-label", "Menüyü kapat");
  document.body.classList.add("sidebar-open");
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
  elements.sidebarBackdrop.classList.add("hidden");
  elements.menuToggleBtn.setAttribute("aria-expanded", "false");
  elements.menuToggleBtn.setAttribute("aria-label", "Menüyü aç");
  document.body.classList.remove("sidebar-open");
}

function openTaskDrawer() {
  closeSidebar();
  elements.taskForm.classList.add("open");
  elements.taskForm.setAttribute("aria-hidden", "false");
  elements.taskDrawerBackdrop.classList.remove("hidden");
  document.body.classList.add("drawer-open");
  requestAnimationFrame(() => elements.taskTitle.focus());
}

function closeTaskDrawer() {
  elements.taskForm.classList.remove("open");
  elements.taskForm.setAttribute("aria-hidden", "true");
  elements.taskDrawerBackdrop.classList.add("hidden");
  document.body.classList.remove("drawer-open");
}

function resetTaskForm() {
  editingTaskId = null;
  elements.taskForm.reset();
  elements.taskFormTitle.textContent = "Görev oluştur";
  elements.taskSubmitBtn.textContent = "Görevi kaydet";
  elements.cancelTaskEditBtn.classList.add("hidden");
  elements.taskPriority.value = "orta";
  elements.taskStatus.value = "bekliyor";
  elements.taskMinutes.value = "60";
  elements.taskSubtasks.value = "";
  elements.taskFiles.value = "";
  clearTaskDraftAttachments();
  [...elements.taskGivers.options].forEach((option) => {
    option.selected = option.value === getSessionUser().id;
  });
  renderTaskGiverChips();
  setTaskDetailsExpanded(false);
  closeTaskDrawer();
}

function resetProjectForm() {
  editingProjectId = null;
  elements.projectForm.reset();
  elements.projectCategory.value = state.categories[0]?.id || "";
  elements.projectFormTitle.textContent = "Proje oluştur";
  elements.projectSubmitBtn.textContent = "Projeyi kaydet";
  elements.cancelProjectEditBtn.classList.add("hidden");
}

function resetCategoryForm() {
  editingCategoryId = null;
  elements.categoryForm.reset();
  elements.categoryColor.value = "#2563eb";
  elements.categoryFormTitle.textContent = "Kategori oluştur";
  elements.categorySubmitBtn.textContent = "Kategoriyi kaydet";
  elements.cancelCategoryEditBtn.classList.add("hidden");
}

function addProject(event) {
  event.preventDefault();
  if (!isAdmin()) return showToast("Proje yönetimi yalnızca yöneticilere açıktır.", "error");

  if (editingProjectId) {
    updateProjectFromForm(editingProjectId);
    return;
  }

  const activeUser = getSessionUser();

  state.projects.push({
    id: createId("project"),
    userId: activeUser.id,
    categoryId: elements.projectCategory.value,
    name: elements.projectName.value.trim(),
    description: elements.projectDescription.value.trim(),
    createdAt: today(),
    updatedAt: today(),
  });

  resetProjectForm();
  saveState();
  renderAll();
  showToast("Proje oluşturuldu.");
}

function updateProjectFromForm(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  project.name = elements.projectName.value.trim();
  project.categoryId = elements.projectCategory.value;
  project.description = elements.projectDescription.value.trim();
  project.updatedAt = today();

  resetProjectForm();
  saveState();
  renderAll();
}

function editProject(projectId) {
  if (!isAdmin()) return showToast("Bu işlem için yönetici yetkisi gerekir.", "error");
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  editingProjectId = projectId;
  setView("projects");
  elements.projectFormTitle.textContent = "Proje düzenle";
  elements.projectSubmitBtn.textContent = "Değişiklikleri kaydet";
  elements.cancelProjectEditBtn.classList.remove("hidden");
  elements.projectName.value = project.name;
  elements.projectDescription.value = project.description || "";
  elements.projectCategory.value = project.categoryId || state.categories[0]?.id || "";
  elements.projectName.focus();
}

function addCategory(event) {
  event.preventDefault();
  if (!isAdmin()) return showToast("Kategori yönetimi yalnızca yöneticilere açıktır.", "error");

  if (editingCategoryId) {
    updateCategoryFromForm(editingCategoryId);
    return;
  }

  state.categories.push({
    id: createId("category"),
    userId: getSessionUser().id,
    name: elements.categoryName.value.trim(),
    color: elements.categoryColor.value || "#2563eb",
    createdAt: today(),
  });

  resetCategoryForm();
  saveState();
  renderAll();
  showToast("Kategori oluşturuldu.");
}

function updateCategoryFromForm(categoryId) {
  const category = state.categories.find((item) => item.id === categoryId);
  if (!category) return;

  category.name = elements.categoryName.value.trim();
  category.color = elements.categoryColor.value || "#2563eb";

  resetCategoryForm();
  saveState();
  renderAll();
}

function editCategory(categoryId) {
  if (!isAdmin()) return showToast("Bu işlem için yönetici yetkisi gerekir.", "error");
  const category = state.categories.find((item) => item.id === categoryId);
  if (!category) return;

  editingCategoryId = categoryId;
  setView("projects");
  elements.categoryFormTitle.textContent = "Kategori düzenle";
  elements.categorySubmitBtn.textContent = "Değişiklikleri kaydet";
  elements.cancelCategoryEditBtn.classList.remove("hidden");
  elements.categoryName.value = category.name;
  elements.categoryColor.value = category.color || "#2563eb";
  elements.categoryName.focus();
}

async function addTask(event) {
  event.preventDefault();
  if (!isAdmin()) return showToast("Görev oluşturma yalnızca yöneticilere açıktır.", "error");

  if (!elements.taskProject.value) {
    alert("Görev eklemek için önce proje oluşturun.");
    return;
  }

  const taskId = createId("task");
  const priority = elements.taskPriority.value;
  const status = elements.taskStatus.value;
  const assigneeId = elements.taskAssignee.value;
  const giverIds = [...elements.taskGivers.selectedOptions].map((option) => option.value);
  const selectedGiverIds = giverIds.length > 0 ? giverIds : [getSessionUser().id];
  const selectedCategory = state.categories.find((category) => category.id === elements.taskCategory.value);
  const selectedProject = state.projects.find((project) => project.id === elements.taskProject.value);
  const subtasks = parseTaskSubtasks(elements.taskSubtasks.value);
  if (selectedCategory?.id !== selectedProject?.categoryId) {
    showToast("Görev, projenin üst kategorisini kullanmalıdır.", "error");
    return;
  }

  if (editingTaskId) {
    await updateTaskFromForm(editingTaskId, {
      projectId: elements.taskProject.value,
      categoryId: elements.taskCategory.value || "",
      title: elements.taskTitle.value.trim(),
      description: elements.taskDescription.value.trim(),
      priority,
      status,
      estimatedMinutes: Number(elements.taskMinutes.value) || 60,
      dueDate: elements.taskDueDate.value,
      assigneeId,
      giverIds: selectedGiverIds,
      attachments: [...taskDraftAttachments],
      subtasks,
    });
    return;
  }

  const task = {
    id: taskId,
    projectId: elements.taskProject.value,
    categoryId: elements.taskCategory.value || "",
    createdBy: getSessionUser().id,
    title: elements.taskTitle.value.trim(),
    description: elements.taskDescription.value.trim(),
    priority,
    status,
    estimatedMinutes: Number(elements.taskMinutes.value) || 60,
    dueDate: elements.taskDueDate.value,
    attachments: [...taskDraftAttachments],
    subtasks,
    createdAt: today(),
    updatedAt: today(),
  };

  state.tasks.push(task);
  state.assignments.push({
    id: createId("assignment"),
    taskId,
    userId: assigneeId,
    isCompleted: status === "tamamlandi",
    completedAt: status === "tamamlandi" ? today() : "",
    earnedScore: status === "tamamlandi" ? priorityScores[priority] : 0,
    assignedAt: today(),
  });

  selectedGiverIds.forEach((userId) => {
    state.taskGivers.push({
      id: createId("giver"),
      taskId,
      userId,
      assignedAt: today(),
    });
  });

  state.history.push({
    id: createId("history"),
    taskId,
    changedBy: getSessionUser().id,
    oldStatus: "",
    newStatus: status,
    note: "Görev oluşturuldu.",
    changedAt: today(),
  });

  resetTaskForm();
  saveState();
  renderAll();
  showToast("Görev oluşturuldu.");
}

async function updateTaskFromForm(taskId, formData) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const oldStatus = task.status;

  task.projectId = formData.projectId;
  task.categoryId = formData.categoryId;
  task.title = formData.title;
  task.description = formData.description;
  task.priority = formData.priority;
  task.status = formData.status;
  task.estimatedMinutes = formData.estimatedMinutes;
  task.dueDate = formData.dueDate;
  task.attachments = [...getTaskAttachments(task), ...(formData.attachments || [])];
  task.subtasks = formData.subtasks || [];
  task.updatedAt = today();

  let assignment = getTaskAssignment(taskId);
  if (!assignment) {
    assignment = {
      id: createId("assignment"),
      taskId,
      userId: formData.assigneeId,
      isCompleted: false,
      completedAt: "",
      earnedScore: 0,
      assignedAt: today(),
    };
    state.assignments.push(assignment);
  }

  assignment.userId = formData.assigneeId;
  assignment.isCompleted = formData.status === "tamamlandi";
  assignment.completedAt = formData.status === "tamamlandi" ? today() : "";
  assignment.earnedScore = formData.status === "tamamlandi" ? getTaskScore(task) : 0;

  const existingGivers = state.taskGivers.filter((giver) => giver.taskId === taskId);
  const removedGiverIds = existingGivers
    .filter((giver) => giver.taskId === taskId && !formData.giverIds.includes(giver.userId))
    .map((giver) => giver.id);
  await Promise.all(removedGiverIds.map((giverId) => deleteSupabaseRow("task_givers", giverId)));
  state.taskGivers = state.taskGivers.filter((giver) => giver.taskId !== taskId);
  formData.giverIds.forEach((userId) => {
    const existingGiver = existingGivers.find((giver) => giver.userId === userId);
    state.taskGivers.push({
      id: existingGiver?.id || createId("giver"),
      taskId,
      userId,
      assignedAt: today(),
    });
  });

  state.history.push({
    id: createId("history"),
    taskId,
    changedBy: getSessionUser().id,
    oldStatus,
    newStatus: formData.status,
    note: "Görev bilgileri güncellendi.",
    changedAt: today(),
  });

  resetTaskForm();
  saveState();
  renderAll();
  showToast("Görev durumu güncellendi.");
}

function editTask(taskId) {
  if (!isAdmin()) return showToast("Görev düzenleme yalnızca yöneticilere açıktır.", "error");
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  const assignment = getTaskAssignment(taskId);
  const giverIds = getTaskGivers(taskId).map((giver) => giver.userId);

  setView("tasks");
  elements.taskFormTitle.textContent = "Görev düzenle";
  elements.taskSubmitBtn.textContent = "Değişiklikleri kaydet";
  elements.cancelTaskEditBtn.classList.remove("hidden");
  elements.taskTitle.value = task.title;
  elements.taskDescription.value = task.description;
  elements.taskProject.value = task.projectId;
  renderCategoryOptions();
  elements.taskCategory.value = task.categoryId || "";
  elements.taskAssignee.value = assignment?.userId || getSessionUser().id;
  elements.taskPriority.value = task.priority;
  elements.taskStatus.value = task.status;
  elements.taskMinutes.value = task.estimatedMinutes;
  elements.taskDueDate.value = task.dueDate || "";
  elements.taskSubtasks.value = getTaskSubtasks(task)
    .map((subtask) => subtask.title)
    .join("\n");
  elements.taskFiles.value = "";
  clearTaskDraftAttachments();
  [...elements.taskGivers.options].forEach((option) => {
    option.selected = giverIds.length > 0 ? giverIds.includes(option.value) : option.value === task.createdBy;
  });
  renderTaskGiverChips();
  setTaskDetailsExpanded(true);
  openTaskDrawer();
}

function updateTaskStatus(taskId, nextStatus) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const assignment = getTaskAssignment(taskId);
  if (!isAdmin() && assignment?.userId !== getSessionUser()?.id) {
    return showToast("Yalnızca size atanan görevleri güncelleyebilirsiniz.", "error");
  }
  if (task.status === nextStatus) return;

  const oldStatus = task.status;
  task.status = nextStatus;
  task.updatedAt = today();

  if (assignment) {
    assignment.isCompleted = nextStatus === "tamamlandi";
    assignment.completedAt = nextStatus === "tamamlandi" ? today() : "";
    assignment.earnedScore = nextStatus === "tamamlandi" ? getTaskScore(task) : 0;
  }

  state.history.push({
    id: createId("history"),
    taskId,
    changedBy: getSessionUser().id,
    oldStatus,
    newStatus: nextStatus,
    note: "Görev durumu güncellendi.",
    changedAt: today(),
  });

  saveState();
  renderAll();
  showToast("Görev durumu güncellendi.");
}

function deleteTask(taskId) {
  if (!isAdmin()) return showToast("Görev silme yalnızca yöneticilere açıktır.", "error");
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || !confirm(`"${task.title}" görevi silinsin mi?`)) return;

  deleteSupabaseRow("tasks", taskId);
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  state.assignments = state.assignments.filter((assignment) => assignment.taskId !== taskId);
  state.taskGivers = state.taskGivers.filter((giver) => giver.taskId !== taskId);
  state.history = state.history.filter((historyItem) => historyItem.taskId !== taskId);
  state.taskComments = state.taskComments.filter((comment) => comment.taskId !== taskId);
  if (activeDetailTaskId === taskId) {
    closeTaskDetail();
  }
  saveState();
  renderAll();
}

function deleteProject(projectId) {
  if (!isAdmin()) return showToast("Proje silme yalnızca yöneticilere açıktır.", "error");
  const project = state.projects.find((item) => item.id === projectId);
  if (!project || !confirm(`"${project.name}" projesi ve bağlı görevleri silinsin mi?`)) return;

  deleteSupabaseRow("projects", projectId);
  const projectTaskIds = state.tasks
    .filter((task) => task.projectId === projectId)
    .map((task) => task.id);

  state.projects = state.projects.filter((project) => project.id !== projectId);
  state.tasks = state.tasks.filter((task) => task.projectId !== projectId);
  state.assignments = state.assignments.filter(
    (assignment) => !projectTaskIds.includes(assignment.taskId),
  );
  state.taskGivers = state.taskGivers.filter((giver) => !projectTaskIds.includes(giver.taskId));
  state.history = state.history.filter((historyItem) => !projectTaskIds.includes(historyItem.taskId));
  state.taskComments = state.taskComments.filter((comment) => !projectTaskIds.includes(comment.taskId));
  if (projectTaskIds.includes(activeDetailTaskId)) {
    closeTaskDetail();
  }
  saveState();
  renderAll();
}

function deleteCategory(categoryId) {
  if (!isAdmin()) return showToast("Kategori silme yalnızca yöneticilere açıktır.", "error");
  const category = state.categories.find((item) => item.id === categoryId);
  const linkedProjects = state.projects.filter((project) => project.categoryId === categoryId);
  if (linkedProjects.length) {
    return showToast(`Bu kategoriye bağlı ${linkedProjects.length} proje var. Önce projeleri başka kategoriye taşıyın.`, "error");
  }
  if (!category || !confirm(`"${category.name}" kategorisi silinsin mi?`)) return;

  deleteSupabaseRow("categories", categoryId);
  state.categories = state.categories.filter((category) => category.id !== categoryId);
  saveState();
  renderAll();
}

function openUserModal() {
  if (supabaseReady) {
    showToast("Supabase kullanıcıları güvenli davet veya kayıt akışıyla eklenmelidir.", "error");
    return;
  }
  if (!isAdmin()) {
    showToast("Bu işlem yalnızca yöneticiler için açık.", "error");
    return;
  }
  userModalMode = "create";
  elements.userModal.classList.remove("hidden");
  elements.userForm.reset();
  elements.userName.value = "";
  elements.userRole.value = "user";
  elements.userEmailPreview.textContent = buildDemoUserEmail("Yeni Kullanıcı");
  elements.userName.focus();
}

function closeUserModal() {
  elements.userModal.classList.add("hidden");
  elements.userForm.reset();
}

function updateUserEmailPreview() {
  elements.userEmailPreview.textContent = buildDemoUserEmail(elements.userName.value);
}

function addUser(event) {
  event.preventDefault();
  if (supabaseReady) {
    showToast("Supabase kullanıcıları güvenli davet veya kayıt akışıyla eklenmelidir.", "error");
    return;
  }
  if (!isAdmin()) {
    showToast("Bu işlem yalnızca yöneticiler için açık.", "error");
    return;
  }

  const normalizedName = elements.userName.value.trim();
  if (!normalizedName) return;

  const role = elements.userRole.value === "admin" ? "admin" : "user";
  const userId = createId("user");
  const email = buildDemoUserEmail(normalizedName);

  state.users.push({
    id: userId,
    fullName: normalizedName,
    email,
    role,
  });

  authAccounts.push({
    id: userId,
    fullName: normalizedName,
    email,
    password: "123456",
    role,
  });

  state.activeUserId = userId;
  saveAuthAccounts();
  saveState();
  closeUserModal();
  renderAll();
  showToast("Kullanıcı eklendi.");
}

function toggleUserRole(userId) {
  if (!isAdmin()) return showToast("Rol yönetimi yalnızca yöneticilere açıktır.", "error");
  if (userId === getSessionUser()?.id) return showToast("Kendi yönetici rolünüzü değiştiremezsiniz.", "error");

  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  user.role = user.role === "admin" ? "user" : "admin";

  const account = authAccounts.find((item) => item.id === userId || item.email === user.email);
  if (account) account.role = user.role;
  saveAuthAccounts();
  saveState();
  renderAll();
  showToast(`${user.fullName} artık ${roleLabels[user.role].toLocaleLowerCase("tr-TR")}.`);
}

function addTaskComment(event) {
  event.preventDefault();

  const body = elements.taskCommentText.value.trim();
  if (!activeDetailTaskId || !body) return;

  state.taskComments.push({
    id: createId("comment"),
    taskId: activeDetailTaskId,
    userId: getSessionUser().id,
    body,
    createdAt: today(),
  });

  elements.taskCommentText.value = "";
  saveState();
  renderTaskDetail();
  showToast("Yorum eklendi.");
}

function canManageTaskAttachments(task) {
  if (isAdmin()) return true;
  const sessionUserId = getSessionUser()?.id;
  const assignment = getTaskAssignment(task.id);
  return task.createdBy === sessionUserId || assignment?.userId === sessionUserId;
}

function openAttachmentPreview(taskId, attachmentId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const attachment = getTaskAttachments(task).find((item) => item.id === attachmentId);
  if (!attachment) return;

  activeAttachmentPreview = { taskId, attachmentId };
  elements.attachmentPreviewTitle.textContent = attachment.name;
  elements.attachmentPreviewBody.innerHTML = `
    <div class="attachment-preview-view">
      ${
        attachment.type?.startsWith("image/")
          ? `<img class="attachment-preview-hero" src="${attachment.dataUrl}" alt="${escapeHtml(attachment.name)}" />`
          : `<div class="attachment-preview-hero attachment-preview-icon">${escapeHtml(getAttachmentGroupIcon(attachment))}</div>`
      }
      <div class="attachment-preview-details">
        <strong>${escapeHtml(attachment.name)}</strong>
        <p>${escapeHtml(getAttachmentLabel(attachment))} · ${formatFileSize(attachment.size)} · ${formatDate(attachment.uploadedAt)}</p>
        <div class="attachment-preview-actions">
          <a class="primary-button" href="${attachment.dataUrl}" download="${escapeHtml(attachment.name)}">İndir</a>
          ${
            canManageTaskAttachments(task)
              ? `<button class="danger-button" type="button" data-preview-remove-attachment="${attachment.id}">Sil</button>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
  elements.attachmentPreviewModal.classList.remove("hidden");
}

function closeAttachmentPreview() {
  activeAttachmentPreview = null;
  elements.attachmentPreviewModal.classList.add("hidden");
}

function deleteTaskAttachment(taskId, attachmentId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (!canManageTaskAttachments(task)) {
    return showToast("Dosya düzenleme için yetki yok.", "error");
  }

  if (!confirm("Bu dosya silinsin mi?")) return;

  task.attachments = getTaskAttachments(task).filter((attachment) => attachment.id !== attachmentId);
  saveState();
  renderTaskDetail();
  renderTaskViews();
  showToast("Dosya kaldırıldı.");
}

function toggleTaskSubtask(taskId, subtaskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const subtask = getTaskSubtasks(task).find((item) => item.id === subtaskId);
  if (!subtask) return;

  subtask.completed = !subtask.completed;
  task.updatedAt = today();
  state.history.push({
    id: createId("history"),
    taskId,
    changedBy: getSessionUser().id,
    oldStatus: task.status,
    newStatus: task.status,
    note: subtask.completed ? `Alt görev tamamlandı: ${subtask.title}` : `Alt görev yeniden açıldı: ${subtask.title}`,
    changedAt: today(),
  });

  saveState();
  renderTaskDetail();
  renderTaskViews();
}

function handleTaskActionClick(event) {
  if (event.target.closest("[data-create-first-task]")) {
    resetTaskForm();
    openTaskDrawer();
    return;
  }
  if (event.target.closest("[data-clear-task-filters]")) {
    elements.clearFiltersBtn.click();
    return;
  }
  const detailButton = event.target.closest("[data-detail-task]");
  const editButton = event.target.closest("[data-edit-task]");
  const statusButton = event.target.closest("[data-status-task]");
  const deleteButton = event.target.closest("[data-delete-task]");
  const removeAttachmentButton = event.target.closest("[data-remove-attachment]");
  const removeDraftAttachmentButton = event.target.closest("[data-remove-draft-attachment]");
  const previewAttachmentButton = event.target.closest("[data-preview-attachment]");
  const previewRemoveButton = event.target.closest("[data-preview-remove-attachment]");
  const subtaskToggle = event.target.closest("[data-toggle-subtask]");

  if (detailButton) {
    openTaskDetail(detailButton.dataset.detailTask);
  }

  if (editButton) {
    editTask(editButton.dataset.editTask);
  }

  if (statusButton) {
    updateTaskStatus(statusButton.dataset.statusTask, statusButton.dataset.nextStatus);
  }

  if (deleteButton) {
    deleteTask(deleteButton.dataset.deleteTask);
  }

  if (removeAttachmentButton && activeDetailTaskId) {
    deleteTaskAttachment(activeDetailTaskId, removeAttachmentButton.dataset.removeAttachment);
  }

  if (removeDraftAttachmentButton) {
    taskDraftAttachments = taskDraftAttachments.filter((attachment) => attachment.id !== removeDraftAttachmentButton.dataset.removeDraftAttachment);
    renderTaskAttachmentPreview();
  }

  if (
    previewAttachmentButton &&
    !removeAttachmentButton &&
    !removeDraftAttachmentButton &&
    !previewRemoveButton &&
    !event.target.closest("a, button")
  ) {
    openAttachmentPreview(previewAttachmentButton.dataset.taskId, previewAttachmentButton.dataset.previewAttachment);
  }

  if (previewRemoveButton && activeAttachmentPreview) {
    const { taskId } = activeAttachmentPreview;
    closeAttachmentPreview();
    deleteTaskAttachment(taskId, previewRemoveButton.dataset.previewRemoveAttachment);
  }

  if (subtaskToggle) {
    toggleTaskSubtask(subtaskToggle.dataset.taskId, subtaskToggle.dataset.toggleSubtask);
  }
}

function handleKanbanDragStart(event) {
  const card = event.target.closest("[data-task-card]");
  if (!card) return;

  draggedTaskId = card.dataset.taskId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedTaskId);
  card.classList.add("dragging");
}

function handleKanbanDragEnd() {
  draggedTaskId = null;
  document.querySelectorAll(".task-card.dragging").forEach((card) => {
    card.classList.remove("dragging");
  });
  document.querySelectorAll(".kanban-column-body.drop-target").forEach((column) => {
    column.classList.remove("drop-target");
  });
}

function handleKanbanDragOver(event) {
  const dropTarget = event.target.closest("[data-kanban-status]");
  if (!dropTarget) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  dropTarget.classList.add("drop-target");
}

function handleKanbanDragLeave(event) {
  const dropTarget = event.target.closest("[data-kanban-status]");
  if (!dropTarget || dropTarget.contains(event.relatedTarget)) return;

  dropTarget.classList.remove("drop-target");
}

function handleKanbanDrop(event) {
  const dropTarget = event.target.closest("[data-kanban-status]");
  if (!dropTarget) return;

  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
  const nextStatus = dropTarget.dataset.kanbanStatus;
  dropTarget.classList.remove("drop-target");

  if (taskId && nextStatus) {
    updateTaskStatus(taskId, nextStatus);
  }
}

function handleTaskAttachmentInputChange(event) {
  addAttachmentsToDraft(event.target.files).finally(() => {
    event.target.value = "";
  });
}

function handleTaskAttachmentDrop(event) {
  event.preventDefault();
  elements.taskForm.classList.remove("attachment-drop-active");
  addAttachmentsToDraft(event.dataTransfer.files);
}

function handleTaskAttachmentDragOver(event) {
  event.preventDefault();
  elements.taskForm.classList.add("attachment-drop-active");
}

function handleTaskAttachmentDragLeave(event) {
  if (event.relatedTarget && elements.taskForm.contains(event.relatedTarget)) return;
  elements.taskForm.classList.remove("attachment-drop-active");
}

function bindEvents() {
  elements.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
  elements.showRegisterBtn.addEventListener("click", () => setAuthMode("register"));

  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await login(elements.loginEmail.value, elements.loginPassword.value, elements.loginRole.value);
  });

  elements.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await register(elements.registerName.value, elements.registerEmail.value, elements.registerPassword.value);
  });

  elements.logoutBtn.addEventListener("click", async () => {
    stopRealtimeUpdates();
    if (supabaseReady) {
      await getSupabaseClient()?.auth.signOut();
    }
    closeSidebar();
    clearSession();
    showAuth();
  });

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      setView(item.dataset.view);
      closeSidebar();
    });
  });

  elements.menuToggleBtn.addEventListener("click", () => {
    if (elements.sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  elements.newTaskBtn.addEventListener("click", () => {
    setView("tasks");
    resetTaskForm();
    openTaskDrawer();
  });

  elements.taskLayoutButtons.forEach((button) => {
    button.addEventListener("click", () => setTaskLayout(button.dataset.taskLayout));
  });

  elements.activeUser.addEventListener("change", (event) => {
    state.activeUserId = event.target.value;
    saveState();
    renderAll();
  });

  elements.addUserBtn.addEventListener("click", openUserModal);
  elements.userScores.addEventListener("click", (event) => {
    const roleButton = event.target.closest("[data-toggle-role]");
    if (roleButton) toggleUserRole(roleButton.dataset.toggleRole);
  });
  elements.resetDemoBtn.addEventListener("click", resetDemoData);
  elements.projectForm.addEventListener("submit", addProject);
  elements.cancelProjectEditBtn.addEventListener("click", resetProjectForm);
  elements.categoryForm.addEventListener("submit", addCategory);
  elements.cancelCategoryEditBtn.addEventListener("click", resetCategoryForm);
  elements.taskForm.addEventListener("submit", addTask);
  elements.cancelTaskEditBtn.addEventListener("click", resetTaskForm);
  elements.closeTaskDrawerBtn.addEventListener("click", resetTaskForm);
  elements.taskDrawerBackdrop.addEventListener("click", resetTaskForm);
  elements.sidebarBackdrop.addEventListener("click", closeSidebar);
  elements.taskFiles.addEventListener("change", handleTaskAttachmentInputChange);
  elements.taskAttachmentDropzone.addEventListener("click", () => elements.taskFiles.click());
  elements.taskAttachmentDropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.taskFiles.click();
    }
  });
  elements.taskAttachmentPreview.addEventListener("click", handleTaskActionClick);
  elements.taskDetailBody.addEventListener("click", handleTaskActionClick);
  elements.taskDetailBody.addEventListener("change", (event) => {
    const statusSelect = event.target.closest("[data-detail-status]");
    if (statusSelect) updateTaskStatus(statusSelect.dataset.detailStatus, statusSelect.value);
  });
  elements.taskForm.addEventListener("dragover", handleTaskAttachmentDragOver);
  elements.taskForm.addEventListener("drop", handleTaskAttachmentDrop);
  elements.taskForm.addEventListener("dragleave", handleTaskAttachmentDragLeave);

  elements.searchInput.addEventListener("input", renderTaskViews);
  elements.dashboardSectionTabs.forEach((tab) => {
    tab.addEventListener("click", () => setDashboardSection(tab.dataset.dashboardTab));
  });
  elements.filterToggleBtn.addEventListener("click", () => {
    const expanded = elements.filterToggleBtn.getAttribute("aria-expanded") !== "true";
    elements.filterToggleBtn.setAttribute("aria-expanded", String(expanded));
    elements.advancedFilters.classList.toggle("hidden", !expanded);
  });
  elements.taskDetailsToggle.addEventListener("click", () => {
    setTaskDetailsExpanded(elements.taskDetailsToggle.getAttribute("aria-expanded") !== "true");
  });
  elements.taskGiverChips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-giver-id]");
    if (!chip) return;
    const option = [...elements.taskGivers.options].find((item) => item.value === chip.dataset.giverId);
    if (!option) return;
    option.selected = !option.selected;
    renderTaskGiverChips();
  });
  elements.statusFilter.addEventListener("change", renderTaskViews);
  elements.priorityFilter.addEventListener("change", renderTaskViews);
  elements.categoryFilter.addEventListener("change", () => {
    renderProjectFilterOptions();
    renderTaskViews();
  });
  elements.categorySearchInput.addEventListener("input", renderCategories);
  elements.taskProject.addEventListener("change", renderCategoryOptions);
  elements.assigneeFilter.addEventListener("change", renderTaskViews);
  elements.projectFilter.addEventListener("change", renderTaskViews);
  elements.sortFilter.addEventListener("change", renderTaskViews);
  elements.clearFiltersBtn.addEventListener("click", () => {
    elements.searchInput.value = "";
    elements.statusFilter.value = "all";
    elements.priorityFilter.value = "all";
    elements.categoryFilter.value = "all";
    renderProjectFilterOptions();
    elements.projectFilter.value = "all";
    elements.assigneeFilter.value = "all";
    elements.sortFilter.value = "created_desc";
    elements.advancedFilters.classList.add("hidden");
    elements.filterToggleBtn.setAttribute("aria-expanded", "false");
    renderTaskViews();
    showToast("Filtreler temizlendi.");
  });

  elements.taskList.addEventListener("click", handleTaskActionClick);
  elements.kanbanBoard.addEventListener("click", handleTaskActionClick);
  elements.kanbanBoard.addEventListener("dragstart", handleKanbanDragStart);
  elements.kanbanBoard.addEventListener("dragend", handleKanbanDragEnd);
  elements.kanbanBoard.addEventListener("dragover", handleKanbanDragOver);
  elements.kanbanBoard.addEventListener("dragleave", handleKanbanDragLeave);
  elements.kanbanBoard.addEventListener("drop", handleKanbanDrop);
  elements.taskCommentForm.addEventListener("submit", addTaskComment);
  elements.closeTaskDetailBtn.addEventListener("click", closeTaskDetail);
  elements.taskDetailModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-task-detail]")) {
      closeTaskDetail();
    }
  });
  elements.attachmentPreviewModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-attachment-preview]")) {
      closeAttachmentPreview();
    }
  });
  elements.closeAttachmentPreviewBtn.addEventListener("click", closeAttachmentPreview);
  elements.attachmentPreviewBody.addEventListener("click", handleTaskActionClick);
  elements.userForm.addEventListener("submit", addUser);
  elements.closeUserModalBtn.addEventListener("click", closeUserModal);
  elements.cancelUserBtn.addEventListener("click", closeUserModal);
  elements.userModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-user-modal]")) {
      closeUserModal();
    }
  });
  elements.userName.addEventListener("input", updateUserEmailPreview);
  elements.userRole.addEventListener("change", updateUserEmailPreview);
  elements.taskDetailBody.addEventListener("keydown", (event) => {
    const attachmentItem = event.target.closest("[data-preview-attachment]");
    if (!attachmentItem) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAttachmentPreview(attachmentItem.dataset.taskId, attachmentItem.dataset.previewAttachment);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.userModal.classList.contains("hidden")) {
      closeUserModal();
    } else if (event.key === "Escape" && !elements.attachmentPreviewModal.classList.contains("hidden")) {
      closeAttachmentPreview();
    } else if (event.key === "Escape" && activeDetailTaskId) {
      closeTaskDetail();
    } else if (event.key === "Escape" && elements.taskForm.classList.contains("open")) {
      resetTaskForm();
    } else if (event.key === "Escape" && elements.sidebar.classList.contains("open")) {
      closeSidebar();
    }
  });

  elements.projectList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-project]");
    const deleteButton = event.target.closest("[data-delete-project]");

    if (editButton) {
      editProject(editButton.dataset.editProject);
    }

    if (deleteButton) {
      deleteProject(deleteButton.dataset.deleteProject);
    }
  });

  elements.categoryList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-category]");
    const deleteButton = event.target.closest("[data-delete-category]");

    if (editButton) {
      editCategory(editButton.dataset.editCategory);
    }

    if (deleteButton) {
      deleteCategory(deleteButton.dataset.deleteCategory);
    }
  });
}

bindEvents();
setTaskLayout("list");
initializeAuth();
