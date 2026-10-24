/* Dubai Health Authority, the lead presentation (dha21 E-DHA-LEAD, 21 Oct 2026). Everything here is made for this portfolio from the
   project's own files; nothing is generated.
   - The opening: the mark alive in 3D, read from the 2008 manual's vectors (a/dl/mark21.json: page 9, checked against page 12). A point
     of light, four rays through the slits between the pieces, three glass pieces landing by quarter turns, two of them lifting like a
     butterfly's wings, the camera's quarter orbit to front-on, then the name sliding out of the mark into the open corner. 10 s, once.
     Front-on, the pieces' faces are the manual's colours and outlines exactly (they lie in one plane square to the camera).
   - Kinetic A, the system: twenty applications from the manual (a/dl/app-*.webp, each whole) land one after another as objects at their
     real sizes, each called by a piece of the kit flying to its corner; the camera pulls back until the whole system stands, front-on.
   - Kinetic B, the campaign: thirteen titles land on two piles (newspapers at broadsheet size, magazines at magazine size), then a road
     at night where 47 back-lit boxes of 1.5 by 3 m (the media plan's size) light one by one.
   - The other beats are objects in CSS 3D (boards, cards, plates, a book, a box, a map, a leaflet), moved by the scroll or once in view.
   No fades: things move, turn by quarter turns and switch hard. With reduced motion every stage shows its last state, still. */
const D = document, W = window, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q = new URLSearchParams(location.search), STILL = Q.get('dl') === 'still', PROOF = Q.get('dl') === 'proof', FRONT = Q.get('dl') === 'front';
/* ?dl=still: every stage at its last frame (the stills a/dl/open-*, ka-*, kb-* were made this way); ?dl=front: the mark front-on in the
   lockup's own frame (a/dl/mark-3d-front.webp); ?dl=proof: the same in the manual's colours on white, to lay over the 2008 artwork */
const $ = (s, r = D) => r.querySelector(s), $$ = (s, r = D) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1), lerp = (a, b, t) => a + (b - a) * t;
const E = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, EO = t => 1 - Math.pow(1 - t, 3);
const EB = t => { const c = 1.45; return t >= 1 ? 1 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const phone = () => innerWidth <= 760;
let TP = null; const three = () => TP || (TP = import('../../vendor/three.module.min.js'));
let GL = null; const canGL = () => GL ?? (GL = (() => { try { const c = D.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })());
let MP = null; const mark = () => MP || (MP = fetch('a/dl/mark21.json').then(r => r.json()));
function near(el, fn, margin = '120%') {
  if (!el) return; if (STILL || !('IntersectionObserver' in W)) { fn(); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin + ' 0px' }); io.observe(el);
}
function inView(el, fn, ratio = .35) {
  if (!el) return; if (RM || STILL || !('IntersectionObserver' in W)) { fn(true); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && (e.intersectionRatio >= ratio || e.intersectionRect.height > innerHeight * ratio)) { io.disconnect(); fn(false); } }), { threshold: [0, .15, .35, .5, .75] });
  io.observe(el);
}
/* pinned stages: progress 0..1 while the stage holds */
const PINS = [];
function pin(el, fn) { if (el) PINS.push({ el, fn, last: -1 }); }
function progress(el) { const r = el.getBoundingClientRect(), h = r.height - innerHeight; return h <= 0 ? 1 : clamp(-r.top / h, 0, 1); }
let ticking = false;
function tick() { ticking = false; for (const s of PINS) { const r = s.el.getBoundingClientRect(); if (r.bottom < -innerHeight * .5 || r.top > innerHeight * 1.5) continue;
  const p = (RM || STILL) ? 1 : progress(s.el); if (Math.abs(p - s.last) > 1e-4) { s.last = p; s.fn(p); } } }
const ask = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
addEventListener('scroll', ask, { passive: true }); addEventListener('resize', () => { PINS.forEach(s => s.last = -1); ask(); });

/* objects with thickness: a back and four edges around each picture (.sl) */
function slabs(root = D) { $$('.sl', root).forEach(w => { if (w.dataset.sl) return; w.dataset.sl = 1;
  for (const c of ['b', 'l', 'r', 't', 'u']) { const i = D.createElement('i'); i.className = 'sf sf-' + c; i.setAttribute('aria-hidden', 'true'); if (c === 'b' && w.dataset.back) i.dataset.t = w.dataset.back; w.appendChild(i); } }); }
slabs();

/* ---------------------------------------------------------------------------------------------------- vectors to shapes */
function shapesOf(T, d) {
  const tok = d.match(/[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/g), paths = []; let i = 0, cmd = null, cur = null; const n = () => +tok[i++];
  while (i < tok.length) {
    if (/[MLCZ]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'Z') { if (cur) cur.closePath(); cur = null; cmd = null; continue; }
    if (cmd === 'M') { cur = new T.Path(); paths.push(cur); cur.moveTo(n(), n()); cmd = 'L'; }
    else if (cmd === 'L') cur.lineTo(n(), n());
    else if (cmd === 'C') cur.bezierCurveTo(n(), n(), n(), n(), n(), n());
    else i++;
  }
  const inside = (pt, poly) => { let c = false; for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) { const p = poly[a], q = poly[b]; if ((p.y > pt.y) !== (q.y > pt.y) && pt.x < (q.x - p.x) * (pt.y - p.y) / (q.y - p.y) + p.x) c = !c; } return c; };
  const it = paths.map(p => { const pts = p.getPoints(8); return { p, pts, area: Math.abs(T.ShapeUtils.area(pts)) }; }).filter(o => o.area > 1e-12);
  it.forEach(o => { o.depth = it.filter(q => q !== o && q.area > o.area && inside(o.pts[0], q.pts)).length; });
  const out = [];
  it.filter(o => o.depth % 2 === 0).forEach(o => { const s = new T.Shape(); s.curves = o.p.curves; o.shape = s; out.push(s); });
  it.filter(o => o.depth % 2 === 1).forEach(o => { let best = null; it.forEach(q => { if (q.shape && q.depth === o.depth - 1 && inside(o.pts[0], q.pts) && (!best || q.area < best.area)) best = q; }); if (best) best.shape.holes.push(o.p); });
  return out;
}
function envMap(T, R, bright = 1) {
  const pm = new T.PMREMGenerator(R), env = new T.Scene();
  env.add(new T.Mesh(new T.BoxGeometry(30, 30, 30), new T.MeshBasicMaterial({ color: 0x061a1e, side: T.BackSide })));
  [[0, 12, -4, 18, 4, 1.4], [-12, 4, 6, 4, 10, .8], [12, 3, 4, 4, 9, .6], [0, -6, 10, 14, 3, .25]].forEach(b => {
    const m = new T.Mesh(new T.PlaneGeometry(b[3], b[4]), new T.MeshBasicMaterial({ color: new T.Color(1, 1, 1).multiplyScalar(b[5] * bright), side: T.DoubleSide }));
    m.position.set(b[0], b[1], b[2]); m.lookAt(0, 0, 0); env.add(m); });
  const t = pm.fromScene(env, .03).texture; pm.dispose(); return t;
}
function glowTex(T, inner = 'rgba(255,255,255,1)', mid = 'rgba(190,240,255,.35)') {
  const c = D.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, inner); r.addColorStop(.18, mid); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
function rayTex(T) {
  const c = D.createElement('canvas'); c.width = 256; c.height = 16; const g = c.getContext('2d'), l = g.createLinearGradient(0, 0, 256, 0);
  l.addColorStop(0, 'rgba(255,255,255,1)'); l.addColorStop(.6, 'rgba(200,245,255,.55)'); l.addColorStop(1, 'rgba(200,245,255,0)');
  g.fillStyle = l; g.fillRect(0, 0, 256, 16); const v = g.createLinearGradient(0, 0, 0, 16); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, 256, 16);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}

/* ---------------------------------------------------------------------------------------------------- 0 · the opening */
async function opening() {
  const sec = $('.dl-open'); if (!sec) return;
  const cv = $('canvas.dl-c', sec), again = $$('.dl-again');
  const still = () => sec.classList.add('still', 'done');
  if (RM && !PROOF && !STILL && !FRONT) { still(); again.forEach(b => b.hidden = true); return; }
  if (!canGL()) { still(); again.forEach(b => b.hidden = true); return; }
  let slow = setTimeout(() => { slow = null; if (!sec.classList.contains('live')) still(); }, 3500);
  let T, M;
  try { [T, M] = await Promise.all([three(), mark()]); } catch (e) { still(); return; }
  let R; try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: PROOF || STILL || FRONT }); } catch (e) { still(); return; }
  R.setClearColor(PROOF ? 0xffffff : 0x000000, PROOF ? 1 : 0); R.localClippingEnabled = true; R.toneMapping = T.NoToneMapping;
  const scene = new T.Scene(); scene.environment = envMap(T, R);
  const GREEN = new T.Color(M.green), TEAL = new T.Color(M.teal), INK = new T.Color('#231F20'), PAPER = new T.Color('#f2f6f5');
  scene.add(new T.AmbientLight(0xffffff, .35));
  const key = new T.DirectionalLight(0xe8fbff, 2.4); key.position.set(.6, 1.4, -1.6); scene.add(key);
  const fill = new T.DirectionalLight(0xffffff, .7); fill.position.set(-1.2, .4, 2.2); scene.add(fill);
  const DEP = .075, BV = .0045;
  const solid = shapes => { const g = new T.ExtrudeGeometry(shapes, { depth: DEP - BV, bevelEnabled: true, bevelThickness: BV, bevelSize: BV, bevelOffset: -BV, bevelSegments: 2, curveSegments: 40 }); g.translate(0, 0, -(DEP - BV)); return g; };
  const pieces = [['ul', GREEN, 1], ['ur', TEAL, 0], ['lr', GREEN, -1]].map(([k, col, lift]) => {
    const cap = new T.MeshBasicMaterial({ color: col, toneMapped: false });
    const side = PROOF ? cap : new T.MeshPhysicalMaterial({ color: col.clone().multiplyScalar(.55), emissive: col, emissiveIntensity: .22, roughness: .14, metalness: 0, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: 1.6 });
    const mesh = new T.Mesh(solid(shapesOf(T, M[k])), [cap, side]); const piv = new T.Group(); piv.add(mesh); scene.add(piv);
    return { k, mesh, piv, lift };
  });
  const nameMat = () => new T.MeshBasicMaterial({ color: PROOF ? INK : PAPER, toneMapped: false, clippingPlanes: [] });
  const flat = shapes => { const g = new T.ExtrudeGeometry(shapes, { depth: .006, bevelEnabled: false, curveSegments: 6 }); g.translate(0, 0, -.006); return g; };
  const ar = new T.Mesh(flat(shapesOf(T, M.ar)), nameMat()), en = new T.Mesh(flat([].concat(...M.en.map(d => shapesOf(T, d)))), nameMat());
  const xc = Math.max(M.box.ar[2], M.box.en[2]) + .004, clip = new T.Plane(new T.Vector3(-1, 0, 0), xc);
  ar.material.clippingPlanes = [clip]; en.material.clippingPlanes = [clip]; scene.add(ar, en);
  const arW = M.box.ar[2] - M.box.ar[0] + .02, enW = M.box.en[2] - M.box.en[0] + .02;
  const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex(T), blending: T.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }));
  glow.position.set(0, 0, -DEP - .03); scene.add(glow);
  const rt = rayTex(T), rays = [0, 1, 2, 3].map(i => { const g = new T.PlaneGeometry(1, .014); g.translate(.5, 0, 0);
    const m = new T.Mesh(g, new T.MeshBasicMaterial({ map: rt, blending: T.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.z = i * Math.PI / 2; m.position.z = -DEP * .5; scene.add(m); return m; });
  if (PROOF || FRONT) { glow.visible = false; rays.forEach(r => r.visible = false); }
  const cam = new T.PerspectiveCamera(22, 1, .05, 60), rig = new T.Group(); rig.add(cam); scene.add(rig);
  const L = M.box.lockup, lw = L[2] - L[0], lcx = (L[0] + L[2]) / 2, lcy = (L[1] + L[3]) / 2;
  let w = 0, h = 0, Wl = 1, cx = 0, cy = 0;
  function size() {
    const r = sec.getBoundingClientRect(); w = Math.max(2, Math.round(r.width)); h = Math.max(2, Math.round(r.height));
    R.setPixelRatio(PROOF || FRONT ? 1 : Math.min(2, devicePixelRatio || 1)); R.setSize(w, h, false); cam.aspect = w / h;
    if (PROOF || FRONT) { const m = .06 * lw; Wl = w * lw / (lw + 2 * m); cx = w / 2; cy = h / 2; }
    else if (w <= 760) { Wl = w * .84; cx = w * .5; cy = h * .35; }
    else { Wl = Math.min(w * .5, h * 1.25); cx = w * .6; cy = h * .42; }
    lens(PROOF || FRONT ? 1.2 : 22);
  }
  /* the lockup at its place on the screen for a given lens: front-on, the camera square to the faces. The last two seconds narrow the
     lens (22 to 8 degrees, the camera drawing back to keep the size), so the mark settles flat, as the manual draws it */
  function lens(fov) {
    cam.fov = fov; const tan = Math.tan(fov * Math.PI / 360), u = lw / Wl;
    cam.position.set(lcx - (cx - w / 2) * u, lcy + (cy - h / 2) * u, lw * h / (2 * Wl * tan)); cam.far = cam.position.z + 20; cam.updateProjectionMatrix();
  }
  const qz = new T.Quaternion(), ql = new T.Quaternion(), ZA = new T.Vector3(0, 0, 1), DA = new T.Vector3(1, 1, 0).normalize();
  const DUR = 10.2;
  function at(t) {
    const g0 = EO(seg(t, .35, .75)), g1 = EO(seg(t, .9, 2.2));
    glow.visible = !PROOF && !FRONT && t >= .35; glow.scale.setScalar(.05 + g0 * .12 + g1 * .5 - seg(t, 5.2, 7.5) * .4);
    const rl = EO(seg(t, .9, 2.0)) * (1 - E(seg(t, 4.4, 5.4)));
    rays.forEach(r => { r.visible = !PROOF && !FRONT && rl > .002; r.scale.set(rl * .5, 1, 1); });
    pieces.forEach((P, i) => {
      const u = seg(t, 2.0 + i * .38, 3.5 + i * .38), e = EO(u);
      P.piv.visible = u > 0; P.piv.scale.setScalar(Math.max(.001, e));
      qz.setFromAxisAngle(ZA, (1 - EB(u)) * -Math.PI / 2);
      const lift = Math.sin(Math.PI * seg(t, 4.1, 5.9)) * .62 * P.lift; ql.setFromAxisAngle(DA, lift);
      P.piv.quaternion.copy(ql).multiply(qz); P.mesh.scale.z = Math.max(.02, lerp(.12, 1, E(u)));
    });
    const a1 = EO(seg(t, 7.0, 8.0)), a2 = EO(seg(t, 7.25, 8.3));
    ar.position.x = (1 - a1) * arW; en.position.x = (1 - a2) * enW; ar.visible = a1 > 0; en.visible = a2 > 0;
    const o = E(seg(t, .5, 7.0)); rig.rotation.set(-(1 - o) * .42, -(1 - o) * 1.3, 0); rig.scale.setScalar(lerp(1.22, 1, o));
    if (!PROOF && !FRONT) lens(lerp(22, 8, E(seg(t, 6.2, 8.6))));
    sec.classList.toggle('done', t >= 8.7);
    R.render(scene, cam);
  }
  size(); addEventListener('resize', () => { size(); at(running ? (performance.now() - t0) / 1000 : DUR); });
  let t0 = 0, running = false;
  function play() {
    sec.classList.remove('still'); sec.classList.add('live'); t0 = performance.now(); if (running) return; running = true;
    const step = () => { const t = (performance.now() - t0) / 1000; at(Math.min(t, DUR)); if (t < DUR) requestAnimationFrame(step); else running = false; };
    requestAnimationFrame(step);
  }
  again.forEach(b => b.addEventListener('click', () => { if (b.closest('.fp-end')) scrollTo({ top: 0, behavior: 'instant' }); play(); }));
  if (PROOF || STILL || FRONT) { clearTimeout(slow); sec.classList.add('live'); at(DUR); W.__dlOpenReady = true; return; }
  if (slow === null) { sec.classList.add('live'); sec.classList.remove('still'); at(DUR); sec.classList.add('done'); return; }   // too slow: the still stands; Play again works
  clearTimeout(slow); play();
}

/* ---------------------------------------------------------------------------------------------------- textures, objects */
function loader(T, R) {
  const L = new T.TextureLoader(), max = R.capabilities.getMaxAnisotropy();
  return (src, cb) => { const t = L.load(src, cb); t.colorSpace = T.SRGBColorSpace; t.anisotropy = Math.min(8, max); return t; };
}
/* a thin box: front picture, back picture or paper, edges of the stock */
function sheet(T, w, h, d, front, back, opt = {}) {
  const edge = new T.MeshStandardMaterial({ color: opt.edge || 0xe9ecea, roughness: .85 });
  const mk = (map, col) => map ? new T.MeshStandardMaterial({ map, roughness: opt.rough ?? .7, metalness: 0, emissive: opt.glow ? 0xffffff : 0x000000, emissiveMap: opt.glow ? map : null, emissiveIntensity: opt.glow ? .9 : 0 })
                                : new T.MeshStandardMaterial({ color: col ?? 0xf3f5f4, roughness: .8 });
  const m = new T.Mesh(new T.BoxGeometry(w, h, d), [edge, edge, edge, edge, mk(front), mk(back, opt.backCol)]);
  m.castShadow = !!opt.shadow; m.receiveShadow = !!opt.recv; return m;
}

/* ---------------------------------------------------------------------------------------------------- 5 · kinetic A: the system */
const APPS = [   // [name shown, front, back, w, h, d (m), x, y, z, kind]
  ['Letterhead', 'app-letterhead', null, .21, .297, .003, -.30, 1.652, .012],
  ['Continuation sheet', 'app-continuation', null, .21, .297, .003, -.06, 1.652, .012],
  ['DL envelope', 'app-dl-front', 'app-dl-back', .22, .115, .004, .47, 1.742, .014],
  ['A4 envelope', 'app-a4-front', 'app-a4-back', .229, .3185, .004, -.55, 1.641, .012],
  ['A3 envelope', 'app-a3-front', 'app-a3-back', .324, .451, .004, -.86, 1.575, .012],
  ['Business card', 'app-card-front', 'app-card-back', .09, .05, .004, .68, 1.775, .016],
  ['A4 folder', 'app-folder-front', 'app-folder-back', .22, .302, .006, .20, 1.649, .014],
  ['Advertising system', 'app-adsys', null, .21, .343, .004, .68, 1.248, .014],
  ['Note pad', 'app-notepad', 'app-notepad-in', .148, .21, .014, -.86, 1.315, .016],
  ['Project report', 'app-report', 'app-report-in', .21, .297, .008, -.64, 1.272, .014],
  ['Project report, picture cover', 'app-report-b', null, .21, .297, .008, -.40, 1.272, .014],
  ['PowerPoint template', 'app-ppt-1', null, .40, .294, .03, -.07, 1.274, .03, 'screen'],
  ['CD cover', 'app-cd-sleeve', null, .125, .125, .006, .24, 1.357, .014],
  ['CD sticker', 'app-cd-disc', null, .12, .12, .0012, .39, 1.36, .016, 'disc'],
  ['Roll-ups', 'app-rollup-1', null, .85, 2.32, .003, -3.95, 1.24, .9, 'rollups'],
  ['Sponsors’ poster', 'app-poster-1', null, .60, .924, .006, -1.55, 1.45, .02],
  ['The manual', 'mp-01', null, .42, .297, .016, -1.35, .95, 1.5, 'book'],
  ['General poster', 'app-poster-2', null, .60, .924, .006, 1.42, 1.45, .02],
  ['Vehicle livery', 'mp-69', null, 1.2, .849, .012, 1.65, 1.0, 1.6, 'board'],
  ['Pop-up stand', 'app-popup', null, 4.25, 2.25, .05, 4.15, 1.16, 1.25, 'popup'],
];
async function kineticA() {
  const sec = $('.dl-ka'); if (!sec) return;
  const cv = $('canvas.dl-c', sec), cnt = $('.na', sec), nm = $('.nm', sec);
  if ((RM && !STILL) || !canGL()) { sec.classList.add('still'); cnt.textContent = String(APPS.length); $('.nm', sec).textContent = 'The whole system'; return; }
  let T, M; try { [T, M] = await Promise.all([three(), mark()]); } catch (e) { sec.classList.add('still'); return; }
  let R; try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: STILL }); } catch (e) { sec.classList.add('still'); cnt.textContent = String(APPS.length); return; }
  sec.classList.add('live');
  R.setClearColor(0x04181c, 1); R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.shadowMap.enabled = !phone(); R.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(); scene.environment = envMap(T, R, .6); scene.environmentIntensity = .5; scene.fog = new T.Fog(0x04181c, 16, 34);
  const tex = loader(T, R); let dirty = true; const redraw = () => { dirty = true; ask2(); };
  scene.add(new T.HemisphereLight(0xffffff, 0x0b2a30, .9));
  const sun = new T.DirectionalLight(0xffffff, 1.6); sun.position.set(-3, 7, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 5, bottom: -2, near: 1, far: 30 }); sun.shadow.bias = -.0005; scene.add(sun, sun.target);
  const wall = new T.Mesh(new T.PlaneGeometry(40, 12), new T.MeshStandardMaterial({ color: 0x0a3138, roughness: .95 })); wall.position.set(0, 5, 0); wall.receiveShadow = true; scene.add(wall);
  const floor = new T.Mesh(new T.PlaneGeometry(40, 30), new T.MeshStandardMaterial({ color: 0x062328, roughness: .9 })); floor.rotation.x = -Math.PI / 2; floor.position.z = 14; floor.receiveShadow = true; scene.add(floor);
  /* the mark, then its kit: small pieces of the mark that fly to each application's corner */
  const GREEN = new T.Color(M.green), TEAL = new T.Color(M.teal);
  const pieceGeo = {}; ['ul', 'ur', 'lr'].forEach(k => { const g = new T.ExtrudeGeometry(shapesOf(T, M[k]), { depth: .12, bevelEnabled: false, curveSegments: 18 }); g.translate(0, 0, -.06); pieceGeo[k] = g; });
  const gm = new T.MeshStandardMaterial({ color: GREEN, roughness: .3, emissive: GREEN, emissiveIntensity: .25 }), tm = new T.MeshStandardMaterial({ color: TEAL, roughness: .3, emissive: TEAL, emissiveIntensity: .25 });
  const big = new T.Group(); [['ul', gm], ['ur', tm], ['lr', gm]].forEach(([k, m]) => big.add(new T.Mesh(pieceGeo[k], m)));
  big.position.set(0, 1.45, .35); big.scale.setScalar(.34); scene.add(big);
  const objs = APPS.map((a, i) => {
    const [name, f, b, w, h, d, x, y, z, kind] = a, g = new T.Group(); g.position.set(x, y, z); scene.add(g);
    const front = tex(`a/dl/${f}.webp`, redraw), back = b ? tex(`a/dl/${b}.webp`, redraw) : null;
    if (kind === 'disc') {
      const disc = new T.Mesh(new T.CylinderGeometry(w / 2, w / 2, d, 64), [new T.MeshStandardMaterial({ color: 0xdfe5e8, metalness: .6, roughness: .25 }), new T.MeshStandardMaterial({ map: front, roughness: .4 }), new T.MeshStandardMaterial({ color: 0xc9d1d5, metalness: .8, roughness: .2 })]);
      disc.rotation.x = Math.PI / 2; disc.castShadow = true; g.add(disc);
    } else if (kind === 'screen') {
      const sc = sheet(T, w, h, d, null, null, { edge: 0x111518, backCol: 0x111518, shadow: true }); sc.material[4] = new T.MeshStandardMaterial({ color: 0x0b0f10, roughness: .4 }); g.add(sc);
      const face = new T.Mesh(new T.PlaneGeometry(w * .94, w * .94 * 661 / 900), new T.MeshBasicMaterial({ map: front, toneMapped: false })); face.position.z = d / 2 + .001; g.add(face);
    } else if (kind === 'rollups') {
      ['app-rollup-1', 'app-rollup-2', 'app-rollup-3', 'app-rollup-4'].forEach((s, j) => {
        const r = new T.Group(); r.position.set(j * 1.0 - 1.5, 0, 0);
        const ban = sheet(T, w, h, d, j ? tex(`a/dl/${s}.webp`, redraw) : front, null, { shadow: true }); ban.position.y = 0; r.add(ban);
        const base = new T.Mesh(new T.BoxGeometry(w + .06, .08, .22), new T.MeshStandardMaterial({ color: 0xb8c0c2, metalness: .7, roughness: .3 })); base.position.y = -h / 2 - .04; base.castShadow = true; r.add(base);
        g.add(r); });
    } else if (kind === 'popup') {
      const R0 = 4.6, th = w / R0, cyl = new T.CylinderGeometry(R0, R0, h, 48, 1, true, -th / 2, th);
      const mat = new T.MeshStandardMaterial({ map: front, roughness: .6, side: T.FrontSide });
      const outer = new T.Mesh(cyl, mat); outer.castShadow = true; outer.position.z = -R0; g.add(outer);
      const inner = new T.Mesh(new T.CylinderGeometry(R0 - d, R0 - d, h, 48, 1, true, -th / 2, th), new T.MeshStandardMaterial({ color: 0x1b2b2e, side: T.BackSide })); inner.position.z = -R0; g.add(inner);
      front.wrapS = T.ClampToEdgeWrapping;
    } else if (kind === 'board') {
      const bd = sheet(T, w, h, d, front, null, { shadow: true, edge: 0x1d2629, backCol: 0x1d2629 }); g.add(bd); g.rotation.x = -.12;
      const leg = new T.Mesh(new T.BoxGeometry(.03, 1.1, .03), new T.MeshStandardMaterial({ color: 0x2b3437 })); leg.position.set(0, -.62, -.12); leg.rotation.x = .25; g.add(leg);
    } else if (kind === 'book') {
      const plinth = new T.Mesh(new T.BoxGeometry(.6, .9, .45), new T.MeshStandardMaterial({ color: 0x0d3a42, roughness: .8 })); plinth.position.y = -.47; plinth.castShadow = plinth.receiveShadow = true; g.add(plinth);
      const bk = sheet(T, w, h, d, front, null, { shadow: true, edge: 0xf0f2f1 }); bk.rotation.x = -Math.PI / 2 + .35; bk.position.y = .02; g.add(bk);
    } else {
      g.add(sheet(T, w, h, d, front, back, { shadow: true }));
    }
    const kit = new T.Mesh(pieceGeo[['ul', 'ur', 'lr'][i % 3]], i % 3 === 1 ? tm : gm); kit.scale.setScalar(kind ? .16 : .07); kit.visible = false; scene.add(kit);
    const corner = new T.Vector3(x - w / 2, y - h / 2, z + .05); if (kind === 'rollups') corner.set(x - 1.5 - w / 2, y - h / 2, z + .1);
    return { g, w, h, kind, kit, corner, name, home: g.position.clone() };
  });
  /* the timeline: the mark (0 to .07), stationery (.08 to .55), the large formats (.56 to .9), front-on (.92 to 1) */
  const N1 = 14, slot = i => i < N1 ? [.08 + i * (.47 / N1), .47 / N1] : [.56 + (i - N1) * (.34 / (APPS.length - N1)), .34 / (APPS.length - N1)];
  const cam = new T.PerspectiveCamera(34, 1, .05, 80), tgt = new T.Vector3(), from = new T.Vector3();
  const KEYS = [[0, 0, 1.42, 0, 1.5], [.1, 0, 1.3, 0, 2.15], [.55, .02, 1.3, 0, 2.3], [.62, -.5, 1.4, 0, 6.5], [.9, .25, 1.3, 0, 13.4], [1, .25, 1.25, 0, 13.4]];   // p, target x, y, z, visible width (m); the lower left stays open for the words
  let p = 0, w = 0, h = 0;
  function size() { const r = sec.querySelector('.dl-stick').getBoundingClientRect(); w = Math.max(2, Math.round(r.width)); h = Math.max(2, Math.round(r.height));
    R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); dirty = true; }
  function follow(p) {
    let i = 0; for (; i < objs.length - 1; i++) { const [s, ds] = slot(i); if (p < s + ds) break; }
    const [s, ds] = slot(i), u = E(seg(p, s - ds * .2, s + ds * .5)), cx = o => o.home.x;
    return lerp(i ? cx(objs[i - 1]) : 0, cx(objs[i]), u);
  }
  function camAt(p) {
    if (phone()) {
      const end = E(seg(p, .92, 1)), big = seg(p, .52, .58), vw = lerp(lerp(1.05, 4.7, big), 13.4, end);
      const tx = lerp(p < .08 ? 0 : follow(p), .25, end), tanH = Math.tan(cam.fov * Math.PI / 360) * cam.aspect, dist = vw / (2 * tanH);
      tgt.set(tx, lerp(1.45, 1.25, big), 0); cam.position.set(tx, tgt.y + dist * .06, dist); cam.lookAt(tgt); return;
    }
    let a = KEYS[0], b = KEYS[KEYS.length - 1];
    for (let i = 0; i < KEYS.length - 1; i++) if (p >= KEYS[i][0] && p <= KEYS[i + 1][0]) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    const u = E(seg(p, a[0], b[0])), vw = lerp(a[4], b[4], u), tanH = Math.tan(cam.fov * Math.PI / 360) * cam.aspect;
    const tanV = Math.tan(cam.fov * Math.PI / 360), dist = Math.max(vw / (2 * tanH), (vw * .42) / (2 * tanV));
    tgt.set(lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u));
    const el = lerp(.05, .14, seg(p, .56, .9)) * (1 - seg(p, .92, 1));
    cam.position.set(tgt.x, tgt.y + dist * Math.sin(el) + (phone() ? -dist * .05 : 0), dist * Math.cos(el)); cam.lookAt(tgt.x, tgt.y + (phone() ? -dist * .08 : 0), tgt.z);
  }
  function draw() {
    const bs = 1 - seg(p, .03, .075); big.visible = bs > 0; big.scale.setScalar(.34 * Math.max(.001, bs)); big.rotation.z = seg(p, 0, .07) * Math.PI / 2;
    let landed = 0, last = '';
    objs.forEach((o, i) => {
      const [s, ds] = slot(i), v = seg(p, s, s + ds * .45), u = seg(p, s + ds * .35, s + ds);
      o.kit.visible = false; /* WB-FLAT-dha: no piece flies to its corner */ o.kit.position.lerpVectors(big.position, o.corner, E(v)); o.kit.rotation.z = v * Math.PI;
      o.g.visible = u > 0; const k = 0, sz = Math.max(o.w, o.h); /* WB-FLAT-dha: in place, a hard cut */
      o.g.position.set(o.home.x, o.home.y + k * sz * .5, o.home.z + k * sz * 1.4);
      o.g.rotation.z = k * Math.PI / 2;
      if (u >= 1) { landed++; last = o.name; }
    });
    cnt.textContent = String(landed); nm.textContent = landed && landed < APPS.length ? last : (landed === APPS.length ? 'The whole system' : '​');
    camAt(p); const cd = cam.position.distanceTo(tgt); scene.fog.near = cd + 4; scene.fog.far = cd + 24;   // the far room fades into the ground at any distance
    R.render(scene, cam); dirty = false;
  }
  let want = false; const ask2 = () => { if (!want) { want = true; requestAnimationFrame(() => { want = false; if (dirty) draw(); }); } };
  size(); addEventListener('resize', () => { size(); ask2(); });
  pin(sec, v => { p = v; dirty = true; ask2(); }); ask();
  if (STILL) { p = 1; draw(); setTimeout(() => { draw(); W.__dlKaReady = true; }, 2500); }
}

/* ---------------------------------------------------------------------------------------------------- 10 · kinetic B: the campaign */
const TITLES = [['Gulf News', 0], ['Al Khaleej', 0], ['Al Bayan', 0], ['Emirates Business 24/7', 0], ['Emarat Al Youm', 0],
  ['Medical Times ME', 1], ['The Arab Hospital', 1], ['Healthcare ME', 1], ['ME Dentist', 1], ['Arabian Business, Arabic', 1], ['Arabian Business, English', 1], ['Kul Al Usra', 1], ['Zahrat Al Khaleej', 1]];
async function kineticB() {
  const sec = $('.dl-kb'); if (!sec) return;
  const cv = $('canvas.dl-c', sec), nt = $('.nt', sec), np = $('.np', sec), nm = $('.nm', sec);
  const done = () => { nt.textContent = '13'; np.textContent = '47'; sec.classList.add('end'); };
  if ((RM && !STILL) || !canGL()) { sec.classList.add('still'); done(); return; }
  let T; try { T = await three(); } catch (e) { sec.classList.add('still'); done(); return; }
  let R; try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: STILL }); } catch (e) { sec.classList.add('still'); done(); return; }
  sec.classList.add('live');
  R.setClearColor(0x04181c, 1); R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
  const tex = loader(T, R); let dirty = true; const redraw = () => { dirty = true; ask2(); };
  /* the press: two piles on a dark table */
  const press = new T.Scene(); press.environment = envMap(T, R, .5); press.environmentIntensity = .4;
  press.add(new T.HemisphereLight(0xffffff, 0x0a2a30, .45)); const lp = new T.SpotLight(0xffffff, 40, 8, .7, .6, 1.4); lp.position.set(.2, 2.6, 1.2); press.add(lp, lp.target);
  const table = new T.Mesh(new T.PlaneGeometry(8, 8), new T.MeshBasicMaterial({ color: 0x031215 })); table.rotation.x = -Math.PI / 2; press.add(table);
  const adCare = tex('a/3d/p-ad-care.webp', redraw), adTease = tex('a/3d/p-tease-care.webp', redraw), tFut = tex('a/dl/tear-future.webp', redraw), tBut = tex('a/dl/tear-butterfly.webp', redraw);
  /* a magazine page: the ad set whole on a white A4-proportioned page (210 x 280 mm), as a page carries a full-page ad */
  const magTex = (img) => { const c = D.createElement('canvas'); c.width = 600; c.height = 800; const g = c.getContext('2d'); g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, 600, 800);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; const im = new Image(); im.onload = () => { const s = Math.min(560 / im.width, 760 / im.height), iw = im.width * s, ih = im.height * s; g.drawImage(im, (600 - iw) / 2, (800 - ih) / 2, iw, ih); t.needsUpdate = true; redraw(); }; im.src = img; return t; };
  const magA = magTex('a/3d/p-ad-care.webp'), magB = magTex('a/3d/p-tease-care.webp');
  const NEWS = [[adCare, .33, .564], [tBut, .33, .351], [adTease, .33, .521], [tFut, .33, .341], [adCare, .33, .564]];
  let hN = 0, hM = 0;
  const titles = TITLES.map(([name, mag], i) => {
    let m, w, hh, d;
    if (!mag) { const n = NEWS[i]; w = n[1]; hh = n[2]; d = .006; m = sheet(T, w, hh, d, n[0], null, { edge: 0xe6e3d8, rough: .9 }); }
    else { w = .21; hh = .28; d = .008; m = sheet(T, w, hh, d, (i % 4 === 2) ? magB : magA, null, { edge: 0xf2f2ef, rough: .45 }); }
    m.rotation.x = -Math.PI / 2; const g = new T.Group(); g.add(m); press.add(g);
    const y = (mag ? (hM += d) : (hN += d)) - d / 2, ang = ((i * 37) % 9 - 4) * .03;
    return { g, name, home: phone() ? new T.Vector3(mag ? .02 : -.02, y, mag ? .26 : -.24) : new T.Vector3(mag ? .27 : -.24, y, mag ? .02 : 0), ang };
  });
  const pcam = new T.PerspectiveCamera(32, 1, .05, 40);
  /* the road at night: 47 lamp posts, each with a back-lit box of 1.5 x 3 m */
  const road = new T.Scene(); road.fog = new T.FogExp2(0x04181c, .0042); road.background = new T.Color(0x04181c);
  road.add(new T.HemisphereLight(0x9fd8e0, 0x020a0c, .35));
  const asphalt = new T.Mesh(new T.PlaneGeometry(60, 1600), new T.MeshStandardMaterial({ color: 0x0d1416, roughness: .9 })); asphalt.rotation.x = -Math.PI / 2; asphalt.position.z = -780; road.add(asphalt);
  const dashM = new T.MeshBasicMaterial({ color: 0x6f7c7e }), dashG = new T.PlaneGeometry(.15, 3);
  for (let z = 0; z > -1400; z -= 12) for (const x of [-7, -3.5, 3.5, 7]) { const m = new T.Mesh(dashG, dashM); m.rotation.x = -Math.PI / 2; m.position.set(x, .01, z); road.add(m); }
  const curb = new T.Mesh(new T.BoxGeometry(1.2, .3, 1600), new T.MeshStandardMaterial({ color: 0x2a3436, roughness: .8 })); curb.position.set(0, .15, -780); road.add(curb);
  const poleM = new T.MeshStandardMaterial({ color: 0x3a4649, metalness: .6, roughness: .4 }), poleG = new T.CylinderGeometry(.11, .16, 11, 10), armG = new T.BoxGeometry(2.4, .12, .12);
  const lampM = new T.MeshBasicMaterial({ color: 0xffe6b8, toneMapped: false }), lampG = new T.BoxGeometry(.7, .14, .3);
  const frameM = new T.MeshStandardMaterial({ color: 0x1a2226, metalness: .5, roughness: .4 }), frameG = new T.BoxGeometry(1.62, 3.12, .32);
  const litF = new T.MeshBasicMaterial({ map: adCare, toneMapped: false }), offF = new T.MeshBasicMaterial({ map: adCare, color: 0x161c1e, toneMapped: false });
  const litB = new T.MeshBasicMaterial({ map: adTease, toneMapped: false }), offB = new T.MeshBasicMaterial({ map: adTease, color: 0x161c1e, toneMapped: false });
  const faceG = new T.PlaneGeometry(1.5 * .58 * 1.71 > 3 ? 3 / 1.71 : 1.5, 1);
  const fw = Math.min(1.5, 2.96 / 1.71), fg = new T.PlaneGeometry(fw, fw * 1.71), bgw = Math.min(1.5, 2.96 / 1.579), bg = new T.PlaneGeometry(bgw, bgw * 1.579);
  const poles = [];
  for (let i = 0; i < 47; i++) {
    const side = i % 2 ? 1 : -1, z = -14 - i * 13, g = new T.Group(); g.position.set(side * 10.5, 0, z); road.add(g);
    const pole = new T.Mesh(poleG, poleM); pole.position.y = 5.5; g.add(pole);
    const arm = new T.Mesh(armG, poleM); arm.position.set(-side * 1.1, 10.9, 0); g.add(arm);
    const lamp = new T.Mesh(lampG, lampM); lamp.position.set(-side * 2.1, 10.8, 0); g.add(lamp);
    const box = new T.Group(); box.position.set(-side * .95, 5.2, 0); g.add(box);
    box.add(new T.Mesh(frameG, frameM));
    const f = new T.Mesh(fg, offF); f.position.z = .165; box.add(f);
    const b = new T.Mesh(bg, offB); b.position.z = -.165; b.rotation.y = Math.PI; box.add(b);
    box.rotation.y = side * .12;
    poles.push({ f, b, z });
  }
  void faceG;
  const rcam = new T.PerspectiveCamera(40, 1, .1, 1500);
  let p = 0, w = 0, h = 0;
  function size() { const r = sec.querySelector('.dl-stick').getBoundingClientRect(); w = Math.max(2, Math.round(r.width)); h = Math.max(2, Math.round(r.height));
    R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setSize(w, h, false); pcam.aspect = rcam.aspect = w / h; pcam.updateProjectionMatrix(); rcam.updateProjectionMatrix(); dirty = true; }
  function draw() {
    const P1 = .36;
    if (p < P1) {
      let n = 0, last = '';
      titles.forEach((o, i) => { const s = i < 5 ? -1 : .03 + (i - 5) * (.29 / 8) /* pol24 E-POL24-DHA-PRESS: the five newspapers on the table from the first frame, the magazines join one by one */, u = seg(p, s, s + .029 * 1.6), k = 0; /* WB-FLAT-dha: in place, a hard cut */
        o.g.visible = u > 0; o.g.position.set(o.home.x, o.home.y + k * .55, o.home.z + k * .25); o.g.rotation.y = o.ang + k * Math.PI / 2; if (u >= 1) { n++; last = o.name; } });
      nt.textContent = String(n); np.textContent = '0'; nm.textContent = last || '​';
      const ph = phone(), d = ph ? 2.7 : 1.4 /* pol24 E-POL24-DHA-PRESS: on a phone the piles stand clear of the count above them */, el = (ph ? 1.22 : 1.0) - seg(p, 0, P1) * .14;
      pcam.position.set(.02, Math.sin(el) * d, Math.cos(el) * d + .02); pcam.lookAt(.02, 0, .01); R.render(press, pcam);
      sec.classList.remove('end');
    } else {
      let n = 0;
      poles.forEach((o, i) => { const on = p >= .4 + .46 * (i / 46); o.f.material = on ? litF : offF; o.b.material = on ? litB : offB; if (on) n++; });
      nt.textContent = '13'; np.textContent = String(n); nm.textContent = n ? (n < 47 ? 'Garhoud Road, Jumeirah Beach Road, towards the airport' : 'All 47, lit') : '​';
      const u = E(seg(p, P1, .95)), z = lerp(14, -150, u);
      rcam.position.set(phone() ? 0 : -1.5, lerp(3.2, 2.2, u), z); rcam.lookAt(0, lerp(4.2, 4.6, u), z - 120); R.render(road, rcam);
      sec.classList.toggle('end', p >= .93);
    }
    dirty = false;
  }
  let want = false; const ask2 = () => { if (!want) { want = true; requestAnimationFrame(() => { want = false; if (dirty) draw(); }); } };
  size(); addEventListener('resize', () => { size(); ask2(); });
  pin(sec, v => { p = v; dirty = true; ask2(); }); ask();
  if (STILL) { p = 1; draw(); setTimeout(() => { draw(); W.__dlKbReady = true; }, 2500); }
}

/* ---------------------------------------------------------------------------------------------------- 1 · the pitch: boards in depth */
function pitch() {
  const sec = $('.dl-pitch'); if (!sec) return;
  const bds = $$('.dl-bd', sec), date = $('.dl-date', sec);
  const DATES = [['30 December 2007', 'nine routes'], ['2 January 2008', 'ten routes'], ['10 January 2008', 'page 9: the star appears'], ['20 January 2008', 'Route 01, the final deck']];
  let z = 0, prev = -1, j = 0; const star = bds[bds.length - 2], fin = bds[bds.length - 1];
  bds.forEach((b, i) => { const s = +b.dataset.s; if (b === fin) { b._z = star._z; b._s = 3; return; }
    if (s !== prev) { if (i) z -= 360; prev = s; j = 0; } else { z -= 64; j++; }
    b._z = z; b._s = s; b._x = ((((j * 37) % 5) - 2) || (j % 2 ? 1 : -1)) * .045; b._y = -j * .004; b._r = ((j % 2) ? 1 : -1) * (1 + (j % 3)) * .5; });
  star._x = 0; star._y = 0; star._r = 0;
  const Dz = -star._z; let cur = -1;
  pin(sec, p => {   /* WB-FLAT-dha (22 Oct): each round stands as one pile of boards in place; a hard cut to the next; nothing flies or fans */
    const bw = bds[0].offsetWidth, k = p < .25 ? 0 : p < .5 ? 1 : p < .75 ? 2 : 3, rk = b => b === fin ? 3 : b._s;
    const mine = bds.filter(b => rk(b) === k), top = k === 3 ? fin : k === 2 ? star : mine[mine.length - 1];
    bds.forEach(b => { const on = mine.indexOf(b) >= 0; b.style.visibility = on ? 'visible' : 'hidden'; if (!on) return;
      const n = b === top ? 0 : mine.length - mine.indexOf(b);
      b.style.transform = `translate3d(${b === top ? 0 : b._x * bw * .35}px,${-n * 3}px,${-n * 9}px) rotateX(10deg) rotateY(-12deg) rotateZ(${b === top ? 0 : b._r}deg)`; });
    if (k !== cur) { cur = k; date.innerHTML = `<b>${DATES[k][0]}</b><span>${DATES[k][1]}</span>`; }
  });
}

/* ---------------------------------------------------------------------------------------------------- 3 · what it means */
function meaning() {
  const sec = $('.dl-mean'); if (!sec) return;
  const qs = $$('.dl-q', sec), mk = $('.dl-mk', sec);
  const POS = () => phone() ? [[-.62, -1.3], [.62, -1.3], [.62, 1.15], [-.62, 1.15]] : [[-1.6, -.72], [1.6, -.72], [1.6, .62], [-1.75, .05]];
  const Z = [-140, -60, -200, -100];
  let cur = -2;
  pin(sec, p => {
    const k = p < .12 ? -1 : p < .78 ? Math.min(3, Math.floor((p - .12) / .165)) : 4;
    if (k === cur) return; cur = k;
    const mkw = mk.offsetWidth, pos = POS();
    sec.classList.toggle('named', k === 4);
    mk.style.transform = k >= 0 && k < 4 ? `rotate(${(k + 1) * 90}deg)` : k === 4 ? `translateX(${mkw * .818}px) rotate(0deg)` : 'rotate(0deg)';   // named: the whole lockup centred
    qs.forEach((q, i) => {
      const qw = q.offsetWidth, x = pos[i][0] * mkw - qw / 2, y = pos[i][1] * mkw - q.offsetHeight / 2, on = i === k;
      q.classList.toggle('on', on);
      q.style.visibility = k === 4 ? 'hidden' : 'visible';
      q.style.transform = `translate3d(${x}px,${y}px,${on ? 90 : Z[i]}px) rotateY(${on ? 0 : (pos[i][0] < 0 ? 18 : -18)}deg)`;
    });
  });
}

/* ---------------------------------------------------------------------------------------------------- 6 · the manual as a book */
function book() {
  const sec = $('.dl-man'); if (!sec) return;
  const leaves = $$('.lf', sec).reverse(), lab = $('.dl-page-n', sec);   // top leaf (the cover) first
  const NAMES = [['Brand Identity Manual', 'first edition, 8 March 2008'], ['1.1 · Logo rationale', 'clear as light'], ['1.3 · Identity development', 'an incomplete shape; the name completes it'],
    ['1.7 · Both languages must always be present', 'the logo is dual English and Arabic'], ['2 · Brand language', 'a kit of parts'], ['4.1 · Colour', 'growth, purity, health'], ['9.1 · Vehicle', 'third edition, 12 May 2009']];
  leaves.forEach((l, i) => l.style.transform = `translateZ(${(leaves.length - i) * .7}px)`);
  const W8 = (i) => i < 3 ? [.05 + i * .11, .14 + i * .11] : [.55 + (i - 3) * .11, .64 + (i - 3) * .11];
  let cur = -1;
  pin(sec, p => {
    let top = 0;
    leaves.forEach((l, i) => { if (i === leaves.length - 1) return; const [a, b] = W8(i), u = seg(p, a, b), ang = 180 * (u < 1 ? Math.pow(u, 1.8) * (u < .85 ? 1 : 1) : 1);
      l.style.transform = `translateZ(${(leaves.length - i) * .7}px) rotateX(${ang}deg)`; if (u >= .5) top = i + 1; });
    if (top !== cur) { cur = top; lab.innerHTML = `<b>${NAMES[top][0]}</b><span>${NAMES[top][1]}</span>`; }
  });
}

/* ---------------------------------------------------------------------------------------------------- 8 and 9 · tease, then reveal */
function teaseReveal() {
  const sec = $('.dl-tr'); if (!sec) return;
  const box = $('.dl-box', sec), ph = $('.dl-ph', sec), news = $('.dl-news', sec);
  pin(sec, p => {
    const lit = p >= .42; sec.classList.toggle('lit', lit);
    const turn = EO(seg(p, .6, .7)), back = EO(seg(p, .7, .8)); /* pol24 E-POL24-DHA-REVEAL: the photograph turns in as the box leaves */
    const ry = lit ? lerp(-6, 90, turn) : lerp(-26, 8, p / .42);
    box.style.visibility = turn >= 1 ? 'hidden' : 'visible'; box.style.transform = `rotateY(${ry}deg)`;
    news.style.visibility = p >= .6 ? 'hidden' : 'visible';
    ph.style.visibility = back > 0 ? 'visible' : 'hidden'; ph.style.transform = `rotateY(${(1 - back) * -90}deg)`;
    $('.dl-pole', sec).style.visibility = turn >= 1 ? 'hidden' : 'visible';
  });
}

/* ---------------------------------------------------------------------------------------------------- 2 · the vote: a point for each vote */
async function vote() {
  const cv = $('.dl-vote-s .dh-vote canvas'); if (!cv) return;
  const M = await mark(), x = cv.getContext('2d'), N = 960;
  const parts = [['ul', M.green], ['ur', M.teal], ['lr', M.green]].map(([k, c]) => [new Path2D(M[k]), c]);
  let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647, P = [];
  while (P.length < N) { const px = rnd() - .5, py = rnd() - .5; for (const [pa, c] of parts) if (x.isPointInPath(pa, px, py)) { P.push({ tx: px, ty: py, c, sx: rnd(), d: rnd(), wob: rnd() }); break; } }
  let Wc = 0, Hc = 0, want = 0;
  function draw() { want = 0; const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (w < 2 || h < 2) return; if (w !== Wc || h !== Hc) { Wc = cv.width = w; Hc = cv.height = h; }
    const p = (RM || STILL) ? 1 : clamp((innerHeight * .95 - r.top) / (innerHeight * .7), 0, 1), s = w * .84, rad = Math.max(1.2, w * .0055);
    x.clearRect(0, 0, w, h);
    for (const q of P) { const k = E(seg(p, q.d * .5, q.d * .5 + .5)), gx = q.sx * w, gy = h - rad * 2;
      const px = lerp(gx, w / 2 + q.tx * s, k) + Math.sin((1 - k) * 6 + q.wob * 6) * (1 - k) * w * .03, py = lerp(gy, h / 2 - q.ty * s, k);
      x.fillStyle = k > .02 ? q.c : '#3d6a70'; x.beginPath(); x.arc(px, py, rad, 0, 6.2832); x.fill(); } }
  const go = () => { if (!want) { want = 1; requestAnimationFrame(draw); } };
  addEventListener('scroll', go, { passive: true }); addEventListener('resize', go); go();
}

/* ---------------------------------------------------------------------------------------------------- the map, drawn in lines */
function map() {
  const sec = $('.dl-map-s'); if (!sec) return;
  const box = $('.dl-mapsvg', sec);
  near(sec, async () => {
    try { const t = await (await fetch('a/dl/map.svg')).text(); if (/^<svg[\s>]/.test(t.trim())) box.innerHTML = t.trim(); } catch (e) { /* the picture stays */ }
    inView(sec, () => sec.classList.add('go'), .3);
  }, '80%');
}

/* ---------------------------------------------------------------------------------------------------- the rest: once in view */
function once() {
  inView($('.dl-col-s'), now => { const s = $('.dl-col-s'); s.classList.add('go'); if (now) { s.classList.add('back', 'lit'); return; }
    setTimeout(() => s.classList.add('lit'), 1500); setTimeout(() => s.classList.add('back'), 2600); });
  ['.dl-web-s', '.dl-print-s', '.dl-btf-s', '.dha .fp-res'].forEach(s => inView($(s), () => $(s).classList.add('go'), .3));
}

opening(); pitch(); meaning(); book(); teaseReveal(); vote(); map(); once();
near($('.dl-ka'), kineticA, '150%'); near($('.dl-kb'), kineticB, '150%');
ask();
