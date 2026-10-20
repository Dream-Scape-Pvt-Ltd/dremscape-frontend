// "Your Trail" score, played on real instruments (../music-kit): Salamander grand piano, GeneralUser GS strings, cello,
// double bass, harp, timpani and a light kit. Writes dry stems to out/stems/*.wav; src/score.js mixes them with the
// voiceover and the sound design.   node music.mjs
//
// D major, 96 BPM, one bar = 2.5 s, 13 bars, every scene change on a bar line (src/timeline.js):
//   1-2   intro         piano alone over a soft string chord; the voice carries it
//   3-4   since 2005    the piano opens into broken chords, cello and bass enter
//   5     the range     the piano melody, the only time it plays in full, between two lines of voice
//   6-7   where to      a pulse: piano ostinato, soft kick and shaker; each choice is a note in the chord
//   8     the route     strings lift an octave
//   9-10  your own trip the pulse returns with harp, three plucked steps, a timpani roll into...
//   11    the logo      the resolution on D: low octaves, timpani, cymbal, harp glissando into it
//   12-13 end card      the opening motif returns on top and rings out
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SR, loadPiano, pianoNote, sf2Render, buffer, writeWav, rng } from '../music-kit/kit.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const TL = new Function('window', readFileSync(join(here, 'src/timeline.js'), 'utf8') + ';return window.TL;')({});
const DUR = TL.dur + 0.5, BAR = TL.bar, BEAT = BAR / 4, E8 = BEAT / 2;
const bt = (bar, beat = 0) => (bar - 1) * BAR + beat * BEAT;                 // bar 1-based, beat 0-based
const R = rng(11), jit = (s = 0.008) => (R() - 0.5) * 2 * s, vj = (v, s = 0.04) => Math.max(0.02, Math.min(1, v + (R() - 0.5) * 2 * s));

/* harmony: [root for the double bass, piano left hand, string voicing (four voices, low to high), chord tones for patterns] */
const CH = [
  [38, [38, 45], [50, 57, 64, 66], [62, 64, 66, 69]],     // 1  D(add9)
  [37, [37, 45], [49, 57, 64, 69], [61, 64, 69, 73]],     // 2  A/C#
  [35, [35, 42], [50, 57, 62, 66], [62, 66, 69, 71]],     // 3  Bm7
  [31, [31, 38], [50, 55, 59, 66], [59, 62, 66, 67]],     // 4  Gmaj7
  [30, [30, 42], [50, 57, 62, 66], [57, 62, 66, 69]],     // 5  D/F#
  [31, [31, 43], [50, 55, 59, 67], [59, 62, 67, 71]],     // 6  G
  [33, [33, 45], [52, 57, 61, 69], [61, 64, 69, 73]],     // 7  A
  [35, [35, 47], [54, 59, 62, 69], [62, 66, 69, 71]],     // 8  Bm7
  [31, [31, 43], [55, 59, 62, 67], [59, 62, 67, 71]],     // 9  G
  [33, [33, 45], [52, 57, 62, 69], [62, 64, 69, 74]],     // 10 Asus4 (-> A on beat 3)
  [38, [26, 38], [50, 57, 62, 66], [62, 66, 69, 74]],     // 11 D
  [38, [38, 50], [50, 55, 59, 67], [59, 62, 67, 71]],     // 12 G/D
  [38, [38, 50], [50, 57, 62, 66], [62, 66, 69, 74]],     // 13 D
];

/* ---------------------------------------------------------------- piano */
const P = [];                                    // [t, midi, vel, hold, pedalUp]
const pedal = (bar) => bt(bar + 1) - 0.06;       // pedal changes on every bar line
CH.forEach((c, i) => {
  const b = i + 1, t0 = bt(b), up = b >= 13 ? DUR : pedal(b);
  const lh = c[1], tones = c[3];
  if (b <= 2) {                                  // intro: a low open fifth, then three notes rising into the voice's gaps
    P.push([t0 + jit(), lh[0], 0.34, 0.4, up], [t0 + 0.03, lh[1], 0.28, 0.4, up]);
    [[1, tones[0] - 12], [2, tones[1] - 12], [3, tones[2] - 12]].forEach(([e, m]) => P.push([t0 + e * E8 + jit(), m, vj(0.2), 0.3, up]));
  } else if (b <= 5) {                           // since 2005: broken chords in eighths, soft, under the voice
    P.push([t0 + jit(), lh[0], 0.36, 0.5, up], [t0 + E8 * 4 + jit(), lh[1], 0.26, 0.4, up]);
    const pat = [null, 0, 1, 2, 3, 2, 1, 0];
    pat.forEach((k, e) => { if (k !== null) P.push([t0 + e * E8 + jit(), tones[k] - 12, vj(0.17 + (e % 2 ? 0 : 0.04)), 0.25, up]); });
  } else if (b <= 7 || b === 9 || b === 10) {    // the pulse: ostinato in eighths, left hand on 1 and 3
    const ch = b === 10 ? [[0, CH[9][3]], [2, [61, 64, 69, 73]]] : [[0, tones]];
    P.push([t0 + jit(), lh[0], 0.4, BEAT * 1.8, 0], [t0 + 2 * BEAT + jit(), lh[1], 0.32, BEAT * 1.8, 0]);
    for (let e = 0; e < 8; e++) {
      const tn = (b === 10 && e >= 4 ? ch[1][1] : ch[0][1]), k = [0, 2, 1, 3, 2, 1, 3, 2][e];
      P.push([t0 + e * E8 + jit(0.005), tn[k], vj(0.22 + (e % 2 ? 0 : 0.06) + (b >= 9 ? 0.05 : 0)), E8 * 0.7, 0]);
    }
  } else if (b === 8) {                          // the route: one open chord, let it ring under the strings
    P.push([t0, lh[0], 0.42, 1, up], [t0 + 0.04, lh[1], 0.34, 1, up]);
    tones.forEach((m, k) => P.push([t0 + 0.08 + k * 0.05, m, vj(0.26), 1, up]));
  } else if (b === 11) {                         // the logo: deep octaves and the full chord, rolled
    P.push([t0, lh[0], 0.62, 2, up], [t0, lh[1], 0.56, 2, up]);
    [50, 57, 62, 66, 69].forEach((m, k) => P.push([t0 + 0.02 + k * 0.035, m, vj(0.44), 2, up]));
  } else {                                       // 12-13: chords to close
    P.push([t0, lh[0], 0.34, 1, up], [t0 + 0.04, lh[1], 0.28, 1, up]);
    tones.slice(0, 3).forEach((m, k) => P.push([t0 + 0.1 + k * 0.07, m - 12, vj(0.2), 1, up]));
  }
});
/* melody: the opening motif (F#-A-E), sparse while the voice talks, in full only over the range of photographs */
const MEL = [
  [1, 3.0, 78, 1], [1, 3.5, 81, 0.5],                                   // after "Some trails you walk."
  [2, 0, 76, 2.5],
  [5, 0.5, 78, 1.5], [5, 2, 81, 0.5], [5, 2.5, 76, 1], [5, 3.5, 74, 0.5], // the range: Journeys through the Himalaya
  [6, 0, 74, 2],
  [8, 0.5, 78, 1], [8, 1.5, 81, 2.5],                                   // the route
  [11, 1.5, 78, 0.5], [11, 2, 81, 0.5], [11, 2.5, 86, 1.5],              // the logo
  [12, 0.5, 83, 1.5], [12, 2, 81, 2],
  [13, 0, 78, 6],
];
MEL.forEach(([b, beat, m, len]) => {
  const v = b === 11 ? 0.5 : b === 5 ? 0.42 : 0.34;
  P.push([bt(b, beat) + jit(0.006), m, vj(v, 0.03), len * BEAT, b >= 12 ? DUR : pedal(b)]);
  if (b >= 11) P.push([bt(b, beat) + 0.012, m - 12, vj(v * 0.62, 0.02), len * BEAT, b >= 12 ? DUR : pedal(b)]);
});

/* ---------------------------------------------------------------- musical UI sounds: each choice is a note of the chord */
const UIN = [];                                  // [t, midi, vel(0-1), instrument]
UIN.push([TL.ui.pickRegion, 81, 0.36, 'piano'], [TL.ui.pickLevel, 85, 0.36, 'piano'], [TL.ui.press, 88, 0.4, 'piano']);
TL.ui.steps.forEach((t, i) => UIN.push([t, [74, 79, 81][i], 0.5, 'harp']));
UIN.push([TL.ui.cta, 86, 0.32, 'piano'], [TL.ui.cta + 0.012, 93, 0.22, 'piano']);

/* ---------------------------------------------------------------- strings, cello, bass (one sustained line per voice) */
const strings = [], cello = [], bass = [], ccStr = [], ccLow = [];
const voices = [[], [], [], []];
CH.forEach((c, i) => {
  const b = i + 1, t0 = bt(b), v = b === 8 ? c[2].map((m) => m + 12) : c[2];
  v.forEach((m, k) => { const last = voices[k][voices[k].length - 1]; if (last && last[1] === m && last[0] + last[3] >= t0 - 0.01) last[3] += BAR; else voices[k].push([t0 + 0.02 * k, m, 70, BAR + 0.08]); });
  if (b === 10) { const prev = voices[2][voices[2].length - 1]; prev[3] = bt(10, 2) - prev[0]; voices[2].push([bt(10, 2), 61, 70, BAR / 2 + 0.08]); }   // sus4 resolves
  if (b >= 3) bass.push([t0, c[0], b >= 11 ? 80 : 64, BAR + 0.1]);
});
voices.forEach((v) => strings.push(...v));
strings.forEach((n) => { if (n[0] + n[3] > DUR - 0.5) n[3] = DUR - 0.5 - n[0]; });
const CEL = [[3, 0, 54, 2], [3, 2, 52, 2], [4, 0, 50, 4], [5, 0, 49, 2], [5, 2, 45, 2], [8, 0, 50, 4], [9, 0, 47, 2], [9, 2, 50, 2], [10, 0, 50, 2], [10, 2, 49, 2], [11, 0, 50, 8]];
CEL.forEach(([b, beat, m, len]) => cello.push([bt(b, beat) + 0.03, m, 72, len * BEAT + 0.06]));
/* expression (CC11): the strings breathe with the sections */
[[0, 34], [2.4, 42], [4.9, 52], [9.9, 66], [12.4, 58], [17.4, 80], [19.9, 64], [24.6, 92], [25.2, 100], [27.4, 82], [30, 62], [32.6, 20]].forEach(([t, v], i, a) => {
  if (!i) { ccStr.push([0, 11, v]); return; }
  const [t0, v0] = a[i - 1]; for (let x = t0 + 0.05; x <= t; x += 0.05) ccStr.push([x, 11, v0 + (v - v0) * (x - t0) / (t - t0)]);
});
[[0, 70], [5, 82], [24.6, 100], [32.6, 30]].forEach(([t, v], i, a) => {
  if (!i) { ccLow.push([0, 11, v]); return; }
  const [t0, v0] = a[i - 1]; for (let x = t0 + 0.05; x <= t; x += 0.05) ccLow.push([x, 11, v0 + (v - v0) * (x - t0) / (t - t0)]);
});

/* ---------------------------------------------------------------- harp, kit, timpani, cymbals */
const harp = [], kit = [], timp = [], fx = [];
for (const b of [6, 7, 9, 10]) {                 // light kit in the pulse bars
  const t0 = bt(b);
  for (let q = 0; q < 4; q++) {
    if (q % 2 === 0 || b >= 9) kit.push([t0 + q * BEAT, 36, b >= 9 ? 62 : 56, 0.2]);
    kit.push([t0 + q * BEAT + E8 + jit(0.004), 70, vj(0.42, 0.06) * 100, 0.1]);         // maracas on the off-beats
    if (b >= 9) kit.push([t0 + q * BEAT + jit(0.004), 69, vj(0.3, 0.05) * 100, 0.1]);   // cabasa on the beat
    if (b >= 9 && (q === 1 || q === 3)) kit.push([t0 + q * BEAT, 37, 48, 0.1]);          // side stick on 2 and 4
  }
  if (b === 9 || b === 10) for (let e = 0; e < 8; e++) harp.push([t0 + e * E8 + jit(0.005), CH[b - 1][3][[0, 1, 2, 3, 2, 1, 2, 3][e]] + 12, vj(0.34, 0.05) * 100, E8 * 1.5]);
}
for (let i = 0; i < 14; i++) timp.push([bt(10, 2.2) + i * 0.08, 45, 18 + i * 5.5, 0.07]);                            // roll on A into the logo
timp.push([bt(11), 38, 112, 3]);
for (let i = 0; i < 15; i++) harp.push([bt(11) - 0.5 + i * 0.033, [62, 64, 66, 67, 69, 71, 73][i % 7] + 12 * Math.floor(i / 7), 60 + i * 3, 1.5]);   // glissando
kit.push([bt(11) + 0.005, 49, 52, 3]);                                                                                  // soft crash on the logo
fx.push([bt(11) - 1.395, 60, 80, 1.6], [TL.ui.open - 1.395 + 0.15, 60, 46, 1.6]);                                      // reversed cymbal into the logo and the route

/* ---------------------------------------------------------------- render */
const t0 = Date.now();
const bank = loadPiano({ lo: 26, hi: 96 });
const piano = buffer(DUR), ui = buffer(DUR);
P.sort((a, b) => a[0] - b[0]).forEach(([t, m, v, hold, up]) => pianoNote(bank, piano, Math.max(0, t), m, v, hold, { pedal: up, rel: 0.25 }));
UIN.filter((n) => n[3] === 'piano').forEach(([t, m, v]) => pianoNote(bank, ui, t, m, v, 0.25, { pedal: t + 0.9, rel: 0.4 }));
const sf = await sf2Render([
  { ch: 0, program: 49, vol: 104, pan: 64, notes: strings, cc: ccStr },
  { ch: 1, program: 42, vol: 92, pan: 50, notes: cello, cc: ccLow },
  { ch: 2, program: 43, vol: 96, pan: 70, notes: bass, cc: ccLow },
  { ch: 3, program: 46, vol: 96, pan: 78, notes: harp },
  { ch: 4, program: 47, vol: 100, pan: 60, notes: timp },
  { ch: 5, program: 119, vol: 90, pan: 64, notes: fx },
  { ch: 6, program: 46, vol: 110, pan: 46, notes: UIN.filter((n) => n[3] === 'harp').map(([t, m, v]) => [t, m, v * 127, 1.2]) },
  { ch: 9, bank: 128, program: 0, vol: 92, notes: kit },
], DUR);
const [str, cel, bas, hrp, tim, rev, uiHarp, perc] = sf;
const mix = (a, b, g = 1) => { for (let c = 0; c < 2; c++) for (let i = 0; i < a[c].length; i++) a[c][i] += b[c][i] * g; return a; };
const stems = {
  piano, strings: mix(mix(str, cel), bas), harp: hrp, perc: mix(perc, tim), fx: rev, ui: mix(ui, uiHarp),
};
const dir = join(here, 'out/stems'); mkdirSync(dir, { recursive: true });
for (const [k, v] of Object.entries(stems)) writeWav(join(dir, k + '.wav'), v);
writeFileSync(join(dir, 'stems.json'), JSON.stringify({ sr: SR, dur: DUR, stems: Object.keys(stems) }));
console.log('stems', Object.keys(stems).join(' '), ((Date.now() - t0) / 1000).toFixed(1) + ' s');
