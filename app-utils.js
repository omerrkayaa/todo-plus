(function registerTodoPlusUtilities(global) {
  function createId() {
    if (global.crypto?.randomUUID) return global.crypto.randomUUID();
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
      (Number(char) ^ (((global.crypto?.getRandomValues?.(new Uint8Array(1))[0] ?? Math.floor(Math.random() * 256)) & (15 >> (Number(char) / 4))))).toString(16),
    );
  }

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function addDays(dateStr, days) {
    const date = new Date(`${dateStr}T12:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function formatDate(value) {
    if (!value) return "Tarih yok";
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
  }

  function getDueDateMeta(task) {
    if (!task.dueDate) return { label: "Tarih yok", className: "" };
    if (task.status === "tamamlandi") return { label: formatDate(task.dueDate), className: "due-complete" };
    const remainingDays = Math.ceil((new Date(`${task.dueDate}T12:00:00`) - new Date(`${today()}T12:00:00`)) / 86400000);
    if (remainingDays < 0) return { label: `${formatDate(task.dueDate)} - gecikti`, className: "due-overdue" };
    if (remainingDays <= 2) return { label: `${formatDate(task.dueDate)} - yaklaşıyor`, className: "due-soon" };
    return { label: formatDate(task.dueDate), className: "" };
  }

  function isTaskOverdue(task) {
    return Boolean(task.dueDate && task.status !== "tamamlandi" && new Date(`${task.dueDate}T12:00:00`) < new Date(`${today()}T12:00:00`));
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function formatFileSize(bytes) {
    const size = Number(bytes) || 0;
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${Math.round(size / 102.4) / 10} KB`;
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
    return { Görsel: "Görseller", PDF: "PDF'ler", Tablo: "Tablolar", Belge: "Belgeler" }[getAttachmentLabel(attachment)] || "Diğer ekler";
  }

  function getAttachmentGroupIcon(attachment) {
    return { Görsel: "🖼", PDF: "PDF", Tablo: "▦", Belge: "DOC" }[getAttachmentLabel(attachment)] || "📎";
  }

  global.TODO_PLUS_UTILS = Object.freeze({ createId, escapeHtml, today, addDays, formatDate, getDueDateMeta, isTaskOverdue, isUuid, formatFileSize, readFileAsDataURL, getAttachmentLabel, getAttachmentGroupLabel, getAttachmentGroupIcon });
})(window);
