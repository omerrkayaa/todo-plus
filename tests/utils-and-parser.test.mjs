import test, { mock } from "node:test";
import assert from "node:assert/strict";

// Bu modüller tarayıcıda `window`'a kayıt olur; Node'da globalThis'i window yapıyoruz.
globalThis.window = globalThis;
await import("../app-utils.js");
await import("../app-quick-add-parser.js");
const { hashPassword, verifyPassword, deterministicId, escapeHtml, today, addDays, getDueDateMeta, isTaskOverdue, isUuid } = globalThis.TODO_PLUS_UTILS;
const { parseQuickAddText } = globalThis.TODO_PLUS_QUICK_ADD_PARSER;

test("escapeHtml tırnak ve etiketleri kaçırır (nitelik enjeksiyonu regresyonu)", () => {
  assert.equal(escapeHtml('" onmouseover="x'), "&quot; onmouseover=&quot;x");
  assert.equal(escapeHtml("<b>&'"), "&lt;b&gt;&amp;&#039;");
  assert.equal(escapeHtml(null), "");
});

test("today() yerel saati kullanır, UTC'yi değil (gece 00:30 regresyonu)", () => {
  mock.timers.enable({ apis: ["Date"], now: new Date(2026, 6, 20, 0, 30) });
  try {
    assert.equal(today(), "2026-07-20");
  } finally {
    mock.timers.reset();
  }
});

test("addDays ay ve yıl sınırını geçer", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

test("getDueDateMeta gecikme, yaklaşma ve tamamlanmayı ayırır", () => {
  mock.timers.enable({ apis: ["Date"], now: new Date(2026, 6, 20, 10, 0) });
  try {
    assert.equal(getDueDateMeta({ dueDate: "2026-07-19", status: "bekliyor" }).className, "due-overdue");
    assert.equal(getDueDateMeta({ dueDate: "2026-07-22", status: "bekliyor" }).className, "due-soon");
    assert.equal(getDueDateMeta({ dueDate: "2026-08-30", status: "bekliyor" }).className, "");
    assert.equal(getDueDateMeta({ dueDate: "2026-07-19", status: "tamamlandi" }).className, "due-complete");
    assert.equal(getDueDateMeta({ status: "bekliyor" }).label, "Tarih yok");
    assert.equal(isTaskOverdue({ dueDate: "2026-07-19", status: "bekliyor" }), true);
    assert.equal(isTaskOverdue({ dueDate: "2026-07-19", status: "tamamlandi" }), false);
  } finally {
    mock.timers.reset();
  }
});

test("isUuid geçerli ve geçersiz değerleri ayırır", () => {
  assert.equal(isUuid("00000000-0000-4000-8000-000000000001"), true);
  assert.equal(isUuid("task-1"), false);
  assert.equal(isUuid(undefined), false);
});

test("deterministicId: aynı girdi aynı UUID, farklı girdi farklı UUID, geçerli biçim", () => {
  const a = deterministicId("recurrence:task-1:2026-07-27");
  assert.equal(a, deterministicId("recurrence:task-1:2026-07-27"));
  assert.notEqual(a, deterministicId("recurrence:task-1:2026-08-03"));
  assert.notEqual(a, deterministicId("recurrence:task-2:2026-07-27"));
  assert.equal(isUuid(a), true);
  const ids = new Set(Array.from({ length: 2000 }, (_, index) => deterministicId(`seed:${index}`)));
  assert.equal(ids.size, 2000);
});

// 2026-07-20 Pazartesi
const monday = new Date(2026, 6, 20, 9, 0);

test("hızlı ekle: tüm kalıpları tek cümlede ayrıştırır", () => {
  const result = parseQuickAddText("raporu bitir yarın #Pazarlama @rapor !yüksek her hafta", monday);
  assert.equal(result.title, "raporu bitir");
  assert.equal(result.dueDate, "2026-07-21");
  assert.equal(result.projectName, "Pazarlama");
  assert.deepEqual(result.tags, ["rapor"]);
  assert.equal(result.priority, "yuksek");
  assert.equal(result.repeatInterval, "weekly");
});

test("hızlı ekle: Türkçe karakterli gün adları sınırda çalışır (\\b hatası regresyonu)", () => {
  assert.equal(parseQuickAddText("toplantı salı", monday).dueDate, "2026-07-21");
  assert.equal(parseQuickAddText("sunum çarşamba", monday).dueDate, "2026-07-22");
  assert.equal(parseQuickAddText("rapor cuma", monday).dueDate, "2026-07-24");
});

test("hızlı ekle: aynı gün adı bugünse bir sonraki haftaya atar", () => {
  assert.equal(parseQuickAddText("toplantı pazartesi", monday).dueDate, "2026-07-27");
});

test("hızlı ekle: kelime içinde geçen kalıplar eşleşmez", () => {
  const result = parseQuickAddText("yarınlara bırakma", monday);
  assert.equal(result.dueDate, "");
  assert.equal(result.title, "yarınlara bırakma");
});

test("hızlı ekle: gelecek hafta / gelecek ay / bugün", () => {
  assert.equal(parseQuickAddText("x gelecek hafta", monday).dueDate, "2026-07-27");
  assert.equal(parseQuickAddText("x gelecek ay", monday).dueDate, "2026-08-20");
  assert.equal(parseQuickAddText("x bugün", monday).dueDate, "2026-07-20");
});

test("hızlı ekle: boş giriş güvenli döner", () => {
  const result = parseQuickAddText("", monday);
  assert.equal(result.title, "");
  assert.equal(result.dueDate, "");
  assert.equal(result.priority, null);
});

test("demo şifresi hash'lenir: düz metin saklanmaz, doğru şifre doğrulanır, tuz her seferinde farklı", async () => {
  const stored = await hashPassword("gizli-123");
  assert.match(stored, /^pbkdf2-sha256\$100000\$[^$]+\$[^$]+$/);
  assert.ok(!stored.includes("gizli-123"));
  assert.equal(await verifyPassword("gizli-123", stored), true);
  assert.equal(await verifyPassword("yanlis-123", stored), false);
  assert.notEqual(await hashPassword("gizli-123"), stored);
  assert.equal(await verifyPassword("gizli-123", "123456"), false);
});
