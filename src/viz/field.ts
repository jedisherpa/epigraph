export type Particle = {
  x: number;
  y: number;
  trail: Array<[number, number]>;
};

/** F = (−y − x r², x − y r²). Polar: ṙ = −r³, θ̇ = 1. */
export function field(x: number, y: number): [number, number] {
  const r2 = x * x + y * y;
  return [-y - x * r2, x - y * r2];
}

export function spawnParticle(): Particle {
  const a = Math.random() * Math.PI * 2;
  const r = 0.35 + Math.random() * 1.55;
  return { x: r * Math.cos(a), y: r * Math.sin(a), trail: [] };
}

export function stepParticle(p: Particle, dt: number) {
  const [vx, vy] = field(p.x, p.y);
  p.x += vx * dt;
  p.y += vy * dt;
  p.trail.push([p.x, p.y]);
  if (p.trail.length > 28) p.trail.shift();
  const r2 = p.x * p.x + p.y * p.y;
  if (r2 < 0.004 || r2 > 6 || !Number.isFinite(p.x)) {
    const next = spawnParticle();
    p.x = next.x;
    p.y = next.y;
    p.trail = [];
  }
}
