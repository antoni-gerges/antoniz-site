// Lane D engine: one owner of scroll progress, scene lifecycle and the motion preference.
// Adapted from the trial (110-SCROLL-TRIAL/js/scroll-controller.js and motion-preferences.js); copied into each case folder.
// Native scroll only. Geometry is read once per frame, scenes write after. Every pose is a pure function of progress,
// so scrolling back is exact. CSS `position: sticky` does the pinning; nothing is hijacked or smoothed.

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const seg = (p, a, b) => smooth((p - a) / (b - a));
export const lin = (p, a, b) => clamp((p - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const bell = (p, a, m, b) => (p < m ? seg(p, a, m) : 1 - seg(p, m, b));

// ---- motion preference: "full" | "off". The system setting wins unless the visitor overrides it with the toggle.
const KEY = "az-motion";
const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
const listeners = new Set();
function stored() { try { return localStorage.getItem(KEY); } catch { return null; } }
export function motionMode() {
  const q = new URLSearchParams(location.search).get("motion");
  if (q === "off" || q === "full") return q;               // review aid
  const s = stored();
  if (s === "off" || s === "full") return s;
  return mq.matches ? "off" : "full";
}
function applyMotion() {
  const m = motionMode();
  document.documentElement.dataset.motion = m;
  for (const fn of listeners) fn(m);
  const btn = document.querySelector("[data-motion-toggle]");
  if (btn) { btn.setAttribute("aria-pressed", m === "off" ? "true" : "false"); btn.textContent = m === "off" ? "Motion off" : "Motion on"; }
}
export function onMotionChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function initMotion() {
  applyMotion();
  mq.addEventListener?.("change", applyMotion);
  document.querySelector("[data-motion-toggle]")?.addEventListener("click", () => {
    const next = motionMode() === "off" ? "full" : "off";
    try { localStorage.setItem(KEY, next); } catch {}
    applyMotion();
  });
}

export function webglOK() {
  if (new URLSearchParams(location.search).get("gl") === "off") return false;   // review aid: test the no-WebGL path
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

// ---- scroll controller
export function createScrollController() {
  const entries = [];
  let queued = false, enabled = true;
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

  function update() {
    queued = false;
    const vh = window.innerHeight;
    const reads = entries.map((e) => {
      const r = e.el.getBoundingClientRect();
      return { e, top: r.top, bottom: r.bottom, p: -r.top / Math.max(1, r.height - vh) };
    });
    for (const { e, top, bottom, p } of reads) {
      const near = top < vh * 1.5 && bottom > -vh * 0.5;
      const far = top > vh * 3 || bottom < -vh * 2;
      if (enabled && near && !e.mounted && !e.failed) {
        const ok = e.scene.mount() !== false;
        if (ok) { e.mounted = true; e.el.classList.add("live"); e.p = -1; }
        else { e.failed = true; e.el.classList.remove("live"); }
      } else if (e.mounted && far) {
        e.scene.destroy(); e.mounted = false; e.p = -1;     // "live" stays: the pin keeps its height, no scroll jump
      }
      if (!e.mounted) continue;
      const active = top < vh && bottom > 0;
      if (active !== e.active) { e.active = active; e.scene.setActive?.(active); }
      if (!active) continue;
      const c = clamp(p);
      if (c !== e.p) { e.p = c; e.scene.setProgress(c); }
    }
  }
  function onResize() { for (const e of entries) { if (e.mounted) e.scene.resize?.(); e.p = -1; } schedule(); }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  window.addEventListener("pageshow", schedule);
  if (document.fonts?.ready) document.fonts.ready.then(onResize);

  return {
    add(el, scene) { entries.push({ el, scene, p: -1, active: false, mounted: false, failed: false }); if (enabled) el.classList.add("live"); schedule(); },
    setEnabled(on) {
      enabled = on;
      for (const e of entries) {
        if (!on) { if (e.mounted) { e.scene.destroy(); e.mounted = false; } e.el.classList.remove("live"); e.p = -1; e.failed = false; }
        else if (!e.failed) e.el.classList.add("live");
      }
      schedule();
    },
    refresh: onResize,
  };
}

// ---- copy beats: real HTML, one visible at a time, opacity from progress. data-range="a,b"
export function createBeats(section) {
  const beats = [...section.querySelectorAll(".beat")].map((el) => {
    const [a, b] = el.dataset.range.split(",").map(Number);
    return { el, a, b };
  });
  return {
    set(p) {
      for (const b of beats) {
        const o = clamp(Math.min(b.a > 0 ? (p - b.a) / 0.02 : 1, b.b < 1 ? (b.b - p) / 0.02 : 1));
        b.el.style.opacity = o.toFixed(3);
        b.el.style.transform = `translateY(${(14 * (1 - o)).toFixed(1)}px)`;
        b.el.classList.toggle("on", o > 0.5);
      }
    },
    clear() { for (const b of beats) { b.el.style.opacity = ""; b.el.style.transform = ""; b.el.classList.remove("on"); } },
  };
}

// ---- film: plays only when the visitor presses Play; muted; stops when the scene leaves
export function createFilm(holder, labels = { play: "Play the film", stop: "Stop" }) {
  if (!holder) return { stop() {} };
  const btn = holder.querySelector(".play-film"), video = holder.querySelector("video");
  let playing = false;
  function stop() {
    if (!playing) return;
    playing = false; video.pause(); video.removeAttribute("src"); video.load();
    holder.classList.remove("playing"); btn.textContent = labels.play; btn.setAttribute("aria-pressed", "false");
  }
  function play() {
    if (playing) { stop(); return; }
    playing = true; video.src = video.dataset.src; holder.classList.add("playing");
    btn.textContent = labels.stop; btn.setAttribute("aria-pressed", "true");
    video.play().catch(stop);
  }
  btn.addEventListener("click", play);
  video.addEventListener("ended", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  return { stop, get playing() { return playing; } };
}
// Films outside a pinned scene (static story, motion off): same rule, the visitor presses Play.
export function wireLooseFilms(root = document) {
  for (const h of root.querySelectorAll(".film-holder[data-loose]")) createFilm(h, { play: h.dataset.play || "Play the film", stop: "Stop" });
}

// ---- review aid only: ?p=0.5&s=room opens the page at that progress of a scene (fixed-progress captures)
export function reviewJump() {
  const q = new URLSearchParams(location.search);
  if (q.get("p") === null) return;
  const el = document.querySelector(`[data-scene='${q.get("s")}']`) || document.querySelector("[data-scene]");
  if (!el) return;
  const go = () => window.scrollTo(0, el.offsetTop + clamp(+q.get("p")) * (el.offsetHeight - window.innerHeight));
  go(); requestAnimationFrame(go); setTimeout(go, 400); setTimeout(go, 1200);
}
