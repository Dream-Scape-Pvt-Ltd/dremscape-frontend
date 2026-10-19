// Inlines the font, photos, traced logo and engine into one self-contained HTML file (dist/showreel.html).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(here, p));
const b64 = (p) => read(p).toString('base64');

const HI = process.argv.includes('--4k');
// 4K: the site's photos are 2048 px wide, so they are resampled with Lanczos + a light unsharp (ImageMagick) rather than left to the
// browser's bilinear scaling. No detail is invented; the UI, type and logo are vector and render natively at 3840x2160.
const photo = (name) => {
  if (!HI) return `assets/${name}.jpg`;
  const out = join(here, `dist/hires/${name}.jpg`);
  if (!existsSync(out)) {
    mkdirSync(dirname(out), { recursive: true });
    const r = spawnSync('convert', [join(here, `assets/${name}.jpg`), '-filter', 'Lanczos', '-resize', '4096x', '-unsharp', '0x1.1+0.5+0.02', '-quality', '92', out]);
    if (r.status !== 0) throw new Error('ImageMagick convert failed: ' + r.stderr);
  }
  return `dist/hires/${name}.jpg`;
};
let html = read('src/template.html').toString('utf8');
const repl = {
  FONT: b64('assets/plus-jakarta-sans-latin-wght-normal.woff2'),
  IMG_SUN: b64(photo('sunlit-summits')),
  IMG_RIDGE: b64(photo('home-slide-1')),
  IMG_KYANGJIN: b64(photo('home-slide-3')),
  LOGO: read('assets/logo.json').toString('utf8'),
  ENGINE: read('src/timeline.js').toString('utf8') + '\n' + read('src/engine.js').toString('utf8'),
};
for (const [k, v] of Object.entries(repl)) html = html.split(`{{${k}}}`).join(v);
mkdirSync(join(here, 'dist'), { recursive: true });
writeFileSync(join(here, HI ? 'dist/showreel-4k.html' : 'dist/showreel.html'), html);
console.log(HI ? 'dist/showreel-4k.html' : 'dist/showreel.html', (html.length / 1e6).toFixed(2), 'MB');
