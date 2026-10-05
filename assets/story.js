// Scrollytelling: WebGL energy line (clean lines, no glow; cyan leads, orange supports) and number unveil.
import * as THREE from '../vendor/three.module.min.js';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. WebGL energy line in the hero */
const host = document.querySelector('.h3line');
if (host && !reduce) {
  const wrap = document.createElement('div'); wrap.className = 'h3gl';
  host.replaceWith(wrap);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch (e) { wrap.replaceWith(host); renderer = null; }
  if (renderer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uni = { uT: { value: 0 }, uP: { value: 0 }, uR: { value: new THREE.Vector2(1, 1) } };
    const mat = new THREE.ShaderMaterial({ transparent: true, uniforms: uni,
      vertexShader: 'varying vec2 v; void main(){ v=uv; gl_Position=vec4(position,1.); }',
      fragmentShader: `precision highp float; varying vec2 v; uniform float uT,uP; uniform vec2 uR;
        float env(float x){ return smoothstep(.06,.45,x); }
        float line(float y, float c, float w){ float d=abs(y-c)*uR.y; return smoothstep(w,0.,d); }
        void main(){
          float x=v.x, y=v.y, e=env(x)*(.55+.45*uP);
          float a=.30*e*sin(6.2832*1.35*x+uT*.55+.4)+.04*sin(6.2832*3.1*x-uT*.8)*e;
          float b=-.24*e*sin(6.2832*1.35*x+uT*.55+1.0)+.03*sin(6.2832*2.4*x+uT*.6)*e;
          float cy=.5+a*.82, oy=.5+b*.82;
          vec3 cyan=vec3(0.,.784,.843), orng=vec3(1.,.42,.17);
          float cc=line(y,cy,1.7), oc=line(y,oy,1.3);
          float draw=smoothstep(x-.02,x,uP*1.25+.15);
          vec3 col=mix(orng,cyan,clamp(cc*1.5,0.,1.));
          float al=clamp(cc+oc,0.,1.)*draw;
          gl_FragColor=vec4(col,al);
        }` });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const size = () => { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); uni.uR.value.set(w, h); };
    size(); addEventListener('resize', size);
    let vis = true; new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(wrap);
    const t0 = performance.now();
    (function loop(now) {
      requestAnimationFrame(loop); if (!vis) return;
      const r = wrap.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (r.top) / (innerHeight * .9)));
      uni.uP.value += (Math.max(p, Math.min(1, (now - t0) / 1800)) - uni.uP.value) * .08;
      uni.uT.value = (now - t0) / 1000; renderer.render(scene, cam);
    })(t0);
  }
}

/* 2. Number unveil: cards rise in sequence and count up */
const cards = [...document.querySelectorAll('.nc')];
const fmt = (el) => { const b = el.querySelector('b'); const unit = b.querySelector('span'); const txt = b.childNodes[0].textContent; return { b, unit, txt }; };
const count = (c) => {
  const { b, unit, txt } = fmt(c); const m = txt.match(/^(\D*)([\d.]+)(\D*)$/); if (!m || reduce) return;
  const end = parseFloat(m[2]); const dur = 1100; const t0 = performance.now();
  const node = b.childNodes[0];
  (function step(n) { const k = Math.min(1, (n - t0) / dur); const e = 1 - Math.pow(1 - k, 3);
    node.textContent = m[1] + (Number.isInteger(end) ? Math.round(end * e) : (end * e).toFixed(1)) + m[3];
    if (k < 1) requestAnimationFrame(step); })(t0);
};
if (cards.length) {
  const box = document.querySelector('.ncards'); box.classList.add('armed');
  new IntersectionObserver((es, io) => { es.forEach(en => { if (!en.isIntersecting) return;
    cards.forEach((c, i) => setTimeout(() => { c.classList.add('on'); count(c); }, reduce ? 0 : i * 140));
    io.disconnect(); }); }, { threshold: .35 }).observe(box);
}
