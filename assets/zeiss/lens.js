// ZEISS: the concept board as a live object. Adapted from lane C's story scene (cases/zeiss/scene.js).
// The halftone eye is drawn by the shader from the 2,440 vector dots of the original board; the lens is the drawn
// lens (its own outline and gloss) and shows the same eye magnified by the board's own ratio (1.293); the brackets
// are measured from the board. As the section scrolls in, the three parts on the row come together into one picture;
// the pointer turns the object a few degrees, so the eye can be looked at through the lens.
import * as THREE from "../../vendor/three.module.min.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;

const F = 2 / 1882;
const LENS_C = [297 + 941, 47 + 830.5];
const M = 3.3197 / 2.5675;
const EW = 770 * 3.3197 * F / M;
const EH = EW * 510 / 770;
const EYE_AT = [(1328.5 - LENS_C[0]) * F / M, 0];
const cw = (x, y) => [(x - LENS_C[0]) * F, -(y - LENS_C[1]) * F];
const BRACKETS = [
  { at: cw(117, 46), arm: 397 * F, th: 103 * F, rot: 0 },
  { at: cw(2251, 107), arm: 336 * F, th: 41 * F, rot: -Math.PI / 2 },
  { at: cw(178, 1552), arm: 336 * F, th: 41 * F, rot: Math.PI / 2 },
  { at: cw(2251, 1552), arm: 336 * F, th: 41 * F, rot: Math.PI },
];
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

const box = document.querySelector(".lens");
const canvas = box && box.querySelector("canvas");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const BASE = box ? box.dataset.base : "";

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return false; }
  if (!renderer.getContext()) return false;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc8d6ea, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 4, 6); scene.add(key);
  let W = 1, H = 1, tall = false, pending = 3, p = 0, target = 0, px = 0, py = 0, tx = 0, ty = 0, raf = 0;
  const done = () => { pending--; ask(); if (pending <= 0) box.classList.add("live"); };

  const dotsTex = new THREE.DataTexture(new Float32Array(61 * 40 * 4), 61, 40, THREE.RGBAFormat, THREE.FloatType);
  const shared = { uDots: { value: dotsTex }, uFirst: { value: new THREE.Vector2(14.33558, 12.93001) }, uPitch: { value: 12.38538 } };
  fetch(BASE + "eye-dots.json").then((r) => r.json()).then((d) => {
    const a = dotsTex.image.data; for (let k = 0; k < 61 * 40; k++) { a[k * 4] = d.cells[k * 3]; a[k * 4 + 1] = d.cells[k * 3 + 1]; a[k * 4 + 2] = d.cells[k * 3 + 2]; a[k * 4 + 3] = 1; }
    dotsTex.needsUpdate = true; done();
  });
  const eyeMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { ...shared, uOpacity: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: DOT_GLSL + `
      varying vec2 vUv; uniform float uOpacity;
      void main(){ vec2 p = vec2(vUv.x * 770.0, (1.0 - vUv.y) * 510.0); float aa = max(fwidth(p.x), 0.02) * 0.9;
        float c = dotCov(p, aa); if (c < 0.004) discard; gl_FragColor = vec4(vec3(14.0, 65.0, 148.0) / 255.0, c * uOpacity); }`,
  });
  const eye = new THREE.Mesh(new THREE.PlaneGeometry(EW, EH), eyeMat); scene.add(eye);

  const lensGroup = new THREE.Group(); scene.add(lensGroup);
  let lens = null;
  const artTex = new THREE.TextureLoader().load(BASE + "lens-art.webp", done); artTex.colorSpace = THREE.SRGBColorSpace;
  const lensUni = { ...shared, uArt: { value: artTex }, uEyeInv: { value: new THREE.Matrix4() }, uEyeSize: { value: new THREE.Vector2(EW, EH) },
    uLensC: { value: new THREE.Vector3() }, uM: { value: M }, uAsp: { value: 0.88 } };
  const lensFront = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: lensUni,
    vertexShader: `varying vec3 vW; varying vec3 vL; varying float vF;
      void main(){ vL = position; vF = normal.z; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: DOT_GLSL + `
      varying vec3 vW; varying vec3 vL; varying float vF;
      uniform sampler2D uArt; uniform mat4 uEyeInv; uniform vec2 uEyeSize; uniform vec3 uLensC; uniform float uM, uAsp;
      vec2 onEye(vec3 from, vec3 to){ vec3 c = (uEyeInv * vec4(from, 1.0)).xyz; vec3 d = (uEyeInv * vec4(to - from, 0.0)).xyz; return (c + d * (-c.z / d.z)).xy; }
      void main(){
        if (vF < 0.5) discard;
        vec4 art = texture2D(uArt, vec2(vL.x * 0.5 + 0.5, 0.5 + vL.y / (2.0 * uAsp)));
        vec2 hit = onEye(cameraPosition, vW), hl = onEye(cameraPosition, uLensC);
        vec2 qq = hl + (hit - hl) / uM;
        vec2 p = vec2((qq.x / uEyeSize.x + 0.5) * 770.0, (0.5 - qq.y / uEyeSize.y) * 510.0);
        float aa = max(fwidth(p.x), 0.02) * 0.9;
        float c = (p.x > 0.0 && p.x < 770.0 && p.y > 0.0 && p.y < 510.0) ? dotCov(p, aa) : 0.0;
        vec3 col = mix(art.rgb, vec3(0.09, 0.40, 0.78), c * 0.92);
        float gloss = smoothstep(0.86, 0.98, dot(art.rgb, vec3(0.333)));
        col = mix(col, vec3(1.0), gloss * 0.35);
        gl_FragColor = vec4(col, art.a);
      }`,
  });
  const lensSide = new THREE.MeshStandardMaterial({ color: 0x3d93ee, roughness: 0.25, metalness: 0.05, transparent: true });
  fetch(BASE + "lens-outline.json").then((r) => r.json()).then(({ polygon, aspect }) => {
    lensUni.uAsp.value = aspect;
    const shape = new THREE.Shape(polygon.map(([x, y]) => new THREE.Vector2(x * 2, y * 2)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.035, bevelSegments: 6, curveSegments: 4 });
    geo.translate(0, 0, -0.015);
    lens = new THREE.Mesh(geo, [lensFront, lensSide]); lens.renderOrder = 3; lensGroup.add(lens); done();
  });
  const bMat = new THREE.MeshStandardMaterial({ color: 0x0e4194, roughness: 0.5 });
  const brackets = BRACKETS.map((d) => {
    const s = new THREE.Shape(); const a = d.arm, t = d.th;
    s.moveTo(0, 0); s.lineTo(a, 0); s.lineTo(a, -t); s.lineTo(t, -t); s.lineTo(t, -a); s.lineTo(0, -a); s.closePath();
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }), bMat); m.rotation.z = d.rot; m.userData = d; m.renderOrder = 4; scene.add(m); return m;
  });

  // p: 0 = the three parts on the row (as on the board), 1 = one picture. Pointer: a few degrees of turn.
  function compose() {
    const a = seg(p, 0.05, 0.85), ae = seg(p, 0.0, 0.75), ab = seg(p, 0.2, 1.0), front = seg(p, 0.1, 1.0);
    const sp = tall ? 0.58 : 1;
    lensGroup.position.set(lerp(-2.15 * sp, 0, a), lerp(tall ? 1.35 : 0, 0, a), lerp(0.55, 0.06, a));
    lensGroup.rotation.set(lerp(-0.12, 0, a), lerp(0.55, 0, a), 0);
    lensGroup.scale.setScalar(lerp(tall ? 0.72 : 0.92, 1, a));
    eye.position.set(lerp(2.2 * sp, EYE_AT[0], ae), lerp(tall ? -1.35 : 0, EYE_AT[1], ae), lerp(-0.35, -0.32, ae));
    eye.rotation.y = lerp(-0.3, 0, ae);
    eye.scale.setScalar(lerp(tall ? 0.72 : 0.9, 1, ae));
    eyeMat.uniforms.uOpacity.value = lerp(1, 0.55, seg(p, 0.7, 1));
    brackets.forEach((m, i) => {
      const d = m.userData, k = lerp(0.5, 1, ab);
      m.position.set(d.at[0] * k, d.at[1] * k, lerp(i % 2 ? -0.2 : 0.3, 0.14, ab));
      m.scale.setScalar(lerp(0.62, 1, ab));
    });
    const yaw = lerp(0.52, 0, front) + px * 0.16, pitch = lerp(0.2, 0, front) - py * 0.1;
    const extW = lerp(tall ? 4.6 : 6.9, 2.75, front), extH = lerp(tall ? 4.4 : 2.3, 2.2, front);
    const k30 = 2 * Math.tan((30 * Math.PI) / 360);
    const dist = Math.max(extW / (0.9 * (W / H)), extH / 0.86) / k30;
    camera.aspect = W / H; camera.fov = 30;
    camera.position.set(dist * Math.sin(yaw) * Math.cos(pitch), dist * Math.sin(pitch), dist * Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
    scene.updateMatrixWorld(true);
    lensUni.uEyeInv.value.copy(eye.matrixWorld).invert();
    lensUni.uLensC.value.setFromMatrixPosition(lensGroup.matrixWorld);
  }
  function measure() { W = box.clientWidth; H = box.clientHeight; tall = W < 700 || W / H < 1.05; renderer.setSize(W, H, false); }
  function progress() {
    if (reduce) return 1;
    const r = box.getBoundingClientRect(), vh = innerHeight;
    return clamp((vh - r.top) / (vh * 0.62 + r.height * 0.55) - 0.12);  // assembled by the time it sits mid-screen
  }
  function frame() {
    raf = 0;
    target = progress();
    p += (target - p) * (reduce ? 1 : 0.12);
    px += (tx - px) * 0.08; py += (ty - py) * 0.08;
    compose(); if (lens) renderer.render(scene, camera);
    if (!reduce && (Math.abs(target - p) > 0.0005 || Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001)) ask();
  }
  function ask() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", () => { measure(); ask(); });
  if (!reduce) {
    box.addEventListener("pointermove", (e) => { const r = box.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; ask(); });
    box.addEventListener("pointerleave", () => { tx = 0; ty = 0; ask(); });
  }
  measure(); p = progress(); ask();
  return true;
}

if (box && canvas) {
  const go = () => { if (!start()) box.classList.add("no-gl"); };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: "400px 0px" });
    io.observe(box);
  } else go();
}
