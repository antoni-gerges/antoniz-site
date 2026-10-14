/* Innovation Month, Al Ain City Municipality, February 2024: the idea as a 3D assembly, made for this portfolio.
   What is drawn, and where each part comes from:
   - the mark: the UAE Innovates mark as used in the 2024 artwork (archive 01-WORK/157) and in the project's own presentation
     ("UAE Innovation month 24 AAM.pdf", 4 February 2024): 44 large squares and 33 small ones at its edges, 77 in all, each keeping its
     own colour. Cells are [column, row, size, colour] on a 26 x 20 grid of the small square. No official guideline file for the mark was
     found in the project folders. The mark belongs to the national campaign; only its squares are shown, not its lettering.
   - the gate: the first proposal, design render of January 2024 marked 12 m by 4 m (archive 01-WORK/181, "dim1"): 60 boxes of 0.8 m in a
     15 x 5 grid with the opening in the middle. The built gate of February stood under a truss; that is shown after this model, in the renders
     and the film.
   The sequence is the idea itself: the squares gather into the mark, each square takes depth and is a box, the boxes stack into the gate. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

const MARK = {"cols":26,"rows":20,"cells":[[1,12,2,"#71cff1"],[5,12,2,"#3936b6"],[5,14,2,"#4c55f0"],[5,16,2,"#2223be"],[7,12,2,"#72cff3"],[7,14,2,"#383aef"],[7,16,2,"#5836e2"],[9,12,2,"#5047ee"],[9,14,2,"#5a36e4"],[9,16,2,"#6975ff"],[11,10,2,"#5796f5"],[11,12,2,"#5836e0"],[11,14,2,"#3937b4"],[11,16,2,"#362c70"],[13,10,2,"#71cff1"],[13,12,2,"#4f48ee"],[13,14,2,"#5836e2"],[13,16,2,"#2622bd"],[13,18,2,"#5a95f5"],[15,8,2,"#71d0f2"],[15,10,2,"#362d70"],[15,12,2,"#6b74fd"],[15,14,2,"#3837b6"],[15,16,2,"#4f48f0"],[15,18,2,"#5837e2"],[17,6,2,"#485eed"],[17,8,2,"#5737e4"],[17,10,2,"#4e49ee"],[17,12,2,"#5b35e1"],[17,14,2,"#393aef"],[17,16,2,"#6975fd"],[17,18,2,"#5697f5"],[19,4,2,"#485feb"],[19,6,2,"#5836e2"],[19,8,2,"#71cff3"],[19,10,2,"#5836e2"],[19,12,2,"#6974ff"],[19,14,2,"#5996f1"],[21,4,2,"#5836e2"],[21,6,2,"#3b62db"],[21,8,2,"#2622bf"],[21,10,2,"#c0c0ff"],[23,2,2,"#393aed"],[23,4,2,"#4f48ee"],[24,0,1,"#5797f4"],[24,1,1,"#3e60df"],[21,3,1,"#71d0f0"],[22,3,1,"#3a62d9"],[25,3,1,"#3d61db"],[25,4,1,"#5994f7"],[25,5,1,"#5796f7"],[23,6,1,"#5996f3"],[25,6,1,"#3665d7"],[23,7,1,"#6fd0f3"],[0,11,1,"#bfc1ff"],[23,11,1,"#3a63dc"],[4,12,1,"#5896ef"],[21,12,1,"#3a63d9"],[3,13,1,"#383aea"],[4,13,1,"#3939ef"],[21,13,1,"#564aee"],[3,14,1,"#3939ed"],[4,14,1,"#383be6"],[21,14,1,"#c0bfff"],[4,15,1,"#72cff2"],[4,16,1,"#5b94f0"],[19,16,1,"#2421c4"],[20,16,1,"#393aee"],[19,17,1,"#3a3aec"],[7,18,1,"#5796ed"],[8,18,1,"#c1bfff"],[9,18,1,"#71d0f3"],[10,18,1,"#5997ec"],[11,18,1,"#5048ed"],[12,18,1,"#3a38b2"],[19,18,1,"#3a36b9"],[19,19,1,"#4e4be4"]]};
const GATE = {"cols":15,"rows":5,"box":0.8,"cells":[[0,0,"#3a2a9a"],[1,0,"#c5bbd5"],[2,0,"#331f74"],[3,0,"#689ede"],[4,0,"#d1c7e0"],[10,0,"#ccc8e4"],[11,0,"#689ede"],[12,0,"#331f74"],[13,0,"#c1b8d5"],[14,0,"#6fa3e8"],[0,1,"#7fd0e8"],[1,1,"#cdc8f0"],[2,1,"#455bd2"],[3,1,"#8bccde"],[4,1,"#689ede"],[10,1,"#8ccedc"],[11,1,"#8aceda"],[12,1,"#475dd4"],[13,1,"#331f71"],[14,1,"#3c6291"],[0,2,"#3a2a9a"],[1,2,"#679bd7"],[2,2,"#cbc3db"],[3,2,"#4a5dd3"],[4,2,"#cdc8f0"],[10,2,"#cdc8f0"],[11,2,"#485ed5"],[12,2,"#cbc3db"],[13,2,"#6298d8"],[14,2,"#004fa2"],[0,3,"#7fd0e8"],[1,3,"#cdc8f0"],[2,3,"#699dd9"],[3,3,"#8bc8db"],[4,3,"#4f62d8"],[5,3,"#86c7d9"],[6,3,"#cbc3db"],[7,3,"#3e2982"],[8,3,"#cdc5dd"],[9,3,"#92cfe1"],[10,3,"#4d64d8"],[11,3,"#89cadc"],[12,3,"#699dd9"],[13,3,"#cdc8f0"],[14,3,"#2d2a8c"],[0,4,"#3a2a9a"],[1,4,"#4a5fd8"],[2,4,"#36217c"],[3,4,"#4b62d6"],[4,4,"#cdc8f0"],[5,4,"#2d2a8c"],[6,4,"#3c3e6f"],[7,4,"#6ca0dc"],[8,4,"#0958d9"],[9,4,"#4949ac"],[10,4,"#291375"],[11,4,"#4d60d6"],[12,4,"#38257f"],[13,4,"#4a5fd8"],[14,4,"#6fa3e8"]]};

const sec = document.querySelector('.fp-model'), FP = window.FP;
const S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.02, fog: 0x030409, floorColor: 0x0a0c16, floorRough: .5, mirrorK: 0 });
if (S) build();

function build() {
  const { station, scene, world } = S, E = FP.ease, seg = FP.seg, lerp = (a, b, t) => a + (b - a) * t;
  const rand = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const U = .34, MY = .7, MW = MARK.cols * U, MH = MARK.rows * U, MC = MY + MH / 2;   /* one square of the mark; the mark stands on the floor line */

  scene.add(new T.HemisphereLight(0xdfe6ff, 0x1c2470, .3));
  const sun = new T.DirectionalLight(0xffffff, .8); sun.position.set(-7, 11, 12); scene.add(sun);

  /* every square of the mark, large or small, is one box. The sixty nearest the middle go on to build the gate, bottom row first; the others step back. */
  const cx = (MARK.cols - 1) / 2, cy = (MARK.rows - 1) / 2;
  const cells = MARK.cells.map((c, k) => ({ x: (c[0] + (c[2] - 1) / 2 - cx) * U, y: MC + (cy - c[1] - (c[2] - 1) / 2) * U, n: c[2], col: new T.Color(c[3]), k, d: Math.hypot(c[0] + (c[2] - 1) / 2 - cx, (c[1] + (c[2] - 1) / 2 - cy) * 1.4),
    sx: (rand(k + 1) - .5) * 26, sy: 1 + rand(k + 5) * 11, sz: 6 + rand(k + 9) * 16, a: rand(k + 21) }));
  const Gt = GATE.cells.map((c, k) => ({ x: (c[0] - (GATE.cols - 1) / 2) * GATE.box + (c[1] % 2 ? .18 : -.12), y: c[1] * GATE.box + GATE.box / 2, z: (rand(k + 3) - .5) * .5,
    s: GATE.box * (.98 + rand(k + 11) * .16), col: new T.Color(c[2]) })).sort((a, b) => a.y - b.y || Math.abs(a.x) - Math.abs(b.x));
  [...cells].sort((a, b) => a.d - b.d).forEach((c, n) => { c.to = n < Gt.length ? Gt[n] : null; c.rank = n; });

  const boxes = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ roughness: .62, metalness: 0, envMapIntensity: .25 }), cells.length);
  boxes.frustumCulled = false; boxes.castShadow = true; boxes.receiveShadow = true; world.add(boxes);
  const dummy = new T.Object3D(), col = new T.Color();

  /* G runs 0 to 3 over the three stops. 0 to 1 the squares gather into the mark; 1 to 2 they take depth; 2 to 3 the boxes build the gate. */
  let last = -1;
  function compose(G) {
    if (Math.abs(G - last) < .0004) return; last = G;
    const asm = seg(G, .04, .66), deep = E(seg(G, 1.02, 1.5)), bld = seg(G, 2.02, 2.4);
    for (let i = 0; i < cells.length; i++) { const c = cells[i];
      const t0 = c.a * .55, ta = E(seg(asm, t0, t0 + .45));                                  /* gather: each square arrives on its own beat */
      let x = lerp(c.sx, c.x, ta), y = lerp(c.sy, c.y, ta), z = lerp(c.sz, 0, ta), sx = (c.n * U - .009) * (.2 + .8 * ta), sz = lerp(.02, c.n * U - .009, deep), ry = (1 - ta) * (c.a * 6 - 3), rx = (1 - ta) * 2;
      col.copy(c.col);
      if (bld > 0) {
        if (c.to) { const b0 = (c.rank / Gt.length) * .7, t = E(seg(bld, b0, b0 + .3));
          x = lerp(c.x, c.to.x, t); y = lerp(c.y, c.to.y, t) + Math.sin(t * Math.PI) * 1.1; z = lerp(0, c.to.z + 6, t); sx = lerp(sx, c.to.s, t); sz = lerp(sz, c.to.s, t); ry = (1 - t) * t * 2.4; col.lerp(c.to.col, t);
        } else { const t = E(seg(bld, 0, .35 + c.a * .3)); z = -t * 7; sx *= 1 - t; sz *= 1 - t; }
      }
      dummy.position.set(x, y, z); dummy.rotation.set(rx, ry, 0); dummy.scale.set(Math.max(sx, 1e-4), Math.max(sx, 1e-4), Math.max(sz, 1e-4)); dummy.updateMatrix();
      boxes.setMatrixAt(i, dummy.matrix); boxes.setColorAt(i, col);
    }
    boxes.instanceMatrix.needsUpdate = true; if (boxes.instanceColor) boxes.instanceColor.needsUpdate = true;
  }

  const none = { noMirror: true, drift: .12, keyK: .06 };   /* the engine's own key light is held low so the squares keep the mark's colours */
  const PH = FP.phone();
  station(0, Object.assign({}, none, { c: [0, MC, 0], rx: MW / 2 + .5, ry: MH / 2 + .4, yaw: 0, pitch: .02, fx: .62, fy: .74, ox: .16, oy: -.02, fxp: .96, fyp: .42, oxp: 0, oyp: -.14, drift: .06 }));
  station(0, Object.assign({}, none, { c: [0, MC, 0], rx: MW / 2 + .5, ry: MH / 2 + .4, yaw: .62, pitch: .14, fx: .6, fy: .74, ox: .16, oy: -.02, fxp: .96, fyp: .42, oxp: 0, oyp: -.14 }));
  const gate = station(0, Object.assign({}, none, { c: [0, 2.1, 6], rx: 6.9, ry: 2.7, yaw: -.4, pitch: .07, fx: .7, fy: .6, ox: .12, oy: 0, fxp: 1.0, fyp: .4, oxp: 0, oyp: -.14, yawp: -.3 }));
  

  /* ---------- the zigzag wall: ONE print, 9 m by 3 m, folded twelve times (the size is written on the design render: "9*3 print").
     The print is the wall's own artwork (2D file "sssw"). Nothing is added to it. What the model shows that a photograph cannot:
     the wall changes as you pass it. From the front the lettering reads whole; from the side every second face turns away and it breaks. ---------- */
  const zig = station(46, Object.assign({}, none, { c: [0, 1.6, .2], rx: 4.7, ry: 2.2, yaw: 0, pitch: .1, drift: 2.1, w: 1.5, fx: .7, fy: .6, ox: .14, oy: 0, fxp: 1.04, fyp: .4, oxp: 0, oyp: -.14 }));
  { const FOLDS = 12, FW = 9 / FOLDS, ANG = .58, H = 3, g = zig.g, dx = FW * Math.cos(ANG), dz = FW * Math.sin(ANG), span = dx * FOLDS, pos = [], uv = [], idx = [], colr = [];
    for (let k = 0; k < FOLDS; k++) { const x0 = -span / 2 + k * dx, x1 = x0 + dx, z0 = k % 2 ? dz : 0, z1 = k % 2 ? 0 : dz, b = k * 4;
      pos.push(x0, 0, z0, x1, 0, z1, x1, H, z1, x0, H, z0); uv.push(k / FOLDS, 0, (k + 1) / FOLDS, 0, (k + 1) / FOLDS, 1, k / FOLDS, 1); idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      const sh = k % 2 ? .62 : 1; for (let q = 0; q < 4; q++) colr.push(sh, sh, sh * (k % 2 ? 1.08 : 1)); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setAttribute('color', new T.Float32BufferAttribute(colr, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const wall = new T.Mesh(geo, new T.MeshStandardMaterial({ map: S.tex('zigzag.webp'), vertexColors: true, roughness: .78, metalness: 0, side: T.DoubleSide, envMapIntensity: .2 })); wall.position.y = .02; wall.castShadow = true; g.add(wall);
    const carpet = new T.Mesh(new T.PlaneGeometry(14, 8), new T.MeshStandardMaterial({ color: 0x1622a8, roughness: .95, metalness: 0 })); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, .006, 2.6); carpet.receiveShadow = true; g.add(carpet);
    const strip = new T.Mesh(new T.PlaneGeometry(10.2, 1.5), new T.MeshStandardMaterial({ color: 0x43b9e6, roughness: .95, metalness: 0 })); strip.rotation.x = -Math.PI / 2; strip.position.set(0, .012, 1.55); strip.receiveShadow = true; g.add(strip);
    /* the white plinths that stood in front of every wall (the design render marks them 1 by 1) */
    const white = new T.MeshStandardMaterial({ color: 0xf2f3f7, roughness: .6 });
    for (let k = 0; k < 5; k++) { const p = new T.Mesh(new T.BoxGeometry(.62, .86, .28), white); p.position.set(-3.4 + k * 1.7, .43, 1.6); p.castShadow = true; p.receiveShadow = true; g.add(p); }
    const lamp = new T.SpotLight(0xffffff, 60, 30, .62, .8, 1.4); lamp.position.set(-2, 7.5, 9); lamp.target.position.set(0, 1.4, 0); g.add(lamp, lamp.target);
    
  }

  compose(0);
  S.onFrame((time, i, local) => compose(i + local));
  /* with reduced motion the engine holds a still per stop: each stop shows its finished state */
  if (FP.rm) FP.on(() => { const on = sec.querySelector('.st.on'); compose(on ? +on.dataset.s + .995 : 0); });
  S.ready();
}
