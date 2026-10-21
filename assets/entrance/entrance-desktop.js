/* Home entrance, DESKTOP film (21 Oct 2026; fixes20 E-ENTRANCE-DESKTOP; published as assets/entrance/entrance-desktop.js).
   Loaded right after section#entrance and before the opening's own script. On a desktop (min-width 761 px at load) it sets
   window.__enDesk, which stops the HTML/SVG opening from being built in #en-host, and plays the film once instead. On a phone it only
   sets window.__enDesk = false and returns: the phone opening runs exactly as before. If this file fails to load, __enDesk is undefined
   and the old opening is built everywhere, as before.
   The film: autoplays once (muted), holds its last frame (no loop, no fade); Pause/Play and Replay; if autoplay is refused, the poster
   and Play. Reduced motion: the poster, the words and one "Play the film" control; nothing moves unless asked. A return by Back/Forward
   or an arrival at a named section shows the finished frame at once, as the old opening did. */
(function () {
  var d = document, de = d.documentElement;
  var desk = !!(window.matchMedia && matchMedia('(min-width:761px)').matches);
  window.__enDesk = desk;
  if (!desk) return;
  var box = d.querySelector('#entrance .en-desk'), v = box && box.querySelector('video.en-film');
  var bp = box && box.querySelector('.en-pp'), br = box && box.querySelector('.en-rp');
  if (!v || !bp || !br) { window.__enDesk = false; return; }   // markup missing: let the old opening build
  de.classList.add('en-desk-on');
  var RM = matchMedia('(prefers-reduced-motion: reduce)');
  var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  var instant = nav.type === 'back_forward' || location.hash.length > 1;
  var started = false, autoPaused = false, away = false, failed = false;

  /* a first visit, a reload and an ordinary link to Home start at the top, as the old opening did; the browser gets the reader's place
     back for Back and Forward once the film has ended, the reader has moved, or 8 s have passed */
  function restoreAuto() { history.scrollRestoration = 'auto'; }
  if (!instant) {
    history.scrollRestoration = 'manual'; scrollTo(0, 0);
    setTimeout(restoreAuto, 8000);
    ['wheel', 'keydown', 'touchmove'].forEach(function (e) { addEventListener(e, restoreAuto, { once: true, passive: true }); });
  }

  v.muted = true; v.defaultMuted = true; v.playsInline = true;
  v.poster = v.getAttribute('data-poster');
  v.preload = (instant || RM.matches) ? 'metadata' : 'auto';
  v.src = v.getAttribute('data-src');

  var shown = false;
  function words(ms) { if (shown) return; shown = true; setTimeout(function () { box.classList.add('on'); }, Math.max(0, ms || 0)); }
  function lbl(b, t, a) { if (b.textContent !== t) b.textContent = t; b.setAttribute('aria-label', a); }
  function ui() {
    if (failed) { bp.hidden = br.hidden = true; return; }
    if (!started) {                                   // before the first frame plays: one Play control (autoplay refused, or reduced motion)
      var rm = RM.matches || v.paused;
      bp.hidden = !rm; br.hidden = true;
      if (RM.matches) lbl(bp, 'Play the film', 'Play the opening film'); else lbl(bp, 'Play', 'Play the opening film');
      return;
    }
    if (v.ended) { bp.hidden = true; br.hidden = false; lbl(br, 'Replay', 'Replay the opening film'); return; }
    bp.hidden = false; br.hidden = false;
    if (v.paused) lbl(bp, 'Play', 'Play the opening film'); else lbl(bp, 'Pause', 'Pause the opening film');
    lbl(br, 'Replay', 'Replay the opening film');
  }
  function play() {
    var p = v.play();
    if (p && p.catch) p.catch(function () { words(0); ui(); });   // refused (autoplay policy) or interrupted: the poster, the words, Play
  }
  function vid() { box.classList.add('vid'); }        // the film's frames, not the poster, are on screen: the ground follows (see the css)
  v.addEventListener('playing', function () { vid(); if (!started) { started = true; words(600 - v.currentTime * 1000); } ui(); });
  v.addEventListener('seeked', vid);
  v.addEventListener('pause', ui);
  v.addEventListener('ended', function () { restoreAuto(); ui(); });
  v.addEventListener('error', function () { failed = true; words(0); ui(); });
  bp.addEventListener('click', function () {
    autoPaused = false;
    if (v.paused || v.ended) { if (v.ended) v.currentTime = 0; play(); } else v.pause();
  });
  br.addEventListener('click', function () { autoPaused = false; v.currentTime = 0; play(); });

  /* the header: the name beside the mark stays hidden while the opening is on screen, as before (body.en-top) */
  function onScroll() {
    var h = innerHeight; d.body.classList.toggle('en-top', scrollY < h * .6);
    var a = scrollY >= h * .85;                       // the next section has covered the film: rest it; back at the top: go on
    if (a !== away) {
      away = a;
      if (away && !v.paused) { autoPaused = true; v.pause(); }
      else if (!away && autoPaused && !d.hidden) { autoPaused = false; play(); }
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  d.addEventListener('visibilitychange', function () {
    if (d.hidden && !v.paused) { autoPaused = true; v.pause(); }
    else if (!d.hidden && autoPaused && !away) { autoPaused = false; play(); }
  });
  RM.addEventListener && RM.addEventListener('change', function () { if (RM.matches && !v.paused) v.pause(); ui(); });

  if (instant) {                                      // Back/Forward or a named section: the finished frame, at once
    started = true; words(0);
    v.addEventListener('loadedmetadata', function () { if (isFinite(v.duration)) v.currentTime = v.duration; }, { once: true });
    v.addEventListener('seeked', ui, { once: true });
  } else if (RM.matches) {
    words(0);                                         // reduced motion: the still poster, the words, one Play control
  } else {
    play();
    setTimeout(function () { words(0); }, 2500);      // the words never wait on a slow network
  }
  d.body.classList.add('en-top');
  onScroll(); ui();
})();
