// The Big Grill — I drew the festival in July; in December we stood in it.
// Four pinned chapters. Every pose is a pure function of the chapter's scroll progress p (0..1): no timers, no
// smoothing, no scroll hijack, so scrolling back returns exactly. Geometry is read once per frame, then written.
// The one rule of motion is the poster's own slant: things arrive along it, pictures change by a slanted wipe.
// Review aid: ?ch=site&p=0.5 opens the page at that progress of a chapter. ?motion=off shows the static story.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lin = (p, a, b) => clamp((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const band = (p, a, b, f = 0.03) => clamp(Math.min(a <= 0 ? 1 : (p - a) / f, b >= 1 ? 1 : (b - p) / f));   // a range that touches an end never fades at that end
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const q = new URLSearchParams(location.search);
const FULL = document.documentElement.dataset.motion === "full";

const SLANT = (22 * Math.PI) / 180, SX = Math.cos(SLANT), SY = -Math.sin(SLANT);   // the date line's own angle: up and to the right
const AR3 = 1500 / 2083, AR4 = 1400 / 1812, FILM = 1600 / 666;
// where each object sits in its poster, as a share of the sheet (measured on the rendered layers)
const BOX4 = { logo: [0.094, 0.013, 0.398, 0.353], grill: [0.454, 0.777, 0.999, 0.999], car: [0, 0.459, 0.749, 0.728], guitarist: [0.523, 0.144, 0.99, 0.757] };
const GUITARIST3 = [0.683, 0.52];

function layout() {
  const w = document.documentElement.clientWidth, h = window.innerHeight;
  const g = clamp(w * 0.04, 18, 64), wide = w >= 768 && w / h >= 1.05, gap = Math.max(8, w * 0.011);
  const Hp = wide ? Math.min(h * 0.84, (w * 0.42) / AR3) : Math.min(h * 0.56, (w * 0.84) / AR3), Wp = Hp * AR3;
  const poster = wide ? { x: w - g - w * 0.05 - Wp, y: (h - Hp) / 2, w: Wp, h: Hp } : { x: (w - Wp) / 2, y: h - h * 0.07 - Hp, w: Wp, h: Hp };
  const W4 = Hp * AR4, poster4 = { x: poster.x + (Wp - W4) / 2, y: poster.y, w: W4, h: Hp };
  const R = wide ? { x: g, y: h * 0.4, w: w - 2 * g, h: h * 0.5 } : { x: g, y: h * 0.38, w: w - 2 * g, h: h * 0.54 };
  return { w, h, g, wide, gap, poster, poster4, R };
}
function place(el, x, y, s, o) {
  el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`;
  if (o !== undefined) { el.style.opacity = o.toFixed(3); el.style.pointerEvents = o <= 0.5 ? "none" : ""; }
}
// a wipe with a slanted edge: t = 0 shows nothing, t = 1 shows all; the edge leans the way the poster's wedges do
function wipe(el, t, W, H, lean = 0.22) {
  const k = H * lean, e = lerp(-k, W + k, t);
  el.style.clipPath = t >= 0.999 ? "none" : `polygon(0px 0px, ${(e + k).toFixed(1)}px 0px, ${(e - k).toFixed(1)}px ${H.toFixed(1)}px, 0px ${H.toFixed(1)}px)`;
}
function wipeImg(img, t, W, H) { wipe(img, t, W, H); }
function loadImages(el) { for (const img of $$("img[data-src]", el)) { img.src = img.dataset.src; img.removeAttribute("data-src"); } }

// ---------------------------------------------------------------- 1 · the drawing: ten real layers
// when each layer arrives, and from where (in sheet widths, along the slant unless it rises or drops)
const ARRIVE = {
  skyline: [0.14, 0, 0.10], palms: [0.18, 0, 0.10], car: [0.22, -0.62 * SX, -0.62 * SY], figures: [0.27, 0.5 * SX, 0.5 * SY],
  ball: [0.32, -0.5 * SX, -0.5 * SY], grill: [0.36, 0, 0.42], date: [0.41, -0.45 * SX, -0.45 * SY], logo: [0.46, 0, -0.38],
};
function drawing(el) {
  const poster = $("[data-poster]", el), stack = $("[data-stack]", el);
  const layers = $$("img", stack).map((n) => ({ el: n, name: n.dataset.layer, z: +n.dataset.z }));
  let L;
  function resize(l) { L = l; poster.style.width = L.poster.w + "px"; poster.style.height = L.poster.h + "px"; }
  function update(p, l) {
    L = l; const P = L.poster;
    // the guitarist alone, large; then the view draws back until the whole sheet is in its place
    const out = seg(p, 0.10, 0.52), Z = lerp(L.wide ? 1.5 : 1.32, 1, out);
    const tx = lerp(L.wide ? L.w * 0.67 : L.w * 0.5, P.x + GUITARIST3[0] * P.w, out), ty = lerp(L.wide ? L.h * 0.52 : L.h * 0.64, P.y + GUITARIST3[1] * P.h, out);
    place(poster, tx - GUITARIST3[0] * P.w * Z, ty - GUITARIST3[1] * P.h * Z, Z);
    // the stack turns, and the layers stand apart in depth
    const k = seg(p, 0.60, 0.72) * (1 - seg(p, 0.84, 0.95)), d = P.w / 560;
    stack.style.transform = `rotateY(${(-32 * k).toFixed(2)}deg) rotateX(${(6 * k).toFixed(2)}deg) scale(${lerp(1, 0.9, k).toFixed(4)})`;
    for (const y of layers) {
      let o = 1, dx = 0, dy = 0;
      if (y.name === "sky") o = seg(p, 0.46, 0.56);
      else if (y.name !== "guitarist") { const [a, fx, fy] = ARRIVE[y.name], t = seg(p, a, a + 0.1); o = seg(p, a, a + 0.05); dx = fx * P.w * (1 - t); dy = fy * P.w * (1 - t); }
      y.el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, ${(y.z * d * k).toFixed(1)}px)`;
      y.el.style.opacity = o.toFixed(3);
    }
  }
  return { resize, update };
}

// ---------------------------------------------------------------- 2 · the system: wedges, a slant, a frame drawn by hand
const ARRIVE4 = {
  frame: [0.10, 0, 0, "fade"], "wedge-pale": [0.14, 0.5 * SX, 0.5 * SY], "wedge-red": [0.16, -1.1, 0.08], "wedge-shadow": [0.21, 0.4, 0.2], skyline: [0.22, 0, 0, "fade"],
  car: [0.25, -0.8 * SX, -0.8 * SY], stripe: [0.29, -0.7, 0.49], guitarist: [0.33, 0.62, 0.05], ball: [0.37, -0.5 * SX, -0.5 * SY],
  grill: [0.39, 0, 0.4], date: [0.43, -0.5 * SX, -0.5 * SY], logo: [0.45, 0, -0.4], heads: [0.49, 0, 0, "fade"],
};
const ROW = [["ochre", AR4], ["red", AR4], ["sq1", 1], ["sq2", 1]];
function system(el) {
  const stage = $(".stage", el), veil = $("[data-veil]", el), poster = $("[data-poster2]", el), first = $("[data-first]", el);
  const layers = $$("img", poster).map((n) => ({ el: n, name: n.dataset.l }));
  const plates = Object.fromEntries($$(".plate", el).map((n) => [n.dataset.plate, n]));
  let L, row = {};
  function mount() { stage.style.background = 'url("assets/r3/sky.webp") center / 100% 100% no-repeat'; for (const y of layers) if (y.el.hasAttribute("data-blend")) y.el.style.mixBlendMode = "multiply"; }
  function resize(l) {
    L = l; const P = L.poster4;
    poster.style.width = P.w + "px"; poster.style.height = P.h + "px";
    for (const y of layers) { y.el.style.width = P.w + "px"; y.el.style.height = P.h + "px"; }
    first.style.width = L.poster.w + "px"; first.style.height = L.poster.h + "px";
    // the closing row: the posters and the square posts as exported
    const R = L.R, gp = L.gap; row = {};
    if (L.wide) {
      const H = Math.min(R.h, (R.w - 3 * gp) / (2 * AR4 + 2)); let x = R.x + (R.w - (H * (2 * AR4 + 2) + 3 * gp)) / 2; const y = R.y + (R.h - H) / 2;
      for (const [n, ar] of ROW) { row[n] = { x, y, w: ar * H }; x += ar * H + gp; }
    } else {
      let S = (R.w - gp) / 2, H1 = S / AR4; const k = Math.min(1, R.h / (H1 + S + gp)); S *= k; H1 *= k;
      const x0 = R.x + (R.w - (2 * S + gp)) / 2, y0 = R.y + (R.h - (H1 + S + gp)) / 2;
      row.ochre = { x: x0, y: y0, w: S }; row.red = { x: x0 + S + gp, y: y0, w: S };
      row.sq1 = { x: x0, y: y0 + H1 + gp, w: S }; row.sq2 = { x: x0 + S + gp, y: y0 + H1 + gp, w: S };
    }
    for (const n in plates) { const b = Math.max(row[n].w, n === "red" ? P.w : 0); plates[n].style.width = b + "px"; plates[n].dataset.base = b; }
  }
  function update(p, l) {
    L = l; const P = L.poster4;
    veil.style.opacity = seg(p, 0.0, 0.14).toFixed(3);
    // the first poster leaves by a slanted wipe; under it, the second one's ground
    place(first, L.poster.x, L.poster.y, 1, p < 0.16 ? 1 : 0);
    wipe(first, 1 - seg(p, 0.02, 0.15), L.poster.w, L.poster.h);
    const toRow = seg(p, 0.62, 0.78);
    const rr = row.red, s4 = lerp(1, rr.w / P.w, toRow);
    place(poster, lerp(P.x, rr.x, toRow), lerp(P.y, rr.y, toRow), s4, 1 - seg(p, 0.66, 0.74));
    for (const y of layers) {
      if (y.name === "ground") { y.el.style.opacity = 1; y.el.style.transform = "none"; continue; }
      const [a, fx, fy, how] = ARRIVE4[y.name], t = seg(p, a, a + 0.11);
      y.el.style.opacity = (how === "fade" ? t : seg(p, a, a + 0.04)).toFixed(3);
      y.el.style.transform = `translate(${(fx * P.w * (1 - t)).toFixed(1)}px, ${(fy * P.w * (1 - t)).toFixed(1)}px)`;
    }
    // the exported red poster takes over from the file as it walks to the row; the others are waiting there
    const base = +plates.red.dataset.base;
    place(plates.red, lerp(P.x, rr.x, toRow), lerp(P.y, rr.y, toRow), lerp(P.w, rr.w, toRow) / base, seg(p, 0.64, 0.72));
    ["ochre", "sq1", "sq2"].forEach((n, i) => { const t = seg(p, 0.76 + i * 0.035, 0.86 + i * 0.035), r = row[n]; place(plates[n], r.x - (1 - t) * 60 * SX, r.y - (1 - t) * 60 * SY, r.w / +plates[n].dataset.base, t); });
  }
  return { mount, resize, update };
}

// ---------------------------------------------------------------- 3 · on site: a film frame, and the thing it was drawn as
const PAIRS = [{ key: "logo", colour: "var(--red)", size: 0.34 }, { key: "grill", colour: "var(--ochre)", size: 0.30 }, { key: "car", colour: "var(--red)", size: 0.30 }, { key: "guitarist", colour: "var(--ochre)", size: 0.5 }];
function site(el) {
  const frames = $$(".frame", el), drawn = $$(".drawn", el), wedge = $("[data-wedge]", el);
  let L, F, D = [];
  function resize(l) {
    L = l;
    if (L.wide) { const fw = Math.min(L.w * 0.62, L.h * 0.6 * FILM); F = { w: fw, h: fw / FILM, x: L.w - L.g - fw, y: L.h * 0.27, pan: 0 }; }
    else { const fh = L.h * 0.27, fw = fh * FILM; F = { w: fw, h: fh, x: L.g, y: L.h * 0.3, pan: fw - (L.w - 2 * L.g) }; }   // on a phone the wide frame is read across
    for (const f of frames) { f.style.width = F.w + "px"; }
    // each drawn piece: scaled so the object itself has the wanted height, placed by the object's own box
    D = PAIRS.map((pr, i) => {
      const b = BOX4[pr.key], oh = (L.wide ? pr.size : pr.size * 0.62) * L.h, s = oh / ((b[3] - b[1]) * 1812), ow = (b[2] - b[0]) * 1400 * s;
      const cx = L.wide ? Math.max(L.g + ow / 2, F.x - ow * 0.18) : L.w / 2;
      const cy = L.wide ? (pr.key === "guitarist" ? L.h * 0.37 + oh / 2 : F.y + F.h + L.h * 0.02 - oh * 0.1) : L.h * 0.62 + (L.h * 0.3 - oh) / 2 + oh / 2;
      drawn[i].style.width = 1400 * s + "px"; drawn[i].style.height = 1812 * s + "px";
      return { x: cx - (b[0] + b[2]) / 2 * 1400 * s, y: cy - (b[1] + b[3]) / 2 * 1812 * s, ow, oh, cx, cy };
    });
    wedge.style.width = L.w + "px"; wedge.style.height = L.h + "px";
  }
  function update(p, l) {
    L = l;
    const cur = Math.min(3, Math.floor(p * 4 + 1e-6));
    frames.forEach((f, i) => {
      const a = i * 0.25, r = i === 0 ? 1 : seg(p, a - 0.035, a + 0.035), t = lin(p, a, a + 0.25);
      const next = i < 3 ? seg(p, a + 0.25 - 0.035, a + 0.25 + 0.035) : 0;                                   // how far the frame after this one has come
      const img = f.firstElementChild, cap = f.lastElementChild;
      f.style.zIndex = 5 + i; cap.style.opacity = (r * (1 - next)).toFixed(3);
      if (L.wide) { place(f, F.x, F.y, 1, r > 0 && next < 1 ? 1 : 0); img.style.clipPath = ""; wipeImg(img, r, F.w, F.h); return; }   // the next frame arrives by a slanted wipe
      const vis = L.w - 2 * L.g, pan = F.pan * smooth(lin(t, 0.15, 0.85));                                  // on a phone: a wide frame, read across
      place(f, F.x - pan, F.y, 1, r * (next < 1 ? 1 : 0));
      img.style.clipPath = `inset(0 ${Math.max(0, F.w - pan - vis).toFixed(1)}px 0 ${pan.toFixed(1)}px)`;
      cap.style.transform = `translateX(${pan.toFixed(1)}px)`; cap.style.maxWidth = vis + "px";
    });
    drawn.forEach((d, i) => {
      const a = i * 0.25, tin = seg(p, a + 0.0, a + 0.09), tout = i < 3 ? seg(p, a + 0.2, a + 0.26) : 0, D0 = D[i];
      const off = (1 - tin) * -0.5 * L.h + tout * 0.5 * L.h;
      place(d, D0.x + off * SX, D0.y + off * SY, 1, Math.min(tin * 1.4, 1) * (1 - tout));
      d.style.zIndex = 12;
    });
    // the wedge behind them: it opens along the slant at the start of each pair, and closes before the next
    const a = cur * 0.25, t = seg(p, a + 0.0, a + 0.1) * (cur < 3 ? 1 - seg(p, a + 0.19, a + 0.25) : 1), D0 = D[cur];
    const cx = D0.cx, cy = D0.cy, wl = (L.wide ? 0.34 : 0.7) * L.w * t, th = (L.wide ? 0.2 : 0.13) * L.h;
    const x0 = cx - wl * 0.62, x1 = cx + wl * 0.6;
    wedge.style.background = PAIRS[cur].colour;
    wedge.style.opacity = t > 0.001 ? 1 : 0;
    wedge.style.clipPath = `polygon(${x0.toFixed(1)}px ${(cy + th * 0.2 - (x0 - cx) * Math.tan(SLANT) * 0.5).toFixed(1)}px, ${x1.toFixed(1)}px ${(cy - th * 0.6 - (x1 - cx) * Math.tan(SLANT) * 0.5).toFixed(1)}px, ${(x1 + th * 0.2).toFixed(1)}px ${(cy + th * 0.55 - (x1 - cx) * Math.tan(SLANT) * 0.2).toFixed(1)}px, ${(x0 + th * 0.1).toFixed(1)}px ${(cy + th * 1.05 - (x0 - cx) * Math.tan(SLANT) * 0.2).toFixed(1)}px)`;
  }
  return { resize, update };
}

// ---------------------------------------------------------------- 4 · the rig by day, the rig at night
function night(el) {
  const P = Object.fromEntries($$(".plate", el).map((n) => [n.dataset.plate, n]));
  const AR = { day: 2000 / 1503, lit: FILM, dusk: FILM };
  let L, pos = {};
  function resize(l) {
    L = l; const gp = L.gap * 1.4;
    if (L.wide) {
      const top = L.h * 0.13, room = L.h * 0.56;
      const wd = Math.min(L.w * 0.34, room * AR.day), wl = L.w - 2 * L.g - wd - gp;
      pos.day = { x: L.g, y: top + (room - wd / AR.day) / 2, w: wd }; pos.lit = { x: L.g + wd + gp, y: top + (room - wl / AR.lit) / 2, w: wl };
      const wk = Math.min(L.w - 2 * L.g, room * AR.dusk); pos.dusk = { x: (L.w - wk) / 2, y: top, w: wk };
    } else {
      const W = L.w - 2 * L.g, top = L.h * 0.27;
      pos.day = { x: L.g, y: top, w: W }; pos.lit = { x: L.g, y: top + W / AR.day + 46, w: W };
      pos.dusk = { x: L.g, y: top, w: W };
    }
    for (const n in P) P[n].style.width = pos[n].w + "px";
  }
  function update(p, l) {
    L = l;
    const out = seg(p, 0.46, 0.54);
    [["day", 0, -1], ["lit", 0.06, 1]].forEach(([n, d, dir]) => { const t = p < 0.02 && d === 0 ? 1 : seg(p, d - 0.02, d + 0.08); const off = (1 - t) * 50 * dir - out * 60 * dir; place(P[n], pos[n].x + off * SX, pos[n].y + off * SY, 1, t * (1 - out)); });
    [["dusk", 0.54, 1]].forEach(([n, d, dir]) => { const t = seg(p, d, d + 0.1), off = (1 - t) * 50 * dir; place(P[n], pos[n].x + off * SX, pos[n].y + off * SY, 1, t); });
  }
  return { resize, update };
}

// ---------------------------------------------------------------- the engine
const SCENES = { drawing, system, site, night };
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
    if (railName) railName.textContent = current < 0 ? "The Big Grill" : `${current + 1} / ${railLinks.length} · ${railLinks[current].title}`;
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
