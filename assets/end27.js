/* end27.js (27 Oct 2026, package P8): the end of every project page. One band, two equal halves:
   left   Next project · the project's name · its one line · Open the project →
   right  Say hello · antoni@antbrush.com · For the idea. And everything after. · Contact →
   The chain, the names and the lines live in the table below and nowhere else: the band never reads them from the page, so a page that
   changes cannot change its neighbour's card. It stands where the page's own next block stood (a.fp-next, or nav.pnext on MAF) and
   only then does the page's class end27-on hide that block (end27.css); its HTML stays. Hard edges, no motion. Without script nothing
   here runs and the old next link works as it did. Design: website-review/astra-27oct/FABLE-REVIEW.md 2c. */
(function () {
  'use strict';
  var D = document, R = D.documentElement;
  if (D.querySelector('.end27')) return;

  /* the chain, for contrast, closed on itself: slug, the page's own name, the one line (the text the site's next blocks already carry) */
  var T = [
    ['zeiss', 'ZEISS', 'A lens, the brackets and an eye: one picture.'],
    ['liwa', 'Liwa', 'Built from nothing.'],
    ['dha', 'Dubai Health Authority', 'A star with one corner open. The name completes it.'],
    ['cityscape', 'Cityscape Abu Dhabi', 'From floor plan to full scale.'],
    ['mazzika', 'Why Not! Mazzika', 'Make room for six acts.'],
    ['wfes', 'World Future Energy Summit', 'The capital’s pavilion, five times.'],
    ['pyramids-2021', 'MAF Global Solutions', 'GS is One: the number one, written in words.'],
    ['capacity', 'Capacity Middle East', 'A city in one line.'],
    ['aiaasc', 'AIAASC', 'Make standards clear.'],
    ['big-grill', 'The Big Grill', 'A festival starts with a drawing.'],
    ['building-codes', 'Abu Dhabi International Building Codes', 'Eight codes, one building.'],
    ['anti-bullying', 'National Bullying Prevention Week', 'Give growth a language.'],
    ['al-forsan', 'Al Forsan International Sports Resort', 'Five sporting worlds. One shared identity.'],
    ['akshaya', 'Akshaya × Vikas Khanna', 'A book, and its digital twin.'],
    ['al-ain', 'Innovation Month', 'A map of squares became a gate.'],
    ['live-shows', 'Live shows', 'Five nights, one city.'],
    ['amr-diab', 'Amr Diab Live in Dubai', 'One look, one night.'],
    ['lilly-singh', 'Lilly Singh Live in Dubai', 'Her colours, a full room.'],
    ['mounir', 'Mohamed Mounir Live in Dubai', 'One key visual, rebuilt for every place.'],
    ['hakawi', 'Hakawi Sharqia', 'A Ramadan tent, built from nothing.'],
    ['angham', 'Angham Live in Dubai', 'Black and champagne, for a seated hall.'],
    ['children-of-light-academy', 'Children of Light Academy', 'A small school, given its light.'],
    ['magida-el-roumi', 'Magida El Roumi Live in Dubai', 'Three rounds of an arch, an evening of light.'],
    ['spaces', 'Exhibitions', 'Twenty-two shows, built.']
  ];
  var ALIAS = { zeiss7: 'zeiss', liwa2: 'liwa', bullying: 'anti-bullying', alain: 'al-ain', alforsan: 'al-forsan', biggrill: 'big-grill' };

  function el(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  try {
    var seg = location.pathname.split('/').filter(Boolean);
    if (seg[seg.length - 1] === 'index.html') seg.pop();
    var slug = ALIAS[seg[seg.length - 1]] || seg[seg.length - 1], n = -1, i;
    for (i = 0; i < T.length; i++) if (T[i][0] === slug) n = i;
    if (n < 0) return;                                           /* not one of the 24 project pages: nothing to do */
    var nx = T[(n + 1) % T.length];

    /* links are made from this script's own address (.../assets/end27.js), so they hold under any prefix */
    var me = D.currentScript, root = '/';
    try { if (me && me.src) root = new URL('../', me.src).pathname; } catch (e) { }
    var nextHref = root + 'work/' + nx[0] + '/', contactHref = root + 'contact/';

    /* where the page's own next block stands */
    var old = D.querySelector('a.fp-next') || D.querySelector('nav.pnext'), solo = !(old && old.closest('.fp-end'));
    var foot = D.querySelector('footer.foot') || D.querySelector('footer');

    var band = el('div', 'end27' + (solo ? ' end27--solo' : ''));
    band.setAttribute('role', 'group'); band.setAttribute('aria-label', 'Next project and contact');
    var inn = el('div', 'end27-in');

    var left = el('a', 'end27-h end27-next'); left.href = nextHref;
    left.appendChild(el('span', 'end27-k', 'Next project'));
    left.appendChild(el('span', 'end27-nm', nx[1]));
    left.appendChild(el('span', 'end27-ln', nx[2]));
    left.appendChild(el('span', 'end27-cta end27-go', 'Open the project →'));

    var right = el('div', 'end27-h end27-hello');
    right.appendChild(el('span', 'end27-k', 'Say hello'));
    var mail = el('a', 'end27-nm end27-mail', 'antoni@antbrush.com'); mail.href = 'mailto:antoni@antbrush.com';
    right.appendChild(mail);
    right.appendChild(el('span', 'end27-ln', 'For the idea. And everything after.'));
    var contact = el('a', 'end27-cta', 'Contact →'); contact.href = contactHref;
    right.appendChild(contact);

    inn.appendChild(left); inn.appendChild(right); band.appendChild(inn);

    if (old) {
      if (solo) { var bg = old.style && old.style.getPropertyValue('--nbg'); if (bg) band.style.setProperty('--e27-bg', bg.trim()); }
      old.parentNode.insertBefore(band, old.nextSibling);
    } else if (foot && foot.parentNode) { band.className += ' end27--solo'; foot.parentNode.insertBefore(band, foot); }
    else { band.className += ' end27--solo'; (D.querySelector('main') || D.body).appendChild(band); }

    R.classList.add('end27-on');                                 /* only now does the page's own block step back */
  } catch (e) { if (window.console) console.warn('end27', e); }
})();
