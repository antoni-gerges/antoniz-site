// ZEISS ClearView & PhotoFusion X launch, Dubai 2022 — the scroll scene.
// Every pose is a pure function of scroll progress p (0..1); scrolling back is exact. No timers, no loops.
// The 3D is a portfolio presentation of the concept board: the eye is drawn by the shader from the 2,440 vector dots
// fitted one per cell of the original halftone; the lens is the drawn lens (its own outline and its own gloss), and what is
// seen through it is the same eye magnified by the ratio the board itself uses (1.293). Brackets are measured from the board.
import * as THREE from "./vendor/three.module.min.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;

const root = document.documentElement;
const story = document.getElementById("story");
const stage = story.querySelector(".stage");
const q = new URLSearchParams(location.search);

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

// ---------- the board's measurements (composite canvas 2640 x 1760 px; lens box 297,47 1882 x 1661) ----------
const F = 2 / 1882;                          // world units per composite pixel: the lens is 2 units wide
const LENS_C = [297 + 941, 47 + 830.5];
const M = 3.3197 / 2.5675;                   // eye enlargement / lens enlargement in the composite = the lens's magnification
const EW = 770 * 3.3197 * F / M;           // raw eye width in world units (2.10): the enlarged eye, divided by the magnification
const EH = EW * 510 / 770;
const EYE_AT = [(1328.5 - LENS_C[0]) * F / M, 0];   // where the raw eye sits behind the lens when the picture resolves
const PLATE_LENS = { x: 297 / 2640, y: 47 / 1760, w: 1882 / 2640 };
const cw = (x, y) => [(x - LENS_C[0]) * F, -(y - LENS_C[1]) * F];
const BRACKETS = [   // outer corner, arm, thickness, rotation (arms along +x and -y, turned per corner)
  { at: cw(117, 46), arm: 397 * F, th: 103 * F, rot: 0 },
  { at: cw(2251, 107), arm: 336 * F, th: 41 * F, rot: -Math.PI / 2 },
  { at: cw(178, 1552), arm: 336 * F, th: 41 * F, rot: Math.PI / 2 },
  { at: cw(2251, 1552), arm: 336 * F, th: 41 * F, rot: Math.PI },
];

function initLive() {
  root.classList.add("live");
  for (const img of stage.querySelectorAll("img[loading='lazy']")) img.loading = "eager";
  const beats = [...stage.querySelectorAll(".beat")].map((el, i, all) => {
    const [a, b] = el.dataset.range.split(",").map(Number); return { el, a, b, first: i === 0, last: i === all.length - 1 };
  });
  const ticks = [...stage.querySelectorAll(".ticks li")];
  const finder = stage.querySelector(".finder");
  const plate = stage.querySelector(".plate-live");
  const apps = [...stage.querySelectorAll(".b-travel .wall figure")];
  const steps = [...stage.querySelectorAll(".b-wall .steps figure")];
  const shots = [...stage.querySelectorAll(".b-night .shots > *")];
  const oneImg = stage.querySelector(".b-one .art img");
  const fixed = q.get("p") !== null ? clamp(parseFloat(q.get("p"))) : null;
  let W = 0, H = 0, tall = false, p = 0, queued = false;

  const gl = makeLens(stage.querySelector("canvas.gl"), () => ask());
  if (!gl) stage.classList.add("no-gl");

  function measure() { W = stage.clientWidth; H = stage.clientHeight; tall = W < 768 || W / H < 1.05; gl?.resize(W, H, tall); }
  function progress() { if (fixed !== null) return fixed; const r = story.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); }
  const st = () => stage.getBoundingClientRect();
  function rectOf(el) { const r = el.getBoundingClientRect(), s = st(); return [r.left - s.left, r.top - s.top, r.width, r.height]; }
  const mixR = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
  // a sequence of items shown one after another over [a, b]; returns each item's presence and the finder's rect
  function sequence(items, a, b, fade = 0.012) {
    const n = items.length, span = (b - a) / n; let rect = null;
    items.forEach((el, i) => {
      const s0 = a + i * span, s1 = s0 + span;
      const o = (i === 0 ? 1 : seg(p, s0 - fade, s0 + fade)) * (i === n - 1 ? 1 : 1 - seg(p, s1 - fade, s1 + fade));
      el.style.setProperty("--s", o.toFixed(3));
    });
    const k = clamp(Math.floor((p - a) / span), 0, n - 1), t = seg((p - a) / span - k, 0.62, 1);
    const inner = (el) => el.querySelector("img") || el;
    rect = k < n - 1 ? mixR(rectOf(inner(items[k])), rectOf(inner(items[k + 1])), t) : rectOf(inner(items[k]));
    return { k, rect };
  }

  function frame() {
    queued = false; p = progress();
    let here = 0;
    beats.forEach((b, i) => {
      const t = clamp((p - b.a) / (b.b - b.a));
      const o = (b.first ? 1 : seg(p, b.a, b.a + 0.015)) * (b.last ? 1 : 1 - seg(p, b.b - 0.015, b.b));
      b.el.style.setProperty("--t", t.toFixed(4)); b.el.style.setProperty("--o", o.toFixed(4));
      b.el.classList.toggle("on", o > 0.001); b.el.classList.toggle("here", o > 0.5);
      if (p >= b.a) here = i;
    });
    ticks.forEach((li, i) => li.classList.toggle("on", i === here));

    // light (PhotoFusion X), then the dark room at night
    const light = seg(p, 0.305, 0.345) * (1 - seg(p, 0.375, 0.415));
    stage.style.setProperty("--light", light.toFixed(3));
    const dark = seg(p, 0.828, 0.858);
    stage.style.setProperty("--dark", dark.toFixed(3)); stage.classList.toggle("dark", dark > 0.5);
    document.body.classList.toggle("on-dark", dark > 0.5 && story.getBoundingClientRect().bottom > 60);

    // the model, then his artwork in its exact place
    const glOn = 1 - seg(p, 0.475, 0.505);
    stage.style.setProperty("--gl", glOn.toFixed(3));
    let lensRect = null;
    if (gl) lensRect = glOn > 0.001 ? gl.render(p, light) : gl.pose(p, light);
    const plateIn = seg(p, 0.448, 0.49) * (1 - seg(p, 0.535, 0.56));
    stage.style.setProperty("--plate", plateIn.toFixed(3));
    let plateRect = null;
    if (gl && lensRect) {
      const w = lensRect[2] / PLATE_LENS.w, h = w * 1760 / 2640;
      const x = lensRect[0] - PLATE_LENS.x * w, y = lensRect[1] - PLATE_LENS.y * h;
      plate.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; plate.style.width = `${w.toFixed(1)}px`;
      plateRect = [x, y, w, h];
    }
    if (!plateRect && plate.style.width) { const r = rectOf(plate); plateRect = r; }
    if (!gl) plateRect = rectOf(oneImg);

    // the finder: the brackets, carried from the key visual to every application, then to the night
    let fr = null, fo = 0;
    const bracketsRect = plateRect ? [plateRect[0] + plateRect[2] * 117 / 2640, plateRect[1] + plateRect[3] * 46 / 1760, plateRect[2] * 2134 / 2640, plateRect[3] * 1506 / 1760] : null;
    if (p >= 0.47 && p < 0.52 && bracketsRect) { fr = bracketsRect; fo = seg(p, 0.475, 0.5); }
    if (p >= 0.52 && p < 0.70) {
      const s = sequence(apps, 0.535, 0.695, 0.004);
      apps.forEach((el, i) => el.classList.toggle("on", i === s.k));
      fr = p < 0.545 && bracketsRect ? mixR(bracketsRect, rectOf(apps[0].querySelector("img")), seg(p, 0.52, 0.545)) : s.rect; fo = 1;
    }
    if (p >= 0.70 && p < 0.84) { const s = sequence(steps, 0.70, 0.84); fr = s.rect; fo = 1; }
    if (p >= 0.84) { const s = sequence(shots, 0.85, 1.0); fr = s.rect; fo = seg(p, 0.845, 0.87); }
    if (playing) shots.forEach((el, i) => el.style.setProperty("--s", i === shots.length - 1 ? "1" : "0"));
    const me = seg(p, 0.885, 0.915); stage.style.setProperty("--m", me.toFixed(3));
    stage.style.setProperty("--pl", seg(p, 0.95, 0.97).toFixed(3));
    if (fr) {
      const pad = 12; finder.style.transform = `translate(${(fr[0] - pad).toFixed(1)}px, ${(fr[1] - pad).toFixed(1)}px)`;
      finder.style.width = `${(fr[2] + 2 * pad).toFixed(1)}px`; finder.style.height = `${(fr[3] + 2 * pad).toFixed(1)}px`;
    }
    finder.style.setProperty("--f", (fr ? fo : 0).toFixed(3));
    if (p < 0.94) stopFilm();
  }
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", () => { measure(); ask(); });
  addEventListener("orientationchange", () => { measure(); ask(); });
  addEventListener("pageshow", ask);
  for (const img of stage.querySelectorAll("img")) if (!img.complete) img.addEventListener("load", ask, { once: true });
  document.fonts?.ready?.then(() => { measure(); ask(); });
  measure();
  if (fixed !== null) { const go = () => scrollTo(0, story.offsetTop + fixed * (story.offsetHeight - innerHeight)); go(); requestAnimationFrame(go); setTimeout(go, 300); }
  frame();
  window.__story = { ready: () => (gl ? gl.ready() : true) && [...stage.querySelectorAll("img")].every((i) => i.complete), progress: () => p };
}

// =====================================================================================
// The lens, the brackets and the eye
// =====================================================================================
const DOT_GLSL = /* glsl */`
  uniform sampler2D uDots; uniform vec2 uFirst; uniform float uPitch;
  float dotCov(vec2 p, float aa) {
    vec2 c0 = floor((p - uFirst) / uPitch + 0.5); float a = 0.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 c = c0 + vec2(float(i), float(j));
      if (c.x < 0.0 || c.y < 0.0 || c.x > 60.0 || c.y > 39.0) continue;
      vec4 d = texelFetch(uDots, ivec2(c), 0);
      if (d.z <= 0.0) continue;
      a = max(a, 1.0 - smoothstep(d.z - aa, d.z + aa, length(p - d.xy)));
    }
    return a;
  }`;

function makeLens(canvas, onLoad) {
  if (q.get("gl") === "off") return null;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc8d6ea, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 4, 6); scene.add(key);
  let W = 1, H = 1, tall = false, pending = 3;
  const done = () => { pending--; onLoad(); };

  const dotsTex = new THREE.DataTexture(new Float32Array(61 * 40 * 4), 61, 40, THREE.RGBAFormat, THREE.FloatType);
  const shared = { uDots: { value: dotsTex }, uFirst: { value: new THREE.Vector2(14.33558, 12.93001) }, uPitch: { value: 12.38538 } };
  fetch("assets/eye-dots.json").then((r) => r.json()).then((d) => {
    const a = dotsTex.image.data; for (let k = 0; k < 61 * 40; k++) { a[k * 4] = d.cells[k * 3]; a[k * 4 + 1] = d.cells[k * 3 + 1]; a[k * 4 + 2] = d.cells[k * 3 + 2]; a[k * 4 + 3] = 1; }
    dotsTex.needsUpdate = true; done();
  });

  // the eye: the halftone, drawn dot by dot from the vector table
  const eyeMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { ...shared, uOpacity: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: DOT_GLSL + `
      varying vec2 vUv; uniform float uOpacity;
      void main(){ vec2 p = vec2(vUv.x * 770.0, (1.0 - vUv.y) * 510.0); float aa = max(fwidth(p.x), 0.02) * 0.9;
        float c = dotCov(p, aa); if (c < 0.004) discard; gl_FragColor = vec4(vec3(14.0, 65.0, 148.0) / 255.0, c * uOpacity); }`,
  });
  const eye = new THREE.Mesh(new THREE.PlaneGeometry(EW, EH), eyeMat); eye.renderOrder = 1; scene.add(eye);

  // the lens: its own outline and its own gloss; through it, the eye, magnified
  const lensGroup = new THREE.Group(); scene.add(lensGroup);
  let lens = null, lensAsp = 0.88;
  const artTex = new THREE.TextureLoader().load("assets/lens-art.webp", done); artTex.colorSpace = THREE.SRGBColorSpace;
  const lensUni = { ...shared, uArt: { value: artTex }, uEyeInv: { value: new THREE.Matrix4() }, uEyeSize: { value: new THREE.Vector2(EW, EH) },
    uLensC: { value: new THREE.Vector3() }, uM: { value: M }, uTint: { value: 0 }, uOpacity: { value: 1 }, uAsp: { value: lensAsp } };
  const lensFront = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: lensUni,
    vertexShader: `varying vec3 vW; varying vec3 vL; varying float vF;
      void main(){ vL = position; vF = normal.z; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: DOT_GLSL + `
      varying vec3 vW; varying vec3 vL; varying float vF;
      uniform sampler2D uArt; uniform mat4 uEyeInv; uniform vec2 uEyeSize; uniform vec3 uLensC; uniform float uM, uTint, uOpacity, uAsp;
      vec2 onEye(vec3 from, vec3 to){ vec3 c = (uEyeInv * vec4(from, 1.0)).xyz; vec3 d = (uEyeInv * vec4(to - from, 0.0)).xyz; return (c + d * (-c.z / d.z)).xy; }
      void main(){
        if (vF < 0.5) discard;                                   // the front face only
        vec4 art = texture2D(uArt, vec2(vL.x * 0.5 + 0.5, 0.5 + vL.y / (2.0 * uAsp)));
        vec2 hit = onEye(cameraPosition, vW), hl = onEye(cameraPosition, uLensC);
        vec2 qq = hl + (hit - hl) / uM;                          // the lens magnifies about its own axis
        vec2 p = vec2((qq.x / uEyeSize.x + 0.5) * 770.0, (0.5 - qq.y / uEyeSize.y) * 510.0);
        float aa = max(fwidth(p.x), 0.02) * 0.9;
        float c = (p.x > 0.0 && p.x < 770.0 && p.y > 0.0 && p.y < 510.0) ? dotCov(p, aa) : 0.0;
        vec3 col = mix(art.rgb, vec3(0.09, 0.40, 0.78), c * 0.92);
        float gloss = smoothstep(0.86, 0.98, dot(art.rgb, vec3(0.333)));
        col = mix(col, vec3(1.0), gloss * 0.35);
        col = mix(col, col * vec3(0.40, 0.42, 0.45), uTint);    // PhotoFusion X: darkens in light
        gl_FragColor = vec4(col, art.a * uOpacity);
      }`,
  });
  const lensSide = new THREE.MeshStandardMaterial({ color: 0x3d93ee, roughness: 0.25, metalness: 0.05, transparent: true });
  fetch("assets/lens-outline.json").then((r) => r.json()).then(({ polygon, aspect }) => {
    lensAsp = aspect; lensUni.uAsp.value = aspect;
    const shape = new THREE.Shape(polygon.map(([x, y]) => new THREE.Vector2(x * 2, y * 2)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.035, bevelSegments: 6, curveSegments: 4 });
    geo.translate(0, 0, -0.015 - 0.06 + 0.06);
    lens = new THREE.Mesh(geo, [lensFront, lensSide]); lens.renderOrder = 3; lensGroup.add(lens); done();
  });

  // the brackets, measured from the board, in the board's navy
  const bMat = new THREE.MeshStandardMaterial({ color: 0x0e4194, roughness: 0.5, transparent: true });
  const brackets = BRACKETS.map((d) => {
    const s = new THREE.Shape(); const a = d.arm, t = d.th;
    s.moveTo(0, 0); s.lineTo(a, 0); s.lineTo(a, -t); s.lineTo(t, -t); s.lineTo(t, -a); s.lineTo(0, -a); s.closePath();
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }), bMat); m.rotation.z = d.rot; m.userData = d; m.renderOrder = 4; scene.add(m); return m;
  });

  function compose(p, light) {
    const a = seg(p, 0.13, 0.27);              // the lens onto the axis
    const ae = seg(p, 0.11, 0.25);             // the eye behind it
    const ab = seg(p, 0.17, 0.29);             // the brackets to their corners
    const front = seg(p, 0.12, 0.30);          // the camera comes round to front-on
    const sp = tall ? 0.58 : 1;
    // lens: from the left of the row, turned, forward → on the axis
    lensGroup.position.set(lerp(-2.15 * sp, 0, a), lerp(tall ? 1.35 : 0, 0, a), lerp(0.55, 0.06, a));
    lensGroup.rotation.set(lerp(-0.12, 0, a), lerp(0.55, 0, a), 0);
    lensGroup.scale.setScalar(lerp(tall ? 0.72 : 0.92, 1, a));
    // eye: from the right of the row → just behind the lens, then it gives way
    eye.position.set(lerp(2.2 * sp, EYE_AT[0], ae), lerp(tall ? -1.35 : 0, EYE_AT[1], ae), lerp(-0.35, -0.32, ae));
    eye.rotation.y = lerp(-0.3, 0, ae);
    eye.scale.setScalar(lerp(tall ? 0.72 : 0.9, 1, ae));
    eyeMat.uniforms.uOpacity.value = 1 - seg(p, 0.425, 0.46);
    // brackets: the small frame in the middle of the row → the corners, in front
    brackets.forEach((m, i) => {
      const d = m.userData, k = lerp(0.5, 1, ab);
      m.position.set(d.at[0] * k, d.at[1] * k, lerp(i % 2 ? -0.2 : 0.3, 0.14, ab));
      m.scale.setScalar(lerp(0.62, 1, ab));
    });
    bMat.opacity = 1;
    lensUni.uTint.value = light * 0.78;
    // camera: a three-quarter view of the row that comes round to front-on
    const yaw = lerp(0.52, 0, front), pitch = lerp(0.2, 0, front);
    const extW = lerp(tall ? 4.6 : 6.9, 2.55, smooth(clamp((p - 0.1) / 0.2))), extH = lerp(tall ? 4.4 : 2.3, 1.9, smooth(clamp((p - 0.1) / 0.2)));
    const free = tall ? [0.05, 0.95, 0.42, 0.95] : [0.39, 0.97, 0.12, 0.9];
    const fw = free[1] - free[0], fh = free[3] - free[2], k30 = 2 * Math.tan((30 * Math.PI) / 360);
    const dist = Math.max(extW / (fw * (W / H)), extH / fh) / k30 * lerp(1, 0.94, seg(p, 0.3, 0.42));
    camera.aspect = W / H; camera.fov = 30;
    camera.position.set(dist * Math.sin(yaw) * Math.cos(pitch), dist * Math.sin(pitch), dist * Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(W, H, -((free[0] + free[1]) / 2 - 0.5) * W, -((free[2] + free[3]) / 2 - 0.5) * H, W, H);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
    scene.updateMatrixWorld(true);
    lensUni.uEyeInv.value.copy(eye.matrixWorld).invert();
    lensUni.uLensC.value.setFromMatrixPosition(lensGroup.matrixWorld);
  }
  // the lens art box on screen (for laying the original artwork exactly over the model)
  const v = new THREE.Vector3();
  function lensRect() {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [x, y] of [[-1, lensAsp], [1, lensAsp], [-1, -lensAsp], [1, -lensAsp]]) {
      v.set(x, y, 0.06).applyMatrix4(lensGroup.matrixWorld).project(camera);
      const sx = (v.x * 0.5 + 0.5) * W, sy = (-v.y * 0.5 + 0.5) * H;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    return [x0, y0, x1 - x0, y1 - y0];
  }
  let lost = false;
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; });
  canvas.addEventListener("webglcontextrestored", () => { lost = false; onLoad(); });
  return {
    resize(w, h, t) { W = w; H = h; tall = t; renderer.setSize(w, h, false); },
    pose(p, light) { compose(p, light); return lens ? lensRect() : null; },
    render(p, light) { compose(p, light); if (!lost && lens) renderer.render(scene, camera); return lens ? lensRect() : null; },
    ready: () => pending <= 0,
  };
}

if (motionMode() === "full") initLive();
