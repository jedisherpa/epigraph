import { palette } from "@/viz/palette";
import { Q1, QI, QJ, hopf, qexpPure, qscale, type Pair, type Q } from "@/viz/quat";
import type { TheoremModule } from "@/viz/theorems/types";
import { fillDot, ink, kicker, strokeCircle } from "@/viz/theorems/drawkit";

const start: Pair = {
  q0: qscale(Q1, Math.SQRT1_2),
  q1: qscale(QJ, Math.SQRT1_2),
};

function apply(r0: Q, r1: Q): Pair {
  return { q0: qmulSafe(start.q0, r0), q1: qmulSafe(start.q1, r1) };
}

function qmulSafe(a: Q, b: Q): Q {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

export const turnTheorem: TheoremModule = {
  meta: {
    id: "turn",
    kicker: "Coupled turn",
    title: "Common and relative",
    formula: "Z′ = (q₀ r₀, q₁ r₁)",
    body: "Turning the two quaternionic components by the same unit quaternion leaves the S⁴ base fixed. Turning them by different quaternions can move the base. A local S³ angle, by itself, does not say which of those happened. The left column is a common turn. The right column is a relative turn. Only the relative turn walks the base point.",
  },
  draw({ ctx, w, h, t }) {
    const common = qexpPure(qscale(QI, t * 0.8));
    const rel = qexpPure(qscale(QJ, t * 0.8));
    const left = hopf(apply(common, common));
    const right = hopf(apply(Q1, rel));
    const frozen = hopf(start);
    drawBase(ctx, w * 0.27, h * 0.54, Math.min(w, h) * 0.2, "Common turn", left, frozen, true);
    drawBase(ctx, w * 0.73, h * 0.54, Math.min(w, h) * 0.2, "Relative turn", right, frozen, false);
  },
};

function drawBase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  title: string,
  now: { X: Q; z: number },
  frozen: { X: Q; z: number },
  still: boolean,
) {
  kicker(ctx, title, cx - R, cy - R - 28);
  strokeCircle(ctx, cx, cy, R, palette.guide);
  const place = (X: Q) => {
    const ang = Math.atan2(X[2], X[1] || X[0]);
    const rad = Math.min(1, Math.hypot(X[1], X[2])) * R;
    return [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)] as const;
  };
  const a = place(frozen.X);
  const b = place(now.X);
  fillDot(ctx, a[0], a[1], 4, palette.guide);
  fillDot(ctx, b[0], b[1], 6, still ? palette.brass : palette.ink);
  ink(ctx, `z ${now.z.toFixed(2)}`, cx, cy + R + 26, 13, "center", palette.muted);
  ink(ctx, still ? "base fixed" : "base moved", cx, cy + R + 46, 13, "center", palette.brass);
}
