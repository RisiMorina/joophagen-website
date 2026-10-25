// Dutch text -> current language (see i18n.js). Falls back to the Dutch text.
function t(nl) { return window.I18N ? window.I18N.t(nl) : nl; }

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // Scroll reveal: sections/cards fade + rise into view as the visitor
  // scrolls down, echoing the "journey" idea from the hero animation.
  var revealTargets = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && revealTargets.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Fleet photo: the image drifts slowly against the scroll direction
  // while its section passes through the viewport (light parallax).
  var fleetImg = document.querySelector('.fleet-frame img');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fleetImg && !reduceMotion) {
    var fleetTicking = false;
    var moveFleet = function () {
      var rect = fleetImg.parentNode.getBoundingClientRect();
      var vh = window.innerHeight;
      if (rect.bottom > 0 && rect.top < vh) {
        // -1 when the photo enters at the bottom, 1 when it leaves at the top
        var progress = 1 - (rect.top + rect.height) / (vh + rect.height) * 2;
        fleetImg.style.transform = 'translate3d(0,' + (progress * 5).toFixed(2) + '%,0)';
      }
      fleetTicking = false;
    };
    window.addEventListener('scroll', function () {
      if (!fleetTicking) { fleetTicking = true; requestAnimationFrame(moveFleet); }
    }, { passive: true });
    moveFleet();
  }

  // Diensten page pop-ups live in js/diensten.js (no prices on the site until Sabine agrees).
  // Coming from a "Plan intake voor [dienst]" link (?dienst=Auto+(B))?
  // Pre-select the matching option in the service dropdown, if present.
  var categorieSelect = document.getElementById('categorie');
  if (categorieSelect) {
    var dienstParam = new URLSearchParams(window.location.search).get('dienst');
    if (dienstParam) {
      var matched = false;
      Array.prototype.forEach.call(categorieSelect.options, function (opt) {
        if (opt.value.trim() === dienstParam.trim()) {
          opt.selected = true;
          matched = true;
        }
      });
      if (matched) {
        var noteEl = document.getElementById('dienst-note');
        if (noteEl) {
          function writeNote() { noteEl.textContent = t('Je vraagt een intake aan voor:') + ' ' + t(dienstParam); }
          writeNote();
          document.addEventListener('langchange', writeNote);
          noteEl.classList.add('show');
        }
      }
    }
  }
  // Contact form. Backends auto-detected from the form's own action/
  // attributes, no need to edit this file either way:
  //   - Netlify Forms (form has data-netlify="true"): posts to the current
  //     page as Netlify expects, so it captures the submission.
  //   - FormSubmit.co or self-hosted PHP (action contains "formsubmit.co"
  //     or ends in ".php"): a real, non-JS form submission, both redirect
  //     back with ?verzonden=1 or ?fout=1, which this script checks for on
  //     page load.
  //   - Formspree or similar (any other real "action" URL): posts there
  //     via fetch. See the comment in contact.html to switch between them.
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var errorBox = document.getElementById('form-error');

  function isNativeSubmitBackend(actionAttr) {
    return /\.php(\?|$)/.test(actionAttr) || actionAttr.indexOf('formsubmit.co') !== -1;
  }

  function encodeFormData(data) {
    return new URLSearchParams(data).toString();
  }

  function showError(message, submitBtn) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add('show');
    }
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = t('Versturen'); }
  }

  function showSuccess() {
    form.style.display = 'none';
    if (success) success.classList.add('show');
  }

  // FormSubmit.co / self-hosted PHP land back here with a query string
  // after a real page reload (no fetch involved), check on every load.
  if (form && isNativeSubmitBackend(form.getAttribute('action') || '')) {
    var params = new URLSearchParams(window.location.search);
    if (params.get('verzonden') === '1') showSuccess();
    if (params.get('fout') === '1') {
      showError(t('Er ging iets mis bij het verzenden. Probeer het opnieuw of bel ons direct.'), null);
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      var actionAttr = form.getAttribute('action') || '';

      // FormSubmit.co / self-hosted PHP: let the browser submit this like
      // a normal HTML form (full page reload, possibly via FormSubmit's
      // own reCAPTCHA step). The backend redirects back with the result.
      if (isNativeSubmitBackend(actionAttr)) {
        if (!form.checkValidity()) {
          e.preventDefault();
          form.reportValidity();
          return;
        }
        if (actionAttr.indexOf('CHANGE_THIS_EMAIL') !== -1) {
          e.preventDefault();
          showError(t('Het formulier is nog niet gekoppeld aan een e-mailadres (zie instructies in dit bestand).'), null);
          return;
        }
        // FormSubmit's "_next" (and the self-hosted PHP script's redirect)
        // need a full, absolute URL back to THIS site, not a relative
        // path, which would resolve against formsubmit.co's own domain
        // instead. Fill it in right before the real submit happens, so it
        // always matches wherever this site actually ends up hosted.
        var nextField = document.getElementById('next-field');
        if (nextField) {
          nextField.value = window.location.origin + window.location.pathname + '?verzonden=1';
        }
        return; // otherwise do not preventDefault, real submit continues
      }

      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = t('Versturen...'); }

      if (form.hasAttribute('data-netlify')) {
        // Netlify Forms: submit as a normal urlencoded POST to the page
        // itself. Netlify's servers scan for the form-name field to match
        // it to the form detected at deploy time.
        fetch(window.location.pathname, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodeFormData(new FormData(form))
        }).then(function (response) {
          if (response.ok) { showSuccess(); }
          else { throw new Error('Verzenden mislukt'); }
        }).catch(function () {
          showError(t('Er ging iets mis bij het verzenden. Probeer het opnieuw of bel ons direct.'), submitBtn);
        });
        return;
      }

      if (!form.action || form.action.indexOf('YOUR_FORM_ID') !== -1) {
        showError(t('Het formulier is nog niet gekoppeld aan een verzendservice (zie instructies in contact.html).'), submitBtn);
        return;
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) { showSuccess(); }
        else { throw new Error('Verzenden mislukt'); }
      }).catch(function () {
        showError(t('Er ging iets mis bij het verzenden. Probeer het opnieuw of bel ons direct.'), submitBtn);
      });
    });
  }
});
