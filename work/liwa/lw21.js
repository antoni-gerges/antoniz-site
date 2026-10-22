/* Liwa page (liwa21, 21 Oct 2026): the go-ahead, K1 the race card, K2 the moving map (3D), K3 the ride, K4 sixteen nights.
   Every move is a function of scroll, on fp.js's own loop (FP.on); things arrive and leave on a hard edge (a line, the dune's outline, the
   frame), nothing fades. Reduced motion: each stage shows its final state. K2 is built with the site's 3D engine (assets/fp/fp3d.js),
   fetched when its section comes within one and a half screens; it uses its own section (.lw-model), never .fp-model, which the road-in
   chapter's l2.js takes. Runs after l2.js (document order of deferred scripts). */
(function () {
  'use strict';
  var D = document, W = window, FP = W.FP; if (!FP) return;
  var clamp = FP.clamp, seg = FP.seg, ease = FP.ease, RM = FP.rm;
  var $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || D).querySelectorAll(s)); };
  function at(el, H) { var r = el.getBoundingClientRect(); return { p: clamp(-r.top / Math.max(1, r.height - H), 0, 1), on: r.top < H * 1.15 && r.bottom > -H * .15 }; }
  function ask() { if (FP.ask) FP.ask(); }

  /* ---- 2 · the go-ahead: the dates drop onto the start line; 42 days count down to opening night ---- */
  var go = $('.lw-go');
  if (go) (function () {
    go.classList.add('kin');
    var lis = $$('li', go), cnt = $('.go-c', go), last = -1;
    var TH = [.05, .19, .33, .5, .67, .84];        // where each date lands (Oct 28, Nov 12, Nov 14, Dec 7, Dec 19, Dec 26)
    var DAYS = [42, 42, 42, 19, 7, 0];             // days to opening night, from the purchase order on
    FP.on(function (H) {
      var s = at(go, H); if (!s.on) return; var p = RM ? 1 : s.p, v = 42, i, k;
      lis.forEach(function (li, n) { li.classList.toggle('on', p >= TH[n]); });
      for (i = 2; i < 5; i++) if (p >= TH[i]) { k = clamp((p - TH[i]) / (TH[i + 1] - TH[i]), 0, 1); v = Math.round(DAYS[i] + (DAYS[i + 1] - DAYS[i]) * k); }
      if (v !== last) { cnt.textContent = v; last = v; }
    });
  })();

  /* ---- 5 · K1, the race card: fourteen names climb the dune's face at its slope, in date order, like trucks on the climb; each opens its
     sport at the crest, the film rising from behind the dune (cut by the dune's outline, a hard edge); then over the crest and away ---- */
  var k1 = $('.lw-k1');
  if (k1) (function () {
    k1.classList.add('kin');
    var st = $('.fp-stick', k1), svg = $('.k1-dune', k1), back = $('.back', svg), face = $('.face', svg), sky = $('.k1-sky', k1);
    var names = $$('.k1-n', k1), N = names.length, wins = {}, cards = {}, kk = $('.k1-k', k1), G = null, playing = {};
    $$('.k1-w', k1).forEach(function (w) { wins[+w.dataset.i] = w; });
    $$('.k1-card li[data-i]', k1).forEach(function (li) { cards[+li.dataset.i] = li; });
    function q(a, c, b, t) { var u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
    function qa(a, c, b, t) { return Math.atan2(2 * (1 - t) * (c[1] - a[1]) + 2 * t * (b[1] - c[1]), 2 * (1 - t) * (c[0] - a[0]) + 2 * t * (b[0] - c[0])); }
    function xy(p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }
    function geo() {
      var Wd = st.clientWidth, H = st.clientHeight, ph = Wd <= 760, i;
      var yg = H * (ph ? .93 : .96), F = [0, yg], C = [Wd * (ph ? .86 : .66), H * (ph ? .56 : .4)], E = [Wd * (ph ? 1.35 : 1.08), H * (ph ? .68 : .64)];
      var cf = [F[0] + (C[0] - F[0]) * .58, F[1] - (F[1] - C[1]) * .34], cb = [C[0] + (E[0] - C[0]) * .3, C[1] - H * .012], pts = [[0, yg], F];
      for (i = 1; i <= 28; i++) pts.push(q(F, cf, C, i / 28));
      var nf = pts.length;
      for (i = 1; i <= 16; i++) pts.push(q(C, cb, E, i / 16));
      svg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + H);
      back.setAttribute('d', 'M0,' + H + ' L' + pts.map(xy).join(' L') + ' L' + Wd + ',' + H + ' Z');
      face.setAttribute('d', 'M' + xy([F[0], H]) + ' L' + pts.slice(1, nf).map(xy).join(' L') + ' L' + xy([C[0], H]) + ' Z');
      sky.style.clipPath = 'polygon(0px 0px,' + Wd + 'px 0px,' + pts.slice().reverse().map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ')';
      var ww = ph ? Wd * .74 : Math.min(Wd * .3, 500), wh = ww * 272 / 640;
      G = { Wd: Wd, H: H, F: F, cf: cf, C: C, cb: cb, E: E, ww: ww, wh: wh, wx: ph ? (Wd - ww) / 2 : Math.min(Wd - ww - 24, C[0] - ww * .08), wy: C[1] - wh - (ph ? 12 : 22) };
      Object.keys(wins).forEach(function (k) { wins[k].style.width = ww.toFixed(1) + 'px'; });
    }
    geo(); W.addEventListener('resize', function () { geo(); ask(); });
    FP.on(function (H) {
      var s = at(k1, H), k;
      if (!s.on) { Object.keys(playing).forEach(function (k) { FP.stop(playing[k]); }); playing = {}; return; }
      if (!G || G.Wd !== st.clientWidth || G.H !== st.clientHeight) geo();
      var P = RM ? N + .35 : -.25 + s.p * (N + .6), cur = 0;
      names.forEach(function (el, k) {
        var t = P - k, last = k === N - 1, x, y, ang, pt, v;
        if (last) t = Math.min(t, 1.35);
        var on = t > 0 && (t < 2.05 || last);
        if (el._on !== on) { el.classList.toggle('on', on); el._on = on; }
        if (cards[k]) cards[k].classList.toggle('on', t >= 1);
        if (t > 0) cur = k;
        if (!on) return;
        if (t <= 1) { v = ease(t); pt = q(G.F, G.cf, G.C, v); ang = qa(G.F, G.cf, G.C, Math.max(.02, v)); }
        else if (t <= 1.35) { pt = G.C; ang = qa(G.F, G.cf, G.C, 1); }
        else { v = (t - 1.35) / .7 * 1.7; pt = q(G.C, G.cb, G.E, Math.min(1, v)); pt = [pt[0] + Math.max(0, v - 1) * G.Wd * .6, pt[1]]; ang = qa(G.C, G.cb, G.E, Math.min(1, v)); }
        el.style.transform = 'translate(' + pt[0].toFixed(1) + 'px,' + (pt[1] - 4).toFixed(1) + 'px) rotate(' + ang.toFixed(4) + 'rad) translate(-100%,-100%)';
      });
      if (kk) kk.textContent = (cur + 1 < 10 ? '0' : '') + (cur + 1);
      // the films: the newest one past the crest rises in front; an older one stays until the newer is fully up, then goes
      var covered = false;
      for (k = N - 1; k >= 0; k--) {
        var w = wins[k]; if (!w) continue;
        var tk = Math.min(P - k, k === N - 1 ? 1.35 : 99), vid = w.querySelector('video'), vis = tk >= .92 && !covered;
        if (tk > -1.6) FP.arm(vid);
        if (tk >= 1.12) covered = true;
        if (w._vis !== vis) { w.style.visibility = vis ? 'visible' : 'hidden'; w._vis = vis; }
        if (vis) {
          var rise = RM ? 0 : G.wh + 30 - (G.wh + 30) * ease(seg(tk, .92, 1.12));
          w.style.transform = 'translate(' + G.wx.toFixed(1) + 'px,' + (G.wy + rise).toFixed(1) + 'px)'; w.style.zIndex = k + 1;
          if (!playing[k]) { FP.play(vid); playing[k] = vid; }
        } else if (playing[k]) { FP.stop(vid); delete playing[k]; }
      }
    });
  })();

  /* ---- 9 · K3, the ride: the 54-mile route draws itself as a lit road; the words ride it; 73 counts up as the line arrives ---- */
  var k3 = $('.lw-k3');
  if (k3) (function () {
    k3.classList.add('kin');
    var st = $('.fp-stick', k3), view = $('.k3-view', k3), plane = $('.k3-plane', k3), lit = $('.k3-lit', k3), tp = $('textPath', k3), txt = $('.k3-t', k3),
        n = $('.k3-n', k3), pins = $$('.k3-pin', k3), L = lit.getTotalLength(), TL = 0, span = 0, last = -1;
    lit.style.strokeDasharray = L.toFixed(1) + ' ' + L.toFixed(1);
    function size() { try { TL = txt.getComputedTextLength(); } catch (e) { TL = 0; } var t0 = view.style.transform; view.style.transform = 'none'; var r = plane.getBoundingClientRect(); view.style.transform = t0; span = Math.max(0, r.bottom - st.getBoundingClientRect().top - st.clientHeight * .78); }
    size(); W.addEventListener('resize', function () { size(); ask(); }); W.addEventListener('load', function () { size(); ask(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { size(); ask(); });
    FP.on(function (H) {
      var s = at(k3, H); if (!s.on) return;
      var d = RM ? 1 : ease(seg(s.p, .05, .84)), v = Math.round(73 * d);
      lit.style.strokeDashoffset = (L * (1 - d)).toFixed(1);
      tp.setAttribute('startOffset', Math.max(0, d * L - TL - 10).toFixed(1));
      if (v !== last) { n.textContent = v; last = v; }
      pins.forEach(function (p) { p.classList.toggle('on', d >= +p.dataset.u - .002); });
      view.style.transform = 'translateY(' + (-span * d).toFixed(1) + 'px)';
    });
  })();

  /* ---- 11 · K4, sixteen nights: the strip moves under the night of the moment; fireworks stand up over six nights, names land on five ---- */
  var k4 = $('.lw-k4');
  if (k4) (function () {
    k4.classList.add('kin');
    var strip = $('.k4-strip', k4), tiles = $$('li', strip), data = [], lab = $('.k4-l', k4), hh = $('.k4-h', k4), pp = $('.k4-p', k4), cur = -1;
    try { data = JSON.parse(k4.getAttribute('data-nights') || '[]'); } catch (e) {}
    FP.on(function (H) {
      var s = at(k4, H); if (!s.on) return;
      var u = RM ? 15 : clamp((s.p - .04) / .9, 0, 1) * 15, i = Math.min(15, Math.round(u)), tw = tiles[1].offsetLeft - tiles[0].offsetLeft;
      strip.style.transform = 'translateX(' + (-(tiles[0].offsetWidth / 2 + u * tw)).toFixed(1) + 'px) rotateX(62deg)';
      if (i === cur) return; cur = i;
      tiles.forEach(function (t, k) { t.classList.toggle('on', k === i); t.classList.toggle('past', k < i); });
      var d = data[i] || ['', '', ''];
      lab.textContent = 'Night ' + (i + 1) + ' of 16 · ' + d[0];
      hh.textContent = d[1] || 'Our areas, lit and full';
      pp.textContent = d[2] || 'Liwa Land, Layali Moreeb and the Heritage Village, every one of the sixteen nights';
    });
  })();

  /* ---- 4 · K2, the moving map: our festival map as terrain at the foot of a true-scale Tal Moreeb (300 m, 984 ft high; about 1.6 km,
     a mile long, on the site's east side); the camera comes in over the one road; three pins rise on the three big areas; then each area's
     gate rises from the sand at its drawn size, with its dimensions, and cuts to the area as built ---- */
  var k2 = $('.lw-model');
  if (k2) (function () {
    var started = false;
    function go() {
      if (started) return; started = true;
      import('../../assets/fp/fp3d.js?v=21').then(function (m) { build(m.stage, m.T); }).catch(function () { k2.classList.add('no3d'); });
    }
    if ('IntersectionObserver' in W) {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); } }, { rootMargin: '150% 0px' });
      io.observe(k2);
    } else go();

    function build(stage, T) {
      var keep = W.__fp3d;
      var S = stage(k2, { assets: 'a/3d/', key: 0xfff0dc, rim: 0xffb066, rimI: .5, floor: 0x050403, grid: false, exposure: 1.0,
        sky: [[0, '#04040a'], [.46, '#0f0a10'], [.6, '#3b1e0c'], [.66, '#1a0e06'], [1, '#000']], fog: 0x150c07 });
      if (keep) W.__fp3d = keep;                       // fp.js pauses the road-in chapter's films through this handle
      if (!S) return;
      var std = S.std, box = S.box, tex = S.tex, world = S.world, scene = S.scene, cam = S.cam;
      /* the overview sees kilometres: a far plane to match, and near/far set per station so depth stays precise (see onFrame) */
      S.floor.visible = false; cam.near = 5; cam.far = 14000; cam.updateProjectionMatrix();
      var MW = 2400, MD = 1680, at2 = function (u, v) { return [(u - .5) * MW, (v - .5) * MD]; };
      /* the ground: the map (AntBrush, 16 Dec 2019, its Arabic lettering left out), the desert around it, the dune */
      var map = new T.Mesh(new T.PlaneGeometry(MW, MD), new T.MeshBasicMaterial({ map: tex('a/map-plan.webp'), color: 0xe6ddd2, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      map.rotation.x = -Math.PI / 2; map.position.y = .05; world.add(map);
      var ground = new T.Mesh(new T.PlaneGeometry(14000, 14000), std({ color: 0x3a2616, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -2; world.add(ground);
      var dg = new T.PlaneGeometry(1900, 2800, 120, 170); dg.rotateX(-Math.PI / 2);
      var pa = dg.attributes.position, n, px, pz, xc, d, Hz, h;
      for (n = 0; n < pa.count; n++) {
        px = pa.getX(n) + 1650; pz = pa.getZ(n); xc = 1430 + 70 * Math.sin(pz / 330); d = px - xc; Hz = 300 * Math.max(0, 1 - Math.pow(Math.abs(pz) / 1250, 4));
        h = d < 0 ? Hz * Math.pow(Math.max(0, 1 + d / 430), 1.25) : Hz * Math.pow(Math.max(0, 1 - d / 680), 1.1);
        h += 4 * Math.sin(px / 37 + pz / 53) * Math.min(1, h / 40) * Math.min(1, Math.abs(d) / 120);   /* ripples on the slopes, a clean crest */
        pa.setY(n, Math.max(0, h) - .3);
      }
      dg.computeVertexNormals();
      var dune = new T.Mesh(dg, std({ color: 0xc68b52, roughness: 1 })); dune.position.x = 1650; dune.receiveShadow = true; world.add(dune);
      var sun = new T.DirectionalLight(0xffcf9a, 2.4); sun.position.set(-1900, 650, 260); sun.target.position.set(1400, 0, 0); scene.add(sun, sun.target);

      /* the three big areas */
      var LL = at2(.35, .5), LM = at2(.748, .49), HV = at2(.43, .633), gates = [], discs = [], pins = [];
      function disc(p) { var m = new T.Mesh(new T.CircleGeometry(70, 64), std({ color: 0xc9925a, roughness: 1 })); m.rotation.x = -Math.PI / 2; m.position.set(p[0], .12, p[1]); m.receiveShadow = true; m.visible = false; world.add(m); discs.push(m); }
      function lamp(G, x, y, z, c, i, dd) { var l = new T.PointLight(c, i, dd, 2); l.position.set(x, y, z); G.add(l); }

      /* Liwa Land: the gate of the children's zone, as modelled for the road-in chapter (l2.js) from our elevation of 23 Dec 2019
         (icons 1.7 x 1.1 m, badge 1.7 x 1.7 m, popcorn and playhouse 3.33 x 3.5 m, castle 3 x 2.2 m; the arch, about 8 x 5.6 m, an estimate) */
      (function () {
        var GW = 8.0, GH = 5.6, LEG = 1.42, BEAM = 1.1, GD = 1.2, F = GD / 2, G = new T.Group(); G.position.set(LL[0], 0, LL[1]); world.add(G);
        var red = std({ color: 0xb50f17, roughness: .85 });
        G.add(box(LEG, GH - BEAM, GD, red, -(GW - LEG) / 2, (GH - BEAM) / 2, 0), box(LEG, GH - BEAM, GD, red, (GW - LEG) / 2, (GH - BEAM) / 2, 0), box(GW, BEAM, GD, red, 0, GH - BEAM / 2, 0));
        var print = function (f, w, hh, x, y) { var m = new T.Mesh(new T.PlaneGeometry(w, hh), std({ map: tex(f), transparent: true, depthWrite: false, roughness: .82 })); m.position.set(x, y, F + .012); m.renderOrder = 5; G.add(m); return m; };
        var cut = function (f, w, hh, x, y, z) { var m = new T.Mesh(new T.PlaneGeometry(w, hh), std({ map: tex(f), alphaTest: .5, roughness: .78, side: T.DoubleSide })); m.position.set(x, y, F + z); m.castShadow = m.receiveShadow = true; G.add(m); return m; };
        print('gate-logo.webp?v=2', 1.15, 1.15 * 325 / 960, -GW / 2 + .85, GH - BEAM / 2);
        print('gate-stars.webp', 1.09, .494, GW / 2 - .65, GH - .38);
        print('gate-date.webp', 1.407, .208, GW / 2 - .94, GH - .8);
        print('gate-reel.webp', .95, .979, -GW / 2 + .8, 3.42);
        cut('gate-icons.webp', 1.7, 1.093, -(GW - LEG) / 2, 4.2, .08);
        cut('gate-badge.webp', 1.7, 1.667, (GW - LEG) / 2, 3.5, .08);
        var LX = -GW / 2 - 1.65, RX = GW / 2 - 1.69;
        cut('gate-pop-1.webp', 1.886, 3.483, LX + 1.412 + .943, 1.7415, .45);
        cut('gate-pop-2.webp', 1.867, .805, LX + 1.463 + .9335, 2.27 + .4025, .62);
        cut('gate-pop-3.webp', 2.753, 2.208, LX + 1.3765, .023 + 1.104, .85);
        cut('gate-castle-1.webp', 1.586, 1.552, RX + .621 + .793, .63 + .776, .45);
        cut('gate-castle-2.webp', 3, 1.722, RX + 1.5, .861, .8);
        var nm = new T.Group(); nm.position.set(0, GH - BEAM / 2, F); G.add(nm);
        var geo = new T.PlaneGeometry(2.196, .526), side = std({ map: tex('gate-fz-edge.webp'), color: 0xb9858a, alphaTest: .5, roughness: .7, emissive: 0x3a0508, side: T.DoubleSide });
        for (var i = 0; i < 6; i++) { var m = new T.Mesh(geo, side); m.position.z = .02 + i * .024; nm.add(m); }
        var fc = new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex('gate-fz-face.webp'), alphaTest: .5, toneMapped: false })); fc.position.z = .144; nm.add(fc);
        lamp(G, -GW / 2 - .6, 1.1, 3.3, 0xffb070, 9, 10); lamp(G, GW / 2 + .6, 1, 3.1, 0xffb070, 7, 9); lamp(G, 0, GH - .7, F + 1.5, 0xffe2d6, 1.2, 5);
        gates.push({ o: G, h: GH + 3.6 }); disc(LL);
      })();

      /* Layali Moreeb: the blue gate with its pointed arch, gold-edged, in a palm-frond wall (our render, 083); shown without its lettering;
         its size is not on record, so it carries none */
      (function () {
        var G = new T.Group(); G.position.set(LM[0], 0, LM[1]); world.add(G);
        var HW = 3.3, GH = 5.6, DP = .8, A = 1.5, SP = 2.5;
        var arch = function (p, a, sp, top) { p.moveTo(-a, 0); p.lineTo(-a, sp); p.bezierCurveTo(-a, sp + 1.05, -.4, sp + 1.15, 0, top); p.bezierCurveTo(.4, sp + 1.15, a, sp + 1.05, a, sp); p.lineTo(a, 0); p.lineTo(-a, 0); };
        var sh = new T.Shape(); sh.moveTo(-HW, 0); sh.lineTo(HW, 0); sh.lineTo(HW, GH); sh.lineTo(-HW, GH); sh.lineTo(-HW, 0);
        var hole = new T.Path(); arch(hole, A, SP, SP + 1.95); sh.holes.push(hole);
        var g1 = new T.ExtrudeGeometry(sh, { depth: DP, bevelEnabled: false }); g1.translate(0, 0, -DP / 2);
        var wall = new T.Mesh(g1, std({ color: 0x3f6383, roughness: .7 })); wall.castShadow = wall.receiveShadow = true; G.add(wall);
        var rs = new T.Shape(); arch(rs, A + .16, SP, SP + 2.15); var rh = new T.Path(); arch(rh, A, SP, SP + 1.95); rs.holes.push(rh);
        var g2 = new T.ExtrudeGeometry(rs, { depth: DP + .08, bevelEnabled: false }); g2.translate(0, 0, -(DP + .08) / 2);
        G.add(new T.Mesh(g2, std({ color: 0xc19a5b, roughness: .45, metalness: .5 })));
        G.add(box(HW * 2 + .3, .5, DP + .2, std({ color: 0x6f8aa1, roughness: .7 }), 0, .25, 0), box(HW * 2 + .2, .22, DP + .12, std({ color: 0xc19a5b, roughness: .45, metalness: .5 }), 0, GH + .11, 0));
        var frond = std({ color: 0x7a5a36, roughness: 1 });
        G.add(box(10, 2.0, .3, frond, -HW - 5, 1.0, -.2), box(10, 2.0, .3, frond, HW + 5, 1.0, -.2));
        lamp(G, 0, 3.2, 2.6, 0xffe0b8, 6, 10); lamp(G, -HW - 1, 1.5, 2, 0xffb070, 4, 8); lamp(G, HW + 1, 1.5, 2, 0xffb070, 4, 8);
        gates.push({ o: G, h: GH + 1 }); disc(LM);
      })();

      /* the Heritage Village: the twin-tower gate as drawn (our render r4): towers 190 cm wide and 700 cm high (500 cm, then a 200 cm wind
         tower), a 450 cm opening, a 45 cm timber beam, a rail between the tower tops; palm-frond walls either side; lit red and green, as built */
      (function () {
        var G = new T.Group(); G.position.set(HV[0], 0, HV[1]); world.add(G);
        var plaster = std({ color: 0xd8c5a0, roughness: .95 }), wood = std({ color: 0x5b3b22, roughness: .8 }), dark = std({ color: 0x2e1f14, roughness: .8 });
        var TW = 1.9, OP = 4.5, BH = 5.0, TH = 2.0;
        [-1, 1].forEach(function (s) {
          var cx = s * (OP / 2 + TW / 2), k, j;
          G.add(box(TW, BH, TW, plaster, cx, BH / 2, 0), box(TW + .14, .16, TW + .14, plaster, cx, BH + .08, 0));
          for (k = -1; k <= 1; k += 2) for (j = -1; j <= 1; j += 2) G.add(box(.24, TH, .24, plaster, cx + k * (TW / 2 - .12), BH + TH / 2, j * (TW / 2 - .12)));
          for (k = -1; k <= 1; k++) { G.add(box(.13, TH * .78, .06, wood, cx + k * .42, BH + TH / 2, TW / 2 - .02)); G.add(box(.13, TH * .78, .06, wood, cx + k * .42, BH + TH / 2, -TW / 2 + .02)); }
          G.add(box(TW + .24, .16, TW + .24, plaster, cx, BH + TH + .08, 0));
          for (k = 0; k < 3; k++) G.add(box(.12, .5, .04, dark, cx - .45 + k * .45, BH - .9, TW / 2 + .01));
          lamp(G, cx, 1.4, TW / 2 + 1.6, s < 0 ? 0xff2a2a : 0x2aff6a, 7, 9);
        });
        G.add(box(OP + .3, .45, .6, wood, 0, 3.4, 0), box(OP + 2 * TW, .12, .14, dark, 0, BH + TH * .62, 0));
        var frond = std({ color: 0x8a6a42, roughness: 1 });
        G.add(box(9, 2.4, .3, frond, -(OP / 2 + TW + 4.5), 1.2, -.5), box(9, 2.4, .3, frond, OP / 2 + TW + 4.5, 1.2, -.5));
        gates.push({ o: G, h: BH + TH + 1 }); disc(HV);
      })();

      /* three pins, one on each big area, for the overview */
      [LL, LM, HV].forEach(function (p) {
        var g = new T.Group(); g.position.set(p[0], 0, p[1]); world.add(g);
        var m = std({ color: 0xd01f24, roughness: .5, emissive: 0x6a0608 });
        var pole = new T.Mesh(new T.CylinderGeometry(2.4, 2.4, 120, 10), m); pole.position.y = 60; g.add(pole);
        var head = new T.Mesh(new T.SphereGeometry(11, 20, 14), m); head.position.y = 124; g.add(head);
        g.visible = false; pins.push(g);
      });

      /* the stations: the overview, then the three gates (the camera stands south of each, the gates face south) */
      S.station(0, { c: [180, 0, 40], rx: 1250, ry: 720, yaw: -1.05, pitch: .5, drift: 0, noMirror: true });
      var s1 = S.station(0, { c: [LL[0], 2.7, LL[1]], rx: 6.8, ry: 3.7, yaw: .42, pitch: .06, drift: .3, fx: .62, noMirror: true });
      S.station(0, { c: [LM[0], 2.7, LM[1]], rx: 6.2, ry: 3.6, yaw: .38, pitch: .06, drift: .3, fx: .62, noMirror: true });
      var s3 = S.station(0, { c: [HV[0], 3.5, HV[1]], rx: 8.6, ry: 4.6, yaw: .42, pitch: .06, drift: .3, fx: .62, noMirror: true });
      s1.dims.push({ a: [LL[0] - 4, 6.0, LL[1] + .8], b: [LL[0] + 4, 6.0, LL[1] + .8], t: 'about 26 ft', big: true }, { a: [LL[0] + 4.6, 0, LL[1] + .8], b: [LL[0] + 4.6, 5.6, LL[1] + .8], t: 'about 18 ft' });
      s3.dims.push({ a: [HV[0] + 4.5, 0, HV[1] + 1.3], b: [HV[0] + 4.5, 7.0, HV[1] + 1.3], t: '23 ft', big: true }, { a: [HV[0] - 2.25, .3, HV[1] + 1.4], b: [HV[0] + 2.25, .3, HV[1] + 1.4], t: '15-ft opening' });

      /* the overview's camera comes in over the road: from high above its far end in the north, down and round to the west of the site, the dune behind it */
      var P0 = new T.Vector3(520, 1900, -2900), L0 = new T.Vector3(230, 0, -420), P1 = new T.Vector3(-1450, 620, -760), L1 = new T.Vector3(260, 0, 120), look = new T.Vector3(), v = new T.Vector3();
      var labs = $$('.lw-pin', k2), stick = $('.fp-stick', k2), PP = [LL, LM, HV];
      var lastNear = 0;
      S.onFrame(function (time, i, local) {
        var nr = i === 0 ? 5 : .1, fr = i === 0 ? 14000 : 900;
        if (nr !== lastNear) { lastNear = nr; cam.near = nr; cam.far = fr; cam.updateProjectionMatrix(); }
        gates.forEach(function (g, k) { var s = k + 1; g.o.position.y = i > s ? 0 : i === s ? -g.h * (1 - ease(seg(local, .02, .3))) : -g.h; });
        discs.forEach(function (m) { m.visible = i >= 1; });
        pins.forEach(function (g, k) { var s = i === 0 ? ease(seg(local, .3 + k * .1, .5 + k * .1)) : 0; g.visible = s > .001; g.scale.set(1, Math.max(.001, s), 1); });
        if (i === 0) { var t = ease(seg(local, 0, .92)); cam.position.lerpVectors(P0, P1, t); look.lerpVectors(L0, L1, t); cam.lookAt(look); cam.updateMatrixWorld(); }
        labs.forEach(function (el, k) {
          var on = i === 0 && pins[k].scale.y > .98;
          if (el._on !== on) { el.classList.toggle('on', on); el._on = on; }
          if (!on) return;
          v.set(PP[k][0], 140, PP[k][1]).project(cam);
          el.style.transform = 'translate(' + ((v.x * .5 + .5) * stick.clientWidth + 8).toFixed(1) + 'px,' + ((-v.y * .5 + .5) * stick.clientHeight).toFixed(1) + 'px) translateY(-50%)';
        });
      });
      S.ready();
      /* the engine ramps the intro's and the canvas's opacity at the start; here they switch on a hard edge instead (no fades) */
      k2.classList.add('hard');
      FP.on(function (H) { var r = k2.getBoundingClientRect(), P = clamp(-r.top / Math.max(1, r.height - H), 0, 1); k2.classList.toggle('past-intro', P > .045); });
    }
  })();
})();
