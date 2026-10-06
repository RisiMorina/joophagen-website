// Step-by-step contact form (contact.html).
// The normal single form stays in the HTML and keeps working without JavaScript.
// With JavaScript this turns it into four steps:
//   1 what to learn (vehicle)  2 variant (only auto / motor / truck)  3 earlier lessons  4 the existing fields
// The answers are written into hidden fields; the "Gewenste rijopleiding" select is filled automatically.
// Links like contact.html?rijbewijs=B&versnelling=automaat&lessen=nee skip the steps already answered.
(function () {
  var form = document.getElementById('contact-form');
  var wiz = document.getElementById('wiz');
  if (!form || !wiz) return;

  var t = function (s) { return window.I18N ? window.I18N.t(s) : s; };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- what each vehicle means (all values stay Dutch: they go into the e-mail the school reads)
  var VEHICLES = {
    scooter:     { name: 'Scooter',            code: 'AM',        select: 'Scooter (AM)' },
    auto:        { name: 'Auto',               code: 'B',         select: 'Auto (B)' },
    motor:       { name: 'Motor',              code: 'A1 / A2 / A', select: 'Motor (A1 / A2 / A)' },
    aanhanger:   { name: 'Auto met aanhanger', code: 'BE',        select: 'Auto met aanhanger (BE)' },
    vrachtwagen: { name: 'Vrachtwagen',        code: 'C / CE',    select: 'Vrachtwagen (C)' },
    bus:         { name: 'Bus',                code: 'D',         select: 'Bus (D)' },
    taxi:        { name: 'Taxi',               code: '',          select: 'Taxi' }
  };
  var LESSONS = {
    nee:    { answer: 'Nee',                          words: 'nog geen les' },
    paar:   { answer: 'Ja, een paar lessen',          words: 'een paar lessen gehad' },
    examen: { answer: 'Ja, ik heb al examen gedaan',  words: 'al examen gedaan' }
  };
  var UNSURE = 'weet ik nog niet';

  // ---------- links from the homepage (rijbewijs=...) and from the price pop-ups (dienst=...)
  var FROM_CODE = {
    AM: ['scooter'], B: ['auto'], BE: ['aanhanger'], D: ['bus'], taxi: ['taxi'],
    A1: ['motor', 'A1'], A2: ['motor', 'A2'], A: ['motor', 'A'], motor: ['motor'],
    C: ['vrachtwagen', 'C'], CE: ['vrachtwagen', 'CE'], vrachtwagen: ['vrachtwagen']
  };
  var FROM_DIENST = {
    'Auto (B)': ['auto'], 'Auto (B), schakel': ['auto', 'schakel'], 'Auto (B), automaat': ['auto', 'automaat'],
    'Auto met aanhanger (BE)': ['aanhanger'], 'Motor (A1 / A2 / A)': ['motor'], 'Scooter (AM)': ['scooter'],
    'Vrachtwagen (C)': ['vrachtwagen', 'C'], 'Vrachtwagen met aanhanger (CE)': ['vrachtwagen', 'CE'],
    'Bus (D)': ['bus'], 'Taxi': ['taxi']
  };

  var state = { vehicle: null, variant: null, lessons: null };
  var params = new URLSearchParams(window.location.search);
  var dienst = params.get('dienst');
  var code = params.get('rijbewijs');
  var start = code ? FROM_CODE[code] : (dienst ? FROM_DIENST[dienst.trim()] : null);

  // a link for something the wizard does not cover (camper, tractor, theory...): keep the classic form
  if (!start && dienst) return;

  if (start) {
    state.vehicle = start[0];
    state.variant = start[1] || null;
    var gearParam = params.get('versnelling');
    if (state.vehicle === 'auto' && (gearParam === 'schakel' || gearParam === 'automaat')) state.variant = gearParam;
  }
  var lessenParam = params.get('lessen');
  if (state.vehicle && LESSONS[lessenParam]) state.lessons = lessenParam;

  // ---------- elements
  var steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4')
  };
  var countEl = document.getElementById('wiz-count');
  var barEl = document.getElementById('wiz-bar-fill');
  var summaryEl = document.getElementById('wiz-summary');
  var nav = document.getElementById('wiz-nav');
  var backBtn = document.getElementById('wiz-back');
  var select = document.getElementById('categorie');
  var seatBox = wiz.querySelector('.wiz-seat');
  var picksBox = document.getElementById('wiz-picks');
  var gs = null;   // the dashboard drawing and the two gear buttons come from the shared component (gear-scene.js)
  if (window.GearScene && seatBox && picksBox) {
    seatBox.insertAdjacentHTML('afterbegin', window.GearScene.dashboard(250));
    gs = window.GearScene.mountPicks(picksBox);
  }
  var current = 0, busy = false;

  // hidden fields that carry the answers into the e-mail
  var hidden = {};
  ['voertuig', 'keuze', 'eerdere_lessen', 'samenvatting'].forEach(function (name) {
    var input = document.createElement('input');
    input.type = 'hidden'; input.name = name;
    form.appendChild(input);
    hidden[name] = input;
  });

  // ---------- derived values
  function needsVariant(v) { return v === 'auto' || v === 'motor' || v === 'vrachtwagen'; }
  function stepList() { return needsVariant(state.vehicle) ? [1, 2, 3, 4] : (state.vehicle ? [1, 3, 4] : [1, 2, 3, 4]); }

  function licenceCode() {
    var v = state.vehicle;
    if (!v) return '';
    if (v === 'motor') return state.variant && state.variant !== UNSURE ? state.variant : 'A1 / A2 / A';
    if (v === 'vrachtwagen') return state.variant && state.variant !== UNSURE ? state.variant : 'C / CE';
    return VEHICLES[v].code;
  }
  // translate = false gives the Dutch text for the e-mail
  function summary(translate) {
    var tt = translate ? t : function (s) { return s; };
    var v = state.vehicle, parts = [];
    if (!v) return '';
    parts.push(v === 'taxi' ? tt('Taxipas') : tt('Rijbewijs') + ' ' + licenceCode());
    if (v === 'auto' && (state.variant === 'schakel' || state.variant === 'automaat')) parts.push(tt(state.variant));
    if (state.lessons) parts.push(tt(LESSONS[state.lessons].words));
    return parts.join(' · ');
  }
  function selectValue() {
    var v = state.vehicle;
    if (!v) return '';
    if (v === 'auto') return state.variant === 'schakel' || state.variant === 'automaat' ? 'Auto (B), ' + state.variant : 'Auto (B)';
    if (v === 'vrachtwagen' && state.variant === 'CE') return 'Vrachtwagen met aanhanger (CE)';
    return VEHICLES[v].select;
  }

  function sync() {
    var v = state.vehicle;
    hidden.voertuig.value = v ? VEHICLES[v].name : '';
    hidden.keuze.value = state.variant || '';
    hidden.eerdere_lessen.value = state.lessons ? LESSONS[state.lessons].answer : '';
    hidden.samenvatting.value = summary(false);
    select.value = selectValue();
    summaryEl.textContent = summary(true);
    summaryEl.hidden = !summaryEl.textContent;
    // pressed state of every choice
    Array.prototype.forEach.call(wiz.querySelectorAll('[data-vehicle]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-vehicle') === v ? 'true' : 'false');
    });
    Array.prototype.forEach.call(wiz.querySelectorAll('[data-value]'), function (b) {
      var parent = b.closest('.wiz-step');
      var on = parent.id === 'step-3' ? b.getAttribute('data-value') === state.lessons : b.getAttribute('data-value') === state.variant;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    Array.prototype.forEach.call(wiz.querySelectorAll('[data-gear]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-gear') === state.variant ? 'true' : 'false');
    });
  }

  function updateProgress() {
    var list = stepList();
    var n = list.indexOf(current) + 1, total = list.length;
    countEl.textContent = t('Stap') + ' ' + n + ' ' + t('van') + ' ' + total;
    barEl.style.width = (n / total * 100) + '%';
  }

  // ---------- showing a step
  function variantBlock() {
    return steps[2].querySelector('.wiz-variant[data-for="' + state.vehicle + '"]');
  }
  function prepare(n) {
    if (n === 2) {
      Array.prototype.forEach.call(steps[2].querySelectorAll('.wiz-variant'), function (b) { b.hidden = b !== variantBlock(); });
    }
    if (n === 4) sync();
  }
  function headingOf(n) {
    if (n === 4) return document.getElementById('h-4');
    if (n === 2) return variantBlock().querySelector('.wiz-h');
    return steps[n].querySelector('.wiz-h');
  }

  // slide the old step out and the new one in (~0.3s); no movement with prefers-reduced-motion
  function show(n, dir, initial) {
    var list = stepList();
    var out = steps[current], inn = steps[n];
    var finish = function () {
      [1, 2, 3, 4].forEach(function (k) { steps[k].hidden = k !== n; });
      nav.hidden = false;
      busy = false;
      if (n === 2 && state.vehicle === 'auto') enterSeat(dir);
      if (!initial) headingOf(n).focus();
    };
    prepare(n);
    sync();
    var prev = current;
    current = n;
    updateProgress();
    if (initial || reduce || !out || out === inn || !out.animate) { finish(); return; }
    busy = true;
    var shift = 18 * dir;
    var a = out.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-shift) + 'px)' }], { duration: 120, easing: 'ease-in', fill: 'forwards' });
    a.onfinish = function () {
      a.cancel();
      out.hidden = true;
      inn.hidden = false;
      inn.animate([{ opacity: 0, transform: 'translateX(' + shift + 'px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
      finish();
    };
  }

  // from the side view of the car, zoom into the driver's seat; the gear buttons appear as the zoom ends
  function enterSeat(dir) {
    var side = wiz.querySelector('.wiz-side');
    if (!gs) return;
    var chosen = state.variant === 'schakel' || state.variant === 'automaat' ? state.variant : null;
    gs.set(chosen);
    if (reduce || !side.animate) {
      side.style.opacity = '0'; seatBox.style.opacity = '1'; picksBox.style.opacity = '1';
      return;
    }
    side.style.opacity = ''; seatBox.style.opacity = ''; picksBox.style.opacity = '';
    var opts = { duration: 1000, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' };
    side.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(3.4)', opacity: 1, offset: 0.55 },
      { transform: 'scale(7.5)', opacity: 0 }
    ], opts);
    seatBox.animate([
      { transform: 'scale(0.6)', opacity: 0 },
      { transform: 'scale(0.75)', opacity: 0, offset: 0.4 },
      { transform: 'scale(1)', opacity: 1 }
    ], opts);
    picksBox.animate([
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 0, transform: 'translateY(10px)', offset: 0.6 },
      { opacity: 1, transform: 'translateY(0)' }
    ], opts);
  }

  function next() {
    var list = stepList();
    var i = list.indexOf(current);
    show(list[Math.min(list.length - 1, i + 1)], 1);
  }
  function back() {
    var list = stepList();
    var i = list.indexOf(current);
    if (i > 0) { show(list[i - 1], -1); return; }
    // first step: back to where the visitor came from, or the homepage
    var sameSite = document.referrer && document.referrer.indexOf(window.location.host) !== -1;
    if (sameSite && window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
  }

  // ---------- events
  wiz.addEventListener('click', function (e) {
    if (busy) return;
    var btn = e.target.closest ? e.target.closest('button') : null;
    var pick = e.target.closest ? e.target.closest('[data-gear]') : null;   // the H gate / lever in the drawing

    if (btn && btn.hasAttribute('data-vehicle')) {
      var v = btn.getAttribute('data-vehicle');
      if (v !== state.vehicle) { state.vehicle = v; state.variant = null; }
      sync(); next();
    } else if (pick && current === 2 && state.vehicle === 'auto') {
      var kind = pick.getAttribute('data-gear');
      state.variant = kind;
      sync();
      busy = true;
      gs.play(kind, function () { setTimeout(function () { busy = false; next(); }, reduce ? 120 : 350); });
    } else if (btn && btn.hasAttribute('data-value') && current === 2) {
      state.variant = btn.getAttribute('data-value');
      sync(); next();
    } else if (btn && btn.hasAttribute('data-value') && current === 3) {
      state.lessons = btn.getAttribute('data-value');
      sync(); next();
    }
  });
  backBtn.addEventListener('click', function () { if (!busy) back(); });
  document.addEventListener('langchange', function () { updateProgress(); sync(); });

  // ---------- go
  wiz.hidden = false;
  document.getElementById('h-4').hidden = false;
  form.classList.add('wiz-on');
  var oldNote = document.getElementById('dienst-note');   // the summary line replaces the old "Je vraagt een intake aan voor" note
  if (oldNote) oldNote.style.display = 'none';
  var first = !state.vehicle ? 1 : (needsVariant(state.vehicle) && !state.variant ? 2 : (!state.lessons ? 3 : 4));
  [1, 2, 3, 4].forEach(function (k) { steps[k].hidden = true; });
  show(first, 1, true);
  // the first step must also be correct when the page opens on step 2 (the drawing needs its state)
})();
