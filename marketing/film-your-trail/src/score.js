/* "Your Trail" soundtrack, rendered offline (OfflineAudioContext, 48 kHz stereo).
   Written to the picture: D major, 96 BPM, one bar = 2.5 s, 13 bars; every scene change is a bar line.
     bars 1-2   intro          felt piano motif over low strings, nothing else
     bars 3-5   since 2005     piano left hand opens up, strings swell
     bars 6-7   the website    a soft pulse arrives (kick on 1 and 3, shaker, muted pluck arpeggio)
     bar  8     the route      strings lift
     bars 9-10  your own trip  build: claps on 2 and 4, toms, reversed swell
     bar  11    the logo       resolution on D: low boom, full chord, cymbal
     bars 12-13 end card       piano motif returns and rings out
   The voiceover sits on top and the music ducks about 7 dB under every line. */
window.renderAudio = async function () {
  var TL = window.TL, SR = 48000, DUR = TL.dur + 0.0, BAR = TL.bar, BEAT = BAR / 4, MODE = window.__AUDIO_MODE || 'all';
  var ctx = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR);
  var mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  var seed = 7; var rnd = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  var bt = function (bar, beat) { return (bar - 1) * BAR + (beat || 0) * BEAT; };          /* bar 1-based, beat 0-based */

  /* ---------------- harmony ---------------- */
  var CH = [  // [bass midi, pad voicing, arpeggio tones]
    [38, [50, 57, 64, 66], [62, 66, 69, 74]],          // 1  D(add9)
    [37, [57, 61, 64, 69], [61, 64, 69, 73]],          // 2  A/C#
    [35, [59, 62, 66, 69], [62, 66, 69, 71]],          // 3  Bm7
    [31, [59, 62, 66, 67], [62, 67, 71, 74]],          // 4  Gmaj7
    [42, [57, 62, 66, 69], [62, 66, 69, 74]],          // 5  D/F#
    [43, [55, 59, 62, 67], [62, 67, 71, 74]],          // 6  G
    [45, [57, 61, 64, 69], [61, 64, 69, 73]],          // 7  A
    [47, [59, 62, 66, 69], [62, 66, 69, 71]],          // 8  Bm7
    [43, [55, 59, 62, 67], [62, 67, 71, 74]],          // 9  G
    [45, [57, 62, 64, 69], [62, 64, 69, 74]],          // 10 Asus4 (-> A on beat 3)
    [38, [50, 57, 62, 66, 69], [62, 66, 69, 74]],      // 11 D
    [38, [55, 59, 62, 67], [62, 67, 71, 74]],          // 12 G/D
    [38, [50, 57, 62, 66], [62, 66, 69, 74]]           // 13 D
  ];
  /* piano melody: [bar, beat, midi, beats] — a four-note idea that comes back at the end */
  var MEL = [
    [1, 0, 78, 1.5], [1, 1.5, 81, 0.5], [1, 2, 76, 2],
    [2, 0, 76, 1], [2, 1, 74, 1], [2, 2, 73, 2],
    [3, 0, 74, 1.5], [3, 1.5, 76, 0.5], [3, 2, 78, 2],
    [4, 0, 83, 1.5], [4, 1.5, 81, 0.5], [4, 2, 79, 2],
    [5, 0, 78, 1], [5, 1, 76, 1], [5, 2, 74, 2],
    [6, 0, 74, 1], [6, 1, 79, 1], [6, 2, 83, 1.5], [6, 3.5, 81, 0.5],
    [7, 0, 81, 1.5], [7, 1.5, 76, 0.5], [7, 2, 73, 2],
    [8, 0, 74, 1], [8, 1, 78, 1], [8, 2, 81, 2],
    [9, 0, 83, 1], [9, 1, 81, 0.5], [9, 1.5, 79, 0.5], [9, 2, 78, 2],
    [10, 0, 81, 1], [10, 1, 79, 1], [10, 2, 76, 1], [10, 3, 73, 1],
    [11, 0, 78, 1.5], [11, 1.5, 81, 0.5], [11, 2, 86, 2],
    [12, 0, 83, 2], [12, 2, 81, 2],
    [13, 0, 78, 4]
  ];

  /* ---------------- buses ---------------- */
  var master = ctx.createGain(); master.gain.value = 0.8;
  var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 2.5; comp.attack.value = 0.01; comp.release.value = 0.25;
  var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 30;
  master.connect(hp); hp.connect(comp); comp.connect(ctx.destination);
  function filt(type, f, q, g) { var n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q || 0.7; if (g !== undefined) n.gain.value = g; return n; }
  function pan(p) { var n = ctx.createStereoPanner(); n.pan.value = p; return n; }
  function hall(len, bright) {                                        /* smooth, dark hall: highs decay faster than lows */
    var n = Math.floor(SR * len), buf = ctx.createBuffer(2, n, SR);
    for (var c = 0; c < 2; c++) { var d = buf.getChannelData(c), y = 0; for (var j = 0; j < n; j++) { var k = j / n; y += ((rnd() * 2 - 1) - y) * (bright - (bright - 0.04) * k); d[j] = y * Math.pow(1 - k, 2.2) * (j < SR * 0.012 ? j / (SR * 0.012) : 1); } }
    var cv = ctx.createConvolver(); cv.buffer = buf; return cv;
  }
  /* two halls: one inside the music chain (so the music's tail is ducked with it), one for the voice and the sound design */
  function verb(len, bright, wet, out) {
    var cv = hall(len, bright), inp = ctx.createGain(), o = ctx.createGain(); o.gain.value = wet;
    var pre = ctx.createDelay(0.1); pre.delayTime.value = 0.025; var h = filt('highpass', 180), l = filt('lowpass', 6000);
    inp.connect(pre); pre.connect(h); h.connect(l); l.connect(cv); cv.connect(o); o.connect(out); return inp;
  }
  var mMute = ctx.createGain(); mMute.connect(master);
  var music = ctx.createGain(); music.connect(mMute);                  /* everything musical: ducked under the voice */
  var duck = ctx.createGain(); duck.connect(music);
  var musicIn = ctx.createGain(); musicIn.connect(duck);
  var revIn = verb(3.6, 0.5, 0.42, musicIn);                           /* music hall (feeds back into the ducked chain) */
  var fxRev = verb(2.2, 0.45, 0.35, master);                           /* voice + sound-design room */
  var pianoBus = ctx.createGain(); pianoBus.gain.value = 0.9; var pianoLp = filt('lowpass', 3200, 0.5); pianoBus.connect(pianoLp); pianoLp.connect(musicIn);
  var pianoSend = ctx.createGain(); pianoSend.gain.value = 0.55; pianoLp.connect(pianoSend); pianoSend.connect(revIn);
  var strBus = ctx.createGain(); strBus.gain.value = 0.55; var strLp = filt('lowpass', 2400, 0.5); strBus.connect(strLp); strLp.connect(musicIn);
  var strSend = ctx.createGain(); strSend.gain.value = 0.6; strLp.connect(strSend); strSend.connect(revIn);
  var drumBus = ctx.createGain(); drumBus.gain.value = 0.8; drumBus.connect(musicIn);
  var sfx = ctx.createGain(); sfx.gain.value = 1.5; var sfxSend = ctx.createGain(); sfxSend.gain.value = 0.25;
  var voBus = ctx.createGain(); voBus.gain.value = 1.0;
  var sMute = ctx.createGain(), vMute = ctx.createGain(); sMute.connect(master); vMute.connect(master);
  sfx.connect(sMute); sMute.connect(sfxSend); sfxSend.connect(fxRev);         /* mutes sit before the sends, so stems stay clean */
  if (MODE === 'music') { vMute.gain.value = 0; sMute.gain.value = 0; } else if (MODE === 'vo') { mMute.gain.value = 0; sMute.gain.value = 0; } else if (MODE === 'sfx') { mMute.gain.value = 0; vMute.gain.value = 0; }

  /* overall music dynamics across the film (section levels) */
  var dyn = [[0, 1.25], [5, 1.05], [12.5, 0.85], [17.5, 0.82], [20, 0.66], [24.3, 0.7], [24.9, 0.9], [25.4, 0.78], [27.5, 0.85], [32.5, 0.75]];
  music.gain.setValueAtTime(dyn[0][1], 0); dyn.slice(1).forEach(function (d) { music.gain.linearRampToValueAtTime(d[1], d[0]); });

  var nb = ctx.createBuffer(1, SR * 2, SR), nd = nb.getChannelData(0); for (var k = 0; k < nd.length; k++) nd[k] = rnd() * 2 - 1;
  function noise(t, d) { var s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; s.start(t, rnd() * 1.5); s.stop(t + d); return s; }

  /* ---------------- instruments ---------------- */
  /* felt piano: slightly inharmonic partials, softer and darker at low velocity, each partial decaying at its own rate */
  function piano(t, m, vel, beats, p) {
    var f0 = mtof(m), dur = beats * BEAT, out = ctx.createGain(), pn = pan(p || 0); out.connect(pn); pn.connect(pianoBus);
    var T0 = Math.max(1.4, Math.min(6.5, 4.2 * Math.pow(261.6 / f0, 0.45))), B = 0.00012 * Math.pow(f0 / 261.6, 0.6), bright = 1400 + 2600 * vel;
    var stop = t + dur + 0.35;                                        /* damper: notes stop shortly after their written length */
    for (var n = 1; n <= 14; n++) {
      var fn = n * f0 * Math.sqrt(1 + B * n * n); if (fn > 9000) break;
      var a = vel * Math.pow(n, -1.15) * Math.exp(-fn / bright) * 0.16; if (a < 0.0004) continue;
      var tau = T0 / (1 + 0.42 * (n - 1));
      [-0.35, 0.35].forEach(function (cents, j) {
        if (n > 5 && j) return;
        var o = ctx.createOscillator(); o.frequency.value = fn; o.detune.value = n <= 5 ? cents : 0;
        var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a * (n <= 5 ? 0.5 : 1), t + 0.006);
        g.gain.setTargetAtTime(a * (n <= 5 ? 0.5 : 1) * 0.55, t + 0.006, tau * 0.18);    /* quick initial drop ... */
        g.gain.setTargetAtTime(0, t + 0.12, tau);                                          /* ... then the long tail */
        g.gain.setTargetAtTime(0, t + dur, 0.09);                                          /* damper */
        o.connect(g); g.connect(out); o.start(t); o.stop(stop + 0.3);
      });
    }
    var h = noise(t, 0.03), hb = filt('bandpass', 900 + 1600 * vel, 0.8), hg = ctx.createGain();          /* felt hammer */
    hg.gain.setValueAtTime(0.0001, t); hg.gain.linearRampToValueAtTime(0.012 * vel, t + 0.002); hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    h.connect(hb); hb.connect(hg); hg.connect(out);
  }
  /* string section pad: three detuned saws per voice, dark low-pass, slow bow */
  function strings(t, notes, dur, lvl, att, rel) {
    notes.forEach(function (m, i) {
      var vo = ctx.createGain(), pn = pan(((i % 2) ? 1 : -1) * (0.15 + 0.12 * i)); vo.connect(pn); pn.connect(strBus);
      var lp = filt('lowpass', 900 + 90 * (m - 48), 0.4); lp.connect(vo);
      [-7, 0, 6].forEach(function (dc) {
        var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = dc;
        var lfo = ctx.createOscillator(); lfo.frequency.value = 4.6 + rnd() * 0.8; var lg = ctx.createGain(); lg.gain.value = 3.5; lfo.connect(lg); lg.connect(o.detune);
        o.connect(lp); o.start(t); o.stop(t + dur + rel + 0.1); lfo.start(t); lfo.stop(t + dur + rel + 0.1);
      });
      var a = lvl * 0.035 / Math.sqrt(notes.length);
      vo.gain.setValueAtTime(0, t); vo.gain.linearRampToValueAtTime(a, t + att); vo.gain.setValueAtTime(a, t + dur); vo.gain.linearRampToValueAtTime(0, t + dur + rel);
    });
  }
  function bass(t, m, dur, lvl) {                                     /* warm sine bass with a little body */
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(); o.frequency.value = mtof(m); o2.type = 'triangle'; o2.frequency.value = mtof(m) * 2;
    var g = ctx.createGain(), g2 = ctx.createGain(); g2.gain.value = 0.18; var lp = filt('lowpass', 420, 0.5);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.04); g.gain.setTargetAtTime(lvl * 0.7, t + 0.05, 0.6); g.gain.setTargetAtTime(0, t + dur, 0.12);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(musicIn); o.start(t); o.stop(t + dur + 0.8); o2.start(t); o2.stop(t + dur + 0.8);
  }
  function pluck(t, m, lvl, p) {                                      /* muted kalimba-like pluck for the pulse */
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 3.01;
    var g = ctx.createGain(), g2 = ctx.createGain(); g2.gain.value = 0.12; var lp = filt('lowpass', 2600, 0.6), pn = pan(p);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.004); g.gain.setTargetAtTime(0, t + 0.006, 0.11);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(pn); pn.connect(musicIn); o.start(t); o.stop(t + 0.9); o2.start(t); o2.stop(t + 0.9);
  }
  function kick(t, lvl) {
    var o = ctx.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.09);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.004); g.gain.setTargetAtTime(0, t + 0.01, 0.11);
    o.connect(g); g.connect(drumBus); o.start(t); o.stop(t + 0.7);
  }
  function shaker(t, lvl, p) {
    var n = noise(t, 0.12), f = filt('bandpass', 7000, 1.2), g = ctx.createGain(), pn = pan(p);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.012); g.gain.setTargetAtTime(0, t + 0.02, 0.025);
    n.connect(f); f.connect(g); g.connect(pn); pn.connect(drumBus);
  }
  function clap(t, lvl) {
    [0, 0.011, 0.022].forEach(function (d, i) {
      var n = noise(t + d, 0.3), f = filt('bandpass', 1500, 0.8), g = ctx.createGain();
      g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(lvl * (i === 2 ? 1 : 0.6), t + d + 0.002); g.gain.setTargetAtTime(0, t + d + 0.004, i === 2 ? 0.06 : 0.008);
      n.connect(f); f.connect(g); g.connect(drumBus); g.connect(revIn);
    });
  }
  function tom(t, f0, lvl) {
    var o = ctx.createOscillator(); o.frequency.setValueAtTime(f0 * 1.6, t); o.frequency.exponentialRampToValueAtTime(f0, t + 0.05);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.004); g.gain.setTargetAtTime(0, t + 0.01, 0.16);
    o.connect(g); g.connect(drumBus); g.connect(revIn); o.start(t); o.stop(t + 1);
  }
  function swell(tEnd, len, lvl) {                                    /* reversed-cymbal air into a downbeat */
    var t0 = tEnd - len, n = noise(t0, len + 0.02), h = filt('highpass', 2500, 0.5), l = filt('lowpass', 1200, 0.5), g = ctx.createGain();
    l.frequency.setValueAtTime(1200, t0); l.frequency.exponentialRampToValueAtTime(11000, tEnd);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(lvl, tEnd - 0.02); g.gain.linearRampToValueAtTime(0, tEnd);
    n.connect(h); h.connect(l); l.connect(g); g.connect(musicIn); g.connect(revIn);
  }
  function boom(t, lvl) {                                             /* the logo lands: deep tuned thump + soft cymbal */
    var o = ctx.createOscillator(); o.frequency.setValueAtTime(mtof(38) * 1.5, t); o.frequency.exponentialRampToValueAtTime(mtof(26), t + 0.25);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.01); g.gain.setTargetAtTime(0, t + 0.03, 0.55);
    o.connect(g); g.connect(musicIn); o.start(t); o.stop(t + 3);
    var n = noise(t, 3), h = filt('highpass', 4200, 0.5), c = ctx.createGain();
    c.gain.setValueAtTime(0, t); c.gain.linearRampToValueAtTime(lvl * 0.06, t + 0.01); c.gain.setTargetAtTime(0, t + 0.02, 0.9);
    n.connect(h); h.connect(c); c.connect(musicIn); c.connect(revIn);
  }
  function whoosh(t, dur, lvl, p0, p1) {                              /* air for the whip pans */
    var n = noise(t, dur + 0.1), bp = filt('bandpass', 600, 0.6), g = ctx.createGain(), pn = ctx.createStereoPanner();
    bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.5); bp.frequency.exponentialRampToValueAtTime(700, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(lvl, t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    pn.pan.setValueAtTime(p0, t); pn.pan.linearRampToValueAtTime(p1, t + dur);
    n.connect(bp); bp.connect(g); g.connect(pn); pn.connect(sfx);
  }

  /* ---------------- arrangement ---------------- */
  var bars = Math.round(DUR / BAR);
  for (var b = 1; b <= bars; b++) {
    var c = CH[b - 1], t0 = bt(b), last = b === bars;
    /* strings: from bar 1 low and soft, opening up later */
    var sl = b <= 2 ? 0.55 : b <= 5 ? 0.8 : b <= 8 ? 0.9 : b <= 10 ? 0.85 : b === 11 ? 1.15 : 0.95;
    if (b === 10) { strings(t0, c[1], BAR / 2, sl, 0.5, 0.4); strings(t0 + BAR / 2, [57, 61, 64, 69], BAR / 2, sl, 0.2, 0.5); }
    else strings(t0, c[1], last ? BAR + 0.5 : BAR, sl, b === 1 ? 1.6 : 0.7, last ? 2.2 : 0.6);
    /* bass: whole notes; from the pulse on it follows the kick */
    if (b >= 3) bass(t0, c[0], BAR - 0.1, b >= 6 ? 0.11 : 0.09);
    /* piano left hand: open fifths early, broken eighths from bar 3 */
    if (b <= 2) { piano(t0, c[0] + 12, 0.35, 4, -0.2); piano(t0 + BEAT * 0.02, c[0] + 19, 0.28, 4, -0.15); }
    else if (b < 11 || b === 12) {
      var lh = [c[0] + 12, c[0] + 19, c[0] + 24, c[0] + 19];
      for (var e = 0; e < 8; e++) piano(t0 + e * BEAT / 2, lh[e % 4] + (e >= 4 && e % 4 === 2 ? 0 : 0), 0.24 + 0.05 * (e % 2 === 0), 0.5, -0.25);
    } else { piano(t0, c[0], 0.5, 4, -0.2); piano(t0, c[0] + 12, 0.45, 4, -0.15); piano(t0, c[0] + 19, 0.35, 4, -0.1); }
    /* pulse: bars 6-10 */
    if (b >= 6 && b <= 10) {
      for (var q = 0; q < 4; q++) {
        if (q % 2 === 0 || b >= 9) kick(t0 + q * BEAT, b >= 9 ? 0.2 : 0.19);
        shaker(t0 + q * BEAT + BEAT / 2, 0.022, 0.3); if (b >= 8) shaker(t0 + q * BEAT, 0.012, -0.3);
        if (b >= 9 && (q === 1 || q === 3)) clap(t0 + q * BEAT, 0.055);
      }
      var arp = c[2]; for (var a8 = 0; a8 < 8; a8++) pluck(t0 + a8 * BEAT / 2, arp[[0, 1, 2, 3, 2, 1, 2, 3][a8]] + 12, 0.045 + (a8 % 2 ? 0 : 0.012), a8 % 2 ? 0.35 : -0.35);
    }
    if (b === 10) { [2, 2.5, 3, 3.5].forEach(function (x, i) { tom(t0 + x * BEAT, [110, 98, 87, 73][i], 0.16 + 0.03 * i); }); swell(bt(11), 2.2, 0.045); }
    if (b === 11) boom(t0, 0.5);
  }
  MEL.forEach(function (n) {                                          /* melody: velocity follows the section */
    var v = n[0] <= 2 ? 0.5 : n[0] <= 5 ? 0.55 : n[0] <= 10 ? 0.6 : n[0] === 11 ? 0.75 : 0.55;
    piano(bt(n[0], n[1]), n[2], v, n[3], 0.12);
    if (n[0] === 11 || n[0] === 13) piano(bt(n[0], n[1]), n[2] - 12, v * 0.7, n[3], 0.05);   /* octave doubling on the resolution */
  });

  /* ---------------- voiceover + ducking ---------------- */
  var VO = {};
  Object.keys(window.VO_RAW || {}).forEach(function (k) {
    var bin = atob(window.VO_RAW[k]), u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    var f32 = new Float32Array(u8.buffer), b = ctx.createBuffer(1, f32.length, 24000); b.getChannelData(0).set(f32); VO[k] = b;
  });
  var voComp = ctx.createDynamicsCompressor(); voComp.threshold.value = -20; voComp.ratio.value = 3; voComp.attack.value = 0.005; voComp.release.value = 0.12; voComp.knee.value = 6;
  var voHp = filt('highpass', 85, 0.6), voPres = filt('peaking', 3200, 0.9, 2.5), voLow = filt('lowshelf', 180, 0.7, 1.5), voAir = filt('highshelf', 9000, 0.7, -2);
  voBus.connect(voHp); voHp.connect(voLow); voLow.connect(voPres); voPres.connect(voAir); voAir.connect(voComp); voComp.connect(vMute);
  var voRoom = ctx.createGain(); voRoom.gain.value = 0.08; vMute.connect(voRoom); voRoom.connect(fxRev);
  duck.gain.setValueAtTime(1, 0);
  TL.vo.forEach(function (v) {
    var b = VO[v[0]]; if (!b) return;
    var s = ctx.createBufferSource(); s.buffer = b; var g = ctx.createGain(); g.gain.value = 2.2; s.connect(g); g.connect(voBus); s.start(v[1]);
    var end = v[1] + b.duration;
    duck.gain.setTargetAtTime(['talk', 'plan', 'idea'].indexOf(v[0]) >= 0 ? 0.3 : ['brand', 'beyond'].indexOf(v[0]) >= 0 ? 0.34 : 0.45, v[1] - 0.18, 0.06); duck.gain.setTargetAtTime(1, end + 0.1, 0.22);
  });

  /* ---------------- sound design ---------------- */
  var BANK = {};
  Object.keys(window.SFX_BANK || {}).forEach(function (k) {
    var bin = atob(window.SFX_BANK[k]), u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    var f32 = new Float32Array(u8.buffer), buf = ctx.createBuffer(1, f32.length, SR); buf.getChannelData(0).set(f32); BANK[k] = buf;
  });
  TL.cues.forEach(function (c) {
    if (c[0] === 'whoosh') whoosh(c[1], c[2], c[3], c[4], c[5]);
    else if (c[0] === 's' && BANK[c[2]]) { var s = ctx.createBufferSource(); s.buffer = BANK[c[2]]; s.playbackRate.value = c[5] || 1; var g = ctx.createGain(); g.gain.value = c[3] * 1.1; var pn = pan(c[4] || 0); s.connect(g); g.connect(pn); pn.connect(sfx); s.start(c[1]); }
  });

  var buf = await ctx.startRendering();
  var L = buf.getChannelData(0), R = buf.getChannelData(1), peak = 0;
  for (var z = 0; z < L.length; z++) peak = Math.max(peak, Math.abs(L[z]), Math.abs(R[z]));
  var norm = 0.89 / (MODE === 'all' ? peak : (window.__REF_PEAK || peak) || 1), fade = Math.floor(SR * 1.2), out = new Int16Array(L.length * 2);
  for (var y = 0; y < L.length; y++) {
    var f = y > L.length - fade ? Math.pow((L.length - y) / fade, 1.6) : 1;
    out[2 * y] = Math.max(-32768, Math.min(32767, Math.round(L[y] * norm * f * 32767)));
    out[2 * y + 1] = Math.max(-32768, Math.min(32767, Math.round(R[y] * norm * f * 32767)));
  }
  var bytes = new Uint8Array(out.buffer), s2 = '';
  for (var x = 0; x < bytes.length; x += 0x8000) s2 += String.fromCharCode.apply(null, bytes.subarray(x, x + 0x8000));
  return { pcm: btoa(s2), sr: SR, peak: peak, frames: L.length };
};
