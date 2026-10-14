export const PHI = (1 + Math.sqrt(5)) / 2;

export type Gear = { r: number; x: number; teeth: number; sign: number };

export function gearChain(count: number, first: number): Gear[] {
  const n = Math.max(3, Math.min(9, count));
  const gears: Gear[] = [];
  let x = 0;
  let sign = 1;
  for (let i = 0; i < n; i++) {
    const r = first / PHI ** i;
    gears.push({
      r,
      x,
      teeth: Math.max(8, Math.round(r / 3.1)),
      sign,
    });
    const next = first / PHI ** (i + 1);
    x += r + next;
    sign *= -1;
  }
  return gears;
}
