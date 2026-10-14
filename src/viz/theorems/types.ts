export type DrawArgs = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number;
  guides: boolean;
  knob: number;
};

export type TheoremId =
  | "hopf"
  | "charts"
  | "turn"
  | "holonomy"
  | "payload"
  | "covariance"
  | "kernel"
  | "wilson"
  | "strain"
  | "relative";

export type TheoremMeta = {
  id: TheoremId;
  kicker: string;
  title: string;
  formula: string;
  body: string;
  knob?: { label: string; format: (v: number) => string };
};

export type TheoremModule = {
  meta: TheoremMeta;
  draw: (args: DrawArgs) => void;
};
