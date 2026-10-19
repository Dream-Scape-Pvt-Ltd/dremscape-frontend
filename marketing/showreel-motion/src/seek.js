/* ===================================================================== orchestration */
function applyLine(t) {
  var s = lineState(t), on = s.w > 0.05;
  vis(G.line, on); if (!on) return;
  G.line.setAttribute('d', ptsToD(s.pts, s.closed));
  G.line.setAttribute('stroke-width', s.w.toFixed(2));
  if (s.gap > 0.6) { G.line.setAttribute('stroke-dasharray', '0.01 ' + s.gap.toFixed(2)); G.line.setAttribute('stroke-dashoffset', s.off.toFixed(2)); }
  else { G.line.removeAttribute('stroke-dasharray'); G.line.removeAttribute('stroke-dashoffset'); }
}
function seekAt(t) {
  t = Math.max(0, Math.min(DUR, t));
  var ca = t < 4.1 ? camA(t) : CAM0;
  applyCamSvg(G.hookCam, t < 2.6 ? ca : CAM0);
  applyCamSvg(G.lineCam, ca);
  sceneHook(t); sceneType(t); sceneMorph(t); scene4(t); scene5(t); scene6(t); scene7(t);
  applyLine(t);
}
/* the film is authored on a 15 s / 120 BPM grid and played SLOW times slower (24 s / 75 BPM) so every idea has room to be read */
window.__dur = DUR * SLOW;
window.seek = function (t) { seekAt(t / SLOW); };
function init() {
  buildScenes1(); layoutType(); buildScene4(); buildScene5(); buildScene6(); buildScene7();
  window.__ready = true;
}
Promise.all([document.fonts.load('800 100px PJS'), document.fonts.load('650 20px PJS'), document.fonts.ready]).then(init);
