/* Liwa: the festival as a 3D model, built from the campaign artwork and the working files.
   Scroll: the key visual in its layers, the road in, the wayfinding, the site under the dune, the big screen. */
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
  /* 4 · the site under the dune: the master plan and Tal Moreeb at 1:20 */
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
  /* 5 · the big screen: the TV commercial, playing */
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
