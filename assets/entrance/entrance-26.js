/* Home entrance, DESKTOP film with sound (26 Oct 2026; entrance-26oct/ent26.py E-ENT26; published as assets/entrance/entrance-26.js).
   Loaded right after the 21 Oct entrance-desktop.js and before the opening's data.js. E-ENT26 keeps the 21 Oct stage in an HTML comment
   (fixes20 still finds its text there) and puts its own stage after it: div.en-desk[data-fix="E-ENT26"], the same classes for the
   picture and the words, and its own buttons (.en-pp26, .en-rp26, .en-snd), so the 21 Oct script finds no buttons of its own and stands
   down (it sets window.__enDesk = false and returns); this script then sets window.__enDesk again, so the HTML/SVG opening is never built
   on a desktop. On a phone it only sets window.__enDesk = false and returns: the phone opening runs exactly as before.
   The film (film-desktop-26.mp4, with its own sound): on arrival it tries to play with sound; where the browser refuses that (until the
   visitor has touched the page), it plays muted and shows "Sound on" beside Pause and Replay. The first tap, click or key anywhere on the
   page turns the sound on, and the control then reads "Sound off" (it toggles). Replay keeps the chosen state. It holds its last frame
   (no loop, no fade); Pause/Play and Replay; if autoplay is refused even muted, the poster and Play. Reduced motion: the poster, the words
   and one "Play the film" control; nothing moves unless asked. A return by Back/Forward or an arrival at a named section shows the
   finished frame at once. */
(function () {
  var d = document, de = d.documentElement;
  var desk = !!(window.matchMedia && matchMedia('(min-width:761px)').matches);
  window.__enDesk = desk;
  if (!desk) return;
  var box = d.querySelector('#entrance .en-desk[data-fix="E-ENT26"]'), v = box && box.querySelector('video.en-film');
  var bp = box && box.querySelector('.en-pp26'), br = box && box.querySelector('.en-rp26'), bs = box && box.querySelector('.en-snd');
  if (!v || !bp || !br || !bs) { window.__enDesk = false; return; }   // markup missing: let the old opening build
  de.classList.add('en-desk-on');
  var RM = matchMedia('(prefers-reduced-motion: reduce)');
  var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  var instant = nav.type === 'back_forward' || location.hash.length > 1;
  var started = false, autoPaused = false, away = false, failed = false;
  var wantSound = true;        // the visitor's choice; the browser may still hold the film muted until the first touch (blocked)
  var blocked = false;

  function restoreAuto() { history.scrollRestoration = 'auto'; }
  if (!instant) {
    history.scrollRestoration = 'manual'; scrollTo(0, 0);
    setTimeout(restoreAuto, 8000);
    ['wheel', 'keydown', 'touchmove'].forEach(function (e) { addEventListener(e, restoreAuto, { once: true, passive: true }); });
  }

  v.playsInline = true;
  v.muted = false; v.defaultMuted = false;
  v.poster = v.getAttribute('data-poster');
  v.preload = (instant || RM.matches) ? 'metadata' : 'auto';
  v.src = v.getAttribute('data-src');

  var shown = false;
  function words(ms) { if (shown) return; shown = true; setTimeout(function () { box.classList.add('on'); }, Math.max(0, ms || 0)); }
  function lbl(b, t, a) { if (b.textContent !== t) b.textContent = t; b.setAttribute('aria-label', a); }
  function soundUi() {
    var on = wantSound && !blocked && !v.muted;
    bs.hidden = failed || !started;
    if (on) lbl(bs, 'Sound off', 'Turn the film’s sound off'); else lbl(bs, 'Sound on', 'Turn the film’s sound on');
    bs.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function ui() {
    soundUi();
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
  /* play with the chosen sound; where the browser refuses sound, play muted and wait for the first touch */
  function play(again) {
    v.muted = !wantSound || blocked;
    var p = v.play();
    if (!p || !p.catch) return;
    p.catch(function (e) {
      if (!v.muted && e && e.name === 'NotAllowedError') {
        if (touched && !again) { play(true); return; }   // the visitor touched the page while the browser was still answering
        blocked = true; v.muted = true; armTouch();
        var q = v.play();
        if (q && q.catch) q.catch(function () { words(0); ui(); });
        ui(); return;
      }
      words(0); ui();                                 // refused even muted (autoplay policy) or interrupted: the poster, the words, Play
    });
  }
  function soundOn() {                                // inside a tap, click or key: the browser allows sound now
    blocked = false; wantSound = true; v.muted = false; ui();
  }
  var armed = false, touched = false;
  function armTouch() {
    if (armed) return; armed = true;
    function first(e) {
      if (e.type === 'keydown' && (e.key === 'Escape' || e.altKey || e.metaKey || e.ctrlKey)) return;
      d.removeEventListener('click', first, true); d.removeEventListener('keydown', first, true);
      touched = true;
      if (bs.contains(e.target)) return;              // the Sound control itself handles this tap
      if (wantSound) soundOn();
    }
    d.addEventListener('click', first, true); d.addEventListener('keydown', first, true);
  }
  function vid() { box.classList.add('vid'); }
  v.addEventListener('playing', function () { vid(); if (!started) { started = true; words(600 - v.currentTime * 1000); } ui(); });
  v.addEventListener('seeked', vid);
  v.addEventListener('pause', ui);
  v.addEventListener('volumechange', ui);
  v.addEventListener('ended', function () { restoreAuto(); ui(); });
  v.addEventListener('error', function () { failed = true; words(0); ui(); });
  bp.addEventListener('click', function () {
    autoPaused = false;
    if (v.paused || v.ended) { if (v.ended) v.currentTime = 0; play(); } else v.pause();
  });
  br.addEventListener('click', function () { autoPaused = false; v.currentTime = 0; play(); });
  bs.addEventListener('click', function () {
    if (wantSound && !blocked && !v.muted) { wantSound = false; v.muted = true; }
    else soundOn();
    ui();
  });

  function onScroll() {
    var h = innerHeight; d.body.classList.toggle('en-top', scrollY < h * .6);
    var a = scrollY >= h * .85;
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

  armTouch();                                         // a touch before the browser has even answered also counts
  if (instant) {
    started = true; words(0);
    v.addEventListener('loadedmetadata', function () { if (isFinite(v.duration)) v.currentTime = v.duration; }, { once: true });
    v.addEventListener('seeked', ui, { once: true });
  } else if (RM.matches) {
    words(0);
  } else {
    play();
    setTimeout(function () { words(0); }, 2500);
  }
  d.body.classList.add('en-top');
  onScroll(); ui();
})();
