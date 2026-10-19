/* Shared by the picture (engine.js) and the soundtrack (audio.js): 120 BPM, 15 s.
   hits / big / clicks drive both; `cues` is the sound-design cue sheet and mirrors the visual events in engine.js
   (if a time changes in engine.js, change it here too).
   Cue formats (played by ../sfx-bank/engine.js):
     ['s', t, 'pack/cue', gain, pan, rate]            library sample from ../sfx-bank
     ['whoosh', t, dur, gain, panFrom, panTo, dir]     smooth air
     ['swell', tEnd, len, gain]                        riser that lands on tEnd
   One sound per meaningful event only: clicks, menus opening, the send, the logo landing. No hover ticks, no glitter. */
window.TL = {
  bpm: 120, beat: 0.5, dur: 15, k: 1.6,   /* authored at 120 BPM / 15 s, played k times slower: 75 BPM / 24 s */
  hits: [2.0, 4.5, 7.0, 9.0, 11.0, 12.0],       /* scene changes */
  big: [11.0, 12.0],                             /* Send Inquiry click, logo lands */
  clicks: [2.5, 3.0, 3.5, 4.0, 4.25, 5.0, 6.0, 9.5, 11.0],
  /* [type, time, ...args]
     tap t g | key t g | tick t midi g | hover t | swish t pan dur g | whoosh t dur g panFrom panTo dir
     pop t dir g | chime t [midi..] g | success t | shimmer t dur g | scan t dur | land t
     swipe t dur panFrom panTo dir g | send t | keyshift t g pan | key/space t g pan row | flip t g */
  cues: (function () {
    var c = [], S = function (t, n, g, p, r) { c.push(['s', t, n, g, p || 0, r || 1]); }, A = function () { c.push(Array.prototype.slice.call(arguments)); };
    /* ---- hook: the headline settles ---- */
    S(0.04, 'studio/swipe', 0.4, -0.2, 1.1); S(1.0, 'studio/expand', 0.3, 0, 1.1); S(1.5, 'studio/swipe', 0.4, 0.2, 1.2);
    /* ---- find: Destination -> Nepal, Difficulty -> Normal, Find my trek ---- */
    S(2.0, 'studio/open', 0.4, 0, 1.0);
    S(2.5, 'studio/press', 0.55, -0.15, 1.0); S(2.54, 'studio/open', 0.3, -0.15, 1.1);
    S(3.0, 'studio/select', 0.55, -0.1, 1.0); S(3.08, 'studio/close', 0.3, -0.1, 1.1);
    S(3.5, 'studio/press', 0.55, 0.1, 1.0); S(3.54, 'studio/open', 0.3, 0.1, 1.1);
    S(4.0, 'studio/select', 0.55, 0.15, 1.05); S(4.08, 'studio/close', 0.3, 0.15, 1.1);
    S(4.25, 'studio/press', 0.65, 0.2, 0.95); S(4.3, 'studio/forward', 0.4, 0.2, 1.0);
    /* ---- corner: header, Treks menu, Langtang, the photo opens up ---- */
    S(4.5, 'studio/expand', 0.4, 0, 1.0);
    S(5.0, 'studio/press', 0.55, 0.25, 1.0); S(5.04, 'studio/open', 0.4, 0.2, 1.0);
    S(6.0, 'studio/select', 0.55, -0.2, 1.0); S(6.05, 'studio/swipe', 0.35, 0, 1.0);
    S(6.5, 'studio/expand', 0.4, 0, 1.15);
    A('whoosh', 6.9, 0.5, 0.12, 0.7, -0.7, 1); S(6.96, 'studio/swipe', 0.45, 0, 0.9);
    /* ---- yours: three steps ---- */
    S(7.5, 'studio/open', 0.3, 0, 1.1);
    S(8.0, 'studio/progress-step', 0.35, -0.1, 1.0); S(8.5, 'studio/progress-step', 0.35, 0.1, 1.15);
    /* ---- payoff: the form, typing, Send ---- */
    S(9.0, 'studio/expand', 0.45, 0, 1.1);
    S(9.5, 'studio/press', 0.5, 0, 1.0);
    var TYPED = 'Langtang Valley', KEYS = ['studio/typing', 'minimal/typing', 'soft/typing'];
    for (var k = 0; k < TYPED.length; k++) {
      var tt = 9.8733 + k / 30, sp = TYPED.charAt(k) === ' ';
      S(tt, KEYS[(k * 7) % 3], (sp ? 1.5 : 1.15) + 0.35 * ((k * 5) % 4) / 4, (k % 5 - 2) * 0.05, (sp ? 0.78 : 0.95 + 0.1 * ((k * 3) % 5) / 4));
    }
    S(10.8, 'studio/press', 0.45, 0.2, 1.0);
    S(11.0, 'studio/press', 0.65, 0.2, 0.9); S(11.03, 'studio/send', 0.6, 0.1, 1.0); S(11.16, 'glass/success', 0.5, 0, 1.0);
    A('whoosh', 11.5, 0.5, 0.15, -0.2, 0.2, 1);
    /* ---- end: the logo lands, the title assembles ---- */
    S(12.0, 'cinematic/level-up', 0.5, 0, 1.0); S(12.0, 'cinematic/drop', 0.6, 0, 1.0); S(12.02, 'glass/complete', 0.3, 0, 0.9);
    S(12.5, 'studio/open', 0.3, 0, 1.0); S(13.0, 'studio/select', 0.28, 0, 1.1); S(13.5, 'studio/select', 0.28, 0, 1.2);
    S(14.0, 'studio/swipe', 0.35, 0, 1.2); S(14.05, 'glass/select', 0.3, 0, 1.0);
    S(14.5, 'studio/select', 0.3, 0, 1.3); S(14.5, 'glass/notification', 0.25, 0, 1.0);
    return c;
  })()
};
