import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const rootDir = path.resolve(import.meta.dirname, "..");
const appUrl = pathToFileURL(path.join(rootDir, "index.html")).href;
const runtimeErrors = [];

page.on("pageerror", (error) => runtimeErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
    runtimeErrors.push(message.text());
  }
});

const expectVisible = async (selector, label) => {
  const locator = page.locator(selector);
  await locator.waitFor({ state: "visible" });
  if (!(await locator.isVisible())) throw new Error(`${label} görünür değil.`);
};

try {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  await page.fill("#loginEmail", "omer@example.com");
  await page.fill("#loginPassword", "123456");
  await page.click("#loginForm button[type='submit']");
  await expectVisible("#appShell:not(.hidden)", "Uygulama");
  await expectVisible("#workloadInsights .workload-card:first-child", "Yönetici iş yükü analizi");
  await expectVisible("#assignmentRecommendation", "Görev atama önerisi");
  await page.click("[data-dashboard-tab='analytics']");
  await expectVisible("[data-dashboard-panel='analytics']:not(.hidden)", "Analitik bölümü");
  await page.click("[data-dashboard-tab='history']");
  await expectVisible("[data-dashboard-panel='history']:not(.hidden)", "Geçmiş bölümü");
  await page.click("[data-dashboard-tab='overview']");
  await expectVisible("[data-dashboard-panel='overview']:not(.hidden)", "Genel bakış bölümü");
  const ayseScoreCard = page.locator("#userScores .score-card", { hasText: "Ayşe Demir" });
  await ayseScoreCard.locator("[data-toggle-role]").click();
  await expectVisible("#userScores .score-card >> text=Ayşe Demir", "Rolü değiştirilen ekip üyesi");
  if (!(await ayseScoreCard.locator("[data-toggle-role]").textContent()).includes("Kullanıcı rolüne al")) {
    throw new Error("Kullanıcı yönetici rolüne geçirilemedi.");
  }
  await ayseScoreCard.locator("[data-toggle-role]").click();

  await page.click("[data-view='projects']");
  await page.fill("#categoryName", "Smoke Kategori");
  await page.click("#categorySubmitBtn");
  await expectVisible("#categoryList >> text=Smoke Kategori", "Yeni kategori");

  await page.fill("#projectName", "Smoke Test Projesi");
  await page.fill("#projectDescription", "Otomatik test projesi");
  await page.selectOption("#projectCategory", { label: "Smoke Kategori" });
  await page.click("#projectSubmitBtn");
  await expectVisible("#projectList >> text=Smoke Test Projesi", "Yeni proje");

  await page.click("[data-view='tasks']");
  await page.click("#newTaskBtn");
  await expectVisible("#taskForm.open", "Görev oluşturma çekmecesi");
  await page.fill("#taskTitle", "Smoke Test Görevi");
  await page.selectOption("#taskAssignee", { label: "Ayşe Demir" });
  await page.click("#taskDetailsToggle");
  await expectVisible("#taskAdvancedFields:not(.hidden)", "Görev detay alanları");
  await page.fill("#taskDescription", "Otomatik doğrulama görevi");
  await page.selectOption("#taskProject", { label: "Smoke Test Projesi" });
  await page.selectOption("#taskCategory", { label: "Smoke Kategori" });
  await page.selectOption("#taskPriority", "yuksek");
  const giverChip = page.locator("#taskGiverChips [data-giver-id]", { hasText: "Ayşe Demir" });
  await giverChip.click();
  if ((await giverChip.getAttribute("aria-pressed")) !== "true") {
    throw new Error("Görevi veren kişi chip seçimi çalışmadı.");
  }
  await page.click("#taskSubmitBtn");
  await page.locator("#taskForm.open").waitFor({ state: "hidden" });
  await expectVisible("#taskList >> text=Smoke Test Görevi", "Yeni görev");

  await page.click("#filterToggleBtn");
  await expectVisible("#advancedFilters:not(.hidden)", "Gelişmiş filtreler");
  await page.selectOption("#categoryFilter", { label: "Smoke Kategori" });
  await page.selectOption("#projectFilter", { label: "Smoke Test Projesi" });
  await page.selectOption("#priorityFilter", "yuksek");
  await page.selectOption("#statusFilter", "bekliyor");
  if ((await page.locator("#activeFilterCount").textContent()) !== "4") {
    throw new Error("Aktif filtre sayacı doğru güncellenmedi.");
  }
  const combinedCards = page.locator("#taskList .task-card");
  if ((await combinedCards.count()) !== 1 || !(await combinedCards.first().textContent()).includes("Smoke Test Görevi")) {
    throw new Error("Kategori + proje + öncelik + durum filtreleri AND mantığıyla çalışmadı.");
  }
  await page.selectOption("#priorityFilter", "dusuk");
  await expectVisible("#taskList >> text=Aradığın görev bulunamadı.", "Boş filtre sonucu");
  await page.click("#clearFiltersBtn");

  await page.fill("#searchInput", "Smoke Test Görevi");
  if ((await page.locator("#taskList .task-card").count()) !== 1) {
    throw new Error("Arama filtresi beklenen tek görevi döndürmedi.");
  }
  await page.click("#clearFiltersBtn");

  await page.click("#filterToggleBtn");
  await page.selectOption("#priorityFilter", "dusuk");
  const lowPriorityCards = page.locator("#taskList .task-card");
  if ((await lowPriorityCards.count()) === 0) throw new Error("Düşük öncelik filtresi sonuç döndürmedi.");
  for (let index = 0; index < (await lowPriorityCards.count()); index += 1) {
    if (!(await lowPriorityCards.nth(index).locator(".priority-dusuk").count())) {
      throw new Error("Düşük öncelik filtresi başka öncelikte görev gösterdi.");
    }
  }
  await page.selectOption("#statusFilter", "devam_ediyor");
  const combinedLowInProgress = page.locator("#taskList .task-card");
  for (let index = 0; index < (await combinedLowInProgress.count()); index += 1) {
    const card = combinedLowInProgress.nth(index);
    if (!(await card.locator(".priority-dusuk").count()) || !(await card.locator(".status-dot-devam_ediyor").count())) {
      throw new Error("Öncelik ve durum filtreleri AND mantığıyla birleşmedi.");
    }
  }
  await page.fill("#searchInput", "Dişli");
  if ((await page.locator("#taskList .task-card").count()) !== 1) {
    throw new Error("Arama, öncelik ve durum filtreleriyle birlikte çalışmadı.");
  }
  await page.click("#clearFiltersBtn");
  if ((await page.inputValue("#searchInput")) || (await page.inputValue("#priorityFilter")) !== "all" ||
      (await page.inputValue("#statusFilter")) !== "all" || (await page.inputValue("#categoryFilter")) !== "all" ||
      (await page.inputValue("#projectFilter")) !== "all" || (await page.inputValue("#assigneeFilter")) !== "all") {
    throw new Error("Filtreleri temizle tüm filtreleri sıfırlamadı.");
  }

  const taskCard = page.locator("#taskList .task-card", { hasText: "Smoke Test Görevi" });
  await taskCard.locator("[data-detail-task]").click();
  await expectVisible("#taskDetailModal:not(.hidden)", "Görev detayı");
  await page.fill("#taskCommentText", "Smoke test yorumu");
  await page.click("#taskCommentForm button[type='submit']");
  await expectVisible("#taskDetailBody >> text=Smoke test yorumu", "Yeni yorum");
  await page.selectOption("[data-detail-status]", "devam_ediyor");
  await expectVisible("#taskDetailBody .status-devam_ediyor", "Modal içi hızlı durum değişikliği");
  await page.click("#closeTaskDetailBtn");

  await taskCard.locator("[data-status-task]").click();
  await taskCard.locator(".task-status-dot.status-dot-tamamlandi").waitFor({ state: "visible" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.click("#menuToggleBtn");
  await expectVisible("#sidebar.open", "Mobil menü");
  await page.locator("#newTaskBtn").evaluate((button) => button.click());
  await page.locator("#sidebar.open").waitFor({ state: "hidden" });
  await expectVisible("#taskForm.open", "Mobil görev çekmecesi");
  await page.click("#closeTaskDrawerBtn");
  await page.click("#menuToggleBtn");
  await expectVisible("#sidebar.open", "Mobil menü yeniden açıldı");
  await page.click("#sidebarBackdrop");
  await page.locator("#sidebar.open").waitFor({ state: "hidden" });

  await page.click("#menuToggleBtn");
  await expectVisible("#sidebar.open", "Çıkış için mobil menü");
  await page.click("#logoutBtn");
  await page.click("#showRegisterBtn");
  await page.fill("#registerName", "Test Kullanıcısı");
  await page.fill("#registerEmail", "kullanici@example.com");
  await page.fill("#registerPassword", "123456");
  await page.click("#registerForm button[type='submit']");
  await expectVisible("#appShell.user-panel", "Kullanıcı paneli");
  await expectVisible("#navRoleLabel >> text=KULLANICI PANELİ", "Kullanıcı paneli etiketi");
  if (await page.locator("[data-view='projects']").isVisible()) {
    throw new Error("Proje yönetimi normal kullanıcıya görünmemeli.");
  }
  if (await page.locator("#newTaskBtn").isVisible()) {
    throw new Error("Görev oluşturma normal kullanıcıya görünmemeli.");
  }
  if (await page.locator(".manager-analytics").isVisible()) {
    throw new Error("Ekip analizi normal kullanıcıya görünmemeli.");
  }

  if (runtimeErrors.length) {
    throw new Error(`Tarayıcı hataları: ${runtimeErrors.join(" | ")}`);
  }

  console.log("Smoke test başarılı: rol panelleri ve yönetici analizi dahil 12 temel akış doğrulandı.");
} finally {
  await browser.close();
}
