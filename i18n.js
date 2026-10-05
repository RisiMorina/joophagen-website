// Language switch (NL | EN).
//
// How it works
// - The HTML contains the Dutch text. That is the Dutch "dictionary".
// - Every other language is one file in /lang (lang/en.js), a plain object
//   { "Dutch sentence": "Translation" }. The Dutch sentence is the key.
//   Anything without a translation simply stays Dutch.
// - To add a language: copy lang/en.js to lang/xx.js, translate the values,
//   add <script src="lang/xx.js"> next to lang/en.js on every page, and add a
//   <button data-lang="xx"> to the two .lang-switch blocks in every header.
// - Texts built in JavaScript (script.js) go through t("Dutch sentence").
// - Reviews carry lang="nl" on purpose: real quotes are never translated.
//
// The choice is saved in localStorage ("lang") and set on <html lang="...">.
(function () {
  var LANGS = window.I18N_LANGS = window.I18N_LANGS || {};
  var DEFAULT = 'nl';
  var current = DEFAULT;
  var scanned = false;
  var textNodes = [];   // { node, orig }
  var attrItems = [];   // { el, attr, orig }
  var docItems = [];    // title + meta description
  var ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function hasLetters(s) { return /[A-Za-zÀ-ÿ]{2}|\d,\d/.test(s); }   // also catches decimals like 4,3

  function lookup(nl) {
    var d = LANGS[current];
    if (!d) return nl;
    var k = norm(nl);
    return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : nl;
  }

  function skipNode(n) {
    for (var p = n.parentNode; p && p.nodeType === 1; p = p.parentNode) {
      if (SKIP_TAGS[p.tagName] || p.tagName === 'symbol') return true;
      var l = p.getAttribute('lang');
      if (l && p !== document.documentElement) return true;   // lang="nl" blocks (reviews) stay as written
    }
    return false;
  }

  function scan() {
    if (scanned) return;
    scanned = true;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      if (!hasLetters(n.nodeValue) || skipNode(n)) continue;
      textNodes.push({ node: n, orig: n.nodeValue });
    }
    var sel = ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
    Array.prototype.forEach.call(document.body.querySelectorAll(sel), function (el) {
      if (skipNode(el.firstChild || el)) return;
      ATTRS.forEach(function (a) {
        if (el.hasAttribute(a) && hasLetters(el.getAttribute(a))) attrItems.push({ el: el, attr: a, orig: el.getAttribute(a) });
      });
    });
    docItems.push({ get: function () { return document.title; }, set: function (v) { document.title = v; }, orig: document.title });
    var meta = document.querySelector('meta[name="description"]');
    if (meta) docItems.push({ get: function () { return meta.content; }, set: function (v) { meta.content = v; }, orig: meta.content });
  }

  function apply() {
    scan();
    textNodes.forEach(function (it) {
      var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(it.orig);
      var tr = lookup(it.orig);
      it.node.nodeValue = tr === it.orig ? it.orig : m[1] + tr + m[3];
    });
    attrItems.forEach(function (it) { it.el.setAttribute(it.attr, lookup(it.orig)); });
    docItems.forEach(function (it) { it.set(lookup(it.orig)); });
  }

  function setLang(code, persist) {
    if (code !== DEFAULT && !LANGS[code]) code = DEFAULT;
    current = code;
    document.documentElement.lang = code;
    if (code !== DEFAULT || scanned) apply();
    Array.prototype.forEach.call(document.querySelectorAll('.lang-switch [data-lang]'), function (b) {
      var on = b.getAttribute('data-lang') === code;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('is-active', on);
    });
    if (persist) { try { localStorage.setItem('lang', code); } catch (e) {} }
    document.documentElement.classList.remove('i18n-pending');
    document.dispatchEvent(new CustomEvent('langchange', { detail: code }));
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.lang-switch [data-lang]');
    if (b) setLang(b.getAttribute('data-lang'), true);
  });

  window.I18N = {
    t: lookup,
    setLang: setLang,
    get lang() { return current; },
    // for checking translations: every Dutch string on the page, and which have no translation
    strings: function () {
      scan();
      var seen = {};
      textNodes.forEach(function (i) { seen[norm(i.orig)] = 1; });
      attrItems.forEach(function (i) { seen[norm(i.orig)] = 1; });
      docItems.forEach(function (i) { seen[norm(i.orig)] = 1; });
      return Object.keys(seen);
    },
    missing: function (code) {
      var d = LANGS[code] || {};
      return this.strings().filter(function (s) { return !Object.prototype.hasOwnProperty.call(d, s); });
    }
  };

  var saved = DEFAULT;
  try { saved = localStorage.getItem('lang') || DEFAULT; } catch (e) {}
  setLang(saved, false);
})();
