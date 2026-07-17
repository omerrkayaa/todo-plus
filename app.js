const { storageKeys, priorityScores, priorityLabels, statusLabels, roleLabels, repeatIntervalLabels, documentAssistantApiUrl } = window.TODO_PLUS_APP;
const { createId, escapeHtml, today, formatDate, getDueDateMeta, isTaskOverdue, isUuid, formatFileSize, readFileAsDataURL, getAttachmentLabel, getAttachmentGroupLabel, getAttachmentGroupIcon } = window.TODO_PLUS_UTILS;
const localStore = window.TODO_PLUS_STORAGE.createStorage(window.localStorage, storageKeys);
const taskModel = window.TODO_PLUS_TASK_MODEL.createTaskModel({ createId, priorityScores });
const supabaseMapper = window.TODO_PLUS_SUPABASE_MAPPER;
const parseQuickAddText = window.TODO_PLUS_QUICK_ADD_PARSER.parseQuickAddText;
const getTaskAttachments = taskModel.getAttachments;
const getTaskSubtasks = taskModel.getSubtasks;
const getTaskScore = taskModel.getScore;

const attachmentRules = Object.freeze({
  maxFiles: 5,
  maxFileSize: 5 * 1024 * 1024,
  extensions: new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "jpg", "jpeg", "png"]),
  mimeTypes: new Set([
    "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain", "image/jpeg", "image/png",
  ]),
});
const attachmentMimeByExtension = Object.freeze({
  pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
});

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
  projectMembers: [],
  projectInvitations: [],
  calendarNotes: [],
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
let taskDraftSubtasks = [];
let taskDraftTags = [];
let activeAttachmentPreview = null;
let activeAssistantDocumentId = null;
const assistantProcessingDocuments = new Set();
let userModalMode = "create";
let supabaseReady = false;
let isLoadingRemoteData = false;
let syncTimer = null;
let syncInFlight = null;
let syncRetryTimer = null;
let syncRetryCount = 0;
let pendingDeletions = loadPendingDeletions();
let toastTimer = null;
const toastedNotificationIds = new Set();
const ARCHIVE_PAGE_SIZE = 20;
let archiveVisibleCount = ARCHIVE_PAGE_SIZE;
let calendarAnchorDate = new Date();
calendarAnchorDate.setDate(1);
let selectedPlannerDate = today();
const modalReturnFocus = new WeakMap();

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
  userEmailFieldWrap: document.querySelector("#userEmailFieldWrap"),
  userEmailInput: document.querySelector("#userEmailInput"),
  userDemoPreview: document.querySelector("#userDemoPreview"),
  userCreatedResult: document.querySelector("#userCreatedResult"),
  createdUserEmailText: document.querySelector("#createdUserEmailText"),
  createdUserTempPassword: document.querySelector("#createdUserTempPassword"),
  resetDemoBtn: document.querySelector("#resetDemoBtn"),
  changePasswordBtn: document.querySelector("#changePasswordBtn"),
  changePasswordModal: document.querySelector("#changePasswordModal"),
  closeChangePasswordModalBtn: document.querySelector("#closeChangePasswordModalBtn"),
  cancelChangePasswordBtn: document.querySelector("#cancelChangePasswordBtn"),
  changePasswordForm: document.querySelector("#changePasswordForm"),
  newPassword: document.querySelector("#newPassword"),
  newPasswordConfirm: document.querySelector("#newPasswordConfirm"),
  changePasswordSubmitBtn: document.querySelector("#changePasswordSubmitBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  navItems: document.querySelectorAll(".nav-item"),
  todayNavBtn: document.querySelector("#todayNavBtn"),
  todayNavCount: document.querySelector("#todayNavCount"),
  upcomingNavBtn: document.querySelector("#upcomingNavBtn"),
  upcomingNavCount: document.querySelector("#upcomingNavCount"),
  calendarNavBtn: document.querySelector("#calendarNavBtn"),
  calendarView: document.querySelector("#calendarView"),
  calendarPrevBtn: document.querySelector("#calendarPrevBtn"),
  calendarNextBtn: document.querySelector("#calendarNextBtn"),
  calendarTodayBtn: document.querySelector("#calendarTodayBtn"),
  calendarMonthLabel: document.querySelector("#calendarMonthLabel"),
  calendarExportBtn: document.querySelector("#calendarExportBtn"),
  calendarGrid: document.querySelector("#calendarGrid"),
  plannerDateTitle: document.querySelector("#plannerDateTitle"),
  plannerTaskList: document.querySelector("#plannerTaskList"),
  plannerNoteForm: document.querySelector("#plannerNoteForm"),
  plannerNoteText: document.querySelector("#plannerNoteText"),
  plannerNoteDeleteBtn: document.querySelector("#plannerNoteDeleteBtn"),
  archiveNavBtn: document.querySelector("#archiveNavBtn"),
  archiveNavCount: document.querySelector("#archiveNavCount"),
  archiveView: document.querySelector("#archiveView"),
  archiveCount: document.querySelector("#archiveCount"),
  archiveSearchInput: document.querySelector("#archiveSearchInput"),
  archiveList: document.querySelector("#archiveList"),
  archiveLoadMoreBtn: document.querySelector("#archiveLoadMoreBtn"),
  pageTitle: document.querySelector("#pageTitle"),
  pageSubtitle: document.querySelector("#pageSubtitle"),
  newTaskBtn: document.querySelector("#newTaskBtn"),
  quickAddForm: document.querySelector("#quickAddForm"),
  quickAddInput: document.querySelector("#quickAddInput"),
  quickAddPreview: document.querySelector("#quickAddPreview"),
  dashboardView: document.querySelector("#dashboardView"),
  projectsView: document.querySelector("#projectsView"),
  tasksView: document.querySelector("#tasksView"),
  totalTasks: document.querySelector("#totalTasks"),
  completedTasks: document.querySelector("#completedTasks"),
  inProgressTasks: document.querySelector("#inProgressTasks"),
  successRate: document.querySelector("#successRate"),
  overdueTasks: document.querySelector("#overdueTasks"),
  streakDays: document.querySelector("#streakDays"),
  streakFreezeHint: document.querySelector("#streakFreezeHint"),
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
  notificationsBtn: document.querySelector("#notificationsBtn"),
  notificationsPanel: document.querySelector("#notificationsPanel"),
  notificationsBadge: document.querySelector("#notificationsBadge"),
  userScores: document.querySelector("#userScores"),
  upcomingTasks: document.querySelector("#upcomingTasks"),
  historyList: document.querySelector("#historyList"),
  projectForm: document.querySelector("#projectForm"),
  projectFormTitle: document.querySelector("#projectFormTitle"),
  projectSubmitBtn: document.querySelector("#projectSubmitBtn"),
  cancelProjectEditBtn: document.querySelector("#cancelProjectEditBtn"),
  projectName: document.querySelector("#projectName"),
  projectDescription: document.querySelector("#projectDescription"),
  projectDueDate: document.querySelector("#projectDueDate"),
  projectCategory: document.querySelector("#projectCategory"),
  projectCount: document.querySelector("#projectCount"),
  projectSearchInput: document.querySelector("#projectSearchInput"),
  showArchivedProjects: document.querySelector("#showArchivedProjects"),
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
  addCategoryNavBtn: document.querySelector("#addCategoryNavBtn"),
  projectInviteForm: document.querySelector("#projectInviteForm"),
  inviteProject: document.querySelector("#inviteProject"),
  inviteEmail: document.querySelector("#inviteEmail"),
  inviteRole: document.querySelector("#inviteRole"),
  membershipCount: document.querySelector("#membershipCount"),
  projectMembershipList: document.querySelector("#projectMembershipList"),
  searchInput: document.querySelector("#searchInput"),
  taskFilters: document.querySelector("#taskFilters"),
  dateScopeFilter: document.querySelector("#dateScopeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  projectFilter: document.querySelector("#projectFilter"),
  assigneeFilter: document.querySelector("#assigneeFilter"),
  tagFilter: document.querySelector("#tagFilter"),
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
  taskSubtaskList: document.querySelector("#taskSubtaskList"),
  taskSubtaskInput: document.querySelector("#taskSubtaskInput"),
  taskSubtaskAddBtn: document.querySelector("#taskSubtaskAddBtn"),
  taskTagChips: document.querySelector("#taskTagChips"),
  taskTagInput: document.querySelector("#taskTagInput"),
  taskTagAddBtn: document.querySelector("#taskTagAddBtn"),
  taskProject: document.querySelector("#taskProject"),
  taskAssignee: document.querySelector("#taskAssignee"),
  taskAssigneeChips: document.querySelector("#taskAssigneeChips"),
  taskGivers: document.querySelector("#taskGivers"),
  taskGiverChips: document.querySelector("#taskGiverChips"),
  taskDetailsToggle: document.querySelector("#taskDetailsToggle"),
  taskAdvancedFields: document.querySelector("#taskAdvancedFields"),
  taskPriority: document.querySelector("#taskPriority"),
  taskRepeatInterval: document.querySelector("#taskRepeatInterval"),
  taskMinutes: document.querySelector("#taskMinutes"),
  taskStartDate: document.querySelector("#taskStartDate"),
  taskDueDate: document.querySelector("#taskDueDate"),
  taskFiles: document.querySelector("#taskFiles"),
  taskAttachmentDropzone: document.querySelector("#taskAttachmentDropzone"),
  taskAttachmentError: document.querySelector("#taskAttachmentError"),
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
  mentionSuggestions: document.querySelector("#mentionSuggestions"),
};

function loadState() {
  const parsed = localStore.loadState(defaultState);
  return migrateState({ ...structuredClone(defaultState), ...parsed }, parsed);
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
    archived: Boolean(project.archived),
    dueDate: project.dueDate || "",
  }));
  nextState.tasks = (nextState.tasks || []).map((task) => ({
    ...task,
    attachments: Array.isArray(task.attachments)
      ? task.attachments.map((attachment) => ({
          ...attachment,
          uploadedBy: attachment.uploadedBy || task.createdBy,
          uploadedAt: attachment.uploadedAt || task.createdAt || today(),
        }))
      : [],
    subtasks: Array.isArray(task.subtasks)
      ? task.subtasks.map((subtask) => ({
          id: subtask.id || createId("subtask"),
          title: subtask.title || "",
          completed: Boolean(subtask.completed),
        }))
      : [],
    tags: Array.isArray(task.tags) ? task.tags : [],
    startDate: task.startDate || "",
    repeatInterval: task.repeatInterval || "none",
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
  if (!Array.isArray(parsedState.projectMembers)) nextState.projectMembers = [];
  if (!Array.isArray(parsedState.projectInvitations)) nextState.projectInvitations = [];
  if (!Array.isArray(parsedState.calendarNotes)) nextState.calendarNotes = [];

  return nextState;
}

function saveState() {
  localStore.saveState(state);

  if (supabaseReady && currentSession?.userId && !isLoadingRemoteData) {
    scheduleSupabaseSync();
  }
}

function loadPendingDeletions() {
  return localStore.loadDeletionQueue();
}

function savePendingDeletions() {
  localStore.saveDeletionQueue(pendingDeletions);
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

const supabaseGateway = window.TODO_PLUS_SUPABASE_GATEWAY.createGateway({
  onRemoteChange: async (payload) => {
    const loaded = await loadSupabaseData(currentSession?.userId);
    if (!loaded) return;
    renderAll();
    const messages = {
      tasks: "Görevlerde yeni bir değişiklik var.",
      task_comments: "Bir göreve yeni yorum eklendi.",
      task_assignments: "Görev atamalarında değişiklik var.",
      document_chat_messages: "Doküman asistanında yeni bir mesaj var.",
      project_invitations: "Proje davetlerinde yeni bir hareket var.",
      project_members: "Proje üyeleri güncellendi.",
    };
    if (messages[payload?.table]) showToast(messages[payload.table]);
  },
  onStatusChange: (status) => {
    if (status === "SUBSCRIBED") setConnectionStatus("online", "Supabase · Canlı bağlı");
    if (status === "CHANNEL_ERROR") setConnectionStatus("error", "Supabase · Canlı bağlantı hatası");
  },
});
const isSupabaseConfigured = () => supabaseGateway.isConfigured();
const getSupabaseClient = () => supabaseGateway.getClient();
const startRealtimeUpdates = (userId) => supabaseGateway.startRealtime(userId);
const stopRealtimeUpdates = () => supabaseGateway.stopRealtime();
const documentAssistantClient = window.TODO_PLUS_DOCUMENT_ASSISTANT.createClient({
  apiBaseUrl: documentAssistantApiUrl,
  getAccessToken: async () => {
    const client = getSupabaseClient();
    if (!client) return "";
    const { data } = await client.auth.getSession();
    return data.session?.access_token || "";
  },
});

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

  const rows = supabaseMapper.toRemoteRows(state, isUuid);
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
      await upsertRows("task_attachments", rows.task_attachments);
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
        "task_attachments",
        rows.task_attachments.filter((attachment) => attachment.uploaded_by === sessionUserId && ownTaskIds.has(attachment.task_id)),
      );
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
      attachmentsResult,
      assignmentsResult,
      giversResult,
      historyResult,
      commentsResult,
      membersResult,
      invitationsResult,
    ] = await Promise.all([
      client.from("users").select("*"),
      client.from("projects").select("*"),
      client.from("categories").select("*"),
      client.from("tasks").select("*"),
      client.from("task_attachments").select("*"),
      client.from("task_assignments").select("*"),
      client.from("task_givers").select("*"),
      client.from("task_history").select("*"),
      client.from("task_comments").select("*"),
      client.from("project_members").select("*"),
      client.from("project_invitations").select("*"),
    ]);

    const failedResult = [
      usersResult,
      projectsResult,
      categoriesResult,
      tasksResult,
      attachmentsResult,
      assignmentsResult,
      giversResult,
      historyResult,
      commentsResult,
      membersResult,
      invitationsResult,
    ].find((result) => result.error);

    if (failedResult) throw failedResult.error;

    supabaseMapper.applyRemoteRows(state, {
      users: usersResult.data,
      projects: projectsResult.data,
      categories: categoriesResult.data,
      tasks: tasksResult.data,
      task_attachments: attachmentsResult.data,
      task_assignments: assignmentsResult.data,
      task_givers: giversResult.data,
      task_history: historyResult.data,
      task_comments: commentsResult.data,
      project_members: membersResult.data,
      project_invitations: invitationsResult.data,
    }, today);

    state.activeUserId = userId;
    localStore.saveState(state);
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
  const accounts = localStore.loadAccounts(defaultAuthAccounts);
  if (!Array.isArray(accounts)) return structuredClone(defaultAuthAccounts);
  return accounts.map((account) => ({ ...account, role: account.role || "user" }));
}

function saveAuthAccounts() {
  localStore.saveAccounts(authAccounts);
}

function loadSession() {
  return localStore.loadSession();
}

function saveSession(userId) {
  currentSession = {
    userId,
    loggedInAt: new Date().toISOString(),
  };
  localStore.saveSession(currentSession);
}

function clearSession() {
  currentSession = null;
  localStore.clearSession();
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
  localStore.saveState(state);
  localStore.saveSession(currentSession);
  pendingDeletions = [];
  localStore.clearDeletionQueue();
  resetProjectForm();
  resetCategoryForm();
  resetTaskForm();
  renderAll();
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
  setTaskAttachmentError("");
  if (elements.taskAttachmentStatus) {
    elements.taskAttachmentStatus.classList.add("hidden");
    const statusText = elements.taskAttachmentStatus.querySelector(".attachment-status-text");
    const statusBar = elements.taskAttachmentStatus.querySelector(".attachment-status-bar span");
    if (statusText) statusText.textContent = "Dosya hazırlanıyor";
    if (statusBar) statusBar.style.width = "0%";
  }
  renderTaskAttachmentPreview();
}

function renderTaskSubtaskDraftList() {
  if (!elements.taskSubtaskList) return;

  if (taskDraftSubtasks.length === 0) {
    elements.taskSubtaskList.innerHTML = `<div class="empty-state subtask-empty">Henüz alt görev eklenmedi.</div>`;
    return;
  }

  elements.taskSubtaskList.innerHTML = taskDraftSubtasks
    .map(
      (subtask) => `
        <div class="subtask-draft-row ${subtask.completed ? "completed" : ""}" data-subtask-row="${subtask.id}">
          ${subtask.completed ? `<span class="subtask-done-badge" title="Tamamlandı">✓</span>` : ""}
          <input type="text" class="subtask-title-input" data-subtask-title="${subtask.id}" value="${escapeHtml(subtask.title)}" placeholder="Alt görev başlığı" aria-label="Alt görev başlığı" />
          <button type="button" class="icon-button" data-remove-subtask-row="${subtask.id}" aria-label="Alt görevi kaldır">×</button>
        </div>
      `,
    )
    .join("");
}

function addSubtaskFromInput() {
  const title = elements.taskSubtaskInput.value.trim();
  if (!title) return;
  taskDraftSubtasks.push({ id: createId("subtask"), title, completed: false });
  elements.taskSubtaskInput.value = "";
  renderTaskSubtaskDraftList();
  elements.taskSubtaskInput.focus();
}

function clearTaskDraftSubtasks() {
  taskDraftSubtasks = [];
  if (elements.taskSubtaskInput) elements.taskSubtaskInput.value = "";
  renderTaskSubtaskDraftList();
}

function renderTaskTagChips() {
  if (!elements.taskTagChips) return;

  if (taskDraftTags.length === 0) {
    elements.taskTagChips.innerHTML = "";
    return;
  }

  elements.taskTagChips.innerHTML = taskDraftTags
    .map(
      (tag) => `
        <span class="tag-chip">#${escapeHtml(tag)}<button type="button" data-remove-draft-tag="${escapeHtml(tag)}" aria-label="${escapeHtml(tag)} etiketini kaldır">×</button></span>
      `,
    )
    .join("");
}

function addTagsFromInput() {
  const rawValue = elements.taskTagInput.value;
  const incomingTags = rawValue.split(",").map((tag) => tag.trim()).filter(Boolean);
  if (incomingTags.length === 0) return;

  incomingTags.forEach((tag) => {
    const exists = taskDraftTags.some((existing) => existing.toLocaleLowerCase("tr-TR") === tag.toLocaleLowerCase("tr-TR"));
    if (!exists) taskDraftTags.push(tag);
  });

  elements.taskTagInput.value = "";
  renderTaskTagChips();
  elements.taskTagInput.focus();
}

function clearTaskDraftTags() {
  taskDraftTags = [];
  if (elements.taskTagInput) elements.taskTagInput.value = "";
  renderTaskTagChips();
}

function setTaskAttachmentError(message) {
  if (!elements.taskAttachmentError) return;
  elements.taskAttachmentError.textContent = message;
  elements.taskAttachmentError.classList.toggle("hidden", !message);
  elements.taskFiles.setAttribute("aria-invalid", String(Boolean(message)));
  elements.taskAttachmentDropzone.setAttribute("aria-invalid", String(Boolean(message)));
}

function getFileExtension(fileName) {
  return String(fileName || "").split(".").pop().toLocaleLowerCase("tr-TR");
}

function validateAttachment(file) {
  const extension = getFileExtension(file.name);
  if (!attachmentRules.extensions.has(extension)) {
    return `“${file.name}” desteklenmeyen bir dosya türü.`;
  }
  if (file.type && (!attachmentRules.mimeTypes.has(file.type) || file.type !== attachmentMimeByExtension[extension])) {
    return `“${file.name}” dosyasının MIME türü (${file.type}) desteklenmiyor.`;
  }
  if (file.size > attachmentRules.maxFileSize) {
    return `“${file.name}” 5 MB sınırını aştığı için eklenmedi.`;
  }
  return "";
}

async function addAttachmentsToDraft(fileList) {
  const files = [...(fileList || [])];
  if (files.length === 0) return;

  const remainingSlots = Math.max(0, attachmentRules.maxFiles - taskDraftAttachments.length);
  const safeFiles = files.slice(0, remainingSlots);
  const errors = [];

  if (files.length > remainingSlots) {
    errors.push(`En fazla ${attachmentRules.maxFiles} dosya eklenebilir; ${files.length - remainingSlots} dosya eklenmedi.`);
  }
  const validFiles = safeFiles.filter((file) => {
    const error = validateAttachment(file);
    if (error) errors.push(error);
    return !error;
  });
  setTaskAttachmentError(errors.join(" "));
  if (errors.length) showToast(errors.join(" "), "error");

  if (elements.taskAttachmentStatus) {
    elements.taskAttachmentStatus.classList.remove("hidden");
    const statusText = elements.taskAttachmentStatus.querySelector(".attachment-status-text");
    const statusBar = elements.taskAttachmentStatus.querySelector(".attachment-status-bar span");
    if (statusText) statusText.textContent = `${validFiles.length} dosya yükleniyor`;
    if (statusBar) statusBar.style.width = "0%";
  }

  let loadedCount = 0;
  for (const file of validFiles) {
    const dataUrl = await readFileAsDataURL(file);
    taskDraftAttachments.push({
      id: createId("attachment"),
      name: file.name,
      type: file.type || attachmentMimeByExtension[getFileExtension(file.name)],
      size: file.size,
      dataUrl,
      uploadedBy: getSessionUser()?.id,
      uploadedAt: today(),
    });
    loadedCount += 1;
    if (elements.taskAttachmentStatus) {
      const statusText = elements.taskAttachmentStatus.querySelector(".attachment-status-text");
      const statusBar = elements.taskAttachmentStatus.querySelector(".attachment-status-bar span");
      const total = validFiles.length || 1;
      const percent = Math.round((loadedCount / total) * 100);
      if (statusText) statusText.textContent = `${loadedCount}/${total} dosya hazır`;
      if (statusBar) statusBar.style.width = `${percent}%`;
    }
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
  const assignedDates = getTaskAssignments(task.id).map((assignment) => assignment.assignedAt).filter(Boolean);
  return (assignedDates.length ? assignedDates.sort()[0] : "") || task.createdAt || today();
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
    if (task.status === "tamamlandi") return;
    const daysUntilDue = task.dueDate ? getDaysBetween(task.dueDate, currentDate) : null;
    if (task.dueDate === currentDate) {
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
    } else if (daysUntilDue === 1) {
      notifications.push({
        id: `tomorrow-${task.id}`,
        type: "due_tomorrow",
        title: "Yarın son teslim!",
        message: `"${task.title}" görevine son 1 gün kaldı.`,
        badge: "1 gün kaldı",
        date: task.dueDate,
        severity: 4,
        urgent: true,
      });
    } else if (task.dueDate && isWithinDays(task.dueDate, currentDate, 2)) {
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

  const dashboardUserId = isAdmin() ? state.activeUserId : getSessionUser()?.id;
  const mentionCommentIds = new Set();
  state.taskComments
    .filter((comment) => visibleTaskIds.has(comment.taskId) && comment.userId !== dashboardUserId)
    .filter((comment) => getMentionedUserIds(comment.body).includes(dashboardUserId))
    .slice(-3)
    .forEach((comment) => {
      mentionCommentIds.add(comment.id);
      const excerpt = comment.body.length > 90 ? `${comment.body.slice(0, 90)}…` : comment.body;
      notifications.push({
        id: `mention-${comment.id}`,
        type: "mention",
        title: "Senden bahsedildi",
        message: `${getUserName(comment.userId)}, "${getTaskTitle(comment.taskId)}" görevinde: ${excerpt}`,
        badge: "@Bahsetme",
        date: comment.createdAt,
        severity: 4,
      });
    });

  state.taskComments
    .filter((comment) => visibleTaskIds.has(comment.taskId) && !mentionCommentIds.has(comment.id))
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
  return state.projects.find((project) => project.id === projectId)?.name || "Gelen Kutusu";
}

function getProjectDueMeta(project, progressRate) {
  if (!project.dueDate) return null;
  if (progressRate >= 100) return { label: `Teslim: ${formatDate(project.dueDate)}`, className: "due-complete" };
  const remainingDays = Math.ceil((new Date(`${project.dueDate}T12:00:00`) - new Date(`${today()}T12:00:00`)) / 86400000);
  if (remainingDays < 0) return { label: `Teslim: ${formatDate(project.dueDate)} - gecikti`, className: "due-overdue" };
  if (remainingDays <= 7) return { label: `Teslim: ${formatDate(project.dueDate)} - yaklaşıyor`, className: "due-soon" };
  return { label: `Teslim: ${formatDate(project.dueDate)}`, className: "" };
}

function getCategory(categoryId) {
  return state.categories.find((category) => category.id === categoryId);
}

function getTaskCategory(task) {
  const project = state.projects.find((item) => item.id === task.projectId);
  return getCategory(task.categoryId || project?.categoryId);
}

function getTaskAssignments(taskId) {
  return state.assignments.filter((assignment) => assignment.taskId === taskId);
}

function getTaskGivers(taskId) {
  return state.taskGivers.filter((giver) => giver.taskId === taskId);
}

function getTaskTitle(taskId) {
  return state.tasks.find((task) => task.id === taskId)?.title || "Silinmiş görev";
}

function calculateUserStats(userId) {
  return taskModel.calculateUserStats(state, userId);
}

// "@Ömer Kaya" gibi tam ad, "@Ömer" gibi ilk ad eşleşmeleri; uzun adlar önce denenir ki
// "@Ömer Kaya" tam ad olarak yakalansın, "@Ömer" + "Kaya" diye bölünmesin.
function getMentionCandidates() {
  return state.users
    .flatMap((user) => {
      const fullName = String(user.fullName || "").trim();
      const firstName = fullName.split(/\s+/)[0] || "";
      return [...new Set([fullName, firstName])].filter(Boolean).map((name) => ({ userId: user.id, name }));
    })
    .sort((a, b) => b.name.length - a.name.length);
}

function findCommentMentions(body) {
  const text = String(body || "");
  const haystack = text.toLocaleLowerCase("tr-TR");
  const mentions = [];
  getMentionCandidates().forEach(({ userId, name }) => {
    const needle = `@${name}`.toLocaleLowerCase("tr-TR");
    let index = haystack.indexOf(needle);
    while (index !== -1) {
      const end = index + needle.length;
      const followedByLetter = /[0-9a-zçğıöşü]/i.test(text[end] || "");
      const overlapsExisting = mentions.some((mention) => index < mention.end && end > mention.start);
      if (!followedByLetter && !overlapsExisting) mentions.push({ userId, start: index, end });
      index = haystack.indexOf(needle, end);
    }
  });
  return mentions.sort((a, b) => a.start - b.start);
}

function getMentionedUserIds(body) {
  return [...new Set(findCommentMentions(body).map((mention) => mention.userId))];
}

function renderCommentBody(body) {
  const text = String(body || "");
  let cursor = 0;
  let html = "";
  findCommentMentions(text).forEach((mention) => {
    html += escapeHtml(text.slice(cursor, mention.start));
    html += `<mark class="mention">${escapeHtml(text.slice(mention.start, mention.end))}</mark>`;
    cursor = mention.end;
  });
  return html + escapeHtml(text.slice(cursor));
}

const WEEKDAY_LABELS_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function getIsoWeekKey(dateStr) {
  const parsed = new Date(`${dateStr}T12:00:00`);
  const mondayOffset = (parsed.getDay() + 6) % 7;
  parsed.setDate(parsed.getDate() - mondayOffset);
  return parsed.toISOString().slice(0, 10);
}

function getUserCompletionDates(userId) {
  return state.assignments
    .filter((assignment) => assignment.userId === userId && assignment.isCompleted && assignment.completedAt)
    .map((assignment) => assignment.completedAt);
}

// Duolingo tarzı "seri dondurma": haftada 1 kaçırılan gün seriyi bozmaz.
function calculateUserStreak(userId) {
  const completionDates = new Set(getUserCompletionDates(userId));
  const thisWeekKey = getIsoWeekKey(today());
  if (completionDates.size === 0) {
    return { current: 0, freezesLeftThisWeek: 1 };
  }

  let streak = 0;
  const freezesUsedByWeek = {};
  const cursor = new Date(`${today()}T12:00:00`);
  if (!completionDates.has(today())) cursor.setDate(cursor.getDate() - 1);

  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (completionDates.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const weekKey = getIsoWeekKey(dateStr);
    const freezesUsed = freezesUsedByWeek[weekKey] || 0;
    if (freezesUsed < 1) {
      freezesUsedByWeek[weekKey] = freezesUsed + 1;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }

  return { current: streak, freezesLeftThisWeek: 1 - (freezesUsedByWeek[thisWeekKey] || 0) };
}

function calculateWeeklyInsights(userId) {
  const completionDates = getUserCompletionDates(userId);
  if (completionDates.length === 0) return null;

  const currentWeekKey = getIsoWeekKey(today());
  const previousWeekCursor = new Date(`${today()}T12:00:00`);
  previousWeekCursor.setDate(previousWeekCursor.getDate() - 7);
  const previousWeekKey = getIsoWeekKey(previousWeekCursor.toISOString().slice(0, 10));

  const thisWeekCount = completionDates.filter((date) => getIsoWeekKey(date) === currentWeekKey).length;
  const lastWeekCount = completionDates.filter((date) => getIsoWeekKey(date) === previousWeekKey).length;

  const dayTally = new Array(7).fill(0);
  completionDates.forEach((date) => {
    dayTally[new Date(`${date}T12:00:00`).getDay()]++;
  });
  const bestDayIndex = dayTally.indexOf(Math.max(...dayTally));
  const bestDayLabel = completionDates.length >= 3 && dayTally[bestDayIndex] > 0 ? WEEKDAY_LABELS_TR[bestDayIndex] : null;

  return { thisWeekCount, lastWeekCount, bestDayLabel };
}

const WEEKLY_SUMMARY_DISMISS_KEY = "todo_plus_dismissed_weekly_summary_v1";

function getDismissedWeeklySummaryWeek(userId) {
  try {
    const raw = window.localStorage.getItem(WEEKLY_SUMMARY_DISMISS_KEY);
    return raw ? JSON.parse(raw)[userId] || null : null;
  } catch {
    return null;
  }
}

function dismissWeeklySummary(userId, weekKey) {
  try {
    const raw = window.localStorage.getItem(WEEKLY_SUMMARY_DISMISS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[userId] = weekKey;
    window.localStorage.setItem(WEEKLY_SUMMARY_DISMISS_KEY, JSON.stringify(map));
  } catch {
    /* localStorage kullanılamıyorsa sessizce yok say. */
  }
}

function getWeeklySummaryNotification(userId) {
  if (!userId) return null;
  const insights = calculateWeeklyInsights(userId);
  if (!insights || (insights.thisWeekCount === 0 && insights.lastWeekCount === 0)) return null;

  const currentWeekKey = getIsoWeekKey(today());
  if (getDismissedWeeklySummaryWeek(userId) === currentWeekKey) return null;

  const diff = insights.thisWeekCount - insights.lastWeekCount;
  const trendSentence =
    diff > 0
      ? `Geçen haftaya göre ${diff} görev daha fazla tamamladın.`
      : diff < 0
        ? `Geçen haftaya göre ${Math.abs(diff)} görev daha az tamamladın.`
        : `Geçen haftayla aynı tempodasın.`;
  const bestDaySentence = insights.bestDayLabel ? ` En üretken günün ${insights.bestDayLabel}.` : "";

  return {
    id: `weekly-summary-${currentWeekKey}`,
    type: "weekly_summary",
    title: "Haftalık özet",
    message: `Bu hafta ${insights.thisWeekCount} görev tamamladın. ${trendSentence}${bestDaySentence}`,
    badge: "Özet",
    date: today(),
    dismissible: true,
    userId,
    weekKey: currentWeekKey,
  };
}

function setView(viewName, activeNavItem = null) {
  if (!isAdmin() && viewName === "projects") viewName = "dashboard";
  const taskScopeViews = new Set(["today", "upcoming"]);
  const titles = {
    dashboard: isAdmin() ? "Yönetici paneli" : "Kullanıcı paneli",
    projects: "Projeler",
    tasks: "Görevler",
    today: "Bugün",
    upcoming: "Yaklaşan",
    calendar: "Takvim",
    archive: "Arşiv",
  };
  const subtitles = {
    dashboard: isAdmin() ? "Ekibin görevlerini ve genel ilerlemesini yönetin." : "Size atanan işleri ve kişisel ilerlemenizi görün.",
    projects: "Projelerinizi ve kategorilerinizi tek yerden yönetin.",
    tasks: "Önceliklerinizi düzenleyin ve işi akışta tutun.",
    today: "Başlangıcı bugün olan ve teslim tarihi bugün/geçmiş olan görevler.",
    upcoming: "Gelecek tarihli görevler, teslim tarihine göre sıralı.",
    calendar: "Son tarihli görevlerin aylık görünümü.",
    archive: "Tamamlanan görevlerin geçmişi, en yeniden eskiye.",
  };
  const displayView = taskScopeViews.has(viewName) ? "tasks" : viewName;

  elements.pageTitle.textContent = titles[viewName];
  elements.pageSubtitle.textContent = subtitles[viewName];

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("active-view");
  });

  document.querySelector(`#${displayView}View`).classList.add("active-view");

  elements.newTaskBtn.classList.toggle("view-hidden", displayView !== "tasks");

  const selectedNavItem = activeNavItem || [...elements.navItems].find((item) => item.dataset.view === viewName);
  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item === selectedNavItem);
    if (item === selectedNavItem) {
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
  elements.addUserBtn.classList.toggle("hidden", !isAdmin());
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
  renderTaskAssigneeChips();

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
  const inboxOption = `<option value="">📥 Gelen Kutusu (Projesiz)</option>`;
  elements.taskProject.innerHTML = inboxOption + state.projects
    .map((project) => `<option value="${project.id}">${escapeHtml(project.name)}${project.archived ? " (Arşivlendi)" : ""}</option>`)
    .join("");
}

function renderCategoryOptions() {
  const currentCategoryFilter = elements.categoryFilter.value || "all";

  if (state.categories.length === 0) {
    elements.categoryFilter.innerHTML = `<option value="all">Tüm kategoriler</option>`;
    elements.projectCategory.innerHTML = `<option value="">Kategorisiz</option>`;
    return;
  }

  elements.categoryFilter.innerHTML = `
    <option value="all">Tüm kategoriler</option>
    ${state.categories
      .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
      .join("")}
  `;
  elements.projectCategory.innerHTML = `<option value="">Kategorisiz</option>${state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join("")}`;
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
    <option value="__inbox__">📥 Gelen Kutusu</option>
    ${availableProjects.map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join("")}
  `;
  elements.projectFilter.value = currentProject === "__inbox__" || availableProjects.some((project) => project.id === currentProject)
    ? currentProject
    : "all";
}

function renderTagFilterOptions() {
  const currentTag = elements.tagFilter.value || "all";
  const allTags = [...new Set(state.tasks.flatMap((task) => task.tags || []))].sort((a, b) =>
    a.localeCompare(b, "tr-TR"),
  );
  elements.tagFilter.innerHTML = `
    <option value="all">Tüm etiketler</option>
    ${allTags.map((tag) => `<option value="${escapeHtml(tag)}">#${escapeHtml(tag)}</option>`).join("")}
  `;
  elements.tagFilter.value = allTags.includes(currentTag) ? currentTag : "all";
}

function renderProjects() {
  elements.projectCount.textContent = `${state.projects.length} proje`;
  const selectedInviteProject = elements.inviteProject.value;
  elements.inviteProject.innerHTML = state.projects
    .map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`)
    .join("");
  if (state.projects.some((project) => project.id === selectedInviteProject)) elements.inviteProject.value = selectedInviteProject;

  if (state.projects.length === 0) {
    elements.projectList.innerHTML = `<div class="empty-state">Henüz proje eklenmedi.</div>`;
    return;
  }

  const query = elements.projectSearchInput.value.trim().toLocaleLowerCase("tr-TR");
  const showArchived = elements.showArchivedProjects.checked;
  const visibleProjects = state.projects.filter((project) => {
    if (!showArchived && project.archived) return false;
    if (!query) return true;
    const category = getCategory(project.categoryId);
    const haystack = `${project.name} ${project.description || ""} ${category?.name || ""}`.toLocaleLowerCase("tr-TR");
    return haystack.includes(query);
  });

  elements.projectCount.textContent = query || !showArchived
    ? `${visibleProjects.length} / ${state.projects.length} proje`
    : `${state.projects.length} proje`;

  if (visibleProjects.length === 0) {
    elements.projectList.innerHTML = `<div class="empty-state">Aramayla eşleşen proje bulunamadı.</div>`;
    return;
  }

  elements.projectList.innerHTML = visibleProjects
    .map((project) => {
      const projectTasks = state.tasks.filter((task) => task.projectId === project.id);
      const taskCount = projectTasks.length;
      const completedCount = projectTasks.filter((task) => task.status === "tamamlandi").length;
      const progressRate = taskCount === 0 ? 0 : Math.round((completedCount / taskCount) * 100);
      const category = getCategory(project.categoryId);
      const dueMeta = getProjectDueMeta(project, progressRate);

      return `
        <article class="project-card ${project.archived ? "archived" : ""}">
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
            <span class="badge badge-category">${category ? `<span class="badge-color-dot" style="background: ${category.color}"></span>` : ""}${escapeHtml(category?.name || "Kategorisiz")}</span>
            <span class="badge">${taskCount} görev</span>
            <span class="badge">${completedCount} tamamlandı</span>
            <span class="badge">${formatDate(project.createdAt)}</span>
            ${dueMeta ? `<span class="badge ${dueMeta.className}">${escapeHtml(dueMeta.label)}</span>` : ""}
            ${project.archived ? `<span class="badge archived-badge">Arşivlendi</span>` : ""}
          </div>
          <div class="card-actions">
            <button class="small-button" type="button" data-add-task-to-project="${project.id}">+ Görev ekle</button>
            <button class="small-button" type="button" data-edit-project="${project.id}">Düzenle</button>
            <button class="small-button" type="button" data-toggle-archive-project="${project.id}">${project.archived ? "Arşivden çıkar" : "Arşivle"}</button>
            <button class="danger-button" type="button" data-delete-project="${project.id}">Sil</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProjectMemberships() {
  const members = state.projectMembers || [];
  const invitations = state.projectInvitations || [];
  elements.membershipCount.textContent = `${members.length + invitations.length} kayıt`;
  const memberRows = members.map((member) => `
    <article class="membership-item">
      <div><strong>${escapeHtml(getUserName(member.userId))}</strong><span>${escapeHtml(getProjectName(member.projectId))}</span></div>
      <span class="badge status-tamamlandi">${member.memberRole === "manager" ? "Proje yöneticisi" : "Üye"}</span>
    </article>`);
  const invitationRows = invitations.map((invite) => `
    <article class="membership-item">
      <div><strong>${escapeHtml(invite.email)}</strong><span>${escapeHtml(getProjectName(invite.projectId))}</span></div>
      <span class="badge status-bekliyor">${invite.status === "pending" ? "Davet bekliyor" : escapeHtml(invite.status)}</span>
      ${invite.status === "pending" ? `<button class="small-button" type="button" data-cancel-invite="${invite.id}">İptal et</button>` : ""}
    </article>`);
  elements.projectMembershipList.innerHTML = memberRows.length || invitationRows.length
    ? [...memberRows, ...invitationRows].join("")
    : `<div class="empty-state"><strong>Henüz proje üyesi yok.</strong><span>Bir kullanıcıyı e-posta adresiyle projeye davet edebilirsin.</span></div>`;
}

async function addProjectInvitation(event) {
  event.preventDefault();
  if (!isAdmin()) return showToast("Bu işlem için yönetici yetkisi gerekiyor.", "error");
  const projectId = elements.inviteProject.value;
  const email = elements.inviteEmail.value.trim().toLocaleLowerCase("tr-TR");
  const memberRole = elements.inviteRole.value;
  if (!projectId || !email) return;
  const existingUser = state.users.find((user) => user.email.toLocaleLowerCase("tr-TR") === email);
  if (existingUser) {
    const exists = state.projectMembers.some((member) => member.projectId === projectId && member.userId === existingUser.id);
    if (exists) return showToast("Bu kullanıcı zaten projenin üyesi.", "error");
    const member = { id: createId("member"), projectId, userId: existingUser.id, memberRole, joinedAt: today() };
    if (supabaseReady) {
      const { data, error } = await getSupabaseClient().from("project_members").insert({ project_id: projectId, user_id: existingUser.id, member_role: memberRole }).select("id").single();
      if (error) return showToast(`Üyelik eklenemedi: ${error.message}`, "error");
      member.id = data.id;
    }
    state.projectMembers.push(member);
    showToast("Kullanıcı projeye eklendi.");
  } else {
    if (state.projectInvitations.some((invite) => invite.projectId === projectId && invite.email === email && invite.status === "pending")) {
      return showToast("Bu e-posta için bekleyen bir davet var.", "error");
    }
    const invitation = { id: createId("invite"), projectId, email, memberRole, invitedBy: getSessionUser().id, status: "pending", createdAt: today() };
    if (supabaseReady) {
      const { data, error } = await getSupabaseClient().from("project_invitations").insert({ project_id: projectId, email, member_role: memberRole, invited_by: getSessionUser().id }).select("id").single();
      if (error) return showToast(`Davet gönderilemedi: ${error.message}`, "error");
      invitation.id = data.id;
    }
    state.projectInvitations.push(invitation);
    showToast("Proje daveti oluşturuldu.");
  }
  elements.projectInviteForm.reset();
  saveState();
  renderProjectMemberships();
}

async function cancelProjectInvitation(invitationId) {
  const invitation = state.projectInvitations.find((item) => item.id === invitationId);
  if (!invitation) return;
  invitation.status = "cancelled";
  if (supabaseReady) await getSupabaseClient().from("project_invitations").update({ status: "cancelled", responded_at: new Date().toISOString() }).eq("id", invitationId);
  saveState();
  renderProjectMemberships();
  showToast("Davet iptal edildi.");
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

function isTaskVisibleToRole(task, assignments) {
  const taskAssignments = assignments || getTaskAssignments(task.id);
  return isAdmin() || taskAssignments.some((assignment) => assignment.userId === getSessionUser()?.id) || canUploadTaskAttachments(task);
}

function isTaskDueToday(task) {
  return task.status !== "tamamlandi" && Boolean(task.startDate === today() || (task.dueDate && task.dueDate <= today()));
}

function isTaskUpcoming(task) {
  return task.status !== "tamamlandi" && Boolean(task.dueDate && task.dueDate > today());
}

function getTodayTaskCount() {
  return state.tasks.filter((task) => isTaskDueToday(task) && isTaskVisibleToRole(task)).length;
}

function getUpcomingTaskCount() {
  return state.tasks.filter((task) => isTaskUpcoming(task) && isTaskVisibleToRole(task)).length;
}

function renderTodayNavBadge() {
  if (!elements.todayNavCount) return;
  const count = getTodayTaskCount();
  elements.todayNavCount.textContent = String(count);
  elements.todayNavCount.classList.toggle("hidden", count === 0);
}

function renderUpcomingNavBadge() {
  if (!elements.upcomingNavCount) return;
  const count = getUpcomingTaskCount();
  elements.upcomingNavCount.textContent = String(count);
  elements.upcomingNavCount.classList.toggle("hidden", count === 0);
}

function resetTaskFiltersToDefaults() {
  elements.searchInput.value = "";
  elements.statusFilter.value = "all";
  elements.priorityFilter.value = "all";
  elements.categoryFilter.value = "all";
  renderProjectFilterOptions();
  elements.projectFilter.value = "all";
  elements.assigneeFilter.value = "all";
  elements.tagFilter.value = "all";
  elements.dateScopeFilter.value = "all";
}

function openTodayView() {
  resetTaskFiltersToDefaults();
  elements.dateScopeFilter.value = "today";
  elements.sortFilter.value = "due_asc";
  renderTaskViews();
}

function openUpcomingView() {
  resetTaskFiltersToDefaults();
  elements.dateScopeFilter.value = "upcoming";
  elements.sortFilter.value = "due_asc";
  renderTaskViews();
}

function getFilteredTasks() {
  const query = elements.searchInput.value.trim().toLocaleLowerCase("tr-TR");
  const dateScope = elements.dateScopeFilter.value;
  const status = elements.statusFilter.value;
  const priority = elements.priorityFilter.value;
  const category = elements.categoryFilter.value;
  const projectId = elements.projectFilter.value;
  const assignee = elements.assigneeFilter.value;
  const tag = elements.tagFilter.value;
  const sort = elements.sortFilter.value;

  const filteredTasks = state.tasks.filter((task) => {
    const assignments = getTaskAssignments(task.id);
    const taskCategory = getTaskCategory(task);
    const isVisibleToRole = isTaskVisibleToRole(task, assignments);
    const matchesText =
      !query ||
      (task.title || "").toLocaleLowerCase("tr-TR").includes(query) ||
      (task.description || "").toLocaleLowerCase("tr-TR").includes(query) ||
      getProjectName(task.projectId).toLocaleLowerCase("tr-TR").includes(query) ||
      (taskCategory?.name || "").toLocaleLowerCase("tr-TR").includes(query) ||
      assignments.some((assignment) => getUserName(assignment.userId).toLocaleLowerCase("tr-TR").includes(query)) ||
      (task.tags || []).some((taskTag) => taskTag.toLocaleLowerCase("tr-TR").includes(query));
    const matchesDateScope = dateScope === "all" || (dateScope === "today" ? isTaskDueToday(task) : isTaskUpcoming(task));
    const matchesStatus = status === "all" || task.status === status;
    const matchesPriority = priority === "all" || task.priority === priority;
    const matchesCategory = category === "all" || taskCategory?.id === category;
    const matchesProject = projectId === "all" || (projectId === "__inbox__" ? !task.projectId : task.projectId === projectId);
    const matchesAssignee = assignee === "all" || assignments.some((assignment) => assignment.userId === assignee);
    const matchesTag = tag === "all" || (task.tags || []).includes(tag);

    return isVisibleToRole && matchesText && matchesDateScope && matchesStatus && matchesPriority && matchesCategory && matchesProject && matchesAssignee && matchesTag;
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
  const assignments = getTaskAssignments(task.id);
  const assigneeNames = assignments.map((assignment) => getUserName(assignment.userId));
  const assigneeName = assigneeNames.length ? assigneeNames.join(", ") : "Atanmamış";
  const assigneeDisplay = assigneeNames.length > 1 ? `${assigneeNames[0]} +${assigneeNames.length - 1}` : assigneeName;
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
  const assigneeInitials = getInitials(assigneeNames[0] || "?");

  // WCAG 2.5.7: sürükle-bırakın klavye alternatifi — panoda kartı ok düğmeleriyle taşı.
  const statusOrder = ["bekliyor", "devam_ediyor", "tamamlandi"];
  const statusIndex = statusOrder.indexOf(task.status);
  const previousStatus = statusOrder[statusIndex - 1];
  const nextColumnStatus = statusOrder[statusIndex + 1];
  const moveButtons = options.compact
    ? `
      ${previousStatus ? `<button class="icon-button move-button" type="button" data-status-task="${task.id}" data-next-status="${previousStatus}" aria-label="${escapeHtml(task.title)} görevini ${statusLabels[previousStatus]} sütununa taşı" title="${statusLabels[previousStatus]} sütununa taşı">◀</button>` : ""}
      ${nextColumnStatus ? `<button class="icon-button move-button" type="button" data-status-task="${task.id}" data-next-status="${nextColumnStatus}" aria-label="${escapeHtml(task.title)} görevini ${statusLabels[nextColumnStatus]} sütununa taşı" title="${statusLabels[nextColumnStatus]} sütununa taşı">▶</button>` : ""}
    `
    : "";

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
      ${task.repeatInterval && task.repeatInterval !== "none" ? `<div class="task-tags"><span class="badge">🔁 ${escapeHtml(repeatIntervalLabels[task.repeatInterval] || task.repeatInterval)}</span></div>` : ""}
      ${(task.tags || []).length ? `<div class="task-tags">${task.tags.map((tag) => `<span class="badge tag-badge">#${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <div class="task-card-footer">
        <div class="task-assignee" title="Atanan: ${escapeHtml(assigneeName)}">
          <span class="avatar avatar-sm">${escapeHtml(assigneeInitials)}</span>
          <span>${escapeHtml(assigneeDisplay)}</span>
        </div>
        <div class="task-signals">
          <span class="due-signal ${dueDate.className}">${escapeHtml(dueDate.label)}</span>
          <span class="score-signal">${getTaskScore(task)}p</span>
          ${attachmentCount ? `<span class="score-signal">📎 ${attachmentCount}</span>` : ""}
        </div>
      </div>
      <div class="card-actions">
        <button class="small-button action-detail" type="button" data-detail-task="${task.id}">Detayı aç</button>
        ${options.compact ? "" : `<button class="small-button action-status" type="button" data-status-task="${task.id}" data-next-status="${nextStatus}">${actionText}</button>`}
        ${moveButtons}
        ${isAdmin() ? `<button class="icon-button" type="button" data-edit-task="${task.id}" aria-label="${escapeHtml(task.title)} görevini düzenle">✎</button>` : ""}
        ${isAdmin() ? `<button class="icon-button danger-icon" type="button" data-delete-task="${task.id}" aria-label="${escapeHtml(task.title)} görevini sil">×</button>` : ""}
      </div>
    </article>
  `;
}

function renderTasks() {
  const allTasks = getFilteredTasks();
  const hidingCompleted = elements.statusFilter.value === "all";
  const tasks = hidingCompleted ? allTasks.filter((task) => task.status !== "tamamlandi") : allTasks;
  const hiddenCompletedCount = allTasks.length - tasks.length;
  elements.taskCount.textContent = `${tasks.length} görev`;

  if (tasks.length === 0) {
    const isInboxView = elements.projectFilter.value === "__inbox__";
    const isTodayView = elements.dateScopeFilter.value === "today";
    const isUpcomingView = elements.dateScopeFilter.value === "upcoming";
    const hasOtherFilters = elements.searchInput.value.trim() || [elements.statusFilter, elements.priorityFilter, elements.categoryFilter, elements.assigneeFilter, elements.tagFilter].some((control) => control.value !== "all");
    if (isInboxView && elements.dateScopeFilter.value === "all" && !hasOtherFilters) {
      elements.taskList.innerHTML = `<div class="empty-state"><strong>Gelen Kutusu boş 🎉</strong><span>Projesiz görevin yok — sıfır sürtünmeli yakalama. Proje seçmeden eklediğin yeni görevler buraya düşer.</span></div>`;
      return;
    }
    if (isTodayView && elements.projectFilter.value === "all" && !hasOtherFilters) {
      elements.taskList.innerHTML = `<div class="empty-state"><strong>Bugün için planlanmış iş yok 🌤️</strong><span>Başlangıcı bugün olan ya da teslim tarihi bugün/geçmiş olan görevler burada listelenir.</span></div>`;
      return;
    }
    if (isUpcomingView && elements.projectFilter.value === "all" && !hasOtherFilters) {
      elements.taskList.innerHTML = `<div class="empty-state"><strong>Yaklaşan teslim yok.</strong><span>Gelecek tarihli görevler, teslim tarihine göre sıralı burada görünür.</span></div>`;
      return;
    }
    const hasFilters = elements.searchInput.value.trim() || [elements.dateScopeFilter, elements.statusFilter, elements.priorityFilter, elements.categoryFilter, elements.projectFilter, elements.assigneeFilter, elements.tagFilter].some((control) => control.value !== "all");
    if (!hasFilters && hiddenCompletedCount > 0) {
      elements.taskList.innerHTML = `<div class="empty-state"><strong>Aktif görev yok 🎉</strong><span>${hiddenCompletedCount} tamamlanan görev Arşiv'de duruyor.</span><button class="small-button" type="button" data-open-archive>Arşivi aç</button></div>`;
      return;
    }
    elements.taskList.innerHTML = hasFilters
      ? `<div class="empty-state"><strong>Aradığın görev bulunamadı.</strong><span>Filtreleri temizleyerek tüm görevleri yeniden görebilirsin.</span><button class="small-button" type="button" data-clear-task-filters>Filtreleri temizle</button></div>`
      : `<div class="empty-state"><strong>Henüz görev yok.</strong><span>İlk işini planlamak için yeni bir görev oluştur.</span>${isAdmin() ? `<button class="primary-button" type="button" data-create-first-task>+ Yeni görev</button>` : ""}</div>`;
    return;
  }

  elements.taskList.innerHTML = tasks
    .map((task) => renderTaskCard(task))
    .join("") + (hidingCompleted && hiddenCompletedCount > 0
      ? `<div class="empty-state archive-hint"><span>${hiddenCompletedCount} tamamlanan görev daha var.</span><button class="small-button" type="button" data-open-archive>Arşivde gör</button></div>`
      : "");
}

function getArchivedTasks() {
  const query = elements.archiveSearchInput.value.trim().toLocaleLowerCase("tr-TR");
  return state.tasks
    .filter((task) => task.status === "tamamlandi" && isTaskVisibleToRole(task))
    .filter((task) => {
      if (!query) return true;
      const taskCategory = getTaskCategory(task);
      return (
        (task.title || "").toLocaleLowerCase("tr-TR").includes(query) ||
        (task.description || "").toLocaleLowerCase("tr-TR").includes(query) ||
        getProjectName(task.projectId).toLocaleLowerCase("tr-TR").includes(query) ||
        (taskCategory?.name || "").toLocaleLowerCase("tr-TR").includes(query) ||
        getTaskAssignments(task.id).some((assignment) => getUserName(assignment.userId).toLocaleLowerCase("tr-TR").includes(query))
      );
    })
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

function renderArchiveView() {
  if (!elements.archiveList) return;
  const archived = getArchivedTasks();
  elements.archiveCount.textContent = `${archived.length} görev`;
  if (elements.archiveNavCount) {
    elements.archiveNavCount.textContent = String(archived.length);
    elements.archiveNavCount.classList.toggle("hidden", archived.length === 0);
  }

  if (archived.length === 0) {
    elements.archiveList.innerHTML = elements.archiveSearchInput.value.trim()
      ? `<div class="empty-state"><strong>Aradığın tamamlanan görev bulunamadı.</strong></div>`
      : `<div class="empty-state"><strong>Arşiv boş.</strong><span>Tamamladığın görevler burada birikir.</span></div>`;
    elements.archiveLoadMoreBtn.classList.add("hidden");
    return;
  }

  const visible = archived.slice(0, archiveVisibleCount);
  elements.archiveList.innerHTML = visible.map((task) => renderTaskCard(task)).join("");
  elements.archiveLoadMoreBtn.classList.toggle("hidden", archived.length <= visible.length);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarMonthCells(anchorDate) {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - firstWeekday);
  const totalCells = firstWeekday + new Date(year, month + 1, 0).getDate() <= 35 ? 35 : 42;

  return Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);
    return cellDate;
  });
}

function renderCalendarView() {
  if (!elements.calendarGrid) return;
  const month = calendarAnchorDate.getMonth();
  elements.calendarMonthLabel.textContent = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(calendarAnchorDate);

  const tasksByDate = {};
  state.tasks
    .filter((task) => task.dueDate && isTaskVisibleToRole(task))
    .forEach((task) => {
      (tasksByDate[task.dueDate] ||= []).push(task);
    });

  const todayKey = today();
  elements.calendarGrid.innerHTML = getCalendarMonthCells(calendarAnchorDate)
    .map((cellDate) => {
      const dateKey = formatDateKey(cellDate);
      const inMonth = cellDate.getMonth() === month;
      const dayTasks = (tasksByDate[dateKey] || []).sort((a, b) => getTaskScore(b) - getTaskScore(a));
      const visibleChips = dayTasks.slice(0, 3);
      const overflowCount = dayTasks.length - visibleChips.length;
      const hasNote = Boolean(getCalendarNote(dateKey));
      const dayClasses = [
        "calendar-day",
        !inMonth && "calendar-day-outside",
        dateKey === todayKey && "calendar-day-today",
        dateKey === selectedPlannerDate && "calendar-day-selected",
        dayTasks.length > 0 && "calendar-day-has-tasks",
        hasNote && "calendar-day-has-note",
      ].filter(Boolean).join(" ");

      return `
        <div class="${dayClasses}" data-calendar-date="${dateKey}">
          <span class="calendar-day-number">${cellDate.getDate()}</span>
          ${hasNote ? '<span class="calendar-day-note-badge" title="Kişisel notun var" aria-hidden="true">📝</span>' : ""}
          <div class="calendar-day-tasks">
            ${visibleChips
              .map((task) => {
                const priorityMark = { dusuk: "!", orta: "!!", yuksek: "!!!" }[task.priority] || "!";
                const chipLabel = `${task.title} — ${priorityLabels[task.priority]} öncelik${task.status === "tamamlandi" ? ", tamamlandı" : ""}`;
                return `
                  <button type="button" class="calendar-chip priority-${task.priority}${task.status === "tamamlandi" ? " calendar-chip-done" : ""}" data-task-card data-task-id="${task.id}" data-detail-task="${task.id}"${isAdmin() ? ' draggable="true"' : ""} title="${escapeHtml(chipLabel)}" aria-label="${escapeHtml(chipLabel)}"><span class="calendar-chip-mark" aria-hidden="true">${priorityMark}</span>${escapeHtml(task.title)}</button>
                `;
              })
              .join("")}
            ${overflowCount > 0 ? `<span class="calendar-chip-more">+${overflowCount} daha</span>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  renderDayPlanner();
}

function shiftCalendarMonth(offset) {
  calendarAnchorDate = new Date(calendarAnchorDate.getFullYear(), calendarAnchorDate.getMonth() + offset, 1);
  renderCalendarView();
}

function resetCalendarToToday() {
  calendarAnchorDate = new Date(`${today()}T12:00:00`);
  selectedPlannerDate = today();
  renderCalendarView();
}

function getPlannerUserId() {
  return isAdmin() ? state.activeUserId : getSessionUser()?.id;
}

function getCalendarNote(dateKey) {
  const userId = getPlannerUserId();
  return state.calendarNotes.find((note) => note.date === dateKey && note.userId === userId);
}

function getTasksForCalendarDate(dateKey) {
  return state.tasks
    .filter((task) => task.dueDate === dateKey && isTaskVisibleToRole(task))
    .sort((a, b) => getTaskScore(b) - getTaskScore(a));
}

function openDayPlanner(dateKey) {
  selectedPlannerDate = dateKey;
  renderCalendarView();
}

function renderDayPlanner() {
  if (!elements.plannerDateTitle) return;
  const dateKey = selectedPlannerDate;
  elements.plannerDateTitle.textContent = dateKey === today() ? `Bugün · ${formatDate(dateKey)}` : formatDate(dateKey);

  const dayTasks = getTasksForCalendarDate(dateKey);
  elements.plannerTaskList.innerHTML = dayTasks.length
    ? dayTasks
        .map((task) => {
          const chipLabel = `${task.title} — ${priorityLabels[task.priority]} öncelik${task.status === "tamamlandi" ? ", tamamlandı" : ""}`;
          return `
            <button type="button" class="planner-task-item priority-${task.priority}${task.status === "tamamlandi" ? " calendar-chip-done" : ""}" data-detail-task="${task.id}" title="${escapeHtml(chipLabel)}">
              <span class="planner-task-title">${escapeHtml(task.title)}</span>
              <span class="planner-task-meta">${priorityLabels[task.priority]}${task.status === "tamamlandi" ? " · Tamamlandı" : ""}</span>
            </button>
          `;
        })
        .join("")
    : `<p class="planner-empty">Bu gün için görev yok. Kendi planını aşağıya not olarak ekleyebilirsin.</p>`;

  const note = getCalendarNote(dateKey);
  elements.plannerNoteText.value = note?.text || "";
  elements.plannerNoteDeleteBtn.classList.toggle("hidden", !note);
}

function savePlannerNote(event) {
  event.preventDefault();
  const text = elements.plannerNoteText.value.trim();
  if (!text) return showToast("Not metni boş olamaz.", "error");

  const userId = getPlannerUserId();
  const existing = getCalendarNote(selectedPlannerDate);
  if (existing) {
    existing.text = text;
    existing.updatedAt = today();
  } else {
    state.calendarNotes.push({
      id: createId(),
      userId,
      date: selectedPlannerDate,
      text,
      createdAt: today(),
      updatedAt: today(),
    });
  }
  saveState();
  renderCalendarView();
  showToast("Not kaydedildi.");
}

function deletePlannerNote() {
  const existing = getCalendarNote(selectedPlannerDate);
  if (!existing) return;
  state.calendarNotes = state.calendarNotes.filter((note) => note.id !== existing.id);
  saveState();
  renderCalendarView();
  showToast("Not silindi.");
}

function handleCalendarDayClick(event) {
  if (event.target.closest("[data-task-card]")) return;
  const dayCell = event.target.closest("[data-calendar-date]");
  if (!dayCell) return;
  openDayPlanner(dayCell.dataset.calendarDate);
}

function rescheduleTaskDueDate(taskId, newDueDate) {
  if (!isAdmin()) return showToast("Yalnızca yöneticiler teslim tarihini sürükleyerek değiştirebilir.", "error");
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || task.dueDate === newDueDate) return;

  task.dueDate = newDueDate;
  task.updatedAt = today();
  saveState();
  renderAll();
  showToast(`Teslim tarihi ${formatDate(newDueDate)} olarak güncellendi.`);
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatIcsTimestamp(date) {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

function generateIcsContent(tasks) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ToDo+//Takvim//TR", "CALSCALE:GREGORIAN"];
  const stamp = formatIcsTimestamp(new Date());

  tasks.forEach((task) => {
    const dateStamp = task.dueDate.replaceAll("-", "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${task.id}@todoplus`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dateStamp}`,
      `DTEND;VALUE=DATE:${dateStamp}`,
      `SUMMARY:${escapeIcsText(task.title)}`,
      task.description ? `DESCRIPTION:${escapeIcsText(task.description)}` : "",
      `STATUS:${task.status === "tamamlandi" ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}

function downloadCalendarIcs() {
  const tasks = state.tasks.filter((task) => task.dueDate && isTaskVisibleToRole(task));
  if (tasks.length === 0) return showToast("Dışa aktarılacak, teslim tarihi olan görev yok.", "error");

  const blob = new Blob([generateIcsContent(tasks)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "todoplus-takvim.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Takvim dosyası indirildi. Google/Outlook Takvim'e içe aktarabilirsin.");
}

function handleCalendarDragOver(event) {
  const dropTarget = event.target.closest("[data-calendar-date]");
  if (!dropTarget) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  dropTarget.classList.add("drop-target");
}

function handleCalendarDragLeave(event) {
  const dropTarget = event.target.closest("[data-calendar-date]");
  if (!dropTarget || dropTarget.contains(event.relatedTarget)) return;
  dropTarget.classList.remove("drop-target");
}

function handleCalendarDrop(event) {
  const dropTarget = event.target.closest("[data-calendar-date]");
  if (!dropTarget) return;
  event.preventDefault();
  dropTarget.classList.remove("drop-target");
  const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
  if (taskId) rescheduleTaskDueDate(taskId, dropTarget.dataset.calendarDate);
}

function renderKanbanBoard() {
  const tasks = getFilteredTasks();
  const columns = ["bekliyor", "devam_ediyor", "tamamlandi"];

  elements.kanbanBoard.innerHTML = columns
    .map((status) => {
      const columnTasks = tasks.filter((task) => task.status === status);

      return `
        <section class="kanban-column" data-kanban-status="${status}" aria-label="${statusLabels[status]} sütunu, ${columnTasks.length} görev">
          <div class="kanban-column-header">
            <h4>${statusLabels[status]}</h4>
            <span aria-hidden="true">${columnTasks.length}</span>
          </div>
          <div class="kanban-column-body" role="group" data-kanban-status="${status}">
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
  renderTagFilterOptions();
  renderFilterScopeSummary();
  updateActiveFilterCount();
  renderTasks();
  renderKanbanBoard();
  renderArchiveView();
  renderCalendarView();
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
  const count = [elements.dateScopeFilter, elements.statusFilter, elements.priorityFilter, elements.categoryFilter, elements.projectFilter, elements.assigneeFilter, elements.tagFilter]
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

function renderTaskAssigneeChips() {
  if (!elements.taskAssigneeChips) return;
  const selectedIds = new Set([...elements.taskAssignee.selectedOptions].map((option) => option.value));
  elements.taskAssigneeChips.innerHTML = state.users.map((user) => `
    <button class="selection-chip ${selectedIds.has(user.id) ? "selected" : ""}" type="button" data-assignee-id="${user.id}" aria-pressed="${selectedIds.has(user.id)}">
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
  const dateScope = elements.dateScopeFilter.value;
  const categoryId = elements.categoryFilter.value;
  const projectId = elements.projectFilter.value;
  const status = elements.statusFilter.value;
  const priority = elements.priorityFilter.value;
  const assigneeId = elements.assigneeFilter.value;
  const tag = elements.tagFilter.value;
  const filters = [];

  if (query) filters.push(`Arama: ${query}`);
  if (dateScope !== "all") filters.push(`Zaman: ${dateScope === "today" ? "Bugün" : "Yaklaşan"}`);
  if (categoryId !== "all") filters.push(`Kategori: ${getCategory(categoryId)?.name || "Kategori"}`);
  if (projectId !== "all") filters.push(`Proje: ${getProjectName(projectId)}`);
  if (status !== "all") filters.push(`Durum: ${statusLabels[status]}`);
  if (priority !== "all") filters.push(`Öncelik: ${priorityLabels[priority]}`);
  if (assigneeId !== "all") filters.push(`Atanan: ${getUserName(assigneeId)}`);
  if (tag !== "all") filters.push(`Etiket: #${tag}`);

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

function isAssistantAttachment(attachment) {
  return ["pdf", "docx", "txt"].includes(getFileExtension(attachment?.name));
}

function renderDocumentAssistantPanel(task, attachments) {
  const supported = attachments.filter(isAssistantAttachment);
  if (supported.length === 0) return "";
  if (!supported.some((attachment) => attachment.id === activeAssistantDocumentId)) {
    activeAssistantDocumentId = supported[0].id;
  }
  return `
    <section class="detail-block document-assistant" data-document-assistant-root data-task-id="${task.id}">
      <div class="panel-header detail-section-header">
        <div><p class="section-kicker">YAPAY ZEKA</p><h3>Doküman Asistanı</h3></div>
        <span>PDF · DOCX · TXT</span>
      </div>
      <label class="assistant-document-picker">Doküman
        <select data-assistant-document>
          ${supported.map((attachment) => `<option value="${attachment.id}" ${attachment.id === activeAssistantDocumentId ? "selected" : ""}>${escapeHtml(attachment.name)}</option>`).join("")}
        </select>
      </label>
      <div class="assistant-status" data-assistant-status>${supabaseReady ? "Doküman durumu kontrol ediliyor…" : "Doküman asistanı Supabase bağlantısı etkinleştirildiğinde kullanılabilir."}</div>
      <div class="assistant-actions">
        <button class="small-button" type="button" data-process-assistant-document ${supabaseReady ? "" : "disabled"}>Metni işle</button>
      </div>
      <div class="assistant-messages" data-assistant-messages aria-live="polite">
        <div class="empty-state">Merhaba! Yüklediğiniz doküman hakkında merak ettiğiniz her şeyi bana sorabilirsiniz.</div>
      </div>
      <form class="assistant-chat-form" data-assistant-chat-form>
        <label>Dokümanla ilgili sorun
          <textarea rows="2" maxlength="2000" required data-assistant-question placeholder="Örn. Bu dokümanda benden beklenen işler neler?"></textarea>
        </label>
        <button class="primary-button" type="submit" disabled>Gönder</button>
      </form>
      <p class="attachment-limits">Asistan yalnızca seçili dokümanın içeriğine göre cevap verir.</p>
    </section>`;
}

function renderTaskDetail() {
  if (!activeDetailTaskId) return;

  const task = state.tasks.find((item) => item.id === activeDetailTaskId);
  if (!task) {
    closeTaskDetail();
    return;
  }

  const assignments = getTaskAssignments(task.id);
  const assigneeNames = assignments.map((assignment) => getUserName(assignment.userId)).join(", ");
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
          ${isAdmin() ? `<button class="small-button" type="button" data-convert-task-to-project="${task.id}" title="Alt görevleri bağımsız görevlere yükseltip bu görevi projeye dönüştürür">📁 Projeye dönüştür</button>` : ""}
        </div>
        <div class="detail-meta">
          <span class="badge">${escapeHtml(getProjectName(task.projectId))}</span>
          <span class="badge">${escapeHtml(category ? category.name : "Kategori yok")}</span>
          <span class="badge status-${task.status}">${statusLabels[task.status]}</span>
          <span class="badge priority-${task.priority}">${priorityLabels[task.priority]} öncelik</span>
          ${task.startDate ? `<span class="badge">Başlangıç: ${formatDate(task.startDate)}</span>` : ""}
          <span class="badge ${dueDate.className}">${escapeHtml(dueDate.label)}</span>
          <span class="badge">${task.estimatedMinutes} dakika</span>
          ${task.repeatInterval && task.repeatInterval !== "none" ? `<span class="badge">🔁 ${escapeHtml(repeatIntervalLabels[task.repeatInterval] || task.repeatInterval)}</span>` : ""}
          ${(task.tags || []).map((tag) => `<span class="badge tag-badge">#${escapeHtml(tag)}</span>`).join("")}
        </div>
        <p>${escapeHtml(task.description || "Açıklama girilmedi.")}</p>
        <dl class="detail-list">
          <div>
            <dt>Atanan</dt>
            <dd>${escapeHtml(assigneeNames || "Atanmamış")}</dd>
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
                        <p>${renderCommentBody(comment.body)}</p>
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
      ${
        canUploadTaskAttachments(task)
          ? `<form class="detail-attachment-form" data-detail-attachment-form="${task.id}" enctype="multipart/form-data">
               <label>Doküman yükle
                 <input name="documents" type="file" multiple required accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" data-detail-attachment-input />
               </label>
               <p class="attachment-limits">PDF, Office, TXT, JPG veya PNG · Dosya başına en fazla 5 MB.</p>
               <button class="primary-button" type="submit">Seçilenleri yükle</button>
             </form>`
          : `<p class="attachment-limits">Bu göreve doküman yükleme yetkiniz bulunmuyor.</p>`
      }
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
                                  attachment.type?.startsWith("image/") && attachment.dataUrl
                                    ? `<img class="attachment-item-thumb" src="${attachment.dataUrl}" alt="${escapeHtml(attachment.name)}" />`
                                    : `<div class="attachment-item-icon">${escapeHtml(getAttachmentGroupIcon(attachment))}</div>`
                                }
                                <div class="attachment-item-body">
                                  <strong>${escapeHtml(attachment.name)}</strong>
                                  <p>${escapeHtml(attachment.type || "Dosya")} · ${formatFileSize(attachment.size)} · ${escapeHtml(getUserName(attachment.uploadedBy))} · ${formatDate(attachment.uploadedAt)}</p>
                                </div>
                                <div class="attachment-item-actions">
                                  <button class="small-button" type="button" data-download-attachment="${attachment.id}" data-task-id="${task.id}">İndir</button>
                                  ${
                                    canManageTaskAttachments(task, attachment)
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

    ${renderDocumentAssistantPanel(task, attachments)}

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
  if (activeAssistantDocumentId) queueMicrotask(() => initializeDocumentAssistant(activeAssistantDocumentId));
}

function getDocumentAssistantRoot(documentId = activeAssistantDocumentId) {
  const root = elements.taskDetailBody.querySelector("[data-document-assistant-root]");
  const selected = root?.querySelector("[data-assistant-document]")?.value;
  return root && selected === documentId ? root : null;
}

function renderAssistantMessages(root, messages) {
  const container = root.querySelector("[data-assistant-messages]");
  if (!messages.length) {
    container.innerHTML = `<div class="empty-state">Merhaba! Yüklediğiniz doküman hakkında merak ettiğiniz her şeyi bana sorabilirsiniz.</div>`;
    return;
  }
  container.innerHTML = messages.map((message) => {
    const sources = Array.isArray(message.source_chunks) ? message.source_chunks : [];
    return `<article class="assistant-message ${message.role}">
      <span>${message.role === "assistant" ? "Doküman Asistanı" : "Sen"}</span>
      <p>${escapeHtml(message.content).replaceAll("\n", "<br>")}</p>
      ${sources.length ? `<small>Kaynak: ${sources.map((source) => escapeHtml(source.label)).join(", ")}</small>` : ""}
    </article>`;
  }).join("");
  container.scrollTop = container.scrollHeight;
}

function applyAssistantStatus(root, document) {
  const status = root.querySelector("[data-assistant-status]");
  const processButton = root.querySelector("[data-process-assistant-document]");
  const submitButton = root.querySelector("[data-assistant-chat-form] button[type='submit']");
  const labels = {
    pending: "Doküman işlenmeyi bekliyor.",
    processing: "Dokümanın metni çıkarılıyor ve arama indeksi hazırlanıyor…",
    ready: `${document.characterCount || 0} karakter${document.pageCount ? `, ${document.pageCount} sayfa` : ""} işlendi. Asistan hazır.`,
    failed: `Doküman işlenemedi: ${document.error || "Bilinmeyen hata"}`,
  };
  status.textContent = labels[document.status] || "Doküman durumu bilinmiyor.";
  status.dataset.state = document.status || "unknown";
  processButton.disabled = document.status === "processing";
  processButton.textContent = document.status === "failed" ? "Tekrar işle" : "Metni işle";
  submitButton.disabled = document.status !== "ready";
}

async function initializeDocumentAssistant(documentId) {
  if (!supabaseReady || !documentId || documentId !== activeAssistantDocumentId) return;
  const root = getDocumentAssistantRoot(documentId);
  if (!root) return;
  try {
    const [statusPayload, messagePayload] = await Promise.all([
      documentAssistantClient.status(documentId),
      documentAssistantClient.messages(documentId),
    ]);
    const currentRoot = getDocumentAssistantRoot(documentId);
    if (!currentRoot) return;
    applyAssistantStatus(currentRoot, statusPayload.document);
    renderAssistantMessages(currentRoot, messagePayload.messages || []);
    if (statusPayload.document.status === "pending") {
      processDocumentAssistant(documentId, true);
    } else if (statusPayload.document.status === "processing") {
      setTimeout(() => initializeDocumentAssistant(documentId), 1800);
    }
  } catch (error) {
    const currentRoot = getDocumentAssistantRoot(documentId);
    if (currentRoot) currentRoot.querySelector("[data-assistant-status]").textContent = error.message;
  }
}

async function processDocumentAssistant(documentId, silent = false) {
  if (!supabaseReady || assistantProcessingDocuments.has(documentId)) return;
  assistantProcessingDocuments.add(documentId);
  const root = getDocumentAssistantRoot(documentId);
  if (root) {
    root.querySelector("[data-assistant-status]").textContent = "Doküman işleniyor…";
    root.querySelectorAll("button").forEach((button) => { button.disabled = true; });
  }
  try {
    await documentAssistantClient.process(documentId);
    if (!silent) showToast("Doküman metni işlendi; asistan hazır.");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    assistantProcessingDocuments.delete(documentId);
    initializeDocumentAssistant(documentId);
  }
}

async function submitAssistantQuestion(form) {
  const documentId = activeAssistantDocumentId;
  const root = getDocumentAssistantRoot(documentId);
  const input = form.querySelector("[data-assistant-question]");
  const question = input.value.trim();
  if (!root || !question) return;
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Yanıtlanıyor…";
  try {
    const payload = await documentAssistantClient.chat(documentId, question);
    input.value = "";
    const messagesPayload = await documentAssistantClient.messages(documentId);
    renderAssistantMessages(root, messagesPayload.messages || [payload.userMessage, payload.assistantMessage]);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "Gönder";
  }
}

function handleDocumentAssistantClick(event) {
  if (event.target.closest("[data-process-assistant-document]")) processDocumentAssistant(activeAssistantDocumentId);
}

function handleDocumentAssistantChange(event) {
  const select = event.target.closest("[data-assistant-document]");
  if (!select) return;
  activeAssistantDocumentId = select.value;
  initializeDocumentAssistant(activeAssistantDocumentId);
}

function handleDocumentAssistantSubmit(event) {
  const form = event.target.closest("[data-assistant-chat-form]");
  if (!form) return;
  event.preventDefault();
  submitAssistantQuestion(form);
}

const modalFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function activateModal(modal, initialFocus) {
  const trigger = document.activeElement;
  if (trigger instanceof HTMLElement && !modal.contains(trigger)) modalReturnFocus.set(modal, trigger);
  modal.classList.remove("hidden");
  requestAnimationFrame(() => {
    const target = initialFocus || modal.querySelector(modalFocusableSelector);
    target?.focus();
  });
}

function deactivateModal(modal) {
  modal.classList.add("hidden");
  const trigger = modalReturnFocus.get(modal);
  modalReturnFocus.delete(modal);
  requestAnimationFrame(() => {
    if (trigger?.isConnected) trigger.focus();
  });
}

function trapModalFocus(event, modal) {
  if (event.key !== "Tab") return;
  const focusable = [...modal.querySelectorAll(modalFocusableSelector)].filter((item) => item.getClientRects().length > 0);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!modal.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

function getTopmostOpenModal() {
  if (!elements.attachmentPreviewModal.classList.contains("hidden")) return elements.attachmentPreviewModal;
  if (!elements.userModal.classList.contains("hidden")) return elements.userModal;
  if (!elements.taskDetailModal.classList.contains("hidden")) return elements.taskDetailModal;
  return null;
}

function openTaskDetail(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || (!isAdmin() && !canUploadTaskAttachments(task))) {
    return showToast("Bu görevi görüntüleme yetkiniz yok.", "error");
  }
  activeDetailTaskId = taskId;
  renderTaskDetail();
  elements.taskCommentText.value = "";
  activateModal(elements.taskDetailModal, elements.taskCommentText);
}

function closeTaskDetail() {
  activeDetailTaskId = null;
  activeAssistantDocumentId = null;
  deactivateModal(elements.taskDetailModal);
  elements.taskCommentText.value = "";
  hideMentionSuggestions();
}

function renderDashboard() {
  const dashboardUserId = isAdmin() ? state.activeUserId : getSessionUser()?.id;
  const visibleTasks = isAdmin()
    ? state.tasks
    : state.tasks.filter((task) => getTaskAssignments(task.id).some((assignment) => assignment.userId === dashboardUserId));
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

  const streak = calculateUserStreak(dashboardUserId);
  elements.streakDays.textContent = streak.current;
  elements.streakFreezeHint.textContent =
    streak.current === 0 ? "henüz seri yok" : `gün üst üste${streak.freezesLeftThisWeek > 0 ? " · 1 dondurma hakkın var" : ""}`;

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
            const assigneeNames = getTaskAssignments(task.id).map((assignment) => getUserName(assignment.userId));
            const assigneeName = assigneeNames.length ? assigneeNames.join(", ") : "Atanmamış";
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

  const weeklySummary = getWeeklySummaryNotification(dashboardUserId);
  const notifications = weeklySummary ? [weeklySummary, ...getDashboardNotifications(visibleTasks)] : getDashboardNotifications(visibleTasks);
  elements.notificationCount.textContent = `${notifications.length} bildirim`;
  elements.notificationsBadge.textContent = String(notifications.length);
  elements.notificationsBadge.classList.toggle("hidden", notifications.length === 0);

  const newUrgentNotifications = notifications.filter((notification) => notification.urgent && !toastedNotificationIds.has(notification.id));
  newUrgentNotifications.forEach((notification) => toastedNotificationIds.add(notification.id));
  if (newUrgentNotifications.length === 1) {
    showToast(newUrgentNotifications[0].message, "error");
  } else if (newUrgentNotifications.length > 1) {
    showToast(`${newUrgentNotifications.length} göreve son 1 gün kaldı.`, "error");
  }

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
                  ${
                    notification.dismissible
                      ? `<button class="icon-button" type="button" data-dismiss-notification data-dismiss-user="${escapeHtml(notification.userId)}" data-dismiss-week="${escapeHtml(notification.weekKey)}" aria-label="Bildirimi kapat">×</button>`
                      : `<span>${formatDate(notification.date)}</span>`
                  }
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

function renderAll() {
  renderUsers();
  renderProjectOptions();
  renderCategoryOptions();
  renderProjects();
  renderProjectMemberships();
  renderCategories();
  renderTaskViews();
  renderDashboard();
  renderTaskDetail();
  renderTodayNavBadge();
  renderUpcomingNavBadge();
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
  elements.taskRepeatInterval.value = "none";
  elements.taskMinutes.value = "60";
  clearTaskDraftSubtasks();
  clearTaskDraftTags();
  elements.taskFiles.value = "";
  clearTaskDraftAttachments();
  renderTaskAssigneeChips();
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

  const projectName = elements.projectName.value.trim();
  if (state.projects.some((project) => project.name.toLocaleLowerCase("tr-TR") === projectName.toLocaleLowerCase("tr-TR"))) {
    return showToast("Bu adla bir proje zaten var.", "error");
  }

  const activeUser = getSessionUser();

  state.projects.push({
    id: createId("project"),
    userId: activeUser.id,
    categoryId: elements.projectCategory.value,
    name: projectName,
    description: elements.projectDescription.value.trim(),
    dueDate: elements.projectDueDate.value,
    archived: false,
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

  const projectName = elements.projectName.value.trim();
  if (state.projects.some((item) => item.id !== projectId && item.name.toLocaleLowerCase("tr-TR") === projectName.toLocaleLowerCase("tr-TR"))) {
    return showToast("Bu adla bir proje zaten var.", "error");
  }

  project.name = projectName;
  project.categoryId = elements.projectCategory.value;
  project.description = elements.projectDescription.value.trim();
  project.dueDate = elements.projectDueDate.value;
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
  elements.projectDueDate.value = project.dueDate || "";
  elements.projectCategory.value = project.categoryId || state.categories[0]?.id || "";
  elements.projectName.focus();
}

function toggleProjectArchived(projectId) {
  if (!isAdmin()) return showToast("Bu işlem için yönetici yetkisi gerekir.", "error");
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  project.archived = !project.archived;
  project.updatedAt = today();
  saveState();
  renderAll();
  showToast(project.archived ? "Proje arşivlendi." : "Proje arşivden çıkarıldı.");
}

function addTaskToProject(projectId) {
  if (!isAdmin()) return showToast("Görev oluşturma yalnızca yöneticilere açıktır.", "error");
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  setView("tasks");
  resetTaskForm();
  elements.taskProject.value = projectId;
  setTaskDetailsExpanded(true);
  openTaskDrawer();
}

function addCategory(event) {
  event.preventDefault();
  if (!isAdmin()) return showToast("Kategori yönetimi yalnızca yöneticilere açıktır.", "error");

  if (editingCategoryId) {
    updateCategoryFromForm(editingCategoryId);
    return;
  }

  const categoryName = elements.categoryName.value.trim();
  if (state.categories.some((category) => category.name.toLocaleLowerCase("tr-TR") === categoryName.toLocaleLowerCase("tr-TR"))) {
    return showToast("Bu adla bir kategori zaten var.", "error");
  }
  state.categories.push({
    id: createId("category"),
    userId: getSessionUser().id,
    name: categoryName,
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

  const categoryName = elements.categoryName.value.trim();
  if (state.categories.some((item) => item.id !== categoryId && item.name.toLocaleLowerCase("tr-TR") === categoryName.toLocaleLowerCase("tr-TR"))) {
    return showToast("Bu adla bir kategori zaten var.", "error");
  }
  category.name = categoryName;
  category.color = elements.categoryColor.value || "#2563eb";

  resetCategoryForm();
  saveState();
  renderAll();
  showToast("Kategori güncellendi.");
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

function createTaskRecord(fields) {
  const taskId = createId("task");
  const task = {
    id: taskId,
    projectId: fields.projectId || "",
    categoryId: fields.categoryId || "",
    createdBy: getSessionUser().id,
    title: fields.title,
    description: fields.description || "",
    priority: fields.priority || "orta",
    status: "bekliyor",
    estimatedMinutes: fields.estimatedMinutes || 60,
    startDate: fields.startDate || "",
    dueDate: fields.dueDate || "",
    repeatInterval: fields.repeatInterval || "none",
    attachments: fields.attachments || [],
    subtasks: fields.subtasks || [],
    tags: fields.tags || [],
    createdAt: today(),
    updatedAt: today(),
  };
  state.tasks.push(task);

  (fields.assigneeIds || []).forEach((userId) => {
    state.assignments.push({
      id: createId("assignment"),
      taskId,
      userId,
      isCompleted: false,
      completedAt: "",
      earnedScore: 0,
      assignedAt: today(),
    });
  });

  (fields.giverIds || []).forEach((userId) => {
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
    newStatus: "bekliyor",
    note: "Görev oluşturuldu.",
    changedAt: today(),
  });

  return task;
}

function matchProjectByName(name) {
  if (!name) return null;
  const query = name.toLocaleLowerCase("tr-TR");
  return (
    state.projects.find((project) => project.name.toLocaleLowerCase("tr-TR") === query) ||
    state.projects.find((project) => project.name.toLocaleLowerCase("tr-TR").split(/\s+/)[0] === query) ||
    state.projects.find((project) => project.name.toLocaleLowerCase("tr-TR").includes(query)) ||
    null
  );
}

function renderQuickAddPreview() {
  const raw = elements.quickAddInput.value;
  if (!raw.trim()) {
    elements.quickAddPreview.classList.add("hidden");
    elements.quickAddPreview.innerHTML = "";
    return;
  }

  const parsed = parseQuickAddText(raw, new Date());
  const chips = [];
  if (parsed.dueDate) chips.push(`📅 ${formatDate(parsed.dueDate)}`);
  if (parsed.repeatInterval) chips.push(`🔁 ${repeatIntervalLabels[parsed.repeatInterval] || parsed.repeatInterval}`);
  if (parsed.priority) chips.push(`${priorityLabels[parsed.priority]} öncelik`);
  if (parsed.projectName) {
    const project = matchProjectByName(parsed.projectName);
    chips.push(project ? `📁 ${project.name}` : `📁 "${parsed.projectName}" bulunamadı`);
  }
  parsed.tags.forEach((tag) => chips.push(`#${tag}`));

  elements.quickAddPreview.classList.toggle("hidden", chips.length === 0);
  elements.quickAddPreview.innerHTML = chips.map((chip) => `<span class="quick-add-chip">${escapeHtml(chip)}</span>`).join("");
}

function handleQuickAddSubmit(event) {
  event.preventDefault();
  if (!isAdmin()) return showToast("Görev oluşturma yalnızca yöneticilere açıktır.", "error");

  const raw = elements.quickAddInput.value.trim();
  if (!raw) return;

  const parsed = parseQuickAddText(raw, new Date());
  const project = matchProjectByName(parsed.projectName);
  const sessionUserId = getSessionUser().id;

  createTaskRecord({
    projectId: project?.id || "",
    categoryId: project?.categoryId || "",
    title: parsed.title || raw,
    priority: parsed.priority || "orta",
    dueDate: parsed.dueDate,
    repeatInterval: parsed.repeatInterval || "none",
    tags: parsed.tags,
    assigneeIds: [sessionUserId],
    giverIds: [sessionUserId],
  });

  elements.quickAddInput.value = "";
  renderQuickAddPreview();
  saveState();
  renderAll();
  showToast(
    parsed.projectName && !project
      ? `Görev oluşturuldu (Gelen Kutusu — "${parsed.projectName}" adında proje bulunamadı).`
      : "Görev oluşturuldu.",
  );
}

async function addTask(event) {
  event.preventDefault();
  if (!isAdmin()) return showToast("Görev oluşturma yalnızca yöneticilere açıktır.", "error");

  const priority = elements.taskPriority.value;
  const assigneeIds = [...elements.taskAssignee.selectedOptions].map((option) => option.value);
  const giverIds = [...elements.taskGivers.selectedOptions].map((option) => option.value);
  const selectedGiverIds = giverIds.length > 0 ? giverIds : [getSessionUser().id];
  const selectedProject = state.projects.find((project) => project.id === elements.taskProject.value);
  const subtasks = taskDraftSubtasks.filter((subtask) => subtask.title.trim());
  const tags = [...taskDraftTags];
  if (assigneeIds.length === 0) {
    showToast("En az bir kişi atamalısın.", "error");
    return;
  }

  if (editingTaskId) {
    const existingTask = state.tasks.find((item) => item.id === editingTaskId);
    await updateTaskFromForm(editingTaskId, {
      projectId: elements.taskProject.value,
      categoryId: selectedProject?.categoryId || "",
      title: elements.taskTitle.value.trim(),
      description: elements.taskDescription.value.trim(),
      priority,
      status: existingTask?.status || "bekliyor",
      estimatedMinutes: Number(elements.taskMinutes.value) || 60,
      startDate: elements.taskStartDate.value,
      dueDate: elements.taskDueDate.value,
      repeatInterval: elements.taskRepeatInterval.value,
      assigneeIds,
      giverIds: selectedGiverIds,
      attachments: [...taskDraftAttachments],
      subtasks,
      tags,
    });
    return;
  }

  createTaskRecord({
    projectId: elements.taskProject.value,
    categoryId: selectedProject?.categoryId || "",
    title: elements.taskTitle.value.trim(),
    description: elements.taskDescription.value.trim(),
    priority,
    estimatedMinutes: Number(elements.taskMinutes.value) || 60,
    startDate: elements.taskStartDate.value,
    dueDate: elements.taskDueDate.value,
    repeatInterval: elements.taskRepeatInterval.value,
    attachments: [...taskDraftAttachments],
    subtasks,
    tags,
    assigneeIds,
    giverIds: selectedGiverIds,
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
  task.startDate = formData.startDate;
  task.dueDate = formData.dueDate;
  task.repeatInterval = formData.repeatInterval || "none";
  task.attachments = [...getTaskAttachments(task), ...(formData.attachments || [])];
  task.subtasks = formData.subtasks || [];
  task.tags = formData.tags || [];
  task.updatedAt = today();

  const existingAssignments = state.assignments.filter((assignment) => assignment.taskId === taskId);
  const removedAssignmentIds = existingAssignments
    .filter((assignment) => !formData.assigneeIds.includes(assignment.userId))
    .map((assignment) => assignment.id);
  await Promise.all(removedAssignmentIds.map((assignmentId) => deleteSupabaseRow("task_assignments", assignmentId)));
  state.assignments = state.assignments.filter((assignment) => assignment.taskId !== taskId);
  formData.assigneeIds.forEach((userId) => {
    const existingAssignment = existingAssignments.find((assignment) => assignment.userId === userId);
    state.assignments.push({
      id: existingAssignment?.id || createId("assignment"),
      taskId,
      userId,
      isCompleted: formData.status === "tamamlandi",
      completedAt: formData.status === "tamamlandi" ? today() : "",
      earnedScore: formData.status === "tamamlandi" ? getTaskScore(task) : 0,
      assignedAt: existingAssignment?.assignedAt || today(),
    });
  });

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

  if (oldStatus !== "tamamlandi" && formData.status === "tamamlandi") {
    createRecurringTaskInstance(task);
  }

  resetTaskForm();
  saveState();
  renderAll();
  showToast("Görev durumu güncellendi.");
}

function getNextRecurrenceDate(dateStr, interval) {
  const base = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date(`${today()}T12:00:00`);
  if (interval === "daily") {
    base.setDate(base.getDate() + 1);
  } else if (interval === "weekly") {
    base.setDate(base.getDate() + 7);
  } else if (interval === "monthly") {
    const originalDate = base.getDate();
    base.setMonth(base.getMonth() + 1);
    if (base.getDate() !== originalDate) base.setDate(0);
  }
  return base.toISOString().slice(0, 10);
}

function createRecurringTaskInstance(task) {
  if (!task.repeatInterval || task.repeatInterval === "none") return;

  const newTaskId = createId("task");
  const assignments = getTaskAssignments(task.id);
  const givers = getTaskGivers(task.id);

  state.tasks.push({
    id: newTaskId,
    projectId: task.projectId,
    categoryId: task.categoryId,
    createdBy: task.createdBy,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: "bekliyor",
    estimatedMinutes: task.estimatedMinutes,
    startDate: task.startDate ? getNextRecurrenceDate(task.startDate, task.repeatInterval) : "",
    dueDate: getNextRecurrenceDate(task.dueDate, task.repeatInterval),
    repeatInterval: task.repeatInterval,
    attachments: [],
    subtasks: getTaskSubtasks(task).map((subtask) => ({ id: createId("subtask"), title: subtask.title, completed: false })),
    tags: [...(task.tags || [])],
    createdAt: today(),
    updatedAt: today(),
  });

  assignments.forEach((assignment) => {
    state.assignments.push({
      id: createId("assignment"),
      taskId: newTaskId,
      userId: assignment.userId,
      isCompleted: false,
      completedAt: "",
      earnedScore: 0,
      assignedAt: today(),
    });
  });

  givers.forEach((giver) => {
    state.taskGivers.push({
      id: createId("giver"),
      taskId: newTaskId,
      userId: giver.userId,
      assignedAt: today(),
    });
  });

  state.history.push({
    id: createId("history"),
    taskId: newTaskId,
    changedBy: getSessionUser().id,
    oldStatus: "",
    newStatus: "bekliyor",
    note: `Tekrarlayan görev: "${task.title}" görevinin yeni bir örneği oluşturuldu.`,
    changedAt: today(),
  });

  showToast(`Tekrarlayan görev için yeni bir örnek oluşturuldu: "${task.title}".`);
}

function editTask(taskId) {
  if (!isAdmin()) return showToast("Görev düzenleme yalnızca yöneticilere açıktır.", "error");
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  const assigneeIds = getTaskAssignments(taskId).map((assignment) => assignment.userId);
  const giverIds = getTaskGivers(taskId).map((giver) => giver.userId);

  setView("tasks");
  elements.taskFormTitle.textContent = "Görev düzenle";
  elements.taskSubmitBtn.textContent = "Değişiklikleri kaydet";
  elements.cancelTaskEditBtn.classList.remove("hidden");
  elements.taskTitle.value = task.title;
  elements.taskDescription.value = task.description;
  elements.taskProject.value = task.projectId;
  elements.taskPriority.value = task.priority;
  elements.taskRepeatInterval.value = task.repeatInterval || "none";
  elements.taskMinutes.value = task.estimatedMinutes;
  elements.taskStartDate.value = task.startDate || "";
  elements.taskDueDate.value = task.dueDate || "";
  taskDraftSubtasks = getTaskSubtasks(task).map((subtask) => ({ ...subtask }));
  renderTaskSubtaskDraftList();
  taskDraftTags = [...(task.tags || [])];
  renderTaskTagChips();
  elements.taskFiles.value = "";
  clearTaskDraftAttachments();
  [...elements.taskAssignee.options].forEach((option) => {
    option.selected = assigneeIds.includes(option.value);
  });
  renderTaskAssigneeChips();
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
  const assignments = getTaskAssignments(taskId);
  if (!isAdmin() && !assignments.some((assignment) => assignment.userId === getSessionUser()?.id)) {
    return showToast("Yalnızca size atanan görevleri güncelleyebilirsiniz.", "error");
  }
  if (task.status === nextStatus) return;

  const oldStatus = task.status;
  task.status = nextStatus;
  task.updatedAt = today();

  assignments.forEach((assignment) => {
    assignment.isCompleted = nextStatus === "tamamlandi";
    assignment.completedAt = nextStatus === "tamamlandi" ? today() : "";
    assignment.earnedScore = nextStatus === "tamamlandi" ? getTaskScore(task) : 0;
  });

  state.history.push({
    id: createId("history"),
    taskId,
    changedBy: getSessionUser().id,
    oldStatus,
    newStatus: nextStatus,
    note: "Görev durumu güncellendi.",
    changedAt: today(),
  });

  if (nextStatus === "tamamlandi") {
    createRecurringTaskInstance(task);
  }

  saveState();
  renderAll();
  showToast(`"${task.title}" görevi ${statusLabels[nextStatus]} durumuna alındı.`);
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
  showToast("Görev silindi.");
}

function convertTaskToProject(taskId) {
  if (!isAdmin()) return showToast("Bu işlem için yönetici yetkisi gerekir.", "error");
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const subtasks = getTaskSubtasks(task).filter((subtask) => subtask.title.trim());
  const confirmMessage = subtasks.length
    ? `"${task.title}" görevi projeye dönüştürülecek ve ${subtasks.length} alt görev bağımsız göreve yükseltilecek. Görevin yorumları ve dosya ekleri kaybolacak. Devam edilsin mi?`
    : `"${task.title}" görevi projeye dönüştürülecek. Görevin yorumları ve dosya ekleri kaybolacak. Devam edilsin mi?`;
  if (!confirm(confirmMessage)) return;

  const assigneeIds = getTaskAssignments(taskId).map((assignment) => assignment.userId);
  const giverIds = getTaskGivers(taskId).map((giver) => giver.userId);

  const projectId = createId("project");
  const project = {
    id: projectId,
    userId: getSessionUser().id,
    categoryId: task.categoryId || "",
    name: task.title,
    description: task.description || "",
    archived: false,
    dueDate: task.dueDate || "",
    createdAt: today(),
    updatedAt: today(),
  };
  state.projects.push(project);

  subtasks.forEach((subtask) => {
    const newTaskId = createId("task");
    const newTask = {
      id: newTaskId,
      projectId,
      categoryId: project.categoryId,
      createdBy: getSessionUser().id,
      title: subtask.title,
      description: "",
      priority: task.priority,
      status: subtask.completed ? "tamamlandi" : "bekliyor",
      estimatedMinutes: 60,
      startDate: "",
      dueDate: "",
      repeatInterval: "none",
      attachments: [],
      subtasks: [],
      tags: [],
      createdAt: today(),
      updatedAt: today(),
    };
    state.tasks.push(newTask);

    assigneeIds.forEach((userId) => {
      state.assignments.push({
        id: createId("assignment"),
        taskId: newTaskId,
        userId,
        isCompleted: newTask.status === "tamamlandi",
        completedAt: newTask.status === "tamamlandi" ? today() : "",
        earnedScore: newTask.status === "tamamlandi" ? getTaskScore(newTask) : 0,
        assignedAt: today(),
      });
    });

    giverIds.forEach((userId) => {
      state.taskGivers.push({ id: createId("giver"), taskId: newTaskId, userId, assignedAt: today() });
    });

    state.history.push({
      id: createId("history"),
      taskId: newTaskId,
      changedBy: getSessionUser().id,
      oldStatus: "",
      newStatus: newTask.status,
      note: `"${task.title}" görevinin projeye dönüştürülmesiyle oluşturuldu.`,
      changedAt: today(),
    });
  });

  deleteSupabaseRow("tasks", taskId);
  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  state.assignments = state.assignments.filter((assignment) => assignment.taskId !== taskId);
  state.taskGivers = state.taskGivers.filter((giver) => giver.taskId !== taskId);
  state.history = state.history.filter((historyItem) => historyItem.taskId !== taskId);
  state.taskComments = state.taskComments.filter((comment) => comment.taskId !== taskId);
  if (activeDetailTaskId === taskId) closeTaskDetail();

  saveState();
  renderAll();
  setView("projects");
  showToast(`Görev "${project.name}" projesine dönüştürüldü.`);
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
  showToast("Kategori silindi.");
}

function openUserModal() {
  if (!isAdmin()) {
    showToast("Bu işlem yalnızca yöneticiler için açık.", "error");
    return;
  }
  userModalMode = "create";
  elements.userForm.reset();
  elements.userName.value = "";
  elements.userRole.value = "user";
  elements.userEmailFieldWrap.classList.toggle("hidden", !supabaseReady);
  elements.userEmailInput.required = supabaseReady;
  elements.userDemoPreview.classList.toggle("hidden", supabaseReady);
  elements.userCreatedResult.classList.add("hidden");
  elements.userSubmitBtn.disabled = false;
  elements.userSubmitBtn.textContent = "Kullanıcıyı ekle";
  elements.userEmailPreview.textContent = buildDemoUserEmail("Yeni Kullanıcı");
  activateModal(elements.userModal, elements.userName);
}

function closeUserModal() {
  deactivateModal(elements.userModal);
  elements.userForm.reset();
  elements.userCreatedResult.classList.add("hidden");
}

function openChangePasswordModal() {
  elements.changePasswordForm.reset();
  activateModal(elements.changePasswordModal, elements.newPassword);
}

function closeChangePasswordModal() {
  deactivateModal(elements.changePasswordModal);
  elements.changePasswordForm.reset();
}

async function submitChangePassword(event) {
  event.preventDefault();
  const newPassword = elements.newPassword.value;
  const confirmPassword = elements.newPasswordConfirm.value;
  if (newPassword.length < 6) return showToast("Şifre en az 6 karakter olmalıdır.", "error");
  if (newPassword !== confirmPassword) return showToast("Şifreler eşleşmiyor.", "error");

  const button = elements.changePasswordSubmitBtn;
  button.disabled = true;
  button.textContent = "Güncelleniyor…";
  try {
    if (supabaseReady) {
      const { error } = await getSupabaseClient().auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
    } else {
      const account = authAccounts.find((item) => item.id === getSessionUser()?.id);
      if (!account) throw new Error("Hesap bulunamadı.");
      account.password = newPassword;
      saveAuthAccounts();
    }
    showToast("Şifreniz güncellendi.");
    closeChangePasswordModal();
  } catch (error) {
    showToast(error.message || "Şifre güncellenemedi.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Şifreyi güncelle";
  }
}

function updateUserEmailPreview() {
  elements.userEmailPreview.textContent = buildDemoUserEmail(elements.userName.value);
}

async function createSupabaseUserAsAdmin({ fullName, email, role }) {
  const client = getSupabaseClient();
  const { data: sessionData } = await client.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) throw new Error("Oturum bulunamadı.");
  const response = await fetch(`${documentAssistantApiUrl}/users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, role }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || "Kullanıcı oluşturulamadı.");
  return payload;
}

async function addUser(event) {
  event.preventDefault();
  if (!isAdmin()) {
    showToast("Bu işlem yalnızca yöneticiler için açık.", "error");
    return;
  }

  const normalizedName = elements.userName.value.trim();
  if (!normalizedName) return;
  const role = elements.userRole.value === "admin" ? "admin" : "user";

  if (supabaseReady) {
    const email = elements.userEmailInput.value.trim().toLocaleLowerCase("tr-TR");
    if (!email) return showToast("E-posta gerekli.", "error");
    elements.userSubmitBtn.disabled = true;
    elements.userSubmitBtn.textContent = "Oluşturuluyor…";
    try {
      const payload = await createSupabaseUserAsAdmin({ fullName: normalizedName, email, role });
      elements.userCreatedResult.classList.remove("hidden");
      elements.createdUserEmailText.textContent = payload.user.email;
      elements.createdUserTempPassword.textContent = payload.tempPassword;
      showToast("Kullanıcı oluşturuldu. Geçici şifreyi kullanıcıya iletmeyi unutma.");
      await loadSupabaseData(currentSession?.userId);
      renderAll();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      elements.userSubmitBtn.disabled = false;
      elements.userSubmitBtn.textContent = "Kullanıcıyı ekle";
    }
    return;
  }

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

let mentionSuggestionIndex = 0;

function getMentionTokenBeforeCaret() {
  const textarea = elements.taskCommentText;
  const beforeCaret = textarea.value.slice(0, textarea.selectionStart ?? textarea.value.length);
  const match = beforeCaret.match(/(?:^|\s)@([^@\n]{0,40})$/);
  if (!match) return null;
  return { query: match[1], start: beforeCaret.length - match[1].length - 1 };
}

function getMentionMatches(query) {
  const normalized = query.trim().toLocaleLowerCase("tr-TR");
  return state.users
    .filter((user) => {
      const fullName = String(user.fullName || "").toLocaleLowerCase("tr-TR");
      return !normalized || fullName.startsWith(normalized) || fullName.split(/\s+/).some((part) => part.startsWith(normalized));
    })
    .slice(0, 5);
}

function hideMentionSuggestions() {
  if (!elements.mentionSuggestions) return;
  elements.mentionSuggestions.classList.add("hidden");
  elements.mentionSuggestions.innerHTML = "";
  mentionSuggestionIndex = 0;
}

function renderMentionSuggestions() {
  const token = getMentionTokenBeforeCaret();
  if (!token) return hideMentionSuggestions();
  const matches = getMentionMatches(token.query);
  if (matches.length === 0) return hideMentionSuggestions();
  mentionSuggestionIndex = Math.min(mentionSuggestionIndex, matches.length - 1);
  elements.mentionSuggestions.innerHTML = matches
    .map(
      (user, index) => `
        <button type="button" role="option" aria-selected="${index === mentionSuggestionIndex}" class="mention-suggestion${index === mentionSuggestionIndex ? " active" : ""}" data-mention-user="${user.id}">
          <span class="avatar avatar-sm">${escapeHtml(getInitials(user.fullName))}</span>
          <span>${escapeHtml(user.fullName)}</span>
        </button>
      `,
    )
    .join("");
  elements.mentionSuggestions.classList.remove("hidden");
}

function applyMentionSuggestion(userId) {
  const token = getMentionTokenBeforeCaret();
  const user = state.users.find((item) => item.id === userId);
  if (!token || !user) return hideMentionSuggestions();
  const textarea = elements.taskCommentText;
  const caret = textarea.selectionStart ?? textarea.value.length;
  const inserted = `@${user.fullName} `;
  textarea.value = textarea.value.slice(0, token.start) + inserted + textarea.value.slice(caret);
  const nextCaret = token.start + inserted.length;
  textarea.focus();
  textarea.setSelectionRange(nextCaret, nextCaret);
  hideMentionSuggestions();
}

function handleMentionKeydown(event) {
  if (elements.mentionSuggestions.classList.contains("hidden")) return;
  const options = [...elements.mentionSuggestions.querySelectorAll("[data-mention-user]")];
  if (options.length === 0) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    mentionSuggestionIndex = (mentionSuggestionIndex + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length;
    renderMentionSuggestions();
  } else if (event.key === "Enter" || event.key === "Tab") {
    event.preventDefault();
    applyMentionSuggestion(options[mentionSuggestionIndex]?.dataset.mentionUser);
  } else if (event.key === "Escape") {
    event.stopPropagation();
    hideMentionSuggestions();
  }
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
  hideMentionSuggestions();
  saveState();
  renderTaskDetail();
  const mentionedNames = getMentionedUserIds(body)
    .filter((userId) => userId !== getSessionUser().id)
    .map((userId) => getUserName(userId));
  showToast(mentionedNames.length ? `Yorum eklendi · ${mentionedNames.join(", ")} bilgilendirilecek.` : "Yorum eklendi.");
}

function canUploadTaskAttachments(task) {
  if (isAdmin()) return true;
  const sessionUserId = getSessionUser()?.id;
  const isAssignee = getTaskAssignments(task.id).some((assignment) => assignment.userId === sessionUserId);
  const isGiver = getTaskGivers(task.id).some((giver) => giver.userId === sessionUserId);
  const isProjectMember = state.projectMembers.some((member) => member.projectId === task.projectId && member.userId === sessionUserId);
  return task.createdBy === sessionUserId || isAssignee || isGiver || isProjectMember;
}

function canManageTaskAttachments(task, attachment) {
  return isAdmin() || (canUploadTaskAttachments(task) && attachment?.uploadedBy === getSessionUser()?.id);
}

function safeStorageFileName(fileName) {
  return String(fileName || "document")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

async function createTaskAttachment(task, file) {
  const validationError = validateAttachment(file);
  if (validationError) throw new Error(validationError);
  if (!canUploadTaskAttachments(task)) throw new Error("Bu göreve doküman yükleme yetkiniz yok.");

  const attachment = {
    id: createId("attachment"),
    name: file.name,
    type: file.type || attachmentMimeByExtension[getFileExtension(file.name)],
    size: file.size,
    uploadedBy: getSessionUser().id,
    uploadedAt: today(),
  };

  const client = getSupabaseClient();
  if (supabaseReady && client && isUuid(task.id)) {
    attachment.storagePath = `${task.id}/${attachment.uploadedBy}/${attachment.id}-${safeStorageFileName(file.name)}`;
    const { error: uploadError } = await client.storage
      .from("task-documents")
      .upload(attachment.storagePath, file, { contentType: attachment.type, upsert: false });
    if (uploadError) throw new Error(`Dosya saklama alanına yüklenemedi: ${uploadError.message}`);

    const { error: metadataError } = await client.from("task_attachments").insert({
      id: attachment.id,
      task_id: task.id,
      uploaded_by: attachment.uploadedBy,
      file_name: attachment.name,
      storage_path: attachment.storagePath,
      mime_type: attachment.type,
      file_size: attachment.size,
    });
    if (metadataError) {
      await client.storage.from("task-documents").remove([attachment.storagePath]);
      throw new Error(`Dosya bilgileri kaydedilemedi: ${metadataError.message}`);
    }
  } else {
    attachment.dataUrl = await readFileAsDataURL(file);
  }
  return attachment;
}

async function uploadTaskAttachments(event) {
  const form = event.target.closest("[data-detail-attachment-form]");
  if (!form) return;
  event.preventDefault();
  const task = state.tasks.find((item) => item.id === form.dataset.detailAttachmentForm);
  const input = form.querySelector("[data-detail-attachment-input]");
  const files = [...(input?.files || [])];
  if (!task || files.length === 0) return showToast("Yüklenecek en az bir dosya seçin.", "error");
  if (!canUploadTaskAttachments(task)) return showToast("Bu göreve doküman yükleme yetkiniz yok.", "error");
  if (getTaskAttachments(task).length + files.length > attachmentRules.maxFiles) {
    return showToast(`Bir görevde en fazla ${attachmentRules.maxFiles} dosya bulunabilir.`, "error");
  }

  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Yükleniyor…";
  try {
    const uploadedAttachments = [];
    for (const file of files) {
      const attachment = await createTaskAttachment(task, file);
      task.attachments.push(attachment);
      uploadedAttachments.push(attachment);
    }
    task.updatedAt = today();
    saveState();
    renderTaskDetail();
    renderTaskViews();
    showToast(`${files.length} doküman başarıyla yüklendi.`);
    if (supabaseReady) {
      uploadedAttachments
        .filter(isAssistantAttachment)
        .forEach((attachment) => processDocumentAssistant(attachment.id, true));
    }
  } catch (error) {
    showToast(error.message || "Dosya yüklenirken bir hata oluştu.", "error");
  } finally {
    if (button.isConnected) {
      button.disabled = false;
      button.textContent = "Seçilenleri yükle";
    }
  }
}

async function downloadTaskAttachment(taskId, attachmentId) {
  const task = state.tasks.find((item) => item.id === taskId);
  const attachment = getTaskAttachments(task).find((item) => item.id === attachmentId);
  if (!task || !attachment || !canUploadTaskAttachments(task)) return showToast("Bu dosyaya erişim yetkiniz yok.", "error");
  let href = attachment.dataUrl;
  if (!href && attachment.storagePath) {
    const { data, error } = await getSupabaseClient()?.storage.from("task-documents").download(attachment.storagePath) || {};
    if (error || !data) return showToast("Dosya indirilemedi.", "error");
    href = URL.createObjectURL(data);
  }
  const link = document.createElement("a");
  link.href = href;
  link.download = attachment.name;
  link.click();
  if (href?.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(href), 1000);
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
        attachment.type?.startsWith("image/") && attachment.dataUrl
          ? `<img class="attachment-preview-hero" src="${attachment.dataUrl}" alt="${escapeHtml(attachment.name)}" />`
          : `<div class="attachment-preview-hero attachment-preview-icon">${escapeHtml(getAttachmentGroupIcon(attachment))}</div>`
      }
      <div class="attachment-preview-details">
        <strong>${escapeHtml(attachment.name)}</strong>
        <p>${escapeHtml(getAttachmentLabel(attachment))} · ${formatFileSize(attachment.size)} · ${formatDate(attachment.uploadedAt)}</p>
        <div class="attachment-preview-actions">
          <button class="primary-button" type="button" data-download-attachment="${attachment.id}" data-task-id="${task.id}">İndir</button>
          ${
            canManageTaskAttachments(task, attachment)
              ? `<button class="danger-button" type="button" data-preview-remove-attachment="${attachment.id}">Sil</button>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
  activateModal(elements.attachmentPreviewModal, elements.closeAttachmentPreviewBtn);
}

function closeAttachmentPreview() {
  activeAttachmentPreview = null;
  deactivateModal(elements.attachmentPreviewModal);
}

async function deleteTaskAttachment(taskId, attachmentId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const attachment = getTaskAttachments(task).find((item) => item.id === attachmentId);
  if (!attachment || !canManageTaskAttachments(task, attachment)) {
    return showToast("Dosya düzenleme için yetki yok.", "error");
  }

  if (!confirm("Bu dosya silinsin mi?")) return;

  if (attachment.storagePath && getSupabaseClient()) {
    const { error: storageError } = await getSupabaseClient().storage.from("task-documents").remove([attachment.storagePath]);
    if (storageError) return showToast(`Dosya silinemedi: ${storageError.message}`, "error");
    await deleteSupabaseRow("task_attachments", attachment.id);
  }
  task.attachments = getTaskAttachments(task).filter((item) => item.id !== attachmentId);
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
  if (event.target.closest("[data-open-archive]")) {
    setView("archive", elements.archiveNavBtn);
    closeSidebar();
    return;
  }
  const detailButton = event.target.closest("[data-detail-task]");
  const editButton = event.target.closest("[data-edit-task]");
  const statusButton = event.target.closest("[data-status-task]");
  const deleteButton = event.target.closest("[data-delete-task]");
  const removeAttachmentButton = event.target.closest("[data-remove-attachment]");
  const removeDraftAttachmentButton = event.target.closest("[data-remove-draft-attachment]");
  const previewAttachmentButton = event.target.closest("[data-preview-attachment]");
  const downloadAttachmentButton = event.target.closest("[data-download-attachment]");
  const previewRemoveButton = event.target.closest("[data-preview-remove-attachment]");
  const subtaskToggle = event.target.closest("[data-toggle-subtask]");
  const convertButton = event.target.closest("[data-convert-task-to-project]");

  if (convertButton) {
    convertTaskToProject(convertButton.dataset.convertTaskToProject);
    return;
  }

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
    setTaskAttachmentError("");
    renderTaskAttachmentPreview();
  }

  const removeSubtaskRowButton = event.target.closest("[data-remove-subtask-row]");
  if (removeSubtaskRowButton) {
    taskDraftSubtasks = taskDraftSubtasks.filter((subtask) => subtask.id !== removeSubtaskRowButton.dataset.removeSubtaskRow);
    renderTaskSubtaskDraftList();
  }

  const removeDraftTagButton = event.target.closest("[data-remove-draft-tag]");
  if (removeDraftTagButton) {
    taskDraftTags = taskDraftTags.filter((tag) => tag !== removeDraftTagButton.dataset.removeDraftTag);
    renderTaskTagChips();
  }

  if (downloadAttachmentButton) {
    downloadTaskAttachment(downloadAttachmentButton.dataset.taskId, downloadAttachmentButton.dataset.downloadAttachment);
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
  document.querySelectorAll("[data-task-card].dragging").forEach((card) => {
    card.classList.remove("dragging");
  });
  document.querySelectorAll(".kanban-column-body.drop-target").forEach((column) => {
    column.classList.remove("drop-target");
  });
  document.querySelectorAll(".calendar-day.drop-target").forEach((day) => {
    day.classList.remove("drop-target");
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

function debounce(callback, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function getLocalTodayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
      setView(item.dataset.view, item);
      if (item.dataset.dateScopeShortcut === "today") {
        openTodayView();
      } else if (item.dataset.dateScopeShortcut === "upcoming") {
        openUpcomingView();
      } else if (item.dataset.view === "tasks") {
        // Bugün/Yaklaşan kısayollarının kurduğu filtreler burada kalmasın:
        // "Görev yönetimi" her zaman tüm görevleri gösterir.
        resetTaskFiltersToDefaults();
        elements.sortFilter.value = "created_desc";
        renderTaskViews();
      }
      if (item === elements.addCategoryNavBtn) {
        resetCategoryForm();
        requestAnimationFrame(() => {
          elements.categoryForm.scrollIntoView({ behavior: "smooth", block: "start" });
          elements.categoryName.focus();
        });
      }
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
  elements.changePasswordBtn.addEventListener("click", openChangePasswordModal);
  elements.userScores.addEventListener("click", (event) => {
    const roleButton = event.target.closest("[data-toggle-role]");
    if (roleButton) toggleUserRole(roleButton.dataset.toggleRole);
  });
  elements.notificationList.addEventListener("click", (event) => {
    const dismissButton = event.target.closest("[data-dismiss-notification]");
    if (!dismissButton) return;
    dismissWeeklySummary(dismissButton.dataset.dismissUser, dismissButton.dataset.dismissWeek);
    renderDashboard();
  });
  elements.notificationsBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = elements.notificationsPanel.classList.toggle("hidden") === false;
    elements.notificationsBtn.setAttribute("aria-expanded", String(isOpen));
  });
  document.addEventListener("click", (event) => {
    if (elements.notificationsPanel.classList.contains("hidden")) return;
    if (event.target.closest("#notificationsPanel") || event.target.closest("#notificationsBtn")) return;
    elements.notificationsPanel.classList.add("hidden");
    elements.notificationsBtn.setAttribute("aria-expanded", "false");
  });
  elements.resetDemoBtn.addEventListener("click", resetDemoData);
  elements.projectForm.addEventListener("submit", addProject);
  elements.projectInviteForm.addEventListener("submit", addProjectInvitation);
  elements.projectMembershipList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cancel-invite]");
    if (button) cancelProjectInvitation(button.dataset.cancelInvite);
  });
  elements.cancelProjectEditBtn.addEventListener("click", resetProjectForm);
  elements.categoryForm.addEventListener("submit", addCategory);
  elements.cancelCategoryEditBtn.addEventListener("click", resetCategoryForm);
  elements.taskForm.addEventListener("submit", addTask);
  elements.quickAddForm.addEventListener("submit", handleQuickAddSubmit);
  elements.quickAddInput.addEventListener("input", renderQuickAddPreview);
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
  elements.taskSubtaskList.addEventListener("click", handleTaskActionClick);
  elements.taskSubtaskList.addEventListener("input", (event) => {
    const input = event.target.closest("[data-subtask-title]");
    if (!input) return;
    const subtask = taskDraftSubtasks.find((item) => item.id === input.dataset.subtaskTitle);
    if (subtask) subtask.title = input.value;
  });
  elements.taskSubtaskAddBtn.addEventListener("click", addSubtaskFromInput);
  elements.taskSubtaskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSubtaskFromInput();
    }
  });
  elements.taskTagChips.addEventListener("click", handleTaskActionClick);
  elements.taskTagAddBtn.addEventListener("click", addTagsFromInput);
  elements.taskTagInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTagsFromInput();
    }
  });
  elements.taskDetailBody.addEventListener("click", handleTaskActionClick);
  elements.taskDetailBody.addEventListener("click", handleDocumentAssistantClick);
  elements.taskDetailBody.addEventListener("submit", uploadTaskAttachments);
  elements.taskDetailBody.addEventListener("submit", handleDocumentAssistantSubmit);
  elements.taskDetailBody.addEventListener("change", (event) => {
    const statusSelect = event.target.closest("[data-detail-status]");
    if (statusSelect) updateTaskStatus(statusSelect.dataset.detailStatus, statusSelect.value);
    handleDocumentAssistantChange(event);
  });
  elements.taskForm.addEventListener("dragover", handleTaskAttachmentDragOver);
  elements.taskForm.addEventListener("drop", handleTaskAttachmentDrop);
  elements.taskForm.addEventListener("dragleave", handleTaskAttachmentDragLeave);

  elements.searchInput.addEventListener("input", debounce(renderTaskViews, 250));
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
  elements.taskAssigneeChips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-assignee-id]");
    if (!chip) return;
    const option = [...elements.taskAssignee.options].find((item) => item.value === chip.dataset.assigneeId);
    if (!option) return;
    option.selected = !option.selected;
    renderTaskAssigneeChips();
  });
  elements.dateScopeFilter.addEventListener("change", renderTaskViews);
  elements.statusFilter.addEventListener("change", renderTaskViews);
  elements.priorityFilter.addEventListener("change", renderTaskViews);
  elements.categoryFilter.addEventListener("change", () => {
    renderProjectFilterOptions();
    renderTaskViews();
  });
  elements.categorySearchInput.addEventListener("input", debounce(renderCategories, 250));
  elements.assigneeFilter.addEventListener("change", renderTaskViews);
  elements.projectFilter.addEventListener("change", renderTaskViews);
  elements.tagFilter.addEventListener("change", renderTaskViews);
  elements.sortFilter.addEventListener("change", renderTaskViews);
  elements.clearFiltersBtn.addEventListener("click", () => {
    resetTaskFiltersToDefaults();
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
  elements.archiveList.addEventListener("click", handleTaskActionClick);
  elements.archiveSearchInput.addEventListener("input", debounce(() => {
    archiveVisibleCount = ARCHIVE_PAGE_SIZE;
    renderArchiveView();
  }, 200));
  elements.archiveLoadMoreBtn.addEventListener("click", () => {
    archiveVisibleCount += ARCHIVE_PAGE_SIZE;
    renderArchiveView();
  });
  elements.kanbanBoard.addEventListener("dragover", handleKanbanDragOver);
  elements.kanbanBoard.addEventListener("dragleave", handleKanbanDragLeave);
  elements.kanbanBoard.addEventListener("drop", handleKanbanDrop);
  elements.calendarPrevBtn.addEventListener("click", () => shiftCalendarMonth(-1));
  elements.calendarNextBtn.addEventListener("click", () => shiftCalendarMonth(1));
  elements.calendarTodayBtn.addEventListener("click", resetCalendarToToday);
  elements.calendarExportBtn.addEventListener("click", downloadCalendarIcs);
  elements.calendarGrid.addEventListener("click", handleTaskActionClick);
  elements.calendarGrid.addEventListener("click", handleCalendarDayClick);
  elements.calendarGrid.addEventListener("dragstart", handleKanbanDragStart);
  elements.calendarGrid.addEventListener("dragend", handleKanbanDragEnd);
  elements.calendarGrid.addEventListener("dragover", handleCalendarDragOver);
  elements.calendarGrid.addEventListener("dragleave", handleCalendarDragLeave);
  elements.calendarGrid.addEventListener("drop", handleCalendarDrop);
  elements.plannerTaskList.addEventListener("click", handleTaskActionClick);
  elements.plannerNoteForm.addEventListener("submit", savePlannerNote);
  elements.plannerNoteDeleteBtn.addEventListener("click", deletePlannerNote);
  elements.taskCommentForm.addEventListener("submit", addTaskComment);
  elements.taskCommentText.addEventListener("input", renderMentionSuggestions);
  elements.taskCommentText.addEventListener("click", renderMentionSuggestions);
  elements.taskCommentText.addEventListener("keydown", handleMentionKeydown);
  elements.taskCommentText.addEventListener("blur", () => setTimeout(hideMentionSuggestions, 150));
  elements.mentionSuggestions.addEventListener("mousedown", (event) => {
    const option = event.target.closest("[data-mention-user]");
    if (!option) return;
    event.preventDefault();
    applyMentionSuggestion(option.dataset.mentionUser);
  });
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
  elements.changePasswordForm.addEventListener("submit", submitChangePassword);
  elements.closeChangePasswordModalBtn.addEventListener("click", closeChangePasswordModal);
  elements.cancelChangePasswordBtn.addEventListener("click", closeChangePasswordModal);
  elements.changePasswordModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-change-password-modal]")) {
      closeChangePasswordModal();
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
  window.addEventListener("offline", () => {
    setConnectionStatus("error", "Çevrimdışı · Değişiklikler yerelde saklanıyor");
  });
  window.addEventListener("online", () => {
    if (supabaseReady && currentSession?.userId) {
      setConnectionStatus("syncing", "Bağlantı geldi · Eşitleniyor…");
      scheduleSupabaseSync();
      startRealtimeUpdates(currentSession.userId);
    } else {
      setConnectionStatus("", "Demo mod · Yerel kayıt");
    }
  });

  document.addEventListener("keydown", (event) => {
    const openModal = getTopmostOpenModal();
    if (event.key === "Tab" && openModal) {
      trapModalFocus(event, openModal);
    } else if (event.key === "Escape" && !elements.userModal.classList.contains("hidden")) {
      event.preventDefault();
      closeUserModal();
    } else if (event.key === "Escape" && !elements.attachmentPreviewModal.classList.contains("hidden")) {
      event.preventDefault();
      closeAttachmentPreview();
    } else if (event.key === "Escape" && activeDetailTaskId) {
      event.preventDefault();
      closeTaskDetail();
    } else if (event.key === "Escape" && elements.taskForm.classList.contains("open")) {
      resetTaskForm();
    } else if (event.key === "Escape" && elements.sidebar.classList.contains("open")) {
      closeSidebar();
    } else if (event.key === "Escape" && !elements.notificationsPanel.classList.contains("hidden")) {
      elements.notificationsPanel.classList.add("hidden");
      elements.notificationsBtn.setAttribute("aria-expanded", "false");
    }
  });

  elements.projectList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-project]");
    const deleteButton = event.target.closest("[data-delete-project]");
    const addTaskButton = event.target.closest("[data-add-task-to-project]");
    const archiveButton = event.target.closest("[data-toggle-archive-project]");

    if (editButton) {
      editProject(editButton.dataset.editProject);
    }

    if (deleteButton) {
      deleteProject(deleteButton.dataset.deleteProject);
    }

    if (addTaskButton) {
      addTaskToProject(addTaskButton.dataset.addTaskToProject);
    }

    if (archiveButton) {
      toggleProjectArchived(archiveButton.dataset.toggleArchiveProject);
    }
  });
  elements.projectSearchInput.addEventListener("input", debounce(renderProjects, 250));
  elements.showArchivedProjects.addEventListener("change", renderProjects);

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

elements.taskDueDate.min = getLocalTodayValue();
bindEvents();
setTaskLayout("list");
initializeAuth();
