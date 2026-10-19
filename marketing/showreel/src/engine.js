/* Dreamscape Treks — 15 s showreel engine.
   Everything on screen is a pure function of time: window.seek(t). No CSS animation, no timers, no carried state. */
(function () {
'use strict';
var W = 1920, H = 1080, DUR = 15, BEAT = 0.5;

/* ------------------------------------------------------------------ math */
var $ = function (id) { return document.getElementById(id); };
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, k) { return a + (b - a) * k; };
var prog = function (t, a, b) { return clamp((t - a) / (b - a)); };
/* exponential ease-out, exactly 0 -> 1 over u in [0,1] */
var E1 = 1 - Math.pow(2, -10);
/* exponential ease-out with a smooth onset (finite launch speed) so fast moves stay readable after sub-frame blending */
var expo = function (u) { u = clamp(u); var v = u * u * (3 - 2 * u); return (1 - Math.pow(2, -10 * v)) / E1; };
/* critically damped step over [0, d]: no overshoot, normalised to land exactly on 1 */
var cd = function (u, d) { u = clamp(u); var w = 6.5 / d, t = u * d, f = function (x) { return 1 - Math.exp(-w * x) * (1 + w * x); }; return f(t) / f(d); };
var expoIn = function (u) { u = clamp(u); return (Math.pow(2, 10 * u) - 1) / (Math.pow(2, 10) - 1); };
/* damped spring step response 0 -> 1 (zeta < 1 => small overshoot) */
function spring(t, w, z) {
  if (t <= 0) return 0;
  w = w || 24; z = z === undefined ? 0.78 : z;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  var a = z * w, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-a * t) * (Math.cos(wd * t) + (a / wd) * Math.sin(wd * t));
}
var sp = function (t, t0, w, z) { return spring(t - t0, w, z); };

/* ------------------------------------------------------------ timeline */
/* 120 BPM: 1 beat = 0.5 s. Scene changes + clicks are shared with the soundtrack. */
var TL = window.TL;

/* ------------------------------------------------------------ elements */
var E = {};
['cam', 'cam2', 'photoB', 'imgSun', 'photoExp', 'imgExp', 'disc', 'hook', 'eb', 'ebSlot', 'ebText', 'ebMask', 'l1', 'l2',
 'finder', 'pill', 'f1', 'f2', 'f3', 'f1bg', 'f2bg', 'f1old', 'f1new', 'f2old', 'f2new', 'btn', 'btnArrow', 'btnArrowPath', 'listDest', 'listDiff',
 'rA0', 'rA1', 'rA2', 'rB0', 'rB1', 'rB2', 'rB3', 'rB4',
 'header', 'hLogo', 'hLogoMark', 'hLogoText', 'navTreksBg', 'nvTreks', 'chevTreks', 'menu', 'mEyebrow', 'mHead', 'mIntro', 'mLink',
 'mi0', 'mi1', 'mi2', 'mi3', 'mi4', 'mi5', 'phWrap', 'phA', 'phB', 'mSep', 'mf1', 'mf2',
 'tailor', 'tEb', 'tSlot', 'tEbText', 'tEbMask', 'tl1', 'tl2', 'st1', 'st2', 'st3',
 'form', 'formBody', 'txt', 'txtBase', 'txtTyped', 'caret', 'send', 'success', 'sTick', 'foot',
 'end', 'logo', 'logoMark', 'cpMarkRect', 'tg0', 'tg1', 'tg2', 'cta', 'ctaA', 'ctaB', 'ctaArrow', 'ctaArrowPath', 'dom', 'domT',
 'tok', 'tokSvg', 'cursor', 'curG', 'mbTokB', 'mbCurB', 'mbL1B', 'mbL2B', 'mbCamB'
].forEach(function (id) { E[id] = $(id); });

var L = window.LOGO;
['hLogoMark'].forEach(function (id) { E[id].setAttribute('d', L.mark); });
E.hLogoText.setAttribute('d', L.text);
E.logoMark.setAttribute('d', L.mark);
document.querySelectorAll('.logoText').forEach(function (p) { p.setAttribute('d', L.text); });
E.cursor.style.zIndex = 5;

/* ----------------------------------------------------------- measure */
var A = {};
function R(el) {
  var r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

function layoutHook() {
  var F = 240;
  E.l1.style.fontSize = F + 'px'; E.l2.style.fontSize = F + 'px';
  var tmp = E.l1.getBoundingClientRect();
  var span = E.l1.querySelectorAll('.wm');
  var w1 = span[2].getBoundingClientRect().right - span[0].getBoundingClientRect().left;
  F = Math.round(F * 1560 / w1);
  E.l1.style.fontSize = F + 'px'; E.l2.style.fontSize = F + 'px';
  /* baseline probes */
  function baseline(el) {
    var p = document.createElement('span');
    p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(p); var b = p.getBoundingClientRect().bottom; el.removeChild(p); return b;
  }
  var c = document.createElement('canvas').getContext('2d');
  c.font = '800 100px PJS';
  var cap = c.measureText('H').actualBoundingBoxAscent / 100 * F;
  var gap = 0.30 * F, g0 = 540 - gap / 2, g1 = 540 + gap / 2;
  E.l1.style.top = '0px'; E.l2.style.top = '0px';
  var b1 = baseline(E.l1), b2 = baseline(E.l2);
  E.l1.style.top = (g0 - b1) + 'px';
  E.l2.style.top = ((g1 + cap) - b2) + 'px';
  A.hookF = F; A.hookCap = cap; A.gapY = 540;
}

function measure() {
  E.cam.style.transform = 'none'; E.cam2.style.transform = 'none';
  layoutHook();
  /* make sure measurements see everything laid out, unclipped */
  A.ebSlot = R(E.ebSlot); A.tSlot = R(E.tSlot);
  A.pill = R(E.pill); A.f1 = R(E.f1); A.f2 = R(E.f2); A.f3 = R(E.f3); A.btn = R(E.btn); A.btnArrow = R(E.btnArrow);
  A.listDest = R(E.listDest); A.listDiff = R(E.listDiff);
  ['rA0', 'rA1', 'rA2', 'rB0', 'rB1', 'rB2', 'rB3', 'rB4'].forEach(function (k) { A[k] = R(E[k]); });
  A.chev = R(E.chevTreks); A.nvTreks = R(E.nvTreks); A.header = R(E.header); A.menu = R(E.menu);
  for (var i = 0; i < 6; i++) { A['mi' + i] = R(E['mi' + i]); A['ma' + i] = R(E['mi' + i].querySelector('.ma')); }
  A.ph = R(E.phWrap);
  A.tEb = R(E.tEb); A.st1 = R(E.st1); A.st2 = R(E.st2); A.st3 = R(E.st3); A.tl1 = R(E.tl1); A.tl2 = R(E.tl2);
  A.form = R(E.form); A.txt = R(E.txt); A.send = R(E.send); A.success = R(E.success); A.sTick = R(E.sTick);
  A.logo = R(E.logo);
  A.ctaB = R(E.ctaB); A.cta = R(E.cta);
}

/* ------------------------------------------------------------ camera */
var SHOTS = [];
function buildShots() {
  var q = { w: 13, z: 0.85 };
  SHOTS = [
    { t: 0.0, x: 960, y: 540, zoom: 1.00, w: 14, z: 0.9 },
    { t: 2.0, x: 960, y: 540, zoom: 1.10, w: 15, z: 0.84 },
    { t: 2.42, x: A.listDest.cx - 40, y: A.listDest.y + 90, zoom: 1.56, w: 16, z: 0.84 },
    { t: 3.42, x: A.listDiff.cx, y: A.listDiff.y + 110, zoom: 1.46, w: 16, z: 0.84 },
    { t: 4.12, x: A.btn.cx - 150, y: A.btn.cy, zoom: 1.85, w: 13, z: 0.9 },
    { t: 4.5, x: 960, y: 330, zoom: 1.20, w: 12, z: 0.9 },
    { t: 5.0, x: 960, y: 372, zoom: 1.24, w: 12, z: 0.9 },
    { t: 5.82, x: (A.mi1.x + A.ph.r) / 2 - 20, y: A.ph.cy - 10, zoom: 1.85, w: 16, z: 0.84 },
    { t: 6.3, x: 960, y: 540, zoom: 1.00, w: 14, z: 0.9 },
    { t: 7.0, x: 880, y: 540, zoom: 1.08, w: 15, z: 0.86 },
    { t: 8.0, x: 800, y: 580, zoom: 1.12, w: 15, z: 0.86 },
    { t: 8.5, x: 770, y: 618, zoom: 1.17, w: 15, z: 0.86 },
    { t: 9.0, x: A.form.cx, y: A.form.cy, zoom: 1.22, w: 13, z: 0.9 },
    { t: 9.5, x: A.form.cx, y: A.txt.cy + 18, zoom: 1.42, w: 16, z: 0.84 },
    { t: 10.0, x: A.txt.x + 380, y: A.txt.cy - 10, zoom: 1.78, w: 17, z: 0.84 },
    { t: 10.5, x: A.form.cx, y: (A.txt.cy + A.send.cy) / 2 + 16, zoom: 1.5, w: 17, z: 0.84 },
    { t: 11.0, x: A.form.cx, y: A.form.cy - 30, zoom: 1.26, w: 13, z: 0.9 },
    { t: 11.5, x: 960, y: 540, zoom: 1.02, w: 14, z: 0.9 },
    { t: 12.0, x: 960, y: 585, zoom: 1.00, w: 12, z: 0.9 },
    { t: 12.5, x: 985, y: 568, keep: true, w: 12, z: 0.9 },
    { t: 13.0, x: 950, y: 590, keep: true, w: 12, z: 0.9 },
    { t: 13.5, x: 935, y: 606, keep: true, w: 12, z: 0.9 },
    { t: 14.0, x: 955, y: 604, keep: true, w: 12, z: 0.9 },
    { t: 14.5, x: 962, y: 598, keep: true, w: 12, z: 0.9 }
  ];
  SHOTS.forEach(function (s) { s.push = s.t >= 12.5 ? 0.0067 : 0.04; });
}
function camAt(t) {
  var st = { x: SHOTS[0].x, y: SHOTS[0].y, z: Math.log(SHOTS[0].zoom) };
  var out = null;
  for (var i = 0; i < SHOTS.length; i++) {
    var s = SHOTS[i], t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t : DUR + 1;
    function at(tt) {
      var tau = tt - s.t, k = spring(tau, s.w, s.z), u = clamp(tau / (t1 - s.t));
      return { x: lerp(st.x, s.x, k), y: lerp(st.y, s.y, k), z: lerp(st.z, s.keep ? st.z : Math.log(s.zoom), k) + Math.log(1 + s.push * u) };
    }
    if (t < t1 || i === SHOTS.length - 1) { var c = at(t); return { x: c.x, y: c.y, z: Math.exp(c.z) }; }
    st = at(t1);
  }
}
function applyCam(c) {
  var tf = 'translate(960px,540px) scale(' + c.z.toFixed(5) + ') translate(' + (-c.x).toFixed(3) + 'px,' + (-c.y).toFixed(3) + 'px)';
  E.cam.style.transform = tf; E.cam2.style.transform = tf;
}
function w2s(x, y, c) { return [960 + (x - c.x) * c.z, 540 + (y - c.y) * c.z]; }

/* -------------------------------------------------------- token shapes */
var NPTS = 220;
function resample(poly) {
  var seg = [0], i, tot = 0;
  for (i = 1; i < poly.length; i++) { tot += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]); seg.push(tot); }
  var out = [];
  for (var k = 0; k < NPTS; k++) {
    var d = tot * k / (NPTS - 1), j = 1;
    while (j < poly.length - 1 && seg[j] < d) j++;
    var a = poly[j - 1], b = poly[j], sl = seg[j] - seg[j - 1] || 1, f = clamp((d - seg[j - 1]) / sl);
    out.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]);
  }
  return out;
}
var ridgeLocal = L.ridge.map(function (p) { return [p[0] - 794, p[1] - 323]; });
var SH = {
  dash: resample([[-14, 0], [14, 0]]),
  check: resample([[-13, 1], [-4, 10], [14, -10]]),
  arrow: resample([[-14, 0], [14, 0], [5, -9.5], [14, 0], [5, 9.5]]),
  chev: resample([[-8, -4.5], [0, 4], [8, -4.5]]),
  ridge: resample(ridgeLocal)
};

/* token keyframes: key.t = arrival time, key.d = transition length (starts at t - d).  */
var K = [];
var LOGO_S = 1500 / 3337;
function buildTokenKeys() {
  var gx = 960, gy = 540;
  var chk = function (row) { return [row.r - 50, row.cy]; };
  var cardTop = A.form.y, cardH = A.form.h;
  var ridgeC = [A.logo.x + 794 * LOGO_S, A.logo.y + 323 * LOGO_S];
  K = [
    { t: 0.0, shape: 'dash', x: A.ebSlot.cx, y: A.ebSlot.cy, sx: 0.02, sy: 1, rot: 0, w: 0.01 },
    { t: 0.32, d: 0.30, shape: 'dash', x: A.ebSlot.cx, y: A.ebSlot.cy, sx: 1, sy: 1, rot: 0, w: 4, ease: 'spring' },
    /* hook: detach, arc to the gap, cut through, become the finder pill */
    { t: 1.40, d: 0.40, shape: 'dash', x: gx, y: gy, sx: 3.4, sy: 1, rot: 0, w: 10, arc: -0.18 },
    { t: 1.80, d: 0.30, shape: 'dash', x: gx, y: gy, sx: 78, sy: 1, rot: 0, w: 8 },
    { t: 2.00, d: 0.18, shape: 'dash', x: A.pill.cx, y: A.pill.cy, sx: 1520 / 28, sy: 1, rot: 0, w: 120 },
    /* finder: pill thins to a line, retracts to a dash on Destination */
    { t: 2.28, d: 0.28, shape: 'dash', x: A.pill.cx, y: A.pill.cy + 62, sx: 1520 / 28, sy: 1, rot: 0, w: 5 },
    { t: 2.46, d: 0.18, shape: 'dash', x: A.f1.x + 50, y: A.f1.y + 12, sx: 1, sy: 1, rot: 0, w: 4 },
    { t: 2.76, d: 0.28, shape: 'check', x: chk(A.rA0)[0], y: chk(A.rA0)[1], sx: 1, sy: 1, rot: 0, w: 5 },
    { t: 3.30, d: 0.30, shape: 'check', x: chk(A.rA1)[0], y: chk(A.rA1)[1], sx: 1, sy: 1, rot: 0, w: 5 },
    { t: 3.55, d: 0.25, shape: 'dash', x: A.f2.x + 50, y: A.f2.y + 12, sx: 1, sy: 1, rot: 0, w: 4, arc: -0.25 },
    { t: 3.80, d: 0.25, shape: 'check', x: chk(A.rB0)[0], y: chk(A.rB0)[1], sx: 1, sy: 1, rot: 0, w: 5 },
    { t: 4.30, d: 0.30, shape: 'check', x: chk(A.rB2)[0], y: chk(A.rB2)[1], sx: 1, sy: 1, rot: 0, w: 5 },
    { t: 4.55, d: 0.25, shape: 'arrow', x: A.btnArrow.cx, y: A.btnArrow.cy, sx: 1.05, sy: 1.05, rot: 0, w: 4.4, arc: 0.2 },
    /* corner: arrow flies up, becomes the Treks chevron, flips as the menu opens */
    { t: 4.86, d: 0.31, shape: 'chev', x: A.chev.cx, y: A.chev.cy, sx: 0.78, sy: 0.78, rot: 0, w: 2.6, arc: -0.2 },
    { t: 5.24, d: 0.22, shape: 'chev', x: A.chev.cx, y: A.chev.cy - 1, sx: 0.78, sy: 0.78, rot: Math.PI, w: 2.6, ease: 'spring' },
    { t: 5.40, d: 0.12, shape: 'arrow', x: A.ma0.cx, y: A.ma0.cy, sx: 0.62, sy: 0.62, rot: 0, w: 2.6 },
    { t: 5.66, d: 0.20, shape: 'arrow', x: A.ma2.cx, y: A.ma2.cy, sx: 0.62, sy: 0.62, rot: 0, w: 2.6 },
    { t: 5.96, d: 0.24, shape: 'arrow', x: A.ma1.cx + 5, y: A.ma1.cy, sx: 0.62, sy: 0.62, rot: 0, w: 2.6 },
    /* photo fills the frame; token turns into the vertical sweep line */
    { t: 6.64, d: 0.42, shape: 'dash', x: 2010, y: 540, sx: 1.3, sy: 1, rot: Math.PI / 2, w: 6, ease: 'cd' },
    { t: 6.94, d: 0.28, shape: 'dash', x: 2010, y: 540, sx: 1500 / 28, sy: 1, rot: Math.PI / 2, w: 12, ease: 'cd' },
    { t: 7.38, d: 0.44, shape: 'dash', x: -40, y: 540, sx: 1500 / 28, sy: 1, rot: Math.PI / 2, w: 12, ease: 'cd' },
    /* yours: sweep line becomes the eyebrow dash, then the step marker */
    { t: 7.66, d: 0.26, shape: 'dash', x: A.tSlot.cx, y: A.tSlot.cy, sx: 1, sy: 1, rot: 0, w: 4, arc: 0.22 },
    { t: 7.96, d: 0.28, shape: 'dash', x: 142, y: A.st1.cy - 4, sx: 1.45, sy: 1, rot: Math.PI / 2, w: 5 },
    { t: 8.30, d: 0.22, shape: 'dash', x: 142, y: A.st2.cy - 4, sx: 1.45, sy: 1, rot: Math.PI / 2, w: 5 },
    { t: 8.70, d: 0.22, shape: 'dash', x: 142, y: A.st3.cy - 4, sx: 1.45, sy: 1, rot: Math.PI / 2, w: 5 },
    /* payoff: marker stretches into the line that unfolds the form card */
    { t: 9.00, d: 0.10, shape: 'dash', x: A.form.cx, y: cardTop, sx: A.form.w / 28, sy: 1, rot: 0, w: 6, live: function (t) { return [A.form.cx, cardTop + cardP(t) * cardH]; } },
    { t: 9.50, d: 0.06, shape: 'dash', x: A.form.cx, y: cardTop + cardH, sx: A.form.w / 28, sy: 1, rot: 0, w: 6, live: function (t) { return [A.form.cx, cardTop + cardP(t) * cardH]; } },
    { t: 9.72, d: 0.22, shape: 'dash', x: A.txt.x - 24, y: A.txt.y - 20, sx: 0.75, sy: 1, rot: Math.PI / 2, w: 4.5, arc: 0.2 },
    { t: 10.86, d: 0.40, shape: 'dash', x: A.send.x + 40, y: A.send.y - 20, sx: 1, sy: 1, rot: 0, w: 4, arc: -0.15 },
    { t: 11.22, d: 0.20, shape: 'check', x: A.sTick.cx, y: A.sTick.cy + 1 + (760 - 334) / 2, sx: 1.55, sy: 1.55, rot: 0, w: 5.5 },
    /* logo: check lifts, becomes the ridge, then fills as the mark */
    { t: 11.97, d: 0.47, shape: 'ridge', x: ridgeC[0], y: ridgeC[1], sx: LOGO_S, sy: LOGO_S, rot: 0, w: 11, arc: 0.12 },
    { t: 12.56, d: 0.44, shape: 'ridge', x: ridgeC[0], y: ridgeC[1], sx: LOGO_S, sy: LOGO_S, rot: 0, w: 0.01 }
  ];
}
var cardP = function (t) { return expo((t - 9.0) / 0.46); };

function keyState(k, t) {
  var p = k.live ? k.live(t) : [k.x, k.y];
  return { shape: k.shape, x: p[0], y: p[1], sx: k.sx, sy: k.sy, rot: k.rot, w: k.w, arc: k.arc || 0 };
}
function tokAt(t) {
  var i = 0;
  while (i + 1 < K.length && t >= K[i + 1].t - K[i + 1].d) i++;
  var k = K[i];
  if (i === 0 || t >= k.t) return keyState(k, t);
  var kp = K[i - 1], t0 = k.t - k.d, u = (t - t0) / k.d;
  var a = keyState(kp, t0), b = keyState(k, t);
  var e = k.ease === 'spring' ? spring(u * k.d, 26, 0.78) : k.ease === 'cd' ? cd(u, k.d) : expo(u);
  var x = lerp(a.x, b.x, e), y = lerp(a.y, b.y, e);
  var dist = Math.hypot(b.x - a.x, b.y - a.y);
  if (k.arc) { var nx = -(b.y - a.y) / (dist || 1), ny = (b.x - a.x) / (dist || 1), bulge = k.arc * dist * Math.sin(Math.PI * clamp(e)); x += nx * bulge; y += ny * bulge; }
  return {
    shapeA: a.shape, shapeB: b.shape, e: e, x: x, y: y,
    sx: lerp(a.sx, b.sx, e), sy: lerp(a.sy, b.sy, e), rot: lerp(a.rot, b.rot, e), w: lerp(a.w, b.w, e)
  };
}
function tokPath(s) {
  var A_ = SH[s.shape || s.shapeA], B_ = SH[s.shape || s.shapeB] || A_, e = s.shape ? 0 : s.e;
  var c = Math.cos(s.rot), sn = Math.sin(s.rot), d = '';
  for (var i = 0; i < NPTS; i++) {
    var px = lerp(A_[i][0], B_[i][0], e) * s.sx, py = lerp(A_[i][1], B_[i][1], e) * s.sy;
    var X = s.x + px * c - py * sn, Y = s.y + px * sn + py * c;
    d += (i ? 'L' : 'M') + X.toFixed(2) + ' ' + Y.toFixed(2);
  }
  return d;
}
function tokCenter(t) { var s = tokAt(t); return [s.x, s.y]; }

/* ----------------------------------------------------------- cursor */
var CK = [];
function buildCursorKeys() {
  var off = function (r, dx, dy) { return [r.cx + (dx || 0), r.cy + (dy || 0)]; };
  CK = [
    { t: 2.04, p: [2200, 1250] },
    { t: 2.50, p: [A.f1.cx - 60, A.f1.cy + 6], d: 0.46 },
    { t: 3.00, p: off(A.rA1, -90, 0), d: 0.40 },
    { t: 3.50, p: [A.f2.cx - 60, A.f2.cy + 6], d: 0.34 },
    { t: 4.00, p: off(A.rB2, -90, 0), d: 0.40 },
    { t: 4.25, p: [A.btn.cx - 30, A.btn.cy + 6], d: 0.22 },
    { t: 5.00, p: [A.nvTreks.x + 30, A.nvTreks.cy + 4], d: 0.62 },
    { t: 5.38, p: off(A.mi0, 40, 4), d: 0.30 },
    { t: 5.64, p: off(A.mi2, 40, 4), d: 0.22 },
    { t: 5.96, p: off(A.mi1, 40, 4), d: 0.28 },
    { t: 6.64, p: [2050, 1130], d: 0.55 },
    { t: 9.08, p: [2420, 640], d: 0.02 },
    { t: 9.50, p: [A.txt.x + 330, A.txt.y + 58], d: 0.40 },
    { t: 10.95, p: [A.send.cx + 40, A.send.cy + 4], d: 0.40 },
    { t: 11.50, p: [A.send.cx + 520, A.send.cy - 520], d: 0.40 }
  ];
}
function curAt(t) {
  var i = 0;
  while (i + 1 < CK.length && t >= CK[i + 1].t - CK[i + 1].d) i++;
  var k = CK[i];
  if (i === 0 || t >= k.t) return { x: k.p[0], y: k.p[1], vis: !(i === 0 && t < CK[0].t) };
  var kp = CK[i - 1], t0 = k.t - k.d, u = (t - t0) / k.d, e = expo(u);
  var x = lerp(kp.p[0], k.p[0], e), y = lerp(kp.p[1], k.p[1], e);
  var dist = Math.hypot(k.p[0] - kp.p[0], k.p[1] - kp.p[1]);
  var nx = -(k.p[1] - kp.p[1]) / (dist || 1), ny = (k.p[0] - kp.p[0]) / (dist || 1), b = 0.10 * dist * Math.sin(Math.PI * clamp(e));
  return { x: x + nx * b, y: y + ny * b, vis: true };
}
function curPress(t) {
  var v = 0;
  TL.clicks.forEach(function (tc) { if (t >= tc) v = Math.max(v, expo((t - tc) / 0.035) * (1 - sp(t, tc + 0.05, 34, 0.7))); });
  return v;
}

/* ---------------------------------------------------------- helpers */
function setClip(el, top, right, bottom, left, round) {
  el.style.clipPath = 'inset(' + top.toFixed(2) + '% ' + right.toFixed(2) + '% ' + bottom.toFixed(2) + '% ' + left.toFixed(2) + '%' + (round ? ' round ' + round + 'px' : '') + ')';
}
function revealLR(el, p, round) { setClip(el, 0, (1 - p) * 100, 0, 0, round); }
function revealTB(el, p, round) { setClip(el, 0, 0, (1 - p) * 100, 0, round); }
function revealBT(el, p, round) { setClip(el, (1 - p) * 100, 0, 0, 0, round); }
var DTG = 1 / 180;
/* masked word rise; f(t) is the 0..1 progress, blur follows the word's vertical speed */
function riseF(el, f, t) {
  var p = f(t), v = Math.abs(f(t + DTG) - f(t - DTG)) * (el._h || 100) * 1.18;
  el.style.transform = 'translateY(' + ((1 - p) * 118).toFixed(2) + '%)';
  var b = Math.min(6, v * 0.13);
  el.style.filter = b > 0.5 ? 'blur(' + b.toFixed(2) + 'px)' : 'none';
}
function vis(el, on) { el.style.visibility = on ? 'inherit' : 'hidden'; }
function tx(el, x, y, s) { el.style.transform = 'translate(' + (x || 0).toFixed(2) + 'px,' + (y || 0).toFixed(2) + 'px)' + (s !== undefined ? ' scale(' + s.toFixed(4) + ')' : ''); }
var wordsOf = function (el) { return el.querySelectorAll('.w'); };
var W1 = null, W2 = null, MH = null;

/* list open/close progress with row stagger */
function listState(t, tOpen, tClose) {
  var o = sp(t, tOpen, 22, 0.84), c = expo((t - tClose) / 0.2);
  return clamp(o, 0, 1.02) * (1 - c);
}
function listApply(list, rows, t, tOpen, tClose) {
  var p = listState(t, tOpen, tClose);
  vis(list, p > 0.002);
  setClip(list, 0, 0, (1 - clamp(p)) * 100, 0, 24);
  tx(list, 0, -14 * (1 - clamp(p)));
  rows.forEach(function (r, i) {
    var rp = clamp(sp(t, tOpen + 0.035 * i, 26, 0.9)) * (1 - expo((t - tClose) / 0.16));
    r.style.transform = 'translateY(' + ((1 - rp) * 16).toFixed(2) + 'px)';
  });
}
function selRow(row, a) { setClip(row.querySelector('.rb'), 0, (1 - a) * 100, 0, 0, 18); }

/* ---------------------------------------------------------- seek */
function speedBlur(bEl, p0, p1, k, c) {
  var sx = Math.min(34, Math.abs(p1[0] - p0[0]) * c.z * k), sy = Math.min(34, Math.abs(p1[1] - p0[1]) * c.z * k);
  bEl.setAttribute('stdDeviation', (sx / c.z).toFixed(2) + ' ' + (sy / c.z).toFixed(2));
  return sx > 0.9 || sy > 0.9;
}

window.seek = function (t) {
  t = Math.max(0, Math.min(DUR, t));
  var cam = camAt(t); applyCam(cam);
  var DT = 1 / 180;

  /* camera motion blur: direction and amount follow the camera's screen-space velocity */
  var c0 = camAt(t - DT), c1 = camAt(t + DT);
  var zr = Math.abs(Math.log(c1.z / c0.z)) * 560;
  var cbx = Math.min(26, (Math.abs(c1.x - c0.x) * cam.z + zr * 0.8) * 0.25), cby = Math.min(26, (Math.abs(c1.y - c0.y) * cam.z + zr * 0.5) * 0.25);
  var camBlur = cbx > 0.9 || cby > 0.9;
  E.mbCamB.setAttribute('stdDeviation', (cbx / cam.z).toFixed(2) + ' ' + (cby / cam.z).toFixed(2));
  E.cam.style.filter = camBlur ? 'url(#mbCam)' : 'none'; E.cam2.style.filter = camBlur ? 'url(#mbCam)' : 'none';

  /* ================= HOOK  0.0 - 2.0 ================= */
  var hookOn = t < 2.1;
  vis(E.hook, hookOn);
  if (hookOn) {
    revealLR(E.ebMask, expo((t - 0.12) / 0.36) * (1 - expoIn(prog(t, 1.0, 1.3))));
    [0.04, 0.10, 0.16].forEach(function (t0, i) { riseF(W1[i], function (tt) { return sp(tt, t0, 26, 0.8); }, t); });
    [0.52, 0.58].forEach(function (t0, i) { riseF(W2[i], function (tt) { return sp(tt, t0, 26, 0.8); }, t); });
    var pushOut = function (tt) { return expoIn(prog(tt, 1.56, 1.98)) * 640 + sp(tt, 1.0, 20, 0.8) * 38; };
    tx(E.l1, 0, -pushOut(t)); tx(E.l2, 0, pushOut(t));
    var hv_ = Math.abs(pushOut(t + DT) - pushOut(t - DT)) * cam.z;
    var hb = Math.min(30, hv_ * 0.2);
    E.mbL1B.setAttribute('stdDeviation', '0 ' + (hb / cam.z).toFixed(2)); E.mbL2B.setAttribute('stdDeviation', '0 ' + (hb / cam.z).toFixed(2));
    E.l1.style.filter = hb > 0.9 ? 'url(#mbL1)' : 'none'; E.l2.style.filter = hb > 0.9 ? 'url(#mbL2)' : 'none';
  }

  /* ================= FINDER  2.0 - 4.7 ================= */
  var finderOn = t >= 1.96 && t < 4.8;
  vis(E.finder, finderOn);
  if (finderOn) {
    vis(E.pill, t >= 1.98);
    var intro = function (i) { return expo((t - (2.08 + 0.055 * i)) / 0.26); };
    var coll = expo((t - 4.3) / 0.28), foldIn = expoIn(prog(t, 4.52, 4.7));
    [E.f1, E.f2, E.f3].forEach(function (f, i) { setClip(f, 0, (1 - intro(i)) * 100, 0, 0, 48); tx(f, -14 * (1 - intro(i)), 0); });
    setClip(E.btn, 0, (1 - intro(3)) * 100, 0, 0, 20); tx(E.btn, -14 * (1 - intro(3)), 0);
    document.querySelectorAll('#pill .divd').forEach(function (d, i) { revealTB(d, expo((t - (2.2 + 0.05 * i)) / 0.2)); });
    var a1 = expo((t - 2.5) / 0.16) * (1 - expo((t - 3.32) / 0.14));
    var a2 = expo((t - 3.5) / 0.16) * (1 - expo((t - 4.12) / 0.14));
    setClip(E.f1bg, 0, (1 - a1) * 50, 0, (1 - a1) * 50, 48); setClip(E.f2bg, 0, (1 - a2) * 50, 0, (1 - a2) * 50, 48);
    listApply(E.listDest, [E.rA0, E.rA1, E.rA2], t, 2.5, 3.08);
    listApply(E.listDiff, [E.rB0, E.rB1, E.rB2, E.rB3, E.rB4], t, 3.5, 4.08);
    selRow(E.rA0, clamp(sp(t, 2.56, 24, 0.9)) * (1 - expo((t - 3.0) / 0.16))); selRow(E.rA1, expo((t - 3.0) / 0.18)); selRow(E.rA2, 0);
    selRow(E.rB0, clamp(sp(t, 3.56, 24, 0.9)) * (1 - expo((t - 4.0) / 0.16))); selRow(E.rB1, 0); selRow(E.rB2, expo((t - 4.0) / 0.18)); selRow(E.rB3, 0); selRow(E.rB4, 0);
    /* value roll: old text leaves first, new text arrives after (separate timing) */
    var roll = function (oldEl, newEl, t0) {
      oldEl.style.transform = 'translateY(' + (-expo((t - t0) / 0.16) * 120).toFixed(1) + '%)';
      newEl.style.transform = 'translateY(' + ((1 - expo((t - t0 - 0.1) / 0.24)) * 120).toFixed(1) + '%)';
    };
    roll(E.f1old, E.f1new, 3.0); roll(E.f2old, E.f2new, 4.0);
    /* click on Find my trek: press, pill collapses onto the button, everything folds into the arrow */
    var btnPress = curPress(t) * (t > 4.2 && t < 4.4 ? 0.07 : 0);
    setClip(E.pill, 0, 0, 0, coll * (1 - 264 / 1640) * 100, 60);
    [E.f1, E.f2, E.f3].forEach(function (f, i) { setClip(f, 0, (1 - intro(i)) * 100, 0, 0, 48); });
    vis(E.f1, coll < 0.6); vis(E.f2, coll < 0.6); vis(E.f3, coll < 0.6);
    document.querySelectorAll('#pill .divd').forEach(function (d) { vis(d, coll < 0.4); });
    E.btnArrowPath.style.visibility = t > 4.3 ? 'hidden' : 'inherit';
    E.pill.style.transformOrigin = (A.btnArrow.cx - A.pill.x) + 'px ' + (A.btnArrow.cy - A.pill.y) + 'px';
    E.pill.style.transform = 'scale(' + (1 - foldIn * 0.995 - btnPress).toFixed(4) + ')';
    vis(E.pill, t >= 1.98 && foldIn < 0.995);
  }

  /* ================= HEADER + MENU  4.5 - 7.0 ================= */
  var hOn = t >= 4.46 && t < 6.9;
  vis(E.header, hOn); vis(E.menu, hOn);
  if (hOn) {
    var hp = clamp(sp(t, 4.5, 18, 0.86), 0, 1.02);
    setClip(E.header, 0, (1 - hp) * 50, 0, (1 - hp) * 50, 24);
    var tb = expo((t - 5.0) / 0.16); setClip(E.navTreksBg, 0, (1 - tb) * 50, 0, (1 - tb) * 50, 16);
    E.chevTreks.style.visibility = t >= 4.84 ? 'hidden' : 'inherit';
    var mp = clamp(sp(t, 5.0, 20, 0.86), 0, 1.02);
    setClip(E.menu, 0, 0, (1 - clamp(mp)) * 100, 0, 26);
    var m0 = 5.06;
    revealLR(E.mEyebrow, expo((t - m0) / 0.3));
    riseF(MH[0], function (tt) { return sp(tt, m0 + 0.04, 24, 0.82); }, t); riseF(MH[1], function (tt) { return sp(tt, m0 + 0.10, 24, 0.82); }, t);
    revealTB(E.mIntro, expo((t - m0 - 0.12) / 0.3)); revealLR(E.mLink, expo((t - m0 - 0.18) / 0.3));
    for (var mi = 0; mi < 6; mi++) revealTB(E['mi' + mi], expo((t - (m0 + 0.06 + 0.045 * mi)) / 0.3), 18);
    var gp = expo((t - m0 - 0.08) / 0.4); setClip(E.phWrap, (1 - gp) * 50, (1 - gp) * 50, (1 - gp) * 50, (1 - gp) * 50, 20);
    revealLR(E.mSep, expo((t - m0 - 0.2) / 0.3)); revealTB(E.mf1, expo((t - m0 - 0.24) / 0.25)); revealTB(E.mf2, expo((t - m0 - 0.28) / 0.25));
    var HOV = [[0, 5.38, 5.64], [2, 5.64, 5.80], [1, 5.80, 99]];
    for (var mj = 0; mj < 6; mj++) {
      var ha = 0;
      HOV.forEach(function (h) { if (h[0] === mj) ha = Math.max(ha, expo((t - h[1]) / 0.12) * (1 - expo((t - h[2]) / 0.12))); });
      var row = E['mi' + mj];
      setClip(row.querySelector('.mb'), 0, (1 - ha) * 100, 0, 0, 18);
      var arw = row.querySelector('.ma');
      arw.style.transform = 'translateX(' + (ha * 7).toFixed(2) + 'px)';
      arw.style.visibility = (t > 5.34 && (mj === 0 || mj === 2 || mj === 1)) ? 'hidden' : 'inherit'; /* the token rides these arrows */
    }
    setClip(E.phB, (1 - expo((t - 6.0) / 0.3)) * 100, 0, 0, 0);
  }

  /* ================= PHOTO EXPANSION + SWEEP (screen space) ================= */
  var expOn = t >= 6.3 && t < 7.4;
  vis(E.photoExp, expOn);
  if (expOn) {
    var ee = cd(prog(t, 6.3, 6.86), 0.56);
    var q0 = w2s(A.ph.x, A.ph.y, cam), q1 = w2s(A.ph.r, A.ph.b, cam);
    var fx0 = lerp(q0[0], -60, ee), fy0 = lerp(q0[1], -34, ee), fx1 = lerp(q1[0], W + 60, ee), fy1 = lerp(q1[1], H + 34, ee);
    var tcw = tokCenter(Math.min(t, 7.42));
    var swx = w2s(tcw[0], tcw[1], cam)[0];
    var cut = t < 6.9 ? W + 400 : swx;
    var ps = E.photoExp.style;
    ps.left = fx0.toFixed(1) + 'px'; ps.top = fy0.toFixed(1) + 'px'; ps.width = (fx1 - fx0).toFixed(1) + 'px'; ps.height = (fy1 - fy0).toFixed(1) + 'px';
    ps.borderRadius = lerp(20 * cam.z, 0, ee).toFixed(1) + 'px';
    ps.clipPath = 'inset(0 ' + Math.max(0, fx1 - cut).toFixed(1) + 'px 0 0)';
    E.imgExp.style.transform = 'scale(' + (1 + 0.05 * prog(t, 6.3, 7.4)).toFixed(4) + ')';
  }

  /* ================= BACKDROP PHOTO (tailor + form) ================= */
  vis(E.photoB, t >= 6.9);
  if (t >= 6.9) {
    var bs = 1 + 0.09 * prog(t, 7.0, 12.0);
    E.imgSun.style.transform = 'translate(' + (-(cam.x - 960) * 0.06).toFixed(2) + 'px,' + (-(cam.y - 540) * 0.04).toFixed(2) + 'px) scale(' + bs.toFixed(4) + ')';
  }

  /* ================= TAILOR  7.0 - 9.3 ================= */
  var tOn = t >= 7.0 && t < 9.4;
  vis(E.tailor, tOn);
  if (tOn) {
    revealLR(E.tEbMask, expo((t - 7.64) / 0.3) * (1 - expoIn(prog(t, 8.7, 8.9))));
    var tOut = function (a) { return expoIn(prog(t, a, a + 0.26)); };
    var tOutF = function (tt, a) { return expoIn(prog(tt, a, a + 0.26)); };
    riseF(wordsOf(E.tl1)[0], function (tt) { return sp(tt, 7.50, 24, 0.82) - tOutF(tt, 8.66); }, t);
    riseF(wordsOf(E.tl2)[0], function (tt) { return sp(tt, 7.58, 24, 0.82) - tOutF(tt, 8.70); }, t);
    [E.st1, E.st2, E.st3].forEach(function (el, i) { riseF(wordsOf(el)[0], function (tt) { return sp(tt, [7.72, 8.10, 8.50][i], 26, 0.82) - tOutF(tt, 8.62 + 0.05 * i); }, t); });
  }

  /* ================= FORM  9.0 - 12.0 ================= */
  var fOn = t >= 8.98 && t < 11.98;
  vis(E.form, fOn);
  if (fOn) {
    var shrink = expo((t - 11.1) / 0.32), fh = lerp(760, 334, shrink);
    E.form.style.top = (A.form.y + (760 - fh) / 2).toFixed(1) + 'px'; E.form.style.height = fh.toFixed(1) + 'px';
    setClip(E.form, 0, 0, (1 - cardP(t)) * 100, 0, 32);
    var phrase = 'Langtang Valley', nch = Math.floor(clamp((t - 9.84) * 30, 0, phrase.length));
    E.txtTyped.textContent = phrase.slice(0, nch);
    var focus = t >= 9.5;
    E.txt.style.borderColor = focus ? '#153d2f' : '#cfd9d3';
    E.caret.style.visibility = (focus && t < 11.0 && (nch > 0 || Math.floor((t - 9.5) / 0.25) % 2 === 0)) ? 'inherit' : 'hidden';
    E.send.style.transform = 'scale(' + (1 - curPress(t) * (t >= 10.9 && t < 11.15 ? 0.04 : 0)).toFixed(4) + ')';
    var fOut = expo((t - 11.0) / 0.2), fIn = expo((t - 11.04) / 0.3);
    setClip(E.formBody, 0, 0, fOut * 100, 0); tx(E.formBody, 0, -30 * fOut);
    vis(E.formBody, fOut < 0.999);
    vis(E.success, fIn > 0.002); setClip(E.success, 0, 0, (1 - fIn) * 100, 0, 20); tx(E.success, 0, 22 * (1 - fIn));
  }

  /* ================= DISC: forest grows past all four corners ================= */
  var dprog = cd((t - 11.5) / 0.5, 0.5);
  vis(E.disc, dprog > 0);
  if (dprog > 0) {
    var dc = w2s(tokCenter(11.5)[0], tokCenter(11.5)[1], camAt(11.5));
    var dR = Math.hypot(Math.max(dc[0], W - dc[0]), Math.max(dc[1], H - dc[1])) + 80;
    E.disc.style.clipPath = 'circle(' + (dprog * dR).toFixed(1) + 'px at ' + dc[0].toFixed(1) + 'px ' + dc[1].toFixed(1) + 'px)';
  }

  /* ================= END CARD  12.0 - 15.0 ================= */
  E.cpMarkRect.setAttribute('height', (650 * cd((t - 12.0) / 0.5, 0.5)).toFixed(1));
  var BT = [12.5, 13.0, 13.5];
  for (var bi = 0; bi < 3; bi++) {
    var bh = L.bands[bi][1] - L.bands[bi][0] + 60;
    E['tg' + bi].setAttribute('transform', 'translate(0,' + ((1 - sp(t, BT[bi], 24, 0.82)) * bh).toFixed(1) + ')');
  }
  riseF(E.ctaA, function (tt) { return sp(tt, 14.0, 24, 0.82); }, t); riseF(E.ctaB, function (tt) { return sp(tt, 14.08, 24, 0.82); }, t);
  E.ctaArrowPath.setAttribute('stroke-dasharray', '60'); E.ctaArrowPath.setAttribute('stroke-dashoffset', ((1 - expo((t - 14.12) / 0.34)) * 60).toFixed(2));
  E.ctaArrow.style.left = (A.ctaB.r + 36 + sp(t, 14.5, 26, 0.7) * 18).toFixed(1) + 'px'; E.ctaArrow.style.top = '12px';
  riseF(E.domT, function (tt) { return sp(tt, 14.5, 24, 0.82); }, t);

  /* ================= TOKEN ================= */
  var tk = tokAt(t);
  E.tok.setAttribute('d', tokPath(tk));
  E.tok.setAttribute('stroke-width', Math.max(0.01, tk.w).toFixed(2));
  var tokBlur = speedBlur(E.mbTokB, tokCenter(t - DT), tokCenter(t + DT), 0.3, cam);
  E.tok.style.filter = tokBlur ? 'url(#mbTok)' : 'none';
  E.tok.setAttribute('opacity', (t > 12.6 && tk.w < 0.05) ? 0 : 1);

  /* ================= CURSOR ================= */
  var cu = curAt(t), cu0 = curAt(t - DT), cu1 = curAt(t + DT);
  var cs = 1 / Math.pow(cam.z, 0.55);
  E.cursor.style.transformOrigin = '2px 2px';
  E.cursor.style.transform = 'translate(' + (cu.x - 2).toFixed(2) + 'px,' + (cu.y - 2).toFixed(2) + 'px) scale(' + (cs * (1 - 0.13 * curPress(t)) * 0.78).toFixed(4) + ')';
  vis(E.cursor, cu.vis && t < 11.95);
  E.curG.style.filter = speedBlur(E.mbCurB, [cu0.x, cu0.y], [cu1.x, cu1.y], 0.25, cam) ? 'url(#mbCur)' : 'none';
};

/* ---------------------------------------------------------------- init */
function init() {
  W1 = wordsOf(E.l1); W2 = wordsOf(E.l2); MH = wordsOf(E.mHead);
  measure();
  document.querySelectorAll('.w').forEach(function (el) { el._h = el.getBoundingClientRect().height; });
  buildShots(); buildTokenKeys(); buildCursorKeys();
  /* sanity: warn on overlapping token keys */
  for (var i = 1; i < K.length; i++) { var s0 = K[i].t - (K[i].d || 0); if (s0 < K[i - 1].t - 0.001 && !K[i - 1].live) console.warn('token keys overlap', i, K[i].t, s0, K[i - 1].t); }
  window.__A = A; window.__K = K;
  window.__ready = true;
}
var imgs = Array.prototype.slice.call(document.images);
Promise.all([document.fonts.load('800 100px PJS'), document.fonts.load('600 20px PJS'), document.fonts.load('650 20px PJS'), document.fonts.ready].concat(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); }))).then(init);
})();
