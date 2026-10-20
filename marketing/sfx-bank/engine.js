/* Soundtrack for the motion showreel (OfflineAudioContext). 120 BPM, D major, 15 s.
   Score: soft kick on every beat (pitch follows the chord root), a tuned hit on every scene change, a riser into the last full bar.
   Sound design: CC0 library samples from ../sfx-bank placed by the cue sheet in timeline.js, plus smooth air for the camera pushes. */
window.renderAudio = async function () {
  var TL = window.TL, SR = 48000, K = TL.k || 1, DUR = TL.dur * K, BEAT = TL.beat * K, MODE = window.__AUDIO_MODE || 'all';   /* 'music' | 'sfx' | 'all' (mix analysis) */
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
  SEG.forEach(function (s) { s.t0 *= K; s.t1 *= K; s.mel = s.mel.map(function (n) { return [n[0] * K, n[1]]; }); });   /* the picture is retimed by K (calmer pace): scale the score with it */
  var HITS = TL.hits.map(function (x) { return x * K; }), BIG = TL.big.map(function (x) { return x * K; });
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
  HITS.forEach(function (th) { bus.gain.setValueAtTime(0.4, th); bus.gain.linearRampToValueAtTime(1, th + 0.45); });

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

  function whoosh(t, dur, g, p0, p1, dir) {      /* smooth travelling air for the camera pushes: filters sweep, pan travels */
    var n = noise(t, dur + 0.1), lo = filt('lowpass', 400, 0.45), hi = filt('highpass', 190, 0.5), e = ctx.createGain(), pn = ctx.createStereoPanner();
    var a = dir > 0 ? 380 : 5200, b = dir > 0 ? 5200 : 380;
    lo.frequency.setValueAtTime(a, t); lo.frequency.exponentialRampToValueAtTime(b, t + dur);
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + dur * 0.42); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    pn.pan.setValueAtTime(p0, t); pn.pan.linearRampToValueAtTime(p1, t + dur);
    n.connect(hi); hi.connect(lo); lo.connect(e); e.connect(pn); pn.connect(sfx);
  }

  /* ---------- library samples ---------- */
  var BANK = {};
  Object.keys(window.SFX_BANK || {}).forEach(function (k) {
    var bin = atob(window.SFX_BANK[k]), u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    var f32 = new Float32Array(u8.buffer), b = ctx.createBuffer(1, f32.length, SR); b.getChannelData(0).set(f32); BANK[k] = b;
  });
  var sfxLp = filt('lowpass', 7500, 0.5); sfxLp.connect(sfx);
  function smp(t, name, g, p, rate) {
    var b = BANK[name]; if (!b) { console.warn('missing sample', name); return; }
    var s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = rate || 1;
    var e = ctx.createGain(); e.gain.value = g * 1.15; var pn = ctx.createStereoPanner(); pn.pan.value = p || 0;
    s.connect(e); e.connect(pn); pn.connect(sfxLp); s.start(t);
  }

  /* ---------- arrangement ---------- */
  var STEMS = window.STEMS;
  if (STEMS && MODE !== 'sfx') {                 /* the film's score on real instruments (music.mjs): it replaces the synthesised one */
    var hallIn = ctx.createGain(); hallIn.gain.value = 0.3; hallIn.connect(revIn);
    var LV = { piano: [0.6, 0.2], guitar: [1.6, 0.15], strings: [1.25, 0.3], mallets: [4.5, 0.3], bass: [0.9, 0], drums: [1.4, 0.08], fx: [1.0, 0.4] };
    Object.keys(LV).forEach(function (k) {
      var f = STEMS[k]; if (!f) return;
      var n = f.length / 2, b = ctx.createBuffer(2, n, SR), L0 = b.getChannelData(0), R0 = b.getChannelData(1);
      for (var i = 0; i < n; i++) { L0[i] = f[2 * i]; R0[i] = f[2 * i + 1]; }
      var src = ctx.createBufferSource(); src.buffer = b; src.start(0);
      var g = ctx.createGain(); g.gain.value = LV[k][0] * 0.55; src.connect(g); g.connect(master);
      if (LV[k][1]) { var sd = ctx.createGain(); sd.gain.value = LV[k][1]; g.connect(sd); sd.connect(hallIn); }
    });
  }
  if (MODE !== 'sfx' && !STEMS) SEG.forEach(function (s, i) {
    pad(s.t0, s.pad, (s.t1 - s.t0) + (i === SEG.length - 1 ? 0 : 0.1), i === 0 ? 0.1 : 0.125);
    s.mel.forEach(function (n) { bell(n[0], n[1], s.g * 1.25 * (Math.abs(n[0] - 12.0 * K) < 1e-6 ? 1.25 : 1), n[1] % 2 ? 0.25 : -0.25, n[0] >= 14.5 * K ? 2.2 : 1.0); });
  });
  var nBeats = Math.round(DUR / BEAT), ARP = [0, 1, 2, 1, 3, 2, 1, 2];
  for (var bt = 0; bt < (MODE === 'sfx' || STEMS ? 0 : nBeats); bt++) {
    var t = bt * BEAT, sg = segAt(t), rootHz = mtof(sg.root);
    var big = BIG.some(function (x) { return Math.abs(x - t) < 1e-6; });
    kick(t, big ? 0.7 : 0.5, rootHz, big);
    shaker(t + 0.5 * BEAT, 0.04, 0.25);
    if (t >= 2.0 * K) { shaker(t + 0.25 * BEAT, 0.022, -0.3); shaker(t + 0.75 * BEAT, 0.026, 0.3); }
    if (t >= 4.0 * K && (bt % 4 === 1 || bt % 4 === 3) && t < 14.9 * K) clap(t, t >= 12 * K ? 0.11 : 0.17);
    if (t >= 2.0 * K) {
      bass(t + 0.5 * BEAT, sg.root + (bt % 2 ? 12 : 0), 0.24 * K, 0.34);
      if (bt % 4 === 2) bass(t, sg.root, 0.2 * K, 0.2);
      bell(t + 0.5 * BEAT, sg.arp[ARP[(bt * 2 + 1) % 8]] - 12, 0.022, bt % 2 ? -0.35 : 0.35, 0.4, bus);
      bell(t, sg.arp[ARP[(bt * 2) % 8]] - 12, 0.018, bt % 2 ? 0.3 : -0.3, 0.4, bus);
    }
  }
  /* scene-change hits: tuned thump + chord stab, with an airy swell leading in */
  if (MODE !== 'sfx' && !STEMS) HITS.forEach(function (th) {
    var isBig = BIG.indexOf(th) >= 0, s = segAt(th);
    impact(th, isBig, s.root);
    stab(th, [s.arp[0], s.arp[1], s.arp[2]], isBig ? 0.095 : 0.055);
    swell(th, (th === 2.0 * K ? 0.95 : 0.42) * K, th === 2.0 * K ? 0.07 : 0.06);
  });
  /* sound design from the cue sheet */
  var VOICE = {
    s: function (c) { smp(c[1] * K, c[2], c[3], c[4], c[5]); },
    whoosh: function (c) { whoosh(c[1] * K, c[2] * K, c[3], c[4], c[5], c[6]); },
    swell: function (c) { swell(c[1] * K, c[2] * K, c[3]); }
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
