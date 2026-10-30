/* ps29 mock (29 Oct 2026): l2.js with its third station (the Liwa Land gate) left out; the gate stands once, on the map. Lines 54-100 of l2.js?v=28. */
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
