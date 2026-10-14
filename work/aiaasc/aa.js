/* AIAASC (American International Accreditation Association of Schools and Colleges), identity and campaigns, 2021: the idea as 3D,
   made for this portfolio.
   What is drawn, and where each part comes from:
   - the flag: a plain drawing of the American flag as moving cloth. The mark's colours come from it (our rebranding presentation,
     26 March 2021: "Blue and Red are the colors of the American flag"). One star and one red stripe leave the cloth and become the star and
     the line of the mark; the place they leave on the cloth goes empty, so they are seen to leave it. The flag itself is drawn here; it is
     not a piece of the delivered work.
   - the logo: every outline is the delivered logo file (archive 028, 20 October 2021), read as vectors into mark.svg. Nothing is redrawn.
     It is taken apart the way its own toolkit describes it (18 August 2021): the word mark, and a symbol in two layers, the star and the
     swoosh. The four letters of the old mark (AIAA) rise out of the plinth first, then S and C. From the front it is the logo again.
     NO SIGN WAS BUILT: this is a model of the logo, not of a built piece.
   - the world: the association's own dotted world map from its campaign, laid flat; the seven markets are the ones named in our strategic
     marketing proposal of November 2020. Places on a drawn map are set by eye.
   - the system: fifteen whole pages of our brand toolkit of 18 August 2021, bound as a book whose pages turn. On a phone it is bound
     at the top, so each spread stands one page above the other.
   - the event set: only finished pieces of the toolkit: its long navy banner (page 61), two of its roll-ups (page 62) and its ring
     banner (page 63, the logo alone). The pieces that carry the template words HEAD LINE GOES HERE are left out.
   - the campaign: the eight back-to-school posts of August and September 2021 (copies recovered from the designer's portfolio), each whole,
     as framed prints on a wall. On a phone the wall is two posts wide and four high, all of it in the frame. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

const sec = document.querySelector('.fp-model'), FP = window.FP;
/* the brand room: the 3D sits on the toolkit's own dark (#302c3a), its rim light is the toolkit's light blue (#4c75ba) */
const INK = 0x302c3a;
const S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.0, fog: INK, floorColor: 0x2a2734, floorRough: .55, mirrorK: 1.3, rim: 0x4c75ba, rimI: .55 });
if (S) boot();

async function boot() {
  const { station, std, box, renderer } = S, E = FP.ease, seg = FP.seg, none = { drift: .4, keyK: .6 }, PH = FP.phone();
  renderer.localClippingEnabled = true; renderer.setClearColor(INK, 1);
  const svg = await (await fetch('a/3d/mark.svg')).text();
  const BASE = 408.6, TOP = 364.76, XC = 421.82, K = 2.44 / (BASE - TOP), PL_H = 1.1, PL_D = 1.0, LET_D = .26, LH = 2.7;
  const mx = X => (X - XC) * K, my = Y => (BASE - Y) * K + PL_H;
  const shapesOf = d => { const tok = d.match(/[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/g), out = []; let i = 0, cmd = null, cur = null; const nx = () => +tok[i++];
    while (i < tok.length) { if (/[MLCZ]/.test(tok[i])) cmd = tok[i++]; if (cmd === 'Z') { if (cur) cur.closePath(); continue; }
      if (cmd === 'M') { cur = new T.Shape(); out.push(cur); const x = nx(), y = nx(); cur.moveTo(mx(x), my(y)); cmd = 'L'; }
      else if (cmd === 'L') { const x = nx(), y = nx(); cur.lineTo(mx(x), my(y)); }
      else if (cmd === 'C') { const a = nx(), b = nx(), c = nx(), e = nx(), f = nx(), g = nx(); cur.bezierCurveTo(mx(a), my(b), mx(c), my(e), mx(f), my(g)); } }
    return out; };
  const G = {}; svg.replace(/<g id="([^"]+)" fill="([^"]+)">([\s\S]*?)<\/g>/g, (m, id, fill, body) => { G[id] = { fill, ds: (body.match(/d="[^"]+"/g) || []).map(s => s.slice(3, -1)) }; });
  const glowTex = (streaks) => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 2, 128, 128, 128);
    g.addColorStop(0, 'rgba(235,242,255,.95)'); g.addColorStop(.12, 'rgba(190,210,255,.45)'); g.addColorStop(.4, 'rgba(120,150,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    if (streaks) { x.globalCompositeOperation = 'lighter'; [[0, 1], [Math.PI / 2, .8], [Math.PI / 4, .28], [-Math.PI / 4, .28]].forEach(([a, k]) => { x.save(); x.translate(128, 128); x.rotate(a); const l = x.createLinearGradient(-128, 0, 128, 0); l.addColorStop(0, 'rgba(160,190,255,0)'); l.addColorStop(.5, 'rgba(235,242,255,' + k + ')'); l.addColorStop(1, 'rgba(160,190,255,0)'); x.fillStyle = l; x.fillRect(-128, -1.6, 256, 3.2); x.restore(); }); }
    return new T.CanvasTexture(c); };

  /* 0 · Alpha: the first plate of our rebranding presentation (26 March 2021) is a tunnel of A-shaped frames with a star of light at its
     end: "A, the first letter... AIAASC as the alpha in educational standards". Here it is a real tunnel: scroll and you travel through it.
     The star has volume and its own light, and it only turns a little, so it never shows its edge. */
  const sA = station(-44, Object.assign({}, none, { noMirror: true, c: [0, 2.3, 0], rx: 3.0, ry: 2.5, yaw: 0, pitch: -.04, drift: .1, w: 1.2, fx: .7, fy: .86, ox: -.15, oy: -.02, fxp: 1.5, fyp: .5, oxp: 0, oyp: .1 }));
  const tun = new T.Group(); sA.g.add(tun);
  const triFrame = (() => { const o = new T.Shape(); o.moveTo(-2.9, 0); o.lineTo(2.9, 0); o.lineTo(0, 4.9); o.closePath(); const h = new T.Path(); h.moveTo(-2.5, .22); h.lineTo(0, 4.45); h.lineTo(2.5, .22); h.closePath(); o.holes.push(h); return new T.ExtrudeGeometry(o, { depth: .5, bevelEnabled: false }); })();
  const frameMat = std({ color: 0x8f96c8, roughness: .35, metalness: .5, emissive: 0x2a3180, emissiveIntensity: .35 });
  for (let k = 0; k < 11; k++) { const m = new T.Mesh(triFrame, frameMat); m.position.set(0, -.15, -k * 2.6); tun.add(m); }
  const farStar = (() => { const sh = new T.Shape(); for (let k = 0; k < 10; k++) { const a = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? .382 : 1; k ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } sh.closePath(); const geo = new T.ExtrudeGeometry(sh, { depth: .32, bevelEnabled: true, bevelSize: .06, bevelThickness: .08, bevelSegments: 3 }); geo.center();
    const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdfe8ff, emissiveIntensity: 1.6, roughness: .2, metalness: .1, fog: false })); m.position.set(0, 1.9, -30); m.scale.setScalar(.75); tun.add(m);
    const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex(false), blending: T.AdditiveBlending, depthWrite: false, fog: false })); glow.scale.setScalar(5); glow.position.copy(m.position); tun.add(glow);
    const flare = new T.Sprite(new T.SpriteMaterial({ map: glowTex(true), blending: T.AdditiveBlending, depthWrite: false, depthTest: false, fog: false, opacity: .9 })); flare.scale.setScalar(9); flare.position.copy(m.position).add(new T.Vector3(0, 0, .5)); flare.renderOrder = 9; tun.add(flare); return m; })();
  { const lamp = new T.PointLight(0xdfe6ff, 260, 60, 1.6); lamp.position.set(0, 2, -29); tun.add(lamp); const way = new T.Mesh(new T.PlaneGeometry(4.6, 34), std({ color: 0x0c1030, roughness: .25, metalness: .6 })); way.rotation.x = -Math.PI / 2; way.position.set(0, .02, -13); tun.add(way); }
  const alpha = (t, time, on) => { tun.visible = on; tun.position.z = E(t) * 21; farStar.rotation.y = Math.sin(time * .6) * .42; };

  /* 1 · the logo, in layers */
  const s0 = station(0, Object.assign({}, none, { noMirror: true, c: [0, 2.9, 0], rx: 5.6, ry: 3.1, yaw: .34, pitch: .02, drift: -.7, w: 1.6, fx: .66, fy: .78, ox: -.16, oy: .02, rxp: 6.4, fxp: .96, fyp: .4, oxp: 0, oyp: .13, yawp: .2 })), g = s0.g;
  const CLIP = new T.Plane(new T.Vector3(0, 1, 0), -PL_H);   /* the letters rise out of the plinth: nothing of them shows below its top */
  const lm = o => std(Object.assign({ clippingPlanes: [CLIP], clipShadows: true }, o));
  const WHITE = lm({ color: 0xf3f2ee, roughness: .5 }), NAVY = std({ color: 0x29306b, roughness: .55 }), NAVYD = lm({ color: 0x1a1f4a, roughness: .6 });
  const RED = lm({ color: 0xd60f29, roughness: .45, emissive: 0xd60f29, emissiveIntensity: .1 }), REDS = lm({ color: 0x8e0a1b, roughness: .5 }), REDL = std({ color: 0xd60f29, roughness: .45, emissive: 0xd60f29, emissiveIntensity: .12, side: T.DoubleSide });
  const REDR = std({ color: 0xb31329, roughness: .7, emissive: 0xd60f29, emissiveIntensity: 0, side: T.DoubleSide });
  const X0 = mx(337.07), X1 = mx(506.56), PW = X1 - X0 + 1, PX = (X0 + X1) / 2;
  const pl = box(PW, PL_H, PL_D, NAVY, PX, PL_H / 2, -PL_D / 2 + LET_D / 2 + .12); g.add(pl); let plate;
  { const U0 = 336.2, U1 = 507.4, V0 = 412.6, V1 = 429, PP = 60, cv = document.createElement('canvas'); cv.width = Math.round((U1 - U0) * PP); cv.height = Math.round((V1 - V0) * PP);
    const x = cv.getContext('2d'); x.scale(PP, PP); x.translate(-U0, -V0); x.fillStyle = '#f3f2ee'; ['strap-1', 'strap-2'].forEach(id => G[id].ds.forEach(d => x.fill(new Path2D(d), 'nonzero')));
    const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 16;
    const m = new T.Mesh(new T.PlaneGeometry((U1 - U0) * K, (V1 - V0) * K), new T.MeshStandardMaterial({ map: t, transparent: true, roughness: .6, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .12 }));
    m.position.set(mx((U0 + U1) / 2), my((V0 + V1) / 2), pl.position.z + PL_D / 2 + .004); m.renderOrder = 6; g.add(m); plate = m; }
  const letters = [['letter-a1', WHITE, NAVYD], ['letter-i', WHITE, NAVYD], ['letter-a2', WHITE, NAVYD], ['letter-a3', WHITE, NAVYD], ['letter-s', RED, REDS], ['letter-c', RED, REDS]].map(a => { const geo = new T.ExtrudeGeometry([].concat(...G[a[0]].ds.map(shapesOf)), { depth: LET_D, bevelEnabled: false, curveSegments: 28 }); geo.translate(0, -PL_H, -LET_D / 2);
    const m = new T.Mesh(geo, [a[1], a[2]]); m.castShadow = true; m.position.y = PL_H - LH; m.visible = false; g.add(m); return m; });
  /* the two symbol layers leave the plane along the sight lines of the front view, so from the front each point stays where the logo has it */
  const LOCK = { x: 0, y: 2.35, z: 24 };
  const along = (geo, zf) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = zf(x, y) + p.getZ(i), s = 1 - z / LOCK.z; p.setXYZ(i, LOCK.x + (x - LOCK.x) * s, LOCK.y + (y - LOCK.y) * s, z); } p.needsUpdate = true; geo.computeVertexNormals(); return geo; };
  const SX0 = mx(382.5), SX1 = mx(428.75), ZF = 2.6, ZB = -2.0, TH = .07, zSw = x => ZF + (ZB - ZF) * Math.min(1, Math.max(0, (x - SX0) / (SX1 - SX0)));
  const swShapes = [].concat(...G.swoosh.ds.map(shapesOf));
  const swoosh = (() => { const geo = new T.ExtrudeGeometry(swShapes, { depth: TH, bevelEnabled: false, curveSegments: 60 }); geo.translate(0, 0, -TH / 2); const m = new T.Mesh(along(geo, zSw), REDL); m.castShadow = true; g.add(m); return m; })();
  const star = (() => { const sh = [].concat(...G.star.ds.map(shapesOf)), geo = new T.ExtrudeGeometry(sh, { depth: TH, bevelEnabled: false }); geo.computeBoundingBox(); const c = geo.boundingBox.getCenter(new T.Vector3()), r0 = (geo.boundingBox.max.x - geo.boundingBox.min.x) / 2; geo.translate(-c.x, -c.y, -TH / 2);
    const ZS = -2.6, s = 1 - ZS / LOCK.z, m = new T.Mesh(geo, std({ color: 0xd60f29, roughness: .45, emissive: 0xd60f29, emissiveIntensity: .1 })); m.userData = { k: s, r0, end: new T.Vector3(LOCK.x + (c.x - LOCK.x) * s, LOCK.y + (c.y - LOCK.y) * s, ZS) }; m.position.copy(m.userData.end); g.add(m); return m; })();
  S.blob(g, PX, .4, PW + 1.5, 2.2, .7);

  /* the flag the mark comes from: blue and red are the colours of the American flag (our rebranding presentation, 26 March 2021).
     The flag is cloth: it moves. One star leaves the blue field and one red stripe peels off the cloth; they become the star and the line
     of the mark, and the cloth is left without them. */
  const FW = 9.6, FH = FW / 1.9, FX = PX, FY = 3.35, FZ = -1.4, SEGX = 76, SEGY = 40, SHT = 1000 / 13, STRIPE = 8, SROW = 4, SCOL = 3;
  const fcv = document.createElement('canvas'); fcv.width = 1900; fcv.height = 1000; const fx = fcv.getContext('2d');
  const flagTex = new T.CanvasTexture(fcv); flagTex.colorSpace = T.SRGBColorSpace; flagTex.anisotropy = 16;
  let flagKey = '';
  const paintFlag = (gone, starGone) => { const key = Math.round(gone * 30) + '|' + starGone; if (key === flagKey) return; flagKey = key;
    for (let i = 0; i < 13; i++) { fx.fillStyle = i % 2 ? '#f3f2ee' : '#b31329'; fx.fillRect(0, i * SHT, 1900, SHT + 1); }
    if (gone > 0) { fx.fillStyle = 'rgba(243,242,238,' + Math.min(1, gone).toFixed(3) + ')'; fx.fillRect(0, STRIPE * SHT, 1900, SHT + 1); }
    const cw = 760, ch = SHT * 7; fx.fillStyle = '#29306b'; fx.fillRect(0, 0, cw, ch); fx.fillStyle = '#f3f2ee';
    const st = (cx, cy, r) => { fx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .382 : r; fx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } fx.closePath(); fx.fill(); };
    for (let r = 0; r < 9; r++) { const n = r % 2 ? 5 : 6; for (let c = 0; c < n; c++) { if (starGone && r === SROW && c === SCOL) continue; st((cw / 12) * (r % 2 ? 2 + c * 2 : 1 + c * 2), (ch / 10) * (r + 1), 23); } }
    flagTex.needsUpdate = true; };
  paintFlag(0, false);
  const flagGeo = new T.PlaneGeometry(FW, FH, SEGX, SEGY), flagBase = flagGeo.attributes.position.array.slice();
  const flagMat = new T.MeshStandardMaterial({ map: flagTex, side: T.DoubleSide, roughness: .85, metalness: 0, transparent: true });
  const flag = new T.Mesh(flagGeo, flagMat); flag.position.set(FX, FY, FZ); flag.userData.noMirror = true; g.add(flag);
  const wz = (x, y, time, amp) => (Math.sin(x * 1.25 - time * 1.9 + y * .35) * .26 + Math.sin(x * 2.6 - time * 2.7) * .08) * amp * (.25 + (x / FW + .5) * .75);
  const wave = (time, amp) => { const p = flagGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, wz(flagBase[i * 3], flagBase[i * 3 + 1], time, amp)); p.needsUpdate = true; flagGeo.computeVertexNormals(); };
  /* where things start on the flag: one star of the blue field (row 5, star 4), and the red stripe just under the blue field */
  const SFX = (760 / 12) * (1 + SCOL * 2) / 1900 * FW - FW / 2, SFY = FH / 2 - ((SHT * 7 / 10) * (SROW + 1)) / 1000 * FH, starR = FW * 23 / 1900;
  const stripeTop = FH / 2 - FH / 13 * STRIPE, stripeBot = stripeTop - FH / 13;
  /* the line as a ribbon: it starts as that whole stripe, lying in the cloth and moving with it, and bends into the swoosh.
     Its end state is the swoosh's own outline, sampled. */
  const NR = 64, ribGeo = new T.BufferGeometry(), ribPos = new Float32Array((NR + 1) * 6), ribA = new Float32Array((NR + 1) * 4), ribB = new Float32Array((NR + 1) * 6);
  { const pts = [].concat(...swShapes.map(sh => sh.getPoints(80))), xs = pts.map(p => p.x), xa = Math.min(...xs), xb = Math.max(...xs), ix = [];
    for (let n = 0; n <= NR; n++) { const x = xa + (xb - xa) * (n / NR), w = (xb - xa) / NR * 1.6; let lo = 1e9, hi = -1e9; pts.forEach(p => { if (Math.abs(p.x - x) <= w) { lo = Math.min(lo, p.y); hi = Math.max(hi, p.y); } }); if (lo > hi) { lo = hi = ix.length ? ix[ix.length - 1][1] : 0; }
      ix.push([x, lo, hi]); }
    ix.forEach((a, n) => { const z = zSw(a[0]), sc = 1 - z / LOCK.z, X = LOCK.x + (a[0] - LOCK.x) * sc, u = n / NR;
      ribB.set([X, LOCK.y + (a[2] - LOCK.y) * sc, z, X, LOCK.y + (a[1] - LOCK.y) * sc, z], n * 6);
      const lx = -FW / 2 + FW * u; ribA.set([lx, stripeTop, lx, stripeBot], n * 4); });
    const idx = []; for (let n = 0; n < NR; n++) { const a = n * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    ribGeo.setAttribute('position', new T.BufferAttribute(ribPos, 3)); ribGeo.setIndex(idx); }
  const ribbon = new T.Mesh(ribGeo, REDR); ribbon.frustumCulled = false; ribbon.visible = false; g.add(ribbon);
  const cA = new T.Color().setRGB(.702, .075, .161, T.SRGBColorSpace), cB = new T.Color().setRGB(.839, .059, .161, T.SRGBColorSpace);
  const logo = (t, time) => {
    const fl = E(seg(t, .5, .72)), amp = 1 - fl * .6, fz = FZ - fl * 3;            /* the flag steps back and lets go */
    flag.visible = fl < 1; flagMat.opacity = 1 - fl; flag.position.z = fz; wave(time, amp);
    const pu = E(seg(t, .4, .52)); pl.visible = pu > 0; pl.scale.y = Math.max(.001, pu); pl.position.y = PL_H / 2 * pu;
    /* the old mark's four letters rise out of the plinth first; then S and C, in red */
    letters.forEach((m, n) => { const a = n < 4 ? .5 + n * .03 : .74 + (n - 4) * .035, u = E(seg(t, a, a + (n < 4 ? .13 : .11))); m.position.y = PL_H - (1 - u) * LH; m.visible = u > .002; });
    const po = E(seg(t, .84, .94)); plate.material.opacity = po; plate.visible = po > 0;
    /* the star: out of the blue field, forward, then to its place above the A */
    const su = E(seg(t, .12, .56));
    { const e = star.userData, k = e.k, arc = Math.sin(su * Math.PI), z0 = fz + wz(SFX, SFY, time, amp) + .03; star.position.set(FX + SFX + (e.end.x - FX - SFX) * su, FY + SFY + (e.end.y - FY - SFY) * su + arc * .5, z0 + (e.end.z - z0) * su + arc * 3.2);
      const sc = (starR / e.r0) + (k - starR / e.r0) * su; star.scale.setScalar(sc); star.rotation.z = (1 - su) * 3.4; star.visible = t > .12; const cu = E(seg(su, .08, .5)); star.material.color.setRGB(.953 + (.84 - .953) * cu, .949 + (.06 - .949) * cu, .933 + (.16 - .933) * cu, T.SRGBColorSpace); star.material.emissiveIntensity = .1 * cu; }
    /* the stripe: peels off the cloth and bends into the line; the stripe's own place on the cloth goes empty as it leaves */
    const u = E(seg(t, .2, .62));
    { const arc = Math.sin(u * Math.PI); for (let n = 0; n <= NR; n++) { const v = n / NR, soft = Math.min(1, v / .12, (1 - v) / .12), lift = Math.min(1, u * 4);
        for (let s = 0; s < 2; s++) { const ax = ribA[n * 4 + s * 2], ay = ribA[n * 4 + s * 2 + 1], o = n * 6 + s * 3, Ax = FX + ax, Ay = FY + ay, Az = fz + wz(ax, ay, time, amp) + .012;
          let X = Ax + (ribB[o] - Ax) * u, Y = Ay + (ribB[o + 1] - Ay) * u + arc * (.3 + v * .5) + arc * Math.sin(v * 7 - time * 2.6) * .12, Z = Az + (ribB[o + 2] - Az) * u + arc * (1.2 + v * 1.4) + arc * Math.sin(v * 9 - time * 3.2) * .22;
          ribPos[o] = X; ribPos[o + 1] = Y; ribPos[o + 2] = Z; }
        /* the ends soften to points as it lifts, so it reads as cloth, not a cut plank */
        if (lift > 0) { const o = n * 6, mid = (ribPos[o + 1] + ribPos[o + 4]) / 2, k2 = 1 - lift * (1 - (.3 + .7 * soft)) * (1 - u * .85); ribPos[o + 1] = mid + (ribPos[o + 1] - mid) * k2; ribPos[o + 4] = mid + (ribPos[o + 4] - mid) * k2; } }
      ribGeo.attributes.position.needsUpdate = true; ribGeo.computeVertexNormals(); ribbon.visible = t > .2 && u < 1; swoosh.visible = u >= 1;
      REDR.color.copy(cA).lerp(cB, E(seg(u, 0, .4))); REDR.emissiveIntensity = .12 * E(seg(u, 0, .4)); }
    paintFlag(t > .2 ? Math.min(1, u * 5) : 0, t > .125);
  };

  /* 2 · to the world: the plan. The ground is the association's own dotted world map (from its back-to-school post "It's time to impact
     the WORLD"), laid flat. The red line leaves the United States and lands on the seven markets named in our strategic marketing proposal
     of November 2020: the UAE, Saudi Arabia, Kuwait, Oman, Bahrain, Qatar, Egypt and North Africa. Places are set by eye on a drawn map. */
  const s1 = station(42, Object.assign({}, none, { noMirror: true, c: [PH ? -.4 : .6, .5, -.5], rx: 5.2, ry: 1.9, yaw: -.42, pitch: .52, drift: PH ? .22 : .8, w: 1.25, fx: .96, fy: .62, ox: -.02, oy: .1, rxp: 4.6, fxp: .98, fyp: .4, oxp: 0, oyp: .13, yawp: -.1 }));
  const MP = (px, py) => [(px - 750) * .011, (py - 380) * .011];
  { const mapT = S.tex('world.webp'), ground = new T.Mesh(new T.PlaneGeometry(1500 * .011, 760 * .011), new T.MeshBasicMaterial({ map: mapT, transparent: true, depthWrite: false })); ground.rotation.x = -Math.PI / 2; ground.position.y = .03; ground.renderOrder = 3; s1.g.add(ground);
    const slab = new T.Mesh(new T.BoxGeometry(1500 * .011 + .8, .1, 760 * .011 + .8), std({ color: 0x1b2157, roughness: .7 })); slab.position.y = -.03; slab.receiveShadow = true; s1.g.add(slab); }
  const HOME = MP(432, 232), MARKETS = [[850, 338], [932, 368], [953, 334], [1002, 384], [966, 352], [975, 362], [992, 368]].map(p => MP(p[0], p[1]));
  const starShape = (() => { const sh = new T.Shape(); for (let k = 0; k < 10; k++) { const a = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? .382 : 1; k ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } sh.closePath(); return sh; })();
  const starGeo = new T.ExtrudeGeometry(starShape, { depth: .25, bevelEnabled: false }); starGeo.translate(0, 0, -.125);
  const home = new T.Mesh(starGeo, std({ color: 0xffffff, roughness: .35, emissive: 0xffffff, emissiveIntensity: .7 })); home.scale.setScalar(.22); home.position.set(HOME[0], .62, HOME[1]); s1.g.add(home);
  { const stem = new T.Mesh(new T.CylinderGeometry(.008, .008, .5, 6), std({ color: 0xcfd3e6 })); stem.position.set(HOME[0], .25, HOME[1]); s1.g.add(stem); }
  const arcs = MARKETS.map((m, n) => { const a = new T.Vector3(HOME[0], .62, HOME[1]), b = new T.Vector3(m[0], .44, m[1]), mid = a.clone().add(b).multiplyScalar(.5); mid.y = 2.0 + n * .22; mid.z -= .5 - n * .16;
      const tube = new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(a, mid, b), 90, .018, 8, false), new T.MeshBasicMaterial({ color: 0xd60f29 })); s1.g.add(tube);
      const pin = new T.Mesh(starGeo, std({ color: 0xd60f29, roughness: .45, emissive: 0xd60f29, emissiveIntensity: .25 })); pin.position.copy(b); s1.g.add(pin);
      const stem = new T.Mesh(new T.CylinderGeometry(.006, .006, .44, 6), std({ color: 0xcfd3e6 })); stem.position.set(m[0], .22, m[1]); s1.g.add(stem);
      return { tube, pin, stem, n, N: tube.geometry.index.count }; });
  const world = (t, time) => { home.rotation.y = time * .6; arcs.forEach(a => { const u = E(seg(t, .04 + a.n * .07, .04 + a.n * .07 + .3)), k = E(seg(t, .26 + a.n * .07, .38 + a.n * .07)); a.tube.geometry.setDrawRange(0, Math.floor(a.N * u / 6) * 6); a.pin.scale.setScalar(Math.max(.001, k * .13)); a.pin.rotation.y = time * .8 + a.n; a.stem.scale.y = Math.max(.001, k); a.stem.position.y = .22 * k; }); };

  /* 3 · the system: the brand toolkit as a book. Each sheet is one whole page of the toolkit of 18 August 2021; the pages turn.
     On a desktop it opens like a book and both pages of each spread sit inside the frame. On a phone the same book is bound at the top,
     like a flip book on a stand, so each spread stands one page above the other, both whole and at reading size. */
  const BW = 2.9, BH2 = BW * 778 / 1100, BKX = .2, BY0 = 2.25, PAGES = [1, 15, 31, 34, 29, 27, 20, 47, 48, 50, 69, 57, 59, 60, 71];
  const s2 = station(84, Object.assign({}, none, PH ? { noMirror: true, c: [BKX, BY0 - .05, 0], rx: 3.3, ry: 2.2, yaw: 0, pitch: .1, drift: .05, w: 2.2, rxp: BW / 2 + .16, fxp: .98, fyp: .6, oxp: 0, oyp: .06, yawp: 0 }
    : { noMirror: true, c: [BKX, 1.25, .1], rx: 3.3, ry: 1.25, yaw: -.06, pitch: .4, drift: .14, w: 2.1, fx: .9, fy: .7, ox: -.04, oy: -.01 }));
  const book = new T.Group(); s2.g.add(book);
  if (PH) { book.position.set(BKX, BY0, 0); book.rotation.x = -.28; } else { book.position.set(BKX, .5, 0); book.rotation.x = -.62; }
  { const cover = PH ? new T.Mesh(new T.BoxGeometry(BW + .12, BH2 * 2 + .12, .05), std({ color: 0x0d1030, roughness: .92 })) : new T.Mesh(new T.BoxGeometry(BW * 2 + .12, BH2 + .12, .05), std({ color: 0x0d1030, roughness: .92 }));
    if (PH) cover.position.set(0, 0, -.04); else cover.position.set(0, BH2 / 2, -.04); cover.castShadow = true; book.add(cover);
    if (PH) { const bar = new T.Mesh(new T.CylinderGeometry(.03, .03, BW + .2, 12), std({ color: 0xb9bcc6, roughness: .3, metalness: .8 })); bar.rotation.z = Math.PI / 2; bar.position.set(0, 0, .03); book.add(bar); }
    S.blob(s2.g, BKX, .6, PH ? BW + 1 : BW * 2 + 1, 2.2, .7); }
  const paper = std({ color: 0x1a1f4a, roughness: .9, side: T.DoubleSide });
  /* two-sided sheets, as in a real book: the front is one page, the back is the next */
  const NS2 = Math.ceil(PAGES.length / 2), NT = PAGES.length % 2 ? NS2 - 1 : NS2, sheets = Array.from({ length: NS2 }, (_, n) => { const hinge = new T.Group(), front = new T.Mesh(new T.PlaneGeometry(BW, BH2), new T.MeshBasicMaterial({ map: S.tex('tk-' + PAGES[n * 2] + '.webp') })), back = new T.Mesh(new T.PlaneGeometry(BW, BH2), PAGES[n * 2 + 1] ? new T.MeshBasicMaterial({ map: S.tex('tk-' + PAGES[n * 2 + 1] + '.webp') }) : paper);
      if (PH) { front.position.set(0, -BH2 / 2, .002); back.position.set(0, -BH2 / 2, -.002); back.rotation.x = Math.PI; }
      else { front.position.set(BW / 2, BH2 / 2, .002); back.position.set(BW / 2, BH2 / 2, -.002); back.rotation.y = Math.PI; }
      hinge.add(front, back); hinge.position.z = (NS2 - n) * .004; book.add(hinge); return { hinge, n }; });
  /* each turning sheet has its own slot of the scroll: hold, turn, hold */
  const pagesTurn = t => sheets.forEach(sh => { const u = sh.n >= NT ? 0 : E(seg(t * NT - sh.n, .3, .62)); if (PH) sh.hinge.rotation.x = -u * Math.PI; else sh.hinge.rotation.y = -u * Math.PI;
    sh.hinge.position.z = (u > .5 ? sh.n + 1 : (NS2 - sh.n)) * .004 + Math.sin(u * Math.PI) * .3; });

  /* 4 · the event set: the toolkit's own long navy banner (page 61, the logo alone) on a frame, two of its roll-ups (page 62) and its
     ring banner (page 63), standing as objects. Only finished pieces: none of them carries the template words. On a phone the same pieces stand closer together, so all of them are in the frame. */
  const s4e = station(108, Object.assign({}, none, PH ? { c: [-.45, 1.75, -.4], rx: 3.8, ry: 1.9, yaw: .3, pitch: .06, drift: -.3, rxp: 3.0, fxp: .97, fyp: .4, oxp: 0, oyp: .13, yawp: .22 }
    : { c: [-.55, 1.75, -.4], rx: 4.3, ry: 2.0, yaw: .38, pitch: .06, drift: -.5, fx: .8, fy: .72, ox: -.1, oy: -.02 }));
  { const g = s4e.g, metal = std({ color: 0xb9bcc6, roughness: .3, metalness: .8 }), face = f => new T.MeshBasicMaterial({ map: S.tex(f) }), edge = std({ color: 0x1b2157 });
    const L = PH ? { bw: 3.7, ru: [[-2.05, .3], [1.85, -.22]], ring: [-1.5, 3.05, .8] } : { bw: 5.2, ru: [[-2.75, .3], [2.55, -.3]], ring: [-3.3, 3.15, 1] };
    const BNW = L.bw, BNH = BNW * 567 / 1200, BY = .62 + BNH / 2, bn = new T.Mesh(new T.BoxGeometry(BNW, BNH, .06), [edge, edge, edge, edge, face('bn.webp'), edge]); bn.position.set(0, BY, -1.6); bn.castShadow = true; g.add(bn);
    [-1, 1].forEach(sx => { const leg = new T.Mesh(new T.CylinderGeometry(.018, .018, BY + BNH / 2, 8), metal); leg.position.set(sx * (BNW / 2 - .08), (BY + BNH / 2) / 2, -1.66); g.add(leg); const ft = box(.06, .03, .5, metal, sx * (BNW / 2 - .08), .015, -1.66); g.add(ft); });
    [[L.ru[0], 'ru-1.webp', 514 / 1106], [L.ru[1], 'ru-3.webp', 404 / 1151]].forEach(r => { const h = 2.0, w = h * r[2], o = new T.Group(); o.position.set(r[0][0], 0, -.3); o.rotation.y = r[0][1];
      const banner = new T.Mesh(new T.PlaneGeometry(w, h), face(r[1])); banner.position.y = .14 + h / 2; o.add(banner); const bk = new T.Mesh(new T.PlaneGeometry(w, h), std({ color: 0xdedfe6, side: T.BackSide })); bk.position.copy(banner.position); o.add(bk);
      const base = new T.Mesh(new T.BoxGeometry(w + .08, .12, .26), metal); base.position.y = .06; base.castShadow = true; o.add(base); const pole = new T.Mesh(new T.CylinderGeometry(.012, .012, h, 6), metal); pole.position.set(0, .14 + h / 2, -.03); o.add(pole);
      g.add(o); S.blob(g, r[0][0], -.25, w + .6, .7, .6); });
    /* the ring banner of page 63 (the one that carries the logo alone): a band that hangs from the ceiling; its front is the toolkit's own
       artwork, the rest of the band is its navy */
    { const k = L.ring[2], RH = .56 * k, TH = 1.9, R = RH * (1000 / 243) / TH, o = new T.Group(); o.position.set(L.ring[0], L.ring[1], .1); o.rotation.y = .32;
      const front = new T.Mesh(new T.CylinderGeometry(R, R, RH, 48, 1, true, -TH / 2, TH), new T.MeshBasicMaterial({ map: S.tex('ring.webp') }));
      const rest = new T.Mesh(new T.CylinderGeometry(R, R, RH, 48, 1, true, TH / 2, Math.PI * 2 - TH), std({ color: 0x1c2652, roughness: .7, side: T.DoubleSide }));
      const inner = new T.Mesh(new T.CylinderGeometry(R * .995, R * .995, RH, 48, 1, true), std({ color: 0x141b3d, roughness: .8, side: T.BackSide }));
      o.add(front, rest, inner);
      [0, 2.1, 4.2].forEach(a => { const c = new T.Mesh(new T.CylinderGeometry(.004, .004, 2.4, 6), metal); c.position.set(Math.sin(a) * R * .96, RH / 2 + 1.2, Math.cos(a) * R * .96); o.add(c); });
      g.add(o); } }

  /* 5 · it's time: the eight back-to-school posts as framed prints on a wall, lit. Each post is whole. On a phone the wall is two posts
     wide and four high, so each post is larger, and all eight are in the frame. */
  const FS = 1.5, GAP = .26, COLS = PH ? 2 : 4, ROWS = 8 / COLS, TOPY = PH ? 6.25 : 2.99;
  const s3 = station(150, Object.assign({}, none, PH ? { c: [0, TOPY - 1.5 * (FS + GAP), 0], rx: 1.9, ry: 2.0, yaw: -.1, pitch: .0, drift: .1, w: 1.2, rxp: 1.8, fxp: .98, fyp: .4, oxp: 0, oyp: .02, yawp: -.06 }
    : { c: [0, 2.05, 0], rx: 3.6, ry: 1.75, yaw: -.3, pitch: .0, drift: .6, w: 1.2, fx: .74, fy: .66, ox: -.12, oy: .03 }));
  { const WH = ROWS * (FS + GAP) + 1.6, wall = new T.Mesh(new T.PlaneGeometry(PH ? 6 : 12, WH), std({ color: 0x10132c, roughness: .92 })); wall.position.set(0, TOPY + FS / 2 + .5 - WH / 2, -.06); wall.receiveShadow = true; s3.g.add(wall);
    const lamp = new T.SpotLight(0xffffff, 90, 30, .7, .9, 1.3); lamp.position.set(-1.5, TOPY + 3.5, 7); lamp.target.position.set(0, TOPY - (ROWS - 1) * (FS + GAP) / 2, 0); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); s3.g.add(lamp, lamp.target);
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((p, n) => { const c = n % COLS, r = (n / COLS) | 0, x = (c - (COLS - 1) / 2) * (FS + GAP), y = TOPY - r * (FS + GAP) + .04, fr = new T.Mesh(new T.BoxGeometry(FS + .03, FS + .03, .07), std({ color: 0x0b0c14, roughness: .4, metalness: .3 })), face = new T.Mesh(new T.PlaneGeometry(FS, FS), new T.MeshBasicMaterial({ map: S.tex('post-' + p + '.webp') }));
      fr.position.set(x, y, .06); fr.castShadow = true; face.position.set(x, y, .097); s3.g.add(fr, face); }); }

  const compose = (i, l, tm) => { alpha(i === 0 ? seg(l, .04, .9) : 1, tm || 0, i === 0); logo(i < 1 ? 0 : i === 1 ? seg(l, .02, .86) : 1, tm || 0); world(i < 2 ? 0 : i === 2 ? seg(l, .02, .8) : 1, tm || 0); pagesTurn(i < 3 ? 0 : i === 3 ? seg(l, .04, .92) : 1); };
  compose(0, 0);
  S.onFrame((time_, i, local) => compose(i, local, time_));
  if (FP.rm) FP.on(() => { const on = sec.querySelector('.st.on'); compose(on ? +on.dataset.s : 0, 1); });
  S.ready();
}
