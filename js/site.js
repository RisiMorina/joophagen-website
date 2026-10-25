// Business details used on every page: footer, opening hours tables and the
// LocalBusiness structured data (JSON-LD). Change a detail here, once.
//
// Load this file BEFORE i18n.js so the text it writes gets translated.
(function () {
  var SITE = window.SITE = {
    name: 'Verkeersschool Joop Hagen',
    street: 'Hunneperkade 42',
    zip: '7418 BT',
    city: 'Deventer',
    phone: '0570 63 50 36',
    tel: '+31570635036',
    email: 'info@joophagen.nl',
    kvk: '08114076',
    instagram: 'https://www.instagram.com/rijschooljoophagen/',
    facebook: 'https://nl-nl.facebook.com/RijschoolJoopHagen',
    // TODO: vervangen door het echte domein bij livegang.
    url: 'https://risimorina.github.io/joophagen-website/',
    // Opening hours: change them here. Day names are Dutch (they get translated).
    hours: [
      ['Maandag', 'Monday', '09:00', '17:30'],
      ['Dinsdag', 'Tuesday', '09:00', '17:30'],
      ['Woensdag', 'Wednesday', '09:00', '17:30'],
      ['Donderdag', 'Thursday', '09:00', '17:30'],
      ['Vrijdag', 'Friday', '09:00', '17:30'],
      ['Zaterdag', 'Saturday', '11:00', '16:00']
    ]
  };

  var addressLine = SITE.street + ', ' + SITE.zip + ' ' + SITE.city;
  var mapsEmbed = 'https://www.google.com/maps?q=' + encodeURIComponent(SITE.street + ', ' + SITE.zip + ' ' + SITE.city) + '&output=embed';
  var mapsRoute = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(SITE.street + ', ' + SITE.zip + ' ' + SITE.city);

  // Consecutive days with the same hours become one row: "Maandag t/m vrijdag".
  function groupedHours() {
    var rows = [];
    SITE.hours.forEach(function (h) {
      var last = rows[rows.length - 1];
      if (last && last.open === h[2] && last.close === h[3]) { last.to = h[0]; }
      else { rows.push({ from: h[0], to: null, open: h[2], close: h[3] }); }
    });
    return rows.map(function (r) {
      return { label: r.to ? r.from + ' t/m ' + r.to.toLowerCase() : r.from, time: r.open + ' – ' + r.close };
    });
  }

  function icon(id) {
    return '<svg width="20" height="20" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  // ---- Footer (every page has <footer class="site-footer" id="site-footer">) ----
  var footer = document.getElementById('site-footer');
  if (footer) {
    var hoursHtml = groupedHours().map(function (r) {
      return '<dt>' + r.label + '</dt><dd>' + r.time + '</dd>';
    }).join('');
    footer.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<img src="images/logo-joop-hagen-dun.svg" alt="' + SITE.name + '" class="footer-logo-img" width="284" height="56">' +
            '<p class="footer-blurb">Verkeersschool in Deventer voor bijna elk rijbewijs. Persoonlijk, modern en met een vaste instructeur.</p>' +
          '</div>' +
          '<div>' +
            '<h4>Navigatie</h4>' +
            '<ul>' +
              '<li><a href="index.html">Home</a></li>' +
              '<li><a href="diensten.html">Diensten</a></li>' +
              '<li><a href="webshop.html">Webshop</a></li>' +
              '<li><a href="vacatures.html">Vacatures</a></li>' +
              '<li><a href="contact.html">Contact</a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4>Contact</h4>' +
            '<ul>' +
              '<li>' + addressLine + '</li>' +
              '<li><a href="tel:' + SITE.tel + '">' + SITE.phone + '</a></li>' +
              '<li><a href="mailto:' + SITE.email + '">' + SITE.email + '</a></li>' +
            '</ul>' +
            '<div class="footer-social">' +
              '<a href="' + SITE.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + icon('i-instagram') + '</a>' +
              '<a href="' + SITE.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + icon('i-facebook') + '</a>' +
            '</div>' +
            '<h4 class="footer-hours-title">Openingstijden</h4>' +
            '<dl class="footer-hours">' + hoursHtml + '</dl>' +
          '</div>' +
          '<div class="footer-map">' +
            '<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="' + mapsEmbed + '" title="Kaart naar ' + SITE.name + '"></iframe>' +
            '<a class="btn btn-outline-light btn-small" href="' + mapsRoute + '" target="_blank" rel="noopener">Route plannen</a>' +
          '</div>' +
        '</div>' +
        '<div class="lane-divider on-dark" style="margin-bottom:1.4em;"></div>' +
        '<div class="footer-bottom">' +
          '<span>© ' + new Date().getFullYear() + ' ' + SITE.name + '</span>' +
          '<span>KvK ' + SITE.kvk + ' · <a href="privacy.html">Privacy</a></span>' +
        '</div>' +
      '</div>';
  }

  // ---- Hours table on the contact page: <table class="hours-table" data-hours> ----
  var table = document.querySelector('table[data-hours]');
  if (table) {
    table.innerHTML = SITE.hours.map(function (h) {
      return '<tr><td>' + h[0] + '</td><td>' + h[2] + ' – ' + h[3] + '</td></tr>';
    }).join('');
  }

  // ---- LocalBusiness structured data ----
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE.name,
    url: SITE.url,
    image: SITE.url + 'images/og-image.jpg',
    telephone: SITE.tel,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.street,
      postalCode: SITE.zip,
      addressLocality: SITE.city,
      addressCountry: 'NL'
    },
    openingHoursSpecification: SITE.hours.map(function (h) {
      return { '@type': 'OpeningHoursSpecification', dayOfWeek: h[1], opens: h[2], closes: h[3] };
    }),
    identifier: { '@type': 'PropertyValue', propertyID: 'KvK', value: SITE.kvk },
    sameAs: [SITE.instagram, SITE.facebook]
  };
  var s = document.createElement('script');
  s.type = 'application/ld+json';
  s.text = JSON.stringify(ld);
  document.head.appendChild(s);
})();
