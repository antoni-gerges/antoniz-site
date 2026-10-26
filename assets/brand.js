/* brand.js — the quiet brand jobs across the site (see brand.css). No dependencies. */
(function () {
  var doc = document, base = (doc.currentScript && doc.currentScript.src || '').replace(/assets\/brand\.js.*$/, '');
  var BIRD = 'M 185.890625 116.859375 L 153.070312 116.707031 L 179.902344 21.996094 C 149.394531 21.996094 122.597656 42.253906 114.285156 71.609375 L 101.578125 116.464844 L 87.539062 166.011719 L 60.710938 260.722656 C 91.21875 260.722656 118.011719 240.460938 126.328125 211.109375 L 139.035156 166.253906 L 251.277344 166.777344 C 243.097656 137.386719 216.398438 117.003906 185.890625 116.859375 Z';
  var SIGS = 'M 42.242188 126.320312 L 30.691406 167.089844 C 37.269531 167.089844 43.046875 162.726562 44.839844 156.394531 L 56.386719 115.625 C 49.8125 115.625 44.035156 119.992188 42.242188 126.320312 Z M 75.246094 115.625 C 68.671875 115.625 62.894531 119.992188 61.101562 126.320312 L 49.550781 167.089844 C 56.128906 167.089844 61.90625 162.726562 63.699219 156.394531 Z M 82.558594 156.394531 L 94.109375 115.625 C 87.53125 115.625 81.753906 119.992188 79.960938 126.320312 L 68.410156 167.089844 C 74.988281 167.089844 80.765625 162.726562 82.558594 156.394531 Z';
  function $(q, r) { return (r || doc).querySelector(q); }
  function $$(q, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(q)); }
  function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }

  /* preview navigation: inside the preview pages, the main links go to the preview pages */
  if ((/(^|\/)(home-next|next)\.html$/.test(location.pathname) || doc.documentElement.getAttribute('data-preview')) && base) {
    var MAP = { '': 'home-next.html', 'index.html': 'home-next.html', 'about/': 'about/next.html', 'work/': 'work/next.html', 'projects/': 'projects/next.html', 'contact/': 'contact/next.html', 'how-i-work/': 'how-i-work/next.html' };
    var eh = doc.getElementById('en-host'), links = $$('a[href]').concat(eh && eh.shadowRoot ? $$('a[href]', eh.shadowRoot) : []);   // the entrance lives in a shadow root
    links.forEach(function (a) {
      var h = a.getAttribute('href'); if (!h || /^(https?:|mailto:|tel:|#)/.test(h)) return;
      var u = new URL(h, location.href), rel = u.href.replace(u.hash, '').replace(base, '').replace(/index\.html$/, '');
      if (MAP.hasOwnProperty(rel)) a.href = base + MAP[rel] + u.hash;
    });
  }

  /* 2 meaning: the three moves as counted signals */
  function ticks(n) { return '<span class="mvt" aria-hidden="true">' + [1, 2, 3].map(function (i) { return '<i' + (i <= n ? ' class="on"' : '') + '></i>'; }).join('') + '</span>'; }
  $$('.moveslist li').forEach(function (li, i) { var s = $('span', li); if (s) { s.outerHTML = ticks(i + 1) + '<span class="vh" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)">' + (i + 1) + '</span>'; } });
  $$('.move .num').forEach(function (p, i) { var s = $('span', p); if (s) s.insertAdjacentHTML('beforebegin', ticks(i + 1)); });
  var after = $('.moves .label');           // How I work: the fourth beat
  if (after && $('.move') && !$('.mv-strip')) after.insertAdjacentHTML('beforebegin', '<div class="built4"><span class="b4s" aria-hidden="true"><i></i><i></i><i></i></span><svg viewBox="56 18 200 246" fill="currentColor" aria-hidden="true"><path d="' + BIRD + '"/></svg><p class="b4w"><b>Then it is built.</b></p></div>');

  /* 3 key onward links */
  $$('.door .open, .sec-h .arrow, .moves .arrow, .popen').forEach(function (a) { a.classList.add('sigl'); });

  /* 4 signing off */
  $$('footer.foot p').forEach(function (p) { if ($('svg', p)) return; p.classList.add('sign'); p.insertAdjacentHTML('afterbegin', '<svg viewBox="28 20 226 243" fill="currentColor" aria-hidden="true"><path d="' + BIRD + '"/><path d="' + SIGS + '"/></svg>'); });

  /* 5 About: the route, Cairo to the Gulf to Tampa; the mark travels it as the section scrolls through */
  var pl = $('.places h2');
  if (pl) {
    /* phone: drawn at phone size (320 wide), taller, with each long role on two lines, so no label crosses another at 320 to 430 px (12 Oct) */
    var ph = innerWidth <= 760, W = ph ? 320 : 1180, Hh = ph ? 372 : 230, A = [ph ? 12 : 40, ph ? 286 : Hh - 96], M = [W * .48, Hh * (ph ? .5 : .59)], Z = [W - (ph ? 14 : 50), ph ? 44 : 54];
    var d = 'M ' + A[0] + ' ' + A[1] + ' C ' + (W * (ph ? .16 : .2)) + ' ' + (Hh * (ph ? .1 : .08)) + ' ' + (W * (ph ? .3 : .36)) + ' ' + (ph ? M[1] : Hh * .98) + ' ' + M[0] + ' ' + M[1] + ' S ' + (W * (ph ? .99 : .84)) + ' ' + (Hh * (ph ? .46 : .02)) + ' ' + Z[0] + ' ' + Z[1];   /* phone: the line meets the middle stop level and climbs the right edge, clear of the labels */
    var ZX = Z[0] - (ph ? 28 : 0);
    var dy = ph ? 28 : 34, dy2 = ph ? 49 : 56, dy3 = ph ? 68 : 76;
    var two = function (x, y, anchor, l1, l2, id) { return '<text class="rl"' + (id ? ' id="' + id + '"' : '') + (anchor ? ' text-anchor="' + anchor + '"' : '') + (x != null ? ' x="' + x + '" y="' + y + '"' : '') + '>' + (ph ? '<tspan' + (x != null ? ' x="' + x + '"' : '') + '>' + l1 + '</tspan><tspan' + (x != null ? ' x="' + x + '"' : '') + ' dy="17">' + l2 + '</tspan>' : l1 + ' ' + l2) + '</text>'; };
    pl.insertAdjacentHTML('afterend', '<div class="route" aria-hidden="true"><svg viewBox="0 0 ' + W + ' ' + Hh + '"><path id="rt" d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" opacity=".8"/>' +
      '<circle cx="' + A[0] + '" cy="' + A[1] + '" r="5" fill="currentColor"/><circle id="rmid" r="5" fill="currentColor"/><circle cx="' + Z[0] + '" cy="' + Z[1] + '" r="5" fill="currentColor"/>' +
      '<text x="' + A[0] + '" y="' + (A[1] + dy) + '">Cairo</text><text class="yr" x="' + A[0] + '" y="' + (A[1] + dy2) + '">2003</text><text class="rl" x="' + A[0] + '" y="' + (A[1] + dy3) + '">Graphic designer</text>' +
      '<text id="rmt" text-anchor="middle" data-fix="E-C25-7">Dubai and Abu Dhabi</text><text id="rmy" class="yr" text-anchor="middle">2006 to 2024</text>' + two(null, null, 'middle', 'Founder of AntBrush ·', 'partner at MCX', 'rml') +
      '<text x="' + ZX + '" y="' + (Z[1] + dy) + '" text-anchor="end">Tampa</text><text class="yr" x="' + ZX + '" y="' + (Z[1] + dy2) + '" text-anchor="end">2024</text>' + two(ZX, Z[1] + dy3, 'end', 'Creative direction,', 'with new tools for making') +
      '<g id="rm"><g transform="scale(' + (ph ? .1 : .19) + ') translate(-62 -141)" fill="currentColor"><path d="' + BIRD + '"/><path d="' + SIGS + '"/></g></g></svg></div>');
    var rt = $('#rt'), rm = $('#rm'), L = rt.getTotalLength(), sec = $('.places');
    var mid = rt.getPointAtLength(L * .5); $('#rmid').setAttribute('cx', mid.x); $('#rmid').setAttribute('cy', mid.y);
    if (!ph) { dy += 22; dy2 += 22; dy3 += 22; }   /* content25 E-C25-7: "Dubai and Abu Dhabi" is wider than "Dubai"; on a desktop the stop's three lines sit 14 lower, clear of the route */   /* the middle stop only (Cairo and Tampa are already written): on a desktop the dots ran into the top of "The Gulf" (13 Oct) */
    $('#rmt').setAttribute('x', mid.x); $('#rmt').setAttribute('y', mid.y + dy); $('#rmy').setAttribute('x', mid.x); $('#rmy').setAttribute('y', mid.y + dy2); $('#rml').setAttribute('x', mid.x); $('#rml').setAttribute('y', mid.y + dy3); $$('#rml tspan').forEach(function (t) { t.setAttribute('x', mid.x); });
    // the mark's tail sits on the line and its body leads: it flies along the route and stops just short of Tampa
    var setR = function () { var r = sec.getBoundingClientRect(), h = innerHeight, p = Math.min(1, Math.max(0, (h * .85 - r.top) / (h * .75)));
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) p = 1;
      var e = p * p * (3 - 2 * p), pt = rt.getPointAtLength(L * e * .93); rm.setAttribute('transform', 'translate(' + pt.x + ' ' + (pt.y - (ph ? 14 : 26)) + ')'); };
    addEventListener('scroll', setR, { passive: true }); addEventListener('resize', setR); setR();
  }

  /* 6 films: three signals while the film loads */
  var fp = $('.fplayer');
  if (fp) { fp.insertAdjacentHTML('beforeend', '<span class="fload" aria-hidden="true"><i></i><i></i><i></i></span>'); var fv = $('video', fp);
    ['waiting', 'loadstart'].forEach(function (ev) { fv.addEventListener(ev, function () { if (fv.getAttribute('src')) fp.classList.add('wait'); }); });
    ['playing', 'canplay', 'emptied', 'error'].forEach(function (ev) { fv.addEventListener(ev, function () { fp.classList.remove('wait'); }); }); }

  /* 7 the phone menu and the film player are modal: the page behind is inert, Tab stays inside, Escape closes and focus returns
        (site.js only toggles the classes; this adds the keyboard behaviour without changing it) */
  function setInert(on, keep) { $$('body > *').forEach(function (el) { if (el === keep || /^(SCRIPT|STYLE|LINK)$/.test(el.tagName)) return;
    if (on) { if (!el.hasAttribute('inert')) { el.setAttribute('inert', ''); el.setAttribute('data-inert-by', 'modal'); } }
    else if (el.getAttribute('data-inert-by') === 'modal') { el.removeAttribute('inert'); el.removeAttribute('data-inert-by'); } }); }
  function tabbables(root) { return $$('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])', root).filter(function (el) { var cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getClientRects().length > 0; }); }
  function trap(e, root) { if (e.key !== 'Tab') return; var f = tabbables(root); if (!f.length) { e.preventDefault(); return; } var first = f[0], last = f[f.length - 1], a = doc.activeElement;
    if (e.shiftKey && (a === first || !root.contains(a))) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && (a === last || !root.contains(a))) { e.preventDefault(); first.focus(); } }
  var hdrM = $('.hdr'), menuB = $('.menu-btn');
  if (hdrM && menuB) { var wasOpen = false;
    new MutationObserver(function () { var open = hdrM.classList.contains('open'); if (open === wasOpen) return; wasOpen = open; setInert(open, hdrM);
      var back = menuB.getClientRects().length ? menuB : ($('.brand', hdrM) || menuB);   /* beyond the first screen the Menu button is not shown: the mark opened the menu, so the mark takes the focus back */
      if (open) { if (!hdrM.contains(doc.activeElement)) menuB.focus({ preventScroll: true }); } else back.focus({ preventScroll: true }); }).observe(hdrM, { attributes: true, attributeFilter: ['class'] });
    doc.addEventListener('keydown', function (e) { if (!hdrM.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); menuB.click(); } else trap(e, hdrM); }, true); }
  var filmB = $('.fplayer');
  if (filmB) { var filmOpen = false, filmFrom = null;
    doc.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-film]'); if (t) filmFrom = t; }, true);   /* remember which Play button opened it */
    new MutationObserver(function () { var open = filmB.classList.contains('open'); if (open === filmOpen) return; filmOpen = open; setInert(open, filmB);
      if (!open && filmFrom) { filmFrom.focus({ preventScroll: true }); filmFrom = null; } }).observe(filmB, { attributes: true, attributeFilter: ['class'] });   /* films.js tries to return focus while the page is still inert, so it is returned here */
    doc.addEventListener('keydown', function (e) { if (filmB.classList.contains('open')) trap(e, filmB); }, true); }

  /* 8 Home, "Three projects": the stage (assets/home2.css holds every rule; this only says which project is on and how far the scroll is).
        data-state = 1, 2 or 3 on .stg, and --p from 0 to 3 over the screen's whole passage (0 to 1 the first project, and so on).
        Scroll drives both while the stage is pinned; a tap on a waiting window or on a name under "Next" does the same and moves the
        scroll to match. Under prefers-reduced-motion --p is never written (everything stands fully out) and nothing travels. */
  var stg = $('.stg');
  if (stg) (function () {
    var pin = $('.stg-pin', stg), says = $$('.stg-s', stg), rm = matchMedia('(prefers-reduced-motion: reduce)');
    var state = +stg.getAttribute('data-state') || 1, lockY = null, lockT = 0, tick = false;
    function geo() { var r = stg.getBoundingClientRect(), v = pin.offsetHeight, vh = innerHeight, tr = r.height - v; return { r: r, v: v, vh: vh, tr: tr, pinned: tr > vh * .3 }; }
    var ol = $('.stg-q ol', stg);
    function set(n) { if (n === state) return; state = n; if (!rm.matches) stg.classList.add('stg-live'); stg.setAttribute('data-state', n);
      /* the names under "Next" stand in the order of the line, in the page too, so Tab meets them as the eye does */
      var act = doc.activeElement, had = ol && ol.contains(act);
      if (ol) [1, 2, 0].forEach(function (k) { var li = $('li[data-p="' + ((n - 1 + k) % 3 + 1) + '"]', ol); if (li) ol.appendChild(li); });
      if (had && act.offsetParent) act.focus({ preventScroll: true }); }
    function read() { tick = false; var g = geo(), d = g.vh - g.r.top, a = g.vh + g.tr * .25, b = g.vh + g.tr * .625, e = g.vh + g.r.height;
      if (!g.pinned) { stg.style.removeProperty('--p'); return; }                      /* a screen too low to pin the stage: taps only */
      var p = d <= 0 ? 0 : d < a ? d / a : d < b ? 1 + (d - a) / (b - a) : Math.min(3, 2 + (d - b) / (e - b));
      if (rm.matches) stg.style.removeProperty('--p'); else stg.style.setProperty('--p', p.toFixed(3));
      if (lockY !== null && Math.abs(scrollY - lockY) < 3) unlock();
      if (lockY === null) set(p < 1 ? 1 : p < 2 ? 2 : 3); }
    function unlock() { lockY = null; clearTimeout(lockT); }
    function go(n, focus) { if (n === state) return; var g = geo(); set(n);
      if (g.pinned) { lockY = Math.round(scrollY + g.r.top + g.tr * [.1, .44, .82][n - 1]);     /* the middle of that project's share of the scroll */
        scrollTo({ top: lockY, behavior: (g.r.top <= 1 && g.r.bottom >= g.v - 1) || rm.matches ? 'auto' : 'smooth' });
        clearTimeout(lockT); lockT = setTimeout(function () { unlock(); read(); }, 1600); }
      if (focus && says[n - 1]) says[n - 1].focus({ preventScroll: true }); }
    /* Tab into the stage: the browser scrolls the focused link into view, that scroll could step the stage to the next project, the link was then hidden
       and the focus fell back to the page. The stage now holds the project whose link has the keyboard's focus (13 Oct). */
    says.forEach(function (a, i) { a.addEventListener('focus', function () { if (lockY !== null || !a.matches(':focus-visible')) return; var g = geo(); if (!g.pinned) return;
      set(i + 1); lockY = Math.round(scrollY + g.r.top + g.tr * [.1, .44, .82][i]); scrollTo({ top: lockY, behavior: 'auto' });
      requestAnimationFrame(function () { if (lockY !== null) scrollTo({ top: lockY, behavior: 'auto' }); });   /* after the browser's own scroll-into-view, whichever came first */
      clearTimeout(lockT); lockT = setTimeout(function () { unlock(); read(); }, 1600); }); });
    ['wheel', 'touchmove', 'keydown'].forEach(function (ev) { addEventListener(ev, function (e) { if (lockY !== null && (ev !== 'keydown' || /^(Arrow|Page|Home|End| )/.test(e.key))) unlock(); }, { passive: true }); });
    $$('.stg-nx', stg).forEach(function (a) { a.setAttribute('role', 'button'); a.setAttribute('aria-label', 'Show ' + txt(a));          /* without script it stays a plain link to the project */
      a.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); a.click(); } }); });
    stg.addEventListener('click', function (e) { var t = e.target.closest ? e.target : e.target.parentNode, b = t.closest('.stg-nx'), w = t.closest('.stg-w');
      if (b) { e.preventDefault(); go(+b.getAttribute('data-p'), true); }
      else if (w) { var n = +w.getAttribute('data-p'); if (n === state) says[n - 1].click(); else go(n, false); } });   /* the head window opens its project; a waiting one takes the stage */
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(read); } }, { passive: true });
    addEventListener('resize', read); read();
  })();

  /* 1 where you are. The guide reads data-stop. 13 Oct: Home has it again, for seven screens (Opening, Selected work, All twelve, In numbers, How I work,
        Films, Say hello). A stop that also carries data-stop-quiet is counted, so "3 of 7" is true, but the guide is not shown on it: the opening and
        the stage fill the screen (the stage has its own "Next"), and Say hello is the foot of the page, where the guide would cover the sign-off. */
  var groups = [
    { name: 'Page', sel: '[data-stop]', label: function (el) { return el.getAttribute('data-stop'); } },
    { name: 'Selected projects', sel: '.doors .door', label: function (el) { return txt($('.proj', el)).split(' · ')[0]; } },
    { name: 'Work', els: $$('.cnav a[href^="#"]').map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean), label: function (el) { var a = $('.cnav a[href="#' + el.id + '"]'); return a ? txt(a).replace(/^\d+\s*/, '') : txt($('h2', el)); }, span: true },
    { name: 'Three moves', sel: 'section.move', label: function (el) { return txt($('h2', el)); } },
    { name: 'Projects', sel: '.plist .pcard', label: function (el) { return txt($('.pclient', el)); } }
  ];
  var SHORT = { 'ZEISS Vision Care': 'ZEISS', 'Liwa International Festival': 'Liwa', 'Dubai Health Authority': 'DHA', 'Cityscape Abu Dhabi': 'Cityscape', 'National Bullying Prevention Week': 'Bullying Week', 'Why Not! Mazzika': 'Mazzika', 'Why Not! Mazzika Festival': 'Mazzika', 'Majid Al Futtaim Global Solutions': 'Pyramids', 'Capacity Middle East': 'Capacity', 'Innovation Month': 'Innovation Month', 'The Big Grill': 'Big Grill', 'Al Forsan International Sports Resort': 'Al Forsan', 'Innovation Month, Al Ain': 'Innovation Month', 'Find the one idea.': 'Find', 'Draw many. Choose one.': 'Draw', 'Stay until it stands.': 'Stay', 'Designed, then built': 'Designed, built' };
  function short(n) { return SHORT[n] || (n.length > 16 ? n.slice(0, 15).replace(/\s+\S*$/, '') + '…' : n); }
  var stops = [];
  groups.forEach(function (g) { var els = g.els || $$(g.sel); els.forEach(function (el, i) { stops.push({ el: el, g: g, i: i, n: els.length, name: g.label(el), end: els[i + 1] || null, quiet: el.hasAttribute('data-stop-quiet') }); /* an item lasts until the next one starts, so the chip never blinks off in the gaps */ }); });
  if (stops.length > 1) {
    var chip = doc.createElement('div'); chip.className = 'where'; chip.setAttribute('role', 'status'); chip.setAttribute('aria-live', 'off');
    chip.innerHTML = '<span class="tk" aria-hidden="true"><i></i><i></i><i></i></span><b></b><span class="of"></span><a href="#"></a>';
    doc.body.appendChild(chip); doc.body.classList.add('has-where');
    var cb = $('b', chip), co = $('.of', chip), ca = $('a', chip), cur = -1;
    ca.addEventListener('click', function (e) { e.preventDefault(); var nx = stops[cur + 1]; if (nx && nx.g === stops[cur].g) nx.el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });
    var foot = $('body > footer.foot'), atEnd = false;
    var upd = function () { var mid = innerHeight * .5, k = -1;
      /* at the foot of a page the guide steps down, so it never sits on the sign-off (desktop; on a phone it is a bar under the page) */
      var e = !!foot && innerWidth > 760 && foot.getBoundingClientRect().top < innerHeight - 6; if (e !== atEnd) { atEnd = e; chip.classList.toggle('end', e); }
      stops.forEach(function (s, i) { var top = s.el.getBoundingClientRect().top, bot = s.end ? s.end.getBoundingClientRect().top : s.el.getBoundingClientRect().bottom;
        if (s.g.span && !s.end) { var mn = $('main'); bot = mn ? mn.getBoundingClientRect().bottom : bot; }
        if (top <= mid && bot > mid) k = i; });
      if (k !== cur) { cur = k;
        if (k < 0 || stops[k].quiet) { chip.classList.remove('on'); return; }   /* a quiet stop (data-stop-quiet: Home's opening, its stage, Say hello) is counted, but the guide stays down while it is on */
        var s = stops[k], nx = stops[k + 1], ph = innerWidth <= 760; cb.textContent = ph ? short(s.name) : s.name; co.textContent = (s.i + 1) + ' of ' + s.n;
        if (nx && nx.g === s.g) { ca.textContent = 'Next: ' + short(nx.name) + ' ↓'; ca.hidden = false; ca.setAttribute('aria-label', 'Go to the next one: ' + nx.name); } else ca.hidden = true;
        chip.classList.add('on'); } };
    var tk = false; addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(function () { tk = false; upd(); }); } }, { passive: true }); addEventListener('resize', upd); upd();
  }
})();
