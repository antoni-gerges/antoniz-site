// Dubai Health Authority, 2008 — the scroll story, in five pinned chapters.
// Every pose is a pure function of scroll position: no timers, no easing over time, no scroll hijack.
// The mark is the manual's own path data. It only ever turns about its centre by quarters, slides and changes size as a
// whole: no point of any piece moves against another, and the lower-left quarter is never filled.
//
// The rule, from the artwork: three quarters and an open fourth. Each change of ground arrives a quarter at a time,
// the open one last; the words keep the lower left.
//
// For every beat the script sets a few numbers, and the stylesheet does the rest:
//   --n  0..1 while the beat arrives      --q  0..1 while it holds      --x  0..1 while it leaves      --e  --q, eased

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

let W = 0, H = 0, wide = true, live = false, mounted = false, L = null, votes = null, pose = null;

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
  const [svgText, layout, v] = await Promise.all([
    fetch("assets/mark.svg").then((r) => r.text()),
    fetch("assets/mark-layout.json").then((r) => r.json()),
    fetch("assets/votes.json").then((r) => r.json()),
  ]);
  L = layout; votes = v;
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const [vx, vy, vw, vh] = L.viewBox, NS = "http://www.w3.org/2000/svg";
  const layer = (id, html, fill) => {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`); s.dataset.id = id;
    const g = document.createElementNS(NS, "g"); if (fill) g.setAttribute("fill", fill);
    g.innerHTML = html; s.appendChild(g); hero.appendChild(s);
    return (parts[id] = { svg: s, g });
  };
  for (const g of doc.querySelectorAll("svg > g")) layer(g.id, g.innerHTML, g.getAttribute("fill"));
  // the open quarter, outlined as the manual outlines it: the mark's own upper-left piece, turned into the lower left
  layer("open", doc.querySelector("#piece-ul").innerHTML, null).svg.classList.add("open");
  // each vote keeps one place for the whole story: where it starts is fixed by its number, not by chance
  let s = 2008;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  votes.start = votes.points.map(() => [rnd(), rnd(), rnd()]);
}

// ───────── sizes that depend only on the window ─────────
const canvas = $("canvas.votes", story), chosen = $(".chosen", story);
const pages = $$(".book .page", story);
function measure() {
  W = window.innerWidth; H = chapters[0].pin.clientHeight || window.innerHeight;
  wide = W >= 768 && W / H >= 1.05;
  if (!L) return;
  const g = clamp(W * 0.04, 18, 64), [ix0, iy0, ix1, iy1] = L.icon, S = ix1 - ix0, [cx, cy] = L.centre, lock = L.lockup;
  const lockW = lock[2] - lock[0], lockC = [(lock[0] + lock[2]) / 2, (lock[1] + lock[3]) / 2];
  // the vote: where the star stands
  const vs = wide ? Math.min(0.62 * H, 0.4 * W) : Math.min(0.78 * W, 0.4 * H);
  const vc = wide ? [W * 0.7, H * 0.47] : [W * 0.5, H * 0.3];
  // the open corner: the star alone, then the whole logo
  const C = wide ? [W * 0.71, H * 0.4] : [W * 0.5, H * 0.26];
  const s1 = wide ? Math.min(0.5 * H, 0.32 * W) : Math.min(0.62 * W, 0.3 * H), k1 = s1 / S;
  const kL = wide ? Math.min(0.5 * W / lockW, 0.42 * H / S) : Math.min(0.9 * W / lockW, 0.26 * H / S);
  const cL = [C[0] + kL * (cx - lockC[0]), C[1] + kL * (cy - lockC[1])];
  K0 = Math.max(k1, kL);
  const [vx, vy, vw, vh] = L.viewBox;
  for (const id in parts) {
    const st = parts[id].svg.style;
    st.width = `${vw * K0}px`; st.height = `${vh * K0}px`; st.left = `${-(cx - vx) * K0}px`; st.top = `${-(cy - vy) * K0}px`;
  }
  pose = { g, S, cx, cy, vs, vc, C, k1, kL, cL };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); pose.dpr = dpr;
  chosen.style.width = `${vs}px`; chosen.style.height = `${vs}px`;
  // the manual: pages standing one behind another
  const pw = wide ? Math.min(0.42 * W, 0.6 * H * 1.4145) : 0.86 * W;
  pose.book = wide ? { pw, x0: W * 0.43, y0: H * 0.5 - pw / 1.4145 / 2 - H * 0.03, dx: W * 0.085, dy: H * 0.03, dz: 300, ry: -30 } : { pw, x0: g * 0.6, y0: H * 0.12, dx: W * 0.1, dy: H * 0.022, dz: 240, ry: -28 };
  pages.forEach((el) => { el.style.width = `${pw}px`; });
  // the strips
  for (const s of $$("[data-strip]", story)) {
    const vis = s.closest(".vis"), vw2 = vis.clientWidth, vh2 = vis.clientHeight;
    s.style.setProperty("--h", `${Math.round(wide ? Math.min(vh2 * 0.78, 560) : vh2 * 0.92)}px`);
    for (const img of $$("figure img", s)) img.closest("figure").style.setProperty("--nat", `${Math.round(+img.getAttribute("height") * 1.2)}px`);   // a scan is never shown much above its own size
    s._start = wide ? vw2 * 0.02 : g; s._end = Math.min(s._start, vw2 - g - s.scrollWidth);
  }
}

// ───────── a change of ground arrives a quarter at a time, the open quarter last ─────────
function quartersPath(n) {
  const cx = W / 2, cy = H / 2, t = [0, 1, 2, 3].map((k) => seg(n, k * 0.17, 0.46 + k * 0.17));
  const r = (x0, y0, x1, y1) => `M${x0.toFixed(1)} ${y0.toFixed(1)}H${x1.toFixed(1)}V${y1.toFixed(1)}H${x0.toFixed(1)}Z`;
  return `path("${r(cx - t[0] * cx, cy - t[0] * cy, cx, cy)}${r(cx, cy - t[1] * cy, cx + t[1] * cx, cy)}${r(cx, cy, cx + t[2] * cx, cy + t[2] * cy)}${r(cx - t[3] * cx, cy, cx, cy + t[3] * cy)}")`;
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
    if (b.bloom) s.clipPath = b.n >= 1 || b.n <= 0 ? "none" : quartersPath(b.n);
  }
}

// I · almost a thousand votes gather into the star
function renderVote() {
  const b = B.vote, P = pose;
  if (!b.on) return;
  const ctx = canvas.getContext("2d"), d = P.dpr;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const x0 = P.vc[0] - P.vs / 2, y0 = P.vc[1] - P.vs / 2;
  const field = wide ? [W * 0.4, H * 0.1, W * 0.57, H * 0.78] : [W * 0.04, H * 0.08, W * 0.92, H * 0.46];
  const size = Math.max(2.2, P.vs / 96), away = 1 - seg(b.q, 0.8, 0.92), rise = clamp(b.n * 1.4);
  if (away > 0) {
    ctx.globalAlpha = away * rise * b.o;
    const pts = votes.points, st = votes.start;
    for (let i = 0; i < pts.length; i++) {
      const t = seg(b.q * 1.25, st[i][2] * 0.42, st[i][2] * 0.42 + 0.5);
      const sx = field[0] + st[i][0] * field[2], sy = field[1] + st[i][1] * field[3];
      const x = lerp(sx, x0 + pts[i][0] * P.vs, t), y = lerp(sy, y0 + pts[i][1] * P.vs, t);
      ctx.fillStyle = t < 0.5 ? "#9fb6b9" : pts[i][2] ? "#8cc63f" : "#008b99";
      const s = size * lerp(0.8, 1, t);
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }
  // then the mark itself, exact, where the votes stood (the asset carries four units of margin round the star)
  const pad = 4 / (P.S + 8), full = P.vs / (1 - 2 * pad);
  chosen.style.width = chosen.style.height = `${full.toFixed(1)}px`;
  chosen.style.transform = `translate(${(x0 - pad * full).toFixed(1)}px, ${(y0 - pad * full).toFixed(1)}px)`;
  chosen.style.opacity = (seg(b.q, 0.76, 0.9) * b.o).toFixed(3);
}

// II · three shapes, one open corner, and the name that completes it
function renderMark() {
  const b = B.complete, P = pose, { cx, cy } = P;
  const on = b.on && b.o > 0.002;
  hero.style.visibility = on ? "visible" : "hidden";
  if (!on) return;
  const toLock = seg(b.q, 0.56, 0.72);
  const k = lerp(P.k1, P.kL, toLock), x = lerp(P.C[0], P.cL[0], toLock), y = lerp(P.C[1], P.cL[1], toLock);
  hero.style.opacity = b.o.toFixed(3);
  hero.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${(k / K0).toFixed(5)})`;
  // a quarter turn at a time, clockwise, about the centre: upper left, upper right, lower right
  const tUR = seg(b.q, 0.08, 0.2), tLR = seg(b.q, 0.2, 0.32), tOpen = seg(b.q, 0.32, 0.44);
  parts["piece-ur"].g.setAttribute("transform", `rotate(${(-90 * (1 - tUR)).toFixed(3)} ${cx} ${cy})`);
  parts["piece-ur"].svg.style.opacity = seg(b.q, 0.08, 0.12).toFixed(3);
  parts["piece-lr"].g.setAttribute("transform", `rotate(${(-90 * (1 - tLR)).toFixed(3)} ${cx} ${cy})`);
  parts["piece-lr"].svg.style.opacity = seg(b.q, 0.2, 0.24).toFixed(3);
  // the turn goes on into the fourth quarter, but only as an outline: it stays open
  parts.open.g.setAttribute("transform", `rotate(${(180 + 90 * tOpen).toFixed(3)} ${cx} ${cy})`);
  parts.open.svg.style.opacity = (seg(b.q, 0.32, 0.36) * (1 - seg(b.q, 0.6, 0.68))).toFixed(3);
  // the name slides into the open quarter
  const tAr = seg(b.q, 0.66, 0.78), tEn = seg(b.q, 0.72, 0.84);
  // the Arabic name is not shown (ruling of 30 Sep 2026): the English name completes the mark alone
  parts["name-en"].g.setAttribute("transform", `translate(${(-26 * (1 - tEn)).toFixed(2)} 0)`);
  parts["name-en"].svg.style.opacity = tEn.toFixed(3);
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
    if (c.num === 1) renderVote();
    if (c.num === 2) renderMark();
    if (c.num === 4) renderBook();
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
