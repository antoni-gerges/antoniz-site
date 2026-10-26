/* lkv26 (26 Oct 2026, liwa-kv-26oct/lkv26.py, fix E-LKV26): the Liwa key visual assembles with the scroll, from its own layered
   PSD, in hard steps: the sky and the far dunes, the letters, the sand and the road, then every sport one by one, the falcon, the
   festival's logo, and the key visual as released. Then the campaign's three lines on the dark ground, one per step. No easing, no
   fade, nothing slides: each picture appears whole in its own place and never moves again. Reduced motion: the finished key visual
   and the three lines, still. The pictures load when the section comes within 150 % of the screen. */
(function () {
  'use strict';
  var S = document.querySelector('section.lkv26');
  if (!S) return;
  var $$ = function (q) { return [].slice.call(S.querySelectorAll(q)); };
  var pin = S.querySelector('.lkv-pin'), parts = $$('[data-s]'), sts = $$('.lkv-st'), cnt = S.querySelector('.lkv-n');
  var W = (S.getAttribute('data-lkv-w') || '').split(',').map(Number), N = W.length, KV = +S.getAttribute('data-lkv-kv') || N;
  var names = (S.getAttribute('data-lkv-names') || '').split('|');
  var tot = W.reduce(function (a, b) { return a + b; }, 0);
  var near = false, rm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function load() {   // near the screen: everything; with reduced motion only what the still shows (the finished picture, the logo, the lines)
    if (!near) return;
    var still = S.classList.contains('lkv-rm');
    var keep = function (e) { var p = e.closest('.lkv-l'); return !still || !p || p.classList.contains('lkv-flat'); };
    $$('[data-lkv-srcset]').filter(keep).forEach(function (e) { e.setAttribute('srcset', e.getAttribute('data-lkv-srcset')); e.removeAttribute('data-lkv-srcset'); });
    $$('[data-lkv-src]').filter(keep).forEach(function (e) { e.setAttribute('src', e.getAttribute('data-lkv-src')); e.removeAttribute('data-lkv-src'); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { near = true; load(); io.disconnect(); } }); }, { rootMargin: '150% 0px' });
    io.observe(S);
  } else { near = true; }
  var cur = -1;
  function show(k) {   // k: 1..N
    if (k === cur) return; cur = k;
    S.setAttribute('data-step', k);
    S.classList.toggle('lkv-lines-on', k > KV);
    parts.forEach(function (e) {
      var s = +e.getAttribute('data-s'), u = e.getAttribute('data-u');   // shown from step s (until step u, when it has one)
      e.classList.toggle('on', k >= s && (!u || k <= +u));
    });
    sts.forEach(function (e) {
      var a = e.getAttribute('data-r').split('-');
      e.classList.toggle('on', k >= +a[0] && k <= +a[1]);
    });
    if (cnt) cnt.textContent = (k <= KV ? (k < 10 ? '0' : '') + k + ' / ' + KV + ' · ' + names[k - 1] : '');
  }
  function step() {
    if (S.classList.contains('lkv-rm')) return N;
    var r = pin.getBoundingClientRect(), h = pin.offsetHeight - innerHeight;
    var p = h > 0 ? Math.max(0, Math.min(1, -r.top / h)) : 1, x = p * tot, a = 0;
    for (var i = 0; i < N; i++) { a += W[i]; if (x < a) return i + 1; }
    return N;
  }
  var raf = 0;
  function frame() { raf = 0; show(step()); }
  function req() { if (!raf) raf = requestAnimationFrame(frame); }
  function mode() {
    var on = !!(rm && rm.matches);
    S.classList.toggle('lkv-rm', on);
    load();
    cur = -1; req();
  }
  if (rm) { if (rm.addEventListener) rm.addEventListener('change', mode); else if (rm.addListener) rm.addListener(mode); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  S.classList.add('lkv-js');
  mode(); show(step());
})();
