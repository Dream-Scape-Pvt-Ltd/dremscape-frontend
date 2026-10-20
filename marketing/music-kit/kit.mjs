// Sample-based instruments for the films' scores, rendered offline in Node at 48 kHz.
//   Piano     Salamander Grand Piano V3 (samples every minor third, six velocity layers, key-release noises),
//             played with cubic interpolation, damper and sustain pedal.
//   sf2Render GeneralUser GS through spessasynth_core: strings, cello, bass, harp, pads, drum kits; one stereo stem
//             per MIDI channel so the mix (score.js in each film) can treat them separately.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SpessaSynthProcessor, SoundBankLoader } from 'spessasynth_core';

export const SR = 48000;
const here = dirname(fileURLToPath(import.meta.url));
export const SAMPLES = join(here, 'samples');
if (!existsSync(SAMPLES)) throw new Error('music-kit/samples missing: run `node fetch.mjs` in marketing/music-kit first');

/* ------------------------------------------------------------------ io */
export function decode(path) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', String(SR), '-af', 'aresample=resampler=soxr', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error('ffmpeg: ' + r.stderr);
  const f = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4), n = f.length / 2;
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
  return [L, R];
}
export function writeWav(path, [L, R]) {                 // 32-bit float stereo
  const n = L.length, data = Buffer.alloc(n * 8), h = Buffer.alloc(44);
  for (let i = 0; i < n; i++) { data.writeFloatLE(L[i], 8 * i); data.writeFloatLE(R[i], 8 * i + 4); }
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
}
export const buffer = (sec) => [new Float32Array(Math.ceil(sec * SR)), new Float32Array(Math.ceil(sec * SR))];

/* ------------------------------------------------------------------ piano */
const PC = { C: 0, 'D#': 3, 'F#': 6, A: 9 };
const LAYERS = [3, 5, 7, 9, 11, 13];                     // Salamander velocity layers (of 16) we ship
export function loadPiano({ lo = 33, hi = 100 } = {}) {
  const bank = { layers: [], rel: {} };
  for (const v of LAYERS) {
    const dir = join(SAMPLES, 'piano', 'v' + v), map = {};
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mp3'))) {
      const m = /^([A-G]#?)(\d)v\d+\.mp3$/.exec(f); if (!m) continue;
      const midi = 12 * (Number(m[2]) + 1) + PC[m[1]];
      if (midi < lo - 2 || midi > hi + 2) continue;
      const [L, R] = decode(join(dir, f));
      let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
      let on = 0; while (on < L.length && Math.abs(L[on]) < pk * 0.01 && Math.abs(R[on]) < pk * 0.01) on++;
      map[midi] = { L, R, start: Math.max(0, on - Math.round(0.002 * SR)) };
    }
    bank.layers.push({ v, map, keys: Object.keys(map).map(Number).sort((a, b) => a - b) });
  }
  for (let k = 1; k <= 88; k++) {
    const midi = 20 + k; if (midi < lo || midi > hi) continue;
    const p = join(SAMPLES, 'piano', 'release', `rel${k}.mp3`); if (existsSync(p)) bank.rel[midi] = decode(p);
  }
  return bank;
}
const herm = (a, b, c, d, t) => b + 0.5 * t * (c - a + t * (2 * a - 5 * b + 4 * c - d + t * (3 * (b - c) + d - a)));
/* play one note into out = [L, R].
   t: start (s), m: MIDI note, vel: 0..1, hold: seconds the key is down, o.pedal: time the sustain pedal lifts,
   o.gain, o.pan (-1..1, a balance on the stereo sample), o.rel: key-release noise level */
export function pianoNote(bank, out, t, m, vel, hold, o = {}) {
  const li = Math.max(0, Math.min(LAYERS.length - 1, Math.round(vel * (LAYERS.length - 1))));
  const layer = bank.layers[li];
  const s = layer.keys.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a));
  const smp = layer.map[s], ratio = Math.pow(2, (m - s) / 12);
  const fine = Math.pow(10, ((vel * (LAYERS.length - 1) - li) * 2.5) / 20);         // between layers: +-1.25 dB
  const g = (o.gain ?? 1) * fine, pan = o.pan ?? 0, gl = g * Math.min(1, 1 - pan), gr = g * Math.min(1, 1 + pan);
  const off = Math.max(t + hold, o.pedal ?? 0), damped = m < 89;                       // no dampers above F6
  const tau = 0.07 + 0.3 * Math.max(0, (60 - m) / 40);                                 // bass strings stop slower
  const i0 = Math.round(t * SR), iOff = Math.round(off * SR), [L, R] = out;
  const n = Math.min(L.length - i0, Math.floor((smp.L.length - smp.start - 3) / ratio));
  const kd = Math.exp(-1 / (tau * SR));
  let env = 1;
  for (let i = 0; i < n; i++) {
    if (damped && i0 + i >= iOff) { env *= kd; if (env < 1e-4) break; }
    const p = smp.start + i * ratio, k = Math.floor(p), f = p - k;
    const l = herm(smp.L[k - 1] || 0, smp.L[k], smp.L[k + 1], smp.L[k + 2], f), r = herm(smp.R[k - 1] || 0, smp.R[k], smp.R[k + 1], smp.R[k + 2], f);
    L[i0 + i] += l * gl * env; R[i0 + i] += r * gr * env;
  }
  const rel = bank.rel[m];
  if (rel && damped && (o.rel ?? 0.35) > 0) {
    const a = (o.rel ?? 0.35) * g * (0.4 + 0.6 * vel);
    for (let i = 0; i < rel[0].length && iOff + i < L.length; i++) { L[iOff + i] += rel[0][i] * a; R[iOff + i] += rel[1][i] * a; }
  }
}

/* ------------------------------------------------------------------ soundfont */
/* parts: [{ ch, program, bank (128 = drums), vol (0-127), pan (0-127), notes: [[t, midi, vel(1-127), dur]], cc: [[t, cc, value]] }]
   returns one stereo stem per part, dry (the synth's own reverb and chorus are off) */
export async function sf2Render(parts, dur, sf2 = join(SAMPLES, 'generaluser', 'GeneralUser.sf2')) {
  const file = readFileSync(sf2), bankData = SoundBankLoader.fromArrayBuffer(file.buffer.slice(file.byteOffset, file.byteOffset + file.length));
  const synth = new SpessaSynthProcessor(SR, { effectsEnabled: false, maxBufferSize: 128 });
  synth.soundBankManager.addSoundBank(bankData, 'gu');
  await synth.processorInitialized;
  const ev = [];
  for (const p of parts) {
    ev.push([0, 0, () => {
      if (p.bank !== 128) synth.controllerChange(p.ch, 0, p.bank || 0);   // drums: put them on channel 9, the GM drum channel
      synth.programChange(p.ch, p.program || 0);
      synth.controllerChange(p.ch, 7, p.vol ?? 100); synth.controllerChange(p.ch, 10, p.pan ?? 64);
      synth.controllerChange(p.ch, 91, 0); synth.controllerChange(p.ch, 93, 0);
    }]);
    for (const [t, c, v] of p.cc || []) ev.push([Math.round(t * SR), 1, () => synth.controllerChange(p.ch, c, Math.max(0, Math.min(127, Math.round(v))))]);
    for (const [t, m, v, d] of p.notes || []) {
      ev.push([Math.round(t * SR), 2, () => synth.noteOn(p.ch, m, Math.max(1, Math.min(127, Math.round(v))))]);
      ev.push([Math.round((t + d) * SR), 0, () => synth.noteOff(p.ch, m)]);
    }
  }
  ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const N = Math.ceil(dur * SR), outs = parts.map(() => buffer(dur)), chIndex = {};
  parts.forEach((p, i) => { chIndex[p.ch] = i; });
  // processSplit writes channel c to outputs[c % outputs.length]: give it 16 pairs and copy the used ones out
  const blk = 128, pairs = Array.from({ length: 16 }, () => [new Float32Array(blk), new Float32Array(blk)]), eL = new Float32Array(blk), eR = new Float32Array(blk);
  let e = 0;
  for (let i = 0; i < N;) {
    while (e < ev.length && ev[e][0] <= i) ev[e++][2]();
    const next = e < ev.length ? ev[e][0] : N, n = Math.max(1, Math.min(blk, next - i, N - i));
    pairs.forEach((pr) => { pr[0].fill(0); pr[1].fill(0); }); eL.fill(0); eR.fill(0);
    synth.processSplit(pairs, eL, eR, 0, n);
    for (const [ch, k] of Object.entries(chIndex)) {
      const [sl, sr] = pairs[ch], [dl, dr] = outs[k];
      for (let j = 0; j < n; j++) { dl[i + j] += sl[j]; dr[i + j] += sr[j]; }
    }
    i += n;
  }
  return outs;
}

/* ------------------------------------------------------------------ helpers for writing parts */
export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function peak(stems) { let p = 0; for (const [L, R] of stems) for (let i = 0; i < L.length; i++) p = Math.max(p, Math.abs(L[i]), Math.abs(R[i])); return p; }
