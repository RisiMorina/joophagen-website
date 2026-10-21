// Diensten page: each licence tile (a <button>) opens its own native <dialog>.
// Same behaviour as the Waarom pop-ups (js/why-dialog.js): on desktop the panel grows out of the clicked tile,
// below 600px it is a bottom sheet, with reduced motion it is a plain fade. Without GSAP: no animation.
// Close with the X, Esc or a click on the backdrop; focus returns to the tile.
// Arriving on diensten.html#auto (links from the homepage) opens that pop-up straight away.
(function () {
  var tiles = document.querySelectorAll('.dienst-tile');
  if (!tiles.length || !window.HTMLDialogElement) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sheet = window.matchMedia('(max-width: 599.98px)');
  var DUR = 0.35;
  var openers = {};

  Array.prototype.forEach.call(tiles, function (btn) {
    var dialog = document.getElementById(btn.getAttribute('aria-controls'));
    var panel = dialog && dialog.querySelector('.why-dialog-panel');
    if (!dialog || !panel) return;
    var closing = false;

    // GSAP only ever touches the panel, never the <dialog> (that would knock it out of the top layer).
    function onTile() {
      var c = btn.getBoundingClientRect(), d = panel.getBoundingClientRect();
      return {
        x: (c.left + c.width / 2) - (d.left + d.width / 2),
        y: (c.top + c.height / 2) - (d.top + d.height / 2),
        scale: Math.min(1, Math.max(0.2, c.width / d.width))
      };
    }

    function reset() {
      if (window.gsap) gsap.set(panel, { clearProps: 'transform,opacity' });
    }

    function open() {
      if (dialog.open) return;
      dialog.showModal();
      requestAnimationFrame(function () { dialog.classList.add('is-open'); });
      if (!window.gsap) return;
      gsap.killTweensOf(panel);
      if (reduce.matches) {
        gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none', clearProps: 'opacity' });
      } else if (sheet.matches) {
        gsap.fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: DUR, ease: 'power2.out', clearProps: 'transform' });
      } else {
        var from = onTile();
        gsap.fromTo(panel, { x: from.x, y: from.y, scale: from.scale, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: DUR, ease: 'power2.out', clearProps: 'transform,opacity' });
      }
    }

    function finishClose() {
      closing = false;
      if (dialog.open) dialog.close();
    }

    function close() {
      if (!dialog.open || closing) return;
      closing = true;
      dialog.classList.remove('is-open');
      if (!window.gsap) return finishClose();
      gsap.killTweensOf(panel);
      if (reduce.matches) {
        gsap.to(panel, { opacity: 0, duration: 0.2, ease: 'none', onComplete: finishClose });
      } else if (sheet.matches) {
        gsap.to(panel, { yPercent: 100, duration: 0.3, ease: 'power2.in', onComplete: finishClose });
      } else {
        reset();
        var to = onTile();
        gsap.to(panel, { x: to.x, y: to.y, scale: to.scale, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: finishClose });
      }
    }

    openers[btn.id] = open;
    btn.addEventListener('click', open);
    dialog.querySelector('.why-dialog-close').addEventListener('click', close);
    // A click on the dialog element itself (not its panel) is a click on the backdrop.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    // Esc: run our animated close instead of the instant one.
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('close', function () {
      closing = false;
      dialog.classList.remove('is-open');
      if (window.gsap) gsap.killTweensOf(panel);
      reset();
      btn.focus({ preventScroll: true });
    });
  });

  var id = window.location.hash.slice(1);
  if (id && openers[id]) openers[id]();
})();
