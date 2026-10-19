/* Soundtrack synthesised with the Web Audio API (OfflineAudioContext). 120 BPM, D major, 15 s.
   Warm and open: a soft kick on every beat (its pitch follows the chord root), a hit on every scene change,
   a musical ping on every cursor click. Sine / triangle voices only, consonant chord tones, no detuned saws. */
window.renderAudio = async function () {
  var TL = window.TL, SR = 48000, DUR = TL.dur, BEAT = TL.beat, MODE = window.__AUDIO_MODE || 'all';   /* 'music' | 'sfx' | 'all' (mix analysis) */
  var ctx = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR);
  var mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  var seed = 20050607;                                    /* seeded so every render is identical */
  var rnd = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  /* ---------- harmony: D | A | Bm | G | D | G A | D (resolves on the logo) ---------- */
  var SEG = [
    { t0: 0, t1: 2, root: 38, pad: [50, 57, 64, 66], arp: [74, 78, 81, 86], mel: [[0.25, 78], [0.75, 81], [1.25, 78], [1.75, 74]], g: 0.07 },
    { t0: 2, t1: 4, root: 33, pad: [52, 57, 61, 64], arp: [73, 76, 81, 85], mel: [[2.25, 76], [2.75, 81], [3.25, 85], [3.75, 81]], g: 0.1 },
    { t0: 4, t1: 6, root: 35, pad: [54, 59, 62, 66], arp: [74, 78, 83, 86], mel: [[4.25, 78], [4.75, 83], [5.25, 86], [5.75, 83]], g: 0.1 },
    { t0: 6, t1: 8, root: 31, pad: [55, 59, 62, 67], arp: [74, 79, 83, 86], mel: [[6.25, 79], [6.75, 83], [7.25, 86], [7.75, 83]], g: 0.1 },
    { t0: 8, t1: 10, root: 38, pad: [50, 57, 62, 66], arp: [74, 78, 81, 86], mel: [[8.25, 78], [8.75, 81], [9.25, 86], [9.75, 81]], g: 0.11 },
    { t0: 10, t1: 11, root: 31, pad: [55, 59, 62, 67], arp: [74, 79, 83, 86], mel: [[10.25, 79], [10.75, 83]], g: 0.11 },
    { t0: 11, t1: 12, root: 33, pad: [52, 57, 61, 64], arp: [73, 76, 81, 85], mel: [[11.25, 85], [11.75, 81]], g: 0.11 },
    { t0: 12, t1: 15, root: 38, pad: [50, 57, 62, 66], arp: [74, 78, 81, 86], mel: [[12.0, 86], [12.5, 81], [13.0, 78], [13.5, 74], [14.0, 78], [14.5, 81]], g: 0.09 }
  ];
  var segAt = function (t) { for (var i = SEG.length - 1; i >= 0; i--) if (t >= SEG[i].t0 - 1e-6) return SEG[i]; return SEG[0]; };

  /* ---------- buses ---------- */
  var master = ctx.createGain(); master.gain.value = 0.9;
  var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 42; hp.Q.value = 0.6;
  var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 12500; lp.Q.value = 0.5;
  var comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 2.4; comp.attack.value = 0.012; comp.release.value = 0.2;
  master.connect(hp); hp.connect(lp); lp.connect(comp); comp.connect(ctx.destination);

  function impulse(len) {            /* dark plate: highs die away first */
    var n = Math.floor(SR * len), buf = ctx.createBuffer(2, n, SR);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c), y = 0;
      for (var j = 0; j < n; j++) { var k = j / n; y += ((rnd() * 2 - 1) * Math.pow(1 - k, 2.6) - y) * (0.85 - 0.75 * k); d[j] = y; }
    }
    return buf;
  }
  var rev = ctx.createConvolver(); rev.buffer = impulse(2.2);
  var revIn = ctx.createGain(); revIn.gain.value = 0.7;
  var revHp = ctx.createBiquadFilter(); revHp.type = 'highpass'; revHp.frequency.value = 240;
  var revOut = ctx.createGain(); revOut.gain.value = 0.5;
  revIn.connect(revHp); revHp.connect(rev); rev.connect(revOut); revOut.connect(master);

  var busLp = ctx.createBiquadFilter(); busLp.type = 'lowpass'; busLp.frequency.value = 3000; busLp.Q.value = 0.5; busLp.connect(master);   /* music keeps below the glassy UI band */
  var bus = ctx.createGain(); bus.connect(busLp);             /* pad + bass + arp: gently ducked by the kick */
  var busRev = ctx.createGain(); busRev.gain.value = 0.38; bus.connect(busRev); busRev.connect(revIn);
  var leadLp = ctx.createBiquadFilter(); leadLp.type = 'lowpass'; leadLp.frequency.value = 3400; leadLp.Q.value = 0.5; leadLp.connect(master);
  var lead = ctx.createGain(); lead.connect(leadLp);            /* bells / melody / pings: never ducked */
  var leadRev = ctx.createGain(); leadRev.gain.value = 0.55; lead.connect(leadRev); leadRev.connect(revIn);
  var sfx = ctx.createGain(); sfx.gain.value = 1.0; sfx.connect(master);   /* UI sound design: dry + a little plate */
  var sfxRev = ctx.createGain(); sfxRev.gain.value = 0.32; sfx.connect(sfxRev); sfxRev.connect(revIn);
  for (var b = 0; b < DUR / BEAT; b++) { var tb = b * BEAT; bus.gain.setValueAtTime(0.66, tb); bus.gain.linearRampToValueAtTime(1, tb + 0.2); }
  TL.hits.forEach(function (th) { bus.gain.setValueAtTime(0.4, th); bus.gain.linearRampToValueAtTime(1, th + 0.45); });

  var nb = ctx.createBuffer(1, SR * 2, SR), nd = nb.getChannelData(0);
  for (var k = 0; k < nd.length; k++) nd[k] = rnd() * 2 - 1;
  function noise(t, dur) { var s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; s.start(t, rnd()); s.stop(t + dur); return s; }
  function env(node, t, a, peak, d) {
    node.gain.setValueAtTime(0.0001, t); node.gain.linearRampToValueAtTime(peak, t + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t + a + d); return node;
  }
  function pan(p) { var n = ctx.createStereoPanner(); n.pan.value = p; return n; }
  function filt(type, f, q) { var n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q || 0.7; return n; }

  /* ---------- voices ---------- */
  /* soft round kick; the tail lands on the chord root so it never fights the harmony */
  function kick(t, g, rootHz, big) {
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(125, t); o.frequency.exponentialRampToValueAtTime(rootHz, t + 0.075);
    var e = ctx.createGain(); env(e, t, 0.003, g, big ? 0.42 : 0.27);
    o.connect(e); e.connect(master); o.start(t); o.stop(t + 0.6);
    var n = noise(t, 0.02), f = filt('bandpass', 2200, 0.8), ne = ctx.createGain(); env(ne, t, 0.001, 0.07 * g, 0.012);
    n.connect(f); f.connect(ne); ne.connect(master);
  }
  function shaker(t, g, p) {
    var n = noise(t, 0.2), f = filt('bandpass', 6200, 0.9), e = ctx.createGain(); env(e, t, 0.005, g, 0.05);
    n.connect(f); f.connect(e); e.connect(pan(p || 0)).connect(master);
  }
  function clap(t, g) {              /* soft, low-passed clap */
    [0, 0.012, 0.025].forEach(function (dt, i) {
      var n = noise(t + dt, 0.3), f = filt('bandpass', 1700, 0.7), l = filt('lowpass', 4200, 0.5);
      var e = ctx.createGain(); env(e, t + dt, 0.002, g * (i === 2 ? 1 : 0.55), i === 2 ? 0.12 : 0.025);
      n.connect(f); f.connect(l); l.connect(e); e.connect(master); e.connect(revIn);
    });
  }
  function bass(t, m, len, g) {      /* sine + a touch of triangle, no resonance */
    var f = mtof(m), o = ctx.createOscillator(), o2 = ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f;
    var g2 = ctx.createGain(), l = filt('lowpass', 240, 0.5); g2.gain.value = 0.3;
    var e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + 0.012);
    e.gain.setValueAtTime(g, t + len * 0.55); e.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(e); o2.connect(g2); g2.connect(l); l.connect(e); e.connect(bus);
    o.start(t); o.stop(t + len + 0.05); o2.start(t); o2.stop(t + len + 0.05);
  }
  function pad(t, notes, len, g) {   /* sine + triangle, slow attack, very gentle detune */
    notes.forEach(function (m, i) {
      [0, 1].forEach(function (j) {
        var o = ctx.createOscillator(); o.type = j ? 'triangle' : 'sine'; o.frequency.value = mtof(m); o.detune.value = j ? 4 : -3;
        var l = filt('lowpass', 1500, 0.4);
        var e = ctx.createGain(), peak = g * (j ? 0.55 : 1);
        e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(peak, t + 0.45);
        e.gain.setValueAtTime(peak, t + len - 0.1); e.gain.linearRampToValueAtTime(0.0001, t + len + 0.55);
        o.connect(l); l.connect(e); e.connect(pan((i - 1.5) * 0.28)).connect(bus);
        o.start(t); o.stop(t + len + 0.7);
      });
    });
  }
  /* marimba / kalimba-style pluck: harmonic partials only, so it always sits in the key */
  function bell(t, m, g, p, len, to) {
    var f = mtof(m), out = ctx.createGain(); out.gain.value = 1;
    [[1, 1, 1], [2, 0.28, 0.32], [4, 0.07, 0.12]].forEach(function (pt) {
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * pt[0];
      var e = ctx.createGain(); env(e, t, 0.003, g * pt[1], (len || 0.9) * pt[2]);
      o.connect(e); e.connect(out); o.start(t); o.stop(t + (len || 0.9) + 0.1);
    });
    var l = filt('lowpass', 4800, 0.5); out.connect(l); l.connect(pan(p || 0)).connect(to || lead);
  }
  function impact(t, big, rootM) {   /* tuned thump on the chord root + soft air, instead of a pitch-sweeping boom */
    var f = mtof(rootM + 12), o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f * 1.04, t); o.frequency.exponentialRampToValueAtTime(f * 0.97, t + 0.5);
    var e = ctx.createGain(); env(e, t, 0.004, big ? 0.55 : 0.4, big ? 0.95 : 0.55);
    o.connect(e); e.connect(master); o.start(t); o.stop(t + 1.4);
    var n = noise(t, 1.2), h = filt('highpass', 1400, 0.5), l = filt('lowpass', 7000, 0.5), ne = ctx.createGain();
    env(ne, t, 0.003, big ? 0.1 : 0.06, big ? 0.7 : 0.35); n.connect(h); h.connect(l); l.connect(ne); ne.connect(master); ne.connect(revIn);
  }
  function stab(t, notes, g) {       /* bright chord on the hit so scene changes sound musical */
    notes.forEach(function (m, i) { bell(t + i * 0.012, m, g, (i - 1.5) * 0.3, 1.5); });
  }
  function swell(tEnd, len, g) {     /* reverse-cymbal air: low-pass opens, no resonant siren */
    var t0 = tEnd - len, n = noise(t0, len + 0.05), l = filt('lowpass', 300, 0.4), h = filt('highpass', 200, 0.5), e = ctx.createGain();
    l.frequency.setValueAtTime(300, t0); l.frequency.exponentialRampToValueAtTime(6500, tEnd);
    e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, tEnd - 0.01); e.gain.linearRampToValueAtTime(0.0001, tEnd);
    n.connect(h); h.connect(l); l.connect(e); e.connect(master); e.connect(revIn);
  }
  function whoosh(t, p) {
    var n = noise(t, 0.5), l = filt('lowpass', 500, 0.4), h = filt('highpass', 250, 0.5), e = ctx.createGain();
    l.frequency.setValueAtTime(500, t); l.frequency.exponentialRampToValueAtTime(3600, t + 0.2);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(0.05, t + 0.09); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    n.connect(h); h.connect(l); l.connect(e); e.connect(pan(p)).connect(master);
  }


  /* ---------- UI sound design (Apple-style: soft, tactile, glassy, never harsh) ---------- */
  function sine(t, f0, f1, dur, g, to, a) {      /* pitched blip with an exponential glide and a soft envelope */
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7);
    var e = ctx.createGain(); env(e, t, a || 0.002, g, dur); o.connect(e); e.connect(to || sfx); o.start(t); o.stop(t + dur + (a || 0.002) + 0.05);
  }
  function tap(t, g) {                           /* glass tap: soft body thock + a rounded high click */
    var v = 0.97 + rnd() * 0.06;
    sine(t, 210 * v, 118 * v, 0.055, g * 0.5);
    sine(t, 2900 * v, 1900 * v, 0.018, g * 0.32);
    sine(t, 5600 * v, 4200 * v, 0.008, g * 0.08);
    var n = noise(t, 0.02), f = filt('bandpass', 4300, 1.1), e = ctx.createGain(); env(e, t, 0.001, g * 0.12, 0.006);
    n.connect(f); f.connect(e); e.connect(sfx);
  }
  /* Premium keyboard: every press is a soft key-down + a lighter key-up, placed and pitched by where the key sits.
     Muted plastic "tk" (band-passed noise) + a hollow body tone + a low cushion; the space bar is deeper and longer. */
  function key(t, g, p, row) {
    var v = 0.94 + rnd() * 0.12, r = row || 2, body = 640 - (r - 1) * 70;
    var pn = ctx.createStereoPanner(); pn.pan.value = p || 0; pn.connect(sfx);
    sine(t, body * v, body * 0.74 * v, 0.022, g * 0.11, pn); sine(t, 150 * v, 108 * v, 0.032, g * 0.2, pn);
    var n = noise(t, 0.03), f = filt('bandpass', 2000 * v, 1.3), e = ctx.createGain(); env(e, t, 0.001, g * 0.15, 0.011);
    n.connect(f); f.connect(e); e.connect(pn);
    var u = t + 0.045 + rnd() * 0.01;                                    /* key-up: lighter and higher */
    sine(u, body * 1.25 * v, body * v, 0.012, g * 0.045, pn);
    var n2 = noise(u, 0.02), f2 = filt('bandpass', 3000, 1.2), e2 = ctx.createGain(); env(e2, u, 0.001, g * 0.05, 0.007);
    n2.connect(f2); f2.connect(e2); e2.connect(pn);
  }
  function space(t, g, p) {
    var pn = ctx.createStereoPanner(); pn.pan.value = p || 0; pn.connect(sfx);
    sine(t, 330, 210, 0.05, g * 0.2, pn); sine(t, 110, 78, 0.07, g * 0.34, pn);
    var n = noise(t, 0.04), f = filt('bandpass', 1500, 1.0), e = ctx.createGain(); env(e, t, 0.001, g * 0.17, 0.016); n.connect(f); f.connect(e); e.connect(pn);
    var u = t + 0.06; sine(u, 520, 400, 0.014, g * 0.05, pn);
  }
  function keyshift(t, g, p) { var pn = ctx.createStereoPanner(); pn.pan.value = p || 0; pn.connect(sfx); sine(t, 260, 190, 0.03, g * 0.12, pn); var n = noise(t, 0.02), f = filt('bandpass', 1300, 1.0), e = ctx.createGain(); env(e, t, 0.001, g * 0.09, 0.01); n.connect(f); f.connect(e); e.connect(pn); }
  /* Swipe: a finger dragging across glass. Fast soft attack, sibilant band that slides, stereo travel with the gesture. */
  function swipe(t, dur, p0, p1, dir, g) {
    var n = noise(t, dur + 0.1), bp = filt('bandpass', 3400, 0.75), hp = filt('highpass', 1200, 0.5), e = ctx.createGain(), pn = ctx.createStereoPanner();
    bp.frequency.setValueAtTime(dir > 0 ? 2200 : 5200, t); bp.frequency.exponentialRampToValueAtTime(dir > 0 ? 5600 : 2000, t + dur);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g * 0.11, t + dur * 0.22); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    pn.pan.setValueAtTime(p0, t); pn.pan.linearRampToValueAtTime(p1, t + dur);
    n.connect(hp); hp.connect(bp); bp.connect(e); e.connect(pn); pn.connect(sfx);
    sine(t, dir > 0 ? 520 : 900, dir > 0 ? 900 : 520, dur * 0.8, g * 0.03, sfx, dur * 0.2);   /* soft body of the gesture */
  }
  /* Send: the "message sent" gesture - a soft upward whoosh with a tiny pop at the start and a light flutter at the end. */
  function send(t) {
    pop(t, 1, 0.1);
    whoosh(t + 0.02, 0.42, 0.1, -0.1, 0.5, 1); swipe(t + 0.03, 0.36, -0.1, 0.5, 1, 0.55);
    sine(t + 0.34, 1760, 1760, 0.12, 0.02, sfx);
  }
  function flip(t, g) { sine(t, 880, 1320, 0.05, g * 0.5); sine(t + 0.04, 1320, 1760, 0.05, g * 0.3); }
  function hover(t) { sine(t, 4200, 3800, 0.014, 0.05); }
  function tick(t, m, g) { bell(t, m, g, (rnd() - 0.5) * 0.5, 0.2, sfx); }
  function swish(t, p, dur, g) {                 /* small airy movement */
    var n = noise(t, dur + 0.1), bp = filt('bandpass', 1500, 0.8), e = ctx.createGain();
    bp.frequency.setValueAtTime(1400, t); bp.frequency.exponentialRampToValueAtTime(3300, t + dur);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g * 0.07, t + dur * 0.4); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp); bp.connect(e); e.connect(pan(p)).connect(sfx);
  }
  function whoosh(t, dur, g, p0, p1, dir) {      /* smooth travelling air; filters sweep, pan travels */
    var n = noise(t, dur + 0.1), lo = filt('lowpass', 400, 0.45), hi = filt('highpass', 190, 0.5), e = ctx.createGain(), pn = ctx.createStereoPanner();
    var a = dir > 0 ? 380 : 5200, b = dir > 0 ? 5200 : 380;
    lo.frequency.setValueAtTime(a, t); lo.frequency.exponentialRampToValueAtTime(b, t + dur);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + dur * 0.42); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    pn.pan.setValueAtTime(p0, t); pn.pan.linearRampToValueAtTime(p1, t + dur);
    n.connect(hi); hi.connect(lo); lo.connect(e); e.connect(pn); pn.connect(sfx);
    var o = ctx.createOscillator(); o.type = 'sine';                          /* faint tonal whisper that follows the sweep */
    o.frequency.setValueAtTime(dir > 0 ? mtof(62) : mtof(74), t); o.frequency.exponentialRampToValueAtTime(dir > 0 ? mtof(74) : mtof(62), t + dur);
    var oe = ctx.createGain(); oe.gain.setValueAtTime(0.0001, t); oe.gain.linearRampToValueAtTime(g * 0.12, t + dur * 0.45); oe.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(oe); oe.connect(pn); o.start(t); o.stop(t + dur + 0.05);
  }
  function pop(t, dir, g) {                      /* popover opening (rising) / closing (falling) */
    if (dir > 0) { sine(t, 300, 560, 0.09, g * 0.6); sine(t + 0.01, 900, 1300, 0.05, g * 0.2); }
    else { sine(t, 520, 280, 0.09, g * 0.55); }
    var n = noise(t, 0.05), f = filt('bandpass', 2600, 0.9), e = ctx.createGain(); env(e, t, 0.003, g * 0.08, 0.03);
    n.connect(f); f.connect(e); e.connect(sfx);
  }
  function chime(t, notes, g) { notes.forEach(function (m, i) { bell(t + i * 0.075, m, g, (i % 2 ? 0.25 : -0.25), 0.8, sfx); }); }
  function success(t) {                          /* confirmation: bright rising major arpeggio with a long tail */
    [81, 86, 90, 93].forEach(function (m, i) { bell(t + i * 0.07, m, 0.15 - i * 0.015, (i - 1.5) * 0.3, 1.8, sfx); });
    bell(t, 62, 0.07, 0, 1.6, sfx); bell(t, 66, 0.05, 0, 1.6, sfx);
    shimmer(t + 0.22, 1.0, 0.03);
  }
  function shimmer(t, dur, g) {                  /* soft glitter of D-major pentatonic partials */
    var N = Math.max(3, Math.round(dur * 12)), P = [86, 88, 90, 93, 95, 98];
    for (var i = 0; i < N; i++) bell(t + rnd() * dur, P[Math.floor(rnd() * P.length)], g * (0.4 + 0.6 * rnd()), rnd() * 1.6 - 0.8, 0.3 + rnd() * 0.3, sfx);
  }
  function scan(t, dur) {                        /* unfolding card: a rising run of glass ticks over soft air */
    var P = [74, 76, 78, 81, 83, 86, 88, 90, 93, 95];
    P.forEach(function (m, i) { bell(t + (i / (P.length - 1)) * dur * 0.92, m, 0.03, -0.5 + i * 0.11, 0.25, sfx); });
    whoosh(t, dur, 0.04, -0.2, 0.2, 1);
  }
  function land(t) {                             /* logo arrives: warm open chord + deep tuned thump */
    [62, 66, 69, 74, 78].forEach(function (m, i) { bell(t + i * 0.014, m, 0.075, (i - 2) * 0.28, 2.4, sfx); });
    sine(t, mtof(38), mtof(38) * 0.96, 1.1, 0.5, master, 0.006);
  }

  /* ---------- arrangement ---------- */
  if (MODE !== 'sfx') SEG.forEach(function (s, i) {
    pad(s.t0, s.pad, (s.t1 - s.t0) + (i === SEG.length - 1 ? 0 : 0.1), i === 0 ? 0.1 : 0.125);
    s.mel.forEach(function (n) { bell(n[0], n[1], s.g * 1.25 * (n[0] === 12.0 ? 1.25 : 1), n[1] % 2 ? 0.25 : -0.25, n[0] >= 14.5 ? 2.2 : 1.0); });
  });
  var nBeats = Math.round(DUR / BEAT), ARP = [0, 1, 2, 1, 3, 2, 1, 2];
  for (var bt = 0; bt < (MODE === 'sfx' ? 0 : nBeats); bt++) {
    var t = bt * BEAT, sg = segAt(t), rootHz = mtof(sg.root);
    var big = TL.big.some(function (x) { return Math.abs(x - t) < 1e-6; });
    kick(t, big ? 0.7 : 0.5, rootHz, big);
    shaker(t + 0.25, 0.04, 0.25);
    if (t >= 2.0) { shaker(t + 0.125, 0.022, -0.3); shaker(t + 0.375, 0.026, 0.3); }
    if (t >= 4.0 && (bt % 4 === 1 || bt % 4 === 3) && t < 14.9) clap(t, t >= 12 ? 0.11 : 0.17);
    if (t >= 2.0) {                                           /* gentle bass on the off-beat, root then octave */
      bass(t + 0.25, sg.root + (bt % 2 ? 12 : 0), 0.24, 0.34);
      if (bt % 4 === 2) bass(t, sg.root, 0.2, 0.2);
      /* soft arpeggio an octave under the melody */
      bell(t + 0.25, sg.arp[ARP[(bt * 2 + 1) % 8]] - 12, 0.022, bt % 2 ? -0.35 : 0.35, 0.4, bus);
      bell(t, sg.arp[ARP[(bt * 2) % 8]] - 12, 0.018, bt % 2 ? 0.3 : -0.3, 0.4, bus);
    }
  }
  /* scene-change hits: tuned thump + chord stab, with an airy swell leading in */
  if (MODE !== 'sfx') TL.hits.forEach(function (th) {
    var isBig = TL.big.indexOf(th) >= 0, s = segAt(th);
    impact(th, isBig, s.root);
    stab(th, [s.arp[0], s.arp[1], s.arp[2]], isBig ? 0.095 : 0.055);
    swell(th, th === 2.0 ? 0.95 : th === 12.0 ? 0.5 : 0.42, th === 2.0 ? 0.07 : 0.06);
  });
  /* UI sound design: every cue mirrors a visual event (see timeline.js) */
  var VOICE = {
    tap: function (c) { tap(c[1], c[2] === undefined ? 1 : c[2]); }, key: function (c) { key(c[1], (c[2] === undefined ? 1 : c[2]) * 2.4, c[3], c[4]); },
    space: function (c) { space(c[1], (c[2] || 1) * 2.4, c[3]); }, keyshift: function (c) { keyshift(c[1], (c[2] || 1) * 2.4, c[3]); },
    swipe: function (c) { swipe(c[1], c[2], c[3], c[4], c[5], (c[6] === undefined ? 0.5 : c[6]) * 1.6); }, send: function (c) { send(c[1]); }, flip: function (c) { flip(c[1], (c[2] || 0.05) * 2); },
    tick: function (c) { tick(c[1], c[2], (c[3] || 0.04) * 2.4); }, hover: function (c) { hover(c[1]); },
    swish: function (c) { swish(c[1], c[2] || 0, c[3] || 0.2, (c[4] === undefined ? 0.4 : c[4]) * 1.5); },
    whoosh: function (c) { whoosh(c[1], c[2], c[3] * 1.8, c[4], c[5], c[6]); }, pop: function (c) { pop(c[1], c[2], (c[3] || 0.08) * 1.5); },
    chime: function (c) { chime(c[1], c[2], (c[3] || 0.08) * 0.8); }, success: function (c) { success(c[1]); },
    shimmer: function (c) { shimmer(c[1], c[2], (c[3] || 0.03) * 1.6); }, scan: function (c) { scan(c[1], c[2]); }, land: function (c) { land(c[1]); }
  };
  if (MODE !== 'music') TL.cues.forEach(function (c) { if (VOICE[c[0]]) VOICE[c[0]](c); });

  var buf = await ctx.startRendering();
  var L = buf.getChannelData(0), R = buf.getChannelData(1), peak = 0;
  for (var q = 0; q < L.length; q++) peak = Math.max(peak, Math.abs(L[q]), Math.abs(R[q]));
  var norm = 0.7 / (MODE === 'all' ? peak : (window.__REF_PEAK || peak) || 1), fade = Math.floor(SR * 0.35), out = new Int16Array(L.length * 2);
  for (var z = 0; z < L.length; z++) {
    var f = z > L.length - fade ? Math.pow((L.length - z) / fade, 1.5) : 1;
    out[2 * z] = Math.max(-32768, Math.min(32767, Math.round(L[z] * norm * f * 32767)));
    out[2 * z + 1] = Math.max(-32768, Math.min(32767, Math.round(R[z] * norm * f * 32767)));
  }
  var bytes = new Uint8Array(out.buffer), s2 = '';
  for (var y = 0; y < bytes.length; y += 0x8000) s2 += String.fromCharCode.apply(null, bytes.subarray(y, y + 0x8000));
  return { pcm: btoa(s2), sr: SR, peak: peak, frames: L.length };
};
