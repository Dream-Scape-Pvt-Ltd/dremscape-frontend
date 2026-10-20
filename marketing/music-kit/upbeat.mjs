// The upbeat Dreamscape theme: bright, driving, adventurous. One arranger for every film, fed with that film's bars.
//
// Why the earlier scores read as sad: a slow pulse, a soft piano low in its range, the B minor chord on key moments,
// long string swells and a lot of reverb. This one stays on the major chords (I, IV, V, with sus/add9 colour),
// drives with eighths and sixteenths, puts the piano high and short (offbeat stabs), adds a strummed steel guitar,
// pizzicato strings, glockenspiel, finger bass, kick, claps, shaker and tambourine, and keeps the room small.
//
//   bars:   [{ t, len, chord, energy }]   energy 0 intro (piano + glock + soft strings), 1 groove (+ guitar, bass,
//           shaker), 2 full (+ kick, claps, pizzicato, tambourine), 3 peak (+ crash, strings up an octave)
//   pulse:  seconds per beat of the groove (each bar is split into 4 beats, 8 eighths, 16 sixteenths)
//   melody: [[t0, t1]] windows where the hook may play (keep it out from under a voice)
//   big:    times that land with a crash, a low hit and the full chord; a tom fill and a reversed cymbal lead in
//   end:    when the groove stops; the last chord rings to the film's end
import { SR, loadPiano, pianoNote, sf2Render, buffer, rng } from './kit.mjs';

const CHORDS = {   // [bass root, piano stab voicing (high), guitar voicing (low to high), pizzicato / hook tones]
  D: [38, [74, 78, 81], [50, 57, 62, 66], [62, 66, 69, 74]],
  Dsus: [38, [74, 79, 81], [50, 57, 62, 67], [62, 67, 69, 74]],
  G: [43, [74, 79, 83], [43, 47, 50, 55, 59, 67], [62, 67, 71, 74]],
  Gadd9: [43, [74, 79, 81], [43, 50, 55, 57, 62], [62, 67, 69, 74]],
  A: [45, [73, 76, 81], [45, 52, 57, 61, 64], [61, 64, 69, 73]],
  Asus: [45, [74, 76, 81], [45, 52, 57, 62, 64], [62, 64, 69, 74]],
  Bm: [47, [74, 78, 83], [47, 54, 59, 62, 66], [62, 66, 71, 74]],
  Em: [40, [71, 76, 79], [40, 47, 52, 55, 59, 64], [64, 67, 71, 76]],
};
/* the hook: bright, rising, D major pentatonic; two bars, eighth-note grid (null = rest) */
const HOOK = [[81, 2], null, [83, 1], [86, 2], null, [88, 1], [86, 2], null, [83, 1], [81, 1], [78, 2], null, [81, 3], null, null, null];

export async function upbeat({ dur, pulse, bars, melody = [], big = [], end = dur, seed = 5, level = 1 }) {
  const R = rng(seed), jit = (s = 0.006) => (R() - 0.5) * 2 * s, vj = (v, s = 0.05) => Math.max(0.03, Math.min(1, v + (R() - 0.5) * 2 * s));
  const E8 = pulse / 2, E16 = pulse / 4, P = [], gtr = [], pizz = [], str = [], glk = [], bas = [], drm = [], fx = [];
  const inMel = (t) => melody.some(([a, b]) => t >= a && t < b - 0.05);
  bars.forEach((b, bi) => {
    const c = CHORDS[b.chord], e = b.energy, t0 = b.t, n8 = Math.round(b.len / E8), last = bi === bars.length - 1;
    const stop = Math.min(t0 + b.len, end), groove = t0 < end - 0.01;
    /* strings: a bright, soft bed; an octave up at the peak */
    const sv = e >= 3 ? c[3].map((m) => m + 12) : c[3];
    sv.slice(0, 3).forEach((m, k) => str.push([t0 + 0.01 * k, m, e >= 3 ? 70 : 52, (last ? dur - t0 - 0.3 : b.len + 0.05)]));
    if (!groove) {                                                                  // past the end of the groove: one ringing chord
      P.push([t0, c[0], 0.4, 1, dur], ...c[1].map((m, k) => [t0 + 0.02 * k, m, 0.36, 1, dur]));
      glk.push([t0 + 0.01, c[3][3] + 12, 70, 2]);
      return;
    }
    for (let i = 0; i < n8; i++) {
      const t = t0 + i * E8, beat = Math.floor(i / 2), off = i % 2 === 1;
      if (t >= stop - 0.01) break;
      /* piano: offbeat stabs (short, bright) from energy 1; flowing high eighths in the intro */
      if (e === 0) P.push([t + jit(), c[3][[0, 1, 2, 3, 2, 1, 2, 3][i % 8]] + 12, vj(0.24), E8 * 0.9, 0]);
      else if (off) P.push(...c[1].map((m, k) => [t + 0.004 * k + jit(0.003), m, vj(0.3 + 0.04 * e), E8 * 0.55, 0]));
      if (i === 0) P.push([t, c[0], 0.42, pulse * 1.6, 0], [t + 0.01, c[0] + 12, 0.32, pulse * 1.6, 0]);
      /* guitar: folk strum, down on the beat, up on the "and" */
      if (e >= 1) {
        const pat = [1, 0, 1, 1, 0, 1, 1, 1][i % 8];
        if (pat) {
          const down = !off, v = (down ? 74 : 56) + (i % 8 === 0 ? 12 : 0), vo = down ? c[2] : c[2].slice(-4).reverse();
          vo.forEach((m, k) => gtr.push([t + k * (down ? 0.011 : 0.008), m, vj(v / 127, 0.04) * 127, E8 * 0.95]));
        }
      }
      /* bass: root on the beat, octave pop on the "and" of 2 and 4 */
      if (e >= 1 && (i % 2 === 0 || i % 4 === 3)) bas.push([t, c[0] - 12 + (i % 4 === 3 ? 12 : 0), i % 8 === 0 ? 100 : 82, E8 * 0.85]);
      /* pizzicato eighths from energy 2 */
      if (e >= 2) pizz.push([t + jit(0.004), c[3][[0, 2, 1, 3, 2, 1, 3, 2][i % 8]], vj(off ? 0.55 : 0.68) * 127, E8 * 0.6]);
      /* drums */
      if (e >= 1) { drm.push([t, 82, vj(0.42, 0.06) * 127, 0.05]); drm.push([t + E16, 82, vj(0.3, 0.06) * 127, 0.05]); }   // shaker 16ths
      if (e >= 2 && !off) drm.push([t, 36, beat % 2 ? 92 : 104, 0.2]);                                                   // four on the floor
      if (e >= 2 && !off && beat % 2 === 1) drm.push([t, 39, 92, 0.1]);                                                  // claps on 2 and 4
      if (e >= 2 && off) drm.push([t, 54, vj(0.5, 0.06) * 127, 0.1]);                                                    // tambourine on the off-beats
      if (e === 1 && !off && beat % 2 === 0) drm.push([t, 36, 72, 0.2]);                                                 // a lighter kick
      /* the hook */
      const h = HOOK[(i + (bi % 2) * 8) % 16];
      if (h && e !== 1 && inMel(t)) {
        glk.push([t, h[0], 86, h[1] * E8 * 1.2]);
        P.push([t + 0.004, h[0], vj(0.42), h[1] * E8, t + h[1] * E8 + 0.2]);
      }
    }
    if (e >= 3 && bi > 0 && bars[bi - 1].energy < 3) drm.push([t0, 49, 96, 2]);                                     // crash into the peak
  });
  big.forEach((tb) => {
    drm.push([tb, 49, 112, 3], [tb, 57, 90, 3], [tb, 36, 120, 0.4]);
    for (let k = 0; k < 6; k++) drm.push([tb - 6 * E16 + k * E16, [50, 50, 48, 48, 45, 43][k], 70 + k * 8, 0.12]);   // tom fill
    fx.push([tb - 1.395, 60, 92, 1.6]);
  });
  P.push(...bars.filter((b) => big.some((x) => Math.abs(x - b.t) < 0.02)).flatMap((b) => [[b.t, CHORDS[b.chord][0] - 12, 0.6, 1.5, b.t + 1.5]]));

  const bank = loadPiano({ lo: 26, hi: 100 }), piano = buffer(dur + 0.5);
  P.sort((a, b) => a[0] - b[0]).forEach(([t, m, v, hold, up]) => pianoNote(bank, piano, Math.max(0, t), m, v, hold, { pedal: up, rel: 0.2 }));
  const [guitar, pz, strings, mallets, bass, rev, drums] = await sf2Render([
    { ch: 0, program: 25, vol: 100, pan: 40, notes: gtr },
    { ch: 1, program: 45, vol: 96, pan: 84, notes: pizz },
    { ch: 2, program: 48, vol: 80, pan: 64, notes: str },
    { ch: 3, program: 9, vol: 92, pan: 76, notes: glk },
    { ch: 4, program: 33, vol: 104, pan: 64, notes: bas },
    { ch: 5, program: 119, vol: 90, notes: fx },
    { ch: 9, bank: 128, program: 0, vol: 100, notes: drm },
  ].map((p) => ({ ...p, notes: p.notes.map((n) => [Math.max(0, n[0]), n[1], n[2], n[3]]) })), dur + 0.5);
  for (let c = 0; c < 2; c++) for (let i = 0; i < strings[c].length; i++) strings[c][i] += pz[c][i] * 0.9;
  const g = (s, v) => { for (let c = 0; c < 2; c++) for (let i = 0; i < s[c].length; i++) s[c][i] *= v * level; return s; };
  return { piano: g(piano, 1), guitar: g(guitar, 1), strings: g(strings, 1), mallets: g(mallets, 1), bass: g(bass, 1), drums: g(drums, 1), fx: g(rev, 1) };
}
