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

  // Diensten page: clicking a service card opens a popup with the full
  // description and pricing (where known) for that service, plus a
  // "plan intake" link. Arriving via an anchor (e.g. from the homepage
  // service tiles) auto-opens the matching popup.
  var dienstCards = document.querySelectorAll('.dienst-card');
  var dienstModal = document.getElementById('dienst-modal');

  if (dienstCards.length && dienstModal) {
    var modalBody = document.getElementById('dienst-modal-body');

    function priceRows(rows) {
      return rows.map(function (r) {
        if (r.group) return '<tr class="price-group"><td colspan="2">' + r.group + '</td></tr>';
        return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
      }).join('');
    }

    var data = {
      'auto': {
        title: 'Auto', iconViewBox: '0 0 48 32', icon: 'i-car', meta: 'Rijbewijs B',
        desc: 'Vanaf 16,5 jaar mag je beginnen met autorijlessen voor rijbewijs B. Vanaf 17 jaar mag je oefenen met een begeleider (2toDrive), en zodra je 18 bent en geslaagd, mag je direct zelf de weg op.',
        dienstParam: 'Auto (B)',
        priceDate: 'Prijspeil 1 juli 2026',
        rows: [
          {group:'Losse rijlessen'}, ['Autorijles 60 minuten','€ 67,50'], ['Automaatrijles 60 minuten','€ 67,50'],
          {group:'Pakketten rijlessen 60 minuten'}, ['Pakket eerste 10 rijlessen','€ 605,00'], ['20 rijlessen + praktijkexamen','€ 1.597,50'], ['25 rijlessen + praktijkexamen','€ 1.935,00'], ['30 rijlessen + praktijkexamen','€ 2.272,50'], ['35 rijlessen + praktijkexamen','€ 2.610,00'], ['40 rijlessen + praktijkexamen','€ 2.947,50'],
          {group:'Examens'}, ['Praktijkexamen','€ 317,50'], ['BNOR-examen','€ 337,50'], ['Faalangstexamen','€ 367,50'],
          {group:'Theorie'}, ['Theoriecursus incl. theorie-examen','€ 140,00']
        ]
      },
      'auto-aanhanger': {
        title: 'Auto met aanhanger', iconViewBox: '0 0 60 32', icon: 'i-car-trailer', meta: 'Rijbewijs BE',
        desc: 'Heb je rijbewijs B en ben je 18 jaar of ouder? Dan kun je bij ons ook het aanhangerrijbewijs (BE) halen — desgewenst in één dag, of verspreid over meerdere lessen.',
        dienstParam: 'Auto met aanhanger (BE)',
        priceDate: 'Prijspeil 15 april 2026',
        rows: [
          {group:'Losse rijlessen (incl. BTW)'}, ['Intake rijles 90 minuten','€ 115,00'], ['Rijles 60 minuten','€ 80,00'],
          {group:'Praktijkexamen (incl. BTW)'}, ['Praktijkexamen','€ 317,50'],
          {group:'Pakketten (45 min. per les, incl. praktijkexamen)'}, ['4 rijlessen BE','€ 547,50'], ['6 rijlessen BE','€ 665,00'], ['8 rijlessen BE','€ 785,00']
        ]
      },
      'motor': {
        title: 'Motor', iconViewBox: '0 0 48 32', icon: 'i-motor', meta: 'A1 · A2 · A',
        desc: 'Motorrijbewijzen zijn onderverdeeld naar leeftijd en vermogen: A1 voor lichte motoren, A2 voor middelzware motoren en A voor zware motoren. Onze instructeurs adviseren je graag over de juiste categorie. Nog nooit op een motor gezeten? Maak een afspraak voor een "Try the Bike" en ervaar hoe dat is!',
        dienstParam: 'Motor (A1 / A2 / A)',
        priceDate: 'Prijspeil 1 maart 2026',
        rows: [
          {group:'Losse rijlessen'}, ['Motorrijles 90 minuten','€ 75,00'],
          {group:'Praktijkexamen'}, ['Voertuigbeheersing (AVB)','€ 142,50'], ['Verkeersdeelneming (AVD)','€ 317,50'],
          {group:'Pakketten (60 min, incl. AVB + AVD)'}, ['16 rijlessen + praktijkexamens','€ 1.225,00'], ['24 rijlessen + praktijkexamens','€ 1.620,00'], ['32 rijlessen + praktijkexamens','€ 2.002,50']
        ]
      },
      'scooter': {
        title: 'Scooter', iconViewBox: '0 0 48 32', icon: 'i-scooter', meta: 'Rijbewijs AM',
        desc: 'Het bromfiets- en scooterrijbewijs (AM) kun je al vanaf je 16e behalen. We geven rijlessen op de scooter en bereiden je goed voor op het praktijkexamen. Volg bij ons de eendaagse cursus en haal in één dag je scooterrijbewijs.',
        dienstParam: 'Scooter (AM)',
        priceDate: 'Prijspeil 1 mei 2026',
        rows: [
          {group:'Losse rijlessen'}, ['Losse scooterrijles 60 minuten','€ 40,00'], ['Individuele scooterrijles 60 minuten','€ 65,00'],
          {group:'Praktijkexamen'}, ['Praktijkexamen','€ 222,50'],
          {group:'Pakketten (5,5 rijlessen 60 min. + praktijkexamen)'}, ['Zorgeloos pakket, online theoriecursus','€ 505,00'], ['Zorgeloos pakket, klassikale theoriecursus','€ 575,00'], ['Alleen rijlessen (zonder theorie)','€ 442,50'],
          {group:'Theorie-examen'}, ['Theoriecursus incl. theorie-examen','€ 140,00'], ['Theoriecursus, zelf examen plannen','€ 100,00']
        ]
      },
      'camper': {
        title: 'Camper of kleine vrachtwagen', iconViewBox: '0 0 48 32', icon: 'i-camper', meta: 'Rijbewijs B/C1',
        desc: 'Wil je op reis met een camper of een lichte bedrijfswagen besturen? Wij leren je veilig omgaan met het grotere formaat en gewicht.',
        dienstParam: 'Camper of kleine vrachtwagen',
        priceDate: 'Prijspeil 1 maart 2026',
        rows: [
          {group:'Losse rijlessen (incl. BTW)'}, ['Praktijkles 60 minuten','€ 99,83'],
          {group:'Praktijkexamen (incl. BTW)'}, ['Praktijkexamen','€ 450,00'],
          {group:'Theorie'}, ['Theoriecursus Vakbekwaamheid (RVM1-C), incl. examen','€ 584,54'],
          {group:'Zelfstudiepakket'}, ['Lesboek + 12,5 uur online examentraining','€ 94,20'], ['Lesboek + 12,5 uur uitgebreide e-learning','€ 143,45']
        ]
      },
      'tractor': {
        title: 'Tractor', iconViewBox: '0 0 48 32', icon: 'i-tractor', meta: 'Rijbewijs T',
        desc: 'Voor werk in de landbouw of groenvoorziening leiden we je op voor het trekkerrijbewijs, inclusief het manoeuvreren met aanhangers — lessen worden gegeven op onze eigen New Holland tractor.',
        dienstParam: 'Tractor (T)',
        priceDate: 'Prijspeil 1 maart 2026',
        rows: [
          {group:'Losse rijlessen'}, ['Tractorrijles 60 minuten','€ 95,00'],
          {group:'Praktijkexamen'}, ['Praktijkexamen','€ 470,00'],
          {group:'Theorie'}, ['Praktijkboek en speedtheorie','€ 69,75'], ['Theoriecursus incl. theorie-examen','€ 140,00']
        ]
      },
      'vrachtwagen': {
        title: 'Vrachtwagen', iconViewBox: '0 0 48 32', icon: 'i-truck', meta: 'Rijbewijs C',
        desc: 'Wij zijn de nummer één rijschool in de regio voor het rijbewijs vrachtwagen. Onze ervaren instructeurs leren je alles over het veilig besturen van grote voertuigen.',
        dienstParam: 'Vrachtwagen (C)',
        priceDate: 'Prijspeil 1 april 2026',
        rows: [
          {group:'Losse rijlessen (incl. BTW)'}, ['Praktijkles C 60 minuten','€ 97,50'],
          {group:'Praktijkexamen (incl. BTW)'}, ['Praktijkexamen C','€ 450,00'],
          {group:'Toetsen (excl. afmeldkosten, incl. BTW)'}, ['Vakbekwaamheid praktische toets C (VPTC, code 95)','€ 484,00'], ['Vakbekwaamheid toets besloten terrein (VPBC, code 95)','€ 423,50'],
          {group:'Theorie (incl. BTW)'}, ['Vakbekwaamheid RVM1-C, lessen + boeken + examen','€ 584,54'], ['Vakbekwaamheid VM2-C, lessen + boeken + examen','€ 341,96'], ['Vakbekwaamheid VM3-C, lessen + boeken + examen','€ 341,96'],
          {group:'Zelfstudiepakketten'}, ['Vrachtwagen (incl. code 95)','€ 253,30'], ['Vrachtwagen excellent (incl. code 95)','€ 337,65']
        ]
      },
      'vrachtwagen-aanhanger': {
        title: 'Vrachtwagen met aanhanger', iconViewBox: '0 0 60 32', icon: 'i-truck-trailer', meta: 'Rijbewijs CE',
        desc: 'Naast het vrachtwagenrijbewijs kun je bij ons ook het rijbewijs voor vrachtwagen met aanhanger halen, inclusief uitgebreide manoeuvreertraining.',
        dienstParam: 'Vrachtwagen met aanhanger (CE)',
        priceDate: 'Prijspeil 1 april 2026',
        rows: [
          {group:'Losse rijlessen (incl. BTW)'}, ['Praktijkles CE 60 minuten','€ 110,00'],
          {group:'Praktijkexamen (incl. BTW)'}, ['Praktijkexamen CE','€ 489,57']
        ]
      },
      'lzv': {
        title: 'LZV-chauffeur', iconViewBox: '0 0 64 32', icon: 'i-lzv', meta: 'Certificaat LZV',
        desc: 'Voor de Langere en Zwaardere Vrachtautocombinatie (ecocombi) is geen apart rijbewijs nodig, maar wel een certificaat. Wij leiden je hiervoor op, geldig sinds 1 maart 2015 onbeperkt.',
        dienstParam: 'LZV-chauffeur',
        priceDate: 'Prijspeil 1 maart 2026',
        rows: [
          {group:'Opleiding'}, ['Chauffeur LZV (W06)','€ 1.425,00']
        ],
        note: 'Prijs exclusief BTW en afmeldkosten CCV/CBR.'
      },
      'taxi': {
        title: 'Taxi', iconViewBox: '0 0 48 32', icon: 'i-taxi', meta: 'Taxipas',
        desc: 'Wil je als taxichauffeur aan de slag? Wij bereiden je voor op de rij- en ondernemersvaardigheden die nodig zijn voor de taxipas.',
        dienstParam: 'Taxi',
        priceDate: 'Prijspeil 1 maart 2026',
        rows: [
          {group:'Losse rijlessen (incl. BTW)'}, ['Praktijkles 60 minuten','€ 75,00'],
          {group:'Praktijkexamen (incl. BTW)'}, ['Praktijkexamen','€ 450,00'],
          {group:'Pakket'}, ['3 lessen (90 min.) incl. praktijkexamen — minimaal af te nemen','€ 787,50'],
          {group:'Theorie (incl. BTW)'}, ['Lesboek en examentraining','€ 71,20'], ['Theorie-examen','€ 75,00']
        ]
      },
      'nascholing': {
        title: 'Nascholing Code 95', iconViewBox: '0 0 24 24', icon: 'i-refresh', meta: 'Verplichte nascholing',
        desc: 'Beroepschauffeurs zijn verplicht om periodiek bij te scholen. Wij bieden de nascholingscursussen aan die nodig zijn om Code 95 op je rijbewijs geldig te houden.',
        dienstParam: 'Nascholing Code 95',
        priceDate: 'Prijspeil 1 maart 2026',
        rows: [
          {group:'Modules (excl. BTW en afmeldkosten CCV/CBR)'},
          ['U03 STL Lading zekeren','€ 150,00'], ['U19 Leefstijl','€ 150,00'], ['U23 Digitale tachograaf','€ 150,00'],
          ['U24 Chauffeursdag','€ 150,00'], ['U25-1 Rijoptimalisatie (klassikaal)','€ 150,00'], ['U39 Techniek en veiligheid','€ 150,00'], ['U45 Actualisering kennis vakbekwaamheid','€ 150,00'],
          ['W01 Rijvaardigheid incl. HNR (e-learning)','€ 275,00'], ['W01 Rijvaardigheid incl. HNR','€ 349,00'],
          ['W02 Rijoptimalisatie (e-learning)','€ 275,00'], ['W02 Rijoptimalisatie','€ 349,00']
        ]
      },
      'theorie': {
        title: 'Theorie', iconViewBox: '0 0 24 24', icon: 'i-book', meta: 'Alle categorieën',
        desc: 'Voor bijna elke categorie bieden we compacte theoriecursussen aan, gericht op een goede voorbereiding op het CBR-theorie-examen. Ook los te volgen naast je rijlessen.',
        dienstParam: 'Theorie',
        priceDate: 'Prijspeil 2026',
        rows: [
          {group:'Theorie'}, ['Theoriecursus incl. theorie-examen','€ 140,00'], ['Huur studiemateriaal per product','€ 10,00']
        ],
        note: 'Exacte prijs kan iets afwijken per rijbewijscategorie.'
      }
    };

    function openModal(key) {
      var d = data[key];
      if (!d) return;
      var html = ''
        + '<div class="dienst-modal-head">'
        +   '<svg class="icon" viewBox="' + d.iconViewBox + '"><use href="#' + d.icon + '"/></svg>'
        +   '<h3 id="dienst-modal-title" style="margin:0;">' + d.title + '</h3>'
        + '</div>'
        + '<span class="dienst-modal-meta">' + d.meta + '</span>'
        + '<p>' + d.desc + '</p>';

      if (d.quote) {
        html += '<div class="quote-prompt">We stellen voor deze opleiding graag een passende prijsopgave voor je op, afgestemd op je situatie.</div>';
      } else {
        html += '<h4>Prijzen — ' + d.priceDate + '</h4>'
              + '<table class="price-table">' + priceRows(d.rows) + '</table>'
              + '<p class="price-note">' + (d.note || 'Prijswijzigingen voorbehouden — vraag naar de actuele prijzen bij het maken van een afspraak.') + '</p>';
      }

      html += '<a href="contact.html?dienst=' + encodeURIComponent(d.dienstParam) + '" class="btn btn-primary">Plan een intake voor dit rijbewijs</a>';

      modalBody.innerHTML = html;
      dienstModal.classList.add('open');
      dienstModal.setAttribute('aria-hidden', 'false');
      // Robust scroll-lock: plain overflow:hidden on body doesn't reliably
      // stop background touch-scrolling on iOS Safari, so also pin the
      // body in place and restore the exact scroll position on close.
      var scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      dienstModal.dataset.scrollY = scrollY;
    }

    function closeModal() {
      dienstModal.classList.remove('open');
      dienstModal.setAttribute('aria-hidden', 'true');
      var scrollY = parseInt(dienstModal.dataset.scrollY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    }

    dienstCards.forEach(function (card) {
      card.addEventListener('click', function () {
        openModal(card.getAttribute('data-key'));
      });
    });

    dienstModal.querySelectorAll('[data-close-modal]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    if (window.location.hash) {
      var target = document.querySelector(window.location.hash);
      if (target && target.classList.contains('dienst-card')) {
        openModal(target.getAttribute('data-key'));
      }
    }
  }
  // Coming from a "Plan intake voor [dienst]" link (?dienst=Auto+(B))?
  // Pre-select the matching option in the service dropdown, if present.
  var categorieSelect = document.getElementById('categorie');
  if (categorieSelect) {
    var dienstParam = new URLSearchParams(window.location.search).get('dienst');
    if (dienstParam) {
      var matched = false;
      Array.prototype.forEach.call(categorieSelect.options, function (opt) {
        if (opt.textContent.trim() === dienstParam.trim()) {
          opt.selected = true;
          matched = true;
        }
      });
      if (matched) {
        var noteEl = document.getElementById('dienst-note');
        if (noteEl) {
          noteEl.textContent = 'Je vraagt een intake aan voor: ' + dienstParam;
          noteEl.classList.add('show');
        }
      }
    }
  }
  // Contact form. Backends auto-detected from the form's own action/
  // attributes — no need to edit this file either way:
  //   - Netlify Forms (form has data-netlify="true"): posts to the current
  //     page as Netlify expects, so it captures the submission.
  //   - FormSubmit.co or self-hosted PHP (action contains "formsubmit.co"
  //     or ends in ".php"): a real, non-JS form submission — both redirect
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
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Versturen'; }
  }

  function showSuccess() {
    form.style.display = 'none';
    if (success) success.classList.add('show');
  }

  // FormSubmit.co / self-hosted PHP land back here with a query string
  // after a real page reload (no fetch involved) — check on every load.
  if (form && isNativeSubmitBackend(form.getAttribute('action') || '')) {
    var params = new URLSearchParams(window.location.search);
    if (params.get('verzonden') === '1') showSuccess();
    if (params.get('fout') === '1') {
      showError('Er ging iets mis bij het verzenden. Probeer het opnieuw of bel ons direct.', null);
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
          showError('Het formulier is nog niet gekoppeld aan een e-mailadres (zie instructies in dit bestand).', null);
          return;
        }
        // FormSubmit's "_next" (and the self-hosted PHP script's redirect)
        // need a full, absolute URL back to THIS site — not a relative
        // path, which would resolve against formsubmit.co's own domain
        // instead. Fill it in right before the real submit happens, so it
        // always matches wherever this site actually ends up hosted.
        var nextField = document.getElementById('next-field');
        if (nextField) {
          nextField.value = window.location.origin + window.location.pathname + '?verzonden=1';
        }
        return; // otherwise do not preventDefault — real submit continues
      }

      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Versturen...'; }

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
          showError('Er ging iets mis bij het verzenden. Probeer het opnieuw of bel ons direct.', submitBtn);
        });
        return;
      }

      if (!form.action || form.action.indexOf('YOUR_FORM_ID') !== -1) {
        showError('Het formulier is nog niet gekoppeld aan een verzendservice (zie instructies in contact.html).', submitBtn);
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
        showError('Er ging iets mis bij het verzenden. Probeer het opnieuw of bel ons direct.', submitBtn);
      });
    });
  }
});
