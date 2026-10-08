// Design 1: licence tiles. A tile opens its panel in a dialog (bottom sheet on phones).
(function () {
  var dlg = document.getElementById('lic-dialog');
  if (!dlg) return;
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile[data-panel]'));
  var panels = Array.prototype.slice.call(dlg.querySelectorAll('.lic-panel'));
  var root = document.documentElement;

  function open(tile) {
    var id = tile.getAttribute('data-panel');
    panels.forEach(function (p) {
      p.hidden = p.id !== id;
      p.classList.remove('is-in');
      if (p.id === id) { void p.offsetWidth; p.classList.add('is-in'); }
    });
    var name = tile.querySelector('.lic-name');
    dlg.setAttribute('aria-label', name ? name.firstChild.textContent : '');
    dlg.querySelector('.sheet').scrollTop = 0;
    root.style.overflow = 'hidden';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  tiles.forEach(function (tile) { tile.addEventListener('click', function () { open(tile); }); });
  dlg.querySelector('.sheet-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // click on the dark backdrop
  dlg.addEventListener('close', function () { root.style.overflow = ''; });
})();
