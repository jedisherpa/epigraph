import { palette } from "@/viz/palette";
import { QI, QJ, qfmt, qinv, qmul, rotor, type Q } from "@/viz/quat";
import type { TheoremModule } from "@/viz/theorems/types";
import { ink, kicker } from "@/viz/theorems/drawkit";

export const relativeTheorem: TheoremModule = {
  meta: {
    id: "relative",
    kicker: "Worldsheet",
    title: "Relative field",
    formula: "r = s⁻¹ h",
    body: "Suppose a worldsheet carries a field and a reference seed in the same pulled-back SU(2) fiber. On an overlap both transform by the same transition g⁻¹. Their relative coordinate r = s⁻¹ h is unchanged: the transitions cancel. That cancellation needs both objects to have been supplied. It does not choose a global section of the Hopf bundle. With r in hand, the standard Wess–Zumino three-form can be integrated over a filling of r(Σ). Two fillings differ by a closed three-cycle, so an integral period makes the phase independent of the filling.",
  },
  draw({ ctx, w, h, t }) {
    const g = rotor(QJ, t * 0.5);
    const h0: Q = rotor(QI, 0.9);
    const s0: Q = rotor(QJ, 0.4);
    const r = qmul(qinv(s0), h0);
    const h1 = qmul(qinv(g), h0);
    const s1 = qmul(qinv(g), s0);
    const r1 = qmul(qinv(s1), h1);
    const err = Math.hypot(r1[0] - r[0], r1[1] - r[1], r1[2] - r[2], r1[3] - r[3]);

    kicker(ctx, "Chart A", 28, 32);
    ink(ctx, `h  ${qfmt(h0)}`, 28, 64, 15);
    ink(ctx, `s  ${qfmt(s0)}`, 28, 90, 15);
    kicker(ctx, "Same transition on the overlap", 28, h * 0.36);
    ink(ctx, `g  ${qfmt(g)}`, 28, h * 0.36 + 32, 15, "left", palette.brass);
    kicker(ctx, "Chart B", 28, h * 0.52);
    ink(ctx, `h′  ${qfmt(h1)}`, 28, h * 0.52 + 32, 15);
    ink(ctx, `s′  ${qfmt(s1)}`, 28, h * 0.52 + 58, 15);
    kicker(ctx, "Relative field", 28, h * 0.74);
    ink(ctx, qfmt(r), 28, h * 0.74 + 32, 18, "left", palette.brass);
    ink(ctx, `overlap error ${err.toExponential(1)}`, 28, h * 0.74 + 60, 14, "left", palette.muted);
  },
};
