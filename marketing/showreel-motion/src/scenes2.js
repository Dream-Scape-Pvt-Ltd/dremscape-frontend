/* ===================================================================== 3D helpers */
var PERSP = 1700;
function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mixHex(a, b, k) { var A = hex2rgb(a), B = hex2rgb(b); return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(lerp(A[i], B[i], clamp(k))); }).join(',') + ')'; }
/* C1-smooth interpolation through [time, value] keys (Catmull-Rom), clamped at the ends */
function curve(t, K) {
  if (t <= K[0][0]) return K[0][1]; if (t >= K[K.length - 1][0]) return K[K.length - 1][1];
  var i = 0; while (t > K[i + 1][0]) i++;
  var p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(K.length - 1, i + 2)], u = (t - p1[0]) / (p2[0] - p1[0]);
  var m1 = (p2[1] - p0[1]) / ((p2[0] - p0[0]) || 1) * (p2[0] - p1[0]), m2 = (p3[1] - p1[1]) / ((p3[0] - p1[0]) || 1) * (p2[0] - p1[0]);
  var u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
}
/* one camera matrix for every 3D element (origin = stage centre): perspective, dolly, tilt, orbit */
function cam3(c) { return 'perspective(' + PERSP + 'px) translateZ(' + c.dz.toFixed(1) + 'px) rotateX(' + c.rx.toFixed(3) + 'deg) rotateY(' + c.ry.toFixed(3) + 'deg)'; }
var FRAME_PTS = polyPts([[-140, -140], [2060, -140], [2060, 1220], [-140, 1220]], NP);
var CARD = { x: 240, y: 150, w: 1440, h: 780, r: 44 };
var CARD_PTS = roundRectPts(CARD.x, CARD.y, CARD.w, CARD.h, CARD.r, NP);
function clipPoly(pts) { var s = 'polygon('; for (var i = 0; i < pts.length; i++) s += (i ? ',' : '') + pts[i][0].toFixed(1) + 'px ' + pts[i][1].toFixed(1) + 'px'; return s + ')'; }

/* ===================================================================== build: scene 4 (2D -> 3D) */
var NSL = 14, MARK_H = 645 * MARK_S;
function buildScene4() {
  var st = G.stage;
  G.d3 = el('div', { class: 'l' }, st);
  G.slices = [];
  for (var k = NSL - 1; k >= 0; k--) {
    var svg = el('svg', { width: MARK_W, height: MARK_H, viewBox: '2 1 1584 645', style: 'position:absolute;left:' + (960 - MARK_W / 2) + 'px;top:' + (540 - MARK_H / 2) + 'px;transform-origin:50% 50%' }, G.d3, true);
    el('path', { d: LOGO.mark, fill: k === 0 ? WHITE : mixHex(MIST, '#0c2b20', (k - 1) / (NSL - 2)), 'fill-rule': 'evenodd' }, svg, true);
    if (k === 0) G.sliceRidge = el('path', { d: 'M' + LOGO.ridge.map(function (p) { return p[0] + ' ' + p[1]; }).join('L'), fill: 'none', stroke: GOLD, 'stroke-width': 17, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg, true);
    G.slices[k] = svg;
  }
  /* shadowbox: the real Dreamscape landscape (8 depth layers) seen through a flat window shaped like the mark */
  G.win = el('div', { class: 'l' }, st);
  var names = ['sky', 'sun', 'far', 'peak', 'massif', 'ridge', 'mist', 'hill', 'temple', 'foreground'];
  G.art = [];
  names.forEach(function (n, i) {
    var svg = el('svg', { width: 4095, height: 1624, viewBox: '0 0 4095 1624', style: 'position:absolute;left:0;top:0;transform-origin:50% 50%' }, G.win, true);
    if (n === 'sky') el('rect', { x: -3000, y: -3000, width: 10100, height: 7600, fill: WHITE }, svg, true);
    else if (n === 'sun') el('circle', { cx: 2900, cy: 380, r: 175, fill: GOLD }, svg, true);
    else svg.innerHTML = LAND.layers.filter(function (l) { return l.name === n; })[0].paths;
    G.art.push({ svg: svg, depth: names.length - 1 - i });
  });
}
function cam4(t) {
  return { dz: curve(t, [[5.9, 0], [6.6, 40], [7.0, 90], [8.0, 330]]), rx: curve(t, [[5.9, 0], [6.5, 9], [7.0, 0], [7.5, -3], [8.0, -4]]),
           ry: curve(t, [[5.9, 0], [6.1, -4], [6.6, -40], [6.85, -20], [7.0, 0], [7.5, 15], [8.0, 25]]) };
}
function scene4(t) {
  var on = t >= 5.9 && t < 9.05;
  vis(G.d3, on && t < 7.02); vis(G.win, t >= 7.0 && t < 9.05);
  if (!on && !(t >= 8.5 && t < 9.05)) return;
  var c = cam4(t), head = cam3(c);
  if (t < 7.02) {
    var D = 240 * clamp(sp(t, 6.0, 12, 0.82), 0, 1.04) * (1 - smooth(prog(t, 6.82, 7.0)));
    for (var k = 0; k < NSL; k++) G.slices[k].style.transform = head + ' translateZ(' + ((-k / (NSL - 1)) * D + D / 2).toFixed(1) + 'px)';
    G.sliceRidge.setAttribute('stroke-dasharray', 'none');
  }
  if (t >= 7.0) {
    var g = 118 * clamp(sp(t, 7.05, 9, 0.86), 0, 1.05), e = expoIO(prog(t, 7.45, 8.0)), as = lerp(1100 / 4095, 1080 / 1624, e);
    for (var i = 0; i < G.art.length; i++) {
      var a = G.art[i], z = -a.depth * g, comp = 1 + (-z) / PERSP;
      a.svg.setAttribute('width', (4095 * as).toFixed(1)); a.svg.setAttribute('height', (1624 * as).toFixed(1));
      a.svg.style.left = (960 - 1900 * as).toFixed(1) + 'px'; a.svg.style.top = (540 - 812 * as).toFixed(1) + 'px';
      a.svg.style.transformOrigin = (1900 * as).toFixed(1) + 'px ' + (812 * as).toFixed(1) + 'px';
      var rs = i === 0 ? 1 : clamp(sp(t, 7.0 + 0.045 * i, 13, 0.92), 0, 1.04), dy = (1 - rs) * 780;      /* the diorama builds itself: each layer rises into the mark's silhouette, sky first */
      a.svg.style.transform = head + ' translate3d(0,' + dy.toFixed(1) + 'px,' + z.toFixed(1) + 'px) scale(' + comp.toFixed(4) + ')';
    }
    G.win.style.clipPath = clipPoly(windowPts(t));
  }
}
