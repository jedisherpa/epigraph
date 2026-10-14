import { chartsTheorem } from "@/viz/theorems/charts";
import { covarianceTheorem } from "@/viz/theorems/covariance";
import { holonomyTheorem } from "@/viz/theorems/holonomy";
import { hopfTheorem } from "@/viz/theorems/hopf";
import { kernelTheorem } from "@/viz/theorems/kernel";
import { payloadTheorem } from "@/viz/theorems/payload";
import { relativeTheorem } from "@/viz/theorems/relative";
import { strainTheorem } from "@/viz/theorems/strain";
import { turnTheorem } from "@/viz/theorems/turn";
import type { DrawArgs, TheoremId, TheoremModule } from "@/viz/theorems/types";
import { wilsonTheorem } from "@/viz/theorems/wilson";

export const THEOREMS: TheoremModule[] = [
  hopfTheorem,
  chartsTheorem,
  turnTheorem,
  holonomyTheorem,
  payloadTheorem,
  covarianceTheorem,
  kernelTheorem,
  wilsonTheorem,
  strainTheorem,
  relativeTheorem,
];

const byId = new Map(THEOREMS.map((item) => [item.meta.id, item]));

export function isTheorem(id: string): id is TheoremId {
  return byId.has(id as TheoremId);
}

export function theoremById(id: TheoremId): TheoremModule {
  const found = byId.get(id);
  if (!found) throw new Error(`missing theorem ${id}`);
  return found;
}

export function drawTheorem(id: TheoremId, args: DrawArgs) {
  theoremById(id).draw(args);
}
