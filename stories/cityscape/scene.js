// Cityscape Abu Dhabi 2017 — the scroll scene.
// Every pose is a pure function of scroll progress p (0..1): scrolling back is exact. No timers, no loops, no smoothing.
// The 3D pavilion is a portfolio presentation: the floor is the design plan of 28 March 2017 (original render),
// the volumes follow that plan and the heights in the stand builder's contract (6 m structures, 0.8 m podiums).
import * as THREE from "./vendor/three.module.min.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };

const root = document.documentElement;
const story = document.getElementById("story");
const stage = story.querySelector(".stage");
const q = new URLSearchParams(location.search);

// ---------- motion preference: the system setting, unless the visitor chose ----------
const KEY = "az-motion";
const mq = matchMedia("(prefers-reduced-motion: reduce)");
const stored = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
function motionMode() {
  if (q.get("motion") === "off") return "off";
  if (q.get("motion") === "on") return "full";
  const s = stored();
  return s === "off" || s === "full" ? s : mq.matches ? "off" : "full";
}
const toggle = document.querySelector("[data-motion-toggle]");
if (toggle) {
  const m = motionMode();
  toggle.textContent = m === "off" ? "Motion off" : "Motion on";
  toggle.setAttribute("aria-pressed", m === "off" ? "true" : "false");
  toggle.addEventListener("click", () => {
    try { localStorage.setItem(KEY, motionMode() === "off" ? "full" : "off"); } catch {}
    const u = new URL(location.href); u.searchParams.delete("motion"); u.searchParams.delete("p"); location.replace(u);
  });
}

// ---------- the film: only on Play, muted, stops when the beat is left ----------
const film = stage.querySelector(".film"), video = film.querySelector("video"), playBtn = stage.querySelector(".play");
const playLabel = playBtn.textContent;
let playing = false;
function stopFilm() {
  if (!playing) return; playing = false;
  video.pause(); video.removeAttribute("src"); video.load();
  film.classList.remove("playing"); playBtn.textContent = playLabel; playBtn.setAttribute("aria-pressed", "false");
}
function playFilm() {
  if (playing) { stopFilm(); return; }
  playing = true; video.src = video.dataset.src; video.muted = true;
  film.classList.add("playing"); playBtn.textContent = "Stop the film"; playBtn.setAttribute("aria-pressed", "true");
  video.play().catch(stopFilm);
}
playBtn.addEventListener("click", playFilm);
video.addEventListener("ended", stopFilm);
document.addEventListener("visibilitychange", () => { if (document.hidden) stopFilm(); });

function initLive() {
  root.classList.add("live");
  for (const img of stage.querySelectorAll("img[loading='lazy']")) img.loading = "eager";

  const beats = [...stage.querySelectorAll(".beat")].map((el, i, all) => {
    const [a, b] = el.dataset.range.split(",").map(Number);
    return { el, a, b, first: i === 0, last: i === all.length - 1 };
  });
  const ticks = [...stage.querySelectorAll(".ticks li")];
  const rule = stage.querySelector(".rule line");
  const fixed = q.get("p") !== null ? clamp(parseFloat(q.get("p"))) : null;
  let W = 0, H = 0, tall = false, p = 0, queued = false, frameBox = [0, 0, 0, 0];
  const glCanvas = stage.querySelector("canvas.gl");

  // ---------- 2 · the names: fourteen layers, scattered in depth, settling into two columns ----------
  const namesBox = stage.querySelector(".b-names .names");
  const names = [...namesBox.querySelectorAll("img")];
  function layoutNames() {
    const r = namesBox.getBoundingClientRect(); const w = r.width || W * 0.55, h = r.height || H * 0.7;
    const cols = tall ? 1 : 2, rows = Math.ceil(names.length / cols), colW = w / cols, rowH = h / rows;
    const widest = Math.max(...names.map((im) => +im.getAttribute("width")));
    const k = Math.min(Math.min(rowH * 0.56, 46) / 89, (rowH * 0.9) / 159, (colW * 0.95) / widest);
    names.forEach((im, i) => {
      const c = Math.floor(i / rows), rw = i % rows, hh = +im.getAttribute("height") * k;
      im.style.setProperty("--h", hh.toFixed(1));
      im.style.setProperty("--x1", (c * colW).toFixed(1));
      im.style.setProperty("--y1", (rw * rowH + (rowH - hh) / 2).toFixed(1));
      im.style.setProperty("--dx", ((rnd(i, 1) - 0.35) * w * 0.9).toFixed(1));
      im.style.setProperty("--dy", ((rnd(i, 2) - 0.5) * h * 1.1).toFixed(1));
      const dz = lerp(-1200, 260, rnd(i, 3));
      im.style.setProperty("--dz", dz.toFixed(0));
      im.style.setProperty("--d", (i * 0.026).toFixed(3));
      im.style.setProperty("--near", dz > 0 ? "0.3" : "0");
    });
  }

  // ---------- 6 · the real tilt, carpet to ceiling: 36 frames of the show film, scrubbed ----------
  const FRAMES = 36;
  const frames = new Array(FRAMES).fill(null);
  const fcanvas = stage.querySelector("canvas.frames"), fctx = fcanvas.getContext("2d");
  let framesAsked = false, lastFrame = -1;
  function loadFrames() {
    if (framesAsked) return; framesAsked = true;
    let i = 0;
    const next = () => {
      if (i >= FRAMES) return;
      const idx = i++; const img = new Image(); img.decoding = "async";
      img.onload = () => { frames[idx] = img; if (idx === 0 || idx === wantedFrame()) { lastFrame = -1; ask(); } next(); };
      img.onerror = next;
      img.src = `assets/tilt/t-${String(idx + 1).padStart(3, "0")}.webp`;
    };
    next(); next(); next();
  }
  const doors = beats.find((b) => b.el.classList.contains("b-doors"));
  const wantedFrame = () => Math.round(clamp(((p - doors.a) / (doors.b - doors.a) - 0.1) / 0.5) * (FRAMES - 1));
  function drawFrame() {
    const fi = wantedFrame(); if (fi === lastFrame) return;
    let img = null; for (let k = fi; k >= 0 && !img; k--) img = frames[k];
    if (!img) return;
    fctx.drawImage(img, 0, 0, fcanvas.width, fcanvas.height); lastFrame = fi;
  }

  // ---------- 3, 4, 7 · the pavilion ----------
  const gl = makePavilion(stage.querySelector("canvas.gl"));
  if (!gl) stage.classList.add("no-gl");

  function measure() {
    W = stage.clientWidth; H = stage.clientHeight;
    tall = W < 768 || W / H < 1.05;
    layoutNames();
    const fr = stage.querySelector(".b-light .render img").getBoundingClientRect(), st = stage.getBoundingClientRect();
    frameBox = [fr.top - st.top, st.right - fr.right, st.bottom - fr.bottom, fr.left - st.left];
    if (fr.width > 0) Object.assign(FRAME, { cx: (fr.left - st.left + fr.width / 2) / W, cy: (fr.top - st.top + fr.height / 2) / H, h: fr.height / H });
    gl?.resize(W, H, tall);
    placeRule();
    lastFrame = -1;
  }

  // The rule. In the first beats it is a drawn line on paper; it lies exactly where the carpet will be
  // when the plan arrives under it (the carpet axis, seen from above).
  let ruleLen = 1;
  function placeRule() {
    const cam = pavilionCamera(W, H, tall, 0.22);
    const a = M(7.55, 20.5).project(cam), b = M(24.55, 3.5).project(cam);
    const ax = (a.x * 0.5 + 0.5) * W, ay = (-a.y * 0.5 + 0.5) * H, bx = (b.x * 0.5 + 0.5) * W, by = (-b.y * 0.5 + 0.5) * H;
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), e = 0.2;
    rule.setAttribute("x1", (ax - dx * e).toFixed(1)); rule.setAttribute("y1", (ay - dy * e).toFixed(1));
    rule.setAttribute("x2", (bx + dx * e).toFixed(1)); rule.setAttribute("y2", (by + dy * e).toFixed(1));
    ruleLen = L * (1 + 2 * e);
    rule.style.strokeDasharray = ruleLen.toFixed(1);
  }

  function progress() {
    if (fixed !== null) return fixed;
    const r = story.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - window.innerHeight));
  }

  function frame() {
    queued = false;
    p = progress();
    let here = 0;
    beats.forEach((b, i) => {
      const t = clamp((p - b.a) / (b.b - b.a));
      const o = (b.first ? 1 : seg(p, b.a, b.a + 0.016)) * (b.last ? 1 : 1 - seg(p, b.b - 0.016, b.b));
      b.el.style.setProperty("--t", t.toFixed(4));
      b.el.style.setProperty("--o", o.toFixed(4));
      b.el.classList.toggle("on", o > 0.001);
      b.el.classList.toggle("here", o > 0.5);
      if (p >= b.a) here = i;
    });
    ticks.forEach((li, i) => li.classList.toggle("on", i === here));

    // the rule: struck through the brief, held through the names, handed to the carpet
    const drawn = 0.56 + 0.44 * seg(p, 0.0, 0.085), held = 1 - seg(p, 0.262, 0.295);
    rule.style.strokeDashoffset = (ruleLen * (1 - drawn)).toFixed(1);
    rule.style.opacity = (drawn > 0 ? held : 0).toFixed(3);

    // paper → the hall → paper
    const dark = seg(p, 0.672, 0.702) * (1 - seg(p, 0.888, 0.915));
    stage.style.setProperty("--dark", dark.toFixed(3));
    stage.classList.toggle("dark", dark > 0.5);
    document.body.classList.toggle("on-dark", dark > 0.5 && story.getBoundingClientRect().bottom > 60);

    // the model is on stage for the plan, the height, the ceiling, and again for the strike
    const glOn = seg(p, 0.2, 0.232) * (1 - seg(p, 0.503, 0.545)) + seg(p, 0.9, 0.93);
    stage.style.setProperty("--gl", clamp(glOn).toFixed(3));
    const close = p < 0.6 ? seg(p, 0.462, 0.515) : 0;
    glCanvas.style.clipPath = close > 0 ? `inset(${frameBox.map((v) => (Math.max(0, v) * close).toFixed(1) + "px").join(" ")})` : "none";
    if (gl && glOn > 0.001) gl.render(p);

    if (p > 0.5) loadFrames();
    if (p > doors.a - 0.03 && p < doors.b + 0.03) drawFrame();
    if (p < doors.a + 0.06 || p > doors.b) stopFilm();
  }
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };

  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", () => { measure(); ask(); });
  addEventListener("orientationchange", () => { measure(); ask(); });
  addEventListener("pageshow", ask);
  document.fonts?.ready?.then(() => { measure(); ask(); });
  measure();
  if (fixed !== null) {
    const go = () => scrollTo(0, story.offsetTop + fixed * (story.offsetHeight - innerHeight));
    go(); requestAnimationFrame(go); setTimeout(go, 300);
  }
  frame();
  window.__story = { ready: () => (gl ? gl.ready() : true) && (p < 0.5 || frames[wantedFrame()] !== null), progress: () => p };
}

// =====================================================================================
// The pavilion
// =====================================================================================
// Plan coordinates are metres on the design plan: x to the right (0..28), y down (0..23). The world is centred on it.
function M(x, y, h = 0) { return new THREE.Vector3(x - 14, h, y - 11.5); }

// One camera description for every moment, shared by the WebGL view and by the drawn rule.
// Orientation and lens are keyed; distance and placement are solved so the whole stand always sits inside the
// part of the stage that the words leave free (right of the copy on wide screens, below it on tall ones).
const BOUNDS = [[0, 0, 0], [28, 0, 0], [28, 23, 0], [0, 23, 0], [9, 0, 6.6], [28, 0, 6.6], [28, 20, 6.6], [24, 20, 6.6], [9, 4.6, 6.6], [10, 18.5, 7], [19.5, 8.5, 7]];
const _v = new THREE.Vector3();
const FRAME = { cx: 0.66, cy: 0.47, h: 0.56 };   // the render's place on the stage, measured from the page
function cameraState(p) {
  const strike = p > 0.6;
  const tilt = strike ? 1 - seg(p, 0.915, 0.985) : seg(p, 0.288, 0.372);
  const orbit = strike ? 0.35 * tilt : seg(p, 0.375, 0.47);
  const down = strike ? 0 : seg(p, 0.462, 0.515);
  const A = { phi: 0.002, th: 0, fov: 30, t: [0, 0, 0] };
  const B = { phi: 0.98, th: -0.62, fov: 30, t: [1, 1.2, 0] };
  const B2 = { phi: 1.08, th: -0.8, fov: 32, t: [2, 2.4, -0.6] };
  const mix = (a, b, k) => ({ phi: lerp(a.phi, b.phi, k), th: lerp(a.th, b.th, k), fov: lerp(a.fov, b.fov, k), t: a.t.map((v, i) => lerp(v, b.t[i], k)) });
  return { s: mix(mix(A, B, tilt), B2, orbit), down };
}
function pose(cam, phi, th, r, t, fov, aspect) {
  cam.fov = fov; cam.aspect = aspect; cam.clearViewOffset();
  cam.position.set(t[0] + r * Math.sin(phi) * Math.sin(th), t[1] + r * Math.cos(phi), t[2] + r * Math.sin(phi) * Math.cos(th));
  cam.up.set(0, 1, 0); cam.lookAt(t[0], t[1], t[2]);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
}
function extent(cam) {
  let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
  for (const [x, y, h] of BOUNDS) { _v.set(x - 14, h, y - 11.5).project(cam); x0 = Math.min(x0, _v.x); x1 = Math.max(x1, _v.x); y0 = Math.min(y0, _v.y); y1 = Math.max(y1, _v.y); }
  return [x0, x1, y0, y1];
}
function pavilionCamera(W, H, tall, p, cam = new THREE.PerspectiveCamera(30, 1, 0.1, 400)) {
  const { s, down } = cameraState(p);
  const aspect = W / Math.max(1, H);
  // the free part of the stage, as fractions of it: [left, right, top, bottom]
  const safe = tall ? [0.04, 0.96, 0.4, 0.95] : [0.375, 0.975, 0.1, 0.92];
  let lo = 8, hi = 400;
  for (let i = 0; i < 22; i++) {
    const r = (lo + hi) / 2; pose(cam, s.phi, s.th, r, s.t, s.fov, aspect);
    const [x0, x1, y0, y1] = extent(cam);
    if ((x1 - x0) / 2 > safe[1] - safe[0] || (y1 - y0) / 2 > safe[3] - safe[2]) lo = r; else hi = r;
  }
  pose(cam, s.phi, s.th, hi, s.t, s.fov, aspect);
  const [x0, x1, y0, y1] = extent(cam);
  // where the stand's middle is now, and where it should be (fractions of the stage, y down)
  const offX = (safe[0] + safe[1]) / 2 - ((x0 + x1) / 4 + 0.5), offY = (safe[2] + safe[3]) / 2 - (0.5 - (y0 + y1) / 4);
  // the last move: down onto the carpet, at eye height, looking up the line to the tower
  const C = { phi: 1.6, th: -Math.PI / 4, r: 17.5, fov: (2 * Math.atan(Math.tan((46 * Math.PI) / 360) / FRAME.h) * 180) / Math.PI, t: [5.4, 2.9, -2.9], off: [FRAME.cx - 0.5, FRAME.cy - 0.5] };
  const t = s.t.map((v, i) => lerp(v, C.t[i], down));
  pose(cam, lerp(s.phi, C.phi, down), lerp(s.th, C.th, down), lerp(hi, C.r, down), t, lerp(s.fov, C.fov, down), aspect);
  cam.setViewOffset(W, H, -lerp(offX, C.off[0], down) * W, -lerp(offY, C.off[1], down) * H, W, H);
  cam.updateProjectionMatrix();
  return cam;
}

function makePavilion(canvas) {
  if (q_gl_off()) return null;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const MAROON = 0x80242a, INK = 0x0b0c10, SPHERE = 0x1bd5f1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6dfd0, 2.3));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9); sun.position.set(-16, 30, 18); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 }); scene.add(sun);

  let pending = 1, contextLost = false, lastP = 0, W = 1, H = 1, tall = false;
  const loader = new THREE.TextureLoader();
  const planTex = loader.load("assets/plan-design.webp", () => { pending--; draw(); });
  planTex.colorSpace = THREE.SRGBColorSpace; planTex.anisotropy = 8;

  // the floor: the design plan itself
  const floorMat = new THREE.MeshBasicMaterial({ map: planTex, transparent: true, opacity: 0, depthWrite: false });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 23), floorMat); floor.rotation.x = -Math.PI / 2; floor.renderOrder = 0; scene.add(floor);
  const shadowMat = new THREE.ShadowMaterial({ opacity: 0.22, transparent: true, depthWrite: false });
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(34, 29), shadowMat); shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = 0.012; shadowPlane.receiveShadow = true; shadowPlane.renderOrder = 1; scene.add(shadowPlane);

  // the grid, drawn line by line (2D animation of the plan's own square metres), and the floor's outline
  const gpos = [];
  for (let x = 0; x <= 28; x++) gpos.push(x - 14, 0.02, -11.5, x - 14, 0.02, 11.5);
  for (let y = 0; y <= 23; y++) gpos.push(-14, 0.02, y - 11.5, 14, 0.02, y - 11.5);
  const gridGeo = new THREE.BufferGeometry(); gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gpos, 3));
  const gridMat = new THREE.LineBasicMaterial({ color: MAROON, transparent: true, opacity: 0.4 });
  const grid = new THREE.LineSegments(gridGeo, gridMat); grid.renderOrder = 2; scene.add(grid);
  const outline = new THREE.Line(new THREE.BufferGeometry().setFromPoints([M(0, 0, 0.03), M(26.3, 0, 0.03), M(28, 1.75, 0.03), M(28, 23, 0.03), M(1.85, 23, 0.03), M(0, 21.25, 0.03), M(0, 0, 0.03)]),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.7 }));
  outline.renderOrder = 2; scene.add(outline);
  // the line: a maroon band on the carpet axis, until the carpet itself arrives with the plan
  const band = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 24), new THREE.MeshBasicMaterial({ color: MAROON, transparent: true, depthWrite: false }));
  band.rotation.set(-Math.PI / 2, 0, -Math.PI / 4); band.position.copy(M(16.05, 12.0, 0.04)); band.renderOrder = 3; scene.add(band);

  // volumes
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
  const maroon = new THREE.MeshStandardMaterial({ color: MAROON, roughness: 0.8 });
  const night = new THREE.MeshStandardMaterial({ color: 0x1b2442, roughness: 0.55 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xbfdbe8, roughness: 0.15, transparent: true, opacity: 0.34, depthWrite: false });
  const edgeMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.26 });
  const topMat = new THREE.MeshBasicMaterial({ map: planTex });
  const vols = [];
  function vol(cx, cy, w, d, h, mat, { base = 0, rot = 0, top = false, order = 0 } = {}) {
    const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, h / 2, 0);
    let material = mat;
    if (top) {
      // the top face carries the plan's own picture of the model that stands there
      const uv = geo.attributes.uv, pos = geo.attributes.position, c = Math.cos(rot), s = Math.sin(rot);
      for (let i = 8; i < 12; i++) { const lx = pos.getX(i), lz = pos.getZ(i); const wx = cx + lx * c + lz * s, wy = cy - lx * s + lz * c; uv.setXY(i, wx / 28, 1 - wy / 23); }
      material = [mat, mat, topMat, mat, mat, mat];
    }
    const m = new THREE.Mesh(geo, material); m.castShadow = mat !== glass; m.receiveShadow = false;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    const g = new THREE.Group(); g.add(m); g.position.copy(M(cx, cy, 0)); g.rotation.y = rot;
    g.userData = { base, order }; scene.add(g); vols.push(g); return g;
  }
  const D = -Math.PI / 4; // the diagonal
  // the seven community-market models and the four along the front, 0.8 m podiums
  [[2.3, 3.2], [2.3, 7.2], [2.3, 11.1], [6.1, 1.9], [6.1, 5.65], [6.1, 9.65], [6.1, 13.5]].forEach(([x, y], i) => vol(x, y, 1.9, 2.3, 0.8, white, { top: true, order: 0.1 + i * 0.03 }));
  [[13.35, 21.1, 1.2, 1.6], [16.55, 21.1, 1.2, 1.6], [19.65, 21.2, 1.15, 0.7], [22.35, 21.15, 1.15, 0.95]].forEach(([x, y, w, d], i) => vol(x, y, w, d, 0.8, white, { top: true, order: 0.3 + i * 0.03 }));
  vol(20.1, 7.95, 3, 3, 0.8, white, { rot: D, top: true, order: 0.45 });                 // the centre podium, Souq Al Zaafarana
  vol(8.5, 22.45, 2.6, 0.7, 1, white, { order: 0.35 });                                  // information desk
  // the wing along the back
  vol(11.45, 2.35, 1.9, 4.1, 1.1, white, { order: 0.5 });
  vol(12.95, 2.2, 0.9, 4.4, 6, maroon, { order: 0.55 });
  vol(15.9, 2.2, 4.8, 4.0, 2.9, glass, { order: 0.6 });
  vol(15.0, 2.25, 11.0, 4.1, 2.7, white, { base: 3.0, order: 0.7 });
  vol(15.0, 4.36, 10.4, 0.12, 2.0, night, { base: 3.3, order: 0.72 });                   // the skyline band
  vol(9.2, 2.4, 0.5, 4.6, 6.1, maroon, { order: 0.75 });
  // the wing along the side
  vol(26.0, 11.8, 4.0, 4.5, 2.9, glass, { order: 0.6 });
  vol(26.0, 15.0, 4.0, 1.9, 2.9, glass, { order: 0.62 });
  vol(25.9, 16.35, 4.4, 0.7, 6, maroon, { order: 0.55 });
  vol(25.9, 18.1, 4.3, 2.2, 1.1, white, { order: 0.5 });
  vol(25.95, 14.0, 4.1, 11.0, 2.7, white, { base: 3.0, order: 0.7 });
  vol(23.84, 14.0, 0.12, 10.4, 2.0, night, { base: 3.3, order: 0.72 });
  vol(25.9, 19.8, 4.6, 0.5, 6.1, maroon, { order: 0.75 });
  // the middle structure on the diagonal, and the bridge behind it
  vol(21.8, 6.25, 3.0, 1.0, 6.6, white, { rot: D, order: 0.85 });
  vol(21.41, 6.64, 1.7, 0.1, 4.6, night, { rot: D, base: 0.9, order: 0.87 });
  vol(24.45, 3.6, 2.0, 5.6, 0.35, maroon, { rot: D, order: 0.8 });

  // the ceiling of light: a truss grid over the carpet, the spheres hung from it at different heights
  const NU = 9, NV = 30, TRUSS = 6.9, RAD = 0.15;
  const S0 = [19.15, 8.9], S1 = [10.15, 17.9], acr = [Math.SQRT1_2, Math.SQRT1_2];
  const dummy = new THREE.Object3D(), sph = [];
  for (let v = 0; v < NV; v++) for (let u = 0; u < NU; u++) {
    const s = v / (NV - 1), uu = (u / (NU - 1)) * 2 - 1;
    const x = lerp(S0[0], S1[0], s) + acr[0] * uu * 1.9, y = lerp(S0[1], S1[1], s) + acr[1] * uu * 1.9;
    const drop = 0.55 + 2.3 * Math.pow(s, 1.4) * (1 - 0.55 * uu * uu) + 0.32 * Math.sin(v * 0.62 + u * 0.9);
    sph.push({ x, y, top: TRUSS - drop, s, uu });
  }
  const sphMat = new THREE.MeshStandardMaterial({ color: SPHERE, emissive: SPHERE, emissiveIntensity: 0.5, roughness: 0.35 });
  const spheres = new THREE.InstancedMesh(new THREE.SphereGeometry(RAD, 18, 14), sphMat, sph.length); spheres.castShadow = true; spheres.frustumCulled = false; scene.add(spheres);
  const strGeo = new THREE.BufferGeometry(); const strPos = new Float32Array(sph.length * 6); strGeo.setAttribute("position", new THREE.BufferAttribute(strPos, 3));
  const strMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.3 });
  const strings = new THREE.LineSegments(strGeo, strMat); strings.frustumCulled = false; scene.add(strings);
  const tpos = [];
  for (let u = 0; u <= NU; u++) { const uu = ((u - 0.5) / (NU - 1)) * 2 - 1; const a = [S0[0] + acr[0] * uu * 1.9 + 0.3, S0[1] + acr[1] * uu * 1.9 - 0.3], b = [S1[0] + acr[0] * uu * 1.9 - 0.3, S1[1] + acr[1] * uu * 1.9 + 0.3]; tpos.push(a[0] - 14, TRUSS, a[1] - 11.5, b[0] - 14, TRUSS, b[1] - 11.5); }
  for (let v = 0; v <= NV; v += 2) { const s = (v - 0.5) / (NV - 1); const cx = lerp(S0[0], S1[0], s), cy = lerp(S0[1], S1[1], s); tpos.push(cx - acr[0] * 2.15 - 14, TRUSS, cy - acr[1] * 2.15 - 11.5, cx + acr[0] * 2.15 - 14, TRUSS, cy + acr[1] * 2.15 - 11.5); }
  const trussMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 });
  const truss = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(tpos, 3)), trussMat); scene.add(truss);

  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); contextLost = true; });
  canvas.addEventListener("webglcontextrestored", () => { contextLost = false; draw(); });

  function compose(p) {
    const strike = p > 0.6;
    const gridIn = strike ? 1 : seg(p, 0.215, 0.268);
    const planIn = strike ? 1 - seg(p, 0.955, 0.995) : seg(p, 0.262, 0.3);
    const rise = strike ? 1 - seg(p, 0.905, 0.965) : seg(p, 0.298, 0.385);
    const hang = strike ? 1 - seg(p, 0.9, 0.95) : seg(p, 0.385, 0.472);

    floorMat.opacity = planIn;
    grid.geometry.setDrawRange(0, Math.floor((gpos.length / 6) * gridIn) * 2);
    gridMat.opacity = 0.4 * (1 - 0.85 * planIn);
    outline.material.opacity = 0.7 * gridIn * (1 - 0.6 * planIn); outline.visible = gridIn > 0;
    band.material.opacity = 1 - planIn; band.visible = planIn < 0.999;
    shadowMat.opacity = 0.22 * rise;

    for (const g of vols) {
      const { base, order } = g.userData;
      const k = smooth(clamp((rise - order * 0.55) / 0.45));
      g.visible = k > 0.002; g.scale.y = Math.max(0.002, k); g.position.y = base * k;
    }
    edgeMat.opacity = 0.26 * rise;

    const on = hang > 0.002;
    spheres.visible = strings.visible = truss.visible = on;
    if (on) {
      for (let i = 0; i < sph.length; i++) {
        const b = sph[i]; const k = smooth(clamp((hang - b.s * 0.5) / 0.5));
        const y = lerp(RAD + 0.02, b.top, k);
        dummy.position.set(b.x - 14, y, b.y - 11.5); dummy.scale.setScalar(lerp(0.55, 1, k)); dummy.updateMatrix(); spheres.setMatrixAt(i, dummy.matrix);
        strPos[i * 6] = strPos[i * 6 + 3] = b.x - 14; strPos[i * 6 + 2] = strPos[i * 6 + 5] = b.y - 11.5;
        strPos[i * 6 + 1] = lerp(y, TRUSS, k > 0.02 ? 1 : 0); strPos[i * 6 + 4] = y + RAD;
      }
      spheres.instanceMatrix.needsUpdate = true; strGeo.attributes.position.needsUpdate = true;
      trussMat.opacity = 0.55 * seg(hang, 0.05, 0.4); strMat.opacity = 0.3 * seg(hang, 0.1, 0.5);
    }
    pavilionCamera(W, H, tall, p, camera);
  }
  function draw() { if (contextLost) return; compose(lastP); renderer.render(scene, camera); }

  return {
    resize(w, h, t) { W = w; H = h; tall = t; renderer.setSize(w, h, false); draw(); },
    render(p) { lastP = p; draw(); },
    ready: () => pending <= 0,
  };
}
function q_gl_off() { return q.get("gl") === "off"; }

if (motionMode() === "full") initLive();
