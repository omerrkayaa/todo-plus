import { createRequire } from "node:module";
import Module from "node:module";
import fs from "node:fs";
import path from "node:path";

process.env.NODE_PATH =
  "node_modules/.pnpm/node_modules";
Module._initPaths();

const require = createRequire(import.meta.url);
const { chromium } = require(
  "node_modules/playwright",
);

const rootDir = path.resolve("<proje-klasörü>");
const outDir = path.join(rootDir, "screenshots");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(outDir, "01-giris-ekrani.png"), fullPage: true });

await page.fill("#loginEmail", "omer@example.com");
await page.fill("#loginPassword", "123456");
await page.click("button[type='submit']");
await page.waitForSelector("#appShell:not(.hidden)");
await page.screenshot({ path: path.join(outDir, "02-istatistik-ekrani.png"), fullPage: true });

await page.click("[data-view='projects']");
await page.waitForSelector("#projectsView.active-view");
await page.screenshot({ path: path.join(outDir, "03-projeler-kategoriler.png"), fullPage: true });

await page.click("[data-view='tasks']");
await page.waitForSelector("#tasksView.active-view");
await page.screenshot({ path: path.join(outDir, "04-gorevler-ekrani.png"), fullPage: true });

await browser.close();

console.log(outDir);
