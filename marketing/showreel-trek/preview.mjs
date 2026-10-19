// Renders single frames: node preview.mjs <outDir> t1 t2 t3 ...   (or "beats" for one frame per beat)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [outDir, ...args] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (['warning', 'error'].includes(m.type())) console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('file://' + resolve(here, 'dist/trek.html'));
await page.waitForFunction('window.__ready === true', null, { timeout: 30000 });
const K = (await page.evaluate(() => window.__dur)) / 15;
const times = args[0] === 'beats' ? Array.from({ length: 30 }, (_, i) => (i * 0.5 + 0.2) * K) : args.map(Number);   // output seconds (authored beat = 0.5 * K)
for (const t of times) {
  await page.evaluate((tt) => window.seek(tt), t);
  await page.screenshot({ path: join(outDir, `t_${t.toFixed(3).padStart(6, '0')}.png`) });
}
await browser.close();
console.log('frames', times.length);
