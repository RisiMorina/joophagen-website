// Licence chooser (homepage). Tabs + panels with roving tabindex:
// click/tap or Arrow keys (Home/End too) select a licence, its panel fades in.
(function () {
  var list = document.querySelector('.chooser-tabs');
  if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function panelOf(tab) { return document.getElementById(tab.getAttribute('aria-controls')); }

  function centre(tab, smooth) {
    if (list.scrollWidth <= list.clientWidth + 1) return;   // desktop: nothing to scroll
    var left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    list.scrollTo({ left: left, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }

  function select(tab, opts) {
    opts = opts || {};
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var p = panelOf(t);
      p.hidden = !on;
      p.classList.remove('is-in');
      if (on && opts.animate !== false) {
        void p.offsetWidth;            // restart the fade
        p.classList.add('is-in');
      }
    });
    if (opts.focus) tab.focus();
    centre(tab, opts.smooth);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab, { smooth: true }); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, { focus: true, smooth: true }); }
    });
  });

  // Start on the pre-selected tab (Auto) and bring it into view on phones.
  var start = list.querySelector('[aria-selected="true"]') || tabs[0];
  select(start, { animate: false });
})();
