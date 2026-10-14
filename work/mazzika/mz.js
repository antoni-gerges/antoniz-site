/* Why Not! Mazzika Festival, Coca-Cola Arena, Dubai, 22 November 2019: the arena as a 3D model, made for this portfolio.
   What is drawn, and where each part comes from:
   - the hall (stage end, two standing zones, the two long seated stands, the bar end): Tony's own seating plan,
     "CCA seating plan.ai", page 1, October 2019. Used as geometry only, scaled to the films. The plan is a ticketing drawing, not a survey.
   - the stage, its flown grid and trusses, the screens, the lights, the two loudspeaker hangs, the monitors, front of house, the camera crane,
     the barrier and the bar: what the festival film and the act films (Mission Control X) and Tony's own phone films of 22 and 23 November 2019 show.
   - the screen pictures: the screen film "WNM visuals 1" (exported 21 November 2019) and the side-screen frame, archive file 177 (8000 x 4500).
   - the layout of the screens: the stage concept of 24 October 2019, as built.
   - the screens' pixel sizes, given by Tony to the organiser on 18 November 2019: centre 2080 x 1144, six pillars 208 x 1144 each,
     two side screens 1152 x 672. Centre and pillars are one canvas, 3328 x 1144. These set the proportions of the screens here.
   NO SPECIFICATION IS INVENTED. Sizes in metres are estimates read from the films against the people on stage and say "about" wherever they are shown.
   Nothing here names a brand, a wattage, a pixel pitch or a weight. Counts are counted from the film and say so. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

const sec = document.querySelector('.fp-model'), FP = window.FP;
layoutSets();
const S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.0, fill: .05, fog: 0x030305, rimI: .001 });
if (S) build();

/* the films we made and the pieces on paper: each set is shown whole at once, in rows of one height each, fitted to one screen on a
   wide screen (on a phone, two squares or one picture per row). No picture or film is cut and no field of ours is laid behind any of them. */
function layoutSets() {
  const sets = [].slice.call(document.querySelectorAll('.mz-set')); if (!sets.length) return;
  const lay = () => sets.forEach(s => {
    const ph = innerWidth <= 760, side = !ph && s.classList.contains('side'), grid = s.querySelector('.grid'), figs = [].slice.call(grid.querySelectorAll('figure')), rows = JSON.parse(s.dataset[ph ? 'rowsP' : 'rows']);
    figs.forEach(f => grid.appendChild(f)); [].slice.call(grid.querySelectorAll('.mz-row')).forEach(r => r.remove());
    const gap = ph ? 10 : 18, W = grid.clientWidth, cs = getComputedStyle(s), note = s.querySelector('.note');
    const capH = r => r.some(k => figs[k].querySelector('figcaption')) ? (ph ? 40 : 36) : 0;
    const hw = rows.map(r => (W - gap * (r.length - 1)) / r.reduce((a, k) => a + +figs[k].dataset.r, 0));
    let k = 1;
    if (!ph) { const H = innerHeight - (side ? 0 : s.querySelector('.hd').offsetHeight) - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - rows.reduce((a, r) => a + capH(r), 0) - gap * (rows.length - 1) - (note ? note.offsetHeight + 14 : 0) - 10;
      k = Math.max(.35, Math.min(1, H / hw.reduce((a, b) => a + b, 0))); }
    rows.forEach((r, i) => { const row = document.createElement('div'); row.className = 'mz-row'; row.style.gap = gap + 'px'; row.style.marginTop = i ? gap + 'px' : '0';
      const hh = ph ? Math.min(hw[i], innerHeight * .42) : hw[i] * k;
      r.forEach(n => { const f = figs[n]; f.style.width = Math.floor(+f.dataset.r * hh) + 'px'; row.appendChild(f); }); grid.appendChild(row); });
  });
  lay(); addEventListener('resize', lay); addEventListener('load', lay);
}

function build() {
  const { std, box, station, scene, cam, renderer, tex, video } = S, stick = sec.querySelector('.fp-stick');
  const PH = FP.phone();
  S.floor.visible = false; S.key.castShadow = false; renderer.shadowMap.enabled = false; scene.environmentIntensity = .1;
  const G = new T.Group(); S.world.add(G);
  const add = (o, to) => { (to || G).add(o); return o; };

  /* ---------- sizes, metres: estimates ---------- */
  const U = .15;                                                         /* metres to one unit of the seating plan, fitted to the films */
  const PZ = px => 7 + (px - 93.5) * U, PX = py => (py - 314.1) * U;       /* plan to hall: the stage front sits at z = 7, the hall runs along +z */
  const HALL = 20.1;                                                     /* half the width of the floor */
  const DECK_H = 1.7, DECK_W = 26, DECK_D = 13, DECK_Z = .5;
  const CW = 10, CH = CW * 1144 / 2080, CY = DECK_H + .45 + CH / 2, CZ = -4.2;
  const SW = CW / 10, SH = CH, SGAP = .09, CGAP = .22;
  const VW = 8, VH = VW * 672 / 1152, VX = 18.4, VY = 12.4, VZ = 2;
  const FOHZ = 54, GOLD = 0xe5a333;

  /* ---------- materials ---------- */
  const INK = std({ color: 0x050506, roughness: .92 }), DECKM = std({ color: 0x0b0b0e, roughness: .55 });
  const STEEL = std({ color: 0x30323a, roughness: .45, metalness: .6 }), BODY = std({ color: 0x0d0d10, roughness: .5, metalness: .3 });
  const OFF = new T.MeshBasicMaterial({ color: 0x17181d, toneMapped: false });                      /* a screen that is switched off */
  const SND = std({ color: 0x101014, roughness: .5, emissive: GOLD, emissiveIntensity: 0 });          /* sound: lights up at its station */
  const FOHM = std({ color: 0x15161a, roughness: .6, emissive: GOLD, emissiveIntensity: 0 });
  const flat = (c, k) => new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k === undefined ? 1 : k), toneMapped: false });
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; };
  const glowTex = canvasTex(256, 256, (x) => { const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, 'rgba(255,255,255,.55)'); gr.addColorStop(.5, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); });
  const LEDG = [], LIGHTG = [];                                           /* things that follow the LED layer and the light layer */
  const glow = (w, h, color, op, x, y, z, to) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); m.position.set(x, y, z); m.renderOrder = 6; m.userData.op = op; add(m, to); return m; };

  /* ---------- the hall floor: dark, and it mirrors the lit stage softly near it ---------- */
  const RT = new T.WebGLRenderTarget(PH ? 512 : 1024, PH ? 288 : 576, { generateMipmaps: true, minFilter: T.LinearMipmapLinearFilter, magFilter: T.LinearFilter }), texM = new T.Matrix4(), vcam = new T.PerspectiveCamera();
  const FLOORM = new T.MeshStandardMaterial({ color: 0x0b0c10, roughness: .62, metalness: 0 });
  FLOORM.onBeforeCompile = sh => { sh.uniforms.tRefl = { value: RT.texture }; sh.uniforms.reflM = { value: texM };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform mat4 reflM; varying vec4 vRefl; varying float vWz;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvec4 wp4 = modelMatrix * vec4(position, 1.0); vRefl = reflM * wp4; vWz = wp4.z;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tRefl; varying vec4 vRefl; varying float vWz;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nvec2 ruv = vRefl.xy / vRefl.w; vec3 rc = vec3(0.); float ws = 0.; for (int i = -10; i <= 10; i++) { float fi = float(i); float w = exp(-fi * fi / 34.); rc += w * texture2D(tRefl, clamp(ruv + vec2(fi * .0006, fi * .0044), 0., 1.), 2.6).rgb; ws += w; }\ntotalEmissiveRadiance += rc / ws * .2 * (1. - .9 * smoothstep(8., 26., vWz)) * step(0., ruv.x) * step(ruv.x, 1.);'); };
  const floor = new T.Mesh(new T.PlaneGeometry(2 * HALL, 108), FLOORM); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 40); add(floor);
  add(new T.Mesh(new T.PlaneGeometry(400, 400), INK)).rotation.x = -Math.PI / 2;                    /* outside the hall: black */

  /* ---------- the hall: two long stands, the lit boxes over them, an end stand ---------- */
  const SEATS = [flat(0x0f1a22), flat(0x16242e)], WALL = flat(0x07090c);
  const boxesT = canvasTex(1024, 64, (x, w, h) => { x.fillStyle = '#050505'; x.fillRect(0, 0, w, h); for (let i = 0; i < 44; i++) { const gr = x.createLinearGradient(0, 14, 0, 50); gr.addColorStop(0, '#e89a58'); gr.addColorStop(1, '#5a2f16'); x.fillStyle = gr; x.fillRect(i * 23.3 + 4, 16, 17, 32); } });
  [-1, 1].forEach(sd => {
    for (let i = 0; i < 22; i++) { const lower = i < 7, k = lower ? 0 : (i - 7) / 14, z0 = lower ? PZ(144.5) : PZ(131.6) + (PZ(101.7) - PZ(131.6)) * k, z1 = lower ? PZ(505) : PZ(517.8) + (PZ(547.7) - PZ(517.8)) * k;
      add(box(.82, .42, z1 - z0, SEATS[i % 2], sd * (HALL + .41 + i * .82), 2.6 + i * .42 + .21, (z0 + z1) / 2)); }
    add(box(.3, 2.6, 96, WALL, sd * (HALL + .15), 1.3, 36));
    [0, 1].forEach(lv => { const p = new T.Mesh(new T.PlaneGeometry(82, 1.5), new T.MeshBasicMaterial({ map: boxesT, toneMapped: false, color: new T.Color(.24, .24, .24) })); p.rotation.y = -sd * Math.PI / 2; p.position.set(sd * (HALL + 19 + lv * 1.2), 13.2 + lv * 3.1, 40); add(p); add(box(1.6, .3, 82, WALL, sd * (HALL + 19.4 + lv * 1.2), 12.2 + lv * 3.1, 40)); }); });
  for (let i = 0; i < 16; i++) add(box(2 * HALL + 8, .42, .82, SEATS[i % 2], 0, 2.6 + i * .42 + .21, 84 + i * .82));
  add(box(2 * HALL + 8, 2.6, .3, WALL, 0, 1.3, 83.6));

  /* ---------- the floor, as allocated on the seating plan: fan pit, standing floor, bar ---------- */
  const ZONES = [];
  const zone = (pts, color, op) => { const sh = new T.Shape(); pts.forEach((p, i) => { const x = PX(p[1]), z = PZ(p[0]); i ? sh.lineTo(x, -z) : sh.moveTo(x, -z); });
    const m = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.y = .03; m.renderOrder = 3; m.userData.op = op; add(m);
    const lp = pts.concat([pts[0]]).map(p => new T.Vector3(PX(p[1]), .05, PZ(p[0]))), l = new T.Line(new T.BufferGeometry().setFromPoints(lp), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); l.renderOrder = 4; l.userData.op = .7; add(l); ZONES.push(m, l); };
  zone([[135.2, 237], [115.6, 237], [115.6, 391.2], [135.2, 391.2], [158.4, 372.1], [158.4, 253.9]], GOLD, .3);
  zone([[381.7, 346], [381.7, 285.8], [477.3, 285.8], [477.3, 238.8], [171.9, 238.8], [192.2, 253.6], [192.2, 371.9], [171.6, 389.3], [477.3, 389.3], [477.3, 346]], 0xffffff, .1);
  zone([[521.4, 261.6], [566.5, 261.6], [566.5, 366.5], [521.4, 366.5]], 0xffffff, .16);
  /* the bar: white counters and standing tables (festival film, 1:24) */
  { const W = std({ color: 0xcfd0d2, roughness: .5 }); [-1, 1].forEach(sd => add(box(6.4, 1.1, .8, W, sd * 3.9, .55, PZ(552)))); add(box(.8, 1.1, 5, W, 7.5, .55, PZ(538))); add(box(.8, 1.1, 5, W, -7.5, .55, PZ(538)));
    [[-4, 505], [0, 498], [4, 505], [-8, 512], [8, 512]].forEach(p => { const t = new T.Mesh(new T.CylinderGeometry(.35, .35, .04, 20), W); t.position.set(p[0], 1.1, PZ(p[1])); add(t); const l = new T.Mesh(new T.CylinderGeometry(.03, .03, 1.1, 8), W); l.position.set(p[0], .55, PZ(p[1])); add(l); }); }
  /* two things seen at the edge of the floor in the festival film at 0:13. No artwork for them is in the archive, so they stay plain. */
  add(box(.08, 2.2, 1.6, std({ color: 0x55585e, roughness: .7 }), HALL - .5, 1.1, 57)); add(box(.08, 2.0, 1.0, std({ color: 0x55585e, roughness: .7 }), HALL - .5, 1.0, 58.6));
  add(box(.06, 2.4, 2.0, std({ color: 0x3f6b56, roughness: .8 }), -HALL + .5, 1.2, 60));

  /* ---------- structure: the deck, its wings, the barrier, the flown grid and trusses ---------- */
  add(box(DECK_W, DECK_H, DECK_D, [INK, INK, DECKM, INK, INK, INK], 0, DECK_H / 2, DECK_Z));
  [-1, 1].forEach(sd => add(box(4.6, DECK_H, 8, [INK, INK, DECKM, INK, INK, INK], sd * (DECK_W / 2 + 2.3), DECK_H / 2, DECK_Z - 2)));  /* wings, left and right */
  add(box(DECK_W + .1, .05, .06, std({ color: 0x8a8a8a, roughness: .5 }), 0, DECK_H + .01, DECK_Z + DECK_D / 2 - .05));
  add(box(2 * HALL, 14, .3, INK, 0, 7, CZ - 4.4));                                                /* upstage black */
  [-1, 1].forEach(sd => add(box(4, 9, .2, INK, sd * 11.2, 4.5 + DECK_H, CZ - .6)));                /* black legs beside the wall */
  add(box(2 * HALL - .6, 1.2, .2, BODY, 0, .6, 10.1));                                            /* the barrier across the floor, in front of the stage */
  const lattice = canvasTex(128, 64, (x) => { x.clearRect(0, 0, 128, 64); x.strokeStyle = '#a4a7b0'; x.lineWidth = 7; x.beginPath(); x.moveTo(0, 5); x.lineTo(128, 5); x.moveTo(0, 59); x.lineTo(128, 59); x.stroke(); x.lineWidth = 4.5; x.beginPath(); x.moveTo(0, 59); x.lineTo(32, 5); x.lineTo(64, 59); x.lineTo(96, 5); x.lineTo(128, 59); x.stroke(); });
  function truss(len, x, y, z, ry, rz, to) { const t = lattice.clone(); t.needsUpdate = true; t.wrapS = T.RepeatWrapping; t.repeat.set(len / 1.0, 1);
    const m = new T.MeshStandardMaterial({ map: t, alphaTest: .4, side: T.DoubleSide, roughness: .4, metalness: .5, color: 0xb9bcc6, emissive: 0x2a2c33 });
    const grp = new T.Group(); [[0, 0, .2, 0], [0, 0, -.2, 0], [0, .2, 0, Math.PI / 2], [0, -.2, 0, Math.PI / 2]].forEach(p => { const pl = new T.Mesh(new T.PlaneGeometry(len, .4), m); pl.position.set(p[0], p[1], p[2]); pl.rotation.x = p[3]; grp.add(pl); });
    grp.position.set(x, y, z); grp.rotation.y = ry || 0; grp.rotation.z = rz || 0; add(grp, to); return grp; }
  /* the grid flown from the roof, the front truss hung under it on wires (festival film, 0:18) */
  const GY = 17.2; truss(20, 0, GY, 5.6); truss(20, 0, GY, -4.6); [-1, 1].forEach(sd => { truss(10.2, sd * 10, GY, .5, Math.PI / 2); add(box(.025, GY - 13.2, .025, STEEL, sd * 9.6, (GY + 13.2) / 2, 5.6)); /* thin wires only: no vertical truss here (Tony, 12 Oct) */ [5.6, -4.6].forEach(z => add(box(.03, 8, .03, STEEL, sd * 9.8, GY + 4, z))); });
  /* five rows of truss over the stage, counted from the festival film at 0:12: a short one over the wall, three flown, and the front truss under the grid */
  const TR = [{ z: CZ + .5, y: CY + CH / 2 + .6, w: 9.6, n: 6 }, { z: -2.3, y: 9.5, w: 15.4, n: 8 }, { z: -.3, y: 10.5, w: 15.8, n: 8 }, { z: 1.8, y: 11.6, w: 16.4, n: 9 }, { z: 5.6, y: 13.2, w: 19.2, n: 10 }];
  TR.forEach((t, i) => { truss(t.w, 0, t.y, t.z); if (i > 0 && i < 4) [-1, 1].forEach(k => add(box(.025, GY - t.y, .025, STEEL, k * (t.w / 2 - 1), (GY + t.y) / 2, t.z))); });
  [-1, 1].forEach(sd => truss(4.2, sd * 11.6, 9, 3.2, sd * .5));                                   /* short rows at the sides */

  /* ---------- the LED system: one centre screen, six upright strips, two flown side screens (nine surfaces, counted from the film) ---------- */
  const loop = video('a/3d/loop.mp4', null, 'a/3d/loop.webp'), still = tex('loop.webp'); let filmOn = !loop.v;
  /* centre and pillars are one canvas, 3328 x 1144: the film fills its width and is cut top and bottom, as the phone film shows it */
  const V0 = .5 - (1144 / 3328) * (1920 / 1080) / 2, V1 = 1 - V0, uvs = (geo, u0, u1) => { const a = geo.attributes.uv; a.setXY(0, u0, V1); a.setXY(1, u1, V1); a.setXY(2, u0, V0); a.setXY(3, u1, V0); a.needsUpdate = true; return geo; };
  const centre = new T.Mesh(uvs(new T.PlaneGeometry(CW, CH), 624 / 3328, 2704 / 3328), new T.MeshBasicMaterial({ map: loop.v ? still : loop.t, toneMapped: false })); centre.position.set(0, CY, CZ); add(centre); centre.userData.k = .96;
  add(new T.Mesh(new T.PlaneGeometry(CW, CH), OFF)).position.set(0, CY, CZ - .02);
  add(box(CW + .16, CH + .16, .28, INK, 0, CY, CZ - .18));
  const strips = [];
  [-1, 1].forEach(sd => { for (let i = 0; i < 3; i++) { const x = sd * (CW / 2 + CGAP + SW / 2 + i * (SW + SGAP)), y = CY, n = sd < 0 ? 2 - i : 3 + i, u0 = (n < 3 ? n * 208 : 2704 + (n - 3) * 208) / 3328;
    const m = new T.Mesh(uvs(new T.PlaneGeometry(SW, SH), u0, u0 + 208 / 3328), new T.MeshBasicMaterial({ map: loop.v ? still : loop.t, toneMapped: false })); m.position.set(x, y, CZ + .02); m.userData.k = .96; add(m); strips.push(m);
    add(new T.Mesh(new T.PlaneGeometry(SW, SH), OFF)).position.set(x, y, CZ); add(box(SW + .05, SH + .05, .2, INK, x, y, CZ - .12)); } });
  const WALL_W = CW + 2 * (CGAP + 3 * SW + 2 * SGAP);
  LEDG.push(glow(WALL_W * 2.1, CH * 3.2, GOLD, .34, 0, CY + .3, CZ + .5));
  { const t = canvasTex(64, 256, (x) => { const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(229,163,51,.5)'); gr.addColorStop(.5, 'rgba(229,163,51,.1)'); gr.addColorStop(1, 'rgba(229,163,51,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 256); });
    const m = new T.Mesh(new T.PlaneGeometry(WALL_W, 8.5), new T.MeshBasicMaterial({ map: t, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: .5 })); m.rotation.x = -Math.PI / 2; m.position.set(0, DECK_H + .012, CZ + 4.3); m.renderOrder = 5; m.userData.op = .5; add(m); LEDG.push(m); }
  /* the side screens: the released frame (file 177), and in its window a live camera view of this same stage, as on the day */
  const LIVE = new T.WebGLRenderTarget(PH ? 480 : 960, PH ? 270 : 540), lcam = new T.PerspectiveCamera(21, 16 / 9, 1, 300);
  LIVE.texture.colorSpace = T.SRGBColorSpace;
  const frameT = tex('frame.webp'), sides = [];
  [-1, 1].forEach(sd => { const grp = new T.Group(); grp.position.set(sd * VX, VY, VZ); grp.rotation.y = -sd * .14;
    const live = new T.Mesh(new T.PlaneGeometry(VW * .93, VH * .9), new T.MeshBasicMaterial({ map: LIVE.texture, toneMapped: false })); grp.add(live);
    const fr = new T.Mesh(new T.PlaneGeometry(VW, VH), new T.MeshBasicMaterial({ map: frameT, transparent: true, toneMapped: false })); fr.position.z = .02; fr.renderOrder = 3; grp.add(fr);
    const off = new T.Mesh(new T.PlaneGeometry(VW, VH), OFF); off.position.z = -.02; grp.add(off);
    grp.add(box(VW + .2, VH + .2, .3, INK, 0, 0, -.2));
    LEDG.push(glow(VW * 2.2, VH * 2.6, GOLD, .2, 0, 0, .3, grp));
    truss(VW + 1.2, 0, VH / 2 + .75, -.2, 0, 0, grp); [-1, 1].forEach(k => { grp.add(box(.03, .6, .03, STEEL, k * (VW / 2 - .5), VH / 2 + .35, -.2)); grp.add(box(.03, 5, .03, STEEL, k * (VW / 2 - .5), VH / 2 + 3.4, -.2)); });
    add(grp); sides.push({ grp, live, fr }); });
  const ledLights = [[0, CY, CZ + 1.2, 160, 40], [-4.5, CY, CZ + 1.2, 90, 30], [4.5, CY, CZ + 1.2, 90, 30]].map(p => { const l = new T.PointLight(GOLD, p[3], p[4], 1.6); l.position.set(p[0], p[1], p[2]); l.userData.i = p[3]; scene.add(l); return l; });

  /* ---------- the light: the rows carry moving lights; the beams follow the looks seen in his film of 22 November, 16:08 ---------- */
  const beamMat = (color, k) => new T.ShaderMaterial({ uniforms: { c: { value: new T.Color(color) }, k: { value: 0 } },
    vertexShader: 'varying float vy; varying vec3 vn; varying vec3 vv; void main(){ vy = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.); vn = normalize(normalMatrix * normal); vv = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 c; uniform float k; varying float vy; varying vec3 vn; varying vec3 vv; void main(){ float f = pow(abs(dot(normalize(vn), normalize(vv))), 2.4); float a = f * (0.18 + 0.82 * pow(vy, 2.2)) * smoothstep(0.0, 0.12, vy) * k; gl_FragColor = vec4(c * a, 1.); }',
    blending: T.AdditiveBlending, depthWrite: false, transparent: true, side: T.DoubleSide, toneMapped: false });
  const beams = new T.Group(); add(beams); const DOWN = new T.Vector3(0, -1, 0), LENS = flat(0xffffff, .12);
  function head(x, y, z, dir, len, spread, k) { const d = new T.Vector3(...dir).normalize();
    const body = new T.Mesh(new T.CylinderGeometry(.17, .2, .42, 12), BODY); body.position.set(x, y, z); body.quaternion.setFromUnitVectors(DOWN, d); add(body);
    const lens = new T.Mesh(new T.CircleGeometry(.13, 16), LENS); lens.position.set(x + d.x * .23, y + d.y * .23, z + d.z * .23); lens.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), d); add(lens);
    if (len > 0) { const ge = new T.CylinderGeometry(.1, .1 + len * spread, len, 24, 1, true); ge.translate(0, -len / 2, 0); const b = new T.Mesh(ge, beamMat(0xdfeaff, k)); b.userData.k = k; b.position.set(x + d.x * .2, y + d.y * .2, z + d.z * .2); b.quaternion.setFromUnitVectors(DOWN, d); b.renderOrder = 8; beams.add(b); }
    const sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xdfeaff, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, toneMapped: false })); sp.scale.setScalar(len > 0 ? 1.5 : .6); sp.position.copy(lens.position); sp.renderOrder = 9; sp.userData.op = .95; add(sp); LIGHTG.push(sp); }
  TR.forEach((t, ti) => { for (let i = 0; i < t.n; i++) { const u = i / (t.n - 1) * 2 - 1, x = u * (t.w / 2 - .7); let dir, len, k;
    if (ti === 0) { dir = [u * .2, -.2, 1]; len = 0; k = 0; } else if (ti === 1) { dir = [u * .35, -1, .3]; len = 7.6; k = .1; } else if (ti === 2) { dir = [u * .6, -.8, .6]; len = 9.5; k = .13; } else if (ti === 3) { dir = [u * 1.25, .5, 1]; len = 20; k = .18; } else { dir = [u * 1.9, 1.05, 1]; len = 26; k = .27; }
    head(x, t.y - .42, t.z, dir, len, .026, k); } });
  [-1, 1].forEach(sd => { for (let i = 0; i < 3; i++) head(sd * (10.3 + i * 1.3), 8.6, 3.2 - (i - 1) * .7, [sd * .1, -1, .1], 8.6, .026, .26); });
  for (let i = 0; i < 8; i++) { const u = i / 7 * 2 - 1; head(u * 9.4, DECK_H + .42, DECK_Z + DECK_D / 2 - .8, [u * .3, 1, .2], 0, .03, 0); }
  [-1, 1].forEach(sd => { for (let i = 0; i < 4; i++) head(sd * (15.2 + i * 1.1), .5, 8.2, [sd * (.45 + i * .17), 1, .2], 15, .026, .3); });

  /* ---------- the sound, as far as the films show it: two flown hangs, monitors along the front of the stage ---------- */
  [-1, 1].forEach(sd => { for (let i = 0; i < 12; i++) { const b = box(1.15, .36, .72, SND, sd * 11.8, 16.6 - i * .385, 6.4 - i * i * .011); b.rotation.x = -i * .034; add(b); } add(box(.03, 5, .03, STEEL, sd * 11.8, 19.3, 6.4)); });
  [-9, -6.4, -3.8, -1.3, 1.3, 3.8, 6.4, 9].forEach(x => { const w = box(.62, .3, .46, SND, x, DECK_H + .17, 5.5); w.rotation.x = -.45; add(w); });
  /* front of house: one riser in the middle of the floor. Placed in the slot the standing floor leaves at its back on the plan (the plan does not label the slot; the films show the riser mid-floor).
     On it, three desks side by side facing the stage: sound, light and video, each a console with its faders and buttons lit, and its screens
     turned to the operator (festival film at 0:16, the front-of-house shot). The riser is dark; only the desks give light. No make or model is named. */
  const FOHL = []; let fohLamp = null;
  { const r = new T.Group(); r.position.set(0, 0, FOHZ); r.add(box(8.6, .6, 5.6, FOHM, 0, .3, 0));
    const edge = new T.Mesh(new T.BoxGeometry(8.6, .025, .025), flat(GOLD, .9)); edge.position.set(0, .615, 2.8); r.add(edge);      /* a gold line along the riser's edge, the festival's colour */
    const deskT = kind => canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#08090c'; x.fillRect(0, 0, w, h);
      if (kind === 'sound') { for (let c = 0; c < 24; c++) { const cx = 14 + c * 20.6; x.fillStyle = '#1b1d24'; x.fillRect(cx, 18, 12, 200); for (let k = 0; k < 6; k++) { x.fillStyle = ['#ffb347', '#9fb6ff', '#e5a333', '#c6ffd0', '#ffffff', '#ff8a5c'][(c + k) % 6]; x.globalAlpha = .55 + .45 * ((c * 7 + k * 3) % 5) / 4; x.fillRect(cx + 3, 24 + k * 14, 6, 5); } x.globalAlpha = 1; x.fillStyle = '#d9dbe2'; x.fillRect(cx + 1, 150 + ((c * 37) % 50), 10, 14); } }
      else if (kind === 'light') { for (let c = 0; c < 10; c++) for (let rr = 0; rr < 4; rr++) { x.fillStyle = (c + rr) % 3 ? '#2b2f3a' : '#e5a333'; x.fillRect(16 + c * 48, 22 + rr * 30, 36, 20); } for (let c = 0; c < 10; c++) { x.fillStyle = '#1b1d24'; x.fillRect(28 + c * 48, 150, 12, 90); x.fillStyle = '#d9dbe2'; x.fillRect(26 + c * 48, 170 + ((c * 29) % 50), 16, 12); } }
      else { for (let c = 0; c < 8; c++) { x.fillStyle = c === 3 ? '#ff5a4a' : (c === 5 ? '#6bff8f' : '#2b2f3a'); x.fillRect(30 + c * 58, 30, 44, 34); x.fillStyle = '#2b2f3a'; x.fillRect(30 + c * 58, 80, 44, 34); } x.fillStyle = '#1b1d24'; x.fillRect(60, 150, 390, 14); x.fillStyle = '#d9dbe2'; x.fillRect(230, 140, 26, 34); } });
    const scrT = kind => canvasTex(256, 144, (x, w, h) => { x.fillStyle = '#0b0d14'; x.fillRect(0, 0, w, h);
      if (kind === 'sound') { for (let i = 0; i < 32; i++) { const v = .25 + .7 * Math.abs(Math.sin(i * 1.7)); x.fillStyle = i % 5 ? '#4fd27a' : '#e5a333'; x.fillRect(8 + i * 7.6, h - 10 - v * (h - 30), 5, v * (h - 30)); } }
      else if (kind === 'light') { for (let c = 0; c < 8; c++) for (let rr = 0; rr < 5; rr++) { x.fillStyle = (c * 3 + rr) % 4 ? '#25304a' : '#9fb6ff'; x.fillRect(8 + c * 30.5, 10 + rr * 26, 26, 21); } }
      else { for (let c = 0; c < 3; c++) for (let rr = 0; rr < 2; rr++) { const gr = x.createLinearGradient(0, 0, 0, 60); gr.addColorStop(0, '#2a1d08'); gr.addColorStop(1, (c + rr) % 2 ? '#e5a333' : '#7a5418'); x.fillStyle = gr; x.save(); x.translate(8 + c * 83, 8 + rr * 68); x.fillRect(0, 0, 74, 60); x.restore(); } } });
    const MON = [], DESKM = std({ color: 0x2c2e36, roughness: .55, metalness: .45 });
    [['sound', -2.75], ['light', 0], ['video', 2.75]].forEach(([kind, x]) => {
      const d = new T.Group(); d.position.set(x, .6, -1.2); r.add(d);
      d.add(box(2.4, .85, 1.1, DESKM, 0, .425, 0));                                                                             /* the desk body, in road-case grey */
      const top = new T.Mesh(new T.PlaneGeometry(2.3, 1.0), new T.MeshBasicMaterial({ map: deskT(kind), toneMapped: false, color: new T.Color(.75, .75, .75) }));
      top.rotation.x = -Math.PI / 2 + .3; top.position.set(0, .88, .03); d.add(top);                                              /* tilted toward the operator, who stands on the far side from the stage */
      const n = kind === 'video' ? 2 : 1;
      for (let m = 0; m < n; m++) { const w = 1.0, h = .58, sx = n === 2 ? (m ? .56 : -.56) : 0;
        d.add(box(w + .06, h + .06, .05, DESKM, sx, 1.42 + h / 2, -.42)); d.add(box(.06, .55, .06, DESKM, sx, 1.14, -.45));
        const sc = new T.Mesh(new T.PlaneGeometry(w, h), kind === 'video' && m ? new T.MeshBasicMaterial({ map: loop.v ? still : loop.t, toneMapped: false, color: new T.Color(.85, .85, .85) }) : new T.MeshBasicMaterial({ map: scrT(kind), toneMapped: false }));
        sc.position.set(sx, 1.42 + h / 2, -.39); d.add(sc); MON.push(sc); }                                                      /* the screens face the operator */
      const lamp = glow(1.4, 1.4, 0xffd9a0, .35, 0, 1.25, .45, d); FOHL.push(lamp);                                              /* the desk lamp's pool of light */
    });
    r.add(box(.05, 1.7, .05, STEEL, 3.9, 1.45, 1.5)); r.add(box(.5, .3, .3, BODY, 3.9, 2.35, 1.4));                             /* the follow-camera on its stand */
    [[-4.4, 0, .1, 5.8], [4.4, 0, .1, 5.8], [0, 2.9, 8.9, .1], [0, -2.9, 8.9, .1]].forEach(b => r.add(box(b[2], 1.1, b[3], BODY, b[0], .55, b[1])));   /* the barrier round the riser */
    add(r);
    fohLamp = new T.PointLight(0xffe2b8, 0, 16, 1.6); fohLamp.position.set(0, 4.2, FOHZ + 1.6); scene.add(fohLamp); }
  /* the camera crane at the side of the pit (his film, 16:08) */
  { const c = new T.Group(); c.position.set(11.5, 0, 9); c.add(box(.6, 1.6, .6, BODY, 0, .8, 0)); const arm = box(.12, .12, 7.5, STEEL, 0, 0, 0); arm.position.set(-1.6, 3.3, -2.2); arm.rotation.set(.38, .5, 0); c.add(arm); c.add(box(.4, .3, .4, BODY, -3.3, 4.6, -4.9)); add(c); }
  /* backline, plain: a drum riser, two amplifiers, a keyboard, microphone stands */
  { const D = DECK_H, cyl = (r, h, x, y, z, rx) => { const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 16), BODY); m.position.set(x, y, z); if (rx) m.rotation.x = rx; add(m); return m; };
    add(box(2.7, .34, 2.3, INK, 0, D + .17, -1.5)); cyl(.29, .44, 0, D + .64, -1.2, Math.PI / 2); cyl(.17, .16, -.48, D + 1.02, -1.25); cyl(.15, .15, -.08, D + 1.2, -1.0); cyl(.17, .16, .32, D + 1.2, -1.0); cyl(.22, .34, .72, D + .78, -1.5);
    [[-.95, 1.52, -1.3, .25], [.95, 1.62, -1.25, .27], [-.6, 1.3, -1.9, .18]].forEach(c => { const d = cyl(c[3], .015, c[0], D + c[1], c[2]); d.rotation.z = .12; cyl(.012, c[1] - .34, c[0], D + .34 + (c[1] - .34) / 2, c[2]); });
    [-3.6, 3.6].forEach(x => { add(box(.78, .7, .4, BODY, x, D + .35, -2.0)); add(box(.72, .52, .36, BODY, x, D + .96, -2.0)); });
    add(box(1.35, .09, .42, BODY, -5.6, D + .95, -.6)); add(box(.04, .95, .04, BODY, -6.05, D + .47, -.6)); add(box(.04, .95, .04, BODY, -5.15, D + .47, -.6));
    [-2.6, 0, 2.6].forEach(x => { cyl(.013, 1.5, x, D + .75, 2.9); cyl(.03, .16, x, D + 1.52, 2.96, 1.2); }); }

  /* ---------- light on the model itself ---------- */
  const work = new T.SpotLight(0xdfe6ff, 0, 140, .7, 1, 1.2); work.position.set(-14, 30, 44); work.target.position.set(0, 5, 0); scene.add(work, work.target);   /* working light, for the structure */
  const front = new T.SpotLight(0xffffff, 0, 60, .2, .7, 1.4); front.position.set(-3, 12.6, 6); front.target.position.set(0, DECK_H + 1, 2.6); scene.add(front, front.target);

  /* ---------- stations: the engine walks the camera; all of them look at the same hall ---------- */
  const none = { noMirror: true, keyK: .004, drift: .22 };
  const ST = [
    station(0, Object.assign({}, none, { c: [0, 0, 34], rx: 30, ry: 52, yaw: 0, pitch: 1.12, fx: .95, fy: .92, ox: 0, oy: 0, oxp: 0, oyp: 0, fxp: .98, fyp: .8, drift: 0 })),
    station(0, Object.assign({}, none, { c: [0, 8.4, 0], rx: 18, ry: 11, yaw: .5, pitch: .06, fx: .66, fy: .66, ox: -.14, oy: .02, fxp: 1.1, fyp: .42, yawp: .5, rxp: 10 })),
    station(0, Object.assign({}, none, { c: [0, 8.2, -1], rx: 23.5, ry: 8.5, yaw: -.24, pitch: -.03, fx: .8, fy: .8, ox: -.06, fxp: 1.12, fyp: .42, yawp: -.34, rxp: 9.5 })),
    station(0, Object.assign({}, none, { c: [0, 10.5, 4], rx: 24, ry: 12, yaw: .3, pitch: -.1, fx: .8, fy: .9, ox: -.05, fxp: 1.1, fyp: .44, yawp: .4, rxp: 10.5 })),
    station(0, Object.assign({}, none, { c: [0, 8.6, 5], rx: 15.5, ry: 10, yaw: -.5, pitch: .1, fx: .7, fy: .82, fxp: 1.1, fyp: .44, yawp: -.6 })),
    station(0, Object.assign({}, none, { c: [0, 3.2, 46], rx: 8.5, ry: 4.5, yaw: .1, pitch: .1, fx: .95, fy: .9, ox: -.2, oy: -.035, drift: .1, fxp: 1.1, fyp: .7, yawp: .06, rxp: 3.7, oyp: .02 })),   /* from behind the desks, the stage lit beyond */
    station(0, Object.assign({}, none, { c: [-VX, VY, VZ], rx: 5.6, ry: 3.6, yaw: -.52, pitch: -.12, fx: .5, fy: .62, ox: .12, fxp: .95, fyp: .36, yawp: -.4 })),
    station(0, Object.assign({}, none, { c: [0, 6.9, -4], rx: 22.5, ry: 8, yaw: 0, pitch: -.13, fx: .92, fy: .9, ox: 0, oy: 0, oxp: 0, oyp: 0, fxp: 1.1, fyp: .4, yawp: 0, drift: .06, rxp: 11 }))
  ];
  
  

  /* ---------- names in the model: plain text on a short line, placed from the 3D point each frame ---------- */
  const NAMES = [
    [0, [0, CY + CH / 2, CZ], 'LED wall'], [0, [0, DECK_H, 4.5], 'Stage'], 
    [0, [0, 1.4, FOHZ], 'Front of house'], [0, [0, .1, PZ(280)], 'Standing floor'],
    [0, [0, 1.2, PZ(545)], 'Bar'], [0, [-HALL - 9, 7.2, 40], 'Seats'], [0, [HALL + 9, 7.2, 40], 'Seats'],
    
    [1, [0, GY, 5.6], 'Grid, flown from the roof'], [1, [9.6, 13.2, 5.6], 'Front truss'],
    [2, [0, CY + CH / 2, CZ], 'Centre screen'], [2, [-(CW / 2 + CGAP + 1.5 * SW + SGAP), CY + CH / 2, CZ], 'Six pillars'], [2, [VX, VY + VH / 2, VZ], 'Side screen'],
    [3, [0, 13.2, 5.6], 'Truss rows'], [3, [-16.8, .6, 8.2], 'Floor lights'],
    [4, [-11.8, 16.8, 6.4], 'Left hang'], [4, [11.8, 16.8, 6.4], 'Right hang'], [4, [1.3, DECK_H + .4, 5.5], 'Monitors'],
    [5, [0, 2.95, FOHZ - 1.6], 'Sound, light and video desks'], [5, [0, CY + CH / 2 + .4, CZ], 'Stage']
  ].map(n => { const el = document.createElement('span'); el.className = 'mzl' + (n[3] ? ' more' : ''); el.innerHTML = '<i></i><b></b>'; el.lastChild.textContent = n[2]; stick.appendChild(el); return { st: n[0], p: new T.Vector3(...n[1]), el, on: false }; });

  /* ---------- the layers: each station switches on what it is about ---------- */
  const E = FP.ease, seg = FP.seg, tmp = new T.Vector3(), fwd = new T.Vector3();
  let cur = { i: -1, l: 0 }, live = false, frameN = 0;
  S.onFrame((time, i, local) => { cur.i = i; cur.l = local;
    if (i === 5) { scene.fog.near = 44; scene.fog.far = 170; }   /* front of house looks down the whole hall: the stage stays clear at the far end */ });
  function state() {
    if (FP.rm || cur.i < 0) { const on = sec.querySelector('.st.on'); cur.i = on ? +on.dataset.s : 0; cur.l = 1; }
    const i = cur.i, l = cur.l, cut = stick.classList.contains('is-cut');
    let c = 1, s = 1, v = 1, lt = 0, snd = 0, foh = 0, zn = 0, wk = 0;
    if (i === 0) { lt = 0; zn = 1; wk = .5; const k = E(seg(l, .12, .8)); ST[0].pitch = 1.12 + (.36 - 1.12) * k; ST[0].ry = 52 + (27 - 52) * k; ST[0].c[2] = 34 + (26 - 34) * k; }
    else if (i === 1) { c = s = v = 0; wk = 1; }
    else if (i === 2) { c = seg(l, .03, .13); s = seg(l, .11, .21); v = seg(l, .19, .3); wk = .35 * (1 - v); }
    else if (i === 3) { lt = E(seg(l, .03, .3)); }
    else if (i === 4) { lt = .12; snd = .55 + .45 * Math.sin(performance.now() / 420); c = s = v = .5; wk = .25; }
    else if (i === 5) { lt = .55; }
    else if (i === 6) { lt = .45; }
    else { lt = 1; }
    centre.material.color.setScalar(centre.userData.k * c); centre.visible = c > .01;
    strips.forEach((m, n) => { const k = i === 2 ? seg(s, (n % 3) * .2, (n % 3) * .2 + .6) : s; m.material.color.setScalar(m.userData.k * k); m.visible = k > .01; });
    sides.forEach(o => { o.live.material.color.setScalar(v); o.fr.material.color.setScalar(v); o.live.visible = o.fr.visible = v > .01; });
    const led = (c + s + v) / 3; LEDG.forEach(m => { m.material.opacity = m.userData.op * led; }); ledLights.forEach(p => { p.intensity = p.userData.i * led; });
    beams.children.forEach(b => { b.material.uniforms.k.value = b.userData.k * lt; }); beams.visible = lt > .005; LIGHTG.forEach(sp => { sp.material.opacity = sp.userData.op * Math.min(1, lt * 2.2 + (i === 3 ? .0 : 0)); }); LENS.color.setScalar(.12 + .88 * Math.min(1, lt * 2.2));
    SND.emissiveIntensity = snd * .9; if (fohLamp) fohLamp.intensity = i === 5 ? 70 : 0; SND.color.setHex(i === 1 ? 0x010102 : 0x101014); SND.roughness = i === 1 ? 1 : .5; SND.metalness = 0;   /* in the working light the hangs stay dark: only the grid reads white (Tony's truss check, 12 Oct) */
    FOHM.emissiveIntensity = foh * .55; work.intensity = 2600 * wk; front.intensity = 240 * Math.max(led, .2);
    ZONES.forEach(m => { m.material.opacity += (m.userData.op * zn - m.material.opacity) * .2; });
    /* names */
    const Wd = stick.clientWidth, Hd = stick.clientHeight, show = !cut && sec.querySelector('.st.on');
    NAMES.forEach(n => { const on = show && n.st === i && (i !== 0 || l > .04); if (on !== n.on) { n.on = on; n.el.classList.toggle('on', !!on); } if (!on) return;
      tmp.copy(n.p).project(cam); const sx = (tmp.x * .5 + .5) * Wd, sy = (-tmp.y * .5 + .5) * Hd, ph = FP.phone();
      if (tmp.z > 1 || sx < 46 || sx > Wd - 46 || sy < (ph ? 118 : 150) || (ph ? sy > Hd * .56 : (sx < Wd * .37 && sy > Hd * .5))) { n.el.style.opacity = 0; return; } n.el.style.opacity = ''; n.el.style.transform = 'translate3d(' + ((tmp.x * .5 + .5) * Wd).toFixed(1) + 'px,' + ((-tmp.y * .5 + .5) * Hd).toFixed(1) + 'px,0)'; });
  }
  /* the two extra pictures: the live camera for the side screens, and the mirror in the floor */
  function passes() {
    frameN++; if (PH && frameN % 2) return;
    scene.updateMatrixWorld(true);
    sides.forEach(o => { o.grp.visible = false; }); ZONES.forEach(m => { m.visible = false; });
    lcam.position.set(7, 8.5, 64); lcam.lookAt(0, 5.4, -4); lcam.updateMatrixWorld(true);
    const fm = floor.material; floor.material = INK; renderer.setRenderTarget(LIVE); renderer.clear(); renderer.render(scene, lcam); floor.material = fm;
    sides.forEach(o => { o.grp.visible = true; });
    if (!PH) { cam.getWorldDirection(fwd); const p = cam.position;
      vcam.fov = 2 * Math.atan(Math.tan(cam.fov * Math.PI / 360) * 1.6) * 180 / Math.PI; vcam.aspect = cam.aspect; vcam.near = .1; vcam.far = 600; vcam.updateProjectionMatrix();
      vcam.position.set(p.x, -p.y, p.z); vcam.up.set(0, -1, 0); vcam.lookAt(p.x + fwd.x * 10, -(p.y + fwd.y * 10), p.z + fwd.z * 10); vcam.updateMatrixWorld(true);
      texM.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1).multiply(vcam.projectionMatrix).multiply(vcam.matrixWorldInverse);
      floor.visible = false; renderer.clippingPlanes = [new T.Plane(new T.Vector3(0, 1, 0), -.02)];
      renderer.setRenderTarget(RT); renderer.clear(); renderer.render(scene, vcam); renderer.clippingPlanes = []; floor.visible = true; }
    renderer.setRenderTarget(null); ZONES.forEach(m => { m.visible = true; });
  }
  function film() { const v = loop.v; if (!v) return; const want = live && !FP.hold && cur.i >= 0;
    if (want) { if (!v.src) { v.src = v.dataset.s; v.load(); } if (v.paused) { const p = v.play(); p && p.catch && p.catch(() => {}); } } else if (!v.paused) v.pause();
    if (!filmOn && v.readyState >= 2 && !v.paused) { filmOn = true; [centre].concat(strips).forEach(m => { m.material.map = loop.t; m.material.needsUpdate = true; }); } }
  function tick() { requestAnimationFrame(tick); film(); if (!live) return; state(); passes(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { live = es[0].isIntersecting; }, { rootMargin: '20% 0px' }).observe(sec); else live = true;
  state(); tick();
  S.ready();
}
