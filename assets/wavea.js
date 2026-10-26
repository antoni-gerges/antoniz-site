(function () {
'use strict';
var D = document, H = D.documentElement, W = window;
function $(s, r) { return (r || D).querySelector(s); }
function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
function txt(el) { return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
var idle = 0, raf = false;
var TEXT = 'h1,h2,h3,h4,h5,p,figcaption,a,li,dt,dd,blockquote,summary,button,label,small,strong';
var cand = null, candAt = 0;
function candidates() {
var now = Date.now(); if (!cand || now - candAt > 2000) { cand = $$(TEXT, D.body).filter(function (e) { return !e.closest('.where,.hdr,header,.site-menu'); }); candAt = now; }
return cand;
}
function over(chip) {
if (!chip || !chip.classList.contains('on')) return false;
var r = chip.getBoundingClientRect(); if (!r.width || !r.height) return false;
var fe = $('.fp-end, .ls-end, body > footer');
if (fe && fe.getBoundingClientRect().top < W.innerHeight - 8) return true;
var c = candidates();
for (var n = 0; n < c.length; n++) {
var e = c[n], b = e.getBoundingClientRect();
if (b.width < 3 || b.height < 3 || b.right < r.left - 4 || b.left > r.right + 4 || b.bottom < r.top - 4 || b.top > r.bottom + 4) continue;
var s = getComputedStyle(e); if (s.visibility === 'hidden' || +s.opacity === 0) continue;
var hid = false; for (var a = e.parentElement; a && a !== D.body; a = a.parentElement) { var sa = getComputedStyle(a); if (+sa.opacity === 0 || sa.visibility === 'hidden') { hid = true; break; } }
if (hid) continue;
var rg = D.createRange(); rg.selectNodeContents(e); var q = rg.getClientRects();
for (var m = 0; m < q.length; m++) if (q[m].width > 1 && q[m].right > r.left - 4 && q[m].left < r.right + 4 && q[m].bottom > r.top - 4 && q[m].top < r.bottom + 4 && txt(e)) return true;
}
return false;
}
function state() {
raf = false;
H.classList.toggle('wa-first', (W.scrollY || W.pageYOffset || 0) < W.innerHeight * .85);
$$('.where').forEach(function (c) { c.classList.remove('wa-over'); if (H.classList.contains('wa-scrolling') && over(c)) c.classList.add('wa-over'); });
}
W.addEventListener('scroll', function () {
H.classList.add('wa-scrolling'); clearTimeout(idle);
idle = setTimeout(function () { H.classList.remove('wa-scrolling'); }, 1200);
if (!raf) { raf = true; requestAnimationFrame(loop); }
}, { passive: true });
function loop() { state(); if (H.classList.contains('wa-scrolling')) { raf = true; requestAnimationFrame(loop); } }
W.addEventListener('resize', function () { if (!raf) { raf = true; requestAnimationFrame(state); } });
H.classList.add('wa-first');
function slug() { var p = location.pathname.split('/').filter(Boolean); if (p[p.length - 1] === 'index.html') p.pop(); return p; }
function isProject() { var p = slug(); return p.length >= 2 && p[p.length - 2] === 'work' && p[p.length - 1] !== 'archive'; }
function stopsOf() {
var main = $('main'); if (!main) return [];
var idx = $('#case-chapters');
if (idx && !idx.classList.contains('wa-idx')) {
return $$('ol a[href^="#"]', idx).map(function (a) {
var el = D.getElementById(a.getAttribute('href').slice(1)), n = a.cloneNode(true), s = n.querySelector('span'); if (s) s.remove();
return el ? { el: el, name: txt(n) } : null; }).filter(Boolean);
}
var ds = $$('[data-stop]', main);
if (ds.length > 1) return ds.map(function (el) { return { el: el, name: el.getAttribute('data-stop') }; });
var secs = $$(':scope > section', main).filter(function (s, i) {
return i > 0 && !s.matches('.fp-end,.op21,.fp-hero') && s.querySelector('h2'); });
return secs.map(function (s, i) { if (!s.id) s.id = 'project-chapter-' + (i + 1); return { el: s, name: txt(s.querySelector('h2')) }; })
.filter(function (x) { return x.name; });
}
function buildIndex(stops) {
if ($('#case-chapters') || stops.length < 2) { var ph0 = $('nav[data-wa-ph]'); if (ph0 && stops.length < 2) ph0.remove(); return; }
var main = $('main'); if (!main) return;
var h1 = $('h1'), title = (h1 && !h1.classList.contains('sr-only') && txt(h1)) || (D.title || '').split(' · ')[0] || 'This project';
var nav = D.createElement('nav'); nav.className = 'case-index wa-idx'; nav.id = 'case-chapters'; nav.setAttribute('aria-label', 'Project chapters');
var top = D.createElement('div'); top.className = 'case-index-heading';
var lab = D.createElement('span'); lab.textContent = 'Explore the project';
var nm = D.createElement('strong'); nm.textContent = title; top.append(lab, nm);
var det = D.createElement('details'); det.open = W.innerWidth > 760;
var sum = D.createElement('summary'); sum.textContent = 'Chapters · ' + stops.length;
var ol = D.createElement('ol');
stops.forEach(function (s, i) {
if (!s.el.id) s.el.id = 'project-chapter-' + (i + 1);
var li = D.createElement('li'), a = D.createElement('a'), num = D.createElement('span');
num.textContent = String(i + 1).padStart(2, '0'); num.setAttribute('aria-hidden', 'true');
a.href = '#' + s.el.id; a.append(num, D.createTextNode(s.name));
a.addEventListener('click', function () { s.el.tabIndex = -1; requestAnimationFrame(function () { s.el.focus({ preventScroll: true }); }); });
li.append(a); ol.append(li);
});
det.append(sum, ol); nav.append(top, det);
var ph = $('nav[data-wa-ph]', main), first = $(':scope > section, :scope > div.op21, :scope > header', main) || main.firstElementChild;
if (ph) ph.replaceWith(nav); else if (first && first.parentNode === main) first.after(nav); else main.prepend(nav);
var hn = $('.hdr .nav');
if (hn && !$('a[href="#case-chapters"]', hn)) {
var a = D.createElement('a'); a.href = '#case-chapters'; a.textContent = 'Chapters';
a.addEventListener('click', function () { if ($('.hdr.open')) { var b = $('.menu-btn'); if (b) b.click(); } });
hn.append(a);
}
var mq = W.matchMedia('(min-width:761px)'); if (mq.addEventListener) mq.addEventListener('change', function () { det.open = mq.matches; });
}
function buildChip(stops) {
if ($('body > .where') || stops.length < 2) return;
var chip = D.createElement('div'); chip.className = 'where wa-chip'; chip.setAttribute('role', 'status'); chip.setAttribute('aria-live', 'off');
chip.innerHTML = '<span class="tk" aria-hidden="true"><i></i><i></i><i></i></span><b></b><span class="of"></span><a href="#"></a>';
D.body.appendChild(chip); D.body.classList.add('has-where');
var cb = $('b', chip), co = $('.of', chip), ca = $('a', chip), cur = -2, n = stops.length;
ca.addEventListener('click', function (e) { e.preventDefault(); var nx = stops[cur + 1];
if (nx) nx.el.scrollIntoView({ behavior: W.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });
var foot = $('body > footer');
function upd() {
var mid = W.innerHeight * .5, k = -1;
stops.forEach(function (s, i) { var top = s.el.getBoundingClientRect().top, nx = stops[i + 1];
var bot = nx ? nx.el.getBoundingClientRect().top : s.el.getBoundingClientRect().bottom; if (top <= mid && bot > mid) k = i; });
chip.classList.toggle('end', !!foot && foot.getBoundingClientRect().top < W.innerHeight - 6);
if (k === cur) return; cur = k;
if (k < 0) { chip.classList.remove('on'); return; }
var s = stops[k], nx = stops[k + 1];
cb.textContent = s.name; co.textContent = (k + 1) + ' of ' + n;
if (nx) { ca.textContent = 'Next: ' + nx.name + ' ↓'; ca.hidden = false; ca.setAttribute('aria-label', 'Go to the next one: ' + nx.name); } else ca.hidden = true;
chip.classList.add('on');
}
var tk = false;
W.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(function () { tk = false; upd(); }); } }, { passive: true });
W.addEventListener('resize', upd); upd();
}
var RING = [["zeiss", "ZEISS", "A lens, the brackets and an eye: one picture."], ["liwa", "Liwa", "Built from nothing."], ["dha", "Dubai Health Authority", "A star with one corner open. The name completes it."], ["anti-bullying", "National Bullying Prevention Week", "Give growth a language."], ["aiaasc", "AIAASC", "Make standards clear."], ["building-codes", "Abu Dhabi International Building Codes", "Eight codes, one building."], ["children-of-light-academy", "Children of Light Academy", "A small school, given its light."], ["al-forsan", "Al Forsan", "Five sporting worlds. One shared identity."], ["capacity", "Capacity Middle East", "A city in one line."], ["pyramids-2021", "MAF", "GS is One: the number one, written in words."], ["big-grill", "The Big Grill", "A festival starts with a drawing."], ["akshaya", "Akshaya × Vikas Khanna", "A book, and its digital twin."], ["al-ain", "Innovation Month", "A map of squares became a gate."], ["cityscape", "Cityscape Abu Dhabi", "From floor plan to full scale."], ["wfes", "World Future Energy Summit", "The capital’s pavilion, five times."], ["spaces", "Exhibitions", "Twenty-two shows, built."], ["mazzika", "Why Not! Mazzika", "Make room for six acts."], ["live-shows", "Live shows", "Five nights, one city."], ["mounir", "Mohamed Mounir Live in Dubai", "One key visual, rebuilt for every place."], ["amr-diab", "Amr Diab Live in Dubai", "One look, one night."], ["angham", "Angham Live in Dubai", "Black and champagne, for a seated hall."], ["magida-el-roumi", "Magida El Roumi Live in Dubai", "Three rounds of an arch, an evening of light."], ["lilly-singh", "Lilly Singh Live in Dubai", "Her colours, a full room."], ["hakawi", "Hakawi Sharqia", "A Ramadan tent, built from nothing."]];
function ring() {
if (W.FP || !RING.length) return;
var p = slug(), s = p[p.length - 1], n = -1;
for (var i = 0; i < RING.length; i++) if (RING[i][0] === s) n = i;
if (n < 0) return;
var d = RING[(n + 1) % RING.length];
$$('a.fp-next').forEach(function (a) {
var b = $('.nx-b', a) || $('b', a), l = $('.nx-l', a);
if (b && txt(b) === d[1] && /\/([a-z0-9-]+)\/?$/.exec(a.getAttribute('href') || '') && RegExp.$1 === d[0]) return;
a.setAttribute('href', '../' + d[0] + '/'); if (b) b.textContent = d[1]; if (l) l.textContent = d[2];
});
$$('nav.pnext > a').forEach(function (a) {
if ((a.getAttribute('href') || '').indexOf('/' + d[0] + '/') >= 0) return;
a.setAttribute('href', '../' + d[0] + '/'); var h = $('h2', a), nm = $('div > p:not(.label)', a); if (h) h.textContent = d[2]; if (nm) nm.textContent = d[1];
});
}
var RMQ = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
function back(all) {
$$('img[data-wa-src]').forEach(function (i) {
if (!all) { var r = i.getBoundingClientRect(); if (r.top > W.innerHeight * 1.1) return; }
var s = i.getAttribute('data-wa-srcset'); if (s) { i.setAttribute('srcset', s); i.removeAttribute('data-wa-srcset'); }
i.src = i.getAttribute('data-wa-src'); i.removeAttribute('data-wa-src');
});
if (!all) return;
$$('video[data-wa-defer]').forEach(function (v) {
var ss = $$('source[data-wa-src]', v); if (!ss.length) return;
ss.forEach(function (s) { s.src = s.getAttribute('data-wa-src'); s.removeAttribute('data-wa-src'); });
v.removeAttribute('data-wa-defer'); v.preload = 'metadata'; v.load();
var r = v.getBoundingClientRect(); if (!RMQ && r.bottom > 0 && r.top < W.innerHeight) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
});
}
try {
if (!(W.matchMedia && W.matchMedia('(max-width:760px)').matches) || D.readyState === 'complete') back(true);
else {
back(false);
var once = function () { W.removeEventListener('load', once); W.removeEventListener('scroll', sc); back(true); };
var sc = function () { if ((W.scrollY || 0) > 0) once(); };
W.addEventListener('load', once); W.addEventListener('scroll', sc, { passive: true });
}
} catch (e) { $$('img[data-wa-src]').forEach(function (i) { i.src = i.getAttribute('data-wa-src'); }); }
function chapters() {
try { if (isProject()) ring(); } catch (e) {  }
try {
if (D.body.classList.contains('has-where') || $('body > .where')) D.body.classList.add('has-where');
if (!isProject()) return;
var stops = stopsOf();
buildIndex(stops);
buildChip(stops);
} catch (e) {  }
state();
}
if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { setTimeout(chapters, 0); });
else setTimeout(chapters, 0);
})();
