// Why Not! Mazzika — one square, from a letter to an arena.
// Six pinned chapters. Every pose is a pure function of the chapter's scroll progress p (0..1): no timers, no
// smoothing, no scroll hijack, so scrolling back returns exactly. Geometry is read once per frame, then written.
// Review aid: ?ch=acts&p=0.5 opens the page at that progress of a chapter. ?motion=off shows the static story.

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

// ---------------------------------------------------------------- layout, shared by the chapters
function layout() {
  const w = document.documentElement.clientWidth, h = window.innerHeight;
  const g = clamp(w * 0.04, 18, 64);
  const wide = w >= 768 && w / h >= 1.05;
  // the film passage: 1600 x 900 frames, the badge 512 px square in the middle
  const f = wide ? Math.max(w / 1600, h / 900) : (w * 0.68) / 512;
  const film = { f, cx: w / 2, cy: wide ? h / 2 : h * 0.6, badge: 512 * f };
  // the square board of chapter 1, and the square artwork of chapter 3
  const B = wide ? Math.min(h * 0.72, w * 0.44) : Math.min(w * 0.84, h * 0.47);
  const board = wide ? { s: B, cx: w - g - w * 0.03 - B / 2, cy: h / 2 } : { s: B, cx: w / 2, cy: h - h * 0.09 - B / 2 };
  const A = wide ? Math.min(h * 0.8, w * 0.46) : Math.min(w * 0.9, h * 0.5);
  const art = wide ? { s: A, x: w - g - w * 0.02 - A, y: (h - A) / 2 } : { s: A, x: (w - A) / 2, y: h - h * 0.085 - A };
  // the six posts as a grid: three by two on a wide window, two by three on a tall one
  const gap = Math.max(8, w * 0.011);
  let grid;
  if (wide) {
    const c = Math.min((w * 0.56 - 2 * gap) / 3, (h * 0.78 - gap) / 2), gw = 3 * c + 2 * gap, gh = 2 * c + gap;
    const x0 = w - g - gw, y0 = (h - gh) / 2;
    grid = { c, cells: [0, 1, 2, 3, 4, 5].map((i) => ({ x: x0 + (i % 3) * (c + gap), y: y0 + Math.floor(i / 3) * (c + gap) })) };
  } else {
    const c = Math.min((w - 2 * g - gap) / 2, (h * 0.6 - 2 * gap) / 3), gw = 2 * c + gap, gh = 3 * c + 2 * gap;
    const x0 = (w - gw) / 2, y0 = h - h * 0.075 - gh;
    grid = { c, cells: [0, 1, 2, 3, 4, 5].map((i) => ({ x: x0 + (i % 2) * (c + gap), y: y0 + Math.floor(i / 2) * (c + gap) })) };
  }
  // the region the campaign formats are fitted into
  const R = wide ? { x: w * 0.42, y: h * 0.13, w: w - g - w * 0.42, h: h * 0.74 } : { x: g, y: h * 0.4, w: w - 2 * g, h: h * 0.52 };
  return { w, h, g, wide, film, board, art, grid, gap, R };
}
function place(el, x, y, s, o) {
  el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`;
  if (o !== undefined) { el.style.opacity = o.toFixed(3); el.style.pointerEvents = o <= 0.5 ? "none" : ""; }
}
function loadImages(el) { for (const img of $$("img[data-src]", el)) { img.src = img.dataset.src; img.removeAttribute("data-src"); } }

// ---------------------------------------------------------------- 1 · the mark, from the original logo file
const SVGNS = "http://www.w3.org/2000/svg";
const O_C = [498.5, 475.6], BOX_C = [500, 499.7];
function discover(el) {
  const board = $("[data-board]", el);
  let svg, parts = {}, zoom, ready = false, L, p = 0;
  async function mount() {
    const data = await (await fetch("assets/logo-paths.json")).json();
    const byId = Object.fromEntries(data.paths.map((x) => [x.id, x]));
    const oct = "M" + byId.box.d.split("M").pop();          // the box's own outline, without the letters cut out of it
    svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 1000 999.4"); svg.setAttribute("class", "mark"); svg.setAttribute("aria-hidden", "true");
    const mk = (tag, attrs, parent) => { const n = document.createElementNS(SVGNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };
    const defs = mk("defs", {}); const cp = mk("clipPath", { id: "mz-oct" }, defs); mk("path", { d: oct }, cp);
    mk("path", { d: byId.outline.d, fill: byId.outline.fill });
    mk("path", { d: oct, fill: byId.box.fill });
    const clip = mk("g", { "clip-path": "url(#mz-oct)" });
    zoom = mk("g", {}, clip);
    const add = (key, ids) => { const g = mk("g", {}, zoom); for (const id of ids) mk("path", { d: byId[id].d, fill: byId[id].fill }, g); parts[key] = g; };
    add("O", ["O"]); add("bang", ["bang-stem", "bang-dot"]); add("N", ["N"]); add("T", ["T"]);
    add("W", ["W"]); add("H", ["H"]); add("Y", ["Y"]);
    add("m0", ["m-M"]); add("m1", ["m-A", "m-A-counter"]); add("m2", ["m-Z1"]); add("m3", ["m-Z2"]); add("m4", ["m-I"]); add("m5", ["m-K"]); add("m6", ["m-A2", "m-A2-counter"]);
    ["F", "E", "S", "T", "I", "V", "A", "L"].forEach((c, i) => add("f" + i, ["f-" + c]));
    board.appendChild(svg);
    ready = true; resize(L); update(p, L);
  }
  function resize(l) {
    L = l; if (!ready || !L) return;
    const base = Math.max(L.board.s, L.film.badge);
    board.style.width = board.style.height = base + "px"; svg.style.width = svg.style.height = base + "px";
    board.dataset.base = base;
  }
  const show = (g, o, tf = "") => { g.setAttribute("opacity", clamp(o).toFixed(3)); g.setAttribute("transform", tf); };
  function update(pp, l) {
    p = pp; L = l; if (!ready) return;
    // the letters: one zoom, centred on the O
    const z1 = seg(p, 0.10, 0.28), z2 = seg(p, 0.56, 0.72);
    const s = lerp(lerp(2.5, 1.5, z1), 1, z2);
    const cx = lerp(BOX_C[0], O_C[0], z2) - lerp(0, 40, z1) * (1 - z2), cy = lerp(BOX_C[1], O_C[1], z2);
    zoom.setAttribute("transform", `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${s.toFixed(4)}) translate(${-O_C[0]} ${-O_C[1]})`);
    show(parts.O, 1);
    // the exclamation mark arrives beside the O, then makes room for the T
    const bIn = seg(p, 0.30, 0.37), tIn = seg(p, 0.58, 0.70);
    show(parts.bang, bIn, `translate(${(-165 * (1 - tIn)).toFixed(2)} ${(-70 * (1 - bIn)).toFixed(2)})`);
    show(parts.T, tIn, `translate(0 ${(-120 * (1 - tIn)).toFixed(2)})`);
    const nIn = seg(p, 0.60, 0.72); show(parts.N, nIn, `translate(${(-150 * (1 - nIn)).toFixed(2)} 0)`);
    ["W", "H", "Y"].forEach((k, i) => { const t = seg(p, 0.66 + i * 0.02, 0.76 + i * 0.02); show(parts[k], t, `translate(0 ${(-110 * (1 - t)).toFixed(2)})`); });
    // MAZZIKA rises letter by letter from its baseline, the way the sound line does in the film
    for (let i = 0; i < 7; i++) { const t = seg(p, 0.72 + i * 0.014, 0.80 + i * 0.014); show(parts["m" + i], t > 0 ? 1 : 0, `translate(0 719.6) scale(1 ${Math.max(0.001, t).toFixed(4)}) translate(0 -719.6)`); }
    for (let i = 0; i < 8; i++) show(parts["f" + i], seg(p, 0.82 + i * 0.008, 0.87 + i * 0.008));
    // the board itself hands over to the film: same place, same size as the film's own badge
    const t = seg(p, 0.90, 1), base = +board.dataset.base;
    const size = lerp(L.board.s, L.film.badge, t), x = lerp(L.board.cx, L.film.cx, t), y = lerp(L.board.cy, L.film.cy, t);
    place(board, x - size / 2, y - size / 2, size / base, 1);
  }
  return { mount, resize, update };
}

// ---------------------------------------------------------------- 2 · the original film, following the scroll
function assemble(el) {
  const N = 60, canvas = $("canvas.filmstrip", el), ctx = canvas.getContext("2d");
  const video = $("[data-passage]", el), btn = $("[data-play-passage]", el);
  const frames = new Array(N).fill(null);
  let L, p = 0, last = -1, playing = false, dpr = 1, gold = null, pAtPlay = 0;
  const url = (i) => `assets/vis/f-${String(i + 1).padStart(3, "0")}.webp`;
  function mount() {
    let i = 0;
    const next = () => { if (i >= N) return; const k = i++; const im = new Image(); im.decoding = "async"; im.onload = () => { frames[k] = im; if (k === 0 || k === index(p)) { last = -1; draw(); } next(); }; im.onerror = next; im.src = url(k); };
    next(); next(); next();
    btn.addEventListener("click", () => (playing ? stop() : play()));
    video.addEventListener("ended", stop);
  }
  function index(p) { const first = L && !L.wide ? 5 : 0; return first + Math.round(lin(p, 0.03, 0.93) * (N - 1 - first)); }
  function nearest(i) { for (let k = i; k >= 0; k--) if (frames[k]) return frames[k]; for (let k = i; k < N; k++) if (frames[k]) return frames[k]; return null; }
  function resize(l) {
    L = l; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(L.w * dpr); canvas.height = Math.round(L.h * dpr);
    const fw = 1600 * L.film.f, fh = 900 * L.film.f;
    video.style.width = fw + "px"; video.style.height = fh + "px";
    place(video, L.film.cx - fw / 2, L.film.cy - fh / 2, 1);
    btn.style.left = L.wide ? `${L.film.cx + L.film.badge / 2 + 36}px` : `${L.g}px`;
    btn.style.top = L.wide ? `${L.film.cy - 20}px` : `${Math.min(L.h - 120, L.film.cy + 450 * L.film.f + 18)}px`;
    last = -1; draw();
  }
  function draw() {
    if (!L) return;
    const i = index(p); if (i === last) return;
    const im = nearest(i); if (!im) return;
    const fw = 1600 * L.film.f * dpr, fh = 900 * L.film.f * dpr, x = L.film.cx * dpr - fw / 2, y = L.film.cy * dpr - fh / 2;
    if (!gold && frames[0]) {                                  // the field around the film is the film's own gold, read from its first frame
      const c = document.createElement("canvas"); c.width = c.height = 4; const cx = c.getContext("2d"); cx.drawImage(frames[0], 0, 0, 8, 8, 0, 0, 4, 4);
      const d = cx.getImageData(1, 1, 1, 1).data; gold = `rgb(${d[0]},${d[1]},${d[2]})`;
    }
    ctx.fillStyle = gold || "#E3A332"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high"; ctx.drawImage(im, x, y, fw, fh);
    if (frames[i]) last = i;
  }
  function play() { playing = true; pAtPlay = p; el.classList.add("playing"); video.src = video.dataset.src; video.currentTime = 0; btn.textContent = "Stop"; btn.setAttribute("aria-pressed", "true"); video.play().catch(stop); }
  function stop() { if (!playing) return; playing = false; el.classList.remove("playing"); video.pause(); video.removeAttribute("src"); video.load(); btn.textContent = "Play the passage"; btn.setAttribute("aria-pressed", "false"); }
  function update(pp, l) {
    p = pp; L = l;
    if (playing && Math.abs(p - pAtPlay) > 0.02) stop();
    draw();
    const o = seg(p, 0.76, 0.82); btn.style.opacity = o.toFixed(3); btn.classList.toggle("on", o > 0.5);
  }
  return { mount, resize, update, leave: stop };
}

// ---------------------------------------------------------------- 3 · one frame, six acts
const ACTS = ["cairokee", "sharmoofers", "discomisr", "massar", "esseily", "hoh"];
const BADGE_IN_POST = { x: 0.7128, y: 0.0396, s: 0.2481 };     // where the badge sits in every post, measured on the artwork
function acts(el) {
  const posts = Object.fromEntries($$("img.post", el).map((n) => [n.dataset.post, n]));
  const badge = $("[data-badge]", el), bill = $(".bill", el), names = $$(".bill li", el);
  const film = $("[data-act-film]", el), btn = $("[data-play-act]", el);
  let L, playing = false, pAtPlay = 0, p = 0;
  function mount() { btn.addEventListener("click", () => (playing ? stop() : play())); film.addEventListener("ended", stop); }
  function resize(l) {
    L = l;
    for (const k in posts) posts[k].style.width = posts[k].style.height = L.art.s + "px";
    film.style.width = film.style.height = L.grid.c + "px";
    const base = Math.max(L.film.badge, L.art.s * BADGE_IN_POST.s); badge.style.width = badge.style.height = base + "px"; badge.dataset.base = base;
    if (L.wide) { bill.style.display = ""; bill.style.left = L.g + "px"; bill.style.bottom = "12vh"; } else bill.style.display = "none";
  }
  function play() { playing = true; pAtPlay = p; film.src = film.dataset.src; film.currentTime = 0; btn.textContent = "Stop"; btn.setAttribute("aria-pressed", "true"); film.play().catch(stop); update(p, L); }
  function stop() { if (!playing) return; playing = false; film.pause(); film.removeAttribute("src"); film.load(); btn.textContent = "Play the Cairokee post"; btn.setAttribute("aria-pressed", "false"); if (L) update(p, L); }
  function update(pp, l) {
    p = pp; L = l;
    if (playing && Math.abs(p - pAtPlay) > 0.02) stop();
    const A = L.art, base = +badge.dataset.base;
    // the badge leaves the film and takes its corner of the frame
    const t = seg(p, 0.0, 0.10);
    const bs = lerp(L.film.badge, A.s * BADGE_IN_POST.s, t);
    const bx = lerp(L.film.cx - L.film.badge / 2, A.x + A.s * BADGE_IN_POST.x, t), by = lerp(L.film.cy - L.film.badge / 2, A.y + A.s * BADGE_IN_POST.y, t);
    const frameIn = seg(p, 0.06, 0.13);
    place(badge, bx, by, bs / base, 1 - seg(p, 0.13, 0.15));
    // the six acts step into the one frame, then the frame becomes six
    const toGrid = seg(p, 0.66, 0.82);
    place(posts.frame, A.x, A.y, 1, frameIn * (1 - seg(p, 0.17, 0.2)));
    let current = -1;
    ACTS.forEach((k, i) => {
      const a = 0.16 + i * 0.08, inn = seg(p, a, a + 0.025), out = i < 5 ? seg(p, a + 0.08, a + 0.105) : 0;
      const solo = inn * (1 - out);                          // alone in the frame
      if (solo > 0.5) current = i;
      const c = L.grid.cells[i], g = L.grid.c / A.s;
      if (i === 5) place(posts[k], lerp(A.x, c.x, toGrid), lerp(A.y, c.y, toGrid), lerp(1, g, toGrid), solo);   // the last act carries the frame to its place
      else if (p < 0.66) place(posts[k], A.x, A.y, 1, solo);
      else { const t = seg(p, 0.70 + (4 - i) * 0.02, 0.80 + (4 - i) * 0.02), s = g * lerp(0.9, 1, t); place(posts[k], c.x + (L.grid.c - A.s * s) / 2, c.y + (L.grid.c - A.s * s) / 2, s, t); }   // the others take their places beside it
      posts[k].style.zIndex = i === 5 ? 2 : 1;
    });
    names.forEach((n, i) => n.classList.toggle("on", p >= 0.66 || i === current));
    bill.style.opacity = band(p, 0.14, 1.01).toFixed(3);
    const bo = seg(p, 0.86, 0.92); btn.style.opacity = bo.toFixed(3); btn.classList.toggle("on", bo > 0.5);
    const c0 = L.grid.cells[0];
    btn.style.left = c0.x + L.grid.c * 0.09 + "px"; btn.style.top = c0.y + L.grid.c * 0.2 + "px";
    place(film, c0.x, c0.y, 1, playing ? 1 : 0); film.style.zIndex = 3;
  }
  return { mount, resize, update, leave: stop };
}

// ---------------------------------------------------------------- 4 · the key visual, and the grid re-flowing
// Tile boxes measured on the delivered artwork (assets/tiles.json). Each format is fitted whole into the region R.
const FORMATS = {
  kv:     { size: [1080, 950], label: "Key visual · square", tiles: { swyp: [21, 155, 252], logo: [283, 155, 252], "kv-date": [545, 155, 252], "kv-venue": [807, 155, 252], discomisr: [21, 414, 252], hoh: [283, 414, 252], esseily: [545, 414, 252], "kv-mcx": [807, 414, 252], massar: [21, 674, 252], sharmoofers: [283, 674, 252], cairokee: [545, 674, 252], "kv-ticketing": [807, 674, 252] } },
  story:  { size: [1080, 1920], label: "Story · tall", tiles: { swyp: [174, 37, 358], logo: [548, 37, 358], discomisr: [174, 409, 358], massar: [548, 409, 358], hoh: [174, 781, 358], sharmoofers: [548, 781, 358], esseily: [174, 1153, 358], cairokee: [548, 1153, 358], date: [174, 1526, 358], partner: [548, 1526, 358] } },
  banner: { size: [1920, 860], label: "Web banner · wide", tiles: { swyp: [71, 77, 341], discomisr: [430, 77, 341], hoh: [790, 77, 341], esseily: [1150, 78, 340], date: [1510, 78, 340], logo: [71, 442, 341], massar: [430, 442, 341], sharmoofers: [790, 442, 341], cairokee: [1150, 442, 340], partner: [1510, 442, 340] } },
};
const MERGE = { "kv-date": "date", "kv-venue": "date", "kv-mcx": "partner", "kv-ticketing": "partner" };   // four square tiles become two in the other formats
const AR = { kv: 1080 / 950, story: 1080 / 1920, cover: 1251 / 657, banner: 1920 / 860 };
const ORDER = ["swyp", "logo", "kv-date", "date", "kv-venue", "discomisr", "hoh", "esseily", "kv-mcx", "partner", "massar", "sharmoofers", "cairokee", "kv-ticketing"];
function campaign(el) {
  const posts = Object.fromEntries($$("img.post", el).map((n) => [n.dataset.post, n]));
  const tiles = Object.fromEntries($$("img.tile", el).map((n) => [n.dataset.tile, n]));
  const arts = Object.fromEntries($$("img.art", el).map((n) => [n.dataset.art, n]));
  const fmt = $("[data-fmt]", el), curtain = $("[data-curtain]", el);
  let L, fit = {}, wall = {};
  const TB = 360;                                             // layout size of a tile; it is only ever scaled down
  function fitFormat(name, R) {
    const F = FORMATS[name], s = Math.min(R.w / F.size[0], R.h / F.size[1]);
    const x = R.x + (R.w - F.size[0] * s) / 2, y = R.y + (R.h - F.size[1] * s) / 2;
    const pos = {}; for (const k in F.tiles) { const [tx, ty, ts] = F.tiles[k]; pos[k] = { x: x + tx * s, y: y + ty * s, s: ts * s }; }
    return { x, y, s, w: F.size[0] * s, h: F.size[1] * s, pos };
  }
  function resize(l) {
    L = l;
    for (const k in posts) posts[k].style.width = posts[k].style.height = L.art.s + "px";
    for (const k in tiles) tiles[k].style.width = tiles[k].style.height = TB + "px";
    for (const n of ["kv", "story", "banner"]) fit[n] = fitFormat(n, L.R);
    // the closing wall: the delivered artwork side by side, all one height
    const gp = L.gap; wall = {};
    if (L.wide) {
      const W = { x: L.g, y: L.h * 0.41, w: L.w - 2 * L.g, h: L.h * 0.49 }, inv = 1 / AR.cover + 1 / AR.banner;
      const H = Math.min(W.h, (W.w - 2 * gp + gp / inv) / (1 + AR.story + 1 / inv)), ws = (H - gp) / inv;
      let x = W.x + (W.w - (H + AR.story * H + ws + 2 * gp)) / 2; const y = W.y + (W.h - H) / 2;
      wall.kv = { x, y, w: H }; x += H + gp;
      wall.story = { x, y, w: AR.story * H }; x += AR.story * H + gp;
      wall.cover = { x, y, w: ws }; wall.banner = { x, y: y + ws / AR.cover + gp, w: ws };
    } else {
      const W = L.R; let H1 = (W.w - gp) / (1 + AR.story), bw = W.w;
      const k = Math.min(1, W.h / (H1 + gp + bw / AR.banner)); H1 *= k; bw *= k;
      const y = W.y + (W.h - (H1 + gp + bw / AR.banner)) / 2, x = W.x + (W.w - (H1 + gp + AR.story * H1)) / 2;
      wall.kv = { x, y, w: H1 }; wall.story = { x: x + H1 + gp, y, w: AR.story * H1 };
      wall.banner = { x: W.x + (W.w - bw) / 2, y: y + H1 + gp, w: bw }; wall.cover = null;
    }
    for (const n in arts) { const bw = Math.max(fit[n] ? fit[n].w : 0, wall[n] ? wall[n].w : 0, 10); arts[n].style.width = bw + "px"; arts[n].style.height = "auto"; arts[n].dataset.base = bw; }
  }
  function update(p, l) {
    L = l;
    const toKV = seg(p, 0.02, 0.14), toWall = seg(p, 0.83, 0.93);
    // the six posts become their tiles in the key visual
    ACTS.forEach((k, i) => {
      const c = L.grid.cells[i], d = fit.kv.pos[k];
      place(posts[k], lerp(c.x, d.x, toKV), lerp(c.y, d.y, toKV), lerp(L.grid.c, d.s, toKV) / L.art.s, 1 - seg(p, 0.07, 0.13));
    });
    // every tile: key visual → story → banner, one after another so the eye can follow
    for (const k in tiles) {
      const merged = MERGE[k], inKV = fit.kv.pos[k], j = ORDER.indexOf(k) * 0.006;
      const tS = seg(p, 0.31 + j, 0.39 + j), tB = seg(p, 0.58 + j, 0.66 + j);
      const a = inKV || fit.kv.pos[k === "date" ? "kv-date" : "kv-mcx"];
      const b = fit.story.pos[merged || k], c = fit.banner.pos[merged || k];
      const x = lerp(lerp(a.x, b.x, tS), c.x, tB), y = lerp(lerp(a.y, b.y, tS), c.y, tB), s = lerp(lerp(a.s, b.s, tS), c.s, tB);
      let o;
      if (ACTS.includes(k)) o = seg(p, 0.07, 0.13);
      else if (merged) o = seg(p, 0.07, 0.14) * (1 - seg(p, 0.36 + j, 0.42 + j));   // only the square format has these four
      else if (k === "date" || k === "partner") o = seg(p, 0.37 + j, 0.43 + j);
      else o = seg(p, 0.06, 0.14);
      place(tiles[k], x, y, s / TB, o * (1 - seg(p, 0.78, 0.81)));
      tiles[k].style.zIndex = 2 + ORDER.indexOf(k);
    }
    // the delivered artwork, whole, over the tiles once they have settled; then the wall
    const hold = { kv: band(p, 0.15, 0.30, 0.035), story: band(p, 0.47, 0.57, 0.035), banner: seg(p, 0.74, 0.78) };
    for (const n in arts) {
      const base = +arts[n].dataset.base, F = fit[n], W = wall[n];
      if (!W) { place(arts[n], 0, 0, 1, 0); continue; }
      if (n === "banner") place(arts[n], lerp(F.x, W.x, toWall), lerp(F.y, W.y, toWall), lerp(F.w, W.w, toWall) / base, hold.banner);   // the banner walks to the wall
      else if (F && p < 0.7) place(arts[n], F.x, F.y, F.w / base, hold[n]);
      else { const i = ["kv", "story", "cover"].indexOf(n), t = seg(p, 0.88 + i * 0.02, 0.95 + i * 0.02); place(arts[n], W.x, W.y + (1 - t) * 14, W.w / base, t); }   // the others are already hanging there
      arts[n].style.zIndex = 30;
    }
    // the black box grows until it is the room
    const cu = seg(p, 0.955, 1), cs = lerp(0.2, Math.hypot(L.w, L.h) * 1.12 / 100, cu * cu);
    place(curtain, L.w / 2 - 50 * cs, L.h / 2 - 50 * cs, cs, cu > 0 ? 1 : 0);
    // the name of the format on screen
    const name = p < 0.36 ? "kv" : p < 0.62 ? "story" : "banner", F = fit[name];
    fmt.textContent = FORMATS[name].label;
    fmt.style.left = F.x + "px"; fmt.style.top = Math.max(L.wide ? 70 : L.R.y - 26, F.y - 28) + "px";
    fmt.style.opacity = (Math.max(band(p, 0.13, 0.30), band(p, 0.46, 0.57), band(p, 0.73, 0.81)) * 0.9).toFixed(3);
  }
  return { resize, update };
}

// ---------------------------------------------------------------- 5 · the room: the ticketing plan raised in 3D
const HEIGHT = { "gold-seated": [0.30, 0.62], "platinum-seated": [0.09, 0.26], "fanpit-seated": [0.09, 0.26], "fanpit-standing": [0.03, 0], "platinum-standing": [0.03, 0], stage: [0.20, 0], bar: [0.12, 0] };
function room(el) {
  const canvas = $("canvas.gl", el), real = $("[data-real]", el);
  let THREE, renderer, scene, camera, L, p = 0, ok = false, blocks = [], keys, lost = false;
  async function mount() {
    if (q.get("nogl") !== null) { el.classList.add("no-gl"); return; }
    try {
      THREE = await import("./vendor/three.module.min.js");
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch (e) { el.classList.add("no-gl"); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x07070a, 1);
    scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x07070a, 9, 26);
    camera = new THREE.PerspectiveCamera(36, 1, 0.05, 60);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x20202a, 1.05));
    const sun = new THREE.DirectionalLight(0xfff1d6, 1.5); sun.position.set(3, 7, 2.5); scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9db4ff, 0.35); fill.position.set(-4, 3, -3); scene.add(fill);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x101014, roughness: 0.95, metalness: 0 }));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);

    const plan = await (await fetch("assets/plan-shapes.json")).json();
    const C = plan.page[0] / 2, U = 100;
    for (const s of plan.shapes) {
      const kind = s.id.replace(/-(n|s)$/, ""), [h0, rake] = HEIGHT[kind];
      const shape = new THREE.Shape();
      s.pts.forEach(([x, y], i) => { const X = (x - C) / U, Z = (y - C) / U; i ? shape.lineTo(X, -Z) : shape.moveTo(X, -Z); });
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 1 });
      geo.rotateX(-Math.PI / 2);                              // the drawing lies on the floor and rises along y
      const pos = geo.attributes.position, top = [];
      let zin = Infinity, zout = 0;
      for (let i = 0; i < pos.count; i++) { const az = Math.abs(pos.getZ(i)); zin = Math.min(zin, az); zout = Math.max(zout, az); }
      for (let i = 0; i < pos.count; i++) if (pos.getY(i) > 0.5) top.push([i, h0 + rake * ((Math.abs(pos.getZ(i)) - zin) / Math.max(0.001, zout - zin))]);
      const col = new THREE.Color(s.fill);
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.78, metalness: 0, flatShading: true }));
      scene.add(mesh); blocks.push({ geo, top, mesh });
    }
    // the stage-screen concept, in its three pieces, standing at the stage end and facing the floor
    const loader = new THREE.TextureLoader();
    const tex = (u) => { const t = loader.load(u, () => render()); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const upright = (u, wz, hy, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(wz, hy), new THREE.MeshBasicMaterial({ map: tex(u), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); m.rotation.y = Math.PI / 2; m.position.set(x, y, z); scene.add(m); return m; };
    const screens = [upright("assets/stage-centre.webp", 1.66, 0.94, -2.35, 0.2 + 0.47, 0.35), upright("assets/screen-left.webp", 1.0, 1.0 * 540 / 860, -2.2, 1.0, 2.05), upright("assets/screen-right.webp", 1.08, 1.08 * 540 / 930, -2.2, 1.0, -1.75)];
    blocks.screens = screens;
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; });
    canvas.addEventListener("webglcontextrestored", () => { lost = false; render(); });
    ok = true; resize(L); render();
  }
  function quat(pos, target, up) { const m = new THREE.Matrix4().lookAt(new THREE.Vector3(...pos), new THREE.Vector3(...target), new THREE.Vector3(...up)); return new THREE.Quaternion().setFromRotationMatrix(m); }
  function resize(l) {
    L = l; if (!L) return;
    // the real frame, whole, 2.35:1
    const rw = L.wide ? Math.min(L.w - 2 * L.g, L.h * 0.6 * (1600 / 681)) : L.h * 0.4 * (1600 / 681);   // on a phone the wide frame is read across
    real.style.width = rw + "px"; real.style.height = "auto"; real.dataset.w = rw;
    if (!ok) return;
    renderer.setSize(L.w, L.h, false); camera.aspect = L.w / L.h;
    const tanH = Math.tan((36 * Math.PI) / 360);
    const D = Math.max(6.6 / (2 * tanH), 6.2 / (2 * tanH * camera.aspect * (L.wide ? 0.62 : 1)));
    scene.fog.near = D * 1.3; scene.fog.far = D * 3.2;
    keys = [
      { pos: [0, D, 0.001], q: quat([0, D, 0.001], [0, 0, 0], [0, 0, -1]), fov: 36 },                 // the plan, seen as it was drawn
      { pos: [4.9, D * 0.6, 5.6], q: quat([4.9, D * 0.6, 5.6], [-0.2, 0, 0.1], [0, 1, 0]), fov: 36 },     // the tiers rise
      { pos: [3.5, 1.2, 0.12], q: quat([3.5, 1.2, 0.12], [-2.4, 0.42, 0.12], [0, 1, 0]), fov: L.wide ? 50 : 78 }, // the back of the floor, looking at the stage
    ];
    render();
  }
  function render() {
    if (!ok || lost || !keys) return;
    const rise = seg(p, 0.10, 0.34);
    for (const b of blocks) { const pos = b.geo.attributes.position; for (const [i, h] of b.top) pos.setY(i, Math.max(0.004, h * rise)); pos.needsUpdate = true; b.geo.computeVertexNormals(); }
    const a = seg(p, 0.12, 0.40), b = seg(p, 0.42, 0.74);
    const P = (i) => lerp(lerp(keys[0].pos[i], keys[1].pos[i], a), keys[2].pos[i], b);
    camera.position.set(P(0), P(1), P(2));
    camera.quaternion.copy(keys[0].q).slerp(keys[1].q, a).slerp(keys[2].q, b);
    camera.fov = lerp(lerp(keys[0].fov, keys[1].fov, a), keys[2].fov, b);
    // on a wide window the plan sits to the right of the words, and comes to the middle as the camera lands
    const shift = (1 - b) * (L.wide ? -0.17 * L.w : 0), down = (1 - b) * (L.wide ? 0 : -0.13 * L.h);
    camera.setViewOffset(L.w, L.h, shift, down, L.w, L.h);
    camera.updateProjectionMatrix();
    for (const s of blocks.screens) s.material.opacity = seg(p, 0.36, 0.52);
    renderer.render(scene, camera);
  }
  function update(pp, l) {
    p = pp; L = l;
    const o = seg(p, 0.76, 0.86), rw = +real.dataset.w;
    const pan = L.wide ? 0 : (rw - (L.w - 2 * L.g)) * smooth(lin(p, 0.84, 0.98));
    place(real, L.wide ? (L.w - rw) / 2 : L.g - pan, L.wide ? L.h * 0.3 : L.h * 0.36, 1, o);
    real.style.clipPath = L.wide ? "" : `inset(0 ${(rw - (L.w - 2 * L.g) - pan).toFixed(1)}px 0 ${pan.toFixed(1)}px)`;
    canvas.style.opacity = (1 - seg(p, 0.78, 0.88)).toFixed(3);
    const n = $(".nogl", el); if (n) n.style.opacity = (1 - o).toFixed(3);
    render();
  }
  function destroy() {
    if (!ok) return; ok = false;
    scene.traverse((o) => { o.geometry?.dispose?.(); const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => { m?.map?.dispose?.(); m?.dispose?.(); }); });
    renderer.dispose(); blocks = [];
  }
  return { mount, resize, update, destroy };
}

// ---------------------------------------------------------------- 6 · the night: whole frames of the recap
function night(el) {
  const plates = $$(".plate", el).map((n) => ({ el: n, a: +n.dataset.range.split(",")[0], b: +n.dataset.range.split(",")[1], imgs: $$("img", n), pair: n.classList.contains("pair") }));
  let L;
  function resize(l) {
    L = l;
    for (const pl of plates) {
      if (L.wide) {
        const w = pl.pair ? Math.min(L.w - 2 * L.g, 1500, L.h * 0.5 * 4.2) : Math.min(L.w - 2 * L.g, L.h * 0.58 * (1600 / 681), 1500);
        pl.el.style.width = w + "px"; pl.el.style.overflow = ""; pl.w = w; pl.x = (L.w - w) / 2; pl.y = pl.pair ? L.h * 0.16 : L.h * 0.1;
        pl.el.style.gridTemplateColumns = ""; for (const im of pl.imgs) { im.style.width = ""; im.style.transform = ""; im.style.maxWidth = ""; }
      } else {
        const w = L.w - 2 * L.g; pl.el.style.width = w + "px"; pl.w = w; pl.x = L.g; pl.y = L.h * 0.3;
        if (pl.pair) { pl.el.style.gridTemplateColumns = "1fr"; pl.pan = 0; }
        else { const ih = L.h * 0.42, iw = ih * (1600 / 681); pl.imgs[0].style.width = iw + "px"; pl.imgs[0].style.maxWidth = "none"; pl.el.style.overflow = "hidden"; pl.pan = iw - w; }
      }
    }
  }
  function update(p, l) {
    L = l;
    for (const pl of plates) {
      const o = band(p, pl.a, pl.b, 0.035), t = lin(p, pl.a, Math.min(1, pl.b));
      place(pl.el, pl.x, pl.y + (1 - o) * 18, 1, o);
      if (!L.wide && !pl.pair) pl.imgs[0].style.transform = `translateX(${(-pl.pan * smooth(lin(t, 0.1, 0.62))).toFixed(1)}px)`;   // a wide frame, read across as you scroll
    }
  }
  return { resize, update };
}

// ---------------------------------------------------------------- the engine
const SCENES = { discover, assemble, acts, campaign, room, night };
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
      const near = top < vh * 1.6 && bottom > -vh * 0.8, far = top > vh * 3.5 || bottom < -vh * 2.5;
      if (near && !c.mounted) { c.mounted = true; loadImages(c.el); c.scene.resize?.(L); c.scene.mount?.(); c.p = -1; }
      else if (c.mounted && far && c.scene.destroy) { c.scene.destroy(); c.mounted = false; c.p = -1; }
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
    if (railName) railName.textContent = current < 0 ? "Why Not! Mazzika" : `${current + 1} / ${railLinks.length} · ${railLinks[current].title}`;
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
    btn.textContent = FULL ? "Motion on" : "Motion off"; btn.setAttribute("aria-pressed", String(!FULL));
    btn.addEventListener("click", () => { try { localStorage.setItem("az-motion", FULL ? "off" : "full"); } catch (e) {} const u = new URL(location.href); u.searchParams.delete("motion"); u.searchParams.delete("ch"); u.searchParams.delete("p"); location.href = u.pathname + u.search; });
  }
}
films();
if (FULL) start();
