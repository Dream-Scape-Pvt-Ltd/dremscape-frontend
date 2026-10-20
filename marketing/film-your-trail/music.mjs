// "Your Trail" score: the upbeat Dreamscape theme (../music-kit/upbeat.mjs) on real instruments, fitted to the cut.
// Writes dry stems to out/stems/*.wav; src/score.js mixes them with the voiceover.   node music.mjs
//
// D major, 96 BPM, one bar = 2.5 s, 13 bars, every scene change on a bar line (src/timeline.js). Major chords only:
//   1-2   intro         piano in bright high eighths, glockenspiel, a soft string bed under the first two lines
//   3-4   since 2005    the groove starts: strummed steel guitar, finger bass, shaker
//   5     the range     full band (kick, claps, tambourine, pizzicato) and the hook, between two lines of voice
//   6-9   choose, route, your own trip: full groove; each choice, step and press is a note of the chord
//   10    the build     strings up an octave, a tom fill and a reversed cymbal into...
//   11    the logo      the crash, a low D and the full chord
//   12    end card      the hook once more; the groove stops on bar 13 and the last D rings out
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SR, loadPiano, pianoNote, sf2Render, buffer, writeWav } from '../music-kit/kit.mjs';
import { upbeat } from '../music-kit/upbeat.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const TL = new Function('window', readFileSync(join(here, 'src/timeline.js'), 'utf8') + ';return window.TL;')({});
const DUR = TL.dur + 0.5, BAR = TL.bar, BEAT = BAR / 4;

const CH = ['D', 'A', 'D', 'G', 'D', 'G', 'A', 'D', 'G', 'A', 'D', 'G', 'D'];
const EN = [0, 0, 1, 1, 2, 2, 2, 2, 2, 3, 3, 2, 2];
const bars = CH.map((chord, i) => ({ t: i * BAR, len: BAR, chord, energy: EN[i] }));

/* musical UI sounds: each choice is a note of the chord */
const UIN = [];
UIN.push([TL.ui.pickRegion, 81, 0.36, 'piano'], [TL.ui.pickLevel, 85, 0.36, 'piano'], [TL.ui.press, 88, 0.4, 'piano']);
TL.ui.steps.forEach((t, i) => UIN.push([t, [74, 79, 81][i], 0.5, 'harp']));
UIN.push([TL.ui.cta, 86, 0.32, 'piano'], [TL.ui.cta + 0.012, 93, 0.22, 'piano']);

const t0 = Date.now();
const stems = await upbeat({ dur: DUR, pulse: BEAT, bars, big: [11 * BAR - BAR], end: 12 * BAR, seed: 11,
  melody: [[10.4, 12.85], [16.3, 17.8], [19.4, 20.45], [28.9, 30.0]] });
const bank = loadPiano({ lo: 60, hi: 100 }), ui = buffer(DUR);
UIN.filter((n) => n[3] === 'piano').forEach(([t, m, v]) => pianoNote(bank, ui, t, m, v, 0.25, { pedal: t + 0.9, rel: 0.4 }));
const [uiHarp] = await sf2Render([{ ch: 6, program: 46, vol: 110, pan: 46, notes: UIN.filter((n) => n[3] === 'harp').map(([t, m, v]) => [t, m, v * 127, 1.2]) }], DUR);
for (let c = 0; c < 2; c++) for (let i = 0; i < ui[c].length; i++) ui[c][i] += uiHarp[c][i];
stems.ui = ui;
const dir = join(here, 'out/stems'); mkdirSync(dir, { recursive: true });
for (const [k, v] of Object.entries(stems)) writeWav(join(dir, k + '.wav'), v);
writeFileSync(join(dir, 'stems.json'), JSON.stringify({ sr: SR, dur: DUR, stems: Object.keys(stems) }));
console.log('stems', Object.keys(stems).join(' '), ((Date.now() - t0) / 1000).toFixed(1) + ' s');
