/* lym22 (22 Oct 2026), work/wfes/: the "Leave your mark" campaign opens the page (LYM-PAGE-PLAN.md). Three jobs, hard cuts only:
   1 the pictures of the kinetic beat and the row arrive when their section is near (data-l22-src), never with the first screen;
   2 K, "Sign here": one thumbprint (L1's own ridges, traced as vectors, k.json) draws itself ridge by ridge, prints in ink, lands on
     its leaf; the crown's prints (L2's own pixels, each cut on its traced outline) arrive group by group on four depth planes, settle
     flat, the trunk rises, then a hard cut to the poster itself, leaf for leaf; the words land after the cut;
   3 the campaign as one kinetic row: the pieces stand in a lit space and turn toward you as they pass.
   Reduced motion, or no script: the poster and the words, and the pieces in a plain grid. */
(function () {
  var D = document, W = window;
  var K = D.getElementById('l22-k'), R = D.getElementById('l22-row');
  if (!K || !R) return;
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  /* 1 · the pictures, when near */
  function hydrate(sec) {
    [].forEach.call(sec.querySelectorAll('img[data-l22-src]'), function (im) {
      im.src = im.getAttribute('data-l22-src'); im.removeAttribute('data-l22-src');
    });
  }
  if ('IntersectionObserver' in W) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { hydrate(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '150% 0px' });
    io.observe(K); io.observe(R);
  } else { hydrate(K); hydrate(R); }
  if (RM) { D.body.classList.add('l22-rm'); return; }

  /* 2 · K */
  var stage = K.querySelector('.l22-stage'), now = K.querySelector('.l22-now');
  var wk = 1, kd = null, world = null, wrapT = null, svg = null, rings = [], pcs = [], firstPc = null, ccx = 0, ccy = 0, step = -1;
  var LINES = ['One thumbprint, drawn ridge by ridge.', 'Pressed in ink.', 'Then many hands, each print its own.',
               'Then many hands, each print its own.', 'Then many hands, each print its own.', 'Then many hands, each print its own.',
               'Then many hands, each print its own.', 'A tree grows under them.', ''];
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls) { var e = D.createElement(tag); if (cls) e.className = cls; return e; }
  function pathOf(polys) { return polys.map(function (p) { return 'M' + p.map(function (q) { return q[0] + ' ' + q[1]; }).join('L') + 'Z'; }).join(' '); }
  function piece(src, x, y, w, h, polys, cls) {
    var e = el('i', 'l22-pc' + (cls ? ' ' + cls : ''));
    e.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;background-image:url(' + src + ');' +
      'background-position:' + (-x) + 'px ' + (-y) + 'px;background-size:' + kd.W + 'px ' + kd.H + 'px;' +
      'clip-path:path("' + pathOf(polys) + '");-webkit-clip-path:path("' + pathOf(polys) + '")';
    return e;
  }
  function buildK(k) {
    kd = k; var src = stage.getAttribute('data-src');
    world = el('div', 'l22-world'); world.setAttribute('aria-hidden', 'true');
    wrapT = el('div', 'l22-trw'); wrapT.appendChild(piece(src, k.trunk.x, k.trunk.y, k.trunk.w, k.trunk.h, k.trunk.p, 'l22-tr'));
    world.appendChild(wrapT);
    k.pieces.forEach(function (p, i) {
      var e = piece(src, p.x, p.y, p.w, p.h, [p.p]); e._p = p; world.appendChild(e); pcs.push(e); if (i === 0) firstPc = e;
      ccx += p.s[0]; ccy += p.s[1];
    });
    ccx /= k.pieces.length; ccy /= k.pieces.length;
    var r = k.ridges, R0 = r.R;
    svg = D.createElementNS(NS, 'svg'); svg.setAttribute('class', 'l22-print'); svg.setAttribute('viewBox', (-R0) + ' ' + (-R0) + ' ' + (2 * R0) + ' ' + (2 * R0));
    r.rings.forEach(function (ring) {
      var g = D.createElementNS(NS, 'g'); var list = [];
      ring.forEach(function (d) { var p = D.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); g.appendChild(p); list.push(p); });
      svg.appendChild(g); rings.push(list);
    });
    var ink = D.createElementNS(NS, 'path'); ink.setAttribute('class', 'l22-ink'); ink.setAttribute('d', [].concat.apply([], r.rings).join(' '));
    svg.appendChild(ink); world.appendChild(svg);
    stage.appendChild(world);
    K.classList.add('l22-live'); size(); kUpdate();
  }
  function size() {
    if (!kd) return;
    wk = stage.clientWidth / kd.W;
    rowSize();
  }
  function setStep(s) {
    if (s === step) return; step = s; K.setAttribute('data-step', String(s)); if (now) now.textContent = LINES[s] || '';
  }
  function kUpdate() {
    if (!kd) return;
    var r = K.getBoundingClientRect(), span = Math.max(1, K.offsetHeight - W.innerHeight), p = clamp(-r.top / span, 0, 1);
    var A = .24, B = .34, C0 = .36, CG = .075, Dd = .755, E = .88;
    var s = p < A ? 0 : p < B ? 1 : p < Dd ? 2 + clamp(Math.floor((p - C0) / CG), 0, 4) : p < E ? 7 : 8;
    setStep(s);
    /* the print: drawn ring by ring (each ridge outline traced from L1), then inked and pressed onto its leaf */
    var f = kd.first, R0 = kd.ridges.R, big = Math.min(kd.W * .78 / kd.ridges.w, kd.H * .8 / kd.ridges.h);
    var q = clamp(p / A, 0, 1), n = rings.length;
    rings.forEach(function (list, i) {
      var g = clamp(q * n - i, 0, 1), off = (1 - g).toFixed(3), vis = g > 0 ? 'visible' : 'hidden';
      for (var j = 0; j < list.length; j++) { list[j].style.strokeDashoffset = off; list[j].style.visibility = vis; }
    });
    var t = ease(clamp((p - A) / (B - A), 0, 1));
    var sc = big + (Math.min(f.w / kd.ridges.w, f.h / kd.ridges.h) * 1.15 - big) * t;
    var cx = kd.W / 2 + (f.x - kd.W / 2) * t, cy = kd.H * .46 + (f.y - kd.H * .46) * t;
    svg.style.width = svg.style.height = (2 * R0) + 'px';
    svg.style.transform = 'translate(' + (cx - R0).toFixed(1) + 'px,' + (cy - R0).toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
    svg.classList.toggle('ink', p >= A);
    svg.style.visibility = p < B ? 'visible' : 'hidden';
    /* the crown: the first leaf at once, the others group by group, in from the front onto four depth planes, then flat */
    var settle = clamp((p - (Dd - .07)) / .1, 0, 1), flat = 1 - settle;
    var tilt = p >= B ? flat : 0;
    world.style.transform = 'scale(' + wk.toFixed(4) + ') perspective(900px) rotateX(' + (-5 * tilt).toFixed(2) + 'deg) rotateY(' + (9 * tilt).toFixed(2) + 'deg)';
    for (var i = 0; i < pcs.length; i++) {
      var e = pcs[i], d = e._p, st = d.g === 0 ? B : C0 + (d.g - 1) * CG, u = d.g === 0 ? (p >= B ? 1 : 0) : clamp((p - st) / CG, 0, 1);
      if (u <= 0 || p >= E) { e.style.visibility = 'hidden'; continue; }
      var v = ease(u), dx = (d.s[0] - ccx) * .9 * (1 - v), dy = (d.s[1] - ccy) * .9 * (1 - v), z = d.z * flat + 420 * (1 - v);
      e.style.visibility = 'visible';
      e.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotate(' + (d.a * (1 - v)).toFixed(1) + 'deg)';
    }
    /* the trunk and the ground rise from below, a hard edge */
    var tr = clamp((p - Dd) / (E - Dd - .02), 0, 1);
    wrapT.style.visibility = tr > 0 && p < E ? 'visible' : 'hidden';
    wrapT.style.clipPath = 'inset(' + ((1 - tr) * 100).toFixed(2) + '% 0 0 0)';
    world.style.visibility = p < E ? 'visible' : 'hidden';
  }
  function loadK() {
    if (kd || !stage) return;
    fetch(stage.getAttribute('data-k')).then(function (r) { return r.json(); }).then(buildK).catch(function () {});
  }
  if (D.readyState === 'complete') loadK(); else W.addEventListener('load', loadK);

  /* 3 · the row */
  var track = R.querySelector('.l22-track'), items = [].slice.call(R.querySelectorAll('.l22-it')), maxX = 0, cache = [];
  R.classList.add('l22-live');
  function rowSize() {
    track.style.transform = 'none';
    var g = parseFloat(getComputedStyle(track).paddingLeft) || 16;
    maxX = Math.max(0, track.scrollWidth - W.innerWidth);
    R.style.height = (W.innerHeight + maxX * .6).toFixed(0) + 'px';
    cache = items.map(function (it) { return it.offsetLeft + it.offsetWidth / 2; });
    rowUpdate();
  }
  function rowUpdate() {
    var r = R.getBoundingClientRect(), span = Math.max(1, R.offsetHeight - W.innerHeight), p = clamp(-r.top / span, 0, 1);
    var x = -p * maxX, cx = W.innerWidth / 2, ph = W.innerWidth <= 760, ang = ph ? 14 : 26, dep = ph ? 70 : 150;
    track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    for (var i = 0; i < items.length; i++) {
      var d = clamp((cache[i] + x - cx) / W.innerWidth, -1.2, 1.2);
      items[i].style.transform = 'perspective(1200px) rotateY(' + (-d * ang).toFixed(2) + 'deg) translateZ(' + (-Math.abs(d) * dep).toFixed(1) + 'px)';
    }
  }
  var tick = false;
  function onScroll() { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; kUpdate(); rowUpdate(); }); }
  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', function () { size(); rowSize(); kUpdate(); });
  [].forEach.call(R.querySelectorAll('img'), function (im) { im.addEventListener('load', function () { rowSize(); }); });
  rowSize();
})();
