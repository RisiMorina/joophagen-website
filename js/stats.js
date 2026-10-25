// Homepage facts line: the number of "rijbewijzen & opleidingen" is the number of tiles on diensten.html,
// so it stays right when a tile is added or removed there. If the fetch fails (offline, file://),
// the fixed number in index.html stays.
(function () {
  var el = document.getElementById('stat-licences');
  if (!el || !window.fetch || !window.DOMParser) return;
  fetch('diensten.html').then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
    if (!html) return;
    var n = new DOMParser().parseFromString(html, 'text/html').querySelectorAll('.dienst-tile').length;
    if (n > 0) el.textContent = n;
  }).catch(function () {});
})();
