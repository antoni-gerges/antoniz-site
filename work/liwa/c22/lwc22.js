/* liwacamp22 (22 Oct 2026): the Liwa page leads with the creative campaign (liwa-campaign-22oct/liwacamp22.py). Hard cuts only: no
   fades. 1 the opening film plays once, then cuts to the key visual; 2 the three English lines over the key visual, one per step;
   3 the key visual in depth, its own layers set apart as you scroll (front-on it is the flat key visual); 4 the kit, one object at a
   time, each turning slowly; 5 the two radio spots, with Play. Pictures load when they come near (data-c22-src). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function load(root) {
    $$('[data-c22-srcset]', root).forEach(function (el) { el.setAttribute('srcset', el.getAttribute('data-c22-srcset')); el.removeAttribute('data-c22-srcset'); });
    $$('[data-c22-src]', root).forEach(function (el) { el.setAttribute('src', el.getAttribute('data-c22-src')); el.removeAttribute('data-c22-src'); });
  }
  var armed = false;   // nothing of ours loads with the first screen: the pictures arm at the first scroll (or at the film's cut)
  function arm() {
    if (armed) return; armed = true;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } }); }, { rootMargin: '120% 0px' });
      $$('.c22-open, .c22-depth').forEach(function (s) { io.observe(s); });
    } else { $$('.c22-open, .c22-depth').forEach(load); }
  }
  addEventListener('scroll', function once() { removeEventListener('scroll', once); arm(); }, { passive: true });

  // 1 · the opening: the film once, then a hard cut to the key visual (it stays; Play still plays the film with sound)
  var hero = $('.lw-lead'), v = hero && $('video.v', hero), kv = hero && $('.c22-kv', hero);
  if (hero && v && kv) {
    var cut = function () { load(kv); hero.classList.add('c22-cut'); arm(); };
    v.loop = false; v.removeAttribute('loop');
    v.addEventListener('timeupdate', function () {
      var d = v.duration; if (!d || !isFinite(d)) return;
      if (v.currentTime > d - 4) load(kv);
      if (v.currentTime >= d - .12) cut();
    });
    v.addEventListener('ended', cut);
    v.addEventListener('play', function () { v.loop = false; });
  }

  // a pinned block's progress, 0 at its top reaching the screen's top, 1 when its end leaves
  function prog(pin) { var r = pin.getBoundingClientRect(), h = pin.offsetHeight - innerHeight; return h > 0 ? clamp(-r.top / h, 0, 1) : 0; }

  // 2 · the three lines, one per step
  var op = $('.c22-open'), lines = op ? $$('.c22-lines > li', op) : [];
  // 3 · the key visual in depth
  var dp = $('.c22-depth'), stage = dp && $('.c22-stage', dp), world = dp && $('.c22-world', dp), pls = dp ? $$('.c22-pl', dp) : [], caps = dp ? $$('.c22-st', dp) : [];
  // the frame shows the band of the key visual from its letters to the racers' dust (36 % to 81 % of its height); the world is 8 % wider
  // than the frame on each side (over-scan), so no edge of it comes into the frame while it turns
  var FY = .585, OS = .84, P = 1200, ZF = 1, AR = world ? +world.getAttribute('data-ar') : 1;   // depth and perspective scale with the frame (ZF)
  function size() {
    if (!stage) return;
    var W = stage.clientWidth, H = stage.clientHeight, ww = W / OS, wh = ww / AR, fy = FY;
    world.style.width = ww + 'px'; world.style.height = wh + 'px';
    world.style.left = (W - ww) / 2 + 'px'; world.style.top = (H / 2 - fy * wh) + 'px';
    ZF = ww / 924; P = 1200 * ZF; stage.style.perspective = P.toFixed(1) + 'px';
    stage.style.perspectiveOrigin = '50% ' + (H / 2) + 'px';
    pls.forEach(function (p) {
      var l = +p.getAttribute('data-l'), t = +p.getAttribute('data-t'), w = +p.getAttribute('data-w'), h = +p.getAttribute('data-h');
      p.style.transformOrigin = ((50 - l) / w * 100).toFixed(3) + '% ' + ((fy * 100 - t) / h * 100).toFixed(3) + '%';
    });
    world.style.transformOrigin = '50% ' + (fy * 100) + '%';
  }
  // 4 · the kit
  var kit = $('.c22-kit .c22-pin'), objs = kit ? $$('.c22-objs > li', kit) : [], kn = kit && $('.c22-k', kit);
  // 5 · radio
  var cur = null;
  $$('.c22-spot').forEach(function (sp) {
    var b = $('.c22-play', sp), bar = $('.c22-prog-r', sp), a = null;
    b.addEventListener('click', function () {
      if (!a) {
        a = new Audio(sp.getAttribute('data-c22-audio')); a.preload = 'auto';
        a.addEventListener('timeupdate', function () { if (a.duration) bar.setAttribute('width', (120 * a.currentTime / a.duration).toFixed(2)); });
        a.addEventListener('ended', function () { b.textContent = 'Play'; sp.classList.remove('on'); bar.setAttribute('width', '0'); cur = null; });
      }
      if (a.paused) { if (cur && cur !== a) cur.pause(); $$('.c22-spot.on').forEach(function (o) { o.classList.remove('on'); $('.c22-play', o).textContent = 'Play'; }); a.play(); cur = a; b.textContent = 'Pause'; sp.classList.add('on'); }
      else { a.pause(); b.textContent = 'Play'; sp.classList.remove('on'); }
    });
  });

  var raf = 0;
  function frame() {
    raf = 0;
    if (op && lines.length) {
      var p = prog($('.c22-pin', op)), k = p < 1 / 3 ? 0 : p < 2 / 3 ? 1 : 2;
      lines.forEach(function (li, i) { li.classList.toggle('on', i === k); });
      op.setAttribute('data-step', k);
    }
    if (dp && world) {
      var q = prog($('.c22-pin', dp)), s = clamp((q - .22) / .4, 0, 1), e = s * s * (3 - 2 * s), u = clamp((q - .7) / .3, 0, 1);
      var ry = -6 * e + 10 * u * u * (3 - 2 * u), rx = 2.5 * e;   // clamped: at most 6 degrees either way
      world.style.transform = 'rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
      pls.forEach(function (pl) { var z = +pl.getAttribute('data-z') * e * ZF; pl.style.transform = 'translateZ(' + z.toFixed(1) + 'px) scale(' + (1 - z / P).toFixed(5) + ')'; });
      var c = q < .22 ? 0 : q < .7 ? 1 : 2; caps.forEach(function (el, i) { el.classList.toggle('on', i === c); });
      dp.setAttribute('data-step', c);
    }
    if (kit && objs.length) {
      var kr = kit.getBoundingClientRect(), r = clamp((innerHeight - kr.top) / innerHeight, 0, 1), n = objs.length, shown = 0;   // as the stage comes up to the top
      objs.forEach(function (li, i) {
        var at = .25 + i / n * .7, on = r >= at || i === 0; if (on) shown++;
        li.classList.toggle('on', on);
        var tt = clamp((r - at) / .5, 0, 1), deg = -7 + 14 * tt;
        li.firstElementChild.style.transform = 'rotateY(' + deg.toFixed(2) + 'deg)';
      });
      if (kn) kn.textContent = shown;
    }
  }
  function req() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { size(); req(); });
  size(); frame();
})();
