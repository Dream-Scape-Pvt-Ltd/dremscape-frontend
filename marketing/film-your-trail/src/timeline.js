/* "Your Trail" — shared by the picture (engine.js), the music (music.mjs) and the mix (score.js). All times in seconds.
   The edit follows the voiceover; the music is in 4/4 at 96 BPM (one bar = 2.5 s) and every scene change sits on a bar line. */
window.TL = {
  dur: 32.5, bpm: 96, bar: 2.5,
  /* voiceover: [id, start]; durations come from assets/vo/lines.json (filled in by build.mjs) */
  vo: [['walk', 0.6], ['stay', 2.8], ['since', 5.4], ['tell', 12.9], ['climb', 14.8], ['shape', 17.85],
       ['idea', 20.5], ['talk', 21.85], ['plan', 23.1], ['brand', 25.55], ['beyond', 27.4]],
  /* camera glides along the page: [bar line, target spread x]. Each one leaves 0.5 s before the bar line and settles
     0.6 s after it, quick out of the old spread and slow into the new one */
  glides: [[2.5, 1920], [5.0, 3840], [10.0, 5760], [12.5, 8160]],
  glideIn: 0.5, glideOut: 0.6, drift: 30,
  /* on-screen actions (each one gets a sound, nothing else does) */
  ui: {
    pickRegion: 14.375, pickLevel: 15.625, merge: 16.25, press: 17.0, open: 17.1,
    disc: [19.55, 20.35],                       /* the route's end pin blooms into a gold ring that opens the steps page */
    steps: [20.625, 21.875, 23.125],
    rise: [24.4, 25.3],                         /* the forest page rises for the logo */
    cta: 28.4
  }
};
