/* Liwa: the campaign in space, built from the campaign's own artwork and working files. Three stops:
   the road in (the outdoor artwork and the lamppost banners), the wayfinding (three sign panels), the Liwa Land gate.
   14 Oct night: the dune model and the "big screen" were taken out (audit B-16, B-17: a TV on a stand the TVC never played on,
   and a dune below the bar); the dune and the site are now seen in films. */
let stage, T;   /* perf21 F1: three.js and the 3D engine load when the 3D chapter is near: near3d() at the end */

const sec = document.querySelector('.fp-model'); let S;
near3d(sec, () => { S = sec && window.FP && stage(sec, { assets: 'a/3d/', key: 0xfff0dc, rim: 0xffb066, rimI: .5, floor: 0x060504 , grid: false, sky: [[0, '#000'], [.5, '#050307'], [.63, '#2a150a'], [.68, '#0d0703'], [1, '#000']], fog: 0x0a0503 });
if (S) build(); });

function build() {
  const { tex, std, dark, box, panel, station } = S;
  const steel = std({ color: 0x4a4d53, roughness: .45, metalness: .7 });

  /* the ground: warm sand that fades into the dark floor, so no piece stands in a void */
  const radial = (stops, srgb) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 2, 64, 64, 64); stops.forEach(k => g.addColorStop(k[0], k[1])); x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new T.CanvasTexture(c); if (srgb) t.colorSpace = T.SRGBColorSpace; return t; };
  const fade = radial([[0, '#fff'], [.5, '#fff'], [1, '#000']]);
  const sand = (g, w, d, x, z, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, d), std({ color: 0xc9925a, roughness: 1, transparent: true, depthWrite: false, alphaMap: fade, opacity: k || 1 })); m.rotation.x = -Math.PI / 2; m.position.set(x, .002, z); m.receiveShadow = true; m.renderOrder = 3; m.userData.noMirror = true; g.add(m); return m; };
  /* a low line of dunes behind the road, lit from the side, going into the dusk */
  const ridge = (g, x, z, w, h) => { const geo = new T.PlaneGeometry(w, 26, 160, 40); geo.rotateX(-Math.PI / 2); const pa = geo.attributes.position;
    for (let n = 0; n < pa.count; n++) { const px = pa.getX(n), pz = pa.getZ(n), crest = h * (.55 + .3 * Math.sin(px * .07 + 1) + .15 * Math.sin(px * .19)), t = Math.max(0, 1 - Math.abs(pz + 2) / 13); pa.setY(n, crest * Math.pow(t, 1.6) * (1 - Math.pow(Math.abs(px) / (w / 2), 6))); }
    geo.computeVertexNormals(); const m = new T.Mesh(geo, std({ color: 0xb87a45, roughness: 1 })); m.position.set(x, 0, z); m.receiveShadow = true; m.userData.noMirror = true; g.add(m); return m; };

  /* 1 · the road in: the billboard and the lamppost banners */
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
    const bb = panel(4.5, 3.5, tex('billboard.webp?v=2'), .12); bb.position.set(-5.2, 4.3, -6); bb.rotation.y = .32; s.g.add(bb);
    [-1.4, 1.4].forEach(x => { const l = box(.16, 2.6, .16, steel, 0, 1.3, 0); l.position.set(-5.2 + x * Math.cos(.32), 1.3, -6 - x * Math.sin(.32) - .05); s.g.add(l); });
    
    sand(s.g, 40, 84, 0, -12); ridge(s.g, 0, -46, 80, 9);
    S.blob(s.g, -5.2, -6, 4.6, 1.6, .85); for (let i = 0; i < 3; i++) S.blob(s.g, 4.3, 5 - i * 9, 1.6, 1.6, .85);
  }
  /* 2 · wayfinding: one sign system; three panels whose every row is labelled (08, 04, 07). The header strip of each is the one from the
     printed sign file (page 8, as in 49548e8): the lower rectangle LIWA 2020 at its printed size, and the band as printed. */
  {
    const s = station(58, { c: [.1, 1.75, .25], rx: 2.45, ry: 1.5, yaw: .4, pitch: .05, drift: .5, rxp: 3.3, yawp: .3 });
    ['08', 'r04', 'r07'].forEach((n, i) => { const g = new T.Group(); g.position.set(-2.0 + i * 2.0, 0, i === 1 ? .5 : 0); g.rotation.y = (1 - i) * .22;
      const p = panel(1.2, 2.4, tex('sign-' + n + '.webp?v=3'), .07, { roughness: .5 }); p.position.y = 1.75; g.add(p);
      g.add(box(.09, .6, .09, steel, -.45, .3, 0), box(.09, .6, .09, steel, .45, .3, 0), box(1.3, .04, .5, steel, 0, .02, 0)); s.g.add(g); });
    
    sand(s.g, 16, 12, 0, .2, .9);
    [-2, 0, 2].forEach((x, i) => S.blob(s.g, x, i === 1 ? .5 : 0, 2.0, 1.2, .85));
  }
  /* 3 · Liwa Land: the gate of the children's zone.
     WRITTEN on our elevation of 23 Dec 2019: icons 1.7 x 1.1 m, badge 1.7 x 1.7 m, popcorn with playhouse 3.33 x 3.5 m, castle 3 x 2.2 m.
     ESTIMATED ("about") from that drawing, rectified, and from the site footage: the arch 8 m wide and 5.6 m high, legs 1.42 m wide and 1.2 m deep,
     beam 1.1 m, so an opening of about 5.2 x 4.5 m. The cut-outs stand on the ground in front of the legs, as built; the icons and the reel sit above them, as built.
     Artwork: the vectors of the brochure draft of 6 Dec 2019 (page 26), one layer per file. "Show only fun zone" (Tony, 12 Oct): the beam carries the artwork's own
     FUN ZONE letters at their drawn size, re-centred, and no other lettering of the Liwa Land logo. To change the lettering, change NAME. */
  {
    const GW = 8.0, GH = 5.6, LEG = 1.42, BEAM = 1.1, GD = 1.2, F = GD / 2, Z0 = 70;   /* Z0: the gate stands 70 m in front of the other scenes, beyond their fog */
    const NAME = { face: 'gate-fz-face.webp', edge: 'gate-fz-edge.webp', glow: 'gate-fz-glow.webp', w: 2.196, h: .526, x: 0, y: GH - BEAM / 2 };
    const s = station(100, { c: [-.35, 2.7, Z0 + F], rx: 5.9, ry: 3.3, yaw: -.5, pitch: -.08, drift: .34, fx: .64, fy: .8, ox: -.2, oy: -.03, keyK: .38, noMirror: true, yawp: -.74, rxp: 4.3, fxp: 1, fyp: .5, oyp: .12 });
    const G = new T.Group(); G.position.z = Z0; s.g.add(G);
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
    /* the festival's logo, white: only its lower part, the rectangle with LIWA International Festival 2020, nothing above it ("you can use it
       without the upper part", Tony, 14 Oct). Cut from the final logo file itself (006, "Liwa Intl Fest 2020 logo"), its own proportions, no
       point moved. 1.13 m wide as before, centred on the beam. */
    print('gate-logo.webp?v=2', 1.15, 1.15 * 325 / 960, -GW / 2 + .85, GH - BEAM / 2);
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
    S.blob(G, -(GW - LEG) / 2, 0, 3.2, 2.8, .8); S.blob(G, (GW - LEG) / 2, 0, 3.2, 2.8, .8); S.blob(G, LX + 1.7, F + .7, 4.4, 1.5, .75); S.blob(G, RX + 1.5, F + .65, 3.9, 1.3, .75);
  }
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
