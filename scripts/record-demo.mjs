/**
 * Graba un demo de ~40s del prototipo Deuna FINS.
 * Requiere: pnpm dev / npm run dev (usa DEMO_URL, default http://localhost:5174)
 */
import { chromium, devices } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "demos");
const BASE = process.env.DEMO_URL || "http://localhost:5174";

fs.mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function dismissOverlays(page) {
  await page.keyboard.press("Escape");
  await sleep(300);
  await page.keyboard.press("Escape");
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 390, height: 844 },
    },
    locale: "es-EC",
  });

  const page = await context.newPage();

  const go = async (route, ms = 5000) => {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await sleep(ms);
  };

  try {
    // 1. Inicio personal (~6s)
    await go("/", 2500);
    await page.getByRole("button", { name: /Veci \(Negocio\)/i }).click({ timeout: 3000 }).catch(() => {});
    await sleep(2000);
    await page.getByRole("button", { name: /Juan \(Usuario\)/i }).click();
    await sleep(1500);
    await page.getByText("dame chance", { exact: false }).first().click({ force: true, timeout: 3000 }).catch(() => {});
    await sleep(2000);
    await dismissOverlays(page);

    // 2. Beneficios: cofre + ruleta (~10s)
    await go("/beneficios", 1500);
    await page.locator("text=TOCA PARA RECLAMAR").click({ force: true, timeout: 5000 }).catch(() => {});
    await sleep(3000);
    await page.getByText("Reclamar Premio").click({ force: true, timeout: 2000 }).catch(() => {});
    await sleep(800);
    await page.getByRole("tab", { name: /Gira y Gana/i }).click({ force: true });
    await sleep(800);
    await page.getByRole("button", { name: /Girar Ruleta/i }).click({ force: true, timeout: 5000 }).catch(() => {});
    await sleep(3500);
    await dismissOverlays(page);

    // 3. Billetera bono ahorro (~4s)
    await go("/billetera", 4000);

    // 4. Transferir (~4s)
    await go("/transferir", 2000);
    await page.getByText("Paga Deuna").first().click({ force: true, timeout: 3000 }).catch(() => {});
    await sleep(2000);

    // 5. Perfil Tú (~3s)
    await go("/tu", 3000);

    // 6. Recarga + Veci crédito (~8s)
    await go("/", 1500);
    await page.getByRole("button", { name: "+ $20" }).click({ force: true, timeout: 3000 }).catch(() => {});
    await sleep(2000);
    await page.getByRole("button", { name: /Veci \(Negocio\)/i }).click();
    await sleep(2000);
    await page.getByText("dame chance", { exact: false }).first().click({ force: true, timeout: 3000 }).catch(() => {});
    await sleep(2500);
    await dismissOverlays(page);
    await sleep(500);
  } catch (err) {
    console.error("Demo flow warning:", err.message);
  }

  await page.close();
  await context.close();
  await browser.close();

  const webms = fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);

  if (webms[0]) {
    console.log("Video:", path.join(OUT_DIR, webms[0].f));
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
