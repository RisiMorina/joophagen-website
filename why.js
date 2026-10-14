// "Waarom" cards (homepage), desktop and tablet (>= 900px) with motion only.
// GSAP + ScrollTrigger pin the section. The scroll is split in two phases:
//   1 (first ~70%)  the cards stack one after another, like the CSS sticky version
//   2 (last ~30%)   all four zoom out together into a 2x2 grid (FLIP: the target cells are
//                   measured from a hidden real CSS grid, .why-ghost, on every refresh)
// After phase 2 the section unpins and the grid stays; each card is then one big link.
// Without GSAP, on phones and with reduced motion, styles.css shows a static layout instead.
(function () {
  var section = document.querySelector('.why');
  var stage = document.getElementById('why-stack');
  if (!section || !stage || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var cards = gsap.utils.toArray(stage.querySelectorAll('.why-card'));
  var header = document.querySelector('.site-header');
  var STACK = 16;      // px each card sits lower than the one before (same as the CSS version)
  var GAP = 24;        // grid gap
  var PHASE1 = cards.length - 1;     // one unit per card that slides in
  var PHASE2 = PHASE1 * 0.3 / 0.7;   // so phase 2 is ~30% of the pinned scroll

  function headerHeight() { return header ? header.offsetHeight : 0; }

  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
    section.classList.add('why--pin');

    // Hidden real grid that tells us where each card ends up.
    var ghost = document.createElement('div');
    ghost.className = 'why-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    cards.forEach(function () { ghost.appendChild(document.createElement('div')); });
    stage.appendChild(ghost);

    var targets = [];
    function measure() {
      var cardW = cards[0].offsetWidth, cardH = cards[0].offsetHeight;
      var ratio = cardW / cardH;
      var avail = stage.clientHeight - GAP;            // keep a gap above the viewport edge
      var cellH = (avail - GAP) / 2;
      var gridW = Math.min(cardW, cellH * ratio * 2 + GAP);
      ghost.style.setProperty('--why-ratio', ratio);
      ghost.style.width = gridW + 'px';
      ghost.style.top = Math.max(0, (avail - ghost.offsetHeight) / 2) + 'px';

      var stageBox = stage.getBoundingClientRect();
      targets = cards.map(function (card, i) {
        var cell = ghost.children[i].getBoundingClientRect();
        var s = cell.width / cardW;
        return {
          s: s,
          // transform-origin is 50% 0, so scaling pulls the card in from both sides
          x: (cell.left - stageBox.left) - card.offsetLeft - cardW * (1 - s) / 2,
          y: (cell.top - stageBox.top) - card.offsetTop
        };
      });
    }
    measure();

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: function () { return 'top ' + headerHeight(); },
        end: function () { return '+=' + window.innerHeight * 3.2; },
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onUpdate: function (self) { section.classList.toggle('is-grid', self.progress > 0.98); }
      }
    });

    // Phase 1: stack. Each card slides up from below the screen; the one underneath shrinks a little.
    gsap.set(cards, { transformOrigin: '50% 0', filter: 'brightness(1)' });
    cards.forEach(function (card, i) {
      if (i === 0) return;
      tl.fromTo(card, { y: function () { return window.innerHeight; } }, { y: i * STACK, duration: 1 }, i - 1);
      tl.to(cards[i - 1], { scale: 0.96, filter: 'brightness(0.96)', duration: 1 }, i - 1);
    });

    // Phase 2: zoom out into the grid.
    cards.forEach(function (card, i) {
      tl.to(card, {
        x: function () { return targets[i].x; },
        y: function () { return targets[i].y; },
        scale: function () { return targets[i].s; },
        filter: 'brightness(1)',
        ease: 'power2.inOut',
        duration: PHASE2
      }, PHASE1);
    });
    // Only icon tile + headline stay readable at half size.
    tl.to(stage.querySelectorAll('.why-text p, .why-links, .why-label > span:not(.why-tile)'), {
      autoAlpha: 0, duration: PHASE2 * 0.2
    }, PHASE1 + PHASE2 * 0.8);

    return function () {
      section.classList.remove('why--pin', 'is-grid');
      ghost.remove();
    };
  });

  // Fonts and the lazy photo change card heights; re-measure once everything is in.
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
