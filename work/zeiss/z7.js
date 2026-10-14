/* ZEISS: the night as a 3D model. Every piece is built from the production artwork at its drawn size (metres).
   Scroll walks the guest's way in: welcome screen, flags, signs, entrance wall, two photo walls, the eye, the 74-ft screen. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

const sec = document.querySelector('.fp-model'), S = sec && window.FP && stage(sec, { assets: 'a/3d/', grid: false, sky: [[0, '#000'], [.52, '#03050c'], [.66, '#0a1230'], [.7, '#03050c'], [1, '#000']], fog: 0x03050c, floorColor: 0x070a12, floorRough: .32, floorMetal: .55, floorOpacity: .72, mirrorK: 2.2, rim: 0x5878ff, rimI: .8 });
if (S) build();

function build() {
  const { tex, std, dark, box, panel, manq, station, video } = S, A = S.A;

  /* 1 · the way in, as one space: the long screen with our film, and ten flags on the carpet (approved 11 Oct) */
  let wayIn;
  {
    const s = wayIn = station(0, { w: .55, c: [0, 2.3, 6.5], rx: 8.3, ry: 3.75, yaw: 0, pitch: -.012, drift: .16, fx: .98, fy: .9, ox: 0, oy: .03, keyK: .3, yawp: .62, rxp: 4.4, fxp: .95, fyp: .44, oyp: .08 });
    [5, 10, 15].forEach(z => { const l = new T.SpotLight(0xeaf0ff, 170, 26, .34, .95, 1.4); l.position.set(0, 9, z + 1); l.target.position.set(0, 0, z); S.scene.add(l, l.target); });
    [-6.5, 0, 6.5].forEach(px => { const l = new T.SpotLight(0x3f66ff, 240, 16, .9, 1, 1.2); l.position.set(px, .3, 2.6); l.target.position.set(px, 4.5, 0); S.scene.add(l, l.target); });
    s.g.add(box(18.4, 5.6, 5, std({ color: 0x0b0e16, roughness: .55, metalness: .2 }), 0, 2.8, -2.56));
    /* our welcome film for the outdoor screen (archive 457, 1920 x 270): one brief, unbroken moment of it, as made, 22.8 s to 25.85 s:
       the X, then ZEISS ClearView & PhotoFusion X (Tony, 14 Oct: "it can be very brief"). Nothing spliced, nothing erased. */
    const w = video('a/welcome-x.mp4', null, 'a/welcome-x-poster.webp'); s.vid = w.v;
    const band = new T.Mesh(new T.PlaneGeometry(15.4, 15.4 * 270 / 1920), new T.MeshBasicMaterial({ map: w.t, toneMapped: false })); band.position.set(0, 3.9, .02); s.g.add(band);
    s.g.add(box(15.7, 15.4 * 270 / 1920 + .3, .12, dark, 0, 3.9, -.05));
    S.blob(s.g, 0, .6, 21, 3.4, .8);
  }
  /* ten flags, lining the carpet of the same space (flag height not stated: the sources disagree) */
  {
    const s = wayIn, flags = [];
    const mask = (img, cv) => { const c = cv.getContext('2d'); cv.width = 256; cv.height = 1024; c.clearRect(0, 0, 256, 1024);
      /* the sail shape of the production drawing (Flags, 2 m x 0.85 m): straight up the pole, the top sweeps out to a tip at the far corner, the foot is cut on a rising curve */
      c.beginPath(); c.moveTo(0, 1024); c.lineTo(0, 277); c.bezierCurveTo(8, 120, 110, 22, 256, 0); c.lineTo(256, 823); c.bezierCurveTo(176, 872, 62, 952, 0, 1024); c.closePath(); c.fillStyle = '#fff'; c.fill();
      c.globalCompositeOperation = 'source-in'; c.drawImage(img, 0, 0, 256, 1024); c.globalCompositeOperation = 'source-over'; };
    const arts = ['flag-cv.webp', 'flag-z.webp', 'flag-pfx.webp'].map(f => { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4; const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
      const im = new Image(); im.onload = () => { mask(im, cv); t.needsUpdate = true; }; im.src = A + f; return t; });
    const order = [0, 1, 2, 1, 0, 2, 1, 0, 1, 2]; /* 3 ClearView, 4 ZEISS, 3 PhotoFusion X */
    const pole = std({ color: 0x9a9da3, roughness: .35, metalness: .8 });
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2), f = new T.Group(); f.position.set(side * 2.9, 0, 12.9 - row * 2.2); f.rotation.y = side * -.5;
      const geo = new T.PlaneGeometry(.82, 3.4, 8, 40); geo.translate(.41, 2.35, 0);
      const m = new T.Mesh(geo, std({ map: arts[order[i]], alphaTest: .5, side: T.DoubleSide, roughness: .95 })); m.castShadow = true; f.add(m);
      const p = new T.Mesh(new T.CylinderGeometry(.018, .022, 3.13, 10), pole); p.position.set(-.01, 1.565, 0); p.castShadow = true; f.add(p);
      { const bz = (t, a, b, c, d) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; }, pts = [];
        for (let k = 0; k <= 12; k++) { const t = k / 12, cx = bz(t, 0, 8, 110, 256), cy = bz(t, 277, 120, 22, 0); pts.push(new T.Vector3(cx / 256 * .82 - .01, 4.05 - cy / 1024 * 3.4, 0)); }
        const tip = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 24, .014, 8, false), pole); tip.castShadow = true; f.add(tip); }
      const b = new T.Mesh(new T.CylinderGeometry(.26, .28, .05, 28), std({ color: 0x4a4d53, roughness: .4, metalness: .6 })); b.position.y = .025; b.castShadow = true; f.add(b);
      s.g.add(f); S.blob(s.g, f.position.x, f.position.z, 1.3, 1.3, .8); flags.push({ geo, base: geo.attributes.position.array.slice(), ph: i * 1.7 });
    }
    const path = new T.Mesh(new T.PlaneGeometry(1.9, 14), std({ color: 0x0b1f66, roughness: .9 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .006, 8.5); path.receiveShadow = true; s.g.add(path);
    S.onFrame((time, i) => { if (i > 1) return; flags.forEach(f => { const pa = f.geo.attributes.position, b = f.base; for (let n = 0; n < pa.count; n++) { const x = b[n * 3], y = b[n * 3 + 1]; pa.array[n * 3 + 2] = Math.sin(time * 1.3 + y * 1.1 + f.ph) * .045 * (x / .82) + Math.sin(time * .8 + y * 2.2 + f.ph) * .018 * (x / .82); } pa.needsUpdate = true; }); });
  }
  /* 3 · two directional signs, 200 cm */
  const signS = station(48, { c: [0, 1.05, .3], rx: 1.15, ry: 1.2, yaw: .5, pitch: .05, drift: .7 });
  /* 4 · the entrance wall, an L: 150 + 340 cm, 235 cm high */
  {
    const s = station(62, { c: [.5, 1.2, .5], rx: 2.6, ry: 1.45, yaw: .52, pitch: .08, drift: .55 });
    const t1 = tex('wall-stairs.webp'), t2 = tex('wall-stairs.webp'), k = 150 / 490;
    t1.repeat.set(1 - k, 1); t1.offset.set(k, 0); t2.repeat.set(k, 1); t2.offset.set(0, 0);
    const main = panel(3.4, 2.35, t1, .08); main.position.set(.75, 1.175, 0); s.g.add(main);
    const ret = panel(1.5, 2.35, t2, .08); ret.rotation.y = Math.PI / 2; ret.position.set(-.95, 1.175, .75); s.g.add(ret);
    S.blob(s.g, .75, .1, 4.6, 1.3, .85); S.blob(s.g, -.95, .8, 1.2, 2.2, .7);
    
  }
  /* 5 · the ClearView wall and its row of mannequins */
  {
    const s = station(78, { c: [0, 1.45, .3], rx: 2.9, ry: 1.7, yaw: .38, pitch: .07, drift: .6 });
    const w = panel(5.16, 3.0, tex('wall-cv.webp'), .08); w.position.set(0, 1.5, 0); s.g.add(w);
    for (let i = 0; i < 4; i++) { const m = manq(false); m.position.set(-.75 + i * .72, 0, .75); m.rotation.y = (i - 1.5) * .07; s.g.add(m); S.blob(s.g, m.position.x, .75, .9, .9, .8); }
    S.blob(s.g, 0, .1, 6.4, 1.4, .85);
  }
  /* 6 · the PhotoFusion X wall and the photo booth: two acrylic lenses, one clear, one tinted */
  const boothS = station(94, { c: [.2, 1.25, .9], rx: 2.35, ry: 1.6, yaw: -.5, pitch: .09, drift: -.7 });
  {
    const s = boothS, w = panel(5.16, 3.0, tex('wall-pfx.webp'), .08); w.position.set(0, 1.5, 0); s.g.add(w);
    s.g.add(box(1.7, .05, .7, std({ color: 0x24262b, roughness: .35, metalness: .3 }), 0, .025, 1.5));
    S.blob(s.g, 0, 1.5, 2.6, 1.5, .85); S.blob(s.g, 0, .1, 6.4, 1.4, .85);
    
  }
  /* 7 · the eye: the back wall for the product display */
  {
    const s = station(110, { c: [0, 1.6, .4], rx: 2.5, ry: 1.75, yaw: -.36, pitch: .08, drift: -.6 });
    const et = tex('eye.webp');
    const disc = new T.Mesh(new T.CylinderGeometry(1.42, 1.42, .1, 72), [dark, std({ map: et, emissive: 0xffffff, emissiveMap: et, emissiveIntensity: .42, roughness: .7 }), dark]);
    disc.rotation.x = Math.PI / 2; disc.position.set(0, 1.85, 0); disc.castShadow = true; s.g.add(disc);
    const wh = std({ color: 0xf4f4f6, roughness: .5 });
    s.g.add(box(.1, .5, .1, wh, -.28, .25, -.02), box(.1, .5, .1, wh, .28, .25, -.02), box(1.5, .05, .5, wh, 0, .025, -.02));
    [[-2.3, .7], [-1.25, 1.5], [0, 1.9], [1.25, 1.5], [2.3, .7]].forEach((p, i) => { const h = .78 + (i % 2) * .22, c = new T.Mesh(new T.CylinderGeometry(.27, .27, h, 40), std({ color: 0xe9eaee, roughness: .85 })); c.position.set(p[0], h / 2, p[1]); c.castShadow = true; s.g.add(c); S.blob(s.g, p[0], p[1], 1.2, 1.2, .85);
      const glow = new T.Mesh(new T.CircleGeometry(.5, 40), new T.MeshBasicMaterial({ color: 0x4a6bff, transparent: true, opacity: 0, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.set(p[0], .012, p[1]); glow.renderOrder = 4; s.g.add(glow); });
  }
  /* 8 · the 74-ft screen, our film playing */
  {
    const s = station(146, { c: [0, 3.0, 0], rx: 11.6, ry: 4.6, yaw: .26, pitch: .02, drift: .3, fx: .9, fy: .5, ox: 0, oy: .19, yawp: 1.0, rxp: 6.4 });
    const l = video('a/led-2816.mp4', 'a/led-1408.mp4', 'a/led-poster.webp'); s.vid = l.v;
    const Wd = 22.56, Hd = Wd * 648 / 2816, scr = new T.Mesh(new T.PlaneGeometry(Wd, Hd), new T.MeshBasicMaterial({ map: l.t, toneMapped: false })); scr.position.set(0, 1.0 + Hd / 2, .02); s.g.add(scr);
    s.g.add(box(Wd + .3, Hd + .3, .3, dark, 0, 1.0 + Hd / 2, -.16));
    s.dims.push({ a: [-Wd / 2, 1.0 + Hd + .35, .1], b: [Wd / 2, 1.0 + Hd + .35, .1], t: '74 ft', big: true });
    S.blob(s.g, 0, .4, 25, 3, .8);
  }

  /* the caption follows what is on screen. The engine keeps the last caption while a built result is held; when that result's film
     is not ready yet (a slow phone), no result is held and the new model was on screen under the old caption. Here the caption
     switches with the camera instead. The intro (before the first stop) is left to the engine. */
  {
    const stick = sec.querySelector('.fp-stick'), sts = [].slice.call(sec.querySelectorAll('.st')), N = S.ST.length;
    const cut = n => !!sec.querySelector('.fp-built[data-b="' + n + '"]');
    S.onFrame((time, i, local) => {
      if (i === 0 && local === 0) return;
      let want = i;
      if (stick.classList.contains('is-cut')) want = i > 0 && cut(i - 1) && local < .06 ? i - 1 : i;
      else if (local > .89 && i < N - 1 && cut(i)) want = i + 1;
      sts.forEach(e => { const on = +e.dataset.s === want; if (e.classList.contains('on') !== on) e.classList.toggle('on', on); });
    });
  }

  /* pieces that need the traced outlines: the signs, the booth lenses */
  fetch(A + 'shapes.json?v=2').then(r => r.json()).then(j => {
    { /* signs: the outline is traced from the production artwork itself (the project's presentation, 24 June 2022), then given depth; 200 cm tall, 69 cm at the arrow */
      const sh = new T.Shape(j.sign.map(p => new T.Vector2(p[0], p[1]))), geo = new T.ExtrudeGeometry(sh, { depth: .09, bevelEnabled: false });
      const face = std({ map: tex('sign-2.webp'), alphaTest: .35, roughness: .55 });
      [[-.62, .34], [.62, -.3]].forEach((p, i) => { const m = new T.Mesh(geo, [face, std({ color: 0x2a2c31, roughness: .5 })]); m.scale.set(.689, 2.0, 1); m.position.set(p[0] - .344, 0, .1 + i * .5); m.rotation.y = p[1]; m.castShadow = true; signS.g.add(m); S.blob(signS.g, p[0], .2 + i * .5, 1.5, 1.0, .85); });
      
    }
    { /* booth: panel 170 x 120 cm, lenses up to 150 cm, 2 cm acrylic */
      const g = boothS.g, z = 1.5, cm = .01;
      const glass = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: .03, metalness: 0, transmission: 1, thickness: .05, ior: 1.49, clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 2.4, side: T.DoubleSide });
      const tint = new T.MeshPhysicalMaterial({ color: 0x55666f, roughness: .05, metalness: 0, transmission: .82, thickness: .4, ior: 1.49, attenuationColor: new T.Color(0x2f3d45), attenuationDistance: .25, clearcoat: 1, envMapIntensity: 2.2, side: T.DoubleSide });
      const edge = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
      const pg = new T.BoxGeometry(1.7, 1.2, .02), pn = new T.Mesh(pg, glass); pn.position.set(0, .65, z); g.add(pn);
      const pe = new T.LineSegments(new T.EdgesGeometry(pg), edge); pe.position.copy(pn.position); g.add(pe);
      const pts = j.lens.map(p => new T.Vector2((p[0] - 85) * cm, p[1] * cm + .05));
      const mk = (mir, mat) => { const sh = new T.Shape(pts.map(p => new T.Vector2(mir ? -p.x : p.x, p.y))), geo = new T.ExtrudeGeometry(sh, { depth: .02, bevelEnabled: true, bevelThickness: .003, bevelSize: .003, bevelSegments: 2, curveSegments: 4 }); const m = new T.Mesh(geo, mat); m.position.set(0, 0, z + .014); m.castShadow = !mir; g.add(m);
        const e = new T.LineSegments(new T.EdgesGeometry(geo, 40), edge); e.position.copy(m.position); g.add(e); };
      mk(false, tint); mk(true, glass);
      /* the tinted lens starts clear and darkens while you stand at the booth, the way PhotoFusion X darkens in the sun */
      { const c0 = new T.Color(0xdfe8ee), c1 = new T.Color(0x55666f), a0 = new T.Color(0xf4f8fa), a1 = new T.Color(0x2f3d45);
        S.onFrame((time, i, local) => { if (i !== 4) return; const k = S.FP.ease(S.FP.seg(local, .04, .38)); tint.color.copy(c0).lerp(c1, k); tint.attenuationColor.copy(a0).lerp(a1, k); tint.attenuationDistance = 2.4 - 2.15 * k; tint.transmission = .95 - .13 * k; }); }
      { const sh = new T.Shape(pts.map(p => new T.Vector2(-p.x, p.y))), hint = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .09, depthWrite: false, side: T.DoubleSide })); hint.position.set(0, 0, z + .04); hint.renderOrder = 8; g.add(hint);
        const ph = new T.Mesh(new T.PlaneGeometry(1.7, 1.2), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .05, depthWrite: false, side: T.DoubleSide })); ph.position.set(0, .65, z + .012); ph.renderOrder = 8; g.add(ph); }
      const lt = tex('booth-label.webp'), lab = new T.Mesh(new T.PlaneGeometry(.78, .78 * 218 / 1024), new T.MeshBasicMaterial({ map: lt, transparent: true, depthWrite: false })); lab.position.set(0, .72, z + .013); lab.renderOrder = 9; g.add(lab);
    }
    S.ready();
  }).catch(() => S.ready());
}
