// Vacatures page: the compact route. Band 1 = "Wat neem je mee?" and "Wat bieden wij?" side by side, band 2 = the
// training heading on the left and the 4 steps in a row (alternately 24px lower).
// ONE road (an svg path behind the blocks) snakes through the gaps: down the channel between the two band 1 blocks,
// sideways to the channel between the heading and the steps, down it, then under the steps in a small wiggle.
// The path is computed from the real block positions and redrawn on resize / language change. It never crosses text.
// Under 1100px the blocks are stacked and the road is a straight line along the left edge, touching each block.
// Motion: GSAP ScrollTrigger (scrub, no pinning) draws the road as you scroll; each block fades in (and a step icon
// turns orange) when the road reaches it. Reduced motion (or no GSAP): everything is shown, static.
(function () {
  var journey = document.getElementById('vac-journey');
  var svg = journey && journey.querySelector('.vj-svg');
  var blocks = journey && journey.querySelectorAll('.zz-block');   // order: A, B, T, S1, S2, S3, S4
  if (!journey || !svg || blocks.length < 7) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 1100px)');
  var useScroll = !reduce && window.gsap && window.ScrollTrigger;
  var NEAR = 48;   // the road "reaches" a block when it comes this close

  svg.innerHTML =
    '<defs><mask id="vj-mask" maskUnits="userSpaceOnUse"><path class="vj-reveal" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/></mask></defs>' +
    '<g mask="url(#vj-mask)"><path class="vj-road" fill="none" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path class="vj-line" fill="none"/></g>';
  var mask = svg.querySelector('mask');
  var reveal = svg.querySelector('.vj-reveal');
  var road = svg.querySelector('.vj-road');
  var line = svg.querySelector('.vj-line');

  var total = 0, lens = [], costs = [], blockLens = [], progress = 1;

  function rect(el) {
    var j = journey.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { l: r.left - j.left, r: r.right - j.left, t: r.top - j.top, b: r.bottom - j.top };
  }

  // Straight segments joined by rounded corners (the radius shrinks on short segments).
  function rounded(p, radius) {
    var d = 'M' + p[0][0] + ' ' + p[0][1];
    for (var i = 1; i < p.length - 1; i++) {
      var a = p[i - 1], b = p[i], c = p[i + 1];
      var l1 = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
      var l2 = Math.abs(c[0] - b[0]) + Math.abs(c[1] - b[1]);
      var r = Math.min(radius, l1 / 2, l2 / 2);
      var u1 = [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
      var u2 = [Math.sign(c[0] - b[0]), Math.sign(c[1] - b[1])];
      d += ' L' + (b[0] - u1[0] * r) + ' ' + (b[1] - u1[1] * r) + ' Q' + b[0] + ' ' + b[1] + ' ' + (b[0] + u2[0] * r) + ' ' + (b[1] + u2[1] * r);
    }
    var z = p[p.length - 1];
    return d + ' L' + z[0] + ' ' + z[1];
  }

  function points() {
    var rs = Array.prototype.map.call(blocks, rect);
    if (!wide.matches) return [[22, rs[0].t - 14], [22, rs[6].b + 8]];

    var A = rs[0], B = rs[1], T = rs[2], S = rs.slice(3);
    var cx = (A.r + B.l) / 2;                                   // channel between the two band 1 blocks
    var y1 = (Math.max(A.b, B.b) + Math.min(T.t, S[0].t)) / 2;  // gap between the bands
    var chx = (T.r + S[0].l) / 2;                               // channel between the heading and the steps
    var yb = S.map(function (s) { return s.b + 20; });          // just under each step
    var gx = [0, 1, 2].map(function (i) { return (S[i].r + S[i + 1].l) / 2; });   // gaps between steps
    var pts = [
      [cx, A.t - 14], [cx, y1], [chx, y1], [chx, yb[0]],
      [gx[0], yb[0]], [gx[0], yb[1]], [gx[1], yb[1]], [gx[1], yb[2]], [gx[2], yb[2]], [gx[2], yb[3]],
      [S[3].r, yb[3]]
    ];
    return pts.filter(function (p, n) { return n === 0 || p[0] !== pts[n - 1][0] || p[1] !== pts[n - 1][1]; });
  }

  function build() {
    var pts = points();
    var w = journey.clientWidth, h = journey.scrollHeight;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    mask.setAttribute('x', -20); mask.setAttribute('y', -20);
    mask.setAttribute('width', w + 40); mask.setAttribute('height', h + 40);
    var d = rounded(pts, 28);
    road.setAttribute('d', d); line.setAttribute('d', d); reveal.setAttribute('d', d);

    total = reveal.getTotalLength();
    reveal.style.strokeDasharray = total + ' ' + total;

    // Scroll "cost" along the road: vertical distance counts fully, sideways distance a little,
    // so the sideways stretches take some scroll instead of appearing in one jump.
    var N = 400, prev = reveal.getPointAtLength(0), c = 0, sx = [prev.x], sy = [prev.y];
    lens = [0]; costs = [0];
    for (var i = 1; i <= N; i++) {
      var len = total * i / N, pt = reveal.getPointAtLength(len);
      c += Math.abs(pt.y - prev.y) + Math.abs(pt.x - prev.x) * 0.35;
      lens.push(len); costs.push(c); sx.push(pt.x); sy.push(pt.y); prev = pt;
    }

    // The road reaches a block when it first comes near it.
    blockLens = Array.prototype.map.call(blocks, function (b) {
      var r = rect(b);
      for (var n = 0; n < sx.length; n++) {
        var dx = Math.max(r.l - sx[n], 0, sx[n] - r.r), dy = Math.max(r.t - sy[n], 0, sy[n] - r.b);
        if (dx * dx + dy * dy <= NEAR * NEAR) return lens[n];
      }
      return total;
    });
    render(progress);
  }

  function render(p) {
    progress = p;
    var target = p * costs[costs.length - 1], lo = 0, hi = costs.length - 1;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (costs[mid] < target) lo = mid + 1; else hi = mid; }
    var shown = p >= 1 ? total : lens[lo];
    reveal.style.strokeDashoffset = total - shown;
    Array.prototype.forEach.call(blocks, function (b, i) {
      b.classList.toggle('is-in', shown >= blockLens[i]);
    });
  }

  build();

  if (useScroll) {
    gsap.registerPlugin(ScrollTrigger);
    journey.classList.add('vj-on');
    var state = { p: 0 };
    render(0);
    gsap.to(state, {
      p: 1, ease: 'none',
      // plain scrub, no pin: it just follows the normal scroll and never adds scroll length
      scrollTrigger: { trigger: journey, start: 'top 65%', endTrigger: blocks[6], end: 'bottom 70%', scrub: 0.4 },
      onUpdate: function () { render(state.p); }
    });
  }

  var pending = 0;
  function rebuild() {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(function () {
      build();
      if (useScroll) ScrollTrigger.refresh();
    });
  }
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
  document.addEventListener('langchange', rebuild);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  if (window.ResizeObserver) new ResizeObserver(rebuild).observe(journey);
})();
