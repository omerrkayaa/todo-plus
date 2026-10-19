(function registerTodoPlusUtilities(global) {
  function createId() {
    if (global.crypto?.randomUUID) return global.crypto.randomUUID();
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
      (Number(char) ^ (((global.crypto?.getRandomValues?.(new Uint8Array(1))[0] ?? Math.floor(Math.random() * 256)) & (15 >> (Number(char) / 4))))).toString(16),
    );
  }

  // Aynı girdiden hep aynı UUID biçimli kimliği üretir (kriptografik değildir). Tekrarlayan görev
  // örneklerinde iki cihaz/sekme aynı görevi tamamlasa bile aynı satırı üretsin, çift kayıt oluşmasın diye.
  function deterministicId(seed) {
    const input = String(seed);
    const hex = [0x811c9dc5, 0x01000193, 0x9e3779b9, 0x85ebca6b]
      .map((offset) => {
        let hash = offset >>> 0;
        for (let index = 0; index < input.length; index += 1) {
          hash ^= input.charCodeAt(index);
          hash = Math.imul(hash, 16777619) >>> 0;
          hash ^= hash >>> 15;
        }
        return (hash >>> 0).toString(16).padStart(8, "0");
      })
      .join("");
    const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
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

  // Demo modunda şifreler tarayıcıda düz metin durmasın diye PBKDF2-SHA256 ile hash'lenir
  // (Web Crypto API). Biçim: "pbkdf2-sha256$<tur>$<tuz>$<özet>", tuz ve özet base64.
  const PASSWORD_HASH_ITERATIONS = 100000;
  const toBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const fromBase64 = (text) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

  async function derivePasswordBits(password, salt, iterations) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  }

  async function hashPassword(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const bits = await derivePasswordBits(password, salt, PASSWORD_HASH_ITERATIONS);
    return `pbkdf2-sha256$${PASSWORD_HASH_ITERATIONS}$${toBase64(salt)}$${toBase64(bits)}`;
  }

  async function verifyPassword(password, storedHash) {
    const [scheme, iterations, salt, expected] = String(storedHash || "").split("$");
    if (scheme !== "pbkdf2-sha256" || !salt || !expected) return false;
    const bits = await derivePasswordBits(password, fromBase64(salt), Number(iterations));
    return toBase64(bits) === expected;
  }

  global.TODO_PLUS_UTILS = Object.freeze({ hashPassword, verifyPassword, createId, deterministicId, escapeHtml, today, addDays, formatDate, getDueDateMeta, isTaskOverdue, isUuid, formatFileSize, readFileAsDataURL, getAttachmentLabel, getAttachmentGroupLabel, getAttachmentGroupIcon });
})(window);
