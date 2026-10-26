/* Al Forsan International Sports Resort, Abu Dhabi: identity and campaigns. The idea as real-time 3D, made for this portfolio.
   What is drawn, and where each part comes from:
   - the logo, in ENGLISH ONLY (Tony's ruling, 14 Oct: where a logo has an English version, only the English one). Every outline is read
     from the identity manual itself (136 pages, A3) into a/3d/mark.svg; no point is moved. The icon (the wave of the dunes, the arch, the
     knight on his horse) is from page 10; "AL FORSAN" and "INTERNATIONAL SPORTS RESORT" are the manual's own English lockup, page 24
     ("Grid study, Landscape system"), laid on the page-10 icon by the transform that makes the two icons coincide. The interactive study uses the primary black horse and lettering with gold gate/dunes on a neutral studio ground.
   - five centres: the manual's section 13, "Subsidiaries" (pages 119 to 134). Each sport centre keeps the mark and the two names and adds its
     own line in its own colour, read from its page: Equestrian (120), Paintball (129), Motor Sports (123), Water Sports (132), Shooting (126).
     The two names of a centre logo are read from the Equestrian page. The centre logos exist only in this bilingual form (no English
     version in the manual or the files), so they are shown exactly as the manual draws them, as made.
     One centre is held at a time, as large as the mark. The light of its colour on the floor and behind it is stage light, not artwork.
   - the manual: the printed book (its cover, pages 1, 16 and 17) lies closed and opens once, at the idea. No page turns.
   - the gateway: the campaign "Your gateway to awesomeness" built the arch of the mark as a gate in 3D, and every sport came through it.
     Here the same outline (arch and roof, page 10) is given depth, and the knight of the mark, his own outline given depth, in black, rides
     through it. The sand and the light are staging. NO GATE WAS BUILT AT THE RESORT BY US: this is a model of the mark, as the press
     advertisements show it. */
let stage, T;   /* perf21 F1: three.js and the 3D engine load when the 3D chapter is near: near3d() at the end */
if (!document.querySelector('.fp-model')) ({ stage, T } = await import('../../assets/fp/fp3d.js?v=21'));   /* perf21 F1: a page without the 3D chapter (film.html) gets them at once, as before */

export { T };
export const K = .02, XC = 928, YB = 396, LIFT = .34;
export const mx = X => (X - XC) * K, my = Y => (YB - Y) * K + LIFT;
export const Y_FOOT = my(234.3), Y_HOOF = my(253.8);
/* the English lockup (icon, then AL FORSAN over INTERNATIONAL SPORTS RESORT, to its right): its centre, and how far it floats above the
   floor when the icon stands where the manual's portrait logo put it. Builders that show the whole lockup move it by -LX, -LDY. */
export const LX = mx((817 + 1277.7) / 2), LY0 = my(265.4), LY1 = my(96.3), LDY = my(265.4) - LIFT;
export const CENTRES = [['c-equestrian', 0x005596], ['c-paintball', 0xfcb568], ['c-motor', 0xef3e42], ['c-water', 0x13b5ea], ['c-shooting', 0x008a5f]];
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1), L = (a, b, t) => a + (b - a) * t;
const out3 = t => 1 - Math.pow(1 - t, 3);
export const U = { ease, clamp, seg, L, out3 };

/* ---------- the vectors ---------- */
export async function loadKit(url) {
  const svg = await (await fetch(url)).text(), G = {};
  svg.replace(/<g id="([^"]+)" fill="([^"]+)">([\s\S]*?)<\/g>/g, (m, id, fill, body) => { G[id] = { fill, ds: (body.match(/d="[^"]+"/g) || []).map(s => s.slice(3, -1)) }; });
  const paths = d => { const tok = d.match(/[MLCZ]|-?\d*\.?\d+/g), res = []; let i = 0, cmd = null, cur = null; const n = () => +tok[i++];
    while (i < tok.length) { if (/[MLCZ]/.test(tok[i])) cmd = tok[i++]; if (cmd === 'Z') { cmd = null; continue; } if (cmd === null) { i++; continue; }
      if (cmd === 'M') { cur = new T.Path(); res.push(cur); const x = n(), y = n(); cur.moveTo(mx(x), my(y)); cmd = 'L'; }
      else if (cmd === 'L') { const x = n(), y = n(); cur.lineTo(mx(x), my(y)); }
      else { const a = n(), b = n(), c = n(), e = n(), f = n(), g = n(); cur.bezierCurveTo(mx(a), my(b), mx(c), my(e), mx(f), my(g)); } }
    return res; };
  const inside = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };
  /* a contour that lies inside an odd number of others is a hole of the smallest one around it */
  const shapesOf = d => { const ps = paths(d).map(p => { const pts = p.getPoints(5); return { p, pts, a: Math.abs(T.ShapeUtils.area(pts)) }; }).filter(o => o.pts.length > 2 && o.a > 1e-9);
    ps.forEach(o => { o.box = ps.filter(q => q !== o && q.a > o.a && inside(o.pts[0], q.pts)); });
    const res = [];
    ps.forEach(o => { if (o.box.length % 2 === 0) { o.s = new T.Shape(); o.s.curves = o.p.curves; res.push(o.s); } });
    ps.forEach(o => { if (o.box.length % 2 === 1) { const par = o.box.filter(q => q.s && q.box.length === o.box.length - 1).sort((a, b) => a.a - b.a)[0]; if (par) par.s.holes.push(o.p); } });
    return res; };
  const cache = {}, shapes = id => cache[id] || (cache[id] = [].concat(...G[id].ds.map(shapesOf)));
  /* an outline given depth: the front face is the outline itself, at z = 0; the body runs back from it */
  const ext = (sh, depth, segs, bevel) => { const g = new T.ExtrudeGeometry(sh, bevel ? { depth: depth - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 2, curveSegments: segs || 8 } : { depth, bevelEnabled: false, curveSegments: segs || 8 }); g.translate(0, 0, bevel ? bevel - depth : -depth); return g; };
  return { G, shapes, shapesOf, ext };
}

/* ---------- materials: the gold of the manual (R181 G151 B72), with returns a shade darker ---------- */
export function mats() {
  const face = new T.MeshStandardMaterial({ color: 0xb59748, roughness: .42, metalness: .38, envMapIntensity: .9, emissive: 0xb59748, emissiveIntensity: .13 });
  const side = new T.MeshStandardMaterial({ color: 0x7c6630, roughness: .5, metalness: .45, envMapIntensity: .8 });
  const line = c => { const f = new T.MeshBasicMaterial({ color: c, toneMapped: false, transparent: true }), d = new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(.55), toneMapped: false, transparent: true }); return [f, d]; };
  const faceE = new T.MeshStandardMaterial({ color: 0x5a4b24, roughness: .5, metalness: .2, envMapIntensity: .5, emissive: 0xb59748, emissiveIntensity: .62 });
  const sideE = new T.MeshStandardMaterial({ color: 0x3e3318, roughness: .6, metalness: .2, envMapIntensity: .4, emissive: 0x7c6630, emissiveIntensity: .5 });
  const inkFace = new T.MeshStandardMaterial({ color: 0x140f06, roughness: .55, metalness: 0 });
  const inkSide = new T.MeshStandardMaterial({ color: 0x140f06, roughness: .65, metalness: 0 });
  return { ink: [inkFace, inkSide], inkFace, inkSide, gold: [face, side], even: [faceE, sideE], face, side, line };
}

/* ---------- a piece and its reflection in the floor: the copy follows the piece every frame ---------- */
export function Rig(scene) {
  const refl = new T.Group(); refl.scale.y = -1; scene.add(refl); const list = [];
  const add = (parent, geo, mat, o) => { const m = new T.Mesh(geo, mat); m.castShadow = true; parent.add(m);
    if (!(o && o.noTwin)) { const r = new T.Mesh(geo, mat); r.matrixAutoUpdate = false; r.frustumCulled = false; refl.add(r); list.push([m, r]); } return m; };
  const shown = m => { for (let o = m; o; o = o.parent) if (!o.visible) return false; return true; };
  const sync = () => { for (let i = 0; i < list.length; i++) { const m = list[i][0], r = list[i][1]; r.visible = shown(m); if (!r.visible) continue; m.updateWorldMatrix(true, false); r.matrix.copy(m.matrixWorld); r.matrixWorldNeedsUpdate = true; } };
  return { add, sync, refl };
}

/* ---------- 1 · the mark, from its parts. t runs 0 to 1: the wave of the dunes sweeps in, the arch rises and takes its roof,
   the knight rides in through it, the layers close, and the English name stands up beside it, letter by letter, then its line.
   At t = 1 it is the logo, in the manual's English lockup. ---------- */
export function buildMark(kit, rig, g, M) {
  const P = {};
  P.arch = rig.add(g, kit.ext(kit.shapes('arch'), .5, 16, .018), M.gold);
  P.dome = rig.add(g, kit.ext(kit.shapes('dome'), .5, 16, .018), M.gold);
  P.dunes = kit.G.dunes.ds.map(d => rig.add(g, kit.ext(kit.shapesOf(d), .05, 28), M.gold));
  P.rider = rig.add(g, kit.ext(kit.shapes('rider'), .09, 3), M.ink);
  P.name = kit.G['land-name'].ds.map(d => rig.add(g, kit.ext(kit.shapesOf(d), .1, 5), M.ink));
  P.sub = kit.G['land-sub'].ds.map(d => rig.add(g, kit.ext(kit.shapesOf(d), .04, 3), M.ink));
  const yNm = my(209.6), ySb = my(234.3), ZD = [3.1, 2.4, 1.8];   /* the baselines of the two English lines (manual p.24) */
  const stand = (m, y0, u, z) => { m.visible = u > 0; m.scale.y = Math.max(u, .001); m.position.set(0, y0 * (1 - u), z); };
  /* each part can also be driven on its own (the opening film does): o.dunes, o.arch, o.dome, o.rider, o.close, o.names, each 0 to 1 */
  const set = (t, o) => { o = o || {}; const pr = (k, d) => o[k] === undefined ? d : o[k];
    const close = ease(pr('close', seg(t, .62, .84))), nm = pr('names', seg(t, .8, 1));
    P.dunes.forEach((m, i) => { const u = out3(o.dunes === undefined ? seg(t, .02 + i * .05, .3 + i * .05) : seg(o.dunes, i * .14, .72 + i * .14)); m.visible = u > 0; m.position.set(L(-8 - i * 1.6, 0, u), 0, L(ZD[i], .05, close)); });
    { const u = ease(pr('arch', seg(t, .14, .42))); P.arch.visible = u > 0; P.arch.scale.y = Math.max(u, .001); P.arch.position.y = Y_FOOT * (1 - u); }
    { const u = out3(pr('dome', seg(t, .3, .5))); P.dome.visible = u > 0; P.dome.position.y = (1 - u) * 1.0; }
    { const u = ease(pr('rider', seg(t, .34, .68))); P.rider.visible = u > 0; P.rider.position.set(L(-1.6, 0, u), Math.abs(Math.sin(u * Math.PI * 4)) * .13 * (1 - u), L(L(-11, 1.05, u), .14, close)); }
    P.name.forEach((m, i) => stand(m, yNm, ease(seg(nm, i * .055, .45 + i * .055)), .1));
    P.sub.forEach((m, i) => stand(m, ySb, ease(seg(nm, .55 + i * .014, .75 + i * .01)), .04));
  };
  return { P, set };
}

/* ---------- 2 · the gateway: the arch and its roof given depth, standing on sand, with the light coming through it ---------- */
export function buildGate(kit, rig, g, M, o) {
  o = o || {}; const SC = o.scale || 1.5, D = 1.15, gg = new T.Group(); gg.scale.setScalar(SC); gg.position.y = -Y_FOOT * SC; g.add(gg);
  const arch = rig.add(gg, kit.ext(kit.shapes('arch'), D, 18, .03), M.gold, { noTwin: !o.twins }), dome = rig.add(gg, kit.ext(kit.shapes('dome'), D, 18, .03), M.gold, { noTwin: !o.twins });
  arch.receiveShadow = dome.receiveShadow = true;
  /* the knight keeps his size beside the gate; his hooves are on the sand. He is the knight of the mark: the manual's own outline (page 10,
     a/3d/mark.svg, no point moved) given depth, in the primary black and lit like it, never a flat figure */
  const rg = new T.Group(); rg.scale.setScalar(SC); rg.position.y = -Y_HOOF * SC; g.add(rg);
  const riderMat = M.inkFace.clone(), riderSide = M.inkSide.clone(); riderMat.transparent = riderSide.transparent = true; riderMat.emissiveIntensity = 0; riderMat.roughness = .34;
  const rider = rig.add(rg, kit.ext(kit.shapes('rider'), .2, 6), [riderMat, riderSide], { noTwin: !o.twins }); rider.receiveShadow = true;
  /* the sand: a patch of ground that fades into the dark floor */
  const fade = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 20, 128, 128, 128); gr.addColorStop(0, '#fff'); gr.addColorStop(.55, '#bbb'); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return new T.CanvasTexture(c); })();
  const sand = new T.Mesh(new T.PlaneGeometry(44, 44), new T.MeshStandardMaterial({ color: 0xa88656, roughness: 1, metalness: 0, transparent: true, alphaMap: fade, depthWrite: false })); sand.rotation.x = -Math.PI / 2; sand.position.set(0, .012, 3); sand.receiveShadow = true; sand.renderOrder = 3; sand.userData.noMirror = true; g.add(sand);
  /* the light beyond the gate: a bright sky seen only through the opening, and a low sun that throws the arch and the knight onto the sand */
  const skyT = (() => { const c = document.createElement('canvas'); c.width = 8; c.height = 256; const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#f1c98a'); gr.addColorStop(.45, '#fbe6bd'); gr.addColorStop(.8, '#fff6e2'); gr.addColorStop(1, '#f6d7a2'); x.fillStyle = gr; x.fillRect(0, 0, 8, 256); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; })();
  const X0 = mx(871.6), X1 = mx(988.6), Y0 = Y_FOOT, Y1 = my(135.2);   /* inside the outer faces of the two piers and under the top band */
  const sky = new T.Mesh(new T.PlaneGeometry(X1 - X0, Y1 - Y0), new T.MeshBasicMaterial({ map: skyT, toneMapped: false })); sky.position.set((X0 + X1) / 2, (Y0 + Y1) / 2, -D + .01); gg.add(sky);
  const sun = new T.SpotLight(0xffcf94, 0, 70, .235, .5, 1.1); sun.position.set(0, 7.2, -9.5); sun.target.position.set(0, 0, 3.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0006; sun.shadow.radius = 3; sun.shadow.camera.near = 3; sun.shadow.camera.far = 40; g.add(sun, sun.target);
  const Z0 = -D * SC + .5, Z1 = o.z1 === undefined ? 3.4 : o.z1;
  /* t runs 0 to 1: the light comes up behind the gate, then the knight rides out through it */
  const set = (t, time) => { const up = ease(seg(t, 0, .3)), ride = seg(t, .16, 1), u = ride * ride * (3 - 2 * ride);
    sky.material.color.setRGB(.03 + .97 * up, .015 + .985 * Math.pow(up, 1.5), .005 + .995 * Math.pow(up, 2.3)); sun.intensity = (o.sun || 2300) * up;
    rider.position.set(0, Math.abs(Math.sin(ride * Math.PI * 4)) * .08 * (1 - ride * .5), (Z0 + (Z1 - Z0) * u) / SC); riderMat.opacity = riderSide.opacity = ease(seg(t, .14, .32)); rider.visible = riderMat.opacity > .01; rider.castShadow = riderMat.opacity > .5; };
  return { set, sun, sky, sand, rider, riderMat, riderSide, arch, dome, gg, rg, SC, D, Z1 };
}

/* =================================================================== the page =================================================================== */
const INK = 0x140f06;   /* Al Forsan black, PANTONE Black U, R20 G15 B6 (manual p.35): the ground of the brand's room */
const sec = document.querySelector('.fp-model'), FP = window.FP;
let S;
near3d(sec, () => { S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.0, fog: 0xb8b1a2, floorColor: 0xb8b1a2, floorRough: .7, floorOpacity: 1, mirrorK: 0, rim: 0xffe2b8, rimI: .2 });   /* a weak warm rim and a matte floor: no haze behind the text; the reflections are real copies under the floor */
if (S) { S.renderer.setClearColor(0xb8b1a2, 1); boot(); } });
layoutSets();

/* a dark desk fading into the room, and a reading lamp from the upper left: the set for the boards and for the manual */
function deskRoom(g, w, d, lp, tg, power) {
  const fade = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, '#fff'); gr.addColorStop(.6, '#999'); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return new T.CanvasTexture(c); })();
  const desk = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshStandardMaterial({ color: 0x2b1d12, roughness: .55, metalness: 0, transparent: true, alphaMap: fade, depthWrite: false })); desk.rotation.x = -Math.PI / 2; desk.position.y = -.032; desk.receiveShadow = true; desk.renderOrder = 3; g.add(desk);
  const lamp = new T.SpotLight(0xffe2b4, power || 150, 40, .62, .75, 1.2); lamp.position.set(...lp); lamp.target.position.set(...tg); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -.0006; lamp.shadow.camera.near = 2; lamp.shadow.camera.far = 30; g.add(lamp, lamp.target);
}
async function boot() {
  const { station, std, scene } = S, none = { noMirror: true };
  const kit = await loadKit('a/3d/mark.svg'), M = mats(), rig = Rig(scene);
  rig.refl.visible = false; S.renderer.shadowMap.enabled = false; S.renderer.shadowMap.type = T.PCFShadowMap; S.key.shadow.radius = 5;
  const PHN = FP.phone();   /* read once: phone layouts are chosen when the page loads */

  /* 1 · the manual: the printed book (landscape A3, a gold hard cover, bound on the short side) lies closed on the desk under a lamp; it opens
     once, where the idea began: "Knights by nature" (p.16) and "Knight's place" (p.17, a gateway and a tent drawn into the arch). */
  const s0 = station(0, Object.assign({}, none, { c: [0, .3, .15], rx: 3.55, ry: 1.75, yaw: .12, pitch: .9, drift: .12, w: 1.5, keyK: .2, fx: .74, fy: .66, ox: -.1, oy: .06, rxp: 3.5, fxp: 1.0, fyp: .5, oxp: 0, oyp: .1, yawp: .06 }));
  const BW = 3.2, BH = BW * 297 / 420, TB = .07, N = 40, book = new T.Group(); s0.g.add(book);
  const curve = x => TB * (1 - Math.exp(-Math.abs(x) / (.07 * BW)));
  const paperEdge = std({ color: 0xebe4d3, roughness: .95 }), pageMat = map => new T.MeshStandardMaterial({ map, color: 0xe9e5dc, roughness: .82, metalness: 0 });
  const half = (k, parent, map) => {
    const sh = new T.Shape(); sh.moveTo(0, 0); for (let i = 0; i <= 30; i++) { const x = BW * i / 30; sh.lineTo(k * x, curve(x)); } sh.lineTo(k * BW, 0); sh.closePath();
    const g = new T.ExtrudeGeometry(sh, { depth: BH, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, -BH / 2); const m = new T.Mesh(g, paperEdge); m.castShadow = m.receiveShadow = true; parent.add(m);
    const pg = new T.PlaneGeometry(BW, BH, N, 1), p = pg.attributes.position, uv = pg.attributes.uv;
    for (let i = 0; i < p.count; i++) { const u = uv.getX(i), x = (k > 0 ? u : 1 - u) * BW; p.setXYZ(i, k * x, curve(x) + .003, -p.getY(i)); }
    p.needsUpdate = true; pg.computeVertexNormals(); const top = new T.Mesh(pg, pageMat(map)); top.receiveShadow = true; parent.add(top);
    const b = new T.Mesh(new T.BoxGeometry(BW + .05, .03, BH + .09), M.gold); b.position.set(k * (BW / 2 + .02), -.015, 0); b.castShadow = b.receiveShadow = true; parent.add(b);
    return b; };
  half(1, book, S.tex('pg-17.webp'));
  const L = new T.Group(); L.position.y = TB; book.add(L); const Li = new T.Group(); Li.position.y = -TB; L.add(Li);
  half(-1, Li, S.tex('pg-16.webp'));
  /* the front cover: the manual's own cover page, on the outside of the board */
  { const cv = new T.Mesh(new T.PlaneGeometry(BW + .05, BH + .09), new T.MeshStandardMaterial({ map: S.tex('pg-1.webp'), roughness: .6, metalness: .1 })); cv.rotation.x = Math.PI / 2; cv.rotation.z = Math.PI; cv.position.set(-(BW / 2 + .02), -.031, 0); Li.add(cv); }
  { const sp = new T.Mesh(new T.CylinderGeometry(.06, .06, BH + .09, 18, 1, true, Math.PI / 2, Math.PI), M.gold); sp.rotation.x = Math.PI / 2; sp.position.y = -.02; book.add(sp); }
  deskRoom(s0.g, 16, 11, [-3.4, 6.2, -2.2], [.4, 0, .3], 150);
  /* closed, the book lies centred; as it opens it settles with its spine in the middle */
  const opening = t => { const o = ease(seg(t, .06, .82)); L.rotation.z = -Math.PI * (1 - o); book.position.x = -BW / 2 * (1 - o); };

  /* 2 · the mark */
  /* the English lockup is wide: framed on its whole width, its centre on the station, its foot just above the floor */
  const LC = [0, (LY1 - LDY + LIFT) / 2, 0], LR = (mx(1277.7) - mx(817)) / 2 + .25, LH = (LY1 - LY0) / 2 + .3;
  const s1 = station(46, Object.assign({}, none, { c: LC, rx: LR, ry: LH, yaw: -.42, pitch: .0, drift: .12, w: 1.5, keyK: .55, fx: .58, fy: .74, ox: -.15, oy: .035, rxp: LR, fxp: .88, fyp: .44, oxp: 0, oyp: .13, yawp: -.3 }));
  const mg = new T.Group(); mg.position.set(-LX, -LDY, 0); s1.g.add(mg);
  const mark = buildMark(kit, rig, mg, M);

  /* 3 · five centres: one centre at a time, close and as large as the mark, in the gold of the mark and lit like it, with its own line in its
     own colour (manual pp.120-132). Each logo is an object with depth: when its turn ends it turns away on its own axis, its gold edge
     catching the light, and the next one turns in, in the same place. The light of its colour falls on the floor and behind it. */
  const s2 = station(92, Object.assign({}, none, PHN
    ? { c: [0, 3.3, 0], rx: 2.9, ry: 3.3, yaw: .22, pitch: .0, drift: .1, w: 3.4, keyK: .55, fxp: .8, fyp: .44, oxp: 0, oyp: .13, yawp: .22 }
    : { c: [0, 3.3, 0], rx: 2.9, ry: 3.3, yaw: .26, pitch: .0, drift: .12, w: 3.0, keyK: .55, fx: .56, fy: .74, ox: -.13, oy: .035 }));
  const gIcon = [kit.ext(kit.shapes('arch'), .5, 12, .018), kit.ext(kit.shapes('dome'), .5, 12, .018), kit.ext(kit.shapes('dunes'), .05, 20), kit.ext(kit.shapes('rider'), .09, 4), kit.ext(kit.shapes('land-name'), .1, 4), kit.ext(kit.shapes('land-sub'), .1, 4)];   /* WB-AF-CENTRES (22 Oct): the English names (land-name, land-sub), never the bilingual sub-names */
  const glow = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.5, 'rgba(255,255,255,.28)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
  const cen = CENTRES.map((c, i) => { const g = new T.Group(); s2.g.add(g); const gi = g;   /* each logo turns about its own centre line */
    gIcon.forEach((geo, n) => { const m = rig.add(gi, geo, n >= 3 ? M.ink : M.gold); m.position.z = [0, 0, .05, .14, .1, .1][n]; if (n >= 4) { m.position.x += -237 * K; m.position.y += -100 * K; } /* WB-AF-CENTRES */ });
    const ln = rig.add(gi, kit.ext(kit.shapes(c[0]), .1, 4), M.line(c[1])); ln.position.z = .1;
    const light = () => new T.MeshBasicMaterial({ map: glow, color: c[1], transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false });
    const pool = new T.Mesh(new T.PlaneGeometry(7.4, 5), light()); pool.rotation.x = -Math.PI / 2; pool.position.set(0, .02, 1.3); pool.renderOrder = 5; s2.g.add(pool);
    const back = new T.Mesh(new T.PlaneGeometry(12, 10), light()); back.position.set(0, 3.4, -2.6); back.renderOrder = 4; s2.g.add(back);
    return { g, pool, back, i }; });
  /* the held logo turns until it stands edge-on to the camera, and at that moment the next one, also edge-on, takes its place and turns
     to face the camera: never two logos at once. The turn speeds up into the change and slows out of it, so it reads as one movement. */
  const centres = t => { const q = t * 4.6, k = Math.min(4, Math.floor(q)), f = q - k, fa = seg(f, .3, .6), away = k < 4 ? fa * fa * fa : 0, inn = k < 4 ? out3(seg(f, .6, .9)) : 0;
    const ps = clamp(Math.atan2(S.cam.position.x - s2.g.position.x, S.cam.position.z - s2.g.position.z), -.7, .7);   /* where the camera stands */
    cen.forEach(c => { const a = c.i === k && away < .999 ? away * (ps + Math.PI / 2) : c.i === k + 1 && inn > .001 ? (1 - inn) * (ps - Math.PI / 2) : null;
      c.g.visible = a !== null; if (a !== null) c.g.rotation.y = a; const w = a === null ? 0 : c.i === k ? 1 - away : inn;
      c.pool.material.opacity = .5 * w; c.back.material.opacity = .2 * w; }); };

  /* 4 · the gateway: out (af26, Tony 26 Oct: "remove this"); the three stations left are the chapter */

  const compose = (i, l, tm) => {
    opening(i === 0 ? seg(l, .02, .42) : 1);
    mark.set(1);   /* af26 E-AF26-MARK: the logo stands whole and still (Tony, 26 Oct) */
    centres(i < 2 ? 0 : i === 2 ? seg(l, .0, .4) : 1);
    rig.sync();
  };
  compose(0, 0);
  S.onFrame((time_, i, local) => compose(i, local, time_));
  if (FP.rm) FP.on(() => { const on = sec.querySelector('.st.on'); compose(on ? +on.dataset.s : 0, 1); });
  S.ready();
}

/* the composed screens: each set of pictures is shown whole at once, in rows of one height each, fitted to one screen on a wide screen
   (on a phone, in fewer pieces per row). No picture is cut and no field of ours is laid behind any of them. */
function layoutSets() {
  const sets = [].slice.call(document.querySelectorAll('.af-set')); if (!sets.length) return;
  const lay = () => sets.forEach(s => {
    const ph = innerWidth <= 760, grid = s.querySelector('.grid'), figs = [].slice.call(grid.querySelectorAll('figure')), rows = JSON.parse(s.dataset[ph ? 'rowsP' : 'rows']);
    figs.forEach(f => grid.appendChild(f)); [].slice.call(grid.querySelectorAll('.af-row')).forEach(r => r.remove());
    const gap = ph ? 12 : 18, W = grid.clientWidth, capH = ph ? 40 : 36, cs = getComputedStyle(s);
    const hw = rows.map(r => (W - gap * (r.length - 1)) / r.reduce((a, k) => a + +figs[k].dataset.r, 0));
    let k = 1;
    if (!ph) { const H = innerHeight - s.querySelector('.hd').offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - rows.length * capH - gap * (rows.length - 1) - 10; k = Math.max(.35, Math.min(1, H / hw.reduce((a, b) => a + b, 0))); }
    rows.forEach((r, i) => { const row = document.createElement('div'); row.className = 'af-row'; row.style.gap = gap + 'px'; row.style.marginTop = i ? gap + 'px' : '0';
      const hh = ph ? Math.min(hw[i], innerHeight * .42) : hw[i] * k;   /* on a phone no picture is taller than about two fifths of the screen, so a set stays short */
      r.forEach(n => { const f = figs[n]; f.style.width = Math.floor(+f.dataset.r * hh) + 'px'; row.appendChild(f); }); grid.appendChild(row); });
  });
  lay(); addEventListener('resize', lay); addEventListener('load', lay);
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
