import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const rootDir = path.resolve(import.meta.dirname, "..");
const outDir = path.join(rootDir, "screenshots");
const appUrl = pathToFileURL(path.join(rootDir, "index.html")).href;
fs.mkdirSync(outDir, { recursive: true });

const launchBrowser = async () => {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    if (!String(error?.message).includes("Executable doesn't exist")) throw error;
    return chromium.launch({ headless: true, channel: "chrome" });
  }
};
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
// Görüntüler demo verisiyle alınsın: Supabase yapılandırmasını etkisizleştir (gerçek girişe düşmesin).
await page.addInitScript(() => {
  Object.defineProperty(window, "TODO_PLUS_SUPABASE", { value: null, writable: false, configurable: false });
});

await page.goto(appUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(outDir, "01-giris-ekrani.png") });

await page.fill("#loginEmail", "omer@example.com");
await page.fill("#loginPassword", "123456");
await page.click("button[type='submit']");
await page.waitForSelector("#appShell:not(.hidden)");
// Geçici bildirimler (ör. "son 1 gün kaldı" uyarısı) ekranın bir kısmını kapatmasın.
await page.addStyleTag({ content: "#toastRegion, #undoToastRegion { display: none !important; }" });
await page.screenshot({ path: path.join(outDir, "02-istatistik-ekrani.png") });

await page.click("[data-dashboard-tab='history']");
await page.waitForSelector("[data-dashboard-panel='history']:not(.hidden)");
await page.screenshot({ path: path.join(outDir, "11-gecmis-ekrani.png") });
await page.click("[data-dashboard-tab='overview']");

await page.click("[data-view='projects']");
await page.waitForSelector("#projectsView.active-view");
await page.screenshot({ path: path.join(outDir, "03-projeler-kategoriler.png") });
await page.locator("#projectInviteForm").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(outDir, "12-proje-uyelikleri.png") });

await page.click("[data-view='tasks']");
await page.waitForSelector("#tasksView.active-view");
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(outDir, "04-gorevler-ekrani.png") });

await page.click("[data-task-layout='board']");
await page.waitForSelector("[data-task-layout-panel='board']:not(.hidden)");
await page.screenshot({ path: path.join(outDir, "06-kanban-panosu.png") });

await page.click("#newTaskBtn");
await page.waitForSelector("#taskForm.open");
await page.waitForFunction(() => {
  const element = document.querySelector("#taskForm");
  const rect = element.getBoundingClientRect();
  return Math.abs(rect.right - window.innerWidth) < 2;
});
await page.screenshot({ path: path.join(outDir, "07-gorev-cekmece-formu.png") });
await page.click("#closeTaskDrawerBtn");
await page.waitForSelector("#taskForm:not(.open)");
await page.click("[data-task-layout='list']");

await page.click("#taskList [data-detail-task]");
await page.waitForSelector("#taskDetailModal:not(.hidden)");
await page.screenshot({ path: path.join(outDir, "05-gorev-detayi-yorumlar.png") });
await page.click("#closeTaskDetailBtn");
await page.locator("#taskDetailModal").waitFor({ state: "hidden" });

await page.click("[data-view='dashboard']");
await page.waitForSelector("#dashboardView.active-view");
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(outDir, "08-mobil-genel-bakis.png") });
await page.click("#menuToggleBtn");
await page.waitForSelector("#sidebar.open");
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(outDir, "09-mobil-yan-menu.png") });
await page.click("#sidebarBackdrop", { position: { x: 340, y: 120 } });
await page.waitForSelector("#sidebar:not(.open)");

await browser.close();

console.log(outDir);
