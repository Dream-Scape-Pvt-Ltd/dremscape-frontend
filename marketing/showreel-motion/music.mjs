// "One Trail" score: the upbeat Dreamscape theme (../music-kit/upbeat.mjs) on real instruments, fitted to the cut.
// Writes dry stems to out/stems/*.wav; audio.mjs plays them under the cue sheet's sound design.   node music.mjs
// The picture is authored at 120 BPM over 15 s and played k times slower; the groove runs at twice the picture's beat,
// one bar per authored second, scene changes every two bars, the logo on bar 13. Major chords only.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SR, writeWav } from '../music-kit/kit.mjs';
import { upbeat } from '../music-kit/upbeat.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const TL = new Function('window', readFileSync(join(here, 'src/timeline.js'), 'utf8') + ';return window.TL;')({});
const K = TL.k, DUR = TL.dur * K, at = (a) => a * K;
const CH = ['D', 'A', 'D', 'G', 'D', 'A', 'G', 'A', 'D', 'G', 'A', 'Asus', 'D', 'G', 'D'];
const EN = [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 2];
const stems = await upbeat({ dur: DUR, pulse: K / 4, bars: CH.map((chord, i) => ({ t: at(i), len: K, chord, energy: EN[i] })),
  big: TL.big.map(at), end: at(14), seed: 31, melody: [[0, at(2)], [at(6), at(8)], [at(12), at(14)]] });
const dir = join(here, 'out/stems'); mkdirSync(dir, { recursive: true });
for (const [k, v] of Object.entries(stems)) writeWav(join(dir, k + '.wav'), v);
writeFileSync(join(dir, 'stems.json'), JSON.stringify({ sr: SR, dur: DUR, stems: Object.keys(stems) }));
console.log('stems', Object.keys(stems).join(' '));
