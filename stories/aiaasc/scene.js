// AIAASC, 2020 to 2022 — the scroll story, in four pinned chapters.
// Every pose is a pure function of scroll position: no timers, no easing over time, no scroll hijack.
// The rule is the mark's own rising line: things arrive from the lower left towards the upper right, and every change
// of ground sweeps up the same way. Whole films load and play only when the visitor presses Play; the short clips are
// silent and run only while their beat is on screen.
//
// For every beat the script sets a few numbers, and the stylesheet does the rest:
//   --n  0..1 while the beat arrives      --q  0..1 while it holds      --x  0..1 while it leaves      --e  --q, eased

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const root = document.documentElement;
const story = $("#story");
const ENTER = 28;                                   // vh of travel between two beats
const chapters = $$(".chapter", story).map((el) => {
  const beats = $$(".beat", el).map((b) => ({ el: b, id: b.dataset.beat, dwell: +b.dataset.dwell || 100, bloom: b.hasAttribute("data-bloom"), tone: b.dataset.tone || "light" }));
  let t = 0;
  beats.forEach((b, i) => { b.enter = i ? ENTER : 0; t += b.enter; b.a = t; t += b.dwell; b.b = t; });
  beats.forEach((b, i) => { b.a /= t; b.b /= t; b.g = b.enter / t; b.next = beats[i + 1] || null; b.prev = beats[i - 1] || null; b.n = i ? 0 : 1; b.q = 0; b.x = 0; b.o = i ? 0 : 1; b.on = false; });
  el.style.setProperty("--travel", `${t}vh`);
  if (el.dataset.ground) $(".pin", el).style.setProperty("--ground", el.dataset.ground);
  return { el, pin: $(".pin", el), beats, num: +el.dataset.chapter, title: el.dataset.title, p: 0, near: false, pinned: false };
});
const B = Object.fromEntries(chapters.flatMap((c) => c.beats.map((b) => [b.id, b])));
const ALL = chapters.flatMap((c) => c.beats);
const heads = $$(".ch-head", story);
const ROMAN = ["", "I", "II", "III", "IV", "V"];
const threadLabel = $(".thread-label", story), threadMark = $(".thread-mark", story), bar = $(".bar i", story);

const hero = $(".hero", story), glCanvas = $("canvas.gl", story), flat = $(".flat", story), seqCanvas = $("canvas.seq", story), kitStar = $(".kit-star", story);
const newLetters = $$(".fullname b.new", story), kitPages = $$(".kit .kp", story);

let W = 0, H = 0, wide = true, live = false, mounted = false, L = null, seq = null, paths = null, pose = null, K0 = 1;
const parts = {}, frames = [], asked = {}; let drawn = -1, wantF = 0;

// ───────── motion preference ─────────
const KEY = "az-motion";
const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
const params = new URLSearchParams(location.search);
function motionMode() {
  if (params.get("motion") === "off") return "off";
  let s = null; try { s = localStorage.getItem(KEY); } catch {}
  if (s === "off" || s === "full") return s;
  return mq.matches ? "off" : "full";
}
const toggle = $("[data-motion-toggle]");
toggle?.addEventListener("click", () => {
  const next = motionMode() === "off" ? "full" : "off";
  try { localStorage.setItem(KEY, next); } catch {}
  params.delete("motion");
  applyMode();
});
mq.addEventListener?.("change", applyMode);
function applyMode() {
  const m = motionMode();
  root.dataset.motion = m;
  if (toggle) { toggle.textContent = m === "off" ? "Motion off" : "Motion on"; toggle.setAttribute("aria-pressed", m === "off" ? "true" : "false"); }
  if (m === "full") { root.classList.add("live"); live = true; mount(); }
  else { root.classList.remove("live"); live = false; stopFilms(); pauseClips(); clearPoses(); root.dataset.ground = "dark"; }
  requestAnimationFrame(() => { measure(); update(); });
}

// ───────── the mark: one SVG layer per piece of the delivered file ─────────
async function build() {
  const [svgText, layout, seqInfo, markPaths] = await Promise.all([
    fetch("assets/mark.svg").then((r) => r.text()), fetch("assets/mark-layout.json").then((r) => r.json()),
    fetch("assets/seq.json").then((r) => r.json()), fetch("assets/mark-paths.json").then((r) => r.json()),
  ]);
  L = layout; seq = seqInfo; paths = markPaths;
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const [vx, vy, vw, vh] = L.viewBox, NS = "http://www.w3.org/2000/svg";
  for (const g of doc.querySelectorAll("svg > g")) {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`); s.dataset.id = g.id;
    const inner = document.createElementNS(NS, "g"); inner.setAttribute("fill", g.getAttribute("fill")); inner.innerHTML = g.innerHTML;
    if (g.id === "swoosh") {                                         // the line is uncovered along its own direction, lower left to upper right
      const defs = document.createElementNS(NS, "defs"), cp = document.createElementNS(NS, "clipPath"), poly = document.createElementNS(NS, "polygon");
      cp.id = "rise"; cp.appendChild(poly); defs.appendChild(cp); s.appendChild(defs); inner.setAttribute("clip-path", "url(#rise)");
      parts.swooshClip = poly;
    }
    s.appendChild(inner); hero.appendChild(s);
    parts[g.id] = { svg: s, g: inner };
  }
  const sb = paths.star.bbox, starSvg = (el) => { el.setAttribute("viewBox", `${sb[0] - 0.4} ${sb[1] - 0.4} ${sb[2] - sb[0] + 0.8} ${sb[3] - sb[1] + 0.8}`); el.innerHTML = `<path d="${paths.star.d}" fill="${paths.star.fill}"/>`; };
  starSvg(threadMark); starSvg(kitStar);
  B.ending.el.style.setProperty("--g", seq.ground);                  // the film's own navy, so no edge shows
}

// a change of ground sweeps up the rising line: a front that runs from the lower-left corner to the upper-right one
function sweepPath(t) {
  const s = 2 * t, px = (v) => v.toFixed(1) + "px";
  return s <= 1
    ? `polygon(0px ${px(H)}, ${px(s * W)} ${px(H)}, 0px ${px(H - s * H)})`
    : `polygon(0px ${px(H)}, ${px(W)} ${px(H)}, ${px(W)} ${px(H - (s - 1) * H)}, ${px((s - 1) * W)} 0px, 0px 0px)`;
}

// ───────── frames of the film's ending ─────────
function loadFrames() {
  if (asked.frames || !seq) return;
  asked.frames = true;
  let i = 0, inFlight = 0;
  const next = () => {
    while (inFlight < 4 && i < seq.n) {
      const idx = i++; inFlight++;
      const img = new Image(); img.decoding = "async";
      img.onload = img.onerror = () => { if (img.naturalWidth) frames[idx] = img; inFlight--; drawn = -1; schedule(); next(); };
      img.src = `assets/seq-ending/f-${String(idx + 1).padStart(3, "0")}.webp`;
    }
  };
  next();
}
function drawFrame(want) {
  wantF = want;
  if (want === drawn) return;
  let img = null; for (let k = want; k >= 0 && !img; k--) img = frames[k] || null;
  if (!img) return;
  seqCanvas.getContext("2d").drawImage(img, 0, 0, seqCanvas.width, seqCanvas.height);
  drawn = want;
}

// ───────── the letter A as a tunnel, the star at its end: real 3D from the mark's own paths ─────────
const gl = { state: "idle" };
const TUNNEL = { count: 9, gap: 74, height: 100 };
function shapeFrom(THREE, d, cx, base, k) {
  const shape = new THREE.Shape(), tok = d.match(/[MLCZ]|-?\d*\.?\d+/g); let i = 0, cmd = "";
  const X = (v) => (+v - cx) * k, Y = (v) => (base - +v) * k;
  while (i < tok.length) {
    if (/[MLCZ]/.test(tok[i])) cmd = tok[i++];
    if (cmd === "Z") { shape.closePath(); continue; }
    if (cmd === "M") { shape.moveTo(X(tok[i]), Y(tok[i + 1])); i += 2; cmd = "L"; }
    else if (cmd === "L") { shape.lineTo(X(tok[i]), Y(tok[i + 1])); i += 2; }
    else if (cmd === "C") { shape.bezierCurveTo(X(tok[i]), Y(tok[i + 1]), X(tok[i + 2]), Y(tok[i + 3]), X(tok[i + 4]), Y(tok[i + 5])); i += 6; }
  }
  return shape;
}
async function mount3D() {
  if (gl.state !== "idle") return;
  gl.state = "loading";
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");
    const THREE = await import("./vendor/three.module.min.js");
    const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x07080f, 160, 820);
    const camera = new THREE.PerspectiveCamera(52, 1, 1, 3000);
    const ab = paths.a.bbox, k = TUNNEL.height / (ab[3] - ab[1]);
    const aShape = shapeFrom(THREE, paths.a.d, (ab[0] + ab[2]) / 2, ab[3], k);
    const aGeo = new THREE.ExtrudeGeometry(aShape, { depth: 7, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.5, bevelSegments: 2, curveSegments: 24 });
    const navy = new THREE.Color(paths.a.fill);
    const face = new THREE.MeshStandardMaterial({ color: navy, emissive: navy, emissiveIntensity: 0.55, roughness: 0.7, metalness: 0 });   // the letter keeps the mark's navy even where no light reaches
    const side = new THREE.MeshStandardMaterial({ color: new THREE.Color("#8f9af0"), emissive: navy, emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.1 });
    const end = -(TUNNEL.count - 1) * TUNNEL.gap;
    for (let i = 0; i < TUNNEL.count; i++) { const m = new THREE.Mesh(aGeo, [face, side]); m.position.z = -i * TUNNEL.gap; scene.add(m); }
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 1800), new THREE.MeshBasicMaterial({ color: 0x0d1030 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.2, end / 2); scene.add(floor);
    const sb = paths.star.bbox, sk = 34 / (sb[2] - sb[0]);
    const starGeo = new THREE.ShapeGeometry(shapeFrom(THREE, paths.star.d, (sb[0] + sb[2]) / 2, (sb[1] + sb[3]) / 2, sk), 4);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
    const star = new THREE.Mesh(starGeo, starMat); star.position.set(10, 62, end - 120); scene.add(star);
    const gc = document.createElement("canvas"); gc.width = gc.height = 256;
    const g2 = gc.getContext("2d"), grad = g2.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(255,255,255,.95)"); grad.addColorStop(0.18, "rgba(190,205,255,.5)"); grad.addColorStop(0.5, "rgba(90,110,255,.16)"); grad.addColorStop(1, "rgba(60,80,255,0)");
    g2.fillStyle = grad; g2.fillRect(0, 0, 256, 256);
    const glowMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
    const glow = new THREE.Sprite(glowMat); glow.scale.set(190, 190, 1); glow.position.copy(star.position); scene.add(glow);
    const light = new THREE.PointLight(0xcfd8ff, 1.5, 0, 0); light.position.copy(star.position); scene.add(light);
    scene.add(new THREE.AmbientLight(0x6f78d8, 0.7));
    const lamp = new THREE.PointLight(0xffffff, 1.3, 0, 0); scene.add(lamp);                       // travels with the eye, so the letter ahead is always lit
    glCanvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); gl.lost = true; });
    glCanvas.addEventListener("webglcontextrestored", () => { gl.lost = false; gl.sized = false; schedule(); });
    Object.assign(gl, { state: "ready", renderer, scene, camera, star, starMat, glow, glowMat, lamp, end, sized: false, white: new THREE.Color(0xffffff), red: new THREE.Color(paths.star.fill) });
    schedule();
  } catch (e) {
    gl.state = "failed"; story.classList.add("no-gl"); schedule();
  }
}
function draw3D(t, sx) {
  if (gl.state !== "ready" || gl.lost) return;
  const { renderer, scene, camera, star, starMat, glow, glowMat, end } = gl;
  if (!gl.sized) { renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W, H, false); camera.aspect = W / H; gl.sized = true; }
  camera.fov = wide ? 52 : 74;
  const z = lerp(235, end - 46, smooth(t));
  camera.position.set(lerp(9, 4, t), lerp(17, 19, t), z);
  camera.lookAt(star.position.x * lerp(0.1, 1, t), lerp(40, star.position.y, t), end - 120);
  gl.lamp.position.set(camera.position.x + 30, camera.position.y + 40, z + 60);
  camera.setViewOffset(W, H, W / 2 - sx, 0, W, H);                  // the vanishing point sits over the work's side of the stage
  camera.updateProjectionMatrix();
  const turn = seg(t, 0.8, 1);                                       // at the end the light becomes the mark's red star
  starMat.color.copy(gl.white).lerp(gl.red, turn);
  glowMat.opacity = 1 - 0.55 * turn;
  star.scale.setScalar(lerp(1, 1.5, turn)); glow.scale.setScalar(lerp(190, 130, turn));
  renderer.render(scene, camera);
}

// ───────── films (only on Play) and silent clips (only while their beat is on screen) ─────────
const films = $$("[data-film]", story).map((el) => ({ el, name: el.dataset.film, beat: B[el.closest(".beat").dataset.beat], btn: $(".play", el), video: $("video.full", el), clip: $("video.clip", el), playing: false })).filter((f) => f.btn && f.video);
function stopFilm(f) {
  if (!f.playing) return;
  f.playing = false; f.video.pause(); f.el.classList.remove("playing");
  f.btn.textContent = f.btn.dataset.label; f.btn.setAttribute("aria-pressed", "false");
}
function stopFilms() { films.forEach(stopFilm); }
for (const f of films) {
  f.btn.addEventListener("click", () => {
    if (f.playing) { stopFilm(f); return; }
    stopFilms();
    if (!f.video.getAttribute("src")) f.video.src = f.video.dataset.src;
    f.playing = true; f.el.classList.add("playing"); f.btn.textContent = "Stop"; f.btn.setAttribute("aria-pressed", "true");
    f.clip?.pause();
    f.video.play().catch(() => stopFilm(f));
  });
  f.video.addEventListener("ended", () => stopFilm(f));
}
const clips = $$("video.clip", story).map((el) => ({ el, beat: B[el.closest(".beat").dataset.beat], film: films.find((f) => f.clip === el) || null, wanted: false }));
function setClip(c, play) {
  if (play && !c.el.getAttribute("src")) { c.el.src = c.el.dataset.src; c.el.load(); }
  if (play === c.wanted) return;
  c.wanted = play;
  if (play) c.el.play().catch(() => {}); else c.el.pause();
}
function pauseClips() { clips.forEach((c) => setClip(c, false)); }
document.addEventListener("visibilitychange", () => { if (document.hidden) { stopFilms(); pauseClips(); } else schedule(); });

// ───────── sizes that depend only on the window ─────────
const bez = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
function measure() {
  W = window.innerWidth; H = chapters[0].pin.clientHeight || window.innerHeight;
  wide = W >= 768 && W / H >= 1.05;
  if (!L) return;
  const g = clamp(W * 0.04, 18, 64);
  const work = wide ? [W * 0.42, W - g] : [g, W - g], cx = (work[0] + work[1]) / 2, cy = wide ? H * 0.46 : H * 0.62;
  // the mark
  const lock = L.lockup, lw = lock[2] - lock[0], lh = lock[3] - lock[1];
  const k = wide ? Math.min((work[1] - work[0]) * 0.94 / lw, H * 0.46 / lh) : (W - 2 * g) / lw;
  K0 = k;
  const [vx, vy, vw, vh] = L.viewBox, lc = [(lock[0] + lock[2]) / 2, (lock[1] + lock[3]) / 2];
  for (const id in parts) {
    if (!parts[id].svg) continue;
    const s = parts[id].svg.style;
    s.width = `${vw * K0}px`; s.height = `${vh * K0}px`; s.left = `${-(lc[0] - vx) * K0}px`; s.top = `${-(lc[1] - vy) * K0}px`;
  }
  // the toolkit's pages, the trail of the star
  const kw = wide ? Math.min(W * 0.27, 440) : Math.min(W * 0.62, 440);
  kitPages.forEach((el) => { el.style.width = `${kw}px`; });
  const arc = wide ? [[W * 0.56, H * 0.8], [W * 0.6, H * 0.3], [W * 0.925, H * 0.15]] : [[W * 0.42, H * 0.8], [W * 0.46, H * 0.5], [W * 0.88, H * 0.43]];
  // the film's frame, whole
  const fw = wide ? Math.max(W, H * 16 / 9 * 0.9) : W, fh = fw * 9 / 16;
  const filmAt = wide ? [(W - fw) / 2, (H - fh) / 2] : [0, H * 0.46];
  pose = { g, work, cx, cy, k, lh, kw, kh: kw * 311 / 440, arc, fw, fh, filmAt };
  for (const s of $$("[data-strip]", story)) {
    const holder = s.parentElement, hw = holder.clientWidth;
    s._start = wide ? hw * 0.03 : 0; s._end = Math.min(s._start, hw - g - s.scrollWidth);
  }
  gl.sized = false; drawn = -1;
}

// ───────── the composition ─────────
function beatNumbers(c) {
  for (const b of c.beats) {
    b.n = b.prev ? clamp((c.p - (b.a - b.g)) / b.g) : 1;
    b.q = clamp((c.p - b.a) / (b.b - b.a));
    b.x = b.next ? clamp((c.p - b.b) / b.next.g) : 0;
  }
  for (const b of c.beats) {
    const covered = b.next && b.next.n >= 1;
    b.on = b.n > 0 && !covered;
    // pictures cross-fade; words take turns; the ground never lets the page show through
    let oin = 1, oout = 1, cin = 1, cout = 1, go = 1;
    if (b.prev) {
      if (b.bloom) cin = seg(b.n, 0.6, 1);
      else { oin = seg(b.n, 0.3, 0.9); cin = seg(b.n, 0.6, 1); go = smooth(b.n); }
    }
    if (b.next && !b.next.bloom) { oout = 1 - seg(b.x, 0.1, 0.7); cout = 1 - seg(b.x, 0, 0.45); }
    b.o = oin * oout;
    const s = b.el.style;
    s.setProperty("--n", b.n.toFixed(4)); s.setProperty("--q", b.q.toFixed(4)); s.setProperty("--x", b.x.toFixed(4));
    s.setProperty("--e", smooth(b.q).toFixed(4));
    s.setProperty("--o", b.o.toFixed(3)); s.setProperty("--c", (cin * cout).toFixed(3)); s.setProperty("--c-in", cin.toFixed(3)); s.setProperty("--go", go.toFixed(3));
    b.el.classList.toggle("on", b.on);
    if (b.bloom) s.clipPath = b.n >= 1 || b.n <= 0 ? "none" : sweepPath(b.n);
  }
}

function rise(id, t, dx, dy, o = t) {                                // arrive along the rising line: from the lower left, by (dx, dy) points
  const part = parts[id];
  part.g.setAttribute("transform", `translate(${(dx * (1 - t)).toFixed(3)} ${(dy * (1 - t)).toFixed(3)})`);
  part.svg.style.opacity = o.toFixed(3);
}

function renderPosition() {
  const b = B.name;
  if (b.on) { const red = seg(b.q, 0.3, 0.62).toFixed(3); newLetters.forEach((el) => el.style.setProperty("--red", red)); }
}

function renderMark() {
  const Q = pose, a = B.alpha, m = B.mark, kit = B.kit;
  // through the letter to the star, then the three plates
  if (a.on) {
    if (gl.state === "idle") mount3D();
    const fly = clamp((a.q - 0.02) / 0.6), away = seg(a.q, 0.62, 0.72);
    glCanvas.style.opacity = (1 - away).toFixed(3);
    if (away < 1) draw3D(fly, wide ? W * 0.66 : W * 0.5);
    if (gl.state === "failed") {
      const fwid = wide ? (Q.work[1] - Q.work[0]) : W - 2 * Q.g;
      flat.style.width = `${fwid}px`; flat.style.opacity = (1 - away).toFixed(3);
      flat.style.transform = `translate(${(wide ? Q.work[0] : Q.g).toFixed(1)}px, ${((wide ? H * 0.5 : H * 0.66) - fwid * 893 / 3200).toFixed(1)}px)`;
    }
  }
  // the mark: four letters, the line, the star, then S and C, then the whole name
  if (m.on) {
    const up = seg(m.q, 0.74, 0.88), s = lerp(1, wide ? 0.5 : 0.9, up);
    const hx = wide ? lerp(Q.cx, Q.work[0] + (Q.work[1] - Q.work[0]) * 0.26, up) : Q.cx, hy = wide ? Q.cy + up * H * 0.04 : Q.cy - up * H * 0.12;
    hero.style.transform = `translate3d(${hx.toFixed(2)}px, ${hy.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    ["letter-a1", "letter-i", "letter-a2", "letter-a3"].forEach((id, i) => rise(id, seg(m.q, 0.03 + i * 0.05, 0.13 + i * 0.05), -7, 9));
    const sw = seg(m.q, 0.27, 0.41), b = L.boxes.swoosh, bw = b[2] - b[0], bh = b[3] - b[1], t2 = 2 * sw, mg = 2;
    const x0 = b[0] - mg, y1 = b[3] + mg, ww = bw + 2 * mg, hh = bh + 2 * mg;
    parts.swooshClip.setAttribute("points", t2 <= 1
      ? `${x0},${y1} ${x0 + t2 * ww},${y1} ${x0},${y1 - t2 * hh}`
      : `${x0},${y1} ${x0 + ww},${y1} ${x0 + ww},${y1 - (t2 - 1) * hh} ${x0 + (t2 - 1) * ww},${y1 - hh} ${x0},${y1 - hh}`);
    parts.swoosh.svg.style.opacity = sw > 0 ? "1" : "0";
    rise("star", seg(m.q, 0.38, 0.48), -9, 7);
    rise("letter-s", seg(m.q, 0.46, 0.56), 12, 0);
    rise("letter-c", seg(m.q, 0.5, 0.6), 12, 0);
    rise("strap-1", seg(m.q, 0.58, 0.66), -3, 3);
    rise("strap-2", seg(m.q, 0.62, 0.7), -3, 3);
  }
  // the toolkit: its pages come up the rising line and go into the star
  if (kit.on) {
    if (!asked.kit) { asked.kit = true; for (const el of kitPages) $("img", el).loading = "eager"; }
    const V = wide ? 12 : 9, f = lerp(-3, kitPages.length - V + 4, clamp((kit.q - 0.02) / 0.94)), here = clamp(kit.n * 3 - 2);
    kitPages.forEach((el, i) => {
      const u = (i - f) / V;
      if (u < -0.12 || u > 1.05) { el.style.opacity = "0"; el.style.display = "none"; return; }
      const uu = clamp(u), e = Math.pow(uu, 0.85), [x, y] = bez(Q.arc[0], Q.arc[1], Q.arc[2], e), s = lerp(1, 0.13, Math.pow(uu, 0.9));
      const o = clamp((u + 0.12) / 0.12) * clamp((1.02 - u) / 0.1) * here;
      el.style.opacity = o.toFixed(3); el.style.display = o > 0.004 ? "" : "none"; el.style.zIndex = String(500 - i);   // never its own visibility: a visible child would show through a hidden beat
      el.style.transform = `translate3d(${(x - Q.kw * s / 2 - 60 * clamp(-u / 0.12)).toFixed(1)}px, ${(y - Q.kh * s / 2 + 50 * clamp(-u / 0.12)).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
    });
    const ss = wide ? 46 : 34;
    kitStar.style.width = kitStar.style.height = `${ss}px`;
    kitStar.style.transform = `translate(${(Q.arc[2][0] - ss / 2 + 14).toFixed(1)}px, ${(Q.arc[2][1] - ss / 2 - 16).toFixed(1)}px)`;
    kitStar.style.opacity = here.toFixed(3);
  }
}

function renderInUse() {
  const Q = pose, e = B.ending;
  if (B.films.n > 0 || e.n > 0) loadFrames();
  if (e.on) {
    seqCanvas.style.transform = `translate(${Q.filmAt[0].toFixed(1)}px, ${Q.filmAt[1].toFixed(1)}px) scale(${(Q.fw / 960).toFixed(5)})`;
    drawFrame(Math.round(clamp((e.q - 0.04) / 0.86) * (seq.n - 1)));
  }
}

function renderStrips(c) {
  for (const b of c.beats) {
    if (!b.on) continue;
    for (const s of $$("[data-strip]", b.el)) {
      const t = seg(b.q, 0.06, 0.94) * 0.5 + clamp((b.q - 0.06) / 0.88) * 0.5;
      s.style.transform = `translate3d(${lerp(s._start ?? 0, s._end ?? 0, t).toFixed(1)}px, 0, 0)`;
    }
  }
}
function renderClips() {
  for (const c of clips) setClip(c, live && !document.hidden && c.beat.on && c.beat.o > 0.5 && c.beat.n > 0.6 && !films.some((f) => f.playing && f.beat === c.beat));   // while a film plays, nothing else in its beat moves
  for (const f of films) if (f.playing && (!f.beat.on || f.beat.o < 0.5)) stopFilm(f);
}

function render() {
  if (!live || !L || !pose) return;
  for (const c of chapters) {
    const r = c.el.getBoundingClientRect();
    c.near = r.top < H * 1.5 && r.bottom > -H * 0.5;
    c.pinned = r.top <= 0 && r.bottom >= H;
    c.p = clamp(-r.top / Math.max(1, r.height - H));
    if (!c.near) { c.beats.forEach((b) => { if (b.on) { b.on = false; b.el.classList.remove("on"); } }); continue; }
    beatNumbers(c);
    if (c.num === 1) renderPosition();
    if (c.num === 2) renderMark();
    if (c.num === 3) renderInUse();
    renderStrips(c);
  }
  renderClips();
  thread();
}

function thread() {
  const sr = story.getBoundingClientRect();
  root.style.setProperty("--thread", sr.top < H * 0.5 && sr.bottom > H * 0.6 ? "1" : "0");
  root.style.setProperty("--thread-label", chapters.some((c) => c.pinned) ? "1" : "0");
  bar.style.transform = `scaleX(${clamp(-sr.top / Math.max(1, sr.height - H)).toFixed(4)})`;
  let tone = "dark", label = null;
  if (sr.bottom < 70) tone = "paper";
  else {
    for (const h of heads) { const r = h.getBoundingClientRect(); if (r.top <= 40 && r.bottom > 40) tone = h.classList.contains("on-dark") ? "dark" : "light"; }
    for (const c of chapters) {
      const r = c.el.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40) {
        let top = c.beats[0];
        for (const b of c.beats) if (b.n > (b.bloom ? 0.78 : 0.5)) top = b;
        tone = top.tone;
        label = { c, i: ALL.indexOf(top) + 1 };
      }
    }
  }
  root.dataset.ground = tone;
  if (label) threadLabel.innerHTML = `<b>${ROMAN[label.c.num]}</b> <span>${label.c.title}</span> <i>${label.i} / ${ALL.length}</i>`;
}

function clearPoses() {
  for (const b of ALL) { b.el.classList.remove("on"); b.el.style.clipPath = ""; for (const v of ["--n", "--q", "--x", "--e", "--o", "--c", "--c-in", "--go"]) b.el.style.removeProperty(v); }
  for (const s of $$("[data-strip]", story)) s.style.transform = "";
  for (const el of kitPages) el.style.cssText = "";
  newLetters.forEach((el) => el.style.removeProperty("--red"));
}

// ───────── scroll ─────────
let queued = false;
function update() {
  queued = false;
  if (!live) { root.dataset.ground = story.getBoundingClientRect().bottom < 70 ? "paper" : window.scrollY < 40 ? "dark" : "light"; return; }
  render();
}
function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", () => { measure(); update(); });
window.addEventListener("orientationchange", () => { measure(); update(); });
window.addEventListener("pageshow", schedule);

async function mount() {
  if (mounted) return;
  mounted = true;
  for (const img of $$("img[data-src]", story)) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
  try { await build(); } catch (e) { root.classList.remove("live"); live = false; return; }   // no vectors, no pinned story: the plain page stays
  measure(); update();
  document.fonts?.ready.then(() => { measure(); update(); });
  window.addEventListener("load", () => { measure(); update(); });
  // ?p=0.5 opens the whole story at that progress; ?beat=mark opens at the middle of a beat; &q=0.9 near its end
  const jump = parseFloat(params.get("p")), at = params.get("beat"), bq = parseFloat(params.get("q"));
  requestAnimationFrame(() => {
    if (at && B[at]) {
      const c = chapters.find((ch) => ch.beats.includes(B[at])), b = B[at];
      const local = lerp(b.a, b.b, Number.isNaN(bq) ? 0.5 : bq);
      window.scrollTo(0, c.el.getBoundingClientRect().top + window.scrollY + local * (c.el.offsetHeight - H));
    } else if (!Number.isNaN(jump)) {
      window.scrollTo(0, story.getBoundingClientRect().top + window.scrollY + clamp(jump) * (story.offsetHeight - H));
    }
    update();
  });
}

applyMode();
