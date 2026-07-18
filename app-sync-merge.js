(function registerSyncMerge(global) {
  // Üç yönlü, alan bazlı birleştirme: taban (son ortak hâl) + yerel + bulut.
  // Kurallar 09-cevrimdisi-mod-adim-adim.md Adım 4'te; motor saf hesap yapar, ekrana dokunmaz.

  const collectionConfigs = Object.freeze({
    users: { table: "users", fields: ["fullName", "email", "role"], autoResolve: "remote", labelField: "fullName" },
    categories: { table: "categories", fields: ["name", "color"], labelField: "name" },
    projects: { table: "projects", fields: ["categoryId", "name", "description", "archived", "dueDate"], labelField: "name" },
    tasks: {
      table: "tasks",
      fields: ["projectId", "categoryId", "title", "description", "priority", "status", "estimatedMinutes", "dueDate", "startDate", "repeatInterval", "subtasks", "tags"],
      labelField: "title",
    },
    assignments: { table: "task_assignments", fields: ["isCompleted", "completedAt", "earnedScore"], autoResolve: "remote", labelField: "id" },
    taskGivers: { table: "task_givers", fields: [], labelField: "id" },
    history: { table: "task_history", union: true },
    taskComments: { table: "task_comments", union: true },
    projectMembers: { table: "project_members", fields: ["memberRole"], autoResolve: "remote", labelField: "id" },
    projectInvitations: { table: "project_invitations", fields: ["status", "memberRole"], autoResolve: "remote", labelField: "email" },
  });

  const fieldLabels = Object.freeze({
    projectId: "Proje", categoryId: "Kategori", title: "Başlık", name: "Ad", description: "Açıklama",
    priority: "Öncelik", status: "Durum", estimatedMinutes: "Süre (dk)", dueDate: "Son tarih",
    startDate: "Başlangıç tarihi", repeatInterval: "Tekrar", subtasks: "Alt görevler", tags: "Etiketler",
    archived: "Arşiv durumu", color: "Renk", fullName: "Ad Soyad", email: "E-posta", role: "Rol",
    isCompleted: "Tamamlanma", completedAt: "Tamamlanma tarihi", earnedScore: "Puan",
    memberRole: "Üyelik rolü",
  });

  const jsonEqual = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  const cloneValue = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value ?? null)));
  const toIndex = (rows) => new Map((Array.isArray(rows) ? rows : []).map((row) => [row.id, row]));

  function buildDeletionSets(pendingDeletions) {
    const byTable = new Map();
    (Array.isArray(pendingDeletions) ? pendingDeletions : []).forEach((item) => {
      if (!item?.tableName || !item?.rowId) return;
      if (!byTable.has(item.tableName)) byTable.set(item.tableName, new Set());
      byTable.get(item.tableName).add(item.rowId);
    });
    return byTable;
  }

  function mergeAttachments(localTask, remoteTask, deletedAttachmentIds) {
    const remoteAttachments = Array.isArray(remoteTask?.attachments) ? remoteTask.attachments : [];
    const localAttachments = Array.isArray(localTask?.attachments) ? localTask.attachments : [];
    const seen = new Set();
    const combined = [];
    [...remoteAttachments, ...localAttachments].forEach((attachment) => {
      if (!attachment?.id || seen.has(attachment.id) || deletedAttachmentIds.has(attachment.id)) return;
      seen.add(attachment.id);
      combined.push(cloneValue(attachment));
    });
    return combined;
  }

  function mergeCollections({ base, local, remote, pendingDeletions }) {
    const deletionSets = buildDeletionSets(pendingDeletions);
    const merged = {};
    const conflicts = [];
    const hasBase = Boolean(base && typeof base === "object");
    const deletedAttachmentIds = deletionSets.get("task_attachments") || new Set();

    Object.entries(collectionConfigs).forEach(([key, config]) => {
      const localRows = Array.isArray(local?.[key]) ? local[key] : [];
      const remoteRows = Array.isArray(remote?.[key]) ? remote[key] : [];
      const baseRows = hasBase && Array.isArray(base?.[key]) ? base[key] : null;
      const deletedIds = deletionSets.get(config.table) || new Set();

      if (config.union) {
        const seen = new Set();
        merged[key] = [...remoteRows, ...localRows].filter((row) => {
          if (!row?.id || seen.has(row.id) || deletedIds.has(row.id)) return false;
          seen.add(row.id);
          return true;
        }).map(cloneValue);
        return;
      }

      const localIndex = toIndex(localRows);
      const remoteIndex = toIndex(remoteRows);
      const baseIndex = baseRows ? toIndex(baseRows) : null;
      const output = [];
      const handled = new Set();

      remoteRows.forEach((remoteRow) => {
        if (!remoteRow?.id || deletedIds.has(remoteRow.id)) return;
        handled.add(remoteRow.id);
        const localRow = localIndex.get(remoteRow.id);
        if (!localRow) {
          // Yalnız bulutta: ya bulutta yeni oluşturuldu ya da yerelde silindi.
          // Yereldeki silmeler kuyruğa girer ve yükleme öncesi buluttan silinir;
          // buraya düşen satır bu yüzden "bulutta yeni" kabul edilir ve alınır.
          output.push(cloneValue(remoteRow));
          return;
        }
        const baseRow = baseIndex ? baseIndex.get(remoteRow.id) : null;
        if (!baseRow) {
          // Taban yoksa güvenli taraf buluttur (eski davranış) — çakışma üretilmez.
          output.push(cloneValue(remoteRow));
          return;
        }
        const mergedRow = cloneValue(remoteRow);
        // Bulut satırında olmayan yerel-only alanları (ör. ekler) koru.
        Object.keys(localRow).forEach((field) => {
          if (!(field in mergedRow)) mergedRow[field] = cloneValue(localRow[field]);
        });
        const conflictFields = [];
        (config.fields || []).forEach((field) => {
          const baseValue = baseRow[field];
          const localValue = localRow[field];
          const remoteValue = remoteRow[field];
          const localChanged = !jsonEqual(localValue, baseValue);
          const remoteChanged = !jsonEqual(remoteValue, baseValue);
          if (!localChanged) return; // bulut değeri zaten mergedRow'da
          if (!remoteChanged || jsonEqual(localValue, remoteValue)) {
            mergedRow[field] = cloneValue(localValue);
            return;
          }
          if (config.autoResolve === "remote") return; // sessiz çözüm: bulut kalır
          conflictFields.push({
            field,
            label: fieldLabels[field] || field,
            baseValue: cloneValue(baseValue),
            localValue: cloneValue(localValue),
            remoteValue: cloneValue(remoteValue),
          });
        });
        if (key === "tasks") {
          mergedRow.attachments = mergeAttachments(localRow, remoteRow, deletedAttachmentIds);
        }
        if (conflictFields.length > 0) {
          conflicts.push({
            collection: key,
            kind: "field",
            entityId: remoteRow.id,
            entityLabel: String(localRow[config.labelField] ?? remoteRow[config.labelField] ?? remoteRow.id),
            fields: conflictFields,
            localEntity: cloneValue(localRow),
            remoteEntity: cloneValue(remoteRow),
          });
        }
        output.push(mergedRow);
      });

      localRows.forEach((localRow) => {
        if (!localRow?.id || handled.has(localRow.id) || deletedIds.has(localRow.id)) return;
        const baseRow = baseIndex ? baseIndex.get(localRow.id) : null;
        if (!baseRow) {
          if (!hasBase) return; // taban yokken bulut kazanır (eski davranış)
          output.push(cloneValue(localRow)); // yerelde yeni oluşturuldu → korunur
          return;
        }
        // Tabanda var, bulutta yok → bulutta silinmiş.
        const localTouched = (config.fields || []).some((field) => !jsonEqual(localRow[field], baseRow[field]));
        if (localTouched && !config.autoResolve) {
          // Silinmiş vs düzenlenmiş: sessizce yok etme, karta çıkar. Varsayılan bulut (silinmiş kalır).
          conflicts.push({
            collection: key,
            kind: "edit-delete",
            entityId: localRow.id,
            entityLabel: String(localRow[config.labelField] ?? localRow.id),
            fields: [],
            localEntity: cloneValue(localRow),
            remoteEntity: null,
          });
        }
        // Bulut silmesi uygulanır (satır eklenmez).
      });

      merged[key] = output;
    });

    return { merged, conflicts };
  }

  // Çakışma kararını uygular: choice "local" → benim sürümüm, "remote" → bulut sürümü (no-op).
  function applyConflictResolution(collections, conflict, choice) {
    if (choice !== "local" || !conflict) return collections;
    const rows = collections[conflict.collection];
    if (!Array.isArray(rows)) return collections;
    if (conflict.kind === "edit-delete") {
      if (!rows.some((row) => row.id === conflict.entityId) && conflict.localEntity) {
        rows.push(cloneValue(conflict.localEntity));
      }
      return collections;
    }
    const row = rows.find((item) => item.id === conflict.entityId);
    if (!row) return collections;
    conflict.fields.forEach(({ field, localValue }) => {
      row[field] = cloneValue(localValue);
    });
    return collections;
  }

  const api = Object.freeze({ mergeCollections, applyConflictResolution, fieldLabels, collectionConfigs });
  global.TODO_PLUS_SYNC_MERGE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
