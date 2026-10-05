/* The Big Grill: the first poster's own ten layers. On scroll the drawing comes apart in depth and turns a little;
   the pointer adds a few degrees. Slow and eased; static under reduced motion. */
(function () {
  var box = document.querySelector('.layers'); if (!box) return;
  var stack = box.querySelector('.stack'), imgs = [].slice.call(stack.querySelectorAll('img'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { box.classList.add('still'); return; }
  var p = 0, tp = 0, px = 0, py = 0, tx = 0, ty = 0, raf = 0;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function sm(t) { t = clamp(t); return t * t * (3 - 2 * t); }
  function target() { var r = box.getBoundingClientRect(), vh = innerHeight; return sm((vh * 0.85 - r.top) / (vh * 0.9)); }
  function frame() {
    raf = 0; tp = target(); p += (tp - p) * 0.08; px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    var s = p;
    stack.style.transform = 'rotateY(' + (-10 * s + px * 6).toFixed(2) + 'deg) rotateX(' + (4 * s - py * 4).toFixed(2) + 'deg)';
    imgs.forEach(function (im) { im.style.transform = 'translateZ(' + (parseFloat(im.dataset.z) * 0.7 * s).toFixed(1) + 'px)'; });
    if (Math.abs(tp - p) > 0.0008 || Math.abs(tx - px) > 0.002 || Math.abs(ty - py) > 0.002) ask();
  }
  function ask() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask);
  box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; ask(); });
  box.addEventListener('pointerleave', function () { tx = 0; ty = 0; ask(); });
  ask();
})();
