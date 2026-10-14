import { palette } from "@/viz/palette";
import { QI, qfmt, rotor } from "@/viz/quat";
import type { TheoremModule } from "@/viz/theorems/types";
import { ink, kicker, line } from "@/viz/theorems/drawkit";

export const wilsonTheorem: TheoremModule = {
  meta: {
    id: "wilson",
    kicker: "SU(2)",
    title: "Wilson sign",
    formula: "½ Tr U = cos(θ/2)",
    body: "A rotor q = cos(θ/2) + i sin(θ/2) turns ordinary space by the angle θ. After one full turn, θ = 2π, every vector is back where it started and q = −1. After two turns, q = +1. The normalized Wilson value ½Tr U equals the real part of q. It is −1 for a single turn and +1 for two turns. A record that keeps only the three-dimensional rotation cannot tell those observables apart.",
  },
  draw({ ctx, w, h, t }) {
    const theta = (t * 0.7) % (Math.PI * 4);
    const q = rotor(QI, theta);
    const wilson = q[0];
    const cx = w * 0.32;
    const cy = h * 0.52;
    const s = Math.min(w, h) * 0.16;
    kicker(ctx, "Rotation of a card", 28, 28);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(theta);
    ctx.strokeStyle = palette.brass;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-s, -s * 0.72, s * 2, s * 1.44);
    line(ctx, -s, -s * 0.72, s, s * 0.72, palette.brassSoft, 1);
    ctx.restore();
    ink(ctx, `${((theta / (Math.PI * 2)) % 2).toFixed(2)} turns`, cx, cy + s + 36, 14, "center", palette.muted);

    kicker(ctx, "½ Tr", w * 0.62, 28);
    ink(ctx, wilson.toFixed(2), w * 0.78, h * 0.46, 64, "center", palette.brass);
    ink(ctx, qfmt(q), w * 0.78, h * 0.46 + 52, 16, "center", palette.ink);
    const sameCard = Math.abs(Math.sin(theta / 2)) < 0.08 && Math.cos(theta) > 0.92;
    ink(
      ctx,
      Math.abs(wilson + 1) < 0.05 ? "card looks restored, Wilson is −1" : sameCard ? "two turns, Wilson is +1" : "rotation and sign travel together",
      w * 0.78,
      h * 0.46 + 84,
      13,
      "center",
      palette.muted,
    );
  },
};
