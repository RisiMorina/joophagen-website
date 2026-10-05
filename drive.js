// Lesauto scroll indicator (homepage only): below 1500px a small car drives
// left to right along the bottom edge of the header as you scroll.
// Hidden on wide screens and with prefers-reduced-motion.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var bar = document.getElementById('drive-bar');
  if (!bar) return;
  var trailEl = bar.querySelector('.drive-bar-trail');
  var barCar = bar.querySelector('.drive-bar-car');
  var ticking = false;

  function update() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.max(0, Math.min(1, window.pageYOffset / max)) : 0;
    var vw = document.documentElement.clientWidth;
    var cx = 22 + p * (vw - 44);
    barCar.style.transform = 'translate(' + (cx - 12).toFixed(1) + 'px, 21px) rotate(-90deg)';
    trailEl.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    barCar.style.opacity = window.pageYOffset > 40 ? '1' : '0';   // not parked at the left on arrival
  }
  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  window.addEventListener('load', request);
  update();
})();
