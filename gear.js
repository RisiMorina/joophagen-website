// Manual / automatic chooser inside the "Auto (B)" panel (homepage).
// Schakel: the knob moves from neutral into 1st gear. Automaat: the lever slides from P to D.
// With prefers-reduced-motion the end position is shown straight away.
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

  var KNOB_NEUTRAL = [535, 247], KNOB_FIRST = [495, 227];
  var LEVER_P = [535, 228], LEVER_D = [535, 294];
  var DURATION = 600;

  var choice = null, gate = 'manual', running = [], timer = 0;

  function pos(el, p) { el.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px)'; }
  function tr(p) { return 'translate(' + p[0] + 'px,' + p[1] + 'px)'; }
  function mark(id, on) { document.getElementById(id).classList.toggle('is-on', on); }

  function stopAll() {
    clearTimeout(timer);
    running.forEach(function (a) { a.cancel(); });
    running = [];
  }

  // knob: neutral -> sideways along the gate -> forward into 1st; lever: straight slide P -> D
  function move(el, frames, finalPos, done) {
    if (reduce || !el.animate) { pos(el, finalPos); done(); return; }
    var a = el.animate(frames, { duration: DURATION, easing: 'ease-in-out', fill: 'forwards' });
    running.push(a);
    a.onfinish = function () { pos(el, finalPos); a.cancel(); done(); };
  }

  function play(kind, delay) {
    stopAll();
    ['gs-l-1', 'gs-l-p', 'gs-l-d'].forEach(function (id) { mark(id, false); });
    if (kind === 'schakel') {
      pos(knob, KNOB_NEUTRAL);
      timer = setTimeout(function () {
        move(knob, [
          { transform: tr(KNOB_NEUTRAL) },
          { transform: tr([KNOB_FIRST[0], KNOB_NEUTRAL[1]]), offset: 0.45 },
          { transform: tr(KNOB_FIRST) }
        ], KNOB_FIRST, function () { mark('gs-l-1', true); });
      }, delay);
    } else {
      pos(lever, LEVER_P);
      mark('gs-l-p', true);
      timer = setTimeout(function () {
        move(lever, [{ transform: tr(LEVER_P) }, { transform: tr(LEVER_D) }], LEVER_D, function () {
          mark('gs-l-p', false);
          mark('gs-l-d', true);
        });
      }, delay);
    }
  }

  function label() {
    if (!choice) return;
    cta.textContent = t('Plan een intake voor rijbewijs B') + ' (' + t(choice) + ')';
  }

  function choose(kind) {
    var newGate = kind === 'schakel' ? 'manual' : 'auto';
    var changed = newGate !== gate;
    choice = kind;
    gate = newGate;
    scene.setAttribute('data-gate', gate);
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-gear') === kind ? 'true' : 'false');
    });
    hint.hidden = true;
    Array.prototype.forEach.call(lists, function (l) { l.hidden = l.getAttribute('data-for') !== kind; });
    source.hidden = false;
    cta.setAttribute('href', 'contact.html?dienst=' + encodeURIComponent('Auto (B), ' + kind));
    label();
    play(kind, changed && !reduce ? 180 : 0);
  }

  Array.prototype.forEach.call(buttons, function (b) {
    b.addEventListener('click', function () { choose(b.getAttribute('data-gear')); });
  });
  document.addEventListener('langchange', label);

  // start state: knob in neutral, lever in P
  pos(knob, KNOB_NEUTRAL);
  pos(lever, LEVER_P);
  mark('gs-l-p', true);

  // on phones show the part of the scene that matters (wheel edge + console) bigger
  var small = window.matchMedia('(max-width: 720px)');
  function fit() { scene.setAttribute('viewBox', small.matches ? '180 0 530 320' : '0 0 720 320'); }
  if (small.addEventListener) small.addEventListener('change', fit);
  fit();
})();
