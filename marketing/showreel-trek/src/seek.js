/* ===================================================================== orchestration */
function applyDot(t) {
  var s = dotState(t); vis(G.dot, s.on); if (!s.on) return;
  G.dot.style.left = (s.cx - s.w / 2).toFixed(2) + 'px'; G.dot.style.top = (s.cy - s.h / 2).toFixed(2) + 'px';
  G.dot.style.width = s.w.toFixed(2) + 'px'; G.dot.style.height = s.h.toFixed(2) + 'px'; G.dot.style.borderRadius = (Math.min(s.w, s.h) / 2).toFixed(2) + 'px';
  G.dotTxt.style.opacity = s.txt.toFixed(3);
}
function seekAt(t) {
  t = Math.max(0, Math.min(DUR, t));
  sceneA(t); scene3(t); scene4(t); scene5(t); scene7(t); sceneEnd(t);
  applyDot(t);
}
window.__dur = DUR * SLOW;
window.seek = function (t) { seekAt(t / SLOW); };
function init() { buildScenes1(); layoutType(); buildScene3(); buildScene4(); buildScene5(); buildScene7(); window.__ready = true; }
Promise.all([document.fonts.load('800 100px PJS'), document.fonts.load('650 20px PJS'), document.fonts.ready]).then(init);
