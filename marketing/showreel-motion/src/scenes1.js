/* ===================================================================== assets + layout */
var LOGO = window.LOGO, LET = window.LETTERS, LAND = window.LAND;
var LS = 1500 / 3337, LX = 210, LY = (H - 650 * LS) / 2;                 /* the official lockup, centred: the first and last frame */
var lk = function (x, y) { return [LX + x * LS, LY + y * LS]; };
var G = { stage: document.getElementById('stage') };
var NP = 260;                                                              /* points per morphing outline */

/* the site's own dotted trail (src/components/trail-drawing.tsx): M-20 180 C80 20 190 250 300 120 S480 0 630 70, scaled to the frame */
var TRAIL_RAW = (function () {
  var c1 = [[-20, 180], [80, 20], [190, 250], [300, 120]], c2 = [[300, 120], [410, -10], [480, 0], [630, 70]], o = [];
  [c1, c2].forEach(function (c, ci) { for (var s = ci ? 1 : 0; s <= 40; s++) { var u = s / 40, v = 1 - u; o.push([v * v * v * c[0][0] + 3 * v * v * u * c[1][0] + 3 * v * u * u * c[2][0] + u * u * u * c[3][0], v * v * v * c[0][1] + 3 * v * v * u * c[1][1] + 3 * v * u * u * c[2][1] + u * u * u * c[3][1]]); } });
  return o;
})();
var TRAIL = resample(TRAIL_RAW.map(function (p) { return [(p[0] + 20) * 3.2 - 100, p[1] * 3.2 + 150]; }), NP, false);

/* ridge of the mark, in lockup space and in screen space */
var RIDGE_LK = LOGO.ridge.map(function (p) { return lk(p[0], p[1]); });
var RIDGE = resample(RIDGE_LK, NP, false);

/* the mark as a morph-able outline (screen px), centred, width 1100 */
var MARK_W = 1100, MARK_S = MARK_W / 1584, MARK_X = 960 - 794 * MARK_S, MARK_Y = 540 - 323 * MARK_S;      /* lockup space -> big mark */
var markSub = parsePath(LOGO.mark).sort(function (a, b) { return polyLen(b, true) - polyLen(a, true); })[0];
var MARK_BIG = startAtLeft(resample(markSub.map(function (p) { return [MARK_X + p[0] * MARK_S, MARK_Y + p[1] * MARK_S]; }), NP, true));
var CIRCLE = circlePts(960, 540, 330, NP);
var TRI = polyPts([[960 - 550, 540 + 224], [960 - 3, 540 - 224], [960 + 550, 540 + 224]], NP);
var RIDGE_BIG = resample(LOGO.ridge.map(function (p) { return [MARK_X + p[0] * MARK_S, MARK_Y + p[1] * MARK_S]; }), NP, false);

/* ===================================================================== build */
function buildScenes1() {
  var st = G.stage;
  G.bg = el('div', { class: 'l', style: 'background:' + FOREST }, st);

  /* ---- morph scene: forest bg + paper shape (B) under a gold bg + forest shape (A) that an iris wipe removes ---- */
  G.mB = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, st, true);
  G.mBshape = el('path', { fill: WHITE, 'fill-rule': 'evenodd' }, G.mB, true);
  G.mA = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, st, true);
  G.mAbg = el('rect', { x: 0, y: 0, width: W, height: H, fill: GOLD }, G.mA, true);
  G.mAshape = el('path', { fill: FOREST, 'fill-rule': 'evenodd' }, G.mA, true);

  /* ---- hook / end title: the official lockup ---- */
  G.hook = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, st, true);
  G.hookCam = el('g', {}, G.hook, true);
  var defs = el('defs', {}, G.hookCam, true);
  var cpMk = el('clipPath', { id: 'cpMk' }, defs, true); G.cpMkR = el('rect', { x: 0, y: 0, width: 3337, height: 650 }, cpMk, true);
  var cpTx = el('clipPath', { id: 'cpTx' }, defs, true); el('rect', { x: 1380, y: 0, width: 1957, height: 646 }, cpTx, true);
  [[318, 156], [496, 154]].forEach(function (b, i) { var c = el('clipPath', { id: 'cpB' + (i + 1) }, defs, true); el('rect', { x: 1380, y: b[0], width: 1957, height: b[1] }, c, true); });
  G.lk = el('g', { transform: 'translate(' + LX + ',' + LY + ') scale(' + LS + ')' }, G.hookCam, true);
  var gm = el('g', { 'clip-path': 'url(#cpMk)' }, G.lk, true);
  G.mk = el('path', { d: LOGO.mark, fill: WHITE, 'fill-rule': 'evenodd' }, gm, true);
  var gt = el('g', { 'clip-path': 'url(#cpTx)' }, G.lk, true);
  G.tb0 = el('g', {}, gt, true); G.tbm = el('g', {}, gt, true);
  LET.forEach(function (l) { el('path', { d: l.d, fill: WHITE, 'fill-rule': 'evenodd' }, l.kind === 'tm' ? G.tbm : G.tb0, true); });
  G.tb1 = el('g', {}, gt, true); el('path', { d: LOGO.text, fill: WHITE, 'fill-rule': 'evenodd', 'clip-path': 'url(#cpB1)' }, G.tb1, true);
  G.tb2 = el('g', {}, gt, true); el('path', { d: LOGO.text, fill: WHITE, 'fill-rule': 'evenodd', 'clip-path': 'url(#cpB2)' }, G.tb2, true);
  G.ground = el('path', { fill: 'none', stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }, G.hookCam, true);

  /* ---- kinetic type ---- */
  G.type = el('div', { class: 'l' }, st);
  G.typeCam = el('div', { class: 'l', style: 'transform-origin:0 0' }, G.type);
  G.disc = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, G.typeCam, true);
  G.oDisc = el('circle', { cx: 0, cy: 0, r: 1, fill: GOLD }, G.disc, true);

  /* ---- the gold line: one object that is ridge, trail, chart line and ribbon ---- */
  G.lineSvg = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, style: 'z-index:50' }, st, true);
  G.lineCam = el('g', {}, G.lineSvg, true);
  G.line = el('path', { fill: 'none', stroke: GOLD, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G.lineCam, true);
}

/* kinetic type layout (measured with the real font) */
var TY = { fsBig: 270, fsSmall: 92, letters: [], o: null };
function layoutType() {
  var c = document.createElement('canvas').getContext('2d');
  var adv = function (ch, fs) { c.font = '800 ' + fs + 'px PJS'; return c.measureText(ch).width - 0.04 * fs; };
  var probe = function (fs) {
    var s = document.createElement('span'); s.className = 'tl'; s.style.cssText = 'font-size:' + fs + 'px;left:0;top:0;visibility:hidden'; s.textContent = 'H';
    var p = document.createElement('span'); p.style.cssText = 'display:inline-block;width:0;height:0'; s.appendChild(p); G.type.appendChild(s);
    var base = p.getBoundingClientRect().bottom - s.getBoundingClientRect().top; G.type.removeChild(s); return base;
  };
  var capR = c.measureText('H').actualBoundingBoxAscent;
  c.font = '800 100px PJS'; var cap100 = c.measureText('H').actualBoundingBoxAscent / 100;
  var bb = probe(TY.fsBig), bs = probe(TY.fsSmall), words = [['BEYOND', TY.fsBig, 0, WHITE], ['THE', TY.fsSmall, 0, GOLD], ['HORIZON.', TY.fsBig, 1, WHITE]];
  var wB = 0, i; 'BEYOND'.split('').forEach(function (ch) { wB += adv(ch, TY.fsBig); });
  var wT = 0; 'THE'.split('').forEach(function (ch) { wT += adv(ch, TY.fsSmall); });
  var wH = 0; 'HORIZON.'.split('').forEach(function (ch) { wH += adv(ch, TY.fsBig); });
  var gap = 46, line1W = wB + gap + wT, y1 = 470, y2 = 470 + TY.fsBig * 0.72 + 96;
  var x1 = 960 - line1W / 2 + 40, x2 = 960 - wH / 2, cursorX = x1;
  var bandTop = y2 - cap100 * TY.fsBig - 40, bandH = cap100 * TY.fsBig + 40 + 120;
  G.band2 = el('div', { style: 'position:absolute;left:0;top:' + bandTop + 'px;width:1920px;height:' + bandH + 'px;overflow:hidden' }, G.typeCam);
  TY.bandH = bandH;
  var mk = function (ch, fs, x, base, baseOff, color, wordIdx, li) {
    var inBand = wordIdx === 2, par = inBand ? G.band2 : G.typeCam, off = inBand ? bandTop : 0;
    var s = el('span', { class: 'tl ltr', text: ch, style: 'font-size:' + fs + 'px;color:' + color + ';left:' + x + 'px;top:' + (base - baseOff - off) + 'px' }, par);
    var a = adv(ch, fs), capH = cap100 * fs;
    s.style.transformOrigin = (a / 2) + 'px ' + (baseOff - capH / 2) + 'px';
    return { el: s, x: x, adv: a, cx: x + a / 2, cy: base - capH / 2, baseY: base, fs: fs, capH: capH, word: wordIdx, i: li };
  };
  'BEYOND'.split('').forEach(function (ch, k) { var L = mk(ch, TY.fsBig, cursorX, y1, bb, WHITE, 0, k); TY.letters.push(L); cursorX += L.adv; });
  cursorX += gap; 'THE'.split('').forEach(function (ch, k) { var L = mk(ch, TY.fsSmall, cursorX, y1, bs, GOLD, 1, k); TY.letters.push(L); cursorX += L.adv; });
  cursorX = x2; 'HORIZON.'.split('').forEach(function (ch, k) { var L = mk(ch, TY.fsBig, cursorX, y2, bb, WHITE, 2, k); TY.letters.push(L); cursorX += L.adv; });
  /* the portal: the counter of the first O in HORIZON.  Find its radius by scanning the rasterised glyph. */
  var O = TY.letters.filter(function (l) { return l.word === 2 && l.i === 1; })[0], fs = TY.fsBig, cv = document.createElement('canvas'); cv.width = 600; cv.height = 600;
  var cx = cv.getContext('2d'); cx.fillStyle = '#000'; cx.font = '800 ' + fs + 'px PJS'; cx.textBaseline = 'alphabetic'; cx.fillText('O', 150, 450);
  var d = cx.getImageData(0, 0, 600, 600).data, solid = function (x, y) { return d[(Math.round(y) * 600 + Math.round(x)) * 4 + 3] > 128; };
  var ocx = 150 + adv('O', fs) / 2 + 0.02 * fs, ocy = 450 - cap100 * fs / 2, r = 0;
  while (r < 200 && !solid(ocx + r, ocy) && !solid(ocx - r, ocy) && !solid(ocx, ocy + r) && !solid(ocx, ocy - r)) r++;
  TY.o = { cx: O.cx + (ocx - (150 + adv('O', fs) / 2)), cy: O.cy + (ocy - (450 - cap100 * fs / 2)), r: r - 2, letter: O };
}

/* ===================================================================== the gold line */
function lineState(t) {
  /* returns {pts, w, gap, off, closed} */
  var s = { pts: RIDGE, w: 0, gap: 0, off: 0, closed: false };
  if (t < 0.5) return s;
  if (t < 1.0) { s.pts = headOf(RIDGE, expo((t - 0.5) / 0.38)); s.w = 7; return s; }
  if (t < 2.75) {                                                           /* ridge -> dotted trail */
    var k = expo((t - 1.0) / 0.55);
    s.pts = morphPts(RIDGE, TRAIL, k); s.gap = lerp(0.2, 27, k); s.w = 8 * (1 - expo((t - 2.15) / 0.55)) + 0.01;
    s.off = -(t - 1.0) * 160; return s;
  }
  if (t < 5.5) return s;
  if (t < 10.72) return lineScene45(t, s) || s;
  if (t < 11.35) { var y = 1100 - 1120 * expoIO(prog(t, 10.72, 11.25)); s.pts = [[-60, y], [1980, y]]; s.w = 8; return s; }
  if (t < 12.0) return s;
  if (t < 13.4) { s.pts = headOf(TRAIL, expo(prog(t, 12.0, 12.45))); s.w = 8; s.gap = 27; s.off = -(t - 12.0) * 160; return s; }
  if (t < 13.95) { var m = expo(prog(t, 13.4, 13.95)); s.pts = morphPts(TRAIL, RIDGE, m); s.gap = lerp(27, 0.2, m); s.w = lerp(8, 7, m); s.off = -(t - 12.0) * 160 * (1 - m); return s; }
  s.pts = RIDGE; s.w = 7 * (1 - expo(prog(t, 14.3, 14.7)));
  return s;
}

/* ===================================================================== scenes 1-3 */
function camA(t) {                                                          /* hook + type: one forward dolly, then the push through the O (centre + zoom) */
  var z = 1 + 0.04 * smooth(t / 2) + 0.07 * smooth((t - 2) / 1.5), cx = 960, cy = 540;
  if (t > 3.4) {
    var o = TY.o, u = prog(t, 3.4, 4.0), k = expoIO(u), zEnd = 1.15 * 1100 / o.r;
    z = zoomExp(k, 1.11, zEnd); cx = lerp(960, o.cx, smooth(clamp(k * 1.15))); cy = lerp(540, o.cy, smooth(clamp(k * 1.15)));
  }
  return { z: z, cx: cx, cy: cy };
}
var CAM0 = { z: 1, cx: 960, cy: 540 };
function camStr(c) { return 'translate(960,540) scale(' + c.z.toFixed(5) + ') translate(' + (-c.cx).toFixed(2) + ',' + (-c.cy).toFixed(2) + ')'; }
function applyCamTo(elm, c) { elm.style.transform = camStr(c).replace(/\(960,540\)/, '(960px,540px)').replace(/translate\((-?[\d.]+),(-?[\d.]+)\)/g, 'translate($1px,$2px)'); }
function applyCamSvg(g, c) { g.setAttribute('transform', camStr(c)); }

function sceneHook(t) {
  var on = t < 2.6 || t >= 13.4;
  vis(G.hook, on); if (!on) return;
  /* end-title assembly (14.0-15.0) is the hook run backwards; both share the lockup parts */
  var h = hookParams(t);
  G.cpMkR.setAttribute('y', h.cut.toFixed(1)); G.cpMkR.setAttribute('height', (650 - h.cut).toFixed(1));
  G.tb0.setAttribute('transform', 'translate(0,' + h.d0.toFixed(1) + ')'); G.tbm.setAttribute('transform', 'translate(0,' + h.dm.toFixed(1) + ')');
  vis(G.tb0, t < 2.6 || t >= 13.9);
  G.tb1.setAttribute('transform', 'translate(0,' + h.d1.toFixed(1) + ')');
  G.tb2.setAttribute('transform', 'translate(0,' + h.d2.toFixed(1) + ')');
  var gy = lk(0, 646)[1], half = h.ground * 1100;
  G.ground.setAttribute('d', half < 0.5 ? 'M960 ' + gy + 'L960 ' + gy : 'M' + (960 - half) + ' ' + gy + 'L' + (960 + half) + ' ' + gy);
  G.ground.setAttribute('stroke-width', (6 * Math.min(1, h.ground * 6)).toFixed(2));
}
/* the lockup's pieces as functions of time: canonical state at t=0 and t=15 */
function hookParams(t) {
  var p = { cut: 0, d0: 0, dm: 0, d1: 0, d2: 0, ground: 0 };
  if (t < 2.6) {
    p.d2 = expo((t - 0.0) / 0.26) * 160; p.d1 = expo((t - 0.1) / 0.30) * 330; p.d0 = expo((t - 0.2) / 0.34) * 610; p.dm = expo((t - 0.26) / 0.34) * 640;
    p.cut = expo((t - 0.55) / 0.4) * 646;
    p.ground = expo(t / 0.5) * (1 - expo((t - 1.0) / 0.35));
  } else {                                                                  /* end title */
    var e = t - 14.0;
    p.ground = expo((t - 13.4) / 0.4) * (1 - expo((t - 14.1) / 0.35));
    p.cut = 646 * (1 - expo((e - 0.0) / 0.45));
    p.d0 = 0; p.dm = 640 * (1 - expo((e - 0.05) / 0.3)); p.d1 = 330 * (1 - expo((e - 0.18) / 0.35)); p.d2 = 160 * (1 - expo((e - 0.32) / 0.33));
    if (t < 14.0) { p.cut = 646; p.dm = 640; p.d1 = 330; p.d2 = 160; }
  }
  return p;
}

function sceneType(t) {
  var on = t >= 1.7 && t < 4.1;
  vis(G.type, on); if (!on) return;
  var c = camA(t); applyCamTo(G.typeCam, c);
  var L = TY.letters, i;
  /* BEYOND: letters grow out of the trail dots, ride the trail, then straighten into the word */
  var trail = TRAIL, nB = 6, shift = 150 * (1 - clamp(sp(t, 3.0, 15, 0.86), 0, 1.04));
  for (i = 0; i < L.length; i++) {
    var l = L[i], e = l.el, tr = '', op = 1;
    if (l.word === 0) {
      var t0 = 1.78 + 0.045 * l.i, f = 0.14 + 0.135 * l.i, P = pointAt(trail, f);
      var grow = sp(t, t0, 20, 0.8), glide = expo((t - t0 - 0.12) / 0.42);
      var px = lerp(P.x, l.cx, glide), py = lerp(P.y, l.cy, glide), ang = (P.a + Math.PI * 0) * (1 - glide);
      tr = 'translate(' + (px - l.cx).toFixed(2) + 'px,' + (py - l.cy + shift * glide).toFixed(2) + 'px) rotate(' + (ang * 57.2958 * 0.5).toFixed(2) + 'deg) scale(' + clamp(grow, 0, 1.06).toFixed(4) + ')';
      op = t >= t0 ? 1 : 0;
    } else if (l.word === 1) {                                              /* THE: slams in on b5 */
      var tt = 2.5 + 0.04 * l.i, s1 = sp(t, tt, 22, 0.78), rise = 1 - clamp(s1, 0, 1.05);
      tr = 'translate(' + (-90 * rise).toFixed(2) + 'px,' + (-150 * rise + shift).toFixed(2) + 'px) scale(' + (1 + 1.6 * rise).toFixed(4) + ')'; op = t >= tt ? 1 : 0;
    } else {                                                                /* HORIZON.: alternate letters enter from below / above, b6 */
      var ts = 3.0 + 0.04 * l.i, s2 = sp(t, ts, 20, 0.8), dir = l.i % 2 ? -1 : 1, r2 = 1 - clamp(s2, 0, 1.04);
      tr = 'translate(0,' + (dir * (TY.bandH + 20) * r2).toFixed(2) + 'px) rotate(' + (dir * -9 * r2).toFixed(2) + 'deg)'; op = t >= ts ? 1 : 0;
    }
    e.style.transform = tr; e.style.visibility = op ? 'inherit' : 'hidden';
  }
  /* mask the HORIZON line so letters rise out of and drop into its band */
  /* the O's counter fills with the gold sun just before the push-through */
  var o = TY.o, gd = sp(t, 3.3, 14, 0.9);
  G.oDisc.setAttribute('cx', o.cx.toFixed(1)); G.oDisc.setAttribute('cy', o.cy.toFixed(1)); G.oDisc.setAttribute('r', ((o.r + 4) * clamp(gd, 0, 1.04) + 0.01).toFixed(2));
  G.oDisc.style.visibility = t >= 3.3 ? 'inherit' : 'hidden';
}

function sceneMorph(t) {
  var on = t >= 3.85 && t < 6.2;
  vis(G.mA, on); vis(G.mB, on); if (!on) return;
  /* iris: gold/forest phase (A) is removed by an expanding circle revealing forest/paper (B) */
  var ir = cd((t - 5.5) / 0.5, 0.5) * 1500, cx = 960, cy = 540;
  G.mA.style.webkitMaskImage = G.mA.style.maskImage = ir < 1 ? 'none' : 'radial-gradient(circle at ' + cx + 'px ' + cy + 'px, transparent ' + ir.toFixed(1) + 'px, #000 ' + (ir + 1).toFixed(1) + 'px)';
  var pts;
  if (t < 4.5) { var g0 = sp(t, 4.0, 14, 0.86); pts = morphPts(circlePts(960, 540, 1, NP), CIRCLE, clamp(g0, 0, 1.03)); }
  else if (t < 5.0) pts = morphPts(CIRCLE, TRI, expoIO(prog(t, 4.5, 4.95)));
  else pts = morphPts(TRI, MARK_BIG, expoIO(prog(t, 5.0, 5.48)));
  var d = ptsToD(pts, true);
  G.mAshape.setAttribute('d', d); G.mBshape.setAttribute('d', d);
}
