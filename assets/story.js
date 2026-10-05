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

/* 2. Numbers told by scrolling: one number on stage at a time, with its work beside it */
const story = document.querySelector('.nstory');
if (story && !reduce) {
  const steps = [...story.querySelectorAll('.nstep')], media = [...story.querySelectorAll('.nmedia')], ticks = [...story.querySelectorAll('.nticks li')];
  let cur = -1;
  const countUp = (el) => { const b = el.querySelector('.nbig b'); const txt = b.getAttribute('data-n'); const m = txt.match(/^(\D*)([\d.]+)(\D*)$/); if (!m) return;
    const end = parseFloat(m[2]), t0 = performance.now(), dur = 900;
    (function f(n) { const k = Math.min(1, (n - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = m[1] + Math.round(end * e) + m[3]; if (k < 1) requestAnimationFrame(f); })(t0); };
  const set = (i) => { if (i === cur) return; cur = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    media.forEach((m, k) => { m.classList.toggle('on', k === i); m.classList.toggle('past', k < i);
      const v = m.querySelector('video'); if (v) { if (k === i) { { const ds = v.getAttribute('data-src'), tm = ds.match(/#t=([\d.]+)/); if (tm && !v._t) { v._t = parseFloat(tm[1]); v.loop = false; v.addEventListener('loadedmetadata', () => { try { if (v.currentTime < v._t - 1) v.currentTime = v._t; } catch (e) {} }); v.addEventListener('ended', () => { try { v.currentTime = v._t; v.play(); } catch (e) {} }); } if (!v.getAttribute('src')) v.src = ds; } v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); } else { v.pause(); if (v.getAttribute('src')) { v.removeAttribute('src'); v.load(); } } } });
    ticks.forEach((t, k) => { t.classList.toggle('on', k === i); t.classList.toggle('done', k < i); });
    if (i >= 0) countUp(steps[i]); };
  const onScroll = () => { const r = story.getBoundingClientRect(); const total = r.height - innerHeight; const p = Math.min(0.9999, Math.max(0, -r.top / total));
    set(r.top > innerHeight * 0.6 ? -1 : Math.floor(p * steps.length)); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
}
