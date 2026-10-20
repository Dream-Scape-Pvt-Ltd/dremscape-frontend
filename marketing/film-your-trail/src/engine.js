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
    w.style.transform = 'translateY(' + ((1 - u) * 112 - o * 112 * (dir || 1)).toFixed(1) + '%)';
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
/* camera x over time: holds drift slowly, moves between spreads land on the bar lines */
var CAM = [[0, 0], [2.12, 64], [2.5, 990], [2.88, 1920], [4.62, 1972], [5.0, 2906], [5.38, 3840], [9.62, 3930], [10.0, 4840], [10.38, 5760],
           [12.12, 6420], [12.5, 7290], [12.88, 8160], [17.5, 8250]];
var camX = function (t) { return mono(t, CAM); };
var REGIONS = ['Everest', 'Langtang', 'Annapurna', 'Manaslu', 'Mustang'], LEVELS = ['Easy', 'Normal', 'Difficult', 'Extreme'];
var PICK = { r: 1, l: 1 }, SEL = { r: 14.375, l: 15.625 }, MERGE = 16.25, PRESS = 17.0, OPEN = 17.1;
var CARD = { x: S.D + 1090, y: 120, w: 680, h: 840 };
var ROUTE = [[610, 905], [760, 880], [905, 838], [1040, 790], [1160, 728], [1278, 662], [1384, 590], [1488, 512], [1590, 432], [1676, 360]];

function build() {
  blurFilter();
  G.world = el('div', { class: 'l', style: 'width:10000px' }, ST);
  [['paper', S.A, 3840], ['forest', S.C, S.D - S.C], ['paper', S.D, 2400]].forEach(function (b) { el('div', { class: b[0], style: 'position:absolute;left:' + b[1] + 'px;top:0;width:' + b[2] + 'px;height:1080px' }, G.world); });
  var w = G.world;

  /* A — "Some trails you walk." */
  G.labA = label(w, '01', 'A little longer in the light', S.A + 150, 196, 'rgba(21,61,47,.7)');
  G.hA1 = words(w, 'Some trails', S.A + 146, 330, 132, FOREST); G.hA2 = words(w, 'you walk.', S.A + 146, 480, 132, FOREST);
  G.fA = frame(w, 'lastlight', S.A + 1000, 150, 770, 780, '55% 50%');

  /* B — "Some trails stay with you." */
  G.labB = label(w, '02', 'The people beside you', S.B + 150, 112, 'rgba(21,61,47,.7)');
  G.fB = frame(w, 'together', S.B + 150, 166, 1620, 580, '50% 58%');
  G.hB = words(w, 'Some trails stay with you.', S.B + 146, 792, 112, FOREST);
  G.ulB = el('div', { style: 'position:absolute;height:10px;border-radius:5px;background:' + GOLD + ';transform-origin:0 50%' }, w);

  /* C — since 2005 */
  G.hC1 = words(w, 'Since', S.C + 146, 236, 124, WHITE);
  G.hC2 = words(w, '*2005', S.C + 132, 360, 340, GOLD);
  G.labC = label(w, '', 'Our team · Thamel, Kathmandu', S.C + 150, 800, MIST);
  G.fC = frame(w, 'night', S.C + 1080, 120, 690, 840, '50% 42%');

  /* R — a range of real moments */
  G.hR = words(w, 'Journeys through the Himalaya.', S.R + 146, 110, 78, WHITE);
  G.fR = [['walkers', 'A path through the sky', 300], ['golden', 'A world above the ordinary', 360], ['flags', 'A moment at the top', 300], ['path', 'The next bend', 360]].map(function (r, i) {
    var f = frame(w, r[0], S.R + 150 + i * 480, r[2], 430, 570, r[0] === 'golden' ? '62% 50%' : '50% 50%');
    f.cap = label(w, '0' + (i + 1), r[1], S.R + 150 + i * 480, r[2] + 598, MIST); return f;
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
  el('div', { class: 'eb', style: 'left:44px;top:462px', text: 'LANGTANG REGION' }, G.card);
  el('div', { class: 'tt', style: 'left:44px;top:500px;width:580px', text: 'Valley walks & mountain villages' }, G.card);
  G.btn = el('div', { class: 'btn', style: 'left:24px;top:' + (CARD.h - 108) + 'px;width:' + (CARD.w - 48) + 'px', html: '<span>Find my trek</span><svg width="36" height="28" viewBox="0 0 36 28"><path d="M2 14h30M20 3l12 11-12 11"/></svg>' }, G.card);

  /* E — the card's photograph opens to full frame; a route is drawn up the hillside */
  G.E = el('div', { class: 'l', style: 'overflow:hidden' }, ST);
  G.Eph = el('div', { class: 'fr' }, G.E); G.Eimg = el('img', { src: IM.path, style: 'object-position:50% 62%' }, G.Eph);
  G.Eshade = el('div', { id: 'heroShade' }, G.Eph);
  G.route = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G.E, true);
  G.routePath = el('path', { d: catmull(ROUTE), fill: 'none', stroke: GOLD, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '0 1' }, G.route, true);
  G.routeDots = el('path', { d: catmull(ROUTE), fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '0.1 22', opacity: 0.55 }, G.route, true);
  G.head = el('circle', { r: 15, fill: GOLD, stroke: '#fff', 'stroke-width': 4 }, G.route, true);
  G.pin = el('circle', { r: 15, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, G.route, true);
  G.labE = label(G.E, '03', 'The next bend', 150, 712, 'rgba(249,250,248,.85)');
  G.hE = words(G.E, 'Shaped around you.', 146, 770, 120, WHITE);

  /* F — make the trail your own: three steps */
  G.F = el('div', { class: 'l paper' }, ST);
  G.labF = label(G.F, '', 'Make the trail your own', 150, 150, 'rgba(21,61,47,.7)');
  var icons = [
    '<path d="M14 18h52a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H38l-14 12V56H14a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6z"/><path d="M24 33h32M24 43h20"/>',
    '<circle cx="18" cy="62" r="7"/><circle cx="62" cy="18" r="7"/><path d="M24 58c14-6 4-22 18-26s12-6 14-10" stroke-dasharray="2 9"/>',
    '<rect x="16" y="8" width="48" height="64" rx="6"/><path d="M27 26h26M27 37h26M27 48h14"/><path d="M44 58l6 6 12-14"/>'
  ];
  G.steps = [['01', 'Share your idea'], ['02', 'Talk through the route'], ['03', 'Review a personal proposal']].map(function (s, i) {
    var c = el('div', { class: 'scard', style: 'left:' + (150 + i * 560) + 'px;top:262px', html: '<div class="no">' + s[0] + '</div><div class="ic"><svg viewBox="0 0 80 80">' + icons[i] + '</svg></div><div class="tt">' + s[1] + '</div>' }, G.F);
    c.paths = [].slice.call(c.querySelectorAll('svg path, svg circle, svg rect'));
    c.paths.forEach(function (p) { p.setAttribute('pathLength', 1); if (!p.getAttribute('stroke-dasharray')) p.setAttribute('stroke-dasharray', '1 1'); });
    return c;
  });

  /* G — forest page rises, the lockup assembles, then the call to action */
  G.G = el('div', { class: 'l forest' }, ST);
  buildLockup(G.G);
  G.cta = el('div', { id: 'cta', html: '<span>Plan my journey</span><svg width="38" height="30" viewBox="0 0 38 30"><path d="M2 15h32M22 4l12 11-12 11"/></svg>' }, G.G);
  G.url = el('div', { id: 'url', html: '<span class="wm"><span class="w">dreamscapetreks.com</span></span>' }, G.G);
  G.endStrip = ['walkers', 'together', 'flags', 'lastlight', 'path', 'golden', 'night'].map(function (k, i) { return frame(G.G, k, 0, 0, 250, 170, '50% 50%'); });

  el('div', { id: 'grain' }, ST);
  /* gold underline under "stay with you.", measured from the laid-out words */
  var a = G.hB[2].getBoundingClientRect(), b = G.hB[4].getBoundingClientRect(), wr = G.world.getBoundingClientRect();
  G.ulB.style.left = px(a.left - wr.left); G.ulB.style.top = px(792 + 112 * 1.02); G.ulB.style.width = px(b.right - a.left - 14);
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
  var onWorld = t < OPEN + 0.6;
  vis(G.world, onWorld);
  G.world.style.transform = 'translateX(' + (-cx).toFixed(1) + 'px)';
  setBlur(G.world, Math.min(60, Math.abs(v) / 60 * 0.45));
  /* photographs sit a little nearer the lens than the type: they travel 12% faster */
  var par = function (f, rest) { f.style.transform = 'translateX(' + ((cx - rest) * -0.12).toFixed(1) + 'px)'; };

  /* ---- A ---- */
  rise([G.labA], [0.2], t); rise(G.hA1.concat(G.hA2), wordTimes('walk', G.hA1.concat(G.hA2)), t);
  showFrame(G.fA, t, 0.0, 0.0, 0.8); par(G.fA, S.A);
  /* ---- B ---- */
  rise([G.labB], [2.62], t); rise(G.hB, wordTimes('stay', G.hB), t);
  showFrame(G.fB, t, 2.45, 2.45, 0.8); par(G.fB, S.B);
  G.ulB.style.transform = 'scaleX(' + expo(prog(t, VOT.stay + 0.55, VOT.stay + 1.15)).toFixed(4) + ')';
  /* ---- C ---- */
  rise(G.hC1, [5.3], t); rise(G.hC2, [5.55], t); rise([G.labC], [6.3], t);
  showFrame(G.fC, t, 5.05, 5.05, 0.9); par(G.fC, S.C);
  /* ---- R ---- */
  rise(G.hR, wordTimes('since', G.hR).map(function (x, i) { return 9.95 + 0.07 * i; }), t);
  G.fR.forEach(function (f, i) { showFrame(f, t, 9.9 + 0.12 * i, 10.0, 0.8); par(f, S.R + i * 160); f.style.transform += ' translateY(' + ((i % 2 ? 1 : -1) * (cx - S.R) * 0.02).toFixed(1) + 'px)'; rise([f.cap], [10.25 + 0.12 * i], t); });
  /* ---- D: choose ---- */
  sceneChoose(t, cx);
  /* ---- E: the route ---- */
  sceneRoute(t);
  /* ---- F: three steps ---- */
  sceneSteps(t);
  /* ---- G: end ---- */
  sceneEnd(t);
}

function sceneChoose(t, cx) {
  if (t > OPEN + 0.6) return;
  rise([G.labD], [12.6], t);
  rise(G.hD1, [12.72, 12.82], t, 14.92, 1); rise(G.hD2, [15.0, 15.1], t, MERGE + 0.05, 1);
  var chipAnim = function (c, i, tIn, picked, tSel) {
    var u = sp(t, tIn + 0.07 * i, 15, 0.82), sel = expo(prog(t, tSel, tSel + 0.32));
    var hover = picked ? smooth(prog(t, tSel - 0.35, tSel - 0.1)) : 0;
    if (!picked) {                                                       /* the others step back once the choice is made */
      var away = expoIn(prog(t, MERGE - 0.05 + 0.03 * i, MERGE + 0.3 + 0.03 * i));
      var shove = i > c.pickIdx ? 48 * expo(prog(t, tSel, tSel + 0.32)) : 0;   /* the chosen chip grows a tick; its neighbours make room */
      c.style.transform = 'translate(' + shove.toFixed(1) + 'px,' + ((1 - u) * 60 + away * 50).toFixed(1) + 'px) scale(' + (lerp(0.7, 1, clamp(u)) * (1 - 0.4 * away)).toFixed(4) + ')';
      c.style.opacity = (1 - away).toFixed(3); c.fill.style.transform = 'scale(0)';
      return;
    }
    c.fill.style.transform = 'scale(' + sel.toFixed(4) + ')'; c.tx.style.color = sel > 0.5 ? WHITE : FOREST;
    c.ok.style.width = (34 * sel).toFixed(1) + 'px'; c.ok.style.marginLeft = (14 * sel).toFixed(1) + 'px';
    c.style.borderColor = 'rgba(21,61,47,' + (0.22 + 0.6 * hover).toFixed(3) + ')';
    /* the chosen chips fly into the trip card */
    var m = expoIO(prog(t, MERGE + (c.row ? 0.08 : 0), MERGE + 0.62 + (c.row ? 0.08 : 0)));
    var tx = CARD.x + 44 + (c.row ? G.rc[PICK.r].w0 * 0.82 + 52 : 0) - c.x0 - c.w0 * 0.09, ty = CARD.y + 600 - c.y0;
    var tap = expo(prog(t, tSel, tSel + 0.06)) * (1 - expo(prog(t, tSel + 0.08, tSel + 0.3)));
    c.style.transform = 'translate(' + (tx * m).toFixed(1) + 'px,' + ((1 - u) * 60 + ty * m - 60 * Math.sin(Math.PI * m)).toFixed(1) + 'px) scale(' + (lerp(0.7, 1, clamp(u)) * (1 - 0.06 * tap) * (1 - 0.18 * m)).toFixed(4) + ')';
    c.style.opacity = 1;
  };
  G.rc.forEach(function (c, i) { c.row = 0; c.pickIdx = PICK.r; c.style.zIndex = i === PICK.r ? 3 : 1; chipAnim(c, i, 12.95, i === PICK.r, SEL.r); });
  G.lc.forEach(function (c, i) { c.row = 1; c.pickIdx = PICK.l; c.style.zIndex = i === PICK.l ? 3 : 1; chipAnim(c, i, 15.05, i === PICK.l, SEL.l); vis(c, t >= 15.0); });
  G.rc.forEach(function (c) { vis(c, t >= 12.9); });
  /* the card rises in as the choices arrive; the button is pressed on the beat */
  var cu = sp(t, MERGE - 0.1, 13, 0.86); vis(G.card, t >= MERGE - 0.12);
  var press = expo(prog(t, PRESS, PRESS + 0.06)) * (1 - expo(prog(t, PRESS + 0.08, PRESS + 0.28)));
  G.card.style.transform = 'translateY(' + ((1 - cu) * 220).toFixed(1) + 'px)';
  G.card.style.clipPath = 'inset(' + ((1 - expo(prog(t, MERGE - 0.1, MERGE + 0.5))) * 100).toFixed(2) + '% 0 0 0 round 30px)';
  G.btn.style.transform = 'scale(' + (1 - 0.04 * press).toFixed(4) + ')';
  G.cardPh.firstChild.style.transform = 'scale(' + (1.12 - 0.08 * expo(prog(t, MERGE, MERGE + 0.8))).toFixed(4) + ')';
}

function sceneRoute(t) {
  var on = t >= OPEN && t < 20.3; vis(G.E, on); if (!on) return;
  /* the card's photo rect (on screen) opens to the full frame */
  var cx = camX(OPEN), k = expoIO(prog(t, OPEN, OPEN + 0.55));
  var r0 = { x: CARD.x - cx + 24, y: CARD.y + 24, w: CARD.w - 48, h: 400 };
  var x = lerp(r0.x, 0, k), y = lerp(r0.y, 0, k), w = lerp(r0.w, W, k), h = lerp(r0.h, H, k);
  /* then the whip pan to the steps */
  var wp = expoIO(prog(t, 19.74, 20.22)), wv = (expoIO(prog(t + 1 / 240, 19.74, 20.22)) - expoIO(prog(t - 1 / 240, 19.74, 20.22))) * 120 * W;
  G.Eph.style.left = px(x); G.Eph.style.top = px(y); G.Eph.style.width = px(w); G.Eph.style.height = px(h); G.Eph.style.borderRadius = px(lerp(22, 0, k));
  G.E.style.transform = 'translateX(' + (-W * wp).toFixed(1) + 'px)'; setBlur(G.E, Math.min(60, Math.abs(wv) / 60 * 0.45));
  G.Eimg.style.transform = 'scale(' + (1.04 + 0.016 * Math.max(0, t - OPEN)).toFixed(4) + ')';
  G.Eshade.style.opacity = smooth(prog(t, 17.45, 18.2)).toFixed(3);
  var dr = expoIO(prog(t, 17.8, 19.2)), len = G.routePath.getTotalLength(), hp = G.routePath.getPointAtLength(len * dr);
  G.routePath.setAttribute('stroke-dasharray', dr.toFixed(4) + ' 1');
  G.routeDots.style.opacity = (0.55 * smooth(prog(t, 17.6, 18.0))).toFixed(3);
  G.head.setAttribute('cx', hp.x.toFixed(1)); G.head.setAttribute('cy', hp.y.toFixed(1)); vis(G.head, t >= 17.75);
  G.head.setAttribute('r', (15 * sp(t, 17.75, 16, 0.8)).toFixed(2));
  var pr = expo(prog(t, 19.2, 19.85)), end = ROUTE[ROUTE.length - 1];
  G.pin.setAttribute('cx', end[0]); G.pin.setAttribute('cy', end[1]); G.pin.setAttribute('r', (15 + 40 * pr).toFixed(1)); G.pin.setAttribute('stroke-opacity', (1 - pr).toFixed(3)); vis(G.pin, t >= 19.2);
  rise([G.labE], [17.7], t); rise(G.hE, wordTimes('shape', G.hE), t);
}

function sceneSteps(t) {
  var on = t >= 19.74 && t < 25.3; vis(G.F, on); if (!on) return;
  var wp = expoIO(prog(t, 19.74, 20.22)), wv = (expoIO(prog(t + 1 / 240, 19.74, 20.22)) - expoIO(prog(t - 1 / 240, 19.74, 20.22))) * 120 * W;
  var up = expoIO(prog(t, 24.55, 25.25));                                 /* the forest page rising pushes the steps up a little */
  G.F.style.transform = 'translate(' + (W * (1 - wp)).toFixed(1) + 'px,' + (-140 * up).toFixed(1) + 'px)'; setBlur(G.F, Math.min(60, Math.abs(wv) / 60 * 0.45));
  rise([G.labF], [20.2], t);
  var T = [20.625, 21.875, 23.125];
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
  var on = t >= 24.5; vis(G.G, on); if (!on) return;
  var up = expoIO(prog(t, 24.55, 25.25));
  G.G.style.transform = 'translateY(' + ((1 - up) * H).toFixed(1) + 'px)';
  var b = VOT.brand, m = sp(t, b - 0.05, 12, 0.92);
  G.mk.setAttribute('transform', 'translate(0,' + ((1 - m) * 700).toFixed(1) + ')');
  G.letters.forEach(function (p, i) { var u = sp(t, b + 0.1 + 0.035 * i, 15, 0.9); p.setAttribute('transform', 'translate(0,' + ((1 - u) * 300).toFixed(1) + ')'); });
  var u1 = sp(t, b + 0.55, 14, 0.9), u2 = sp(t, VOT.beyond - 0.02, 14, 0.9);
  G.tb1.setAttribute('transform', 'translate(0,' + ((1 - u1) * 170).toFixed(1) + ')'); G.tb2.setAttribute('transform', 'translate(0,' + ((1 - u2) * 170).toFixed(1) + ')');
  var c = expo(prog(t, 29.375, 29.95)), cw = lerp(96, 520, c); vis(G.cta, t >= 29.3); vis(G.url, t >= 29.6);
  G.cta.style.left = px(960 - cw / 2); G.cta.style.top = '590px'; G.cta.style.width = px(cw);
  G.cta.firstChild.style.opacity = G.cta.lastChild.style.opacity = clamp((c - 0.55) / 0.35).toFixed(3);
  G.url.style.top = '722px'; rise([G.url.querySelector('.w')], [29.68], t);
  /* a slow strip of the photographs along the bottom edge */
  var s0 = 25.3, sx = -80 * (t - s0);
  G.endStrip.forEach(function (f, i) {
    f.style.left = px(60 + i * 280 + sx); f.style.top = '860px';
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
