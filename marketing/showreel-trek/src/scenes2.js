/* ===================================================================== helpers: curves + 3D camera */
var P3 = 1700;
function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mixHex(a, b, k) { var A = hex2rgb(a), B = hex2rgb(b); return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(lerp(A[i], B[i], clamp(k))); }).join(',') + ')'; }
function curve(t, K) {                                                       /* C1 Catmull-Rom through [time, value] keys */
  if (t <= K[0][0]) return K[0][1]; if (t >= K[K.length - 1][0]) return K[K.length - 1][1];
  var i = 0; while (t > K[i + 1][0]) i++;
  var p0 = K[Math.max(0, i - 1)], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(K.length - 1, i + 2)], u = (t - p1[0]) / (p2[0] - p1[0]);
  var m1 = (p2[1] - p0[1]) / ((p2[0] - p0[0]) || 1) * (p2[0] - p1[0]), m2 = (p3[1] - p1[1]) / ((p3[0] - p1[0]) || 1) * (p2[0] - p1[0]);
  var u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
}
var PIV = [960, 760];                                                       /* transform-origin of the 3D slab = perspective vanishing point */
function head3(c) { return 'perspective(' + P3 + 'px) translateY(' + c.cy.toFixed(1) + 'px) translateZ(' + c.dz.toFixed(1) + 'px) rotateX(' + c.rx.toFixed(3) + 'deg) rotateY(' + c.ry.toFixed(3) + 'deg)'; }
/* the same camera applied to a point (relative to PIV): returns screen x, y and the perspective scale */
function proj(p, c) {
  var rx = c.rx * Math.PI / 180, ry = c.ry * Math.PI / 180, x = p[0], y = p[1], z = p[2], t;
  t = x * Math.cos(ry) + z * Math.sin(ry); z = -x * Math.sin(ry) + z * Math.cos(ry); x = t;
  t = y * Math.cos(rx) - z * Math.sin(rx); z = y * Math.sin(rx) + z * Math.cos(rx); y = t;
  z += c.dz; y += c.cy; var k = 1 / (1 - z / P3);
  return { x: PIV[0] + x * k, y: PIV[1] + y * k, k: k };
}
function cam3(t) {
  return { dz: curve(t, [[3.9, 0], [4.4, 30], [5.0, 110], [5.5, 150], [6.0, 0]]), rx: curve(t, [[3.9, 0], [4.4, 0], [4.8, 13], [5.3, 17], [5.7, 6], [6.0, 0]]),
           ry: curve(t, [[3.9, 0], [4.3, 0], [4.8, -36], [5.3, -30], [5.7, -9], [6.0, 0]]), cy: curve(t, [[4.3, 0], [5.1, 90], [5.6, 40], [6.0, 0]]) };
}

/* ===================================================================== build: the stairs in 3D (bar 3) */
var NS3 = 18, SC3 = 0.75, D3 = 380;
var STAIR = (function () {
  var o = [[0, 1160]], w = ST.w;
  for (var i = 0; i < ST.n; i++) { o.push([w * i, ST.tops[i]]); o.push([w * (i + 1), ST.tops[i]]); }
  o.push([w * ST.n, 1160]); return o;
})();
var STAIR_D = 'M' + STAIR.map(function (p) { return p[0] + ' ' + p[1]; }).join('L') + 'Z';
function buildScene3() {
  var st = G.stage;
  G.d3 = el('div', { class: 'l' }, st);
  G.sl = [];
  for (var k = NS3 - 1; k >= 0; k--) {
    var svg = el('svg', { class: 'l', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, style: 'transform-origin:' + PIV[0] + 'px ' + PIV[1] + 'px' }, G.d3, true);
    if (k === 0) {
      var defs = el('defs', {}, svg, true), cp = el('clipPath', { id: 'stairClip' }, defs, true);
      el('path', { d: STAIR_D }, cp, true);
      el('path', { d: STAIR_D, fill: '#10302a' }, svg, true);               /* below the photo's bottom edge */
      el('image', { href: IM.poster, x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none', 'clip-path': 'url(#stairClip)' }, svg, true);
    } else el('path', { d: STAIR_D, fill: mixHex('#8fb5a4', '#0b2a1f', Math.pow((k - 1) / (NS3 - 2), 0.75)) }, svg, true);
    G.sl[k] = svg;
  }
}
function d3Of(t) { return D3 * clamp(sp(t, 3.95, 12, 0.85), 0, 1.04) * (1 - smooth(prog(t, 5.55, 5.95))); }
function sc3Of(t) { return lerp(1, SC3, expo(prog(t, 3.95, 4.5))); }
function scene3(t) {
  var on = t >= 3.9 && t < 6.0;
  vis(G.d3, on); if (!on) return;
  var c = cam3(t), head = head3(c), D = d3Of(t), sc = sc3Of(t);
  for (var k = 0; k < NS3; k++) G.sl[k].style.transform = head + ' translateZ(' + (-k / (NS3 - 1) * D + D / 2).toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
}
/* the dot rides the top tread of the stairs and hops back along it, one hop a beat (bar 3) */
function dotOn3D(t) {
  var c = cam3(t), D = d3Of(t), sc = sc3Of(t), f = 0, arc = 0;
  var hops = [[4.5, 0, 1 / 3], [5.0, 1 / 3, 2 / 3], [5.5, 2 / 3, 1]];
  for (var i = 0; i < hops.length; i++) if (t >= hops[i][0]) { var u = clamp((t - hops[i][0]) / HOP); f = lerp(hops[i][1], hops[i][2], expo(u)); arc = 70 * Math.sin(Math.PI * smooth(u)); }
  var xs = (stepX(ST.n - 1) - PIV[0]) * sc, ys = (ST.tops[ST.n - 1] - PIV[1]) * sc - DOT / 2 - arc, zs = -f * D + D / 2;
  var q = proj([xs, ys, zs], c);
  return { cx: q.x, cy: q.y, w: DOT * q.k, h: DOT * q.k };
}
