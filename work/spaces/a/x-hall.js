/* E-EXHIBITIONS, 21 Oct 2026 · "The hall": sixteen stands rebuilt in 3D from their own floor plans (metres), on one dark hall floor.
   Each plan is first drawn as lines on the floor, then its walls rise as solid volumes in one hard move (500 ms, ease-out, a hard stop).
   Never a picture on a card, never an opacity change. Scroll raises the five built stands in date order (the stage is pinned for about
   three screens); a tap raises the other eleven (ten designs and one proposal). A built stand's tag opens its photograph in the viewer.
   three.js is the site's own copy (vendor/), loaded only when the section is near. Reduced motion or no WebGL: the still and the list.
   The source of every footprint is named in the list under the stage (and in S below: src). */
(function () {
  'use strict';
  var SEC = document.getElementById('x-hall');
  if (!SEC) return;
  var stage = SEC.querySelector('.xh-stage'), cvs = SEC.querySelector('.xh-canvas'), labs = SEC.querySelector('.xh-labs'),
      cap = SEC.querySelector('.xh-cap'), btn = SEC.querySelector('.xh-raise');
  var Q = new URLSearchParams(location.search), STILL = Q.get('xh') === 'still';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function gl() { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
  if ((RM && !STILL) || !gl()) { SEC.classList.add('xh-off'); return; }
  SEC.classList.add('xh-on');

  /* ---------------------------------------------------------------- the stands (metres; x along the plan, z down the plan; y up)
     part: [type, ...]  box: x z w d h y col [rotDeg]  ·  obox: cx cz len wid h y col rotDeg  ·  cyl: cx cz r h y col [seg]
     tube: x z len r col (a round tunnel lying along z)  ·  strip: x0 z0 x1 z1 width y col (a thin floor band)  ·  poly: pts h y col
     tri: pts h t col (three walls)  ·  panels: cx cz r n panelW h a0 a1 col  ·  ring: cx cz rIn rOut h y col  ·  arch: x z w d h t col
     frame: x z w d h t col (a portal: two posts and a beam)  ·  spheres: x0 z0 x1 z1 width y (the ceiling of light, with its truss)
     colours: w white · c cream · f light floor · d dark · g glass · a the stand's accent (taken from its own 3D) · or a hex */
  var S = [
    { id: 'wfes', name: 'World Future Energy Summit', yr: '2013', kind: 'built', w: 26, d: 20, a: '#5c9e3a',
      size: '85 by 66 ft (26 by 20 m)', src: 'the plan of its bill of quantities, 23 January 2013', photo: 'a/wfes-2013-built.webp',
      p: [['box', 0, 0, 26, 20, .15, 0, 'f'], ['tube', .1, 4.9, 11.08, 1.84, 'w'], ['cyl', 13, 10.27, 4, 3, .15, 'w'], ['cyl', 13, 10.27, 4.15, 1.3, 3.15, 'a'],
          ['box', 21.16, 5.88, 4.84, 8.04, .3, 3.15, 'w'], ['box', 21.2, 5.9, .25, .25, 3, .15, 'w'], ['box', 25.7, 5.9, .25, .25, 3, .15, 'w'],
          ['box', 21.2, 13.6, .25, .25, 3, .15, 'w'], ['box', 25.7, 13.6, .25, .25, 3, .15, 'w'], ['box', 17.11, 9.95, 4.2, 1.81, .25, 3.15, 'w'],
          ['box', 3.76, 0, 4.01, 2.99, 1.1, .15, 'w'],
          ['stair', 21.75, 13.92, 4.25, 5.15, 3.15, 7, 'w'],
          ['box', 14.7, 17.1, .9, .9, 1.3, .15, 'a'], ['box', 24.1, 1, .9, .9, 1.3, .15, 'a'], ['box', 19.4, 15.5, .9, .9, 1.3, .15, 'a'],
          ['box', 8.1, 17.4, .9, .9, 1.3, .15, 'a'], ['box', 22.8, .7, .9, .9, 1.3, .15, 'a'], ['box', 19.4, 2, .9, .9, 1.3, .15, 'a'],
          ['box', 19.2, 18.4, .9, .9, 1.3, .15, 'a'], ['box', 13.4, .9, .9, .9, 1.3, .15, 'a']] },
    { id: 'tawdheef', name: 'Tawdheef', yr: '2017', kind: 'built', w: 12, d: 12, a: '#b3262e',
      size: '39 by 39 ft (12 by 12 m)', src: 'its photographs, at the size on its invoice', photo: 'a/x-taw-front-1600.webp',
      p: [['box', 0, 0, 12, 12, .12, 0, 'f'], ['box', .4, .4, 2.8, 4.2, 3.4, .12, 'c'], ['box', 8.8, .4, 2.8, 4.2, 3.4, .12, 'c'],
          ['box', 3.6, .6, 4.8, 4.4, 2.8, .12, 'g'], ['frame', 3.25, 4.9, 5.5, .6, 4.2, .55, 'a'], ['frame', 3.25, .3, 5.5, .6, 4.2, .55, 'a'],
          ['box', .9, 8.6, .7, .5, 1.5, .12, 'w'], ['box', 2.05, 8.6, .7, .5, 1.5, .12, 'w'], ['box', 3.2, 8.6, .7, .5, 1.5, .12, 'w'],
          ['box', 4.35, 8.6, .7, .5, 1.5, .12, 'w'], ['box', 5.5, 8.6, .7, .5, 1.5, .12, 'w'], ['box', 7.8, 9.2, 3.4, .8, 1.1, .12, 'w']] },
    { id: 'cityscape', name: 'Cityscape Abu Dhabi', yr: '2017', kind: 'built', w: 28, d: 24, a: '#7d2232',
      size: '92 by 79 ft (28 by 24 m)', src: 'the builder’s fabrication plan (Divine Creations)', photo: 'a/x-city-carpet-1600.webp',
      p: [['box', 0, 0, 28, 24, .2, 0, 'f'], ['box', 4.2, 4.2, 19.4, 14.8, .06, .2, 'c'], ['strip', 11.1, 17, 24.6, 3, 2.4, .26, 'a'],
          ['box', 9.05, 0, 9.5, 4.2, 4.6, .2, 'w'], ['box', 9.05, 0, 9.5, 4.2, .7, 4.8, 'a'], ['box', 23.8, 9.46, 4.2, 9.55, 4.6, .2, 'w'],
          ['box', 23.8, 9.46, 4.2, 9.55, .7, 4.8, 'a'], ['obox', 26.6, 1.3, 3, 2.2, 7.5, .2, 'a', 45],
          ['box', .6, 3.25, 1.9, 2.4, 1, .2, 'w'], ['box', .6, 6.35, 1.9, 2.4, 1, .2, 'w'], ['box', .6, 9.45, 1.9, 2.4, 1, .2, 'w'],
          ['box', .6, 12.55, 1.9, 2.4, 1, .2, 'w'], ['box', 3.7, .4, 2.3, 2, 1, .2, 'w'], ['box', 6.5, .4, 2.3, 2, 1, .2, 'w'],
          ['box', 3.3, 13.1, 2.3, 2, 1, .2, 'w'], ['spheres', 11.1, 17, 24.6, 3, 3.6, 6.2]] },
    { id: 'dot', name: 'Department of Transport, Abu Dhabi', yr: '2018', kind: 'built', w: 6, d: 6, a: '#c49a6c',
      size: '20 by 20 ft (6 by 6 m)', src: 'its photographs, at the size on its quotation', photo: 'a/x-dot-booth-1600.webp',
      p: [['box', 0, 0, 6, 6, .08, 0, '#2f4a7a'], ['box', 0, 0, 6, .2, 3, .08, 'w'], ['box', 0, 0, .2, 3.6, 3, .08, 'w'],
          ['box', 5.85, 5.85, .15, .15, 3, .08, 'w'], ['box', 0, 5.85, .15, .15, 3, .08, 'w'], ['box', 5.85, 0, .15, .15, 3, .08, 'w'],
          ['box', 0, 5.75, 6, .25, .45, 2.63, 'w'], ['box', 5.75, 0, .25, 6, .45, 2.63, 'w'], ['box', .3, 1.8, 2.6, .12, 2.6, .08, 'a'],
          ['box', 3.7, 4.5, 1.8, .6, 1.1, .08, 'w']] },
    { id: 'shurooq', name: 'Shurooq', yr: '2018', kind: 'built', w: 18.6, d: 9, a: '#1d7474',
      size: '10 by 10 ft each (3 by 3 m)', src: 'the measured 3D drawn for the builder', photo: 'a/x-shq-rows-1080.webp',
      p: [['box', 0, 0, 18.6, 9, .05, 0, 'f'], ['arch', 0, 0, 3, 3, 2.6, .18, 'w'], ['arch', 3.1, 0, 3, 3, 2.6, .18, 'w'], ['arch', 6.2, 0, 3, 3, 2.6, .18, 'w'],
          ['arch', 9.3, 0, 3, 3, 2.6, .18, 'w'], ['arch', 12.4, 0, 3, 3, 2.6, .18, 'w'], ['arch', 15.5, 0, 3, 3, 2.6, .18, 'w'],
          ['arch', 1.55, 6, 3, 3, 2.6, .18, 'w'], ['arch', 4.65, 6, 3, 3, 2.6, .18, 'w'], ['arch', 7.75, 6, 3, 3, 2.6, .18, 'w'],
          ['arch', 10.85, 6, 3, 3, 2.6, .18, 'w'], ['arch', 13.95, 6, 3, 3, 2.6, .18, 'w']] },
    { id: 'abb', name: 'ABB at ADIPEC', yr: '2012', kind: 'design', w: 20, d: 20, a: '#e2001a', src: 'its plan',
      p: [['box', 0, 0, 20, 20, .1, 0, 'f'], ['box', 4, 0, 1.6, 20, .03, .1, 'd'], ['box', 14, 0, 1.6, 20, .03, .1, 'd'], ['box', 0, 3.2, 20, 1.6, .03, .1, 'd'],
          ['box', 0, 14.4, 20, 1.6, .03, .1, 'd'], ['box', 6.2, 5.3, 7.4, 8.6, 3.2, .1, 'w'], ['box', 6.2, 5.3, 5.2, 4.6, 2.6, 3.3, 'w'],
          ['box', 6.2, 5.3, 5.2, 4.6, .5, 5.9, 'a'], ['box', 12.4, 9.5, 1, 10, 4, .1, 'w'], ['box', .5, .5, 3, 2, 1, .1, 'w'], ['box', 16.5, .5, 3, 2, 1, .1, 'w'],
          ['box', .5, 17, 3, 2.4, 1, .1, 'w'], ['box', 16.5, 17, 3, 2.4, 1, .1, 'w'], ['box', .6, 6, 2, 6, 1.1, .1, 'a']] },
    { id: 'ducab', name: 'Ducab at Middle East Electricity', yr: '2012', kind: 'design', w: 15, d: 6, a: '#f39200', src: 'its dimensioned elevation, 15 m by 6 m high',
      p: [['box', 0, 0, 15, 6, .1, 0, 'f'], ['box', 0, 0, 15, 1, 4.2, .1, 'w'], ['box', 10.7, 0, 3.4, 3, 6, .1, 'w'], ['box', 10.9, 2.95, 3, .12, .8, 4.6, 'a'],
          ['box', 6.6, .9, 2.4, 1.2, 3.2, .1, 'a'], ['box', 2, 1, 4.4, .4, 3.8, .1, 'w'], ['box', 11, 3.5, 2.8, .8, 1.1, .1, 'w']] },
    { id: 'dwtc', name: 'Dubai pavilion, Dubai World Trade Centre', yr: '2012', kind: 'design', w: 38, d: 14, a: '#c1272d', src: 'its layout',
      p: [['box', 0, 0, 38, 14, .08, 0, '#3a3c42'], ['box', 20.5, .2, 17.3, 6.2, 4.4, .08, 'w'], ['poly', [[11, 4.5], [17, 1.5], [22, 2.5], [18, 5], [13, 6]], .8, .08, 'a'],
          ['box', .3, .3, 3.4, 2.4, 2.4, .08, 'w'], ['box', 5, .3, 3.4, 2.4, 2.4, .08, 'w'], ['box', 9.7, .3, 3.4, 2.4, 2.4, .08, 'w'],
          ['box', .3, 4.5, 3.4, 2.4, 2.4, .08, 'w'], ['box', 5, 4.5, 3.4, 2.4, 2.4, .08, 'w'], ['box', .3, 11.2, 3.4, 2.6, 2.4, .08, 'a'],
          ['box', 5, 11.2, 3.4, 2.6, 2.4, .08, 'w'], ['box', 9.7, 11.2, 3.4, 2.6, 2.4, .08, 'a'], ['box', 14.4, 11.2, 3.4, 2.6, 2.4, .08, 'w'],
          ['box', 19.1, 11.2, 3.4, 2.6, 2.4, .08, 'a'], ['box', 23.8, 11.2, 3.4, 2.6, 2.4, .08, 'w'], ['box', 28.5, 11.2, 3.4, 2.6, 2.4, .08, 'a'],
          ['box', 33.2, 11.2, 3.4, 2.6, 2.4, .08, 'w']] },
    { id: 'actvet', name: 'ACTVET at Najah', yr: '2012', kind: 'design', w: 22, d: 22, a: '#8b1a1a', src: 'its plan',
      p: [['box', 0, 0, 22, 22, .08, 0, 'd'], ['ring', 11, 11, 6.4, 8.6, .25, .08, 'a'], ['panels', 11, 11, 10.2, 12, 2.2, 2.6, 110, 400, 'w'],
          ['cyl', 10.4, 13.5, 3, 4.6, .08, 'w'], ['box', 11, 8, 5, 4, .3, 3.2, 'w'], ['box', 11.5, 8.5, 3, 1, .6, 3.5, 'a']] },
    { id: 'adec', name: 'Abu Dhabi Education Council', yr: '2011–13', kind: 'design', w: 30, d: 15, a: '#c0272d', src: 'its plan',
      p: [['box', 0, 0, 30, 15, .08, 0, '#4a1216'], ['strip', 3.2, 0, 10.5, 15, 3, .1, '#1f5f6b'], ['poly', [[.2, 14.8], [9.6, 14.8], [4.9, 5.6]], .06, .1, 'w'],
          ['tri', [[.2, 14.8], [9.6, 14.8], [4.9, 5.6]], 3.4, .3, 'a'], ['poly', [[11, 8.6], [21.4, 8.6], [16.2, .4]], .06, .1, 'w'],
          ['tri', [[11, 8.6], [21.4, 8.6], [16.2, .4]], 3.8, .3, 'a'], ['box', 22.5, .3, 4.5, 2.6, 3, .08, 'w'],
          ['box', 16.5, 11.5, 2.2, 3.2, 2.4, .08, 'w'], ['box', 21, 11.5, 2.2, 3.2, 2.4, .08, 'w'], ['box', 25.5, 11.5, 2.2, 3.2, 2.4, .08, 'w']] },
    { id: 'adcom', name: 'ADCOM Systems', yr: '2011–13', kind: 'design', w: 16, d: 13, a: '#c8102e', src: 'its plan',
      p: [['box', 0, 0, 16, 13, .08, 0, 'f'], ['strip', 2, 12, 11, 4, 1.6, .1, 'a'], ['strip', 6, 13, 10, 7, 1, .1, 'a'],
          ['obox', 5, 10.5, 8, 1, 1.6, .1, 'w', 35], ['obox', 5.4, 10.2, 6, .9, .45, 1, 'w', -55], ['obox', 12.6, 2.6, 7, .9, 1.4, .1, 'w', -35],
          ['obox', 12.6, 2.7, 5, .8, .4, .9, 'w', 55], ['box', 8.2, 6.8, 3.8, 3.2, 3, .1, 'g'],
          ['poly', [[1.5, 1.2], [9.5, .6], [5.6, 6.4]], .35, 4.2, 'a'], ['cyl', 5.6, 2.8, .3, 4.2, .08, 'd']] },
    { id: 'elm', name: 'Elm', yr: '2011–13', kind: 'design', w: 10, d: 10, a: '#5b2d86', src: 'its plan',
      p: [['box', 0, 0, 10, 10, .1, 0, '#7a5a3c'], ['obox', 6.3, 3, 4.6, 4, 3, .1, 'w', -14], ['obox', 6.3, 3, 4.7, 4.1, .3, 3.1, 'a', -14],
          ['obox', 3.4, 5.2, 4.2, 3.6, 3, .1, 'w', 18], ['obox', 3.4, 5.2, 4.3, 3.7, .3, 3.1, 'a', 18], ['box', 1.5, 8.6, 3.5, .7, 1.1, .1, 'w'],
          ['box', 8.4, .6, 1.2, 2.2, 1.1, .1, 'w']] },
    { id: 'etisalat', name: 'Etisalat at GITEX Shopper', yr: '2011–13', kind: 'design', w: 30, d: 19, a: '#7fb539', src: 'its circulation plan',
      p: [['box', 0, 0, 30, 19, .08, 0, 'd'], ['poly', [[2, 1], [12, 1], [9, 7], [4, 10]], .05, .08, 'a'],
          ['poly', [[11, 18.5], [16, 7], [22, 5], [29, 6], [29, 9], [20, 10], [17, 18.5]], .05, .08, 'a'],
          ['panels', 5.8, 13.3, 4, 10, 1.6, 2.8, 0, 360, 'w'], ['cyl', 5.8, 13.3, 1.6, 3.2, .08, 'w'], ['box', 14.5, 0, 15.5, 4.5, .4, 3.6, 'w'],
          ['box', 14.5, 0, .3, 4.5, 3.6, .08, 'w'], ['box', 29.7, 0, .3, 4.5, 3.6, .08, 'w'], ['box', 24, 13, 1.2, 4, 1.1, .08, 'w']] },
    { id: 'safia', name: 'Safia Trading at IDEX', yr: '2011–13', kind: 'design', w: 29, d: 19, a: '#1f2d4a', src: 'its plan',
      p: [['box', 0, 0, 29, 19, .1, 0, 'f'], ['box', .2, .2, 8.4, 4, 2.6, .1, 'a'], ['box', 10.3, .2, 8.4, 4, 2.6, .1, 'a'], ['box', 20.4, .2, 8.4, 4, 2.6, .1, 'a'],
          ['box', .2, 6, 8.4, 4, 2.6, .1, 'a'], ['box', 10.3, 6, 8.4, 4, 2.6, .1, 'a'], ['box', 20.4, 6, 8.4, 4, 2.6, .1, 'a'],
          ['box', 3.6, 11, 22.6, 7.8, 4.2, .1, 'w'], ['box', 3.6, 10.8, 22.6, .2, 4.4, .1, '#b8933a'], ['box', .2, 11, 3.2, 7.8, 3, .1, 'a'],
          ['box', 26.4, 11, 2.4, 7.8, 3, .1, 'a']] },
    { id: 'algaith', name: 'Al Gaith at ADIPEC', yr: '2013', kind: 'design', w: 36, d: 20, a: '#26323f', src: 'its plan',
      p: [['box', 0, 0, 36, 20, .1, 0, 'f'], ['box', 9, 0, 18, 6.5, 3.2, .1, 'w'], ['box', 9, 0, 18, 9.5, 3, 3.3, 'a'], ['box', 9.5, 6.5, 17, 5.5, .05, .1, '#8a6440'],
          ['box', .5, .5, 6, 6, 2.6, .1, 'w'], ['box', 29.5, .5, 6, 6, 2.6, .1, 'w'], ['box', .5, 8, 4.5, 3.5, 2.6, .1, 'a'], ['box', 31, 8, 4.5, 4.5, 2.6, .1, 'a'],
          ['box', .5, 15.8, 4, 3.8, 2.4, .1, 'w'], ['box', 6, 15.8, 4, 3.8, 2.4, .1, 'a'], ['box', 13, 15.8, 4, 3.8, 2.4, .1, 'w'], ['box', 21.5, 15.8, 4, 3.8, 2.4, .1, 'a'],
          ['box', 29, 15.8, 4, 3.8, 2.4, .1, 'w']] },
    { id: 'alhamra', name: 'Al Hamra at ISNR', yr: '2022', kind: 'proposal', w: 17, d: 20, a: '#3a9d4a', src: 'its floor plan and elevation (a lost bid)',
      p: [['box', 0, 0, 17, 20, .08, 0, '#3b3d42'], ['box', 0, 0, 8.6, 7.2, 3.2, .08, 'w'], ['box', 0, 0, 8.6, 7.2, 3, 3.3, 'w'], ['box', .2, -.05, 4.5, .1, 2.5, 3.6, 'd'],
          ['box', 0, 8.5, 17, 1.4, .03, .09, '#1b1c1f'], ['box', 9.5, 0, 1.4, 20, .03, .09, '#1b1c1f'], ['cyl', 3, 16.5, 2, 2.8, .08, '#3a9d4a', 6],
          ['cyl', 8.2, 16.5, 2, 2.8, .08, '#b0262d', 6], ['cyl', 13.8, 16.5, 2, 2.8, .08, '#2f62b0', 6], ['cyl', 10.2, 9.2, 1.9, .6, .08, 'w', 6],
          ['box', 11.5, .5, 5, 3, 2.6, .08, 'w'], ['box', 11.2, 10.4, 5.6, 4.4, .04, .09, '#3a7d3a']] }
  ];
  var BUILT = S.filter(function (s) { return s.kind === 'built'; }), PAPER = S.filter(function (s) { return s.kind !== 'built'; });

  /* ---------------------------------------------------------------- the hall: rows of stands, 7 m aisles, the built row in front */
  var HALL_W = 122, AISLE = 7, rows = [], row = [], rw = 0;
  [BUILT, PAPER].forEach(function (grp, gi) {
    grp.forEach(function (s) { if (row.length && rw + s.w > HALL_W) { rows.push(row); row = []; rw = 0; } row.push(s); rw += s.w + AISLE; });
    if (gi === 0 && row.length) { rows.push(row); row = []; rw = 0; }
  });
  if (row.length) rows.push(row);
  var HW = 0, placed = [];                                   // the built row nearest the viewer (largest z)
  rows.forEach(function (r) { var dmax = 0; r.forEach(function (s) { dmax = Math.max(dmax, s.d); }); placed.push({ r: r, dmax: dmax }); });
  var zTot = placed.reduce(function (a, p) { return a + p.dmax; }, 0) + AISLE * (placed.length - 1);
  var z = zTot;
  placed.forEach(function (p) {
    var tot = p.r.reduce(function (a, s) { return a + s.w; }, 0) + AISLE * (p.r.length - 1), x = (HALL_W - tot) / 2;
    p.r.forEach(function (s) { s.ox = x; s.oz = z - s.d; x += s.w + AISLE; HW = Math.max(HW, x); });
    z -= p.dmax + AISLE;
  });
  var HALL_D = zTot;

  /* ---------------------------------------------------------------- three, when near */
  var started = false;
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !started) { started = true; io.disconnect(); go(); } }, { rootMargin: '150% 0px' });
  io.observe(SEC);

  function go() {
    import('../../../vendor/three.module.min.js').then(build).catch(function () { SEC.classList.remove('xh-on'); SEC.classList.add('xh-off'); });
  }

  function build(T) {
    var phone = function () { return innerWidth <= 760; };
    var R;
    try { R = new T.WebGLRenderer({ canvas: cvs, antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: STILL }); }
    catch (e) { SEC.classList.remove('xh-on'); SEC.classList.add('xh-off'); return; }
    R.setClearColor(0x0B0C10, 1); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.0; R.outputColorSpace = T.SRGBColorSpace;
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, .5, 2000);
    scene.add(new T.HemisphereLight(0xffffff, 0x1a1c22, 1.15));
    var sun = new T.DirectionalLight(0xffffff, 2.1); sun.position.set(HALL_W * .2 - 60, 140, HALL_D + 90); sun.target.position.set(HALL_W / 2, 0, HALL_D / 2);
    sun.castShadow = true; var sc = sun.shadow.camera, half = Math.max(HALL_W, HALL_D) * .75;
    sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.near = 10; sc.far = 500; sun.shadow.mapSize.set(phone() ? 1024 : 2048, phone() ? 1024 : 2048);
    sun.shadow.bias = -.0006; scene.add(sun); scene.add(sun.target);

    // the floor: the hall's dark ground, a 5 m grid, the hall's edge
    var floor = new T.Mesh(new T.PlaneGeometry(1200, 1200), new T.MeshStandardMaterial({ color: 0x101116, roughness: .95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(HALL_W / 2, 0, HALL_D / 2); floor.receiveShadow = true; scene.add(floor);
    var gp = [], GX = Math.ceil(HALL_W / 5) * 5 + 20, GZ = Math.ceil(HALL_D / 5) * 5 + 20;
    for (var gx = -10; gx <= GX - 10; gx += 5) gp.push(gx, .01, -10, gx, .01, GZ - 10);
    for (var gz = -10; gz <= GZ - 10; gz += 5) gp.push(-10, .01, gz, GX - 10, .01, gz);
    var gg = new T.BufferGeometry(); gg.setAttribute('position', new T.Float32BufferAttribute(gp, 3));
    scene.add(new T.LineSegments(gg, new T.LineBasicMaterial({ color: 0x1f2128 })));

    var MAT = {}, COL = { w: '#e9e7e2', c: '#e3d6bd', f: '#cfcac0', d: '#2a2d34', g: '#9fb4c2' };
    function mat(c, s) {
      var hex = c === 'a' ? s.a : (COL[c] || c), k = hex + (c === 'g' ? 'g' : '');
      if (!MAT[k]) MAT[k] = new T.MeshStandardMaterial({ color: new T.Color(hex), roughness: c === 'g' ? .18 : .72, metalness: c === 'g' ? .25 : 0 });
      return MAT[k];
    }
    var lineMat = new T.LineBasicMaterial({ color: 0xd6dae2 });

    function addMesh(g, geo, m, x, y, z, ry) { var me = new T.Mesh(geo, m); me.position.set(x, y, z); if (ry) me.rotation.y = ry; me.castShadow = true; me.receiveShadow = true; g.add(me); return me; }
    function rectPts(x, z, w, d, rot) {   // the four floor corners of a box (rot about its centre, degrees)
      var cx = x + w / 2, cz = z + d / 2, r = (rot || 0) * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r), o = [];
      [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].forEach(function (p) { o.push([cx + p[0] * c + p[1] * sn, cz - p[0] * sn + p[1] * c]); });
      return o;
    }
    function circPts(cx, cz, r, n) { var o = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; o.push([cx + Math.sin(a) * r, cz + Math.cos(a) * r]); } return o; }   // the cylinder's own vertices
    function wallBox(g, m, ax, az, bx, bz, h, y, t) {   // a wall of thickness t from a to b
      var dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      addMesh(g, new T.BoxGeometry(L, h, t), m, (ax + bx) / 2, y + h / 2, (az + bz) / 2, -Math.atan2(dz, dx));
    }

    S.forEach(function (s) {
      var G = new T.Group(); G.position.set(s.ox, 0, s.oz); G.scale.y = .001; G.visible = false; scene.add(G);
      var L = [];   // plan lines (local x, z pairs)
      function loop(pts) { for (var i = 0; i < pts.length; i++) { var a = pts[i], b = pts[(i + 1) % pts.length]; L.push(a[0], a[1], b[0], b[1]); } }
      s.p.forEach(function (q) {
        var t = q[0], m;
        if (t === 'box') { m = mat(q[7], s); var me = addMesh(G, new T.BoxGeometry(q[3], q[5], q[4]), m, q[1] + q[3] / 2, q[6] + q[5] / 2, q[2] + q[4] / 2, (q[8] || 0) * Math.PI / 180); loop(rectPts(q[1], q[2], q[3], q[4], q[8])); }
        else if (t === 'obox') { m = mat(q[7], s); addMesh(G, new T.BoxGeometry(q[3], q[5], q[4]), m, q[1], q[6] + q[5] / 2, q[2], q[8] * Math.PI / 180); loop(rectPts(q[1] - q[3] / 2, q[2] - q[4] / 2, q[3], q[4], q[8])); }
        else if (t === 'cyl') { m = mat(q[6], s); var seg = q[7] || 40; addMesh(G, new T.CylinderGeometry(q[3], q[3], q[4], seg), m, q[1], q[5] + q[4] / 2, q[2], 0); loop(circPts(q[1], q[2], q[3], seg === 6 ? 6 : 40)); }
        else if (t === 'tube') {   // the round tunnel lying along z: a half ring of 0.22 m shell, open at both ends, on the platform
          m = mat(q[5], s); var r = q[4], len = q[3], ts = new T.Shape(); ts.absarc(0, 0, r, 0, Math.PI, false); ts.absarc(0, 0, r - .22, Math.PI, 0, true); ts.closePath();
          addMesh(G, new T.ExtrudeGeometry(ts, { depth: len, bevelEnabled: false, curveSegments: 32 }), m, q[1] + r, .15, q[2], 0);
          loop(rectPts(q[1], q[2], 2 * r, len));
        }
        else if (t === 'strip') {
          m = mat(q[7], s); var dx = q[3] - q[1], dz = q[4] - q[2], len2 = Math.hypot(dx, dz), ang = -Math.atan2(dz, dx);
          addMesh(G, new T.BoxGeometry(len2, .05, q[5]), m, (q[1] + q[3]) / 2, q[6] + .025, (q[2] + q[4]) / 2, ang);
          loop(rectPts((q[1] + q[3]) / 2 - len2 / 2, (q[2] + q[4]) / 2 - q[5] / 2, len2, q[5], ang * 180 / Math.PI));
        }
        else if (t === 'poly') {
          m = mat(q[4], s); var sh = new T.Shape(); q[1].forEach(function (p, i) { i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1]); }); sh.closePath();
          var ge = new T.ExtrudeGeometry(sh, { depth: q[2], bevelEnabled: false }); ge.rotateX(-Math.PI / 2);
          addMesh(G, ge, m, 0, q[3], 0, 0); loop(q[1]);
        }
        else if (t === 'tri') { m = mat(q[4], s); var P = q[1]; for (var i = 0; i < 3; i++) { var A = P[i], B = P[(i + 1) % 3]; wallBox(G, m, A[0], A[1], B[0], B[1], q[2], .08, q[3]); } loop(P); }
        else if (t === 'panels') {
          m = mat(q[9], s); var n = q[4], a0 = q[7] * Math.PI / 180, a1 = q[8] * Math.PI / 180;
          for (var k = 0; k < n; k++) { var aa = a0 + (a1 - a0) * (k + .5) / n, px = q[1] + Math.cos(aa) * q[3], pz = q[2] + Math.sin(aa) * q[3];
            addMesh(G, new T.BoxGeometry(q[5], q[6], .22), m, px, .08 + q[6] / 2, pz, -aa + Math.PI / 2);
            loop(rectPts(px - q[5] / 2, pz - .11, q[5], .22, (-aa + Math.PI / 2) * 180 / Math.PI)); }
        }
        else if (t === 'ring') {
          m = mat(q[7], s); var sh2 = new T.Shape(); sh2.absarc(0, 0, q[4], 0, Math.PI * 2, false); var hole = new T.Path(); hole.absarc(0, 0, q[3], 0, Math.PI * 2, true); sh2.holes.push(hole);
          var ge2 = new T.ExtrudeGeometry(sh2, { depth: q[5], bevelEnabled: false, curveSegments: 48 }); ge2.rotateX(-Math.PI / 2);
          addMesh(G, ge2, m, q[1], q[6], q[2], 0); loop(circPts(q[1], q[2], q[4], 48)); loop(circPts(q[1], q[2], q[3], 48));
        }
        else if (t === 'arch') {   // a 10 by 10 ft stand: two side walls and a roof, a band of the accent along the roof's front edge
          m = mat(q[7], s); var ax = q[1], az = q[2], w = q[3], d = q[4], h = q[5], th = q[6];
          addMesh(G, new T.BoxGeometry(th, h, d), m, ax + th / 2, .05 + h / 2, az + d / 2, 0);
          addMesh(G, new T.BoxGeometry(th, h, d), m, ax + w - th / 2, .05 + h / 2, az + d / 2, 0);
          addMesh(G, new T.BoxGeometry(w, th, d), m, ax + w / 2, .05 + h - th / 2, az + d / 2, 0);
          addMesh(G, new T.BoxGeometry(w, .32, .12), mat('a', s), ax + w / 2, .05 + h - .3, az + (az > 1 ? 0 : d), 0);
          addMesh(G, new T.BoxGeometry(w - 2 * th, 1.0, .1), m, ax + w / 2, .55, az + (az > 1 ? d - .05 : .05), 0);
          loop(rectPts(ax, az, w, d, 0));
        }
        else if (t === 'frame') {
          m = mat(q[7], s); var fx = q[1], fz = q[2], fw = q[3], fd = q[4], fh = q[5], ft = q[6];
          addMesh(G, new T.BoxGeometry(ft, fh, fd), m, fx + ft / 2, .12 + fh / 2, fz + fd / 2, 0);
          addMesh(G, new T.BoxGeometry(ft, fh, fd), m, fx + fw - ft / 2, .12 + fh / 2, fz + fd / 2, 0);
          addMesh(G, new T.BoxGeometry(fw, ft, fd), m, fx + fw / 2, .12 + fh - ft / 2, fz + fd / 2, 0);
          loop(rectPts(fx, fz, fw, fd, 0));
        }
        else if (t === 'stair') {   // steps rising toward the deck (z decreasing)
          m = mat(q[7], s); var n2 = q[6], sd = q[4] / n2;
          for (var j = 0; j < n2; j++) { var hh = q[5] * (n2 - j) / n2; addMesh(G, new T.BoxGeometry(q[3], hh, sd), m, q[1] + q[3] / 2, .15 + hh / 2, q[2] + sd * (j + .5), 0); }
          loop(rectPts(q[1], q[2], q[3], q[4], 0));
        }
        else if (t === 'spheres') {   // the ceiling of light over the carpet: a truss and rows of spheres hung at varying heights
          var x0 = q[1], z0 = q[2], x1 = q[3], z1 = q[4], wd = q[5], y0 = q[6], len3 = Math.hypot(x1 - x0, z1 - z0), ang2 = -Math.atan2(z1 - z0, x1 - x0);
          var ca = Math.cos(-ang2), sa = Math.sin(-ang2), rail = mat('d', s);
          [-1, 1].forEach(function (sd) { var o = sd * (wd / 2 + .15); addMesh(G, new T.BoxGeometry(len3, .2, .12), rail, (x0 + x1) / 2 - sa * o, y0 + 1.1, (z0 + z1) / 2 + ca * o, ang2); });
          for (var tie = 0; tie <= len3; tie += 2.6) addMesh(G, new T.BoxGeometry(.12, .16, wd + .3), rail, x0 + ca * tie, y0 + 1.1, z0 + sa * tie, ang2);
          var sg = new T.SphereGeometry(.24, 14, 10), sm = new T.MeshStandardMaterial({ color: 0xf4f2ee, roughness: .35, emissive: 0x3a3226, emissiveIntensity: .6 });
          var nl = Math.floor(len3 / .7), nw = Math.floor(wd / .7) + 1, inst = new T.InstancedMesh(sg, sm, nl * nw), M4 = new T.Matrix4(), k2 = 0;
          for (var u = 0; u < nl; u++) for (var v = 0; v < nw; v++) {
            var tt = (u + .5) / nl, ox = x0 + (x1 - x0) * tt, oz = z0 + (z1 - z0) * tt, off = (v / (nw - 1) - .5) * wd;
            var nx = -Math.sin(-ang2) * off, nz = Math.cos(-ang2) * off;   /* across the carpet */ M4.makeTranslation(ox + nx, y0 - .2 - .55 * (1 + Math.sin(u * .45 + v * .7)) / 2, oz + nz); inst.setMatrixAt(k2++, M4);
          }
          inst.castShadow = true; inst.frustumCulled = false; inst.isCeiling = true; G.add(inst);
        }
      });
      var lg = new T.BufferGeometry(), pos = [];
      for (var i2 = 0; i2 < L.length; i2 += 4) pos.push(s.ox + L[i2], .03, s.oz + L[i2 + 1], s.ox + L[i2 + 2], .03, s.oz + L[i2 + 3]);
      lg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); lg.setDrawRange(0, 0);
      var ls = new T.LineSegments(lg, lineMat); scene.add(ls);
      var top = 0; G.traverse(function (o) { if (o.isMesh && !o.isCeiling) { o.geometry.computeBoundingBox(); var bb = o.geometry.boundingBox; top = Math.max(top, o.position.y + bb.max.y); } });
      s.G = G; s.lines = ls; s.nl = pos.length / 3; s.top = Math.max(top, 3);
      s.c = new T.Vector3(s.ox + s.w / 2, 0, s.oz + s.d / 2);
      s.rise = { v: 0, from: 0, to: 0, t0: 0 }; s.draw = { v: 0, from: 0, to: 0, t0: 0 };
    });

    // labels: one for the stand in view; the built ones carry a link to their photograph (the viewer opens it)
    S.forEach(function (s) {
      var el = document.createElement(s.photo ? 'a' : 'span'); el.className = 'xh-lab xh-' + s.kind; el.hidden = true;
      if (s.photo) { el.href = s.photo; el.setAttribute('aria-label', s.name + ', ' + s.yr + ': open the photograph'); }
      el.innerHTML = '<b>' + s.name + '</b><span>' + s.yr + ' · ' + (s.kind === 'built' ? 'Built · the photograph' : s.kind === 'proposal' ? 'Proposal' : 'Design') + '</span>';
      labs.appendChild(el); s.lab = el;
    });

    /* ------------------------------------------------------------ motion: hard moves only */
    var DUR = 500, LINE = 380, now = function () { return performance.now(); };
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function setRise(s, to) { if (s.rise.to === to) return; s.rise.from = s.rise.v; s.rise.to = to; s.rise.t0 = now(); s.G.visible = true; kick(); }
    function setDraw(s, to) { if (s.draw.to === to) return; s.draw.from = s.draw.v; s.draw.to = to; s.draw.t0 = now(); kick(); }
    function step(a, dur) { var t = Math.min(1, (now() - a.t0) / dur); a.v = a.from + (a.to - a.from) * ease(t); if (t >= 1) a.v = a.to; return t < 1; }

    var P = 0, ENTER = false, paperUp = false, W = 1, H = 1;
    var NB = BUILT.length, SEG = .78 / NB;                 // scroll: 0..0.78 the five built stands, then the hall from above
    function views() {
      var asp = W / H, out = [];
      BUILT.forEach(function (s) {
        var span = Math.max(s.w, s.d, 8), dist = (span * 1.5 + 11) * (asp < 1 ? 1.75 : 1), dir = new T.Vector3(-.5, .62, .86).normalize();
        out.push({ p: s.c.clone().add(dir.multiplyScalar(dist)), t: s.c.clone().setY(1.2) });
      });
      var hc = new T.Vector3(HALL_W / 2, 0, HALL_D / 2 + 5), vt = 2 * Math.tan(17.5 * Math.PI / 180), D = Math.max(HALL_D * 1.12 / vt, HALL_W * 1.06 / (vt * asp));
      out.push({ p: hc.clone().add(new T.Vector3(0, D * .93, D * .38)), t: hc.clone() });
      return out;
    }
    var V = [];
    function camAt(p) {
      var k, a, b, u;
      if (p >= .9) { a = b = V[NB]; u = 0; }
      else if (p >= SEG * (NB - 1) + SEG * .45) { a = V[NB - 1]; b = V[NB]; u = Math.min(1, (p - (SEG * (NB - 1) + SEG * .45)) / (.9 - (SEG * (NB - 1) + SEG * .45))); }
      else { k = Math.max(0, Math.floor(p / SEG)); var l = (p - k * SEG) / SEG; a = V[k]; b = V[Math.min(k + 1, NB - 1)]; u = l < .45 ? 0 : (l - .45) / .55; }
      u = u * u * (3 - 2 * u);
      cam.position.lerpVectors(a.p, b.p, u); var tg = new T.Vector3().lerpVectors(a.t, b.t, u); cam.lookAt(tg);
    }
    function focus() { if (P >= .8) return -1; return Math.min(NB - 1, Math.max(0, Math.floor(P / SEG))); }
    function apply() {
      BUILT.forEach(function (s, i) { var on = (i === 0 ? ENTER : P >= i * SEG + .004) || STILL; setDraw(s, on ? 1 : 0); setRise(s, on ? 1 : 0); });
      var drawPaper = P >= .76 || paperUp || STILL;
      PAPER.forEach(function (s) { setDraw(s, drawPaper ? 1 : 0); if (STILL) setRise(s, 1); else if (!paperUp) setRise(s, 0); });   // raised one by one by the button
      var f = focus(), txt;
      if (f >= 0) { var s = BUILT[f]; txt = (f + 1) + ' of ' + NB + ' built · <b>' + s.name + ', ' + s.yr + '</b> · ' + s.size + ' · rebuilt from ' + s.src; }
      else txt = paperUp ? 'The hall from above · <b>5 built, 10 designed, 1 proposed</b> · each from its own plan' : 'The hall from above · <b>the five built</b>, and the plans of eleven more on the floor';
      if (cap.innerHTML !== txt) cap.innerHTML = txt;
      SEC.classList.toggle('xh-end', P >= .76);
    }
    function size() {
      var r = stage.getBoundingClientRect(); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      if (STILL) { W = 1600; H = 900; }
      R.setPixelRatio(STILL ? 1 : Math.min(devicePixelRatio || 1, phone() ? 1.5 : 2)); R.setSize(W, H, false);
      cam.aspect = W / H; cam.updateProjectionMatrix(); V = views(); kick();
    }
    function readScroll() {
      var r = SEC.querySelector('.xh-pin').getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
      P = STILL ? 1 : Math.min(1, Math.max(0, -r.top / span)); ENTER = r.top < innerHeight * .35; apply(); kick();
    }
    var vis = false, raf = 0, tmp = new T.Vector3();
    function frame() {
      raf = 0; var busy = false;
      S.forEach(function (s) {
        busy = step(s.rise, DUR) || busy; busy = step(s.draw, LINE) || busy;
        s.G.scale.y = Math.max(.001, s.rise.v); s.G.visible = s.rise.v > .0005;
        s.lines.geometry.setDrawRange(0, Math.round(s.nl / 2 * s.draw.v) * 2);
      });
      camAt(P); R.render(scene, cam);
      // the label: the stand in view (desktop and phone); at the end, the five built (desktop only)
      var f = focus(), endTags = false;
      S.forEach(function (s, i) {
        var show = (f >= 0 && BUILT[f] === s && s.rise.v > .98) || (endTags && s.kind === 'built' && s.rise.v > .98);
        if (STILL) show = false;
        if (!show) { if (!s.lab.hidden) s.lab.hidden = true; return; }
        var x = 0, y = 1e9;
        for (var cx = 0; cx < 2; cx++) for (var cz = 0; cz < 2; cz++) { tmp.set(s.ox + cx * s.w, s.top, s.oz + cz * s.d).project(cam); y = Math.min(y, (-tmp.y * .5 + .5) * H); }
        tmp.set(s.c.x, s.top, s.c.z).project(cam); x = (tmp.x * .5 + .5) * W; y = Math.max(y - 8, 70);
        var hw = (s.lab.offsetWidth || 160) / 2 + 10; x = Math.min(Math.max(x, hw), W - hw);   // never past the screen's edge
        s.lab.style.transform = 'translate(calc(' + Math.round(x) + 'px - 50%),calc(' + Math.round(y) + 'px - 100%))'; if (s.lab.hidden) s.lab.hidden = false;
      });
      if (busy) kick();
      if (STILL && !busy) window.__xhReady = true;
    }
    function kick() { if (!raf && (vis || STILL)) raf = requestAnimationFrame(frame); }
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) kick(); }, { rootMargin: '20% 0px' }).observe(stage);
    addEventListener('scroll', readScroll, { passive: true });
    addEventListener('resize', function () { size(); readScroll(); });
    btn.addEventListener('click', function () {
      paperUp = !paperUp; btn.setAttribute('aria-pressed', paperUp ? 'true' : 'false');
      btn.textContent = paperUp ? 'Lower the eleven' : 'Raise the other eleven';
      if (paperUp) PAPER.forEach(function (s, i) { setTimeout(function () { if (paperUp) { setDraw(s, 1); setRise(s, 1); } }, i * 160); });
      apply(); kick();
    });
    SEC.classList.add('xh-ready');
    size(); readScroll(); kick();
    window.__xh = { S: S, hall: [HALL_W, HALL_D] };
  }
})();
