// National Bullying Prevention Week, 2018 — the scroll story, in four pinned chapters.
// Every pose is a pure function of scroll position: no timers, no easing over time, no scroll hijack.
// Scrolling back replays the same poses in reverse. Whole films load and play only when the visitor presses Play;
// the short clips are silent and run only while their beat is on screen.
//
// The rule, from the artwork: everything grows from the hands. Pictures enter from their base, as the leaves do in the
// campaign's own animation, and each change of ground opens as a leaf (the outline of the mark's middle leaf).
//
// For every beat the script sets four numbers, and the stylesheet does the rest:
//   --n  0..1 while the beat arrives      --q  0..1 while it holds      --x  0..1 while it leaves      --e  --q, eased

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const track = (p, keys) => {                       // keys: [[p, value], …] ascending; smooth between neighbours
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (p <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], seg(p, keys[i - 1][0], keys[i][0]));
  return keys[keys.length - 1][1];
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const root = document.documentElement;
const story = $("#story");
const ENTER = 28;                                   // vh of travel between two beats
const chapters = $$(".chapter", story).map((el) => {
  const beats = $$(".beat", el).map((b) => ({ el: b, id: b.dataset.beat, dwell: +b.dataset.dwell || 100, bloom: b.hasAttribute("data-bloom"), tone: b.dataset.tone || "light", copy: $(".copy", b) }));
  let t = 0;
  beats.forEach((b, i) => { b.enter = i ? ENTER : 0; t += b.enter; b.a = t; t += b.dwell; b.b = t; });
  beats.forEach((b, i) => { b.a /= t; b.b /= t; b.g = b.enter / t; b.next = beats[i + 1] || null; b.prev = beats[i - 1] || null; b.n = i ? 0 : 1; b.q = 0; b.x = 0; b.on = false; });
  el.style.setProperty("--travel", `${t}vh`);
  return { el, pin: $(".pin", el), beats, num: +el.dataset.chapter, title: el.dataset.title, p: 0, near: false, pinned: false };
});
const B = Object.fromEntries(chapters.flatMap((c) => c.beats.map((b) => [b.id, b])));
const ALL = chapters.flatMap((c) => c.beats);
const heads = $$(".ch-head", story);
const ROMAN = ["", "I", "II", "III", "IV"];
const threadLabel = $(".thread-label", story), bar = $(".bar i", story);

let W = 0, H = 0, wide = true, live = false, mounted = false, L = null, seq = null, pose = null;

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
  else { root.classList.remove("live"); live = false; stopFilms(); pauseClips(); clearPoses(); root.dataset.ground = "light"; }
  requestAnimationFrame(() => { measure(); update(true); });
}

// ───────── chapter I: the mark, one SVG layer per delivered piece ─────────
const ch1 = chapters[0];
const hero = $(".hero", ch1.el), tilt = $(".hero-tilt", ch1.el), chips = $(".chips", ch1.el);
const pieces = [];
const ORDER = { l4: 0, l3: 1, l5: 1, l2: 2, l6: 2, l1: 3, l7: 3 };           // the leaves open from the centre outward
let K0 = 1;
async function buildHero() {
  const [svgText, layout, seqInfo] = await Promise.all([
    fetch("assets/mark.svg").then((r) => r.text()),
    fetch("assets/mark-layout.json").then((r) => r.json()),
    fetch("assets/seq.json").then((r) => r.json()),
  ]);
  L = layout; seq = seqInfo;
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const [vx, vy, vw, vh] = L.viewBox;
  const NS = "http://www.w3.org/2000/svg";
  for (const g of doc.querySelectorAll("svg > g")) {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`); s.setAttribute("class", "piece"); s.dataset.id = g.id;
    const inner = document.createElementNS(NS, "g");
    inner.setAttribute("fill", g.getAttribute("fill"));
    inner.innerHTML = g.innerHTML;
    s.appendChild(inner); tilt.appendChild(s);
    const leaf = L.leaves.find((l) => l.id === g.id);
    pieces.push({ id: g.id, svg: s, inner, kind: leaf ? "leaf" : g.id.startsWith("fig") ? "fig" : "name", leaf, order: leaf ? ORDER[g.id] : 0 });
  }
  // the grounds that come from the film are the film's own colours, so no edge shows
  const purple = seq.line.ground[seq.line.n - 1];
  B.line.el.style.setProperty("--g", purple); chapters[1].pin.style.setProperty("--ground", purple); heads[0]?.style.setProperty("--bg", purple);
  B.after.el.style.setProperty("--g", purple);
}

// ───────── frames of the campaign film, on canvases ─────────
const canvases = Object.fromEntries($$("canvas.seq", story).map((el) => [el.dataset.seq, el]));
// rows of each film frame that carry Arabic lettering, in the frame's own pixels, measured from the frames themselves
const CUT = { logo: [[474, 523]], line: [[300, 396]], wheel: [[650, 720]] };
const frames = { logo: [], line: [], wheel: [] }, drawn = { logo: -1, line: -1, wheel: -1 }, asked = {}, want = { logo: 0, line: 0, wheel: 0 };
function loadFrames(name) {
  if (asked[name] || !seq) return;
  asked[name] = true;
  const n = seq[name].n; let i = 0, inFlight = 0;
  const next = () => {
    while (inFlight < 4 && i < n) {
      const idx = i++; inFlight++;
      const img = new Image(); img.decoding = "async";
      img.onload = img.onerror = () => { if (img.naturalWidth) frames[name][idx] = img; inFlight--; drawn[name] = -1; schedule(); next(); };
      img.src = `assets/seq-${name}/f-${String(idx + 1).padStart(3, "0")}.webp`;
    }
  };
  next();
}
function drawFrame(name, index) {
  want[name] = index;
  if (index === drawn[name]) return;
  let img = null; for (let k = index; k >= 0 && !img; k--) img = frames[name][k] || null;
  if (!img) return;
  const c = canvases[name];
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  for (const [y0, y1] of CUT[name] || []) ctx.clearRect(0, y0, c.width, y1 - y0);   // the bands with Arabic lettering are cropped out (ruling of 30 Sep 2026)
  drawn[name] = index;
  if (name === "wheel") try { const px = ctx.getImageData(3, 3, 1, 1).data; B.film.el.style.setProperty("--g", `rgb(${px[0]}, ${px[1]}, ${px[2]})`); } catch {}   // the ground is the frame's own colour, so no edge shows
}

// ───────── chapter III: the mark standing up, real 3D from the same paths ─────────
const glCanvas = $("canvas.gl", story), flat = $(".flat", story);
const gl = { state: "idle" };
async function mount3D() {
  if (gl.state !== "idle") return;
  gl.state = "loading";
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");
    const [THREE, data] = await Promise.all([import("./vendor/three.module.min.js"), fetch("assets/mark-paths.json").then((r) => r.json())]);
    const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 10, 6000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc3e6, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-300, 500, 700); scene.add(key);
    const cx = (data.mark[0] + data.mark[2]) / 2, cy = (data.mark[1] + data.mark[3]) / 2, feet = -(data.mark[3] - cy);
    const group = new THREE.Group(); scene.add(group);
    const Z = { "fig-l": 9, "fig-r": 9, l3: 0, l5: 0, l4: -9, l2: 4.5, l6: 4.5, l1: -4.5, l7: -4.5 };
    const shade = (hex, f) => new THREE.Color(hex).multiplyScalar(f);
    for (const piece of data.pieces) {
      for (const d of piece.d) {
        const shape = new THREE.Shape();
        const tok = d.match(/[MLCZ]|-?\d*\.?\d+/g); let i = 0, cmd = "";
        while (i < tok.length) {
          if (/[MLCZ]/.test(tok[i])) cmd = tok[i++];
          if (cmd === "Z") { shape.closePath(); continue; }
          if (cmd === "M") { shape.moveTo(+tok[i] - cx, -(+tok[i + 1] - cy)); i += 2; cmd = "L"; }
          else if (cmd === "L") { shape.lineTo(+tok[i] - cx, -(+tok[i + 1] - cy)); i += 2; }
          else if (cmd === "C") { shape.bezierCurveTo(+tok[i] - cx, -(+tok[i + 1] - cy), +tok[i + 2] - cx, -(+tok[i + 3] - cy), +tok[i + 4] - cx, -(+tok[i + 5] - cy)); i += 6; }
        }
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 7, bevelEnabled: true, bevelThickness: 0.7, bevelSize: 0.5, bevelSegments: 2, curveSegments: 28 });
        geo.translate(0, 0, -3.5);
        const mesh = new THREE.Mesh(geo, [new THREE.MeshBasicMaterial({ color: new THREE.Color(piece.fill) }), new THREE.MeshLambertMaterial({ color: shade(piece.fill, 0.62) })]);   // the printed face keeps the artwork's own colour
        mesh.position.z = Z[piece.id] ?? 0;
        group.add(mesh);
      }
    }
    const floor = new THREE.Mesh(new THREE.CircleGeometry(150, 96), new THREE.MeshBasicMaterial({ color: 0xe7e0f3, transparent: true, opacity: 0 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = feet - 0.5; scene.add(floor);
    const sc = document.createElement("canvas"); sc.width = sc.height = 256;
    const g2 = sc.getContext("2d"), grad = g2.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(43,22,80,.5)"); grad.addColorStop(0.55, "rgba(43,22,80,.16)"); grad.addColorStop(1, "rgba(43,22,80,0)");
    g2.fillStyle = grad; g2.fillRect(0, 0, 256, 256);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(250, 84), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, opacity: 0, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, feet, 4); scene.add(shadow);
    glCanvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); gl.lost = true; });
    glCanvas.addEventListener("webglcontextrestored", () => { gl.lost = false; gl.sized = false; render(); });
    Object.assign(gl, { state: "ready", renderer, scene, camera, floor, shadow, sized: false });
    render();
  } catch (e) {
    gl.state = "failed";
    story.classList.add("no-gl");
    render();
  }
}
function draw3D(k, sx, sy, theta, phi, ground) {
  if (gl.state !== "ready" || gl.lost) return;
  const { renderer, scene, camera, floor, shadow } = gl;
  if (!gl.sized) { renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W, H, false); camera.aspect = W / H; gl.sized = true; }
  const D = (H / k) / (2 * Math.tan((camera.fov * Math.PI) / 360));
  camera.position.set(D * Math.sin(theta) * Math.cos(phi), D * Math.sin(phi), D * Math.cos(theta) * Math.cos(phi));
  camera.lookAt(0, 0, 0);
  camera.setViewOffset(W, H, W / 2 - sx, H / 2 - sy, W, H);
  camera.updateProjectionMatrix();
  floor.material.opacity = ground; shadow.material.opacity = ground * 0.9;
  renderer.render(scene, camera);
}

// ───────── films (only on Play) and silent clips (only while their beat is on screen) ─────────
const films = $$("[data-film]", story).map((el) => {
  const beat = B[el.closest(".beat").dataset.beat];
  return { el, name: el.dataset.film, beat, btn: $(".play", el) || $(`.play[data-for="${el.dataset.film}"]`, story), video: $("video.full", el) || $("video:not(.clip)", el), clip: $("video.clip", el), playing: false };
}).filter((f) => f.btn && f.video);
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
const clips = $$("video.clip", story).map((el) => ({ el, beat: B[el.closest(".beat").dataset.beat], strip: el.closest("[data-clips]"), film: films.find((f) => f.clip === el) || null, item: el.closest(".day, .plate, .film"), wanted: false }));
function setClip(c, play) {
  if (play && !c.el.getAttribute("src")) { c.el.src = c.el.dataset.src; c.el.load(); }
  if (play === c.wanted) return;
  c.wanted = play;
  if (play) c.el.play().catch(() => {}); else c.el.pause();
}
function pauseClips() { clips.forEach((c) => setClip(c, false)); }
document.addEventListener("visibilitychange", () => { if (document.hidden) { stopFilms(); pauseClips(); } else render(); });
const campaign = films.find((f) => f.name === "campaign");

// ───────── sizes that depend only on the window ─────────
function measure() {
  W = window.innerWidth; H = chapters[0].pin.clientHeight || window.innerHeight;
  wide = W >= 768 && W / H >= 1.05;
  if (!L) return;
  const gpx = clamp(W * 0.04, 18, 64);
  const [mx0, my0, mx1, my1] = L.mark, [fx0, fy0, fx1, fy1] = L.figures;
  const mc = [(mx0 + mx1) / 2, (my0 + my1) / 2], fc = [(fx0 + fx1) / 2, (fy0 + fy1) / 2];
  const lock = [L.nameEn[0], my0, L.nameEn[2], L.nameEn[3]], lc = [(lock[0] + lock[2]) / 2, (lock[1] + lock[3]) / 2];
  const mH = my1 - my0, mW = mx1 - mx0, fW = fx1 - fx0, fH = fy1 - fy0, lW = lock[2] - lock[0], lH = lock[3] - lock[1];
  const hx = wide ? W * 0.69 : W * 0.5, hy = wide ? H * 0.5 : H * 0.68;
  const k1 = wide ? Math.min(0.58 * H / fH, 0.42 * W / fW) : Math.min(0.33 * H / fH, 0.76 * W / fW);
  const k3 = wide ? Math.min(0.66 * H / lH, 0.5 * W / lW) : Math.min(0.42 * H / lH, 0.86 * W / lW);
  const k2 = wide ? Math.min(0.68 * H / mH, 0.5 * W / mW) : Math.min(0.44 * H / mH, 0.8 * W / mW);
  const c1 = [hx + k1 * (mc[0] - fc[0]), (wide ? H * 0.55 : H * 0.69) + k1 * (mc[1] - fc[1])];
  const c3 = [hx, hy + k3 * (mc[1] - lc[1])];
  K0 = Math.max(k1, k3);
  const [vx, vy, vw, vh] = L.viewBox;
  for (const pc of pieces) {
    pc.svg.style.width = `${vw * K0}px`; pc.svg.style.height = `${vh * K0}px`;
    pc.svg.style.left = `${-(mc[0] - vx) * K0}px`; pc.svg.style.top = `${-(mc[1] - vy) * K0}px`;
  }
  const box = seq.logo.box, filmPerPt = (box[2] - box[0]) / lW;                   // the film's lock-up against the vector's, measured
  const lineFirst = Math.max(0, seq.line.ground.findIndex((c) => c === seq.line.ground[seq.line.n - 1]));
  pose = { mc, fc, lc, mH, lH, lW, hx, hy, k1, k2, k3, c1, c3, gpx, filmPerPt, box, lineFirst,
    lineS: wide ? Math.min(0.66 * H / 600, 0.5 * W / 700) : Math.min(0.46 * H / 600, 0.96 * W / 700),
    wheelS: wide ? Math.min(0.76 * H, 0.52 * W) : Math.min(0.48 * H, 0.94 * W) };
  // the strips: how wide each sheet is, and how far the strip travels
  for (const s of $$("[data-strip]", story)) {
    const vis = s.closest(".vis"), vw2 = vis.clientWidth, vh2 = vis.clientHeight;
    const ratio = s.classList.contains("days") ? 0.78 : 1500 / 1050;
    const w = wide ? Math.min(vw2 * 0.74, (vh2 * (s.classList.contains("days") ? 0.6 : 0.78)) * (s.classList.contains("days") ? 16 / 9 : ratio)) : vw2 * 0.9;
    s.style.setProperty("--w", `${Math.round(w)}px`);
    s._start = wide ? vw2 * 0.02 : gpx; s._end = Math.min(s._start, vw2 - gpx - s.scrollWidth);
  }
  for (const img of $$("img[data-pan]", story)) {
    const r = img.width / img.height, h = Math.max(H, (1.5 * W) / r);
    img.style.height = `${h}px`; img._w = h * r; img._top = (H - h) / 2;
  }
  gl.sized = false; drawn.logo = drawn.line = drawn.wheel = -1;
}

// ───────── a change of ground opens as a leaf ─────────
function leafPath(n, origin) {
  const o = L.leafOutline, e = Math.pow(n, 2.1);
  const Lmax = 1.75 * Math.hypot(2 * W, H), len = Math.max(1, Lmax * e);
  const bx = lerp(origin[0], W / 2, e), by = lerp(origin[1], H / 2 + 0.45 * Lmax, e);
  const P = ([x, y]) => `${(bx + x * len).toFixed(1)} ${(by + y * len).toFixed(1)}`;
  return `path("M${P(o.start)} C${o.curves[0].map(P).join(" ")} C${o.curves[1].map(P).join(" ")} Z")`;
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
      if (b.bloom) cin = seg(b.n, 0.55, 1);
      else { oin = seg(b.n, 0.3, 0.9); cin = seg(b.n, 0.6, 1); go = smooth(b.n); }
    }
    if (b.next && !b.next.bloom) { oout = 1 - seg(b.x, 0.1, 0.7); cout = 1 - seg(b.x, 0, 0.45); }
    const o = oin * oout;
    b.o = o;
    const s = b.el.style;
    s.setProperty("--n", b.n.toFixed(4)); s.setProperty("--q", b.q.toFixed(4)); s.setProperty("--x", b.x.toFixed(4));
    s.setProperty("--e", smooth(b.q).toFixed(4)); s.setProperty("--e2", seg(b.q, 0.04, 0.78).toFixed(4));
    s.setProperty("--o", o.toFixed(3)); s.setProperty("--c", (cin * cout).toFixed(3)); s.setProperty("--c-in", cin.toFixed(3)); s.setProperty("--go", go.toFixed(3));
    b.el.classList.toggle("on", b.on);
    if (b.bloom) s.clipPath = b.n >= 1 || b.n <= 0 ? "none" : leafPath(b.n, wide ? [W * 0.69, H * 0.9] : [W * 0.5, H * 0.94]);
  }
}

function renderMark(c) {
  const P = pose, f = B.figures, l = B.leaves, a = B.apart, r = B.route;
  if (l.n > 0 || f.q > 0.4) loadFrames("logo");
  // the figures come together; the camera pulls back to the whole lock-up; the film opens the leaves and writes the name
  const pull = smooth(l.n);
  const open = seg(a.q, 0.02, 0.3) * (1 - seg(a.q, 0.78, 1));
  const k = lerp(P.k1, P.k3, pull) * lerp(1, 0.8, open);
  const cx = lerp(P.c1[0], P.c3[0], pull), cy = lerp(P.c1[1], P.c3[1], pull);
  const FIRST = 9, LAST = seq.logo.n - 1;
  const filmOn = l.n >= 1 && l.q < 0.86 && frames.logo[FIRST];
  const fi = Math.round(lerp(FIRST, LAST, clamp(l.q / 0.74)));
  const toVector = seg(l.q, 0.78, 0.86), fromVector = seg(l.q, 0, 0.04);
  const cv = canvases.logo;
  if (filmOn) {
    const s = P.k3 / P.filmPerPt, bx = (P.box[0] + P.box[2]) / 2, by = (P.box[1] + P.box[3]) / 2;
    cv.style.transform = `translate(${(P.hx - s * bx).toFixed(1)}px, ${(P.hy - s * by).toFixed(1)}px) scale(${s.toFixed(4)})`;
    cv.style.opacity = (fromVector * (1 - toVector)).toFixed(3);
    drawFrame("logo", fi);
  }
  cv.style.visibility = filmOn ? "visible" : "hidden";
  const heroO = (filmOn ? Math.max(1 - fromVector, toVector) : 1) * (1 - seg(r.n, 0.1, 0.7));
  hero.style.visibility = heroO > 0.001 ? "visible" : "hidden";
  hero.style.opacity = heroO.toFixed(3);
  hero.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
  tilt.style.transform = `rotateX(${(6 * open).toFixed(2)}deg) rotateY(${(-16 * open).toFixed(2)}deg) scale(${(k / K0).toFixed(5)})`;
  const gap = 15 * (1 - seg(f.q, 0.25, 0.85));
  const whole = l.q >= 0.78 || a.n > 0;                                       // after the film has built it, every piece is in place
  for (const pc of pieces) {
    let z = 0, o = 1;
    if (pc.kind === "fig") {
      pc.inner.setAttribute("transform", `translate(${((pc.id === "fig-l" ? -1 : 1) * (gap + 30 * open)).toFixed(2)} ${(10 * open).toFixed(2)})`);
    } else if (pc.kind === "leaf") {
      const b = pc.leaf.base, bb = pc.leaf.bbox;
      // apart, each leaf travels along its own direction of growth: from its base towards its tip
      const dx = (bb[0] + bb[2]) / 2 - b[0], dy = (bb[1] + bb[3]) / 2 - b[1], len = Math.hypot(dx, dy) || 1, far = (34 + pc.order * 7) * open;
      pc.inner.setAttribute("transform", `translate(${(dx / len * far).toFixed(2)} ${(dy / len * far).toFixed(2)})`);
      o = whole ? 1 : 0; z = (pc.order + 1) * 15 * open;
    } else {
      pc.inner.setAttribute("transform", `translate(0 ${((pc.id === "name-ar" ? 26 : 44) * open).toFixed(2)})`);
      o = whole ? 1 : 0; z = -18 * open;
    }
    pc.svg.style.opacity = o;
    pc.svg.style.transform = z ? `translateZ(${(z * K0).toFixed(1)}px)` : "none";
    pc.svg.style.filter = open > 0.01 ? `drop-shadow(${(-5 * open * K0).toFixed(1)}px ${(5 * open * K0).toFixed(1)}px ${(5 * open * K0).toFixed(1)}px rgba(43, 22, 80, ${(0.2 * open).toFixed(3)}))` : "none";
  }
  const chipO = seg(a.q, 0.16, 0.34) * (1 - seg(a.q, 0.78, 0.96));
  chips.style.opacity = chipO.toFixed(3);
  if (chipO > 0) {
    const cw = chips.offsetWidth;
    chips.style.transform = `translate(${(P.hx - cw / 2).toFixed(1)}px, ${(P.hy + P.k3 * 0.8 * (P.lH / 2 + 62)).toFixed(1)}px) scaleX(${lerp(0.2, 1, chipO).toFixed(3)})`;
    chips.style.transformOrigin = "50% 50%";
  }
}

function renderLineAndWorld() {
  const P = pose, line = B.line, film = B.film;
  if (line.on) {
    loadFrames("line");
    const s = P.lineS, cx = P.hx, cy = wide ? H * 0.5 : H * 0.7;
    canvases.line.style.transform = `translate(${(cx - s * 350).toFixed(1)}px, ${(cy - s * 300).toFixed(1)}px) scale(${s.toFixed(4)})`;
    drawFrame("line", Math.round(lerp(P.lineFirst, seq.line.n - 1, clamp((line.q - 0.06) / 0.7))));
  }
  if (B.world.n > 0 || film.n > 0) loadFrames("wheel");
  if (film.on) {
    const s = P.wheelS / 720, wx = P.hx - P.wheelS / 2, wy = (wide ? H * 0.5 : H * 0.7) - P.wheelS / 2;
    canvases.wheel.style.transform = `translate(${wx.toFixed(1)}px, ${wy.toFixed(1)}px) scale(${s.toFixed(4)})`;
    campaign.el.style.width = `${P.wheelS.toFixed(1)}px`;
    campaign.el.style.transform = `translate(${wx.toFixed(1)}px, ${wy.toFixed(1)}px)`;
    drawFrame("wheel", Math.round(clamp((film.q - 0.02) / 0.9) * (seq.wheel.n - 1)));
  }
}

function renderMadeReal() {
  const P = pose, s = B.standup;
  if (s.on) {
    if (gl.state === "idle") mount3D();
    const theta = track(s.q, [[0.04, 0], [0.34, -0.64], [0.46, -0.64], [0.62, -0.34]]);
    const phi = track(s.q, [[0.04, 0.02], [0.34, 0.17], [0.62, 0.22]]);
    const k = P.k2 * track(s.q, [[0, 0.9], [0.34, 0.84], [0.62, 0.78]]);
    const away = seg(s.q, 0.58, 0.68);
    glCanvas.style.opacity = (1 - away).toFixed(3);
    if (away < 1) draw3D(k, P.hx, P.hy, theta, phi, seg(s.q, 0.06, 0.26));
    if (gl.state === "failed") {
      const kf = P.k2 * 0.9;
      flat.style.width = `${(L.mark[2] - L.mark[0] + 8).toFixed(1)}px`;
      flat.style.opacity = (1 - away).toFixed(3);
      flat.style.transform = `translate(${(P.hx - kf * (L.mark[2] - L.mark[0] + 8) / 2).toFixed(1)}px, ${(P.hy - kf * (P.mH + 8) / 2).toFixed(1)}px) scale(${kf.toFixed(4)})`;
    }
  }
}

function renderStripsAndClips(c) {
  for (const b of c.beats) {
    if (!b.on) continue;
    for (const s of $$("[data-strip]", b.el)) {
      const t = seg(b.q, 0.06, 0.94) * 0.5 + clamp((b.q - 0.06) / 0.88) * 0.5;         // mostly even, a little eased at both ends
      s.style.transform = `translate3d(${lerp(s._start ?? 0, s._end ?? 0, t).toFixed(1)}px, 0, 0)`;
    }
    for (const img of $$("img[data-pan]", b.el)) {
      const t = clamp((b.n - 0.4) / 0.6) * 0.06 + b.q * 0.94;
      img.style.transform = `translate3d(${(-t * Math.max(0, (img._w || 0) - W)).toFixed(1)}px, ${(img._top || 0).toFixed(1)}px, 0)`;
    }
  }
}
function renderClips() {
  const vw = W / 2;
  const nearest = new Map();
  for (const c of clips) {
    if (!c.strip || !c.beat.on) continue;
    const r = c.item.getBoundingClientRect(), d = Math.abs((r.left + r.right) / 2 - (wide ? W * 0.69 : vw));
    const best = nearest.get(c.strip);
    if (!best || d < best.d) nearest.set(c.strip, { c, d });
  }
  for (const c of clips) {
    const showing = live && !document.hidden && c.beat.on && c.beat.o > 0.5 && c.beat.n > 0.6 && !(c.film && c.film.playing);
    const mine = !c.strip || nearest.get(c.strip)?.c === c;
    if (c.beat.n > 0 && c.beat.on && !c.el.getAttribute("src") && !c.el.dataset.asked) { c.el.dataset.asked = "1"; c.el.preload = "metadata"; }
    setClip(c, showing && mine);
    c.item?.classList.toggle("running", showing && mine);
  }
  for (const f of films) if (f.playing && (!f.beat.on || f.beat.o < 0.5)) stopFilm(f);
}

function render() {
  if (!live || !L || !pose) return;
  for (const c of chapters) {
    const r = c.el.getBoundingClientRect();
    c.near = r.top < H * 1.5 && r.bottom > -H * 0.5;
    c.pinned = r.top <= 0 && r.bottom >= H;
    const np = clamp(-r.top / Math.max(1, r.height - H));
    c.p = np;
    if (!c.near) { c.beats.forEach((b) => { if (b.on) { b.on = false; b.el.classList.remove("on"); } }); continue; }
    beatNumbers(c);
    if (c.num === 1) renderMark(c);
    if (c.num === 2) renderLineAndWorld();
    if (c.num === 3) renderMadeReal();
    renderStripsAndClips(c);
  }
  renderClips();
  thread();
}

function thread() {
  const sr = story.getBoundingClientRect();
  const inStory = sr.top < H * 0.5 && sr.bottom > H * 0.6;
  root.style.setProperty("--thread", inStory ? "1" : "0");
  root.style.setProperty("--thread-label", chapters.some((c) => c.pinned) ? "1" : "0");
  bar.style.transform = `scaleX(${clamp(-sr.top / Math.max(1, sr.height - H)).toFixed(4)})`;
  // what is under the top of the window decides the colour of the navigation
  let tone = "light", label = null;
  if (sr.bottom < 70) tone = "paper";
  else {
    for (const h of heads) { const r = h.getBoundingClientRect(); if (r.top <= 40 && r.bottom > 40) tone = h.classList.contains("on-dark") ? "dark" : "light"; }
    for (const c of chapters) {
      const r = c.el.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40) {
        let top = c.beats[0];
        for (const b of c.beats) if (b.n > (b.bloom ? 0.62 : 0.5)) top = b;
        tone = top.tone;
        label = { c, i: ALL.indexOf(top) + 1 };
      }
    }
  }
  root.dataset.ground = tone;
  if (label) threadLabel.innerHTML = `<b>${ROMAN[label.c.num]}</b> <span>${label.c.title}</span> <i>${label.i} / ${ALL.length}</i>`;
}

function clearPoses() {
  for (const b of ALL) { b.el.classList.remove("on"); b.el.style.clipPath = ""; for (const v of ["--n", "--q", "--x", "--e", "--e2", "--o", "--c", "--c-in", "--go"]) b.el.style.removeProperty(v); }
  for (const s of $$("[data-strip]", story)) { s.style.transform = ""; s.style.removeProperty("--w"); }
  for (const img of $$("img[data-pan]", story)) { img.style.transform = ""; img.style.height = ""; }
  if (campaign) campaign.el.style.width = campaign.el.style.transform = "";
}

// ───────── scroll ─────────
let queued = false;
function update() {
  queued = false;
  if (!live) { root.dataset.ground = story.getBoundingClientRect().bottom < 70 ? "paper" : "light"; return; }
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
  try { await buildHero(); } catch (e) { root.classList.remove("live"); live = false; return; }   // no vectors, no pinned story: the plain page stays
  measure(); update();
  document.fonts?.ready.then(() => { measure(); update(); });
  window.addEventListener("load", () => { measure(); update(); });
  // ?p=0.5 opens the whole story at that progress; ?beat=world opens at the middle of a beat
  const jump = parseFloat(params.get("p")), at = params.get("beat"), bq = parseFloat(params.get("q"));
  requestAnimationFrame(() => {
    if (at && B[at]) {
      const c = chapters.find((ch) => ch.beats.includes(B[at])), b = B[at];
      const local = lerp(b.a, b.b, Number.isNaN(bq) ? 0.5 : bq);
      const top = c.el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + local * (c.el.offsetHeight - H));
    } else if (!Number.isNaN(jump)) {
      const top = story.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + clamp(jump) * (story.offsetHeight - H));
    }
    update();
  });
}

applyMode();
