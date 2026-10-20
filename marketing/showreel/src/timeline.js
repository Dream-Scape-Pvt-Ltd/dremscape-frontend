/* Shared by the picture (engine.js) and the soundtrack (music.mjs + score.js): authored at 120 BPM over 15 s.
   hits / big / clicks / typed / air drive both and mirror the visual events in engine.js
   (if a time changes in engine.js, change it here too).
   The score and the sound design are rendered by music.mjs (real instruments, keystrokes, mouse clicks) and mixed by
   src/score.js. One sound per meaningful event only: clicks, choices, the typing, the send, the logo landing. */
window.TL = {
  bpm: 120, beat: 0.5, dur: 15, k: 1.7,   /* authored at 120 BPM / 15 s, played k times slower: about 71 BPM / 25.5 s */
  hits: [2.0, 4.5, 7.0, 9.0, 11.0, 12.0],       /* scene changes */
  big: [11.0, 12.0],                             /* Send Inquiry click, logo lands */
  clicks: [2.5, 3.0, 3.5, 4.0, 4.25, 5.0, 6.0, 9.5, 11.0],
  /* the visitor types "Langtang Valley" at a person's pace: per-key gaps in real seconds (shift on L and V, a beat
     before the space, a double l). Converted to authored time below; engine.js shows the letters, music.mjs plays the keys */
  typed: (function () {
    var text = 'Langtang Valley', gap = [0, 0.14, 0.085, 0.09, 0.11, 0.08, 0.085, 0.075, 0.13, 0.16, 0.11, 0.085, 0.1, 0.08, 0.095], t = 0, out = [];
    for (var i = 0; i < text.length; i++) { t += gap[i] * 0.95; out.push([9.80 + t / 1.7, text.charAt(i)]); }
    return out;
  })(),
  /* soft air on the real scene changes only: [authored start, authored end, gain, panFrom, panTo] */
  air: [[1.5, 2.05, 0.07, 0, 0], [6.5, 7.45, 0.085, 0.6, -0.6], [11.45, 12.0, 0.06, 0, 0]]
};
