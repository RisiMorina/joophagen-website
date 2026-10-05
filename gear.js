// Manual / automatic chooser inside the "Auto (B)" panel (homepage).
// Choose with the two buttons, or by clicking the H gate (Schakel) or the P-R-N-D lever (Automaat).
// Schakel: the knob moves from neutral into 1st gear. Automaat: the lever slides from P to D.
// The one that was not chosen eases back to rest. With prefers-reduced-motion everything jumps to its end position.
(function () {
  var gear = document.getElementById('gear');
  if (!gear) return;
  var scene = document.getElementById('gear-scene');
  var knob = document.getElementById('gs-knob');
  var lever = document.getElementById('gs-lever');
  var buttons = gear.querySelectorAll('.gear-choice');
  var hint = document.getElementById('gear-hint');
  var lists = gear.querySelectorAll('.gear-points');
  var source = gear.querySelector('.gear-source');
  var cta = document.getElementById('btn-b');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = function (s) { return window.I18N ? window.I18N.t(s) : s; };

  var KNOB_NEUTRAL = [262, 184], KNOB_FIRST = [232, 164];
  var LEVER_P = [355, 156], LEVER_D = [355, 220];
  var DURATION = 600, BACK = 280;

  var choice = null, running = [];
  var at = { knob: KNOB_NEUTRAL, lever: LEVER_P };

  function tr(p) { return 'translate(' + p[0] + 'px,' + p[1] + 'px)'; }
  function pos(el, p) { el.style.transform = tr(p); }
  function mark(id, on) { document.getElementById(id).classList.toggle('is-on', on); }

  // move el from its current spot to `to`; `via` makes the knob follow the gate (sideways, then up/down)
  function glide(name, el, to, ms, via, done) {
    var from = at[name];
    at[name] = to;
    if (reduce || !el.animate) { pos(el, to); if (done) done(); return; }
    var frames = [{ transform: tr(from) }];
    if (via) frames.push({ transform: tr(via), offset: 0.5 });
    frames.push({ transform: tr(to) });
    var a = el.animate(frames, { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
    running.push(a);
    a.onfinish = function () { pos(el, to); a.cancel(); if (done) done(); };
  }

  function stopAll() {
    running.forEach(function (a) { a.cancel(); });
    running = [];
    pos(knob, at.knob);
    pos(lever, at.lever);
  }

  function play(kind) {
    stopAll();
    ['gs-l-1', 'gs-l-p', 'gs-l-d'].forEach(function (id) { mark(id, false); });
    if (kind === 'schakel') {
      glide('lever', lever, LEVER_P, BACK, null, function () { mark('gs-l-p', true); });
      glide('knob', knob, KNOB_FIRST, DURATION, [KNOB_FIRST[0], KNOB_NEUTRAL[1]], function () { mark('gs-l-1', true); });
    } else {
      glide('knob', knob, KNOB_NEUTRAL, BACK, [KNOB_FIRST[0], KNOB_NEUTRAL[1]], null);
      mark('gs-l-p', true);
      glide('lever', lever, LEVER_D, DURATION, null, function () { mark('gs-l-p', false); mark('gs-l-d', true); });
    }
  }

  function label() {
    if (!choice) return;
    cta.textContent = t('Plan een intake voor rijbewijs B') + ' (' + t(choice) + ')';
  }

  function choose(kind) {
    choice = kind;
    scene.setAttribute('data-choice', kind);
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-gear') === kind ? 'true' : 'false');
    });
    hint.hidden = true;
    Array.prototype.forEach.call(lists, function (l) { l.hidden = l.getAttribute('data-for') !== kind; });
    source.hidden = false;
    cta.setAttribute('href', 'contact.html?dienst=' + encodeURIComponent('Auto (B), ' + kind));
    label();
    play(kind);
  }

  Array.prototype.forEach.call(buttons, function (b) {
    b.addEventListener('click', function () { choose(b.getAttribute('data-gear')); });
  });
  // the drawing is clickable too (the buttons stay the keyboard route, so the drawing is not focusable)
  scene.addEventListener('click', function (e) {
    var g = e.target.closest ? e.target.closest('[data-gear]') : null;
    if (g) choose(g.getAttribute('data-gear'));
  });
  document.addEventListener('langchange', label);

  // start state: knob in neutral, lever in P
  pos(knob, KNOB_NEUTRAL);
  pos(lever, LEVER_P);
  mark('gs-l-p', true);
})();
