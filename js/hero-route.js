// Homepage hero: the route with the four vehicle stops.
// 1. Entrance (GSAP, about 1.6 s): the line draws itself, the stops pop on in order, "Rijbewijs!" fades in.
// 2. Click/Enter on a stop: a dot travels along the line to "Rijbewijs!", then a small answer card shows.
//    Esc or the close button hides it; another stop swaps it.
// Reduced motion: no GSAP at all. Line and stops are shown straight away, no dot, the card just appears.
// Facts in CARDS come only from the diensten pop-ups. Where a pop-up still has a TODO (Motor, Vrachtwagen)
// the card shows just the licence name. Never add ages or prices here that are not in diensten.html.
(function () {
  var route = document.getElementById('route');
  var card = document.getElementById('route-card');
  var path = document.getElementById('route-path');
  var dot = document.getElementById('route-dot');
  if (!route || !card || !path || !dot) return;

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var animate = hasGsap && !reduce;
  if (!animate) root.classList.remove('route-prep');   // no GSAP (or reduced motion): show everything

  function t(s) { return window.I18N ? window.I18N.t(s) : s; }

  var CARDS = {
    auto:        { name: 'Auto',        licence: 'Rijbewijs B',          fact: 'Vanaf 16,5 jaar, met schakel of automaat.', plan: 'B',           more: 'rijbewijs-auto.html' },
    scooter:     { name: 'Scooter',     licence: 'Rijbewijs AM',         fact: 'Vanaf 16 jaar.',                            plan: 'AM',          more: 'rijbewijs-scooter.html' },
    motor:       { name: 'Motor',       licence: 'Rijbewijs A1, A2 en A', fact: '',                                         plan: 'motor',       more: 'diensten.html#motor' },
    vrachtwagen: { name: 'Vrachtwagen', licence: 'Rijbewijs C',          fact: '',                                          plan: 'vrachtwagen', more: 'diensten.html#vrachtwagen' }
  };

  var buttons = Array.prototype.slice.call(route.querySelectorAll('.stop-btn'));
  var nameEl = card.querySelector('.route-card-name');
  var licenceEl = card.querySelector('.route-card-licence');
  var factEl = card.querySelector('.route-card-fact');
  var planEl = card.querySelector('[data-role="plan"]');
  var moreEl = card.querySelector('[data-role="more"]');
  var closeEl = card.querySelector('.route-card-close');
  var current = null;      // key of the open card
  var travel = null;       // running dot tween

  /* ---- entrance ---- */
  if (animate) {
    var dest = route.querySelector('.route-dest');
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    gsap.set(path, { strokeDashoffset: 1 });
    gsap.set(buttons, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
    gsap.set([dest.querySelector('.dest-badge'), dest.querySelector('.dest-text')], { opacity: 0 });
    root.classList.remove('route-prep');   // GSAP holds the hidden state from here
    tl.to(path, { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(buttons, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.4)', stagger: 0.1 }, 0.75)
      .to(dest.querySelectorAll('.dest-badge, .dest-text'), { opacity: 1, duration: 0.4, ease: 'power1.out' }, 1.2)
      .add(function () {
        // hand the transform back to CSS so the hover lift works
        gsap.set(buttons, { clearProps: 'transform,opacity' });
      });
  }

  /* ---- card ---- */
  function fill(key) {
    var c = CARDS[key];
    nameEl.textContent = t(c.name);
    licenceEl.textContent = t(c.licence);
    factEl.textContent = c.fact ? t(c.fact) : '';
    planEl.setAttribute('href', 'contact.html?rijbewijs=' + c.plan);
    moreEl.setAttribute('href', c.more);
  }

  function showCard(key) {
    fill(key);
    var wasHidden = card.hasAttribute('hidden');
    card.removeAttribute('hidden');
    if (animate) {
      gsap.fromTo(card, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: wasHidden ? 0.3 : 0.2, ease: 'power2.out', clearProps: 'transform' });
    }
    // on phones the card sits under the graphic: make sure it is visible
    if (window.matchMedia('(max-width: 900px)').matches && card.getBoundingClientRect().bottom > window.innerHeight) {
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  function mark(key) {
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-stop') === key ? 'true' : 'false'); });
  }

  function close(returnFocus) {
    if (travel) { travel.kill(); travel = null; gsap.set(dot, { opacity: 0 }); }
    var key = current;
    current = null;
    mark(null);
    card.setAttribute('hidden', '');
    if (returnFocus && key) {
      var b = route.querySelector('.stop-btn[data-stop="' + key + '"]');
      if (b) b.focus();
    }
  }

  /* arc length of the path where the stop sits (the stops lie on the line) */
  function stopLength(btn) {
    var wrap = btn.parentNode;
    var x = parseFloat(wrap.style.getPropertyValue('--x')) / 100 * 460;
    var y = parseFloat(wrap.style.getPropertyValue('--y')) / 100 * 400;
    var total = path.getTotalLength(), best = 0, bestD = Infinity;
    for (var l = 0; l <= total; l += 2) {
      var p = path.getPointAtLength(l);
      var d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
      if (d < bestD) { bestD = d; best = l; }
    }
    return best;
  }

  function select(btn) {
    var key = btn.getAttribute('data-stop');
    if (key === current) { close(false); return; }   // second click on the open stop closes it
    if (travel) { travel.kill(); travel = null; }
    current = key;
    mark(key);

    if (!animate) { showCard(key); return; }

    var total = path.getTotalLength();
    var from = stopLength(btn);
    var pos = { l: from };
    function place() { var p = path.getPointAtLength(pos.l); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); }
    place();
    gsap.set(dot, { opacity: 1 });
    travel = gsap.to(pos, {
      l: total,
      duration: 0.3 + 0.8 * (total - from) / total,
      ease: 'power2.inOut',
      onUpdate: place,
      onComplete: function () {
        travel = null;
        gsap.to(dot, { opacity: 0, duration: 0.15 });
        if (current === key) showCard(key);
      }
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { select(b); });
  });
  closeEl.addEventListener('click', function () { close(true); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current) close(true);
  });
  // keep the card text in the chosen language
  document.addEventListener('langchange', function () { if (current && !card.hasAttribute('hidden')) fill(current); });
})();
