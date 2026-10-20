// Keyboard and mouse sounds, synthesised from how a key actually sounds: the switch's click, the keycap bottoming out
// (a short knock through the plate's resonances, a low "thock" from the case), then a softer, brighter knock as the
// key comes back up 70-120 ms later. Every key gets its own resonances, level and timing, so no two strokes repeat.
import { SR, rng } from './kit.mjs';

/* one damped resonator (two-pole), excited by x, added into y */
function ring(y, i0, x, f, decay, g) {
  const r = Math.exp(-1 / (decay * SR)), w = 2 * Math.PI * f / SR, a1 = -2 * r * Math.cos(w), a2 = r * r, b0 = (1 - r * r) * 0.5;
  let y1 = 0, y2 = 0;
  const n = Math.min(y.length - i0, Math.ceil(decay * SR * 7));
  for (let i = 0; i < n; i++) {
    const v = b0 * (x[i] || 0) - a1 * y1 - a2 * y2; y2 = y1; y1 = v;
    y[i0 + i] += v * g;
  }
}
function burst(R, ms, color = 0.6) {               // a short noise burst, slightly low-passed
  const n = Math.max(2, Math.round(ms * SR / 1000)), x = new Float32Array(n); let lp = 0;
  for (let i = 0; i < n; i++) { lp += ((R() * 2 - 1) - lp) * color; x[i] = lp * Math.pow(1 - i / n, 1.5); }
  return x;
}
function knock(out, t, R, o) {
  const i0 = Math.round(t * SR);
  if (i0 < 0 || i0 >= out[0].length) return;
  const mono = new Float32Array(Math.min(out[0].length - i0, Math.round(0.25 * SR)));
  const ex = burst(R, o.burst, o.color);
  o.modes.forEach(([f, d, g]) => ring(mono, 0, ex, f * (1 + (R() - 0.5) * 0.08), d * (0.85 + R() * 0.3), g));
  const th = burst(R, 3, 0.15);                      // case "thock"
  ring(mono, 0, th, o.thock * (1 + (R() - 0.5) * 0.1), o.thockDecay, o.thockGain);
  for (let i = 0; i < Math.min(ex.length, mono.length); i++) mono[i] += ex[i] * o.click;   // the switch's own tick
  const pan = o.pan, gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < mono.length; i++) { out[0][i0 + i] += mono[i] * o.gain * gl; out[1][i0 + i] += mono[i] * o.gain * gr; }
}

/* a key press on a low-profile keyboard. o.space for the space bar, o.shift adds the shift key just before */
export function keystroke(out, t, seed, o = {}) {
  const R = rng(seed), g = (o.gain ?? 1) * Math.pow(10, ((R() - 0.5) * 3.5) / 20), pan = (o.pan ?? 0.1) + (R() - 0.5) * 0.25;
  const big = !!o.space;
  const down = {
    burst: big ? 2.0 : 1.2, color: 0.85, click: 0.12, pan, gain: g,
    modes: big ? [[1250, 0.02, 4], [2300, 0.014, 3.2], [3900, 0.009, 2]] : [[1900 + R() * 500, 0.016, 4.2], [3400 + R() * 700, 0.011, 3.6], [5600 + R() * 900, 0.007, 2.2]],
    thock: big ? 190 : 290 + R() * 90, thockDecay: big ? 0.026 : 0.014, thockGain: big ? 0.9 : 0.35,
  };
  knock(out, t, R, down);
  knock(out, t + 0.006 + R() * 0.004, R, { ...down, gain: g * 0.45, click: 0.05, modes: down.modes.map(([f, d, a]) => [f * 0.82, d, a]) });   // bottoming out
  if (big) [0.011, 0.023].forEach((dt) => knock(out, t + dt, R, { ...down, gain: g * 0.18, thockGain: 0.4 }));                                // stabiliser rattle
  const up = t + (big ? 0.11 : 0.075) + R() * 0.045;
  knock(out, up, R, { ...down, gain: g * 0.32, click: 0.25, thockGain: 0.4, modes: down.modes.map(([f, d, a]) => [f * 1.15, d * 0.7, a]) });
}

/* a mouse button: small, high, very short; press and release */
export function mouseClick(out, t, seed, o = {}) {
  const R = rng(seed), g = o.gain ?? 1, pan = o.pan ?? 0.15;
  const m = { burst: 0.7, color: 0.9, click: 0.15, pan, gain: g, modes: [[3800 + R() * 400, 0.007, 4], [6200 + R() * 600, 0.005, 2.4], [2400, 0.008, 1.4]], thock: 520, thockDecay: 0.008, thockGain: 0.2 };
  knock(out, t, R, m);
  knock(out, t + 0.085 + R() * 0.02, R, { ...m, gain: g * 0.4, modes: m.modes.map(([f, d, a]) => [f * 1.1, d * 0.8, a]) });
}
