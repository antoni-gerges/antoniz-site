/* lyms23 (23 Oct 2026), work/wfes/: "Leave your mark" told in motion (lym-story-23oct/lyms23.py). The page stands whole without this file:
   every beat is written in its final state. Here, unless the reader asks for reduced motion, each pinned beat (.ly-pin) holds its screen
   while the scroll moves it on, in hard steps (data-s), never a fade:
     call   one thumbprint (the key visual's own ridges, the #ly-tp path ring by ring) draws itself, is pressed in ink (a hard switch),
            lands on the crown, then a hard cut to the key visual whole;
     steps  a beat's thresholds (data-t) give its step: the municipalities, the towers' floors, the lamps, the codes;
     press  the newspaper pages turn on their spine, one after another, as paper does;
     objects the kit's pieces are laid down on the paper as they come into view. */
(function () {
  var D = document, W = window;
  var all = [].slice.call(D.querySelectorAll('.ly[data-ly]'));
  if (!all.length || !W.matchMedia || W.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  var NS = 'http://www.w3.org/2000/svg', beats = [];

  function prog(sec) {   /* 0 when the pin's top meets the screen's top, 1 when its end leaves */
    var pin = sec._pin, r = pin.getBoundingClientRect(), span = Math.max(1, pin.offsetHeight - W.innerHeight);
    return clamp(-r.top / span, 0, 1);
  }
  function step(sec, s) { if (sec._s !== s) { sec._s = s; sec.setAttribute('data-s', String(s)); } }

  /* the call */
  function call(sec) {
    var path = D.querySelector('#ly-tp path'), g = sec.querySelector('.ly-pt');
    if (!path || !g) return null;
    var counts = path.getAttribute('data-rings').split(',').map(Number), subs = path.getAttribute('d').split(/(?=M)/), rings = [], k = 0;
    var st = D.createElementNS(NS, 'g'); st.setAttribute('class', 'ly-st'); g.insertBefore(st, g.firstChild);
    counts.forEach(function (n) {
      var list = [];
      for (var i = 0; i < n; i++, k++) {
        var p = D.createElementNS(NS, 'path'); p.setAttribute('d', subs[k]); p.setAttribute('pathLength', '1'); st.appendChild(p); list.push(p);
      }
      rings.push(list);
    });
    var C = [252.24, 243.69], BIG = 2.05, MID = [246, 282];
    return function (p) {
      /* drawn over the first 46%, ring after ring from the core; inked at 46%; pressed down onto the crown 58-72%; the key visual at 72% */
      var A = .46, B = .58, E = .72, s = p < A ? 0 : p < B ? 1 : p < E ? 2 : 3;
      step(sec, s);
      if (s === 0) {
        var q = .3 + .7 * p / A, n = rings.length;   /* the core already drawn on the first screen */
        for (var i = 0; i < n; i++) {
          var f = clamp(q * n - i, 0, 1), off = (1 - f).toFixed(3), vis = f > 0 ? 'visible' : 'hidden';
          for (var j = 0; j < rings[i].length; j++) { rings[i][j].style.strokeDashoffset = off; rings[i][j].style.visibility = vis; }
        }
      }
      var t = s < 2 ? 0 : s > 2 ? 1 : ease((p - B) / (E - B));
      var x = MID[0] + (C[0] - MID[0]) * t, y = MID[1] + (C[1] - MID[1]) * t, sc = BIG + (1 - BIG) * t;
      g.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') scale(' + sc.toFixed(4) + ')');
    };
  }

  /* thresholds: the step is how many of them the scroll has passed */
  function steps(sec) {
    var ts = sec.getAttribute('data-t').split(',').map(Number);
    return function (p) { var s = 0; while (s < ts.length && p >= ts[s]) s++; step(sec, s); };
  }

  /* the press: a page turns on its spine (its left edge) through 180 degrees; past 90 its back shows, as paper does */
  function press(sec) {
    var pages = [].slice.call(sec.querySelectorAll('.ly-pg')), now = sec.querySelector('.ly-now'), n = pages.length, last = -1;
    var caps = pages.map(function (f) { var c = f.querySelector('figcaption'); return c ? c.textContent : ''; });
    return function (p) {
      var u = -.45 + p * (n - 1.3 + .45 + .3), shown = 0;   /* each page turns over .7 of its share of the scroll and lies still for .3 */
      for (var i = 0; i < n; i++) {
        var pg = pages[i], t = i === n - 1 ? 0 : ease(clamp((u - i) / .7, 0, 1)), a = -180 * t;
        pg.style.transform = t > 0 ? 'perspective(3800px) rotateY(' + a.toFixed(2) + 'deg)' : '';   /* far enough that no edge comes nearer than its own pixels (pages at 400 px high, 83% of theirs) */
        pg.classList.toggle('ly-back', t > .5);
        pg.style.zIndex = t > 0 && t < 1 ? 3 * n : t >= 1 ? n + i + 1 : n - i;
        if (t > .5) shown = i + 1;
      }
      for (i = 0; i < n; i++) {   /* the page on top, the one under it, the last one turned; the rest are out of sight */
        pages[i].classList.toggle('ly-away', i < shown - 1 || i > shown + 1);
        pages[i].classList.toggle('ly-top', i === shown);
      }
      step(sec, shown);
      if (shown !== last && now) { last = shown; now.textContent = (shown + 1) + ' / ' + n + ' · ' + caps[shown]; }
    };
  }

  /* objects: laid down on the paper once, as each comes into view */
  function objects(sec) {
    var obs = [].slice.call(sec.querySelectorAll('.ly-ob'));
    if (!('IntersectionObserver' in W)) return null;
    sec.classList.add('ly-live');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ly-down'); io.unobserve(e.target); } });
    }, { threshold: .35 });
    obs.forEach(function (o) { io.observe(o); });
    return null;
  }

  var MAKE = { call: call, steps: steps, press: press, objects: objects };
  all.forEach(function (sec) {
    var kind = sec.getAttribute('data-ly'), mk = MAKE[kind]; if (!mk) return;
    sec._pin = sec.querySelector('.ly-pin');
    var fn = mk(sec);
    if (!fn || !sec._pin) return;
    sec.classList.add('ly-live'); beats.push([sec, fn]);
  });
  if (!beats.length) return;
  function update() {
    for (var i = 0; i < beats.length; i++) {
      beats[i][1](prog(beats[i][0]));
    }
  }
  var tick = false;
  function onScroll() { if (tick) return; tick = true; W.requestAnimationFrame(function () { tick = false; update(); }); }
  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', onScroll);
  update();
})();
