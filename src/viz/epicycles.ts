export type C = { re: number; im: number };

export type Coeff = {
  freq: number;
  amp: number;
  phase: number;
};

export type EpicycleModel = {
  coeffs: Coeff[];
  samples: C[];
  height: number;
};

const TWO_PI = Math.PI * 2;

function resampleClosed(verts: Array<[number, number]>, n: number): C[] {
  const segs: Array<{ a: [number, number]; len: number }> = [];
  let total = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push({ a, len });
    total += len;
  }
  const pts: C[] = [];
  for (let i = 0; i < n; i++) {
    let dist = (i / n) * total;
    for (let s = 0; s < segs.length; s++) {
      const { a, len } = segs[s];
      if (dist <= len || s === segs.length - 1) {
        const b = verts[(s + 1) % verts.length];
        const u = len === 0 ? 0 : dist / len;
        pts.push({
          re: a[0] + (b[0] - a[0]) * u,
          im: a[1] + (b[1] - a[1]) * u,
        });
        break;
      }
      dist -= len;
    }
  }
  return pts;
}

function heart(n: number): C[] {
  const pts: C[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TWO_PI;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push({ re: x / 17, im: -y / 17 });
  }
  return pts;
}

export const SHAPES = ["circle", "square", "star", "heart", "sigma"] as const;
export type ShapeId = (typeof SHAPES)[number];

export function sampleShape(shape: ShapeId, n = 256): C[] {
  if (shape === "circle") {
    return Array.from({ length: n }, (_, i) => {
      const t = (i / n) * TWO_PI;
      return { re: Math.cos(t), im: Math.sin(t) };
    });
  }
  if (shape === "heart") return heart(n);
  if (shape === "square") {
    return resampleClosed(
      [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ],
      n,
    );
  }
  if (shape === "star") {
    const verts: Array<[number, number]> = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 1 : 0.42;
      verts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return resampleClosed(verts, n);
  }
  return resampleClosed(
    [
      [0.95, 0.82],
      [-0.9, 0.82],
      [-0.55, 0.64],
      [0.28, 0.06],
      [-0.55, -0.52],
      [-0.9, -0.82],
      [0.95, -0.82],
      [0.95, -0.58],
      [-0.28, -0.58],
      [0.42, 0],
      [-0.28, 0.58],
      [0.95, 0.58],
    ],
    n,
  );
}

export function fourier(samples: C[]): EpicycleModel {
  const N = samples.length;
  const coeffs: Coeff[] = [];
  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const phi = (TWO_PI * k * n) / N;
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      re += samples[n].re * c + samples[n].im * s;
      im += samples[n].im * c - samples[n].re * s;
    }
    re /= N;
    im /= N;
    const freq = k <= N / 2 ? k : k - N;
    coeffs.push({
      freq,
      amp: Math.hypot(re, im),
      phase: Math.atan2(im, re),
    });
  }
  coeffs.sort((a, b) => b.amp - a.amp);
  let min = Infinity;
  let max = -Infinity;
  for (const p of samples) {
    min = Math.min(min, p.im);
    max = Math.max(max, p.im);
  }
  return { coeffs, samples, height: Math.max(0.001, max - min) };
}

export function gapPercent(model: EpicycleModel, harmonics: number): number {
  const N = model.samples.length;
  const used = model.coeffs.slice(0, harmonics);
  let worst = 0;
  for (let n = 0; n < N; n += 2) {
    const t = (n / N) * TWO_PI;
    let re = 0;
    let im = 0;
    for (const c of used) {
      re += c.amp * Math.cos(c.freq * t + c.phase);
      im += c.amp * Math.sin(c.freq * t + c.phase);
    }
    const dx = re - model.samples[n].re;
    const dy = im - model.samples[n].im;
    worst = Math.max(worst, Math.hypot(dx, dy));
  }
  return (worst / model.height) * 100;
}

export type Arm = { x: number; y: number; r: number; px: number; py: number };

export function armsAt(model: EpicycleModel, harmonics: number, t: number): Arm[] {
  const used = model.coeffs.slice(0, Math.max(1, harmonics));
  const arms: Arm[] = [];
  let x = 0;
  let y = 0;
  for (const c of used) {
    const px = x;
    const py = y;
    x += c.amp * Math.cos(c.freq * t + c.phase);
    y += c.amp * Math.sin(c.freq * t + c.phase);
    arms.push({ x, y, r: c.amp, px, py });
  }
  return arms;
}
