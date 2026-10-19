// Frame-to-frame motion audit: node qa.mjs <outDir>  -> writes diff.json (mean abs diff between consecutive 60 fps frames, 480x270)
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2]; mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.25 });
await page.goto('file://' + resolve(here, 'dist/trek.html'));
await page.waitForFunction('window.__ready === true', null, { timeout: 30000 });
const dur = await page.evaluate(() => window.__dur);
for (let n = 0; n <= Math.round(dur * 60); n++) {
  await page.evaluate((tt) => window.seek(tt), n / 60);
  await page.screenshot({ path: join(out, `f${String(n).padStart(4, '0')}.png`) });
}
await browser.close();
