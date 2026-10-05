// Capacity Middle East, Etisalat gala dinners — the scroll scene. 2018 and 2019 are kept apart.
// Every pose is a pure function of scroll progress p (0..1); scrolling back is exact.
// The 3D beat is a portfolio presentation of the 2018 screen films: the real frames of the main film and of the two
// side films, scrubbed by scroll, on three screens. The frames stop before the client's mark appears.
import * as THREE from "./vendor/three.module.min.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;

const root = document.documentElement;
const story = document.getElementById("story");
const stage = story.querySelector(".stage");
const q = new URLSearchParams(location.search);
const MAIN_N = 42, SIDE_N = 28;
const S3 = [0.25, 0.48];     // the screens beat

// ---------- motion preference ----------
const KEY = "az-motion";
const mq = matchMedia("(prefers-reduced-motion: reduce)");
const stored = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
function motionMode() {
  if (q.get("motion") === "off") return "off";
  if (q.get("motion") === "on") return "full";
  const s = stored(); return s === "off" || s === "full" ? s : mq.matches ? "off" : "full";
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

// ---------- the film: only on Play, muted ----------
const film = stage.querySelector(".film"), video = film.querySelector("video"), playBtn = stage.querySelector(".play");
const playLabel = playBtn.textContent;
let playing = false;
function stopFilm() { if (!playing) return; playing = false; video.pause(); video.removeAttribute("src"); video.load(); film.classList.remove("playing"); playBtn.textContent = playLabel; playBtn.setAttribute("aria-pressed", "false"); }
function playFilm() { if (playing) { stopFilm(); return; } playing = true; video.src = video.dataset.src; video.muted = true; film.classList.add("playing"); playBtn.textContent = "Stop the film"; playBtn.setAttribute("aria-pressed", "true"); video.play().catch(stopFilm); }
playBtn.addEventListener("click", playFilm);
video.addEventListener("ended", stopFilm);
document.addEventListener("visibilitychange", () => { if (document.hidden) stopFilm(); });

function initLive() {
  root.classList.add("live");
  for (const img of stage.querySelectorAll("img[loading='lazy']")) img.loading = "eager";
  const beats = [...stage.querySelectorAll(".beat")].map((el, i, all) => {
    const [a, b] = el.dataset.range.split(",").map(Number); return { el, a, b, first: i === 0, last: i === all.length - 1 };
  });
  const ticks = [...stage.querySelectorAll(".ticks li")];
  const dirs = stage.querySelector(".b-directions");
  const runFigs = [...stage.querySelectorAll(".b-run .grid figure")];
  const beach = [...stage.querySelectorAll(".b-beach .seq > figure")];
  const fixed = q.get("p") !== null ? clamp(parseFloat(q.get("p"))) : null;
  let W = 0, H = 0, tall = false, p = 0, queued = false;
  const gl = makeScreens(stage.querySelector("canvas.gl"), () => ask());
  if (!gl) stage.classList.add("no-gl");

  function measure() { W = stage.clientWidth; H = stage.clientHeight; tall = W < 768 || W / H < 1.05; gl?.resize(W, H, tall); }
  function progress() { if (fixed !== null) return fixed; const r = story.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); }

  function frame() {
    queued = false; p = progress();
    let here = 0;
    beats.forEach((b, i) => {
      const t = clamp((p - b.a) / (b.b - b.a));
      const o = (b.first ? 1 : seg(p, b.a, b.a + 0.014)) * (b.last ? 1 : 1 - seg(p, b.b - 0.014, b.b));
      b.el.style.setProperty("--t", t.toFixed(4)); b.el.style.setProperty("--o", o.toFixed(4));
      b.el.classList.toggle("on", o > 0.001); b.el.classList.toggle("here", o > 0.5);
      if (p >= b.a) here = i;
    });
    ticks.forEach((li, i) => li.classList.toggle("on", i === here));

    // the edition: 2018, wiped to 2019 at the boundary
    const wipe = seg(p, 0.585, 0.625);
    stage.style.setProperty("--wipe", wipe.toFixed(3)); stage.style.setProperty("--yb", wipe > 0 ? "1" : "0"); stage.style.setProperty("--ya", wipe < 1 ? "1" : "0");
    stage.style.setProperty("--y19", seg(p, 0.59, 0.64).toFixed(3));
    stage.style.setProperty("--ym", (1 - seg(p, 0.855, 0.875)).toFixed(3));

    // 2 · the two directions, then direction B on the terrace
    dirs.style.setProperty("--s2", seg(p, 0.19, 0.215).toFixed(3));

    // 3 · the screens
    const glOn = seg(p, S3[0] - 0.012, S3[0] + 0.01) * (1 - seg(p, S3[1] - 0.014, S3[1]));
    stage.style.setProperty("--gl", glOn.toFixed(3));
    if (gl && glOn > 0.001) gl.render(clamp((p - S3[0]) / (S3[1] - S3[0])));

    // 4 · the films of the evening arrive one after another, in the running order
    runFigs.forEach((f, i) => f.style.setProperty("--g", seg(p, 0.49 + i * 0.013, 0.505 + i * 0.013).toFixed(3)));

    // 6 · one picture at a time
    const n = beach.length, a = 0.72, span = (0.86 - a) / n;
    beach.forEach((f, i) => {
      const s0 = a + i * span, s1 = s0 + span;
      f.style.setProperty("--s", ((i === 0 ? 1 : seg(p, s0 - 0.01, s0 + 0.01)) * (i === n - 1 ? 1 : 1 - seg(p, s1 - 0.01, s1 + 0.01))).toFixed(3));
    });
    if (p < 0.87) stopFilm();
  }
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", () => { measure(); ask(); });
  addEventListener("orientationchange", () => { measure(); ask(); });
  addEventListener("pageshow", ask);
  document.fonts?.ready?.then(() => { measure(); ask(); });
  measure();
  if (fixed !== null) { const go = () => scrollTo(0, story.offsetTop + fixed * (story.offsetHeight - innerHeight)); go(); requestAnimationFrame(go); setTimeout(go, 300); }
  frame();
  window.__story = { ready: () => (gl ? gl.ready(p) : true) && [...stage.querySelectorAll("img")].every((i) => i.complete), progress: () => p };
}

// =====================================================================================
// Three screens: the main film between the two side films
// =====================================================================================
function makeScreens(canvas, onLoad) {
  if (q.get("gl") === "off") return null;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  let W = 1, H = 1, tall = false, lastT = 0;

  // frames, loaded in order; each screen draws the nearest loaded frame at or before the one it needs
  const seqs = {
    main: { n: MAIN_N, url: (i) => `assets/main/m-${String(i + 1).padStart(3, "0")}.webp`, imgs: [], w: 1024, h: 576 },
    l: { n: SIDE_N, url: (i) => `assets/side-l/l-${String(i + 1).padStart(3, "0")}.webp`, imgs: [], w: 512, h: 512 },
    r: { n: SIDE_N, url: (i) => `assets/side-r/r-${String(i + 1).padStart(3, "0")}.webp`, imgs: [], w: 512, h: 512 },
  };
  let asked = false;
  function loadAll() {
    if (asked) return; asked = true;
    for (const s of Object.values(seqs)) {
      s.imgs = new Array(s.n).fill(null); let i = 0;
      const next = () => { if (i >= s.n) return; const k = i++; const im = new Image(); im.decoding = "async"; im.onload = () => { s.imgs[k] = im; s.last = -1; onLoad(); next(); }; im.onerror = next; im.src = s.url(k); };
      next(); next();
    }
  }
  loadAll();
  function screen(s, w, h) {
    const c = document.createElement("canvas"); c.width = s.w; c.height = s.h; s.ctx = c.getContext("2d"); s.last = -1;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; s.tex = t;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
    const frameM = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.12, h + 0.12), new THREE.MeshBasicMaterial({ color: 0x05070c }));
    frameM.position.z = -0.01; m.add(frameM);
    // a faint reflection on the stage floor
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.07, toneMapped: false, depthWrite: false }));
    refl.scale.y = -1; refl.position.y = -h - 0.12; m.add(refl);
    scene.add(m); return m;
  }
  function draw(s, idx) {
    idx = clamp(Math.round(idx), 0, s.n - 1); if (idx === s.last) return;
    let im = null; for (let k = idx; k >= 0 && !im; k--) im = s.imgs[k];
    if (!im) return; s.ctx.drawImage(im, 0, 0, s.w, s.h); s.tex.needsUpdate = true; s.last = idx;
  }
  // the brief gave 12 × 4 m for the main screen; the side screens are square. Their spacing here is illustrative.
  const MH = 4, MW = MH * 16 / 9, SS = 3.2, GAP = 0.9;
  const main = screen(seqs.main, MW, MH); main.position.set(0, MH / 2 + 0.6, 0);
  const left = screen(seqs.l, SS, SS); left.position.set(-(MW / 2 + GAP + SS / 2), SS / 2 + 0.6, 0.6); left.rotation.y = 0.18;
  const right = screen(seqs.r, SS, SS); right.position.set(MW / 2 + GAP + SS / 2, SS / 2 + 0.6, 0.6); right.rotation.y = -0.18;
  // the stage edge, a thin line of light (the screens' own line)
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(MW + 2 * (GAP + SS) + 1.2, 0.03), new THREE.MeshBasicMaterial({ color: 0xc8e632 }));
  edge.position.set(0, 0.35, 1.2); scene.add(edge);

  function compose(t) {
    // the main film runs across the whole beat; the side films draw their lines in the first half
    draw(seqs.main, t * (MAIN_N - 1) * 1.02);
    draw(seqs.l, seg(t, 0.12, 0.62) * (SIDE_N - 1));
    draw(seqs.r, seg(t, 0.12, 0.62) * (SIDE_N - 1));
    // camera: close on the main screen → back and a little round, all three screens → front-on
    const back = seg(t, 0.08, 0.5), round = Math.sin(clamp((t - 0.35) / 0.55) * Math.PI) * 0.22;
    const span = MW + 2 * (GAP + SS);
    const needW = lerp(MW * 1.08, span * 1.05, back), needH = lerp(MH * 1.15, MH * 1.6, back);
    const free = tall ? [0.04, 0.96, 0.42, 0.97] : [0.03, 0.97, 0.07, 0.6];
    const k = 2 * Math.tan((32 * Math.PI) / 360), asp = W / H;
    let dist = Math.max(needW / ((free[1] - free[0]) * asp), needH / (free[3] - free[2])) / k;
    let tx = 0;
    if (tall) { dist = Math.max(MW * 1.1 / ((free[1] - free[0]) * asp), MH * 1.4 / (free[3] - free[2])) / k * lerp(1, 1.35, back); tx = lerp(0, 0, back) + Math.sin(clamp((t - 0.2) / 0.7) * Math.PI * 2) * -(MW / 2 + GAP + SS / 2) * 0.9 * back; }
    const ty = MH / 2 + 0.6;
    camera.aspect = asp; camera.fov = 32;
    camera.position.set(tx + Math.sin(round) * dist, ty + lerp(0.2, 0.9, back), Math.cos(round) * dist);
    camera.lookAt(tx, ty, 0);
    camera.setViewOffset(W, H, -((free[0] + free[1]) / 2 - 0.5) * W, -((free[2] + free[3]) / 2 - 0.5) * H, W, H);
    camera.updateProjectionMatrix();
  }
  let lost = false;
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; });
  canvas.addEventListener("webglcontextrestored", () => { lost = false; onLoad(); });
  return {
    resize(w, h, t) { W = w; H = h; tall = t; renderer.setSize(w, h, false); },
    render(t) { lastT = t; compose(t); if (!lost) renderer.render(scene, camera); },
    ready(p) {
      if (p < S3[0] - 0.02 || p > S3[1] + 0.02) return true;
      const t = clamp((p - S3[0]) / (S3[1] - S3[0]));
      const need = (s, idx) => { idx = clamp(Math.round(idx), 0, s.n - 1); return !!s.imgs[idx]; };
      return need(seqs.main, t * (MAIN_N - 1) * 1.02) && need(seqs.l, seg(t, 0.12, 0.62) * (SIDE_N - 1)) && need(seqs.r, seg(t, 0.12, 0.62) * (SIDE_N - 1));
    },
  };
}

if (motionMode() === "full") initLive();
