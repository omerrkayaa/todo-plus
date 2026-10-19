window.TODO_PLUS_APP = Object.freeze({
  storageKeys: Object.freeze({
    state: "todo_plus_state_v1",
    accounts: "todo_plus_auth_accounts_v1",
    session: "todo_plus_session_v1",
    deletionQueue: "todo_plus_pending_deletions_v1",
    lastSync: "todo_plus_last_sync_v1",
    syncBase: "todo_plus_sync_base_v1",
    theme: "todo_plus_theme_v1",
    sidebarCollapsed: "todo_plus_sidebar_collapsed_v1",
  }),
  priorityScores: Object.freeze({ dusuk: 1, orta: 2, yuksek: 3 }),
  priorityLabels: Object.freeze({ dusuk: "Düşük", orta: "Orta", yuksek: "Yüksek" }),
  statusLabels: Object.freeze({
    bekliyor: "Yapılacak",
    tamamlandi: "Tamamlandı",
  }),
  roleLabels: Object.freeze({ admin: "Yönetici", user: "Kullanıcı" }),
  repeatIntervalLabels: Object.freeze({ none: "Tekrar yok", daily: "Her gün", weekly: "Her hafta", monthly: "Her ay" }),
  // Canlıda supabase-config.js içine `assistantApiUrl: "https://<sunucu>/api"` eklenerek değiştirilir.
  documentAssistantApiUrl: window.TODO_PLUS_SUPABASE?.assistantApiUrl || "http://127.0.0.1:3000/api",
});
