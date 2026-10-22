/* Innovation Month, Al Ain City Municipality, February 2024: the idea as a 3D assembly, made for this portfolio.
   What is drawn, and where each part comes from:
   - the mark: the UAE Innovates mark as used in the 2024 artwork (archive 01-WORK/157) and in the project's own presentation
     ("UAE Innovation month 24 AAM.pdf", 4 February 2024): 44 large squares and 33 small ones at its edges, 77 in all, each keeping its
     own colour. Cells are [column, row, size, colour] on a 26 x 20 grid of the small square. No official guideline file for the mark was
     found in the project folders. The mark belongs to the national campaign; only its squares are shown, not its lettering.
   - the gate: traced box by box from the first proposal's front render of January 2024 (My Drive/AAM Innovation Month/Renders/3.jpg, 1920 x 1080,
     the same view as "dim1" without the sizes; shown beside the model on the page as a/r-gate.webp). Each box is [x0, x1, y0, y1] of its front
     face in the render's pixels, how far it stands out (+1), back (-1) or flush (0), and the colour read from the render itself. Rows of boxes of
     different sizes, the opening in the middle, the two header boards (their faces are the render's own boards) and the side wall on the right.
     150 render pixels are taken as one metre, so the model keeps the render's proportions exactly. The built gate of February stood under a
     truss; that is shown after this model, in the renders and the film.
   The sequence is the idea itself: the squares gather into the mark, each square takes depth and is a box, the boxes stack into the gate. */
let stage, T;   /* perf21 F1: three.js and the 3D engine load when the 3D chapter is near: near3d() at the end */

const MARK = {"cols":26,"rows":20,"cells":[[1,12,2,"#71cff1"],[5,12,2,"#3936b6"],[5,14,2,"#4c55f0"],[5,16,2,"#2223be"],[7,12,2,"#72cff3"],[7,14,2,"#383aef"],[7,16,2,"#5836e2"],[9,12,2,"#5047ee"],[9,14,2,"#5a36e4"],[9,16,2,"#6975ff"],[11,10,2,"#5796f5"],[11,12,2,"#5836e0"],[11,14,2,"#3937b4"],[11,16,2,"#362c70"],[13,10,2,"#71cff1"],[13,12,2,"#4f48ee"],[13,14,2,"#5836e2"],[13,16,2,"#2622bd"],[13,18,2,"#5a95f5"],[15,8,2,"#71d0f2"],[15,10,2,"#362d70"],[15,12,2,"#6b74fd"],[15,14,2,"#3837b6"],[15,16,2,"#4f48f0"],[15,18,2,"#5837e2"],[17,6,2,"#485eed"],[17,8,2,"#5737e4"],[17,10,2,"#4e49ee"],[17,12,2,"#5b35e1"],[17,14,2,"#393aef"],[17,16,2,"#6975fd"],[17,18,2,"#5697f5"],[19,4,2,"#485feb"],[19,6,2,"#5836e2"],[19,8,2,"#71cff3"],[19,10,2,"#5836e2"],[19,12,2,"#6974ff"],[19,14,2,"#5996f1"],[21,4,2,"#5836e2"],[21,6,2,"#3b62db"],[21,8,2,"#2622bf"],[21,10,2,"#c0c0ff"],[23,2,2,"#393aed"],[23,4,2,"#4f48ee"],[24,0,1,"#5797f4"],[24,1,1,"#3e60df"],[21,3,1,"#71d0f0"],[22,3,1,"#3a62d9"],[25,3,1,"#3d61db"],[25,4,1,"#5994f7"],[25,5,1,"#5796f7"],[23,6,1,"#5996f3"],[25,6,1,"#3665d7"],[23,7,1,"#6fd0f3"],[0,11,1,"#bfc1ff"],[23,11,1,"#3a63dc"],[4,12,1,"#5896ef"],[21,12,1,"#3a63d9"],[3,13,1,"#383aea"],[4,13,1,"#3939ef"],[21,13,1,"#564aee"],[3,14,1,"#3939ed"],[4,14,1,"#383be6"],[21,14,1,"#c0bfff"],[4,15,1,"#72cff2"],[4,16,1,"#5b94f0"],[19,16,1,"#2421c4"],[20,16,1,"#393aee"],[19,17,1,"#3a3aec"],[7,18,1,"#5796ed"],[8,18,1,"#c1bfff"],[9,18,1,"#71d0f3"],[10,18,1,"#5997ec"],[11,18,1,"#5048ed"],[12,18,1,"#3a38b2"],[19,18,1,"#3a36b9"],[19,19,1,"#4e4be4"]]};
const GATE = {"px":150,"cx":982.5,"base":815,"boxes":[[355,440,180,300,-1,"#37227d"],[440,575,170,300,1,"#4b60d7"],[905,1050,155,285,0,"#6ca0dc"],[1350,1490,155,290,1,"#4e62d7"],[1490,1635,165,285,-1,"#392681"],[320,450,300,430,1,"#679bd7"],[455,565,300,430,0,"#8ac9db"],[565,700,300,430,1,"#4f62d8"],[700,770,305,440,-1,"#68acc8"],[765,895,300,385,0,"#cac2db"],[895,1050,290,365,0,"#3e2c83"],[1050,1180,300,380,0,"#cec5dd"],[1150,1220,300,440,-1,"#7eb2ce"],[1220,1355,290,425,1,"#4d64d8"],[1355,1480,295,425,0,"#8acadd"],[1480,1615,290,420,1,"#699dd9"],[190,325,425,555,1,"#679bd7"],[330,455,435,555,-1,"#cbc2db"],[455,585,435,555,0,"#4b5ed5"],[585,645,435,560,-1,"#2b1f60"],[1340,1480,425,555,0,"#4c60d7"],[1480,1615,425,555,0,"#ccc4dd"],[1615,1760,420,550,1,"#6298d6"],[235,355,555,685,0,"#271a5b"],[355,480,555,685,0,"#455bd2"],[480,610,555,685,1,"#8acbdd"],[615,755,555,685,1,"#6a9eda"],[1185,1320,555,690,1,"#6a9eda"],[1320,1450,555,690,0,"#8bccde"],[1450,1585,555,690,0,"#475dd4"],[1585,1720,555,685,0,"#342075"],[110,215,685,810,0,"#281562"],[215,345,685,815,1,"#cbc3db"],[350,460,690,815,-1,"#352077"],[460,590,685,815,0,"#689ede"],[600,710,690,815,0,"#d0c7e0"],[1235,1335,690,815,0,"#d0c8e0"],[1335,1470,690,815,1,"#699fde"],[1470,1595,690,815,-1,"#341f76"],[1595,1735,690,815,1,"#c2b9d6"],[1735,1855,685,820,0,"#2a1964"]],"boards":[[612,904,158,292,"board-dmt.webp"],[1051,1339,151,291,"board-uae.webp"]],"side":[1666,1851,356,682]};

const sec = document.querySelector('.fp-model'), FP = window.FP;
let S;
near3d(sec, () => { S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.02, fog: 0x030409, floorColor: 0x0a0c16, floorRough: .5, mirrorK: 0 });
if (S) build(); });

function build() {
  const { station, scene, world } = S, E = FP.ease, seg = FP.seg, lerp = (a, b, t) => a + (b - a) * t;
  const rand = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const U = .34, MY = .7, MW = MARK.cols * U, MH = MARK.rows * U, MC = MY + MH / 2;   /* one square of the mark; the mark stands on the floor line */

  scene.add(new T.HemisphereLight(0xdfe6ff, 0x1c2470, .3));
  const sun = new T.DirectionalLight(0xffffff, .8); sun.position.set(-7, 11, 12); scene.add(sun);

  /* every square of the mark, large or small, is one box. The sixty nearest the middle go on to build the gate, bottom row first; the others step back. */
  const cx = (MARK.cols - 1) / 2, cy = (MARK.rows - 1) / 2;
  /* the squares start as a loose cloud already in the frame (14 Oct night: the chapter must never open on an empty screen), then gather into the mark */
  const cells = MARK.cells.map((c, k) => ({ x: (c[0] + (c[2] - 1) / 2 - cx) * U, y: MC + (cy - c[1] - (c[2] - 1) / 2) * U, n: c[2], col: new T.Color(c[3]), k, d: Math.hypot(c[0] + (c[2] - 1) / 2 - cx, (c[1] + (c[2] - 1) / 2 - cy) * 1.4),
    sx: (rand(k + 1) - .5) * MW * 1.5, sy: Math.max(.5, MC + (rand(k + 5) - .5) * MH * 1.3), sz: (rand(k + 9) - .5) * 8, a: rand(k + 21) }));
  /* the gate's boxes, from the render's pixels to metres: x from the gate's middle, y from the ground, each box as deep as a cube of its size */
  const PX = GATE.px, mx = x => (x - GATE.cx) / PX, my = y => (GATE.base - y) / PX, GZ = 6;
  const Gt = GATE.boxes.map(b => { const w = (b[1] - b[0]) / PX, h = (b[3] - b[2]) / PX, d = .78;
    return { x: mx((b[0] + b[1]) / 2), y: my((b[2] + b[3]) / 2), z: b[4] * .22 - d / 2, w: w - .012, h: h - .012, d, col: new T.Color(b[5]) }; })
    .sort((a, b) => a.y - b.y || Math.abs(a.x) - Math.abs(b.x));
  [...cells].sort((a, b) => a.d - b.d).forEach((c, n) => { c.to = n < Gt.length ? Gt[n] : null; c.rank = n; });

  const boxes = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ roughness: .62, metalness: 0, envMapIntensity: .25 }), cells.length);
  boxes.frustumCulled = false; boxes.castShadow = true; boxes.receiveShadow = true; world.add(boxes);
  const dummy = new T.Object3D(), col = new T.Color();

  const gfill = new T.SpotLight(0xfff6ec, 0, 45, .75, .6, 1.2); gfill.position.set(-3, 8, 6 + 15); gfill.target.position.set(0, 2, 6); world.add(gfill, gfill.target);

  /* the two header boards (faces = the render's own boards, logos as made) and the side wall at the right, as in the render */
  const trims = [];
  GATE.boards.forEach(b => { const w = (b[1] - b[0]) / PX, h = (b[3] - b[2]) / PX, navy = new T.MeshStandardMaterial({ color: 0x1b2575, roughness: .6 });
    const face = new T.MeshStandardMaterial({ map: S.tex(b[4]), roughness: .55, metalness: 0 });
    const m = new T.Mesh(new T.BoxGeometry(w, h, .14), [navy, navy, navy, navy, face, navy]); m.userData.y = my((b[2] + b[3]) / 2);
    m.position.set(mx((b[0] + b[1]) / 2), m.userData.y, GZ + .32); m.castShadow = true; m.visible = false; world.add(m); trims.push(m); });
  { const s = GATE.side, h = (s[3] - s[2]) / PX, L = 2.6;
    const m = new T.Mesh(new T.BoxGeometry(.12, h, L), new T.MeshStandardMaterial({ color: 0x1d4fc4, roughness: .6 })); m.userData.y = my((s[2] + s[3]) / 2);
    m.position.set(mx(s[1]) - .06, m.userData.y, GZ - L / 2 + .3); m.castShadow = true; m.visible = false; world.add(m); trims.push(m); }

  let roof = null;
  /* G runs 0 to 3 over the three stops. 0 to 1 the squares gather into the mark; 1 to 2 they take depth; 2 to 3 the boxes build the gate. */
  let last = -1;
  function compose(G) {
    if (Math.abs(G - last) < .0004) return; last = G;
    const asm = seg(G, .04, .66), deep = E(seg(G, 1.02, 1.5)), bld = seg(G, 2.02, 2.34);
    for (let i = 0; i < cells.length; i++) { const c = cells[i];
      const t0 = c.a * .55, ta = E(seg(asm, t0, t0 + .45));                                  /* gather: each square arrives on its own beat */
      let x = lerp(c.sx, c.x, ta), y = lerp(c.sy, c.y, ta), z = lerp(c.sz, 0, ta), sx = (c.n * U - .009) * (.55 + .45 * ta), sy = sx, sz = lerp(.02, c.n * U - .009, deep), ry = (1 - ta) * (c.a * 2.4 - 1.2), rx = (1 - ta) * .9;
      col.copy(c.col);
      if (bld > 0) {
        if (c.to) { const b0 = (c.rank / Gt.length) * .7, t = E(seg(bld, b0, b0 + .3));
          x = lerp(c.x, c.to.x, t); y = lerp(c.y, c.to.y, t) + Math.sin(t * Math.PI) * 1.1; z = lerp(0, c.to.z + GZ, t); sx = lerp(sx, c.to.w, t); sy = lerp(sy, c.to.h, t); sz = lerp(sz, c.to.d, t); ry = (1 - t) * t * 2.4; col.lerp(c.to.col, t);
        } else { const t = E(seg(bld, 0, .35 + c.a * .3)); z = -t * 7; sx *= 1 - t; sy *= 1 - t; sz *= 1 - t; }
      }
      dummy.position.set(x, y, z); dummy.rotation.set(rx, ry, 0); dummy.scale.set(Math.max(sx, 1e-4), Math.max(sy, 1e-4), Math.max(sz, 1e-4)); dummy.updateMatrix();
      boxes.setMatrixAt(i, dummy.matrix); boxes.setColorAt(i, col);
    }
    boxes.instanceMatrix.needsUpdate = true; if (boxes.instanceColor) boxes.instanceColor.needsUpdate = true;
    /* last, the two header boards come down onto the gate and the side wall swings out */
    const tb = E(seg(bld, .72, .98)); gfill.intensity = 70 * E(seg(bld, 0, .8));   /* daylight comes up on the gate as it is built, as in the render */
    trims.forEach(m => { m.visible = tb > 0; m.position.y = m.userData.y + (1 - tb) * 1.6; m.scale.setScalar(Math.max(tb, 1e-3)); });
  }

  const none = { noMirror: true, drift: .12, keyK: .06 };   /* the engine's own key light is held low so the squares keep the mark's colours */
  const PH = FP.phone();
  station(0, Object.assign({}, none, { c: [0, MC, 0], rx: MW / 2 + .5, ry: MH / 2 + .4, yaw: 0, pitch: .02, fx: .62, fy: .74, ox: .16, oy: -.02, fxp: .96, fyp: .42, oxp: 0, oyp: -.14, drift: .06 }));
  station(0, Object.assign({}, none, { c: [0, MC, 0], rx: MW / 2 + .5, ry: MH / 2 + .4, yaw: .62, pitch: .14, fx: .6, fy: .74, ox: .16, oy: -.02, fxp: .96, fyp: .42, oxp: 0, oyp: -.14 }));
  const gate = station(0, Object.assign({}, none, { c: [0, 2.2, 6], rx: 6.5, ry: 2.6, yaw: -.4, pitch: .07, fx: .7, fy: .6, ox: .12, oy: 0, fxp: 1.0, fyp: .4, oxp: 0, oyp: -.14, yawp: -.3 }));
  

  /* ---------- the zigzag wall: ONE print, 9 m by 3 m, folded twelve times (the size is written on the design render: "9*3 print").
     The print is the wall's own artwork (2D file "sssw"). Nothing is added to it. What the model shows that a photograph cannot:
     the wall changes as you pass it. From the front the lettering reads whole; from the side every second face turns away and it breaks. ---------- */
  const zig = station(46, Object.assign({}, none, { c: [0, 1.6, .2], rx: 4.7, ry: 2.2, yaw: 0, pitch: PH ? .1 : -.03, drift: .3 /* WB-IM-WALL: front-on, the lettering whole */, w: 1.5, fx: .7, fy: .6, ox: .14, oy: 0, fxp: 1.04, fyp: .4, oxp: 0, oyp: -.14 }));
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

    /* where the wall stood (14 Oct night, Tony: "the nice mood from inside", "show this even in 3D and nicer"): the street under the big truss,
       read from the final design of 2 February 2024 (renders ND_ inside and from above, a/f-inside.webp, a/f-top.webp): cyan box beams on posts,
       criss-cross strips of blue, violet and cyan fabric for shade, the blue carpet running down the street. The sun comes through the strips,
       so their shade falls across the carpet and the wall. Sizes are read by eye from the renders; nothing here is a measure. On a phone the camera stands further back and the roof would fill half the screen, so there it is left out and the sun alone lights the wall. */
    const L = 30, Z0 = -8, Z1 = 16.5, HB = 4.9, BW = .34, x0 = -L / 2, x1 = L / 2;
    const cyan = new T.MeshStandardMaterial({ color: 0x45b8ea, roughness: .45, metalness: .1 });
    roof = new T.Group(); roof.visible = false; g.add(roof); roof.add(carpet, strip);   /* shown only once the camera heads for the wall, so it never stands in the gate's view */
    const beam = (ax, az, bx, bz, y) => { const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz); const m = new T.Mesh(new T.BoxGeometry(len + BW, BW, BW), cyan); m.position.set((ax + bx) / 2, y, (az + bz) / 2); m.rotation.y = -Math.atan2(dz, dx); m.castShadow = true; roof.add(m); };
    const post = (x, z) => { const m = new T.Mesh(new T.BoxGeometry(BW, HB, BW), cyan); m.position.set(x, HB / 2, z); m.castShadow = true; roof.add(m); };
    const bays = [x0, -9, 9, x1];
    if (!PH) bays.forEach(x => { post(x, Z0); post(x, Z1); beam(x, Z0, x, Z1, HB); });
    if (!PH) { beam(x0, Z0, x1, Z0, HB); beam(x0, Z1, x1, Z1, HB); }
    /* the fabric: two families of parallel strips crossing at a slant, clipped to the roof */
    const cols = [0x2a36c4, 0x5a2db0, 0x3fb2e4, 0x4b63ea, 0x6a3cc8];
    const clip = (px, pz, ux, uz) => { let t0 = -1e9, t1 = 1e9; [[px, ux, x0, x1], [pz, uz, Z0, Z1]].forEach(([p, u, lo, hi]) => { if (Math.abs(u) < 1e-6) { if (p < lo || p > hi) t0 = 1e9; return; } let a = (lo - p) / u, b = (hi - p) / u; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); }); return t1 > t0 ? [t0, t1] : null; };
    let ci = 0;
    if (!PH) [[.62, 0], [-.62, 1]].forEach(([ang, fam]) => { const ux = Math.cos(ang), uz = Math.sin(ang), nx = -uz, nz = ux;
      for (let s = -27; s <= 27; s += 3) { const px = nx * s, pz = (Z0 + Z1) / 2 + nz * s, r = clip(px, pz, ux, uz); if (!r || r[1] - r[0] < 1.5) continue;
        const len = r[1] - r[0], mx = px + ux * (r[0] + r[1]) / 2, mz = pz + uz * (r[0] + r[1]) / 2, c = cols[ci++ % cols.length];
        const m = new T.Mesh(new T.BoxGeometry(len, .025, .62), new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .3, roughness: .9, metalness: 0 }));
        m.position.set(mx, HB + .22 + fam * .05, mz); m.rotation.y = -Math.atan2(uz, ux); m.castShadow = true; roof.add(m); } });
    /* the street's carpet runs the length of the truss, a lighter strip along the walls */
    carpet.geometry.dispose(); carpet.geometry = new T.PlaneGeometry(L, Z1 - Z0); carpet.position.set(0, .006, (Z0 + Z1) / 2);
    strip.geometry.dispose(); strip.geometry = new T.PlaneGeometry(L, 1.5);
    /* the sun, high and to the side: a spot so it lights only this street, never the squares of the mark */
    const sol = new T.SpotLight(0xfff0da, 2600, 70, .5, .35, 1.6); sol.position.set(-7, 26, 13); sol.target.position.set(0, 0, 3.5);
    sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -.0006; sol.shadow.radius = 3; sol.shadow.camera.near = 8; sol.shadow.camera.far = 60; g.add(sol, sol.target);
  }

  compose(0);
  S.onFrame((time, i, local) => { compose(i + local); if (roof) roof.visible = i >= 3 || (i === 2 && local > .8); });
  /* with reduced motion the engine holds a still per stop: each stop shows its finished state */
  if (FP.rm) FP.on(() => { const on = sec.querySelector(".st.on"); compose(on ? +on.dataset.s + .995 : 0); if (roof) roof.visible = !!on && +on.dataset.s === 3; });
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
