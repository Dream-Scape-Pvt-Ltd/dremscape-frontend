/* ===================================================================== bar 4: the stairs become a chart of the highest peaks */
var PEAKS = [['Langtang', 'Langtang Lirung', 7227], ['Annapurna', 'Annapurna I', 8091], ['Manaslu', 'Manaslu', 8163], ['Everest', 'Mount Everest', 8849]];
var CHT = { x0: 270, pitch: 360, w: 300, yB: 950, k: 0.0718 };
var barX = function (i) { return CHT.x0 + CHT.pitch * i; };
var barTop = function (i) { return CHT.yB - PEAKS[i][2] * CHT.k; };
var fmtM = function (v) { v = Math.round(v); return (v >= 1000 ? Math.floor(v / 1000) + ',' + ('00' + (v % 1000)).slice(-3) : String(v)) + ' m'; };
var BEAT_T = [6.0, 6.5, 7.0, 7.5];                                           /* one peak per beat */

function buildScene4() {
  var st = G.stage;
  G.sunSvg = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, st, true);
  G.sun = el('circle', { cx: 0, cy: 0, r: 1, fill: GOLD }, G.sunSvg, true);
  G.chart = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, st, true);
  var defs = el('defs', {}, G.chart, true), pat = el('pattern', { id: 'cpat', patternUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs, true);
  el('image', { href: IM.poster, x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none' }, pat, true);
  G.bars = PEAKS.map(function () { return el('path', { fill: 'url(#cpat)' }, G.chart, true); });
  G.lbl = el('div', { class: 'l' }, st);
  var band = function (x, y, w, h) { return el('div', { style: 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;overflow:hidden' }, G.lbl); };
  G.eyeB = band(240, 104, 1100, 54);
  G.eye = el('div', { class: 'tl', text: 'THE HIGHEST PEAK IN EACH REGION', style: 'left:0;top:8px;font-size:30px;font-weight:700;letter-spacing:.16em;color:' + MIST }, G.eyeB);
  G.num = []; G.nameB = []; G.name = [];
  PEAKS.forEach(function (p, i) {
    var n = el('div', { class: 'tl', text: '0 m', style: 'font-size:76px;color:' + WHITE + ';width:' + CHT.w + 'px;text-align:center;letter-spacing:-.03em' }, G.lbl);
    G.num.push(n);
    var nb = band(barX(i) - 30, CHT.yB + 18, CHT.w + 60, 92); G.nameB.push(nb);
    var nm = el('div', { style: 'position:absolute;left:0;top:0;width:100%;text-align:center' }, nb);
    el('div', { class: 'tl', text: p[0], style: 'position:relative;font-size:44px;color:' + WHITE + ';letter-spacing:-.02em;display:block' }, nm);
    el('div', { class: 'tl', text: p[1], style: 'position:relative;font-size:24px;font-weight:700;color:' + MIST + ';letter-spacing:.04em;display:block;margin-top:6px' }, nm);
    G.name.push(nm);
  });
}
/* bar geometry: start = the flat stairs (scaled 0.75), end = chart; each peak rises on its own beat; then the tops sharpen into peaks (bar 5) */
function barGeom(i, t) {
  var s0x = PIV[0] + (ST.w * i - PIV[0]) * SC3, s0w = ST.w * SC3, s0top = PIV[1] + (ST.tops[i] - PIV[1]) * SC3, s0b = PIV[1] + (1160 - PIV[1]) * SC3;
  var open = expo((t - 5.95) / 0.35), rise = expo((t - BEAT_T[i]) / 0.42);
  var x = lerp(s0x, barX(i), open), w = lerp(s0w, CHT.w, open), yb = lerp(s0b, CHT.yB, open), top = lerp(s0top, barTop(i), rise);
  /* bar 5: triangles */
  var k = expoIO(prog(t, 8.0, 8.55)), cx = x + w / 2, half = lerp(w / 2, 330, k), apex = top - 70 * k; yb = lerp(yb, 1110, k);
  var tl = [cx - half * (1 - k) - 0, apex], tr = [cx + half * (1 - k), apex];
  return { pts: [[cx - half, yb], [cx - w / 2 * (1 - k) - 0 * k, k < 0.999 ? apex : apex], [cx + w / 2 * (1 - k), apex], [cx + half, yb]], top: apex, cx: cx, yb: yb, x: x, w: w };
}
function scene4(t) {
  var on = t >= 5.9 && t < 10.6;
  vis(G.chart, on); vis(G.lbl, t >= 5.95 && t < 10.6); vis(G.sunSvg, t >= 8.45 && t < 12.2);
  if (!on) return;
  var i;
  for (i = 0; i < 4; i++) {
    var g = barGeom(i, t); G.bars[i].setAttribute('d', 'M' + g.pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z');
    var risen = t >= BEAT_T[i], u = expo((t - BEAT_T[i]) / 0.5);
    G.num[i].textContent = fmtM(PEAKS[i][2] * u);
    G.num[i].style.left = (g.cx - CHT.w / 2).toFixed(1) + 'px'; G.num[i].style.top = (g.top - 134).toFixed(1) + 'px';
    var xo = expoIn(prog(t, 7.98 + 0.03 * i, 8.4));                                    /* labels leave as the bars turn into peaks */
    G.num[i].style.visibility = risen && u > 0.04 && t < 8.45 ? 'inherit' : 'hidden'; G.num[i].style.top = (g.top - 134 - 260 * xo).toFixed(1) + 'px';
    var nu = clamp(sp(t, BEAT_T[i] + 0.05, 16, 0.9), 0, 1.04); G.name[i].style.transform = 'translateY(' + ((1 - nu) * 110 + xo * 130).toFixed(1) + 'px)';
    G.nameB[i].style.visibility = risen && t < 8.45 ? 'inherit' : 'hidden';
  }
  var eu = clamp(sp(t, 5.98, 16, 0.9), 0, 1.04); G.eye.style.transform = 'translateY(' + ((1 - eu) * 60 + expoIn(prog(t, 7.98, 8.4)) * 70).toFixed(1) + 'px)'; G.eyeB.style.visibility = t < 8.45 ? 'inherit' : 'hidden';
}
/* the dot hops from peak to peak, one per beat, and ends on Everest */
function dotOnChart(t) {
  var P = [[1500, 393]];
  for (var i = 0; i < 4; i++) P.push([barX(i) + CHT.w / 2, barTop(i) - DOT / 2]);
  var pos = P[0], i, cur;
  for (i = 0; i < 4; i++) {
    var rise = expo((t - BEAT_T[i]) / 0.42);
    if (t >= BEAT_T[i]) { var from = i === 0 ? P[0] : P[i]; cur = hopTo(t, BEAT_T[i], HOP, from, P[i + 1], 120); pos = cur; }
  }
  if (t >= 8.0) { var ax = barX(3) + CHT.w / 2, ay = apexOf(t) - DOT / 2; var u = clamp((t - 8.0) / HOP); pos = [ax, ay - 60 * Math.sin(Math.PI * smooth(u))]; }
  return pos;
}

/* ===================================================================== bar 5-6: peaks -> sunrise -> three real moments */
var PAN = { w: 380, h: 620, gap: 40, x0: 140, r: 28, top: [330, 290, 250, 210], src: ['flags', 'walkers', 'path', 'hill'] };
function buildScene5() {
  var st = G.stage;
  G.pan = el('div', { class: 'l' }, st);
  G.pans = PAN.src.map(function (k, i) {
    var d = el('div', { style: 'position:absolute;left:' + (PAN.x0 + (PAN.w + PAN.gap) * i) + 'px;top:' + PAN.top[i] + 'px;width:' + PAN.w + 'px;height:' + PAN.h + 'px;border-radius:' + PAN.r + 'px;overflow:hidden;background:' + FOREST }, G.pan);
    var sc = Math.max(PAN.w / 1536, PAN.h / 2048);
    el('img', { src: IM[k], style: 'position:absolute;width:' + (1536 * sc).toFixed(1) + 'px;height:' + (2048 * sc).toFixed(1) + 'px;left:' + ((PAN.w - 1536 * sc) / 2).toFixed(1) + 'px;top:' + ((PAN.h - 2048 * sc) / 2).toFixed(1) + 'px' }, d);
    return d;
  });
  /* "Personally planned journeys." rises word by word in a clipping band */
  G.cap = el('div', { style: 'position:absolute;left:' + PAN.x0 + 'px;top:84px;width:1700px;height:130px;overflow:hidden' }, G.pan);
  var c = document.createElement('canvas').getContext('2d'); c.font = '800 84px PJS';
  G.capW = []; var x = 0;
  ['Personally', 'planned', 'journeys.'].forEach(function (w, i) {
    var e = el('div', { class: 'tl', text: w, style: 'left:' + x + 'px;top:18px;font-size:84px;color:' + FOREST }, G.cap); G.capW.push(e);
    x += c.measureText(w + ' ').width - 0.04 * 84 * (w.length + 1) + 12;
  });
  G.iris = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, st, true);
  G.irisC = el('circle', { cx: 960, cy: 540, r: 0, fill: FOREST }, G.iris, true);
}
function apexOf(t) { return barGeom(3, t).top; }
function sunState(t) {                                                       /* the dot becomes the sun behind the range */
  var ax = barX(3) + CHT.w / 2, ay = apexOf(t);
  var a = expo(prog(t, 8.5, 9.0)), b = expoIO(prog(t, 9.0, 9.6));
  var r = 22 + 120 * a + 1500 * b, cx = lerp(ax, 960, b), cy = lerp(ay, 380, b);
  return { cx: cx, cy: cy, r: r };
}
function scene5(t) {
  var s = sunState(t);
  G.sun.setAttribute('cx', s.cx.toFixed(1)); G.sun.setAttribute('cy', s.cy.toFixed(1)); G.sun.setAttribute('r', s.r.toFixed(1));
  /* the range sinks as the camera keeps rising */
  var dy = 900 * expoIO(prog(t, 9.55, 10.1));
  G.chart.style.transform = 'translateY(' + dy.toFixed(1) + 'px)'; G.chart.style.visibility = t >= 5.9 && t < 10.6 ? 'inherit' : 'hidden';
  vis(G.sunSvg, t >= 8.45 && t < 12.6);
  var on = t >= 9.95 && t < 12.6; vis(G.pan, on); vis(G.iris, t >= 11.95 && t < 12.6);
  if (!on) return;
  G.pans.forEach(function (p, i) {
    var t0 = 10.0 + 0.5 * i, u = clamp(sp(t, t0, 13, 0.9), 0, 1.03), out = expoIn(prog(t, 12.0 + 0.04 * i, 12.5)) * 1000;
    p.style.transform = 'translateY(' + ((1 - u) * 1000 + out).toFixed(1) + 'px)'; p.style.visibility = t >= t0 ? 'inherit' : 'hidden';
  });
  G.capW.forEach(function (w, i) { var t0 = 11.0 + 0.12 * i, u = clamp(sp(t, t0, 16, 0.9), 0, 1.03), out = expoIn(prog(t, 12.0, 12.4)) * 160; w.style.transform = 'translateY(' + ((1 - u) * 150 + out).toFixed(1) + 'px)'; w.style.visibility = t >= t0 ? 'inherit' : 'hidden'; });
  G.irisC.setAttribute('r', (expo(prog(t, 12.0, 12.55)) * 1500).toFixed(1));
}

/* ===================================================================== bar 7: DREAMSCAPE in 3D, the letters wear the photograph */
var NS7 = 22, SB = 0.82, P7 = 1900;
var L7 = (function () {
  var ls = LET.filter(function (l) { return l.kind === 'letter'; }), xc = (ls[0].x0 + ls[ls.length - 1].x1) / 2, yc = 188;
  return ls.map(function (l, i) { return { l: l, i: i, w: l.x1 - l.x0, h: l.y1 - l.y0, cxw: (l.x0 + l.x1) / 2 - xc, cyw: (l.y0 + l.y1) / 2 - yc, lx: LKX + (l.x0 + l.x1) / 2 * LKS - 960, ly: LKY + (l.y0 + l.y1) / 2 * LKS - 540, sl: [] }; });
})();
function buildScene7() {
  G.l7 = el('div', { class: 'l', style: 'z-index:60' }, G.stage);
  var x0 = L7[0].l.x0, x1 = L7[L7.length - 1].l.x1, iw = x1 - x0, ih = iw * 1080 / 1920;      /* the photo spans the whole word, so it runs on across the letters */
  L7.forEach(function (o) {
    for (var k = NS7 - 1; k >= 0; k--) {
      var svg = el('svg', { width: o.w, height: o.h, viewBox: o.l.x0 + ' ' + o.l.y0 + ' ' + o.w + ' ' + o.h, style: 'position:absolute;left:' + (960 - o.w / 2) + 'px;top:' + (540 - o.h / 2) + 'px;transform-origin:50% 50%' }, G.l7, true);
      if (k === 0) {
        var defs = el('defs', {}, svg, true), cp = el('clipPath', { id: 'lc' + o.i }, defs, true); el('path', { d: o.l.d }, cp, true);
        el('path', { d: o.l.d, fill: '#10302a' }, svg, true);
        el('image', { href: IM.range, x: x0, y: 188 - ih * 0.34, width: iw, height: ih, preserveAspectRatio: 'none', 'clip-path': 'url(#lc' + o.i + ')' }, svg, true);
      } else el('path', { d: o.l.d, fill: mixHex('#8fb5a4', '#0b2a1f', Math.pow((k - 1) / (NS7 - 2), 0.7)), 'fill-rule': 'evenodd' }, svg, true);
      o.sl[k] = svg;
    }
  });
}
function cam7(t) {
  return { dz: curve(t, [[12.0, 0], [12.5, 120], [13.0, 70], [13.4, 0]]), rx: curve(t, [[12.0, 0], [12.5, 0], [12.8, 10], [13.4, 0]]),
           ry: curve(t, [[12.0, 0], [12.5, 0], [12.8, -26], [13.0, -20], [13.4, 0]]) };
}
function scene7(t) {
  var on = t >= 11.99 && t < 13.9;
  vis(G.l7, on); if (!on) return;
  var c = cam7(t), head = 'perspective(' + P7 + 'px) translateZ(' + c.dz.toFixed(1) + 'px) rotateX(' + c.rx.toFixed(3) + 'deg) rotateY(' + c.ry.toFixed(3) + 'deg)';
  var D = Math.max(0, curve(t, [[12.0, 50], [12.5, 90], [12.9, 170], [13.1, 140], [13.4, 0]]));
  var e = expoIO(prog(t, 13.4, 13.9)), sc = lerp(SB, LKS, e);
  L7.forEach(function (o) {
    var a = clamp(sp(t, 12.0 + 0.035 * o.i, 16, 0.86), 0, 1.03), r = 1 - a, dir = o.i % 2 ? 1 : -1;
    var wx = lerp(o.cxw * SB + (o.i - 4.5) * 260 * r, o.lx, e), wy = lerp(o.cyw * SB + (((o.i % 3) - 1) * 340) * r, o.ly, e), wz = -3000 * r;
    var u = prog(t, 12.5 + 0.03 * o.i, 13.0 + 0.03 * o.i), la = dir * 70 * r + Math.sin(u * 6.2832) * (1 - u) * 28 * dir;
    var base = head + ' translate3d(' + wx.toFixed(1) + 'px,' + wy.toFixed(1) + 'px,' + wz.toFixed(1) + 'px) rotateY(' + la.toFixed(2) + 'deg)';
    for (var k = 0; k < NS7; k++) o.sl[k].style.transform = base + ' translateZ(' + (-k / (NS7 - 1) * D + D / 2).toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
  });
}

/* ===================================================================== end title: the dot falls back, the pill opens, the photograph irises in */
function endDot(t) {
  var s = { cx: PILL.x + DOT / 2, cy: PILL.y + PILL.h / 2, w: DOT, h: DOT, txt: 0, on: true };
  if (t < 13.5) { s.on = false; return s; }
  if (t < 14.0) { var u = expo((t - 13.5) / 0.42); s.cy = lerp(-50, PILL.y + PILL.h / 2, u); return s; }
  var o = expo((t - 14.0) / 0.5), q = expo((t - 14.0) / 0.2);                /* circle -> pill */
  s.h = lerp(DOT, PILL.h, q); s.w = lerp(DOT, PILL.w, o); s.cx = PILL.x + s.w / 2; s.cy = PILL.y + PILL.h / 2; s.txt = clamp((o - 0.55) / 0.45);
  return s;
}
function sceneEnd(t) {
  var on = t >= 13.9;
  /* poster photograph: an iris growing out of the pill */
  var r = expo(prog(t, 14.0, 14.7)) * 2400;
  vis(G.poster, t < 1.0 || t >= 13.95);
  if (t >= 13.95) G.poster.style.clipPath = r >= 2399 ? 'none' : 'circle(' + r.toFixed(1) + 'px at ' + (PILL.x + DOT / 2) + 'px ' + (PILL.y + PILL.h / 2) + 'px)'; else G.poster.style.clipPath = 'none';
}
