import type { LucideIcon } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Sparkles,
  Target,
  Rocket,
  ShieldCheck,
  Cloud,
  Code2,
  Bot,
  Workflow,
  Github,
  TrendingUp,
  Flame,
  Zap,
} from "lucide-react";
import { DAYS, WEEK_THEMES, TRACK_COLOR } from "@/lib/days";
import { useProgress, useXP, levelFromXP, useSettings } from "@/lib/storage";
import {
  RadialGauge,
  StreakHeatmap,
  WeeklyChart,
  SkillRadar,
  PhaseFlow,
} from "@/components/visuals";
import { NextBestAction } from "@/components/NextBestAction";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AI Cloud Full-Stack Learning OS" },
      {
        name: "description",
        content:
          "Your personal AI-guided dashboard for the 84-day path to AI Cloud Full-Stack Engineer.",
      },

      { property: "og:title", content: "Dashboard · AI Cloud Full-Stack Learning OS" },
      {
        property: "og:description",
        content:
          "Your personal AI-guided dashboard for the 84-day path to AI Cloud Full-Stack Engineer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function TrackBar({
  label,
  done,
  total,
  Icon,
  tone,
}: {
  label: string;
  done: number;
  total: number;
  Icon: LucideIcon;
  tone: string;
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={`grid h-7 w-7 place-items-center rounded-md border ${tone}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          {label}
        </div>
        <span className="text-xs text-muted-foreground">
          {done}/{total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${tone.split(" ").find((c) => c.startsWith("bg-")) ?? "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Dashboard() {
  const { progress } = useProgress();
  const [xp] = useXP();
  const [settings] = useSettings();
  const lvl = levelFromXP(xp.xp);

  // current day = first day whose Build task isn't done
  const currentDay = useMemo(() => {
    for (const d of DAYS) {
      if (!progress[`d${d.day}.build`]) return d;
    }
    return DAYS[DAYS.length - 1];
  }, [progress]);

  const trackStats = useMemo(() => {
    const buckets: Record<string, { done: number; total: number }> = {};
    for (const d of DAYS) {
      const key = d.track;
      buckets[key] = buckets[key] ?? { done: 0, total: 0 };
      buckets[key].total += 1;
      if (progress[`d${d.day}.build`]) buckets[key].done += 1;
    }
    return buckets;
  }, [progress]);

  const totalDone = Object.values(progress).filter(Boolean).length;
  const projectsDone = DAYS.filter(
    (d) => /Finish/.test(d.topic) && progress[`d${d.day}.build`],
  ).length;
  const overallPct = Math.round(
    (DAYS.filter((d) => progress[`d${d.day}.build`]).length / DAYS.length) * 100,
  );

  const jobReadiness = Math.min(
    100,
    Math.round(overallPct * 0.6 + projectsDone * 4 + Math.min(20, xp.streak * 2)),
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border surface p-6 md:p-10">
        <div
          className="absolute inset-0 -z-0 opacity-70"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="pointer-events-none absolute inset-0 sheen" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 hairline-top"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> AI Cloud Full-Stack Engineer Path
          </div>
          <h1 className="max-w-3xl text-3xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            <span className="text-gradient">
              Build software. Make it full-stack. Deploy it. Secure it.
            </span>{" "}
            <span className="bg-flow bg-clip-text text-transparent">Add AI. Automate it.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            An 84-day, AI-guided learning OS that turns scattered tutorials into a sequenced,
            job-focused engineer path — with daily missions, projects, copyable prompts and a
            GitHub-ready portfolio.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/today"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-glow"
            >
              <Target className="h-4 w-4" /> What should I do today?
            </Link>
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Workflow className="h-4 w-4" /> See 84-Day Roadmap
            </Link>
            <Link
              to="/capstone"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Rocket className="h-4 w-4" /> Final Capstone
            </Link>
          </div>

          {/* Flow */}
          <div className="mt-8 hidden md:flex items-center gap-2 overflow-x-auto text-xs">
            {(
              [
                { label: "Software", Icon: Code2 },
                { label: "Full-Stack", Icon: Code2 },
                { label: "Cloud", Icon: Cloud },
                { label: "DevOps", Icon: Workflow },
                { label: "Security", Icon: ShieldCheck },
                { label: "AI/ML", Icon: Bot },
                { label: "AI APIs", Icon: Bot },
                { label: "Automation", Icon: Zap },
                { label: "Capstone", Icon: Rocket },
                { label: "Portfolio", Icon: Github },
                { label: "Job Ready", Icon: TrendingUp },
              ] satisfies { label: string; Icon: LucideIcon }[]
            ).map(({ label, Icon }, i, arr) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{label}</span>
                </div>
                {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today snapshot */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Today
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Day {currentDay.day} · Week {currentDay.week}
              </h2>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] ${TRACK_COLOR[currentDay.track]}`}
            >
              {currentDay.track}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Topic
              </div>
              <div className="mt-1 font-medium">{currentDay.topic}</div>
              <div className="mt-2 text-xs text-muted-foreground">{currentDay.goal}</div>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Project
              </div>
              <div className="mt-1 font-medium">{currentDay.build.project}</div>
              <div className="mt-2 text-xs text-muted-foreground">{currentDay.build.feature}</div>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                AI Tool Today
              </div>
              <div className="mt-1 font-medium flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> {currentDay.ai.tool}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{currentDay.ai.why}</div>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Main Task
              </div>
              <div className="mt-1 font-medium">
                Ship one commit toward {currentDay.build.project}
              </div>
              <Link to="/today" className="mt-2 inline-flex text-xs text-primary hover:underline">
                Open today's mission →
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Stat label="Level" value={`L${lvl.level} ${lvl.label}`} sub={`${xp.xp} XP earned`} />
          <Stat
            label="Study streak"
            value={`${xp.streak} d`}
            sub={`Mode: ${settings.mode} · Pace: ${settings.pace}`}
          />
          <Stat
            label="Overall"
            value={`${overallPct}%`}
            sub={`${totalDone} tasks done across 84 days`}
          />
        </div>
      </div>

      {/* Track progress */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Track progress</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(trackStats).map(([t, s]) => (
            <TrackBar
              key={t}
              label={t}
              done={s.done}
              total={s.total}
              Icon={
                t === "Cloud" || t === "DevOps"
                  ? Cloud
                  : t === "Security"
                    ? ShieldCheck
                    : t.startsWith("AI") || t === "Automation"
                      ? Bot
                      : t === "Capstone"
                        ? Rocket
                        : Code2
              }
              tone={TRACK_COLOR[t as keyof typeof TRACK_COLOR]}
            />
          ))}
        </div>
      </div>

      {/* Phase flow */}
      <PhaseFlow currentWeek={currentDay.week} />

      {/* Readiness gauges */}
      <div className="grid gap-4 md:grid-cols-3">
        <RadialGauge
          value={jobReadiness}
          label="Job Ready"
          sub={`Goal: ship 9 projects + interview-ready bullets`}
        />
        <RadialGauge
          value={Math.min(100, projectsDone * 11)}
          label="Portfolio"
          sub={`${projectsDone}/9 milestones complete`}
        />
        <RadialGauge value={overallPct} label="Capstone Path" sub={`Day ${currentDay.day} of 84`} />
      </div>

      {/* Next best action */}
      <NextBestAction />

      {/* Heatmap + Radar */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StreakHeatmap />
        </div>
        <SkillRadar />
      </div>

      {/* Weekly chart */}
      <WeeklyChart />

      {/* Week pulse */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">This week</h2>
          <Flame className="h-4 w-4 text-primary" />
        </div>
        <div className="text-sm font-medium">
          Week {currentDay.week}: {WEEK_THEMES[currentDay.week]?.title}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Active project: {WEEK_THEMES[currentDay.week]?.project}
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {DAYS.filter((d) => d.week === currentDay.week).map((d) => {
            const done = progress[`d${d.day}.build`];
            return (
              <Link
                key={d.day}
                to="/roadmap"
                className={`rounded-lg border p-3 text-center text-xs transition-all hover:-translate-y-0.5 ${
                  done
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : d.day === currentDay.day
                      ? "border-accent/40 bg-accent/10 shadow-glow"
                      : "border-border bg-background/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="font-semibold">D{d.day}</div>
                <div className="mt-1 truncate">{d.topic.split(" ").slice(0, 2).join(" ")}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
