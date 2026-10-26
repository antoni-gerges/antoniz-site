/* antoniz.com · E-NAV (21 Oct 2026): the site menu, the link signal and the scroll cue, on every page, at runtime.
   Linked last (defer, before </body>) by fixes20 E-NAV, with assets/nav.css after fixes.css. The build changes no other markup:
   this script reads each page as it is, so a rebuilt page keeps all of it. Design: website-review/clickability-21oct/DESIGN.md.
     1 THE MENU    a "Menu" button after CV in the header (desktop); the phone Menu button opens the same panel instead of the old sheet
     2 THE SIGNAL  text links underlined (Jost 600, paper); → another page here, ↗ another site; a leaning badge on every picture that opens something (→ ▶ ↗, + for a zoom)
     3 THE CUE     "Scroll ↓" on each first screen that fills the viewport, gone once the page has moved 10% of a screen
   Instant show and hide only. window.__navReport says what was done on the page (counts for the preview notes). */
(function () {
  'use strict';
  var D = document, W = window, R = D.documentElement;
  if (W.__navSys) return; W.__navSys = true;

  /* the path back to the site root, from this script's own src ("../../assets/nav.js" -> "../../"), as the header links do */
  var me = D.currentScript || D.querySelector('script[src*="nav.js"]');
  var P = ((me && me.getAttribute('src')) || 'assets/nav.js').replace(/[^\/]*\/nav\.js(?:[?#].*)?$/, '');
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || D).querySelectorAll(s)); };
  var rep = W.__navReport = { menu: false, trigger: '', badges: 0, badgeList: [], badgeSkipped: [], figureLinks: 0, textLinks: 0, blockLinks: 0,
    buttonLike: 0, extArrowsAdded: 0, arrowsTurned: 0, plainFixed: [], plainLeft: [], expanderArrows: [], cue: '' };
  function el(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function desc(e) { return e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') + (e.id ? '#' + e.id : ''); }

  /* ---------------------------------------------------------------- 1 · THE MENU */
  /* wavea22 E-A4: the Home order, with the five live shows */
  var WORK = [['Dubai Health Authority', 'work/dha/'], ['ZEISS', 'work/zeiss/'], ['Liwa', 'work/liwa/'], ['AIAASC', 'work/aiaasc/'], ['Why Not! Mazzika', 'work/mazzika/'], ['National Bullying Prevention Week', 'work/anti-bullying/'], ['Al Forsan', 'work/al-forsan/'], ['Exhibitions', 'work/spaces/'], ['Cityscape Abu Dhabi', 'work/cityscape/'], ['World Future Energy Summit', 'work/wfes/'], ['Abu Dhabi International Building Codes', 'work/building-codes/'], ['The Big Grill', 'work/big-grill/'], ['Innovation Month', 'work/al-ain/'], ['MAF', 'work/pyramids-2021/'], ['Capacity Middle East', 'work/capacity/'], ['Live shows', 'work/live-shows/'], ['Mohamed Mounir Live in Dubai', 'work/mounir/'], ['Amr Diab Live in Dubai', 'work/amr-diab/'], ['Angham Live in Dubai', 'work/angham/'], ['Magida El Roumi Live in Dubai', 'work/magida-el-roumi/'], ['Lilly Singh Live in Dubai', 'work/lilly-singh/'], ['Hakawi Sharqia', 'work/hakawi/'], ['Akshaya × Vikas Khanna', 'work/akshaya/'], ['Children of Light Academy', 'work/children-of-light-academy/']];
  var ARCHIVE = [['All work', 'work/'], ['Ideas', 'work/archive/#ideas'], ['Designed, then built', 'work/archive/#spaces'], ['Identities', 'work/archive/#identities'],
    ['Campaigns', 'work/archive/#campaigns'], ['Live', 'work/archive/#live'], ['Film', 'work/#film']];
  var TONY = [['About', 'about/'], ['How I work', 'about/#how-i-work'], ['Creative leadership, in practice', 'about/#studio'], ['What I stand for', 'about/#what-i-stand-for'],
    ['In their words', 'about/#in-their-words'], ['Education', 'about/#education-work'], ['Where and for whom', 'about/#where'],
    ['Contact', 'contact/'], ['Download the CV', 'assets/Antoni-Gerges-CV-e735cd452b.pdf', 'download']];
  var REACH = [['antoni@antbrush.com', 'mailto:antoni@antbrush.com'], ['+1 (571) 278-8950', 'tel:+15712788950']];
  /* wp25 E-WP25-15 (25 Oct): the Clients column in Home's order (trust25), linked where a project page exists; the venues by city */
  var CLIENTS = [["Government and public sector", [["Dubai Health Authority", "work/dha/"], ["Department of Municipalities and Transport, Abu Dhabi", "work/cityscape/"], ["UAE Ministry of Education", "work/anti-bullying/"], ["UAE Ministry of Foreign Affairs and International Cooperation"], ["Abu Dhabi Sports Council", "work/al-forsan/"], ["Abu Dhabi Airports"], ["Abu Dhabi Media"], ["Dubai Land Department"], ["Emirates Post Group"], ["Khalifa Fund for Enterprise Development"], ["Abu Dhabi Urban Planning Council"], ["Department of Urban Planning and Municipalities, Abu Dhabi"], ["Department of Transport, Abu Dhabi"], ["Abu Dhabi City Municipality"], ["Al Ain City Municipality", "work/al-ain/"], ["Al Dhafra Region Municipality"], ["Musanada"], ["Abu Dhabi Projects and Infrastructure Centre"], ["Shurooq, Sharjah Investment and Development Authority"], ["Emirates Center for Strategic Studies and Research"]]], ["Brands and companies", [["ZEISS", "work/zeiss/"], ["Etisalat", "work/capacity/"], ["MAF", "work/pyramids-2021/"], ["Unilever"], ["ADNOC"], ["Deutsche Post DHL"], ["Technology Innovation Institute"], ["Miral"], ["Emirates Steel"], ["Al Masaood"], ["Capitala"], ["Al Qudrah Holding"], ["MedEuropa Refining"], ["Saraya Interior Design"]]], ["Education and culture", [["American International Accreditation Association of Schools and Colleges (AIAASC)", "work/aiaasc/"], ["Children of Light Academy", "work/children-of-light-academy/"], ["ZOWD"]]], ["Exhibition stand design", [["Abu Dhabi Education Council"], ["Abu Dhabi Food Control Authority"], ["Telecommunications Regulatory Authority"], ["Abu Dhabi Chamber of Commerce and Industry"], ["Abu Dhabi Centre for Technical and Vocational Education and Training (ACTVET)"], ["ASUS"], ["ABB"], ["JVC"], ["Emaar Misr"], ["Ducab"], ["Dubai Airport Freezone"], ["Elm"], ["Tawazun"], ["Arabsat"], ["Nas Air"], ["RAK Porcelain"], ["DOKA"], ["Liberty Automobiles (Cadillac and Chevrolet)"], ["Bin Jabr Group"], ["Al Hamra Group"], ["ADCOM Systems"], ["Emdad"], ["Suwaidi Engineering Group"], ["United Broadcast"], ["PAKSAT"], ["iMCC Group"], ["Ceramica Omega"], ["Ceramica Verdi"], ["Pal Middle East"], ["Mazroui Engineering"], ["NAS (Naval Advanced Solutions)"], ["Dar Designs"]]]];
  var VENUES = [["Dubai", [["Coca-Cola Arena", "work/mazzika/"], ["Armani Hotel Dubai, Burj Khalifa", "work/capacity/"], ["Atlantis The Palm, Nasimi Beach", "work/capacity/"], ["Dubai Media City Amphitheatre", "work/live-shows/"], ["Dubai World Trade Centre", "work/angham/"], ["Emirates Golf Club", "work/hakawi/"], ["JW Marriott Marquis Dubai"], ["The Space, Dubai", "work/zeiss/"], ["City Centre Mirdif and City Centre Deira"]]], ["Abu Dhabi", [["ADNEC", "work/cityscape/"], ["Abu Dhabi Global Market"], ["Rosewood Abu Dhabi"], ["Yas Links, Yas Island", "work/big-grill/"], ["Yas Island"], ["Umm Lafina Bridge"], ["Moreeb Dune, Liwa", "work/liwa/"], ["Al Ain", "work/al-ain/"], ["Al Dhafra Region"]]], ["Sharjah and abroad", [["Expo Centre Sharjah"], ["Marriott Mena House, Giza, at the Pyramids", "work/pyramids-2021/"], ["Istanbul"]]]];

  function samePage(href) {
    try { var u = new URL(href, location.href), clean = function (p) { return p.replace(/index\.html$/, ''); };
      return !u.hash && u.origin === location.origin && clean(u.pathname) === clean(location.pathname); } catch (e) { return false; }
  }
  function list(items, cls, arrow, abs) {
    var ul = el('ul', 'sm-list' + (cls ? ' ' + cls : ''));
    items.forEach(function (it) {
      var li = el('li');
      if (it[1]) {
        var a = el('a', null, it[0]), href = abs ? it[1] : P + it[1];
        a.setAttribute('href', href);
        if (it[2] === 'download') a.setAttribute('download', '');
        if (arrow) { var s = el('span', 'sm-ar', ' →'); s.setAttribute('aria-hidden', 'true'); a.appendChild(s); }
        if (!abs && samePage(href)) a.setAttribute('aria-current', 'page');
        li.appendChild(a);
      } else li.textContent = it[0];
      ul.appendChild(li);
    });
    return ul;
  }
  var menu = el('nav', 'site-menu'); menu.id = 'site-menu'; menu.setAttribute('aria-label', 'Site menu'); menu.hidden = true;
  var bar = el('div', 'sm-bar'), closeB = el('button', 'sm-close', 'Close'); closeB.type = 'button'; bar.appendChild(closeB);
  var scroller = el('div', 'sm-scroll'), grid = el('div', 'sm-grid');
  function col(name, cls) { var c = el('div', 'sm-col ' + cls); c.appendChild(el('h2', 'sm-h', name)); grid.appendChild(c); return c; }
  var cW = col('Work', 'sm-work'); cW.appendChild(list(WORK, 'sm-names')); cW.appendChild(el('p', 'sm-lab', 'The archive')); cW.appendChild(list(ARCHIVE, 'sm-sub'));
  var cT = col('Tony', 'sm-tony'); cT.appendChild(list(TONY, 'sm-names')); cT.appendChild(list(REACH, 'sm-small sm-reach', false, true));
  /* wp25 E-WP25-15: Home's Trusted by in its four groups, then the venues by city; a desktop shows every group, the list scrolling in its
     column; a phone opens the first group and the others on a tap (hard cuts) */
  var cC = col('Clients', 'sm-clients'), cBox = el('div', 'wp25-cl'), cPh = W.matchMedia('(max-width:760px)');
  function cGroup(name, items, first) {
    var g = el('div', 'wp25-g'), b = el('button', 'wp25-b'), open = first || !cPh.matches; b.type = 'button';
    b.appendChild(el('span', null, name)); b.appendChild(D.createTextNode(' ')); b.appendChild(el('i', null, String(items.length)));
    function set(o) { open = o; g.classList.toggle('wp25-shut', !o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); }
    b.addEventListener('click', function () { set(!open); }); set(open);
    g.appendChild(b); g.appendChild(list(items, 'sm-small', true)); return g;
  }
  CLIENTS.forEach(function (c, i) { cBox.appendChild(cGroup(c[0], c[1], i === 0)); });
  cBox.appendChild(el('p', 'sm-lab', 'Venues'));
  VENUES.forEach(function (c) { cBox.appendChild(cGroup(c[0], c[1], false)); });
  cC.appendChild(cBox);
  var cSt = el('style'); cSt.setAttribute('data-fix', 'E-WP25-15'); cSt.textContent = ".site-menu .wp25-g{margin:0}html:not(#_t) body .site-menu .wp25-b{all:unset;box-sizing:border-box;display:flex;gap:10px;align-items:baseline;cursor:pointer;font-family:Inter,system-ui,sans-serif!important;font-weight:600!important;color:rgba(247,245,241,.72)!important;margin:1.1em 0 .2em}html:not(#_t) body .site-menu .wp25-g:first-child>.wp25-b{margin-top:0}html:not(#_t) body .site-menu .wp25-b i{font-style:normal;font-weight:400!important;color:rgba(247,245,241,.5)}html:not(#_t) body .site-menu .wp25-b:focus-visible{outline:2px solid #F7F5F1!important;outline-offset:3px!important}.site-menu .wp25-shut>.sm-list{display:none}@media (min-width:761px){.site-menu .wp25-cl{max-height:calc(100vh - 252px);max-height:calc(100svh - 252px);overflow-y:auto;overscroll-behavior:contain;padding:0 12px 16px 0;border-bottom:1px solid rgba(247,245,241,.18)}}@media (max-width:760px){html:not(#_t) body .site-menu .wp25-b{min-height:44px;width:100%;align-items:center;justify-content:space-between;margin:0;border-top:1px solid rgba(247,245,241,.18)}html:not(#_t) body .site-menu .wp25-cl .sm-list li{padding:0}html:not(#_t) body .site-menu .wp25-cl .sm-list li:not(:has(a)){padding:12px 0}html:not(#_t) body .site-menu .wp25-cl .sm-list a{display:inline-block;padding:12px 0}html:not(#_t) body .site-menu .wp25-cl>.sm-lab{margin:1.6em 0 .4em}}"; D.head.appendChild(cSt);
  scroller.appendChild(grid); menu.appendChild(bar); menu.appendChild(scroller);
  D.body.appendChild(menu); rep.menu = true;

  /* the desktop trigger: a fifth word after CV, dressed like its neighbours (their computed type and spacing, so every template matches) */
  var hnav = $('.hdr .nav'), navB = null;
  if (hnav) {
    var cv = $('.navcv', hnav) || $$('a', hnav).pop();
    navB = el('button', 'nav-menu', 'Menu'); navB.type = 'button';
    navB.setAttribute('aria-expanded', 'false'); navB.setAttribute('aria-controls', 'site-menu');
    if (cv) { cv.after(navB);
      var cs = getComputedStyle(cv);
      ['fontFamily', 'fontWeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft']
        .forEach(function (k) { navB.style[k] = cs[k]; });
    } else hnav.appendChild(navB);
  }
  var phoneB = $('.hdr .menu-btn');
  if (phoneB) { phoneB.setAttribute('aria-controls', 'site-menu'); phoneB.setAttribute('aria-expanded', 'false'); }
  rep.trigger = (navB ? 'desktop button after CV' : 'no .hdr .nav') + (phoneB ? '; phone .menu-btn taken over' : '');

  var opener = null;
  function setInert(on) {
    $$('body > *').forEach(function (e) {
      if (e === menu || /^(SCRIPT|STYLE|LINK|TEMPLATE|NOSCRIPT)$/.test(e.tagName)) return;
      if (on) { if (!e.hasAttribute('inert')) { e.setAttribute('inert', ''); e.setAttribute('data-inert-by', 'site-menu'); } }
      else if (e.getAttribute('data-inert-by') === 'site-menu') { e.removeAttribute('inert'); e.removeAttribute('data-inert-by'); }
    });
  }
  function expanded(v) { [navB, phoneB].forEach(function (b) { if (b) b.setAttribute('aria-expanded', v); }); }
  function openMenu(from) {
    if (!menu.hidden) return;
    opener = from || D.activeElement;
    var sbw = W.innerWidth - R.clientWidth;
    menu.hidden = false; R.classList.add('sm-open');
    if (sbw > 0) R.style.setProperty('--sm-sbw', sbw + 'px');
    setInert(true); expanded('true'); scroller.scrollTop = 0;
    closeB.focus({ preventScroll: true });
  }
  function closeMenu(keepFocus) {
    if (menu.hidden) return;
    menu.hidden = true; R.classList.remove('sm-open'); R.style.removeProperty('--sm-sbw');
    setInert(false); expanded('false');
    if (!keepFocus) {
      var back = [opener, navB, phoneB, $('.hdr .brand')].filter(function (b) { return b && b.getClientRects().length; })[0];
      if (back) back.focus({ preventScroll: true });
    }
    opener = null;
  }
  /* capture phase, on window: the phone button's own handlers (site.js, fp.js) never see the click, so the old four-word sheet stays shut */
  W.addEventListener('click', function (e) {
    var t = e.target, b = t && t.closest && t.closest('.nav-menu, .hdr .menu-btn');
    if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (menu.hidden) openMenu(b); else closeMenu();
  }, true);
  menu.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.sm-close')) { closeMenu(); return; }
    if (t.closest('a[href]')) { closeMenu(true); return; }        /* the link is followed; a same-page anchor scrolls once the lock is gone */
    if (!t.closest('.sm-col')) closeMenu();                       /* the ground outside the columns */
  });
  function tabbables() { return $$('a[href], button', menu).filter(function (x) { return x.getClientRects().length; }); }
  D.addEventListener('keydown', function (e) {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeMenu(); return; }
    if (e.key === 'Tab') {
      var f = tabbables(), i = f.indexOf(D.activeElement);
      if (!f.length) return;
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
      e.stopImmediatePropagation();
    }
  }, true);

  /* ---------------------------------------------------------------- 2 · THE LINK SIGNAL */
  var MEDIA = 'img, video, picture';
  var PLAY = '.wl-pl, .ply, .fpl, .pl, .pj-play, .play, .film .go, [class*="-play"]';
  var GLYPH = { page: '→', film: '▶', out: '↗', zoom: '+' };
  function rgba(c) { var m = (c || '').match(/[\d.]+/g); return m ? { r: +m[0], g: +m[1], b: +m[2], a: m.length > 3 ? +m[3] : 1 } : null; }
  function lum(c) { var f = function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); }
  function groundOf(e) {                     /* the first opaque background up the tree, and the ink that stands on it */
    for (var n = e; n && n.nodeType === 1; n = n.parentElement) {
      var cs = getComputedStyle(n), c = rgba(cs.backgroundColor);
      if (c && c.a > .5) return { light: lum(c) > .45, ink: cs.color };
    }
    return { light: false, ink: '#F7F5F1' };
  }
  function setInk(e, g) {                    /* a light ground: the section's own ink, the line at 38% of it */
    var c = rgba(g.ink); if (!c) return;
    e.classList.add('nl-light');
    e.style.setProperty('--nl-ink', 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')');
    e.style.setProperty('--nl-line', 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',.38)');
  }
  var INTERNAL = /(^|\.)antoniz\.com$/i;
  function isExt(a) { return /^https?:$/.test(a.protocol) && a.host !== location.host && !INTERNAL.test(a.hostname); }
  function isFilm(w) { return w.tagName === 'BUTTON' ? (w.hasAttribute('data-film') || /\bfilm/.test(w.className)) : /\.(mp4|mov|webm|m3u8)([?#]|$)/i.test(w.getAttribute('href') || ''); }
  function glyphFor(w) { if (isFilm(w)) return GLYPH.film; if (w.tagName === 'A' && isExt(w)) return GLYPH.out; return GLYPH.page; }
  function textNodes(root) { var w = D.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, out = []; while ((n = w.nextNode())) out.push(n); return out; }
  function turn(a, from, to) {               /* every from-glyph in the link's own text becomes to; returns how many */
    var k = 0;
    textNodes(a).forEach(function (n) { if (n.nodeValue.indexOf(from) < 0) return; k += n.nodeValue.split(from).length - 1; n.nodeValue = n.nodeValue.split(from).join(to); });
    return k;
  }
  function arrows(a, host, noAdd) {          /* → another page here, ↗ another site; host is where an added ↗ goes */
    var t = a.textContent;
    if (isExt(a)) {
      if (t.indexOf('↗') >= 0) return;
      if (t.indexOf('→') >= 0) { rep.arrowsTurned += turn(a, '→', '↗'); return; }
      if (!t.trim() || noAdd) return;
      var s = el('span', 'nl-ar', ' ↗'); s.setAttribute('aria-hidden', 'true'); (host || a).appendChild(s); rep.extArrowsAdded++;
    } else if (t.indexOf('↗') >= 0 && /^(https?:|file:)$/.test(a.protocol)) rep.arrowsTurned += turn(a, '↗', '→');
  }
  function buttonLike(a) {
    if (a.getAttribute('role') === 'button') return true;
    var cs = getComputedStyle(a), bg = rgba(cs.backgroundColor);
    if (bg && bg.a > .1) return true;
    return ['Top', 'Right', 'Bottom', 'Left'].every(function (s) { return parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none'; });
  }
  function blockKids(a) {                   /* a link that holds a block: real block children, or a band of mixed sizes (the next-project band) */
    if ($('h1, h2, h3, h4, h5, h6, p, div, ul, ol, figure, blockquote, section', a)) return true;
    var ds = getComputedStyle(a).display, kids = [].filter.call(a.children, function (c) { return c.textContent.trim(); });
    if (/flex|grid/.test(ds)) {
      var sizes = {}; kids.forEach(function (c) { sizes[getComputedStyle(c).fontSize] = 1; });
      return Object.keys(sizes).length > 1 || (/column/.test(getComputedStyle(a).flexDirection) && kids.length > 1);
    }
    return kids.some(function (c) { return /^(block|flex|grid|list-item|table)$/.test(getComputedStyle(c).display); });
  }
  function cueOf(a) {                        /* inside a block link, the line that says where it goes */
    var go = $('[class*="-go"]', a); if (go) return go;
    var hd = $('h2, h3, h4, b, strong, .hl', a); if (hd) return hd;
    var arr = $$('*', a).filter(function (c) { return /[→↗]/.test(c.textContent) && !c.children.length; })[0];
    if (arr && arr.parentElement !== a && arr.textContent.trim().length <= 2) return arr.parentElement;
    return arr && arr.textContent.trim().length > 2 ? arr : null;
  }
  var SCOPE = 'main a[href], footer a[href]';
  function textLink(a) {
    if (a.__nl) return; a.__nl = 1;
    if (a.closest('.hdr, .site-menu, .scroll-cue, noscript')) return;
    if (buttonLike(a)) { a.classList.add('nl-btn'); rep.buttonLike++; return; }
    var g = groundOf(a.parentElement || a);
    if (blockKids(a)) {
      var c = cueOf(a); a.classList.add('nl-block'); rep.blockLinks++;
      if (c) { c.classList.add('nl-u'); if (g.light) setInk(a, g); }
      arrows(a, isExt(a) ? (c || null) : null);
      return;
    }
    a.classList.add('nl'); rep.textLinks++;
    if (g.light) setInk(a, g);
    arrows(a);
  }
  /* a picture that opens something: a badge at its bottom-right; the frame is the picture's own box when the link also holds text below it */
  function frameOf(w, m) {
    if (m.parentElement && m.parentElement.tagName === 'PICTURE') m = m.parentElement;
    var f = m.parentElement;
    if (!f || f === w || !w.contains(f) || getComputedStyle(f).display === 'inline') return w;
    var wr = w.getBoundingClientRect(), mr = m.getBoundingClientRect();
    return (mr.height > 0 && wr.height - mr.height > 24) || w.tagName === 'FIGURE' ? f : w;
  }
  var badged = [];
  function badge(frame, g, why, media) {
    if (frame.__nb) return; frame.__nb = 1;
    var after = getComputedStyle(frame, '::after').content, before = getComputedStyle(frame, '::before').content;
    if (after === 'none' || after === 'normal') frame.classList.add('has-badge');
    else if (before === 'none' || before === 'normal') frame.classList.add('has-badge', 'nb-before');
    else { var i = el('i', 'nav-badge'); i.setAttribute('aria-hidden', 'true'); i.setAttribute('data-badge', g); frame.appendChild(i); }
    frame.setAttribute('data-badge', g);
    if (getComputedStyle(frame).position === 'static') frame.classList.add('nb-rel');
    frame.__nbm = media || $$(MEDIA.replace('picture', 'x-none'), frame);
    frame.__nbWin = $('.sgw-in', frame);
    badged.push(frame); nbPos(frame); watchMedia(frame);
    rep.badges++; rep.badgeList.push(why + ' ' + desc(frame) + ' ' + g);
  }
  /* the badge sits 12px in from the picture's own bottom-right corner, wherever the picture lies in its frame; inside a signal window
     (the leaning shape of signal.css) it sits where the window's straight right edge meets its lower curve (55% across, 79% down) */
  function nbPos(f) {
    var right, bottom;
    if (f.__nbWin) {
      var wn = f.__nbWin, fb = f.getBoundingClientRect(), wb = wn.getBoundingClientRect(), own = wn.offsetParent === f;
      /* Tony, 21 Oct: "a small arrow in the right bottom corner of each signal": 28px, tucked 5px into the corner */
      right = (own ? f.offsetWidth - wn.offsetLeft - wn.offsetWidth : fb.right - wb.right) + .4494 * (own ? wn.offsetWidth : wb.width) + 5;
      bottom = (own ? f.offsetHeight - wn.offsetTop - wn.offsetHeight : fb.bottom - wb.bottom) + .2078 * (own ? wn.offsetHeight : wb.height) + 5;
      f.style.setProperty('--nb-s', '28px');
    } else {
      var fr = f.getBoundingClientRect(), u = null; if (!fr.width) return;
      (f.__nbm || []).forEach(function (m) { var r = shownRect(m); if (!r.width || !r.height) return;
        u = u ? { r: Math.max(u.r, r.right), b: Math.max(u.b, r.bottom) } : { r: r.right, b: r.bottom }; });
      if (!u) return;
      var cs = getComputedStyle(f);
      right = Math.max(0, fr.right - (parseFloat(cs.borderRightWidth) || 0) - Math.min(u.r, fr.right)) + 12;
      bottom = Math.max(0, fr.bottom - (parseFloat(cs.borderBottomWidth) || 0) - Math.min(u.b, fr.bottom)) + 12;
    }
    f.style.setProperty('--nb-r', Math.round(right) + 'px'); f.style.setProperty('--nb-b', Math.round(bottom) + 'px');
  }
  /* the picture as seen: an object-fit: contain picture is letterboxed inside its box, so its corner is not the box's */
  function shownRect(m) {
    var r = m.getBoundingClientRect(), cs = getComputedStyle(m), fit = cs.objectFit;
    var nw = m.naturalWidth || m.videoWidth, nh = m.naturalHeight || m.videoHeight;
    if (!/contain|scale-down/.test(fit) || !nw || !nh || !r.width || !r.height) return r;
    var s = Math.min(r.width / nw, r.height / nh); if (fit === 'scale-down') s = Math.min(s, 1);
    var w = nw * s, h = nh * s, pos = (cs.objectPosition || '50% 50%').split(' ');
    function off(v, free) { return /%$/.test(v) ? free * parseFloat(v) / 100 : /px$/.test(v) ? parseFloat(v) : free / 2; }
    var x = r.left + off(pos[0], r.width - w), y = r.top + off(pos[1] || '50%', r.height - h);
    return { left: x, top: y, right: x + w, bottom: y + h, width: w, height: h };
  }
  function watchMedia(f) { (f.__nbm || []).forEach(function (m) { if (m.__nbw) return; m.__nbw = 1; m.addEventListener(m.tagName === 'VIDEO' ? 'loadedmetadata' : 'load', function () { nbPos(f); }); }); }
  var nbt = 0; W.addEventListener('resize', function () { clearTimeout(nbt); nbt = setTimeout(function () { badged.forEach(nbPos); }, 200); });
  W.addEventListener('load', function () { badged.forEach(nbPos); });
  function pictureLink(w) {
    if (w.__pl) return; w.__pl = 1;
    if (w.closest('.hdr, .site-menu, noscript')) return;
    var m = $(MEDIA, w); if (!m) return;
    if ($(PLAY, w)) { rep.badgeSkipped.push(desc(w) + ' (own play icon: ' + desc($(PLAY, w)) + ')'); return; }
    /* a picture that opens itself, larger or whole (a zoom button, a link to the image file): the fourth sign, + (approved 21 Oct) */
    if (w.hasAttribute('data-zoom') || /\.(webp|jpe?g|png|avif|gif)([?#]|$)/i.test(w.getAttribute('href') || '')) {
      rep.zoomBadges = (rep.zoomBadges || 0) + 1; badge(frameOf(w, m), GLYPH.zoom, 'zoom ' + w.tagName.toLowerCase(), $$('img, video', w)); return; }
    if (w.tagName === 'BUTTON' && !isFilm(w)) { rep.badgeSkipped.push(desc(w) + ' (a button that is neither a film nor a zoom: no sign)'); return; }
    if (w.tagName === 'A') arrows(w, null, true);   /* its title keeps the convention too (a wrong ↗ turns to →); the badge carries the sign */
    badge(frameOf(w, m), glyphFor(w), w.tagName.toLowerCase(), $$('img, video', w));
  }
  /* a figure whose caption holds the link (the Work page's first sheet, the built pairs, the identities): the picture opens that link too */
  function figureLink(f) {
    if (f.__fl) return; f.__fl = 1;
    if (f.closest('a, button, .hdr, .site-menu')) return;
    var link = $$('a[href]', f).filter(function (a) { return !$(MEDIA, a) && !/^(#|mailto:|tel:)/.test(a.getAttribute('href')); })[0];
    var loose = $$('img, video', f).filter(function (m) { return !m.closest('a, button'); });
    if (!link || !loose.length) return;
    var frames = loose.map(function (m) { return frameOf(f, m); });
    frames.forEach(function (fr) {
      fr.classList.add('nb-click');
      fr.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey) W.open(link.href, '_blank', 'noopener'); else link.click();
      });
    });
    rep.figureLinks++;
    badge(frames[frames.length - 1], glyphFor(link), 'figure\u2192' + (link.className || 'a'), loose.filter(function (m) { return frames[frames.length - 1].contains(m); }));
  }
  /* Home, the stage: the head window opens its project (brand.js), so it wears the page badge; a waiting window only takes the stage */
  function stage() {
    $$('.stg .stg-w').forEach(function (w) { if (w.__st) return; w.__st = 1; w.classList.add('nb-click', 'stg-badge'); badge(w, GLYPH.page, 'stage', $$('.sgw-in img', w)); });
  }
  /* non-links: an arrow in a heading or caption that opens nothing */
  var SKIP_TXT = 'a[href], button, summary, [role="button"], [role="link"], label, select, option, script, style, noscript, template, svg, .hdr, .site-menu, .scroll-cue';
  function plainArrows(root) {
    textNodes(root).forEach(function (n) {
      if (n.__pa || !/[→↗]/.test(n.nodeValue)) return;
      var p = n.parentElement; if (!p || p.closest(SKIP_TXT)) return;
      var blk = p.closest('h1, h2, h3, h4, h5, h6, p, figcaption, li, dt, dd, caption, legend') || p;
      if (blk.querySelector('a[href], button')) return;
      n.__pa = 1;
      if (n.nodeValue.trim() === 'Designed → built') { n.nodeValue = n.nodeValue.replace('Designed → built', 'Designed, then built'); rep.plainFixed.push(desc(blk) + ': Designed → built'); }
      else rep.plainLeft.push(desc(blk) + ': "' + n.nodeValue.trim().slice(0, 60) + '"');
    });
  }
  /* expanders keep their look, with no arrow: "See 12 more stands →" opens in place, it goes nowhere */
  function expanderArrows(root) {
    $$('summary, button', root).forEach(function (b) {
      if (b.__ea || b.closest('.hdr, .site-menu') || b.hasAttribute('data-film')) return; b.__ea = 1;
      textNodes(b).forEach(function (n) {
        if (!/[→↗]/.test(n.nodeValue)) return;
        var was = n.nodeValue; n.nodeValue = was.replace(/[\s ]*[→↗]/g, '');
        var p = n.parentElement; if (p !== b && !p.textContent.trim() && !p.children.length) p.remove();
        b.classList.add('nl-exp');
        rep.expanderArrows.push(desc(b) + ': "' + b.textContent.trim().slice(0, 40) + '" (was "' + was.trim().slice(0, 40) + '")');
      });
    });
  }
  function signal() {
    var main = $('main') || D.body;
    $$(SCOPE).forEach(function (a) { if (!$(MEDIA, a)) textLink(a); });
    $$('a[href], button').forEach(function (w) { if ($(MEDIA, w)) pictureLink(w); });
    $$('figure').forEach(figureLink);
    stage();
    plainArrows(main); expanderArrows(main);
  }

  /* ---------------------------------------------------------------- 3 · THE SCROLL CUE */
  var cue = null, cueOp = null;
  function openerOf() {
    var b = D.body;
    if ($('#entrance')) return $('#entrance');
    if ($('main .abh')) return $('main .abh');
    if ($('main section.pj-head')) return $('main section.pj-head');
    if (b.classList.contains('fp') || b.classList.contains('proj')) return $$('main > section')[0] || $('main section');   /* the page's first screen: .fp-hero, or the editorial opener that comes first (Big Grill, Capacity, Al Forsan) */
    return null;
  }
  function nextBlock(op) {
    for (var n = op; n && n !== D.body; n = n.parentElement)
      for (var s = n.nextElementSibling; s; s = s.nextElementSibling) {
        if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|LINK)$/.test(s.tagName) || s === cue || !s.getClientRects().length) continue;
        return s;
      }
    return null;
  }
  function makeCue() {
    var op = openerOf(); if (!op) { rep.cue = 'none: no first screen of the kind on this page'; return; }
    if ($$('a[href^="#"]', op).some(function (a) { return a.textContent.indexOf('↓') >= 0; })) { rep.cue = 'none: the opener has its own "… ↓" line (' + desc(op) + ')'; return; }
    var isCase = !/^(entrance|hello)$/.test(op.id) && !op.classList.contains('pj-head');
    if (isCase && op.getBoundingClientRect().bottom + W.scrollY < W.innerHeight * .75) { rep.cue = 'none: ' + desc(op) + ' ends above 75% of the screen'; return; }
    var nx = nextBlock(op), id = nx && nx.id;
    if (nx && !id) {
      var secs = $$('main section'), k = secs.indexOf(nx) + 1 || $$('main > *').indexOf(nx) + 1 || 2; id = 's-' + k;
      while (D.getElementById(id)) id += 'b';
      nx.id = id;
    }
    cue = el('a', 'scroll-cue'); cue.setAttribute('href', '#' + (id || 'main'));
    var i = el('i', 'sg1'); i.setAttribute('aria-hidden', 'true');
    var ar = el('span', null, '↓'); ar.setAttribute('aria-hidden', 'true');
    cue.appendChild(i); cue.appendChild(D.createTextNode('Scroll ')); cue.appendChild(ar);
    op.appendChild(cue); cueOp = op;
    /* fixed to the screen; a transformed ancestor would carry it away, so then it lives on <body> */
    var r = cue.getBoundingClientRect(), want = W.innerHeight - (parseFloat(getComputedStyle(cue).bottom) || 24);
    if (Math.abs(want - r.bottom) > 3) { D.body.appendChild(cue); rep.cue = 'moved to body; '; }
    var g = groundOf(op); if (g.light) { var c = rgba(g.ink); if (c) cue.style.setProperty('--cue-ink', 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',.72)'); }
    rep.cue += desc(op) + ' -> #' + (id || 'main');
    place(); cueScroll();
    W.addEventListener('load', function () { setTimeout(place, 1200); });
    var rt = 0; W.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(place, 200); });
  }
  /* where the cue stands: bottom-left, 24px up (the design); never on the page's own words, controls or rule lines. If that spot is taken
     (a case page's caption sits there), the first clear one of: bottom-right · centred in the widest clear stretch of the bottom line ·
     a little lower at the left (to clear a rule line) · a little higher at the left on clear ground · none (said in __navReport.place) */
  function obstacles(bgOK) {
    var vh = W.innerHeight, vw = R.clientWidth, big = vw * vh * .5, out = [];
    function add(x0, y0, x1, y1) { if (y1 > vh * .5 && y0 < vh && x1 > 0 && x0 < vw && x1 > x0 && y1 > y0) out.push([x0, y0, x1, y1]); }
    function shown(e, x, y) {                /* not cut away by a parent that clips (a closed panel, a carousel's hidden slides) */
      for (var n = e.parentElement; n && n !== D.body; n = n.parentElement) {
        var c = getComputedStyle(n); if (c.display === 'none' || c.visibility === 'hidden') return false;
        if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { var q = n.getBoundingClientRect(); if (x < q.left || x > q.right || y < q.top || y > q.bottom) return false; }
      }
      return true;
    }
    $$('body *').forEach(function (e) {
      if (e === cue || e.closest('.site-menu, .scroll-cue, script, style, noscript, template, head')) return;
      var r = e.getBoundingClientRect(); if (!r.width || !r.height || r.bottom < vh * .5 || r.top > vh) return;
      var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return;
      if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(e.tagName)) { if (!bgOK || r.width * r.height < big) if (shown(e, (r.left + r.right) / 2, (Math.max(r.top, 0) + Math.min(r.bottom, vh)) / 2)) add(r.left, r.top, r.right, r.bottom); return; }
      [].forEach.call(e.childNodes, function (n) {
        if (n.nodeType !== 3 || !n.nodeValue.trim()) return;
        var rg = D.createRange(); rg.selectNodeContents(n);
        [].forEach.call(rg.getClientRects(), function (b) { if (b.width && shown(e, (b.left + b.right) / 2, (b.top + b.bottom) / 2)) add(b.left, b.top, b.right, b.bottom); });
      });
      ['Top', 'Bottom', 'Left', 'Right'].forEach(function (s) {
        var w = parseFloat(cs['border' + s + 'Width']), c = rgba(cs['border' + s + 'Color']);
        if (!(w >= 1) || cs['border' + s + 'Style'] === 'none' || !c || c.a < .1) return;
        if (s === 'Top') add(r.left, r.top, r.right, r.top + w); else if (s === 'Bottom') add(r.left, r.bottom - w, r.right, r.bottom);
        else if (s === 'Left') add(r.left, r.top, r.left + w, r.bottom); else add(r.right - w, r.top, r.right, r.bottom);
      });
    });
    return out;
  }
  function place() {
    if (!cue) return;
    if ((W.scrollY || R.scrollTop) > W.innerHeight * .1) return;       /* measured on the first screen only */
    cue.__noRoom = false; cue.hidden = false;
    var vh = W.innerHeight, vw = R.clientWidth;
    cue.style.left = cue.style.right = cue.style.bottom = '';
    var cs = getComputedStyle(cue), x0 = parseFloat(cs.left) || 16, b0 = parseFloat(cs.bottom) || 24;
    var cr = cue.getBoundingClientRect(), w = cr.width, h = cr.height, PAD = 6;
    cue.style.visibility = 'hidden';
    var hard = obstacles(true), soft = null;
    cue.style.visibility = '';
    function clear(list, x, b) { var y1 = vh - b, y0 = y1 - h; return !list.some(function (o) { return o[0] < x + w + PAD && o[2] > x - PAD && o[1] < y1 + PAD && o[3] > y0 - PAD; }); }
    function put(name, x, b) { cue.style.left = x + 'px'; cue.style.bottom = b + 'px'; rep.place = name + ' (' + Math.round(x) + ', ' + b + 'px up)'; return true; }
    if (clear(hard, x0, b0)) { rep.place = 'bottom-left (design)'; return; }
    if (clear(hard, vw - x0 - w, b0)) return put('bottom-right', vw - x0 - w, b0);
    /* the widest clear stretch of the bottom line */
    var y1 = vh - b0, y0 = y1 - h, xs = hard.filter(function (o) { return o[1] < y1 + PAD && o[3] > y0 - PAD; }).map(function (o) { return [o[0] - 32, o[2] + 32]; })
      .concat([[-1e4, x0], [vw - x0, 1e4]]).sort(function (a, c) { return a[0] - c[0]; });
    var best = null, end = -1e4;
    xs.forEach(function (s) { if (s[0] > end && (!best || s[0] - end > best[1] - best[0])) best = [end, s[0]]; end = Math.max(end, s[1]); });
    if (best && best[1] - best[0] >= w) return put('centred in the clear stretch of the bottom line', Math.round((best[0] + best[1] - w) / 2), b0);
    for (var b = b0 - 2; b >= 4; b -= 2) if (clear(hard, x0, b)) return put("bottom-left, lower", x0, b);
    cue.style.visibility = 'hidden'; soft = obstacles(false); cue.style.visibility = '';
    for (b = b0 + 4; b <= vh * .25; b += 4) if (clear(soft, x0, b)) return put('bottom-left, raised onto clear ground', x0, b);
    cue.hidden = true; cue.__noRoom = true; rep.place = 'none: no clear spot at the bottom of this screen';
  }
  function cueScroll() { if (!cue || cue.__noRoom) return; var hide = (W.scrollY || R.scrollTop) > W.innerHeight * .1; if (cue.hidden !== hide) cue.hidden = hide; }
  W.addEventListener('scroll', cueScroll, { passive: true });
  W.addEventListener('resize', cueScroll);

  /* ---------------------------------------------------------------- run: now (deferred, so the page is parsed), again at load,
     and when a page script adds pictures or links later (each step marks what it has done, so a second pass changes nothing) */
  function run() { try { signal(); } catch (e) { if (W.console) console.warn('nav.js', e); } }
  run(); makeCue();
  W.addEventListener('load', run);
  if ('MutationObserver' in W) {
    var t = 0, mo = new MutationObserver(function (list) {
      if (!list.some(function (m) { return [].some.call(m.addedNodes, function (n) { return n.nodeType === 1 && !n.closest('.site-menu') && n !== cue && !(n.classList && (n.classList.contains('nl-ar') || n.classList.contains('nav-badge'))); }); })) return;
      clearTimeout(t); t = setTimeout(run, 150);
    });
    mo.observe(D.body, { childList: true, subtree: true });
  }
})();
