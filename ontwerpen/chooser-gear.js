// Same as ../gear.js, but the intake link is written for a page two folders deep (ontwerpen/ontwerp-N/).
// Needs window.SITE_ROOT (e.g. "../../") to be set before this script runs.
(function () {
  var gear = document.getElementById('gear');
  if (!gear || !window.GearScene) return;
  var root = window.SITE_ROOT || '';
  var stage = document.getElementById('gear-stage');
  stage.insertAdjacentHTML('afterbegin', window.GearScene.dashboard(290));
  var gs = window.GearScene.mountPicks(stage);
  gear.hidden = false;

  var buttons = gear.querySelectorAll('.gear-pick');
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
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-gear') === kind ? 'true' : 'false');
    });
    hint.hidden = true;
    Array.prototype.forEach.call(lists, function (l) { l.hidden = l.getAttribute('data-for') !== kind; });
    source.hidden = false;
    cta.setAttribute('href', root + 'contact.html?rijbewijs=B&versnelling=' + kind);
    label();
    gs.play(kind);
  }

  Array.prototype.forEach.call(buttons, function (b) {
    b.addEventListener('click', function () { choose(b.getAttribute('data-gear')); });
  });
  document.addEventListener('langchange', label);
})();
