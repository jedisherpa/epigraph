import { useEffect, useRef, useState } from "react";
import { fifthCaption } from "@/viz/fifth-lyrics";
import { captionAt } from "@/viz/lyrics";
import { drawRecord, PIECE_SECONDS, type PieceId, type RecordState } from "@/viz/record";

type AudioGraph = {
  context: AudioContext;
  analyser: AnalyserNode;
  freq: Uint8Array<ArrayBuffer>;
  time: Uint8Array<ArrayBuffer>;
};

export function Record({ onBrowse }: { onBrowse: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const stateRef = useRef<RecordState>({ particles: [], angle: 0 });
  const playingRef = useRef(false);
  const pulseRef = useRef(0);
  const graphRef = useRef<AudioGraph | null>(null);
  const captionRef = useRef("");
  const pieceRef = useRef<PieceId>("fifth");
  const [piece, setPiece] = useState<PieceId>("fifth");
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [caption, setCaption] = useState("");

  function ensureGraph(audio: HTMLAudioElement) {
    if (graphRef.current) return graphRef.current;
    const context = new AudioContext();
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.55;
    source.connect(analyser);
    analyser.connect(context.destination);
    const graph: AudioGraph = {
      context,
      analyser,
      freq: new Uint8Array(analyser.frequencyBinCount),
      time: new Uint8Array(analyser.fftSize),
    };
    graphRef.current = graph;
    return graph;
  }

  function level() {
    const graph = graphRef.current;
    if (!graph || !playingRef.current) return 0;
    graph.analyser.getByteFrequencyData(graph.freq);
    graph.analyser.getByteTimeDomainData(graph.time);
    let bass = 0;
    for (let i = 0; i < 12; i++) bass += graph.freq[i];
    bass /= 12 * 255;
    let sum = 0;
    for (let i = 0; i < graph.time.length; i++) {
      const v = (graph.time[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / graph.time.length);
    return Math.min(1, bass * 1.15 + rms * 2.4);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const audio = audioRef.current;
      const songT = playingRef.current && audio ? audio.currentTime : 0;
      const raw = level();
      const prev = pulseRef.current;
      pulseRef.current = raw > prev ? prev * 0.28 + raw * 0.72 : prev * 0.84 + raw * 0.16;
      const nextCaption = playingRef.current
        ? pieceRef.current === "fifth"
          ? fifthCaption(songT)
          : captionAt(songT)
        : "";
      if (nextCaption !== captionRef.current) {
        captionRef.current = nextCaption;
        setCaption(nextCaption);
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRecord(ctx, w, h, songT, dt, stateRef.current, pulseRef.current, pieceRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingRef.current) {
      audio.pause();
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    if (ended || audio.currentTime >= PIECE_SECONDS[pieceRef.current] - 0.05) {
      audio.currentTime = 0;
      stateRef.current.particles = [];
      setEnded(false);
    }
    const graph = ensureGraph(audio);
    void graph.context.resume();
    void audio.play();
    playingRef.current = true;
    setPlaying(true);
  }

  function choose(next: PieceId) {
    if (next === pieceRef.current) return;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = next === "fifth" ? "/fifth.mp3" : "/song.mp3";
      audio.load();
    }
    playingRef.current = false;
    pieceRef.current = next;
    stateRef.current.particles = [];
    stateRef.current.angle = 0;
    captionRef.current = "";
    setCaption("");
    setEnded(false);
    setPlaying(false);
    setPiece(next);
  }

  return (
    <div className="record">
      <canvas ref={canvasRef} className="record-canvas" aria-label="Continuous mathematical record" />
      <audio
        ref={audioRef}
        src="/fifth.mp3"
        preload="auto"
        onEnded={() => {
          playingRef.current = false;
          setPlaying(false);
          setEnded(true);
          captionRef.current = "";
          setCaption("");
        }}
      />
      <button type="button" className="record-browse" onClick={onBrowse}>
        Constructions
      </button>
      <div className="record-pieces">
        <button type="button" className={piece === "leverage" ? "on" : ""} onClick={() => choose("leverage")}>
          Leverage
        </button>
        <button type="button" className={piece === "fifth" ? "on" : ""} onClick={() => choose("fifth")}>
          Fifth
        </button>
      </div>
      {caption ? (
        <p className="record-caption" aria-live="polite">
          {caption}
        </p>
      ) : null}
      <button type="button" className={playing ? "record-play quiet" : "record-play"} onClick={toggle}>
        {ended ? "Replay" : playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}
