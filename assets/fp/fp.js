/* Film page engine. Every move is a function of scroll; videos load late and play only on screen. */
(function () {
  var D = document, W = window;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var phone = function () { return W.innerWidth <= 760; };
  var RM = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches && location.search.indexOf('motion=on') < 0; /* reduced motion: films wait on their posters until asked */
  var FP = W.FP = { clamp: clamp, seg: seg, ease: ease, phone: phone, rm: RM, parts: [], on: function (fn) { FP.parts.push(fn); } };

  /* ---- videos: late source, phone rendition, play on screen ---- */
  function arm(v) {
    if (v._armed) return; v._armed = 1;
    var s = (phone() && v.dataset.srcP) || v.dataset.src; if (!s) return;
    var p = (phone() && v.dataset.posterP) || v.dataset.poster; if (p) v.poster = p;
    v.muted = true; v.playsInline = true; v.loop = !v.hasAttribute('data-once'); v.src = s; v.load();
  }
  function play(v) { arm(v); if (FP.hold) { v._want = 1; return; } if (RM && !v._asked) return; if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
  function stop(v) { if (!v.paused) v.pause(); }
  FP.play = play; FP.stop = stop; FP.arm = arm;
  var auto = [].slice.call(D.querySelectorAll('video[data-auto]'));
  if ('IntersectionObserver' in W) {
    var near = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { arm(e.target); near.unobserve(e.target); } }); }, { rootMargin: '120% 0px' });
    var vis = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? play(e.target) : stop(e.target); }); }, { threshold: .2 });
    auto.forEach(function (v) { near.observe(v); vis.observe(v); });
    [].forEach.call(D.querySelectorAll('video[data-late]'), function (v) { near.observe(v); });
  } else auto.forEach(play);

  if (RM) D.addEventListener('click', function (e) { var v = e.target.closest && e.target.closest('.fp-hero,.ly,.fp-built,.band'); v = v && v.querySelector('video'); if (v && !e.target.closest('button')) { v._asked = !v._asked; v._asked ? play(v) : stop(v); } });

  /* ---- hero: the label follows the cut ---- */
  [].forEach.call(D.querySelectorAll('.fp-hero'), function (h) {
    var v = h.querySelector('video'), lab = h.querySelector('.src b'), marks = [];
    try { marks = JSON.parse(h.dataset.marks || '[]'); } catch (e) {}
    arm(v); if (h.getBoundingClientRect().top < W.innerHeight) play(v);
    if (lab && marks.length) v.addEventListener('timeupdate', function () {
      var t = v.currentTime, s = marks[0][1];
      for (var i = 0; i < marks.length; i++) if (t >= marks[i][0]) s = marks[i][1];
      if (lab.textContent !== s) lab.textContent = s;
    });
    FP.on(function (H) {
      var band = h.classList.contains('band') || (h.classList.contains('whole') && phone()), r = (band ? v : h).getBoundingClientRect(); if (r.bottom < 0 || r.top > H) { stop(v); return; }
      if (v.paused && r.bottom > (band ? 0 : H * .2)) play(v);
      var p = clamp(-r.top / r.height, 0, 1);
      if (h.classList.contains('band') || RM || (h.classList.contains('whole') && phone())) return;
      v.style.transform = 'translate3d(0,' + (p * 14) + '%,0) scale(' + (1 + p * .06) + ')';
      h.querySelector('.in').style.opacity = (1 - seg(p, .25, .7)).toFixed(3);
    });
  });

  /* ---- reel: one full-screen clip at a time; the next wipes in on the slant ---- */
  [].forEach.call(D.querySelectorAll('.fp-reel'), function (sec) {
    var ly = [].slice.call(sec.querySelectorAll('.ly')), N = ly.length, st = sec.querySelector('.fp-stick');
    sec.style.setProperty('--n', (N * .95 + .35).toFixed(2));
    var ticks = D.createElement('div'); ticks.className = 'fp-ticks';
    ly.forEach(function () { ticks.appendChild(D.createElement('i')); }); st.appendChild(ticks);
    var vids = ly.map(function (l) { return l.querySelector('video'); });
    /* captions live above the wipe, one at a time: the outgoing caption stays whole until the incoming picture has taken half the screen, then the incoming one replaces it */
    var ov = D.createElement('div'); ov.className = 'caps'; st.appendChild(ov);
    var caps = ly.map(function (l) { var w = D.createElement('div'); w.className = 'capset'; [].forEach.call(l.querySelectorAll('.cap, .n'), function (e) { w.appendChild(e); }); ov.appendChild(w); return w; });
    FP.on(function (H, Wd) {
      var r = sec.getBoundingClientRect();
      if (r.bottom < -H || r.top > 2 * H) { vids.forEach(function (v) { v && stop(v); }); return; }
      var p = clamp(-r.top / (r.height - H), 0, 1), P = p * (N - 1), cur = 0;
      var dx = H * .5;
      for (var i = 0; i < N; i++) {
        var t = i === 0 ? 1 : ease(seg(P - (i - 1), .3, .92)); if (RM) t = t >= .5 ? 1 : 0;
        if (t > .5) cur = i;
        var l = ly[i];
        if (t <= 0) { l.style.visibility = 'hidden'; }
        else {
          l.style.visibility = 'visible';
          if (t >= 1) l.style.clipPath = 'none';
          else { var xt = (Wd + dx) * (1 - t), xb = xt - dx; l.style.clipPath = 'polygon(' + xt.toFixed(1) + 'px 0,' + Wd + 'px 0,' + Wd + 'px ' + H + 'px,' + xb.toFixed(1) + 'px ' + H + 'px)'; }
        }
        var out = i < N - 1 ? ease(seg(P - i, .3, .92)) : 0, v = vids[i]; if (RM) out = out >= .5 ? 1 : 0;
        if (v) {
          v.style.transform = RM ? 'none' : 'translate3d(' + (-out * 5 + (1 - t) * 6) + '%,0,0) scale(1.06)';
          var onscreen = r.top < H && r.bottom > 0 && t > 0 && out < 1;
          onscreen ? play(v) : stop(v);
          if (t <= 0 && r.top < 2 * H) arm(v);
        }
      }
      [].forEach.call(ticks.children, function (k, i) { k.className = i <= cur ? 'on' : ''; });
      caps.forEach(function (w, i) { w.classList.toggle('on', i === cur); });
    });
  });

  /* ---- plates: whole artworks, one at a time: each holds in the middle, then the next slides in ---- */
  [].forEach.call(D.querySelectorAll('.fp-plates:not(.stack)'), function (sec) {
    var trk = sec.querySelector('.trk'), bar = sec.querySelector('.fp-bar i'), figs = [].slice.call(trk.children), stops = [0];
    function size() {
      var extra = Math.max(0, trk.scrollWidth - W.innerWidth); stops = [];
      figs.forEach(function (f) { var x = clamp(f.offsetLeft + f.offsetWidth / 2 - W.innerWidth / 2, 0, extra); if (!stops.length || Math.abs(x - stops[stops.length - 1]) > 8) stops.push(x); });
      sec.style.setProperty('--n', (1 + (stops.length - 1) * (phone() ? .62 : .58)).toFixed(3));
    }
    size(); W.addEventListener('resize', size); W.addEventListener('load', size);
    [].forEach.call(trk.querySelectorAll('img'), function (im) { im.addEventListener('load', size); });
    FP.on(function (H) {
      var r = sec.getBoundingClientRect(); if (r.bottom < -H || r.top > 2 * H) return;
      var p = clamp(-r.top / Math.max(1, r.height - H), 0, 1), n = stops.length - 1, u = Math.min(p * n, n - .0001), i = Math.floor(u), f = u - i;
      var x = n > 0 ? stops[i] + (stops[i + 1] - stops[i]) * ease(seg(f, .22, .78)) : 0;
      trk.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    });
  });

  /* ---- player: the full film, with sound. Focus moves in, stays in, and returns to the button that opened it ---- */
  var pl = D.querySelector('.fp-player');
  if (pl) {
    var pv = pl.querySelector('video'), pt = pl.querySelector('.ti'), px = pl.querySelector('.x'), opener = null;
    pl.setAttribute('aria-modal', 'true'); pl.setAttribute('tabindex', '-1');
    var onScreen = function (v) { var r = v.getBoundingClientRect(), b = v.closest('.fp-built'), l = v.closest('.ly'); return r.width > 0 && r.bottom > 0 && r.top < W.innerHeight && (!b || b.classList.contains('on')) && (!l || l.style.visibility !== 'hidden'); };
    var hush = function () { FP.hold = true; [].forEach.call(D.querySelectorAll('video'), function (v) { if (v === pv) return; v._want = v.paused ? 0 : 1; v.pause(); }); if (W.__fp3d && W.__fp3d.vids) W.__fp3d.vids.forEach(function (v) { v.pause(); }); };
    var unhush = function () { FP.hold = false; [].forEach.call(D.querySelectorAll('video'), function (v) { if (v !== pv && v._want && onScreen(v)) play(v); v._want = 0; }); ask(); };
    var close = function () { if (!pl.classList.contains('open')) return; pv.pause(); pl.classList.remove('open'); D.documentElement.style.overflow = ''; unhush(); if (opener && opener.focus) opener.focus(); opener = null; };
    [].forEach.call(D.querySelectorAll('[data-film]'), function (b) {
      b.addEventListener('click', function () {
        var s = (phone() && b.dataset.filmP) || b.dataset.film;
        if (pv.getAttribute('src') !== s) pv.src = s;
        if (pt) pt.textContent = b.dataset.title || '';
        opener = b; hush(); pl.classList.add('open'); D.documentElement.style.overflow = 'hidden'; pv.muted = false; pv.controls = true; px.focus();
        var p = pv.play(); if (p && p.catch) p.catch(function () {});
      });
    });
    px.addEventListener('click', close);
    D.addEventListener('keydown', function (e) {
      if (!pl.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { var f = [pv, px], i = f.indexOf(D.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
    });
  }

  /* ---- header: menu on phones, out of the way while reading down ---- */
  var hdr = D.querySelector('.hdr'), mb = D.querySelector('.menu-btn'), ly0 = 0, acc = 0;
  function menu(o) { hdr.classList.toggle('open', o); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); mb.textContent = o ? 'Close' : 'Menu';
    [].forEach.call(D.querySelectorAll('main, footer, .skip'), function (e) { o ? e.setAttribute('inert', '') : e.removeAttribute('inert'); });
    D.documentElement.style.overflow = o ? 'hidden' : ''; }
  function menuItems() { return [].filter.call(hdr.querySelectorAll('a[href], button'), function (e) { return e.getClientRects().length > 0; }); }
  if (hdr && mb) { mb.addEventListener('click', function () { menu(!hdr.classList.contains('open')); });
    D.addEventListener('keydown', function (e) { if (!hdr.classList.contains('open')) return;
      if (e.key === 'Escape') { menu(false); mb.focus(); return; }
      if (e.key === 'Tab') { var f = menuItems(), i = f.indexOf(D.activeElement); e.preventDefault(); f[(i < 0 ? 0 : i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); } });
    W.addEventListener('resize', function () { if (!phone() && hdr.classList.contains('open')) menu(false); });
    [].forEach.call(hdr.querySelectorAll('.nav a'), function (l) { l.addEventListener('click', function () { menu(false); }); }); }
  if (hdr) W.addEventListener('scroll', function () { var y = W.scrollY, d = y - ly0; ly0 = y; if (y < 80) { hdr.classList.remove('hide'); acc = 0; return; }
    acc = (d > 0) === (acc > 0) ? acc + d : d; if (acc > 24) hdr.classList.add('hide'); else if (acc < -12) hdr.classList.remove('hide'); }, { passive: true });

  /* ---- one loop ---- */
  var tick = false;
  function frame() { tick = false; var H = W.innerHeight, Wd = D.documentElement.clientWidth; for (var i = 0; i < FP.parts.length; i++) FP.parts[i](H, Wd); }
  function ask() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
  FP.ask = ask;
  /* opening or closing the story moves everything below it: measure again */
  [].forEach.call(D.querySelectorAll('.fp-more'), function (d) { d.addEventListener('toggle', function () { W.dispatchEvent(new Event('resize')); }); });
  W.addEventListener('scroll', ask, { passive: true }); W.addEventListener('resize', ask); W.addEventListener('load', ask);
  D.addEventListener('DOMContentLoaded', ask); ask();
})();
