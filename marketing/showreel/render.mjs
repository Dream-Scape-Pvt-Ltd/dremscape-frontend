// Full render: 60 fps, 3 sub-frames per frame (blended with ffmpeg tmix for motion blur), audio muxed.
//   node build.mjs && node audio.mjs && node render.mjs [framesDir]
import { chromium } from 'playwright';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 60, SUB = 3, DUR = 15, N = FPS * DUR;
const framesDir = resolve(process.argv[2] || join(here, 'frames'));
const WORKERS = Math.max(1, Math.min(4, os.cpus().length));
mkdirSync(framesDir, { recursive: true });
mkdirSync(join(here, 'out'), { recursive: true });

async function worker(id) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('file://' + resolve(here, 'dist/showreel.html'));
  await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
  for (let n = id; n < N; n += WORKERS) {
    for (let k = 0; k < SUB; k++) {
      const idx = n * SUB + k;
      const file = join(framesDir, `s_${String(idx).padStart(5, '0')}.png`);
      if (existsSync(file)) continue;
      const t = (n + (k - 1) / SUB) / FPS;            // sub-frames straddle the frame time: -1/180, 0, +1/180 s
      await page.evaluate((tt) => window.seek(tt), t);
      await page.screenshot({ path: file, type: 'png' });
    }
    if (id === 0 && n % 60 === 0) console.log(`frame ${n}/${N}`);
  }
  await browser.close();
}

const t0 = Date.now();
await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i)));
console.log('captured', readdirSync(framesDir).length, 'sub-frames in', ((Date.now() - t0) / 1000).toFixed(0), 's');

const out = join(here, 'out/dreamscape-showreel.mp4');
const args = [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-framerate', String(FPS * SUB), '-i', join(framesDir, 's_%05d.png'),
  '-i', join(here, 'out/soundtrack.wav'),
  '-vf', `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB),scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`,
  '-r', String(FPS),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-level', '4.2',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out,
];
const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status);
console.log('wrote', out);
