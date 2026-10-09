// Design 3: "Schakel" / "Automaat" pills in the Auto B card.
// Same behaviour as ../chooser-gear.js (notes + intake link follow the choice), but on plain pills.
(function () {
  var card = document.getElementById('panel-b');
  if (!card) return;
  var root = window.SITE_ROOT || '';
  var buttons = card.querySelectorAll('[data-gear]');
  var hint = document.getElementById('gear-hint');
  var lists = card.querySelectorAll('.gear-points');
  var source = card.querySelector('.gear-source');
  var cta = document.getElementById('btn-b');

  function choose(kind) {
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-gear') === kind ? 'true' : 'false');
    });
    hint.hidden = true;
    Array.prototype.forEach.call(lists, function (l) { l.hidden = l.getAttribute('data-for') !== kind; });
    source.hidden = false;
    cta.setAttribute('href', root + 'contact.html?rijbewijs=B&versnelling=' + kind);
  }

  Array.prototype.forEach.call(buttons, function (b) {
    b.addEventListener('click', function () { choose(b.getAttribute('data-gear')); });
  });
})();
