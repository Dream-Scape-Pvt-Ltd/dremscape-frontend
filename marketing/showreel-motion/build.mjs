// Inlines font + duotone photo + traced logo + letters + landscape + engine into dist/motion.html (or motion-4k.html with --4k).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const HI = process.argv.includes('--4k');
const read = (p) => readFileSync(join(here, p));
const parts = ['core', 'scenes1', 'scenes2', 'scenes3', 'seek'].map((n) => read(`src/${n}.js`).toString('utf8')).join('\n');
const repl = {
  FONT: read('assets/plus-jakarta-sans-latin-wght-normal.woff2').toString('base64'),
  PHOTO: read(HI ? 'assets/summit-duotone-4k.jpg' : 'assets/summit-duotone-2k.jpg').toString('base64'),
  LOGO: read('assets/logo.json').toString('utf8'),
  LETTERS: read('assets/letters.json').toString('utf8'),
  LAND: read('assets/landscape.json').toString('utf8'),
  ENGINE: parts,
};
let html = read('src/template.html').toString('utf8');
for (const [k, v] of Object.entries(repl)) html = html.split(`{{${k}}}`).join(v);
mkdirSync(join(here, 'dist'), { recursive: true });
const out = HI ? 'dist/motion-4k.html' : 'dist/motion.html';
writeFileSync(join(here, out), html);
console.log(out, (html.length / 1e6).toFixed(2), 'MB');
