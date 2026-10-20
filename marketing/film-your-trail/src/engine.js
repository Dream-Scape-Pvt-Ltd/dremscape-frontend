/* YOUR TRAIL — Dreamscape Treks, 32.5 s with voiceover. window.seek(t) draws every frame from time alone:
   no CSS animation, no timers, no state carried between frames.
   An editorial page that the camera travels along: paper and forest spreads, framed photographs, the site's own words,
   its finder options redrawn as chips, then a trip card, a route, three steps and the lockup. */
var W = 1920, H = 1080, TL = window.TL, IM = window.IMG, LOGO = window.LOGO, LET = window.LETTERS;
var VOD = {}; window.VOLINES.forEach(function (l) { VOD[l.id] = l.duration; });
var VOT = {}; TL.vo.forEach(function (v) { VOT[v[0]] = v[1]; });
var FOREST = '#153d2f', GOLD = '#e4c98a', WHITE = '#f9faf8', PAPER = '#f4f1e9', MIST = '#b9cfc5';

/* ------------------------------------------------------------------ math + easing */
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, k) { return a + (b - a) * k; };
var prog = function (t, a, b) { return clamp((t - a) / (b - a)); };
var E1 = 1 - Math.pow(2, -10);
var expo = function (u) { u = clamp(u); var v = u * u * (3 - 2 * u); return (1 - Math.pow(2, -10 * v)) / E1; };
var expoIn = function (u) { u = clamp(u); return (Math.pow(2, 10 * u) - 1) / 1023; };
var expoIO = function (u) { u = clamp(u); return u < 0.5 ? expoIn(u * 2) / 2 : 0.5 + expo((u - 0.5) * 2) / 2; };
var smooth = function (u) { u = clamp(u); return u * u * (3 - 2 * u); };
function spring(t, w, z) {
  if (t <= 0) return 0; w = w || 18; z = z === undefined ? 0.86 : z;
  var a = z * w, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-a * t) * (Math.cos(wd * t) + (a / wd) * Math.sin(wd * t));
}
var sp = function (t, t0, w, z) { return clamp(spring(t - t0, w, z), 0, 1.04); };
/* monotone cubic interpolation through [t, v] keys: smooth, never overshoots (camera paths) */
function mono(t, K) {
  var n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
  var i = 0; while (t > K[i + 1][0]) i++;
  var d = [], m = [], k;
  for (k = 0; k < n - 1; k++) d.push((K[k + 1][1] - K[k][1]) / (K[k + 1][0] - K[k][0]));
  for (k = 0; k < n; k++) m.push(k === 0 ? d[0] : k === n - 1 ? d[n - 2] : (d[k - 1] * d[k] <= 0 ? 0 : 2 / (1 / d[k - 1] + 1 / d[k])));
  var h = K[i + 1][0] - K[i][0], u = (t - K[i][0]) / h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * K[i][1] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * K[i + 1][1] + (u3 - u2) * h * m[i + 1];
}

/* ------------------------------------------------------------------ DOM */
var NS = 'http://www.w3.org/2000/svg', ST = document.getElementById('stage'), G = {};
function el(tag, attrs, parent, svg) {
  var e = svg ? document.createElementNS(NS, tag) : document.createElement(tag);
  for (var k in attrs) { if (k === 'style') e.style.cssText = attrs[k]; else if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
  if (parent) parent.appendChild(e); return e;
}
var vis = function (e, on) { e.style.visibility = on ? 'inherit' : 'hidden'; };
var px = function (v) { return v.toFixed(1) + 'px'; };
/* a headline whose words rise in their own masks; gold words are marked with * */
function words(parent, text, x, y, size, color) {
  var c = el('div', { class: 'cap', style: 'left:' + x + 'px;top:' + y + 'px;font-size:' + size + 'px;color:' + color }, parent);
  c.innerHTML = text.split(' ').map(function (w) { var g = w.charAt(0) === '*'; return '<span class="wm"><span class="w' + (g ? ' gold' : '') + '">' + (g ? w.slice(1) : w) + '</span></span>'; }).join(' ');
  return [].slice.call(c.querySelectorAll('.w'));
}
function label(parent, no, text, x, y, color, rule) {
  return el('div', { class: 'lab', style: 'left:' + x + 'px;top:' + y + 'px;color:' + color, html: '<span class="wm"><span class="w">' + (no ? '<span class="no">' + no + '</span>' : '') + '<span class="rule" style="background:' + (rule || GOLD) + '"></span>' + text + '</span></span>' }, parent).querySelector('.w');
}
/* word onsets spread across a voiceover line by letter count, a little ahead of the voice */
function wordTimes(id, ws) {
  var t0 = VOT[id], d = VOD[id], tot = 0, acc = 0, out = [];
  ws.forEach(function (w) { tot += w.textContent.length + 1; });
  ws.forEach(function (w) { out.push(t0 - 0.08 + d * 0.72 * acc / tot); acc += w.textContent.length + 1; });
  return out;
}
function rise(ws, times, t, outT, dir) {
  ws.forEach(function (w, i) {
    var u = sp(t, times[i], 16, 0.9), o = outT ? expoIn(prog(t, outT + 0.025 * i, outT + 0.32 + 0.025 * i)) : 0;
    w.style.transform = 'translateY(' + ((1 - u) * 112 - o * 150 * (dir || 1)).toFixed(1) + '%)';
    w.style.visibility = o >= 0.999 ? 'hidden' : '';                       /* fully gone: no descender left in the mask */
  });
}
/* a framed photograph: rounded window, the image pushing in slowly inside it */
function frame(parent, key, x, y, w, h, pos) {
  var f = el('div', { class: 'fr', style: 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px' }, parent);
  f.img = el('img', { src: IM[key], style: 'object-position:' + (pos || '50% 50%') }, f);
  f.x = x; f.y = y; f.w = w; f.h = h; return f;
}
/* reveal a frame from the bottom edge up (a wipe, not a fade) and push the image */
function showFrame(f, t, t0, push0, dur) {
  var u = expo(prog(t, t0, t0 + (dur || 0.7)));
  f.style.clipPath = u >= 0.999 ? 'none' : 'inset(' + ((1 - u) * 100).toFixed(2) + '% 0 0 0 round 24px)';
  f.img.style.transform = 'scale(' + (1.16 - 0.1 * u + (push0 !== undefined ? 0.012 * Math.max(0, t - push0) : 0)).toFixed(4) + ')';
}
function blurFilter() {
  var s = el('svg', { width: 0, height: 0, style: 'position:absolute' }, ST, true), d = el('defs', {}, s, true);
  var f = el('filter', { id: 'mbx', x: '-10%', y: '-10%', width: '120%', height: '120%', 'color-interpolation-filters': 'sRGB' }, d, true);
  G.mbx = el('feGaussianBlur', { stdDeviation: '0 0', edgeMode: 'duplicate' }, f, true);
}
function setBlur(e, sigma) {
  if (sigma < 0.6) { e.style.filter = 'none'; return; }
  G.mbx.setAttribute('stdDeviation', sigma.toFixed(2) + ' 0'); e.style.filter = 'url(#mbx)';
}

/* ------------------------------------------------------------------ the page the camera travels along */
var S = { A: 0, B: 1920, C: 3840, R: 5760, D: 8160 };                    /* spread origins: walk, stay, since, range of photos, choose */
/* camera x over time: a slow drift that never stops, and four glides that leave a spread quickly and settle slowly.
   Cubic Hermite through [t, x, velocity] keys, so speed is continuous everywhere */
var CAMK = (function () {
  var k = [[0, 0, TL.drift]], lt = 0, lx = 0;
  TL.glides.forEach(function (g) {
    var t0 = g[0] - TL.glideIn, t1 = g[0] + TL.glideOut, D = t1 - t0, x0 = lx + TL.drift * (t0 - lt), dx = g[1] - x0;
    k.push([t0, x0, TL.drift], [t0 + 0.45 * D, x0 + 0.55 * dx, 1.55 * dx / D], [t1, g[1], TL.drift]);
    lt = t1; lx = g[1];
  });
  k.push([TL.dur + 1, lx + TL.drift * (TL.dur + 1 - lt), TL.drift]);
  return k;
})();
function herm(t, K) {
  if (t <= K[0][0]) return K[0][1] + K[0][2] * (t - K[0][0]);
  var i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
  var a = K[i], b = K[i + 1], h = b[0] - a[0], u = clamp((t - a[0]) / h), u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * a[1] + (u3 - 2 * u2 + u) * h * a[2] + (-2 * u3 + 3 * u2) * b[1] + (u3 - u2) * h * b[2];
}
var camX = function (t) { return herm(t, CAMK); };
/* ease for one-off moves: cubic-bezier(.45,0,.15,1), out of the start briskly, long soft landing */
function bez(x1, y1, x2, y2) {
  return function (x) {
    x = clamp(x); var t = x;
    for (var i = 0; i < 8; i++) { var cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x, d = 3 * x1 * (1 - t) * (1 - 3 * t) + 3 * x2 * t * (2 - 3 * t) + 3 * t * t; if (Math.abs(d) < 1e-6) break; t = clamp(t - cx / d); }
    return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
  };
}
var glide = bez(0.45, 0, 0.15, 1);
var UI = TL.ui;
var REGIONS = ['Everest', 'Langtang', 'Annapurna', 'Manaslu', 'Mustang'], LEVELS = ['Easy', 'Normal', 'Difficult', 'Extreme'];
var PICK = { r: 1, l: 1 }, SEL = { r: UI.pickRegion, l: UI.pickLevel }, MERGE = UI.merge, PRESS = UI.press, OPEN = UI.open;
var CARD = { x: S.D + 1090, y: 120, w: 680, h: 840 }, CARD_SHIFT = -470;     /* the card glides to the centre as the choices land */
var cardShift = function (t) { return CARD_SHIFT * glide(prog(t, MERGE - 0.15, MERGE + 0.75)); };
var ROUTE = [[610, 905], [760, 880], [905, 838], [1040, 790], [1160, 728], [1278, 662], [1384, 590], [1488, 512], [1590, 432], [1676, 360]];
var GOLD_D = '#c4a35a';                                                     /* the gold, darkened for paper */
/* the trail: one gold line that runs along the whole page under everything, drawn as the film walks it.
   y as a monotone curve of x (never overshoots into the type); B's keys are added once the words are laid out */
var TRAILY = [[150, 690], [700, 690], [905, 860], [1030, 1010]], TRAIL = null;
var HEADK = null;                                                           /* where the trail's head is, in page x, over time */
var STATIONS = [];                                                          /* one marker under each photo of the range */

function build() {
  blurFilter();
  G.world = el('div', { class: 'l', style: 'width:10000px' }, ST);
  [['paper', S.A, 3840], ['forest', S.C, S.D - S.C], ['paper', S.D, 2400]].forEach(function (b) { el('div', { class: b[0], style: 'position:absolute;left:' + b[1] + 'px;top:0;width:' + b[2] + 'px;height:1080px' }, G.world); });
  var w = G.world;
  G.trail = el('svg', { style: 'position:absolute;left:0;top:0', width: 10600, height: H, viewBox: '0 0 10600 ' + H }, w, true);
  var td = el('defs', {}, G.trail, true);
  var cpP = el('clipPath', { id: 'cpPaper' }, td, true); el('rect', { x: 0, y: 0, width: S.C, height: H }, cpP, true); el('rect', { x: S.D, y: 0, width: 3000, height: H }, cpP, true);
  var cpF = el('clipPath', { id: 'cpForest' }, td, true); el('rect', { x: S.C, y: 0, width: S.D - S.C, height: H }, cpF, true);
  G.trailP = el('path', { fill: 'none', stroke: GOLD_D, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'clip-path': 'url(#cpPaper)' }, G.trail, true);
  G.trailF = el('path', { fill: 'none', stroke: GOLD, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'clip-path': 'url(#cpForest)' }, G.trail, true);
  G.stations = [];
  G.headHalo = el('circle', { r: 26, fill: GOLD, opacity: 0.18 }, G.trail, true);
  G.headDot = el('circle', { r: 12, fill: GOLD_D, stroke: WHITE, 'stroke-width': 4 }, G.trail, true);

  /* A — "Some trails you walk." */
  G.labA = label(w, '01', 'A little longer in the light', S.A + 150, 196, 'rgba(21,61,47,.7)');
  G.hA1 = words(w, 'Some trails', S.A + 146, 330, 132, FOREST); G.hA2 = words(w, 'you walk.', S.A + 146, 480, 132, FOREST);
  G.fA = frame(w, 'lastlight', S.A + 1000, 150, 770, 780, '55% 50%');

  /* B — "Some trails stay with you." */
  G.labB = label(w, '02', 'The people beside you', S.B + 150, 112, 'rgba(21,61,47,.7)');
  G.fB = frame(w, 'together', S.B + 150, 166, 1620, 580, '50% 58%');
  G.hB = words(w, 'Some trails stay with you.', S.B + 146, 792, 112, FOREST);

  /* C — since 2005 */
  G.fC = frame(w, 'night', S.C - 140, 0, 2200, H, '50% 45%'); G.fC.style.borderRadius = '0';     /* full bleed: the city at night */
  G.fC.img.style.filter = 'brightness(1.45) contrast(1.08) saturate(1.1)';
  el('div', { style: 'position:absolute;left:' + S.C + 'px;top:0;width:1920px;height:1080px;background:linear-gradient(90deg,#0b2a1fe6,#0b2a1f99 40%,#0b2a1f26 70%,transparent),linear-gradient(0deg,#0b2a1fb3,transparent 34%)' }, w);
  G.hC1 = words(w, 'Since', S.C + 146, 236, 124, WHITE);
  G.hC2 = words(w, '*2005', S.C + 132, 360, 340, GOLD);
  G.labC = label(w, '', 'Our team · Thamel, Kathmandu', S.C + 150, 800, MIST);

  /* R — a range of real moments */
  G.hR = words(w, 'Journeys through the Himalaya.', S.R + 146, 110, 78, WHITE);
  G.fR = [['walkers', 'A path through the sky'], ['golden', 'A world above the ordinary'], ['flags', 'A moment at the top'], ['path', 'The next bend']].map(function (r, i) {
    var x = S.R + 150 + i * 420, f = frame(w, r[0], x, 290, 400, 560, r[0] === 'golden' ? '62% 50%' : '50% 50%');
    f.cap = el('div', { class: 'lab', style: 'left:' + x + 'px;top:880px;font-size:16px;letter-spacing:.16em;color:' + MIST, html: '<span class="wm"><span class="w">' + r[1] + '</span></span>' }, w).querySelector('.w');
    STATIONS.push(x + 200); return f;
  });

  /* D — where to, how hard: the finder's options as chips */
  G.hD1 = words(w, 'Where to?', S.D + 146, 236, 150, FOREST); G.hD2 = words(w, 'How hard?', S.D + 146, 236, 150, FOREST);
  G.labD = label(w, '', 'Nepal treks, shaped around you', S.D + 150, 182, 'rgba(21,61,47,.7)');
  var chip = function (text, x, y) {
    var c = el('div', { class: 'pchip', style: 'left:' + x + 'px;top:' + y + 'px', html: '<div class="fill"></div><span class="tx">' + text + '</span><span class="ok"><svg width="34" height="26" viewBox="0 0 34 26"><path d="M4 13l9 9L30 4"/></svg></span>' }, w);
    c.fill = c.firstChild; c.tx = c.querySelector('.tx'); c.ok = c.querySelector('.ok'); c.x0 = x; c.y0 = y; return c;
  };
  G.rc = []; G.lc = [];
  var cx = S.D + 150; REGIONS.forEach(function (r) { var c = chip(r, cx, 520); G.rc.push(c); c.w0 = c.offsetWidth; cx += c.w0 + 22; });
  cx = S.D + 150; LEVELS.forEach(function (r) { var c = chip(r, cx, 660); G.lc.push(c); c.w0 = c.offsetWidth; cx += c.w0 + 22; });
  /* the trip card the two choices land in */
  G.card = el('div', { class: 'tcard', style: 'z-index:2;left:' + CARD.x + 'px;top:' + CARD.y + 'px;width:' + CARD.w + 'px;height:' + CARD.h + 'px' }, w);
  G.cardPh = el('div', { class: 'ph', style: 'left:24px;top:24px;width:' + (CARD.w - 48) + 'px;height:400px' }, G.card);
  el('img', { src: IM.path }, G.cardPh);
  G.cardEb = el('div', { class: 'eb', style: 'left:44px;top:462px', text: 'LANGTANG REGION' }, G.card);
  G.cardTt = el('div', { class: 'tt', style: 'left:44px;top:500px;width:580px', text: 'Valley walks & mountain villages' }, G.card);
  G.btn = el('div', { class: 'btn', style: 'left:24px;top:' + (CARD.h - 108) + 'px;width:' + (CARD.w - 48) + 'px', html: '<span>Find my trek</span><svg width="36" height="28" viewBox="0 0 36 28"><path d="M2 14h30M20 3l12 11-12 11"/></svg>' }, G.card);

  /* E — the card's photograph opens to full frame; a route is drawn up the hillside */
  var hx0 = CARD.x + CARD_SHIFT + CARD.w / 2 - camX(OPEN);
  ROUTE = [[hx0, 1010], [hx0 + 90, 935], [hx0 + 195, 860], [hx0 + 310, 790], [1270, 715], [1380, 630], [1480, 540], [1580, 450], [1676, 360]];
  G.E = el('div', { class: 'l', style: 'overflow:hidden' }, ST);
  G.Eph = el('div', { class: 'fr' }, G.E); G.Eimg = el('img', { src: IM.path, style: 'object-position:50% 62%' }, G.Eph);
  G.Eshade = el('div', { id: 'heroShade' }, G.Eph);
  G.route = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G.E, true);
  G.routePath = el('path', { d: catmull(ROUTE), fill: 'none', stroke: GOLD, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '0 1' }, G.route, true);
  G.routeDots = el('path', { d: catmull(ROUTE), fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '0.1 22', opacity: 0.55 }, G.route, true);
  G.head = el('circle', { r: 12, fill: GOLD, stroke: '#fff', 'stroke-width': 4 }, G.route, true);
  G.pin = el('circle', { r: 15, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, G.route, true);
  G.labE = label(G.E, '03', 'The next bend', 150, 150, 'rgba(249,250,248,.85)');
  G.hE = words(G.E, 'Shaped around you.', 146, 200, 120, WHITE);

  /* the route's end pin blooms: a gold ring opens the next page */
  G.ring = el('div', { class: 'l', style: 'background:' + GOLD }, ST);
  /* F — make the trail your own: three steps */
  G.F = el('div', { class: 'l paper' }, ST);
  G.labF = label(G.F, '04', 'Tailor-made', 150, 96, 'rgba(21,61,47,.7)');
  G.hF = words(G.F, 'Make the trail *your *own.', 146, 136, 96, FOREST);
  G.hF.forEach(function (x) { if (x.classList.contains('gold')) x.style.color = GOLD_D; });
  G.ftrail = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G.F, true);
  G.ftrailP = el('path', { fill: 'none', stroke: GOLD_D, 'stroke-width': 5, 'stroke-linecap': 'round' }, G.ftrail, true);
  G.fHeadHalo = el('circle', { r: 26, fill: GOLD, opacity: 0.18 }, G.ftrail, true);
  G.fHead = el('circle', { r: 12, fill: GOLD_D, stroke: WHITE, 'stroke-width': 4 }, G.ftrail, true);
  var icons = [
    '<path d="M14 18h52a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H38l-14 12V56H14a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6z"/><path d="M24 33h32M24 43h20"/>',
    '<circle cx="18" cy="62" r="7"/><circle cx="62" cy="18" r="7"/><path d="M24 58c14-6 4-22 18-26s12-6 14-10" stroke-dasharray="2 9"/>',
    '<rect x="16" y="8" width="48" height="64" rx="6"/><path d="M27 26h26M27 37h26M27 48h14"/><path d="M44 58l6 6 12-14"/>'
  ];
  G.steps = [['01', 'Share your idea'], ['02', 'Talk through the route'], ['03', 'Review a personal proposal']].map(function (s, i) {
    var c = el('div', { class: 'scard', style: 'left:' + (150 + i * 560) + 'px;top:300px', html: '<div class="no">' + s[0] + '</div><div class="ic"><svg viewBox="0 0 80 80">' + icons[i] + '</svg></div><div class="tt">' + s[1] + '</div>' }, G.F);
    c.paths = [].slice.call(c.querySelectorAll('svg path, svg circle, svg rect'));
    c.paths.forEach(function (p) { p.setAttribute('pathLength', 1); if (!p.getAttribute('stroke-dasharray')) p.setAttribute('stroke-dasharray', '1 1'); });
    return c;
  });

  /* G — forest page rises, the lockup assembles, then the call to action */
  G.G = el('div', { class: 'l forest' }, ST);
  buildLockup(G.G);
  G.gtrail = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G.G, true);
  G.gtrailP = el('path', { d: 'M1714 753Q1400 640 960 638', fill: 'none', stroke: GOLD, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '0 2000' }, G.gtrail, true);
  G.gHeadHalo = el('circle', { r: 26, fill: GOLD, opacity: 0.16 }, G.gtrail, true);
  G.gHead = el('circle', { r: 12, fill: GOLD, stroke: WHITE, 'stroke-width': 4 }, G.gtrail, true);
  G.cta = el('div', { id: 'cta', html: '<span>Plan my journey</span><svg width="38" height="30" viewBox="0 0 38 30"><path d="M2 15h32M22 4l12 11-12 11"/></svg>' }, G.G);
  G.url = el('div', { id: 'url', html: '<span class="wm"><span class="w">dreamscapetreks.com</span></span>' }, G.G);
  G.endStrip = ['walkers', 'together', 'flags', 'lastlight', 'path', 'golden'].map(function (k, i) { return frame(G.G, k, 0, 0, 250, 170, '50% 50%'); });

  el('div', { id: 'grain' }, ST);
  /* the trail rises to underline "stay with you.", measured from the laid-out words, then drops back to the foot of the page */
  var wr = G.world.getBoundingClientRect(), sx = G.hB[2].getBoundingClientRect().left - wr.left, ex = G.hB[4].getBoundingClientRect().right - wr.left - 14;
  TRAILY = TRAILY.concat([[sx - 170, 1010], [sx - 30, 921], [ex + 30, 921], [ex + 170, 1010], [CARD.x + CARD.w / 2, 1010]]);
  TRAIL = polyline(function (x) { return mono(x, TRAILY); }, 150, CARD.x + CARD.w / 2);
  G.trailP.setAttribute('d', TRAIL.d); G.trailF.setAttribute('d', TRAIL.d);
  [G.trailP, G.trailF].forEach(function (p) { p.setAttribute('stroke-dasharray', '0 ' + (TRAIL.len + 10)); });
  STATIONS = STATIONS.map(function (x) { var c = el('circle', { cx: x, cy: 1010, r: 9, fill: '#153d2f', stroke: GOLD, 'stroke-width': 3 }, G.trail, true); G.stations.push(c); return x; });
  G.trail.appendChild(G.headHalo); G.trail.appendChild(G.headDot);
  G.world.appendChild(G.trail);                                             /* on top of the page: it never crosses type or photos */
  HEADK = [[0, 150], [0.55, 160], [1.95, 760], [2.5, 1300], [3.0, sx - 200], [3.3, sx], [3.95, ex], [4.5, ex + 300], [5.6, 4000], [9.4, 5560], [10.6, 5900],
           [10.9375, STATIONS[0]], [11.25, STATIONS[1]], [11.5625, STATIONS[2]], [11.875, STATIONS[3]], [12.6, 8240], [13.1, 8330], [16.2, 8900], [PRESS, CARD.x + CARD_SHIFT + CARD.w / 2]];
  FTRAIL = polyline(function (x) { return mono(x, [[-40, 900], [150, 900], [560, 910], [960, 896], [1360, 910], [1770, 900]]); }, -40, 1770);
  G.ftrailP.setAttribute('d', FTRAIL.d); G.ftrailP.setAttribute('stroke-dasharray', '0 ' + (FTRAIL.len + 10));
}
var FTRAIL = null;
/* sample y(x) every 4 px into an SVG polyline with its running length, so "draw up to x" is a lookup */
function polyline(f, x0, x1) {
  var X = [], Y = [], L = [0], d = '';
  for (var x = x0; x <= x1 + 0.1; x += 4) { var y = f(x); if (X.length) L.push(L[L.length - 1] + Math.hypot(x - X[X.length - 1], y - Y[Y.length - 1])); X.push(x); Y.push(y); d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
  return { X: X, Y: Y, L: L, len: L[L.length - 1], d: d, at: function (x) {
    var k = clamp((x - x0) / 4, 0, X.length - 1.0001), i = Math.floor(k), u = k - i;
    return { y: lerp(Y[i], Y[i + 1], u), l: lerp(L[i], L[i + 1], u) };
  } };
}
function catmull(p) {
  var d = 'M' + p[0][0] + ' ' + p[0][1];
  for (var i = 0; i < p.length - 1; i++) {
    var p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0] + ' ' + p2[1];
  }
  return d;
}
var LKS = 0.34, LKX = 960 - 3337 * LKS / 2, LKY = 250;
function buildLockup(parent) {
  G.lk = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, parent, true);
  var defs = el('defs', {}, G.lk, true);
  var cpMk = el('clipPath', { id: 'cpMk' }, defs, true); el('rect', { x: 0, y: -40, width: 1600, height: 690 }, cpMk, true);
  var cpTx = el('clipPath', { id: 'cpTx' }, defs, true); el('rect', { x: 1380, y: 0, width: 1957, height: 300 }, cpTx, true);
  [[318, 156], [496, 160]].forEach(function (b, i) {
    var c = el('clipPath', { id: 'cpB' + (i + 1) }, defs, true); el('rect', { x: 1380, y: b[0], width: 1957, height: b[1] }, c, true);
    var c2 = el('clipPath', { id: 'cpC' + (i + 1) }, defs, true); el('rect', { x: 1380, y: b[0], width: 1957, height: b[1] }, c2, true);
  });
  var g = el('g', { transform: 'translate(' + LKX.toFixed(1) + ',' + LKY + ') scale(' + LKS + ')' }, G.lk, true);
  var gm = el('g', { 'clip-path': 'url(#cpMk)' }, g, true); G.mk = el('path', { d: LOGO.mark, fill: WHITE, 'fill-rule': 'evenodd' }, gm, true);
  var gt = el('g', { 'clip-path': 'url(#cpTx)' }, g, true);
  G.letters = LET.map(function (l) { return el('path', { d: l.d, fill: WHITE, 'fill-rule': 'evenodd' }, gt, true); });
  var b1 = el('g', { 'clip-path': 'url(#cpB1)' }, g, true); G.tb1 = el('g', {}, b1, true); el('path', { d: LOGO.text, fill: WHITE, 'fill-rule': 'evenodd', 'clip-path': 'url(#cpC1)' }, G.tb1, true);
  var b2 = el('g', { 'clip-path': 'url(#cpB2)' }, g, true); G.tb2 = el('g', {}, b2, true); el('path', { d: LOGO.text, fill: WHITE, 'fill-rule': 'evenodd', 'clip-path': 'url(#cpC2)' }, G.tb2, true);
}

/* ------------------------------------------------------------------ the frame */
function seekAt(t) {
  var cx = camX(t), h = 1 / 240, v = (camX(t + h) - camX(t - h)) / (2 * h);
  var onWorld = t < OPEN + 0.86;                                         /* until the opened photo covers the frame */
  vis(G.world, onWorld);
  G.world.style.transform = 'translateX(' + (-cx).toFixed(1) + 'px)';
  setBlur(G.world, Math.min(28, Math.abs(v) / 60 * 0.3));
  /* photographs sit a little nearer the lens than the type: they travel 12% faster */
  var par = function (f, rest) { f.style.transform = 'translateX(' + ((cx - rest) * -0.12).toFixed(1) + 'px)'; };

  /* ---- A ---- */
  rise([G.labA], [-0.4], t); rise(G.hA1, [-0.42, -0.36], t); rise(G.hA2, wordTimes('walk', G.hA1.concat(G.hA2)).slice(2), t);   /* frame one is already set */
  showFrame(G.fA, t, -0.45, 0.0, 0.8); par(G.fA, S.A);                    /* frame one is already a composition */
  /* ---- B ---- */
  rise([G.labB], [2.25], t); rise(G.hB.slice(0, 2), [2.3, 2.36], t); rise(G.hB.slice(2), wordTimes('stay', G.hB).slice(2), t);
  showFrame(G.fB, t, 2.05, 2.05, 0.9); par(G.fB, S.B);                    /* built while the camera is still on its way */
  /* ---- C ---- */
  rise(G.hC1, [4.85], t); rise(G.hC2, [5.05], t); rise([G.labC], [5.6], t);
  par(G.fC, S.C); G.fC.img.style.transform = 'scale(' + (1.02 + 0.015 * clamp(t - 4.3, 0, 6)).toFixed(4) + ')';   /* a slow push into the city lights */
  /* ---- R ---- */
  rise(G.hR, G.hR.map(function (x, i) { return 9.7 + 0.07 * i; }), t);
  G.fR.forEach(function (f, i) { showFrame(f, t, 9.55 + 0.1 * i, 9.6, 0.8); par(f, S.R); rise([f.cap], [10.0 + 0.1 * i], t); });
  /* ---- the trail ---- */
  sceneTrail(t, cx);
  /* ---- D: choose ---- */
  sceneChoose(t, cx);
  /* ---- E: the route ---- */
  sceneRoute(t);
  /* ---- F: three steps ---- */
  sceneSteps(t);
  /* ---- G: end ---- */
  sceneEnd(t);
}

function sceneTrail(t, cx) {
  var on = t < OPEN + 0.35; vis(G.trail, on); if (!on) return;
  var hx = mono(t, HEADK), a = TRAIL.at(hx), forest = hx > S.C && hx < S.D;
  G.trailP.setAttribute('stroke-dasharray', a.l.toFixed(1) + ' ' + (TRAIL.len + 10).toFixed(0));
  G.trailF.setAttribute('stroke-dasharray', a.l.toFixed(1) + ' ' + (TRAIL.len + 10).toFixed(0));
  var grow = sp(t, -0.3, 10, 0.95), fade = 1 - smooth(prog(t, OPEN, OPEN + 0.3));
  var ripple = prog(t, PRESS, PRESS + 0.6);                                 /* the press sends a ring out of the head */
  G.headDot.setAttribute('cx', hx.toFixed(1)); G.headDot.setAttribute('cy', a.y.toFixed(1));
  G.headDot.setAttribute('r', (t < OPEN ? 12 * grow : 0).toFixed(2)); G.headDot.setAttribute('fill', forest ? GOLD : GOLD_D);   /* the route's head takes over at OPEN */
  G.headHalo.setAttribute('cx', hx.toFixed(1)); G.headHalo.setAttribute('cy', a.y.toFixed(1));
  G.headHalo.setAttribute('r', ((22 + 5 * Math.sin(t * Math.PI * 2 / 1.6)) * grow * fade + 60 * expo(ripple)).toFixed(2));
  G.headHalo.setAttribute('opacity', ((0.18 + 0.3 * (ripple > 0 ? 1 - ripple : 0)) * fade).toFixed(3));
  G.stations.forEach(function (c, i) {
    var x = STATIONS[i], k = clamp((hx - x + 24) / 24), b = Math.sin(Math.PI * clamp((hx - x + 24) / 220));
    c.setAttribute('fill', k > 0.5 ? GOLD : '#153d2f'); c.setAttribute('r', (9 * smooth(prog(t, 10.2 + 0.08 * i, 10.6 + 0.08 * i)) + 6 * b).toFixed(2));
  });
}

function sceneChoose(t, cx) {
  if (t > OPEN + 0.6) return;
  rise([G.labD], [12.3], t);
  rise(G.hD1, [12.4, 12.5], t, 14.62, 1); rise(G.hD2, [15.05, 15.15], t, MERGE - 0.3, 1);   /* the first title is gone before the second rises */
  var chipAnim = function (c, i, tIn, picked, tSel) {
    var u = sp(t, tIn + 0.07 * i, 14, 0.95), sel = expo(prog(t, tSel, tSel + 0.32));
    var hover = picked ? smooth(prog(t, tSel - 0.35, tSel - 0.1)) : (c.row === 0 && i === 0 ? smooth(prog(t, 13.3, 13.5)) * (1 - smooth(prog(t, 13.85, 14.05))) : 0);
    if (!picked) {                                                       /* the others step back once the choice is made */
      c.style.borderColor = 'rgba(21,61,47,' + (0.22 + 0.6 * hover).toFixed(3) + ')';
      var away = smooth(prog(t, MERGE - 0.3 + 0.03 * i, MERGE + 0.12 + 0.03 * i));   /* gone before the chosen chips fly over them */
      var shove = i > c.pickIdx ? 48 * expo(prog(t, tSel, tSel + 0.32)) : 0;   /* the chosen chip grows a tick; its neighbours make room */
      c.style.transform = 'translate(' + shove.toFixed(1) + 'px,' + ((1 - u) * 60 + away * 50).toFixed(1) + 'px) scale(' + (lerp(0.7, 1, clamp(u)) * (1 - 0.4 * away)).toFixed(4) + ')';
      c.style.opacity = (1 - away).toFixed(3); c.fill.style.transform = 'scale(0)';
      return;
    }
    c.fill.style.transform = 'scale(' + sel.toFixed(4) + ')'; c.tx.style.color = sel > 0.5 ? WHITE : FOREST;
    c.ok.style.width = (34 * sel).toFixed(1) + 'px'; c.ok.style.marginLeft = (14 * sel).toFixed(1) + 'px';
    c.style.borderColor = 'rgba(21,61,47,' + (0.22 + 0.6 * hover).toFixed(3) + ')';
    /* the chosen chips fly into the trip card */
    var m = expoIO(prog(t, MERGE + (c.row ? 0.18 : 0), MERGE + 0.62 + (c.row ? 0.18 : 0)));
    var tx = CARD.x + cardShift(t) + 44 + (c.row ? G.rc[PICK.r].w0 * 0.82 + 52 : 0) - c.x0 - c.w0 * 0.09, ty = CARD.y + 600 - c.y0;
    var tap = expo(prog(t, tSel, tSel + 0.06)) * (1 - expo(prog(t, tSel + 0.08, tSel + 0.3)));
    c.style.transform = 'translate(' + (tx * m).toFixed(1) + 'px,' + ((1 - u) * 60 + ty * m + (c.row ? 56 : -28) * Math.sin(Math.PI * m)).toFixed(1) + 'px) scale(' + (lerp(0.7, 1, clamp(u)) * (1 - 0.06 * tap) * (1 - 0.18 * m)).toFixed(4) + ')';
    c.style.opacity = 1;
  };
  G.rc.forEach(function (c, i) { c.row = 0; c.pickIdx = PICK.r; c.style.zIndex = i === PICK.r ? 3 : 1; chipAnim(c, i, 12.6, i === PICK.r, SEL.r); });
  G.lc.forEach(function (c, i) { c.row = 1; c.pickIdx = PICK.l; c.style.zIndex = i === PICK.l ? 3 : 1; chipAnim(c, i, 15.1, i === PICK.l, SEL.l); vis(c, t >= 15.05); });
  G.rc.forEach(function (c) { vis(c, t >= 12.55); });
  /* the card rises in as the choices arrive; the button is pressed on the beat */
  var cu = sp(t, MERGE - 0.1, 12, 0.95); vis(G.card, t >= MERGE - 0.12);
  var press = expo(prog(t, PRESS, PRESS + 0.06)) * (1 - expo(prog(t, PRESS + 0.08, PRESS + 0.28)));
  G.card.style.transform = 'translate(' + cardShift(t).toFixed(1) + 'px,' + ((1 - cu) * 220).toFixed(1) + 'px)';
  var tIn = smooth(prog(t, MERGE + 0.55, MERGE + 0.9));                     /* the card's words arrive once the choices have landed */
  [G.cardEb, G.cardTt].forEach(function (e) { e.style.opacity = tIn.toFixed(3); e.style.transform = 'translateY(' + (14 * (1 - tIn)).toFixed(1) + 'px)'; });
  G.card.style.clipPath = 'inset(' + ((1 - expo(prog(t, MERGE - 0.1, MERGE + 0.5))) * 100).toFixed(2) + '% 0 0 0 round 30px)';
  var glow = prog(t, PRESS, PRESS + 0.55);
  G.btn.style.transform = 'scale(' + (1 - 0.09 * press).toFixed(4) + ')';
  G.btn.style.background = press > 0.05 ? '#0f2f23' : '';
  G.btn.style.boxShadow = glow > 0 && glow < 1 ? '0 0 0 ' + (6 + 26 * expo(glow)).toFixed(1) + 'px rgba(228,201,138,' + (0.85 * (1 - glow)).toFixed(3) + ')' : 'none';
  G.cardPh.firstChild.style.transform = 'scale(' + (1.12 - 0.08 * expo(prog(t, MERGE, MERGE + 0.8))).toFixed(4) + ')';
}

function sceneRoute(t) {
  var on = t >= OPEN && t < UI.disc[1] + 0.05; vis(G.E, on); if (!on) return;
  /* the card's photo rect (on screen) opens to the full frame */
  var cx = camX(OPEN), k = glide(prog(t, OPEN, OPEN + 0.85));
  var r0 = { x: CARD.x + CARD_SHIFT - cx + 24, y: CARD.y + 24, w: CARD.w - 48, h: 400 };
  var x = lerp(r0.x, 0, k), y = lerp(r0.y, 0, k), w = lerp(r0.w, W, k), h = lerp(r0.h, H, k);
  G.Eph.style.left = px(x); G.Eph.style.top = px(y); G.Eph.style.width = px(w); G.Eph.style.height = px(h); G.Eph.style.borderRadius = px(lerp(22, 0, k));
  G.Eimg.style.transform = 'scale(' + (1.04 + 0.016 * Math.max(0, t - OPEN)).toFixed(4) + ')';
  G.Eshade.style.opacity = smooth(prog(t, 17.45, 18.2)).toFixed(3);
  var dr = expoIO(prog(t, 17.8, 19.2)), len = G.routePath.getTotalLength(), hp = G.routePath.getPointAtLength(len * dr);
  G.routePath.setAttribute('stroke-dasharray', dr.toFixed(4) + ' 1');
  G.routeDots.style.opacity = (0.55 * smooth(prog(t, 17.6, 18.0))).toFixed(3);
  G.head.setAttribute('cx', hp.x.toFixed(1)); G.head.setAttribute('cy', hp.y.toFixed(1)); vis(G.head, t < UI.disc[0] + 0.05);
  var pr = expo(prog(t, 19.2, 19.85)), end = ROUTE[ROUTE.length - 1];
  G.pin.setAttribute('cx', end[0]); G.pin.setAttribute('cy', end[1]); G.pin.setAttribute('r', (15 + 40 * pr).toFixed(1)); G.pin.setAttribute('stroke-opacity', (1 - pr).toFixed(3)); vis(G.pin, t >= 19.2);
  rise([G.labE], [17.7], t, UI.disc[0] - 0.32, 1); rise(G.hE, wordTimes('shape', G.hE), t, UI.disc[0] - 0.3, 1);   /* out before the ring reaches it */
}

function sceneSteps(t) {
  vis(G.ring, false);
  var on = t >= UI.disc[0] && t < UI.rise[1]; vis(G.F, on); if (!on) return;
  var end = ROUTE[ROUTE.length - 1], dp = prog(t, UI.disc[0] + 0.08, UI.disc[1] + 0.08), r = 2100 * glide(dp), rr = 2160 * glide(prog(t, UI.disc[0], UI.disc[1]));
  G.F.style.clipPath = r >= 2099 ? 'none' : 'circle(' + r.toFixed(1) + 'px at ' + end[0] + 'px ' + end[1] + 'px)';
  vis(G.ring, dp < 1); G.ring.style.clipPath = 'circle(' + rr.toFixed(1) + 'px at ' + end[0] + 'px ' + end[1] + 'px)';
  var up = glide(prog(t, UI.rise[0], UI.rise[1]));                        /* the forest page rising pushes the steps up a little */
  var push = 1 + 0.035 * smooth(prog(t, UI.disc[0], UI.rise[1]));          /* and a slow push-in all the way, so the page never sits still */
  G.F.style.transformOrigin = '960px 560px';
  G.F.style.transform = 'translateY(' + (-140 * up - 18 * smooth(prog(t, UI.disc[0], UI.rise[0]))).toFixed(1) + 'px) scale(' + push.toFixed(4) + ')';
  rise([G.labF], [UI.disc[0] + 0.3], t, UI.rise[0] + 0.05, 1); rise(G.hF, G.hF.map(function (x, i) { return UI.disc[0] + 0.38 + 0.06 * i; }), t, UI.rise[0] + 0.08, 1);
  var T = UI.steps;
  var fx = mono(t, [[UI.disc[1] - 0.1, -40], [T[0], 400], [T[1], 960], [T[2], 1520], [UI.rise[0], 1690]]), fa = FTRAIL.at(fx);
  G.ftrailP.setAttribute('stroke-dasharray', fa.l.toFixed(1) + ' ' + (FTRAIL.len + 10).toFixed(0));
  var fg = sp(t, UI.disc[1] - 0.2, 12, 0.95);
  G.fHead.setAttribute('cx', fx.toFixed(1)); G.fHead.setAttribute('cy', fa.y.toFixed(1)); G.fHead.setAttribute('r', (12 * fg).toFixed(2));
  G.fHeadHalo.setAttribute('cx', fx.toFixed(1)); G.fHeadHalo.setAttribute('cy', fa.y.toFixed(1)); G.fHeadHalo.setAttribute('r', ((22 + 5 * Math.sin(t * Math.PI * 2 / 1.6)) * fg).toFixed(2));
  G.steps.forEach(function (c, i) {
    var u = sp(t, T[i] - 0.05, 13, 0.84);
    c.style.transform = 'translateY(' + ((1 - u) * 120).toFixed(1) + 'px)';
    c.style.clipPath = 'inset(' + ((1 - expo(prog(t, T[i] - 0.05, T[i] + 0.45))) * 100).toFixed(2) + '% 0 0 0 round 30px)';
    vis(c, t >= T[i] - 0.06);
    var d = expo(prog(t, T[i] + 0.15, T[i] + 0.85));
    c.paths.forEach(function (p) { if (p.getAttribute('stroke-dasharray') === '2 9') return; p.setAttribute('stroke-dashoffset', (1 - d).toFixed(4)); });
  });
}

function sceneEnd(t) {
  var on = t >= UI.rise[0]; vis(G.G, on); if (!on) return;
  var up = glide(prog(t, UI.rise[0], UI.rise[1]));
  G.G.style.transform = 'translateY(' + ((1 - up) * H).toFixed(1) + 'px)';
  var b = VOT.brand, m = sp(t, UI.rise[1] - 0.35, 11, 0.95);
  G.mk.setAttribute('transform', 'translate(0,' + ((1 - m) * 700).toFixed(1) + ')');
  G.letters.forEach(function (p, i) { var u = sp(t, b + 0.1 + 0.035 * i, 15, 0.9); p.setAttribute('transform', 'translate(0,' + ((1 - u) * 300).toFixed(1) + ')'); });
  var u1 = sp(t, b + 0.55, 14, 0.9), u2 = sp(t, VOT.beyond - 0.02, 14, 0.9);
  G.tb1.setAttribute('transform', 'translate(0,' + ((1 - u1) * 170).toFixed(1) + ')'); G.tb2.setAttribute('transform', 'translate(0,' + ((1 - u2) * 170).toFixed(1) + ')');
  /* the head keeps the screen position the steps' head had, so it appears on the page's top edge as the page passes it */
  var gl = G.gtrailP.getTotalLength(), gk = smooth(prog(t, UI.rise[1], UI.cta)), gp, gy0 = (1 - up) * H;
  if (t < UI.rise[1]) gp = { x: 1714, y: 893 - 140 * up - gy0 }; else gp = G.gtrailP.getPointAtLength(gl * gk);
  G.gtrailP.setAttribute('stroke-dasharray', (gl * gk).toFixed(1) + ' 2000'); vis(G.gtrailP, gl * gk > 1);   /* a zero-length dash would leave a round-cap dot */
  var gon = t < UI.cta && gp.y >= -2, halo = (22 + 5 * Math.sin(t * Math.PI * 2 / 1.6));
  G.gHead.setAttribute('cx', gp.x.toFixed(1)); G.gHead.setAttribute('cy', gp.y.toFixed(1)); G.gHead.setAttribute('r', gon ? 12 : 0);
  G.gHeadHalo.setAttribute('cx', gp.x.toFixed(1)); G.gHeadHalo.setAttribute('cy', gp.y.toFixed(1)); G.gHeadHalo.setAttribute('r', gon ? halo.toFixed(2) : 0);
  var dot = 1, c = glide(prog(t, UI.cta, UI.cta + 0.7)), cw = lerp(96, 520, c); vis(G.cta, t >= UI.cta); vis(G.url, t >= UI.cta + 0.25);   /* the head becomes the button */
  G.cta.style.left = px(960 - cw / 2); G.cta.style.top = '590px'; G.cta.style.width = px(cw);
  G.cta.style.transform = 'scale(' + lerp(0.24 * dot, 1, glide(prog(t, UI.cta, UI.cta + 0.35))).toFixed(4) + ')';
  G.cta.firstChild.style.opacity = G.cta.lastChild.style.opacity = clamp((c - 0.55) / 0.35).toFixed(3);
  G.url.style.top = '722px'; rise([G.url.querySelector('.w')], [UI.cta + 0.3], t);
  /* a slow strip of the photographs along the bottom edge */
  var sx = 240 * (1 - glide(prog(t, 25.3, 31.2)));                         /* drifts in and settles, centred */
  G.endStrip.forEach(function (f, i) {
    f.style.left = px(135 + i * 280 + sx); f.style.top = '830px';
    showFrame(f, t, 25.6 + 0.08 * i, 25.6, 0.7);
  });
  G.lk.style.transformOrigin = '960px 400px'; G.lk.style.transform = 'scale(' + (1 + 0.008 * Math.max(0, t - 25.3)).toFixed(4) + ')';
}

window.__dur = TL.dur;
window.seek = function (t) { seekAt(Math.max(0, Math.min(TL.dur, t))); };
Promise.all([document.fonts.load('800 100px PJS'), document.fonts.load('700 20px PJS'), document.fonts.ready]).then(function () {
  build();
  return Promise.all([].slice.call(document.images).map(function (i) { return i.decode ? i.decode().catch(function () {}) : 0; }));
}).then(function () { window.__ready = true; });
