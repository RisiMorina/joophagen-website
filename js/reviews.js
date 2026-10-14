// Reviews carousel (homepage): one review at a time on phones, three on desktop.
// Native scroll-snap does the swiping; the arrows scroll by one review.
// Arrows are real buttons (keyboard + screen reader), and disappear when every
// review already fits on screen (so with three reviews on desktop there is nothing to scroll).
(function () {
  var track = document.getElementById('reviews-track');
  var controls = document.getElementById('reviews-controls');
  if (!track || !controls) return;
  var prev = controls.querySelector('[data-dir="-1"]');
  var next = controls.querySelector('[data-dir="1"]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = function (s) { return window.I18N ? window.I18N.t(s) : s; };

  function slides() { return track.querySelectorAll('.testimonial'); }

  function label() {
    var all = slides();
    track.setAttribute('aria-label', t('Reviews van leerlingen'));
    Array.prototype.forEach.call(all, function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', t('Review') + ' ' + (i + 1) + ' ' + t('van') + ' ' + all.length);
    });
  }

  function step() {
    var first = slides()[0];
    if (!first) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.offsetWidth + gap;
  }

  function setState(btn, disabled) {
    btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    btn.classList.toggle('is-disabled', disabled);
  }

  function update() {
    var max = track.scrollWidth - track.clientWidth;
    controls.hidden = max <= 2;                       // everything fits: no arrows needed
    setState(prev, track.scrollLeft <= 2);
    setState(next, track.scrollLeft >= max - 2);
  }

  function go(dir) {
    track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
  }

  [prev, next].forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-disabled') === 'true') return;
      go(parseInt(btn.getAttribute('data-dir'), 10));
    });
  });

  // Arrow keys also work when the track itself has focus
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  var raf = 0;
  track.addEventListener('scroll', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update);
  document.addEventListener('langchange', label);

  label();
  update();
})();
