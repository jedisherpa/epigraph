import { armsAt, fourier, sampleShape } from "@/viz/epicycles";
import { spawnParticle, stepParticle, type Particle } from "@/viz/field";
import { palette } from "@/viz/palette";
import { PRIMES } from "@/viz/primes";

export const SONG_SECONDS = 205.94;

/** 0 is the lone ring. 1 is the full figure. */
const ARC: Array<[number, number]> = [
  [0, 0.04],
  [14, 0.12],
  [36, 0.42],
  [58, 0.74],
  [70, 0.9],
  [80, 0.72],
  [98, 0.28],
  [112, 0.1],
  [130, 0.4],
  [152, 0.72],
  [168, 0.9],
  [178, 1],
  [186, 0.86],
  [196, 0.2],
  [206, 0.04],
];

const ORDER = [
  "hopf",
  "charts",
  "turn",
  "holonomy",
  "wilson",
  "kernel",
  "relative",
  "strain",
  "payload",
  "covariance",
  "epicycles",
  "field",
  "primes",
  "gears",
] as const;

const GATE = [0, 0.12, 0.2, 0.28, 0.36, 0.42, 0.48, 0.54, 0.5, 0.6, 0.66, 0.74, 0.86, 0.78];
const LATE = new Set(["payload", "epicycles", "field", "primes", "gears"]);

function smooth(a: number, b: number, x: number) {
  if (x <= a) return 0;
  if (x >= b) return 1;
  const t = (x - a) / (b - a);
  return t * t * (3 - 2 * t);
}

function breadthAt(t: number) {
  if (t <= ARC[0][0]) return ARC[0][1];
  for (let i = 1; i < ARC.length; i++) {
    const [t0, v0] = ARC[i - 1];
    const [t1, v1] = ARC[i];
    if (t <= t1) return v0 + (v1 - v0) * smooth(t0, t1, t);
  }
  return ARC[ARC.length - 1][1];
}

function layerAlpha(songT: number, breadth: number, index: number) {
  if (index === 0) return 1;
  const late = LATE.has(ORDER[index]);
  const opened = late ? smooth(118, 142, songT) : 1;
  return smooth(GATE[index], GATE[index] + 0.14, breadth * opened);
}

const traceModel = fourier(sampleShape("star", 220));
const TRACE: Array<[number, number]> = [];
for (let i = 0; i <= 280; i++) {
  const arms = armsAt(traceModel, 16, (i / 280) * Math.PI * 2);
  const tip = arms[arms.length - 1];
  TRACE.push([tip.x, tip.y]);
}

const HALO = PRIMES.filter((p) => p < 430).map((p) => ({
  ang: p,
  u: (p % 17) / 17,
}));

export type RecordState = { particles: Particle[]; angle: number };

export function drawRecord(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  songT: number,
  dt: number,
  state: RecordState,
  pulse = 0,
) {
  const breadth = breadthAt(songT);
  const A = ORDER.map((_, i) => layerAlpha(songT, breadth, i));
  const cx = w * 0.5;
  const cy = h * 0.44;
  const R = Math.min(w, h) * (0.2 + breadth * 0.14);
  state.angle = (state.angle || 0) + dt * (0.85 + breadth * 2.6);
  const spin = state.angle;

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  const beat = 1 + Math.max(0, Math.min(1, pulse)) * (0.04 + breadth * 0.16);
  ctx.translate(cx, cy);
  ctx.scale(beat, beat);
  ctx.translate(-cx, -cy);

  if (pulse > 0.02) {
    const hue = (32 + breadth * 210 + spin * 18) % 360;
    const glow = ctx.createRadialGradient(cx, cy, R * 0.05, cx, cy, R * (1.35 + pulse * 0.85));
    glow.addColorStop(0, `hsla(${hue}, 85%, 62%, ${0.07 + pulse * 0.32})`);
    glow.addColorStop(0.45, `hsla(${(hue + 40) % 360}, 70%, 50%, ${0.04 + pulse * 0.12})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  const paint = (i: number, draw: () => void) => {
    const a = A[i];
    if (a < 0.012) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, a);
    draw();
    ctx.restore();
  };

  paint(4, () => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin * 0.7);
    ctx.strokeStyle = "#b388ff";
    ctx.lineWidth = 1.6;
    const s = R * (0.46 + 0.08 * Math.sin(spin * 1.3));
    ctx.strokeRect(-s, -s * 0.7, s * 2, s * 1.4);
    ctx.rotate(-spin * 1.5);
    ctx.strokeStyle = "#ff6d9a";
    ctx.strokeRect(-s * 0.55, -s * 0.55, s * 1.1, s * 1.1);
    ctx.restore();
  });

  paint(7, () => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.8, R * 0.4, spin * 0.22, 0, Math.PI * 2);
    ctx.strokeStyle = "#ff6d9a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const phi = spin * 0.9;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * 0.62 * Math.cos(phi), cy + R * 0.34 * Math.sin(phi));
    ctx.strokeStyle = "#ffe1a8";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  });

  paint(12, () => {
    for (const dot of HALO) {
      const spread = 0.06 + A[12] * 0.36;
      const ang = dot.ang + spin * 0.18;
      const rad = R * (1 + spread * (0.35 + dot.u));
      ctx.fillStyle = `hsl(${(dot.ang * 48 + spin * 24) % 360}, 78%, 64%)`;
      ctx.fillRect(cx + rad * Math.cos(ang), cy + rad * Math.sin(ang), 2.2, 2.2);
    }
  });

  paint(1, () => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - R);
    ctx.lineTo(cx, cy + R);
    ctx.strokeStyle = "#3ec6d6";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.72, cy);
    ctx.lineTo(cx + R * 0.72, cy);
    ctx.stroke();
    const z = Math.sin(spin * 1.5);
    const x = Math.cos(spin * 1.1) * R * 0.72;
    ctx.beginPath();
    ctx.arc(cx + x, cy + z * R * 0.82, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#7af0ff";
    ctx.fill();
  });

  paint(6, () => {
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.07, 0, Math.PI * 2);
    ctx.strokeStyle = "#2ee6c7";
    ctx.lineWidth = 1.15;
    ctx.stroke();
    const ang = -spin * 1.25 + 0.9;
    ctx.beginPath();
    ctx.arc(cx + R * 1.07 * Math.cos(ang), cy + R * 1.07 * Math.sin(ang), 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#9bffe8";
    ctx.fill();
  });

  paint(0, () => {
    const ring = ctx.createConicGradient(spin * 0.45, cx, cy);
    ring.addColorStop(0, "#3ec6d6");
    ring.addColorStop(0.33, "#e2b15a");
    ring.addColorStop(0.66, "#ff6d9a");
    ring.addColorStop(1, "#3ec6d6");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = ring;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  paint(3, () => {
    const head = spin * 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.92, head - 1.35, head);
    ctx.strokeStyle = "#ffb020";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + R * 0.92 * Math.cos(head), cy + R * 0.92 * Math.sin(head), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffe08a";
    ctx.fill();
  });

  paint(5, () => {
    const paths = [
      [
        [-0.62, 0.28],
        [-0.36, 0.16],
        [-0.12, 0.05],
      ],
      [
        [-0.58, 0.48],
        [-0.3, 0.28],
        [-0.08, 0.08],
      ],
    ];
    const hues = ["#5ddeaf", "#7af0ff"];
    paths.forEach((path, pathIndex) => {
      ctx.beginPath();
      path.forEach(([x, y], i) => {
        const wobble = Math.sin(spin * 1.4 + pathIndex + i) * R * 0.03;
        const px = cx + x * R + wobble;
        const py = cy + y * R;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = hues[pathIndex];
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = hues[pathIndex];
      for (const [x, y] of path) {
        const wobble = Math.sin(spin * 1.4 + pathIndex) * R * 0.03;
        ctx.beginPath();
        ctx.arc(cx + x * R + wobble, cy + y * R, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });

  paint(9, () => {
    const spread = R * (0.34 + 0.16 * Math.sin(spin * 0.8));
    const tilt = spin * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(tilt) * spread, cy - Math.sin(tilt) * spread);
    ctx.lineTo(cx + Math.cos(tilt) * spread, cy + Math.sin(tilt) * spread);
    ctx.strokeStyle = "#e86bff";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + side * Math.cos(tilt) * spread, cy + side * Math.sin(tilt) * spread, 5, 0, Math.PI * 2);
      ctx.fillStyle = side < 0 ? "#3ec6d6" : "#e86bff";
      ctx.fill();
    }
  });

  paint(8, () => {
    const reach = R * (1.02 + A[8] * 0.46);
    ctx.beginPath();
    ctx.moveTo(cx + R, cy);
    ctx.lineTo(cx + reach, cy);
    ctx.strokeStyle = "#6aa7ff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + reach, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#d6e6ff";
    ctx.fill();
  });

  paint(13, () => {
    const n = 5;
    const phi = (1 + Math.sqrt(5)) / 2;
    const gearHues = ["#e2b15a", "#ff6d9a", "#3ec6d6", "#b388ff", "#5ddeaf"];
    for (let i = 0; i < n; i++) {
      const ang = Math.PI * 0.22 + (i / (n - 1)) * Math.PI * 0.56 + spin * 0.12;
      const rad = (R * 0.1) / phi ** (i * 0.35);
      const orbit = R * (0.4 + 0.6 * A[13]);
      const x = cx + Math.cos(ang) * orbit;
      const y = cy + Math.sin(ang) * orbit;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(spin * (i % 2 === 0 ? 1.4 : -1.8));
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.strokeStyle = gearHues[i];
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-rad, 0);
      ctx.lineTo(rad, 0);
      ctx.moveTo(0, -rad);
      ctx.lineTo(0, rad);
      ctx.stroke();
      ctx.restore();
    }
  });

  if (A[11] > 0.02) {
    if (state.particles.length < 110) {
      while (state.particles.length < 110) state.particles.push(spawnParticle());
    }
    const step = dt * (0.55 + breadth * 1.1);
    const span = R * (0.28 + 0.4 * A[11]);
    ctx.save();
    ctx.globalAlpha = Math.min(1, A[11]);
    state.particles.forEach((p, n) => {
      stepParticle(p, step);
      const hue = (n * 47 + spin * 28) % 360;
      ctx.strokeStyle = `hsla(${hue}, 80%, 64%, 0.75)`;
      ctx.fillStyle = `hsl(${hue}, 85%, 68%)`;
      ctx.beginPath();
      p.trail.forEach(([x, y], i) => {
        const px = cx + x * span;
        const py = cy + y * span;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + p.x * span, cy + p.y * span, 2.1, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  paint(10, () => {
    const scale = R * (0.2 + 0.24 * A[10]);
    const shown = A[10];
    const last = Math.max(2, Math.floor(shown * (TRACE.length - 1)));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin * 0.18);
    ctx.beginPath();
    for (let i = 0; i <= last; i++) {
      const [x, y] = TRACE[i];
      const px = x * scale;
      const py = y * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = "#ffe1a8";
    ctx.lineWidth = 1.7;
    ctx.stroke();
    ctx.restore();
    const pen = armsAt(traceModel, 16, spin * 1.15);
    const tip = pen[pen.length - 1];
    const c = Math.cos(spin * 0.18);
    const s = Math.sin(spin * 0.18);
    const tx = tip.x * c - tip.y * s;
    const ty = tip.x * s + tip.y * c;
    ctx.beginPath();
    ctx.arc(cx + tx * scale, cy + ty * scale, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b4a";
    ctx.fill();
  });

  const fiber = spin * (1.05 + breadth * 0.7);
  const odd = Math.floor(fiber / (Math.PI * 2)) % 2 === 1;
  paint(2, () => {
    ctx.beginPath();
    ctx.arc(cx + R * Math.cos(-spin * 0.4), cy + R * Math.sin(-spin * 0.4), 5, 0, Math.PI * 2);
    ctx.fillStyle = "#e2b15a";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + R * Math.cos(fiber + 2.1), cy + R * Math.sin(fiber + 2.1), 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b4a";
    ctx.fill();
  });

  paint(0, () => {
    for (let k = 7; k >= 0; k--) {
      const a = fiber - k * 0.16;
      ctx.beginPath();
      ctx.arc(cx + R * Math.cos(a), cy + R * Math.sin(a), 4.8 - k * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = k === 0 ? "#fff4df" : `hsla(${28 + k * 18}, 90%, 64%, ${0.85 - k * 0.1})`;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, odd ? 3.4 : 5.5, 0, Math.PI * 2);
    ctx.fillStyle = odd ? "#ff6d9a" : "#e2b15a";
    ctx.fill();
    if (odd) {
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff6d9a";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  });

  ctx.restore();

  const vignette = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, Math.max(w, h) * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  if (songT > 0.2) {
    ctx.fillStyle = palette.brass;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, h - 2, w * Math.min(1, songT / SONG_SECONDS), 2);
    ctx.globalAlpha = 1;
  }
}
