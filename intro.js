// Intro skip (homepage only). The animation itself is pure CSS (see styles.css,
// "Intro"); this only lets a click, tap, scroll or key press end it early and
// removes the overlay once it is done. It never blocks scrolling or loading.
(function () {
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  if (!intro) return;
  if (!root.classList.contains('intro-on')) { intro.remove(); return; }

  function skip() {
    root.classList.add('intro-skip');
    intro.remove();
    ['click', 'touchstart', 'wheel', 'keydown'].forEach(function (t) {
      window.removeEventListener(t, skip);
    });
  }
  ['click', 'touchstart', 'wheel', 'keydown'].forEach(function (t) {
    window.addEventListener(t, skip, { passive: true });
  });
  window.addEventListener('scroll', skip, { passive: true, once: true });

  intro.addEventListener('animationend', function (e) {
    if (e.animationName === 'intro-gone') skip();
  });
})();
