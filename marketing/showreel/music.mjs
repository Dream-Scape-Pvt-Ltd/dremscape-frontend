// Showreel score and sound design: the upbeat Dreamscape theme (../music-kit/upbeat.mjs) on real instruments, plus
// synthesised keystrokes and mouse clicks and the musical UI notes. Writes dry stems to out/stems/*.wav; src/score.js
// mixes them.   node music.mjs
//
// The picture is authored on a 15 s grid and played TL.k times slower; the groove runs at twice the picture's beat
// (about 141 BPM), one bar per authored second, major chords only:
//   1-2   hook     "So many trails. Which one?"   bright piano eighths and the glockenspiel hook
//   3-5   find     strummed guitar, finger bass and shaker come in with the cursor; every pick is a note of the chord
//   6-9   corner, your own trip: the full groove (kick, claps, tambourine, pizzicato)
//   10-11 the form the groove steps back to guitar and shaker so every key of the typing is heard
//   12    sent     full again
//   13-14 the logo crash, low D, full chord, strings up an octave, the hook; then the last D rings out
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SR, loadPiano, pianoNote, sf2Render, buffer, writeWav } from '../music-kit/kit.mjs';
import { keystroke, mouseClick } from '../music-kit/keys.mjs';
import { upbeat } from '../music-kit/upbeat.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const TL = new Function('window', readFileSync(join(here, 'src/timeline.js'), 'utf8') + ';return window.TL;')({});
const K = TL.k, DUR = TL.dur * K + 0.5, at = (authored) => authored * K;

const CH = ['D', 'A', 'D', 'G', 'A', 'D', 'G', 'D', 'A', 'D', 'G', 'A', 'D', 'G', 'D'];
const EN = [0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 3, 3, 2];
const bars = CH.map((chord, i) => ({ t: at(i), len: K, chord, energy: EN[i] }));

/* the interface, heard */
const ui = buffer(DUR), keys = buffer(DUR), UIN = [];
TL.clicks.forEach((c, i) => mouseClick(ui, at(c) - 0.004, 40 + i, { gain: 0.9, pan: 0.15 }));
[[3.0, 81], [4.0, 85], [4.25, 88], [6.0, 86], [11.0, 88]].forEach(([a, m]) => UIN.push([at(a) + 0.02, m, 0.34]));       // each choice is a note
TL.typed.forEach(([a, ch], i) => keystroke(keys, at(a), 300 + i, { space: ch === ' ', gain: 0.95, pan: 0.08 }));
const harpUI = [[7.72, 74], [8.10, 78], [8.50, 81], [11.08, 88], [11.12, 93]].map(([a, m]) => [at(a), m, 70, 1.4]);   // three steps, then "with the team"

const t0 = Date.now();
const stems = await upbeat({ dur: DUR - 0.5, pulse: K / 4, bars, big: [at(12)], end: at(14), seed: 23,
  melody: [[0, at(2)], [at(7), at(9)], [at(12), at(14)]] });
const bank = loadPiano({ lo: 60, hi: 100 });
UIN.forEach(([t, m, v]) => pianoNote(bank, ui, t, m, v, 0.25, { pedal: t + 0.9, rel: 0.4 }));
const [uiHarp] = await sf2Render([{ ch: 3, program: 46, vol: 100, pan: 76, notes: harpUI }], DUR);
for (let c = 0; c < 2; c++) for (let i = 0; i < ui[c].length; i++) ui[c][i] += uiHarp[c][i];
Object.assign(stems, { ui, keys });
const dir = join(here, 'out/stems'); mkdirSync(dir, { recursive: true });
for (const [k, v] of Object.entries(stems)) writeWav(join(dir, k + '.wav'), v);
writeFileSync(join(dir, 'stems.json'), JSON.stringify({ sr: SR, dur: DUR, stems: Object.keys(stems) }));
console.log('stems', Object.keys(stems).join(' '), ((Date.now() - t0) / 1000).toFixed(1) + ' s');
