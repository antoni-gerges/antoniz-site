/* ZEISS: From brief to result. Every move is a function of scroll, on the page engine (fp.js); with reduced motion each screen
   shows its end state. ZEISS's own corner brackets are the one moving thing besides the films:
   01 holds on the closed shutter, a still (it never opens on camera, so nothing is faked);
   03 the brackets close in from the edges of the screen onto the way in; 04 they leave the drawing for the booth as built;
   06 the night takes the whole screen, the brackets riding its corners. 02 (zl.js) and 05 (the band) keep their own engines. */
(function () {
  var W = window, D = document, FP = W.FP; if (!FP) return;
  var clamp = FP.clamp, seg = FP.seg, ease = FP.ease;
  function rel(el, st) { var a = el.getBoundingClientRect(), b = st.getBoundingClientRect(); return [a.left - b.left, a.top - b.top, a.width, a.height]; }
  function mix(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  function put(br, r, pad) { br.style.transform = 'translate(' + (r[0] - pad).toFixed(1) + 'px,' + (r[1] - pad).toFixed(1) + 'px)'; br.style.width = (r[2] + 2 * pad).toFixed(1) + 'px'; br.style.height = (r[3] + 2 * pad).toFixed(1) + 'px'; }
  function pad() { return W.innerWidth <= 760 ? -8 : 12; } /* on a phone the pictures run edge to edge, so the brackets sit inside their corners */
  function prog(sec, H) { var r = sec.getBoundingClientRect(); if (r.bottom < -H || r.top > 2 * H) return -1; return clamp(-r.top / Math.max(1, r.height - H), 0, 1); }

  /* 03 · the brackets lead you in: from the edges of the screen onto the film */
  var s3 = D.querySelector('.z3');
  if (s3) {
    var st3 = s3.querySelector('.fp-stick'), fr3 = s3.querySelector('.zb-fr'), br3 = s3.querySelector('.zb-br');
    FP.on(function (H, Wd) {
      var p = prog(s3, H); if (p < 0) return;
      var t = FP.rm ? 1 : ease(seg(p, .04, .52)), m = Wd <= 760 ? 10 : 22;
      put(br3, mix([m, m + (Wd <= 760 ? 56 : 0), st3.clientWidth - 2 * m, st3.clientHeight - 2 * m - (Wd <= 760 ? 56 : 0)], rel(fr3, st3), t), pad() * t);
    });
  }

  /* 04 · the idea, built: the brackets hold the drawing, then leave it for the booth as it was built */
  var s4 = D.querySelector('.z4');
  if (s4) {
    var st4 = s4.querySelector('.fp-stick'), fd = s4.querySelector('.d .zb-fr'), fb = s4.querySelector('.b .zb-fr'), br4 = s4.querySelector('.zb-br');
    FP.on(function (H) {
      var p = prog(s4, H); if (p < 0) return;
      var t = FP.rm ? (p < .5 ? 0 : 1) : ease(seg(p, .3, .66));
      put(br4, mix(rel(fd, st4), rel(fb, st4), t), pad());
    });
  }

  /* 06 · the result: the night takes the whole screen (desktop); on a phone it is already the full width */
  var s6 = D.querySelector('.z6');
  if (s6) {
    var st6 = s6.querySelector('.fp-stick'), fr6 = s6.querySelector('.zb-fr'), im6 = fr6.querySelector('img'), br6 = s6.querySelector('.zb-br'),
      lead6 = s6.querySelector('.lead'), cap6 = s6.querySelector('figcaption'), end6 = s6.querySelector('.endcap'), AR = 2400 / 1597;
    FP.on(function (H, Wd) {
      var p = prog(s6, H); if (p < 0) return;
      var a = rel(fr6, st6);
      if (Wd <= 760 || FP.rm) { im6.style.transform = ''; put(br6, a, -8); lead6.style.opacity = cap6.style.opacity = ''; end6.style.opacity = 0; return; }
      var t = FP.rm ? 1 : ease(seg(p, .1, .66));
      var Sw = st6.clientWidth, Sh = st6.clientHeight, bw = Sw - 2 * 56, bh = Sh - 34 - 64, w = Math.min(bw, bh * AR), h = w / AR;
      var b = [(Sw - w) / 2, 34 + (bh - h) / 2, w, h], c = mix(a, b, t), k = c[2] / a[2];
      im6.style.transform = t > 0 ? 'translate(' + (c[0] - a[0]).toFixed(1) + 'px,' + (c[1] - a[1]).toFixed(1) + 'px) scale(' + k.toFixed(4) + ')' : '';
      put(br6, c, 12);
      lead6.style.opacity = (1 - seg(p, .06, .3)).toFixed(3);
      cap6.style.opacity = (1 - seg(t, 0, .25)).toFixed(3);
      end6.style.transform = 'translate(' + b[0].toFixed(1) + 'px,' + (b[1] + h + 14).toFixed(1) + 'px)';
      end6.style.opacity = seg(t, .82, 1).toFixed(3);
    });
  }
  FP.ask();
})();
