/* Capacity Middle East: Etisalat's gala dinner for its carrier partners, 2018 and 2019. The idea as real-time 3D, made for this portfolio.
   What is drawn, and where each part comes from:
   - the constellation: Etisalat's mark as the 2018 invitation draws it, three orbits (with their faint echoes) and twenty-one points of
     light. Every line and point is read from the invitation's own vectors (7097_ET_CORP_Capacity-final.pdf, A3, Illustrator, 26 Feb 2018)
     into a/3d/constellation.json: each orbit is the centre line of its band in the file, each point the centre of its radial glow, each
     star a white dot of the file's sky. Nothing is drawn by eye. The colour along each orbit is sampled from the same file.
     The orbits sit at different depths; each layer is scaled by its depth so that, seen from the front, it is the invitation exactly
     (the proof: ~/Code/antoniz-tools/pages-14-oct/work/capacity-front-proof.jpg, 21 points within 1.4 px). As the camera turns, the layers part and the mark shows itself as a set of orbits.
     The points arrive from the sky and settle on their orbits; then the orbits draw themselves. No artwork is cut into layers: the mark
     is built from its own vectors. The invitation itself is then shown whole, as printed.
   - the stage: one main screen and two square side walls, LED cabinets with depth, on a dark deck with a lime edge. They play the films
     delivered for them (the side films 0 to 4.6 s and the closing film 0 to 10.45 s: the clean seconds before the client's bilingual
     logo enters; the opening film plays at the top of the page). The arrangement of the screens on the night is not recorded: this is a model, said so on the page, with no venue drawn. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

const INK = 0x0d0e0c;   /* the invitation's night */
const sec = document.querySelector('.fp-model'), FP = window.FP;
const S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.0, fog: INK, floorColor: 0x101110, floorRough: .8, floorOpacity: .86, mirrorK: 1.4, rim: 0xe4f08a, rimI: .25, fill: .5 });
if (S) { S.renderer.setClearColor(INK, 1); boot(); }
heroFilms();
layoutSets();

const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1), L = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, out3 = t => 1 - Math.pow(1 - t, 3);
const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();

/* a soft round light, for the points and the stars (the invitation draws its points as radial glows) */
function glowTex(inner) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(inner || .18, 'rgba(255,255,255,.75)'); g.addColorStop(.5, 'rgba(255,255,255,.16)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}

async function boot() {
  const { station, std, scene, cam } = S;
  const PHN = FP.phone();
  const C = await (await fetch('a/3d/constellation.json')).json();

  /* ============ 1 · the constellation ============ */
  const KS = .0115, CX = C.centre[0], CY = C.centre[1], Y0 = 4.7;
  const s0 = station(0, { noMirror: true, c: [0, Y0, 0], rx: 4.3, ry: 3.5, yaw: -.03, pitch: -.05, drift: 1.15, w: 1.6, keyK: .3, fx: .52, fy: .74, ox: -.16, oy: .05,
    rxp: 4.0, fxp: .98, fyp: .5, oxp: 0, oyp: .14, yawp: -.03 });
  const root = new T.Group(); root.position.set(0, Y0, 0); s0.g.add(root);
  const DEPTH = { 'm-outer-a': .0, 'm-outer-b': -.45, 'm-middle': -1.05, 'm-inner': -1.65, 'e-outer-a': -1.25, 'e-outer-b': -1.7, 'e-middle': -2.3, 'e-inner': -2.9 };
  const layers = [];   /* each: a group at its depth, scaled so that the front view is the artwork */
  const layer = z => { let l = layers.find(o => o.z === z); if (l) return l; const g = new T.Group(); g.position.z = z; root.add(g); l = { g, z }; layers.push(l); return l; };
  const at = (x, y) => [(x - CX) * KS, (y - CY) * KS];
  const col = h => { const c = new T.Color('#' + h); return c; };

  /* the orbits: a fine tube along the centre line of each band, coloured along its length as the file is */
  const orbits = C.loops.map(o => {
    const pts = o.pts.map(p => { const q = at(p[0], p[1]); return new T.Vector3(q[0], q[1], 0); });
    const curve = new T.CatmullRomCurve3(pts, true, 'centripetal');
    const TS = Math.min(900, pts.length), RS = 6, echo = o.id[0] === 'e';
    const geo = new T.TubeGeometry(curve, TS, echo ? .0072 : .0105, RS, true);
    /* colours: the 32 samples of the file, a sample that fell on a point of light replaced by its neighbours */
    const cs = o.col.map(h => col(h)); cs.forEach((c, i) => { const hsl = {}; c.getHSL(hsl); if (hsl.l > .62) { const a = cs[(i + 31) % 32], b = cs[(i + 1) % 32]; c.copy(a).lerp(b, .5); } });
    const n = geo.attributes.position.count, ca = new Float32Array(n * 3);
    for (let i = 0; i <= TS; i++) { const f = (i / TS) * 32, k = Math.floor(f) % 32, c = cs[k].clone().lerp(cs[(k + 1) % 32], f - Math.floor(f)); for (let j = 0; j <= RS; j++) { const v = i * (RS + 1) + j; if (v < n) { ca[v * 3] = c.r; ca[v * 3 + 1] = c.g; ca[v * 3 + 2] = c.b; } } }
    geo.setAttribute('color', new T.BufferAttribute(ca, 3));
    const mat = new T.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 1 });
    const m = new T.Mesh(geo, mat); m.userData.noMirror = true; layer(DEPTH[o.id]).g.add(m);
    return { id: o.id, m, geo, mat, TS, RS, echo, total: geo.index.count };
  });

  /* the points of light: each sits on its orbit, at the orbit's depth; it arrives from the sky */
  const gT = glowTex(.16), sphere = new T.SphereGeometry(1, 20, 14);
  const pts = C.dots.map((d, i) => {
    const q = at(d.x, d.y), r = d.r * KS, big = d.r > 6;   /* each point is the file's own disc: its centre and its radius (8 pt or 4 pt) */
    const g = new T.Group(); layer(DEPTH[d.on]).g.add(g);
    const core = new T.Mesh(sphere, new T.MeshBasicMaterial({ color: 0xf3ef2c, toneMapped: false, transparent: true })); core.scale.setScalar(r); g.add(core);
    const hot = new T.Mesh(sphere, new T.MeshBasicMaterial({ color: 0xfffde0, toneMapped: false, transparent: true })); hot.scale.setScalar(.45); hot.position.z = .6; core.add(hot);   /* a hot centre, in the disc's own units */
    const halo = new T.Sprite(new T.SpriteMaterial({ map: gT, color: 0xe9ee3a, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, opacity: .5 }));
    halo.scale.setScalar(r * 3.4); g.add(halo);
    const from = new T.Vector3((rnd() - .5) * 15, (rnd() - .35) * 9, -4 - rnd() * 7);
    return { g, core, halo, big, to: new T.Vector3(q[0], q[1], 0), from, delay: rnd() * .3 };
  });

  /* the stars of the invitation's sky, at three depths */
  const sT = glowTex(.3);
  [[-3.6, 0], [-5.4, 1], [-8, 2]].forEach(([z, band]) => {
    const list = C.stars.filter((s, i) => i % 3 === band), pos = new Float32Array(list.length * 3);
    list.forEach((s, i) => { const q = at(s[0], s[1]); pos[i * 3] = q[0]; pos[i * 3 + 1] = q[1]; pos[i * 3 + 2] = 0; });
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    const p = new T.Points(geo, new T.PointsMaterial({ map: sT, color: 0xffffff, size: .075, sizeAttenuation: true, transparent: true, opacity: .55, depthWrite: false, toneMapped: false }));
    p.userData.noMirror = true; layer(z).g.add(p);
  });

  /* each layer is scaled about the camera's axis by its depth, so the front view stays the artwork */
  const tgt = new T.Vector3();
  const fit = () => { tgt.set(s0.g.position.x, Y0, 0); const D = Math.max(4, cam.position.distanceTo(tgt)); layers.forEach(l => l.g.scale.setScalar((D - l.z) / D)); };

  const constellation = t => {
    pts.forEach(p => { const u = out3(seg(t, p.delay * .9, p.delay * .9 + .42)); p.g.position.lerpVectors(p.from, p.to, u); p.g.visible = u > 0; p.core.material.opacity = Math.min(1, u * 3); p.halo.material.opacity = (p.big ? .55 : .45) * Math.min(1, u * 2.5); });
    orbits.forEach((o, i) => { const u = o.echo ? 1 : ease(seg(t, .32 + i * .04, .78 + i * .03)); o.m.visible = u > .002;
      if (o.echo) { o.mat.opacity = ease(seg(t, .74, 1)); o.geo.setDrawRange(0, o.total); }
      else o.geo.setDrawRange(0, Math.max(0, Math.floor(u * o.TS)) * o.RS * 6); });
  };

  /* ============ 2 and 3 · the stage: two square walls, then the main screen ============ */
  /* stop 2 comes close to the left wall, face on, so the city's single line reads (the right wall is its mirror) */
  const SX = 64, s1 = station(SX, { c: [-6.95, 2.95, -1.3], rx: 2.75, ry: 2.5, yaw: .42, pitch: 0, drift: .16, w: 1.0, keyK: .002, fx: .5, fy: .64, ox: -.26, oy: .02,
    rxp: 2.45, fxp: 1.0, fyp: .5, oxp: 0, oyp: .1, yawp: .42 });
  const s2 = station(SX, { c: [0, 3.2, -1.1], rx: 9.9, ry: 3.4, yaw: .34, pitch: .12, drift: .4, w: 1.2, keyK: .002, fx: .7, fy: .72, ox: -.1, oy: .05,
    rxp: 9.6, fxp: 1.0, fyp: .44, oxp: 0, oyp: .13, yawp: .24 });
  const sg = s1.g;
  const black = std({ color: 0x070807, roughness: .7, metalness: .1 }), deckM = std({ color: 0x0b0c0b, roughness: .55, metalness: .1 });
  const lime = new T.MeshBasicMaterial({ color: 0xc7cc06, toneMapped: false });
  /* a low deck with a lime edge (the green-lit edges of both 2018 stage designs); the screens stand on it */
  const deck = new T.Mesh(new T.BoxGeometry(19.5, .5, 5.4), deckM); deck.position.set(0, .25, -.6); deck.receiveShadow = true; sg.add(deck);
  const edge = new T.Mesh(new T.BoxGeometry(19.5, .03, .03), lime); edge.position.set(0, .51, 2.1); sg.add(edge);
  /* a screen: a cabinet with depth, the film on its face */
  const screen = (w, h, src, poster, boost) => {
    const g = new T.Group(); const cab = new T.Mesh(new T.BoxGeometry(w + .24, h + .24, .38), black); cab.position.z = -.19; cab.castShadow = cab.receiveShadow = true; g.add(cab);
    const vv = S.video(src, src, poster), mat = new T.MeshBasicMaterial({ map: vv.t, toneMapped: false, color: 0xffffff });
    const face = new T.Mesh(new T.PlaneGeometry(w, h), mat); face.position.z = .005; g.add(face);
    if (boost) { const lift = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: vv.t, toneMapped: false, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: boost })); lift.position.z = .008; g.add(lift); }   /* the LED's own glow: the dark film lit so its thin line reads */
    sg.add(g); return { g, v: vv.v, mat };
  };
  /* the main screen at the films' own shape, 16:9 (the brief of 1 Mar 2018 reads "SIZE 12m x 4m Ratio 16:9"; how the films sat on
     the wall on the night is not recorded, so the model keeps the films whole at their own shape and draws no venue) */
  const MW = 8.2, MH = MW * 9 / 16, SW = 4.2;
  const main = screen(MW, MH, 'a/3d/close-2018.mp4', 'a/3d/close-2018-poster.webp');
  main.g.position.set(0, .5 + .35 + MH / 2, -2.2);
  const sideL = screen(SW, SW, 'a/3d/side-l.mp4', 'a/3d/side-l-poster.webp', 1), sideR = screen(SW, SW, 'a/3d/side-r.mp4', 'a/3d/side-r-poster.webp', 1);
  sideL.g.position.set(-6.95, .5 + .35 + SW / 2, -1.3); sideL.g.rotation.y = .42;
  sideR.g.position.set(6.95, .5 + .35 + SW / 2, -1.3); sideR.g.rotation.y = -.42;
  const vids = [main.v, sideL.v, sideR.v].filter(Boolean);
  const want = (v, on) => { if (!v) return; if (on && !FP.hold) { if (!v.src) v.src = v.dataset.s; if (v.paused) { const p = v.play(); p && p.catch && p.catch(() => {}); } } else if (!v.paused) v.pause(); };

  const stageSet = (i, l) => {
    const on = i === 1 ? 0 : i === 2 ? ease(seg(l, .02, .3)) : 0;   /* the main screen wakes in the third stop */
    main.mat.color.setScalar(.04 + .96 * on);
    want(main.v, i === 2 && on > .05); want(sideL.v, i >= 1); want(sideR.v, i >= 1);
  };

  /* in the first stop the camera turns from an angle (the orbits part in depth) to the front, where they lock into the invitation's
     mark, and holds there until the invitation itself cuts in (the engine cuts at 0.44 of the stop) */
  const cv = new T.Vector3();
  const frontOn = l => { tgt.set(s0.g.position.x, Y0, 0); const d = cam.position.distanceTo(tgt), u = ease(seg(l, 0, .27)), yaw = -.52 * (1 - u), pit = .1 * (1 - u);
    cv.set(Math.sin(yaw) * Math.cos(pit) * d, Math.sin(pit) * d, Math.cos(yaw) * Math.cos(pit) * d); cam.position.copy(tgt).add(cv); cam.lookAt(tgt); };
  const compose = (i, l) => {
    if (i === 0 && l < .7 && !FP.rm) frontOn(l);
    fit();
    constellation(i === 0 ? seg(l, .0, .27) : 1);
    stageSet(i, l);
  };
  compose(0, 0);
  S.onFrame((time, i, local) => compose(i, local));
  if (FP.rm) FP.on(() => { const on = sec.querySelector('.st.on'); const i = on ? +on.dataset.s : 0; constellation(1); fit(); main.mat.color.setScalar(i === 2 ? 1 : .04); });
  window.__cp = { points: pts.map(p => p.g), dots: C.dots };   /* for the front-on proof */
  S.ready();
  /* when the chapter leaves the screen, the engine pauses its films; the stage films also wait while the player is open */
  FP.on(() => { if (FP.hold) vids.forEach(v => want(v, false)); });
}

/* the opening films: the 2019 film opens on the hotel (its first four seconds are the client's end card, kept in the loop after) */
function heroFilms() {
  const v = document.querySelector('.cp-second .f19 video'); if (!v) return;
  v.addEventListener('loadedmetadata', () => { if (!v._start && v.currentTime < 1) { v._start = 1; try { v.currentTime = 4.2; } catch (e) {} } }, { once: true });
}

/* the composed screens: each set of pictures is shown whole at once, in rows of one height each, fitted to one screen on a wide screen
   (on a phone, one per row). No picture is cut and no field of ours is laid behind any of them. */
function layoutSets() {
  const sets = [].slice.call(document.querySelectorAll('.cp-set')); if (!sets.length) return;
  const lay = () => sets.forEach(s => {
    const ph = innerWidth <= 760, grid = s.querySelector('.grid'), figs = [].slice.call(grid.querySelectorAll('figure')), rows = JSON.parse(s.dataset[ph ? 'rowsP' : 'rows']);
    figs.forEach(f => grid.appendChild(f)); [].slice.call(grid.querySelectorAll('.cp-row')).forEach(r => r.remove());
    const gap = ph ? 12 : 18, W = grid.clientWidth, capH = ph ? 40 : 36, cs = getComputedStyle(s);
    const hw = rows.map(r => (W - gap * (r.length - 1)) / r.reduce((a, k) => a + +figs[k].dataset.r, 0));
    let k = 1;
    if (!ph) { const H = innerHeight - s.querySelector('.hd').offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - rows.length * capH - gap * (rows.length - 1) - 10; k = Math.max(.35, Math.min(1, H / hw.reduce((a, b) => a + b, 0))); }
    rows.forEach((r, i) => { const row = document.createElement('div'); row.className = 'cp-row'; row.style.gap = gap + 'px'; row.style.marginTop = i ? gap + 'px' : '0';
      const hh = ph ? Math.min(hw[i], innerHeight * .42) : hw[i] * k;
      r.forEach(n => { const f = figs[n]; f.style.width = Math.floor(+f.dataset.r * hh) + 'px'; row.appendChild(f); }); grid.appendChild(row); });
  });
  lay(); addEventListener('resize', lay); addEventListener('load', lay);
}
