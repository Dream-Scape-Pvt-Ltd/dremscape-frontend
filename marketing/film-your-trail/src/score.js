/* "Your Trail" mix, rendered offline (OfflineAudioContext, 48 kHz stereo).
   The music itself is the upbeat Dreamscape theme played on sampled instruments by music.mjs (grand piano, steel guitar,
   strings, glockenspiel, finger bass, kit) and arrives here as dry stems; this file places the voiceover, builds the rooms, ducks the music under
   every line and adds the only two kinds of sound design the film uses:
     - one soft whoosh per scene change, shaped by the camera's actual speed (loudest where the move is fastest);
     - the musical UI notes from music.mjs (each choice, step and press is a note of the chord).
   Mutes sit before every send so the music / vo / sfx stems come out clean for mix checks. */
window.renderAudio = async function () {
  var TL = window.TL, SR = 48000, DUR = TL.dur, MODE = window.__AUDIO_MODE || 'all';
  var ctx = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR);
  var seed = 7; var rnd = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function filt(type, f, q, g) { var n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q || 0.7; if (g !== undefined) n.gain.value = g; return n; }
  function gain(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
  function chain() { for (var i = 0; i < arguments.length - 1; i++) arguments[i].connect(arguments[i + 1]); return arguments[arguments.length - 1]; }
  function b64(s) { if (typeof s !== 'string') return s; var bin = atob(s), u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return new Float32Array(u8.buffer); }

  /* rooms: a warm hall for the music, a small room for the voice and the sound design */
  function room(len, bright, early) {
    var n = Math.floor(SR * len), buf = ctx.createBuffer(2, n, SR);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c), y = 0;
      for (var j = 0; j < n; j++) { var k = j / n; y += ((rnd() * 2 - 1) - y) * (bright - (bright - 0.03) * k); d[j] = y * Math.pow(1 - k, 2.4) * (j < SR * 0.01 ? j / (SR * 0.01) : 1); }
      (early || []).forEach(function (e) { var i = Math.floor(e[0] * SR) + c * 37; if (i < n) d[i] += e[1] * (c ? 0.8 : 1); });
    }
    var cv = ctx.createConvolver(); cv.buffer = buf; return cv;
  }
  function verb(cv, pre, lo, hi, wet, out) {
    var inp = gain(1), d = ctx.createDelay(0.2); d.delayTime.value = pre;
    chain(inp, d, filt('highpass', lo), filt('lowpass', hi), cv, gain(wet), out); return inp;
  }

  /* ---------------- buses ---------------- */
  var master = gain(0.9), glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -14; glue.knee.value = 8; glue.ratio.value = 2; glue.attack.value = 0.02; glue.release.value = 0.3;
  chain(master, filt('highpass', 28), glue, ctx.destination);
  var mMute = gain(MODE === 'vo' || MODE === 'sfx' ? 0 : 1), vMute = gain(MODE === 'music' || MODE === 'sfx' ? 0 : 1), sMute = gain(MODE === 'music' || MODE === 'vo' ? 0 : 1);
  mMute.connect(master); vMute.connect(master); sMute.connect(master);
  var duck = gain(1), music = gain(1); chain(music, duck, mMute);                  /* everything musical, ducked under the voice */
  var hall = verb(room(2.0, 0.5, [[0.017, 0.5], [0.029, 0.35], [0.043, 0.3]]), 0.018, 200, 8000, 0.3, music);
  var small = verb(room(0.55, 0.5, [[0.007, 0.6], [0.013, 0.4], [0.021, 0.3]]), 0.004, 200, 9000, 1, master);
  var vSend = gain(0), sSend = gain(0); vMute.connect(vSend); vSend.connect(small); sMute.connect(sSend); sSend.connect(small);

  /* ---------------- music stems ---------------- */
  var ST = window.STEMS || {}, stemSR = window.STEMS_SR || SR;
  function stem(name) {
    var f = ST[name]; if (!f) return null; f = b64(f);
    var n = f.length / 2, b = ctx.createBuffer(2, n, stemSR), L = b.getChannelData(0), R = b.getChannelData(1);
    for (var i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
    var s = ctx.createBufferSource(); s.buffer = b; s.start(0); return s;
  }
  /* [level, hall send] per stem of the upbeat theme; the room is kept small and bright so the groove stays tight */
  var LV = { piano: [0.6, 0.2], guitar: [1.6, 0.15], strings: [1.25, 0.3], mallets: [4.5, 0.3], bass: [0.9, 0], drums: [1.4, 0.08], fx: [1.0, 0.4], ui: [0.62, 0.45] };
  Object.keys(LV).forEach(function (k) {
    var s = stem(k); if (!s) return;
    var g = gain(LV[k][0]), out = k === 'ui' ? sMute : music, last = s;
    if (k === 'piano') last = chain(s, filt('lowshelf', 200, 0.7, -2), filt('highshelf', 6000, 0.7, -1.5));
    if (k === 'drums') last = chain(s, filt('highshelf', 7000, 0.7, -2));
    if (k === 'bass') last = chain(s, filt('lowpass', 2500, 0.5));
    chain(last, g, out);
    if (LV[k][1]) { var send = gain(LV[k][1]); g.connect(send); send.connect(k === 'ui' ? small : hall); }
  });

  /* ---------------- voiceover ---------------- */
  var VO = {};
  Object.keys(window.VO_RAW || {}).forEach(function (k) { var f = b64(window.VO_RAW[k]), b = ctx.createBuffer(1, f.length, SR); b.getChannelData(0).set(f); VO[k] = b; });
  var voComp = ctx.createDynamicsCompressor(); voComp.threshold.value = -22; voComp.ratio.value = 2.5; voComp.attack.value = 0.006; voComp.release.value = 0.14; voComp.knee.value = 8;
  var voBus = gain(1);
  chain(voBus, filt('highpass', 80, 0.6), filt('lowshelf', 160, 0.7, 1.2), filt('peaking', 3000, 0.8, 1), voComp, gain(1.9), vMute);
  vSend.gain.value = 0.09;                                                    /* a touch of a real room around the voice */
  duck.gain.setValueAtTime(1, 0);
  var DEEP = { walk: 0.62, stay: 0.62, tell: 0.36, climb: 0.36, idea: 0.34, talk: 0.34, plan: 0.34, brand: 0.4, beyond: 0.4 };
  TL.vo.forEach(function (v) {
    var b = VO[v[0]]; if (!b) return;
    var s = ctx.createBufferSource(); s.buffer = b; s.connect(voBus); s.start(v[1]);
    duck.gain.setTargetAtTime(DEEP[v[0]] || 0.42, v[1] - 0.2, 0.07); duck.gain.setTargetAtTime(1, v[1] + b.duration + 0.05, 0.28);
  });

  /* ---------------- whooshes: one per scene change, following the camera ---------------- */
  var nb = ctx.createBuffer(1, SR * 3, SR), nd = nb.getChannelData(0), p0 = 0, p1 = 0, p2 = 0;
  for (var k = 0; k < nd.length; k++) {                                       /* pink-ish noise: smoother than white */
    var w = rnd() * 2 - 1; p0 = 0.997 * p0 + 0.029591 * w; p1 = 0.985 * p1 + 0.032534 * w; p2 = 0.95 * p2 + 0.048056 * w; nd[k] = (p0 + p1 + p2 + 0.1848 * w) * 1.6;
  }
  function whoosh(t0, t1, speed, lvl, pan0, pan1) {
    var n = 64, env = new Float32Array(n), fc = new Float32Array(n), body = new Float32Array(n), pk = 0, i;
    for (i = 0; i < n; i++) pk = Math.max(pk, speed(t0 + (t1 - t0) * i / (n - 1)));
    for (i = 0; i < n; i++) { var u = speed(t0 + (t1 - t0) * i / (n - 1)) / pk; env[i] = lvl * Math.pow(u, 1.6); fc[i] = 380 + 2600 * Math.pow(u, 1.3); body[i] = 140 + 300 * u; }
    env[0] = env[n - 1] = 0;
    var src = ctx.createBufferSource(); src.buffer = nb; src.loop = true; src.start(t0, rnd() * 2); src.stop(t1 + 0.1);
    var bp = filt('bandpass', 800, 0.9), lp = filt('lowpass', 300, 0.6), g = gain(0), gb = gain(0.55), pn = ctx.createStereoPanner();
    bp.frequency.setValueCurveAtTime(fc, t0, t1 - t0); lp.frequency.setValueCurveAtTime(body, t0, t1 - t0);
    g.gain.setValueCurveAtTime(env, t0, t1 - t0);
    pn.pan.setValueAtTime(pan0, t0); pn.pan.linearRampToValueAtTime(pan1, t1);
    src.connect(bp); bp.connect(g); src.connect(lp); lp.connect(gb); gb.connect(g); chain(g, pn, sMute);
  }
  /* the camera (same keys as engine.js): speed from a numeric derivative */
  var CK = [[0, 0, TL.drift]], lt = 0, lx = 0;
  TL.glides.forEach(function (g) { var a = g[0] - TL.glideIn, b = g[0] + TL.glideOut, D = b - a, x0 = lx + TL.drift * (a - lt), dx = g[1] - x0; CK.push([a, x0, TL.drift], [a + 0.45 * D, x0 + 0.55 * dx, 1.55 * dx / D], [b, g[1], TL.drift]); lt = b; lx = g[1]; });
  CK.push([DUR + 1, lx + TL.drift * (DUR + 1 - lt), TL.drift]);
  function cam(t) {
    var i = 0; while (i < CK.length - 2 && t > CK[i + 1][0]) i++;
    var a = CK[i], b = CK[i + 1], h = b[0] - a[0], u = Math.max(0, Math.min(1, (t - a[0]) / h)), u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * a[1] + (u3 - 2 * u2 + u) * h * a[2] + (-2 * u3 + 3 * u2) * b[1] + (u3 - u2) * h * b[2];
  }
  var camSpeed = function (t) { return Math.abs(cam(t + 0.004) - cam(t - 0.004)) / 0.008; };
  TL.glides.forEach(function (g, i) { whoosh(g[0] - TL.glideIn, g[0] + TL.glideOut, camSpeed, [0.13, 0.11, 0.13, 0.12][i], 0.55, -0.55); });
  var bell = function (a, b) { return function (t) { var u = Math.min(1, Math.max(0, (t - a) / (b - a))); return 1e-4 + Math.sin(Math.PI * u) * (1 - 0.45 * u); }; };   /* quick rise, long tail */
  whoosh(TL.ui.open, TL.ui.open + 0.85, bell(TL.ui.open, TL.ui.open + 0.85), 0.1, 0.35, -0.1);    /* the photo opens to full frame */
  whoosh(TL.ui.disc[0], TL.ui.disc[1], bell(TL.ui.disc[0], TL.ui.disc[1]), 0.09, 0.5, -0.2);       /* the pin floods the frame */
  sSend.gain.value = 0.22;

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
