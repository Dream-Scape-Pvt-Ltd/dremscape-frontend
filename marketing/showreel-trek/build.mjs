// Inlines font + graded photos + traced logo/letters + engine into dist/trek.html (or trek-4k.html with --4k).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const HI = process.argv.includes('--4k');
const read = (p) => readFileSync(join(here, p));
const parts = ['core', 'scenes1', 'scenes2', 'scenes3', 'seek'].map((n) => read(`src/${n}.js`).toString('utf8')).join('\n');
const b64 = (p) => 'data:image/jpeg;base64,' + read(p).toString('base64');
const IMG = { poster: b64(HI ? 'assets/poster-4k.jpg' : 'assets/poster-2k.jpg'), range: b64('assets/range.jpg'), sun: b64('assets/sun.jpg'), flags: b64('assets/flags.jpg'), walkers: b64('assets/walkers.jpg'), path: b64('assets/path.jpg'), hill: b64('assets/hill.jpg') };
const repl = {
  FONT: read('assets/plus-jakarta-sans-latin-wght-normal.woff2').toString('base64'),
  IMG: JSON.stringify(IMG),
  LOGO: read('assets/logo.json').toString('utf8'),
  LETTERS: read('assets/letters.json').toString('utf8'),
  ENGINE: parts,
};
let html = read('src/template.html').toString('utf8');
for (const [k, v] of Object.entries(repl)) html = html.split(`{{${k}}}`).join(v);
mkdirSync(join(here, 'dist'), { recursive: true });
const out = HI ? 'dist/trek-4k.html' : 'dist/trek.html';
writeFileSync(join(here, out), html);
console.log(out, (html.length / 1e6).toFixed(2), 'MB');
