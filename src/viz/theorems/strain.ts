import { palette } from "@/viz/palette";
import type { TheoremModule } from "@/viz/theorems/types";
import { arrow, ink, kicker } from "@/viz/theorems/drawkit";

export const strainTheorem: TheoremModule = {
  meta: {
    id: "strain",
    kicker: "Transport",
    title: "Strain alignment",
    formula: "ωᵢ ωⱼ Sᵢⱼ",
    body: "For a smooth unforced incompressible flow, the enstrophy source is the alignment of vorticity with the strain. A record of the vorticity magnitude alone drops that relationship. The arrow is vorticity. The long axis is extension, the short axis compression. The source is λ |ω|² cos²φ, positive when vorticity leans into the stretch. The S¹³ payload can store rotation, stretch, and a source locally. It does not, by itself, supply the estimate that would control the growth.",
    knob: {
      label: "Alignment",
      format: (v) => `${Math.round(v * 90)}°`,
    },
  },
  draw({ ctx, w, h, knob }) {
    const phi = knob * Math.PI * 0.5;
    const cx = w * 0.34;
    const cy = h * 0.52;
    const a = Math.min(w, h) * 0.22;
    const b = a * 0.42;
    kicker(ctx, "Strain axes", 28, 28);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = palette.guide;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    arrow(ctx, cx - a, cy, cx + a, cy, palette.brass);
    arrow(ctx, cx, cy + b, cx, cy - b, palette.guide);
    const len = a * 0.85;
    arrow(ctx, cx, cy, cx + len * Math.cos(phi), cy - len * Math.sin(phi), palette.ink);
    ink(ctx, "stretch", cx + a + 12, cy, 12, "left", palette.brass);
    ink(ctx, "ω", cx + len * Math.cos(phi) + 10, cy - len * Math.sin(phi), 13, "left");

    const source = Math.cos(phi) ** 2;
    const x = w * 0.66;
    kicker(ctx, "Enstrophy source", x, 28);
    const bar = Math.min(w * 0.24, 180);
    ctx.fillStyle = palette.guideSoft;
    ctx.fillRect(x, h * 0.42, bar, 14);
    ctx.fillStyle = palette.brass;
    ctx.fillRect(x, h * 0.42, bar * source, 14);
    ink(ctx, source.toFixed(2), x, h * 0.42 + 36, 28, "left", palette.brass);
    ink(ctx, "λ |ω|² cos²φ", x, h * 0.42 + 64, 14, "left", palette.muted);
    ink(ctx, phi < 0.4 ? "aligned with stretch" : phi > 1.2 ? "aligned with compression" : "partial alignment", x, h * 0.42 + 90, 14, "left", palette.ink);
  },
};
