// 9:16 versions of the films, for Reels, Shorts and TikTok: a designed vertical frame around the 16:9 film rather than
// a crop. That way the type and the camera moves of the 16:9 cut stay intact.
//   - behind: the film itself, scaled to cover, heavily blurred and darkened, so the frame moves with the cut
//   - top:    the Dreamscape Treks lockup (traced logo) and the site's eyebrow
//   - middle: the film as a rounded card, full width minus margins, with a soft shadow
//   - below:  the voiceover as captions (most social video plays muted), or nothing for the music-only films
//   - bottom: "Plan my journey" and dreamscapetreks.com
//   node make.mjs --in <film-1080p.mp4> --out <vertical.mp4> [--captions captions.json] [--eyebrow "Local journeys · Since 2005"]
// captions.json: [[start, end, "text"], ...] in seconds.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const IN = resolve(arg('in')), OUT = resolve(arg('out')), CAP = arg('captions') ? JSON.parse(readFileSync(resolve(arg('captions')), 'utf8')) : [];
const EYEBROW = arg('eyebrow', 'Local journeys · Since 2005');
const W = 1080, H = 1920, CW = 1000, CH = Math.round(CW * 9 / 16), CX = (W - CW) / 2, VO = CAP.length > 0;
/* two layouts: with captions (logo, eyebrow, film, captions, button) or without (logo, film, eyebrow, button) */
const L = VO ? { logo: 150, eyebrow: 'top', card: 600, cta: 1640, url: 1780 } : { logo: 250, eyebrow: 'under', card: 650, cta: 1500, url: 1640 };
const CY = L.card;
const FONT = readFileSync(join(here, '../film-your-trail/assets/plus-jakarta-sans-latin-wght-normal.woff2')).toString('base64');
const LOGO = JSON.parse(readFileSync(join(here, '../film-your-trail/assets/logo.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'vert-'));
const dur = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', IN], { encoding: 'utf8' }).stdout);

/* ---------------------------------------------------------------- overlays, drawn in the brand font */
const css = `@font-face{font-family:PJS;src:url(data:font/woff2;base64,${FONT}) format('woff2');font-weight:200 800}
*{margin:0;padding:0;box-sizing:border-box} html,body{width:${W}px;height:${H}px;background:transparent;font-family:PJS,sans-serif;-webkit-font-smoothing:antialiased}`;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
async function shot(html, file, clip) {
  await page.setContent(`<!doctype html><style>${css}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(work, file), omitBackground: true, clip });
}
const lw = 620, ls = lw / LOGO.w, lh = LOGO.h * ls;
await shot(`
  <svg style="position:absolute;left:${(W - lw) / 2}px;top:${L.logo}px" width="${lw}" height="${lh}" viewBox="0 0 ${LOGO.w} ${LOGO.h}">
    <path d="${LOGO.mark}" fill="#f9faf8" fill-rule="evenodd"/><path d="${LOGO.text}" fill="#f9faf8" fill-rule="evenodd"/></svg>
  <div style="position:absolute;left:0;width:${W}px;top:${L.eyebrow === 'top' ? L.logo + lh + 56 : CY + CH + 90}px;text-align:center;font-size:26px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#e4c98a">
    <span style="display:inline-block;width:40px;height:4px;border-radius:2px;background:#e4c98a;vertical-align:middle;margin-right:18px;position:relative;top:-4px"></span>${EYEBROW}</div>
  <div style="position:absolute;left:${(W - 520) / 2}px;top:${L.cta}px;width:520px;height:100px;border-radius:50px;background:#e4c98a;color:#153d2f;font-size:38px;font-weight:800;letter-spacing:-.02em;display:flex;align-items:center;justify-content:center;gap:18px">Plan my journey
    <svg width="40" height="30" viewBox="0 0 38 30"><path d="M2 15h32M22 4l12 11-12 11" fill="none" stroke="#153d2f" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div style="position:absolute;left:0;width:${W}px;top:${L.url}px;text-align:center;font-size:30px;font-weight:700;letter-spacing:.22em;color:rgba(249,250,248,.85)">dreamscapetreks.com</div>`, 'over.png');
await shot(`<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,42,31,.86),rgba(11,42,31,.7) 45%,rgba(11,42,31,.88))"></div>
  <div style="position:absolute;left:${CX}px;top:${CY}px;width:${CW}px;height:${CH}px;border-radius:30px;box-shadow:0 28px 60px rgba(0,0,0,.4),0 6px 16px rgba(0,0,0,.25);background:#0b2a1f"></div>`, 'shadow.png');
await page.setViewportSize({ width: CW, height: CH });
await page.setContent(`<!doctype html><style>html,body{margin:0;background:#000}</style><div style="width:${CW}px;height:${CH}px;border-radius:30px;background:#fff"></div>`);
await page.screenshot({ path: join(work, 'mask.png') });
await page.setViewportSize({ width: W, height: 360 });
for (let i = 0; i < CAP.length; i++) {
  await shot(`<div style="position:absolute;left:70px;width:${W - 140}px;top:0;height:360px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:52px;line-height:1.18;font-weight:800;letter-spacing:-.025em;color:#f9faf8;text-shadow:0 2px 18px rgba(0,0,0,.35)">${CAP[i][2]}</div>`, `cap${i}.png`, { x: 0, y: 0, width: W, height: 360 });
}
await browser.close();

/* ---------------------------------------------------------------- composite */
const inputs = ['-i', IN, '-loop', '1', '-i', join(work, 'shadow.png'), '-loop', '1', '-i', join(work, 'mask.png'), '-loop', '1', '-i', join(work, 'over.png')];
CAP.forEach((c, i) => inputs.push('-loop', '1', '-t', String(dur), '-i', join(work, `cap${i}.png`)));
let f = `[0:v]split=2[a][b];`
  + `[a]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,boxblur=12:3,scale=${W}:${H}:flags=bicubic,eq=saturation=0.85,format=rgba[bg];`
  + `[1:v]format=rgba[sh];[bg][sh]overlay=0:0:shortest=1[bg2];`
  + `[b]scale=${CW}:${CH}:flags=lanczos,format=rgba[card0];[2:v]format=gray,scale=${CW}:${CH}[m];[card0][m]alphamerge[card];`
  + `[bg2][card]overlay=${CX}:${CY}[v1];[v1][3:v]overlay=0:0[v2]`;
let last = 'v2';
CAP.forEach(([a, b], i) => {
  f += `;[${4 + i}:v]format=rgba,fade=in:st=${a.toFixed(3)}:d=0.18:alpha=1,fade=out:st=${(b - 0.2).toFixed(3)}:d=0.2:alpha=1[c${i}];[${last}][c${i}]overlay=0:${CY + CH + 20}:enable='between(t,${(a - 0.01).toFixed(3)},${(b + 0.01).toFixed(3)})'[v${3 + i}]`;
  last = `v${3 + i}`;
});
f += `;[${last}]format=yuv420p[out]`;
mkdirSync(dirname(OUT), { recursive: true });
const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...inputs, '-filter_complex', f, '-map', '[out]', '-map', '0:a', '-t', String(dur),
  '-r', '60', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-profile:v', 'high', '-level', '4.2', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-c:a', 'copy', '-movflags', '+faststart', OUT + '.part.mp4'], { stdio: 'inherit' });
rmSync(work, { recursive: true, force: true });
if (r.status !== 0) process.exit(r.status);
renameSync(OUT + '.part.mp4', OUT);                                      // only a finished file ever carries the real name
console.log('wrote', OUT, `${W}x${H}`);
