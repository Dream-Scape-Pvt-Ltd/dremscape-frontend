/* ===================================================================== helpers */
function zoomAbout(ax, ay, s) { return 'translate(' + ax + 'px,' + ay + 'px) scale(' + s.toFixed(5) + ') translate(' + (-ax) + 'px,' + (-ay) + 'px)'; }
function mapAbout(p, ax, ay, s) { return [ax + (p[0] - ax) * s, ay + (p[1] - ay) * s]; }
var tx = function (e, s) { e.style.transform = s; };

/* ===================================================================== scene 5: the chart card */
var CH = { x0: 252, x1: 1668, base: 910, ax: 960, ay: 840 };
var CHART = resample([[252, 782], [356, 754], [446, 724], [540, 744], [640, 678], [730, 696], [832, 642], [930, 662], [1032, 600], [1130, 624], [1232, 568], [1330, 592], [1432, 524], [1530, 550], [1668, 470]], NP, false);
var VERT = (function () { var o = []; for (var i = 0; i < NP; i++) o.push([CH.x1, 930 - 780 * i / (NP - 1)]); return o; })();
var sweepX = function (t) { return 240 + (CH.x1 - 240) * expoIO(prog(t, 8.5, 9.0)); };

function buildScene5() {
  var st = G.stage;
  /* a: card paper + text + odometer (below the photo) */
  G.s5a = el('div', { class: 'l', style: 'transform-origin:0 0' }, st);
  G.paper = el('div', { style: 'position:absolute;left:' + CARD.x + 'px;top:' + CARD.y + 'px;width:' + CARD.w + 'px;height:' + CARD.h + 'px;border-radius:' + CARD.r + 'px;background:' + WHITE + ';overflow:hidden' }, G.s5a);
  var inP = function (tag, attrs, parent) { return el(tag, attrs, parent || G.paper); };
  /* grid + axis labels */
  var gsvg = el('svg', { width: CARD.w, height: CARD.h, viewBox: CARD.x + ' ' + CARD.y + ' ' + CARD.w + ' ' + CARD.h, style: 'position:absolute;left:0;top:0' }, G.paper, true);
  G.grid = [500, 620, 740, 860].map(function (y) { return el('line', { x1: CH.x0, y1: y, x2: CH.x1, y2: y, stroke: MIST, 'stroke-width': 2, opacity: 0.8 }, gsvg, true); });
  /* text: each piece sits in a clipping band and rises into it */
  var band = function (x, y, w, h, parent) { return el('div', { style: 'position:absolute;left:' + (x - CARD.x) + 'px;top:' + (y - CARD.y) + 'px;width:' + w + 'px;height:' + h + 'px;overflow:hidden' }, parent || G.paper); };
  G.eyeBand = band(300, 190, 800, 44);
  G.eyeDash = el('div', { style: 'position:absolute;left:0;top:19px;width:34px;height:5px;border-radius:3px;background:' + GOLD }, G.eyeBand);
  G.eyeTxt = el('div', { class: 'tl', text: 'LOCAL JOURNEYS · SINCE 2005', style: 'left:50px;top:7px;font-size:23px;font-weight:700;letter-spacing:.16em;color:' + FOREST }, G.eyeBand);
  var c = document.createElement('canvas').getContext('2d'); c.font = '800 104px PJS';
  var fsH = 104, w1 = c.measureText('Rooted in').width - 0.04 * fsH * 9, w2 = c.measureText('Nepal.').width;
  G.h1Band = band(300, 238, w1 + 30, 126); G.h1 = el('div', { class: 'tl', text: 'Rooted in', style: 'left:0;top:6px;font-size:' + fsH + 'px;color:' + FOREST }, G.h1Band);
  G.h2Band = band(300 + w1 + 22, 238, w2 + 30, 126); G.h2 = el('div', { class: 'tl', text: 'Nepal.', style: 'left:0;top:6px;font-size:' + fsH + 'px;color:' + FOREST }, G.h2Band);
  /* odometer: four digit columns rolling up to 2005 */
  var fsO = 104, cw = Math.round(fsO * 0.6), lh = 112;
  CH.odo = { cw: cw, lh: lh, cols: [], start: [1, 9, 8, 9], end: [2, 0, 0, 5] };
  G.odoBand = band(1620 - cw * 4, 238, cw * 4 + 4, lh);
  for (var d = 0; d < 4; d++) {
    var col = el('div', { style: 'position:absolute;left:' + (d * cw) + 'px;top:0;width:' + cw + 'px;height:' + lh + 'px;overflow:hidden' }, G.odoBand);
    var stack = el('div', { style: 'position:absolute;left:0;top:0;width:' + cw + 'px' }, col);
    for (var k = 0; k < 30; k++) el('div', { class: 'tl', text: String(k % 10), style: 'position:relative;display:block;width:' + cw + 'px;height:' + lh + 'px;font-size:' + fsO + 'px;line-height:' + lh + 'px;text-align:center;color:' + FOREST + ';letter-spacing:0' }, stack);
    CH.odo.cols.push(stack);
  }
  /* b: marker + chips (above the photo) */
  G.s5b = el('div', { class: 'l', style: 'transform-origin:0 0' }, st);
  var chip = function (txt, x, y, anchorRight) {
    var w = el('div', { style: 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:0;height:0' }, G.s5b);
    var p = el('div', { class: 'tl', text: txt, style: 'left:' + (anchorRight ? '-100%' : '0') + ';top:0;padding:15px 26px;border-radius:40px;background:' + FOREST + ';color:' + WHITE + ';font-size:24px;font-weight:700;letter-spacing:.02em;line-height:1;transform-origin:' + (anchorRight ? '100%' : '0') + ' 100%' }, w);
    if (anchorRight) { p.style.left = 'auto'; p.style.right = '0'; }
    return p;
  };
  G.chipA = chip('Since 2005', 276, 636, false);
  G.chipB = chip('Himalaya & Beyond', 1668, 386, true);
  var msvg = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G.s5b, true);
  G.peakDot = el('circle', { cx: CH.x1, cy: 470, r: 15, fill: GOLD, stroke: FOREST, 'stroke-width': 5 }, msvg, true);
  G.startDot = el('circle', { cx: CH.x0, cy: 782, r: 12, fill: GOLD, stroke: FOREST, 'stroke-width': 4 }, msvg, true);
  /* the photo, shown through the chart's area under the line */
  G.s6cam = el('div', { class: 'l', style: 'transform-origin:0 0' }, st);
  G.pho = el('div', { class: 'l', style: 'overflow:hidden' }, G.s6cam);
  G.phoImg = el('img', { src: window.PHOTO, style: 'position:absolute;left:0;top:-150px;width:1920px;height:1440px;transform-origin:960px 690px' }, G.pho);
}

/* area-under-the-line polygon in card space, grown from the baseline by k, rounded to the card's inner corners */
function areaPts(k) {
  var o = CHART.map(function (p) { return [p[0], CH.base - (CH.base - p[1]) * k]; });
  o.push([CH.x1, CH.base]); o.push([CH.x0, CH.base]);
  return o;
}

function scene5(t) {
  var on = t >= 8.45 && t < 10.75;
  vis(G.s5a, on); vis(G.s5b, on); vis(G.s6cam, (t >= 9.45 && t < 12.05));
  var s = 1;
  if (t >= 10.0) s = zoomExp(expoIO(prog(t, 10.0, 10.7)), 1, 14);
  if (on) {
    var zs = zoomAbout(CH.ax, CH.ay, s); tx(G.s5a, zs); tx(G.s5b, zs);
    /* paper wipe: the gold sweep line reveals the card */
    var xs = sweepX(t), wipe = t < 8.5 ? 0 : xs;
    G.paper.style.clipPath = 'none';
    G.paper.style.background = WHITE;
    G.paper.style.width = Math.max(0, (t < 8.5 ? 0 : xs - CARD.x + 1)) + 'px';
    G.paper.style.borderTopRightRadius = G.paper.style.borderBottomRightRadius = (t >= 9.0 ? CARD.r : 0) + 'px';
    /* text rises into its band once the sweep has passed it */
    var rise = function (e, t0, h) { var u = clamp(sp(t, t0, 18, 0.9), 0, 1.04); e.style.transform = 'translateY(' + ((1 - u) * h).toFixed(1) + 'px)'; };
    rise(G.eyeDash, 8.55, 60); rise(G.eyeTxt, 8.58, 60); rise(G.h1, 8.66, 150); rise(G.h2, 8.78, 150);
    /* odometer: columns roll with ease-out, right-most last; one tick per digit change */
    var O = CH.odo;
    for (var d = 0; d < 4; d++) {
      var u = expo(prog(t, 8.86 + d * 0.05, 9.4 + d * 0.05)), v0 = O.start[d], v1 = O.end[d] + (d === 3 ? 10 : (d === 0 ? 0 : 10));
      var v = lerp(v0, v1, u);
      O.cols[d].style.transform = 'translateY(' + (-((v % 10) + 10) * O.lh).toFixed(1) + 'px)';
    }
    G.odoBand.style.visibility = t >= 8.86 ? 'inherit' : 'hidden';
    /* grid draws in */
    G.grid.forEach(function (g, i) { var u = expo(prog(t, 9.05 + i * 0.05, 9.4 + i * 0.05)); g.setAttribute('x2', (CH.x0 + (CH.x1 - CH.x0) * u).toFixed(1)); });
    /* start and peak markers */
    var sa = clamp(sp(t, 9.5, 22, 0.75), 0, 1.1), sb = clamp(sp(t, 9.75, 22, 0.75), 0, 1.1);
    G.startDot.setAttribute('r', (12 * sa).toFixed(2)); G.peakDot.setAttribute('r', (15 * sb).toFixed(2));
    G.chipA.style.transform = 'scale(' + sa.toFixed(4) + ')'; G.chipB.style.transform = 'scale(' + sb.toFixed(4) + ')';
    G.chipA.style.visibility = sa > 0.01 ? 'inherit' : 'hidden'; G.chipB.style.visibility = sb > 0.01 ? 'inherit' : 'hidden';
    G.startDot.style.visibility = sa > 0.01 ? 'inherit' : 'hidden'; G.peakDot.style.visibility = sb > 0.01 ? 'inherit' : 'hidden';
  }
  /* the photo lives inside the chart's area; its outline follows the chart zoom */
  if (t >= 9.45 && t < 12.05) {
    if (t < 10.75) {
      var k = expo(prog(t, 9.45, 9.85)), pts = areaPts(k).map(function (p) { return mapAbout(p, CH.ax, CH.ay, s); });
      G.pho.style.clipPath = clipPoly(pts);
    } else G.pho.style.clipPath = 'none';
  }
}

/* the gold line during scenes 4-5 */
function lineScene45(t, s) {
  if (t < 5.5) return null;
  if (t < 5.92) { s.pts = headOf(RIDGE_BIG, expo((t - 5.5) / 0.4)); s.w = 11.8; return s; }
  if (t < 7.0) return s;
  var fz = 1700 / (1700 - cam4(t).dz), e = expoIO(prog(t, 7.45, 8.0)), pts = windowPts(t);
  if (t < 7.45) {
    var f0 = polyLen(RIDGE_BIG, false) / polyLen(MARK_BIG, true), f = lerp(f0, 1, expo(prog(t, 7.0, 7.4)));
    s.pts = headOf(pts.concat([pts[0]]), f); s.w = 11.8; return s;
  }
  s.closed = true; s.pts = pts; s.w = 11.8 * (1 - 0.3 * e); if (t >= 8.45) { s.closed = false; }
  if (t >= 8.45 && t < 9.0) {
    var kf = expo(prog(t, 8.45, 8.65)), dx = sweepX(t) - 240; s.pts = CARD_PTS.map(function (p) { return [240 + dx + (p[0] - 240) * (1 - kf), p[1]]; }); s.w = 8;
    return s;
  }
  if (t >= 9.0 && t < 10.75) {
    var k = expoIO(prog(t, 9.0, 9.55)); s.pts = morphPts(VERT, CHART, k); s.w = 8;
    if (t >= 10.0) { var zz = zoomExp(expoIO(prog(t, 10.0, 10.7)), 1, 14); s.pts = s.pts.map(function (p) { return mapAbout(p, CH.ax, CH.ay, zz); }); s.w = 8 * Math.min(zz, 6); }
    return s;
  }
  if (t >= 10.75) { s.w = 0; }
  return s;
}
/* the window outline (mark -> frame -> card), shared by the clip and the gold outline */
function windowPts(t) {
  var fz = 1700 / (1700 - cam4(t).dz), e = expoIO(prog(t, 7.45, 8.0)), pts;
  if (t < 8.0) pts = morphPts(MARK_BIG, FRAME_PTS, e); else pts = morphPts(FRAME_PTS, CARD_PTS, expoIO(prog(t, 8.0, 8.45)));
  var f = lerp(fz, 1, e); if (t >= 8.0) f = 1;
  return pts.map(function (p) { return [960 + (p[0] - 960) * f, 540 + (p[1] - 540) * f]; });
}

/* ===================================================================== scene 6: HIMALAYA knocked out of the forest */
var HIM = { fs: 316, text: 'HIMALAYA', letters: [], a: null };
function buildScene6() {
  var c = document.createElement('canvas').getContext('2d'), fs = HIM.fs;
  c.font = '800 ' + fs + 'px PJS';
  var raw = function (ch) { return c.measureText(ch).width; }, adv = function (ch) { return raw(ch) - 0.04 * fs; };
  var total = 0; HIM.text.split('').forEach(function (ch) { total += adv(ch); });
  var cap = c.measureText('H').actualBoundingBoxAscent, x = 960 - total / 2 - 8, base = 540 + cap / 2 + 6;
  G.field = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G.s6cam, true);
  var defs = el('defs', {}, G.field, true);
  var mask = el('mask', { id: 'mHim', maskUnits: 'userSpaceOnUse', x: -6000, y: -6000, width: 14000, height: 14000 }, defs, true);
  G.mRect = el('rect', { x: -6000, y: 1080, width: 14000, height: 14000, fill: '#fff' }, mask, true);
  HIM.text.split('').forEach(function (ch, i) {
    var t = el('text', { x: x.toFixed(1), y: base.toFixed(1), fill: '#000', 'font-family': 'PJS', 'font-weight': 800, 'font-size': fs }, mask, true);
    t.textContent = ch;
    HIM.letters.push({ el: t, x: x, adv: adv(ch), raw: raw(ch), base: base, i: i, ch: ch });
    x += adv(ch);
  });
  el('rect', { x: -6000, y: -6000, width: 14000, height: 14000, fill: FOREST, mask: 'url(#mHim)' }, G.field, true);
  /* the portal: the counter of the first A, found by scanning the rasterised glyph for the widest empty circle */
  var A = HIM.letters[3], cv = document.createElement('canvas'); cv.width = 700; cv.height = 700;
  var cx = cv.getContext('2d'); cx.fillStyle = '#000'; cx.font = '800 ' + fs + 'px PJS'; cx.textBaseline = 'alphabetic'; cx.fillText('A', 150, 500);
  var d = cx.getImageData(0, 0, 700, 700).data, solid = function (x, y) { x = Math.round(x); y = Math.round(y); return x < 0 || y < 0 || x > 699 || y > 699 || d[(y * 700 + x) * 4 + 3] > 128; };
  var best = { r: 0, x: 0, y: 0 }, dirs = 24, gx = 150 + A.raw / 2;
  for (var py = 500 - cap; py < 500; py += 2) for (var px = gx - 24; px <= gx + 24; px += 2) {
    if (solid(px, py)) continue; var r = 0, hit = false;
    while (r < 120 && !hit) { r++; for (var a = 0; a < dirs; a++) if (solid(px + r * Math.cos(a / dirs * 6.2832), py + r * Math.sin(a / dirs * 6.2832))) { hit = true; break; } }
    if (r > best.r) best = { r: r, x: px, y: py };
  }
  HIM.a = { cx: A.x + (best.x - 150), cy: A.base + (best.y - 500), r: best.r - 1 };
}
function camS6(t) {
  var z = 1 + 0.05 * smooth(prog(t, 10.7, 11.5)), cx = 960, cy = 540;
  if (t > 11.4) {
    var a = HIM.a, k = expoIO(prog(t, 11.4, 12.0)), zEnd = 1.04 * 1100 / a.r;
    z = zoomExp(k, 1.05, zEnd); var m = smooth(clamp(k * 1.2)); cx = lerp(960, a.cx, m); cy = lerp(540, a.cy, m);
  }
  return { z: z, cx: cx, cy: cy };
}
function scene6(t) {
  var on = t >= 9.45 && t < 12.05;
  if (!on) return;
  applyCamTo(G.s6cam, camS6(t));
  var pz = 1.14 - 0.14 * expo(prog(t, 9.45, 10.9)) + 0.05 * smooth(prog(t, 10.9, 11.6));
  G.phoImg.style.transform = 'scale(' + pz.toFixed(4) + ')';
  vis(G.field, t >= 10.7);
  if (t >= 10.7) {
    G.mRect.setAttribute('y', (1100 - 1120 * expoIO(prog(t, 10.72, 11.25))).toFixed(1));
    HIM.letters.forEach(function (L, i) {
      var u = clamp(sp(t, 10.86 + 0.04 * i, 20, 0.82), 0, 1.04);
      L.el.setAttribute('transform', 'translate(0,' + ((1 - u) * 380).toFixed(1) + ')');
    });
  }
}

/* ===================================================================== scene 7: DREAMSCAPE in 3D */
var NS7 = 22, SB = 0.82, P7 = 1900;
var L7 = (function () {
  var ls = LET.filter(function (l) { return l.kind === 'letter'; }), xc = (ls[0].x0 + ls[ls.length - 1].x1) / 2, yc = 188;
  return ls.map(function (l, i) { return { l: l, i: i, w: l.x1 - l.x0, h: l.y1 - l.y0, cxw: (l.x0 + l.x1) / 2 - xc, cyw: (l.y0 + l.y1) / 2 - yc, lx: LX + (l.x0 + l.x1) / 2 * LS - 960, ly: LY + (l.y0 + l.y1) / 2 * LS - 540, sl: [] }; });
})();
function buildScene7() {
  G.l7 = el('div', { class: 'l', style: 'z-index:60' }, G.stage);
  L7.forEach(function (o) {
    for (var k = NS7 - 1; k >= 0; k--) {
      var svg = el('svg', { width: o.w, height: o.h, viewBox: o.l.x0 + ' ' + o.l.y0 + ' ' + o.w + ' ' + o.h, style: 'position:absolute;left:' + (960 - o.w / 2) + 'px;top:' + (540 - o.h / 2) + 'px;transform-origin:50% 50%' }, G.l7, true);
      el('path', { d: o.l.d, fill: k === 0 ? WHITE : mixHex('#8fb5a4', '#0b2a1f', Math.pow((k - 1) / (NS7 - 2), 0.7)), 'fill-rule': 'evenodd' }, svg, true);
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
  var e = expoIO(prog(t, 13.4, 13.9)), sc = lerp(SB, LS, e);
  L7.forEach(function (o) {
    var a = clamp(sp(t, 12.0 + 0.035 * o.i, 16, 0.86), 0, 1.03), r = 1 - a, dir = o.i % 2 ? 1 : -1;
    var wx = lerp(o.cxw * SB + (o.i - 4.5) * 260 * r, o.lx, e), wy = lerp(o.cyw * SB + (((o.i % 3) - 1) * 340) * r, o.ly, e), wz = -3000 * r;
    var u = prog(t, 12.5 + 0.03 * o.i, 13.0 + 0.03 * o.i), la = dir * 70 * r + Math.sin(u * 6.2832) * (1 - u) * 28 * dir;
    var base = head + ' translate3d(' + wx.toFixed(1) + 'px,' + wy.toFixed(1) + 'px,' + wz.toFixed(1) + 'px) rotateY(' + la.toFixed(2) + 'deg)';
    for (var k = 0; k < NS7; k++) o.sl[k].style.transform = base + ' translateZ(' + (-k / (NS7 - 1) * D + D / 2).toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
  });
}
