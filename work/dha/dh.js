/* Dubai Health Authority, brand identity and launch, 2008: the 3D chapter and the pieces of the opening film. All of it is made for this portfolio.
   What is drawn, and where each part comes from:
   - the mark: every outline is read as vectors from our Brand Identity Manual (edition of 12 May 2009, page 11, section 1.3 "Identity
     Development"): the three pieces, the Arabic name and the English name, in their own places (a/3d/mark.json). Nothing is redrawn.
     Colours are the manual's own RGB values (section 4.2): green 140 198 63, turquoise 0 139 153. The name is black in the logo; on this
     black ground it is white, as in the manual's reversed versions (section 1.8).
     It is built the way the same page draws it, in five steps: a rounded square; a leaf cut out of it ("Finding the best angle"); the two
     wings meet on the diagonal; a third joins; the fourth corner is left open ("An incomplete shape"); "DHA will complete the picture":
     the name takes the open corner. The square and the leaf are made from the pieces' own curves. NO SIGN WAS BUILT in 2008: this is a model.
   - the manual: seventeen whole pages of that manual, the ones Tony picked, on a wire-bound book that turns over its top edge, the way
     our own case-study render of 2010 shows it (archive 01-WORK/058). Each page is the page, whole.
   - the road: Al Garhoud Road as a model, a gentle right-hand curve as in the photographs of 12 and 21 April 2008. Each lamp-post carries
     a back-lit box. The outdoor print files have not been found, so each face is the press artwork, whole (archive 01-WORK/129 and 130),
     at its own proportion in a dark frame; the box takes the artwork's proportion, not the size in the media plan. One side holds the
     teaser, the other its revealer. In the opening film the boxes turn on their posts, once: that turn is the film's way of showing the
     change, not how it was done in 2008. On this page's road the boxes have simply changed. The night, the wet road, the lamps, the traffic and the far lights are atmosphere made for the picture, not record.
   - the three pictures: the same three boxes, close, on plain posts in the dark studio, so each artwork is seen large and whole; the
     camera walks round them, teasers on the front, revealers on the back. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

export { T };
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1), lerp = (a, b, t) => a + (b - a) * t;
export const E = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, EO = t => 1 - Math.pow(1 - t, 3);

/* ---------- vectors: path data to shapes, with their holes ---------- */
const TOK = /[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/g;
function subpaths(d, fx, fy) {
  const tok = d.match(TOK), out = []; let i = 0, cmd = null, cur = null; const n = () => +tok[i++];
  while (i < tok.length) {
    if (/[MLCZ]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'Z') { if (cur) cur.closePath(); cur = null; cmd = null; continue; }
    if (cmd === 'M') { cur = new T.Path(); out.push(cur); cur.moveTo(fx(n()), fy(n())); cmd = 'L'; }
    else if (cmd === 'L') cur.lineTo(fx(n()), fy(n()));
    else if (cmd === 'C') cur.bezierCurveTo(fx(n()), fy(n()), fx(n()), fy(n()), fx(n()), fy(n()));
    else i++;
  }
  return out;
}
function toShapes(paths) {
  const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };
  const it = paths.map(p => { const pts = p.getPoints(10); return { p, pts, area: Math.abs(T.ShapeUtils.area(pts)) }; }).filter(o => o.area > 1e-10);
  it.forEach(o => { o.depth = it.filter(q => q !== o && q.area > o.area && inside(o.pts[0], q.pts)).length; });
  const shapes = [];
  it.filter(o => o.depth % 2 === 0).forEach(o => { const s = new T.Shape(); s.curves = o.p.curves; o.shape = s; shapes.push(s); });
  it.filter(o => o.depth % 2 === 1).forEach(o => { let best = null; it.forEach(q => { if (q.shape && q.depth === o.depth - 1 && inside(o.pts[0], q.pts) && (!best || q.area < best.area)) best = q; }); if (best) best.shape.holes.push(o.p); });
  return shapes;
}
const nums = d => d.match(/-?\d*\.?\d+(?:e-?\d+)?/g).map(Number);

/* ---------- the mark, from the manual's own outlines. Centre of the star at the group's origin; size = the star's full span ---------- */
export function makeMark(M, o) {
  o = Object.assign({ size: 4.4, depth: .34, bevel: .014 }, o);
  const k = o.size / 117.574, fx = x => (x - M.cx) * k, fy = y => -(y - M.cy) * k, g = new T.Group();
  const A = 57.2031 * k, GAP = 1.586 * k, D = o.depth;
  const GREEN = new T.Color(M.green), TEAL = new T.Color(M.teal), GREY = new T.Color(0x9b9b9b), PAPER = new T.Color(0xf7f5f1);
  const solid = shapes => { const b = o.bevel, geo = new T.ExtrudeGeometry(shapes, { depth: D - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 2, curveSegments: 44 }); geo.translate(0, 0, -(D - 2 * b) / 2); return geo; };
  const piece = (d, col) => { const face = new T.MeshBasicMaterial({ color: col.clone(), toneMapped: false }), side = new T.MeshStandardMaterial({ color: col.clone().multiplyScalar(.5), roughness: .5, metalness: .1 });
    const m = new T.Mesh(solid(toShapes(subpaths(d, fx, fy))), [face, side]); m.castShadow = true; m.userData = { col, face, side }; g.add(m); return m; };
  const ul = piece(M.ul, GREEN), ur = piece(M.ur, TEAL), lr = piece(M.lr, GREEN);

  /* the leaf: what is cut out of the square in the first step. Its two sides are the two pieces' own curves, set as in that drawing */
  const off = A / 2 + GAP, a = nums(M.ul), b = nums(M.lr), leafShape = new T.Shape();
  { const X = (v, dx) => fx(v) + dx, Y = (v, dy) => fy(v) + dy;
    leafShape.moveTo(X(a[10], off), Y(a[11], -off));
    leafShape.bezierCurveTo(X(a[12], off), Y(a[13], -off), X(a[14], off), Y(a[15], -off), X(a[16], off), Y(a[17], -off));
    leafShape.bezierCurveTo(X(b[12], -off), Y(b[13], off), X(b[14], -off), Y(b[15], off), X(b[16], -off), Y(b[17], off)); }
  const leafFace = new T.MeshBasicMaterial({ color: GREY.clone(), toneMapped: false, transparent: true }), leafSide = new T.MeshStandardMaterial({ color: GREY.clone().multiplyScalar(.5), roughness: .5, transparent: true });
  const leaf = new T.Mesh(solid([leafShape]), [leafFace, leafSide]); leaf.castShadow = true; g.add(leaf);

  /* the open corner: the upper-left piece mirrored, as a broken line, the way the manual draws it */
  const openPts = subpaths(M.ul, fx, y => -fy(y))[0].getPoints(60).map(p => new T.Vector3(p.x, p.y, 0)); openPts.push(openPts[0].clone());
  const dash = new T.Line(new T.BufferGeometry().setFromPoints(openPts), new T.LineDashedMaterial({ color: 0xffffff, dashSize: A * .05, gapSize: A * .04, transparent: true, opacity: 0, toneMapped: false })); dash.computeLineDistances(); g.add(dash);

  /* the name: Arabic above English, exactly where the logo sets them */
  const flatGeo = shapes => { const geo = new T.ExtrudeGeometry(shapes, { depth: D * .22, bevelEnabled: false, curveSegments: 6 }); geo.translate(0, 0, -D * .11); return geo; };
  const nameMat = () => new T.MeshBasicMaterial({ color: PAPER.clone(), toneMapped: false, transparent: true });
  const ar = new T.Mesh(flatGeo(toShapes(subpaths(M.ar, fx, fy))), nameMat()), en = new T.Mesh(flatGeo(toShapes([].concat(...M.en.map(d => subpaths(d, fx, fy))))), nameMat());
  g.add(ar, en);
  const x0 = fx(438.1), x1 = fx(748.07);
  const setCol = (m, c, shade) => { m.userData.face.color.copy(c).multiplyScalar(shade === undefined ? 1 : shade); m.userData.side.color.copy(c).multiplyScalar(.5); };
  const line = d => subpaths(d, fx, fy)[0].getPoints(70).map(p => new T.Vector3(p.x, p.y, 0));
  return { g, ul, ur, lr, leaf, leafFace, leafSide, dash, ar, en, A, GAP, off, k, x0, x1, GREEN, TEAL, GREY, setCol, size: o.size, lines: { ul: line(M.ul), ur: line(M.ur), lr: line(M.lr), ll: openPts.slice(0, -1) } };
}

/* the five steps of the manual's page, t from 0 to 1 */
export function markSteps(m, t) {
  const c = new T.Color();
  /* 1 · the square, and the leaf cut out of it */
  const out = E(seg(t, .07, .26)); m.leaf.visible = out < 1; m.leaf.position.set(-out * .5, out * .5, out * 2.6); m.leaf.rotation.set(out * .5, -out * .9, 0); m.leafFace.opacity = m.leafSide.opacity = 1 - seg(out, .45, 1);
  /* 2 · the two wings cross, and meet on the diagonal */
  const sw = E(seg(t, .22, .46)), arc = Math.sin(sw * Math.PI);
  m.ul.position.set(m.off * (1 - sw), -m.off * (1 - sw), arc * .95); m.lr.position.set(-m.off * (1 - sw), m.off * (1 - sw), -arc * .95);
  m.ul.rotation.y = arc * .5; m.lr.rotation.y = arc * .5;
  /* 3 · a third joins them */
  const th = EO(seg(t, .44, .64)); m.ur.visible = th > 0; m.ur.position.set((1 - th) * 2.6, (1 - th) * 1.9, -(1 - th) * 7); m.ur.rotation.y = -(1 - th) * 2.2; m.ur.scale.setScalar(.5 + .5 * th);
  /* 4 · the fourth corner stays open; the colours arrive */
  const col = E(seg(t, .6, .76));
  m.setCol(m.ul, c.copy(m.GREY).lerp(m.GREEN, col)); m.setCol(m.lr, c.copy(m.GREY).lerp(m.GREEN, col)); m.setCol(m.ur, c.copy(m.GREY).lerp(m.TEAL, col));
  m.dash.material.opacity = seg(t, .6, .7) * (1 - seg(t, .9, .97)) * .95; m.dash.visible = m.dash.material.opacity > .01;
  /* 5 · the name completes it */
  const n1 = EO(seg(t, .74, .9)), n2 = EO(seg(t, .79, .95));
  m.ar.visible = n1 > 0; m.ar.material.opacity = n1; m.ar.position.x = -(1 - n1) * 1.1; m.en.visible = n2 > 0; m.en.material.opacity = n2; m.en.position.x = -(1 - n2) * 1.1;
}

/* ---------- the road at dusk ---------- */
export const DUSK = 0x8a6c66;   /* the haze of a Dubai dusk: the colour far things fade into */
export const STUDIO = 0x04181c; /* the room of the mark and the paper: the brand's turquoise, almost black */
export const FACES = [['p-tease-care', 1000, 1579, 'p-ad-care', 1000, 1710], ['p-tease-smile', 1000, 1592, 'p-ad-smile', 1000, 1694], ['p-tease-future', 1000, 1590, 'p-ad-future', 1000, 1665]];   /* butterfly, the boys, the child: the order on the road in the photograph of 12 April */
/* a back-lit box on its post: front, the teaser; back, its revealer. 1.5 m by 3 m, as the media plan gives Al Garhoud Road and as its
   photographs show. The outdoor print files are lost, so each face carries the press artwork, whole, at its own proportion, in the dark frame */
export function boxKit(tex) {
  const BW = 1.5, BH = 3.0, BD = .3, maps = {}; FACES.forEach(f => { maps[f[0]] = tex(f[0] + '.webp'); maps[f[3]] = tex(f[3] + '.webp'); });
  const frameGeo = new T.BoxGeometry(BW + .12, BH + .12, BD), frameM = new T.MeshStandardMaterial({ color: 0x14161a, roughness: .5, metalness: .6 });
  /* ghost: a faint copy of the two faces only, for a floor that mirrors */
  const make = (f, ghost) => { const piv = new T.Group(); if (!ghost) piv.add(new T.Mesh(frameGeo, frameM));
    [[f[0], f[1], f[2], 1], [f[3], f[4], f[5], -1]].forEach(a => { const r = a[2] / a[1], w = Math.min(BW - .03, (BH - .03) / r);
      const m = new T.Mesh(new T.PlaneGeometry(w, w * r), new T.MeshBasicMaterial(Object.assign({ map: maps[a[0]], toneMapped: false, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 }, ghost ? { transparent: true, opacity: ghost, depthWrite: false } : {})));
      m.position.z = a[3] * (BD / 2 + .006); if (a[3] < 0) m.rotation.y = Math.PI; if (ghost) m.renderOrder = 1; piv.add(m); });
    return piv; };
  return { make, BW, BH, BD };
}
export function makeRoad(o) {
  const phone = !!o.phone, g = new T.Group(), R = 260, N = 11, GAPS = 31, S0 = 30, LAT = -5.6, S_A = -90, S_B = 560, kit = o.kit || boxKit(o.tex), BW = kit.BW, BH = kit.BH, BOX_Y = 2.9 + BH / 2;
  const P = (s, lat, y) => { const a = s / R, r = R - lat; return new T.Vector3(R - r * Math.cos(a), y || 0, -r * Math.sin(a)); };
  const heading = s => -s / R, std = p => new T.MeshStandardMaterial(Object.assign({ roughness: .8, metalness: 0 }, p));
  const flat = [], dm = new T.Object3D(), cc = new T.Color();
  let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;

  /* paint, the red and white kerbs of the median, the rails */
  const strip = (lat, w, s0, s1, color, op, dash, gap, y) => { const pos = [], idx = []; let n = 0; const step = dash ? dash + gap : 4, len = dash || 4.02;
    for (let s = s0; s < s1; s += step) { [P(s, lat - w / 2, y), P(s, lat + w / 2, y), P(s + len, lat + w / 2, y), P(s + len, lat - w / 2, y)].forEach(p => pos.push(p.x, p.y, p.z)); idx.push(n, n + 1, n + 2, n, n + 2, n + 3); n += 4; }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({ color, transparent: op < 1, opacity: op, side: T.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); m.renderOrder = 2; m.frustumCulled = false; g.add(m); flat.push(m); return m; };
  strip(0, .14, S_A, S_B, 0xdfe3ea, .45, 3, 9, .012); strip(3.75, .16, S_A, S_B, 0xdfe3ea, .4, 0, 0, .012); strip(-3.75, .16, S_A, S_B, 0xd9b54a, .45, 0, 0, .012);
  strip(-7.45, .16, S_A, S_B, 0xd9b54a, .36, 0, 0, .012); strip(-11.2, .14, S_A, S_B, 0xdfe3ea, .36, 3, 9, .012); strip(-14.95, .16, S_A, S_B, 0xdfe3ea, .3, 0, 0, .012);
  strip(-5.6, 2.3, S_A, S_B, 0x2a2a24, 1, 0, 0, .18);
  { const n = Math.floor((S_B - 20 - S_A) / 1.2), kerb = new T.InstancedMesh(new T.BoxGeometry(.3, .18, 1.2), std({ roughness: .9 }), n * 2); let q = 0;
    [-4.35, -6.85].forEach(lat => { for (let j = 0; j < n; j++) { const s = S_A + j * 1.2; dm.position.copy(P(s, lat, .09)); dm.rotation.set(0, heading(s), 0); dm.updateMatrix(); kerb.setMatrixAt(q, dm.matrix); kerb.setColorAt(q, cc.set(j % 2 ? 0x7a2a26 : 0xa8a59c)); q++; } });
    kerb.frustumCulled = false; g.add(kerb); flat.push(kerb); }
  { const metal = std({ color: 0x5a5e66, roughness: .42, metalness: .7 }), RL = [5.2, -16.4], n = Math.floor((S_B - S_A) / 4) + 1, posts = new T.InstancedMesh(new T.BoxGeometry(.08, .9, .08), metal, n * RL.length); let q = 0;
    RL.forEach(lat => { const pts = []; for (let j = 0; j < n; j++) { const s = S_A + j * 4; pts.push(P(s, lat, 0)); dm.position.copy(P(s, lat, .45)); dm.rotation.set(0, heading(s), 0); dm.updateMatrix(); posts.setMatrixAt(q++, dm.matrix); }
      [.55, .85].forEach(y => { const t = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p => p.clone().setY(y))), 240, .045, 5), metal); t.frustumCulled = false; g.add(t); flat.push(t); }); });
    posts.frustumCulled = false; g.add(posts); flat.push(posts); }

  /* light: small soft discs, and each lamp's faint beam */
  const disc = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.5)'); gr.addColorStop(.6, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return new T.CanvasTexture(c); })();
  const glow = (parent, x, y, z, w, h, color, op, fog) => { const s = new T.Sprite(new T.SpriteMaterial({ map: disc, color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false, fog: fog !== false })); s.position.set(x, y, z); s.scale.set(w, h, 1); parent.add(s); return s; };
  const fogU = { uFogN: { value: 25 }, uFogF: { value: 460 } };
  const coneMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    uniforms: Object.assign({ uC: { value: new T.Color(0xffe6c8) }, uO: { value: .05 } }, fogU),
    vertexShader: 'varying vec3 vN; varying vec3 vW; varying float vV; void main(){ vV = uv.y; vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 uC; uniform float uO; uniform float uFogN; uniform float uFogF; varying vec3 vN; varying vec3 vW; varying float vV; void main(){ vec3 V = normalize(cameraPosition - vW); float e = pow(max(abs(dot(normalize(vN), V)), 1e-4), 2.2); float d = length(cameraPosition - vW); float f = 1. - smoothstep(uFogN, uFogF * 1.4, d); gl_FragColor = vec4(max(uC * uO * e * pow(clamp(vV, 1e-4, 1.), 1.6) * f, vec3(0.)), 1.); }' });

  /* the posts, their twin lamps and their light boxes: the boxes are the brightest things on the road */
  const steel = std({ color: 0x8b9097, roughness: .38, metalness: .78 });
  const poleGeo = new T.CylinderGeometry(.11, .15, 12.5, 18), footGeo = new T.CylinderGeometry(.2, .24, 1.1, 18), armGeo = new T.CylinderGeometry(.03, .045, 2.2, 8), headGeo = new T.SphereGeometry(.34, 18, 10), coneGeo = new T.CylinderGeometry(1.6, 8.5, 12.9, 36, 1, true);
  const headMat = new T.MeshBasicMaterial({ color: new T.Color(0xfff2dc).multiplyScalar(1.4) });
  const boxes = [], lamps = [];
  for (let i = 0; i < N; i++) { const s = S0 + i * GAPS, pg = new T.Group(), f = FACES[i % 3]; pg.position.copy(P(s, LAT, 0)); pg.rotation.y = heading(s); g.add(pg);
    const pole = new T.Mesh(poleGeo, steel); pole.position.y = 6.25; pg.add(pole); const foot = new T.Mesh(footGeo, steel); foot.position.y = .55; pg.add(foot);
    [-1, 1].forEach(d => { const arm = new T.Mesh(armGeo, steel); arm.rotation.z = d * 1.25; arm.position.set(d * 1.02, 12.75, 0); pg.add(arm); const head = new T.Mesh(headGeo, headMat); head.scale.set(.95, .22, .5); head.position.set(d * 2.05, 13.02, 0); pg.add(head); glow(pg, d * 2.05, 13, 0, 1.3, 1.3, 0xfff6e8, .45); });
    const cone = new T.Mesh(coneGeo, coneMat); cone.position.y = 6.5; pg.add(cone);
    lamps.push(P(s, LAT, 13).add(new T.Vector3(o.X || 0, 0, 0)));
    const piv = kit.make(f); piv.position.y = BOX_Y; pg.add(piv);
    const halo = glow(pg, 0, BOX_Y, -.9, 3.4, 5.4, 0x9fd4dc, .1), pool = glow(pg, 0, BOX_Y, 1.2, 3.2, 4.6, 0xdfeeff, .04);
    boxes.push({ piv, halo, pool }); }
  const hemi = o.sky ? new T.HemisphereLight(0x9aa6c8, 0x3a2c20, o.sky) : null; if (hemi) g.add(hemi);
  for (let i = 0; i < 5; i++) { const l = new T.PointLight(0xfff0dc, 40, 60, 1.9); l.position.copy(P(S0 + i * GAPS, LAT, 12.4)).add(new T.Vector3(1.2, 0, 0)); g.add(l); }

  /* date palms on the median and the verges, as in the photographs of both roads */
  { const PALMS = []; for (let i = 0; i < N; i++) PALMS.push([S0 + 15.5 + i * GAPS, LAT, 7 + rnd() * 2]);
    for (let s = -50; s < 520; s += 21 + rnd() * 6) PALMS.push([s, 9.5 + rnd() * 2, 7.5 + rnd() * 3]);
    for (let s = -40; s < 520; s += 24 + rnd() * 8) PALMS.push([s, -20.5 - rnd() * 3, 7 + rnd() * 3]);
    const trunkGeo = new T.CylinderGeometry(.13, .24, 1, 8); trunkGeo.translate(0, .5, 0);
    /* a frond: a long leaf, widest a third of the way out, bending down under its own weight */
    const FL = 3.6, fr = new T.PlaneGeometry(FL, 1, 12, 2); fr.rotateX(-Math.PI / 2); fr.translate(FL / 2, 0, 0);
    { const p = fr.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), u = x / FL, wdt = .95 * Math.sin(Math.PI * Math.pow(u, .7)) * (1 - .25 * u); p.setY(i, .55 * u - 1.6 * u * u - Math.abs(p.getZ(i)) * .35); p.setZ(i, p.getZ(i) * wdt); } fr.computeVertexNormals(); }
    const trunks = new T.InstancedMesh(trunkGeo, std({ color: 0x4a3e33, roughness: .95 }), PALMS.length), FR = 16, fronds = new T.InstancedMesh(fr, std({ color: 0x3a4a2c, roughness: .85, side: T.DoubleSide }), PALMS.length * FR);
    dm.rotation.order = 'YZX'; let q = 0;
    PALMS.forEach((pm, i) => { const base = P(pm[0], pm[1], 0), h = pm[2], lean = (rnd() - .5) * .12; dm.position.copy(base); dm.rotation.set(0, rnd() * 6.28, lean); dm.scale.set(1, h, 1); dm.updateMatrix(); trunks.setMatrixAt(i, dm.matrix);
      const top = base.clone().add(new T.Vector3(Math.sin(lean) * -h, h * Math.cos(lean), 0));
      for (let k = 0; k < FR; k++) { const up = k % 2 ? .45 : -.05; dm.position.copy(top); dm.rotation.set(0, k * 6.283 / FR + rnd() * .25, up + (rnd() - .5) * .3); const sc = (k % 2 ? .75 : 1) * (.85 + rnd() * .3); dm.scale.set(sc, sc, sc); dm.updateMatrix(); fronds.setMatrixAt(q++, dm.matrix); fronds.setColorAt(q - 1, cc.setHSL(.24 + rnd() * .04, .25, .2 + rnd() * .08)); } });
    dm.rotation.order = 'XYZ'; dm.scale.set(1, 1, 1);
    trunks.frustumCulled = fronds.frustumCulled = false; g.add(trunks, fronds); }

  /* the city low on the horizon, in the dusk haze */
  { const n = 60, bl = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), std({ color: 0x1c2230, roughness: .9 }), n);
    for (let i = 0; i < n; i++) { const s = 330 + rnd() * 260, lat = (rnd() < .5 ? -1 : 1) * (40 + rnd() * 240), h = 8 + Math.pow(rnd(), 2) * 55, w = 14 + rnd() * 30; dm.position.copy(P(s, lat, h / 2)); dm.rotation.set(0, heading(s), 0); dm.scale.set(w, h, 12 + rnd() * 20); dm.updateMatrix(); bl.setMatrixAt(i, dm.matrix); }
    dm.scale.set(1, 1, 1); bl.frustumCulled = false; g.add(bl);
    for (let i = 0; i < (phone ? 40 : 70); i++) { const s = 300 + rnd() * 300, lat = (rnd() - .5) * 520, y = 2 + Math.pow(rnd(), 2) * 30, sz = 1 + rnd() * 2; const p = P(s, lat, y); glow(g, p.x, p.y, p.z, sz, sz, [0xffd9a0, 0xfff1dc, 0xbfd8ff][i % 3], .12 + rnd() * .22); } }

  /* traffic as moving light: tail lights going away on this side, headlights coming on the far side */
  const trails = [];
  const trail = (lat, y, color, k, r, s0, s1, sp, n, ph) => { const pts = []; for (let s = s0; s <= s1; s += 6) pts.push(P(s, lat, y)); const c = new T.CatmullRomCurve3(pts);
    const mk = (rad, op) => { const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: Object.assign({ uC: { value: new T.Color(color) }, uT: { value: 0 }, uN: { value: n }, uSp: { value: sp }, uPh: { value: ph }, uK: { value: k * op } }, fogU),
      vertexShader: 'varying vec2 vUv; varying float vD; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vD = -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uC; uniform float uT; uniform float uN; uniform float uSp; uniform float uPh; uniform float uK; uniform float uFogN; uniform float uFogF; varying vec2 vUv; varying float vD; void main(){ float p = fract(vUv.x * uN - uT * uSp + uPh); float a = pow(p, 4.); gl_FragColor = vec4(uC * (.1 + a) * uK * (1. - smoothstep(uFogN, uFogF, vD)), 1.); }' });
      const t = new T.Mesh(new T.TubeGeometry(c, 240, rad, 6), m); t.frustumCulled = false; g.add(t); trails.push(m); };
    mk(r, 1); mk(r * 4, .06); };
  [[1.5, .78, .05, 3, 0], [2.7, .8, .04, 2, .4]].forEach(t => trail(t[0], t[1], 0xff2414, 1.2, .02, 46, 520, t[2], t[3], t[4]));
  [[-9.0, .7, -.07, 3, .2], [-10.35, .72, -.06, 2, .6]].forEach(t => trail(t[0], t[1], 0xfff3dc, 1.1, .015, -80, 520, t[2], t[3], t[4]));

  /* the road surface: dry asphalt with a faint sheen (the scene drawn once from below the road, softened a lot), sand beyond the kerbs */
  const NL = N, TAPS = phone ? 6 : 12;
  const roadMat = new T.ShaderMaterial({
    uniforms: Object.assign({ tR: { value: null }, uM: { value: new T.Matrix4() }, uFogC: { value: new T.Color(DUSK) }, uL: { value: lamps }, uLI: { value: 4 }, uK: { value: .45 }, uBlur: { value: 1.3 }, uWet: { value: .12 }, uCx: { value: new T.Vector2(R + (o.X || 0), 0) }, uR: { value: R }, uSand: { value: new T.Color(0x6e5a44) } }, fogU),
    vertexShader: 'uniform mat4 uM; varying vec4 vR; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vR = uM * w; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform sampler2D tR; uniform vec3 uFogC; uniform float uFogN; uniform float uFogF; uniform vec3 uL[${NL}]; uniform float uLI; uniform float uK; uniform float uBlur; uniform float uWet; uniform vec2 uCx; uniform float uR; uniform vec3 uSand; varying vec4 vR; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = .5, s = 0.; for(int i=0;i<4;i++){ s += a*n(p); p *= 2.03; a *= .5; } return s; }
      void main(){
        vec3 V = normalize(cameraPosition - vW); float d = length(cameraPosition - vW);
        float lat = uR - length(vW.xz - uCx), asph = smoothstep(-18.4, -17.6, lat) * (1. - smoothstep(6.0, 6.8, lat));
        float fres = pow(1. - clamp(V.y, 0., 1.), 3.);
        float wet = mix(.6, 1., smoothstep(.3, .7, fbm(vW.xz * .05 + 3.))) * uWet;
        float grain = n(vW.xz * 16.) * .6 + n(vW.xz * 53.) * .4;
        vec2 uv = vR.xy / vR.w;
        float len = mix(.2, .03, wet) * uBlur, jit = mix(.03, .0026, wet) * uBlur;
        vec3 refl = vec3(0.); float ws = 0.;
        float ph = h(gl_FragCoord.xy * .73 + 1.7) - .5;
        for(int i=-${TAPS};i<=${TAPS};i++){ float fi = float(i); float t = (fi + ph)/${TAPS}.; float w = 1. - abs(t)*.9; vec2 o = vec2((fract(fi*.61803 + ph*.37) - .5) * jit * 2., t*len); vec3 c = texture2D(tR, clamp(uv + o, 0., 1.)).rgb; if (c.r == c.r && c.g == c.g && c.b == c.b) { refl += min(c, vec3(24.)) * w; ws += w; } }
        refl = max(refl / max(ws, 1e-4), vec3(0.));
        float k = mix(.3, .92, wet) * mix(.15, 1., fres) * uK * asph;
        vec3 tar = vec3(.05, .051, .056) * (.6 + .8*grain), sand = uSand * (.55 + .55 * fbm(vW.xz * .07)) * (.85 + .3*grain);
        vec3 base = mix(sand, tar, asph);
        vec3 pool = vec3(0.); for(int i=0;i<${NL};i++){ vec3 L = uL[i] - vW; float r2 = dot(L, L); pool += vec3(1., .9, .76) * (uLI / (1. + r2*.03)) * clamp(L.y / sqrt(r2), 0., 1.); }
        vec3 col = base * (1. + pool) + refl * k;
        col = mix(col, uFogC, smoothstep(uFogN, uFogF, d));
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` });
  const road = new T.Mesh(new T.PlaneGeometry(3000, 3000), roadMat); road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -900); road.frustumCulled = false; g.add(road); flat.push(road);

  const vcam = new T.PerspectiveCamera(); vcam.matrixAutoUpdate = false; vcam.matrixWorldAutoUpdate = false;
  const Rm = new T.Matrix4().makeScale(1, -1, 1), Sx = new T.Matrix4().makeScale(-1, 1, 1), bias = new T.Matrix4().set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), sz = new T.Vector2(), RS = phone ? .35 : .45;
  let rt = null;
  /* once a frame, before the picture is drawn: the mirrored view for the sheen, and the time for the traffic */
  function update(renderer, scene, cam, time) {
    renderer.getDrawingBufferSize(sz); const w = Math.max(2, Math.round(sz.x * RS)), hgt = Math.max(2, Math.round(sz.y * RS));
    if (!rt || rt.width !== w || rt.height !== hgt) { if (rt) rt.dispose(); rt = new T.WebGLRenderTarget(w, hgt, { type: T.HalfFloatType, samples: phone ? 0 : 4 }); roadMat.uniforms.tR.value = rt.texture; }
    if (scene.fog) { fogU.uFogN.value = scene.fog.near; fogU.uFogF.value = scene.fog.far; roadMat.uniforms.uFogC.value.copy(scene.fog.color); }
    trails.forEach(m => { m.uniforms.uT.value = time; });
    cam.updateMatrixWorld();
    vcam.matrix.copy(Rm).multiply(cam.matrixWorld).multiply(Sx); vcam.matrixWorld.copy(vcam.matrix); vcam.matrixWorldInverse.copy(vcam.matrixWorld).invert();
    vcam.projectionMatrix.copy(Sx).multiply(cam.projectionMatrix).multiply(Sx); vcam.projectionMatrixInverse.copy(vcam.projectionMatrix).invert();
    roadMat.uniforms.uM.value.copy(bias).multiply(vcam.projectionMatrix).multiply(vcam.matrixWorldInverse);
    const prev = renderer.getRenderTarget(), sh = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false;
    flat.forEach(m => { m.visible = false; });
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, vcam); renderer.setRenderTarget(prev);
    flat.forEach(m => { m.visible = true; }); renderer.shadowMap.autoUpdate = sh;
  }
  /* u from 0 to 1: the boxes turn, one after another down the road, from the teaser to the revealer (used by the opening film only) */
  const cA = new T.Color(0x9fd4dc), cB = new T.Color(0xd6eaff);
  function turn(u) { boxes.forEach((b, i) => { const t = E(seg(u, i * .06, i * .06 + .4)); b.piv.rotation.y = t * Math.PI; b.halo.material.color.copy(cA).lerp(cB, t); b.halo.material.opacity = lerp(.1, .14, t) * (1 - .5 * Math.sin(t * Math.PI)); }); }
  turn(0);
  return { g, P, heading, update, turn, boxes, kit, hemi, N, S0, GAPS, LAT, BOX_Y, BH, BW };
}
export function duskSky(hz) { const cv = document.createElement('canvas'); cv.width = 8; cv.height = 512; const x = cv.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 512);
  [[0, '#070a1c'], [.2, '#121a3a'], [.34, '#2a3058'], [.42, '#56506e'], [.46, '#8a6a72'], [.485, '#b98470'], [.497, '#c99272'], [.5, 'HZ'], [1, 'HZ']].forEach(k => gr.addColorStop(k[0], k[1] === 'HZ' ? (hz || '#a07a6c') : k[1])); x.fillStyle = gr; x.fillRect(0, 0, 8, 512);
  const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.mapping = T.EquirectangularReflectionMapping; return t; }

/* a label lying on the floor, set in the page's own type */
export function floorLabel(text, sub, w, accent) { const c = document.createElement('canvas'); c.width = 1024; c.height = 220; const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.font = '600 88px Jost, system-ui, sans-serif'; x.textBaseline = 'alphabetic'; x.fillText(text, 6, 96);
  if (sub) { x.fillStyle = accent || '#8CC63F'; x.font = '500 58px Inter, system-ui, sans-serif'; x.fillText(sub, 8, 180); }
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
  const m = new T.Mesh(new T.PlaneGeometry(w, w * 220 / 1024), new T.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false, fog: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 5; return m; }

/* ---------- the page's own chapter ---------- */
const sec = document.querySelector('.fp-model'), FP = window.FP;
/* with reduced motion the opening film waits; it then waits on the finished logo, not on its first dark frame */
if (FP && FP.rm) { const hv = document.querySelector('.fp-hero video'), st = hv && ((FP.phone() && hv.dataset.stillP) || hv.dataset.still); if (st) hv.poster = st; }
const S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.04, fog: STUDIO, floorColor: 0x07222a, floorRough: .5, mirrorK: 0 });
if (S) boot();

async function boot() {
  const { station, scene, cam, renderer } = S, PH = FP.phone(), XR = 5000;
  const M = await (await fetch('a/3d/mark.json')).json();
  try { await Promise.all([document.fonts.load('600 88px Jost'), document.fonts.load('500 58px Inter')]); } catch (e) {}
  cam.near = .4; cam.far = 1400; cam.updateProjectionMatrix();
  const hemi = scene.children.find(c => c.isHemisphereLight), hemi0 = hemi ? hemi.intensity : 0;
  const quiet = { noMirror: true, keyK: .6 }, studio = new T.Color(STUDIO);
  const wp = new T.Vector3(), wt = new T.Vector3(), te = new T.Vector3(), UP = new T.Vector3(0, 1, 0), K = PH ? 1.85 : 1;
  /* paper on the floor of the studio: a page of the artwork, whole, with a little thickness and its own soft shadow */
  const edge = S.std({ color: 0xbfc4c2, roughness: .9 });
  const sheet = (parent, file, w, h, x, z, ry) => { const grp = new T.Group(); grp.position.set(x, 0, z); grp.rotation.y = ry || 0; parent.add(grp);
    const b = new T.Mesh(new T.BoxGeometry(w, .014, h), edge); b.position.y = .007; grp.add(b);
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: S.tex(file), toneMapped: false, color: 0xe9eded })); m.rotation.x = -Math.PI / 2; m.position.y = .0145; grp.add(m);
    S.blob(parent, x + .05, z + .12, w * 1.22, h * 1.3, .55); return grp; };
  /* a camera path through key views. A view is [target, width to fill, share of the frame's width, pitch, yaw]: the distance is worked out from the lens each frame, so desktop and phone both frame it right */
  const hfov = () => 2 * Math.atan(Math.tan(cam.fov * Math.PI / 360) * cam.aspect);
  const place = (v, gx, P, Q) => { const d = v[1] / 2 / Math.tan(hfov() / 2) / v[2], p = v[3], y = v[4] || 0; Q.copy(v[0]); Q.x += gx; P.set(Q.x + Math.sin(y) * Math.cos(p) * d, Q.y + Math.sin(p) * d, Q.z + Math.cos(y) * Math.cos(p) * d); };
  const pA = new T.Vector3(), tA = new T.Vector3(), pB = new T.Vector3(), tB = new T.Vector3();
  const path = (keys, l, gx) => { const n = keys.length - 1, u = clamp(l, 0, .999) * n, i = Math.floor(u), f = E(u - i); place(keys[i], gx, pA, tA); place(keys[i + 1], gx, pB, tB); cam.position.copy(pA).lerp(pB, f); wt.copy(tA).lerp(tB, f); cam.lookAt(wt); };
  const V = (x, y, z) => new T.Vector3(x, y, z);

  /* 1 · draw many, choose one: our three presentations and the final deck, laid on the floor in date order. Their own pages, whole */
  const XP = -200, A3 = [2.1, 1.485], G = .22, Z0 = 1.0, grid = (g, files, x0, z0, cols, w, h, gap) => files.forEach((f, k) => sheet(g, f, w, h, x0 + (k % cols) * (w + gap) + w / 2, z0 + Math.floor(k / cols) * (h + gap) + h / 2));
  const GX = [-17.0, -9.26, -1.52, 3.88], SW = 4.4, SH = SW / 1.4142, SMW = (SW - 2 * .18) / 3, SMH = SMW / 1.4142, STZ = Z0 + 2 * SMH + .18 + G + SH / 2;
  const s0 = station(XP, Object.assign({}, quiet, { c: [-4.35, 0, 3.6], rx: 13.6, ry: 4.6, yaw: 0, yawp: 0, pitch: .95, drift: 0, fx: .95, fy: .8, ox: -.13, oy: .02, fxp: 1.1, fyp: .4, oxp: 0, oyp: .16, keyK: .35, w: 1.6 }));
  const nS = () => s0.g.children.filter(c => c.isGroup).length, pick = (a, b) => s0.g.children.filter(c => c.isGroup).slice(a, b);
  let EARLY, STAR, DECK;
  { const g = s0.g;
    grid(g, [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => 'p1-' + i + '.webp'), GX[0], Z0, 3, A3[0], A3[1], G);
    grid(g, [1, 10, 2, 3, 4, 5, 6, 7, 8, 9].map(i => 'p2-' + i + '.webp'), GX[1], Z0, 3, A3[0], A3[1], G);
    grid(g, [1, 2, 3, 4, 6, 8].map(i => 'p3-' + i + '.webp'), GX[2], Z0, 3, SMW, SMH, .18);
    const n0 = nS(); sheet(g, 'p3-9.webp', SW, SH, GX[2] + SW / 2, STZ); STAR = pick(n0, n0 + 1);
    [['p3-16', 350 / 491], ['p3-20', 350 / 497]].forEach((a, k) => { const h = 1.25, w = h * a[1]; sheet(g, a[0] + '.webp', w, h, GX[2] + k * (w + .18) + w / 2, STZ + SH / 2 + G + h / 2); });
    const n1 = nS(); grid(g, ['d-146', 'd-148', 'd-149', 'd-150', 'd-151', 'd-152'].map(f => f + '.webp'), GX[3], Z0, 2, A3[0], A3[1], G); DECK = pick(n1, nS());
    EARLY = pick(0, n1).filter(c => STAR.indexOf(c) < 0);
    [['30 December 2007', 'First presentation'], ['2 January 2008', 'Second presentation'], ['10 January 2008', 'Third: the star appears'], ['20 January 2008', 'The final deck']].forEach((a, k) => { const m = floorLabel(a[0], a[1], 5.6); m.position.set(GX[k] + 2.8, .02, .2); g.add(m); }); }
  const PAPER = new T.Color(0xe9eded), DIM = new T.Color(0x081214), pc = new T.Color();
  const lit = (list, k) => { pc.copy(PAPER).lerp(DIM, k); list.forEach(gp => gp.children[1].material.color.copy(pc)); };
  const choose = l => { const a = E(seg(l, .38, .58)), b = E(seg(l, .7, .88)); lit(EARLY, a * .96); lit(DECK, a * .96 * (1 - b)); lit(STAR, b * .96); };
  const KP = PH ? [[V(-13.63, 0, 2.7), 6.9, .76, 1.02], [V(-5.89, 0, 3.4), 6.9, .76, 1.02], [V(.68, 0, STZ - .3), SW, .8, 1.12], [V(6.09, 0, 2.8), 4.5, .8, 1.02]]
               : [[V(-4.35, 0, 3.7), 25.6, .68, .98], [V(-9.76, 0, 3.9), 14.8, .7, .92], [V(.68, 0, STZ - .2), SW, .42, 1.1], [V(6.09, 0, 2.4), 4.5, .44, 1.0]];

  /* 2 · the mark, in its own five steps */
  const Y0 = 3.05, mark = makeMark(M, { size: 4.4 }), CXM = (mark.x0 + mark.x1) / 2, HW = (mark.x1 - mark.x0) / 2;
  const s1 = station(0, Object.assign({}, quiet, { c: [CXM, Y0 - .1, 0], rx: HW + .5, ry: 2.7, yaw: -.19, pitch: -.04, drift: .46, w: 1.25, fx: .78, fy: .5, ox: -.02, oy: .09, fxp: .94, fyp: .3, oxp: 0, oyp: .16, yawp: -.19 }));
  mark.g.position.set(0, Y0, 0); s1.g.add(mark.g);
  /* its faint reflection in the floor: the same pieces, upside down */
  const mir = new T.Group(); mir.scale.y = -1; mir.position.set(0, -Y0, 0); s1.g.add(mir);
  const twins = [mark.ul, mark.ur, mark.lr, mark.leaf].map(src => { const t = new T.Mesh(src.geometry, new T.MeshBasicMaterial({ transparent: true, opacity: .5, depthWrite: false, side: T.DoubleSide, toneMapped: false })); t.renderOrder = 1; mir.add(t); return { src, t }; });
  S.blob(s1.g, 0, .2, 6.5, 2.4, .5);
  const stepMark = t => { markSteps(mark, t); twins.forEach(p => { p.t.position.copy(p.src.position); p.t.rotation.copy(p.src.rotation); p.t.scale.copy(p.src.scale); p.t.visible = p.src.visible; const f = p.src.material[0]; p.t.material.color.copy(f.color); p.t.material.opacity = .5 * (f.transparent ? f.opacity : 1); }); };

  /* 3 · the manual: seven pages that carry the idea, standing in a shallow curve like boards on a wall. The camera tracks along them at eye level */
  const XM = 200, MP = ['k-01', 'k-09', 'k-11', 'k-18', 'k-26', 'k-52', 'k-79'], BWm = 3.0, BHm = BWm / 1.4134, MB = .18;
  const s2 = station(XM, { c: [0, BHm / 2 + MB, .5], rx: 12, ry: 2.2, yaw: 0, yawp: 0, pitch: .05, drift: 0, fx: .96, fy: .8, ox: 0, oy: .05, fxp: 1.1, fyp: .36, oxp: 0, oyp: .16, keyK: .5, w: 1.6 });
  const MX = k => (k - 3) * 3.42, MZ = k => .13 * (k - 3) * (k - 3), MR = k => -Math.atan(.26 * (k - 3) / 3.42);
  const backM = S.std({ color: 0x0b2a30, roughness: .6 });
  MP.forEach((f, k) => { const b = new T.Group(); b.position.set(MX(k), MB, MZ(k)); b.rotation.y = MR(k); s2.g.add(b);
    const slab = new T.Mesh(new T.BoxGeometry(BWm + .04, BHm + .04, .05), backM); slab.position.set(0, BHm / 2, -.03); b.add(slab);
    const m = new T.Mesh(new T.PlaneGeometry(BWm, BHm), new T.MeshBasicMaterial({ map: S.tex('a/' + f + '.webp'), toneMapped: false, color: 0xe2e7e7 })); m.position.set(0, BHm / 2, .0); b.add(m);
    const foot = new T.Mesh(new T.BoxGeometry(BWm * .6, MB, .5), backM); foot.position.set(0, -MB / 2, -.1); b.add(foot);
    S.blob(s2.g, MX(k), MZ(k) - .05, BWm * 1.25, 1.1, .6); });
  const bv = (k, wid, frac, p, extra) => [V(MX(k) + (extra || 0), MB + BHm * .5, MZ(k)), wid, frac, p, MR(k)];
  const KM = PH ? [bv(0, BWm, .86, .08), bv(2, BWm, .86, .08), bv(3, BWm, .86, .08), bv(4, BWm, .86, .08), bv(6, BWm, .86, .08)]
               : [bv(0, BWm * 2.1, .7, .1, 1.7), bv(2, BWm * 1.6, .62, .06), bv(3, BWm * 1.6, .62, .06), bv(3, 7 * 3.42, .88, .16)];

  /* 4 · the three pictures of the launch, close: three back-lit boxes. The camera walks round them: on the front the teasers, on the back the same pictures in colour, with the logo */
  const kit = boxKit(S.tex), BY = .85 + kit.BH / 2;
  const s3 = station(400, Object.assign({}, quiet, { c: [0, BY - .05, 0], rx: 3.05, ry: 2.2, yaw: Math.PI / 2, yawp: Math.PI / 2, pitch: -.02, drift: (Math.PI + .56) / .8, w: 1.5, fx: .58, fy: .8, ox: -.1, oy: .05, fxp: .9, fyp: .36, oxp: 0, oyp: .17, keyK: .3 }));
  const postM = S.std({ color: 0x8b9097, roughness: .38, metalness: .78 }), halo = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
  const tg = new T.Group(); s3.g.add(tg);
  [FACES[1], FACES[0], FACES[2]].forEach((f, n) => { const grp = new T.Group(); grp.position.set((n - 1) * 1.9, 0, n === 1 ? 0 : .22); grp.rotation.y = (1 - n) * .12; tg.add(grp);
    const post = new T.Mesh(new T.CylinderGeometry(.055, .055, BY + kit.BH / 2 + .16, 16), postM); post.position.y = (BY + kit.BH / 2 + .16) / 2; grp.add(post);
    const foot = new T.Mesh(new T.CylinderGeometry(.36, .38, .04, 28), postM); foot.position.y = .02; foot.receiveShadow = true; grp.add(foot);
    const piv = kit.make(f); piv.position.y = BY; grp.add(piv);
    const mg = new T.Group(); mg.scale.y = -1; grp.add(mg); const gp = kit.make(f, .13); gp.position.y = BY; mg.add(gp);
    [[.5, 0x9fd4dc], [-.5, 0xd6eaff]].forEach(a => { const gl = new T.Sprite(new T.SpriteMaterial({ map: halo, color: a[1], transparent: true, opacity: .06, blending: T.AdditiveBlending, depthWrite: false })); gl.position.set(0, BY, a[0]); gl.scale.set(4.2, 6, 1); grp.add(gl); });
    S.blob(tg, grp.position.x, grp.position.z, 2.1, 1.1, .55); });

  /* 5 and 6 · the road at dusk, before the name and after it */
  const road = makeRoad({ kit, phone: PH, X: XR, sky: 1.1 }), sky = duskSky(), RP = (s, lat, y) => road.P(s, lat, y);
  const VF = (PH ? 44 : 34) * Math.PI / 360, aim = (c, t, fy) => { const d = c.distanceTo(t), yaw = Math.atan2(c.x - t.x, c.z - t.z); return { c: [t.x, t.y, t.z], yaw, yawp: yaw, pitch: Math.asin((c.y - t.y) / d) - .05, ry: d * Math.tan(VF) * fy, fy, fyp: fy, rx: 160, fx: 1e4, rxp: 160, fxp: 1e4, ox: 0, oy: 0, oxp: 0, oyp: 0, drift: 0 }; };
  const SHOT = PH ? [[RP(6, -2.4, 1.5), RP(14, -2.9, 1.6), RP(30, -5.6, 4.3), RP(30, -5.6, 4.3)], [RP(11, -2.7, 1.6), RP(15.5, -2.4, 1.7), RP(30, -5.6, 4.4), RP(31, -5.5, 4.4)]]
                  : [[RP(3, -1.5, 1.5), RP(15, -2.0, 1.6), RP(36, -4.6, 3.9), RP(35, -4.9, 4.1)], [RP(12.5, -2.1, 1.6), RP(16.5, -1.1, 1.8), RP(33, -5.0, 4.3), RP(42, -5.2, 4.5)]];
  const s4 = station(XR, Object.assign({}, quiet, aim(SHOT[0][1], SHOT[0][3], .7), { keyK: .02, w: 1.3 }));
  station(XR, Object.assign({}, quiet, aim(SHOT[1][1], SHOT[1][3], .7), { keyK: .02, w: 1.5 }));
  s4.g.add(road.g);

  /* one look per place: the brand's dark turquoise room for the paper, the mark and the boxes; dusk for the road */
  let dusk = null;
  function look(n) { if (n === dusk) return; dusk = n; scene.background = n ? sky : studio; scene.fog.color.set(n ? DUSK : STUDIO); if (hemi) hemi.intensity = n ? 0 : hemi0; road.hemi.visible = !!n; renderer.toneMappingExposure = n ? 1.08 : 1.04; }
  function compose(i, l, time, still) {
    stepMark(i === 1 ? seg(l, .03, .9) : i < 1 ? 0 : 1);
    choose(i === 0 ? l : 1);
    tg.rotation.y = still ? -Math.PI / 2 : 0;   /* with reduced motion the camera does not walk: the boxes show their colour side */
    look(i >= 4);
    if (!still) {
      if (i === 0) path(KP, seg(l, 0, .92), XP);
      if (i === 1) { const w = E(seg(seg(l, .03, .9), .5, .86)); te.set(s1.x + s1.c[0], s1.c[1], s1.c[2]); wp.copy(cam.position).sub(te).multiplyScalar(lerp(PH ? .45 : .82, 1, w)); wt.set(0, Y0, 0).lerp(te, w); cam.position.copy(wt).add(wp); cam.lookAt(wt); }
      if (i === 2) path(KM, seg(l, 0, .92), XM);
      /* the walk round the three boxes: long on the front and on the back, quick past the edge */
      if (i === 3) { const u = Math.min(l, .8) / .8, d = (E(u) - u) * s3.drift * .8; te.set(s3.x + s3.c[0], s3.c[1], s3.c[2]); wp.copy(cam.position).sub(te).applyAxisAngle(UP, d); cam.position.copy(te).add(wp); cam.lookAt(te); }
      if (i >= 4) { const sh = SHOT[i - 4], u = E(seg(l, 0, .46)); wp.copy(sh[0]).lerp(sh[1], u); wp.x += XR; wt.copy(sh[2]).lerp(sh[3], u); wt.x += XR; cam.position.copy(wp); cam.lookAt(wt); scene.fog.near = 25; scene.fog.far = 460; }
    }
    if (i >= 4) { road.turn(i === 4 ? 0 : 1); road.update(renderer, scene, cam, time); }
  }
  /* on the page's road the pictures are teasers at stop 05 and have changed by stop 06, behind the photographs: the turn itself is shown once, in the opening film */
  compose(0, 0, 0, true);
  S.onFrame((time, i, local) => compose(i, local, time, false));
  /* with reduced motion the engine holds a still per stop: each stop shows its finished state */
  if (FP.rm) (function hold() { const r = sec.getBoundingClientRect(); if (r.top < innerHeight * 1.2 && r.bottom > -innerHeight * .2 && S.isReady()) { const on = sec.querySelector('.st.on'); compose(on ? +on.dataset.s : 0, .93, 0, true); } requestAnimationFrame(hold); })();
  S.ready();
}

/* ---------- the vote: a point for each of almost 1,000 votes, gathering into the star as the result comes into view ---------- */
const vote = document.querySelector('.dh-vote canvas');
if (vote) (async () => {
  const M = await (await fetch('a/3d/mark.json')).json(), x = vote.getContext('2d'), N = 960;
  const pieces = [['ul', M.green], ['ur', M.teal], ['lr', M.green]].map(a => [new Path2D(M[a[0]]), a[1]]);
  const X0 = 630.488, X1 = 748.062, Y0 = 620.09, Y1 = 737.66, SZ = Math.max(X1 - X0, Y1 - Y0);
  let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647, P = [];
  while (P.length < N) { const px = X0 + rnd() * (X1 - X0), py = Y0 + rnd() * (Y1 - Y0); for (const [p, c] of pieces) if (x.isPointInPath(p, px, py)) { P.push({ tx: (px - X0) / SZ, ty: (py - Y0) / SZ, c, sx: rnd(), sy: rnd(), d: rnd() }); break; } }
  const rm = window.FP ? window.FP.rm : matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, want = 0;
  function draw() { want = 0; const r = vote.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (w < 2 || h < 2) return; if (w !== W || h !== H) { W = vote.width = w; H = vote.height = h; }
    const p = rm ? 1 : clamp((innerHeight * .95 - r.top) / (innerHeight * .62), 0, 1), m = .08 * W, s = W - 2 * m, rad = Math.max(1.2, W * .0052);
    x.clearRect(0, 0, W, H);
    for (const q of P) { const k = E(seg(p, q.d * .45, q.d * .45 + .55)), px = lerp(q.sx * W, m + q.tx * s, k), py = lerp(q.sy * H, m + q.ty * s, k);
      x.globalAlpha = .45 + .55 * k; x.fillStyle = q.c; x.beginPath(); x.arc(px, py, rad, 0, 6.2832); x.fill(); }
    x.globalAlpha = 1; }
  const ask = () => { if (!want) { want = 1; requestAnimationFrame(draw); } };
  addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask); ask();
})();
