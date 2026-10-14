/* National Bullying Prevention Week, UAE Ministry of Education, 22 to 28 April 2018: the idea as 3D, made for this portfolio.
   What is drawn, and where each part comes from:
   - the mark: its own vector pieces as delivered on 17 April 2018 (archive 004/005, read into mark-paths.json): two figures and seven
     leaves, each leaf with the point where it meets a hand. The pieces are given depth; nothing is redrawn. As in the campaign's own film
     (archive 071, 0:00.4 to 0:01.4): the two students come in from left and right, meet with a high five, and the leaves open from their
     hands, the centre pair first, the outer ones next, the green top leaf last. It plays by itself on the first screen.
     English logos only (Tony, 14 Oct): the formation ends on the English lock-up. Its name line is the delivered file's own English
     line (archive 004, its 36 letter outlines with their 0.75 pt stroke, read into name-en.json); the Arabic line is left out and the
     English line takes its place, at the file's own gap from the mark. As the name writes on, the mark rises to stand on it.
   - the board you stand inside: outline, the two holes and the printed face are traced from the cut-out design (cutout-face-en.webp:
     the design with its name band in English only, the band's own English line at its own size, centred in the band).
     Fourteen were made (final report to the Ministry, 16 July 2018). Its height is not on file and is not stated.
     Built proof: our HD film of the school door, 23 April 2018 (archive 073). The stand's built proof: a frame of our Dalma Mall film
     (archive 012 at 14.0 s), resampled once to 960 px.
   - the campaign table: the brochure (archive 006, its English spreads), the four phone frames (archive 042 to 045) over our own photograph
     of the walk sign at La Mer (archive 082), the campaign's wheel animation on a screen, the keyhole artwork (archive 039) on a cash-machine
     screen, the gift, and the award as the mark in clear acrylic.
   - the brochure at reading size: the same booklet, close; its pages turn.
   - the stand: modelled from its three design renders of April 2018 (archive 096, 097, 098): the half-round wall with the mark, the purple
     header, the carpet, two bean bags, two cushions, the glass table with roses, the paper leaves on lines, the totem with its screen.
   Pieces are among those Tony picked himself on 7 October 2026. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

const sec = document.querySelector('.fp-model'), FP = window.FP;
const S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.02, fog: 0x07050c, floorColor: 0x0d0a14, floorRough: .6, mirrorK: .9 });
if (S) boot();

async function boot() {
  const { station, std } = S, E = FP.ease, seg = FP.seg, none = { drift: .5, keyK: .5 }, PH = FP.phone();
  const [J, N] = await Promise.all(['mark-paths', 'name-en'].map(async n => (await fetch('a/3d/' + n + '.json')).json()));
  const [mx0, my0, mx1, my1] = J.mark, mcx = (mx0 + mx1) / 2;
  const shapeOf = (d, k, cx, cy) => { const sh = new T.Shape(), n = d.match(/-?\d*\.?\d+(?:e-?\d+)?/g).map(Number), c = d.match(/[MC]/g); let i = 0; cx = cx === undefined ? mcx : cx; cy = cy === undefined ? my1 : cy;
    c.forEach(q => { if (q === 'M') { sh.moveTo((n[i] - cx) * k, (cy - n[i + 1]) * k); i += 2; } else { sh.bezierCurveTo((n[i] - cx) * k, (cy - n[i + 1]) * k, (n[i + 2] - cx) * k, (cy - n[i + 3]) * k, (n[i + 4] - cx) * k, (cy - n[i + 5]) * k); i += 6; } }); return sh; };
  /* a letter outline of the delivered file (M, L, C, Z) as a shape, or as a hole in one */
  const pathOf = (d, k, cx, cy, P) => { const s = new (P || T.Shape)(); for (const m of d.matchAll(/([MLCZ])([^MLCZ]*)/g)) { const a = (m[2].match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number), X = j => (a[j] - cx) * k, Y = j => (cy - a[j + 1]) * k;
    if (m[1] === 'M') s.moveTo(X(0), Y(0)); else if (m[1] === 'L') s.lineTo(X(0), Y(0)); else if (m[1] === 'C') s.bezierCurveTo(X(0), Y(0), X(2), Y(2), X(4), Y(4)); } return s; };
  /* the English lock-up at a given height: how far the mark rises to stand on its name line, the line's half-width, the lock-up's half-height */
  const lockK = h => h / (my1 - my0), LIFT = h => (N.bbox[3] + N.stroke / 2 + N.dy - my1) * lockK(h) + .004, HALFW = h => (N.bbox[2] - N.bbox[0] + N.stroke) / 2 * lockK(h);
  /* the order in which the leaves open in the campaign film: the centre pair, then the next pair, then the outer pair, the green top last */
  const RANK = { l3: 0, l5: 0, l2: 1, l6: 1, l1: 2, l7: 2, l4: 3 };
  /* the mark at a given height; returns a function (come, grow, apart, name): the walk-in and the high five, the leaves opening, the pieces
     apart in depth, and (for the opening only) the English name line writing on, letter by letter from the left, as the mark rises onto it */
  function mark(g, h, from, withName) { const k = h / (my1 - my0), leaves = [], figs = [], letters = [], inG = new T.Group(); g.add(inG); from = from === undefined ? .34 : from;
    J.pieces.forEach(p => { const leaf = !!p.base, o = new T.Group();
      p.d.forEach(d => { const m = new T.Mesh(new T.ExtrudeGeometry(shapeOf(d, k), { depth: h * (leaf ? .05 : .07), bevelEnabled: true, bevelSize: h * .004, bevelThickness: h * .004, bevelSegments: 2, curveSegments: 20 }), std({ color: p.fill, roughness: .5, metalness: .02 })); m.castShadow = true; o.add(m); });
      if (leaf) { const bx = (p.base[0] - mcx) * k, by = (my1 - p.base[1]) * k, n = +p.id.slice(1), pv = new T.Group(); pv.position.set(bx, by, 0); o.position.set(-bx, -by, n % 2 ? h * .016 : -h * .062); pv.add(o); inG.add(pv); leaves.push({ pv, n, r: RANK[p.id] }); }
      else { o.position.z = -h * .025; inG.add(o); figs.push({ o, side: p.id === 'fig-l' ? -1 : 1 }); } });
    const lift = withName ? LIFT(h) : 0;
    if (withName) { /* each letter: its outline and holes from the file, thickened by half the file's 0.75 pt stroke (as the file draws it), set on its baseline;
         thin, as print, its front flush with the figures */
      const dep = h * .006, bt = h * .0008, by = (my1 - (N.base + N.dy)) * k, zf = h * .049 - dep - bt, W = N.bbox[2] - N.bbox[0], mat = std({ color: N.fill, roughness: .5, metalness: .02, emissive: N.fill, emissiveIntensity: .18 });
      N.glyphs.forEach(gl => { const o = new T.Group(); o.position.set(0, by, zf);
        gl.s.forEach(sh => { const s = pathOf(sh.o, k, mcx, N.base); sh.h.forEach(hd => s.holes.push(pathOf(hd, k, mcx, N.base, T.Path)));
          const m = new T.Mesh(new T.ExtrudeGeometry(s, { depth: dep, bevelEnabled: true, bevelThickness: bt, bevelSize: 0, bevelOffset: N.stroke / 2 * k, bevelSegments: 1, curveSegments: 6 }), mat); m.castShadow = true; o.add(m); });
        o.scale.y = .001; o.visible = false; inG.add(o); letters.push({ o, u: (gl.x - N.bbox[0]) / W, z: zf }); }); }
    return (come, grow, apart, nm) => { const c = E(come), hit = Math.sin(Math.PI * seg(come, .84, 1)), ex = apart || 0; nm = nm === undefined ? 1 : nm;
      figs.forEach(f => { f.o.position.x = f.side * (1 - c) * h * from; f.o.position.y = Math.abs(Math.sin(come * Math.PI * 3)) * h * .028 * (1 - c) + hit * h * .022; f.o.rotation.z = f.side * (-(1 - c) * .1 + hit * .04); f.o.position.z = -h * .025 - ex * h * .2; });
      leaves.forEach(l => { const a = l.r * .17, u = E(seg(grow, a, a + .44)); l.pv.scale.setScalar(Math.max(.001, u)); l.pv.rotation.z = (1 - u) * (l.n % 2 ? .45 : -.45); l.pv.position.z = (1 - u) * h * .03 + ex * h * (.08 + l.r * .09 + (l.n % 2) * .04); });
      if (lift) { inG.position.y = lift * E(seg(nm, 0, .4)); letters.forEach(q => { const s = .25 + q.u * .45; const e = E(seg(nm, s, s + .3)); q.o.scale.y = Math.max(.001, e); q.o.visible = e > .01; q.o.position.z = q.z - ex * h * .2; }); } }; }

  /* 1 · the mark. On the first screen it forms by itself and ends on the English lock-up; scrolling on, its pieces stand apart in depth and
     close again. Framed for the whole lock-up (at the right on a desktop, the line beside it); during the formation the camera is closer on
     the mark, centred, and settles back as the name writes on. */
  const H0 = 3.2, CY = (H0 + LIFT(H0)) / 2, HW = HALFW(H0), RC = PH ? .57 : .86, OY0 = PH ? .1 : 0;
  const s0 = station(0, Object.assign({}, none, { noMirror: true, c: [0, CY, 0], rx: HW, ry: CY, yaw: .2, pitch: .03, drift: .5, w: 1.25, fx: .62, fy: .62, ox: -.15, oy: .045, rxp: HW, fxp: .86, fyp: .47, oxp: 0, oyp: -.02 }));
  const form = mark(s0.g, H0, PH ? .2 : .34, true); S.blob(s0.g, 0, .1, HW * 2.3, 1.7, .75);

  /* 2 · a mark you can stand inside: the board, traced from the cut-out design */
  const s1 = station(30, Object.assign({}, none, { c: [-.9, 1.0, -.4], rx: 3.4, ry: 1.5, yaw: .5, pitch: .06, drift: .9, fx: .62, fy: .66, ox: .14, rxp: 2.35, fxp: 1.0, fyp: .4, oxp: 0, oyp: .05 }));
  if (PH) s1.c = [0, 1.0, -.8];
  { const im = new Image(); im.onload = () => { const tr = trace(im), HGT = 1.8, THK = .018, k = HGT / (tr.y1 - tr.y0), cx = (tr.x0 + tr.x1) / 2, toM = p => new T.Vector2((p[0] - cx) * k, (tr.y1 - p[1]) * k);
      const shape = new T.Shape(tr.outer.map(toM)); tr.hs.forEach(h => shape.holes.push(new T.Path(h.map(toM))));
      const bodyG = new T.ExtrudeGeometry(shape, { depth: THK, bevelEnabled: false, curveSegments: 1 }), faceG = new T.ShapeGeometry(shape, 1);
      const map = S.tex('cutout-face-en.webp'); map.repeat.set(1 / (k * tr.W), 1 / (k * tr.H)); map.offset.set(cx / tr.W, 1 - tr.y1 / tr.H); map.anisotropy = 16;
      const BOARD = std({ color: 0xe9e9e6, roughness: .6 }), PRINT = std({ map, roughness: .5, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: .16 });
      (PH ? [[0, 0, .14], [-1.5, -1.7, .32], [1.35, -1.9, -.22]] : [[0, 0, .18], [-2.5, -1.7, .34], [-4.9, -2.9, .5], [2.1, -2.6, -.12]]).forEach(p => { const o = new T.Group(), b = new T.Mesh(bodyG, BOARD), f = new T.Mesh(faceG, PRINT); b.castShadow = true; f.position.z = THK + .0008; o.add(b, f);
        [-.3, .3].forEach(dx => { const fin = new T.Shape([new T.Vector2(0, 0), new T.Vector2(.42, 0), new T.Vector2(0, .62)]), m = new T.Mesh(new T.ExtrudeGeometry(fin, { depth: THK, bevelEnabled: false }), BOARD); m.rotation.y = Math.PI / 2; m.position.set(dx, 0, 0); m.castShadow = true; o.add(m); });
        o.position.set(p[0], .004, p[1]); o.rotation.y = p[2]; s1.g.add(o); S.blob(s1.g, p[0], p[1] + .1, 2.2, 1.1, .7); }); S.ready(); };
    im.onerror = () => S.ready(); im.src = 'a/3d/cutout-face-en.webp'; }

  /* 3 · everywhere a student looks: one table. The booklet lies open in the middle. */
  const s2 = station(94, Object.assign({}, none, { noMirror: true, c: [0, 1.25, 0], rx: 3.6, ry: 1.6, yaw: -.3, pitch: .26, drift: .6, w: 1.15, fx: .66, fy: .6, ox: -.21, oy: .03, rxp: 2.6, fxp: 1.0, fyp: .44, oxp: 0, oyp: .1 }));
  if (PH) s2.c = [0, 1.1, -.2];
  const PGW = 1.5, PGH = PGW * 1050 / 750, SPR = ['p6', 'p7', 'p8'], book = new T.Group(); book.position.set(0, .34, 0); book.rotation.x = -.7; s2.g.add(book); S.blob(s2.g, 0, .7, PGW * 2 + .8, 2.4, .75);
  { const half = (n, right) => { const t = S.tex('bro-' + n + '.webp'); t.repeat.set(.5, 1); t.offset.set(right ? .5 : 0, 0); t.anisotropy = 16; return new T.MeshBasicMaterial({ map: t }); };
    const page = (mat, x, z, flip) => { const m = new T.Mesh(new T.PlaneGeometry(PGW, PGH), mat); m.position.set(x, PGH / 2, z); if (flip) m.rotation.y = Math.PI; return m; };
    const cover = new T.Mesh(new T.BoxGeometry(PGW * 2 + .05, PGH + .05, .02), std({ color: 0x562e91, roughness: .8 })); cover.position.set(0, PGH / 2, -.02); cover.castShadow = true; book.add(cover);
    book.add(page(half(SPR[0], false), -PGW / 2, 0), page(half(SPR[SPR.length - 1], true), PGW / 2, 0));
    var bsheets = SPR.slice(0, -1).map((sp, n) => { const hinge = new T.Group(); hinge.add(page(half(sp, true), PGW / 2, .002), page(half(SPR[n + 1], false), PGW / 2, -.002, true)); hinge.position.z = (SPR.length - n) * .004; book.add(hinge); return { hinge, n }; }); }
  const NB = bsheets.length, turn = t => bsheets.forEach(sh => { const u = E(seg(t, sh.n / NB, (sh.n + .8) / NB)); sh.hinge.rotation.y = -u * Math.PI; sh.hinge.position.z = (u > .5 ? sh.n + 1 : (NB + 1 - sh.n)) * .004 + Math.sin(u * Math.PI) * .22; });

  const live = f => { const m = new T.MeshBasicMaterial({ map: S.tex('wheel.webp') }); if (f.v) f.v.addEventListener('playing', () => { m.map = f.t; m.needsUpdate = true; }); return m; };
  /* around the booklet (all one group, so the reading stop can stand alone): four phones carrying the four real phone frames over our
     photograph of the walk sign at La Mer, the wheel playing on a square screen, the gift open, the keyhole on a cash-machine screen,
     and the award in clear acrylic with the mark standing in it (the lettering of the real award is not redrawn) */
  const props = new T.Group(); s2.g.add(props);
  { const dk = std({ color: 0x0c0d11, roughness: .35, metalness: .4 }), P = PH
      ? { phones: [[-2.15, .9, .3], [-1.55, .95, .22], [-.95, 1.0, .14], [-.35, 1.05, .06]], pz: 1.35, screen: [-1.7, 2.2, -1.5, .25], gift: [1.0, 1.25, -.5], kiosk: [2.3, -1.25, -.4], award: [1.75, .1, -.35] }
      : { phones: [[-3.5, .5, .42], [-2.85, .5, .34], [-2.2, .5, .26], [-1.55, .5, .18]], pz: .5, screen: [-2.55, 2.35, -1.3, .3], gift: [1.15, 1.05, -.5], kiosk: [3.3, -1.3, -.45], award: [2.35, .15, -.3] };
    P.phones.forEach((p, n) => { const g = new T.Group(), body = new T.Mesh(new T.BoxGeometry(.62, 1.14, .05), dk), scr = new T.Mesh(new T.PlaneGeometry(.563, 1.0), new T.MeshBasicMaterial({ map: S.tex('snap-' + (n + 1) + '.webp') }));
      body.castShadow = true; scr.position.z = .027; g.add(body, scr); g.position.set(p[0], .66, PH ? p[1] : P.pz); g.rotation.set(-.22, p[2], 0); props.add(g); S.blob(props, p[0], (PH ? p[1] : P.pz) + .1, .9, .5, .6); });
    const f = S.video('a/3d/wheel.mp4', null, 'a/3d/wheel.webp'); s2.vid = f.v; const sg = new T.Group(), sb = new T.Mesh(new T.BoxGeometry(1.5, 1.5, .07), dk), ss = new T.Mesh(new T.PlaneGeometry(1.4, 1.4), live(f)), leg = new T.Mesh(new T.BoxGeometry(.5, .06, .4), dk);
    sb.castShadow = true; ss.position.z = .037; leg.position.set(0, -.78, -.1); sg.add(sb, ss, leg); sg.position.set(P.screen[0], P.screen[1], P.screen[2]); sg.rotation.y = P.screen[3]; props.add(sg);
    const teal = std({ color: 0x2aa7b3, roughness: .55 }), gb = new T.Group(); gb.position.set(P.gift[0], .02, P.gift[1]); gb.rotation.y = P.gift[2]; props.add(gb);
    const base = new T.Mesh(new T.BoxGeometry(.9, .14, .64), teal); base.position.y = .07; base.castShadow = true; gb.add(base); const inner = new T.Mesh(new T.BoxGeometry(.84, .02, .58), std({ color: 0x1d7f88, roughness: .7 })); inner.position.y = .145; gb.add(inner);
    const lid = new T.Mesh(new T.BoxGeometry(.92, .05, .66), teal); lid.position.set(0, .5, -.42); lid.rotation.x = -1.2; lid.castShadow = true; gb.add(lid);
    const note = new T.Mesh(new T.BoxGeometry(.36, .03, .5), std({ color: 0x1fa0ad, roughness: .5 })); note.position.set(-.18, .17, 0); gb.add(note); const pen = new T.Mesh(new T.CylinderGeometry(.012, .012, .46, 8), std({ color: 0xd8d8de, metalness: .7, roughness: .3 })); pen.rotation.x = Math.PI / 2; pen.position.set(.18, .17, 0); gb.add(pen);
    S.blob(props, P.gift[0], P.gift[1] + .05, 1.3, .9, .6);
    const kiosk = new T.Group(); kiosk.position.set(P.kiosk[0], 0, P.kiosk[1]); kiosk.rotation.y = P.kiosk[2]; props.add(kiosk); const kb = new T.Mesh(new T.BoxGeometry(.95, 2.0, .5), std({ color: 0x8e9196, roughness: .35, metalness: .6 })); kb.position.y = 1.0; kb.castShadow = true; kiosk.add(kb);
    const ks = new T.Mesh(new T.PlaneGeometry(.68, .68 * 1056 / 880), new T.MeshBasicMaterial({ map: S.tex('key-full.webp') })); ks.position.set(0, 1.38, .252); kiosk.add(ks); S.blob(props, P.kiosk[0], P.kiosk[1] + .1, 1.3, .9, .6);
    const aw = new T.Group(); aw.position.set(P.award[0], .16, P.award[1]); aw.rotation.y = P.award[2]; props.add(aw); mark(aw, 1.25)(1, 1, 0);
    const slab = new T.Mesh(new T.CylinderGeometry(.74, .6, 1.5, 6, 1), new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: .04, metalness: 0, transmission: .92, thickness: .4, ior: 1.5, transparent: true, opacity: .55, clearcoat: 1 })); slab.scale.z = .12; slab.position.set(0, .75, -.14); aw.add(slab);
    const foot = new T.Mesh(new T.BoxGeometry(1.3, .16, .42), std({ color: 0xe9e9ee, roughness: .3, metalness: .2 })); foot.position.set(0, -.08, -.1); foot.castShadow = true; aw.add(foot); S.blob(props, P.award[0], P.award[1] + .05, 1.8, .8, .7); }

  /* 4 · the brochure at reading size: the same booklet, seen square-on and close; its English spreads turn */
  const s3 = station(94, Object.assign({}, none, { noMirror: true, c: [0, 1.143, -.676], rx: 1.62, ry: 1.12, yaw: 0, pitch: .65, drift: .05, w: 1.5, fx: .6, fy: .68, ox: -.18, oy: -.03, rxp: 1.6, fxp: .98, fyp: .5, oxp: 0, oyp: .14, keyK: .45 }));

  /* 5 · the stand, from its three design renders: a half-round wall with the mark standing in it, the purple header and fins, a purple
     carpet on a white platform, two lime bean bags, two cyan cushions, a glass table with roses, the paper leaves on two lines held by
     coloured pegs, and the totem with its screen. The platform is 4 by 4 m (the builder's quotation). The header lettering is left off. */
  const s4 = station(160, Object.assign({}, none, { noMirror: true, c: [0, 1.45, .1], rx: 2.9, ry: 1.95, yaw: -.5, pitch: .18, drift: .7, w: 1.4, fx: .64, fy: .62, ox: -.15, oy: .02, rxp: 2.85, fxp: 1.0, fyp: .44, oxp: 0, oyp: .12 }));
  const sway = [];
  { const g = s4.g, white = std({ color: 0xf0f0ee, roughness: .7 }), purple = std({ color: 0x562e91, roughness: .6 }), R = 1.75;
    const plat = new T.Mesh(new T.BoxGeometry(4, .12, 4), white); plat.position.y = .06; plat.receiveShadow = true; plat.castShadow = true; g.add(plat);
    const carpet = new T.Mesh(new T.BoxGeometry(3.3, .02, 3.1), std({ color: 0x4b2585, roughness: .95 })); carpet.position.set(0, .13, .25); carpet.receiveShadow = true; g.add(carpet);
    /* the wall: a round panel standing on the platform, a raised rim around it, a purple crescent behind its left edge and the purple
       header over its right shoulder, as in the front and three-quarter renders */
    const WR = 1.5, WY = 1.32, WZ = -1.55, cut = Math.asin((.12 - WY) / WR), disc = new T.Shape();
    disc.absarc(0, 0, WR, cut, Math.PI - cut, false); disc.lineTo(Math.cos(cut) * WR, Math.sin(cut) * WR);
    const panel = new T.Mesh(new T.ExtrudeGeometry(disc, { depth: .22, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2, curveSegments: 72 }), std({ color: 0xf4f4f2, roughness: .72 })); panel.position.set(0, WY, WZ - .22); panel.castShadow = true; panel.receiveShadow = true; g.add(panel);
    const sector = (r0, r1, a0, a1) => { const sh = new T.Shape(); sh.absarc(0, 0, r1, a0, a1, false); sh.absarc(0, 0, r0, a1, a0, true); return sh; };
    const rimG = new T.ExtrudeGeometry(sector(WR - .2, WR - .02, cut + .02, Math.PI - cut - .02), { depth: .07, bevelEnabled: true, bevelSize: .01, bevelThickness: .01, bevelSegments: 2, curveSegments: 72 });
    const rimM = new T.Mesh(rimG, std({ color: 0xffffff, roughness: .6 })); rimM.position.set(0, WY, WZ + .005); rimM.castShadow = true; g.add(rimM);
    const cres = new T.Mesh(new T.ExtrudeGeometry(sector(WR - .05, WR + .16, Math.PI * .52, Math.PI - cut - .04), { depth: .16, bevelEnabled: false, curveSegments: 48 }), purple); cres.position.set(-.06, WY, WZ - .34); cres.castShadow = true; g.add(cres);
    const head = new T.Mesh(new T.ExtrudeGeometry(sector(WR + .02, WR + .4, Math.PI * .2, Math.PI * .44), { depth: .2, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2, curveSegments: 40 }), purple); head.position.set(.06, WY + .02, WZ - .12); head.castShadow = true; g.add(head);
    const fin = new T.Mesh(new T.BoxGeometry(.34, 1.1, .3), purple); fin.position.set(1.62, .67, WZ - .1); fin.castShadow = true; g.add(fin);
    const mk = new T.Group(); mk.position.set(0, .62, WZ + .12); g.add(mk); mark(mk, 1.5)(1, 1, 0);
    /* bean bags: pear shapes with soft folds, as in the renders */
    const beanM = new T.MeshPhysicalMaterial({ color: 0x84cc24, roughness: .58, sheen: 1, sheenRoughness: .45, sheenColor: new T.Color(0xd9ff9c) });
    const bean = (x, z, sc, ry) => { const pts = [[0, 0], [.4, .015], [.5, .16], [.495, .36], [.43, .58], [.32, .8], [.21, .96], [.11, 1.06], [.035, 1.105], [0, 1.11]].map(p => new T.Vector2(p[0], p[1])), geo = new T.LatheGeometry(pts, 56), pos = geo.attributes.position, v = new T.Vector3();
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const a = Math.atan2(v.z, v.x), n = 1 + .05 * Math.sin(a * 5 + v.y * 6) + .035 * Math.sin(a * 9 - v.y * 11) + .025 * Math.sin(a * 3 + v.y * 17); pos.setXYZ(i, v.x * n + v.y * v.y * .13, v.y * (1 + .02 * Math.sin(a * 7)), v.z * n); }
      geo.computeVertexNormals(); const m = new T.Mesh(geo, beanM); m.scale.setScalar(sc); m.position.set(x, .14, z); m.rotation.y = ry; m.castShadow = true; g.add(m); };
    bean(-1.05, .95, .92, .5); bean(1.1, .85, .88, 2.6);
    /* cushions: soft three-sided pillows leaning on the wall */
    const pillowM = new T.MeshPhysicalMaterial({ color: 0x5cc6e4, roughness: .6, sheen: 1, sheenRoughness: .5, sheenColor: new T.Color(0xd8f6ff) });
    const pillow = (x, z, ry) => { const geo = new T.ConeGeometry(.34, .66, 36, 10), pos = geo.attributes.position, v = new T.Vector3(), c = new T.Vector3(0, -.06, 0);
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const a = Math.atan2(v.z, v.x), r = Math.hypot(v.x, v.z), tri = Math.cos(Math.PI / 3) / Math.cos(((a % (2 * Math.PI / 3)) + 2 * Math.PI / 3) % (2 * Math.PI / 3) - Math.PI / 3); v.x *= tri; v.z *= tri; v.z *= .62; const d = v.clone().sub(c), L = d.length() || 1; v.lerp(c.clone().add(d.multiplyScalar(.36 / L)), .28); pos.setXYZ(i, v.x, v.y, v.z); }
      geo.computeVertexNormals(); const m = new T.Mesh(geo, pillowM); m.position.set(x, .44, z); m.rotation.set(-.28, ry, 0); m.castShadow = true; g.add(m); };
    pillow(-.6, -1.12, .45); pillow(.64, -1.1, -.45);
    /* the glass table with a vase of pink roses */
    const chrome = std({ color: 0xd9dbe0, roughness: .18, metalness: 1 });
    const top = new T.Mesh(new T.CylinderGeometry(.36, .36, .025, 48), new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: .03, transmission: .9, thickness: .05, transparent: true, opacity: .5 })); top.position.set(0, .78, .05); g.add(top);
    const stem = new T.Mesh(new T.CylinderGeometry(.025, .025, .64, 12), chrome); stem.position.set(0, .46, .05); g.add(stem); const foot = new T.Mesh(new T.CylinderGeometry(.2, .22, .02, 32), chrome); foot.position.set(0, .15, .05); g.add(foot);
    const vase = new T.Mesh(new T.CylinderGeometry(.06, .05, .3, 24), std({ color: 0xf5f5f2, roughness: .3 })); vase.position.set(0, .94, .05); vase.castShadow = true; g.add(vase);
    const rose = std({ color: 0xe0607f, roughness: .55 }), leafG = std({ color: 0x3f7f2c, roughness: .7 });
    for (let n = 0; n < 15; n++) { const a = n * 2.4, r = .04 + (n % 5) * .022, m = new T.Mesh(new T.IcosahedronGeometry(.042 + (n % 3) * .006, 1), n % 6 === 5 ? leafG : rose); m.position.set(Math.cos(a) * r, 1.15 + (n % 4) * .03 - r * .5, .05 + Math.sin(a) * r); m.castShadow = true; g.add(m); }
    /* the paper leaves on two lines, at the left, each leaf the mark's own leaf outline, held by a coloured peg */
    const lp = J.pieces.find(p => p.id === 'l4'), lb = lp.base, LK = .26 / 62, leafGeo = new T.ExtrudeGeometry(shapeOf(lp.d[0], LK, lb[0], lb[1]), { depth: .004, bevelEnabled: false, curveSegments: 12 });
    const paper = std({ color: 0xf7f7f4, roughness: .9, side: T.DoubleSide }), pegC = [0xcb3794, 0xfecd02, 0x3ab3c2, 0x7dbe42, 0xcb3794];
    [0, 1.5].forEach(z => { const post = new T.Mesh(new T.CylinderGeometry(.028, .028, 1.75, 12), white); post.position.set(-1.85, .99, z); post.castShadow = true; g.add(post); const pb = new T.Mesh(new T.CylinderGeometry(.04, .04, .4, 12), purple); pb.position.set(-1.85, .32, z); g.add(pb); });
    [1.05, 1.6].forEach((y, row) => { const line = new T.Mesh(new T.CylinderGeometry(.004, .004, 1.5, 6), std({ color: 0x555 })); line.rotation.x = Math.PI / 2; line.position.set(-1.85, y, .75); g.add(line);
      for (let k = 0; k < 5; k++) { const hold = new T.Group(); hold.position.set(-1.85, y, .15 + k * .3); g.add(hold); const lf = new T.Mesh(leafGeo, paper); lf.rotation.z = Math.PI; lf.castShadow = true; hold.add(lf); hold.rotation.y = Math.PI / 2 + (k % 2 ? .2 : -.15);
        const peg = new T.Mesh(new T.BoxGeometry(.022, .07, .014), std({ color: pegC[(k + row) % 5], roughness: .5 })); peg.position.y = -.005; hold.add(peg); sway.push({ o: hold, p: k * 1.3 + row }); } });
    /* the totem with its screen: the campaign's wheel animation plays on it */
    const tot = new T.Mesh(new T.BoxGeometry(.5, 1.75, .14), white); tot.position.set(1.72, 1.0, 1.2); tot.rotation.y = -.5; tot.castShadow = true; g.add(tot);
    const band = new T.Mesh(new T.BoxGeometry(.52, .5, .16), purple); band.position.set(1.72, 1.62, 1.2); band.rotation.y = -.5; g.add(band);
    const f2 = S.video('a/3d/wheel.mp4', null, 'a/3d/wheel.webp'); s4.vid = f2.v; const ts = new T.Mesh(new T.PlaneGeometry(.4, .4), live(f2)); ts.position.set(1.72 - Math.sin(.5) * .085, 1.62, 1.2 + Math.cos(.5) * .085); ts.rotation.y = -.5; g.add(ts);
    const lamp = new T.SpotLight(0xfff4e6, 70, 22, .75, .8, 1.3); lamp.position.set(1.5, 6.5, 5); lamp.target.position.set(0, 1, -.5); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.0005; g.add(lamp, lamp.target);
    S.blob(g, 0, .3, 5.2, 5.2, .7); }

  /* the opening: the formation plays by itself on the first screen, the line after it. Scrolling also drives it; back at the top it plays again. */
  const intro = sec.querySelector('.intro'), veil = sec.querySelector('.veil'), TF = 3.5, tv = new T.Vector3();
  let t0 = -1, away = false;
  const myP = () => { const r = sec.getBoundingClientRect(); return FP.clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); };
  const compose = (i, l) => {
    const now = performance.now() / 1000, p = myP();
    if (p > .2) away = true; else if (away && p < .004) { away = false; t0 = now + .15; }
    const f = i > 0 || p >= .07 ? 1.1 : Math.max(t0 < 0 ? 0 : (now - t0) / TF, p / .06);
    const come = seg(f, .06, .44), grow = seg(f, .42, .92), apart = i === 0 ? Math.sin(Math.PI * seg(l, .14, .86)) : 0, nm = seg(f, .84, 1);
    form(come, grow, apart, nm);
    if (i === 0 && p < .07) { /* the camera starts a little further back, comes in close on the mark as they meet, and settles back to the whole
        lock-up (and to its place on the screen) as the name writes on */
      const back = (PH ? .45 : .3) * (1 - E(seg(f, 0, .62))), m = E(nm); tv.set(0, CY, 0); S.cam.position.sub(tv).multiplyScalar((1 + back) * (RC + (1 - RC) * m)).add(tv);
      const v = S.cam.view; if (v && v.enabled) S.cam.setViewOffset(v.fullWidth, v.fullHeight, v.offsetX * m, OY0 * v.fullHeight + (v.offsetY - OY0 * v.fullHeight) * m, v.width, v.height); }
    if (intro) intro.style.opacity = (seg(f, .96, 1.08) * (1 - seg(p, .004, .03))).toFixed(3);
    if (veil) veil.style.opacity = (.35 + .65 * seg(p, .01, .05)).toFixed(3);
    turn(i === 3 ? seg(l, .1, .9) : i > 3 ? 1 : 0); props.visible = i !== 3;
    for (let k = 0; k < sway.length; k++) sway[k].o.rotation.x = Math.sin(now * 1.3 + sway[k].p) * .07;
  };
  compose(0, 0);
  S.onFrame((time, i, local) => compose(i, local));
  if (FP.rm) { form(1, 1, 0, 1); if (intro) intro.style.opacity = 1; FP.on(() => { const on = sec.querySelector('.st.on'); const i = on ? +on.dataset.s : 0; turn(i === 3 ? 1 : i > 3 ? 1 : 0); props.visible = i !== 3; }); }
  t0 = performance.now() / 1000 + .35;
}

/* outline of the board and of its two holes, traced from the alpha of the design visual */
function trace(im) {
  const SC = 1300 / im.height, W = Math.round(im.width * SC), H = Math.round(im.height * SC);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, on = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) on[i] = d[i * 4 + 3] > 127 ? 1 : 0;
  const lab = new Int32Array(W * H), fill = (seed, id, val) => { const st = [seed]; let n = 0; lab[seed] = id; while (st.length) { const p = st.pop(); n++; const px = p % W, py = (p / W) | 0;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(o => { const nx = px + o[0], ny = py + o[1]; if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; const k = ny * W + nx; if (lab[k] || on[k] !== val) return; lab[k] = id; st.push(k); }); } return n; };
  fill(0, 1, 0);
  const holes = []; let id = 2; for (let i = 0; i < W * H; i++) if (!on[i] && !lab[i]) { const n = fill(i, id, 0); if (n > 1500) holes.push(id); id++; }
  const follow = (inside) => { let s = -1; for (let i = 0; i < W * H && s < 0; i++) if (inside(i % W, (i / W) | 0)) s = i; const sx = s % W, sy = (s / W) | 0, N = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    const pts = [[sx, sy]]; let cx = sx, cy = sy, dir = 6, guard = 0;
    do { let found = false; for (let k = 0; k < 8; k++) { const nd = (dir + 6 + k) % 8, nx = cx + N[nd][0], ny = cy + N[nd][1]; if (nx >= 0 && ny >= 0 && nx < W && ny < H && inside(nx, ny)) { cx = nx; cy = ny; dir = nd; pts.push([cx, cy]); found = true; break; } } if (!found) break; } while ((cx !== sx || cy !== sy) && ++guard < 200000);
    return pts; };
  const rdp = (p, e) => { if (p.length < 3) return p; let m = 0, ix = 0; const a = p[0], b = p[p.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; for (let i = 1; i < p.length - 1; i++) { const dd = Math.abs(dy * p[i][0] - dx * p[i][1] + b[0] * a[1] - b[1] * a[0]) / L; if (dd > m) { m = dd; ix = i; } } if (m > e) { const l = rdp(p.slice(0, ix + 1), e), r = rdp(p.slice(ix), e); return l.slice(0, -1).concat(r); } return [a, b]; };
  const chaikin = p => { const o = []; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); } return o; };
  const tidy = p => { p = p.slice(0, -1); const h = (p.length / 2) | 0; let r = rdp(p.slice(0, h + 1), .7).slice(0, -1).concat(rdp(p.slice(h).concat([p[0]]), .7).slice(0, -1)); return chaikin(chaikin(r)); };
  const outer = tidy(follow((px, py) => lab[py * W + px] !== 1));
  const hs = holes.map(hid => tidy(follow((px, py) => lab[py * W + px] === hid)));
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; outer.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  return { outer, hs, W, H, x0, x1, y0, y1 };
}

/* ---- outside the 3D: the campaign film's silent loop runs through the wheel of seven actions (never its white opening card, never the bilingual hashtag card); 640 px films play at their own size;
   a picture or the brochure's pages open whole on a tap ---- */
(function () {
  const D = document, hv = D.querySelector('.fp-hero video'), IN = 12.4, OUT = 56.2;
  if (hv) { const fix = () => { if (hv.currentTime < IN - .05 || hv.currentTime > OUT) hv.currentTime = IN; }; hv.addEventListener('loadedmetadata', fix); hv.addEventListener('timeupdate', fix); if (hv.readyState >= 1) fix(); }
  const pl = D.querySelector('.fp-player');
  D.querySelectorAll('[data-film]').forEach(b => b.addEventListener('click', () => { if (pl) pl.classList.toggle('own', b.hasAttribute('data-own')); }, true));
  /* the whole-picture view */
  const z = D.createElement('div'); z.className = 'ab-zoom'; z.setAttribute('role', 'dialog'); z.setAttribute('aria-modal', 'true'); z.setAttribute('aria-label', 'Seen whole'); z.tabIndex = -1;
  z.innerHTML = '<div class="sc"></div><div class="bar"><span class="ti fp-lab"></span><button class="x" type="button">Close</button></div>'; D.body.appendChild(z);
  const sc = z.querySelector('.sc'), ti = z.querySelector('.ti'), x = z.querySelector('.x'); let opener = null;
  const close = () => { if (!z.classList.contains('open')) return; z.classList.remove('open', 'read'); sc.innerHTML = ''; D.documentElement.style.overflow = ''; if (opener) opener.focus(); opener = null; };
  const open = (srcs, title, read, el) => { opener = el; sc.innerHTML = ''; srcs.forEach(s => { const im = new Image(); im.src = s; im.alt = title; im.decoding = 'async'; sc.appendChild(im); }); ti.textContent = title; z.classList.toggle('read', !!read); z.classList.add('open'); D.documentElement.style.overflow = 'hidden'; sc.scrollTo(0, 0); x.focus(); };
  D.querySelectorAll('[data-zoom]').forEach(el => { el.addEventListener('click', e => { e.preventDefault(); open(el.dataset.zoom.split(','), el.dataset.title || '', el.hasAttribute('data-read'), el); }); });
  x.addEventListener('click', close);
  D.addEventListener('keydown', e => { if (!z.classList.contains('open')) return; if (e.key === 'Escape') { e.preventDefault(); close(); } if (e.key === 'Tab') { e.preventDefault(); x.focus(); } });
})();
