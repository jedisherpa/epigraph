import { palette } from "@/viz/palette";
import type { TheoremModule } from "@/viz/theorems/types";
import { fillDot, ink, kicker, line } from "@/viz/theorems/drawkit";

function bit(n: number, i: number) {
  return (n >> i) & 1;
}

export const kernelTheorem: TheoremModule = {
  meta: {
    id: "kernel",
    kicker: "Compatibility",
    title: "Shared test",
    formula: "K(y − c) = 0",
    body: "Observations y = Mx + c over the field with two elements come from a common source exactly when they lie in the kernel of a left-kernel basis K. Here y₁ = x₁ + x₂, y₂ = x₂ + x₃, y₃ = x₁ + x₃, so the test is y₁ + y₂ + y₃ = 0. Passing the test leaves a one-bit fiber: two distinct sources, drawn as two paths. They share the compatibility calculation. Sharing it does not identify their histories. The switch flips y₃ and the test fails; both paths stay on the record as rejected alternatives.",
    knob: {
      label: "Flip y₃",
      format: (v) => (v > 0.5 ? "corrupt" : "exact"),
    },
  },
  draw({ ctx, w, h, t, knob }) {
    const free = Math.floor(t * 0.35) % 2;
    const corrupt = knob > 0.5;
    const sources = [0, 1].map((extra) => {
      const x1 = bit(free, 0);
      const x2 = extra;
      const x3 = x1 ^ x2;
      const y1 = x1 ^ x2;
      const y2 = x2 ^ x3;
      const y3 = (x1 ^ x3) ^ (corrupt ? 1 : 0);
      const ok = (y1 ^ y2 ^ y3) === 0;
      return { x: [x1, x2, x3], y: [y1, y2, y3], ok };
    });

    kicker(ctx, "Two sources, one test", 28, 28);
    sources.forEach((src, i) => {
      const y = h * (0.28 + i * 0.34);
      ink(ctx, `path ${i + 1}`, 28, y, 13, "left", palette.muted);
      src.x.forEach((b, k) => {
        const x = 110 + k * 46;
        fillDot(ctx, x, y, 14, b ? palette.brass : palette.guide);
        ink(ctx, String(b), x, y, 12, "center", b ? "#1a140e" : palette.ink);
      });
      line(ctx, 250, y, 310, y, palette.guide);
      ink(ctx, src.y.join(" "), 330, y, 16, "left", palette.ink);
      ink(ctx, src.ok ? "accepted" : "rejected", w - 36, y, 14, "right", src.ok ? palette.brass : palette.muted);
    });
    ink(ctx, corrupt ? "shared test fails for both paths" : "shared test passes; the paths stay distinct", 28, h - 36, 14, "left", palette.brass);
  },
};
