// Manual / automatic chooser inside the "Auto (B)" panel (homepage).
// Choose with the two buttons, or by clicking the H gate (Schakel) or the P-R-N-D lever (Automaat).
// The drawing's animation lives in gear-scene.js (shared with the contact wizard).
(function () {
  var gear = document.getElementById('gear');
  if (!gear || !window.GearScene) return;
  var scene = document.getElementById('gear-scene');
  var gs = window.GearScene.create(scene);
  var buttons = gear.querySelectorAll('.gear-choice');
  var hint = document.getElementById('gear-hint');
  var lists = gear.querySelectorAll('.gear-points');
  var source = gear.querySelector('.gear-source');
  var cta = document.getElementById('btn-b');
  var t = function (s) { return window.I18N ? window.I18N.t(s) : s; };
  var choice = null;

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
    cta.setAttribute('href', 'contact.html?rijbewijs=B&versnelling=' + kind);
    label();
    gs.play(kind);
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
})();
