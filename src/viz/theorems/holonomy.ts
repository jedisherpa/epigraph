import { palette } from "@/viz/palette";
import { fiberNorth, holonomyLift, hopf, qfmt, s2dir } from "@/viz/quat";
import type { TheoremModule } from "@/viz/theorems/types";
import { fillDot, ink, kicker, strokeCircle } from "@/viz/theorems/drawkit";

export const holonomyTheorem: TheoremModule = {
  meta: {
    id: "holonomy",
    kicker: "Signed loop",
    title: "Holonomy",
    formula: "endpoint = −Z(0)",
    body: "The base point (e^{−jθ}, 0) is a closed loop on S⁴. Its horizontal lift returns the local S² direction to where it started, and returns the base point, but the signed S³ transport ends at −1 after one turn. An isolated pure state may ignore that overall sign. A Wilson observable in the fundamental of SU(2) does not: ½Tr distinguishes I from −I, even though both act as the same three-dimensional rotation.",
  },
  draw({ ctx, w, h, t }) {
    const theta = (t * 0.65) % (Math.PI * 2);
    const state = holonomyLift(theta);
    const proj = hopf(state);
    const fiber = fiberNorth(state);
    const dir = s2dir(fiber);
    const turns = theta / (Math.PI * 2);
    const sign = fiber[0] >= 0 ? "+1" : "−1";

    const cx = w * 0.32;
    const cy = h * 0.52;
    const R = Math.min(w, h) * 0.26;
    kicker(ctx, "Base loop", 28, 28);
    strokeCircle(ctx, cx, cy, R, palette.guide);
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const th = (i / 80) * theta;
      const x = cx + R * Math.cos(-th);
      const y = cy + R * Math.sin(-th);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = palette.brass;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    fillDot(ctx, cx + R * Math.cos(-theta), cy + R * Math.sin(-theta), 5, palette.ink);
    ink(ctx, `z = ${proj.z.toFixed(3)}`, cx, cy + R + 28, 13, "center", palette.muted);

    kicker(ctx, "Signed transport", w * 0.62, 28);
    ink(ctx, sign, w * 0.78, h * 0.42, 64, "center", palette.brass);
    ink(ctx, `${turns.toFixed(2)} turns`, w * 0.78, h * 0.42 + 48, 14, "center", palette.muted);
    ink(ctx, `S²  ${qfmt(dir)}`, w * 0.78, h * 0.42 + 76, 14, "center", palette.ink);
    ink(ctx, "direction returned, sign did not", w * 0.78, h * 0.42 + 102, 13, "center", palette.muted);
  },
};
