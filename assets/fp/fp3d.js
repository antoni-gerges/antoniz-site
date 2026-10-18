/* Film page, the 3D chapter: a dark studio floor, pieces built at their drawn size (metres), a camera that walks from piece to piece on scroll.
   At each piece: first the model with its dimension lines, then the same piece as built, on film, grows to take the screen. */
import * as T from '../../vendor/three.module.min.js';
export { T };

export function stage(sec, opt) {
  const FP = window.FP; opt = opt || {};
  const stick = sec.querySelector('.fp-stick'), canvas = sec.querySelector('canvas');
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { sec.classList.add('no3d'); return null; }
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = opt.exposure || 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap;

  const scene = new T.Scene(); scene.fog = new T.Fog(0x000000, 16, 46);
  const cam = new T.PerspectiveCamera(34, 1, .1, 400);
  const A = opt.assets || 'a/3d/', loader = new T.TextureLoader();
  const tex = (f, cb) => { const t = loader.load(f.indexOf('/') < 0 ? A + f : f, cb); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; };

  /* studio reflections: a dark room with three soft boxes */
  const pm = new T.PMREMGenerator(renderer), env = new T.Scene();
  env.add(new T.Mesh(new T.BoxGeometry(40, 40, 40), new T.MeshBasicMaterial({ color: 0x050505, side: T.BackSide })));
  [[0, 14, 6, 16, 5], [-16, 6, 4, 4, 9], [14, 5, -6, 5, 8]].forEach(b => { const m = new T.Mesh(new T.PlaneGeometry(b[3], b[4]), new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide })); m.position.set(b[0], b[1], b[2]); m.lookAt(0, 1, 0); env.add(m); });
  scene.environment = pm.fromScene(env, .04).texture; scene.environmentIntensity = .55;

  /* light: a soft key that follows the camera's subject, a coloured rim, a low fill */
  scene.add(new T.HemisphereLight(0xffffff, 0x101014, opt.fill || .66));
  const key = new T.SpotLight(opt.key || 0xffffff, 900, 90, .62, .95, 1.6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.radius = 5; key.shadow.camera.near = 2; key.shadow.camera.far = 80;
  scene.add(key, key.target);
  const rim = new T.DirectionalLight(opt.rim || 0xc4d2ff, opt.rimI || .4); scene.add(rim, rim.target);

  /* floor: dark, a faint 1 m planning grid, and a soft mirror made of faint upside-down copies */
  const floor = new T.Mesh(new T.PlaneGeometry(900, 400), new T.MeshStandardMaterial({ color: opt.floor || 0x040405, roughness: .7, metalness: 0, transparent: true, opacity: .8 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.renderOrder = 2; scene.add(floor);
  const grid = new T.GridHelper(900, 900, 0xffffff, 0xffffff); grid.material.transparent = true; grid.material.opacity = .05; grid.material.depthWrite = false; grid.position.y = .002; grid.renderOrder = 3; scene.add(grid);
  /* look: a designed night stage instead of a planning preview */
  if (opt.grid === false) grid.visible = false;
  if (opt.sky) { const cv = document.createElement('canvas'); cv.width = 8; cv.height = 256; const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); opt.sky.forEach(k => g.addColorStop(k[0], k[1])); x.fillStyle = g; x.fillRect(0, 0, 8, 256); const bt = new T.CanvasTexture(cv); bt.colorSpace = T.SRGBColorSpace; scene.background = bt; }
  if (opt.fog !== undefined) scene.fog.color.set(opt.fog);
  if (opt.floorColor !== undefined) floor.material.color.set(opt.floorColor);
  if (opt.floorRough !== undefined) floor.material.roughness = opt.floorRough;
  if (opt.floorMetal !== undefined) floor.material.metalness = opt.floorMetal;
  if (opt.floorOpacity !== undefined) floor.material.opacity = opt.floorOpacity;
  const world = new T.Group(), mirror = new T.Group(); mirror.scale.y = -1; scene.add(world, mirror);

  const std = (o) => new T.MeshStandardMaterial(Object.assign({ roughness: .85, metalness: 0 }, o));
  const dark = std({ color: 0x0d0e10, roughness: .6 });
  const box = (w, h, d, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x || 0, y || 0, z || 0); b.castShadow = b.receiveShadow = true; return b; };
  /* a printed panel: artwork on the face, dark edges */
  const panel = (w, h, map, d, o) => { const face = std(Object.assign({ map, roughness: .8 }, o)); const b = new T.Mesh(new T.BoxGeometry(w, h, d || .06), [dark, dark, dark, dark, face, dark]); b.castShadow = b.receiveShadow = true; return b; };

  /* a plain shop mannequin, 1.82 m; plain = all white, used as a scale figure */
  const mWhite = std({ color: 0xdcdde0, roughness: .45 }), mBlack = std({ color: 0x0a0a0a, roughness: .3 }), mTee = std({ color: 0x8b9096, roughness: .8, side: T.DoubleSide }), mJean = std({ color: 0x1d2433, roughness: .75 }), mAll = std({ color: 0x70747c, roughness: .8, side: T.DoubleSide }), mGrey = std({ color: 0x70747c, roughness: .8 });
  const mProf = [[0, .83], [.15, .85], [.176, .96], [.15, 1.1], [.16, 1.26], [.19, 1.38], [.21, 1.44], [.17, 1.485], [.07, 1.52], [.052, 1.56], [.05, 1.62]].map(p => new T.Vector2(p[0], p[1]));
  function manq(plain) {
    const m = new T.Group(), add = (geo, mat, x, y, z, sx, sy, sz, rz) => { const o = new T.Mesh(geo, mat); o.position.set(x, y, z); o.scale.set(sx || 1, sy || 1, sz || 1); if (rz) o.rotation.z = rz; o.castShadow = true; m.add(o); return o; };
    const leg = plain ? mGrey : mJean, body = plain ? mAll : mTee, skin = plain ? mGrey : mWhite;
    if (!plain) add(new T.CylinderGeometry(.19, .19, .02, 28), mWhite, 0, .01, 0);
    add(new T.CylinderGeometry(.08, .05, .86, 16), leg, -.088, .44, 0); add(new T.CylinderGeometry(.08, .05, .86, 16), leg, .088, .44, 0);
    add(new T.LatheGeometry(mProf, 32), body, 0, 0, 0, 1, 1, .58);
    add(new T.CapsuleGeometry(.042, .56, 6, 12), skin, -.243, 1.12, 0, 1, 1, 1, -.06); add(new T.CapsuleGeometry(.042, .56, 6, 12), skin, .243, 1.12, 0, 1, 1, 1, .06);
    add(new T.SphereGeometry(.1, 28, 20), skin, 0, 1.725, .008, .84, 1.14, .95);
    if (!plain) { add(new T.TorusGeometry(.027, .0045, 8, 24), mBlack, -.035, 1.735, .09); add(new T.TorusGeometry(.027, .0045, 8, 24), mBlack, .035, 1.735, .09); add(new T.BoxGeometry(.02, .005, .005), mBlack, 0, 1.738, .092); }
    return m;
  }

  /* a soft contact shadow under a piece */
  const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.55, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
  function blob(g, x, z, w, d, a) { const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: a || .7, depthWrite: false, color: 0x000000 })); m.rotation.x = -Math.PI / 2; m.position.set(x, .005, z); m.renderOrder = 4; m.userData.noMirror = true; g.add(m); return m; }

  const ST = [], vids = [], frameFns = [];
  /* a station: c = what to look at, rx/ry = half-size to frame, yaw/pitch = where the camera stands, drift = how far it swings while you stay */
  function station(x, o) { const g = new T.Group(); g.position.set(x, 0, 0); world.add(g); const s = Object.assign({ g, x, dims: [], yaw: .42, pitch: .1, drift: .5 }, o); ST.push(s); return s; }
  function video(src, srcP, poster) {
    if (FP.rm && poster) return { v: null, t: tex(poster) };
    const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.crossOrigin = 'anonymous';
    v.dataset.s = FP.phone() && srcP ? srcP : src; const t = new T.VideoTexture(v); t.colorSpace = T.SRGBColorSpace; vids.push(v); return { v, t };
  }
  const vplay = (v, on) => { if (on) { if (!v.src) v.src = v.dataset.s; if (v.paused) { const p = v.play(); p && p.catch && p.catch(() => {}); } } else if (!v.paused) v.pause(); };

  function reflect() {
    mirror.clear();
    ST.forEach(s => { if (s.noMirror) return; const c = s.g.clone(true); c.traverse(o => { if (o.userData.noMirror) { o.visible = false; return; } if (!o.isMesh && !o.isLineSegments) return; o.castShadow = o.receiveShadow = false;
      const fix = m => { const n = m.clone(); n.transparent = true; n.opacity = (m.transparent ? m.opacity : 1) * (m.isMeshBasicMaterial && m.map && m.map.isVideoTexture ? .3 : .11) * (opt.mirrorK || 1); n.depthWrite = false; n.side = T.DoubleSide; return n; };
      o.material = Array.isArray(o.material) ? o.material.map(fix) : fix(o.material); o.renderOrder = 1; }); mirror.add(c); });
  }

  /* dimension lines and their labels */
  const lineMat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, depthTest: false }), labels = [];
  function dims() {
    ST.forEach((s, i) => s.dims.forEach(d => { if (d.el) return;
      const a = new T.Vector3(...d.a), b = new T.Vector3(...d.b), n = new T.Vector3().subVectors(b, a).normalize(), up = Math.abs(n.y) > .9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 1, 0), k = d.k || .09;
      const pts = [a, b, a.clone().addScaledVector(up, k), a.clone().addScaledVector(up, -k), b.clone().addScaledVector(up, k), b.clone().addScaledVector(up, -k)];
      const l = new T.LineSegments(new T.BufferGeometry().setFromPoints(pts), lineMat.clone()); l.renderOrder = 20; l.material.opacity = 0; s.g.add(l);
      const el = document.createElement('span'); el.className = 'fp-dim' + (d.huge ? ' huge' : d.big ? ' big' : '') + (s.dims.indexOf(d) > 0 ? ' more' : ''); el.textContent = d.t; stick.appendChild(el);
      d.el = el; d.line = l; d.mid = a.clone().add(b).multiplyScalar(.5); labels.push({ d, s, i }); }));
  }

  /* camera */
  const v3 = () => new T.Vector3();
  let Wd = 1, Hd = 1, mx = 0, my = 0, smx = 0, smy = 0;
  function pose(i, local, out) {
    const s = ST[i], ph = FP.phone(), vf = cam.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    const d = Math.max((ph && s.rxp || s.rx) / (Math.tan(hf / 2) * (ph ? (s.fxp || (s.rx > s.ry * 1.35 ? 1.16 : .92)) : (s.fx || .6))), s.ry / (Math.tan(vf / 2) * (ph ? (s.fyp || .4) : (s.fy || .7))));
    const yaw = (ph ? (s.yawp === undefined ? s.yaw * .7 : s.yawp) : s.yaw) + (local - .5) * s.drift + smx * .07, pit = s.pitch + .05 + smy * .03;
    out.t.set(s.x + s.c[0], s.c[1], s.c[2]);
    out.p.set(out.t.x + Math.sin(yaw) * Math.cos(pit) * d, Math.max(.5, out.t.y + Math.sin(pit) * d), out.t.z + Math.cos(yaw) * Math.cos(pit) * d);
  }
  const A0 = { p: v3(), t: v3() }, B0 = { p: v3(), t: v3() }, tmp = v3();
  const wsum = () => ST.reduce((a, s) => a + (s.w || 1), 0);
  const at = (i, l) => { let a = 0; for (let n = 0; n < i; n++) a += ST[n].w || 1; return .07 + .93 * ((a + l * (ST[i].w || 1)) / wsum()); };
  let P = 0, act = -1, running = false, last = performance.now(), time = 0, built = false;
  const stEls = [], bEls = [], intro = sec.querySelector('.intro');
  [].forEach.call(sec.querySelectorAll('.st'), e => { stEls[+e.dataset.s] = e; }); [].forEach.call(sec.querySelectorAll('.fp-built'), e => { bEls[+e.dataset.b] = e; });
  const ticks = document.createElement('div'); ticks.className = 'fp-ticks'; stick.appendChild(ticks);

  function size() {
    Wd = stick.clientWidth; Hd = stick.clientHeight; const ph = FP.phone();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ph ? 2 : 1.75)); renderer.setSize(Wd, Hd, false);
    cam.fov = ph ? 44 : 34; cam.aspect = Wd / Hd; cam.updateProjectionMatrix();
  }
  /* results are fetched and decoded before they are needed, and a cut waits until its picture is ready */
  function warm() { bEls.forEach(e => { if (!e || e._warm) return; e._warm = 1; const im = e.querySelector('img'), v = e.querySelector('video');
    if (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(() => {}); }
    if (v) { FP.arm(v); v.preload = 'auto'; const p = v.getAttribute('poster'); if (p) { const pi = new Image(); pi.onload = () => { v._posterOk = 1; }; pi.src = p; } } }); }
  function mediaReady(e) { const im = e.querySelector('img'), v = e.querySelector('video'); if (im) return im.complete && im.naturalWidth > 0; if (v) return v.readyState >= 2 || !!v._posterOk; return true; }
  function setAct(n) {
    if (n === act) return; act = n;
    stEls.forEach((e, i) => e && e.classList.toggle('on', i === n));
    [].forEach.call(ticks.children, (k, i) => { k.className = n >= 0 && i <= n ? 'on' : (n === -2 && i <= lastI ? 'on' : ''); });
  }
  let lastI = 0, wasCut = false, wasBe = null;
  function render() {
    const NS = ST.length; if (!NS) return;
    const now = performance.now(); time += Math.min(now - last, 50) / 1000; last = now;
    if (FP.rm) { mx = my = 0; } smx += (mx - smx) * .06; smy += (my - smy) * .06;
    const start = .07, ph = FP.phone(); let uu = FP.clamp((P - start) / (1 - start), 0, .9999) * wsum(), i = 0; while (i < NS - 1 && uu >= (ST[i].w || 1)) { uu -= (ST[i].w || 1); i++; } const local = uu / (ST[i].w || 1);
    lastI = i;
    const own = bEls[i], prev = i > 0 ? bEls[i - 1] : null, rm = FP.rm;
    pose(i, rm ? .5 : Math.min(local, .8) + .1, A0);
    /* the camera only travels underneath a held result. A piece with no result keeps its pose and caption to the boundary, then the next model cuts in. */
    const k = rm || i >= NS - 1 || !own ? 0 : FP.ease(FP.seg(local, .78, 1));
    if (k > 0) { pose(i + 1, .1, B0); A0.p.lerp(B0.p, k); A0.t.lerp(B0.t, k); A0.p.y += Math.sin(k * Math.PI) * 1.6; }
    { const o = s => ph ? [s.oxp || 0, s.oyp === undefined ? .07 : s.oyp] : [s.ox === undefined ? -.17 : s.ox, s.oy === undefined ? .07 : s.oy]; let a = o(ST[i]); if (k > 0) { const b = o(ST[i + 1]); a = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; } cam.setViewOffset(Wd, Hd, a[0] * Wd, a[1] * Hd, Wd, Hd); }
    cam.position.copy(A0.p); cam.lookAt(A0.t);
    key.position.set(A0.t.x + 5, 13, A0.t.z + 9); key.target.position.copy(A0.t); rim.position.set(A0.t.x - 8, 6, A0.t.z - 10); rim.target.position.copy(A0.t);
    { const far = ST[k > .5 ? i + 1 : i].rx, dc = cam.position.distanceTo(A0.t); scene.fog.near = dc + far * .5; scene.fog.far = dc + 22 + far * 2.6; const sa = ST[i], sb = ST[Math.min(NS - 1, i + 1)], kk = (sa.keyK || 1) + ((sb.keyK || 1) - (sa.keyK || 1)) * k; key.intensity = 900 * kk * Math.max(1, Math.pow(dc / 16, 1.15)); }
    /* model, then its result as a whole-scene cut. The result is HELD through the camera's travel, until the next model and its caption are ready:
       no return to the old model, no empty floor. The caption stays with its result. */
    const cutEl = own && local > .44 && mediaReady(own) ? own : (prev && local < .06 && mediaReady(prev) ? prev : null);
    setAct(P < start * .6 ? -1 : (prev && local < .06 ? i - 1 : i));
    bEls.forEach((e, n) => { if (!e) return; const live = e === cutEl || (n === i && local > .1); if (live === !!e._live) return; e._live = live; e.classList.toggle('on', live); const v = e.querySelector('video'); if (v) live ? FP.play(v) : FP.stop(v); });
    if (cutEl !== wasBe) { bEls.forEach(e => e && e.classList.toggle('cut', e === cutEl)); stick.classList.toggle('is-cut', !!cutEl); wasBe = cutEl; }
    const inspect = act === i && !cutEl;
    if (intro) intro.style.opacity = (1 - FP.seg(P, .02, start * .9)).toFixed(3);
    canvas.style.opacity = (.28 + .72 * FP.seg(P, .025, start)).toFixed(3);
    ST.forEach((s, n) => { if (s.vid) vplay(s.vid, running && !FP.hold && !FP.userPaused && !FP.rm && Math.abs(n - (i + k)) < 1.2); });
    if (!FP.rm) for (let n = 0; n < frameFns.length; n++) frameFns[n](time, i, local);
    labels.forEach(l => { const on = l.i === i && inspect; l.d.el.classList.toggle('on', on); l.d.line.material.opacity += ((on ? .85 : 0) - l.d.line.material.opacity) * .12;
      if (!on) return; tmp.copy(l.d.mid); l.s.g.localToWorld(tmp); tmp.project(cam); const hw = (l.d.hw || (l.d.hw = l.d.el.offsetWidth / 2)) + 10, lx = Math.max(hw, Math.min(Wd - hw, (tmp.x * .5 + .5) * Wd)), ly = Math.max(FP.phone() ? 128 : 118, Math.min(FP.phone() ? Hd * .5 : Hd - 20, (-tmp.y * .5 + .5) * Hd));
      l.d.el.style.transform = 'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0) translate(-50%,-50%)'; });
    renderer.render(scene, cam);
  }
  function loop() { if (!running) return; render(); requestAnimationFrame(loop); }
  function ready() { reflect(); built = true; ticks.innerHTML = ''; ST.forEach(() => ticks.appendChild(document.createElement('i'))); if (running) dims(); FP.ask(); }
  FP.on(function (H) {
    const r = sec.getBoundingClientRect(), on = r.top < H * 1.2 && r.bottom > -H * .2;
    P = FP.clamp(-r.top / Math.max(1, r.height - H), 0, 1);
    if (on && !running) { running = true; last = performance.now(); dims(); warm(); loop(); }
    else if (!on && running) { running = false; vids.forEach(v => vplay(v, false)); setAct(-9); bEls.forEach(e => { if (!e) return; e.classList.remove('cut', 'on'); e._live = false; const v = e.querySelector('video'); if (v) FP.stop(v); }); stick.classList.remove('is-cut'); wasBe = null; }
  });
  window.addEventListener('resize', size); size();
  window.addEventListener('pointermove', e => { mx = e.clientX / window.innerWidth * 2 - 1; my = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });
  const S = { T, FP, scene, world, cam, renderer, key, rim, floor, grid, A, tex, std, dark, box, panel, manq, blob, station, video, vids, ST, ready, at, onFrame: f => frameFns.push(f), isReady: () => built };
  window.__fp3d = S;
  return S;
}
