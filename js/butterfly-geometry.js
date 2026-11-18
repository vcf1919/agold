/*
 * Geometría de la mariposa AGOLD (fuente única).
 * La usan el sello SVG, el isotipo y la mariposa 3D del hero.
 * Coordenadas del ala DERECHA en unidades de diseño: x hacia la derecha,
 * y hacia abajo, origen en el centro del cuerpo. El ala izquierda es el espejo.
 */

// Ala superior: contorno U0–U6 + puntos interiores C1–C3
const U = {
  U0: [6, 4], U1: [20, -22], U2: [34, -50], U3: [53, -54],
  U4: [64, -30], U5: [62, -4], U6: [36, 10],
  C1: [45, -31], C2: [29, -8], C3: [52, -13],
};
// Ala inferior: contorno L0–L4 + interiores D1–D2
const L = {
  L0: [8, 16], L1: [34, 13], L2: [39, 34], L3: [27, 64], L4: [12, 46],
  D1: [24, 29], D2: [25, 46],
};

const upperTris = [
  ['U0', 'U1', 'C2'], ['U1', 'C1', 'C2'], ['U1', 'U2', 'C1'], ['U2', 'U3', 'C1'],
  ['U3', 'U4', 'C1'], ['U4', 'C3', 'C1'], ['U4', 'U5', 'C3'], ['U5', 'U6', 'C3'],
  ['U6', 'C2', 'C3'], ['C1', 'C3', 'C2'], ['U6', 'U0', 'C2'],
];
const lowerTris = [
  ['L0', 'L1', 'D1'], ['L1', 'L2', 'D1'], ['L2', 'D2', 'D1'], ['L2', 'L3', 'D2'],
  ['L3', 'L4', 'D2'], ['L4', 'D1', 'D2'], ['L4', 'L0', 'D1'],
];

/** Triángulos del ala derecha: [{ pts:[[x,y]x3], wing:'upper'|'lower' }] */
export const RIGHT_WING = [
  ...upperTris.map((t) => ({ pts: t.map((k) => U[k]), wing: 'upper' })),
  ...lowerTris.map((t) => ({ pts: t.map((k) => L[k]), wing: 'lower' })),
];

/** Todos los triángulos, con side = 1 (derecha) o -1 (izquierda). */
export const FACETS = [
  ...RIGHT_WING.map((f) => ({ ...f, side: 1 })),
  ...RIGHT_WING.map((f) => ({ ...f, side: -1, pts: f.pts.map(([x, y]) => [-x, y]) })),
];

/** Cuerpo: cuentas elípticas a lo largo del eje [cy, rx, ry] */
export const BODY = [
  [-19, 2.2, 2.4], [-10.5, 2.6, 5.6], [-1.5, 2.2, 3], [4.5, 2, 2.8],
  [10.5, 1.8, 2.8], [16.5, 1.5, 2.8], [22, 1.1, 2.4],
];

/** Antenas (derecha): de la cabeza a la punta, con elipse final */
export const ANTENNA = { from: [1.4, -21], to: [16, -50], tip: { rx: 2.2, ry: 5.2 } };

/** Extensión aproximada de la mariposa (para encuadrar) */
export const BOUNDS = { minX: -64, maxX: 64, minY: -56, maxY: 66 };
