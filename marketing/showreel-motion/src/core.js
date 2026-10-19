/* ONE TRAIL — Dreamscape Treks motion showreel.  window.seek(t) draws every frame from time alone. */
var W = 1920, H = 1080, DUR = 15, DT = 1 / 180;
var FOREST = '#153d2f', GOLD = '#e4c98a', MIST = '#b9cfc5', BLACK = '#06140e', WHITE = '#f9faf8';

/* ------------------------------------------------------------------ math */
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, k) { return a + (b - a) * k; };
var prog = function (t, a, b) { return clamp((t - a) / (b - a)); };
var E1 = 1 - Math.pow(2, -10);
/* exponential ease-out with a smooth launch (finite initial speed): reads as snappy yet survives sub-frame blending */
var expo = function (u) { u = clamp(u); var v = u * u * (3 - 2 * u); return (1 - Math.pow(2, -10 * v)) / E1; };
var expoIn = function (u) { u = clamp(u); return (Math.pow(2, 10 * u) - 1) / (Math.pow(2, 10) - 1); };
var expoIO = function (u) { u = clamp(u); return u < 0.5 ? expoIn(u * 2) / 2 : 0.5 + expo((u - 0.5) * 2) / 2; };
/* critically damped step over [0,d] normalised to land on 1 */
var cd = function (u, d) { u = clamp(u); var w = 6.5 / d, t = u * d, f = function (x) { return 1 - Math.exp(-w * x) * (1 + w * x); }; return f(t) / f(d); };
/* damped spring step response, small overshoot */
function spring(t, w, z) {
  if (t <= 0) return 0; w = w || 24; z = z === undefined ? 0.78 : z;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  var a = z * w, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-a * t) * (Math.cos(wd * t) + (a / wd) * Math.sin(wd * t));
}
var sp = function (t, t0, w, z) { return spring(t - t0, w, z); };
var smooth = function (u) { u = clamp(u); return u * u * (3 - 2 * u); };
/* exponential zoom: constant zoom rate between z0 and z1 (a true dolly) */
var zoomExp = function (u, z0, z1) { return z0 * Math.pow(z1 / z0, clamp(u)); };

/* ------------------------------------------------------------------ DOM helpers */
var NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, svg) {
  var e = svg ? document.createElementNS(NS, tag) : document.createElement(tag);
  for (var k in attrs) { if (k === 'style') e.style.cssText = attrs[k]; else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
  if (parent) parent.appendChild(e); return e;
}
var vis = function (e, on) { e.style.visibility = on ? 'inherit' : 'hidden'; };

/* ------------------------------------------------------------------ polygons: parse, resample, morph */
function parsePath(d) {                       /* M / L / C / Z (potrace output) -> array of closed polylines */
  var toks = d.replace(/,/g, ' ').match(/[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/g), i = 0, subs = [], cur = null, px = 0, py = 0;
  while (i < toks.length) {
    var c = toks[i++];
    if (c === 'M') { px = +toks[i++]; py = +toks[i++]; cur = [[px, py]]; subs.push(cur); }
    else if (c === 'L') { px = +toks[i++]; py = +toks[i++]; cur.push([px, py]); }
    else if (c === 'C') {
      var x1 = +toks[i++], y1 = +toks[i++], x2 = +toks[i++], y2 = +toks[i++], x3 = +toks[i++], y3 = +toks[i++];
      for (var s = 1; s <= 14; s++) {
        var u = s / 14, v = 1 - u;
        cur.push([v * v * v * px + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3, v * v * v * py + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3]);
      }
      px = x3; py = y3;
    }
  }
  return subs;
}
function polyLen(p, closed) { var t = 0; for (var i = 1; i < p.length; i++) t += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (closed) t += Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]); return t; }
function resample(p, N, closed) {            /* arc-length resample to exactly N points */
  var q = p.slice(); if (closed) q.push(p[0]);
  var seg = [0], tot = 0, i; for (i = 1; i < q.length; i++) { tot += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); seg.push(tot); }
  var out = [], n = closed ? N : N - 1;
  for (var k = 0; k < N; k++) {
    var d = tot * k / n, j = 1; while (j < q.length - 1 && seg[j] < d) j++;
    var a = q[j - 1], b = q[j], sl = seg[j] - seg[j - 1] || 1, f = clamp((d - seg[j - 1]) / sl);
    out.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]);
  }
  return out;
}
function signedArea(p) { var a = 0; for (var i = 0; i < p.length; i++) { var j = (i + 1) % p.length; a += p[i][0] * p[j][1] - p[j][0] * p[i][1]; } return a / 2; }
function startAtLeft(p) {                    /* clockwise on screen, starting at the left-most (lowest) point */
  if (signedArea(p) < 0) p = p.slice().reverse();
  var b = 0; for (var i = 1; i < p.length; i++) if (p[i][0] < p[b][0] - 1e-6 || (Math.abs(p[i][0] - p[b][0]) < 1e-6 && p[i][1] > p[b][1])) b = i;
  return p.slice(b).concat(p.slice(0, b));
}
function mapPts(p, f) { return p.map(f); }
function morphPts(A, B, k) { var o = new Array(A.length); for (var i = 0; i < A.length; i++) o[i] = [lerp(A[i][0], B[i][0], k), lerp(A[i][1], B[i][1], k)]; return o; }
function ptsToD(p, closed) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + p[i][0].toFixed(1) + ' ' + p[i][1].toFixed(1); return closed ? s + 'Z' : s; }
function circlePts(cx, cy, r, N) { var o = []; for (var i = 0; i < N; i++) { var a = Math.PI + (i / N) * Math.PI * 2; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; }
function polyPts(corners, N) { return startAtLeft(resample(corners, N, true)); }
function roundRectPts(x, y, w, h, r, N) {
  var c = [], seg = 10, add = function (cx, cy, a0) { for (var i = 0; i <= seg; i++) { var a = a0 + (i / seg) * Math.PI / 2; c.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  add(x + r, y + r, Math.PI); add(x + w - r, y + r, 1.5 * Math.PI); add(x + w - r, y + h - r, 0); add(x + r, y + h - r, Math.PI / 2);
  return startAtLeft(resample(c, N, true));
}
/* draw only the first `frac` (by arc length) of a polyline */
function headOf(p, frac) {
  if (frac >= 0.9999) return p; var tot = polyLen(p, false), lim = tot * frac, acc = 0, o = [p[0]];
  for (var i = 1; i < p.length; i++) { var l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + l >= lim) { var f = (lim - acc) / (l || 1); o.push([lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]); return o; } acc += l; o.push(p[i]); }
  return o;
}
function pointAt(p, frac) {                  /* position + tangent angle at arc-length fraction */
  var tot = polyLen(p, false), lim = tot * clamp(frac), acc = 0;
  for (var i = 1; i < p.length; i++) { var l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + l >= lim || i === p.length - 1) { var f = (lim - acc) / (l || 1); return { x: lerp(p[i - 1][0], p[i][0], f), y: lerp(p[i - 1][1], p[i][1], f), a: Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0]) }; } acc += l; }
  return { x: p[0][0], y: p[0][1], a: 0 };
}
