/* Film tiles: muted inline preview, full film with sound in a full-window player. */
(function () {
  var triggers = document.querySelectorAll('[data-film]');
  if (!triggers.length) return;
  var small = window.innerWidth < 900 || (navigator.connection && navigator.connection.saveData);
  var box = document.createElement('div');
  box.className = 'fplayer'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<button class="x" type="button">Close</button><video controls playsinline preload="none"></video>';
  document.body.appendChild(box);
  var v = box.querySelector('video'), x = box.querySelector('.x'), opener = null;
  function open(t, ev) {
    if (ev) ev.preventDefault();
    opener = t;
    v.src = (small && t.getAttribute('data-film-sm')) || t.getAttribute('data-film');
    box.setAttribute('aria-label', t.getAttribute('data-film-title') || 'Film');
    box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    document.querySelectorAll('video[data-clip]').forEach(function (c) { c.pause(); });
    v.muted = false; var p = v.play(); if (p && p.catch) p.catch(function () {});
    x.focus();
  }
  function close() {
    v.pause(); v.removeAttribute('src'); v.load();
    box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock');
    if (opener) opener.focus();
  }
  triggers.forEach(function (t) { t.addEventListener('click', function (e) { open(t, e); }); });
  x.addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  v.addEventListener('ended', close);
  document.addEventListener('keydown', function (e) { if (box.classList.contains('open') && e.key === 'Escape') close(); });
})();
