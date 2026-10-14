// Shared "schakel of automaat" component (homepage Auto B panel and contact wizard step 2).
//
//   GearScene.dashboard(height)      HTML of the windscreen + steering wheel drawing
//   GearScene.mountPicks(container)  puts the two gear buttons into `container` and returns the animation:
//                                    the H-gate drawing + label is the Schakel button (data-gear="schakel"),
//                                    the P-R-N-D lever drawing + label is the Automaat button (data-gear="automaat").
//                                    Each is one real <button> (aria-pressed, keyboard focus).
//   var gs = GearScene.mountPicks(el);
//   gs.play('schakel' | 'automaat', onDone)  knob into 1st gear / lever from P to D (~0.6s), the other eases back
//   gs.set('schakel' | 'automaat' | null)    jump to that end position, no animation
// With prefers-reduced-motion everything jumps to its end position.
(function () {
  var KNOB_NEUTRAL = [262, 184], KNOB_FIRST = [232, 164];
  var LEVER_P = [355, 156], LEVER_D = [355, 220];
  var DURATION = 600, BACK = 280;
  var t = function (s) { return window.I18N ? window.I18N.t(s) : s; };

  // ---------- markup
  function dashboard(height) {
    return '<svg class="gear-bg" viewBox="0 0 430 ' + height + '" aria-hidden="true" focusable="false">' +
      '<g class="gs-line">' +
      '<path d="M44 14Q215 -6 386 14L406 104Q215 88 24 104Z"/>' +
      '<circle cx="110" cy="252" r="80"/><circle cx="110" cy="252" r="66"/><circle cx="110" cy="252" r="24"/>' +
      '<path d="M90 242L46 230M130 242L174 230"/>' +
      '<path d="M100 173H120" class="gs-mark"/>' +
      '</g></svg>';
  }

  function picksMarkup() {
    return '' +
      '<button type="button" class="gear-pick gear-pick--h" data-gear="schakel" aria-pressed="false">' +
        '<svg viewBox="200 124 122 120" aria-hidden="true" focusable="false">' +
          '<path class="gs-gatelines" d="M232 158V210M262 158V210M292 158V210M232 184H292"/>' +
          '<text class="gs-label" id="gs-l-1" x="232" y="146">1</text>' +
          '<text class="gs-label" x="262" y="146">3</text>' +
          '<text class="gs-label" x="292" y="146">5</text>' +
          '<text class="gs-label" x="232" y="232">2</text>' +
          '<text class="gs-label" x="262" y="232">4</text>' +
          '<text class="gs-label" x="292" y="232">R</text>' +
          '<g class="gs-knob" id="gs-knob"><circle r="11" class="gs-knobball"/><circle r="3.2" class="gs-dot"/></g>' +
        '</svg>' +
        '<span class="gear-pick-label" data-nl="Schakel">Schakel</span>' +
      '</button>' +
      '<button type="button" class="gear-pick gear-pick--a" data-gear="automaat" aria-pressed="false">' +
        '<svg viewBox="334 124 96 120" aria-hidden="true" focusable="false">' +
          '<rect class="gs-gatelines gs-slot" x="346" y="140" width="18" height="96" rx="9"/>' +
          '<text class="gs-label gs-label--r" id="gs-l-p" x="374" y="160">P</text>' +
          '<text class="gs-label gs-label--r" x="374" y="184">R</text>' +
          '<text class="gs-label gs-label--r" x="374" y="208">N</text>' +
          '<text class="gs-label gs-label--r" id="gs-l-d" x="374" y="232">D</text>' +
          '<g class="gs-lever" id="gs-lever"><rect x="-12" y="-8" width="24" height="16" rx="6" class="gs-levercap"/></g>' +
        '</svg>' +
        '<span class="gear-pick-label" data-nl="Automaat">Automaat</span>' +
      '</button>';
  }

  // ---------- animation
  function tr(p) { return 'translate(' + p[0] + 'px,' + p[1] + 'px)'; }
  function pos(el, p) { el.style.transform = tr(p); }

  function create(root) {
    var knob = root.querySelector('#gs-knob');
    var lever = root.querySelector('#gs-lever');
    var labels = { one: root.querySelector('#gs-l-1'), p: root.querySelector('#gs-l-p'), d: root.querySelector('#gs-l-d') };
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var running = [];
    var at = { knob: KNOB_NEUTRAL, lever: LEVER_P };
    var VIA = [KNOB_FIRST[0], KNOB_NEUTRAL[1]];

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

  // ---------- the component
  function mountPicks(container) {
    container.insertAdjacentHTML('beforeend', picksMarkup());
    function labelText() {
      Array.prototype.forEach.call(container.querySelectorAll('.gear-pick-label'), function (el) {
        el.textContent = t(el.getAttribute('data-nl'));
      });
    }
    labelText();
    document.addEventListener('langchange', labelText);
    return create(container);
  }

  window.GearScene = { dashboard: dashboard, mountPicks: mountPicks, create: create };
})();
