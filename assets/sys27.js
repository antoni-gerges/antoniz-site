/* sys27.js (27 Oct 2026, package P9): two small jobs for sys27.css. No framework, no network, nothing drawn.
   1  data-sys27-pin on every pinned scene while it is really pinned (position:sticky and about a screen tall), so its foot is the chapter
      bar's band. The class list is every pinned family on the site (fp.css .fp-stick and the page-local ones); Home's stage and entrance are left alone.
   2  data-sys27-nocue on the "Scroll" cue (nav.js), on every screen size, while a picture, film or canvas is under it. */
(function () {
  'use strict';
  var D = document, W = window;
  var PINS = '.fp-stick,.lkv-stick,.dl-stick,.bc3-stick,.kb-pin,.k-pin,.pin-in,.m27-pin,.l22-stick,.ly-stick,.ly-tx-in,.sc25-pin,.rpin,.ipin';
  var MEDIA = 'img,video,canvas,picture,iframe';

  function marks() {
    var list = D.querySelectorAll(PINS), vh = W.innerHeight || 700;
    for (var i = 0; i < list.length; i++) {
      var e = list[i], on = getComputedStyle(e).position === 'sticky' && e.getBoundingClientRect().height >= vh * 0.6;
      if (on !== e.hasAttribute('data-sys27-pin')) { if (on) e.setAttribute('data-sys27-pin', ''); else e.removeAttribute('data-sys27-pin'); }
    }
  }

  function shown(e) {                       /* not hidden by itself or a parent */
    if (e.checkVisibility) return e.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    for (var n = e, k = 0; n && n !== D.body && k < 8; n = n.parentElement, k++) {
      var s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false;
    }
    return true;
  }
  function meets(r, c) { return r.width > 0 && r.height > 0 && r.right > c.left && r.left < c.right && r.bottom > c.top && r.top < c.bottom; }
  function pictureUnder(c) {
    var roots = [D], all = D.querySelectorAll('*'), i, j;
    for (i = 0; i < all.length; i++) if (all[i].shadowRoot) roots.push(all[i].shadowRoot);
    for (i = 0; i < roots.length; i++) {
      var m = roots[i].querySelectorAll(MEDIA);
      for (j = 0; j < m.length; j++) { if (meets(m[j].getBoundingClientRect(), c) && shown(m[j])) return true; }
    }
    /* a picture set as a CSS background, on what is under the cue's corners and middle */
    var pts = [[c.left, c.top], [c.right, c.top], [c.left, c.bottom], [c.right, c.bottom], [(c.left + c.right) / 2, (c.top + c.bottom) / 2]];
    for (i = 0; i < pts.length; i++) {
      var st = D.elementsFromPoint(Math.min(Math.max(pts[i][0], 1), W.innerWidth - 1), Math.min(Math.max(pts[i][1], 1), W.innerHeight - 1));
      for (j = 0; j < st.length; j++) {
        if (st[j].classList && st[j].classList.contains('scroll-cue')) continue;
        if (/url\(/.test(getComputedStyle(st[j]).backgroundImage)) return true;
        if (st[j] === D.body) break;
      }
    }
    return false;
  }
  function cue() {
    var a = D.querySelector('a.scroll-cue'); if (!a) return;
    if (a.hidden || (W.scrollY || D.documentElement.scrollTop) > (W.innerHeight || 700) * 0.1) return;   /* scrolled away: keep the last decision */
    a.removeAttribute('data-sys27-nocue');
    var r = a.getBoundingClientRect(); if (!r.width) return;
    var c = { left: r.left - 4, right: r.right + 4, top: r.top - 4, bottom: r.bottom + 4 };
    var vw = D.documentElement.clientWidth || W.innerWidth;
    /* hidden when: not whole on the screen (nav.js can put it past the right edge), the first screen is the entrance film (Home: the film
       fades up a few seconds after load, under the cue), or a picture, film or canvas is under it */
    if (r.left < -1 || r.right > vw + 1 || a.closest('#entrance') || pictureUnder(c)) a.setAttribute('data-sys27-nocue', '');
  }

  var t1 = 0, t2 = 0;
  function all() { marks(); cue(); }
  function later(ms) { setTimeout(all, ms); }
  D.addEventListener('DOMContentLoaded', all);
  W.addEventListener('load', function () { all(); [1700, 2500, 3300, 4200, 5200, 6500, 8500].forEach(later); });  /* nav.js places the cue at load + 1.2 s; a film can arrive later */
  W.addEventListener('pageshow', function () { later(300); });
  W.addEventListener('resize', function () {
    var a = D.querySelector('a.scroll-cue'); if (a) a.removeAttribute('data-sys27-nocue');   /* nav.js measures a cue that is there */
    clearTimeout(t1); t1 = setTimeout(all, 450);
  });
  W.addEventListener('scroll', function () {       /* back at the top, where the cue shows again: decide again */
    if ((W.scrollY || D.documentElement.scrollTop) > (W.innerHeight || 700) * 0.1) return;
    clearTimeout(t2); t2 = setTimeout(cue, 300);
  }, { passive: true });
  if (D.readyState !== 'loading') all();
})();
