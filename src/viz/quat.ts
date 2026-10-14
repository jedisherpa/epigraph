/** Unit quaternions as (w, x, y, z). Multiplication is ordered. */

export type Q = readonly [number, number, number, number];

export const Q1: Q = [1, 0, 0, 0];
export const QI: Q = [0, 1, 0, 0];
export const QJ: Q = [0, 0, 1, 0];
export const QK: Q = [0, 0, 0, 1];

export function qmul(a: Q, b: Q): Q {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

export function qconj(a: Q): Q {
  return [a[0], -a[1], -a[2], -a[3]];
}

export function qscale(a: Q, s: number): Q {
  return [a[0] * s, a[1] * s, a[2] * s, a[3] * s];
}

export function qadd(a: Q, b: Q): Q {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}

export function qnorm2(a: Q): number {
  return a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3];
}

export function qnorm(a: Q): number {
  return Math.hypot(a[0], a[1], a[2], a[3]);
}

export function qinv(a: Q): Q {
  return qscale(qconj(a), 1 / qnorm2(a));
}

export function qnormalize(a: Q): Q {
  return qscale(a, 1 / qnorm(a));
}

/** exp of a pure quaternion: cos|v| + sin|v| · v̂. */
export function qexpPure(v: Q): Q {
  const n = Math.hypot(v[1], v[2], v[3]);
  if (n < 1e-12) return Q1;
  const s = Math.sin(n) / n;
  return [Math.cos(n), v[1] * s, v[2] * s, v[3] * s];
}

/** Rotor for a rotation by `angle` about a unit pure axis. */
export function rotor(axis: Q, angle: number): Q {
  const h = angle / 2;
  const s = Math.sin(h);
  return [Math.cos(h), axis[1] * s, axis[2] * s, axis[3] * s];
}

/** q v q⁻¹. v should be pure. */
export function rotate(q: Q, v: Q): Q {
  return qmul(qmul(q, v), qconj(q));
}

export type Pair = { q0: Q; q1: Q };

/** Quaternionic Hopf map. X = 2 q0 conj(q1), z = |q0|² − |q1|², so |X|² + z² = 1. */
export function hopf(p: Pair): { X: Q; z: number } {
  return {
    X: qscale(qmul(p.q0, qconj(p.q1)), 2),
    z: qnorm2(p.q0) - qnorm2(p.q1),
  };
}

export function rightAct(p: Pair, r: Q): Pair {
  return { q0: qmul(p.q0, r), q1: qmul(p.q1, r) };
}

export function northA(z: number): number {
  return Math.sqrt(Math.max(0, (1 + z) / 2));
}

export function southB(z: number): number {
  return Math.sqrt(Math.max(0, (1 - z) / 2));
}

export function fiberNorth(p: Pair): Q {
  return qscale(p.q0, 1 / northA(hopf(p).z));
}

export function fiberSouth(p: Pair): Q {
  return qscale(p.q1, 1 / southB(hopf(p).z));
}

/** S² direction h i conj(h). Fixed by right multiplication by exp(iφ). */
export function s2dir(h: Q): Q {
  return qmul(qmul(h, QI), qconj(h));
}

/**
 * Horizontal lift of the loop (e^{−jθ}, 0) on S⁴.
 * θ = 0 and θ = 2π project to the same base point; the lift ends at −Z(0).
 */
export function holonomyLift(theta: number): Pair {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const inv = Math.SQRT1_2;
  return {
    q0: [c * inv, 0, -s * inv, 0],
    q1: [c * inv, 0, s * inv, 0],
  };
}

export function qfmt(q: Q, digits = 2): string {
  const names = ["", "i", "j", "k"] as const;
  const parts: string[] = [];
  q.forEach((value, i) => {
    if (Math.abs(value) < 5e-3) return;
    const mag = Math.abs(value).toFixed(digits);
    const sign = value < 0 ? "−" : parts.length ? "+" : "";
    parts.push(`${sign}${mag}${names[i]}`);
  });
  return parts.length ? parts.join(" ") : "0";
}

export type Payload = {
  Q: Q;
  L: number[];
  V: number[];
  A: number;
  t: number;
};

/** Reference encoding on S¹³. t = 1/√(|q|² + |b|² + |v|² + α² + 1). */
export function encodePayload(q: Q, b: number[], v: number[], alpha: number): Payload {
  const b2 = b.reduce((s, x) => s + x * x, 0);
  const v2 = v.reduce((s, x) => s + x * x, 0);
  const t = 1 / Math.sqrt(qnorm2(q) + b2 + v2 + alpha * alpha + 1);
  return {
    Q: qscale(q, t),
    L: b.map((x) => x * t),
    V: v.map((x) => x * t),
    A: alpha * t,
    t,
  };
}

export function decodePayload(p: Payload): { q: Q; b: number[]; v: number[]; alpha: number } {
  const inv = 1 / p.t;
  return {
    q: qscale(p.Q, inv),
    b: p.L.map((x) => x * inv),
    v: p.V.map((x) => x * inv),
    alpha: p.A * inv,
  };
}
