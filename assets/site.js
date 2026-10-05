/* Antoni Gerges, site v2. Small, dependency-free. Motion is slow and respects reduced motion. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* phone menu */
  var hdr = document.querySelector('.hdr');
  var mb = document.querySelector('.menu-btn');
  if (hdr && mb) {
    mb.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      mb.textContent = open ? 'Close' : 'Menu';
      document.body.classList.toggle('lock', open);
    });
  }

  /* reveals */
  var els = document.querySelectorAll('.rv, .settle, .flymk, .intro, .routes, [data-in]');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }
  var intro = document.querySelector('.intro');
  if (intro) requestAnimationFrame(function () { setTimeout(function () { intro.classList.add('in'); }, 80); });

  /* header colours follow the section under it (data-hdr="#bg,#fg") */
  var zones = document.querySelectorAll('[data-hdr]');
  if (hdr && zones.length) {
    var setHdr = function () {
      var y = 40, pick = null;
      zones.forEach(function (z) { var r = z.getBoundingClientRect(); if (r.top <= y && r.bottom > y) pick = z; });
      var v = (pick ? pick.getAttribute('data-hdr') : '').split(',');
      if (v.length >= 2) { hdr.style.setProperty('--hdr-bg', v[0]); hdr.style.setProperty('--hdr-fg', v[1]); hdr.style.setProperty('--hdr-mk', v[2] || v[1]); }
      else { hdr.style.removeProperty('--hdr-bg'); hdr.style.removeProperty('--hdr-fg'); hdr.style.removeProperty('--hdr-mk'); }
    };
    var tick = false;
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; setHdr(); }); } }, { passive: true });
    setHdr();
  }

  /* video sources: pick 720 on small or data-saving screens */
  var small = window.innerWidth < 900 || (navigator.connection && navigator.connection.saveData);
  function srcFor(v) { return small ? (v.getAttribute('data-src-sm') || v.getAttribute('data-src')) : v.getAttribute('data-src'); }

  /* lazy muted clips: play only while on screen */
  var clips = document.querySelectorAll('video[data-clip]');
  if (clips.length) {
    var vio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) { v.src = srcFor(v); }
          if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (!v.paused) { v.pause(); }
      });
    }, { rootMargin: '200px 0px', threshold: 0.2 }) : null;
    clips.forEach(function (v) {
      v.muted = true; v.setAttribute('muted', ''); v.playsInline = true;
      if (vio) vio.observe(v); else v.src = srcFor(v);
      if (reduce) { v.controls = true; }
    });
  }

  /* the reel loop: muted, inline; a pause button for control */
  var loop = document.querySelector('.reel video.loop');
  var pauseBtn = document.querySelector('.reel .pause');
  if (loop) {
    loop.muted = true;
    var loopIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (!loop.getAttribute('src')) loop.src = srcFor(loop);
          if (!reduce && !loop.dataset.userPaused) { var p = loop.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (!loop.paused) loop.pause();
        if (pauseBtn) pauseBtn.textContent = loop.paused ? 'Play' : 'Pause';
      });
    }, { threshold: 0.25 });
    loopIo.observe(loop);
    loop.addEventListener('play', function () { if (pauseBtn) pauseBtn.textContent = 'Pause'; });
    loop.addEventListener('pause', function () { if (pauseBtn) pauseBtn.textContent = 'Play'; });
    if (pauseBtn) pauseBtn.addEventListener('click', function () {
      if (!loop.getAttribute('src')) loop.src = srcFor(loop);
      if (loop.paused) { delete loop.dataset.userPaused; loop.play(); } else { loop.dataset.userPaused = '1'; loop.pause(); }
    });
  }

  /* the full-window player, with sound */
  var player = document.querySelector('.player');
  if (player) {
    var pv = player.querySelector('video');
    var closeBtn = player.querySelector('.x');
    var opener = null;
    var open = function (ev) {
      if (ev) ev.preventDefault();
      opener = document.activeElement;
      if (!pv.getAttribute('src')) pv.src = srcFor(pv);
      player.classList.add('open'); player.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lock');
      if (loop && !loop.paused) loop.pause();
      pv.muted = false; pv.currentTime = 0;
      var p = pv.play(); if (p && p.catch) p.catch(function () {});
      closeBtn.focus();
    };
    var close = function () {
      pv.pause();
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
      player.classList.remove('open'); player.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
      if (loop && !reduce && !loop.dataset.userPaused) loop.play().catch(function () {});
      if (opener) opener.focus();
    };
    document.querySelectorAll('[data-open-reel]').forEach(function (b) { b.addEventListener('click', open); });
    closeBtn.addEventListener('click', close);
    pv.addEventListener('ended', close);
    document.addEventListener('keydown', function (e) {
      if (!player.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === closeBtn ? pv : closeBtn).focus(); }
    });
    if (location.hash === '#reel') setTimeout(open, 300);
  }

  /* work index: a picture follows the pointer over the list (desktop only) */
  var hp = document.querySelector('.hoverpic');
  if (hp && window.matchMedia('(hover:hover) and (min-width:861px)').matches) {
    var hpi = hp.querySelector('img');
    document.querySelectorAll('.windex a').forEach(function (a) {
      a.addEventListener('mouseenter', function () { hpi.src = a.getAttribute('data-pic'); hp.classList.add('on'); });
      a.addEventListener('mouseleave', function () { hp.classList.remove('on'); });
      a.addEventListener('mousemove', function (e) {
        var x = Math.min(window.innerWidth - hp.offsetWidth - 24, e.clientX + 32);
        var y = Math.max(80, Math.min(window.innerHeight - hp.offsetHeight - 24, e.clientY - hp.offsetHeight / 2));
        hp.style.left = x + 'px'; hp.style.top = y + 'px';
      });
    });
  }
})();
