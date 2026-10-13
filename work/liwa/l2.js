/* Liwa: the festival as a 3D model, built from the campaign artwork and the working files.
   Scroll: the key visual in its layers, the road in, the wayfinding, the Liwa Land gate, the site under the dune, the big screen. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

const sec = document.querySelector('.fp-model'), S = sec && window.FP && stage(sec, { assets: 'a/3d/', key: 0xfff0dc, rim: 0xffb066, rimI: .5, floor: 0x060504 , grid: false, sky: [[0, '#000'], [.5, '#050307'], [.63, '#2a150a'], [.68, '#0d0703'], [1, '#000']], fog: 0x0a0503 });
if (S) build();

function build() {
  const { tex, std, dark, box, panel, manq, station, video } = S, A = S.A;
  const steel = std({ color: 0x4a4d53, roughness: .45, metalness: .7 });

  /* Tal Moreeb at 1:20, used by two scenes */
  const tan50 = Math.tan(50 * Math.PI / 180), crest = x => -8 + 4.5 * Math.sin(x * .06) + 2 * Math.sin(x * .17 + 1), top = x => 15 * Math.exp(-Math.pow(x / 34, 2)) * (.86 + .14 * Math.cos(x * .1));
  function addDune(G) {
    const SX = 110, SZ = 64, geo = new T.PlaneGeometry(SX, SZ, 220, 128); geo.rotateX(-Math.PI / 2);
    const pa = geo.attributes.position, col = new Float32Array(pa.count * 3);
    for (let n = 0; n < pa.count; n++) { const x = pa.getX(n), z = pa.getZ(n), zc = crest(x), hc = top(x); let h, face = 0;
      if (z > zc) { const d = z - zc, raw = hc - d * tan50; h = raw > 1.2 ? raw : Math.max(0, 1.2 * Math.exp((raw - 1.2) / 1.2)); face = raw > 0 ? 1 : 0; }
      else { const d = zc - z; h = hc * Math.exp(-Math.pow(d / 26, 2)) + .5 * Math.sin(x * .3 + d * .2) * Math.exp(-d / 30); }
      h *= FPsm(Math.abs(x), 54, 40) * FPsm(-z, 32, 22); h += .05 * Math.sin(x * 2.1 + z * .7) * Math.min(1, h);
      pa.setY(n, Math.max(0, h)); const c = face ? .78 : 1; col[n * 3] = .86 * c; col[n * 3 + 1] = .58 * c; col[n * 3 + 2] = .3 * c; }
    { /* soften the stepped crest: two passes of a 3 x 3 average over the height grid */
      const nx = 221, nz = 129, hgt = new Float32Array(pa.count); for (let n = 0; n < pa.count; n++) hgt[n] = pa.getY(n);
      for (let pass = 0; pass < 3; pass++) { const src = hgt.slice(); for (let j = 1; j < nz - 1; j++) for (let i2 = 1; i2 < nx - 1; i2++) { let a2 = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) a2 += src[(j + dj) * nx + i2 + di]; hgt[j * nx + i2] = a2 / 9; } }
      for (let n = 0; n < pa.count; n++) pa.setY(n, hgt[n]); }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const dune = new T.Mesh(geo, std({ vertexColors: true, roughness: 1 })); dune.position.set(0, .01, -6); dune.castShadow = dune.receiveShadow = true; G.add(dune);
    /* the climb: two rows of floodlights up the face */
    const zc0 = crest(0) - 6, lm = new T.MeshBasicMaterial({ color: 0xfff3c4 });
    for (let i = 0; i <= 12; i++) { const t = i / 12, y = 15 * .98 * t * (.86 + .14) , z = zc0 + (1 - t) * (15 / tan50); [-1.1, 1.1].forEach(x => { const b = new T.Mesh(new T.SphereGeometry(.09, 8, 8), lm); b.position.set(x, Math.max(.2, top(0) * t) + .12, z); G.add(b); }); }
  }

  /* 1 · the campaign idea in space: the key visual's own letters and racers, free-standing at the foot of the dune (approved 11 Oct).
     Flat plates in real depth, so the camera stays within about 40 degrees of the front. The released artwork is shown whole after it. */
  {
    const s = station(-120, { c: [1.2, 4.3, 8.5], rx: 8.6, ry: 5.0, yaw: .5, pitch: 0, drift: .3, fx: .96, fy: .94, ox: 0, oy: .02, keyK: .12, noMirror: true, yawp: .42, rxp: 6.0, fxp: 1.0, fyp: .5, oyp: .08 });
    addDune(s.g);
    const names = ['04-liwa-letters', '05-buggy-far', '06-dust-screen', '07-dirtbike', '08-buggy', '08-buggy-screen', '09-layer201', '10-car', '10-car-screen', '11-horse', '11-horse-screen', '12-camel', '12-camel-screen', '13-falcon', '14-sand-front'];
    const W = 3.6, H = W * 5779 / 4128, geo = new T.PlaneGeometry(W, H), kv = new T.Group(); let z = .72;
    names.forEach((n, i) => { const scr = n.indexOf('screen') > 0; if (!scr) z += .36;
      const m = new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex('kv-' + n + '.webp'), transparent: true, depthWrite: false, blending: scr ? T.AdditiveBlending : T.NormalBlending, toneMapped: false }));
      m.position.set(0, .25 + H / 2, z + (scr ? .01 : 0)); m.renderOrder = 10 + i; kv.add(m); });
    const k = 4.3; kv.scale.set(k, k, k * .5); kv.position.set(1.5, -1.3 * k, 4); s.g.add(kv);
  }
  /* 2 · the road in: the billboard and the lamppost banners */
  {
    const s = station(34, { c: [.6, 3.4, -2], rx: 7.2, ry: 4.4, yaw: .36, pitch: .05, drift: .4, fx: .68, yawp: .7, rxp: 4.6 });
    const road = new T.Mesh(new T.PlaneGeometry(7, 70), std({ color: 0x0c0c0e, roughness: .8 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .004, -12); road.receiveShadow = true; s.g.add(road);
    for (let i = 0; i < 12; i++) { const d = new T.Mesh(new T.PlaneGeometry(.14, 2.4), new T.MeshBasicMaterial({ color: 0xbfbfbf })); d.rotation.x = -Math.PI / 2; d.position.set(0, .008, 18 - i * 5.2); s.g.add(d); }
    const arts = [tex('banner-begin.webp'), tex('banner-ready.webp'), tex('banner-begin.webp')];
    for (let i = 0; i < 3; i++) { const g = new T.Group(); g.position.set(4.3, 0, 5 - i * 9);
      const p = new T.Mesh(new T.CylinderGeometry(.07, .1, 8.2, 14), steel); p.position.y = 4.1; p.castShadow = true; g.add(p);
      const arm = box(1.6, .08, .08, steel, -.8, 8.1, 0); g.add(arm);
      const lamp = new T.Mesh(new T.BoxGeometry(.6, .08, .22), new T.MeshBasicMaterial({ color: 0xfff1c9 })); lamp.position.set(-1.4, 8.02, 0); g.add(lamp);
      const b = panel(1.5, 3.0, arts[i], .03); b.position.set(-.85, 5.0, 0); g.add(b);
      g.add(box(.9, .05, .05, steel, -.45, 6.52, 0), box(.9, .05, .05, steel, -.45, 3.48, 0));
      s.g.add(g); }
    const bb = panel(4.5, 3.5, tex('billboard.webp'), .12); bb.position.set(-5.2, 4.3, -6); bb.rotation.y = .32; s.g.add(bb);
    [-1.4, 1.4].forEach(x => { const l = box(.16, 2.6, .16, steel, 0, 1.3, 0); l.position.set(-5.2 + x * Math.cos(.32), 1.3, -6 - x * Math.sin(.32) - .05); s.g.add(l); });
    s.dims.push({ a: [-7.45, 6.3, -5.2], b: [-2.95, 6.3, -6.75], t: '14 ft 9 in · 4.5 m', big: true }, { a: [3.1, 3.5, 5.2], b: [3.1, 6.5, 5.2], t: '9 ft 10 in · 3 m' }, { a: [-3.2, 0, -3.6], b: [-3.2, 1.8, -3.6], t: 'A person · 6 ft' });
    S.blob(s.g, -5.2, -6, 4.6, 1.6, .85); for (let i = 0; i < 3; i++) S.blob(s.g, 4.3, 5 - i * 9, 1.6, 1.6, .85);
  }
  /* 3 · wayfinding: one sign system, seven panels */
  {
    const s = station(58, { c: [0, 1.6, .2], rx: 2.9, ry: 1.9, yaw: .44, pitch: .06, drift: .6 });
    ['02', '06', '08'].forEach((n, i) => { const g = new T.Group(); g.position.set(-2.0 + i * 2.0, 0, i === 1 ? .5 : 0); g.rotation.y = (1 - i) * .22;
      const p = panel(1.2, 2.4, tex('sign-' + n + '.webp'), .07, { roughness: .5 }); p.position.y = 1.75; g.add(p);
      g.add(box(.09, .6, .09, steel, -.45, .3, 0), box(.09, .6, .09, steel, .45, .3, 0), box(1.3, .04, .5, steel, 0, .02, 0)); s.g.add(g); });
    s.dims.push({ a: [3.0, 0, .4], b: [3.0, 1.8, .4], t: 'A person · 6 ft' });
    [-2, 0, 2].forEach((x, i) => S.blob(s.g, x, i === 1 ? .5 : 0, 2.0, 1.2, .85));
  }
  /* 4 · Liwa Land: the gate of the children's zone.
     WRITTEN on our elevation of 23 Dec 2019: icons 1.7 x 1.1 m, badge 1.7 x 1.7 m, popcorn with playhouse 3.33 x 3.5 m, castle 3 x 2.2 m.
     ESTIMATED ("about") from that drawing, rectified, and from the site footage: the arch 8 m wide and 5.6 m high, legs 1.42 m wide and 1.2 m deep,
     beam 1.1 m, so an opening of about 5.2 x 4.5 m. The cut-outs stand on the ground in front of the legs, as built; the icons and the reel sit above them, as built.
     Artwork: the vectors of the brochure draft of 6 Dec 2019 (page 26), one layer per file. English only (Tony, 12 Oct): the beam carries the artwork's own
     FUN ZONE letters at their drawn size, re-centred, and no other lettering. To change the lettering, change NAME. */
  {
    const GW = 8.0, GH = 5.6, LEG = 1.42, BEAM = 1.1, GD = 1.2, F = GD / 2, Z0 = 70;   /* Z0: the gate stands 70 m in front of the other scenes, beyond their fog */
    const NAME = { face: 'gate-fz-face.webp', edge: 'gate-fz-edge.webp', glow: 'gate-fz-glow.webp', w: 2.196, h: .526, x: 0, y: GH - BEAM / 2 };
    const s = station(100, { c: [-.35, 2.7, Z0 + F], rx: 5.9, ry: 3.3, yaw: -.5, pitch: -.08, drift: .34, fx: .64, fy: .8, ox: -.2, oy: -.03, keyK: .38, noMirror: true, yawp: -.74, rxp: 4.3, fxp: 1, fyp: .5, oyp: .12 });
    const G = new T.Group(); G.position.z = Z0; s.g.add(G);
    const radial = (stops, srgb) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 2, 64, 64, 64); stops.forEach(k => g.addColorStop(k[0], k[1])); x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new T.CanvasTexture(c); if (srgb) t.colorSpace = T.SRGBColorSpace; return t; };
    /* sand that fades into the dark floor, and a warm pool of light at each foot */
    const sand = new T.Mesh(new T.PlaneGeometry(52, 34), std({ color: 0xc9925a, roughness: 1, transparent: true, depthWrite: false, alphaMap: radial([[0, '#fff'], [.5, '#fff'], [1, '#000']]) }));
    sand.rotation.x = -Math.PI / 2; sand.position.set(0, .012, 2); sand.receiveShadow = true; sand.renderOrder = 3; G.add(sand);
    const pool = radial([[0, 'rgba(255,186,120,.5)'], [.5, 'rgba(255,170,100,.16)'], [1, 'rgba(255,160,90,0)']], true);
    [[-GW / 2 - .2, 1.7, 7.5, 5], [GW / 2 + .4, 1.6, 6.5, 4.6]].forEach(p => { const m = new T.Mesh(new T.PlaneGeometry(p[2], p[3]), new T.MeshBasicMaterial({ map: pool, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); m.rotation.x = -Math.PI / 2; m.position.set(p[0], .02, p[1]); m.renderOrder = 5; G.add(m); });
    const lamp = (x, y, z, c, i, d) => { const l = new T.PointLight(c, i, d, 2); l.position.set(x, y, z); G.add(l); };
    lamp(-GW / 2 - .6, 1.1, 3.3, 0xffb070, 9, 10); lamp(GW / 2 + .6, 1, 3.1, 0xffb070, 7, 9); lamp(0, GH - .7, F + 1.5, 0xffe2d6, 1.2, 5);
    /* the arch: two legs and a beam, wrapped in red */
    const red = std({ color: 0xb50f17, roughness: .85 });
    G.add(box(LEG, GH - BEAM, GD, red, -(GW - LEG) / 2, (GH - BEAM) / 2, 0), box(LEG, GH - BEAM, GD, red, (GW - LEG) / 2, (GH - BEAM) / 2, 0), box(GW, BEAM, GD, red, 0, GH - BEAM / 2, 0));
    /* printed on the wrap (flat) · boards and cut-outs (standing off, casting shadows) */
    const print = (f, w, h, x, y) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), std({ map: tex(f), transparent: true, depthWrite: false, roughness: .82 })); m.position.set(x, y, F + .012); m.receiveShadow = true; m.renderOrder = 5; G.add(m); return m; };
    const cut = (f, w, h, x, y, z) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), std({ map: tex(f), alphaTest: .5, alphaToCoverage: true, roughness: .78, side: T.DoubleSide })); m.position.set(x, y, F + z); m.castShadow = m.receiveShadow = true; G.add(m); return m; };
    print('gate-logo.webp', 1.15, .398, -GW / 2 + .85, GH - .575);            /* the festival's Latin lock-up, white as printed */
    print('gate-stars.webp', 1.09, .494, GW / 2 - .65, GH - .38);
    print('gate-date.webp', 1.407, .208, GW / 2 - .94, GH - .8);              /* "26 Dec–10 Jan", taken from the elevation itself */
    print('gate-reel.webp', .95, .979, -GW / 2 + .8, 3.42);
    cut('gate-icons.webp', 1.7, 1.093, -(GW - LEG) / 2, 4.2, .08);            /* written on the drawing: 1.7 x 1.1 m */
    cut('gate-badge.webp', 1.7, 1.667, (GW - LEG) / 2, 3.5, .08);             /* 1.7 x 1.7 m, tilted as drawn (it was mounted upright: rotation.z = .5) */
    const LX = -GW / 2 - 1.65, RX = GW / 2 - 1.69;                            /* left edges of the two foot cut-outs: 3.33 x 3.5 m and 3 x 2.2 m */
    cut('gate-pop-1.webp', 1.886, 3.483, LX + 1.412 + .943, 1.7415, .45);
    cut('gate-pop-2.webp', 1.867, .805, LX + 1.463 + .9335, 2.27 + .4025, .62);
    cut('gate-pop-3.webp', 2.753, 2.208, LX + 1.3765, .023 + 1.104, .85);
    cut('gate-castle-1.webp', 1.586, 1.552, RX + .621 + .793, .63 + .776, .45);
    cut('gate-castle-2.webp', 3, 1.722, RX + 1.5, .861, .8);
    /* the lettering: raised letters with red returns, lit from inside */
    { const name = new T.Group(); name.position.set(NAME.x, NAME.y, F); G.add(name);
      const geo = new T.PlaneGeometry(NAME.w, NAME.h), side = std({ map: tex(NAME.edge), color: 0xb9858a, alphaTest: .5, alphaToCoverage: true, roughness: .7, emissive: 0x3a0508, side: T.DoubleSide });
      for (let i = 0; i < 6; i++) { const m = new T.Mesh(geo, side); m.position.z = .02 + i * .024; name.add(m); }
      const face = new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex(NAME.face), alphaTest: .5, alphaToCoverage: true, toneMapped: false })); face.position.z = .144; name.add(face);
      const glow = new T.Mesh(new T.PlaneGeometry(NAME.w * 1.155, NAME.h * 1.648), new T.MeshBasicMaterial({ map: tex(NAME.glow), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: .34, toneMapped: false })); glow.position.z = .16; glow.renderOrder = 6; name.add(glow); }
    const written = [{ a: [LX - .3, 0, Z0 + F + .85], b: [LX - .3, 3.48, Z0 + F + .85], t: '11 ft 6 in · 3.5 m' },
      { a: [(GW - LEG) / 2 - .85, 2.36, Z0 + F + .1], b: [(GW - LEG) / 2 + .85, 2.36, Z0 + F + .1], t: '5 ft 7 in · 1.7 m' },
      { a: [RX, .06, Z0 + F + 2.5], b: [RX + 3, .06, Z0 + F + 2.5], t: '9 ft 10 in · 3 m' },
      { a: [-.4, 0, Z0 + F + 1.4], b: [-.4, 1.8, Z0 + F + 1.4], t: 'A person · 6 ft' }];
    s.dims.push({ a: [-GW / 2, GH + .5, Z0 + F], b: [GW / 2, GH + .5, Z0 + F], t: 'about 26 ft · 8 m', big: true }, ...written);
    S.onFrame(() => { const ph = S.FP.phone(); written.forEach(d => { if (d.line) d.line.visible = !ph; }); });   /* a phone shows the width only */
    S.blob(G, -(GW - LEG) / 2, 0, 3.2, 2.8, .8); S.blob(G, (GW - LEG) / 2, 0, 3.2, 2.8, .8); S.blob(G, LX + 1.7, F + .7, 4.4, 1.5, .75); S.blob(G, RX + 1.5, F + .65, 3.9, 1.3, .75);
  }
  /* 5 · the site under the dune: the master plan and Tal Moreeb at 1:20 */
  {
    const s = station(150, { c: [0, 5.2, 5], rx: 24, ry: 10, yaw: .46, pitch: .13, drift: .36, fx: .84, fy: .62, ox: -.05, oy: .1, yawp: .75, rxp: 12, noMirror: true, keyK: .16, w: 1.5 });
    addDune(s.g);
    /* the master plan, lit like a drawing on a table */
    const pt = tex('plan.webp'), slab = new T.Mesh(new T.BoxGeometry(24, .16, 24 * 1443 / 2048), [dark, dark, std({ map: pt, emissive: 0xffffff, emissiveMap: pt, emissiveIntensity: .5, roughness: .7 }), dark, dark, dark]);
    slab.position.set(0, .09, 18.5); slab.castShadow = slab.receiveShadow = true; s.g.add(slab);
    s.dims.push({ a: [17, 0, 6.5], b: [17, 15, 6.5], t: '984 ft · 300 m', k: .6, huge: true });
    const PZ = (u, v, t) => { const x = -12 + 24 * u, z = 18.5 - 8.455 + 16.91 * v; s.dims.push({ a: [x, .2, z], b: [x, 1.7, z], t, k: .14 }); };
    PZ(.80, .52, 'Race arenas'); PZ(.40, .63, 'Heritage Village · Moreeb Walk · theatre'); PZ(.80, .70, 'Camping'); PZ(.40, .44, 'Paraglider strip');
  }
  /* 6 · the big screen: the TV commercial, playing */
  {
    const s = station(260, { c: [0, 3.2, 0], rx: 5.4, ry: 3.6, yaw: .34, pitch: .04, drift: .44, fx: .66, yawp: .6 });
    const l = video('../../media/films/liwa-tvc-720.mp4', null, '../../media/films/liwa-tvc-poster.jpg'); s.vid = l.v;
    const scr = new T.Mesh(new T.PlaneGeometry(8, 4.5), new T.MeshBasicMaterial({ map: l.t, toneMapped: false })); scr.position.set(0, 3.9, .03); s.g.add(scr);
    s.g.add(box(8.3, 4.8, .3, dark, 0, 3.9, -.14), box(.22, 1.7, .22, steel, -3.4, .85, -.14), box(.22, 1.7, .22, steel, 3.4, .85, -.14), box(8.3, .14, 1.4, steel, 0, .07, -.14));
    s.dims.push({ a: [-5.0, 0, 1.2], b: [-5.0, 1.8, 1.2], t: 'A person · 6 ft' });
    S.blob(s.g, 0, -.1, 10, 2.6, .85);
  }
  S.ready();
}
function FPsm(v, edge, soft) { const t = Math.max(0, Math.min(1, (edge - v) / (edge - soft))); return t * t * (3 - 2 * t); }
