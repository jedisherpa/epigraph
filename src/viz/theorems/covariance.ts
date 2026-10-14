import { palette } from "@/viz/palette";
import { Q1, encodePayload } from "@/viz/quat";
import type { TheoremModule } from "@/viz/theorems/types";
import { fillDot, ink, kicker, line, strokeCircle } from "@/viz/theorems/drawkit";

export const covarianceTheorem: TheoremModule = {
  meta: {
    id: "covariance",
    kicker: "Second moment",
    title: "Hidden covariance",
    formula: "C = M² e₁ e₁ᵀ",
    body: "Take q = 1, zero stretch, α = 1, and let the source be +M e₁ or −M e₁ with equal probability. The mean readout is zero. The covariance is M² along e₁, which can be arbitrarily large. Both encoded points still lie on the unit sphere, with the same small scale t = 1/√(3+M²). Normalization does not bound the physical spread. A later estimate has to decode the amplitude, or prove a weighted bound. The mean alone drops the covariance term.",
    knob: {
      label: "Spread M",
      format: (v) => (0.4 + v * 6).toFixed(2),
    },
  },
  draw({ ctx, w, h, knob }) {
    const M = 0.4 + knob * 6;
    const plus = encodePayload(Q1, [0, 0, 0, 0, 0], [M, 0, 0], 1);
    const minus = encodePayload(Q1, [0, 0, 0, 0, 0], [-M, 0, 0], 1);
    const cx = w * 0.3;
    const cy = h * 0.5;
    const R = Math.min(w, h) * 0.24;
    kicker(ctx, "Both sit on the sphere", 28, 28);
    strokeCircle(ctx, cx, cy, R, palette.guide);
    const place = (v: number, t: number) => {
      const ang = Math.atan2(v, t);
      return [cx + R * Math.cos(ang), cy - R * Math.sin(ang)] as const;
    };
    const a = place(plus.V[0], plus.t);
    const b = place(minus.V[0], minus.t);
    fillDot(ctx, a[0], a[1], 6, palette.brass);
    fillDot(ctx, b[0], b[1], 6, palette.ink);
    ink(ctx, `t = ${plus.t.toFixed(3)}`, cx, cy + R + 28, 13, "center", palette.muted);

    const x0 = w * 0.58;
    const y = h * 0.55;
    const span = Math.min(w * 0.32, 80 + M * 16);
    kicker(ctx, "Decoded readouts", x0, 28);
    line(ctx, x0, y, x0 + span, y, palette.guide);
    fillDot(ctx, x0, y, 5, palette.ink);
    fillDot(ctx, x0 + span, y, 5, palette.brass);
    fillDot(ctx, x0 + span / 2, y, 4, palette.muted);
    ink(ctx, `−${M.toFixed(1)}`, x0, y + 24, 13, "left", palette.muted);
    ink(ctx, "mean 0", x0 + span / 2, y + 24, 13, "center", palette.ink);
    ink(ctx, `+${M.toFixed(1)}`, x0 + span, y + 24, 13, "right", palette.muted);
    ink(ctx, `covariance  ${M.toFixed(2)}²`, x0, y + 58, 16, "left", palette.brass);
  },
};
