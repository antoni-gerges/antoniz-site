/* The Big Grill Festival, Yas Links, Abu Dhabi, 6 to 8 December 2018 · page script.
   1 · the opening: one passage of the festival film itself, the lawn at dusk full of families (about 1:00.7 to 1:15.4).
   2 · the lawn, noon to night: ONE 3D stop, made for this portfolio. The camera walks in from the way in to the stage while the light goes
       from noon to dusk to night. Where each part comes from:
   - the stage: three X's of LED bars on a black deck under a box-truss roof, with moving heads, flown speakers and subs on the grass.
     From Tony's own photographs of 6 December 2018: IMG_1180 (3:02 pm, the bare rig), IMG_1186 (3:09 pm), IMG_1194 (9:17 pm, lit),
     his clips IMG_1193 to IMG_1197, and the festival film (about 0:57 to 1:00, 1:22, 2:55).
     ADDED FOR THIS PORTFOLIO, at Tony's request (14 Oct 2026): one lit beam across the top that the X's upper arms meet.
     The 2018 stage had three free-standing X's.
   - the LED picture: the deep blue with white sparkles of his 9:17 pm photograph.
   - the food stalls: orange-red pergolas with festoon bulbs, white pagoda tents (festival film about 1:00 to 1:02; his clip IMG_1205).
   - the kids' zone: an orange inflatable arch with a football on top, a green inflatable dome (festival film about 0:00, 0:44, 1:00).
   - the beanbags: the festival's own, colours from IMG_1186 (the sponsor's logo is left off). The white blocks of Yas behind.
   SIZES ARE ESTIMATES read from the photographs. No stage plan is in the archive. No people are drawn. */
let stage, T;   /* perf21 F1: three.js and the 3D engine load when the 3D chapter is near: near3d() at the end */

/* the opening: one passage of the whole festival film, played from the film file itself */
(function () {
  const h = document.querySelector('.fp-hero[data-from]'); if (!h) return;
  const v = h.querySelector('video'), a = +h.dataset.from, b = +h.dataset.to;
  v.addEventListener('loadedmetadata', () => { if (v.currentTime < a - .5) v.currentTime = a; });
  v.addEventListener('timeupdate', () => { if (v.currentTime >= b || v.currentTime < a - 1) v.currentTime = a; });
})();

const sec = document.querySelector('.fp-model'), FP = window.FP;
let S;
near3d(sec, () => { S = sec && FP && stage(sec, { assets: 'a/', grid: false, exposure: 1, fill: 0, floorColor: 0x000000, floorOpacity: 1, mirrorK: 0 });
if (S) build(); });

function build() {
const { std, box, scene, cam, renderer } = S;
S.floor.visible = false; S.key.intensity = 0; S.key.castShadow = false; S.rim.intensity = 0;
scene.traverse(o => { if (o.isHemisphereLight) o.intensity = 0; });
const g = new T.Group(); scene.add(g);
const add = (o, to) => { (to || g).add(o); return o; };
const R = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();   /* fixed random, same scene every time */

/* things the time of day turns up or down: each kept with its value at dusk */
const TOD = { spr: [], led: [], beam: [], smoke: [], smokeL: [], fac: [] };
let CAT = 'misc';
const canvasTex = (w, h, draw, srgb) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); if (srgb !== false) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; };
const glowTex = canvasTex(256, 256, (x) => { const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.16, 'rgba(255,255,255,.5)'); gr.addColorStop(.45, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); });
const glowMat = (color, op) => new T.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });
const sprite = (color, op, size, x, y, z, to) => { const s = new T.Sprite(glowMat(color, op)); s.scale.setScalar(size); s.position.set(x, y, z); s.renderOrder = 9; add(s, to); TOD.spr.push({ m: s.material, op, cat: CAT }); return s; };
const flat = (c, k) => new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k || 1), toneMapped: false });

/* ---------------- sizes, metres (estimates) ---------------- */
const DECK_H = 1.2, DECK_X = 7.6, DECK_Z0 = -8.4, DECK_Z1 = 0;
const XS = 4.15, XW = .64, XZ = -6.7, XB = DECK_H + .05;               /* each X: XS wide and tall, bars XW wide */
const RX = 6.75, RZ = -7.3, RY = 6.45;                                   /* rear truss frame: legs at +-RX, top beam at RY */
const FX = 10.8, FZ = 1.5, FY = 8.9;                                    /* front truss frame */

/* ---------------- sky: noon, blue hour (about twenty minutes after sunset; the stage faces the sunset), night ---------------- */
const skyTex = stops => canvasTex(4, 1024, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); stops.forEach(s => gr.addColorStop(.5 - s[0] / 180, s[1])); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
const SKY = [
  skyTex([[90, '#2f6cc4'], [40, '#5b93d6'], [15, '#93bbe6'], [5, '#c3d8ec'], [1, '#dde6ec'], [0, '#e0e6ea'], [-3, '#8e9a9e'], [-90, '#3e4446']]),
  skyTex([[90, '#070d22'], [55, '#0d1838'], [32, '#162752'], [20, '#20346a'], [13, '#2f4078'], [9, '#4a4c80'], [6, '#635a86'], [3.8, '#5f5880'], [2, '#454a72'], [.6, '#343c64'], [0, '#30385f'], [-3, '#1a1f33'], [-90, '#08090f']]),
  skyTex([[90, '#02040b'], [40, '#050915'], [15, '#0a1024'], [5, '#121a32'], [1, '#18203a'], [0, '#181e36'], [-3, '#0b0e18'], [-90, '#030407']])];
const skyM = new T.ShaderMaterial({ uniforms: { t0: { value: SKY[0] }, t1: { value: SKY[1] }, t2: { value: SKY[2] }, u: { value: 1 } }, side: T.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: 'uniform sampler2D t0; uniform sampler2D t1; uniform sampler2D t2; uniform float u; varying vec2 vUv; void main(){ vec3 a = texture2D(t0, vUv).rgb, b = texture2D(t1, vUv).rgb, c = texture2D(t2, vUv).rgb; gl_FragColor = vec4(u < 1. ? mix(a, b, u) : mix(b, c, u - 1.), 1.);\n#include <colorspace_fragment>\n}' });
const sky = new T.Mesh(new T.SphereGeometry(900, 48, 32), skyM);
sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
scene.background = new T.Color(0x0a0c14);
scene.fog = new T.Fog(0x343b64, 40, 470);

/* ---------------- lawn ---------------- */
const grassT = canvasTex(1024, 1024, (x, w, h) => { x.fillStyle = '#3d5a2b'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const r = R(); x.fillStyle = r < .33 ? 'rgba(52,80,36,.5)' : r < .66 ? 'rgba(74,104,48,.45)' : 'rgba(40,62,30,.5)'; const s = 6 + R() * 40; x.beginPath(); x.ellipse(R() * w, R() * h, s, s * (.5 + R() * .5), R() * 3, 0, 7); x.fill(); }
  for (let i = 0; i < 40000; i++) { const r = R(), px = R() * w, py = R() * h, l = 3 + R() * 7, a = -1.2 + R() * .5;
    x.strokeStyle = r < .3 ? 'rgba(98,128,62,.55)' : r < .55 ? 'rgba(34,54,24,.6)' : r < .8 ? 'rgba(70,100,44,.5)' : 'rgba(120,128,70,.35)'; x.lineWidth = .8 + R() * .8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } });
grassT.wrapS = grassT.wrapT = T.RepeatWrapping; grassT.repeat.set(300, 300);
const coarseT = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { const cx = R() * w, cy = R() * h, rr = 8 + R() * 60, v = Math.round(90 + R() * 80), cg = x.createRadialGradient(cx, cy, 0, cx, cy, rr); cg.addColorStop(0, 'rgba(' + v + ',' + v + ',' + v + ',.35)'); cg.addColorStop(1, 'rgba(' + v + ',' + v + ',' + v + ',0)'); x.fillStyle = cg; x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); } }, false);
coarseT.wrapS = coarseT.wrapT = T.RepeatWrapping;
const GRASS = new T.MeshStandardMaterial({ map: grassT, roughness: 1, metalness: 0, envMapIntensity: .1 });
GRASS.onBeforeCompile = sh => {
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
  sh.uniforms.tCoarse = { value: coarseT };
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform sampler2D tCoarse;')
    .replace('#include <map_fragment>', '#include <map_fragment>\n{ diffuseColor.rgb *= .45 + 1.1 * texture2D(tCoarse, vWP.xz / 26.0).r; diffuseColor.rgb *= .8 + .4 * texture2D(tCoarse, vWP.xz / 7.0 + .5).r; vec3 big = texture2D(map, vMapUv * .047 + .31).rgb; float l = dot(big, vec3(.3,.59,.11)); diffuseColor.rgb *= clamp(.3 + l * 2.2, .7, 1.3);\n float st = smoothstep(.42, .58, abs(fract(vWP.x / 9.0) - .5) * 2.0); diffuseColor.rgb *= mix(.84, 1.12, st);\n float wear = smoothstep(14.0, 4.0, length((vWP.xz - vec2(0., 4.)) * vec2(.55, 1.))); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.25, 1.02, .7), wear * .55); }'); };
const lawn = new T.Mesh(new T.PlaneGeometry(1200, 1200), GRASS); lawn.rotation.x = -Math.PI / 2; lawn.receiveShadow = true; add(lawn);

/* ---------------- materials ---------------- */
const INK = std({ color: 0x060607, roughness: .9 }), CLOTH = std({ color: 0x08080a, roughness: 1 });
const BODY = std({ color: 0x101012, roughness: .45, metalness: .4 }), CASE = std({ color: 0x141518, roughness: .5, metalness: .2 });
const ALU = new T.MeshStandardMaterial({ color: 0xd7dbe2, roughness: .32, metalness: .9 });
const ORANGE = std({ color: 0xd9531f, roughness: .55 });

/* ---------------- the deck ---------------- */
add(box(DECK_X * 2, DECK_H - .04, DECK_Z1 - DECK_Z0, CLOTH, 0, (DECK_H - .04) / 2, (DECK_Z0 + DECK_Z1) / 2));
add(box(DECK_X * 2 + .02, .03, .05, std({ color: 0x3a3a3c, roughness: .4 }), 0, DECK_H - .03, DECK_Z1 + .02));                 /* nosing */
/* the stage floor: black, a little gloss */
const DECKM = new T.MeshStandardMaterial({ color: 0x0c0c0e, roughness: .34, metalness: .15 });
const deckTop = new T.Mesh(new T.PlaneGeometry(DECK_X * 2, DECK_Z1 - DECK_Z0), DECKM); deckTop.rotation.x = -Math.PI / 2; deckTop.position.set(0, DECK_H + .002, (DECK_Z0 + DECK_Z1) / 2); deckTop.receiveShadow = true; add(deckTop);
/* stair, stage left */
for (let i = 0; i < 5; i++) add(box(1.5, DECK_H * (i + 1) / 5, .32, CASE, -DECK_X + 1.2, DECK_H * (i + 1) / 10, DECK_Z1 + .32 * (5 - i) - .16));
/* subs on the grass, under the deck edge, as in his 9:17 pm photograph */
const grill = canvasTex(64, 64, (x) => { x.fillStyle = '#0c0c0d'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#1b1c1f'; for (let i = 0; i < 64; i += 4) for (let j = 0; j < 64; j += 4) x.fillRect(i, j, 2, 2); });
grill.wrapS = grill.wrapT = T.RepeatWrapping; grill.repeat.set(3, 2);
const SUBF = std({ map: grill, roughness: .8 });
[-5.4, -3.2, -1.05, 1.05, 3.2, 5.4].forEach(x => add(box(1.9, .82, .9, [CASE, CASE, CASE, CASE, SUBF, CASE], x, .41, DECK_Z1 + .62)));
[-6.9, 6.9].forEach(x => { const w = box(.7, .3, .45, BODY, x, DECK_H + .16, DECK_Z1 - .35); w.rotation.x = -.4; add(w); });
/* uplights on the grass along the stage front, as in the festival film at about 0:57 */
for (let i = 0; i < 9; i++) { const x = -7.2 + i * 1.8; add(box(.22, .16, .22, BODY, x, .08, DECK_Z1 + 1.35)); sprite(i % 2 ? 0x8fb8ff : 0xdfe9ff, .7, .7, x, .2, DECK_Z1 + 1.45);
}

/* ---------------- the three X's: LED bars ---------------- */
function ledTex(seed) { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return canvasTex(2048, 256, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#0b2fb8'); gr.addColorStop(.25, '#1b62f0'); gr.addColorStop(.5, '#3fb6ff'); gr.addColorStop(.75, '#1b62f0'); gr.addColorStop(1, '#0b2fb8');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    /* soft light inside the picture: clouds of brighter blue */
    for (let i = 0; i < 26; i++) { const cx = r() * w, cy = r() * h, rr = 60 + r() * 200, cg = x.createRadialGradient(cx, cy, 0, cx, cy, rr); cg.addColorStop(0, 'rgba(150,215,255,.5)'); cg.addColorStop(1, 'rgba(150,215,255,0)'); x.fillStyle = cg; x.fillRect(0, 0, w, h); }
    /* white sparkles, as in the 9:17 pm photograph */
    for (let i = 0; i < 520; i++) { const cx = r() * w, cy = r() * h, rr = 1.5 + Math.pow(r(), 3) * 9, cg = x.createRadialGradient(cx, cy, 0, cx, cy, rr * 2.4); cg.addColorStop(0, 'rgba(255,255,255,.95)'); cg.addColorStop(.35, 'rgba(225,245,255,.55)'); cg.addColorStop(1, 'rgba(200,235,255,0)'); x.fillStyle = cg; x.fillRect(cx - rr * 3, cy - rr * 3, rr * 6, rr * 6); }
    /* the panels: 0.5 m cabinets, seams barely seen */
    x.fillStyle = 'rgba(0,8,30,.35)'; const cab = w / 13.2; for (let u = cab; u < w; u += cab) x.fillRect(u - 1.5, 0, 3, h); x.fillRect(0, h / 2 - 1.5, w, 3);
  });
}
const LEDS = [ledTex(11), ledTex(23), ledTex(37), ledTex(51), ledTex(67), ledTex(79)];
const XSIDE = std({ color: 0x0a0a0c, roughness: .5, metalness: .3 });
function bar(cx, sgn, depth, k) {               /* one arm: a parallelogram with level ends, rising left to right (sgn 1) or right to left (sgn -1) */
  const hw = XW * Math.SQRT2, s = XS, sh = new T.Shape();
  if (sgn > 0) { sh.moveTo(-s / 2, 0); sh.lineTo(-s / 2 + hw, 0); sh.lineTo(s / 2, s); sh.lineTo(s / 2 - hw, s); }
  else { sh.moveTo(s / 2 - hw, 0); sh.lineTo(s / 2, 0); sh.lineTo(-s / 2 + hw, s); sh.lineTo(-s / 2, s); }
  sh.closePath();
  const geo = new T.ExtrudeGeometry(sh, { depth: .14, bevelEnabled: false });
  const p = geo.attributes.position, uv = geo.attributes.uv, L = Math.hypot(s - hw, s), dx = (s - hw) / L * sgn, dy = s / L;
  const ox = sgn > 0 ? -s / 2 + hw / 2 : s / 2 - hw / 2;
  for (let i = 0; i < p.count; i++) { const px = p.getX(i) - ox, py = p.getY(i); uv.setXY(i, (px * dx + py * dy) / L, .5 + (px * dy - py * dx) / (XW * 1.02)); }
  const m = new T.MeshBasicMaterial({ map: LEDS[k % LEDS.length], toneMapped: false }); m.color.setScalar(.93); TOD.led.push({ m, k: .93 });
  const mesh = new T.Mesh(geo, [m, XSIDE]); mesh.position.set(cx, XB, XZ + depth); add(mesh);
  return mesh;
}
CAT = 'led';
[-XS, 0, XS].forEach((cx, i) => { bar(cx, 1, 0, i * 2); bar(cx, -1, -.16, i * 2 + 1);
  add(box(XS * .9, .06, .3, BODY, cx, XB - .02, XZ - .05)); });                                  /* the base each X stands on */
/* the top beam, added for this portfolio: one LED beam across the upper ends of the three X's, the arms meeting it */
{ const L = XS * 3 + XW * .5, H = XW * 1.1, y1 = XB + XS + .03, sh = new T.Shape(); sh.moveTo(-L / 2, y1 - H); sh.lineTo(L / 2, y1 - H); sh.lineTo(L / 2, y1); sh.lineTo(-L / 2, y1); sh.closePath();
  const geo = new T.ExtrudeGeometry(sh, { depth: .16, bevelEnabled: false }), p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + L / 2) / 5.6, (p.getY(i) - (y1 - H)) / H);
  const t = LEDS[4].clone(); t.wrapS = T.RepeatWrapping; t.needsUpdate = true;
  const m = new T.MeshBasicMaterial({ map: t, toneMapped: false }); m.color.setScalar(.95); TOD.led.push({ m, k: .95 });
  add(new T.Mesh(geo, [m, XSIDE])).position.set(0, 0, XZ + .02);
  add(box(L + .1, .08, .4, BODY, 0, y1 + .04, XZ + .02));                                        /* the frame on top of it */
  for (let i = 0; i < 9; i++) sprite(0x2f8cff, .16, 2.8, -L / 2 + L * i / 8, y1 - H / 2, XZ + .5); }
/* the X's light, seen through the haze */
[-XS, 0, XS].forEach(cx => { [[-.3, .3], [.3, .3], [0, .5], [-.3, .7], [.3, .7]].forEach(f => sprite(0x2f8cff, .18, 3.4, cx + f[0] * XS, XB + f[1] * XS, XZ + .5)); });
sprite(0x2a74ff, .22, 22, 0, XB + XS * .5, XZ + 1.2);

/* DJ table with an LED front, two speakers on poles, backline cases */
{ const front = new T.MeshBasicMaterial({ map: LEDS[2], toneMapped: false }); front.color.setScalar(.85); TOD.led.push({ m: front, k: .85 });
  add(box(2.9, 1.15, .95, [XSIDE, XSIDE, BODY, XSIDE, front, XSIDE], 0, DECK_H + .575, -4.9));
  sprite(0x4aa8ff, .25, 4.2, 0, DECK_H + .6, -4.3);
  [-2.6, 2.6].forEach(x => { add(box(.04, 1.5, .04, BODY, x, DECK_H + .75, -4.2)); add(box(.5, .78, .42, BODY, x, DECK_H + 1.85, -4.2)); });
  [[-5.6, -5.4], [-4.9, -5.8], [5.4, -5.6], [6.0, -5.0]].forEach(c => add(box(.9, .7 + R() * .3, .6, CASE, c[0], DECK_H + .4, c[1])));
}

/* ---------------- the truss: aluminium box truss, built tube by tube ---------------- */
const tubes = [];
const V = (x, y, z) => new T.Vector3(x, y, z);
function truss(A, B, w, bay) {
  const dir = B.clone().sub(A), L = dir.length(); dir.normalize();
  const up = Math.abs(dir.y) > .9 ? V(1, 0, 0) : V(0, 1, 0), s1 = new T.Vector3().crossVectors(dir, up).normalize(), s2 = new T.Vector3().crossVectors(s1, dir).normalize();
  const c = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(k => s1.clone().multiplyScalar(k[0] * w / 2).add(s2.clone().multiplyScalar(k[1] * w / 2)));
  c.forEach(o => tubes.push([A.clone().add(o), B.clone().add(o), .025]));
  const n = Math.max(1, Math.round(L / bay));
  for (let i = 0; i < n; i++) { const p0 = A.clone().addScaledVector(dir, L * i / n), p1 = A.clone().addScaledVector(dir, L * (i + 1) / n);
    for (let f = 0; f < 4; f++) { const a = c[f], b = c[(f + 1) % 4]; if ((i + f) % 2) tubes.push([p0.clone().add(a), p1.clone().add(b), .012]); else tubes.push([p0.clone().add(b), p1.clone().add(a), .012]); } }
}
/* rear frame (behind the X's), front frame (bigger, higher), and the two side beams between them */
[-1, 1].forEach(sd => { truss(V(sd * RX, 0, RZ), V(sd * RX, RY + .2, RZ), .3, .5); truss(V(sd * FX, 0, FZ), V(sd * FX, FY + .25, FZ), .4, .5); });
truss(V(-RX - .2, RY, RZ), V(RX + .2, RY, RZ), .3, .5);
truss(V(-FX - .25, FY, FZ), V(FX + .25, FY, FZ), .4, .5);
[-1, 1].forEach(sd => truss(V(sd * FX, FY, FZ), V(sd * RX, RY, RZ), .3, .5));
/* short arms on the front towers that carry the flown speakers */
[-1, 1].forEach(sd => truss(V(sd * FX, 7.4, FZ), V(sd * (FX + 1.6), 7.4, FZ), .3, .5));
{ const geo = new T.CylinderGeometry(1, 1, 1, 8, 1, true), im = new T.InstancedMesh(geo, ALU, tubes.length), m4 = new T.Matrix4(), qq = new T.Quaternion(), Y = V(0, 1, 0);
  tubes.forEach((t, i) => { const d = t[1].clone().sub(t[0]), L = d.length(); qq.setFromUnitVectors(Y, d.normalize()); m4.compose(t[0].clone().add(t[1]).multiplyScalar(.5), qq, V(t[2], L, t[2])); im.setMatrixAt(i, m4); });
  im.castShadow = true; add(im);
  [[-RX, RZ], [RX, RZ], [-FX, FZ], [FX, FZ]].forEach(p => add(box(.9, .04, .9, BODY, p[0], .02, p[1]))); }
/* flown speakers: a short line of boxes under each arm */
[-1, 1].forEach(sd => { add(box(1.0, .08, .7, BODY, sd * (FX + 1.2), 7.22, FZ)); [-.35, .35].forEach(k => add(box(.02, .2, .02, BODY, sd * (FX + 1.2) + k, 7.32, FZ)));
  for (let i = 0; i < 6; i++) { const b = box(.9, .32, .62, BODY, sd * (FX + 1.2), 7.0 - i * .34, FZ + .03 * i * i); b.rotation.x = -.03 * i * i; add(b); } });

/* ---------------- lights on the rig ---------------- */
const beamMat = (color, k) => new T.ShaderMaterial({ uniforms: { c: { value: new T.Color(color) }, k: { value: k } },
  vertexShader: 'varying float vy; varying vec3 vn; varying vec3 vv; void main(){ vy = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.); vn = normalize(normalMatrix * normal); vv = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 c; uniform float k; varying float vy; varying vec3 vn; varying vec3 vv; void main(){ float f = pow(abs(dot(normalize(vn), normalize(vv))), 2.2); float a = f * (0.08 + 0.92 * pow(vy, 3.0)) * smoothstep(0.0, 0.25, vy) * k; gl_FragColor = vec4(c * a, 1.); }',
  blending: T.AdditiveBlending, depthWrite: false, transparent: true, side: T.DoubleSide, toneMapped: false });
const DOWN = V(0, -1, 0), BEAMS = [];
function head(x, y, z, dir, len, spread, color, k, lensK) { CAT = 'lens';
  const d = V(...dir).normalize();
  add(box(.34, .12, .28, BODY, x, y + .16, z));                                                      /* base under the truss */
  const hd = new T.Mesh(new T.CylinderGeometry(.13, .16, .36, 16), BODY); hd.position.set(x, y - .08, z); hd.quaternion.setFromUnitVectors(DOWN, d); add(hd);
  const lp = V(x, y - .08, z).addScaledVector(d, .19);
  const lens = new T.Mesh(new T.CircleGeometry(.11, 20), flat(color, lensK || 1)); lens.position.copy(lp); lens.quaternion.setFromUnitVectors(V(0, 0, 1), d); add(lens);
  if (len > 0) { const ge = new T.CylinderGeometry(.09, .09 + len * spread, len, 32, 1, true); ge.translate(0, -len / 2, 0);
    const b = new T.Mesh(ge, beamMat(color, k)); TOD.beam.push({ m: b.material, k }); b.position.copy(lp); b.quaternion.setFromUnitVectors(DOWN, d); b.renderOrder = 8; add(b); BEAMS.push({ o: lp.clone(), d: d.clone(), len, spread, color: new T.Color(color), k }); }
  sprite(color, .9, len > 0 ? 1.1 : .55, lp.x, lp.y, lp.z);
}
const BEAMK = 1;
/* front beam: eight heads; at dusk the outer ones fan up into the sky, the inner ones cross down onto the stage */
for (let i = 0; i < 8; i++) { const u = i / 7 * 2 - 1, x = u * (FX - 1.1);
  if (Math.abs(u) > .5) head(x, FY - .32, FZ, [u * .62, 1.0, .42], 26, .02, 0xd8e6ff, .1 * BEAMK);
  else head(x, FY - .32, FZ, [-u * .5, -1, -.42], 9.5, .03, 0xcfe0ff, .12 * BEAMK); }
/* side beams: two heads each, washing the deck */
[-1, 1].forEach(sd => [.3, .62].forEach(t => { const x = sd * (FX + (RX - FX) * t), y = FY + (RY - FY) * t - .3, z = FZ + (RZ - FZ) * t; head(x, y, z, [-sd * .35, -1, .15], 8, .035, 0x9fc4ff, .12 * BEAMK); }));
CAT = 'lens';
/* rear beam: a row of PARs, white and blue lenses, as in the 9:17 pm photograph */
for (let i = 0; i < 12; i++) { const x = (i / 11 * 2 - 1) * (RX - .9), c = [0xffffff, 0x3f6bff, 0xffffff, 0x58ff9a, 0xffffff, 0x3f6bff][i % 6];
  const b = new T.Mesh(new T.CylinderGeometry(.11, .11, .26, 14), BODY); b.position.set(x, RY - .28, RZ + .05); b.rotation.x = Math.PI / 2 - .5; add(b);
  const l = new T.Mesh(new T.CircleGeometry(.09, 16), flat(c, 1)); l.position.set(x, RY - .34, RZ + .19); l.rotation.x = -.5; add(l); sprite(c, .8, .85, x, RY - .34, RZ + .22); }
/* blinders on the front towers */
[-1, 1].forEach(sd => [6.2, 4.8].forEach(y => { add(box(.5, .3, .2, BODY, sd * (FX - .55), y, FZ + .15)); sprite(0xfff2d6, .7, .9, sd * (FX - .55), y, FZ + .3); }));

/* real light from all of that */
[-XS, 0, XS].forEach(cx => { const l = new T.PointLight(0x3c8dff, 26, 16, 1.6); l.position.set(cx, XB + XS * .45, XZ + 1.4); add(l); });
{ const l = new T.PointLight(0x4aa8ff, 10, 8, 1.6); l.position.set(0, DECK_H + .7, -3.5); add(l); }
{ const w = new T.SpotLight(0xbcd2ff, 260, 40, .5, .8, 1.4); w.position.set(0, FY - .4, FZ); w.target.position.set(0, DECK_H, -4); add(w); add(w.target); }
{ const s = new T.SpotLight(0x7a98ff, 300, 32, .55, .95, 1.3); s.position.set(0, FY - .5, FZ + .3); s.target.position.set(-1, 0, 9); s.castShadow = true; s.shadow.mapSize.set(2048, 2048); s.shadow.bias = -.0006; s.shadow.radius = 4; s.shadow.camera.near = 2; s.shadow.camera.far = 40; add(s); add(s.target); }   /* spill onto the lawn */
const hemi = new T.HemisphereLight(0x3d4a80, 0x101808, .42); scene.add(hemi);

CAT = 'bulb';
/* ---------------- food stalls: orange-red pergolas with festoon bulbs, white pagoda tents behind ---------------- */
const PX = -11.6, PD = 3.4, BAY = 4.2, PH = 2.85;
const bulbs = [], bulbGeo = new T.SphereGeometry(.045, 10, 8), bulbM = flat(0xffd9a0, 1.0);
function festoon(a, b, sag, n) { for (let i = 1; i < n; i++) { const t = i / n, p = a.clone().lerp(b, t); p.y -= sag * 4 * t * (1 - t); const m = new T.Mesh(bulbGeo, bulbM); m.position.copy(p); add(m); bulbs.push(p); sprite(0xffb867, .55, .62, p.x, p.y, p.z); }
  const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, p = a.clone().lerp(b, t); p.y -= sag * 4 * t * (1 - t) - .03; pts.push(p); }
  add(new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x0a0a0a }))); }
const foldT = canvasTex(512, 64, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 16; i++) gr.addColorStop(i / 16, i % 2 ? '#8a8378' : '#d6cdbf'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
const WALL = new T.MeshStandardMaterial({ color: 0xc9bfae, map: foldT, roughness: .95, emissive: 0xffb877, emissiveIntensity: .08 });
const COUNTER = std({ color: 0x1a1512, roughness: .7 });
const grills = [];
/* a row of stalls: front line at x = fx, the stalls open toward the lawn (sd = 1 opens to +x, -1 to -x) */
function stalls(fx, sd, zTop, nb, grillAt, lightK) { const bx = fx - sd * PD;
  for (let b = 0; b < nb; b++) { const z1 = zTop - b * (BAY + .5), z0 = z1 - BAY, zm = (z0 + z1) / 2;
    [[fx, z1], [fx, z0], [bx, z1], [bx, z0]].forEach(p => add(box(.11, PH, .11, ORANGE, p[0], PH / 2, p[1])));
    add(box(.1, .18, BAY + .2, ORANGE, fx, PH - .09, zm)); add(box(.1, .18, BAY + .2, ORANGE, bx, PH - .09, zm));
    for (let s = 0; s < 8; s++) add(box(PD + .3, .07, .05, ORANGE, (fx + bx) / 2, PH + .035, z0 + .25 + s * (BAY - .5) / 7));
    add(box(.06, 2.2, BAY - .3, WALL, bx + sd * .2, 1.1, zm));                                               /* back wall, lit from inside */
    add(box(1.0, .95, BAY - 1.0, COUNTER, bx + sd * 1.0, .475, zm));
    festoon(V(fx + sd * .05, PH - .05, z1), V(fx + sd * .05, PH - .05, z0), .38, 9);
    if (b < nb - 1) festoon(V(fx + sd * .05, PH - .05, z0), V(fx + sd * .05, PH - .05, z0 - .5), .02, 2);
    { const l = new T.PointLight(0xffb36a, 9 * lightK, 11, 1.7); l.position.set(fx - sd * .4, PH - .3, zm); add(l); }
    if (grillAt.indexOf(b) >= 0) grills.push(V(fx + sd * .9, 0, zm + .6)); } }
stalls(PX, 1, 29, 6, [4, 5], 1);
stalls(24, -1, 20, 4, [], .8);
/* the kids' zone, as in the festival film (about 0:00 and 1:00) and Tony's clip IMG_1205: an orange inflatable arch with a football on top, a green inflatable dome */
{ const INF = new T.MeshPhysicalMaterial({ color: 0xf2701c, roughness: .38, clearcoat: .4, clearcoatRoughness: .35, envMapIntensity: .5 }), GRN = new T.MeshPhysicalMaterial({ color: 0x3fae3a, roughness: .4, clearcoat: .35, clearcoatRoughness: .4, envMapIntensity: .5 });
  const arch = new T.Group(); arch.position.set(23.6, 0, -12.5); arch.rotation.y = -.75; add(arch);
  const path = new T.CurvePath(); const h = 4.2, w = 5.2, r = .9;
  path.add(new T.LineCurve3(V(-w / 2, 0, 0), V(-w / 2, h - r, 0))); path.add(new T.QuadraticBezierCurve3(V(-w / 2, h - r, 0), V(-w / 2, h, 0), V(-w / 2 + r, h, 0)));
  path.add(new T.LineCurve3(V(-w / 2 + r, h, 0), V(w / 2 - r, h, 0))); path.add(new T.QuadraticBezierCurve3(V(w / 2 - r, h, 0), V(w / 2, h, 0), V(w / 2, h - r, 0))); path.add(new T.LineCurve3(V(w / 2, h - r, 0), V(w / 2, 0, 0)));
  const tube = new T.Mesh(new T.TubeGeometry(path, 120, .48, 28, false), INF); tube.castShadow = true; arch.add(tube);
  const ballT = canvasTex(512, 256, (x, W, H) => { x.fillStyle = '#f4f4f2'; x.fillRect(0, 0, W, H); x.fillStyle = '#151515'; for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const cx = (i + (j % 2) * .5) * W / 6, cy = (j + .5) * H / 3; x.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283 - 1.57; x.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22 * 1.4); } x.fill(); } });
  const ball = new T.Mesh(new T.SphereGeometry(.85, 40, 28), new T.MeshStandardMaterial({ map: ballT, roughness: .45, envMapIntensity: .5 })); ball.position.set(0, h + .48 + .8, 0); arch.add(ball);
  const dome = new T.Mesh(new T.SphereGeometry(3.1, 48, 24, 0, 6.283, 0, 1.75), GRN); dome.scale.set(1, .78, 1); dome.position.set(27.5, -.2, -16.5); dome.castShadow = true; add(dome);
  const ring = new T.Mesh(new T.TorusGeometry(3.05, .42, 16, 64), new T.MeshPhysicalMaterial({ color: 0xf4d23a, roughness: .4, clearcoat: .3, envMapIntensity: .5 })); ring.rotation.x = Math.PI / 2; ring.position.set(27.5, .4, -16.5); add(ring);
  const pole = box(.12, 9, .12, BODY, 35, 4.5, -9); add(pole); sprite(0xfff1d8, .8, 1.6, 35, 9, -9);
  const fl = new T.SpotLight(0xfff0d8, 420, 40, .7, .8, 1.4); fl.position.set(35, 9, -9); fl.target.position.set(24, 0, -14); add(fl); add(fl.target); }
CAT = 'fire';
/* a barrel grill on legs in front of four of the stalls, coals glowing */
grills.forEach(p => { const G = new T.Group(); G.position.set(p.x, 0, p.z); add(G);
  const STEEL = std({ color: 0x1a1a1d, roughness: .45, metalness: .6, side: T.DoubleSide });
  /* an open barrel grill: the lower half of a drum, along the stall front, on four legs, coals and a few flames showing */
  const trough = new T.Mesh(new T.CylinderGeometry(.3, .3, 1.1, 28, 1, true, Math.PI / 2, Math.PI), STEEL); trough.rotation.x = -Math.PI / 2; trough.position.y = .95; G.add(trough);
  [-1, 1].forEach(k => { const cap = new T.Mesh(new T.CircleGeometry(.3, 28, Math.PI, Math.PI), STEEL); cap.position.set(0, .95, k * .55); G.add(cap); });
  const coal = new T.Mesh(new T.PlaneGeometry(.5, 1.06), flat(0xff5a14, 1.0)); coal.rotation.x = -Math.PI / 2; coal.position.y = .83; G.add(coal);
  const grate = new T.Mesh(new T.PlaneGeometry(.58, 1.08), new T.MeshBasicMaterial({ map: canvasTex(64, 128, (x) => { x.clearRect(0, 0, 64, 128); x.fillStyle = '#121212'; for (let i = 0; i < 128; i += 7) x.fillRect(0, i, 64, 2.5); }), transparent: true })); grate.rotation.x = -Math.PI / 2; grate.position.y = .94; G.add(grate);
  [[-.22, -.45], [.22, -.45], [-.22, .45], [.22, .45]].forEach(k => G.add(box(.035, .72, .035, STEEL, k[0], .36, k[1])));
  G.add(box(.46, .02, .9, STEEL, 0, .25, 0)); G.add(box(.04, .5, .04, STEEL, -.05, 1.2, -.62));
  for (let f = 0; f < 6; f++) sprite(f % 2 ? 0xff8a2a : 0xffb347, .5, .35 + R() * .25, p.x + (R() - .5) * .3, 1.0 + R() * .12, p.z + (R() - .5) * .9);
  sprite(0xff6a20, .45, 1.6, p.x, 1.05, p.z); const l = new T.PointLight(0xff7a2a, 7, 6, 2); l.position.set(p.x, 1.5, p.z); add(l); });
CAT = 'misc';
/* pagoda tents, behind the stalls and beside the stage */
const TENT = new T.MeshStandardMaterial({ color: 0xc9c8cc, roughness: .7, emissive: 0xffe2bd, emissiveIntensity: .05 });
const TENTW = new T.MeshStandardMaterial({ color: 0xd8d4cc, roughness: .8, emissive: 0xffcf98, emissiveIntensity: .2 });
function pagoda(x, z, s, ry) { const t = new T.Group(); t.position.set(x, 0, z); t.rotation.y = ry || 0;
  t.add(box(s, 2.4, s, TENTW, 0, 1.2, 0));
  const roof = new T.Mesh(new T.ConeGeometry(s * .74, 2.3, 4, 1, true), TENT); roof.rotation.y = Math.PI / 4; roof.position.y = 2.4 + 1.15; t.add(roof);
  const spike = new T.Mesh(new T.ConeGeometry(.12, .9, 8), TENT); spike.position.y = 2.4 + 2.3 + .35; t.add(spike); add(t); }
for (let i = 0; i < 6; i++) pagoda(-19.2, 28 - i * 5.6, 5);
pagoda(-16.5, -10, 5); pagoda(-22, -12.5, 5);

/* ---------------- beanbags on the lawn, facing the stage ---------------- */
function bagGeo(seed) { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  /* a filled sack, as in the 3:09 pm photograph: wide at the foot, a soft rounded top pressed in a little where someone sat */
  const ge = new T.SphereGeometry(.5, 72, 48), p = ge.attributes.position, ph = [r() * 6, r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const yn = y / .5, a = Math.atan2(z, x);
    const k = 1 + .18 * (1 - (yn + 1) / 2) + .04 * Math.sin(a * 2 + ph[0]) + .025 * Math.sin(a * 3 + ph[1]); x *= k; z *= k * 1.08;
    y *= .86; if (y < -.26) y = -.26 + (y + .26) * .1;
    const dn = Math.max(0, 1 - Math.hypot(x - .06, z + .1) / .34); if (y > 0) y -= .09 * dn * dn * (3 - 2 * dn);
    const bump = .01 * Math.sin(x * 7 + ph[2] + y * 4) * Math.sin(z * 6 + ph[3]); const n3 = Math.hypot(x, z) || 1; x += x / n3 * bump; z += z / n3 * bump;
    p.setXYZ(i, x, y + .245, z); }
  ge.computeVertexNormals(); return ge; }
const BAGS = [[0xf07a14, -2.6, 12.6, .3, .95], [0xd0202a, -.6, 13.8, -.1, .95], [0x4b2a8c, 3.6, 11.6, -.3, .95], [0xf2b818, 1.4, 9.4, .2, .95], [0xd0202a, -4.6, 8.4, .5, .95],
  [0xf07a14, 5.2, 7.2, -.2, .95], [0x2a52c8, -1.6, 5.6, .2, .95], [0xd0202a, 2.4, 4.6, 0, .95], [0xf2b818, 7.4, 10.4, -.4, .95]];
const wrinkT = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); x.lineCap = 'round';
  for (let i = 0; i < 260; i++) { const cx = R() * w, cy = R() * h, a = R() * 3.14, l = 20 + R() * 90, v = R() < .5 ? 'rgba(40,40,40,' : 'rgba(210,210,210,'; x.strokeStyle = v + (.12 + R() * .2) + ')'; x.lineWidth = 3 + R() * 9; x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + Math.cos(a) * l * .5 + (R() - .5) * 30, cy + Math.sin(a) * l * .5 + (R() - .5) * 30, cx + Math.cos(a) * l, cy + Math.sin(a) * l); x.stroke(); } }, false);
BAGS.forEach((b, i) => { const m = new T.MeshPhysicalMaterial({ color: b[0], roughness: .6, metalness: 0, sheen: .55, sheenColor: new T.Color(0xffffff), sheenRoughness: .45, envMapIntensity: .3, bumpMap: wrinkT, bumpScale: 2.2 });
  const mesh = new T.Mesh(bagGeo(31 + i * 17), m); const sc = (.92 + (i % 3) * .06) * b[4]; mesh.scale.set(sc * 1.05, sc, sc); mesh.position.set(b[1], 0, b[2]); mesh.rotation.y = b[3]; mesh.castShadow = mesh.receiveShadow = true; add(mesh);
  S.blob(g, b[1], b[2] + .05, 1.5, 1.5, .55); });

CAT = 'city';
/* ---------------- behind the stage: white residential blocks with lit windows, a road of street lights ---------------- */
function facade(seed, cols, rows) { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return canvasTex(cols * 32, rows * 40, (x, w, h) => { x.fillStyle = '#414262'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < rows; j++) { x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(0, j * 40, w, 3);
      for (let i = 0; i < cols; i++) { const lit = r() < .09, warm = r(); x.fillStyle = lit ? (warm < .5 ? '#f3c27c' : warm < .85 ? '#ffd9a6' : '#dfe6ff') : (r() < .5 ? '#2f3452' : '#363b5a');
        x.fillRect(i * 32 + 9, j * 40 + 14, 14, 18);  } }
    x.fillStyle = '#474866'; x.fillRect(0, 0, w, 10); }); }
function block(x, z, w, h, d, ry, seed) { const fm = new T.MeshBasicMaterial({ map: facade(seed, Math.round(w / 2), Math.round(h / 3)), fog: true }); fm.color.setScalar(.82); TOD.fac.push({ m: fm, k: .82 });
  const side = new T.MeshBasicMaterial({ map: facade(seed + 5, Math.round(d / 2), Math.round(h / 3)), fog: true }); side.color.setScalar(.62); TOD.fac.push({ m: side, k: .62 });
  const roof = new T.MeshBasicMaterial({ color: 0x3a3b58, fog: true });
  const b = new T.Mesh(new T.BoxGeometry(w, h, d), [side, side, roof, roof, fm, fm]); b.position.set(x, h / 2, z); b.rotation.y = ry || 0; add(b);
  const p = new T.Mesh(new T.BoxGeometry(w * .3, 3, d * .5), new T.MeshBasicMaterial({ color: 0x45465f, fog: true })); p.position.set(x, h + 1.5, z); p.rotation.y = ry || 0; add(p); }
block(-80, -330, 46, 28.8, 16, .12, 101); block(-26, -350, 38, 35.2, 18, 0, 211); block(24, -320, 30, 32, 16, -.08, 307); block(70, -345, 44, 25.6, 16, -.15, 401); block(125, -370, 40, 32, 18, -.25, 503); block(-135, -380, 40, 22.4, 16, .3, 601);
block(0, -410, 60, 19.2, 18, 0, 701);
for (let i = 0; i < 30; i++) { const x = -160 + i * 11, z = -190 - (i % 2) * 3; add(box(.15, 9, .15, BODY, x, 4.5, z)); sprite(0xffc27a, .8, 2.2, x + .6, 9, z); }
for (let i = 0; i < 40; i++) sprite(0xffd2a0, .55, 1.2 + R() * 1.2, -220 + R() * 440, 1 + R() * 5, -300 - R() * 200);

CAT = 'misc';
/* ---------------- smoke: the grills' smoke drifting toward the stage, and the stage haze ---------------- */
const smokeT = (() => { const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), im = x.createImageData(N, N);
  const G = 16, gr = []; for (let i = 0; i < (G + 1) * (G + 1); i++) gr.push(R());
  const vn = (u, v, f) => { const gx = u * f, gy = v * f, x0 = Math.floor(gx), y0 = Math.floor(gy), tx = gx - x0, ty = gy - y0, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty), at = (a, b) => gr[((b % G + G) % G) * (G + 1) + ((a % G + G) % G)];
    return (at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy) + (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy; };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const u = i / N, v = j / N; let n = 0, a = .5; for (let o = 0; o < 5; o++) { n += vn(u + o * .17, v + o * .29, 2 * Math.pow(2, o)) * a; a *= .5; }
    const d = Math.hypot(u - .5, v - .5) * 2, fall = Math.max(0, 1 - d); const al = Math.pow(fall, 1.3) * Math.min(1, Math.max(0, n * 2.0 - .5) * 1.4);
    const k = (j * N + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = 255; im.data[k + 3] = Math.min(255, al * 255); }
  x.putImageData(im, 0, 0); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; })();
/* light that falls on a point of smoke: the moving-head beams it sits in, the LED X's, the coals and bulbs under it */
const LEDC = new T.Color(0x3d8cff);
function lightAt(p) { const c = new T.Color(0, 0, 0), w = V();
  BEAMS.forEach(b => { w.copy(p).sub(b.o); const al = w.dot(b.d); if (al < 0 || al > b.len) return; const perp = w.addScaledVector(b.d, -al).length(), r = .09 + al * b.spread;
    const f = Math.exp(-Math.pow(perp / (r + .5), 2)) * Math.pow(1 - al / b.len, .7); c.add(b.color.clone().multiplyScalar(f * b.k * 4)); });
  const dx = Math.max(0, 1 - V(p.x, p.y, p.z).distanceTo(V(0, XB + XS * .5, XZ + 1)) / 14); c.add(LEDC.clone().multiplyScalar(dx * dx * .9));
  return c; }
function puff(p, size, op, col) { const rot = R() * 6.28;
  const m = new T.SpriteMaterial({ map: smokeT, color: col, transparent: true, opacity: op, depthWrite: false, rotation: rot, fog: true });
  const s = new T.Sprite(m); s.position.copy(p); s.scale.setScalar(size); s.renderOrder = 7; add(s); TOD.smoke.push({ m, c: col.clone() });
  const L = lightAt(p); if (L.r + L.g + L.b > .03) { const m2 = new T.SpriteMaterial({ map: smokeT, color: L, transparent: true, opacity: Math.min(1, op * 2.2), depthWrite: false, rotation: rot, blending: T.AdditiveBlending, fog: false, toneMapped: false });
    const s2 = new T.Sprite(m2); s2.position.copy(p); s2.scale.setScalar(size); s2.renderOrder = 8; add(s2); TOD.smokeL.push({ m: m2, op: m2.opacity }); }
  return s; }
grills.forEach((gp, gi) => { const big = true, n = big ? 90 : 60, H = big ? 10 : 7, DX = big ? 5 + gi * 1.5 : 3, DZ = big ? -3.5 : -2;
  for (let i = 0; i < n; i++) { const t = i / (n - 1), j = Math.pow(t, 1.1), sw = Math.sin(t * 7 + gi) * .35 * t;
    const p = V(gp.x + Math.pow(t, 1.9) * DX + sw + (R() - .5) * (.15 + t * 1.0), 1.1 + j * H + (R() - .5) * t * .8, gp.z + Math.pow(t, 1.6) * DZ + (R() - .5) * (.15 + t * 1.0));
    const col = new T.Color(0xa4a8c4).lerp(new T.Color(0xffc08a), Math.max(0, .95 - t * 2.6));
    puff(p, .5 + t * (big ? 3.0 : 2.2), (t < .06 ? t / .06 : 1) * (.6 - t * .52) * (big ? 1 : .8), col); } });
for (let i = 0; i < 30; i++) { const p = V((R() - .5) * 15, DECK_H + .3 + R() * 2.6, -6.5 + R() * 6.5); puff(p, 2 + R() * 2.6, .08 + R() * .07, new T.Color(0x56607e)); }   /* the stage haze */
for (let i = 0; i < 22; i++) { const p = V((R() - .5) * 20, .4 + R() * .9, 1.5 + R() * 7); puff(p, 3 + R() * 3, .05 + R() * .05, new T.Color(0x4c5878)); }   /* low haze rolling off the deck onto the grass */

/* ---------------- reflections, sun, and the walk from noon to night ---------------- */
{ const pm = new T.PMREMGenerator(renderer); scene.updateMatrixWorld(true); const env = pm.fromScene(scene, .02, .1, 1500, { position: V(0, 3, 10) }); scene.environment = env.texture; scene.environmentIntensity = .55; pm.dispose(); }
const sun = new T.DirectionalLight(0xfff0dc, 0); sun.position.set(-60, 75, 70); sun.target.position.set(0, 0, 4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004;
Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 10, far: 220 }); scene.add(sun, sun.target);
renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;          /* nothing in the scene moves: the shadows are drawn once */
const LIGHTS = []; g.traverse(o => { if (o.isLight) LIGHTS.push({ l: o, i: o.intensity, fire: o.color.getHex() === 0xff7a2a }); });
const C = (a, b, c) => [new T.Color(a), new T.Color(b), new T.Color(c)];
const FOG = C(0xc4d2df, 0x343b64, 0x101426), HS = C(0xd6e4ff, 0x3d4a80, 0x1c2548), HG = C(0x5d6c42, 0x101808, 0x05080a);
const P3 = (a, b, c, u) => u < 1 ? a + (b - a) * u : b + (c - b) * (u - 1);
const PC = (arr, u, out) => out.copy(u < 1 ? arr[0] : arr[1]).lerp(u < 1 ? arr[1] : arr[2], u < 1 ? u : u - 1);
const DAY = { spr: { led: [0, 1, 1.1], lens: [0, 1, 1.1], bulb: [.18, 1, 1.05], fire: [.6, 1, 1], city: [0, 1, 1.15], misc: [.15, 1, 1.05] } };
let lastU = -1; const tmpC = new T.Color();
function setTime(u) {
  if (Math.abs(u - lastU) < .002) return; lastU = u;
  skyM.uniforms.u.value = u; PC(FOG, u, scene.fog.color);
  PC(HS, u, hemi.color); PC(HG, u, hemi.groundColor); hemi.intensity = P3(1.7, .42, .26, u);
  sun.intensity = P3(2.6, 0, 0, u); renderer.toneMappingExposure = P3(.92, 1, 1.06, u);
  const day = P3(0, 1, 1, u), night = P3(1, 1, 1.12, u);
  TOD.spr.forEach(s => { const k = DAY.spr[s.cat] || DAY.spr.misc; s.m.opacity = s.op * P3(k[0], k[1], k[2], u); });
  TOD.led.forEach(o => o.m.color.setScalar(o.k * P3(.07, 1, 1.04, u)));
  TOD.beam.forEach(o => { o.m.uniforms.k.value = o.k * P3(0, 1, 1.35, u); });
  TOD.smokeL.forEach(o => { o.m.opacity = Math.min(1, o.op * day); });
  TOD.smoke.forEach(o => { o.m.color.copy(o.c).multiplyScalar(P3(1.9, 1, .62, u)); });
  TOD.fac.forEach(o => o.m.color.setRGB(o.k * P3(2.1, 1, .7, u), o.k * P3(2.1, 1, .7, u), o.k * P3(1.75, 1, .7, u)));
  LIGHTS.forEach(o => { if (o.l !== sun) o.l.intensity = o.i * (o.fire ? 1 : P3(.12, 1, 1.12, u)); });
  bulbM.color.setScalar(P3(.45, 1, 1.05, u)); WALL.emissiveIntensity = .08 * day; TENTW.emissiveIntensity = .2 * day; TENT.emissiveIntensity = .05 * day;
}

/* three stops on one walk: noon from the way in, 6:10 pm among the beanbags, 9 pm in front of the stage */
const POSES = [
  { p: [-3.2, 1.7, 38], t: [-.4, 3.3, -4], fov: 38, pp: [-2, 1.8, 50], pt: [0, 3.6, -4], pf: 58 },
  { p: [-8.6, 1.45, 27], t: [-.2, 3.2, -4], fov: 39, pp: [-5, 1.6, 33], pt: [0, 3.4, -4], pf: 60 },
  { p: [-3.4, 1.6, 15], t: [0, 4, -5], fov: 46, pp: [-1.8, 1.7, 19], pt: [0, 4.2, -5], pf: 64 }];
[0, 1, 2].forEach(i => S.station(0, { c: [0, 3.6, -3], rx: 13, ry: 6, yaw: -.32, pitch: .02, drift: .08, fx: .8, fy: .8, ox: 0, oy: 0, oxp: 0, oyp: .17, keyK: 1e-6, noMirror: true }));
const vA = V(), vB = V(), tA = V(), tB = V();
const sm = x => x * x * (3 - 2 * x);
setTime(1);
S.onFrame((time, i, local) => {
  const G = Math.min(2, Math.max(0, i + local - .5)), a = Math.min(1, Math.floor(G)), f = sm(G - a), ph = FP.phone(), A = POSES[a], B = POSES[a + 1];
  vA.set(...(ph ? A.pp : A.p)); vB.set(...(ph ? B.pp : B.p)); tA.set(...(ph ? A.pt : A.t)); tB.set(...(ph ? B.pt : B.t));
  cam.position.copy(vA.lerp(vB, f)); cam.lookAt(tA.lerp(tB, f)); cam.fov = (ph ? A.pf : A.fov) + ((ph ? B.pf : B.fov) - (ph ? A.pf : A.fov)) * f; cam.far = 1500; cam.updateProjectionMatrix();
  sky.position.copy(cam.position);
  S.key.intensity = 0; scene.fog.near = P3(50, 40, 36, G); scene.fog.far = P3(560, 470, 420, G);
  setTime(G);
});
S.ready();
}


/* perf21 F1 (21 Oct): three.js and the 3D engine are fetched when the 3D chapter comes within one and a half screens,
   not with the page; then the chapter is built exactly as before (near3d(sec, build) above). */
function near3d(el, go) {
  if (!el) return;
  const load = () => import('../../assets/fp/fp3d.js?v=21').then(m => { stage = m.stage; T = m.T; go(); });
  if (!('IntersectionObserver' in window)) { load(); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '150% 0px' });
  io.observe(el);
}
