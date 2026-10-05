// Liwa International Festival — Ready?!
// Four pinned chapters. Every pose is a pure function of the chapter's scroll progress p (0..1): no timers,
// no smoothing, no scroll hijack; scrolling back returns exactly. The rule of motion is the festival's own:
// a start. Things wait on the line, the lights count, then they go, left to right, inside a wide film band.
// Review aid: ?ch=plan&p=0.5 · ?motion=off
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lin = (p, a, b) => clamp((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const band = (p, a, b, f = 0.03) => clamp(Math.min(a <= 0 ? 1 : (p - a) / f, b >= 1 ? 1 : (b - p) / f));
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const q = new URLSearchParams(location.search);
const FULL = document.documentElement.dataset.motion === "full";

function layout() {
  const w = document.documentElement.clientWidth, h = window.innerHeight;
  const g = clamp(w * 0.04, 18, 64), wide = w >= 768 && w / h >= 1.05, gap = Math.max(8, w * 0.011);
  // the film band: the commercial's own 2.35:1 picture, as wide as the window
  const bw = wide ? Math.min(w, h * 0.6 * (1600 / 680)) : w, bh = bw / (1600 / 680), band = { x: (w - bw) / 2, y: wide ? h * 0.12 : h * 0.34, w: bw, h: bh };
  // the region pictures are fitted into, beside or under the words
  const R = wide ? { x: w * 0.4, y: h * 0.13, w: w - g - w * 0.4, h: h * 0.74 } : { x: g, y: h * 0.36, w: w - 2 * g, h: h * 0.56 };
  return { w, h, g, wide, gap, band, R };
}
function place(el, x, y, s, o) {
  el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`;
  if (o !== undefined) { el.style.opacity = o.toFixed(3); el.style.pointerEvents = o <= 0.5 ? "none" : ""; }
}
function fit(R, ar) { const w = Math.min(R.w, R.h * ar), h = w / ar; return { x: R.x + (R.w - w) / 2, y: R.y + (R.h - h) / 2, w, h }; }
function loadImages(el) { for (const img of $$("img[data-src]", el)) { img.src = img.dataset.src; img.removeAttribute("data-src"); } }

// ---------------------------------------------------------------- 1 · ready: the commercial, frame by frame
function ready(el) {
  const N = 96, canvas = $("canvas", el), ctx = canvas.getContext("2d"), lights = $$(".lights i", el), frames = new Array(N).fill(null);
  let L, p = 0, last = -1, dpr = 1;
  function mount() { let i = 0; const next = () => { if (i >= N) return; const k = i++, im = new Image(); im.decoding = "async"; im.onload = () => { frames[k] = im; if (k === 0 || k === index(p)) { last = -1; draw(); } next(); }; im.onerror = next; im.src = `assets/tvc/f-${String(k + 1).padStart(3, "0")}.webp`; }; next(); next(); next(); }
  const index = (p) => Math.round(lin(p, 0.02, 0.95) * (N - 1));
  function nearest(i) { for (let k = i; k >= 0; k--) if (frames[k]) return frames[k]; for (let k = i; k < N; k++) if (frames[k]) return frames[k]; return null; }
  function resize(l) { L = l; dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(L.band.w * dpr); canvas.height = Math.round(L.band.h * dpr); canvas.style.width = L.band.w + "px"; canvas.style.height = L.band.h + "px"; place(canvas, L.band.x, L.band.y, 1); last = -1; draw(); }
  function draw() { if (!L) return; const i = index(p); if (i === last) return; const im = nearest(i); if (!im) return; ctx.drawImage(im, 0, 0, canvas.width, canvas.height); if (frames[i]) last = i; }
  function update(pp, l) { p = pp; L = l; draw(); lights.forEach((n, i) => n.classList.toggle("on", p >= 0.2 + i * 0.16)); lights.forEach((n) => n.classList.toggle("go", p >= 0.93)); }
  return { mount, resize, update };
}

// ---------------------------------------------------------------- 2 · the campaign: the key visual, then four starts
function campaign(el) {
  const kv = $("[data-kv]", el), cuts = $$("[data-cut]", el), ARS = [1600 / 1005, 1600 / 1121, 1600 / 974, 1600 / 920];
  let L, K, C;
  function resize(l) { L = l; K = fit(L.R, 1800 / 1150); kv.style.width = K.w + "px"; C = ARS.map((ar) => fit(L.R, ar)); cuts.forEach((c, i) => { c.style.width = C[i].w + "px"; }); }
  function update(p, l) {
    L = l;
    place(kv, K.x + (1 - seg(p, -0.1, 0.06)) * 40, K.y, 1, 1 - seg(p, 0.27, 0.32));
    cuts.forEach((c, i) => { const a = 0.3 + i * 0.175, t = seg(p, a, a + 0.06), out = i < 3 ? seg(p, a + 0.175, a + 0.235) : 0; place(c, C[i].x + (1 - t) * L.w * 0.5 - out * L.w * 0.3, C[i].y, 1, t * (1 - out)); });   // each one comes off the line from the right and leaves to the left
  }
  return { resize, update };
}

// ---------------------------------------------------------------- 3 · the plan: drawn, then built
function plan(el) {
  const top = $("[data-top]", el), pairs = $$("[data-pair]", el);
  let L, T, P;
  function resize(l) {
    L = l; T = fit(L.R, 1400 / 1538); top.style.width = T.w + "px";
    const gp = L.gap, half = L.wide ? { w: (L.R.w - gp) / 2 } : { w: L.R.w };
    P = pairs.map(() => { const dw = Math.min(half.w, (L.wide ? L.R.h : (L.R.h - gp - 60) / 2) * (1600 / 1166)), dh = dw / (1600 / 1166), bh = dw / (16 / 9); return L.wide ? { dw, dx: L.R.x + (half.w - dw), dy: L.R.y + (L.R.h - dh) / 2, bx: L.R.x + half.w + gp, by: L.R.y + (L.R.h - bh) / 2 } : { dw, dx: L.R.x + (L.R.w - dw) / 2, dy: L.R.y, bx: L.R.x + (L.R.w - dw) / 2, by: L.R.y + dh + 50 }; });
    pairs.forEach((pr, i) => { for (const f of pr.children) f.style.width = P[i].dw + "px"; });
  }
  function update(p, l) {
    L = l;
    const k = seg(p, 0.06, 0.26);
    top.parentElement.style.perspective = "1400px";
    top.style.transform = `translate(${T.x.toFixed(1)}px, ${T.y.toFixed(1)}px) rotateX(${(52 * (1 - k)).toFixed(2)}deg) rotateZ(${(-18 * (1 - k)).toFixed(2)}deg) scale(${lerp(0.86, 1, k).toFixed(4)})`;
    top.style.transformOrigin = "50% 50%"; top.style.opacity = (1 - seg(p, 0.34, 0.4)).toFixed(3);
    pairs.forEach((pr, i) => {
      const a = 0.4 + i * 0.3, o = band(p, a, i ? 1 : a + 0.3, 0.04), d = pr.children[0], b = pr.children[1], t = seg(p, a + 0.08, a + 0.18);
      place(d, P[i].dx - (1 - seg(p, a, a + 0.08)) * 40, P[i].dy, 1, o);
      place(b, P[i].bx + (1 - t) * 60, P[i].by, 1, o * t);
    });
  }
  return { resize, update };
}

// ---------------------------------------------------------------- 4 · the ground: under the dune
function ground(el) {
  const big = $("[data-big]", el), gate = $("[data-gate]", el), me = $("[data-me]", el);
  let L, A, G, M;
  function resize(l) {
    L = l;
    const w = L.wide ? Math.min(L.w * 0.56, L.h * 0.62 * (16 / 9)) : L.w - 2 * L.g; A = { x: (L.w - w) / 2, y: L.wide ? L.h * 0.1 : L.h * 0.3, w }; big.style.width = w + "px";
    const gw = L.wide ? Math.min(L.w * 0.5, L.h * 0.56 * (16 / 9)) : L.w - 2 * L.g; G = { x: L.wide ? L.w - L.g - gw : L.g, y: L.wide ? L.h * 0.13 : L.h * 0.3, w: gw }; gate.style.width = gw + "px";
    const mw = Math.min(480, L.wide ? L.w * 0.26 : L.w * 0.6); M = { x: L.g, y: L.wide ? L.h * 0.2 : G.y + gw * 9 / 16 + 56, w: mw }; me.style.width = mw + "px";   // never larger than the file itself
  }
  function update(p, l) {
    L = l; const out = seg(p, 0.44, 0.52);
    place(big, A.x, A.y + out * -30, lerp(1.0, 1, 0), 1 - out);
    place(gate, G.x + (1 - seg(p, 0.5, 0.6)) * 60, G.y, 1, seg(p, 0.5, 0.58));
    place(me, M.x - (1 - seg(p, 0.6, 0.7)) * 40, M.y, 1, seg(p, 0.6, 0.68));
  }
  return { resize, update };
}

// ---------------------------------------------------------------- the engine
const SCENES = { ready, campaign, plan, ground };
function start() {
  const chapters = $$(".ch[data-ch]").map((el) => ({ el, name: el.dataset.ch, scene: SCENES[el.dataset.ch](el), beats: $$(".beat", el).map((b) => ({ el: b, a: +b.dataset.range.split(",")[0], b: +b.dataset.range.split(",")[1] })), mounted: false, active: false, p: -1 }));
  const railLinks = $$(".rail a"), railName = $("[data-rail-name]"), facts = $("#facts");
  let L = layout(), queued = false;
  function beats(c, p) {
    for (const b of c.beats) {
      const o = band(p, b.a, b.b);
      b.el.style.opacity = o.toFixed(3); b.el.style.transform = `translateY(${(12 * (1 - o)).toFixed(1)}px)`; b.el.classList.toggle("on", o > 0.5);
    }
  }
  function frame() {
    queued = false;
    const vh = window.innerHeight;
    const reads = chapters.map((c) => { const r = c.el.getBoundingClientRect(); return { c, top: r.top, bottom: r.bottom, h: r.height }; });
    let current = -1, dark = false;   // chapters overlap by one window, so the later one wins
    reads.forEach(({ c, top, bottom, h }, i) => {
      const near = top < vh * 1.6 && bottom > -vh * 0.8;
      if (near && !c.mounted) { c.mounted = true; loadImages(c.el); c.scene.resize?.(L); c.scene.mount?.(); c.p = -1; }
      const pinned = i === 0 || top <= 1;
      if (pinned !== c.pinned) { c.pinned = pinned; c.el.classList.toggle("waiting", !pinned); }
      const active = top < vh && bottom > 0;
      if (active !== c.active) { c.active = active; if (!active) c.scene.leave?.(); }
      if (pinned && bottom > vh * 0.5) current = i;
      if (pinned && bottom > 40) dark = c.el.classList.contains("dark");
      if (!c.mounted || !active) return;
      const p = clamp(-top / Math.max(1, h - vh));
      if (p !== c.p) { c.p = p; beats(c, p); c.scene.update(p, L); }
    });
    const fr = facts.getBoundingClientRect(); if (fr.top <= 40 && fr.bottom > 40) dark = true;
    document.body.classList.toggle("on-night", dark);
    document.body.classList.toggle("past-story", fr.top < vh * 0.6);
    railLinks.forEach((a, i) => a.setAttribute("aria-current", i === current ? "true" : "false"));
    if (railName) railName.textContent = current < 0 ? "Liwa" : `${current + 1} / ${railLinks.length} · ${railLinks[current].title}`;
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  const onResize = () => { L = layout(); for (const c of chapters) { if (c.mounted) c.scene.resize?.(L); c.p = -1; } schedule(); };
  addEventListener("scroll", schedule, { passive: true }); addEventListener("resize", onResize); addEventListener("orientationchange", onResize); addEventListener("pageshow", schedule);
  document.fonts?.ready?.then(onResize);
  schedule();
  if (q.get("ch")) {
    const el = $(`#${q.get("ch")}`);
    if (el) { const go = () => scrollTo(0, el.offsetTop + clamp(+q.get("p") || 0) * (el.offsetHeight - innerHeight)); go(); requestAnimationFrame(go); setTimeout(go, 300); setTimeout(go, 1000); }
  }
}

// film on Play, in the facts: starts without sound, stops when it leaves the window
function films() {
  for (const f of $$("[data-film]")) {
    const v = $("video", f), play = $(".play", f), sound = $(".sound", f), label = play.textContent;
    const stop = () => { if (!f.classList.contains("playing")) return; f.classList.remove("playing"); v.pause(); v.removeAttribute("src"); v.load(); play.textContent = label; play.setAttribute("aria-pressed", "false"); };
    play.addEventListener("click", () => { if (f.classList.contains("playing")) return stop(); f.classList.add("playing"); v.muted = true; sound.textContent = "Sound on"; sound.setAttribute("aria-pressed", "false"); v.src = v.dataset.src; play.textContent = "Stop"; play.setAttribute("aria-pressed", "true"); v.play().catch(stop); });
    sound.addEventListener("click", () => { v.muted = !v.muted; sound.textContent = v.muted ? "Sound on" : "Sound off"; sound.setAttribute("aria-pressed", String(!v.muted)); });
    v.addEventListener("ended", stop);
    new IntersectionObserver((es) => { if (!es[0].isIntersecting) stop(); }).observe(f);
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  }
}

// the visitor's own switch
{
  const btn = $("[data-motion-toggle]");
  if (btn) {
    (btn.firstElementChild || btn).textContent = FULL ? "Motion on" : "Motion off"; btn.setAttribute("aria-pressed", String(!FULL));
    btn.addEventListener("click", () => { try { localStorage.setItem("az-motion", FULL ? "off" : "full"); } catch (e) {} const u = new URL(location.href); u.searchParams.delete("motion"); u.searchParams.delete("ch"); u.searchParams.delete("p"); location.href = u.pathname + u.search; });
  }
}
films();
if (FULL) start();
