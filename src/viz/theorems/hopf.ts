import { palette } from "@/viz/palette";
import { Q1, QI, QJ, fiberNorth, hopf, qexpPure, qfmt, qscale, rightAct, s2dir, type Pair } from "@/viz/quat";
import type { TheoremModule } from "@/viz/theorems/types";
import { fillDot, ink, kicker, strokeCircle } from "@/viz/theorems/drawkit";

const base: Pair = {
  q0: qscale(Q1, Math.SQRT1_2),
  q1: qscale(QJ, Math.SQRT1_2),
};

export const hopfTheorem: TheoremModule = {
  meta: {
    id: "hopf",
    kicker: "S⁷ → S⁴",
    title: "Hopf fiber",
    formula: "|X|² + z² = 1",
    body: "A normalized quaternionic pair Z = (q₀, q₁) is a point of S⁷. The Hopf projection X = 2 q₀ conj(q₁), z = |q₀|² − |q₁|² lands on S⁴. Right multiplication by a unit quaternion r leaves (X, z) fixed: the whole circle of r is one fiber. The picture turns that fiber by exp(iφ). The base point does not move. The derived S² direction, built so that right multiplication by exp(iφ) is invisible, does not move either.",
  },
  draw({ ctx, w, h, t }) {
    const turned = rightAct(base, qexpPure(qscale(QI, t * 0.7)));
    const proj = hopf(turned);
    const fiber = fiberNorth(turned);
    const dir = s2dir(fiber);
    const frozen = hopf(base);

    const cx = w * 0.34;
    const cy = h * 0.52;
    const R = Math.min(w, h) * 0.28;
    kicker(ctx, "Base S⁴ stays put", 28, 28);
    strokeCircle(ctx, cx, cy, R, palette.guide);
    const ang = Math.atan2(frozen.X[2], frozen.X[0]);
    fillDot(ctx, cx + R * Math.cos(ang), cy + R * Math.sin(ang), 6, palette.brass);
    ink(ctx, `z = ${proj.z.toFixed(3)}`, cx, cy + R + 28, 14, "center", palette.ink);
    ink(ctx, `|Δ base| = ${Math.hypot(proj.X[0] - frozen.X[0], proj.X[1] - frozen.X[1], proj.X[2] - frozen.X[2], proj.z - frozen.z).toExponential(1)}`, cx, cy + R + 50, 13, "center", palette.muted);

    const rx = w * 0.74;
    kicker(ctx, "Fiber coordinate", rx - 70, 28);
    strokeCircle(ctx, rx, cy, R * 0.72, palette.guide);
    const fa = Math.atan2(fiber[1], fiber[0]);
    fillDot(ctx, rx + R * 0.72 * Math.cos(fa), cy + R * 0.72 * Math.sin(fa), 6, palette.ink);
    ink(ctx, qfmt(fiber), rx, cy + R * 0.72 + 28, 13, "center", palette.muted);
    ink(ctx, `S²  ${qfmt(dir)}`, rx, cy + R * 0.72 + 50, 13, "center", palette.brass);
  },
};
