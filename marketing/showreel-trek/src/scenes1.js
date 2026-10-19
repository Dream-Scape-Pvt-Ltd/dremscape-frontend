/* ===================================================================== assets + layout */
var IM = window.IMG, LOGO = window.LOGO, LET = window.LETTERS;
var G = { stage: document.getElementById('stage') };
var NP = 260;
var LKS = 0.30, LKX = 96, LKY = 84;                                         /* the official lockup, top-left of the poster (and of the final frame) */
var lk = function (x, y) { return [LKX + x * LKS, LKY + y * LKS]; };
var PILL = { x: 96, y: 902, w: 480, h: 92 };                                 /* "Plan my journey" pill, bottom-left of the poster */
var DOT = 44;                                                               /* the trekker */
var ST = { n: 4, w: 480, tops: [900, 700, 500, 300], gap: 16 };        /* the staircase the poster steps down into */
var stepX = function (i) { return ST.w * i + ST.w / 2; };
var stepY = function (i) { return ST.tops[i] - DOT / 2; };

/* ===================================================================== build */
function buildScenes1() {
  var st = G.stage;
  G.bg = el('div', { class: 'l', style: 'background:' + FOREST }, st);

  /* poster photo (whole) and its five columns */
  G.poster = el('img', { src: IM.poster, class: 'l', style: 'width:1920px;height:1080px' }, st);
  G.cols = [];
  for (var i = 0; i < ST.n; i++) {
    var c = el('div', { style: 'position:absolute;overflow:hidden' }, st);
    c.img = el('img', { src: IM.poster, style: 'position:absolute;width:1920px;height:1080px' }, c);
    G.cols.push(c);
  }

  /* the lockup (hook / end title) */
  G.hook = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, st, true);
  var defs = el('defs', {}, G.hook, true);
  var cpMk = el('clipPath', { id: 'cpMk' }, defs, true); G.cpMkR = el('rect', { x: 0, y: 0, width: 3337, height: 650 }, cpMk, true);
  var cpTx = el('clipPath', { id: 'cpTx' }, defs, true); el('rect', { x: 1380, y: 0, width: 1957, height: 646 }, cpTx, true);
  [[318, 156], [496, 154]].forEach(function (b, i) { var cc = el('clipPath', { id: 'cpB' + (i + 1) }, defs, true); el('rect', { x: 1380, y: b[0], width: 1957, height: b[1] }, cc, true); });
  G.lk = el('g', { transform: 'translate(' + LKX + ',' + LKY + ') scale(' + LKS + ')' }, G.hook, true);
  var gm = el('g', { 'clip-path': 'url(#cpMk)' }, G.lk, true);
  G.mk = el('path', { d: LOGO.mark, fill: WHITE, 'fill-rule': 'evenodd' }, gm, true);
  var gt = el('g', { 'clip-path': 'url(#cpTx)' }, G.lk, true);
  G.tb0 = el('g', {}, gt, true); G.tbm = el('g', {}, gt, true);
  LET.forEach(function (l) { el('path', { d: l.d, fill: WHITE, 'fill-rule': 'evenodd' }, l.kind === 'tm' ? G.tbm : G.tb0, true); });
  G.tb1 = el('g', {}, gt, true); el('path', { d: LOGO.text, fill: WHITE, 'fill-rule': 'evenodd', 'clip-path': 'url(#cpB1)' }, G.tb1, true);
  G.tb2 = el('g', {}, gt, true); el('path', { d: LOGO.text, fill: WHITE, 'fill-rule': 'evenodd', 'clip-path': 'url(#cpB2)' }, G.tb2, true);

  /* kinetic type, sits behind the stairs */
  G.type = el('div', { class: 'l' }, st);

  /* the stairs (flat: the poster columns above; 3D and chart bars live in scenes2/3) */
  G.dot = el('div', { style: 'position:absolute;left:0;top:0;background:' + GOLD + ';display:flex;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap;color:' + FOREST + ';z-index:80' }, st);
  G.dotTxt = el('div', { class: 'tl', style: 'position:relative;font-size:34px;letter-spacing:-.02em;display:flex;align-items:center;gap:16px;flex:none' }, G.dot);
  el('span', { text: 'Plan my journey' }, G.dotTxt);
  var arrow = el('svg', { width: 34, height: 26, viewBox: '0 0 34 26', style: 'flex:none' }, G.dotTxt, true);
  el('path', { d: 'M1 13h30M20 3l11 10-11 10', fill: 'none', stroke: FOREST, 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow, true);
}

/* ===================================================================== kinetic type */
var TYPE = { fs: 124, x: 80, lines: [['Nepal treks,', 330], ['shaped', 500], ['around you.', 670]], letters: [], bands: [] };
function layoutType() {
  var c = document.createElement('canvas').getContext('2d'), fs = TYPE.fs; c.font = '800 ' + fs + 'px PJS';
  var adv = function (ch) { return c.measureText(ch).width - 0.03 * fs + (ch === ' ' ? 0.14 * fs : 0); };
  c.font = '800 100px PJS'; var cap100 = c.measureText('H').actualBoundingBoxAscent / 100;
  var probe = document.createElement('span'); probe.className = 'tl'; probe.style.cssText = 'font-size:' + fs + 'px;left:0;top:0;visibility:hidden'; probe.textContent = 'H';
  var pp = document.createElement('span'); pp.style.cssText = 'display:inline-block;width:0;height:0'; probe.appendChild(pp); G.type.appendChild(probe);
  var bb = pp.getBoundingClientRect().bottom - probe.getBoundingClientRect().top; G.type.removeChild(probe);
  TYPE.cap = cap100 * fs;
  TYPE.lines.forEach(function (ln, li) {
    var base = ln[1], bandTop = base - TYPE.cap - 34, bandH = TYPE.cap + 34 + 58;
    var band = el('div', { style: 'position:absolute;left:0;top:' + bandTop + 'px;width:1920px;height:' + bandH + 'px;overflow:hidden' }, G.type);
    TYPE.bands.push({ el: band, h: bandH, top: bandTop });
    var x = TYPE.x;
    ln[0].split('').forEach(function (ch, k) {
      var a = adv(ch), s = el('span', { class: 'tl', text: ch, style: 'font-size:' + fs + 'px;color:' + WHITE + ';left:' + x + 'px;top:' + (base - bb - bandTop) + 'px' }, band);
      TYPE.letters.push({ el: s, line: li, i: k, x: x, adv: a, base: base, last: k === ln[0].length - 1 });
      x += a;
    });
    ln.push(x);                                                              /* right edge of the line */
  });
}

/* ===================================================================== the dot: pill -> dot -> hops */
function hopTo(t, t0, dur, A, B, arc) {                                      /* parabolic hop between two points with an exponential launch */
  var u = clamp((t - t0) / dur), e = expo(u) , x = lerp(A[0], B[0], e), y = lerp(A[1], B[1], smooth(u)) - arc * Math.sin(Math.PI * smooth(u));
  return [x, y];
}
var HOP = 0.36;
function dotState(t) {
  if (t >= 13.5) return endDot(t);
  var s = { cx: 0, cy: 0, w: DOT, h: DOT, txt: 0, on: true };
  var P0 = [PILL.x + DOT / 2 + 0, PILL.y + PILL.h / 2];
  if (t < 0.5) { s.w = PILL.w; s.h = PILL.h; s.cx = PILL.x + s.w / 2; s.cy = PILL.y + PILL.h / 2; s.txt = 1; return s; }
  if (t < 1.0) {                                                           /* collapse to a circle, then to the dot */
    var c1 = expo((t - 0.5) / 0.34), c2 = expo((t - 0.84) / 0.2);
    s.h = lerp(PILL.h, DOT, c2); s.w = lerp(lerp(PILL.w, PILL.h, c1), DOT, c2);
    s.cx = PILL.x + s.w / 2 + (PILL.h - s.h) / 2 * 0; s.cy = PILL.y + PILL.h / 2; s.txt = 1 - clamp(c1 * 1.6); return s;
  }
  var way = [[0, PILL.x + DOT / 2, PILL.y + PILL.h / 2], [1.0, stepX(0), stepY(0)], [1.5, stepX(1), stepY(1)], [2.0, stepX(2), stepY(2)], [2.5, stepX(3), stepY(3)], [3.0, stepX(3), stepY(3)], [3.5, stepX(3), stepY(3)]];
  for (var i = way.length - 1; i >= 1; i--) if (t >= way[i][0] && t < 3.9) {
    var p = hopTo(t, way[i][0], HOP, [way[i - 1][1], way[i - 1][2]], [way[i][1], way[i][2]], i === 1 ? 50 : (i >= 5 ? 56 : 110)); s.cx = p[0]; s.cy = p[1]; return s;
  }
  if (t >= 3.9 && t < 6.0) { var q = dotOn3D(t); s.cx = q.cx; s.cy = q.cy; s.w = q.w; s.h = q.h; return s; }
  if (t >= 6.0 && t < 8.6) { var q2 = dotOnChart(t); s.cx = q2.x === undefined ? q2[0] : q2.x; s.cy = q2[1]; return s; }
  s.on = false; return s;
  return s;
}

/* ===================================================================== poster, columns, lockup, type: bars 1-2 */
function hookParams(t) {                                                    /* the lockup comes apart (and, run backwards, comes together) */
  var p = { cut: 0, d0: 0, dm: 0, d1: 0, d2: 0 };
  if (t >= 13.4) {
    var f = t - 14.05;
    p.cut = 646 * (1 - expo(f / 0.45)); p.dm = 640 * (1 - expo((f - 0.05) / 0.3)); p.d1 = 330 * (1 - expo((f - 0.18) / 0.35)); p.d2 = 160 * (1 - expo((f - 0.32) / 0.33));
    if (t < 14.05) { p.cut = 646; p.dm = 640; p.d1 = 330; p.d2 = 160; }
    return p;
  }
  var e = t - 0.3;
  p.d2 = expo(e / 0.26) * 160; p.d1 = expo((e - 0.1) / 0.30) * 330; p.d0 = expo((e - 0.2) / 0.34) * 610; p.dm = expo((e - 0.26) / 0.34) * 640;
  p.cut = expo((e - 0.25) / 0.4) * 646;
  return p;
}
function sceneA(t) {
  var on = t < 4.2;
  vis(G.poster, t < 1.0); vis(G.hook, t < 1.3 || t >= 13.4);
  vis(G.type, t >= 1.9 && t < 4.6);
  /* columns */
  var split = t >= 1.0 && t < 3.9;
  G.cols.forEach(function (c, i) {
    vis(c, split); if (!split) return;
    var open = expo((t - 1.0) / 0.3), gap = ST.gap * open * (1 - expo((t - 3.55) / 0.3));
    var d = expo((t - 1.02 - 0.05 * i) / 0.38), top = lerp(0, ST.tops[i], d);
    var left = ST.w * i + gap / 2, w = ST.w - gap;
    c.style.left = left + 'px'; c.style.width = w + 'px'; c.style.top = top + 'px'; c.style.height = (H - top + 60) + 'px';
    c.img.style.left = (-left) + 'px'; c.img.style.top = (-top) + 'px';
  });
  /* lockup */
  var h = hookParams(t);
  G.cpMkR.setAttribute('y', h.cut.toFixed(1)); G.cpMkR.setAttribute('height', (650 - h.cut).toFixed(1));
  vis(G.tb0, t < 1.3 || t >= 13.9);
  G.tb0.setAttribute('transform', 'translate(0,' + h.d0.toFixed(1) + ')'); G.tbm.setAttribute('transform', 'translate(0,' + h.dm.toFixed(1) + ')');
  G.tb1.setAttribute('transform', 'translate(0,' + h.d1.toFixed(1) + ')'); G.tb2.setAttribute('transform', 'translate(0,' + h.d2.toFixed(1) + ')');
  /* type */
  if (t >= 1.9 && t < 4.6) {
    var L = TYPE.letters, i;
    var out = expoIn(prog(t, 4.0, 4.55)) * 1250;
    for (i = 0; i < L.length; i++) {
      var l = L[i], t0 = 2.0 + 0.5 * l.line + 0.028 * l.i, u = clamp(sp(t, t0, 18, 0.88), 0, 1.04);
      l.el.style.transform = 'translateY(' + ((1 - u) * (TYPE.bands[l.line].h + 10) + out).toFixed(1) + 'px)';
      l.el.style.visibility = t >= t0 ? 'inherit' : 'hidden';
      var gold = l.line === 2 && t >= 3.5 + 0.03 * l.i;                    /* "around you." turns gold on the last beat of the bar */
      l.el.style.color = gold ? GOLD : WHITE;
    }
  }
}
