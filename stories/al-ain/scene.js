// Innovation Month, Al Ain City Municipality, February 2024 (and the town halls of 2023, briefly).
// Visual rule: the box. The square of the month's mark becomes a box, and the boxes become a gate twelve metres wide.
// Four scenes, each a pure function of its own scroll progress:
//   cube  — the cube's five faces fold; four cubes stack into a totem            (WebGL)
//   rooms — the key visual in its layers, the stage as drawn, the three rooms     (DOM)
//   gate  — the mark's squares take depth and stack into the gate                 (WebGL)
//   site  — the roof and the street from above, the night build, the open gate   (DOM)
import * as THREE from "./vendor/three.module.min.js";
import { clamp, seg, lin, lerp, createScrollController, createBeats, createFilm,
         initMotion, motionMode, onMotionChange, webglOK, reviewJump } from "./engine.js";

const A = "assets/";
const HALF = Math.PI / 2;

// shared WebGL scaffolding: renderer, art area, resize, context loss, disposal
function glScene(section, { fov = 30, onBuild, onCompose, onResize }) {
  let canvas = section.querySelector("canvas.gl");
  const beats = createBeats(section);
  const S = { renderer: null, scene: null, camera: null, W: 1, H: 1, layout: "wide", p: 0, mounted: false, lost: false, ready: false, fw: 0.57, fh: 0.8, ox: 0, oy: 0 };
  const loader = new THREE.TextureLoader();
  S.tex = (url) => { const t = loader.load(A + url, render); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  // the smallest distance along `dir` from `tgt` at which every point lands inside the art area
  S.fit = (dir, tgt, pts, f = fov, k = 1) => {
    const cam = new THREE.PerspectiveCamera(f, S.W / S.H, 0.1, 300);
    const d3 = new THREE.Vector3(...dir).normalize(), t3 = new THREE.Vector3(...tgt), v = new THREE.Vector3();
    let d = 2;
    for (; d < 160; d += 0.2) {
      cam.position.copy(t3).addScaledVector(d3, d); cam.lookAt(t3); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      if (pts.every((q) => { v.set(...q).project(cam); return Math.abs(v.x) <= S.fw * k && Math.abs(v.y) <= S.fh * k && v.z < 1; })) break;
    }
    return { pos: cam.position.clone(), quat: cam.quaternion.clone(), fov: f };
  };
  S.pose = (a, b, t) => {
    S.camera.position.lerpVectors(a.pos, b.pos, t); S.camera.quaternion.slerpQuaternions(a.quat, b.quat, t);
    S.camera.fov = lerp(a.fov, b.fov, t); S.camera.aspect = S.W / S.H;
    S.camera.setViewOffset(S.W, S.H, S.ox, S.oy, S.W, S.H); S.camera.updateProjectionMatrix();
  };

  function mount() {
    if (S.mounted) return true;
    if (!webglOK()) return false;
    canvas = section.querySelector("canvas.gl");
    try { S.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); } catch { return false; }
    S.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    S.renderer.setClearColor(0x000000, 0);
    S.scene = new THREE.Scene(); S.camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 300);
    S.lost = false;   // a context given up in destroy() reports its loss late, on the old canvas
    canvas.addEventListener("webglcontextlost", (e) => { if (e.target !== canvas || !S.mounted) return; e.preventDefault(); S.lost = true; }, false);
    canvas.addEventListener("webglcontextrestored", (e) => { if (e.target !== canvas) return; S.lost = false; render(); }, false);
    S.mounted = true; S.ready = false;
    Promise.resolve(onBuild(S)).then(() => { if (!S.mounted) return; S.ready = true; resize(); });
    resize();
    return true;
  }
  function resize() {
    if (!S.mounted) return;
    S.W = canvas.clientWidth || section.clientWidth; S.H = canvas.clientHeight || window.innerHeight;
    S.renderer.setSize(S.W, S.H, false);
    S.layout = S.W / S.H >= 1.05 && S.W >= 768 ? "wide" : "tall";
    S.fw = S.layout === "wide" ? 0.55 : 0.86; S.fh = S.layout === "wide" ? 0.7 : 0.46;
    S.ox = S.layout === "wide" ? -S.W * 0.2 : 0; S.oy = S.layout === "wide" ? 0 : -S.H * 0.22;
    if (S.ready) onResize(S);
    render();
  }
  function render() {
    if (!S.mounted || S.lost) return;
    beats.set(S.p);
    if (!S.ready) return;
    onCompose(S, S.p);
    S.renderer.render(S.scene, S.camera);
  }
  function destroy() {
    if (!S.mounted) return;
    S.mounted = false; S.ready = false;
    S.renderer.dispose();
    S.scene.traverse((o) => { o.geometry?.dispose?.(); const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => { m?.map?.dispose?.(); m?.dispose?.(); }); });
    S.renderer.getContext().getExtension("WEBGL_lose_context")?.loseContext();
    canvas.replaceWith(canvas.cloneNode(false));          // a fresh canvas so the scene can mount again after "Motion on"
    beats.clear();
    for (const el of section.querySelectorAll(".plate")) { el.style.opacity = ""; el.style.removeProperty("--wipe"); el.classList.remove("on"); }
  }
  return { S, api: { mount, resize, destroy, setProgress(v) { S.p = v; render(); }, setActive() {} } };
}

// DOM plates inside a pinned scene arrive as a box growing from the corner, because the rule is the box
function plate(el, t) {
  el.style.opacity = t > 0 ? "1" : "0";
  el.style.setProperty("--wipe", (100 - 100 * t).toFixed(2) + "%");
  el.classList.toggle("on", t > 0.5);
}

// ------------------------------------------------------------------------------------------------ the plaza
// The same forecourt three times, each picture arriving as a box growing from its corner.
function createPlazaScene(section) {
  const beats = createBeats(section), pics = [...section.querySelectorAll(".pics img")], caps = [...section.querySelectorAll(".cap")];
  const n = pics.length;
  let p = 0;
  function apply() {
    const x = lin(p, 0.06, 0.9) * (n - 1);
    pics.forEach((el, i) => {
      const t = i === 0 ? 1 : seg(x, i - 0.7, i - 0.1);
      el.style.setProperty("--wipe", (100 - 100 * t).toFixed(2) + "%");
      el.style.visibility = t > 0 ? "visible" : "hidden";
    });
    const top = Math.round(x);
    caps.forEach((c, i) => { c.style.opacity = i === top ? "1" : "0"; });
    beats.set(p);
  }
  return {
    mount() { return true; }, resize: apply, setProgress(v) { p = v; apply(); }, setActive() {},
    destroy() { pics.forEach((el) => { el.style.removeProperty("--wipe"); el.style.visibility = ""; }); caps.forEach((c) => (c.style.opacity = "")); beats.clear(); },
  };
}

// ------------------------------------------------------------------------------------------------ 3 · the gate
function createGateScene(section) {
  const plates = [...section.querySelectorAll(".plate")];
  const poses = {}, dummy = new THREE.Object3D(), col = new THREE.Color();
  let mark, gate, boxes, ground, boards = [], hemi, cells = [], targets = [], canvasEl;
  const U = 0.3;                                                   // one square of the mark, in metres of the scene
  const rand = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const { S, api } = glScene(section, {
    fov: 30,
    async onBuild(S) {
      [mark, gate] = await Promise.all([fetch(A + "mark-grid.json").then((r) => r.json()), fetch(A + "gate-grid.json").then((r) => r.json())]);
      hemi = new THREE.HemisphereLight(0xffffff, 0xb9c4ea, 1.2); S.scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(-6, 9, 10); S.scene.add(key);
      // every square of the mark is one box. Those nearest the middle go on to build the gate; the others step back.
      const cx = (mark.cols - 1) / 2, cy = (mark.rows - 1) / 2;
      cells = mark.cells.map(([i, j, hex], k) => ({ x: (i - cx) * U, y: (cy - j) * U + 2.2, hex, k, d: Math.hypot(i - cx, (j - cy) * 1.4) }));
      const order = [...cells].sort((a, b) => a.d - b.d);
      const G = gate.cells.map(([c, r, hex], k) => ({
        x: (c - (gate.cols - 1) / 2) * gate.box_m + (r % 2 ? 0.18 : -0.12), y: r * gate.box_m + gate.box_m / 2,
        z: (rand(k + 3) - 0.5) * 0.5, s: gate.box_m * (0.98 + rand(k + 11) * 0.16), hex,
      })).sort((a, b) => a.y - b.y || Math.abs(a.x) - Math.abs(b.x));       // the bottom row lands first
      order.forEach((c, n) => { c.to = n < G.length ? G[n] : null; c.rank = n; });
      targets = G;
      boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), cells.length);
      boxes.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cells.length * 3), 3);
      S.scene.add(boxes);
      // the forecourt: a soft patch of paving under the gate, not a horizon
      const gc = document.createElement("canvas"); gc.width = gc.height = 256;
      const gx = gc.getContext("2d"), gr = gx.createRadialGradient(128, 128, 10, 128, 128, 128);
      gr.addColorStop(0, "rgba(120,128,160,.55)"); gr.addColorStop(0.6, "rgba(120,128,160,.28)"); gr.addColorStop(1, "rgba(120,128,160,0)");
      gx.fillStyle = gr; gx.fillRect(0, 0, 256, 256);
      ground = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, opacity: 0, depthWrite: false }));
      ground.rotation.x = -HALF; ground.position.set(0, 0.001, 1.5); S.scene.add(ground);
      boards = [];                                                 // the header boards carry Arabic lettering; left plain
    },
    onResize(S) {
      const w = (mark.cols * U) / 2 + 0.2, h = (mark.rows * U) / 2 + 0.2;
      poses.mark = S.fit([0, 0, 1], [0, 2.2, 0], [[-w, 2.2 - h, 0], [w, 2.2 - h, 0], [-w, 2.2 + h, 0], [w, 2.2 + h, 0]]);
      poses.depth = S.fit([0.62, 0.3, 1], [0, 2.2, 0], [[-w, 2.2 - h, -0.3], [w, 2.2 - h, 0.3], [-w, 2.2 + h, 0.3], [w, 2.2 + h, -0.3]]);
      const gp = [[-6.4, 0, 0.8], [6.4, 0, 0.8], [-6.4, 4.4, -0.8], [6.4, 4.4, -0.8], [6.4, 4.4, 0.8], [-6.4, 0, -0.8]];
      poses.gate = S.fit([-0.5, 0.2, 1], [0, 2, 0], gp);
      poses.front = S.fit([0, 0.05, 1], [0, 2, 0], gp);
    },
    onCompose(S, p) {
      const deep = seg(p, 0.14, 0.30), build = lin(p, 0.34, 0.62), front = seg(p, 0.66, 0.76), away = seg(p, 0.78, 0.86);
      if (p < 0.34) S.pose(poses.mark, poses.depth, deep);
      else if (front <= 0) S.pose(poses.depth, poses.gate, seg(p, 0.34, 0.60));
      else S.pose(poses.gate, poses.front, front);
      cells.forEach((c, i) => {
        let x = c.x, y = c.y, z = 0, sx = U * 0.985, sz = lerp(0.02, U * 0.985, deep), rot = 0;
        if (c.to) {
          const t0 = (c.rank / targets.length) * 0.7, t = seg(build, t0, t0 + 0.3);
          x = lerp(c.x, c.to.x, t); y = lerp(c.y, c.to.y, t) + Math.sin(t * Math.PI) * 1.1; z = lerp(0, c.to.z, t);
          sx = lerp(sx, c.to.s, t); sz = lerp(sz, c.to.s, t); rot = (1 - t) * t * 2.4;
          col.set(c.hex).lerp(new THREE.Color(c.to.hex), t);
        } else {
          const t = seg(build, 0.0, 0.35 + rand(i) * 0.3);
          z = -t * 6; sx *= 1 - t; sz *= 1 - t; col.set(c.hex);
        }
        dummy.position.set(x, y, z); dummy.rotation.set(0, rot, 0); dummy.scale.set(Math.max(sx, 0.0001), Math.max(sx, 0.0001), Math.max(sz, 0.0001));
        dummy.updateMatrix(); boxes.setMatrixAt(i, dummy.matrix); boxes.setColorAt(i, col);
      });
      boxes.instanceMatrix.needsUpdate = true; boxes.instanceColor.needsUpdate = true;
      ground.material.opacity = seg(p, 0.40, 0.56); ground.visible = ground.material.opacity > 0;
      boards.forEach((m) => { m.material.opacity = seg(p, 0.60, 0.68); m.visible = m.material.opacity > 0; });
      canvasEl = canvasEl?.isConnected ? canvasEl : section.querySelector("canvas.gl");
      canvasEl.style.opacity = (1 - away).toFixed(3);
      plate(plates[0], seg(p, 0.78, 0.88));
      plate(plates[1], seg(p, 0.90, 0.98));
      if (p > 0.9) plates[0].classList.toggle("on", seg(p, 0.90, 0.98) < 0.5);     // one caption at a time
    },
  });
  return api;
}

// ------------------------------------------------------------------------------------------------ 4 · the site
function createSiteScene(section) {
  const beats = createBeats(section), roof = section.querySelector(".roof"), floor = section.querySelector(".floor");
  const tops = section.querySelector(".tops"), proof = section.querySelector(".proof"), shots = [...section.querySelectorAll(".proof .shot")];
  let p = 0;
  function apply() {
    const lift = seg(p, 0.12, 0.34), out = seg(p, 0.42, 0.50), inn = seg(p, 0.46, 0.56);
    roof.style.transform = `translate(${(6 * lift).toFixed(2)}%, ${(-38 * lift).toFixed(2)}%) scale(${(1 + 0.06 * lift).toFixed(3)})`;   // the roof lifts off the street
    roof.style.opacity = (1 - seg(p, 0.20, 0.36)).toFixed(3);
    tops.style.opacity = (1 - out).toFixed(3); tops.style.visibility = out < 1 ? "visible" : "hidden";
    proof.style.opacity = inn.toFixed(3); proof.style.visibility = inn > 0 ? "visible" : "hidden";
    shots.forEach((el, i) => {
      const t = seg(p, 0.50 + i * 0.13, 0.60 + i * 0.13);
      el.style.opacity = t.toFixed(3); el.style.transform = `translateY(${(24 * (1 - t)).toFixed(1)}px)`;
    });
    beats.set(p);
  }
  return {
    mount() { return true; }, resize: apply, setProgress(v) { p = v; apply(); }, setActive() {},
    destroy() { for (const el of [roof, floor, tops, proof, ...shots]) { el.style.transform = ""; el.style.opacity = ""; el.style.visibility = ""; } beats.clear(); },
  };
}

// ------------------------------------------------------------------------------------------------ start
initMotion();
const controller = createScrollController();
const gl = webglOK();
const add = (name, make, needsGL) => { const el = document.querySelector(`[data-scene='${name}']`); if (el && (!needsGL || gl)) controller.add(el, make(el)); };

add("gate", createGateScene, true);
add("site", createSiteScene, false);
add("proofplaza", createPlazaScene, false);
for (const h of document.querySelectorAll(".film-holder")) createFilm(h, { play: h.dataset.play || "Play the film", stop: "Stop" });
const sync = () => controller.setEnabled(motionMode() === "full");
sync(); onMotionChange(sync);
reviewJump();
document.documentElement.classList.add("js");
