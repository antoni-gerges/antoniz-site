/* bc3d22 (22 Oct 2026), the Building Codes page's 3D: the campaign's 3D objects rebuilt from the artwork's own geometry, and shown three ways:
   the fusion (the white tower turns, takes its materials floor by floor, the sky and the layout arrive on hard lines, a hard cut to the
   original teaser), the 3D chapter (each object turning, its front-on proof beside its artwork), the hologram (a four-sided unit on its
   plinth, the tower turning inside it). Method (one rule): the matched camera sits at the origin looking down -Z; every vertex is a pixel of
   the artwork back-projected onto a plane whose orientation comes from the artwork's own vanishing points (the books' edges, the tower's
   verticals); the visible faces carry the artwork itself, projected from that camera, so the front-on still is the artwork; faces the artwork
   never shows are left plain (their colour sampled from the artwork), never invented. Hard cuts only: no fades, no feathered edges.
   Three.js loads only when a 3D stage comes near; with reduced motion or no WebGL, the original artwork stands alone. */
(function () {
  'use strict';
  var D = document, W = window;
  var S = W.__bc3 = { ready: false, stages: {}, err: null };
  var RM = W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var secs = [].slice.call(D.querySelectorAll('[data-bc3]'));
  if (!secs.length) return;

  /* ---------------------------------------------------------------- the pinned stages: steps by scroll, hard cuts (no 3D needed) */
  function prog(sec) {
    var pin = sec.querySelector('.bc3-pin'); if (!pin) return 0;
    var r = pin.getBoundingClientRect(), span = r.height - W.innerHeight;
    return span <= 0 ? 0 : Math.max(0, Math.min(1, -r.top / span));
  }
  function stepper(sec) {   // [data-steps] lists: one item visible at a time (class on), the counter, hard cuts
    var items = [].slice.call(sec.querySelectorAll('.bc3-steps > li')), k = sec.querySelector('.bc3-k'), cur = -1;
    if (!items.length) return null;
    var w = items.map(function (li) { return +(li.getAttribute('data-w') || 1); }), sum = w.reduce(function (a, b) { return a + b; }, 0);
    return function (p) {
      var x = p * sum * .9999, i = 0; while (i < items.length - 1 && x >= w[i]) { x -= w[i]; i++; }
      sec.style.setProperty('--q', (x / w[i]).toFixed(3));                // where in its step: the piece's slow turn
      if (i === cur) return; cur = i;
      items.forEach(function (li, j) { li.classList.toggle('on', j === i); });
      if (k) k.textContent = String(i + 1);
      sec.setAttribute('data-step', String(i));
    };
  }
  var steppers = secs.map(function (s) { return { sec: s, f: stepper(s) }; });
  function tickSteps() { steppers.forEach(function (o) { if (o.f) o.f(prog(o.sec)); }); }
  // the shelf: each object turns a little as it crosses the screen (a slow turn, no slide)
  var shelf = [].slice.call(D.querySelectorAll('.bc3-turn > li'));
  function tickShelf() { var h = W.innerHeight; shelf.forEach(function (li) { var r = li.getBoundingClientRect(); var c = (r.top + r.height / 2) / h; li.style.setProperty('--r', Math.max(-1, Math.min(1, (c - .5) * 2)).toFixed(3)); }); }
  W.addEventListener('scroll', function () { tickSteps(); tickShelf(); }, { passive: true }); W.addEventListener('resize', function () { tickSteps(); tickShelf(); }); tickSteps(); tickShelf();

  /* ---------------------------------------------------------------- the 3D, loaded when a stage comes near */
  var gl3 = secs.filter(function (s) { return s.querySelector('canvas.bc3-c'); });
  if (!gl3.length) return;
  if (RM) { gl3.forEach(function (s) { s.classList.add('bc3-still'); }); S.ready = 'reduced'; return; }
  var base = (D.currentScript && D.currentScript.src) || (D.querySelector('script[src*="bc3d.js"]') || {}).src || '';
  var loading = false;
  function load() {
    if (loading) return; loading = true;
    import(new URL('../../../vendor/three.module.min.js', base).href).then(function (T) { boot(T); }, function (e) {
      S.err = String(e); gl3.forEach(function (s) { s.classList.add('bc3-still'); });
    });
  }
  if ('IntersectionObserver' in W) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { load(); io.disconnect(); } }); }, { rootMargin: '150% 0px' });
    gl3.forEach(function (s) { io.observe(s); });
  } else load();

  function boot(T) {
    var V = function (x, y, z) { return new T.Vector3(x, y, z); };

    /* -------------------------------------------- geometry helpers: quads in matched-camera space */
    function Model(cam) { this.cam = cam; this.pos = []; this.nrm = []; this.col = []; this.flat = []; this.edges = []; }
    Model.prototype.ray = function (u, v) { var c = this.cam; return V(u - c.cx, -(v - c.cy), -c.f); };
    Model.prototype.onPlane = function (u, v, pl) { var r = this.ray(u, v), t = pl.d / pl.n.dot(r); return r.multiplyScalar(t); };
    Model.prototype.px = function (P) { var c = this.cam; return [c.cx + c.f * P.x / -P.z, c.cy - c.f * P.y / -P.z]; };
    Model.prototype.quad = function (a, b, c, d, flat, rgb) {   // a b c d counter-clockwise seen from outside
      var n = new T.Vector3().subVectors(b, a).cross(new T.Vector3().subVectors(d, a)).normalize(), self = this;
      [a, b, c, a, c, d].forEach(function (p) { self.pos.push(p.x, p.y, p.z); self.nrm.push(n.x, n.y, n.z); self.col.push(rgb[0], rgb[1], rgb[2]); self.flat.push(flat ? 1 : 0); });
      [[a, b], [b, c], [c, d], [d, a]].forEach(function (e) { self.edges.push(e[0].x, e[0].y, e[0].z, e[1].x, e[1].y, e[1].z); });
    };
    // a box from its eight corners (f* = front face, b* = back face; tl tr br bl as seen from the front), which faces carry the artwork
    Model.prototype.box = function (f, b, rgb, proj) {
      proj = proj || {};
      this.quad(f[3], f[2], f[1], f[0], !proj.front, rgb);          // front
      this.quad(b[0], b[1], b[2], b[3], !proj.back, rgb);           // back
      this.quad(f[0], f[1], b[1], b[0], !proj.top, rgb);            // top
      this.quad(f[2], f[3], b[3], b[2], !proj.bottom, rgb);         // bottom
      this.quad(f[1], f[2], b[2], b[1], !proj.right, rgb);          // right
      this.quad(f[3], f[0], b[0], b[3], !proj.left, rgb);           // left
    };
    Model.prototype.mesh = function (mat) {
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(this.nrm, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(this.col, 3)); g.setAttribute('aFlat', new T.Float32BufferAttribute(this.flat, 1));
      var m = new T.Mesh(g, mat);
      var eg = new T.BufferGeometry(); eg.setAttribute('position', new T.Float32BufferAttribute(this.edges, 3));
      m.userData.edges = new T.LineSegments(eg, new T.LineBasicMaterial({ color: lin(0x1b1d22) }));
      return m;
    };
    function plane(n, P) { return { n: n.clone(), d: n.dot(P) }; }
    function shift(pl, s) { return { n: pl.n.clone(), d: pl.d + s }; }   // + toward the camera along n
    function rgb(h) { return [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255]; }

    /* -------------------------------------------- the projected-artwork material (exact pixels from the matched camera, or white clay) */
    function projMat(tex, cam, opt) {
      opt = opt || {};
      return new T.ShaderMaterial({
        uniforms: { map: { value: tex }, uK: { value: V(cam.cx, cam.cy, cam.f) }, uWH: { value: new T.Vector2(cam.W, cam.H) },
                    uMix: { value: opt.mix == null ? 1 : opt.mix }, uReveal: { value: -1 }, uHolo: { value: opt.holo ? 1 : 0 }, uAlpha: { value: opt.alpha || 1 } },
        side: T.FrontSide,
        vertexShader: 'attribute float aFlat; varying vec3 vP; varying vec3 vN; varying vec3 vC; varying float vF;\n' +
          'void main(){ vP = position; vN = normalize(normalMatrix * normal); vC = color; vF = aFlat; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform sampler2D map; uniform vec3 uK; uniform vec2 uWH; uniform float uMix; uniform float uReveal; uniform float uHolo; uniform float uAlpha;\n' +
          'varying vec3 vP; varying vec3 vN; varying vec3 vC; varying float vF;\n' +
          'void main(){ vec2 px = vec2(uK.x + uK.z * vP.x / -vP.z, uK.y - uK.z * vP.y / -vP.z);\n' +
          ' vec3 art = texture2D(map, vec2(px.x / uWH.x, 1.0 - px.y / uWH.y)).rgb; if (vF > .5) art = vC;\n' +
          ' float l = .42 + .58 * max(dot(normalize(vN), normalize(vec3(-.45,.55,.7))), 0.0);\n' +
          ' vec3 clay = vec3(.94,.94,.92) * l;\n' +
          ' float m = uMix * step(uReveal, px.y);\n' +
          ' vec3 c = mix(clay, art, m);\n' +
          ' if (uHolo > .5) { c = min(art * 1.15 + vec3(.05,.12,.26), vec3(1.0)) * (.72 + .28 * l); gl_FragColor = vec4(c, 1.0); return; }\n' +
          ' gl_FragColor = vec4(c, 1.0); }',
        vertexColors: true
      });
    }
    function backdropMat(tex, cam) {   // the artwork on a far plane: rectangles of it switched on one by one (hard edges)
      return new T.ShaderMaterial({
        uniforms: { map: { value: tex }, uK: { value: V(cam.cx, cam.cy, cam.f) }, uWH: { value: new T.Vector2(cam.W, cam.H) },
                    uRects: { value: [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return new T.Vector4(); }) }, uN: { value: 0 }, uGround: { value: lin(GROUND) }, uSky: { value: -1 } },
        vertexShader: 'varying vec3 vP; void main(){ vP = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform sampler2D map; uniform vec3 uK; uniform vec2 uWH; uniform vec4 uRects[8]; uniform int uN; uniform vec3 uGround; uniform float uSky;\n' +
          'varying vec3 vP;\n' +
          'void main(){ vec2 px = vec2(uK.x + uK.z * vP.x / -vP.z, uK.y - uK.z * vP.y / -vP.z);\n' +
          ' bool on = px.y >= uSky;\n' +
          ' for (int i = 0; i < 8; i++) { if (i >= uN) break; vec4 r = uRects[i]; if (px.x >= r.x && px.x < r.z && px.y >= r.y && px.y < r.w) on = !on; }\n' +
          ' gl_FragColor = vec4(on ? texture2D(map, vec2(px.x / uWH.x, 1.0 - px.y / uWH.y)).rgb : uGround, 1.0); }'
      });
    }
    // the 3D stages write the artwork's pixels as they are (no colour conversion), so their plain colours are given as they should show
    function lin(h) { return new T.Color().setHex(h, T.LinearSRGBColorSpace); }
    var BACK = 0x2c2e34, GROUND = 0x484b52;
    var loader = new T.TextureLoader();
    function tex(url) { var t = loader.load(url); t.colorSpace = T.NoColorSpace; t.minFilter = T.LinearFilter; t.generateMipmaps = false; return t; }

    /* -------------------------------------------- 3D-1 · the code-book tower, traced from the English teaser (01-WORK/002, 935 x 1559) */
    function towerB4() {
      // camera: the books' sixteen edges meet at VL (their vanishing point, on the horizon); the tower's left edge and its corner meet at VV
      var cam = { W: 935, H: 1559, cx: 467.5, cy: 779.5 }, VL = [-680, 1355], VV = [537, -849];
      var a = [VL[0] - cam.cx, -(VL[1] - cam.cy)], b = [VV[0] - cam.cx, -(VV[1] - cam.cy)];
      cam.f = Math.sqrt(-(a[0] * b[0] + a[1] * b[1]));                       // two orthogonal vanishing points give the focal length (~1008 px)
      var M = new Model(cam);
      var dL = V(a[0], a[1], -cam.f).normalize(), dV = V(b[0], b[1], -cam.f).normalize();
      var nL = new T.Vector3().crossVectors(dV, dL).normalize(); if (nL.z < 0) nL.negate();   // face L's normal, toward the camera
      var dR = dL.clone().negate();                                         // face R (and the books' ends) face along -dL
      var onL = function (x, y0) { return x; };
      // the books: top and bottom edge at x = 650 (pixel runs of the artwork), each edge a line through VL; left end, spine end, page-block end
      var TOP = [815, 867, 918, 967, 1017, 1071, 1135, 1187], BOT = [847, 899, 951, 1002, 1055, 1110, 1172, 1228];
      var XL = [394, 392, 392, 390, 388, 386, 384, 383], XR = [669, 677, 683, 687, 708, 708, 710, 716], XP = [705, 712, 716, 720, 735, 738, 744, 752];
      var COL = [0xC8262C, 0x7B2C8E, 0xC99A1B, 0xB4661A, 0x138A8A, 0x0E8F6F, 0x4C3484, 0x27458F];   // sampled from each spine
      var yAt = function (y650, x) { return VL[1] + (y650 - VL[1]) * (x - VL[0]) / (650 - VL[0]); };
      var P0 = M.ray(XR[0], yAt(TOP[0], XR[0])); P0.multiplyScalar(100 / -P0.z);
      var spine = plane(nL, P0);
      // the page block's width sets the books' depth p: the back edge of the red book's end face must land on its measured edge (705 px)
      var ps = [];
      for (var i = 0; i < 8; i++) {
        var TR = M.onPlane(XR[i], yAt(TOP[i], XR[i]), spine), lo = 0, hi = 80;
        for (var k = 0; k < 40; k++) { var mid = (lo + hi) / 2, u = M.px(TR.clone().addScaledVector(nL, -mid))[0]; if (u < XP[i]) lo = mid; else hi = mid; }
        ps.push((lo + hi) / 2);
      }
      var p = ps.reduce(function (s, x) { return s + x; }, 0) / ps.length;
      var faceL = shift(spine, -p);
      var books = [];
      for (i = 0; i < 8; i++) {
        var f = [M.onPlane(XL[i], yAt(TOP[i], XL[i]), spine), M.onPlane(XR[i], yAt(TOP[i], XR[i]), spine),
                 M.onPlane(XR[i], yAt(BOT[i], XR[i]), spine), M.onPlane(XL[i], yAt(BOT[i], XL[i]), spine)];
        var bk = f.map(function (q) { return q.clone().addScaledVector(nL, -p); });
        var c = rgb(COL[i]);
        M.box(f, bk, c, { front: 1, right: 1, bottom: 1 });
        books.push({ y0: yAt(TOP[i], XR[i]), y1: yAt(BOT[i], XL[i]) });
      }
      // the shaft: face L between its left edge (through VV and 452,777) and the corner (through VV and 712,812); top and base through VL
      var vx = function (x0, y0, y) { return VV[0] + (x0 - VV[0]) * (y - VV[1]) / (y0 - VV[1]); };
      var tlY = 358, tl = [vx(452, 777, tlY), tlY];
      var lineVL = function (pt, x) { return VL[1] + (pt[1] - VL[1]) * (x - VL[0]) / (pt[0] - VL[0]); };
      // the corner's top: where the top edge (through VL) meets the corner line
      var tr = [0, 0]; for (var y = 400; y > 100; y -= .25) { var x = vx(712, 812, y); if (lineVL(tl, x) >= y) { tr = [x, y]; break; } }
      var brY = 1375, br = [vx(712, 812, brY), brY], blX = vx(452, 777, 1370), bl = [blX, lineVL(br, blX)];
      var C = { tl: M.onPlane(tl[0], tl[1], faceL), tr: M.onPlane(tr[0], tr[1], faceL), br: M.onPlane(br[0], br[1], faceL), bl: M.onPlane(bl[0], bl[1], faceL) };
      // face R: through the corner, along -nL; its far edge a vertical through 874,792 (the right face's visible extent, kept simple)
      var faceR = plane(dR, C.tr);
      var farX = function (y) { return vx(874, 792, y); };
      // where the top edge of face R (from the corner top, along -nL) crosses the far vertical: walk along -nL
      function along(P, dir, target) { var lo = 0, hi = 400; for (var k = 0; k < 50; k++) { var m = (lo + hi) / 2, q = P.clone().addScaledVector(dir, m), u = M.px(q); if (u[0] < farX(u[1])) lo = m; else hi = m; } return (lo + hi) / 2; }
      var mn = nL.clone().negate(), wR = along(C.tr, mn);
      var Rt = C.tr.clone().addScaledVector(mn, wR), Rb = C.br.clone().addScaledVector(mn, wR);
      var Lt = C.tl.clone().addScaledVector(mn, wR), Lb = C.bl.clone().addScaledVector(mn, wR);
      var grey = rgb(0x5C6068);
      // shaft box: front = face L (tl tr br bl), back = the same moved back by the face R width
      M.box([C.tl, C.tr, C.br, C.bl], [Lt, Rt, Rb, Lb], grey, { front: 1, right: 1 });
      // the IBC banner: two panels just proud of the faces, wrapping the corner (01-WORK/002, its own corners)
      var bL = shift(faceL, p * .18), bR = shift(faceR, p * .18), blue = rgb(0x1D4F9C);
      var q1 = [M.onPlane(462, 600, bL), M.onPlane(649, 455, bL), M.onPlane(672, 796, bL), M.onPlane(452, 880, bL)];
      var q1b = q1.map(function (q) { return q.clone().addScaledVector(nL, -p * .18); });
      M.box(q1, q1b, blue, { front: 1, bottom: 1 });
      var q2 = [M.onPlane(649, 455, bR), M.onPlane(805, 604, bR), M.onPlane(840, 850, bR), M.onPlane(672, 796, bR)];
      var q2b = q2.map(function (q) { return q.clone().addScaledVector(dR, -p * .18); });
      M.box(q2, q2b, blue, { front: 1, bottom: 1 });
      // the pivot: the middle of the shaft's footprint; the axis: the tower's vertical
      var pivot = C.bl.clone().add(C.br).add(Rb).add(Lb).multiplyScalar(.25);
      var ground = { n: dV.clone(), P: C.br.clone() };
      return { M: M, cam: cam, pivot: pivot, axis: dV, ground: ground, books: books, p: p, ps: ps, src: 'a/teaser-935.webp',
               rects: [[0, 1428, 935, 1559], [0, 355, 392, 530], [35, 545, 405, 866], [0, 1000, 382, 1366], [38, 68, 392, 136], [540, 48, 892, 152]], skyFrom: 0,
               proof: { tl: tl, tr: tr, br: br, bl: bl } };
    }

    /* -------------------------------------------- 3D-3 · the code names as a building, traced from the main visual (01-WORK/024, 1370 x 1927) */
    function namesB7() {
      var cam = { W: 1370, H: 1927, cx: 685, cy: 963.5, f: 1600 }, M = new Model(cam);
      var front = { n: V(0, 0, 1), d: -100 }, depth = 7.5;   // the letters' side faces read ~7% of the distance (FIRE's right side, BUILDING's left)
      // the eight columns: left, right, top (01-WORK/024: the building x 364 to 1140, roof 1010, street 1585), rows (letters, top to bottom)
      var COLS = [[364, 445, 1062, 8, 0xD4B85E], [445, 539, 1033, 4, 0xC64B5C], [539, 620, 1039, 6, 0x6FB1B4], [620, 758, 1039, 6, 0xA584B4],
                  [758, 839, 1010, 8, 0x93B4B6], [839, 920, 1010, 6, 0xDEA474], [920, 1058, 1045, 6, 0xB07CB0], [1058, 1140, 1050, 8, 0x7F8FC6]];
      var street = 1585;
      COLS.forEach(function (c) {
        var rh = (street - c[2]) / c[3];
        for (var r = 0; r < c[3]; r++) {
          var y0 = c[2] + r * rh, y1 = y0 + rh - .8;
          var f = [M.onPlane(c[0], y0, front), M.onPlane(c[1], y0, front), M.onPlane(c[1], y1, front), M.onPlane(c[0], y1, front)];
          var b = f.map(function (q) { return q.clone().multiplyScalar((100 + depth) / 100); });
          M.box(f, b, rgb(c[4]), { front: 1 });
        }
      });
      // the block behind the letters (x 315 to 1160, top 1082), its face set back behind the letters
      var back = { n: V(0, 0, 1), d: -(100 + depth) };
      var bf = [M.onPlane(315, 1082, back), M.onPlane(1160, 1082, back), M.onPlane(1160, street, back), M.onPlane(315, street, back)];
      M.box(bf, bf.map(function (q) { return q.clone().multiplyScalar((100 + depth + 22) / (100 + depth)); }), rgb(0x8A8780), { front: 1 });
      // the billboard (x 440 to 915, y 810 to 975) on its two posts, standing on the roof behind the letters
      var bb = { n: V(0, 0, 1), d: -(100 + depth * 2) };
      var bq = [M.onPlane(440, 810, bb), M.onPlane(915, 810, bb), M.onPlane(915, 975, bb), M.onPlane(440, 975, bb)];
      M.box(bq, bq.map(function (q) { return q.clone().multiplyScalar(1.012); }), rgb(0xC8473F), { front: 1 });
      [[528, 540], [832, 844]].forEach(function (x) {
        var pq = [M.onPlane(x[0], 975, bb), M.onPlane(x[1], 975, bb), M.onPlane(x[1], 1082, bb), M.onPlane(x[0], 1082, bb)];
        M.box(pq, pq.map(function (q) { return q.clone().multiplyScalar(1.01); }), rgb(0x5A5F66), { front: 1 });
      });
      var pivot = V(M.onPlane(752, street, front).x, M.onPlane(752, street, front).y, -(100 + depth + 11));
      return { M: M, cam: cam, pivot: pivot, axis: V(0, 1, 0), src: 'a/kv-1370.webp', ground: { n: V(0, 1, 0), P: M.onPlane(752, street, front) } };
    }

    /* -------------------------------------------- the near-orthographic objects: a long lens (f = D), every vertex (u, v, z) is the pixel (u, v)
       back-projected to depth D - z, so the front-on view is exact; z comes from the artwork's own box edges: for three edges of a box seen
       in weak perspective with 2D vectors a, b, c, orthogonality in 3D gives za*zb = -a.b, za*zc = -a.c, zb*zc = -b.c (solved below) */
    function Ortho(cam) { Model.call(this, cam); this.D = cam.f; }
    Ortho.prototype = Object.create(Model.prototype);
    Ortho.prototype.P = function (u, v, z) { var c = this.cam, k = (this.D - z) / this.D; return V((u - c.cx) * k, -(v - c.cy) * k, -(this.D - z)); };
    function boxZ(a, b, c) {   // 2D edge vectors (y up) of three orthogonal edges -> their depth components (the sign: b toward the camera)
      var ab = a[0] * b[0] + a[1] * b[1], ac = a[0] * c[0] + a[1] * c[1], bc = b[0] * c[0] + b[1] * c[1];
      var za = Math.sqrt(Math.max(0, -ab * ac / bc)), zb = -ab / za, zc = -ac / za;
      if (zb < 0) { za = -za; zb = -zb; zc = -zc; }
      return [za, zb, zc];
    }
    /* 3D-2 · the crane lifting the codes, traced from the revealer (01-WORK/004, 907 x 1531; its Arabic lines are not on any face) */
    function craneB6() {
      var cam = { W: 907, H: 1531, cx: 453.5, cy: 765.5, f: 6000 }, M = new Ortho(cam);
      // the hanging block: five code books standing side by side, the IECC in front. The cover's corners and the spines' top corners
      var TL = [417, 675], TR = [532, 705], BR = [540, 873], BL = [438, 861], BACK = [352, 707];
      var e1 = [TR[0] - TL[0], -(TR[1] - TL[1])], e2 = [BL[0] - TL[0], -(BL[1] - TL[1])], e3 = [BACK[0] - TL[0], -(BACK[1] - TL[1])];
      var z = boxZ(e1, e2, e3), z1 = z[0], z2 = z[1], z3 = z[2], zb = -260;   // the block 260 px-units in front of the tower plane's origin
      var COLB = [0xD9822B, 0x167F5E, 0x13756F, 0x6A2D8A, 0x5B2D7E];
      for (var i = 0; i < 5; i++) {
        var o0 = i / 5, o1 = (i + 1) / 5 - .006;
        var at = function (q, zq, o) { return M.P(q[0] + e3[0] * o, q[1] - e3[1] * o, zb + zq + z3 * o); };
        var f = [at(TL, 0, o0), at(TR, z1, o0), at(BR, z1 + z2, o0), at(BL, z2, o0)], bk = [at(TL, 0, o1), at(TR, z1, o1), at(BR, z1 + z2, o1), at(BL, z2, o1)];
        M.box(f, bk, rgb(COLB[i]), { front: i === 0, left: 1, bottom: 1 });
      }
      // the hook (450, 612), the chains to the block's two front top corners, the cable up to the jib
      var hk = M.P(450, 612, zb + (z1 + z3) / 2);
      function rod(a, b, w, col) { var d = new T.Vector3().subVectors(b, a), s = new T.Vector3(0, 0, 1).cross(d).normalize().multiplyScalar(w), u = new T.Vector3().crossVectors(d, s).normalize().multiplyScalar(w);
        var f = [a.clone().sub(s).add(u), a.clone().add(s).add(u), b.clone().add(s).add(u), b.clone().sub(s).add(u)], bk = f.map(function (q) { return q.clone().addScaledVector(u, -2); });
        M.box(f, bk, rgb(col), { front: 1 }); }
      rod(hk, M.P(TL[0] + 8, TL[1] + 4, zb + 0), 1.6, 0x2a2a2a); rod(hk, M.P(TR[0] - 40, TR[1] - 8, zb + z1 * .7), 1.6, 0x2a2a2a);
      rod(M.P(449, 420, zb + (z1 + z3) / 2), hk, 1.2, 0x3a3a3a);
      // the jib: the lattice boom from the left edge up to its tip (left simple: one beam; its lattice is in the projected artwork)
      rod(M.P(300, 600, zb + (z1 + z3) / 2), M.P(461, 213, zb + (z1 + z3) / 2), 9, 0xD9C23A);
      // the tower behind: its front face (562,352) (700,290) (745,1100) (565,1100), its right face back to (760,380) (805,1110)
      var zt = 0, wR = -160;
      var tf = [M.P(562, 352, zt), M.P(700, 290, zt), M.P(745, 1100, zt), M.P(565, 1100, zt)];
      var tb = [M.P(562, 352, zt + wR), M.P(760, 380, zt + wR), M.P(805, 1110, zt + wR), M.P(565, 1100, zt + wR)];
      M.box(tf, tb, rgb(0x5C6068), { front: 1, right: 1 });
      // its eight code-book floors: the spines' edges at x 700 and 735 (pixel runs), from x 540 to the page blocks at 760, standing proud of the face
      var T7 = [867, 898, 927, 954, 980, 1007, 1037, 1063], B7 = [886, 916, 945, 972, 995, 1023, 1050, 1081], COL = [0xC8262C, 0x7B2C8E, 0xC99A1B, 0xB4661A, 0x138A8A, 0x0E8F6F, 0x4C3484, 0x27458F];
      for (i = 0; i < 8; i++) {
        var sl = -.143 * (1 - i / 7), y = function (y735, x) { return y735 + sl * (x - 735); };
        var bf = [M.P(540, y(T7[i], 540), zt + 26), M.P(760, y(T7[i], 760), zt + 26), M.P(760, y(B7[i], 760), zt + 26), M.P(540, y(B7[i], 540), zt + 26)];
        M.box(bf, bf.map(function (q) { return q.clone().multiplyScalar((cam.f - zt) / (cam.f - zt - 26)); }), rgb(COL[i]), { front: 1 });
      }
      var base = M.P(600, 1100, zt - 60);
      return { M: M, cam: cam, pivot: M.P(560, 1100, zb * .5 + wR * .5), axis: V(0, 1, 0), src: 'b3/revealer-tex.webp', ground: { n: V(0, 1, 0), P: base } };
    }
    /* 3D-4 · the eight codes, traced from the ad (494 x 698): eight code books lying flat, the IBC on top */
    function stackB9() {
      var cam = { W: 494, H: 698, cx: 247, cy: 349, f: 4000 }, M = new Ortho(cam);
      var TL = [150, 371], TR = [268, 345], BL = [227, 473], BR = [373, 406], BOT = [224, 548];   // the top cover; the bottom book's front corner
      var e1 = [TR[0] - TL[0], -(TR[1] - TL[1])], e2 = [BL[0] - TL[0], -(BL[1] - TL[1])], e3 = [BOT[0] - BL[0], -(BOT[1] - BL[1])];
      var z = boxZ(e1, e2, e3), z1 = z[0], z2 = z[1], z3 = z[2];
      var COL = [0x1D4F9C, 0x2E7D4F, 0x8A2B8F, 0xC0392B, 0xD98B1E, 0x0E8F8A, 0x6A2D8A, 0x27458F];
      for (var i = 0; i < 8; i++) {
        var o0 = i / 8, o1 = (i + 1) / 8 - .01;
        var at = function (q, zq, o) { return M.P(q[0] + e3[0] * o, q[1] - e3[1] * o, zq + z3 * o); };
        var f = [at(TL, 0, o0), at(TR, z1, o0), at(BR, z1 + z2, o0), at(BL, z2, o0)];
        var bk = [at(TL, 0, o1), at(TR, z1, o1), at(BR, z1 + z2, o1), at(BL, z2, o1)];
        // seen from above: the top face is the cover (front of this box), the front and right edges show the page blocks and spines
        M.box(f, bk, rgb(COL[i]), { front: i === 0, bottom: 1, right: 1, left: 1 });
      }
      var g = M.P(BOT[0], BOT[1], z2 + z3);
      var up = new T.Vector3().subVectors(M.P(TL[0], TL[1], 0), M.P(TL[0] + e3[0], TL[1] - e3[1], z3)).normalize();
      var c = M.P((TL[0] + BR[0]) / 2, (TL[1] + BR[1]) / 2 + 20, (z1 + z2) / 2 + z3 / 2);
      return { M: M, cam: cam, pivot: c, axis: up, src: 'b3/eight-494.webp', ground: { n: up, P: g } };
    }

    /* -------------------------------------------- a stage: renderer, the matched camera, the object on its turntable */
    function Stage(sec, build, opt) {
      opt = opt || {};
      var cv = sec.querySelector('canvas.bc3-c'), self = this;
      try { this.r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, preserveDrawingBuffer: !!opt.keep }); }
      catch (e) { sec.classList.add('bc3-still'); this.dead = true; return; }
      this.r.outputColorSpace = T.LinearSRGBColorSpace; this.r.setClearColor(lin(opt.clear == null ? BACK : opt.clear), 1);
      this.sec = sec; this.cv = cv; this.scene = new T.Scene(); this.m = build(); this.opt = opt;
      var cam = this.m.cam;
      this.t = tex(sec.getAttribute('data-bc3-tex') || this.m.src);
      this.mat = projMat(this.t, cam, { mix: 0 });
      this.mesh = this.m.M.mesh(this.mat);
      this.spin = new T.Group(); this.inner = new T.Group();
      this.spin.position.copy(this.m.pivot); this.inner.position.copy(this.m.pivot).negate();
      this.inner.add(this.mesh); this.spin.add(this.inner); this.scene.add(this.spin);
      if (opt.edges) this.inner.add(this.mesh.userData.edges);
      // the ground: a large grey plane on the tower's own ground
      var g = this.m.ground, gq = new T.Mesh(new T.CircleGeometry(this.m.pivot.length() * 6, 96), new T.MeshBasicMaterial({ color: lin(opt.groundCol == null ? GROUND : opt.groundCol) }));
      gq.position.copy(g.P).addScaledVector(g.n, -.05); gq.quaternion.setFromUnitVectors(V(0, 0, 1), g.n.clone().normalize());
      this.gq = gq; this.scene.add(gq);
      if (opt.backdrop) {   // the artwork itself on a far plane, behind the object, filling the matched frame exactly
        var Z = 4000, w = cam.W * Z / cam.f, h = cam.H * Z / cam.f;
        var pg = new T.PlaneGeometry(w, h); this.bd = new T.Mesh(pg, backdropMat(this.t, cam));
        this.bd.position.set((cam.W / 2 - cam.cx) * Z / cam.f, -(cam.H / 2 - cam.cy) * Z / cam.f, -Z); this.bd.visible = false; this.scene.add(this.bd);
      }
      this.cam = new T.PerspectiveCamera(2 * Math.atan(cam.H / 2 / cam.f) * 180 / Math.PI, cam.W / cam.H, 1, 20000);
      this.fov0 = this.cam.fov;
      this.mesh.geometry.computeBoundingBox(); this.center = this.mesh.geometry.boundingBox.getCenter(new T.Vector3());
      this.size(); this.ang = 0; this.zoom = 1;
      W.addEventListener('resize', function () { self.size(); self.draw(); });
    }
    Stage.prototype.size = function () {
      var r = this.cv.getBoundingClientRect(), dpr = Math.min(2, W.devicePixelRatio || 1);
      if (!r.width) return;
      this.r.setPixelRatio(dpr); this.r.setSize(r.width, r.height, false);
      this.aspect = r.width / r.height;
    };
    Stage.prototype.draw = function () {
      if (this.dead) return;
      var c = this.m.cam, k = this.zoom, kd = this.kd || 1;
      // the matched frame (the artwork's W x H) is fitted whole into the canvas; zoom > 1 shows more around it; kd > 1 dollies the camera
      // back from the object along the line through the matched camera (the object keeps its place in the frame, its perspective calms)
      var Cc = this.center, s = Math.min(1, (kd - 1) / .6);
      this.cam.position.copy(Cc).multiplyScalar(1 - kd);
      // keep the dollied camera at the matched camera's height above the object's ground, lifted a little (a calmer three-quarter view)
      var gn = this.m.ground.n.clone().normalize(), gP = this.m.ground.P, h0 = -gP.dot(gn), hc = Cc.clone().sub(gP).dot(gn);
      var hp = this.cam.position.clone().sub(gP).dot(gn); this.cam.position.addScaledVector(gn, (h0 + s * .35 * (hc - h0)) - hp - h0 + h0);
      this.cam.quaternion.identity();
      if (s > 0) { var lk = new T.PerspectiveCamera(); lk.position.copy(this.cam.position); lk.lookAt(Cc); this.cam.quaternion.slerp(lk.quaternion, s); }
      var artA = c.W / c.H, t0 = (c.H / 2) / c.f * (this.aspect < artA ? artA / this.aspect : 1), fh = 2 * Math.atan(t0 * k / kd);
      this.cam.fov = fh * 180 / Math.PI; this.cam.aspect = this.aspect; this.cam.updateProjectionMatrix();
      this.spin.quaternion.setFromAxisAngle(this.m.axis, this.ang);
      this.r.render(this.scene, this.cam);
    };

    /* -------------------------------------------- the fusion: one move on the English teaser */
    function fusion(sec) {
      var st = new Stage(sec, towerB4, { backdrop: true }); if (st.dead) return;
      var orig = sec.querySelector('.bc3-orig'), M = st.m, R = M.rects, books = M.books;
      var floors = books.map(function (b) { return b.y0; }).concat([0]).sort(function (a, b) { return b - a; });   // reveal lines, bottom up
      S.stages.fusion = st;
      function set(p) {
        var A = Math.max(0, Math.min(1, p / .36));                                   // 0-36%: the white tower turns on the grey ground
        st.ang = (1 - A) * .95; st.zoom = 1 + (1 - A) * .2; st.kd = 1 + (1 - A) * 1.6;
        var F = Math.max(0, Math.min(1, (p - .36) / .24));                           // 36-60%: materials, floor by floor, from the bottom
        st.mat.uniforms.uMix.value = F > 0 ? 1 : 0;
        var n = Math.floor(F * (floors.length + .999)); st.mat.uniforms.uReveal.value = F <= 0 ? 1e5 : n >= floors.length ? -1 : floors[Math.min(floors.length - 1, n)];
        if (F > 0 && n === 0) st.mat.uniforms.uReveal.value = 1375;               // the base first
        var K = Math.max(0, Math.min(1, (p - .60) / .14));                           // 60-74%: the sky, behind the tower, on a rising hard edge
        st.bd.visible = K > 0; st.gq.visible = K <= 0;
        st.bd.material.uniforms.uSky.value = K > 0 ? 1559 - Math.ceil(K * 12) / 12 * 1559 : 1e5;
        var Lr = Math.max(0, Math.min(1, (p - .74) / .16));                          // 74-90%: the layout arrives, rectangle by rectangle (the artwork's own)
        var shown = K >= 1 ? Math.floor(Lr * (R.length + .999)) : 0, U = st.bd.material.uniforms, n2 = 0;
        for (var i = shown; i < R.length; i++) U.uRects.value[n2++].set(R[i][0], R[i][1], R[i][2], R[i][3]);
        U.uN.value = n2;
        var cut = p >= .92;                                                          // 92%: the hard cut to the original, pixel for pixel
        sec.classList.toggle('bc3-cut', cut);
        sec.setAttribute('data-phase', cut ? 'original' : Lr > 0 ? 'layout' : K > 0 ? 'sky' : F > 0 ? 'materials' : 'white');
        if (!cut) st.draw();
      }
      st.set = set;
      var go = function () { set(prog(sec)); };
      W.addEventListener('scroll', go, { passive: true }); W.addEventListener('resize', go); go();
      st.t.image && st.t.image.complete ? go() : (st.t.onUpdate = go);
      loader.manager.onLoad = function () { go(); };
    }

    /* -------------------------------------------- the 3D chapter: each object turning slowly as you scroll, its proof one tap away */
    function objects(sec) {
      var cvs = [].slice.call(sec.querySelectorAll('canvas.bc3-c'));
      var list = cvs.map(function (cv) {
        var li = cv.closest('li'), kind = cv.getAttribute('data-obj');
        var holder = { querySelector: function (s) { return s === 'canvas.bc3-c' ? cv : null; }, getAttribute: function (a) { return a === 'data-bc3-tex' ? cv.getAttribute('data-tex') : null; }, classList: sec.classList };
        var st = new Stage(holder, { names: namesB7, crane: craneB6, stack: stackB9 }[kind] || towerB4, {}); if (st.dead) return null;
        st.mat.uniforms.uMix.value = 1; st.mat.uniforms.uReveal.value = -1; st.li = li; st.fit = { names: .5, crane: .72, stack: .42 }[kind] || 1.02;   // the object, not its whole poster, fills the frame
        S.stages[kind] = st; return st;
      }).filter(Boolean);
      function go() {
        var p = prog(sec), n = list.length;
        list.forEach(function (st, i) {
          if (!st.li.classList.contains('on')) return;
          var q = Math.max(0, Math.min(1, p * n - i));
          st.ang = Math.sin(q * Math.PI * 2) * .6; st.zoom = st.fit; st.kd = 2.2; st.size(); st.draw();
        });
      }
      W.addEventListener('scroll', go, { passive: true }); W.addEventListener('resize', go);
      loader.manager.onLoad = (function (prev) { return function () { if (prev) prev(); go(); }; })(loader.manager.onLoad);
      go(); setTimeout(go, 400);
    }

    /* -------------------------------------------- the hologram: a four-sided unit on its plinth, the tower turning inside */
    function holo(sec) {
      var cv = sec.querySelector('canvas.bc3-c'), r;
      try { r = new T.WebGLRenderer({ canvas: cv, antialias: true }); } catch (e) { sec.classList.add('bc3-still'); return; }
      r.outputColorSpace = T.SRGBColorSpace; r.setClearColor(0x07080b, 1);
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .05, 100);
      scene.add(new T.HemisphereLight(0xffffff, 0x202024, .9));
      var key = new T.DirectionalLight(0xffffff, 1.4); key.position.set(-2, 4, 3); scene.add(key);
      // the 2011 pavilion's language: a white floor, a green glass pane behind (01-WORK of 2014-wfes/029 and the deck's p.30)
      var floor = new T.Mesh(new T.PlaneGeometry(12, 12), new T.MeshStandardMaterial({ color: 0xe9e9e6, roughness: .55 }));
      floor.rotation.x = -Math.PI / 2; scene.add(floor);
      var pane = new T.Mesh(new T.BoxGeometry(2.4, 2.4, .02), new T.MeshStandardMaterial({ color: 0x1f9a6a, roughness: .15, metalness: .1, transparent: true, opacity: .55 }));
      pane.position.set(.4, 1.2, -1.6); pane.rotation.y = -.25; scene.add(pane);
      // the plinth (3.3 ft), the unit's black case (2 ft cube) with four glass faces sloping to a point: the four-sided pyramid
      var black = new T.MeshStandardMaterial({ color: 0x111215, roughness: .5 });
      var plinth = new T.Mesh(new T.BoxGeometry(.7, 1.0, .7), new T.MeshStandardMaterial({ color: 0xf2f2ef, roughness: .6 })); plinth.position.y = .5; scene.add(plinth);
      var baseS = new T.Mesh(new T.BoxGeometry(.66, .07, .66), black); baseS.position.y = 1.035; scene.add(baseS);
      var topS = new T.Mesh(new T.BoxGeometry(.66, .05, .66), black); topS.position.y = 1.655; scene.add(topS);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) { var post = new T.Mesh(new T.BoxGeometry(.025, .58, .025), black); post.position.set(c[0] * .3175, 1.36, c[1] * .3175); scene.add(post); });
      var glass = new T.MeshBasicMaterial({ color: 0x9fc7ff, transparent: true, opacity: .1, side: T.DoubleSide, depthWrite: false });
      var pyr = new T.Mesh(new T.ConeGeometry(.29 * Math.SQRT2, .56, 4, 1, true), glass); pyr.rotation.y = Math.PI / 4; pyr.rotation.x = Math.PI; pyr.position.y = 1.35; scene.add(pyr);
      var pe = new T.LineSegments(new T.EdgesGeometry(new T.ConeGeometry(.29 * Math.SQRT2, .56, 4, 1, true)), new T.LineBasicMaterial({ color: 0xbfd9ff, transparent: true, opacity: .55 }));
      pe.rotation.copy(pyr.rotation); pe.position.copy(pyr.position); scene.add(pe);
      // inside: the code-book tower (3D-1, the artwork's own colours), as light
      var m = towerB4(), t = tex(m.src), mat = projMat(t, m.cam, { holo: true, alpha: .95 });
      var mesh = m.M.mesh(mat), spin = new T.Group(), inner = new T.Group();
      inner.position.copy(m.pivot).negate(); inner.add(mesh); spin.add(inner);
      // the tower stands upright inside the pyramid: its own vertical turned to +Y, scaled to 0.36 m
      var q = new T.Quaternion().setFromUnitVectors(m.axis.clone().normalize(), V(0, 1, 0));
      var holder = new T.Group(); holder.add(spin); spin.quaternion.copy(q);
      var bbox = new T.Box3().setFromObject(spin), h = bbox.max.y - bbox.min.y, s = .46 / h;
      holder.scale.setScalar(s); holder.position.set(0, 1.11 - bbox.min.y * s, 0);
      var turn = new T.Group(); turn.add(holder); scene.add(turn);
      var glow = new T.PointLight(0x66aaff, .6, 1.2); glow.position.set(0, 1.35, 0); scene.add(glow);
      S.stages.holo = { r: r, turn: turn };
      function size() { var b = cv.getBoundingClientRect(); if (!b.width) return; r.setPixelRatio(Math.min(2, W.devicePixelRatio || 1)); r.setSize(b.width, b.height, false); cam.aspect = b.width / b.height; cam.updateProjectionMatrix(); }
      function draw() {
        var p = prog(sec);
        turn.rotation.y = -.5 + Math.sin(p * Math.PI * 3) * .95;   // the tower turns to and fro around the face the artwork shows (its back was never drawn)
        var phone = cam.aspect < .9;
        var dist = .62 / Math.tan(cam.fov * Math.PI / 360) * Math.max(1, .95 / cam.aspect);   // the unit and the top of its plinth fill the frame
        cam.position.set(Math.sin(-.5) * dist, 1.62, Math.cos(-.5) * dist); cam.lookAt(0, 1.22, 0);
        r.render(scene, cam);
      }
      size(); draw();
      W.addEventListener('scroll', draw, { passive: true }); W.addEventListener('resize', function () { size(); draw(); });
      loader.manager.onLoad = (function (prev) { return function () { if (prev) prev(); draw(); }; })(loader.manager.onLoad);
    }

    /* -------------------------------------------- the proof harness (build only): ?bc3proof=b4|b7&mode=art|clay|overlay */
    S.T = T; S.towerB4 = towerB4; S.namesB7 = namesB7; S.craneB6 = craneB6; S.stackB9 = stackB9; S.Stage = Stage; S.projMat = projMat;
    secs.forEach(function (sec) {
      var k = sec.getAttribute('data-bc3');
      try { if (k === 'fusion') fusion(sec); else if (k === 'objects') objects(sec); else if (k === 'holo') holo(sec); }
      catch (e) { S.err = String(e && e.stack || e); sec.classList.add('bc3-still'); }
    });
    S.ready = true;
  }
})();
