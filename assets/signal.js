/* signal.js — the Signal containers on the home page (Selected work, design 2B, 12 Oct).
   Each .sg-c box (the picture inside a.sg and button.sg.wide) is clipped to the signal of the mark, stretched in the middle,
   from its own rendered size: at load, when the fonts are ready and on every resize. Without JavaScript the boxes stay rectangles.
   band() is copied from design/sig.js (geometry from signal-demo.js), unchanged. */
(() => {
'use strict';
const r2 = n => Math.round(n * 100) / 100;

/* ---------- the container: the signal itself, stretched in the middle ---------- */
const RAW = {
  tl: [42.242188, 126.320312], bl: [30.691406, 167.089844],
  brc1: [37.269531, 167.089844], brc2: [43.046875, 162.726562], br: [44.839844, 156.394531],
  tr: [56.386719, 115.625], tlc1: [49.8125, 115.625], tlc2: [44.035156, 119.992188]
};
const S = {};
for (const k in RAW) S[k] = [RAW[k][0] - RAW.bl[0], RAW[k][1] - RAW.tr[1]];
const H0 = S.bl[1];                                   // 51.4648  signal height
const W0 = S.tr[0];                                   // 25.6953  signal bounding width
const K = (S.tl[0] - S.bl[0]) / (S.bl[1] - S.tl[1]);  // 0.2833   slant (dx per dy, 15.8 deg)

function band(w, h, opts = {}) {
  const f = h / H0, natural = W0 * f;
  const bleedL = !!opts.bleedLeft, bleedR = !!opts.bleedRight;
  const B = (bleedL || bleedR) ? (opts.bleed != null ? opts.bleed : Math.max(4000, w * 4)) : 0;
  const dxL = bleedL ? -B : 0;                        // the left half runs off the page when bleeding left
  const dxR = bleedL ? w - natural                    // the right half ends at w
            : bleedR ? w - natural + B                // mirrored: the right half runs off the page, the rounded upper-left stays
            : Math.max(0, w - natural);
  const L = p => `${r2(p[0] * f + dxL)} ${r2(p[1] * f)}`;
  const R = p => `${r2(p[0] * f + dxR)} ${r2(p[1] * f)}`;
  return `M ${R(S.tr)} L ${L(S.tr)} C ${L(S.tlc1)} ${L(S.tlc2)} ${L(S.tl)} L ${L(S.bl)} L ${R(S.bl)} C ${R(S.brc1)} ${R(S.brc2)} ${R(S.br)} Z`;
}
window.band = band;
window.SIGNAL_K = K;

/* ---------- each .sg container: clip-path from its rendered size ---------- */
function layout() {
  document.querySelectorAll('.sg .sg-c').forEach(el => {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    el.style.clipPath = `path('${band(w, h)}')`;
  });
}
layout();
addEventListener('load', layout);
addEventListener('resize', layout);
if (document.fonts) document.fonts.ready.then(layout);
})();
