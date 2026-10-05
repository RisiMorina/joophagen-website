// Shared animation for the driver's-seat drawing (homepage chooser and contact wizard).
//   var gs = GearScene.create(svgElement);
//   gs.play('schakel' | 'automaat', onDone)  knob into 1st gear / lever from P to D (~0.6s), the other eases back
//   gs.set('schakel' | 'automaat')           jump to that end position, no animation
// With prefers-reduced-motion everything jumps to its end position.
(function () {
  var KNOB_NEUTRAL = [262, 184], KNOB_FIRST = [232, 164];
  var LEVER_P = [355, 156], LEVER_D = [355, 220];
  var DURATION = 600, BACK = 280;

  function tr(p) { return 'translate(' + p[0] + 'px,' + p[1] + 'px)'; }
  function pos(el, p) { el.style.transform = tr(p); }

  function create(root) {
    var knob = root.querySelector('#gs-knob');
    var lever = root.querySelector('#gs-lever');
    var labels = { one: root.querySelector('#gs-l-1'), p: root.querySelector('#gs-l-p'), d: root.querySelector('#gs-l-d') };
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var running = [];
    var at = { knob: KNOB_NEUTRAL, lever: LEVER_P };

    function mark(key, on) { labels[key].classList.toggle('is-on', on); }
    function clearMarks() { mark('one', false); mark('p', false); mark('d', false); }

    function stopAll() {
      running.forEach(function (a) { a.cancel(); });
      running = [];
      pos(knob, at.knob);
      pos(lever, at.lever);
    }

    // move el from where it is to `to`; `via` makes the knob follow the gate (sideways, then up/down)
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

    var VIA = [KNOB_FIRST[0], KNOB_NEUTRAL[1]];

    function play(kind, onDone) {
      stopAll();
      clearMarks();
      if (kind === 'schakel') {
        glide('lever', lever, LEVER_P, BACK, null, function () { mark('p', true); });
        glide('knob', knob, KNOB_FIRST, DURATION, VIA, function () { mark('one', true); if (onDone) onDone(); });
      } else {
        glide('knob', knob, KNOB_NEUTRAL, BACK, VIA, null);
        mark('p', true);
        glide('lever', lever, LEVER_D, DURATION, null, function () { mark('p', false); mark('d', true); if (onDone) onDone(); });
      }
    }

    function set(kind) {
      running.forEach(function (a) { a.cancel(); });
      running = [];
      clearMarks();
      if (kind === 'schakel') {
        at.knob = KNOB_FIRST; at.lever = LEVER_P; mark('one', true);
      } else if (kind === 'automaat') {
        at.knob = KNOB_NEUTRAL; at.lever = LEVER_D; mark('d', true);
      } else {
        at.knob = KNOB_NEUTRAL; at.lever = LEVER_P; mark('p', true);
      }
      pos(knob, at.knob);
      pos(lever, at.lever);
    }

    set(null);
    return { play: play, set: set };
  }

  window.GearScene = { create: create };
})();
