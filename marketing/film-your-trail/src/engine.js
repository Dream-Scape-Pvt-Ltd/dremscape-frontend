/* YOUR TRAIL — Dreamscape Treks, 32.5 s with voiceover. window.seek(t) draws every frame from time alone:
   no CSS animation, no timers, no state carried between frames. */
var W = 1920, H = 1080, TL = window.TL, IM = window.IMG, LOGO = window.LOGO, LET = window.LETTERS;
var VOD = {}; window.VOLINES.forEach(function (l) { VOD[l.id] = l.duration; });
var VOT = {}; TL.vo.forEach(function (v) { VOT[v[0]] = v[1]; });
var FOREST = '#153d2f', GOLD = '#e4c98a', WHITE = '#f9faf8';

/* ------------------------------------------------------------------ math + easing */
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, k) { return a + (b - a) * k; };
var prog = function (t, a, b) { return clamp((t - a) / (b - a)); };
var E1 = 1 - Math.pow(2, -10);
var expo = function (u) { u = clamp(u); var v = u * u * (3 - 2 * u); return (1 - Math.pow(2, -10 * v)) / E1; };
var expoIn = function (u) { u = clamp(u); return (Math.pow(2, 10 * u) - 1) / 1023; };
var expoIO = function (u) { u = clamp(u); return u < 0.5 ? expoIn(u * 2) / 2 : 0.5 + expo((u - 0.5) * 2) / 2; };
var smooth = function (u) { u = clamp(u); return u * u * (3 - 2 * u); };
var smoother = function (u) { u = clamp(u); return u * u * u * (u * (u * 6 - 15) + 10); };
function spring(t, w, z) {
  if (t <= 0) return 0; w = w || 18; z = z === undefined ? 0.86 : z;
  var a = z * w, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-a * t) * (Math.cos(wd * t) + (a / wd) * Math.sin(wd * t));
}
var sp = function (t, t0, w, z) { return clamp(spring(t - t0, w, z), 0, 1.04); };

/* ------------------------------------------------------------------ DOM */
var NS = 'http://www.w3.org/2000/svg', ST = document.getElementById('stage'), G = {};
function el(tag, attrs, parent, svg) {
  var e = svg ? document.createElementNS(NS, tag) : document.createElement(tag);
  for (var k in attrs) { if (k === 'style') e.style.cssText = attrs[k]; else if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
  if (parent) parent.appendChild(e); return e;
}
var vis = function (e, on) { e.style.visibility = on ? 'inherit' : 'hidden'; };
var $ = function (id) { return document.getElementById(id); };

/* a photograph in a moving frame: frame offset (whip pans), image push-in, optional blur */
function photo(key, parent) {
  var f = el('div', { class: 'ph' }, parent);
  f.img = el('img', { src: IM[key] }, f); f.vig = el('div', { class: 'vig' }, f);
  return f;
}
/* caption made of words that rise in their own masks; returns the word spans */
function caption(parent, html, x, y, size, align) {
  var c = el('div', { class: 'cap', style: 'left:' + x + 'px;top:' + y + 'px;font-size:' + size + 'px' + (align === 'center' ? ';width:1920px;left:0;text-align:center' : '') }, parent);
  c.innerHTML = html.split(' ').map(function (w) { return '<span class="wm"><span class="w">' + w + '</span></span>'; }).join(' ');
  return [].slice.call(c.querySelectorAll('.w'));
}
/* word onsets spread across a voiceover line by letter count, a hair ahead of the voice */
function wordTimes(id, words) {
  var t0 = VOT[id], d = VOD[id], tot = 0, acc = 0, out = [];
  words.forEach(function (w) { tot += w.textContent.length + 1; });
  words.forEach(function (w) { out.push(t0 - 0.08 + d * 0.72 * acc / tot); acc += w.textContent.length + 1; });
  return out;
}
function riseWords(words, times, t, outT) {
  words.forEach(function (w, i) {
    var u = sp(t, times[i], 16, 0.9), o = outT ? expoIn(prog(t, outT + 0.03 * i, outT + 0.35 + 0.03 * i)) : 0;
    w.style.transform = 'translateY(' + ((1 - u) * 110 - o * 110).toFixed(1) + '%)';
  });
}

/* directional blur for the whip pans (velocity -> stdDeviation) */
function blurFilters() {
  var s = el('svg', { width: 0, height: 0, style: 'position:absolute' }, ST, true), d = el('defs', {}, s, true);
  [['wbx', 'x'], ['wby', 'y']].forEach(function (f) {
    var flt = el('filter', { id: f[0], x: '-20%', y: '-20%', width: '140%', height: '140%', 'color-interpolation-filters': 'sRGB' }, d, true);
    G[f[0]] = el('feGaussianBlur', { stdDeviation: '0 0', edgeMode: 'duplicate' }, flt, true);
  });
}
function setBlur(e, id, sigma) {
  if (sigma < 0.6) { e.style.filter = 'none'; return; }
  G[id].setAttribute('stdDeviation', id === 'wbx' ? sigma.toFixed(2) + ' 0' : '0 ' + sigma.toFixed(2));
  e.style.filter = 'url(#' + id + ')';
}
var vel = function (f, t) { var h = 1 / 240; return (f(t + h) - f(t - h)) / (2 * h); };
var whipSigma = function (v) { return Math.min(70, Math.abs(v) / 60 * 0.45); };

/* ------------------------------------------------------------------ build */
function build() {
  blurFilters();
  G.photos = el('div', { class: 'l' }, ST);
  ['lastlight', 'together', 'night', 'golden'].forEach(function (k) { G[k] = photo(k, G.photos); });
  G.goldenDim = el('div', { class: 'l', style: 'background:#0b2a1f' }, G.golden);

  /* bar 1-2 captions live inside their photographs, so they travel and blur with the whip */
  G.cap1 = caption(G.lastlight, 'Some trails you walk.', 150, 770, 96);
  G.cap2 = caption(G.together, 'Some trails <span class="gold">stay</span> <span class="gold">with</span> <span class="gold">you.</span>'.replace(/<span class="gold">(\w+\.?)<\/span>/g, '§$1'), 150, 770, 96);
  G.cap2.forEach(function (w) { if (w.textContent.charAt(0) === '§') { w.textContent = w.textContent.slice(1); w.classList.add('gold'); } });
  G.eye2 = el('div', { class: 'eyebrow', style: 'left:150px;top:418px', html: '<span class="dash"></span><span class="wm"><span class="w">Our team · Thamel, Kathmandu</span></span>' }, G.night);
  G.cap3 = caption(G.night, 'Since 2005', 146, 474, 176);

  /* the finder sits over the golden photograph */
  G.ui = el('div', { class: 'l', style: 'transform-origin:0 0' }, ST);
  G.finder = $('finder'); G.ui.appendChild(G.finder);
  G.cursor = el('svg', { id: 'cursor', class: 'abs', viewBox: '0 0 44 60' }, G.ui, true);
  el('path', { d: 'M4 3 L4 46 L15 35 L23 54 L31 50 L23 32 L39 32 Z', fill: '#fff', stroke: '#0b2a1f', 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, G.cursor, true);
  G.ripple = el('div', { id: 'ripple', class: 'abs' }, G.ui);
  G.dot = el('div', { class: 'abs', style: 'left:0;top:0;width:28px;height:28px;border-radius:50%;background:' + GOLD + ';z-index:45' }, ST);

  /* route over "a pause on the ridge" */
  G.pause = photo('pause', ST);
  G.route = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G.pause, true);
  G.routePath = el('path', { d: ROUTE_D, fill: 'none', stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '1 0', pathLength: 1 }, G.route, true);
  G.routeHead = el('circle', { r: 13, fill: GOLD }, G.route, true);
  G.pinRing = el('circle', { r: 13, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, G.route, true);
  G.cap4 = caption(G.pause, 'Shaped around you.', 0, 150, 112, 'center');

  /* steps + photo card */
  G.steps = el('div', { id: 'steps', class: 'l' }, ST);
  G.eye5 = el('div', { class: 'eyebrow', style: 'left:150px;top:262px', html: '<span class="dash"></span><span class="wm"><span class="w">Make the trail your own</span></span>' }, G.steps);
  G.rows = [['01', 'Share your idea'], ['02', 'Talk through the route'], ['03', 'Review a personal proposal']].map(function (r, i) {
    var d = el('div', { class: 'st', style: 'top:' + (360 + i * 150) + 'px' }, G.steps);
    d.n = el('div', { class: 'n', text: r[0] }, d);
    var tm = el('div', { class: 't', html: '<span class="wm"><span class="w">' + r[1] + '</span></span>' }, d); d.w = tm.querySelector('.w');
    return d;
  });
  G.card = el('div', { id: 'card', class: 'abs' }, ST);
  el('img', { src: IM.flags }, G.card);
  G.cardDim = el('div', { id: 'cardDim' }, G.card);
  G.cardCap = el('div', { id: 'cardCap', html: '<span class="wm"><span class="w">A moment at the top</span></span>' }, ST);

  /* end title: the official lockup, then the call to action */
  buildLockup();
  G.cta = el('div', { id: 'cta', html: '<span>Plan my journey</span><svg width="38" height="30" viewBox="0 0 38 30"><path d="M2 15h32M22 4l12 11-12 11"/></svg>' }, ST);
  G.url = el('div', { id: 'url', html: '<span class="wm"><span class="w">dreamscapetreks.com</span></span>' }, ST);
}

/* the gold route: from the walkers on the hillside up toward the range */
var ROUTE = [[640, 662], [760, 640], [860, 652], [968, 612], [1060, 600], [1150, 560], [1262, 548], [1350, 506], [1452, 486], [1560, 452]];
var ROUTE_D = (function () {   /* Catmull-Rom through the points, as cubic Béziers */
  var p = ROUTE, d = 'M' + p[0][0] + ' ' + p[0][1];
  for (var i = 0; i < p.length - 1; i++) {
    var p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0] + ' ' + p2[1];
  }
  return d;
})();

/* lockup: mark, DREAMSCAPE letters, TM, TREKS band, tagline band, each rising behind its own clip */
var LKS = 0.34, LKX = 960 - 3337 * LKS / 2, LKY = 300;
function buildLockup() {
  G.lk = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, ST, true);
  var defs = el('defs', {}, G.lk, true);
  var cpMk = el('clipPath', { id: 'cpMk' }, defs, true); el('rect', { x: 0, y: -40, width: 1600, height: 690 }, cpMk, true);
  var cpTx = el('clipPath', { id: 'cpTx' }, defs, true); el('rect', { x: 1380, y: 0, width: 1957, height: 300 }, cpTx, true);
  [[318, 156], [496, 160]].forEach(function (b, i) { var c = el('clipPath', { id: 'cpB' + (i + 1) }, defs, true); el('rect', { x: 1380, y: b[0], width: 1957, height: b[1] }, c, true); });
  [[318, 156], [496, 160]].forEach(function (b, i) { var c = el('clipPath', { id: 'cpC' + (i + 1) }, defs, true); el('rect', { x: 1380, y: b[0], width: 1957, height: b[1] }, c, true); });
  var g = el('g', { transform: 'translate(' + LKX.toFixed(1) + ',' + LKY + ') scale(' + LKS + ')' }, G.lk, true);
  var gm = el('g', { 'clip-path': 'url(#cpMk)' }, g, true); G.mk = el('path', { d: LOGO.mark, fill: WHITE, 'fill-rule': 'evenodd' }, gm, true);
  var gt = el('g', { 'clip-path': 'url(#cpTx)' }, g, true);
  G.letters = LET.map(function (l) { return el('path', { d: l.d, fill: WHITE, 'fill-rule': 'evenodd' }, gt, true); });
  var b1 = el('g', { 'clip-path': 'url(#cpB1)' }, g, true); G.tb1 = el('g', {}, b1, true); el('path', { d: LOGO.text, fill: WHITE, 'fill-rule': 'evenodd', 'clip-path': 'url(#cpC1)' }, G.tb1, true);
  var b2 = el('g', { 'clip-path': 'url(#cpB2)' }, g, true); G.tb2 = el('g', {}, b2, true); el('path', { d: LOGO.text, fill: WHITE, 'fill-rule': 'evenodd', 'clip-path': 'url(#cpC2)' }, G.tb2, true);
}

/* ------------------------------------------------------------------ the frame */
var CARD0 = { x: 1150, y: 120, w: 610, h: 820, r: 30 };
/* cursor keyframes: [time, x, y] (finder coordinates are the template's minus 70 px) */
var CK = TL.clicks;
var CUR = [[12.95, 1760, 1180], [CK[0] - 0.12, 380, 474], [CK[0], 380, 474], [CK[1] - 0.15, 410, 726], [CK[1], 410, 726], [CK[2] - 0.14, 846, 476], [CK[2], 846, 476], [CK[3] - 0.14, 890, 804], [CK[3], 890, 804], [CK[4] - 0.14, 1640, 474], [CK[4], 1640, 474], [17.4, 1640, 474]];
function cursorAt(t) {
  if (t <= CUR[0][0]) return [CUR[0][1], CUR[0][2]];
  for (var i = 0; i < CUR.length - 1; i++) if (t <= CUR[i + 1][0]) { var u = smoother((t - CUR[i][0]) / (CUR[i + 1][0] - CUR[i][0])); return [lerp(CUR[i][1], CUR[i + 1][1], u), lerp(CUR[i][2], CUR[i + 1][2], u)]; }
  return [CUR[CUR.length - 1][1], CUR[CUR.length - 1][2]];
}
var BTN_C = [140 + 1376 + 125, 480 - 70 + 12 + 48];                     /* centre of "Find my trek" (finder space) */
/* screen-studio style camera on the finder: [time, focus x, focus y, zoom] — it leans in on the field being used */
var UICAM = [[12.4, 960, 540, 1.0], [13.15, 960, 540, 1.0], [13.7, 560, 580, 1.42], [14.45, 560, 580, 1.42], [14.95, 900, 640, 1.42], [15.7, 900, 640, 1.42], [16.15, 1320, 500, 1.3], [17.2, 1320, 500, 1.3]];
function uiCam(t) {
  var K = UICAM; if (t <= K[0][0]) return K[0].slice(1);
  for (var i = 0; i < K.length - 1; i++) if (t <= K[i + 1][0]) { var u = smoother((t - K[i][0]) / (K[i + 1][0] - K[i][0])); return [lerp(K[i][1], K[i + 1][1], u), lerp(K[i][2], K[i + 1][2], u), K[i][3] * Math.pow(K[i + 1][3] / K[i][3], u)]; }
  return K[K.length - 1].slice(1);
}
var toScreen = function (p, c) { return [960 + (p[0] - c[0]) * c[2], 540 + (p[1] - c[1]) * c[2]]; };
var ROUTE0 = ROUTE[0];

function photoPush(f, s, ox, oy) { f.img.style.transform = 'translate(' + (ox || 0).toFixed(1) + 'px,' + (oy || 0).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')'; }
function frameAt(f, x, y) { f.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; }

function seekAt(t) {
  var C = TL.cuts;
  /* ---- whip 1 (horizontal): last light -> together ---- */
  var w1 = function (tt) { return expoIO(prog(tt, 2.28, 2.74)); }, e1 = w1(t), b1 = whipSigma(1920 * vel(w1, t));
  /* ---- whip 2 (vertical, tilt up): together -> night ---- */
  var w2 = function (tt) { return expoIO(prog(tt, 4.72, 5.2)); }, e2 = w2(t), b2 = whipSigma(1080 * vel(w2, t));
  /* ---- whip 3 (horizontal): night -> golden ---- */
  var w3 = function (tt) { return expoIO(prog(tt, 9.77, 10.23)); }, e3 = w3(t), b3 = whipSigma(1920 * vel(w3, t));
  /* ---- whip 4 (horizontal): route -> steps ---- */
  var w4 = function (tt) { return expoIO(prog(tt, 19.74, 20.22)); }, e4 = w4(t), b4 = whipSigma(1920 * vel(w4, t));

  vis(G.lastlight, t < 2.76); vis(G.together, t >= 2.27 && t < 5.22); vis(G.night, t >= 4.7 && t < 10.25); vis(G.golden, t >= 9.75 && t < 17.45);
  frameAt(G.lastlight, -1920 * e1, 0); photoPush(G.lastlight, 1.04 + 0.022 * t, -14 * t);
  frameAt(G.together, 1920 * (1 - e1), 1080 * e2); photoPush(G.together, 1.03 + 0.02 * (t - 2.3), 0, -6 * (t - 2.3));
  frameAt(G.night, -1920 * e3, -1080 * (1 - e2)); photoPush(G.night, 1.05 + 0.016 * (t - 4.7), 0, 8 * (t - 4.7));
  frameAt(G.golden, 1920 * (1 - e3), 0); photoPush(G.golden, 1.03 + 0.012 * (t - 9.75), -10 * (t - 9.75));
  setBlur(G.lastlight, 'wbx', b1); setBlur(G.together, t < 3.5 ? 'wbx' : 'wby', t < 3.5 ? b1 : b2);
  setBlur(G.night, t < 7 ? 'wby' : 'wbx', t < 7 ? b2 : b3);
  /* the golden photograph racks out of focus behind the finder */
  var rack = smooth(prog(t, 12.2, 12.85));
  G.golden.img.style.filter = rack > 0.01 ? 'blur(' + (18 * rack).toFixed(2) + 'px)' : 'none';
  if (t < 12) setBlur(G.golden, 'wbx', b3); else G.golden.style.filter = 'none';
  G.goldenDim.style.opacity = (0.34 * rack).toFixed(3);

  /* ---- captions ---- */
  riseWords(G.cap1, wordTimes('walk', G.cap1), t);
  riseWords(G.cap2, wordTimes('stay', G.cap2), t);
  riseWords([G.eye2.querySelector('.w')], [5.55], t, 9.55);
  riseWords(G.cap3, [5.42, 5.78], t, 9.55);

  /* ---- finder ---- */
  sceneFinder(t);

  /* ---- route ---- */
  var onR = t >= 16.7 && t < 20.25; vis(G.pause, onR);
  if (onR) {
    var ir = expoIO(prog(t, 16.72, 17.45)) * 2300, bs = toScreen(BTN_C, uiCam(16.6));
    G.pause.style.clipPath = ir > 2290 ? 'none' : 'circle(' + ir.toFixed(1) + 'px at ' + bs[0].toFixed(1) + 'px ' + bs[1].toFixed(1) + 'px)';
    frameAt(G.pause, -1920 * e4, 0); photoPush(G.pause, 1.08 - 0.02 * (t - 16.7), 0, 0);
    setBlur(G.pause, 'wbx', b4);
    var dr = expoIO(prog(t, 17.85, 19.25)), len = G.routePath.getTotalLength();
    G.routePath.setAttribute('stroke-dasharray', dr.toFixed(4) + ' 1');
    var hp = G.routePath.getPointAtLength(len * dr);
    G.routeHead.setAttribute('cx', hp.x.toFixed(1)); G.routeHead.setAttribute('cy', hp.y.toFixed(1));
    vis(G.routeHead, t >= 17.7); vis(G.routePath, t >= 17.85);
    var pr = expo(prog(t, 19.25, 19.9)); G.pinRing.setAttribute('cx', ROUTE[ROUTE.length - 1][0]); G.pinRing.setAttribute('cy', ROUTE[ROUTE.length - 1][1]);
    G.pinRing.setAttribute('r', (13 + 34 * pr).toFixed(1)); G.pinRing.setAttribute('stroke-opacity', (1 - pr).toFixed(3)); vis(G.pinRing, t >= 19.25);
    riseWords(G.cap4, wordTimes('shape', G.cap4), t);
  }
  /* the gold dot: the button collapses into it, it flies to the start of the route */
  var dotOn = t >= CK[4] + 0.3 && t < 17.9; vis(G.dot, dotOn);
  if (dotOn) {
    var bs2 = toScreen(BTN_C, uiCam(16.6)), dg = expo(prog(t, CK[4] + 0.3, CK[4] + 0.5)), df = expoIO(prog(t, 17.0, 17.6)), dx = lerp(bs2[0], ROUTE0[0], df), dy = lerp(bs2[1], ROUTE0[1], df) - 120 * Math.sin(Math.PI * df), ds = 26 * dg;
    G.dot.style.transform = 'translate(' + (dx - 14).toFixed(1) + 'px,' + (dy - 14).toFixed(1) + 'px) scale(' + (ds / 28).toFixed(3) + ')';
  }

  /* ---- steps ---- */
  var onS = t >= 19.7; vis(G.steps, onS && t < 25.6);
  frameAt(G.steps, 1920 * (1 - e4), 0); setBlur(G.steps, 'wbx', b4);
  riseWords([G.eye5.querySelector('.w')], [20.12], t);
  G.rows.forEach(function (r, i) {
    var t0 = [20.625, 21.875, 23.125][i] - 0.04, u = sp(t, t0, 15, 0.9);
    r.n.style.transform = 'scale(' + u.toFixed(4) + ')'; r.w.style.transform = 'translateY(' + ((1 - sp(t, t0 + 0.06, 15, 0.9)) * 110).toFixed(1) + '%)';
  });
  /* the card: part of the steps layout, then it opens into the end frame */
  var onC = t >= 19.7; vis(G.card, onC);
  if (onC) {
    var k = expoIO(prog(t, 24.55, 25.3)), sx = 1920 * (1 - e4);
    var x = lerp(CARD0.x + sx, 0, k), y = lerp(CARD0.y, 0, k), w = lerp(CARD0.w, W, k), h = lerp(CARD0.h, H, k);
    G.card.style.left = x.toFixed(1) + 'px'; G.card.style.top = y.toFixed(1) + 'px'; G.card.style.width = w.toFixed(1) + 'px'; G.card.style.height = h.toFixed(1) + 'px';
    G.card.style.borderRadius = lerp(CARD0.r, 0, k).toFixed(1) + 'px';
    var cs = 1.0 + 0.012 * (t - 19.7); G.card.firstChild.style.transform = 'scale(' + cs.toFixed(4) + ')';
    var ed = smooth(prog(t, 25.0, 26.0)); G.cardDim.style.opacity = (0.56 * ed).toFixed(3);
    G.card.firstChild.style.filter = ed > 0.01 ? 'blur(' + (7 * ed).toFixed(2) + 'px)' : 'none';
    setBlur(G.card, 'wbx', b4);
  }
  vis(G.cardCap, t >= 20.3 && t < 24.6);
  G.cardCap.style.left = (CARD0.x + 1920 * (1 - e4)).toFixed(1) + 'px'; G.cardCap.style.top = (CARD0.y + CARD0.h + 22) + 'px';
  riseWords([G.cardCap.querySelector('.w')], [20.7], t, 24.3);

  /* ---- end title ---- */
  sceneEnd(t);
}

function sceneFinder(t) {
  var on = t >= 12.4 && t < 16.8; vis(G.ui, on); vis(G.cursor, on && t >= 12.95 && t < CK[4] + 0.3);
  if (!on) return;
  var cam = uiCam(t);
  G.ui.style.transform = 'translate(960px,540px) scale(' + cam[2].toFixed(4) + ') translate(' + (-cam[0]).toFixed(1) + 'px,' + (-cam[1]).toFixed(1) + 'px)';
  var rise = expo(prog(t, 12.45, 13.05)), col = expoIn(prog(t, CK[4] + 0.2, CK[4] + 0.48));
  var s = 1 - col, ox = BTN_C[0], oy = BTN_C[1];
  G.finder.style.transformOrigin = ox + 'px ' + (oy + 70) + 'px';
  G.finder.style.transform = 'translateY(' + ((1 - rise) * 760).toFixed(1) + 'px) scale(' + Math.max(0.001, s).toFixed(4) + ')';
  /* lists */
  var list = function (id, open, close) {
    var o = expo(prog(t, open, open + 0.28)) * (1 - expo(prog(t, close, close + 0.24))), e = $(id);
    e.style.clipPath = 'inset(0 0 ' + ((1 - o) * 100).toFixed(2) + '% 0 round 24px)';
    e.style.transform = 'translateY(' + ((1 - o) * -14).toFixed(1) + 'px)'; vis(e, o > 0.002);
    return o;
  };
  var oD = list('listDest', CK[0] + 0.04, CK[1] + 0.1), oF = list('listDiff', CK[2] + 0.04, CK[3] + 0.1);
  $('f1bg').style.opacity = (oD).toFixed(3); $('f2bg').style.opacity = (oF).toFixed(3);
  /* hover highlights follow the cursor; the chosen row stays lit */
  var cur = cursorAt(t);
  ['rA0', 'rA1', 'rA2'].forEach(function (id, i) { $(id).firstChild.style.opacity = (i === 1 ? smooth(prog(t, CK[1] - 0.2, CK[1] - 0.08)) : (i === 0 ? 1 - smooth(prog(t, CK[1] - 0.25, CK[1] - 0.12)) : 0)).toFixed(3); });
  ['rB0', 'rB1', 'rB2', 'rB3', 'rB4'].forEach(function (id, i) { $(id).firstChild.style.opacity = (i === 2 ? smooth(prog(t, CK[3] - 0.2, CK[3] - 0.08)) : (i === 0 ? 1 - smooth(prog(t, CK[3] - 0.25, CK[3] - 0.12)) : 0)).toFixed(3); });
  $('rA1').querySelector('.ok').style.opacity = smooth(prog(t, CK[1], CK[1] + 0.1)); $('rB2').querySelector('.ok').style.opacity = smooth(prog(t, CK[3], CK[3] + 0.1));
  /* values roll */
  var r1 = expo(prog(t, CK[1] + 0.05, CK[1] + 0.37)), r2 = expo(prog(t, CK[3] + 0.05, CK[3] + 0.37));
  $('v1a').style.transform = 'translateY(' + (-38 * r1).toFixed(1) + 'px)'; $('v1b').style.transform = 'translateY(' + (38 * (1 - r1)).toFixed(1) + 'px)';
  $('v2a').style.transform = 'translateY(' + (-38 * r2).toFixed(1) + 'px)'; $('v2b').style.transform = 'translateY(' + (38 * (1 - r2)).toFixed(1) + 'px)';
  /* button press */
  var bp = expo(prog(t, CK[4], CK[4] + 0.07)) * (1 - expo(prog(t, CK[4] + 0.09, CK[4] + 0.25)));
  $('btn').style.transform = 'scale(' + (1 - 0.05 * bp).toFixed(4) + ')';
  /* cursor + click ripple */
  var press = 0, rip = null;
  TL.clicks.forEach(function (c) { if (t >= c - 0.02 && t < c + 0.5) { press = Math.max(press, expo(prog(t, c - 0.02, c + 0.03)) * (1 - expo(prog(t, c + 0.05, c + 0.18)))); if (t >= c) rip = c; } });
  G.cursor.style.transform = 'translate(' + (cur[0] - 4).toFixed(1) + 'px,' + (cur[1] - 3).toFixed(1) + 'px) scale(' + (1 - 0.12 * press).toFixed(3) + ')';
  G.cursor.style.transformOrigin = '4px 3px';
  if (rip !== null) {
    var ru = expo(prog(t, rip, rip + 0.45)), rr = 8 + 46 * ru, c0 = cursorAt(rip);
    G.ripple.style.transform = 'translate(' + (c0[0] - rr).toFixed(1) + 'px,' + (c0[1] - rr).toFixed(1) + 'px)';
    G.ripple.style.width = G.ripple.style.height = (2 * rr).toFixed(1) + 'px'; G.ripple.style.opacity = (0.9 * (1 - ru)).toFixed(3);
  } else G.ripple.style.opacity = 0;
}

function sceneEnd(t) {
  var on = t >= 25.3; vis(G.lk, on); vis(G.cta, t >= 29.3); vis(G.url, t >= 29.6);
  if (!on) return;
  var b = VOT.brand, m = sp(t, b - 0.05, 12, 0.92);
  G.mk.setAttribute('transform', 'translate(0,' + ((1 - m) * 700).toFixed(1) + ')');
  G.letters.forEach(function (p, i) { var u = sp(t, b + 0.1 + 0.035 * i, 15, 0.9); p.setAttribute('transform', 'translate(0,' + ((1 - u) * 300).toFixed(1) + ')'); });
  var u1 = sp(t, b + 0.55, 14, 0.9), u2 = sp(t, VOT.beyond - 0.02, 14, 0.9);
  G.tb1.setAttribute('transform', 'translate(0,' + ((1 - u1) * 170).toFixed(1) + ')'); G.tb2.setAttribute('transform', 'translate(0,' + ((1 - u2) * 170).toFixed(1) + ')');
  /* call to action: the pill opens from its centre */
  var c = expo(prog(t, 29.375, 29.95)), cw = lerp(96, 520, c);
  G.cta.style.left = (960 - cw / 2).toFixed(1) + 'px'; G.cta.style.top = '640px'; G.cta.style.width = cw.toFixed(1) + 'px';
  G.cta.firstChild.style.opacity = G.cta.lastChild.style.opacity = clamp((c - 0.55) / 0.35).toFixed(3);
  G.url.style.top = '776px'; riseWords([G.url.querySelector('.w')], [29.68], t);
  /* a slow push on the whole end frame */
  var p = 1 + 0.01 * (t - 25.3); G.lk.style.transform = 'scale(' + p.toFixed(4) + ')'; G.lk.style.transformOrigin = '960px 540px';
}

window.__dur = TL.dur;
window.seek = function (t) { seekAt(Math.max(0, Math.min(TL.dur, t))); };
Promise.all([document.fonts.load('800 100px PJS'), document.fonts.load('650 20px PJS'), document.fonts.ready].concat(
  [].slice.call(document.images).map(function (i) { return i.decode ? i.decode().catch(function () {}) : 0; }))).then(function () {
  build();
  return Promise.all([].slice.call(document.images).map(function (i) { return i.decode ? i.decode().catch(function () {}) : 0; }));
}).then(function () { window.__ready = true; });
