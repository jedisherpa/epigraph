import { palette } from "@/viz/palette";
import { Q1, decodePayload, encodePayload } from "@/viz/quat";
import type { TheoremModule } from "@/viz/theorems/types";
import { fillDot, ink, kicker, strokeCircle } from "@/viz/theorems/drawkit";

export const payloadTheorem: TheoremModule = {
  meta: {
    id: "payload",
    kicker: "S¹³",
    title: "Exact inverse",
    formula: "t = 1/√(3+M²)",
    body: "The reference encoding places a signed unit quaternion, five stretch coordinates, a source vector, and an attenuation on S¹³ by dividing by a scale t. Every encoded point has unit norm. Dividing the encoded blocks by t recovers the payload exactly, including a source of any finite size. Here q = 1, stretch is zero, α = 1, and the source is M e₁. Then t = 1/√(3+M²). The sphere point stays on the sphere while the decoded length grows without a coordinate singularity at zero stretch.",
    knob: {
      label: "Source M",
      format: (v) => (v * 8).toFixed(2),
    },
  },
  draw({ ctx, w, h, knob }) {
    const M = 0.15 + knob * 8;
    const encoded = encodePayload(Q1, [0, 0, 0, 0, 0], [M, 0, 0], 1);
    const decoded = decodePayload(encoded);
    const cx = w * 0.3;
    const cy = h * 0.52;
    const R = Math.min(w, h) * 0.28;
    kicker(ctx, "Encoded point on S¹³", 28, 28);
    strokeCircle(ctx, cx, cy, R, palette.guide);
    const ang = Math.atan2(encoded.V[0], encoded.t);
    fillDot(ctx, cx + R * Math.cos(ang), cy - R * Math.sin(ang), 6, palette.brass);
    ink(ctx, "unit norm", cx, cy + R + 26, 13, "center", palette.muted);

    const x = w * 0.62;
    kicker(ctx, "Decoded source", x, 28);
    ink(ctx, M.toFixed(2), x, h * 0.38, 56, "left", palette.brass);
    ink(ctx, "recovered |v|", x, h * 0.38 + 40, 13, "left", palette.muted);
    ink(ctx, `t = ${encoded.t.toFixed(4)}`, x, h * 0.38 + 68, 16, "left");
    ink(ctx, `inverse error ${Math.abs(decoded.v[0] - M).toExponential(1)}`, x, h * 0.38 + 96, 14, "left", palette.muted);
    const barW = Math.min(w * 0.28, 40 + M * 18);
    ctx.fillStyle = palette.brassFaint;
    ctx.fillRect(x, h * 0.72, barW, 10);
  },
};
