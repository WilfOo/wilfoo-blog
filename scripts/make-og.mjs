import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseUrl = process.env.OG_BASE_URL || "http://127.0.0.1:4321";
const outputPath = fileURLToPath(new URL("../public/og.jpg", import.meta.url));

const browser = await chromium.launch({
  args: ["--no-sandbox"],
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: "chrome" }),
});

const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  colorScheme: "light",
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.addStyleTag({
  content: `
  header, footer { display: none !important; }
  main > section:first-child { min-height: 630px !important; height: 630px !important; }
  main > section:first-child > div:first-child { padding-top: 72px !important; padding-bottom: 24px !important; }
  main > section:first-child > div:last-child { display: none !important; }
  main > section:first-child + * { display: none !important; }
  main h1 { font-size: 82px !important; line-height: 0.96 !important; }
  main h1 span.block { display: block !important; }
  body { overflow: hidden !important; }
`,
});
await page.evaluate(() => {
  const label = document.createElement("div");
  label.textContent = "wilfoo.com  ·  notes on systems, data & the quiet parts";
  label.style.cssText =
    "position:fixed;left:40px;bottom:48px;font:500 10px/1 ui-monospace,monospace;letter-spacing:.22em;text-transform:uppercase;color:#6c6b64;z-index:50";
  document.body.appendChild(label);
});
await page.waitForTimeout(500);
await page.screenshot({ path: outputPath, type: "jpeg", quality: 90 });
console.log("og.jpg written");
await browser.close();
