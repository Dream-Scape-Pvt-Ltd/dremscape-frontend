/* Shared by the picture (src/*.js, authored on a 15 s / 120 BPM grid) and the soundtrack (../sfx-bank/engine.js).
   Everything here is in authored seconds; the film is played k times slower (24 s / 75 BPM).
   Cue formats:
     ['s', t, 'pack/cue', gain, pan, rate]            library sample from ../sfx-bank
     ['whoosh', t, dur, gain, panFrom, panTo, dir]     smooth air
     ['swell', tEnd, len, gain]                        riser that lands on tEnd
   Every cue mirrors a visual event: the dot's landings, the stairs, the type, the chart, the peaks, the panels, the letters. */
window.TL = {
  bpm: 120, beat: 0.5, dur: 15, k: 1.6,
  hits: [2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0],
  big: [12.0],
  cues: (function () {
    var c = [], S = function (t, n, g, p, r) { c.push(['s', t, n, g, p || 0, r || 1]); }, A = function () { c.push(Array.prototype.slice.call(arguments)); };
    var HOP = 0.36, land = function (t, i) { S(t + HOP, 'studio/select', 0.26, (i % 4 - 1.5) * 0.18, 1.0 + 0.06 * (i % 5)); };      /* the dot lands: a soft tick, one per beat */
    /* ---- bar 1 · the poster comes apart ---- */
    S(0.3, 'studio/swipe', 0.4, -0.2, 1.1); S(0.55, 'studio/collapse', 0.3, 0, 1.15);
    S(1.0, 'studio/expand', 0.45, 0, 1.0); for (var i = 0; i < 4; i++) S(1.38 + 0.05 * i, 'studio/drop', 0.2, (i - 1.5) * 0.2, 1.0 + 0.05 * i);
    land(1.0, 0); land(1.5, 1);
    /* ---- bar 2 · type on the steps ---- */
    land(2.0, 2); land(2.5, 3); land(3.0, 4); land(3.5, 5);
    S(2.0, 'studio/press', 0.4, -0.3, 1.0); S(2.5, 'studio/press', 0.4, -0.3, 1.1); S(3.0, 'studio/press', 0.4, -0.3, 1.2); S(3.5, 'glass/select', 0.35, 0, 1.0);
    /* ---- bar 3 · 2D to 3D ---- */
    S(3.95, 'cinematic/expand', 0.45, 0, 1.0); S(4.3, 'studio/swipe', 0.4, -0.4, 0.9);
    land(4.5, 6); land(5.0, 7); land(5.5, 8);
    S(5.0, 'studio/forward', 0.3, 0.3, 1.0); S(5.55, 'studio/collapse', 0.4, 0, 1.0);
    /* ---- bar 4 · four peaks ---- */
    S(6.0, 'cinematic/drop', 0.4, 0, 1.0);
    for (i = 0; i < 4; i++) {
      var tb = 6.0 + 0.5 * i;
      S(tb + 0.04, 'studio/expand', 0.3, (i - 1.5) * 0.25, 1.1 + 0.05 * i);
      for (var j = 0; j < 3; j++) S(tb + 0.12 + 0.1 * j, 'studio/progress-step', 0.15, (i - 1.5) * 0.25, 1.15 + 0.09 * j + 0.03 * i);
      land(tb, 9 + i);
    }
    /* ---- bar 5 · peaks, sunrise ---- */
    S(8.0, 'cinematic/swipe', 0.45, 0, 1.0); A('swell', 9.0, 0.9, 0.06);
    S(8.5, 'glass/level-up', 0.3, 0, 0.9); S(9.0, 'cinematic/open', 0.4, 0, 1.0); A('whoosh', 9.5, 0.55, 0.08, -0.2, 0.2, -1);
    /* ---- bar 6 · three real moments ---- */
    for (i = 0; i < 4; i++) { S(10.0 + 0.5 * i, 'studio/swipe', 0.3, (i - 1.5) * 0.25, 1.1); S(10.0 + 0.5 * i + 0.26, 'studio/drop', 0.4, (i - 1.5) * 0.25, 1.0); }
    S(11.0, 'studio/select', 0.28, -0.3, 1.0); S(11.12, 'studio/select', 0.28, 0, 1.1); S(11.24, 'studio/select', 0.28, 0.3, 1.2);
    A('swell', 12.0, 1.4, 0.1);
    /* ---- bar 7 · DREAMSCAPE ---- */
    S(12.0, 'cinematic/level-up', 0.45, 0, 1.0); S(12.0, 'glass/success', 0.22, 0, 0.8); A('whoosh', 12.0, 0.5, 0.1, -0.5, 0.5, 1);
    for (i = 0; i < 10; i++) S(12.28 + 0.035 * i, 'studio/snap', 0.2, (i - 4.5) * 0.12, 1.0 + 0.04 * i);
    S(12.5, 'studio/reorder', 0.45, 0, 1.0); S(12.6, 'studio/swipe', 0.35, 0.5, 0.9);
    S(13.0, 'cinematic/long-press', 0.4, 0, 1.0); S(13.3, 'studio/collapse', 0.45, 0, 1.0); S(13.4, 'studio/swipe', 0.4, 0, 1.1);
    /* ---- end title ---- */
    S(13.9, 'studio/drop', 0.4, -0.5, 1.0); S(14.0, 'studio/open', 0.45, -0.3, 1.0); S(14.0, 'cinematic/start', 0.4, 0, 1.0);
    S(14.2, 'studio/select', 0.25, 0.3, 1.4); S(14.35, 'studio/select', 0.28, 0.1, 1.2); S(14.5, 'studio/select', 0.28, 0, 1.1);
    S(14.5, 'glass/complete', 0.3, 0, 1.0);
    return c;
  })()
};
