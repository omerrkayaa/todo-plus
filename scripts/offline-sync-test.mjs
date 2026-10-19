// Uçtan uca eşitleme/çakışma testi: sahte Supabase oturumu + REST araya girme.
// Sahte bulut durumludur: gönderilen upsert'ler sonraki GET'lere yansır (gerçek PostgREST gibi).
// Kapsam: süresi dolmuş oturum (401 → yenile → tekrar dene), çakışma kartları,
// otomatik birleşme, çevrimdışı kalıcılık ve yeniden bağlanınca önce çek-birleştir-sonra gönder.
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const rootDir = path.resolve(import.meta.dirname, "..");
const appUrl = pathToFileURL(path.join(rootDir, "index.html")).href;

const USER_ID = "11111111-1111-4111-8111-111111111111";
const TASK_1 = "22222222-2222-4222-8222-222222222222";
const TASK_2 = "33333333-3333-4333-8333-333333333333";
const TASK_3 = "44444444-4444-4444-8444-444444444444";

const localTask = (id, title) => ({
  id, projectId: "", categoryId: "", createdBy: USER_ID, title, description: "",
  priority: "orta", status: "bekliyor", estimatedMinutes: 30, dueDate: "", startDate: "",
  repeatInterval: "none", subtasks: [], tags: [], attachments: [],
  createdAt: "2026-07-18", updatedAt: "2026-07-18",
});

const remoteTaskRow = (id, title) => ({
  id, project_id: null, category_id: null, created_by: USER_ID, title, description: "",
  priority: "orta", status: "bekliyor", estimated_minutes: 30, due_date: null, start_date: null,
  repeat_interval: "none", subtasks: [], tags: [],
  created_at: "2026-07-18", updated_at: "2026-07-19",
});

const localUser = { id: USER_ID, fullName: "Test Yönetici", email: "test@example.com", role: "admin" };
const remoteUserRow = { id: USER_ID, full_name: "Test Yönetici", email: "test@example.com", role: "admin" };

const seededState = {
  activeUserId: USER_ID,
  users: [localUser],
  projects: [], categories: [],
  tasks: [localTask(TASK_1, "Yerel başlık"), localTask(TASK_2, "Görev iki"), localTask(TASK_3, "Yerel üçüncü")],
  assignments: [], taskGivers: [], history: [], taskComments: [],
  projectMembers: [], projectInvitations: [], calendarNotes: [],
};

const baseCollections = {
  users: [localUser], projects: [], categories: [],
  tasks: [localTask(TASK_1, "Ortak görev"), localTask(TASK_2, "Görev iki"), localTask(TASK_3, "Üçüncü görev")],
  assignments: [], taskGivers: [], history: [], taskComments: [],
  projectMembers: [], projectInvitations: [],
};

const fakeSession = {
  access_token: "fake-access-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 9999999,
  refresh_token: "fake-refresh-token",
  user: {
    id: USER_ID, aud: "authenticated", role: "authenticated", email: "test@example.com",
    user_metadata: { full_name: "Test Yönetici", role: "admin" }, app_metadata: {},
    created_at: "2026-07-18T00:00:00Z",
  },
};

const launchBrowser = async () => {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    if (!String(error?.message).includes("Executable doesn't exist")) throw error;
    return chromium.launch({ headless: true, channel: "chrome" });
  }
};

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(15000);

const pushedTaskBodies = [];
let jwtRejectionsServed = 0;
let refreshTokenCalls = 0;

const cloudTasks = new Map([
  [TASK_1, remoteTaskRow(TASK_1, "Bulut başlık")],
  [TASK_2, remoteTaskRow(TASK_2, "Bulut düzeltmesi (oto)")],
  [TASK_3, remoteTaskRow(TASK_3, "Bulut üçüncü")],
]);

await page.addInitScript(({ state, base, session }) => {
  // Gerçek Realtime sunucusuna bağlanılmasın diye WebSocket köreltilir.
  window.WebSocket = class {
    constructor() { setTimeout(() => this.onerror?.(new Event("error")), 0); }
    send() {} close() {}
    addEventListener() {} removeEventListener() {}
  };
  if (localStorage.getItem("__offline_test_seeded")) return; // yeniden yüklemede veriyi sıfırlama
  localStorage.clear();
  localStorage.setItem("__offline_test_seeded", "1");
  localStorage.setItem("todo_plus_state_v1", JSON.stringify(state));
  localStorage.setItem("todo_plus_sync_base_v1", JSON.stringify({ savedAt: "2026-07-19T09:00:00Z", collections: base }));
  localStorage.setItem("todo_plus_last_sync_v1", JSON.stringify("2026-07-19T09:00:00.000Z"));
  localStorage.setItem("sb-ftmacdltuyaxjxwodfbj-auth-token", JSON.stringify(session));
}, { state: seededState, base: baseCollections, session: fakeSession });

await page.route("**/rest/v1/**", async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  const table = url.pathname.split("/").pop();
  // Gerçek olaydaki gibi: ilk task_comments isteği "JWT expired" (401) ile reddedilir;
  // uygulama oturumu yenileyip yüklemeyi bir kez daha denemeli.
  if (table === "task_comments" && request.method() === "GET" && jwtRejectionsServed === 0) {
    jwtRejectionsServed += 1;
    return route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ code: "PGRST301", message: "JWT expired", details: null, hint: null }),
    });
  }
  if (request.method() === "GET") {
    const data =
      table === "users" ? [remoteUserRow]
      : table === "tasks" ? [...cloudTasks.values()]
      : [];
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(data) });
  }
  if (table === "tasks" && (request.method() === "POST" || request.method() === "PATCH")) {
    const body = request.postData() || "";
    pushedTaskBodies.push(body);
    try {
      const rows = JSON.parse(body);
      (Array.isArray(rows) ? rows : [rows]).forEach((row) => {
        if (row?.id) cloudTasks.set(row.id, { ...cloudTasks.get(row.id), ...row });
      });
    } catch { /* gövde JSON değilse sahte bulut durumu değişmez */ }
  }
  return route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
});
await page.route("**/auth/v1/**", (route) => {
  if (route.request().url().includes("grant_type=refresh_token")) refreshTokenCalls += 1;
  return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeSession) });
});

try {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });

  await page.locator("#appShell:not(.hidden)").waitFor({ state: "visible" });

  // 1) Süresi dolmuş oturum: 401 servis edildi, oturum yenilendi, yükleme yine tamamlandı
  //    ve iki çakışma kartı sürümleri yan yana gösterdi.
  await page.locator("#conflictModal:not(.hidden)").waitFor({ state: "visible" });
  if (jwtRejectionsServed !== 1) throw new Error("Test kurgusu bozuk: 401 cevabı hiç servis edilmedi.");
  if (refreshTokenCalls < 1) throw new Error("401 sonrası oturum yenileme (refresh_token) çağrısı yapılmadı.");
  const cardCount = await page.locator("#conflictList .conflict-card").count();
  if (cardCount !== 2) throw new Error(`2 çakışma kartı bekleniyordu, ${cardCount} bulundu.`);
  const firstCard = page.locator("#conflictList .conflict-card", { hasText: "Yerel başlık" });
  const mineText = await firstCard.locator(".conflict-value.mine").textContent();
  const cloudText = await firstCard.locator(".conflict-value.cloud").textContent();
  if (!mineText.includes("Yerel başlık")) throw new Error(`Kartta yerel sürüm görünmüyor: "${mineText}"`);
  if (!cloudText.includes("Bulut başlık")) throw new Error(`Kartta bulut sürümü görünmüyor: "${cloudText}"`);

  // 2) Karar verilene kadar birleşik veride bulut sürümü geçerli olmalı.
  const interimTitle = await page.evaluate((taskId) => {
    const state = JSON.parse(localStorage.getItem("todo_plus_state_v1"));
    return state.tasks.find((task) => task.id === taskId)?.title;
  }, TASK_1);
  if (interimTitle !== "Bulut başlık") throw new Error(`Karar öncesi bulut sürümü bekleniyordu, "${interimTitle}" bulundu.`);

  // 3) Yalnızca bulutta değişen görev kart çıkarmadan kendiliğinden birleşmeli.
  const autoMergedTitle = await page.evaluate((taskId) => {
    const state = JSON.parse(localStorage.getItem("todo_plus_state_v1"));
    return state.tasks.find((task) => task.id === taskId)?.title;
  }, TASK_2);
  if (autoMergedTitle !== "Bulut düzeltmesi (oto)") {
    throw new Error(`Otomatik birleşme çalışmadı: "${autoMergedTitle}"`);
  }

  // 4) İlk kartta "Benimki kalsın" → yerel sürüm geri gelmeli ve buluta gönderilmeli.
  await firstCard.locator("[data-conflict-choice='local']").click();
  await page.waitForFunction((taskId) => {
    const state = JSON.parse(localStorage.getItem("todo_plus_state_v1"));
    return state.tasks.find((task) => task.id === taskId)?.title === "Yerel başlık";
  }, TASK_1);

  // 4b) Kalan kartta "Buluttaki kalsın" → bulut sürümü kalmalı, yerel sürüm geçmişe not düşülmeli.
  const secondCard = page.locator("#conflictList .conflict-card", { hasText: "Yerel üçüncü" });
  await secondCard.locator("[data-conflict-choice='remote']").click();
  await page.locator("#conflictModal.hidden").waitFor({ state: "attached" });
  const remoteChoiceResult = await page.evaluate((taskId) => {
    const state = JSON.parse(localStorage.getItem("todo_plus_state_v1"));
    return {
      title: state.tasks.find((task) => task.id === taskId)?.title,
      historyNote: state.history.find((item) => item.taskId === taskId && item.note.includes("Eşitleme çakışması"))?.note || "",
    };
  }, TASK_3);
  if (remoteChoiceResult.title !== "Bulut üçüncü") {
    throw new Error(`"Buluttaki kalsın" sonrası bulut sürümü bekleniyordu: "${remoteChoiceResult.title}"`);
  }
  if (!remoteChoiceResult.historyNote.includes("Yerel üçüncü")) {
    throw new Error("Yerel sürüm görev geçmişine not düşülmedi.");
  }
  await page.waitForTimeout(1200); // 300 ms'lik senkron zamanlayıcısı + istek için pay
  const pushed = pushedTaskBodies.some((body) => body.includes("Yerel başlık"));
  if (!pushed) throw new Error("Seçilen yerel sürüm buluta gönderilmedi (upsert yakalanamadı).");

  // 5) Görev listesinde de yerel başlık görünmeli.
  await page.locator("[data-view='tasks']").evaluate((element) => element.click());
  await page.locator("#taskList >> text=Yerel başlık").waitFor({ state: "visible" });

  // --- Çevrimdışı döngü: kes → değiştir → çevrimdışı yenile → bağlan → buluta gitsin ---

  // 6) Bağlantı kesilince rozet son eşitleme saatiyle "Çevrimdışı" demeli.
  await page.context().setOffline(true);
  await page.waitForFunction(() =>
    document.querySelector("#connectionStatus")?.textContent.startsWith("Çevrimdışı"));

  // 7) Çevrimdışı değişiklik: görevi tamamla → "cihazında saklandı" bilgisi görünmeli.
  pushedTaskBodies.length = 0;
  const offlineCard = page.locator("#taskList .task-card", { hasText: "Yerel başlık" });
  await offlineCard.locator("[data-status-task]").click();
  // Alt görev/yorum/dosyası olmayan görev tamamlanırken uygulama içi onay penceresi açılır; onayla.
  await page.click("#confirmOkBtn");
  await page.waitForFunction(() =>
    document.querySelector("#toastRegion")?.textContent.includes("cihazında saklandı"));

  // 8) Çevrimdışıyken sayfa yenilense bile değişiklik durmalı, uygulama Supabase modunda kalmalı.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#appShell:not(.hidden)").waitFor({ state: "visible" });
  await page.waitForFunction(() =>
    document.querySelector("#connectionStatus")?.textContent.startsWith("Çevrimdışı"));
  const persistedStatus = await page.evaluate((taskId) => {
    const state = JSON.parse(localStorage.getItem("todo_plus_state_v1"));
    return state.tasks.find((task) => task.id === taskId)?.status;
  }, TASK_1);
  if (persistedStatus !== "tamamlandi") {
    throw new Error(`Çevrimdışı değişiklik yenilemede kayboldu (durum: "${persistedStatus}").`);
  }
  if (pushedTaskBodies.length > 0) throw new Error("Çevrimdışıyken buluta istek gitmemeliydi.");

  // 9) Bağlantı gelince önce bulut çekilip birleştirilmeli, sonra bekleyen değişiklik
  //    gönderilmeli: gövdede hem korunan başlık hem çevrimdışı yapılan durum birlikte olmalı.
  await page.context().setOffline(false);
  await page.waitForFunction(() => navigator.onLine);
  const reconnectDeadline = Date.now() + 8000;
  let syncedAfterReconnect = false;
  while (!syncedAfterReconnect && Date.now() < reconnectDeadline) {
    syncedAfterReconnect = pushedTaskBodies.some(
      (body) => body.includes("Yerel başlık") && body.includes("tamamlandi"),
    );
    if (!syncedAfterReconnect) await page.waitForTimeout(200);
  }
  if (!syncedAfterReconnect) throw new Error("Bağlantı gelince çevrimdışı değişiklik buluta gönderilmedi.");

  console.log("Eşitleme testi başarılı: süresi dolmuş oturum yenileme (401), alan bazlı birleştirme, çakışma kartı, çevrimdışı kalıcılık ve yeniden bağlanınca çek-birleştir-gönder doğrulandı.");
} finally {
  await browser.close();
}
