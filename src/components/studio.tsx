import { useMemo, useState } from "react";
import { Stage, type SceneId, type StageParams } from "@/components/stage";
import { gapPercent, fourier, sampleShape, type ShapeId } from "@/viz/epicycles";
import { PHI } from "@/viz/gears";
import { PRIMES } from "@/viz/primes";
import { THEOREMS, isTheorem, theoremById } from "@/viz/theorems";

const SCENES: Array<{ id: SceneId; title: string; kicker: string }> = [
  { id: "epicycles", title: "Epicycles", kicker: "Fourier" },
  { id: "field", title: "Spiral field", kicker: "Flow" },
  { id: "primes", title: "Prime rays", kicker: "Number" },
  { id: "gears", title: "Golden gears", kicker: "Ratio" },
];

const SHAPE_LABEL: Record<ShapeId, string> = {
  circle: "Circle",
  square: "Square",
  star: "Star",
  heart: "Heart",
  sigma: "Sigma",
};

const COPY: Record<"epicycles" | "field" | "primes" | "gears", { formula: string; body: string }> = {
  epicycles: {
    formula: "z(t) = Σ cₖ eⁱᵏᵗ",
    body: "A closed outline is one complex signal. Its discrete Fourier transform is a chain of circles: each coefficient cₖ is a radius and a starting angle, spinning at frequency k. One term is an ellipse. Corners force the amplitudes to fall only like 1/k², so a square never quite finishes. The clips that draw a knight, a summation sign, or an X are this reconstruction, with the pen at the last circle.",
  },
  field: {
    formula: "ṙ = −r³,  θ̇ = 1",
    body: "The field F(x, y) = (−y − x r², x − y r²) has a single fixed point at the origin. In polar form the equations separate: every particle turns at unit angular speed while its radius falls as r(t) = r₀ / √(1 + 2 r₀² t). The bound r(t) < 1/√(2t) holds from any start, and none of them arrives in finite time. Arrows are the field; streaks are the integrated paths.",
  },
  primes: {
    formula: "(r, θ) = (p, p)",
    body: "There is no reason a prime plotted at polar angle equal to its value should make a picture. A full turn is 2π ≈ 6.28, so a step of one radian nearly repeats every six integers and organizes the near view into spiral arms. Farther out, better rational approximations of 2π sort the dots into rays. A ray whose residue shares a factor with the modulus holds at most one prime — the dark gaps are arithmetic, not decoration.",
  },
  gears: {
    formula: "ω₂ / ω₁ = − r₁ / r₂",
    body: "Each pitch radius is the last one divided by φ, the golden ratio. External mesh without slip needs the centers a sum of radii apart, and then the next gear turns the opposite way by the inverse radius ratio. Each stage keeps about 1/φ of the motion, so a chain along the spiral dies out like a wave. Teeth here are a drawing of that ratio, not a CAD profile.",
  },
};

export function Studio({ onPlay }: { onPlay?: () => void }) {
  const [scene, setScene] = useState<SceneId>("hopf");
  const [shape, setShape] = useState<ShapeId>("sigma");
  const [harmonics, setHarmonics] = useState(12);
  const [speed, setSpeed] = useState(0.55);
  const [density, setDensity] = useState(0.55);
  const [horizon, setHorizon] = useState(0.22);
  const [gears, setGears] = useState(6);
  const [showGuides, setShowGuides] = useState(true);
  const [paused, setPaused] = useState(false);
  const [knob, setKnob] = useState(0.35);

  const params: StageParams = {
    scene,
    shape,
    harmonics,
    speed,
    density,
    horizon,
    gears,
    showGuides,
    paused,
    knob,
  };

  const gap = useMemo(() => {
    if (scene !== "epicycles") return null;
    return gapPercent(fourier(sampleShape(shape, 320)), harmonics);
  }, [scene, shape, harmonics]);

  const primeCap = Math.min(
    PRIMES.length,
    Math.max(2, Math.round(80 + horizon * (PRIMES.length - 80))),
  );
  const lastPrime = PRIMES[primeCap - 1];
  const theorem = isTheorem(scene) ? theoremById(scene) : null;
  const copy = theorem
    ? theorem.meta
    : COPY[scene as "epicycles" | "field" | "primes" | "gears"];

  return (
    <div className="studio">
      <header className="mast">
        <div>
          <p className="kicker">Relational geometry</p>
          <h1>Epigraph</h1>
          {onPlay ? (
            <button type="button" className="ghost" onClick={onPlay}>
              Play the record
            </button>
          ) : null}
        </div>
        <p className="lede">
          One live drawing for each construction in the draft: the Hopf record, its charts and holonomy, the S¹³ inverse, and the calculations that stay linked after a projection.
        </p>
      </header>

      <div className="layout">
        <nav className="rail" aria-label="Constructions">
          <p className="group">Theorems</p>
          {THEOREMS.map((item) => (
            <button
              key={item.meta.id}
              type="button"
              className={item.meta.id === scene ? "scene on" : "scene"}
              onClick={() => setScene(item.meta.id)}
            >
              <span>{item.meta.kicker}</span>
              {item.meta.title}
            </button>
          ))}
          <p className="group">Studio</p>
          {SCENES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === scene ? "scene on" : "scene"}
              onClick={() => setScene(item.id)}
            >
              <span>{item.kicker}</span>
              {item.title}
            </button>
          ))}
          <div className="controls">
            {scene === "epicycles" && (
              <>
                <fieldset>
                  <legend>Outline</legend>
                  <div className="pills">
                    {(Object.keys(SHAPE_LABEL) as ShapeId[]).map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={id === shape ? "pill on" : "pill"}
                        onClick={() => setShape(id)}
                      >
                        {SHAPE_LABEL[id]}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label>
                  Harmonics
                  <strong>{harmonics}</strong>
                  <input
                    type="range" suppressHydrationWarning
                    min={1}
                    max={48}
                    value={harmonics}
                    onChange={(e) => setHarmonics(Number(e.target.value))}
                  />
                </label>
              </>
            )}
            {scene === "field" && (
              <label>
                Particles
                <strong>{Math.round(40 + density * 160)}</strong>
                <input
                  type="range" suppressHydrationWarning
                  min={0}
                  max={1}
                  step={0.01}
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                />
              </label>
            )}
            {scene === "primes" && (
              <label>
                Horizon
                <strong>{lastPrime.toLocaleString()}</strong>
                <input
                  type="range" suppressHydrationWarning
                  min={0.02}
                  max={1}
                  step={0.01}
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                />
              </label>
            )}
            {scene === "gears" && (
              <label>
                Stages
                <strong>{gears}</strong>
                <input
                  type="range" suppressHydrationWarning
                  min={3}
                  max={8}
                  value={gears}
                  onChange={(e) => setGears(Number(e.target.value))}
                />
              </label>
            )}
            {theorem?.meta.knob && (
              <label>
                {theorem.meta.knob.label}
                <strong>{theorem.meta.knob.format(knob)}</strong>
                <input
                  type="range" suppressHydrationWarning
                  min={0}
                  max={1}
                  step={0.01}
                  value={knob}
                  onChange={(e) => setKnob(Number(e.target.value))}
                />
              </label>
            )}
            {scene !== "primes" && (
              <label>
                Speed
                <strong>{speed.toFixed(2)}</strong>
                <input
                  type="range" suppressHydrationWarning
                  min={0}
                  max={1}
                  step={0.01}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                />
              </label>
            )}
            <div className="row-actions">
              <button type="button" className="ghost" onClick={() => setShowGuides((v) => !v)}>
                {showGuides ? "Hide guides" : "Show guides"}
              </button>
              <button type="button" className="ghost" onClick={() => setPaused((v) => !v)}>
                {paused ? "Play" : "Pause"}
              </button>
            </div>
            {gap !== null && (
              <p className="stat">
                Widest gap to the outline
                <strong>{gap.toFixed(2)}%</strong>
                of its height
              </p>
            )}
            {scene === "gears" && (
              <p className="stat">
                Each stage keeps
                <strong>1/φ ≈ {(1 / PHI).toFixed(3)}</strong>
                of the turn
              </p>
            )}
          </div>
        </nav>

        <section className="board" aria-label="Drawing">
          <Stage params={params} />
        </section>
      </div>

      <footer className="note">
        <p className="formula">{copy.formula}</p>
        <div>
          <h2>How the frame is driven</h2>
          <p>{copy.body}</p>
          <p className="method">
            {theorem
              ? "The frame is the identity, evaluated. A projection, a mean, or a rotation is drawn next to the coordinate it drops, and the error shown is the one the theorem says must stay available."
              : "Public clips in this style match a programmatic pipeline — Manim, or a close cousin that samples an equation and renders frames. Nothing here is keyframed."}
          </p>
        </div>
      </footer>
    </div>
  );
}
