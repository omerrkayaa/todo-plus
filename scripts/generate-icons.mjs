// PWA simgelerini (192/512 PNG) icons/logo.svg'den Playwright ile üretir: node scripts/generate-icons.mjs
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "icons");
await mkdir(outDir, { recursive: true });

// Kaynak logo icons/logo.svg; PNG'ler ondan istenen boyutta çizilir.
const logo = await readFile(join(outDir, "logo.svg"), "utf8");
const svg = (size) => logo.replace("<svg ", `<svg width="${size}" height="${size}" `);

const browser = await chromium.launch({ headless: true }).catch((error) => {
  if (!String(error?.message).includes("Executable doesn't exist")) throw error;
  return chromium.launch({ headless: true, channel: "chrome" });
});
try {
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<body style="margin:0">${svg(size)}</body>`);
    await page.screenshot({ path: join(outDir, `icon-${size}.png`), omitBackground: true });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("Simgeler oluşturuldu:", outDir);
