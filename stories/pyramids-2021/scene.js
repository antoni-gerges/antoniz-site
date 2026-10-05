// An anniversary under the Pyramids, Giza, 27 October 2021.
// Visual rule: the triangle. Every new picture arrives through a triangle growing from its apex, the shape of the pyramid
// that stands behind every photograph of the lawn. Each scene is a pure function of its own scroll progress.
import { clamp, seg, lin, lerp, createScrollController, createBeats, createFilm, initMotion, motionMode, onMotionChange, reviewJump } from "./engine.js";

// a triangle with its apex above the middle, grown by t (0 = a point, 1 = covers the frame)
const tri = (t) => {
  const ay = 60 - 360 * t, by = 60 + 240 * t, hw = 420 * t;
  return `polygon(50% ${ay.toFixed(2)}%, ${(50 - hw).toFixed(2)}% ${by.toFixed(2)}%, ${(50 + hw).toFixed(2)}% ${by.toFixed(2)}%)`;
};

// the invitation: whole, then the camera moves into the number one; the totem arrives beside it
function createIdeaScene(section) {
  const beats = createBeats(section), img = section.querySelector(".art img"), plate = section.querySelector(".plate");
  let p = 0;
  function apply() {
    const z = seg(p, 0.36, 0.66);
    img.style.transform = `scale(${lerp(1, 2.35, z).toFixed(4)})`;
    const t = seg(p, 0.72, 0.9);
    plate.style.opacity = t > 0 ? "1" : "0";
    plate.querySelector("img").style.clipPath = t < 1 ? tri(t) : "none";
    plate.classList.toggle("on", t > 0.5);
    beats.set(p);
  }
  return { mount() { return true; }, resize: apply, setProgress(v) { p = v; apply(); }, setActive() {},
    destroy() { img.style.transform = ""; plate.style.opacity = ""; plate.querySelector("img").style.clipPath = ""; plate.classList.remove("on"); beats.clear(); } };
}

// a sequence of pictures in one frame, each arriving through the triangle
function createSequenceScene(section) {
  const beats = createBeats(section), pics = [...section.querySelectorAll(".pics img")], caps = [...section.querySelectorAll(".cap")];
  const n = pics.length;
  let p = 0;
  function apply() {
    const x = lin(p, 0.04, 0.92) * (n - 1);
    pics.forEach((el, i) => {
      const t = i === 0 ? 1 : seg(x, i - 0.75, i - 0.05);
      el.style.setProperty("--tri", t >= 1 ? "none" : tri(t));
      el.style.visibility = t > 0 ? "visible" : "hidden";
    });
    const top = Math.round(x);
    caps.forEach((c, i) => { c.style.opacity = i === top ? "1" : "0"; });
    beats.set(p);
  }
  return { mount() { return true; }, resize: apply, setProgress(v) { p = v; apply(); }, setActive() {},
    destroy() { pics.forEach((el) => { el.style.removeProperty("--tri"); el.style.visibility = ""; }); caps.forEach((c) => (c.style.opacity = "")); beats.clear(); } };
}

initMotion();
const controller = createScrollController();
const add = (name, make) => { const el = document.querySelector(`[data-scene='${name}']`); if (el) controller.add(el, make(el)); };
add("idea", createIdeaScene);
add("lawn", createSequenceScene);
add("screens", createSequenceScene);
for (const h of document.querySelectorAll(".film-holder")) createFilm(h, { play: h.dataset.play || "Play the film", stop: "Stop" });
const sync = () => controller.setEnabled(motionMode() === "full");
sync(); onMotionChange(sync);
reviewJump();
document.documentElement.classList.add("js");
