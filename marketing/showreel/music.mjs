// Showreel score and sound design on real instruments (../music-kit): Salamander grand piano, GeneralUser GS strings,
// cello, double bass, harp, timpani and a light kit, plus synthesised keystrokes and mouse clicks.
// Writes dry stems to out/stems/*.wav; src/score.js mixes them.   node music.mjs
//
// The picture is authored on a 15 s grid and played TL.k times slower; every time below is real time (authored * k).
// D major. One chord per scene, changing on the scene cuts:
//   D   hook             "So many trails. Which one?"   piano motif over a soft string chord
//   A   find             a pulse starts with the cursor: kick, shaker, piano ostinato; every pick is a note of the chord
//   Bm  corner           the header and the Treks menu; strings swell into the photo opening
//   G   yours            "Make the trail your own": the three steps are three harp notes
//   D G the form         the music steps back while the visitor types (every key is heard), then builds to Send
//   A   sent             "Your inquiry is with the team.": a chime, the timpani roll, a harp glissando into...
//   D   the logo         the resolution, the motif returns and rings out
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SR, loadPiano, pianoNote, sf2Render, buffer, writeWav, rng } from '../music-kit/kit.mjs';
import { keystroke, mouseClick } from '../music-kit/keys.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const TL = new Function('window', readFileSync(join(here, 'src/timeline.js'), 'utf8') + ';return window.TL;')({});
const K = TL.k, DUR = TL.dur * K + 0.5, BEAT = TL.beat * K, E8 = BEAT / 2;
const at = (authored) => authored * K;
const R = rng(23), jit = (s = 0.008) => (R() - 0.5) * 2 * s, vj = (v, s = 0.04) => Math.max(0.02, Math.min(1, v + (R() - 0.5) * 2 * s));

/* [start, end (authored), double-bass root, piano left hand, string voicing, chord tones] */
const SEG = [
  [0, 2, 38, [38, 45], [50, 57, 64, 66], [62, 64, 66, 69]],      // D(add9)  hook
  [2, 4.5, 33, [33, 45], [52, 57, 61, 64], [61, 64, 69, 73]],    // A        find
  [4.5, 7, 35, [35, 47], [54, 59, 62, 66], [62, 66, 69, 71]],    // Bm       corner
  [7, 9, 31, [31, 43], [55, 59, 62, 67], [59, 62, 67, 71]],      // G        yours
  [9, 10, 38, [38, 45], [50, 57, 62, 66], [57, 62, 66, 69]],     // D        the form
  [10, 11, 31, [31, 43], [55, 59, 62, 67], [59, 62, 67, 71]],    // G        typing, to Send
  [11, 12, 33, [33, 45], [52, 57, 61, 64], [61, 64, 69, 73]],    // A        sent
  [12, 15.3, 38, [26, 38], [50, 57, 62, 66], [62, 66, 69, 74]],  // D        logo, end card
].map(([a, b, ...r]) => [at(a), at(b), ...r]);

/* ---------------------------------------------------------------- piano */
const P = [];
SEG.forEach(([t0, t1, , lh, , tones], si) => {
  const up = si === SEG.length - 1 ? DUR : t1 - 0.05, beats = Math.round((t1 - t0) / BEAT);
  if (si === 0) {                                            // hook: open fifth, three rising notes
    P.push([t0, lh[0], 0.34, 0.4, up], [t0 + 0.03, lh[1], 0.28, 0.4, up]);
    [[1, tones[0]], [2, tones[1]], [3, tones[2]]].forEach(([e, m]) => P.push([t0 + e * E8 + jit(), m - 12, vj(0.2), 0.3, up]));
  } else if (si <= 3 || si === 5) {                          // the pulse: eighths on the chord, left hand on the beat
    const quiet = si === 5 ? 0.6 : 1;                        // under the typing, the hands get lighter
    for (let b = 0; b < beats; b++) {
      if (b % 2 === 0) P.push([t0 + b * BEAT + jit(), lh[b % 4 === 0 ? 0 : 1], vj(0.36 * quiet), BEAT * 1.6, 0]);
      for (let e = 0; e < 2; e++) {
        const k = [0, 2, 1, 3, 2, 1, 3, 2][(b * 2 + e) % 8];
        P.push([t0 + b * BEAT + e * E8 + jit(0.005), tones[k], vj((0.2 + (e ? 0 : 0.05)) * quiet), E8 * 0.75, 0]);
      }
    }
  } else if (si === 4) {                                     // the form opens: one chord, ringing
    P.push([t0, lh[0], 0.36, 1, up], [t0 + 0.04, lh[1], 0.28, 1, up]);
    tones.forEach((m, k) => P.push([t0 + 0.08 + k * 0.06, m, vj(0.18), 1, up]));
  } else if (si === 6) {                                     // sent: a held chord under the chime
    P.push([t0, lh[0], 0.4, 1, up], [t0 + 0.03, lh[1], 0.32, 1, up]);
    tones.forEach((m, k) => P.push([t0 + 0.05 + k * 0.045, m, vj(0.26), 1, up]));
  } else {                                                   // the logo: deep octaves and the full chord, rolled
    P.push([t0, lh[0], 0.62, 2, up], [t0, lh[1], 0.56, 2, up]);
    [50, 57, 62, 66, 69].forEach((m, k) => P.push([t0 + 0.02 + k * 0.035, m, vj(0.44), 2, up]));
  }
});
/* the motif (F#-A-E), the same one "Your Trail" is built on */
const MEL = [[0.25, 78, 0.5], [0.75, 81, 0.25], [1.0, 76, 0.75], [7.25, 78, 0.5], [7.75, 81, 0.25], [8.0, 79, 0.75],
             [12.25, 78, 0.25], [12.5, 81, 0.25], [12.75, 86, 0.75], [13.5, 83, 0.5], [14.0, 81, 0.5], [14.5, 78, 1.5]];
MEL.forEach(([a, m, len]) => { const t = at(a); P.push([t + jit(0.006), m, vj(a >= 12 ? 0.46 : 0.34, 0.03), len * K, a >= 12 ? DUR : t + len * K + 0.4]); if (a >= 12) P.push([t + 0.012, m - 12, vj(0.28), len * K, DUR]); });

/* ---------------------------------------------------------------- the interface, heard */
const ui = buffer(DUR), keys = buffer(DUR), UIN = [];
TL.clicks.forEach((c, i) => mouseClick(ui, at(c) - 0.004, 40 + i, { gain: 0.9, pan: 0.15 }));
[[3.0, 81], [4.0, 85], [4.25, 88], [6.0, 86], [11.0, 88]].forEach(([a, m]) => UIN.push([at(a) + 0.02, m, 0.34]));       // each choice is a note
TL.typed.forEach(([a, ch], i) => keystroke(keys, at(a), 300 + i, { space: ch === ' ', gain: 0.95, pan: 0.08 }));
const harpUI = [[7.72, 74], [8.10, 79], [8.50, 81]].map(([a, m]) => [at(a), m, 70, 1.2]);                              // the three steps
harpUI.push([at(11.08), 86, 64, 1.5], [at(11.12), 90, 54, 1.5]);                                                      // "with the team": a small chime

/* ---------------------------------------------------------------- strings, cello, bass, kit, timpani, harp */
const strings = [], cello = [], bass = [], kit = [], timp = [], harp = [...harpUI], fx = [], ccStr = [];
const voices = [[], [], [], []];
SEG.forEach(([t0, t1, root, , voicing], si) => {
  voicing.forEach((m, k) => { const last = voices[k][voices[k].length - 1]; if (last && last[1] === m) last[3] = t1 - last[0] + 0.08; else voices[k].push([t0 + 0.02 * k, m, 70, t1 - t0 + 0.08]); });
  if (si >= 1) bass.push([t0, root, si === 7 ? 80 : 62, t1 - t0 + 0.1]);
});
voices.forEach((v) => strings.push(...v));
strings.forEach((n) => { if (n[0] + n[3] > DUR - 0.4) n[3] = DUR - 0.4 - n[0]; });
bass.forEach((n) => { if (n[0] + n[3] > DUR - 0.4) n[3] = DUR - 0.4 - n[0]; });
[[4.5, 54, 2.5], [7, 55, 2], [9, 57, 1], [10, 55, 1], [11, 52, 1], [12, 50, 3.2]].forEach(([a, m, len]) => cello.push([at(a) + 0.03, m, 70, len * K]));
[[0, 34], [at(2) - 0.1, 44], [at(4.5), 56], [at(6.9), 74], [at(7.1), 60], [at(9), 50], [at(10.9), 72], [at(11.95), 96], [at(12.6), 84], [DUR - 0.3, 18]].forEach(([t, v], i, a) => {
  if (!i) { ccStr.push([0, 11, v]); return; }
  const [t0, v0] = a[i - 1]; for (let x = t0 + 0.05; x <= t; x += 0.05) ccStr.push([x, 11, v0 + (v - v0) * (x - t0) / (t - t0)]);
});
/* light kit while the cursor works (find, corner, yours), lighter still under the typing */
const kitSpan = [[at(2), at(9), 1], [at(10), at(11), 0.7]];
kitSpan.forEach(([a, b, g]) => {
  for (let t = a; t < b - 0.01; t += BEAT) {
    const n = Math.round((t - a) / BEAT);
    if (n % 2 === 0) kit.push([t, 36, 58 * g, 0.2]);
    kit.push([t + E8 + jit(0.004), 70, vj(0.4, 0.06) * 100 * g, 0.1]);
  }
});
for (let i = 0; i < 12; i++) timp.push([at(11.45) + i * 0.075, 45, 20 + i * 6.5, 0.07]);                     // roll into the logo
timp.push([at(12), 38, 110, 3]);
for (let i = 0; i < 15; i++) harp.push([at(12) - 0.48 + i * 0.032, [62, 64, 66, 67, 69, 71, 73][i % 7] + 12 * Math.floor(i / 7), 60 + i * 3, 1.5]);
kit.push([at(12) + 0.005, 49, 50, 3]);
fx.push([at(7.0) - 1.395, 60, 64, 1.6], [at(12) - 1.395, 60, 84, 1.6]);                                      // reversed cymbal into the photo sweep and the logo

/* ---------------------------------------------------------------- render */
const t0 = Date.now();
const bank = loadPiano({ lo: 26, hi: 96 });
const piano = buffer(DUR);
P.sort((a, b) => a[0] - b[0]).forEach(([t, m, v, hold, up]) => pianoNote(bank, piano, Math.max(0, t), m, v, hold, { pedal: up, rel: 0.25 }));
UIN.forEach(([t, m, v]) => pianoNote(bank, ui, t, m, v, 0.25, { pedal: t + 0.9, rel: 0.4 }));
const [str, cel, bas, hrp, tim, rev, perc] = await sf2Render([
  { ch: 0, program: 49, vol: 104, notes: strings, cc: ccStr },
  { ch: 1, program: 42, vol: 92, pan: 50, notes: cello },
  { ch: 2, program: 43, vol: 96, pan: 70, notes: bass },
  { ch: 3, program: 46, vol: 100, pan: 76, notes: harp },
  { ch: 4, program: 47, vol: 100, pan: 60, notes: timp },
  { ch: 5, program: 119, vol: 90, notes: fx },
  { ch: 9, bank: 128, program: 0, vol: 90, notes: kit },
], DUR);
const mix = (a, b, g = 1) => { for (let c = 0; c < 2; c++) for (let i = 0; i < a[c].length; i++) a[c][i] += b[c][i] * g; return a; };
const stems = { piano, strings: mix(mix(str, cel), bas), harp: hrp, perc: mix(perc, tim), fx: rev, ui, keys };
const dir = join(here, 'out/stems'); mkdirSync(dir, { recursive: true });
for (const [k, v] of Object.entries(stems)) writeWav(join(dir, k + '.wav'), v);
writeFileSync(join(dir, 'stems.json'), JSON.stringify({ sr: SR, dur: DUR, stems: Object.keys(stems) }));
console.log('stems', Object.keys(stems).join(' '), ((Date.now() - t0) / 1000).toFixed(1) + ' s');
