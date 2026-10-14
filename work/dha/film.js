/* The opening film of the Dubai Health Authority page, drawn frame by frame from the page's own models (dh.js). Made for this portfolio.
   Part one, the mark: one thin line of light draws the outline of the star ("For a brighter and healthier future, DHA is clear as light",
   our manual, section 1.1); three wings open out of it, the way a butterfly opens (Tony's own account of the pitch film: sun rays, a flower,
   wings, a butterfly); the fourth corner stays open as a broken line; the name takes it. Outlines and colours: the manual's.
   Part two, the launch, on a straight cut: a dry road at dusk; the boxes carry the three teasers, then turn, one after another, to the
   three revealers. Then the record: photograph 162, Jumeirah Beach Road, April 2008, whole.
   The film's 3D is not a record of 2008. The page says so beside the film, and names the photograph when it comes. */
import { T, makeMark, makeRoad, duskSky, DUSK, E, EO, seg, lerp } from './dh.js';

const Q = new URLSearchParams(location.search), num = (k, d) => (Q.has(k) ? parseFloat(Q.get(k)) : d);
const W = num('w', 1600), H = num('h', 900), SS = num('ss', 2), ASP = W / H, TALL = ASP < 1.2;
const canvas = document.querySelector('canvas'), ph = document.getElementById('ph');
const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(SS); renderer.setSize(W, H, false); canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
renderer.toneMapping = T.ACESFilmicToneMapping; renderer.outputColorSpace = T.SRGBColorSpace; renderer.localClippingEnabled = true;
const loader = new T.TextureLoader(), tex = f => { const t = loader.load('a/3d/' + f); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 16; return t; };
const T_MARK = 8.8, T_PH = 16.0, T_END = 21.0;

/* ---------- part one: the mark, on the brand's own turquoise, almost black ---------- */
const A = new T.Scene(), camA = new T.PerspectiveCamera(30, ASP, .2, 300);
A.background = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d'), g = x.createRadialGradient(256, 236, 0, 256, 256, 400);
  g.addColorStop(0, '#0a2c32'); g.addColorStop(.55, '#05191d'); g.addColorStop(1, '#020c0e'); x.fillStyle = g; x.fillRect(0, 0, 512, 512); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; })();
const M = await (await fetch('a/3d/mark.json')).json(), mark = makeMark(M, { size: 4.4 });
A.add(mark.g); mark.leaf.visible = false; mark.dash.visible = false;
A.add(new T.HemisphereLight(0xffffff, 0x0c0c12, .35));
const CXM = (mark.x0 + mark.x1) / 2, HW = (mark.x1 - mark.x0) / 2, WHITE = new T.Color(0xffffff), col = new T.Color();
/* the outline of the star, as the launch pictures draw it: one fine line of light */
const tube = pts => { const p = pts.slice(); if (p[0].distanceTo(p[p.length - 1]) < 1e-4) p.pop(); const c = new T.CatmullRomCurve3(p, true, 'centripetal'), m = new T.Mesh(new T.TubeGeometry(c, 360, .012, 6, true), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false })); m.userData.n = m.geometry.index.count; m.userData.c = c; A.add(m); return m; };
const TU = [tube(mark.lines.ul), tube(mark.lines.ur), tube(mark.lines.lr), tube(mark.lines.ll)];
const dashes = []; { const c = TU[3].userData.c, K = 30; for (let k = 0; k < K; k++) { const pts = []; for (let j = 0; j <= 6; j++) pts.push(c.getPointAt((k + j / 6 * .55) / K)); const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 8, .013, 5, false), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false })); A.add(m); dashes.push(m); } }
/* the name is uncovered from the star outwards */
const clipA = new T.Plane(new T.Vector3(1, 0, 0), 0), clipE = new T.Plane(new T.Vector3(1, 0, 0), 0);
mark.ar.material.clippingPlanes = [clipA]; mark.en.material.clippingPlanes = [clipE];
const NX1 = mark.x0 + (678.6 - 438.1) * mark.k + .1, NX0 = mark.x0 - .1;

function partOne(t) {
  /* the line draws the four corners, one after another */
  TU.forEach((m, n) => { const d = E(seg(t, .2 + n * .22, 1.9 + n * .22)); m.geometry.setDrawRange(0, Math.floor(m.userData.n * d / 6) * 6); m.material.opacity = seg(d, 0, .04) * (1 - seg(t, 3.4, 4.4)) * (n === 3 ? (1 - seg(t, 3.2, 3.7)) : 1); m.visible = m.material.opacity > .003; });
  /* three wings open out of it: two like a butterfly, the third like a petal */
  const o1 = EO(seg(t, 2.0, 3.7)), f1 = Math.sin(seg(t, 3.4, 5.2) * Math.PI * 3) * .15 * (1 - seg(t, 3.4, 5.2));
  const o2 = EO(seg(t, 2.6, 4.3)), f2 = Math.sin(seg(t, 4.0, 5.6) * Math.PI * 2) * .1 * (1 - seg(t, 4.0, 5.6));
  const a1 = (1 - o1) * 1.64 + f1, a2 = (1 - o2) * 1.64 + f2, wh = (1 - seg(t, 2.1, 4.0)) * .5;
  mark.ul.rotation.y = a1; mark.ur.rotation.y = -a1; mark.lr.rotation.x = -a2;
  mark.ul.visible = mark.ur.visible = t > 2.0; mark.lr.visible = t > 2.6;
  mark.setCol(mark.ul, col.copy(mark.GREEN).lerp(WHITE, wh * .7), .62 + .38 * Math.cos(a1)); mark.setCol(mark.ur, col.copy(mark.TEAL).lerp(WHITE, wh * .7), .62 + .38 * Math.cos(a1)); mark.setCol(mark.lr, col.copy(mark.GREEN).lerp(WHITE, wh * .7), .62 + .38 * Math.cos(a2));
  /* the fourth corner stays open */
  const da = seg(t, 3.4, 4.0) * (1 - seg(t, 7.0, 7.8)); dashes.forEach((m, n) => { m.material.opacity = da * seg(t, 3.4 + n * .012, 3.7 + n * .012) * .9; m.visible = m.material.opacity > .003; });
  /* the name completes it */
  const nA = E(seg(t, 4.8, 6.3)), nE = E(seg(t, 5.2, 6.7));
  clipA.constant = -lerp(NX1, NX0, nA); clipE.constant = -lerp(NX1, NX0, nE); mark.ar.visible = nA > 0; mark.en.visible = nE > 0; mark.ar.material.opacity = seg(nA, 0, .06); mark.en.material.opacity = seg(nE, 0, .06); mark.ar.position.x = mark.en.position.x = 0;
  /* the camera: close on the line, then back, until the whole logo stands front on at about 60 % of the picture's width */
  const th = Math.tan(15 * Math.PI / 180), d1 = HW / (th * ASP * (TALL ? .8 : .62)), d0 = TALL ? 13 : 10, u = E(seg(t, 3.9, 7.0));
  const d = lerp(d0, d1, u) * (1 - .03 * seg(t, 7.0, T_MARK)), yaw = lerp(-.4, 0, E(seg(t, .4, 7.0))) + .04 * seg(t, 7.0, T_MARK), pit = lerp(.1, .02, u), tx = lerp(0, CXM, u), ty = -d * th * (TALL ? .02 : .06);
  camA.position.set(tx + Math.sin(yaw) * Math.cos(pit) * d, ty + Math.sin(pit) * d, Math.cos(yaw) * Math.cos(pit) * d); camA.lookAt(tx, ty, 0);
  renderer.toneMappingExposure = 1; renderer.render(A, camA);
}

/* ---------- part two: the road at dusk ---------- */
const B = new T.Scene(); B.background = duskSky(); B.fog = new T.Fog(DUSK, 25, 460);
const road = makeRoad({ tex, phone: false, X: 0, sky: 1.1 }); B.add(road.g);
const camB = new T.PerspectiveCamera(TALL ? 36 : 30, ASP, .4, 1500), RP = road.P;
/* drive up to the first box, hold close while it turns, then look down the row as the others turn */
const KEY = TALL ? [[RP(4, -2.0, 1.5), RP(30, -5.6, 4.0)], [RP(21, -3.0, 2.3), RP(30, -5.6, 4.4)], [RP(25, -2.4, 2.4), RP(64, -5.6, 4.5)]]
                 : [[RP(3, -1.2, 1.5), RP(36, -4.4, 3.6)], [RP(20, -2.2, 2.3), RP(30.5, -5.2, 4.4)], [RP(24, -1.6, 2.4), RP(66, -5.0, 4.6)]];
const cp = new T.Vector3(), cl = new T.Vector3();
function partTwo(t) {
  const a = E(seg(t, T_MARK, 12.4)), b = E(seg(t, 12.9, T_PH));
  cp.copy(KEY[0][0]).lerp(KEY[1][0], a).lerp(KEY[2][0], b); cl.copy(KEY[0][1]).lerp(KEY[1][1], a).lerp(KEY[2][1], b);
  camB.position.copy(cp); camB.lookAt(cl);
  road.turn(seg(t, 10.9, 15.5));
  renderer.toneMappingExposure = 1.1; road.update(renderer, B, camB, t); renderer.render(B, camB);
}

window.DUR = T_END;
window.frame = t => {
  t = Math.max(0, Math.min(T_END, t));
  if (t < T_MARK) partOne(t); else if (t < T_PH) partTwo(t);
  ph.style.display = t >= T_PH ? 'block' : 'none';   /* straight cuts only: the mark, the road, the photograph */
  return t;
};
/* the proof: the finished mark seen exactly front on, with no perspective, over the same rectangle of the manual's page (in points: x 430 to 756, y 612 to 745) */
window.proof = () => { partOne(8.5); const X = v => (v - M.cx) * mark.k, Y = v => -(v - M.cy) * mark.k, oc = new T.OrthographicCamera(X(430), X(756), Y(612), Y(745), -60, 60); oc.position.set(0, 0, 10); renderer.render(A, oc); ph.style.display = 'none'; };
const go = async () => { try { await ph.decode(); } catch (e) {} window.frame(T_MARK + 1); window.frame(0); window.READY = 1; if (Q.has('play')) { const t0 = performance.now(); (function loop() { window.frame(((performance.now() - t0) / 1000) % T_END); requestAnimationFrame(loop); })(); } else if (Q.has('t')) window.frame(num('t', 0)); if (Q.has('proof')) window.proof(); };
loader.manager.onLoad = () => setTimeout(go, 150);
