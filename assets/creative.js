(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 860px)');
  var reels = [].slice.call(document.querySelectorAll('.reel'));
  var ident = document.querySelector('.ident');
  var steps = ident ? [].slice.call(ident.querySelectorAll('.istep')) : [];
  var ticks = ident ? [].slice.call(ident.querySelectorAll('.ticks li')) : [];
  function pinned() { return !reduce && !small.matches; }
  function layout() {
    reels.forEach(function (r) {
      var t = r.querySelector('.track');
      if (!pinned()) { r.style.height = ''; t.style.transform = ''; return; }
      var d = Math.max(0, t.scrollWidth - window.innerWidth);
      r._d = d; r.style.height = (d * 0.5 + window.innerHeight) + 'px';
    });
    tick();
  }
  var cur = -1;
  function tick() {
    if (!pinned()) return;
    var vh = window.innerHeight;
    reels.forEach(function (r) {
      var top = r.getBoundingClientRect().top, d = r._d || 0;
      if (top > vh || top < -(d * 0.5 + vh)) return;
      var p = d ? Math.min(1, Math.max(0, -top / (d * 0.5))) : 0;
      r.querySelector('.track').style.transform = 'translate3d(' + (-p * d).toFixed(1) + 'px,0,0)';
      r.style.setProperty('--p', p.toFixed(4));
    });
    if (ident) {
      var rr = ident.getBoundingClientRect(), total = rr.height - vh;
      var p2 = Math.min(0.9999, Math.max(0, -rr.top / total));
      var i = Math.floor(p2 * steps.length);
      if (i !== cur) {
        cur = i;
        steps.forEach(function (s, k) { s.classList.toggle('on', k === i); s.classList.toggle('past', k < i); });
        ticks.forEach(function (t, k) { t.classList.toggle('on', k === i); t.classList.toggle('done', k < i); });
      }
    }
  }
  var raf = false;
  window.addEventListener('scroll', function () { if (!raf) { raf = true; requestAnimationFrame(function () { raf = false; tick(); }); } }, { passive: true });
  window.addEventListener('resize', layout);
  if (small.addEventListener) small.addEventListener('change', layout);
  window.addEventListener('load', layout);
  layout();
  if (steps[0]) steps[0].classList.add('on');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }); }, { rootMargin: '0px -5% 0px -5%', threshold: 0.25 });
    document.querySelectorAll('.ccard').forEach(function (c) { io.observe(c); });
  } else { document.querySelectorAll('.ccard').forEach(function (c) { c.classList.add('seen'); }); }
})();
/* designed → built: the build wipes in over the render as the pair crosses the screen */
(function () {
  var pairs = [].slice.call(document.querySelectorAll('.pair .pm'));
  if (!pairs.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick() {
    var vh = window.innerHeight;
    pairs.forEach(function (m) {
      var r = m.getBoundingClientRect();
      var p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.6)));
      m.style.setProperty('--w', (1 - p * 0.5).toFixed(3));
    });
  }
  var raf = false;
  window.addEventListener('scroll', function () { if (!raf) { raf = true; requestAnimationFrame(function () { raf = false; tick(); }); } }, { passive: true });
  window.addEventListener('resize', tick); tick();
  pairs.forEach(function (m) {
    m.addEventListener('pointermove', function (e) { var r = m.getBoundingClientRect(); m.style.setProperty('--w', Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)).toFixed(3)); });
  });
})();
