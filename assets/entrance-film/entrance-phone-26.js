/* Home entrance, PHONE film with sound (27 Oct 2026; entrance-26oct/ent26p.py E-ENT26P; published as
   assets/entrance-film/entrance-phone-26.js). Loaded right after mobile-film.js, which builds the phone opening in #en-host's shadow
   root and its video.mobile-film. This script changes three things and nothing else:
   1 the film: film-phone-26.mp4 (the 17 Oct phone film with the butterfly whole in every frame and the take's own sound) in place of
     mobile-windows-17oct-1100.mp4, set before anything is fetched (mobile-film.js holds preload="none" until the load event);
   2 the sound, as on the desktop film (entrance-26.js): every play() first asks for sound; where the browser refuses it (until the
     visitor has touched the page), the film plays muted and "Sound on" shows beside the film's own control; the first tap, click or
     key anywhere on the page (not on the film's controls) turns the sound on, and the control then reads "Sound off" (it toggles).
     Replay keeps the chosen state. Pause, Replay, the montage after the film, reduced motion and the error path stay mobile-film.js's;
   3 the "Sound on" control (44 px), in the film's control row; it follows the film when the page scrolls, as the film's own control does.
   On a wider screen it does nothing until the phone opening is built (the same change of width mobile-film.js listens to). */
(function () {
  var d = document, cur = d.currentScript;
  var FILM = new URL('./film-phone-26.mp4', cur && cur.src ? cur.src : location.href).href;
  var host = d.getElementById('en-host'), root = host && host.shadowRoot;
  if (!root) return;
  var media = matchMedia('(max-width:760px)');
  var P = HTMLMediaElement.prototype.play;
  var v = null, wrap, ctl, bs, wantSound = true, blocked = false, started = false, failed = false, armed = false;

  function on() { return wantSound && !blocked && v && !v.muted; }
  function lbl(t, a) { if (bs.textContent !== t) bs.textContent = t; bs.setAttribute('aria-label', a); }
  function place() {                                   // left of the film's own control, on its row; above it when the row is full
    if (!bs || bs.hidden || !ctl || !ctl.isConnected || ctl.offsetParent !== bs.offsetParent) return;
    var W = bs.offsetParent.clientWidth, Hh = bs.offsetParent.clientHeight;   // layout positions (the scroll's translate left out)
    var foot = root.querySelector('.foot a'), f = foot ? foot.getBoundingClientRect() : null, o = bs.offsetParent.getBoundingClientRect();
    var right = W - ctl.offsetLeft + 4, left = W - right - bs.offsetWidth;
    var stack = f && f.width && left < f.right - o.left + 12;
    bs.style.right = (stack ? W - ctl.offsetLeft - ctl.offsetWidth : right) + 'px';
    bs.style.bottom = stack ? (Hh - ctl.offsetTop + 4) + 'px' : '';
  }
  function ui() {
    if (!bs) return;
    var show = started && !failed && !v.ended && media.matches;
    if (bs.hidden === show) bs.hidden = !show;
    if (on()) lbl('Sound off', 'Turn the film’s sound off'); else lbl('Sound on', 'Turn the film’s sound on');
    bs.setAttribute('aria-pressed', on() ? 'true' : 'false');
    bs.style.transform = ctl ? ctl.style.transform : '';
    place();
  }
  /* every play() first with the chosen sound; where the browser refuses sound, muted, and the next touch turns it on */
  function play() {
    v.muted = !wantSound || blocked;
    var p = P.call(v);
    if (!p || !p.then) return p;
    return p.catch(function (e) {
      if (!v.muted && e && e.name === 'NotAllowedError') {
        blocked = true; v.muted = true; arm(); ui();
        return P.call(v);
      }
      throw e;
    });
  }
  function soundOn() {                                 // inside a tap, click or key: the browser allows sound now
    var was = !v.paused;
    blocked = false; wantSound = true; v.muted = false;
    if (was && v.paused) { blocked = true; v.muted = true; P.call(v).catch(function () {}); arm(); }   // refused after all: muted again
    ui();
  }
  var EV = ['pointerup', 'touchend', 'click', 'keydown'];
  function first(e) {
    if (e.type === 'keydown' && (e.key === 'Escape' || e.altKey || e.metaKey || e.ctrlKey)) return;
    var ua = navigator.userActivation;
    if (ua && !ua.isActive) return;                    // a scroll, not a tap: wait for the next
    var path = e.composedPath ? e.composedPath() : [e.target];
    if (path.indexOf(bs) >= 0 || path.indexOf(ctl) >= 0) return;   // the film's controls do their own job
    armed = false; EV.forEach(function (t) { d.removeEventListener(t, first, true); });
    if (wantSound && v) soundOn();
  }
  function arm() {
    if (armed) return; armed = true;
    EV.forEach(function (t) { d.addEventListener(t, first, true); });
  }

  function hook() {
    if (v || !media.matches) return;
    var x = root.querySelector('video.mobile-film');
    if (!x) return;
    v = x; wrap = root.querySelector('.wrap'); ctl = root.querySelector('.mobile-film-control');
    v.src = FILM;                                      // nothing was fetched yet (preload none until load); the poster stays
    v.play = play;                                     // mobile-film.js's own calls (the hand-over, Play, Replay) come here
    var st = d.createElement('style');
    st.textContent = '.en-snd26p{display:none}@media(max-width:760px){.en-snd26p{display:block;position:absolute;right:140px;bottom:24px;z-index:3;'
      + 'background:transparent;color:#fff;border:0;border-radius:0;padding:10px 14px;font:500 14px system-ui;cursor:pointer;min-height:44px;min-width:44px}'
      + '.en-snd26p[hidden]{display:none}.en-snd26p:focus-visible{outline:2px solid #fff;outline-offset:4px}'
      + '.wrap.mobile-film-opening .en-snd26p{visibility:hidden}}@media(max-width:359px){.en-snd26p{padding:10px 8px;font-size:13px}}';
    root.append(st);
    bs = d.createElement('button'); bs.type = 'button'; bs.className = 'en-snd26p'; bs.hidden = true; bs.textContent = 'Sound on';
    bs.setAttribute('aria-pressed', 'false');
    (ctl && ctl.parentNode === wrap ? wrap.insertBefore(bs, ctl) : wrap.append(bs));
    bs.addEventListener('click', function () {
      if (on()) { wantSound = false; v.muted = true; } else soundOn();
      ui();
    });
    v.addEventListener('playing', function () { started = true; ui(); });
    ['pause', 'ended', 'volumechange', 'play'].forEach(function (t) { v.addEventListener(t, ui); });
    v.addEventListener('error', function () { failed = true; ui(); });
    addEventListener('scroll', ui, { passive: true });
    addEventListener('resize', ui);
    arm();                                             // a touch during the opening, before the film plays, also counts
    ui();
  }
  hook();
  media.addEventListener && media.addEventListener('change', function () { hook(); ui(); });
})();
