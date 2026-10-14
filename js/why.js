// "Waarom" cards (homepage), desktop and tablet (>= 900px) with motion only.
// The page's own layout is a static 2x2 grid (styles.css). This script shows it as a pinned stack first:
//   1 (first ~70% of the pinned scroll)  the cards stack one after another
//   2 (last ~30%)  the text fades out, the cards move into their grid cells (FLIP: the cells are measured
//                  from .why-ghost, a hidden copy of the real grid) and the pin is removed for good.
// From then on it is the plain grid: scrolling back up never re-stacks it.
// If the page loads with the section already scrolled past, the grid is shown straight away.
(function () {
  var section = document.querySelector('.why');
  var stage = document.getElementById('why-stack');
  if (!section || !stage || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var cards = gsap.utils.toArray(stage.children);
  var header = document.querySelector('.site-header');
  var STACK = 16;                    // px each card sits lower than the one before
  var PHASE1 = cards.length - 1;     // one unit per card that slides in
  var PHASE2 = PHASE1 * 0.3 / 0.7;   // so phase 2 is ~30% of the pinned scroll
  var done = false;
  var mm = gsap.matchMedia();

  function headerHeight() { return header ? header.offsetHeight : 0; }

  function setup() {
    if (done) return;
    if (section.getBoundingClientRect().top <= headerHeight() + 1) { done = true; return; }
    section.classList.add('why--pin', 'why--stacked');

    var ghost = document.createElement('div');
    ghost.className = 'why-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.inert = true;
    stage.appendChild(ghost);

    var targets = [];
    function measure() {
      // Fresh copies each time, so the cells follow the current text (language) and width.
      ghost.innerHTML = '';
      cards.forEach(function (card) {
        var copy = card.cloneNode(true);
        copy.removeAttribute('href');
        copy.removeAttribute('aria-labelledby');
        [copy].concat([].slice.call(copy.querySelectorAll('*'))).forEach(function (el) {
          el.removeAttribute('style');
          el.removeAttribute('id');
        });
        ghost.appendChild(copy);
      });
      var stageBox = stage.getBoundingClientRect();
      targets = cards.map(function (card, i) {
        var cell = ghost.children[i].getBoundingClientRect();
        var w = card.offsetWidth, h = card.offsetHeight;
        var sx = cell.width / w, sy = cell.height / h;
        return {
          sx: sx,
          sy: sy,
          // transform-origin is 50% 0, so scaleX pulls the card in from both sides
          x: (cell.left - stageBox.left) - card.offsetLeft - w * (1 - sx) / 2,
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
        onLeave: finish
      }
    });

    // Phase 1: stack. Each card slides up from below the screen; the one underneath shrinks a little.
    gsap.set(cards, { transformOrigin: '50% 0', filter: 'brightness(1)' });
    cards.forEach(function (card, i) {
      if (i === 0) return;
      tl.fromTo(card, { y: function () { return window.innerHeight; } }, { y: i * STACK, duration: 1 }, i - 1);
      tl.to(cards[i - 1], { scale: 0.96, filter: 'brightness(0.96)', duration: 1 }, i - 1);
    });

    // Phase 2: the stack layout and the grid layout differ, so the text fades out
    // while the empty cards move into their cells; it comes back in the real grid (finish).
    tl.to(stage.querySelectorAll(':scope > .why-card > *'), { autoAlpha: 0, duration: PHASE2 * 0.25 }, PHASE1);
    cards.forEach(function (card, i) {
      tl.to(card, {
        x: function () { return targets[i].x; },
        y: function () { return targets[i].y; },
        scaleX: function () { return targets[i].sx; },
        scaleY: function () { return targets[i].sy; },
        filter: 'brightness(1)',
        ease: 'power2.inOut',
        duration: PHASE2 * 0.85
      }, PHASE1 + PHASE2 * 0.15);
    });

    return function () {
      section.classList.remove('why--pin', 'why--stacked');
      ghost.remove();
    };
  }

  // Grid reached: drop the pin, its spacer and every inline transform, and keep what is on screen in place.
  function finish() {
    if (done) return;
    done = true;
    var next = section.parentNode.nextElementSibling;
    var anchor = stage.getBoundingClientRect().bottom > 0 || !next ? stage : next;
    var before = anchor.getBoundingClientRect().top;
    mm.revert();
    gsap.set(cards, { clearProps: 'transform,filter' });
    var after = anchor.getBoundingClientRect().top;
    window.scrollTo({ top: window.pageYOffset + after - before, behavior: 'instant' });
    gsap.fromTo(stage.querySelectorAll(':scope > .why-card > *'), { autoAlpha: 0 }, {
      autoAlpha: 1, duration: 0.35, stagger: 0.03, ease: 'power1.out', clearProps: 'opacity,visibility'
    });
  }

  function start() { mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', setup); }

  // On a reload or back/forward the browser restores the scroll position; wait for it before deciding.
  var nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
  if ((!nav || nav.type === 'navigate') && !location.hash) start();
  else if (document.readyState === 'complete') requestAnimationFrame(start);
  else window.addEventListener('load', function () { requestAnimationFrame(start); });
})();
