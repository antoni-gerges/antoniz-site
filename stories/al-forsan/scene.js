// Al Forsan International Sports Resort, 2009 — the scroll story, in four pinned chapters.
// Every pose is a pure function of scroll position: no timers, no easing over time, no scroll hijack.
// The mark is the manual's own path data: it is only moved, raised and uncovered, never redrawn.
//
// The rule, from the artwork: the arch is a gateway. Every picture comes up through it, from below, and each change of
// ground opens as the arch itself, rising from the foot of the window.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const seg = (p, a, b) => smooth((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const root = document.documentElement;
const story = $("#story");
const ENTER = 28;                                   // vh of travel between two beats
const chapters = $$(".chapter", story).map((el) => {
  const beats = $$(".beat", el).map((b) => ({ el: b, id: b.dataset.beat, dwell: +b.dataset.dwell || 100, bloom: b.hasAttribute("data-bloom"), tone: b.dataset.tone || "light" }));
  let t = 0;
  beats.forEach((b, i) => { b.enter = i ? ENTER : 0; t += b.enter; b.a = t; t += b.dwell; b.b = t; });
  beats.forEach((b, i) => { b.a /= t; b.b /= t; b.g = b.enter / t; b.next = beats[i + 1] || null; b.prev = beats[i - 1] || null; b.n = i ? 0 : 1; b.q = 0; b.x = 0; b.o = i ? 0 : 1; b.on = false; });
  el.style.setProperty("--travel", `${t}vh`);
  if (el.dataset.ground) $(".pin", el).style.setProperty("--ground", el.dataset.ground);
  return { el, pin: $(".pin", el), beats, num: +el.dataset.chapter, title: el.dataset.title, p: 0, near: false, pinned: false };
});
const B = Object.fromEntries(chapters.flatMap((c) => c.beats.map((b) => [b.id, b])));
const ALL = chapters.flatMap((c) => c.beats);
const heads = $$(".ch-head", story);
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];
const threadLabel = $(".thread-label", story), bar = $(".bar i", story);

let W = 0, H = 0, wide = true, live = false, mounted = false, L = null, pose = null;

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
  else { root.classList.remove("live"); live = false; clearPoses(); root.dataset.ground = "light"; }
  requestAnimationFrame(() => { measure(); update(); });
}

// ───────── the mark: one SVG layer per piece of the manual's drawing ─────────
const hero = $(".hero", story), parts = {};
let K0 = 1;
async function buildHero() {
  const [svgText, layout, centres] = await Promise.all([
    fetch("assets/mark.svg").then((r) => r.text()),
    fetch("assets/mark-layout.json").then((r) => r.json()),
    fetch("assets/centres.json").then((r) => r.json()),
  ]);
  L = layout;
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const [vx, vy, vw, vh] = L.viewBox, NS = "http://www.w3.org/2000/svg";
  for (const g of doc.querySelectorAll("svg > g")) {
    const sv = document.createElementNS(NS, "svg");
    sv.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`); sv.dataset.id = g.id;
    const inner = document.createElementNS(NS, "g"); inner.setAttribute("fill", g.getAttribute("fill")); inner.innerHTML = g.innerHTML;
    if (g.id === "dunes") {                                              // the dune line is uncovered from left to right
      const defs = document.createElementNS(NS, "defs"), cp = document.createElementNS(NS, "clipPath"), r = document.createElementNS(NS, "rect");
      cp.id = "dune-reveal"; cp.appendChild(r); defs.appendChild(cp); sv.appendChild(defs); inner.setAttribute("clip-path", "url(#dune-reveal)");
      parts.duneRect = r;
    }
    sv.appendChild(inner); hero.appendChild(sv);
    parts[g.id] = { svg: sv, g: inner };
  }
  // the five centres, built from the manual's colours
  const list = $("[data-centres]", story);
  if (!list.children.length) list.innerHTML = centres.map((c, i) => `<li class="centre rise" style="--i:${i};--c:${c.colour}"><img src="assets/symbol.svg" alt="" width="229" height="177"><b>${c.name}</b><span>${c.colour}</span></li>`).join("");
}

// ───────── sizes that depend only on the window ─────────
const pages = $$(".book .page", story);
function measure() {
  W = window.innerWidth; H = chapters[0].pin.clientHeight || window.innerHeight;
  wide = W >= 768 && W / H >= 1.05;
  if (!L) return;
  const g = clamp(W * 0.04, 18, 64), lock = L.lockup, lw = lock[2] - lock[0], lh = lock[3] - lock[1];
  const lc = [(lock[0] + lock[2]) / 2, (lock[1] + lock[3]) / 2];
  const k = wide ? Math.min(0.66 * H / lh, 0.4 * W / lw) : Math.min(0.36 * H / lh, 0.7 * W / lw);
  K0 = k;
  const [vx, vy, vw, vh] = L.viewBox;
  for (const id in parts) {
    if (!parts[id].svg) continue;
    const st = parts[id].svg.style;
    st.width = `${vw * K0}px`; st.height = `${vh * K0}px`; st.left = `${-(lc[0] - vx) * K0}px`; st.top = `${-(lc[1] - vy) * K0}px`;
  }
  pose = { g, C: wide ? [W * 0.68, H * 0.5] : [W * 0.5, H * 0.66] };
  const pw = wide ? Math.min(0.42 * W, 0.6 * H * 1.4145) : 0.86 * W;
  pose.book = wide ? { pw, x0: W * 0.43, y0: H * 0.5 - pw / 1.4145 / 2 - H * 0.03, dx: W * 0.085, dy: H * 0.03, dz: 300, ry: -30 } : { pw, x0: g * 0.6, y0: H * 0.43, dx: W * 0.1, dy: H * 0.022, dz: 240, ry: -28 };
  pages.forEach((el) => { el.style.width = `${pw}px`; });
  for (const st of $$("[data-strip]", story)) {
    const vis = st.closest(".vis"), vw2 = vis.clientWidth, vh2 = vis.clientHeight;
    st.style.setProperty("--h", `${Math.round(wide ? Math.min(vh2 * (st.classList.contains("tall") ? 0.95 : 0.78), 640) : vh2 * 0.92)}px`);
    st._start = wide ? vw2 * 0.02 : g; st._end = Math.min(st._start, vw2 - g - st.scrollWidth);
  }
}

// ───────── a change of ground opens as the arch: it rises from the foot of the window and widens ─────────
function archPath(n) {
  const e = smooth(n), w = W * lerp(0.08, 1.9, e), h = H * lerp(0.1, 2.3, e), cx = W / 2, base = H;
  const x0 = cx - w / 2, x1 = cx + w / 2, top = base - h, shoulder = base - h * 0.62;
  const f = (v) => v.toFixed(1);
  return `path("M${f(x0)} ${f(base)}L${f(x0)} ${f(shoulder)}C${f(x0)} ${f(top + h * 0.12)} ${f(cx - w * 0.12)} ${f(top + h * 0.1)} ${f(cx)} ${f(top)}C${f(cx + w * 0.12)} ${f(top + h * 0.1)} ${f(x1)} ${f(top + h * 0.12)} ${f(x1)} ${f(shoulder)}L${f(x1)} ${f(base)}Z")`;
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
      if (b.bloom) cin = seg(b.n, 0.6, 1);
      else { oin = seg(b.n, 0.3, 0.9); cin = seg(b.n, 0.6, 1); go = smooth(b.n); }
    }
    if (b.next && !b.next.bloom) { oout = 1 - seg(b.x, 0.1, 0.7); cout = 1 - seg(b.x, 0, 0.45); }
    b.o = oin * oout;
    const s = b.el.style;
    s.setProperty("--n", b.n.toFixed(4)); s.setProperty("--q", b.q.toFixed(4)); s.setProperty("--x", b.x.toFixed(4));
    s.setProperty("--e", smooth(b.q).toFixed(4));
    s.setProperty("--o", b.o.toFixed(3)); s.setProperty("--c", (cin * cout).toFixed(3)); s.setProperty("--c-in", cin.toFixed(3)); s.setProperty("--go", go.toFixed(3));
    b.el.classList.toggle("on", b.on);
    if (b.bloom) s.clipPath = b.n >= 1 || b.n <= 0 ? "none" : archPath(b.n);
  }
}


// I · the mark builds: the dunes, the arch rising out of them, the dome, the rider coming through, the name
function renderMark() {
  const b = B.mark, P = pose, bx = L.boxes;
  const on = b.on && b.o > 0.002;
  hero.style.visibility = on ? "visible" : "hidden";
  if (!on) return;
  hero.style.opacity = b.o.toFixed(3);
  hero.style.transform = `translate3d(${P.C[0].toFixed(1)}px, ${P.C[1].toFixed(1)}px, 0)`;
  const d = bx.dunes, tD = seg(b.q, 0.02, 0.22);
  parts.duneRect.setAttribute("x", d[0] - 2); parts.duneRect.setAttribute("y", d[1] - 2);
  parts.duneRect.setAttribute("width", ((d[2] - d[0] + 4) * tD).toFixed(2)); parts.duneRect.setAttribute("height", d[3] - d[1] + 4);
  const tA = seg(b.q, 0.18, 0.4), archH = bx.arch[3] - bx.arch[1];
  parts.arch.g.setAttribute("transform", `translate(0 ${(archH * 0.7 * (1 - tA)).toFixed(2)})`);
  parts.arch.svg.style.opacity = seg(b.q, 0.18, 0.24).toFixed(3);
  const tDome = seg(b.q, 0.36, 0.5);
  parts.dome.g.setAttribute("transform", `translate(0 ${(-30 * (1 - tDome)).toFixed(2)})`);
  parts.dome.svg.style.opacity = tDome.toFixed(3);
  const tR = seg(b.q, 0.46, 0.68);
  parts.rider.g.setAttribute("transform", `translate(${(-150 * (1 - tR)).toFixed(2)} 0)`);
  parts.rider.svg.style.opacity = seg(b.q, 0.46, 0.52).toFixed(3);
  const tN = seg(b.q, 0.66, 0.8);
  parts.name.g.setAttribute("transform", `translate(0 ${(12 * (1 - tN)).toFixed(2)})`);
  parts.name.svg.style.opacity = tN.toFixed(3);
}

// IV · the manual: the page in front lies flat and whole; those behind stand turned; a page that has been read leaves
function renderBook() {
  const b = B.manual, Bk = pose.book;
  if (!b.on) return;
  const f = clamp((b.q - 0.04) / 0.9) * (pages.length - 1), inn = clamp(b.n * 1.5);
  pages.forEach((el, i) => {
    const t = i - f, back = Math.max(t, 0), gone = Math.max(-t, 0);
    const o = clamp(1 - gone * 3.2) * clamp(5.4 - back) * inn;
    el.style.opacity = o.toFixed(3);
    el.style.zIndex = String(100 - i);
    el.style.display = o > 0.004 ? "" : "none";                      // never its own visibility: a visible child would show through a hidden beat
    el.style.transform = `translate3d(${(Bk.x0 + back * Bk.dx - gone * Bk.pw * 0.5).toFixed(1)}px, ${(Bk.y0 + back * Bk.dy).toFixed(1)}px, ${(-back * Bk.dz).toFixed(1)}px) rotateY(${(Bk.ry * clamp(back)).toFixed(2)}deg)`;
  });
}

function renderStrips(c) {
  for (const b of c.beats) {
    if (!b.on) continue;
    for (const s of $$("[data-strip]", b.el)) {
      const t = seg(b.q, 0.06, 0.94) * 0.5 + clamp((b.q - 0.06) / 0.88) * 0.5;
      s.style.transform = `translate3d(${lerp(s._start ?? 0, s._end ?? 0, t).toFixed(1)}px, 0, 0)`;
    }
  }
}

function render() {
  if (!live || !L || !pose) return;
  for (const c of chapters) {
    const r = c.el.getBoundingClientRect();
    c.near = r.top < H * 1.5 && r.bottom > -H * 0.5;
    c.pinned = r.top <= 0 && r.bottom >= H;
    c.p = clamp(-r.top / Math.max(1, r.height - H));
    if (!c.near) { c.beats.forEach((b) => { if (b.on) { b.on = false; b.el.classList.remove("on"); } }); continue; }
    beatNumbers(c);
    if (c.num === 1) renderMark();
    if (c.num === 2) renderBook();
    renderStrips(c);
  }
  thread();
}

function thread() {
  const sr = story.getBoundingClientRect();
  root.style.setProperty("--thread", sr.top < H * 0.5 && sr.bottom > H * 0.6 ? "1" : "0");
  root.style.setProperty("--thread-label", chapters.some((c) => c.pinned) ? "1" : "0");
  bar.style.transform = `scaleX(${clamp(-sr.top / Math.max(1, sr.height - H)).toFixed(4)})`;
  let tone = "light", label = null;
  if (sr.bottom < 70) tone = "paper";
  else {
    for (const h of heads) { const r = h.getBoundingClientRect(); if (r.top <= 40 && r.bottom > 40) tone = h.classList.contains("on-dark") ? "dark" : "light"; }
    for (const c of chapters) {
      const r = c.el.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40) {
        let top = c.beats[0];
        for (const b of c.beats) if (b.n > (b.bloom ? 0.5 : 0.5)) top = b;
        tone = top.tone;
        label = { c, i: ALL.indexOf(top) + 1 };
      }
    }
  }
  root.dataset.ground = tone;
  if (label) threadLabel.innerHTML = `<b>${ROMAN[label.c.num]}</b> <span>${label.c.title}</span> <i>${label.i} / ${ALL.length}</i>`;
}

function clearPoses() {
  for (const b of ALL) { b.el.classList.remove("on"); b.el.style.clipPath = ""; for (const v of ["--n", "--q", "--x", "--e", "--o", "--c", "--c-in", "--go"]) b.el.style.removeProperty(v); }
  for (const s of $$("[data-strip]", story)) { s.style.transform = ""; s.style.removeProperty("--h"); }
  for (const el of pages) el.style.cssText = "";
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
  // ?p=0.5 opens the whole story at that progress; ?beat=vote opens at the middle of a beat; &q=0.9 near its end
  const jump = parseFloat(params.get("p")), at = params.get("beat"), bq = parseFloat(params.get("q"));
  requestAnimationFrame(() => {
    if (at && B[at]) {
      const c = chapters.find((ch) => ch.beats.includes(B[at])), b = B[at];
      const local = lerp(b.a, b.b, Number.isNaN(bq) ? 0.5 : bq);
      window.scrollTo(0, c.el.getBoundingClientRect().top + window.scrollY + local * (c.el.offsetHeight - H));
    } else if (!Number.isNaN(jump)) {
      window.scrollTo(0, story.getBoundingClientRect().top + window.scrollY + clamp(jump) * (story.offsetHeight - H));
    }
    update();
  });
}

applyMode();
