/* Shared by the picture (engine.js) and the soundtrack (audio.js): 120 BPM, 15 s.
   hits / big / clicks drive both; `cues` is the sound-design cue sheet and mirrors the visual events in engine.js
   (if a time changes in engine.js, change it here too). */
window.TL = {
  bpm: 120, beat: 0.5, dur: 15,
  hits: [2.0, 4.5, 7.0, 9.0, 11.0, 12.0],       /* scene changes */
  big: [11.0, 12.0],                             /* Send Inquiry click, logo lands */
  clicks: [2.5, 3.0, 3.5, 4.0, 4.25, 5.0, 6.0, 9.5, 11.0],
  /* [type, time, ...args]
     tap t g | key t g | tick t midi g | hover t | swish t pan dur g | whoosh t dur g panFrom panTo dir
     pop t dir g | chime t [midi..] g | success t | shimmer t dur g | scan t dur | land t
     swipe t dur panFrom panTo dir g | send t | keyshift t g pan | key/space t g pan row | flip t g */
  cues: (function () {
    var c = [];
    var add = function () { c.push(Array.prototype.slice.call(arguments)); };
    /* ---- hook ---- */
    add('swish', 0.04, -0.3, 0.22, 0.5); add('tick', 0.30, 93, 0.05); add('swish', 0.52, 0.3, 0.22, 0.5);
    add('swish', 1.0, 0, 0.2, 0.35); add('whoosh', 1.0, 0.5, 0.09, -0.5, 0.5, 1);
    add('whoosh', 1.5, 0.5, 0.13, -0.6, 0.6, 1); add('swipe', 1.56, 0.32, -0.5, 0.5, 1, 0.5);
    /* ---- finder ---- */
    add('pop', 2.0, 1, 0.09);
    [78, 81, 83, 86].forEach(function (m, i) { add('tick', 2.10 + i * 0.055, m, 0.05); });
    add('tap', 2.5, 0.9); add('pop', 2.5, 1, 0.1);
    [81, 83, 86].forEach(function (m, i) { add('tick', 2.54 + i * 0.035, m, 0.03); });
    add('tick', 2.76, 88, 0.05);
    add('tap', 3.0, 0.9); add('chime', 3.0, [81, 88], 0.09); add('swish', 3.02, 0.2, 0.18, 0.3); add('pop', 3.1, -1, 0.07);
    add('whoosh', 3.3, 0.3, 0.05, -0.3, 0.3, 1);
    add('tap', 3.5, 0.9); add('pop', 3.5, 1, 0.1);
    [78, 81, 83, 86, 88].forEach(function (m, i) { add('tick', 3.535 + i * 0.035, m, 0.028); });
    add('tick', 3.8, 90, 0.05);
    add('tap', 4.0, 0.9); add('chime', 4.0, [83, 90], 0.09); add('swish', 4.02, 0.2, 0.18, 0.3); add('pop', 4.1, -1, 0.07);
    add('tap', 4.25, 1.15); add('whoosh', 4.3, 0.3, 0.09, 0.6, -0.6, -1); add('swipe', 4.3, 0.28, 0.6, -0.6, -1, 0.45); add('pop', 4.52, -1, 0.09); add('swipe', 4.42, 0.5, 0.3, 0.6, 1, 0.22); add('tick', 4.55, 90, 0.05);
    /* ---- corner ---- */
    add('whoosh', 4.5, 0.45, 0.08, 0, 0, 1); add('whoosh', 4.55, 0.35, 0.05, 0.5, -0.2, 1); add('tick', 4.86, 86, 0.05);
    add('tap', 5.0, 0.9); add('pop', 5.0, 1, 0.1); add('whoosh', 5.0, 0.4, 0.07, 0, 0, -1);
    add('swish', 5.06, -0.3, 0.2, 0.3); add('swish', 5.10, -0.2, 0.2, 0.3);
    [74, 78, 81, 83, 86, 90].forEach(function (m, i) { add('tick', 5.12 + i * 0.045, m, 0.03); });
    add('flip', 5.04, 0.05);
    add('shimmer', 5.16, 0.4, 0.03);
    add('hover', 2.92); add('hover', 3.92); add('hover', 5.38); add('hover', 5.64); add('hover', 5.80);
    add('tap', 6.0, 0.9); add('swipe', 6.0, 0.3, 0, 0, 1, 0.5);
    add('whoosh', 6.3, 0.6, 0.13, 0, 0, 1);
    add('whoosh', 6.94, 0.5, 0.13, 0.8, -0.8, 1); add('swipe', 6.98, 0.4, 0.9, -0.9, -1, 0.7); add('shimmer', 7.0, 0.8, 0.035);
    /* ---- yours ---- */
    add('swish', 7.5, -0.3, 0.22, 0.5); add('swish', 7.58, -0.2, 0.22, 0.5); add('tick', 7.66, 93, 0.05);
    add('swish', 7.72, -0.2, 0.18, 0.35); add('tick', 7.96, 86, 0.04);
    add('swish', 8.10, -0.2, 0.18, 0.35); add('tick', 8.30, 88, 0.04);
    add('swish', 8.50, -0.2, 0.18, 0.35); add('tick', 8.70, 90, 0.04);
    [8.62, 8.67, 8.72, 8.77].forEach(function (x) { add('swipe', x, 0.22, -0.2, -0.4, -1, 0.28); });
    /* ---- payoff ---- */
    add('scan', 9.0, 0.48); add('whoosh', 9.0, 0.4, 0.08, 0.3, -0.3, 1);
    add('tap', 9.5, 0.9); add('tick', 9.72, 90, 0.04);
    /* typing "Langtang Valley" at 30 chars/s: shift for the capitals, the space bar, per-key position + pitch */
    var TYPED = 'Langtang Valley', KB = { q: [0, 1], w: [1, 1], e: [2, 1], r: [3, 1], t: [4, 1], y: [5, 1], u: [6, 1], i: [7, 1], o: [8, 1], p: [9, 1],
      a: [0, 2], s: [1, 2], d: [2, 2], f: [3, 2], g: [4, 2], h: [5, 2], j: [6, 2], k: [7, 2], l: [8, 2], z: [0, 3], x: [1, 3], c: [2, 3], v: [3, 3], b: [4, 3], n: [5, 3], m: [6, 3] };
    for (var k = 0; k < TYPED.length; k++) {
      var ch = TYPED.charAt(k), tt = 9.8733 + k / 30, lo = ch.toLowerCase(), pos = KB[lo] || [4.5, 4];
      if (ch !== lo) add('keyshift', tt - 0.022, 0.8, pos[0] < 5 ? 0.35 : -0.35);
      add(ch === ' ' ? 'space' : 'key', tt, 0.8 + 0.35 * ((k * 7) % 5) / 5, (pos[0] / 9 - 0.5) * 0.7, pos[1]);
    }
    add('tap', 11.0, 1.2); add('send', 11.03); add('success', 11.12); add('tick', 11.22, 93, 0.05);
    add('whoosh', 11.5, 0.5, 0.12, -0.2, 0.2, 1);
    add('land', 12.0); add('shimmer', 12.0, 1.4, 0.05); add('whoosh', 12.0, 0.5, 0.05, 0, 0, 1);
    add('swish', 12.5, 0.3, 0.22, 0.4); add('swish', 13.0, 0, 0.22, 0.4); add('swish', 13.5, -0.3, 0.22, 0.4);
    add('swish', 14.0, 0, 0.22, 0.45); add('chime', 14.02, [86, 93], 0.07); add('tick', 14.2, 95, 0.03);
    add('swish', 14.5, 0.3, 0.2, 0.35); add('chime', 14.5, [81, 90, 93], 0.06); add('shimmer', 14.5, 0.5, 0.03);
    return c;
  })()
};
