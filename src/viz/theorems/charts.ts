import { palette } from "@/viz/palette";
import { Q1, fiberNorth, fiberSouth, hopf, qmul, qnorm, qscale, type Pair, type Q } from "@/viz/quat";
import type { TheoremModule } from "@/viz/theorems/types";
import { fillDot, ink, kicker, line, strokeCircle } from "@/viz/theorems/drawkit";

function stateAt(z: number, h: Q): Pair {
  const a = Math.sqrt((1 + z) / 2);
  const X: Q = [0, 0, Math.sqrt(Math.max(0, 1 - z * z)), 0];
  const q1ref = qscale(X, 1 / (2 * a));
  return { q0: qscale(h, a), q1: qmul(q1ref, h) };
}

export const chartsTheorem: TheoremModule = {
  meta: {
    id: "charts",
    kicker: "Overlap",
    title: "Chart transition",
    formula: "hₛ = (X/|X|) hₙ",
    body: "The north chart z > −1 uses a = √((1+z)/2) and reads the fiber as q₀/a. The south chart z < 1 uses b = √((1−z)/2) and reads q₁/b. On the overlap both describe the same supplied state. The marker walks from the north chart through the overlap into the south. The transition error is the distance between the south fiber and (X/|X|) times the north fiber. A continuous global section of this Hopf bundle does not exist, so the transition stays in the record.",
  },
  draw({ ctx, w, h: height, t }) {
    const z = Math.sin(t * 0.45) * 0.85;
    const fiber: Q = Q1;
    const state = stateAt(z, fiber);
    const proj = hopf(state);
    const hn = fiberNorth(state);
    const hs = fiberSouth(state);
    const unit = qscale(proj.X, 1 / qnorm(proj.X));
    const predicted = qmul(unit, hn);
    const err = Math.hypot(predicted[0] - hs[0], predicted[1] - hs[1], predicted[2] - hs[2], predicted[3] - hs[3]);

    const left = 36;
    const top = 56;
    const width = w - 72;
    kicker(ctx, "Base height z", left, 28);
    line(ctx, left, top + 40, left + width, top + 40, palette.guide);
    line(ctx, left, top + 8, left, top + 72, palette.guideSoft);
    const x = left + ((z + 1) / 2) * width;
    fillDot(ctx, x, top + 40, 6, palette.brass);
    ink(ctx, "south only", left, top + 78, 12, "left", palette.muted);
    ink(ctx, "overlap", left + width / 2, top + 78, 12, "center", palette.muted);
    ink(ctx, "north only", left + width, top + 78, 12, "right", palette.muted);
    ink(ctx, `z = ${z.toFixed(3)}`, x, top + 18, 13, "center");

    const y = height * 0.62;
    kicker(ctx, "Fibers on the overlap", left, y);
    const showN = z > -0.98;
    const showS = z < 0.98;
    ink(ctx, showN ? `north  ${hn.map((v) => v.toFixed(2)).join("  ")}` : "north chart out of domain", left, y + 28, 14, "left", showN ? palette.ink : palette.muted);
    ink(ctx, showS ? `south  ${hs.map((v) => v.toFixed(2)).join("  ")}` : "south chart out of domain", left, y + 52, 14, "left", showS ? palette.ink : palette.muted);
    ink(ctx, `transition error  ${err.toExponential(1)}`, left, y + 86, 15, "left", palette.brass);
    strokeCircle(ctx, w - 70, height * 0.62 + 50, 28, palette.guide);
    fillDot(ctx, w - 70 + 20 * Math.cos(z * Math.PI), height * 0.62 + 50 + 20 * Math.sin(z * 2), 4, palette.brass);
  },
};
