// Inlines font + graded photos + traced logo + voiceover timings + timeline + engine into dist/film.html (or film-4k.html with --4k).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const HI = process.argv.includes('--4k');
const read = (p) => readFileSync(join(here, p));
const img = (k) => 'data:image/jpeg;base64,' + read(`assets/${k}-${HI ? '4k' : '2k'}.jpg`).toString('base64');
const IMG = Object.fromEntries(['lastlight', 'together', 'night', 'golden', 'flags', 'walkers', 'path'].map((k) => [k, img(k)]));
const repl = {
  GRAIN: 'data:image/png;base64,' + read('assets/grain.png').toString('base64'),
  FONT: read('assets/plus-jakarta-sans-latin-wght-normal.woff2').toString('base64'),
  IMG: JSON.stringify(IMG),
  LOGO: read('assets/logo.json').toString('utf8'),
  LETTERS: read('assets/letters.json').toString('utf8'),
  VOLINES: read('assets/vo/lines.json').toString('utf8'),
  TIMELINE: read('src/timeline.js').toString('utf8'),
  ENGINE: read('src/engine.js').toString('utf8'),
};
let html = read('src/template.html').toString('utf8');
for (const [k, v] of Object.entries(repl)) html = html.split(`{{${k}}}`).join(v);
mkdirSync(join(here, 'dist'), { recursive: true });
const out = HI ? 'dist/film-4k.html' : 'dist/film.html';
writeFileSync(join(here, out), html);
console.log(out, (html.length / 1e6).toFixed(2), 'MB');
