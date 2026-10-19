/* Soundtrack synthesised with the Web Audio API (OfflineAudioContext). 120 BPM, D major, 15 s.
   Kick on every beat, an impact on every scene change, a tick on every cursor click. */
window.renderAudio = async function () {
  var TL = window.TL, SR = 48000, DUR = TL.dur, BEAT = TL.beat;
  var ctx = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR);
  var mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };

  /* ---------- buses ---------- */
  var master = ctx.createGain(); master.gain.value = 0.92;
  var comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -17; comp.knee.value = 9; comp.ratio.value = 3.6; comp.attack.value = 0.004; comp.release.value = 0.13;
  var sat = ctx.createWaveShaper(), curve = new Float32Array(2048);
  for (var i = 0; i < 2048; i++) { var x = i / 1024 - 1; curve[i] = Math.tanh(1.25 * x) / Math.tanh(1.25); }
  sat.curve = curve; sat.oversample = '2x';
  master.connect(comp); comp.connect(sat); sat.connect(ctx.destination);

  function impulse(len, decay) {
    var n = Math.floor(SR * len), buf = ctx.createBuffer(2, n, SR);
    for (var c = 0; c < 2; c++) { var d = buf.getChannelData(c); for (var j = 0; j < n; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / n, decay); }
    return buf;
  }
  var rev = ctx.createConvolver(); rev.buffer = impulse(1.7, 3.2);
  var revIn = ctx.createGain(); revIn.gain.value = 0.55; var revOut = ctx.createGain(); revOut.gain.value = 0.42;
  var revHp = ctx.createBiquadFilter(); revHp.type = 'highpass'; revHp.frequency.value = 280;
  revIn.connect(revHp); revHp.connect(rev); rev.connect(revOut); revOut.connect(master);

  var bus = ctx.createGain(); bus.connect(master);               /* musical bus: ducked by the kick */
  var busRev = ctx.createGain(); busRev.gain.value = 0.5; bus.connect(busRev); busRev.connect(revIn);
  for (var b = 0; b < DUR / BEAT; b++) {                          /* side-chain pump on every beat */
    var tb = b * BEAT;
    bus.gain.setValueAtTime(0.28, tb); bus.gain.linearRampToValueAtTime(1, tb + 0.3);
  }
  TL.hits.forEach(function (th) { bus.gain.setValueAtTime(0.12, th); bus.gain.linearRampToValueAtTime(1, th + 0.5); });

  var nb = ctx.createBuffer(1, SR * 2, SR), nd = nb.getChannelData(0);
  for (var k = 0; k < nd.length; k++) nd[k] = Math.random() * 2 - 1;
  function noise(t, dur) { var s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; s.start(t, Math.random()); s.stop(t + dur); return s; }
  function env(node, t, a, peak, d, dur) {
    node.gain.setValueAtTime(0.0001, t); node.gain.linearRampToValueAtTime(peak, t + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    return node;
  }
  function pan(p) { var n = ctx.createStereoPanner(); n.pan.value = p; return n; }

  /* ---------- voices ---------- */
  function kick(t, g, big) {
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(big ? 200 : 168, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    var e = ctx.createGain(); env(e, t, 0.002, g, big ? 0.62 : 0.4);
    o.connect(e); e.connect(master); o.start(t); o.stop(t + 0.8);
    var n = noise(t, 0.03), f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.9;
    var ne = ctx.createGain(); env(ne, t, 0.001, 0.26 * g, 0.018); n.connect(f); f.connect(ne); ne.connect(master);
  }
  function hat(t, g, open, p) {
    var n = noise(t, 0.3), f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = open ? 6200 : 8200;
    var e = ctx.createGain(); env(e, t, 0.001, g, open ? 0.16 : 0.035);
    n.connect(f); f.connect(e); e.connect(pan(p || 0)).connect(master);
  }
  function clap(t, g) {
    [0, 0.011, 0.023].forEach(function (dt, i) {
      var n = noise(t + dt, 0.3), f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.8;
      var e = ctx.createGain(); env(e, t + dt, 0.001, g * (i === 2 ? 1 : 0.6), i === 2 ? 0.13 : 0.02);
      n.connect(f); f.connect(e); e.connect(master); e.connect(revIn);
    });
    var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    var oe = ctx.createGain(); env(oe, t, 0.001, g * 0.5, 0.09); o.connect(oe); oe.connect(master); o.start(t); o.stop(t + 0.2);
  }
  function bass(t, m, len, g) {
    var f = mtof(m);
    var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 5;
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(170, t + len * 0.9);
    var e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + 0.006); e.gain.setValueAtTime(g, t + len * 0.7); e.gain.exponentialRampToValueAtTime(0.0001, t + len);
    var e2 = ctx.createGain(); e2.gain.value = 0.9;
    o.connect(lp); lp.connect(e); o2.connect(e2); e2.connect(e); e.connect(bus);
    o.start(t); o.stop(t + len + 0.05); o2.start(t); o2.stop(t + len + 0.05);
  }
  function pad(t, notes, len, g) {
    notes.forEach(function (m, idx) {
      [-8, 8].forEach(function (cents, j) {
        var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = cents;
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1500, t + len * 0.8); lp.Q.value = 0.6;
        var e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(g, t + 0.35); e.gain.setValueAtTime(g, t + len - 0.25); e.gain.linearRampToValueAtTime(0.0001, t + len + 0.2);
        o.connect(lp); lp.connect(e); e.connect(pan((idx - 1) * 0.35 * (j ? 1 : -1))).connect(bus);
        o.start(t); o.stop(t + len + 0.3);
      });
    });
  }
  function pluck(t, m, g, p) {
    var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
    var o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = mtof(m); o2.detune.value = 6;
    var g2 = ctx.createGain(); g2.gain.value = 0.18;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.4;
    lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.2);
    var e = ctx.createGain(); env(e, t, 0.003, g, 0.24);
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(e); e.connect(pan(p)).connect(bus);
    o.start(t); o.stop(t + 0.4); o2.start(t); o2.stop(t + 0.4);
  }
  function impact(t, big) {
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(big ? 72 : 64, t); o.frequency.exponentialRampToValueAtTime(30, t + (big ? 0.9 : 0.55));
    var e = ctx.createGain(); env(e, t, 0.004, big ? 0.9 : 0.62, big ? 1.3 : 0.75);
    o.connect(e); e.connect(master); o.start(t); o.stop(t + 1.6);
    var n = noise(t, 1.2), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = big ? 600 : 900;
    var ne = ctx.createGain(); env(ne, t, 0.002, big ? 0.34 : 0.22, big ? 0.7 : 0.38);
    n.connect(hp); hp.connect(ne); ne.connect(master); ne.connect(revIn);
    var o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = mtof(50);    /* D3 body tone */
    var e3 = ctx.createGain(); env(e3, t, 0.004, big ? 0.28 : 0.16, big ? 0.9 : 0.5); o3.connect(e3); e3.connect(master); o3.start(t); o3.stop(t + 1.2);
  }
  function riser(tEnd, len, g) {
    var t0 = tEnd - len, n = noise(t0, len + 0.05), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.2;
    bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(9000, tEnd);
    var e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g, tEnd - 0.01); e.gain.linearRampToValueAtTime(0.0001, tEnd);
    n.connect(bp); bp.connect(e); e.connect(master); e.connect(revIn);
  }
  function swoosh(t, p) {
    var n = noise(t, 0.4), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.3;
    bp.frequency.setValueAtTime(700, t); bp.frequency.exponentialRampToValueAtTime(5200, t + 0.2);
    var e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(0.11, t + 0.08); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    n.connect(bp); bp.connect(e); e.connect(pan(p)).connect(master);
  }
  function tick(t) {
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(2300, t); o.frequency.exponentialRampToValueAtTime(1500, t + 0.02);
    var e = ctx.createGain(); env(e, t, 0.0005, 0.15, 0.03); o.connect(e); e.connect(master); o.start(t); o.stop(t + 0.1);
    var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 420;
    var e2 = ctx.createGain(); env(e2, t, 0.001, 0.12, 0.05); o2.connect(e2); e2.connect(master); o2.start(t); o2.stop(t + 0.12);
  }

  /* ---------- arrangement ---------- */
  /* bars of 2 s: Bm  G  D  A  Bm  G  D(rest) */
  var CH = [
    { root: 35, notes: [59, 62, 66], arp: [71, 74, 78, 83] },   /* Bm */
    { root: 31, notes: [55, 59, 62], arp: [67, 71, 74, 79] },   /* G  */
    { root: 38, notes: [57, 62, 66], arp: [69, 74, 78, 81] },   /* D  */
    { root: 33, notes: [57, 61, 64], arp: [69, 73, 76, 81] },   /* A  */
    { root: 35, notes: [59, 62, 66], arp: [71, 74, 78, 83] },
    { root: 31, notes: [55, 59, 62], arp: [67, 71, 74, 79] },
    { root: 38, notes: [57, 62, 66], arp: [69, 74, 78, 81] }
  ];
  var nBeats = Math.round(DUR / BEAT);
  for (var bar = 0; bar < 7; bar++) {
    var tb0 = bar * 2, ch = CH[bar], span = bar === 6 ? 3.0 : 2.0;
    pad(tb0, ch.notes, span, bar < 1 ? 0.07 : 0.1);
  }
  for (var bt = 0; bt < nBeats; bt++) {
    var t = bt * BEAT, bar2 = Math.min(6, Math.floor(t / 2)), chd = CH[bar2];
    var big = TL.big.some(function (x) { return Math.abs(x - t) < 1e-6; });
    kick(t, big ? 1.05 : 0.9, big);
    /* hats: off-beat 8ths, ghost 16ths once the finder starts */
    hat(t + 0.25, 0.1, false, 0.25);
    if (t >= 2.0) { hat(t + 0.125, 0.045, false, -0.3); hat(t + 0.375, 0.05, false, 0.3); }
    if (bt % 4 === 3) hat(t + 0.25, 0.1, true, 0);
    /* backbeat */
    if (t >= 2.0 && (bt % 4 === 1 || bt % 4 === 3) && t < 14.9) clap(t, t >= 12 ? 0.2 : 0.3);
    /* bass pumps on the off-beat */
    if (t >= 2.0) { bass(t + 0.25, chd.root + (bt % 2 ? 12 : 0), 0.22, 0.5); if (bt % 4 === 2) bass(t, chd.root, 0.2, 0.32); }
    /* arpeggio on 8ths */
    if (t >= 2.0) {
      var seq = [0, 1, 2, 3, 2, 1, 3, 2];
      pluck(t + 0.25, chd.arp[seq[(bt * 2 + 1) % 8] % 4], 0.13, bt % 2 ? -0.35 : 0.35);
      if (t < 12 || bt % 2 === 0) pluck(t, chd.arp[seq[(bt * 2) % 8] % 4], 0.1, bt % 2 ? 0.3 : -0.3);
    } else if (bt % 2 === 0) pluck(t + 0.25, chd.arp[(bt / 2 + 1) % 4], 0.07, 0.2);
  }
  /* scene-change hits, risers, swooshes, UI ticks */
  TL.hits.forEach(function (th) {
    var isBig = TL.big.indexOf(th) >= 0;
    impact(th, isBig);
    riser(th, th === 2.0 ? 0.95 : th === 12.0 ? 0.5 : 0.42, th === 2.0 ? 0.2 : 0.15);
  });
  TL.swooshes.forEach(function (ts, i) { swoosh(ts, i % 2 ? 0.45 : -0.45); });
  TL.clicks.forEach(function (tc) { tick(tc); });
  /* end-card shimmer: one high bell per CTA beat */
  [13.0, 13.5, 14.0, 14.5].forEach(function (tb, i) { pluck(tb + 0.125, [86, 90, 93, 98][i], 0.07, i % 2 ? -0.5 : 0.5); });

  var buf = await ctx.startRendering();
  var L = buf.getChannelData(0), R = buf.getChannelData(1), peak = 0;
  for (var q = 0; q < L.length; q++) peak = Math.max(peak, Math.abs(L[q]), Math.abs(R[q]));
  var norm = 0.56 / (peak || 1), fade = Math.floor(SR * 0.08), out = new Int16Array(L.length * 2);
  for (var z = 0; z < L.length; z++) {
    var f = z > L.length - fade ? (L.length - z) / fade : 1;
    out[2 * z] = Math.max(-32768, Math.min(32767, Math.round(L[z] * norm * f * 32767)));
    out[2 * z + 1] = Math.max(-32768, Math.min(32767, Math.round(R[z] * norm * f * 32767)));
  }
  var bytes = new Uint8Array(out.buffer), s = '';
  for (var y = 0; y < bytes.length; y += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(y, y + 0x8000));
  return { pcm: btoa(s), sr: SR, peak: peak, frames: L.length };
};
