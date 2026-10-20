/* Showreel mix, rendered offline (OfflineAudioContext, 48 kHz stereo).
   music.mjs plays the upbeat Dreamscape theme on sampled instruments and synthesises the keystrokes and mouse clicks;
   this file mixes those stems in two rooms (a small bright hall for the music, a small room for the interface sounds), lets the music step back while
   the visitor types, and adds soft air on the three real scene changes only (TL.air).
   Mutes sit before every send so the music / sfx stems come out clean for mix checks. */
window.renderAudio = async function () {
  var TL = window.TL, SR = 48000, K = TL.k || 1, DUR = TL.dur * K, MODE = window.__AUDIO_MODE || 'all';
  var ctx = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR);
  var seed = 11; var rnd = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function filt(type, f, q, g) { var n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q || 0.7; if (g !== undefined) n.gain.value = g; return n; }
  function gain(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
  function chain() { for (var i = 0; i < arguments.length - 1; i++) arguments[i].connect(arguments[i + 1]); return arguments[arguments.length - 1]; }
  function room(len, bright, early) {
    var n = Math.floor(SR * len), buf = ctx.createBuffer(2, n, SR);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c), y = 0;
      for (var j = 0; j < n; j++) { var k = j / n; y += ((rnd() * 2 - 1) - y) * (bright - (bright - 0.03) * k); d[j] = y * Math.pow(1 - k, 2.4) * (j < SR * 0.01 ? j / (SR * 0.01) : 1); }
      (early || []).forEach(function (e) { var i = Math.floor(e[0] * SR) + c * 37; if (i < n) d[i] += e[1] * (c ? 0.8 : 1); });
    }
    var cv = ctx.createConvolver(); cv.buffer = buf; return cv;
  }
  function verb(cv, pre, lo, hi, wet, out) { var inp = gain(1), d = ctx.createDelay(0.2); d.delayTime.value = pre; chain(inp, d, filt('highpass', lo), filt('lowpass', hi), cv, gain(wet), out); return inp; }

  var master = gain(0.9), glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -14; glue.knee.value = 8; glue.ratio.value = 2; glue.attack.value = 0.02; glue.release.value = 0.3;
  chain(master, filt('highpass', 28), glue, ctx.destination);
  var mMute = gain(MODE === 'sfx' ? 0 : 1), sMute = gain(MODE === 'music' ? 0 : 1);
  mMute.connect(master); sMute.connect(master);
  var duck = gain(1), music = gain(1); chain(music, duck, mMute);
  var hall = verb(room(2.0, 0.5, [[0.017, 0.5], [0.029, 0.35], [0.043, 0.3]]), 0.018, 200, 8000, 0.3, music);
  var small = verb(room(0.45, 0.55, [[0.006, 0.6], [0.011, 0.4], [0.018, 0.3]]), 0.003, 250, 10000, 1, master);
  var sSend = gain(0.16); sMute.connect(sSend); sSend.connect(small);

  /* the music steps back while the visitor types, so every key is heard */
  var typed = TL.typed.map(function (k) { return k[0] * K; });
  duck.gain.setValueAtTime(1, 0);
  duck.gain.setTargetAtTime(0.42, typed[0] - 0.35, 0.12); duck.gain.setTargetAtTime(1, typed[typed.length - 1] + 0.3, 0.35);

  var ST = window.STEMS || {};
  function stem(name) {
    var f = ST[name]; if (!f) return null;
    var n = f.length / 2, b = ctx.createBuffer(2, n, SR), L = b.getChannelData(0), R = b.getChannelData(1);
    for (var i = 0; i < n; i++) { L[i] = f[2 * i]; R[i] = f[2 * i + 1]; }
    var s = ctx.createBufferSource(); s.buffer = b; s.start(0); return s;
  }
  /* [level, hall send] per stem of the upbeat theme; ui and keys go to the small room, outside the ducked music */
  var LV = { piano: [0.6, 0.2], guitar: [1.6, 0.15], strings: [1.25, 0.3], mallets: [4.5, 0.3], bass: [0.9, 0], drums: [1.4, 0.08], fx: [1.0, 0.4], ui: [0.55, 0.5], keys: [2.1, 0.6] };
  Object.keys(LV).forEach(function (k) {
    var s = stem(k); if (!s) return;
    var g = gain(LV[k][0]), dry = k === 'ui' || k === 'keys', last = s;
    if (k === 'piano') last = chain(s, filt('lowshelf', 200, 0.7, -2), filt('highshelf', 6000, 0.7, -1.5));
    if (k === 'drums') last = chain(s, filt('highshelf', 7000, 0.7, -2));
    if (k === 'bass') last = chain(s, filt('lowpass', 2500, 0.5));
    if (k === 'keys') last = chain(s, filt('highpass', 120, 0.6), filt('peaking', 3200, 1, 1.5));
    chain(last, g, dry ? sMute : music);
    if (!dry && LV[k][1]) { var send = gain(LV[k][1]); g.connect(send); send.connect(hall); }
  });

  /* soft air on the real scene changes: a quick rise and a long tail, pink noise through a moving band */
  var nb = ctx.createBuffer(1, SR * 3, SR), nd = nb.getChannelData(0), p0 = 0, p1 = 0, p2 = 0;
  for (var z = 0; z < nd.length; z++) { var w = rnd() * 2 - 1; p0 = 0.997 * p0 + 0.029591 * w; p1 = 0.985 * p1 + 0.032534 * w; p2 = 0.95 * p2 + 0.048056 * w; nd[z] = (p0 + p1 + p2 + 0.1848 * w) * 1.6; }
  TL.air.forEach(function (a) {
    var t0 = a[0] * K, t1 = a[1] * K, n = 64, env = new Float32Array(n), fc = new Float32Array(n), body = new Float32Array(n);
    for (var i = 0; i < n; i++) { var u = i / (n - 1), sh = Math.sin(Math.PI * Math.pow(u, 0.7)) * (1 - 0.4 * u); env[i] = a[2] * Math.pow(sh, 1.5); fc[i] = 380 + 2400 * sh; body[i] = 140 + 300 * sh; }
    env[0] = env[n - 1] = 0;
    var src = ctx.createBufferSource(); src.buffer = nb; src.loop = true; src.start(t0, rnd() * 2); src.stop(t1 + 0.1);
    var bp = filt('bandpass', 800, 0.9), lp = filt('lowpass', 300, 0.6), g = gain(0), gb = gain(0.55), pn = ctx.createStereoPanner();
    bp.frequency.setValueCurveAtTime(fc, t0, t1 - t0); lp.frequency.setValueCurveAtTime(body, t0, t1 - t0); g.gain.setValueCurveAtTime(env, t0, t1 - t0);
    pn.pan.setValueAtTime(a[3], t0); pn.pan.linearRampToValueAtTime(a[4], t1);
    src.connect(bp); bp.connect(g); src.connect(lp); lp.connect(gb); gb.connect(g); chain(g, pn, sMute);
  });

  var buf = await ctx.startRendering();
  var L = buf.getChannelData(0), R = buf.getChannelData(1), peak = 0;
  for (var q = 0; q < L.length; q++) peak = Math.max(peak, Math.abs(L[q]), Math.abs(R[q]));
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
