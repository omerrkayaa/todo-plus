// Uçtan uca eşitleme/çakışma testi: sahte Supabase oturumu + REST araya girme.
// Senaryo: aynı görevin başlığı hem yerelde hem "bulutta" değişmiş →
// çakışma kartı çıkmalı, "Benimki kalsın" seçilince yerel sürüm buluta gönderilmeli.
// Yalnızca bulutta değişen ikinci görev ise kart çıkmadan kendiliğinden birleşmeli.
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const rootDir = path.resolve(import.meta.dirname, "..");
const appUrl = pathToFileURL(path.join(rootDir, "index.html")).href;

const USER_ID = "11111111-1111-4111-8111-111111111111";
const TASK_1 = "22222222-2222-4222-8222-222222222222";
const TASK_2 = "33333333-3333-4333-8333-333333333333";

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
  tasks: [localTask(TASK_1, "Yerel başlık"), localTask(TASK_2, "Görev iki")],
  assignments: [], taskGivers: [], history: [], taskComments: [],
  projectMembers: [], projectInvitations: [], calendarNotes: [],
};

const baseCollections = {
  users: [localUser], projects: [], categories: [],
  tasks: [localTask(TASK_1, "Ortak görev"), localTask(TASK_2, "Görev iki")],
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

await page.addInitScript(({ state, base, session }) => {
  // Gerçek Realtime sunucusuna bağlanılmasın diye WebSocket köreltilir.
  window.WebSocket = class {
    constructor() { setTimeout(() => this.onerror?.(new Event("error")), 0); }
    send() {} close() {}
    addEventListener() {} removeEventListener() {}
  };
  localStorage.clear();
  localStorage.setItem("todo_plus_state_v1", JSON.stringify(state));
  localStorage.setItem("todo_plus_sync_base_v1", JSON.stringify({ savedAt: "2026-07-19T09:00:00Z", collections: base }));
  localStorage.setItem("todo_plus_last_sync_v1", JSON.stringify("2026-07-19T09:00:00.000Z"));
  localStorage.setItem("sb-ftmacdltuyaxjxwodfbj-auth-token", JSON.stringify(session));
}, { state: seededState, base: baseCollections, session: fakeSession });

await page.route("**/rest/v1/**", async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  const table = url.pathname.split("/").pop();
  if (request.method() === "GET") {
    const data =
      table === "users" ? [remoteUserRow]
      : table === "tasks" ? [remoteTaskRow(TASK_1, "Bulut başlık"), remoteTaskRow(TASK_2, "Bulut düzeltmesi (oto)")]
      : [];
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(data) });
  }
  if (table === "tasks" && (request.method() === "POST" || request.method() === "PATCH")) {
    pushedTaskBodies.push(request.postData() || "");
  }
  return route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
});
await page.route("**/auth/v1/**", (route) =>
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeSession) }),
);

try {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });

  await page.locator("#appShell:not(.hidden)").waitFor({ state: "visible" });

  // 1) Çakışma kartı açılmalı ve iki sürümü yan yana göstermeli.
  await page.locator("#conflictModal:not(.hidden)").waitFor({ state: "visible" });
  const cardCount = await page.locator("#conflictList .conflict-card").count();
  if (cardCount !== 1) throw new Error(`1 çakışma kartı bekleniyordu, ${cardCount} bulundu.`);
  const mineText = await page.locator("#conflictList .conflict-value.mine").first().textContent();
  const cloudText = await page.locator("#conflictList .conflict-value.cloud").first().textContent();
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

  // 4) "Benimki kalsın" → yerel sürüm geri gelmeli ve buluta gönderilmeli.
  await page.locator("[data-conflict-choice='local']").click();
  await page.locator("#conflictModal.hidden").waitFor({ state: "attached" });
  await page.waitForFunction((taskId) => {
    const state = JSON.parse(localStorage.getItem("todo_plus_state_v1"));
    return state.tasks.find((task) => task.id === taskId)?.title === "Yerel başlık";
  }, TASK_1);
  await page.waitForTimeout(1200); // 300 ms'lik senkron zamanlayıcısı + istek için pay
  const pushed = pushedTaskBodies.some((body) => body.includes("Yerel başlık"));
  if (!pushed) throw new Error("Seçilen yerel sürüm buluta gönderilmedi (upsert yakalanamadı).");

  // 5) Görev listesinde de yerel başlık görünmeli.
  await page.locator("[data-view='tasks']").evaluate((element) => element.click());
  await page.locator("#taskList >> text=Yerel başlık").waitFor({ state: "visible" });

  console.log("Eşitleme çakışması testi başarılı: alan bazlı birleştirme + çakışma kartı + buluta geri gönderim doğrulandı.");
} finally {
  await browser.close();
}
