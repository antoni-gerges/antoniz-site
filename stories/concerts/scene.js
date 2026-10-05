// The concerts — Live in Dubai. Three nights, one title system.
// Every chapter is the same machine with different pictures: a run of plates, each shown in its own scroll range,
// and one thin red frame (the title cards' own frame) that travels from plate to plate and holds the one in view.
// Title animations from the original promo films are drawn frame by frame from scroll position.
// Every pose is a pure function of scroll progress; scrolling back returns exactly. Review aid: ?ch=amr&p=0.5 · ?motion=off
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
  const g = clamp(w * 0.04, 18, 64), wide = w >= 768 && w / h >= 1.05, gap = Math.max(10, w * 0.012);
  // where pictures go: to the right of the words on a wide window, under them on a tall one; room kept for captions
  const R = wide ? { x: w * 0.4, y: h * 0.11, w: w - g - w * 0.4, h: h * 0.7 } : { x: g, y: h * 0.33, w: w - 2 * g, h: h * 0.5 };
  return { w, h, g, wide, gap, R };
}
function place(el, x, y, s, o) {
  el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`;
  if (o !== undefined) { el.style.opacity = o.toFixed(3); el.style.pointerEvents = o <= 0.5 ? "none" : ""; }
}
function loadImages(el) { for (const img of $$("img[data-src]", el)) { img.src = img.dataset.src; img.removeAttribute("data-src"); } }

// one plate: a picture (or a scrubbed frame sequence), its scroll range and its place
//   data-range="a,b"   data-ar="w/h"   data-slot="main | left | right | small"   data-seq="dir,count"
function plates(el) {
  const frame = $(".tframe", el);
  const P = $$(".plate", el).map((n) => {
    const [a, b] = n.dataset.range.split(",").map(Number), [aw, ah] = n.dataset.ar.split("/").map(Number);
    const o = { el: n, a, b, ar: aw / ah, slot: n.dataset.slot || "main", framed: n.dataset.framed !== undefined, maxw: +(n.dataset.maxw || 99999) };
    if (n.dataset.seq) { const [dir, count] = n.dataset.seq.split(","); o.seq = { dir, N: +count, imgs: new Array(+count).fill(null), last: -1, cv: $("canvas", n) }; }
    return o;
  });
  const framed = P.filter((x) => x.framed).sort((x, y) => x.a - y.a);
  let L;
  function mount() {
    for (const x of P) if (x.seq) {
      const s = x.seq; let i = 0;
      const next = () => { if (i >= s.N) return; const k = i++, im = new Image(); im.decoding = "async"; im.onload = () => { s.imgs[k] = im; if (s.last !== Math.round(lin(s.p || 0, x.a + 0.02, x.b - 0.06) * (s.N - 1))) draw(x, s.p || 0); next(); }; im.onerror = next; im.src = `assets/${s.dir}/${s.dir === "seq-amr" ? "a" : "g"}-${String(k + 1).padStart(3, "0")}.webp`; };
      next(); next(); next(); next(); next(); next();
    }
  }
  function draw(x, p) {
    const s = x.seq; s.p = p; const i = Math.round(lin(p, x.a + 0.02, x.b - 0.06) * (s.N - 1));
    if (i === s.last) return; let im = null; for (let k = i; k >= 0 && !im; k--) im = s.imgs[k]; if (!im) return;
    const c = s.cv.getContext("2d"); c.drawImage(im, 0, 0, s.cv.width, s.cv.height); if (s.imgs[i]) s.last = i;
  }
  function rect(x) {
    const R = L.R, gp = L.gap;
    let box = R;
    if (x.slot === "left") box = L.wide ? { x: R.x, y: R.y, w: R.w * 0.36 - gp / 2, h: R.h } : { x: R.x, y: R.y, w: R.w * 0.44 - gp / 2, h: R.h };
    if (x.slot === "right") box = L.wide ? { x: R.x + R.w * 0.36 + gp / 2, y: R.y, w: R.w * 0.64 - gp / 2, h: R.h } : { x: R.x + R.w * 0.44 + gp / 2, y: R.y, w: R.w * 0.56 - gp / 2, h: R.h };
    if (x.slot === "small") box = L.wide ? { x: R.x, y: R.y, w: R.w * 0.42, h: R.h } : { x: R.x, y: R.y, w: R.w * 0.6, h: R.h };
    const capH = 56, bw = Math.min(box.w, (box.h - capH) * x.ar, x.maxw), bh = bw / x.ar;
    const cx = x.slot === "main" || !L.wide ? box.x + (box.w - bw) / 2 : x.slot === "right" ? box.x + 12 : box.x + box.w - bw;
    return { x: x.slot === "small" ? box.x : cx, y: box.y + (box.h - capH - bh) / 2, w: bw, h: bh };
  }
  function resize(l) {
    L = l;
    for (const x of P) { x.r = rect(x); x.el.style.width = x.r.w + "px"; if (x.seq) { const d = Math.min(devicePixelRatio || 1, 2); x.seq.cv.width = Math.round(x.r.w * d); x.seq.cv.height = Math.round(x.r.h * d); x.seq.cv.style.height = x.r.h + "px"; x.seq.last = -1; } }
  }
  function update(p, l) {
    L = l;
    for (const x of P) {
      const o = band(p, x.a, x.b, 0.035), t = seg(p, x.a - 0.02, x.a + 0.06);
      place(x.el, x.r.x + (1 - t) * 40, x.r.y, 1, o);
      if (x.seq && o > 0) draw(x, p);
    }
    // the frame: it holds the framed plate in view, and travels to the next one as that one arrives
    if (!framed.length) return;
    let k = 0; for (let i = 0; i < framed.length; i++) if (p >= framed[i].a - 0.04) k = i;
    const A = framed[k].r, B = framed[Math.min(k + 1, framed.length - 1)].r, t = k + 1 < framed.length ? seg(p, framed[k + 1].a - 0.05, framed[k + 1].a + 0.02) : 0;
    const pad = 10, x = lerp(A.x, B.x, t) - pad, y = lerp(A.y, B.y, t) - pad, w = lerp(A.w, B.w, t) + 2 * pad, h = lerp(A.h, B.h, t) + 2 * pad;
    frame.style.width = w + "px"; frame.style.height = h + "px"; frame.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    const first = framed[0], last = framed[framed.length - 1];
    frame.style.opacity = (Math.min(seg(p, first.a - 0.02, first.a + 0.05), 1 - seg(p, last.b - 0.02, last.b + 0.02))).toFixed(3);
  }
  return { mount, resize, update };
}

// ---------------------------------------------------------------- the engine

function start() {
  const chapters = $$(".ch[data-ch]").map((el) => ({ el, name: el.dataset.ch, scene: plates(el), beats: $$(".beat", el).map((b) => ({ el: b, a: +b.dataset.range.split(",")[0], b: +b.dataset.range.split(",")[1] })), mounted: false, active: false, p: -1 }));
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
    if (railName) railName.textContent = current < 0 ? "The concerts" : `${current + 1} / ${railLinks.length} · ${railLinks[current].title}`;
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
