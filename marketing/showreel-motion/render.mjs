// Full render: 60 fps, 3 sub-frames per frame blended with ffmpeg tmix (motion blur), audio muxed.
//   node build.mjs [--4k] && node audio.mjs && node render.mjs [--scale 2] [--html dist/motion-4k.html] [--out out/name.mp4]
// Frames are captured and blended in chunks, so disk use stays small even at 3840x2160.
import { chromium } from 'playwright';
import { mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = 60, SUB = 3, CHUNK = 12;
const DUR = Number(arg('dur', 24)), N = Math.round(FPS * DUR);   // 24 s: the film is authored on 15 s and played 1.6x slower
const SCALE = Number(arg('scale', 1));
const html = resolve(here, arg('html', 'dist/motion.html'));
const out = resolve(here, arg('out', 'out/dreamscape-one-trail.mp4'));
const work = resolve(arg('work', join(here, 'frames')));
const blend = join(work, 'blend');
const WORKERS = Math.max(1, Math.min(Number(arg('workers', 4)), os.cpus().length));
mkdirSync(blend, { recursive: true });
mkdirSync(dirname(out), { recursive: true });
const CHUNKS = Math.ceil(N / CHUNK);

async function worker(id) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('file://' + html);
  await page.waitForFunction('window.__ready === true', null, { timeout: 120000 });
  for (let c = id; c < CHUNKS; c += WORKERS) {
    const n0 = c * CHUNK, n1 = Math.min(N, n0 + CHUNK);
    if (Array.from({ length: n1 - n0 }, (_, i) => existsSync(join(blend, `b_${String(n0 + i).padStart(5, '0')}.png`))).every(Boolean)) continue;
    const dir = join(work, `c${c}`); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    for (let n = n0; n < n1; n++) for (let k = 0; k < SUB; k++) {
      const t = (n + (k - 1) / SUB) / FPS;               // sub-frames straddle the frame time: -1/180, 0, +1/180 s
      await page.evaluate((tt) => window.seek(tt), t);
      await page.screenshot({ path: join(dir, `s_${String((n - n0) * SUB + k).padStart(5, '0')}.png`), type: 'png' });
    }
    const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS * SUB), '-i', join(dir, 's_%05d.png'),
      '-vf', `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})'`, '-vsync', '0', '-c:v', 'png', '-compression_level', '1', '-start_number', String(n0), join(blend, 'b_%05d.png')]);
    if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
    rmSync(dir, { recursive: true, force: true });
    if (id === 0) console.log(`chunk ${c + 1}/${CHUNKS}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  await browser.close();
}

const t0 = Date.now();
await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i)));
const nb = readdirSync(blend).filter((f) => f.endsWith('.png')).length;
console.log('blended frames:', nb, 'in', ((Date.now() - t0) / 1000).toFixed(0), 's');
if (nb !== N) { console.error('expected', N); process.exit(1); }

const H = 1080 * SCALE, Wd = 1920 * SCALE;
const level = Wd >= 3840 ? '5.2' : '4.2';
const enc = [
  '-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(blend, 'b_%05d.png'), '-i', join(here, 'out/soundtrack.wav'),
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-r', String(FPS),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', Wd >= 3840 ? '16' : '14', '-profile:v', 'high', '-level', level,
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out,
];
let r = spawnSync('ffmpeg', enc, { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status);
console.log('wrote', out, `${Wd}x${H}`);
if (process.argv.includes('--also-1080p') && SCALE > 1) {
  const o2 = out.replace(/\.mp4$/, '-1080p.mp4');
  const e2 = enc.slice(); e2[e2.indexOf('-vf') + 1] = 'scale=1920:1080:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p';
  e2[e2.indexOf('-level') + 1] = '4.2'; e2[e2.indexOf('-crf') + 1] = '14'; e2[e2.length - 1] = o2;
  r = spawnSync('ffmpeg', e2, { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status);
  console.log('wrote', o2, '1920x1080');
}
if (!process.argv.includes('--keep')) rmSync(blend, { recursive: true, force: true });
