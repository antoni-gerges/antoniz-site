/* scrub25 (25 Oct 2026): a Blender camera move stepped by the scroll. Each .sc25 block is a tall box with a sticky stage (a canvas);
   the frame shown is the scroll progress through the box: hard steps, no easing on the frame, no fade. The first frame loads at once,
   the rest when the box comes within 150 % of the screen, in order; until a frame is in, the nearest earlier frame that is in stays.
   The phone set below 761 px. Reduced motion, or no IntersectionObserver: the last frame as a still, and the film block it replaces
   stays (its Play still works). No script: the box stays hidden and the film block shows, as before.
   data-n frames; data-d / data-p the desktop and phone frame paths (+ 000.webp); data-hide the film block hidden while the scroll
   drives the stage; data-next (+ data-next-pin, data-next-box) a pinned section that takes over on the last frame, the same frame in
   the same place: the box ends one screen after it starts, so both stand still at the hand-over. */
(function () {
  var boxes = document.querySelectorAll('.sc25');
  if (!boxes.length) return;
  var rm = matchMedia('(prefers-reduced-motion: reduce)'), mq = matchMedia('(max-width:760px)');
  var noIO = !('IntersectionObserver' in window);
  function on(m, f) { if (m.addEventListener) m.addEventListener('change', f); else if (m.addListener) m.addListener(f); }
  [].forEach.call(boxes, function (s) {
    var cv = s.querySelector('canvas'), cx = cv && cv.getContext && cv.getContext('2d');
    if (!cx) return;                                   // no canvas: the film block stays, as without script
    var N = +s.getAttribute('data-n'), pin = s.querySelector('.sc25-pin'), fig = s.querySelector('.sc25-f'), box = s.querySelector('.sc25-box');
    var hide = s.getAttribute('data-hide') ? document.querySelector(s.getAttribute('data-hide')) : null;
    var next = s.getAttribute('data-next') ? document.querySelector(s.getAttribute('data-next')) : null;
    var nPin = next && next.querySelector(s.getAttribute('data-next-pin')), nBox = next && next.querySelector(s.getAttribute('data-next-box'));
    if (next && !(nPin && nBox)) next = null;
    var sets = { d: [], p: [] }, seqOn = { d: false, p: false }, near = false, still = false, kind = '', shown = -1, shownKind = '', raf = 0, io = null;
    function url(k, i) { return s.getAttribute('data-' + k) + ('00' + i).slice(-3) + '.webp'; }
    function load(k, i, cb) {                          // one frame; cb when it is in (or failed)
      var a = sets[k], im = a[i];
      if (im) { if (im.ok || im.bad) { if (cb) cb(); } else if (cb) im.cbs.push(cb); return; }
      im = a[i] = new Image(); im.cbs = cb ? [cb] : []; im.decoding = 'async';
      function done(ok) { if (ok) im.ok = true; else im.bad = true; var c = im.cbs; im.cbs = []; c.forEach(function (f) { f(); }); paint(); }
      im.onload = function () { if (im.decode) im.decode().then(function () { done(true); }, function () { done(true); }); else done(true); };
      im.onerror = function () { done(false); };
      im.src = url(k, i);
    }
    function sequence(k) {                             // every frame, in order, four at a time
      if (seqOn[k]) return; seqOn[k] = true;
      var i = 0, live = 0;
      (function pump() { while (live < 4 && i < N) { live++; load(k, i++, function () { live--; pump(); }); } })();
    }
    function target() {
      if (still) return N - 1;
      var r = s.getBoundingClientRect(), V = pin.offsetHeight, R = s.offsetHeight - V - (next ? V : 0);
      var p = R > 0 ? Math.min(1, Math.max(0, -r.top / R)) : 0;
      return Math.min(N - 1, Math.floor(p * N));
    }
    function paint() {
      var k = target(), a = sets[kind], j = k;
      if (still) { if (!(a[j] && a[j].ok)) return; }
      else while (j >= 0 && !(a[j] && a[j].ok)) j--;   // never a blank frame: the nearest earlier frame that is in
      if (j < 0 || (j === shown && kind === shownKind)) return;
      var im = a[j];
      if (cv.width !== im.naturalWidth || cv.height !== im.naturalHeight) { cv.width = im.naturalWidth; cv.height = im.naturalHeight; }
      cx.drawImage(im, 0, 0, cv.width, cv.height); shown = j; shownKind = kind;
      s.setAttribute('data-frame', j);
    }
    function handover() {                              // the next section is pinned: this stage steps aside (same frame, same place)
      if (!next || still) return;
      s.classList.toggle('sc25-gone', next.getBoundingClientRect().top <= 0.5);
    }
    function align() {                                 // the stage's picture exactly where the next section's picture stands
      fig.style.transform = ''; fig.style.width = '';
      if (!next || still) return;
      var w = nBox.getBoundingClientRect().width; if (w > 0) fig.style.width = w + 'px';
      var d = (nBox.getBoundingClientRect().top - nPin.getBoundingClientRect().top) - (box.getBoundingClientRect().top - pin.getBoundingClientRect().top);
      if (Math.abs(d) > 0.25) fig.style.transform = 'translateY(' + d + 'px)';
    }
    function tick() { raf = 0; handover(); paint(); }
    function ask() { if (!raf) raf = requestAnimationFrame(tick); }
    function setKind() {
      var k = mq.matches ? 'p' : 'd';
      if (k === kind) return;
      kind = k; shown = -1;
      if (still) load(k, N - 1); else { load(k, 0); if (near) sequence(k); }
      paint();
    }
    function mode() {
      still = rm.matches || noIO;
      s.hidden = false;
      s.classList.toggle('sc25-still', still); s.classList.toggle('sc25-on', !still); s.classList.toggle('sc25-tail', !still && !!next);
      if (hide) hide.classList.toggle('sc25-hid', !still);
      if (next) next.classList.toggle('sc25-next', !still);
      if (still) s.classList.remove('sc25-gone');
      kind = ''; shown = -1; setKind(); align(); ask();
      if (!still && !io && !noIO) {
        io = new IntersectionObserver(function (es) {
          if (es[0].isIntersecting) { near = true; io.disconnect(); sequence(kind); align(); }
        }, { rootMargin: '150% 0px' });
        io.observe(s);
      }
    }
    mode();
    on(rm, mode); on(mq, function () { setKind(); align(); ask(); });
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', function () { align(); ask(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { align(); ask(); });
    addEventListener('load', function () { align(); ask(); });
  });
})();
