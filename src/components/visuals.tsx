import { useMemo } from "react";
import { DAYS, type Track } from "@/lib/days";
import { useProgress } from "@/lib/storage";

// ============ Radial gauge ============
export function RadialGauge({
  value,
  label,
  sub,
  size = 140,
  stroke = 12,
}: {
  value: number; // 0-100
  label: string;
  sub?: string;
  size?: number;
  stroke?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--muted)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#gaugeGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            fill="none"
            className="transition-[stroke-dasharray] duration-700 ease-out"
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold tracking-tight tabular-nums">{v}%</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        </div>
      </div>
      {sub && <div className="mt-3 text-center text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ============ Streak heatmap (84 cells like GitHub) ============
export function StreakHeatmap() {
  const { progress } = useProgress();
  const cells = DAYS.map((d) => {
    const keys = [
      `d${d.day}.learn`,
      `d${d.day}.practice`,
      `d${d.day}.build`,
      `d${d.day}.dsa`,
      `d${d.day}.test`,
    ];
    const c = keys.filter((k) => progress[k]).length;
    return { day: d.day, count: c, topic: d.topic };
  });
  const intensity = (c: number) =>
    c === 0
      ? "bg-muted/40"
      : c === 1
        ? "bg-primary/25"
        : c === 2
          ? "bg-primary/45"
          : c === 3
            ? "bg-primary/65"
            : "bg-primary/90";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">84-Day Streak Heatmap</h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>less</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`inline-block h-2.5 w-2.5 rounded-sm ${intensity(i)}`} />
          ))}
          <span>more</span>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 sm:grid-cols-[repeat(21,minmax(0,1fr))]">
        {cells.map((c) => (
          <div
            key={c.day}
            title={`Day ${c.day} · ${c.topic} · ${c.count}/5 tasks`}
            className={`aspect-square rounded-sm transition-transform hover:scale-125 ${intensity(c.count)}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============ Weekly completion bar chart ============
export function WeeklyChart() {
  const { progress } = useProgress();
  const weeks = useMemo(() => {
    const map: Record<number, { done: number; total: number }> = {};
    for (const d of DAYS) {
      const w = d.week;
      map[w] = map[w] ?? { done: 0, total: 0 };
      map[w].total += 5;
      ["learn", "practice", "build", "dsa", "test"].forEach((k) => {
        if (progress[`d${d.day}.${k}`]) map[w].done += 1;
      });
    }
    return Object.entries(map).map(([w, v]) => ({
      w: Number(w),
      pct: Math.round((v.done / v.total) * 100),
    }));
  }, [progress]);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold">Weekly Completion</h3>
      <div className="flex items-end gap-2 h-40">
        {weeks.map((w) => (
          <div
            key={w.w}
            className="flex flex-1 flex-col items-center gap-1.5"
            title={`Week ${w.w}: ${w.pct}%`}
          >
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-flow transition-[height] duration-700 ease-out"
                style={{ height: `${Math.max(4, w.pct)}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground">W{w.w}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Skill radar (6 domains) ============
const RADAR_TRACKS: { label: string; tracks: Track[] }[] = [
  { label: "Software", tracks: ["Software"] },
  { label: "Full-Stack", tracks: ["Full-Stack"] },
  { label: "Cloud", tracks: ["Cloud", "DevOps"] },
  { label: "Security", tracks: ["Security"] },
  { label: "AI/ML", tracks: ["AI/ML", "AI APIs"] },
  { label: "Automation", tracks: ["Automation", "Capstone"] },
];

export function SkillRadar() {
  const { progress } = useProgress();
  const scores = RADAR_TRACKS.map(({ label, tracks }) => {
    const ds = DAYS.filter((d) => tracks.includes(d.track));
    const done = ds.filter((d) => progress[`d${d.day}.build`]).length;
    return { label, pct: ds.length ? done / ds.length : 0 };
  });
  const cx = 130,
    cy = 130,
    R = 100;
  const n = scores.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number) => [
    cx + r * Math.cos(angle(i)),
    cy + r * Math.sin(angle(i)),
  ];
  const ringPath = (frac: number) =>
    scores
      .map((_, i) => point(i, R * frac))
      .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
      .join(" ") + " Z";
  const dataPath =
    scores
      .map((s, i) => point(i, R * s.pct))
      .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
      .join(" ") + " Z";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-2 text-sm font-semibold">Skill Radar</h3>
      <div className="flex items-center justify-center">
        <svg width={260} height={260} viewBox="0 0 260 260">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <path key={f} d={ringPath(f)} fill="none" stroke="var(--border)" strokeWidth={1} />
          ))}
          {scores.map((_, i) => {
            const [x, y] = point(i, R);
            return (
              <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} />
            );
          })}
          <path
            d={dataPath}
            fill="color-mix(in oklab, var(--primary) 25%, transparent)"
            stroke="var(--primary)"
            strokeWidth={2}
            className="transition-all duration-700"
          />
          {scores.map((s, i) => {
            const [x, y] = point(i, R + 16);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--muted-foreground)"
                className="text-[10px]"
              >
                {s.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============ Animated phase flow ============
const PHASES = [
  { key: "Software", weeks: [1, 2] },
  { key: "Full-Stack", weeks: [3, 4, 5] },
  { key: "Cloud", weeks: [6, 7] },
  { key: "DevOps", weeks: [8] },
  { key: "Security", weeks: [9] },
  { key: "AI/ML", weeks: [10] },
  { key: "AI APIs", weeks: [11] },
  { key: "Capstone", weeks: [12] },
];

export function PhaseFlow({ currentWeek }: { currentWeek: number }) {
  const { progress } = useProgress();
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold">Phase Flow</h3>
      <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
        {PHASES.map((p, i) => {
          const days = DAYS.filter((d) => p.weeks.includes(d.week));
          const done = days.filter((d) => progress[`d${d.day}.build`]).length;
          const pct = Math.round((done / days.length) * 100);
          const isActive = p.weeks.includes(currentWeek);
          const isDone = pct === 100;
          return (
            <div key={p.key} className="flex items-center gap-2">
              <div
                className={`min-w-[120px] rounded-xl border p-3 transition-all ${
                  isActive
                    ? "border-primary/50 bg-primary/10 shadow-glow animate-pulse"
                    : isDone
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-background/40"
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  W{p.weeks.join(",")}
                </div>
                <div className="mt-0.5 text-sm font-semibold">{p.key}</div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-flow transition-[width] duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{pct}%</div>
              </div>
              {i < PHASES.length - 1 && <div className="text-muted-foreground">→</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ Confetti helper ============
export async function fireConfetti() {
  const mod = await import("canvas-confetti");
  const confetti = mod.default;
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#6366f1", "#8b5cf6", "#ec4899", "#22d3ee", "#10b981"],
  });
}
