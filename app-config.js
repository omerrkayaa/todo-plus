window.TODO_PLUS_APP = Object.freeze({
  storageKeys: Object.freeze({
    state: "todo_plus_state_v1",
    accounts: "todo_plus_auth_accounts_v1",
    session: "todo_plus_session_v1",
    deletionQueue: "todo_plus_pending_deletions_v1",
  }),
  priorityScores: Object.freeze({ dusuk: 1, orta: 2, yuksek: 3 }),
  priorityLabels: Object.freeze({ dusuk: "Düşük", orta: "Orta", yuksek: "Yüksek" }),
  statusLabels: Object.freeze({
    bekliyor: "Bekliyor",
    devam_ediyor: "Devam ediyor",
    tamamlandi: "Tamamlandı",
  }),
  roleLabels: Object.freeze({ admin: "Yönetici", user: "Kullanıcı" }),
  documentAssistantApiUrl: "http://127.0.0.1:3000/api",
});
