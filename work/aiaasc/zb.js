/* AIAASC: From brief to result, 01. The proposal's cover holds; the audit's two lines come up beside it, one at a time, with scroll.
   With reduced motion they are simply there. The 3D beats (02 to 05) run in aa.js; 06 is the film, played by the engine. */
(function () {
  var FP = window.FP; if (!FP) return;
  var s = document.querySelector('.z1'); if (!s) return;
  var qs = [].slice.call(s.querySelectorAll('.q'));
  FP.on(function (H) {
    var r = s.getBoundingClientRect(); if (r.bottom < -H || r.top > 2 * H) return;
    var p = FP.clamp(-r.top / Math.max(1, r.height - H), 0, 1);
    qs.forEach(function (q, i) { var k = FP.rm ? 1 : FP.ease(FP.seg(p, .1 + i * .3, .32 + i * .3)); q.style.opacity = k.toFixed(3); q.style.transform = 'translateY(' + ((1 - k) * 14).toFixed(1) + 'px)'; });
  });
  FP.ask();
})();
