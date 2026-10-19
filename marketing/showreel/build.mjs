// Inlines the font, photos, traced logo and engine into one self-contained HTML file (dist/showreel.html).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(here, p));
const b64 = (p) => read(p).toString('base64');

let html = read('src/template.html').toString('utf8');
const repl = {
  FONT: b64('assets/plus-jakarta-sans-latin-wght-normal.woff2'),
  IMG_SUN: b64('assets/sunlit-summits.jpg'),
  IMG_RIDGE: b64('assets/home-slide-1.jpg'),
  IMG_KYANGJIN: b64('assets/home-slide-3.jpg'),
  LOGO: read('assets/logo.json').toString('utf8'),
  ENGINE: read('src/timeline.js').toString('utf8') + '\n' + read('src/engine.js').toString('utf8'),
};
for (const [k, v] of Object.entries(repl)) html = html.split(`{{${k}}}`).join(v);
mkdirSync(join(here, 'dist'), { recursive: true });
writeFileSync(join(here, 'dist/showreel.html'), html);
console.log('dist/showreel.html', (html.length / 1e6).toFixed(2), 'MB');
