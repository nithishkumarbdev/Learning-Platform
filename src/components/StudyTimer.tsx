import { useEffect, useMemo, useRef, useState } from "react";
import { Timer, Play, Pause, X, RotateCcw } from "lucide-react";
import { useTimerSessions, type TimerSession } from "@/lib/extra";
import { useXP } from "@/lib/storage";

const PRESETS: { label: TimerSession["kind"]; mins: number; sub: string }[] = [
  { label: "Pomodoro", mins: 25, sub: "25/5" },
  { label: "Deep Work", mins: 50, sub: "50/10" },
  { label: "Build", mins: 90, sub: "90/15" },
  { label: "DSA", mins: 45, sub: "45 min" },
  { label: "AI Review", mins: 30, sub: "30 min" },
  { label: "Review", mins: 25, sub: "25 min" },
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export function StudyTimer() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [secsLeft, setSecsLeft] = useState(25 * 60);
  const [preset, setPreset] = useState(PRESETS[0]);
  const startRef = useRef<number>(0);
  const [sessions, setSessions] = useTimerSessions();
  const [, setXP] = useXP();

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          // session complete
          setRunning(false);
          const dur = preset.mins * 60;
          setSessions((arr) => [
            ...arr,
            {
              id: `t_${Date.now()}`,
              kind: preset.label,
              startedAt: startRef.current,
              durationSec: dur,
              completed: true,
            },
          ]);
          setXP((x) => ({ ...x, xp: x.xp + 15 }));
          try {
            new Audio(
              "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
            ).play();
          } catch {
            // audio playback blocked by the browser – the visual cue is enough
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, preset, setSessions, setXP]);

  function start(p: typeof preset) {
    setPreset(p);
    setSecsLeft(p.mins * 60);
    startRef.current = Date.now();
    setRunning(true);
  }

  const totals = useMemo(() => {
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    const week0 = new Date(today0);
    week0.setDate(week0.getDate() - week0.getDay());
    const todaySec = sessions
      .filter((s) => s.startedAt >= today0.getTime())
      .reduce((a, s) => a + s.durationSec, 0);
    const weekSec = sessions
      .filter((s) => s.startedAt >= week0.getTime())
      .reduce((a, s) => a + s.durationSec, 0);
    return { todayMin: Math.round(todaySec / 60), weekMin: Math.round(weekSec / 60) };
  }, [sessions]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-primary/30 bg-card/95 px-4 py-2.5 text-sm shadow-glow backdrop-blur transition-transform hover:scale-105"
      >
        <Timer className="h-4 w-4 text-primary" />
        {running ? fmt(secsLeft) : "Timer"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[320px] rounded-2xl border border-border bg-card p-4 shadow-glow animate-scale-in">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Study Timer</div>
            <button
              aria-label="Close study timer"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => start(p)}
                className={`rounded-md border px-2 py-1.5 text-[11px] transition-colors ${
                  preset.label === p.label
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="font-medium">{p.label}</div>
                <div className="text-[10px] text-muted-foreground">{p.sub}</div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4 text-center">
            <div className="text-4xl font-mono tabular-nums">{fmt(secsLeft)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{preset.label}</div>
            <div className="mt-3 flex justify-center gap-2">
              {!running ? (
                <button
                  onClick={() => start(preset)}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90"
                >
                  <Play className="h-3.5 w-3.5" /> Start
                </button>
              ) : (
                <button
                  onClick={() => setRunning(false)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  <Pause className="h-3.5 w-3.5" /> Pause
                </button>
              )}
              <button
                onClick={() => {
                  setRunning(false);
                  setSecsLeft(preset.mins * 60);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md border border-border bg-background/30 p-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Today
              </div>
              <div className="text-sm font-semibold">{totals.todayMin}m</div>
            </div>
            <div className="rounded-md border border-border bg-background/30 p-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                This week
              </div>
              <div className="text-sm font-semibold">{totals.weekMin}m</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
