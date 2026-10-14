import { useEffect, useRef } from "react";
import {
  armsAt,
  fourier,
  sampleShape,
  type EpicycleModel,
  type ShapeId,
} from "@/viz/epicycles";
import { field, spawnParticle, stepParticle, type Particle } from "@/viz/field";
import { gearChain, PHI } from "@/viz/gears";
import { palette } from "@/viz/palette";
import { PRIMES } from "@/viz/primes";
import { drawTheorem, isTheorem } from "@/viz/theorems";
import type { TheoremId } from "@/viz/theorems/types";

export type SceneId = "epicycles" | "field" | "primes" | "gears" | TheoremId;

export type StageParams = {
  scene: SceneId;
  shape: ShapeId;
  harmonics: number;
  speed: number;
  density: number;
  horizon: number;
  gears: number;
  showGuides: boolean;
  paused: boolean;
  knob: number;
};

type Sim = {
  t: number;
  model: EpicycleModel | null;
  modelKey: string;
  particles: Particle[];
  density: number;
};

function fit(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const pw = Math.max(1, Math.floor(w * dpr));
  const ph = Math.max(1, Math.floor(h * dpr));
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function clear(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);
}

function drawEpicycles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sim: Sim,
  p: StageParams,
) {
  const key = p.shape;
  if (sim.modelKey !== key || !sim.model) {
    sim.model = fourier(sampleShape(p.shape, 320));
    sim.modelKey = key;
  }
  const model = sim.model;
  const scale = Math.min(w, h) * 0.34;
  const cx = w * 0.5;
  const cy = h * 0.5;
  const arms = armsAt(model, p.harmonics, sim.t);

  if (p.showGuides) {
    ctx.lineWidth = 1;
    for (const arm of arms) {
      if (arm.r * scale < 0.6) continue;
      ctx.beginPath();
      ctx.arc(cx + arm.px * scale, cy + arm.py * scale, arm.r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = palette.guide;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + arm.px * scale, cy + arm.py * scale);
      ctx.lineTo(cx + arm.x * scale, cy + arm.y * scale);
      ctx.strokeStyle = palette.brassSoft;
      ctx.stroke();
    }
  }

  ctx.beginPath();
  const steps = 420;
  for (let i = 0; i <= steps; i++) {
    const tt = (i / steps) * Math.PI * 2;
    const a = armsAt(model, p.harmonics, tt);
    const tip = a[a.length - 1];
    const x = cx + tip.x * scale;
    const y = cy + tip.y * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = palette.brass;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  const tip = arms[arms.length - 1];
  ctx.beginPath();
  ctx.arc(cx + tip.x * scale, cy + tip.y * scale, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = palette.ink;
  ctx.fill();
}

function drawField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sim: Sim,
  p: StageParams,
  dt: number,
) {
  const want = Math.round(40 + p.density * 160);
  if (sim.particles.length !== want || sim.density !== want) {
    sim.particles = Array.from({ length: want }, spawnParticle);
    sim.density = want;
  }
  const span = Math.min(w, h) * 0.42;
  const cx = w * 0.5;
  const cy = h * 0.5;
  const to = (x: number, y: number) => [cx + x * span, cy + y * span] as const;

  if (p.showGuides) {
    ctx.strokeStyle = palette.guideSoft;
    ctx.lineWidth = 1;
    const n = 11;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = -1.6 + (3.2 * i) / (n - 1);
        const y = -1.6 + (3.2 * j) / (n - 1);
        const [vx, vy] = field(x, y);
        const m = Math.hypot(vx, vy) || 1;
        const len = 10;
        const [sx, sy] = to(x, y);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (vx / m) * len, sy + (vy / m) * len);
        ctx.stroke();
      }
    }
  }

  if (!p.paused) {
    const step = dt * (0.35 + p.speed * 0.9);
    for (const particle of sim.particles) stepParticle(particle, step);
  }

  for (const particle of sim.particles) {
    ctx.beginPath();
    particle.trail.forEach(([x, y], i) => {
      const [sx, sy] = to(x, y);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.strokeStyle = palette.brassSoft;
    ctx.lineWidth = 1.25;
    ctx.stroke();
    const [sx, sy] = to(particle.x, particle.y);
    ctx.beginPath();
    ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = palette.brass;
    ctx.fill();
  }
}

function drawPrimes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: StageParams,
) {
  const maxP = Math.round(80 + p.horizon * (PRIMES.length - 80));
  const count = Math.max(2, Math.min(PRIMES.length, maxP));
  const last = PRIMES[count - 1];
  const span = Math.min(w, h) * 0.46;
  const cx = w * 0.5;
  const cy = h * 0.5;
  ctx.fillStyle = palette.brass;
  for (let i = 0; i < count; i++) {
    const prime = PRIMES[i];
    const r = (prime / last) * span;
    const x = cx + r * Math.cos(prime);
    const y = cy + r * Math.sin(prime);
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  if (p.showGuides) {
    ctx.strokeStyle = palette.guide;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, span, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawGears(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sim: Sim,
  p: StageParams,
) {
  const gears = gearChain(p.gears, Math.min(w, h) * 0.16);
  const total = gears[gears.length - 1].x + gears[gears.length - 1].r;
  const left = (w - total) / 2;
  const cy = h * 0.52;

  gears.forEach((g, i) => {
    const cx = left + g.x;
    const ang = sim.t * g.sign * (gears[0].r / g.r);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.arc(0, 0, g.r, 0, Math.PI * 2);
    ctx.fillStyle = "#12161c";
    ctx.fill();
    ctx.strokeStyle = palette.brass;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    for (let k = 0; k < g.teeth; k++) {
      const a = (k / g.teeth) * Math.PI * 2;
      const inner = g.r * 0.86;
      const outer = g.r * 1.08;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      ctx.strokeStyle = palette.brassSoft;
      ctx.lineWidth = Math.max(1.2, g.r * 0.08);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(3, g.r * 0.12), 0, Math.PI * 2);
    ctx.fillStyle = palette.brass;
    ctx.fill();
    ctx.restore();

    if (i === 0) return;
    ctx.fillStyle = palette.muted;
    ctx.font = "12px Outfit, sans-serif";
    ctx.textAlign = "center";
    const ratio = (gears[0].r / g.r).toFixed(2);
    ctx.fillText(`${ratio}×`, cx, cy + g.r + 22);
  });

  if (p.showGuides) {
    ctx.fillStyle = palette.muted;
    ctx.font = "13px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`φ ≈ ${PHI.toFixed(5)}`, 16, 28);
  }
}

export function Stage({ params }: { params: StageParams }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sim: Sim = {
      t: 0.4,
      model: null,
      modelKey: "",
      particles: [],
      density: -1,
    };
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = paramsRef.current;
      const { w, h } = fit(ctx, canvas);
      if (!p.paused && p.scene !== "field") sim.t += dt * (0.35 + p.speed * 1.4);
      clear(ctx, w, h);
      if (isTheorem(p.scene)) {
        drawTheorem(p.scene, {
          ctx,
          w,
          h,
          t: sim.t,
          guides: p.showGuides,
          knob: p.knob,
        });
      } else if (p.scene === "epicycles") drawEpicycles(ctx, w, h, sim, p);
      else if (p.scene === "field") drawField(ctx, w, h, sim, p, dt);
      else if (p.scene === "primes") drawPrimes(ctx, w, h, p);
      else drawGears(ctx, w, h, sim, p);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="stage-canvas" aria-label="Mathematical construction" />;
}
