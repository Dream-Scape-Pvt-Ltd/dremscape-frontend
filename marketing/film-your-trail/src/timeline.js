/* "Your Trail" — shared by the picture (engine.js) and the soundtrack (score.js). All times in seconds.
   The edit follows the voiceover; the music is in 4/4 at 96 BPM (one bar = 2.5 s) and every scene change sits on a bar line. */
window.TL = {
  dur: 32.5, bpm: 96, bar: 2.5,
  /* voiceover: [id, start]; durations come from assets/vo/lines.json (filled in by build.mjs) */
  vo: [['walk', 0.6], ['stay', 2.8], ['since', 5.4], ['tell', 12.9], ['climb', 14.8], ['shape', 17.85],
       ['idea', 20.5], ['talk', 21.85], ['plan', 23.1], ['brand', 25.55], ['beyond', 27.4]],
  /* scene changes (bar lines) */
  cuts: { lastlight: 0, together: 2.5, night: 5.0, golden: 10.0, finder: 12.5, route: 17.5, steps: 20.0, end: 25.0 },
  /* cursor clicks in the finder */
  clicks: [13.75, 14.375, 15.0, 15.625, 16.25],                 /* on the beat (96 BPM from 12.5 s) */
  /* sound design: ['s', t, 'pack/cue', gain, pan, rate] samples from ../sfx-bank; ['whoosh', t, dur, gain, panFrom, panTo] air on the camera moves */
  cues: [
    ['whoosh', 2.22, 0.55, 0.22, 0.6, -0.6], ['whoosh', 4.68, 0.6, 0.2, 0, 0], ['whoosh', 9.72, 0.55, 0.22, 0.6, -0.6],
    ['s', 12.6, 'studio/open', 0.35, 0, 1.0],
    ['s', 13.75, 'studio/press', 0.5, -0.35, 1.0], ['s', 13.8, 'studio/expand', 0.22, -0.35, 1.15],
    ['s', 14.375, 'studio/select', 0.5, -0.35, 1.05], ['s', 14.45, 'studio/collapse', 0.2, -0.35, 1.15],
    ['s', 15.0, 'studio/press', 0.5, 0.0, 1.0], ['s', 15.05, 'studio/expand', 0.22, 0.0, 1.15],
    ['s', 15.625, 'studio/select', 0.5, 0.0, 1.1], ['s', 15.7, 'studio/collapse', 0.2, 0.0, 1.15],
    ['s', 16.25, 'studio/press', 0.55, 0.45, 0.95], ['s', 16.55, 'studio/forward', 0.3, 0.45, 1.0],
    ['s', 19.3, 'studio/drop', 0.3, 0.3, 1.1],
    ['whoosh', 19.72, 0.55, 0.22, 0.6, -0.6],
    ['s', 20.625, 'studio/select', 0.28, -0.4, 1.0], ['s', 21.875, 'studio/select', 0.28, -0.4, 1.1], ['s', 23.125, 'studio/select', 0.28, -0.4, 1.2],
    ['s', 29.375, 'studio/open', 0.3, 0, 1.0]
  ]
};
