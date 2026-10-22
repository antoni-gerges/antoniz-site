/* ZEISS: the campaign scene. A lens passes over the save the date and shows the invitation inside it; then the lens opens
   over the whole frame, and the reminder arrives the same way. Scroll-driven; with reduced motion it steps, without JavaScript
   the three artworks sit one under the other (see the noscript rules in the page). */
(function () {
  var W = window, D = document, FP = W.FP; if (!FP) return;
  var sec = D.querySelector('.zl'); if (!sec) return;
  var art = sec.querySelector('.art'), a1 = sec.querySelector('.a1'), a2 = sec.querySelector('.a2'), ring = sec.querySelector('.ring'), now = sec.querySelector('.now b');
  var LENS = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 88.5'%3E%3Cpath d='M50,1.8 C80,1.8 99,14.1 98,38.7 C97,65.1 74,86.7 47,86.7 C21,86.7 1.5,63.4 2,35.2 C2.5,12.3 20,1.8 50,1.8 Z'/%3E%3C/svg%3E\")";
  art.style.setProperty('--lens', LENS);
  var lab = ['Save the date', 'The invitation', 'The reminder'], cur = -1;
  /* The two artworks carry the ZEISS logo in nearly the same place, but not exactly: the save the date's block is 150 px wide at
     (1440, 87), the invitation's 144 px at (1420, 116), in the 1684 x 1191 files (measured from the blue of each file). While the lens
     edge crosses the logo, the invitation is scaled and moved by that much so the two logos meet and do not double. Once the logo
     is inside the lens, it eases back: at rest the invitation is whole and exactly in place. */
  var LS = 150 / 144, LX = 1440 - 1420 * LS, LY = 87 - 116 * LS;
  function set(img, cx, cy, w, al) { /* centre and width of the lens, as fractions of the frame; al = how far the logos are aligned (a1 only) */
    var Wd = art.clientWidth, H = art.clientHeight, pw = w * Wd, ph = pw * .885, x = cx * Wd - pw / 2, y = cy * H - ph / 2;
    var k = Wd / 1684, s = 1, tx = 0, ty = 0;
    if (al > 0) { s = 1 + (LS - 1) * al; tx = LX * k * al; ty = LY * k * al; }
    if (img === a1) img.style.transform = al > 0 ? 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + s.toFixed(5) + ')' : '';
    /* the lens stays where it is drawn on screen: its mask is given in the picture's own, possibly moved, coordinates */
    img.style.webkitMaskSize = img.style.maskSize = (pw / s).toFixed(1) + 'px ' + (ph / s).toFixed(1) + 'px';
    img.style.webkitMaskPosition = img.style.maskPosition = ((x - tx) / s).toFixed(1) + 'px ' + ((y - ty) / s).toFixed(1) + 'px';
    return [x, y, pw];
  }
  FP.on(function (H) {
    var r = sec.getBoundingClientRect(); if (r.bottom < -H || r.top > 2 * H) return;
    var p = FP.clamp(-r.top / (r.height - H), 0, 1);
    if (FP.rm) p = p < .35 ? 0 : p < .82 ? .74 : 1;
    /* the lens comes in at the left, crosses the athlete and the glasses to the name, then opens over the whole frame */
    var t = FP.ease(FP.seg(p, .08, .5)), g = FP.ease(FP.seg(p, .5, .72)), inn = FP.seg(p, .02, .1);
    var cx = .2 + t * .5 - g * .2, cy = .58 - t * .1 + g * .02, w = .22 + inn * .2 + g * 3.4;
    var b = set(a1, cx, cy, w, 1 - FP.ease(FP.seg(p, .58, .72)));
    a1.style.opacity = inn > 0 ? 1 : 0;
    ring.style.transform = 'translate(' + b[0].toFixed(1) + 'px,' + b[1].toFixed(1) + 'px)'; ring.style.width = b[2].toFixed(1) + 'px';
    ring.style.opacity = (+((inn * (1 - FP.seg(p, .5, .6)))) >= .5 ? 1 : 0)/*wa-cut*/;
    /* the reminder arrives in the same frame, the same way */
    var q = FP.ease(FP.seg(p, .82, .97)); a2.style.opacity = q > 0 ? 1 : 0; set(a2, .5, .5, q * 3.6);
    var n = p < .3 ? 0 : p < .88 ? 1 : 2; if (n !== cur) { cur = n; now.textContent = lab[n]; }
  });
})();
