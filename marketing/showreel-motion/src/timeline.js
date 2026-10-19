/* Shared by the picture (src/*.js) and the soundtrack (audio.js): 120 BPM, 15 s.
   hits / big drive the music; `cues` is the sound-design cue sheet and mirrors the visual events in scenes1-3.js
   (if a time changes there, change it here too).
   Cue formats:
     ['s', t, 'pack/cue', gain, pan, rate]            recorded/library sample from ../sfx-bank
     ['whoosh', t, dur, gain, panFrom, panTo, dir]     smooth air for the camera pushes
     ['swell', tEnd, len, gain]                        riser that lands on tEnd */
window.TL = {
  bpm: 120, beat: 0.5, dur: 15,
  hits: [2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0],
  big: [12.0],
  cues: (function () {
    var c = [], S = function (t, n, g, p, r) { c.push(['s', t, n, g, p || 0, r || 1]); }, A = function () { c.push(Array.prototype.slice.call(arguments)); };
    /* helpers copied from core.js so the odometer ticks land on the digit changes */
    var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; }, prog = function (t, a, b) { return clamp((t - a) / (b - a)); };
    var E1 = 1 - Math.pow(2, -10), expo = function (u) { u = clamp(u); var v = u * u * (3 - 2 * u); return (1 - Math.pow(2, -10 * v)) / E1; };

    /* ---- bar 1 · hook: the lockup comes apart ---- */
    S(0.02, 'studio/swipe', 0.5, 0, 1.1); S(0.30, 'studio/collapse', 0.3, 0, 1.15);
    S(0.55, 'studio/swipe', 0.4, 0.3, 1.3);
    S(1.0, 'studio/expand', 0.45, 0, 1.0);
    for (var i = 0; i < 4; i++) S(1.5 + 0.1 * i, 'studio/progress-step', 0.28, (i - 1.5) * 0.25, 0.9 + 0.1 * i);
    /* ---- bar 2 · kinetic type ---- */
    for (i = 0; i < 6; i++) S(1.86 + 0.045 * i, 'studio/snap', 0.22, (i - 2.5) * 0.14, 1.0 + 0.04 * i);
    S(2.5, 'cinematic/snap', 0.4, 0.3, 1.0); for (i = 0; i < 3; i++) S(2.52 + 0.04 * i, 'studio/press', 0.26, 0.3, 1.1 + 0.1 * i);
    for (i = 0; i < 8; i += 1) S(3.04 + 0.04 * i, 'studio/snap', 0.2, (i - 3.5) * 0.12, 0.95 + 0.04 * i);
    S(3.3, 'studio/open', 0.4, 0, 1.0);
    A('whoosh', 3.4, 0.6, 0.15, -0.2, 0.2, 1);
    /* ---- bar 3 · shape morph ---- */
    S(4.0, 'cinematic/expand', 0.4, 0, 1.0);
    S(4.5, 'studio/swipe', 0.45, -0.3, 1.0); S(4.95, 'studio/snap', 0.4, 0, 0.9);
    S(5.0, 'studio/expand', 0.4, 0, 1.15); S(5.45, 'studio/snap', 0.45, 0, 1.1);
    A('whoosh', 5.42, 0.5, 0.12, 0, 0, 1); S(5.5, 'cinematic/open', 0.4, 0, 1.0);
    S(5.55, 'studio/swipe', 0.3, 0.3, 1.4);
    /* ---- bar 4 · 2D to 3D ---- */
    for (i = 0; i < 6; i++) S(6.02 + 0.05 * i, 'studio/progress-step', 0.16, (i - 2.5) * 0.15, 0.8 + 0.06 * i);
    S(6.45, 'studio/swipe', 0.45, -0.5, 0.9); S(6.85, 'studio/forward', 0.35, 0.3, 1.0);
    S(7.05, 'cinematic/expand', 0.45, 0, 1.0);
    A('whoosh', 7.38, 0.6, 0.11, 0, 0, 1); S(7.5, 'studio/forward', 0.4, 0, 1.0);
    /* ---- bar 5 · data and UI ---- */
    S(8.35, 'studio/drop', 0.4, 0, 1.0); S(8.45, 'studio/collapse', 0.35, 0, 1.1);
    S(8.5, 'studio/swipe', 0.5, 0, 0.9);
    S(8.58, 'studio/select', 0.25, -0.4, 1.2); S(8.66, 'studio/select', 0.25, -0.1, 1.0); S(8.78, 'studio/select', 0.25, 0.2, 1.1);
    var start = [1, 9, 8, 9], end = [2, 0, 0, 5];
    for (var d = 0; d < 4; d++) {
      var v1 = end[d] + (d === 0 ? 0 : 10), prev = Math.floor(start[d]);
      for (var t = 8.86 + d * 0.05; t < 9.4 + d * 0.05 + 0.001; t += 0.002) {
        var v = start[d] + (v1 - start[d]) * expo(prog(t, 8.86 + d * 0.05, 9.4 + d * 0.05)), f = Math.floor(v);
        if (f !== prev) { S(t, 'studio/progress-step', 0.2, (d - 1.5) * 0.3, 1.15 + 0.05 * d + 0.03 * (f % 3)); prev = f; }
      }
    }
    S(9.0, 'studio/forward', 0.45, 0.2, 0.95);
    S(9.5, 'studio/press', 0.4, -0.4, 1.0); S(9.75, 'studio/select', 0.45, 0.4, 1.05); S(9.8, 'glass/success', 0.3, 0, 1.0);
    A('whoosh', 9.45, 0.5, 0.06, -0.3, 0.3, 1);
    /* ---- bar 6 · photo, knock-out type, the push through the A ---- */
    S(10.0, 'cinematic/swipe', 0.45, 0, 1.0); A('whoosh', 10.0, 0.7, 0.18, -0.2, 0.2, 1);
    S(10.72, 'studio/swipe', 0.5, 0, 1.15);
    for (i = 0; i < 8; i++) S(10.94 + 0.04 * i, 'studio/snap', 0.2, (i - 3.5) * 0.12, 0.9 + 0.05 * i);
    A('whoosh', 11.4, 0.6, 0.2, -0.3, 0.3, 1);
    A('swell', 12.0, 1.5, 0.1);
    /* ---- bar 7 · DREAMSCAPE in 3D (the strongest bar) ---- */
    S(12.0, 'cinematic/level-up', 0.45, 0, 1.0); S(12.0, 'glass/success', 0.25, 0, 0.8);
    A('whoosh', 12.0, 0.5, 0.1, -0.5, 0.5, 1);
    for (i = 0; i < 10; i++) S(12.28 + 0.035 * i, 'studio/snap', 0.22, (i - 4.5) * 0.12, 1.0 + 0.04 * i);
    S(12.5, 'studio/reorder', 0.45, 0, 1.0); S(12.6, 'studio/swipe', 0.35, 0.5, 0.9);
    S(13.0, 'cinematic/long-press', 0.4, 0, 1.0); S(13.3, 'studio/collapse', 0.45, 0, 1.0);
    S(13.4, 'studio/swipe', 0.45, 0, 1.1); S(13.9, 'studio/snap', 0.45, 0, 1.0);
    /* ---- end title ---- */
    S(14.0, 'studio/open', 0.45, 0, 1.0); S(14.0, 'cinematic/start', 0.4, 0, 1.0);
    S(14.2, 'studio/select', 0.25, 0.3, 1.4); S(14.35, 'studio/select', 0.28, 0.1, 1.2); S(14.5, 'studio/select', 0.28, 0, 1.1);
    S(14.5, 'glass/complete', 0.3, 0, 1.0);
    return c;
  })()
};
