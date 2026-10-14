/* Cityscape Abu Dhabi 2017, the pavilion of Abu Dhabi's municipal government: the stand as a 3D model you walk into, made for this portfolio.
   What is drawn, and where each part comes from:
   - the floor and everything on it: the stand builder's plan (Divine Creations, "Dept of Municipal Affairs stand design lay out", top grid plan, 11 April 2017;
     archive dmt/2017-cityscape/02-DOCUMENTS/003). It is a vector drawing dimensioned 2800 x 2400 cm. Every line in D.segs is one of its lines, in metres
     (X to the right 0..28, Y down 0..24, the tower corner at 28, 0). The platform, the court, the model zone, the carpet, the podiums, the two wings,
     the tower and its passage stand on those lines. Nothing on the floor is drawn by eye.
   - heights: the builder's contract of 6 April 2017 (back and side structures 6 m high; platform raised 10 cm; single big podium 3.2 x 3.2 x 0.67 on the builder's sheet 1;
     podium displays 0.8 high; information desk 1 m high) and the proportions of the design renders of 28 March 2017 ("render_28th mach.pdf", 25 pages).
   - the look of the wings (leaning end walls in white and maroon, a glass ground floor): the same renders. The upper floor is as built: glazed, with a light box
     beside the tower (the show film; build photographs IMG_1080 and IMG_1081). The skyline in the light boxes is cut from page 6 of the renders, squared up;
     the built print was a different photograph and was not found. The two islands beside the carpet are traced from the plan on page 25 of the renders.
   - LED walls on the end walls, 3.7 x 2.1 m: the annotated render IMG_1079.
   - the ceiling of spheres: 8 across, counted on the build photograph IMG_1080; about 34 along, counted on IMG_1043 and the show film. Not in any document.
   Left plain, because the artwork was not found: the screens, the tower's picture panel. The department's emblem is not redrawn.
   The dark hall is a choice of this model: in April 2017 the hall lights were on, as the film shows. */
import { stage, T } from '../../assets/fp/fp3d.js?v=21';

const D = {"platform":[[0,0],[26.05,0],[28,1.95],[28,24],[2.32,24.0],[2.15,23.99],[2.0,23.95],[1.86,23.89],[1.74,23.82],[1.61,23.71],[0.24,22.33],[0.14,22.19],[0.06,22.04],[0.02,21.87],[0.0,21.69]],"court":[[9.0,4.5],[4.99,4.52],[4.64,4.66],[4.36,4.92],[4.18,5.26],[4.14,5.55],[4.14,9.6],[4.18,9.88],[4.33,10.21],[4.59,10.46],[4.91,10.61],[5.19,10.65],[8.46,10.65],[8.46,11.5],[8.46,11.77],[9.11,14.54],[9.78,15.75],[11.72,17.68],[12.92,18.36],[15.69,19.0],[15.96,19.0],[23.5,19.0],[23.5,8.3],[23.48,8.12],[23.44,7.98],[23.39,7.85],[23.31,7.72],[23.2,7.59],[20.41,4.8],[20.28,4.69],[20.16,4.61],[20.02,4.56],[19.88,4.52],[19.71,4.51]],"zone":[[9.0,0.3],[1.1,0.3],[0.89,0.33],[0.64,0.45],[0.45,0.64],[0.33,0.88],[0.3,1.1],[0.32,14.95],[0.36,15.09],[0.51,15.34],[0.73,15.51],[0.87,15.57],[1.1,15.6],[5.8,15.6],[6.02,15.57],[6.27,15.45],[6.45,15.27],[6.57,15.02],[6.6,14.8],[6.6,13.2],[6.57,12.98],[6.45,12.74],[6.27,12.55],[6.02,12.43],[5.8,12.4],[3.66,12.4],[3.44,12.37],[3.2,12.25],[3.01,12.06],[2.89,11.82],[2.86,11.6],[2.86,3.3],[2.89,3.08],[3.01,2.84],[3.2,2.65],[3.44,2.53],[3.66,2.5],[9.0,2.5]],"patch":[[19.8,24.0],[19.8,22.17],[19.78,22.1],[19.73,22.05],[19.68,22.02],[19.6,22.0],[16.47,22.0],[16.4,22.03],[16.35,22.07],[16.32,22.12],[16.3,22.2],[16.3,24.0]],"segs":[[2.32,24.0,28.0,24.0,0],[15.95,19.0,28.0,19.0,0],[1.61,23.71,1.68,23.77,0],[1.68,23.77,1.74,23.82,0],[1.74,23.82,1.8,23.86,0],[1.8,23.86,1.86,23.89,0],[1.86,23.89,1.93,23.93,0],[1.93,23.93,2.0,23.95,0],[2.0,23.95,2.07,23.97,0],[2.07,23.97,2.15,23.99,0],[2.15,23.99,2.22,24.0,0],[2.22,24.0,2.32,24.0,0],[28.0,24.0,28.0,1.95,0],[16.3,24.0,16.3,22.2,1],[9.0,4.5,9.0,0.0,0],[26.06,0.0,0.0,0.0,0],[9.0,0.3,1.1,0.3,1],[9.0,2.5,3.66,2.5,1],[9.0,4.5,5.19,4.5,0],[5.19,4.5,4.99,4.52,0],[4.99,4.52,4.81,4.58,0],[4.81,4.58,4.64,4.66,0],[4.64,4.66,4.49,4.78,0],[4.49,4.78,4.36,4.92,0],[4.36,4.92,4.25,5.08,0],[4.25,5.08,4.18,5.26,0],[4.18,5.26,4.15,5.46,0],[4.15,5.46,4.14,5.55,0],[1.1,0.3,1.02,0.31,1],[1.02,0.31,0.89,0.33,1],[0.89,0.33,0.76,0.38,1],[0.76,0.38,0.64,0.45,1],[0.64,0.45,0.54,0.54,1],[0.54,0.54,0.45,0.64,1],[0.45,0.64,0.38,0.76,1],[0.38,0.76,0.33,0.88,1],[0.33,0.88,0.31,1.02,1],[0.31,1.02,0.3,1.1,1],[5.8,15.6,1.1,15.6,1],[5.8,12.4,3.66,12.4,1],[8.46,10.65,5.19,10.65,0],[4.14,9.6,4.15,9.7,0],[4.15,9.7,4.18,9.88,0],[4.18,9.88,4.24,10.05,0],[4.24,10.05,4.33,10.21,0],[4.33,10.21,4.45,10.34,0],[4.45,10.34,4.59,10.46,0],[4.59,10.46,4.74,10.55,0],[4.74,10.55,4.91,10.61,0],[4.91,10.61,5.09,10.65,0],[5.09,10.65,5.19,10.65,0],[6.6,13.2,6.6,13.12,1],[6.6,13.12,6.57,12.98,1],[6.57,12.98,6.52,12.86,1],[6.52,12.86,6.45,12.74,1],[6.45,12.74,6.37,12.64,1],[6.37,12.64,6.27,12.55,1],[6.27,12.55,6.15,12.48,1],[6.15,12.48,6.02,12.43,1],[6.02,12.43,5.89,12.41,1],[5.89,12.41,5.8,12.4,1],[0.0,0.0,0.0,21.69,0],[6.6,13.2,6.6,14.8,1],[5.8,15.6,5.89,15.6,1],[5.89,15.6,6.02,15.57,1],[6.02,15.57,6.15,15.52,1],[6.15,15.52,6.27,15.45,1],[6.27,15.45,6.37,15.37,1],[6.37,15.37,6.45,15.27,1],[6.45,15.27,6.52,15.15,1],[6.52,15.15,6.57,15.02,1],[6.57,15.02,6.6,14.88,1],[6.6,14.88,6.6,14.8,1],[0.3,1.1,0.3,14.8,1],[0.3,14.8,0.32,14.95,1],[0.32,14.95,0.36,15.09,1],[0.36,15.09,0.42,15.22,1],[0.42,15.22,0.51,15.34,1],[0.51,15.34,0.61,15.44,1],[0.61,15.44,0.73,15.51,1],[0.73,15.51,0.87,15.57,1],[0.87,15.57,1.02,15.6,1],[1.02,15.6,1.1,15.6,1],[2.86,3.3,2.86,11.6,1],[8.46,10.65,8.46,11.5,0],[8.46,11.5,8.46,11.77,0],[8.46,11.77,8.66,13.21,0],[8.66,13.21,9.11,14.54,0],[9.11,14.54,9.78,15.75,0],[9.78,15.75,10.66,16.8,0],[10.66,16.8,11.72,17.68,0],[11.72,17.68,12.92,18.36,0],[12.92,18.36,14.26,18.8,0],[14.26,18.8,15.69,19.0,0],[15.69,19.0,15.96,19.0,0],[4.14,5.55,4.14,9.6,0],[3.66,2.5,3.58,2.51,1],[3.58,2.51,3.44,2.53,1],[3.44,2.53,3.31,2.58,1],[3.31,2.58,3.2,2.65,1],[3.2,2.65,3.1,2.74,1],[3.1,2.74,3.01,2.84,1],[3.01,2.84,2.94,2.95,1],[2.94,2.95,2.89,3.08,1],[2.89,3.08,2.87,3.22,1],[2.87,3.22,2.86,3.3,1],[2.86,11.6,2.87,11.68,1],[2.87,11.68,2.89,11.82,1],[2.89,11.82,2.94,11.95,1],[2.94,11.95,3.01,12.06,1],[3.01,12.06,3.1,12.17,1],[3.1,12.17,3.2,12.25,1],[3.2,12.25,3.31,12.32,1],[3.31,12.32,3.44,12.37,1],[3.44,12.37,3.58,12.4,1],[3.58,12.4,3.66,12.4,1],[0.0,21.69,0.01,21.78,0],[0.01,21.78,0.02,21.87,0],[0.02,21.87,0.04,21.95,0],[0.04,21.95,0.06,22.04,0],[0.06,22.04,0.1,22.11,0],[0.1,22.11,0.14,22.19,0],[0.14,22.19,0.18,22.26,0],[0.18,22.26,0.24,22.33,0],[0.24,22.33,0.29,22.39,0],[0.29,22.39,1.61,23.71,0],[7.66,0.37,6.56,0.37,0],[8.78,0.45,6.44,0.45,0],[6.44,0.45,6.44,2.35,0],[6.44,2.35,8.78,2.35,0],[8.78,2.35,8.78,0.45,0],[4.88,0.37,3.78,0.37,0],[6.0,0.45,3.66,0.45,0],[3.66,0.45,3.66,2.35,0],[3.66,2.35,6.0,2.35,0],[6.0,2.35,6.0,0.45,0],[0.55,7.46,0.55,8.56,0],[0.63,6.34,0.63,8.68,0],[0.63,8.68,2.53,8.68,0],[2.53,8.68,2.53,6.34,0],[2.53,6.34,0.63,6.34,0],[0.55,4.39,0.55,5.49,0],[0.63,3.27,0.63,5.61,0],[0.63,5.61,2.53,5.61,0],[2.53,5.61,2.53,3.27,0],[2.53,3.27,0.63,3.27,0],[0.55,10.53,0.55,11.63,0],[0.63,9.41,0.63,11.75,0],[0.63,11.75,2.53,11.75,0],[2.53,11.75,2.53,9.41,0],[2.53,9.41,0.63,9.41,0],[0.55,13.6,0.55,14.7,0],[0.63,12.48,0.63,14.82,0],[0.63,14.82,2.53,14.82,0],[2.53,14.82,2.53,12.48,0],[2.53,12.48,0.63,12.48,0],[4.36,14.9,5.46,14.9,0],[3.24,14.82,5.58,14.82,0],[5.58,14.82,5.58,12.92,0],[5.58,12.92,3.24,12.92,0],[3.24,12.92,3.24,14.82,0],[25.4,22.45,26.5,22.45,0],[25.42,22.44,26.49,22.44,0],[26.5,22.3,25.4,22.3,0],[26.49,22.32,25.42,22.32,0],[25.4,22.3,25.4,24.0,1],[22.9,22.3,22.9,24.0,1],[26.5,22.45,26.5,24.0,1],[21.8,22.45,22.9,22.45,0],[21.82,22.44,22.89,22.44,0],[22.9,22.3,21.8,22.3,0],[22.89,22.32,21.82,22.32,0],[22.9,22.45,22.9,24.0,1],[21.8,24.0,21.8,22.45,1],[22.9,24.0,21.8,24.0,1],[25.4,24.0,25.4,22.45,1],[26.5,24.0,25.4,24.0,1],[18.31,23.35,19.51,23.35,0],[19.51,23.35,19.51,22.35,0],[19.51,22.35,18.31,22.35,0],[18.31,22.35,18.31,23.35,0],[19.6,22.0,16.5,22.0,1],[16.5,22.0,16.47,22.0,1],[16.47,22.0,16.43,22.01,1],[16.43,22.01,16.4,22.03,1],[16.4,22.03,16.38,22.04,1],[16.38,22.04,16.35,22.07,1],[16.35,22.07,16.33,22.09,1],[16.33,22.09,16.32,22.12,1],[16.32,22.12,16.31,22.16,1],[16.31,22.16,16.3,22.2,1],[16.6,23.35,17.8,23.35,0],[17.8,23.35,17.8,22.35,0],[16.6,22.35,16.6,23.35,0],[17.8,22.35,16.6,22.35,0],[26.04,0.01,28.0,1.96,0],[23.59,8.3,23.59,8.19,0],[23.59,8.19,23.58,8.11,0],[23.58,8.11,23.56,8.03,0],[23.56,8.03,23.54,7.95,0],[23.54,7.95,23.51,7.88,0],[23.51,7.88,23.48,7.8,0],[23.48,7.8,23.44,7.73,0],[23.44,7.73,23.39,7.66,0],[23.39,7.66,23.34,7.6,0],[23.34,7.6,23.27,7.52,0],[20.41,4.8,20.34,4.74,0],[20.34,4.74,20.28,4.69,0],[20.28,4.69,20.22,4.65,0],[20.22,4.65,20.16,4.61,0],[20.16,4.61,20.09,4.58,0],[20.09,4.58,20.02,4.56,0],[20.02,4.56,19.95,4.54,0],[19.95,4.54,19.88,4.52,0],[19.88,4.52,19.8,4.51,0],[19.8,4.51,19.71,4.51,0],[20.48,4.73,20.41,4.67,0],[20.41,4.67,20.35,4.62,0],[20.35,4.62,20.28,4.57,0],[20.28,4.57,20.21,4.53,0],[20.21,4.53,20.13,4.49,0],[20.13,4.49,20.05,4.46,0],[20.05,4.46,19.96,4.44,0],[19.96,4.44,19.88,4.42,0],[19.88,4.42,19.8,4.41,0],[19.8,4.41,19.71,4.41,0],[20.66,4.55,20.58,4.48,0],[20.58,4.48,20.5,4.42,0],[20.5,4.42,20.41,4.36,0],[20.41,4.36,20.32,4.31,0],[20.32,4.31,20.22,4.26,0],[20.22,4.26,20.12,4.22,0],[20.12,4.22,20.02,4.2,0],[20.02,4.2,19.91,4.17,0],[19.91,4.17,19.81,4.16,0],[19.81,4.16,19.71,4.16,0],[20.41,4.8,23.2,7.59,0],[23.84,8.3,23.84,8.18,0],[23.84,8.18,23.83,8.08,0],[23.83,8.08,23.8,7.97,0],[23.8,7.97,23.78,7.88,0],[23.78,7.88,23.74,7.78,0],[23.74,7.78,23.7,7.69,0],[23.7,7.69,23.65,7.6,0],[23.65,7.6,23.59,7.51,0],[23.59,7.51,23.53,7.43,0],[23.53,7.43,23.45,7.34,0],[23.5,8.3,23.49,8.2,0],[23.49,8.2,23.48,8.12,0],[23.48,8.12,23.46,8.05,0],[23.46,8.05,23.44,7.98,0],[23.44,7.98,23.42,7.91,0],[23.42,7.91,23.39,7.85,0],[23.39,7.85,23.35,7.78,0],[23.35,7.78,23.31,7.72,0],[23.31,7.72,23.27,7.66,0],[23.27,7.66,23.2,7.59,0],[20.48,4.73,23.27,7.52,0],[20.66,4.55,23.45,7.34,0],[28.0,1.95,26.05,0.01,0],[23.5,19.0,28.0,19.0,0],[23.5,17.83,28.0,17.83,0],[23.5,17.75,28.0,17.75,0],[23.5,17.02,28.0,17.02,0],[23.5,16.92,28.0,16.92,0],[23.5,16.82,28.0,16.82,0],[23.5,19.0,23.5,8.3,0],[23.84,16.82,23.84,8.3,0],[23.59,16.82,23.59,8.3,0],[23.89,19.0,23.89,18.61,0],[28.0,19.0,28.0,1.95,0],[27.89,16.82,27.89,2.05,0],[27.59,19.0,27.59,18.61,0],[27.59,18.61,23.89,18.61,0],[23.5,18.13,28.0,18.13,0],[9.0,4.51,9.0,0.01,0],[10.17,4.51,10.17,0.01,0],[10.26,4.51,10.26,0.01,0],[10.98,4.51,10.98,0.01,0],[11.08,4.51,11.08,0.01,0],[11.18,4.51,11.18,0.01,0],[9.0,4.51,19.71,4.51,0],[11.18,4.16,19.71,4.16,0],[11.18,4.41,19.71,4.41,0],[9.0,4.11,9.39,4.11,0],[9.0,0.01,26.05,0.01,0],[11.18,0.11,25.95,0.11,0],[9.0,0.41,9.39,0.41,0],[9.39,0.41,9.39,4.11,0],[9.87,4.51,9.87,0.01,0],[18.59,0.11,11.18,0.11,0],[11.18,0.11,11.18,4.21,0],[22.77,7.18,28.0,1.95,0],[22.63,7.11,27.93,1.8,0],[23.55,5.98,26.79,2.74,0],[23.44,5.87,26.68,2.63,0],[23.33,5.76,26.57,2.53,0],[20.82,5.24,26.06,0.0,0],[20.89,5.37,26.2,0.07,0],[22.02,4.46,25.27,1.22,0],[22.13,4.56,25.37,1.32,0],[22.24,4.67,25.48,1.43,0],[21.92,4.35,23.65,6.08,0],[25.16,1.11,26.89,2.84,0],[22.63,7.11,20.89,5.37,0],[27.93,1.8,26.2,0.07,0],[24.41,5.54,24.41,9.41,0],[27.89,9.41,23.84,9.41,0],[27.42,10.21,24.32,10.21,0],[27.42,10.87,24.32,10.87,0],[27.42,11.37,24.32,11.37,0],[23.84,9.41,23.84,16.82,0],[24.32,10.21,24.32,16.02,0],[23.84,16.82,27.89,16.82,0],[24.32,16.02,27.42,16.02,0],[27.89,16.82,27.89,9.41,0],[27.42,16.02,27.42,10.21,0],[27.42,11.86,24.32,11.86,0],[27.42,12.36,24.32,12.36,0],[27.42,12.87,24.32,12.87,0],[27.42,13.37,24.32,13.37,0],[27.42,13.86,24.32,13.86,0],[27.42,14.36,24.32,14.36,0],[27.42,14.87,24.32,14.87,0],[27.42,15.37,24.32,15.37,0],[11.18,0.11,11.18,4.16,0],[11.98,0.58,11.98,3.68,0],[12.64,0.58,12.64,3.68,0],[13.14,0.58,13.14,3.68,0],[11.18,4.16,18.59,4.16,0],[11.98,3.68,17.79,3.68,0],[18.59,4.16,18.59,0.11,0],[17.79,3.68,17.79,0.58,0],[17.79,0.58,11.98,0.58,0],[13.64,0.58,13.64,3.68,0],[14.14,0.58,14.14,3.68,0],[14.64,0.58,14.64,3.68,0],[15.14,0.58,15.14,3.68,0],[15.64,0.58,15.64,3.68,0],[16.14,0.58,16.14,3.68,0],[16.64,0.58,16.64,3.68,0],[17.14,0.58,17.14,3.68,0],[22.47,3.6,18.59,3.6,0],[18.59,4.16,18.59,3.6,0],[20.75,5.13,9.93,15.95,0],[22.87,7.26,12.16,17.97,0],[9.0,0.3,9.0,2.5,1],[17.71,8.04,19.97,10.3,0],[19.97,5.77,22.23,8.04,0],[19.97,5.77,17.71,8.04,0],[22.23,8.04,19.97,10.3,0],[19.8,24.0,19.8,22.2,1],[19.8,22.2,19.8,22.17,1],[19.8,22.17,19.79,22.13,1],[19.79,22.13,19.78,22.1,1],[19.78,22.1,19.76,22.08,1],[19.76,22.08,19.73,22.05,1],[19.73,22.05,19.71,22.03,1],[19.71,22.03,19.68,22.02,1],[19.68,22.02,19.65,22.01,1],[19.65,22.01,19.6,22.0,1],[16.3,24.0,19.8,24.0,1],[8.68,23.96,8.68,23.54,0],[8.68,23.54,11.4,23.54,0],[8.68,23.96,11.62,23.96,0],[8.85,24.0,9.69,24.0,0],[11.65,23.91,11.4,23.54,0],[11.56,23.96,11.28,23.54,0],[11.55,23.96,11.27,23.54,0],[11.54,23.96,11.26,23.54,0],[11.5,23.96,11.22,23.54,0],[11.51,23.96,11.23,23.54,0],[11.53,23.96,11.24,23.54,0],[9.02,23.54,9.02,23.96,0],[9.03,23.54,9.03,23.96,0],[9.04,23.54,9.04,23.96,0],[9.05,23.54,9.05,23.96,0],[9.06,23.54,9.06,23.96,0],[9.11,23.54,9.11,23.96,0],[9.09,23.54,9.09,23.96,0],[9.08,23.54,9.08,23.96,0]]};

const sec = document.querySelector('.fp-model'), FP = window.FP;
const S = sec && FP && stage(sec, { assets: 'a/3d/', grid: false, exposure: 1.0, fill: .13, fog: 0x000000, floorColor: 0x000000, mirrorK: 0, rimI: .001 });
if (S) build();

function build() {
  const { scene, cam, renderer, std, box, station, key } = S;
  const E = FP.ease, seg = FP.seg, clamp = FP.clamp, lerp = (a, b, t) => a + (b - a) * t;
  const PH = FP.phone();
  const H0 = .1, wx = X => X - 14, wz = Y => Y - 12;           /* plan to world: X right, Y down, tower corner at (28, 0) */
  S.floor.visible = false; scene.environmentIntensity = .32;

  /* four stops on one model. The engine keeps their captions and cuts; the camera is walked by this file (see CAMERA). */
  const base = { noMirror: true, c: [0, 2, 0], rx: 15, ry: 6, yaw: .5, pitch: .5, drift: 0, ox: 0, oy: 0, oxp: 0, oyp: 0 };
  [1, .75, 1.4, 2.1, 2.1].forEach(w => station(0, Object.assign({}, base, { w })));
  const g = new T.Group(); S.world.add(g);
  const add = (o, to) => { (to || g).add(o); return o; };

  /* ---------- materials ---------- */
  const WHITE = std({ color: 0xe6e5e1, roughness: .42 }), GLOSS = std({ color: 0xecebe7, roughness: .2 });
  const MAROON = std({ color: 0x8a1727, roughness: .5 }), CARPET = std({ color: 0x5e0b1b, roughness: .96 });
  const COURT = std({ color: 0xc7b48d, roughness: 1 }), GREY = std({ color: 0x80838a, roughness: .8 }), INK = std({ color: 0x08090b, roughness: .6 });
  const TOPM = std({ color: 0xc9ccd0, roughness: .85 });
  const LOUVRE = std({ color: 0xf2f2ef, roughness: .35 }), STEEL = std({ color: 0xb9bcc2, roughness: .3, metalness: .6 }), BACK = std({ color: 0xa9abb0, roughness: .75 });
  const shade = (w, d, a) => { const m = S.blob(new T.Group(), 0, 0, w, d, a); m.parent.remove(m); m.position.y = .026; m.material.opacity = a; return m; };   /* a soft contact shadow, lying on the platform */
  const lit = (c, k) => new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k === undefined ? 1 : k), toneMapped: false });
  const GLASS = new T.MeshStandardMaterial({ color: 0x9fb8c4, roughness: .08, metalness: .1, transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide });
  const stripes = (() => { const c = document.createElement('canvas'); c.width = 8; c.height = 256; const x = c.getContext('2d'); for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(0, 60 + i * 26, 8, 12); } const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; })();
  const FROST = new T.MeshStandardMaterial({ map: stripes, color: 0xe8ecef, roughness: .55, transparent: true, depthWrite: false, side: T.DoubleSide });
  const halo = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.2, 'rgba(255,255,255,.4)'); gr.addColorStop(.5, 'rgba(255,255,255,.09)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(cv); })();
  const screenTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, '#2a4d9c'); gr.addColorStop(.55, '#6f9be0'); gr.addColorStop(1, '#dbe9ff'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; })();
  const panelTex = (() => { const c = document.createElement('canvas'); c.width = 32; c.height = 128; const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#fff7ea'); gr.addColorStop(.6, '#ffe9cc'); gr.addColorStop(1, '#f6cf9c'); x.fillStyle = gr; x.fillRect(0, 0, 32, 128); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; })();   /* the tower's picture was not found: a plain panel of light */
  const SCREEN = new T.MeshBasicMaterial({ map: screenTex, color: new T.Color(.62, .62, .62), toneMapped: false });   /* the screen films were not found: the screens are plain light */

  /* ---------- the floor: a real reflection on the gloss platform and, fainter, on the hall floor ---------- */
  key.shadow.mapSize.set(1024, 1024);   /* lighter on small graphics chips */
  const RT = new T.WebGLRenderTarget(1280, 720, { samples: 2 }), texM = new T.Matrix4(), vcam = new T.PerspectiveCamera(), flats = [];
  const reflective = (color, rough, k) => { const m = new T.MeshStandardMaterial({ color, roughness: rough, metalness: 0 }); if (PH) return m;
    m.onBeforeCompile = sh => { sh.uniforms.tRefl = { value: RT.texture }; sh.uniforms.reflM = { value: texM }; sh.uniforms.reflK = { value: k }; m.userData.sh = sh;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform mat4 reflM; varying vec4 vRefl;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvRefl = reflM * modelMatrix * vec4(position, 1.0);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tRefl; uniform float reflK; varying vec4 vRefl;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nvec2 ruv = vRefl.xy / vRefl.w; vec3 rc = vec3(0.); for (int i = -3; i <= 3; i++) { rc += texture2D(tRefl, ruv + vec2(float(i) * .0004, float(i) * .0034)).rgb; }\nfloat fr = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0., 1.), 2.0);\ntotalEmissiveRadiance += rc / 7. * reflK * (.2 + .8 * fr) * diffuseColor.a;'); };
    return m; };
  const flat = (o, to) => { flats.push(o); return add(o, to); };
  const shapeOf = pts => { const s = new T.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], -p[1]) : s.moveTo(p[0], -p[1])); s.closePath(); return s; };
  const floorShape = (pts, mat, y) => { const ge = new T.ShapeGeometry(shapeOf(pts), 8); ge.rotateX(-Math.PI / 2); ge.translate(-14, y, -12); const m = new T.Mesh(ge, mat); m.receiveShadow = true; return m; };

  { const hall = new T.Mesh(new T.PlaneGeometry(500, 500), reflective(0x040405, .5, .55)); hall.rotation.x = -Math.PI / 2; hall.receiveShadow = true; flat(hall); }
  const platM = reflective(0xaeada9, .3, .9); platM.transparent = true; platM.opacity = 0;
  const plat = flat(floorShape(D.platform, platM, H0));
  const slab = (() => { const ge = new T.ExtrudeGeometry(shapeOf(D.platform), { depth: H0 - .004, bevelEnabled: false }); ge.rotateX(-Math.PI / 2); ge.translate(-14, 0, -12); const m = new T.Mesh(ge, [new T.MeshBasicMaterial({ visible: false }), MAROON]); return add(m); })();   /* the maroon edge of the raised floor: its sides only */
  const fade = m => { const n = m.clone(); n.transparent = true; n.opacity = 0; return n; };
  const courtM = fade(COURT), zoneM = fade(CARPET);
  const court = add(floorShape(D.court, courtM, H0 + .02)), zone = add(floorShape(D.zone, zoneM, H0 + .021)), patch = add(floorShape(D.patch, zoneM, H0 + .021));   /* carpets lie over the laminate and its joints */

  /* the plan, drawn on the floor: every line is a line of the stand builder's plan (D.segs), and the grid is its one-metre grid */
  const strokes = (list, w, y) => { const pos = [], idx = []; list.forEach((s, n) => { const dx = s[2] - s[0], dz = s[3] - s[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l * w / 2, nz = dx / l * w / 2, b = n * 4;
      pos.push(wx(s[0]) + nx, y, wz(s[1]) + nz, wx(s[0]) - nx, y, wz(s[1]) - nz, wx(s[2]) - nx, y, wz(s[3]) - nz, wx(s[2]) + nx, y, wz(s[3]) + nz); idx.push(b, b + 1, b + 2, b, b + 2, b + 3); });
    const ge = new T.BufferGeometry(); ge.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); ge.setIndex(idx); return ge; };
  const gridSegs = []; for (let x = 0; x <= 28; x++) gridSegs.push([x, Math.max(0, x - 26.05), x, Math.min(24, x + 21.69)]); for (let y = 0; y <= 24; y++) gridSegs.push([Math.max(0, y - 21.69), y, Math.min(28, y + 26.05), y]);
  const along = s => (s[0] + s[2]) / 2 - (s[1] + s[3]) / 2;                            /* how far up the line a stroke lies: the plan is drawn from the open corner to the tower */
  gridSegs.sort((a, b) => along(a) - along(b));
  const segs = D.segs.slice().sort((a, b) => along(a) - along(b));
  const lineM = (c, o) => new T.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, toneMapped: false, side: T.DoubleSide });
  const gridGeo = strokes(gridSegs, PH ? .05 : .03, H0 + .016), planGeo = strokes(segs, PH ? .085 : .055, H0 + .034);
  const gridL = add(new T.Mesh(gridGeo, lineM(0xffffff, .2))), planL = add(new T.Mesh(planGeo, lineM(0xffffff, .95)));
  const groove = add(new T.Mesh(gridGeo, lineM(0x55575b, 0)));                             /* on the built floor the same grid is the joints of the white laminate */
  [gridL, planL, groove].forEach(m => { m.renderOrder = 6; m.frustumCulled = false; });

  /* ---------- the line: everything on the 45-degree axis lives in one group. Local z runs up the carpet to the tower ---------- */
  const AX = new T.Group(); AX.position.set(wx(11.045), 0, wz(16.96)); AX.rotation.y = Math.PI * .75; g.add(AX); AX.updateMatrixWorld(true);
  const CL = 15.22, CW = 3.0;                                                              /* carpet: 15.3 and 15.15 m on its two sides, 3.0 m wide (the plan) */
  const carpet = (() => { const ge = new T.PlaneGeometry(CW, CL); ge.rotateX(-Math.PI / 2); ge.translate(0, 0, CL / 2); const m = new T.Mesh(ge, CARPET.clone()); m.position.y = H0 + .024; m.receiveShadow = true; AX.add(m); return m; })();
  const lineGlow = (() => { const ge = new T.PlaneGeometry(CW, CL); ge.rotateX(-Math.PI / 2); ge.translate(0, 0, CL / 2); const m = new T.Mesh(ge, new T.MeshBasicMaterial({ color: 0xb01c33, transparent: true, depthWrite: false, toneMapped: false })); m.position.y = H0 + .027; m.renderOrder = 5; AX.add(m); return m; })();   /* on the drawing the line is the one thing in colour */
  const edge = [-1, 1].map(k => { const ge = new T.PlaneGeometry(.05, CL); ge.rotateX(-Math.PI / 2); ge.translate(k * (CW / 2 + .03), 0, CL / 2); const m = new T.Mesh(ge, lit(0xff4a3c, .9)); m.position.y = H0 + .03; AX.add(m); return m; });

  /* parts that rise out of the plan: each one grows from its own footprint */
  const parts = [];
  const rise = (o, t0, d, st) => { o.userData.t0 = t0; o.userData.d = d || .26; o.userData.st = st || 1; parts.push(o); return o; };
  const glowOn = (o, m) => { o.userData.skirt = m; return o; };   /* a lit skirt shows only once its body has risen */
  const bx = (w, h, d, m, x, z, y0) => { const ge = new T.BoxGeometry(w, h, d); ge.translate(0, h / 2, 0); const b = new T.Mesh(ge, m); b.position.set(x, y0 || 0, z); b.castShadow = b.receiveShadow = true; return b; };

  /* the single big podium, 3.2 x 3.2 x 0.67 (the builder's sheet 1), square to the line */
  /* Built as drawn on the builder's sheet 1 (3.2 x 3.2, 0.67 high, spray-painted MDF): a white band 32 cm high over a base set back 7 cm, a 5 cm kick, the top set in 7 cm.
     The client's own plan of 20 March (AC/01-WORK/021 p.7) gives one 3 x 3 m box to Souq Al Zaafarana: its English name is on the front, cut from the project's own
     name artwork (AC/01-WORK/019-020, English line). The rosette is the stand's pattern (AC/01-WORK/017, Pattern.ai): the lower half of one rosette, on each side */
  const rosT = S.tex('rosette.webp'), nameT = S.tex('name-souq.webp');
  const decal = (map, w, h) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map, transparent: true, alphaTest: .3, roughness: .55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.userData.noMirror = true; return m; };
  const onFace = (p, ang, half, m, x, y) => { const f = new T.Group(); f.rotation.y = ang; m.position.set(x, y, half + .004); f.add(m); p.add(f); };
  const bigP = new T.Group();
  { const p = bigP; p.position.set(0, H0, 12.62);
    const kick = bx(3.06, .05, 3.06, lit(0xffb48c, .85), 0, 0);
    p.add(shade(4.4, 4.4, .55), kick, bx(3.06, .3, 3.06, MAROON, 0, 0, .05), bx(3.2, .32, 3.2, GLOSS, 0, 0, .35), bx(3.06, .03, 3.06, TOPM, 0, 0, .655));
    onFace(p, Math.PI, 1.6, decal(rosT, .59, .28), -1.0, .51);                    /* the front, toward the open corner: the rosette, then the name */
    onFace(p, Math.PI, 1.6, decal(nameT, 1.75, 1.75 * 89 / 1067), .62, .51);
    [0, Math.PI / 2, -Math.PI / 2].forEach(a => onFace(p, a, 1.6, decal(rosT, .59, .28), 0, .51));
    AX.add(glowOn(rise(p, 0, .24, 2), kick)); }

  /* the tower at the end of the line (3.94 m across on the plan), and the passage behind it to the corner (2.76 m wide, 7.4 m long) */
  const towerGlow = new T.PointLight(0xffe2bd, 0, 16, 1.6);
  { const t = new T.Group(); t.position.set(0, H0, CL); const z = .25;
    t.add(bx(2.5, 6.6, .5, WHITE, 0, z)); [-1, 1].forEach(k => { t.add(bx(.1, 6.3, .8, WHITE, k * 1.5, z + .1), bx(.1, 6.0, .8, WHITE, k * 1.86, z + .1)); });
    const led = new T.Mesh(new T.PlaneGeometry(1.5, 3.4), new T.MeshBasicMaterial({ map: panelTex, toneMapped: false })); led.position.set(0, 2.5, z - .26); led.rotation.y = Math.PI; t.add(led);
    const fr = new T.Mesh(new T.PlaneGeometry(1.72, 3.62), INK); fr.position.set(0, 2.5, z - .255); fr.rotation.y = Math.PI; t.add(fr);
    t.add(bx(2.52, .08, .52, MAROON, 0, z, 6.6));
    [-1, 1].forEach(k => t.add(bx(.1, 5.6, 7.3, GREY, k * 1.33, z + 3.9)));
    towerGlow.position.set(0, 3.1, -1.8); t.add(towerGlow);
    AX.add(rise(t, .56, .34)); }

  /* two low islands beside the carpet. They are on the design render's plan (28 March 2017), not on the builder's plan: traced from the render */
  { const tri = [[11.42, 6.4], [15.78, 6.4], [11.42, 10.72]], R = .45, mk = pts => { const sh = new T.Shape(), n = pts.length;
      for (let i = 0; i < n; i++) { const a = pts[(i + n - 1) % n], b = pts[i], c = pts[(i + 1) % n], v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]], l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1]);
        const p1 = [b[0] + v1[0] / l1 * R, b[1] + v1[1] / l1 * R], p2 = [b[0] + v2[0] / l2 * R, b[1] + v2[1] / l2 * R]; i ? sh.lineTo(p1[0], -p1[1]) : sh.moveTo(p1[0], -p1[1]); sh.quadraticCurveTo(b[0], -b[1], p2[0], -p2[1]); }
      sh.closePath(); const grp = new T.Group(), ex = (dep, mat, y, s) => { const ge = new T.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: false, curveSegments: 8 }); ge.rotateX(-Math.PI / 2); ge.translate(-14, 0, -12); const m = new T.Mesh(ge, mat); m.position.y = y; m.castShadow = m.receiveShadow = true; grp.add(m); };
      ex(.1, GLOSS, .03); ex(.03, lit(0xffb48c, .9), 0); grp.position.y = H0 + .022; grp.userData.skirt = grp.children[1]; return grp; };
    add(rise(mk(tri), .44)); add(rise(mk(tri.map(p => [28 - p[1], 28 - p[0]]).reverse()), .47)); }

  /* ---------- the two wings: each 15 m long and 4.5 m deep on the plan, 6 m high in the contract; two storeys, as in the design renders.
     Built once in its own frame (s = along the wing from its outer end, d = back from the court, h = up) and mirrored across the line ---------- */
  const skyL = null, skyR = null;   /* the built print beside the tower was not found: the light boxes stay plain light, as the screens do */
  const lean = (o, k) => { o.userData.lean = k; return o; };
  function wing(sky) {
    const w = new T.Group(), P = (o, t0, d) => { w.add(rise(o, t0, d)); return o; };
    const b = (s0, s1, d0, d1, h0, h1, m) => bx(s1 - s0, h1 - h0, d1 - d0, m, (s0 + s1) / 2, -(d0 + d1) / 2, h0);
    /* the end wall: a white slab and a maroon slab that lean in toward the tower, with an LED wall on the outer face (3.7 x 2.1 m, from the annotated render) */
    { const e = new T.Group(); e.add(b(.39, .87, -.3, 4.5, 0, 6.2, WHITE));
      const led = new T.Mesh(new T.PlaneGeometry(3.7, 2.1), SCREEN); led.rotation.y = -Math.PI / 2; led.position.set(.38, 3.5, -2.2); e.add(led);
      const fr = new T.Mesh(new T.PlaneGeometry(3.86, 2.26), INK); fr.rotation.y = -Math.PI / 2; fr.position.set(.385, 3.5, -2.2); e.add(fr);
      P(lean(e, .21), .16); P(lean(b(1.26, 1.98, -.18, 4.5, 0, 6.0, MAROON), .21), .2); }
    P(b(0, .39, .41, 4.11, 0, .42, WHITE), .14, .12);
    /* the back wall, the upper floor and the set-back wall by the tower */
    P(b(.9, 15.1, 4.39, 4.5, 0, 5.95, BACK), .22); P(b(2.18, 15, .1, 4.39, 2.75, 2.93, WHITE), .3, .12);
    P(b(9.59, 14.3, .9, 1.0, 0, 2.75, WHITE), .3); P(b(9.5, 9.62, .34, 4.39, 0, 2.75, WHITE), .3); P(b(2.18, 2.3, .34, 4.39, 0, 2.75, WHITE), .28);
    /* ground floor: a white portal with glass, warm inside */
    { const r = new T.Group(); r.add(b(2.0, 10.3, -.04, .36, 2.5, 2.78, WHITE));
      for (let i = 0; i <= 3; i++) r.add(b(2.3 + i * 2.4 - .07, 2.3 + i * 2.4 + .07, .28, .4, 0, 2.5, WHITE));
      const gl = new T.Mesh(new T.PlaneGeometry(7.2, 2.4), GLASS); gl.position.set(5.9, 1.3, -.33); r.add(gl);
      /* the louvres in front of the glass, as in the renders (p.1, p.6) and the film: real slats, not a printed stripe */
      for (let k = 0; k < 7; k++) r.add(b(2.37, 9.43, .2, .3, .55 + k * .27, .62 + k * .27, LOUVRE));
      const glow = new T.Mesh(new T.PlaneGeometry(7.1, 2.5), lit(0xffe9cf, .3)); glow.position.set(5.9, 1.3, -4.3); r.add(glow);
      r.add(b(2.0, 10.3, -.02, .02, 2.47, 2.5, lit(0xfff0da, 1)));   /* the light line under the portal */
      const sh = shade(14, 4.4, .55); sh.position.set(8, .026, -2.2); r.add(sh);
      P(r, .34); P(lean(b(9.62, 10.5, -.04, .36, 0, 2.6, WHITE), -.3), .36); }
    /* upper storey, as built (the show film; build photographs IMG_1080, IMG_1081): a glazed upper floor, and a light box 5.25 m long beside the tower.
       The built skyline print was not found; the picture in the light box is the design render's own skyline, the part that stood beside the tower */
    { const u = new T.Group(), LB = 9.8, g0 = 2.6, gw = LB - .14 - g0;
      u.add(b(2.0, 15.05, -.14, .36, 5.3, 5.96, WHITE), b(2.0, 15.05, -.1, .34, 2.78, 2.95, WHITE), b(LB, 15.05, -.02, .3, 2.95, 5.3, INK), b(LB - .14, LB, -.06, .34, 2.95, 5.3, WHITE));
      const band = new T.Mesh(new T.PlaneGeometry(15.05 - LB, 2.35), lit(0xfff3e2, .95)); band.position.set((LB + 15.05) / 2, 4.125, .025); u.add(band);
      const gl = new T.Mesh(new T.PlaneGeometry(gw, 2.35), GLASS); gl.position.set(g0 + gw / 2, 4.125, -.12); u.add(gl);
      for (let k = 0; k < 6; k++) u.add(b(g0 + .05, LB - .19, .04, .12, 3.35 + k * .3, 3.41 + k * .3, LOUVRE));   /* louvres on the upper glass */
      u.add(b(g0, LB - .14, -.05, .05, 4.02, 4.06, STEEL));                                                          /* the balustrade rail behind the glass */
      u.add(b(2.0, 15.05, -.16, -.12, 5.27, 5.3, lit(0xfff0da, 1)));                                                 /* the light line under the fascia */
      const in2 = new T.Mesh(new T.PlaneGeometry(gw, 2.3), lit(0xe6eeff, .2)); in2.position.set(g0 + gw / 2, 4.125, -4.3); u.add(in2);
      for (let i = 1; i <= 2; i++) u.add(b(g0 + i * gw / 3 - .04, g0 + i * gw / 3 + .04, .08, .16, 2.95, 5.3, WHITE));
      u.add(b(2.0, 15.05, -.16, .38, 5.96, 6.02, MAROON));
      P(u, .44, .3); }
    return w;
  }
  const w1 = wing(skyL); w1.position.set(wx(9), H0, wz(4.5)); g.add(w1);
  { const mir = new T.Group(); mir.matrixAutoUpdate = false; mir.matrix.set(0, 0, -1, 2, 0, 1, 0, 0, -1, 0, 0, 2, 0, 0, 0, 1); g.add(mir);   /* the side wing: the same wing, mirrored across the line */
    const w2 = wing(skyR); w2.position.set(wx(9), H0, wz(4.5)); mir.add(w2); }

  /* ---------- the model zone: seven bases with screens (2.34 x 1.90 on the plan), and the pieces along the front ---------- */
  const podium = (X0, Y0, X1, Y1, side, t0) => { const p = new T.Group(), w = X1 - X0, d = Y1 - Y0; p.position.set(wx((X0 + X1) / 2), H0, wz((Y0 + Y1) / 2));
    p.add(bx(w, .18, d, MAROON, 0, 0), bx(w, .62, d, GLOSS, 0, 0, .18), bx(w - .3, .03, d - .3, TOPM, 0, 0, .8), shade(w + 1.1, d + 1.1, .5));
    if (side) { const s = new T.Group(), st = bx(1.1, 1.72, .1, WHITE, 0, 0), sc = new T.Mesh(new T.PlaneGeometry(.95, .54), SCREEN); sc.position.set(0, 1.36, .055); s.add(st, sc);
      s.position.set(side[0] * (w / 2 + .09), 0, side[1] * (d / 2 + .09)); s.rotation.y = Math.atan2(-side[0], -side[1]); p.add(s); }
    const fr = side ? [[-side[0], -side[1]]] : [[0, 1], [0, -1]];
    fr.forEach(v => { const ang = Math.atan2(v[0], v[1]), half = Math.abs(v[0]) ? w / 2 : d / 2, span = Math.abs(v[0]) ? d : w; onFace(p, ang, half, decal(rosT, Math.min(.59, span * .42), Math.min(.59, span * .42) * .475), -span / 2 + Math.min(.59, span * .42) / 2 + .14, .5); });
    return add(rise(p, t0, .16, 2)); };
  podium(3.66, .45, 6.0, 2.35, [0, -1], .42); podium(6.44, .45, 8.78, 2.35, [0, -1], .45);
  [3.27, 6.34, 9.41, 12.48].forEach((y, i) => podium(.63, y, 2.53, y + 2.34, [-1, 0], .48 + i * .03));
  podium(3.24, 12.92, 5.58, 14.82, [0, 1], .6);
  podium(16.6, 22.35, 17.8, 23.35, null, .63); podium(18.31, 22.35, 19.51, 23.35, null, .66);
  podium(21.8, 22.45, 22.9, 24, null, .69); podium(25.4, 22.45, 26.5, 24, null, .72);
  { const d = new T.Group(); d.position.set(wx(10.15), H0, wz(23.75)); d.add(bx(2.94, 1.0, .42, GLOSS, 0, 0), bx(2.96, .05, .44, MAROON, 0, 0, 1.0)); add(rise(d, .75, .16, 2)); }   /* information desk */

  /* ---------- the ceiling: kinetic spheres over the line. 8 across, counted on the build photograph IMG_1080; about 34 along, counted on IMG_1043 and the show film.
     The count is not in any document. Each sphere rises and falls on its own line and takes its own colour, as the films show ---------- */
  const NC = 8, NR = 34, PITCH = .425, TOP = 8.6, Z0 = .62, R = .132;
  const cW = new T.Color(0xeef2ff), cR = new T.Color(0xff2a35), cG = new T.Color(0x19d274), cB = new T.Color(0x3a6bff), tmpC = new T.Color();
  const ceil = new T.Group(); AX.add(ceil);
  const truss = new T.Group(); ceil.add(truss);
  { const dark = lit(0x0b0c0f, 1), L = NR * PITCH + .5, W = NC * PITCH + .5;
    [-1, 1].forEach(k => truss.add(bx(.14, .3, L, dark, k * W / 2, Z0 + (NR - 1) * PITCH / 2, TOP + .16)));
    for (let i = 0; i <= 6; i++) truss.add(bx(W, .26, .12, dark, 0, Z0 - .25 + i * L / 6, TOP + .18));
    const wb = new T.InstancedMesh(new T.BoxGeometry(.3, .16, .3), lit(0x15171c, 1), NC * NR), M = new T.Matrix4();
    for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) { M.makeTranslation((c - (NC - 1) / 2) * PITCH, TOP + .08, Z0 + r * PITCH); wb.setMatrixAt(r * NC + c, M); } truss.add(wb); }
  const matcap = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), gr = x.createRadialGradient(58, 54, 0, 64, 64, 64); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.5, '#f1f1f1'); gr.addColorStop(.82, '#c2c2c2'); gr.addColorStop(1, '#8f8f8f'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; return t; })();
  const lampM = new T.ShaderMaterial({ toneMapped: false,
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vC;\nvoid main(){ vec4 p = vec4(position, 1.0); vec3 n = normal;\n#ifdef USE_INSTANCING\n p = instanceMatrix * p; n = mat3(instanceMatrix) * n;\n#endif\n#ifdef USE_INSTANCING_COLOR\n vC = instanceColor;\n#else\n vC = vec3(1.0);\n#endif\n vec4 mv = modelViewMatrix * p; vN = normalize(normalMatrix * n); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vC;\nvoid main(){ float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); float m = max(max(vC.r, vC.g), vC.b); vec3 hot = mix(vC, vec3(m), .6); gl_FragColor = vec4(mix(vC * .72, hot, pow(f, 1.4)), 1.0);\n#include <colorspace_fragment>\n}' });
  const N = NC * NR, balls = new T.InstancedMesh(new T.SphereGeometry(R, 16, 10), lampM, N); balls.frustumCulled = false; ceil.add(balls);
  const wireGeo = new T.BufferGeometry(), wirePos = new Float32Array(N * 6); wireGeo.setAttribute('position', new T.BufferAttribute(wirePos, 3));
  const wires = new T.LineSegments(wireGeo, new T.LineBasicMaterial({ color: 0x9aa0aa, transparent: true, opacity: .1 })); wires.frustumCulled = false; ceil.add(wires);
  const glowGeo = new T.BufferGeometry(), glowPos = new Float32Array(N * 3), glowCol = new Float32Array(N * 3); glowGeo.setAttribute('position', new T.BufferAttribute(glowPos, 3)); glowGeo.setAttribute('color', new T.BufferAttribute(glowCol, 3));
  const glow = new T.Points(glowGeo, new T.PointsMaterial({ map: halo, size: 1.05, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: .5, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false })); glow.frustumCulled = false; ceil.add(glow);
  const zoneL = [.16, .5, .84].map(f => { const l = new T.PointLight(0xffffff, 0, 13, 1.5); l.position.set(0, 5, Z0 + f * (NR - 1) * PITCH); ceil.add(l); return l; });
  const dm = new T.Matrix4(), off = new T.Color();
  let glowBase = 0;
  /* the colour of a row at a moment: mostly a white wave; then the flag's colours run along the line, as in the show film at 1:49 */
  const rowCol = (r, t, out) => { const p = r / (NR - 1), f = .5 + .5 * Math.sin(t * .23 - 1.2), k = clamp((f - .42) / .2, 0, 1), q = (p + .1 * Math.sin(t * .35) + 1) % 1;
    out.copy(cR); if (q > .3) out.lerp(cW, clamp((q - .3) / .08, 0, 1)); if (q > .62) out.lerp(cG, clamp((q - .62) / .08, 0, 1)); return out.lerpColors(cW, out, k); };
  function spheres(t, drop, on) {
    const gm = glow.material; ceil.visible = drop > 0; if (!ceil.visible) { zoneL.forEach(l => { l.intensity = 0; }); return; }
    for (let r = 0; r < NR; r++) { const rd = E(seg(drop, r / NR * .62, r / NR * .62 + .38)), bright = lerp(.06, 1, on * rd); rowCol(r, t, tmpC);
      for (let c = 0; c < NC; c++) { const i = r * NC + c, x = (c - (NC - 1) / 2) * PITCH, z = Z0 + r * PITCH;
        const wave = 5.7 + 1.25 * Math.sin(r * .42 - t * 1.25 + c * .12) + .45 * Math.sin(r * .17 + t * .6 + 1.3 + c * .31);
        const y = lerp(TOP - .2, wave, rd);
        dm.makeTranslation(x, y, z); balls.setMatrixAt(i, dm);
        balls.setColorAt(i, off.copy(tmpC).multiplyScalar(lerp(.2, 1, on)));
        wirePos.set([x, TOP, z, x, y + R, z], i * 6); glowPos.set([x, y, z], i * 3); glowCol.set([tmpC.r * bright, tmpC.g * bright, tmpC.b * bright], i * 3); } }
    balls.instanceMatrix.needsUpdate = true; balls.instanceColor.needsUpdate = true; wireGeo.attributes.position.needsUpdate = true; glowGeo.attributes.position.needsUpdate = true; glowGeo.attributes.color.needsUpdate = true;
    glowBase = .45 * on; truss.position.y = (1 - E(seg(drop, 0, .25))) * 5; truss.visible = true;
    zoneL.forEach((l, n) => { rowCol(Math.round([.16, .5, .84][n] * (NR - 1)), t, l.color).lerp(cW, .55); l.intensity = 15 * on * E(seg(drop, .2 + n * .2, .6 + n * .2)); });
  }

  /* ---------- CAMERA: one walk from the drawing on the floor to the inside of the stand.
     Each key: [G, position, target, lens, x-shift of the picture, y-shift]. G = stop number + how far through it. ---------- */
  const A = (x, y, z) => AX.localToWorld(new T.Vector3(x, y, z)), W = (X, Y, h) => new T.Vector3(wx(X), h, wz(Y));
  const far = PH ? 1.7 : 1, lens = PH ? 46 : 34, wide = PH ? 76 : 60, sx = PH ? 0 : -.13, sy = PH ? .13 : -.03;
  const out = (p, t, k) => t.clone().add(p.clone().sub(t).multiplyScalar(k));
  const K = [
    [0.00, W(14, 18, 54), W(14, 12.2, 0), lens, sx, sy, 1],                      /* the plan, from above, as it is drawn */
    [0.90, W(10.5, 29, 56), W(15.2, 12.6, 0), lens, sx, sy, 1],
    [1.45, A(19, 26, -36), A(0, 2.4, 8.6), lens, sx, sy, 1],                      /* the walls rise: the whole stand, from the open corner */
    [1.8, A(7, 7, -9), A(0, 1.2, 10.5), lens + 8, sx * .5, sy, 0],
    [2.06, A(1.7, 1.6, 6.5), A(.1, .42, 11.05), lens + 10, 0, 0, 2],             /* one base, close: the rosette and the name */
    [2.42, A(1.25, 1.52, 7.0), A(.1, .42, 11.05), lens + 10, 0, 0, 2],
    [2.64, A(4.5, 4.2, 4.5), A(0, .9, 10.5), lens + 10, sx * .5, sy, 0],
    [2.97, A(15, 17, -29), A(0, 1.6, 8.4), lens, sx, sy, 1],                      /* then all of them, from the open corner */
    [3.18, A(7.5, 10.5, -25), A(0, 3.4, 8.8), lens + 4, sx * .8, sy, 1],
    [3.26, A(2.6, 4.8, -12), A(0, 4.6, 9), lens + 12, sx * .5, sy * .6, 0],     /* the ceiling comes down */
    [3.36, A(0, 1.7, -1.5), A(0, 2.8, 12), wide, 0, 0, 0],
    [3.44, A(0, .95, 3.4), A(0, -1.9, 8.2), wide + 6, 0, 0, 0],                 /* the film's own first frame: low on the carpet, looking along it */
    [4.0, A(0, 1.5, 2.6), A(0, 7.4, 8.2), wide + 4, 0, 0, 0],                   /* the film's last frame: up into the spheres */
    [4.06, A(0, 1.55, 3.0), A(0, 7.2, 8.6), wide + 2, 0, 0, 0],
    [4.24, A(.2, 1.6, 6.8), A(2.4, 3.9, 15), wide, 0, 0, 0],                    /* walking the line under the light */
    [4.44, W(22.5, 10.9, 1.32), W(11.5, 4.7, 2.7), wide + 8, 0, 0, 0],          /* by the big model, facing the back wing: where the film stands */
    [5.0, W(22.1, 10.5, 1.36), W(12.5, 4.5, 2.9), wide + 8, 0, 0, 0]
  ].map(k => ({ g: k[0], p: k[6] === 1 ? out(k[1], k[2], far) : k[6] === 2 && PH ? out(k[1], k[2], 1.8) : k[1], t: k[2], f: k[3], ox: k[4], oy: k[5] }));   /* 2: a close view that steps back on a phone, so the whole base stays in frame */
  const cr = (a, b, c, d, u) => .5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  const cr3 = (o, a, b, c, d, u) => o.set(cr(a.x, b.x, c.x, d.x, u), cr(a.y, b.y, c.y, d.y, u), cr(a.z, b.z, c.z, d.z, u));
  const cp = new T.Vector3(), ct = new T.Vector3(), fwd = new T.Vector3();
  function camera(G) {
    let n = 0; while (n < K.length - 2 && G >= K[n + 1].g) n++;
    const a = K[Math.max(0, n - 1)], b = K[n], c = K[n + 1], d = K[Math.min(K.length - 1, n + 2)], u = clamp((G - b.g) / (c.g - b.g), 0, 1), e = u * u * (3 - 2 * u);
    cr3(cp, a.p, b.p, c.p, d.p, u); cr3(ct, a.t, b.t, c.t, d.t, u); cp.y = Math.max(.7, cp.y);
    cam.fov = lerp(b.f, c.f, e); cam.near = .1; cam.far = 600;
    const w = stick.clientWidth, h = stick.clientHeight; cam.aspect = w / h; cam.setViewOffset(w, h, lerp(b.ox, c.ox, e) * w, lerp(b.oy, c.oy, e) * h, w, h);
    cam.position.copy(cp); cam.up.set(0, 1, 0); cam.lookAt(ct); cam.updateMatrixWorld(true);
    S.rim.position.set(cp.x, cp.y + 6, cp.z); S.rim.target.position.copy(ct);   /* a soft fill from where we stand, so no face goes black */
    glow.material.opacity = glowBase * (cp.y > 4 ? 1 : .3);   /* under the ceiling the halos step back, so no soft disc sits in front of the stand */
    const dist = cp.distanceTo(ct); scene.fog.near = dist + 30; scene.fog.far = dist + 150;
  }
  const stick = sec.querySelector('.fp-stick');

  /* ---------- the sequence: G runs 0 to 5. 0 the plan is drawn and the line is laid · 1 the stand rises from it · 2 one base, then all of them · 3 the ceiling comes down and lights · 4 inside ---------- */
  const rowsOf = geo => geo.index.count;
  function compose(G, t) {
    const a = clamp(G, 0, 1), b = clamp((G - 1) / .9, 0, 1), p2 = clamp((G - 2) / .9, 0, 1), c = clamp((G - 3) / .4, 0, 1);
    gridL.geometry.setDrawRange(0, rowsOf(gridGeo));
    const drawn = E(seg(a, .04, .64)); planL.geometry = planGeo; planGeo.setDrawRange(0, Math.floor(segs.length * drawn) * 6);
    const laid = E(seg(a, .52, .94)); carpet.scale.z = Math.max(laid, .0001); carpet.visible = laid > 0; lineGlow.scale.z = carpet.scale.z; lineGlow.material.opacity = 1 - E(seg(b, 0, .3)); lineGlow.visible = laid > 0 && b < .3; edge.forEach(m => { m.scale.z = Math.max(laid, .0001); m.visible = b > .1; });
    const solid = E(seg(b, .0, .24));                                                   /* the drawing becomes a floor */
    platM.opacity = solid; plat.visible = solid > 0; slab.visible = solid > 0; slab.scale.y = Math.max(solid, .001);
    courtM.opacity = E(seg(b, .04, .3)); zoneM.opacity = E(seg(b, .08, .34)); court.visible = courtM.opacity > 0; zone.visible = patch.visible = zoneM.opacity > 0;
    planL.material.opacity = .95 * (1 - E(seg(b, .1, .5))); planL.visible = planL.material.opacity > .01;
    gridL.material.opacity = .2 * (1 - solid); gridL.visible = solid < 1; groove.material.opacity = .16 * solid; groove.visible = solid > 0;
    for (let i = 0; i < parts.length; i++) { const o = parts[i], pr = o.userData.st === 2 ? p2 : b, e = E(seg(pr, o.userData.t0, o.userData.t0 + o.userData.d)), k = o.userData.lean; o.visible = e > 0; if (o.userData.skirt) o.userData.skirt.visible = e > .97;
      if (k !== undefined) { if (!o.userData.m) { o.updateMatrix(); o.userData.m = o.matrix.clone(); o.matrixAutoUpdate = false; } o.matrix.copy(o.userData.m).multiply(dm.set(1, k * e, 0, 0, 0, Math.max(e, .001), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)); o.matrixWorldNeedsUpdate = true; }
      else o.scale.y = Math.max(e, .001); }
    towerGlow.intensity = 5 * E(seg(b, .8, 1));
    spheres(t, G < 3 ? 0 : seg(c, 0, .62), E(seg(c, .08, .5)));
    /* light: a soft white key from the hall while the stand is being built; it steps back when the ceiling lights */
    const lights = E(seg(c, .2, .8));
    key.color.set(0xfff4e6); key.intensity = lerp(1250, 620, lights) * (.05 + .95 * solid); key.angle = 1.02; key.penumbra = .7; key.decay = 1.5;
    key.position.copy(keyP); key.target.position.copy(keyT); key.shadow.camera.far = 70;
    S.rim.color.set(0xe4e9ff); S.rim.intensity = .42 * solid; renderer.toneMappingExposure = lerp(1.0, 1.06, lights);
  }
  const keyP = A(9, 33, -5), keyT = A(0, 0, 8);

  /* where we are: the same count the engine keeps, read from the scroll */
  let G = 0, time = 0, last = performance.now();
  const wsum = S.ST.reduce((s, x) => s + (x.w || 1), 0);
  FP.on(H => { const r = sec.getBoundingClientRect(), P = clamp(-r.top / Math.max(1, r.height - H), 0, 1); let uu = clamp((P - .07) / .93, 0, .9999) * wsum, i = 0;
    while (i < S.ST.length - 1 && uu >= (S.ST[i].w || 1)) { uu -= (S.ST[i].w || 1); i++; } const local = uu / (S.ST[i].w || 1);
    G = FP.rm ? i + (i > 2 ? .4 : .97) : i + local; sec.classList.toggle('cs-pre', P < .075); });

  /* every picture the engine draws passes through here first: place the pieces, walk the camera, draw the reflection */
  const R0 = renderer.render.bind(renderer);
  renderer.render = (sc, cm) => {
    if (sc !== scene || cm !== cam) return R0(sc, cm);
    const now = performance.now(); if (!FP.rm) time += Math.min(now - last, 60) / 1000; last = now;
    compose(G, FP.rm ? 7.5 : time); camera(G);
    if (!PH) { cam.getWorldDirection(fwd); const p = cam.position;
      vcam.fov = Math.min(150, 2 * Math.atan(Math.tan(cam.fov * Math.PI / 360) * 1.45) * 180 / Math.PI); vcam.aspect = cam.aspect; vcam.near = .1; vcam.far = 600; vcam.updateProjectionMatrix();
      vcam.position.set(p.x, 2 * H0 - p.y, p.z); vcam.up.set(0, -1, 0); vcam.lookAt(p.x + fwd.x * 10, 2 * H0 - (p.y + fwd.y * 10), p.z + fwd.z * 10); vcam.updateMatrixWorld(true);
      texM.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1).multiply(vcam.projectionMatrix).multiply(vcam.matrixWorldInverse);
      flats.forEach(o => { o.userData.v = o.visible; o.visible = false; }); const au = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false;
      renderer.clippingPlanes = [clipP]; renderer.setRenderTarget(RT); renderer.clear(); R0(scene, vcam); renderer.setRenderTarget(null);
      renderer.clippingPlanes = []; renderer.shadowMap.autoUpdate = au; flats.forEach(o => { o.visible = o.userData.v; }); }
    R0(sc, cm);
  };
  const clipP = new T.Plane(new T.Vector3(0, 1, 0), -(H0 + .03));
  compose(0, 0); camera(0);
  window.__cs = { K, A, W, set: v => { G = v; }, get: () => G };
  S.ready();
}
