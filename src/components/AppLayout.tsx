import type { LucideIcon } from "lucide-react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  Target,
  Map,
  Workflow,
  BookOpen,
  Wrench,
  Sparkles,
  Trophy,
  ListChecks,
  Brain,
  Notebook,
  Rocket,
  Flame,
  Zap,
  Bug,
  RotateCw,
  Terminal,
  Crosshair,
  Briefcase,
  User,
  ShieldCheck,
  CheckSquare,
  CalendarCheck,
  Network,
  Route as RouteIcon,
  Database,
  Swords,
  GraduationCap,
} from "lucide-react";
import { useXP, levelFromXP, useProgress, useSettings } from "@/lib/storage";
import { DAYS } from "@/lib/days";
import { StudyTimer } from "@/components/StudyTimer";
import { DebugPanel } from "@/components/DebugPanel";

const NAV: { to: string; label: string; icon: LucideIcon; group: string }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, group: "Today" },
  { to: "/today", label: "Today's Mission", icon: Target, group: "Today" },
  { to: "/focus", label: "Focus Mode", icon: Zap, group: "Today" },
  { to: "/roadmap", label: "84-Day Roadmap", icon: Map, group: "Learn" },
  { to: "/flows", label: "Visual Flows", icon: Workflow, group: "Learn" },
  { to: "/resources", label: "Resource Hub", icon: BookOpen, group: "Learn" },
  { to: "/tools", label: "Tools Directory", icon: Wrench, group: "Learn" },
  { to: "/cheatsheets", label: "Cheat Sheets", icon: Terminal, group: "Learn" },
  { to: "/prompts", label: "AI Prompt Library", icon: Sparkles, group: "AI" },
  { to: "/explain", label: "Explain-Back", icon: Brain, group: "AI" },
  { to: "/assessments", label: "Mini Assessments", icon: GraduationCap, group: "AI" },
  { to: "/projects", label: "Projects Tracker", icon: ListChecks, group: "Build" },
  { to: "/architecture", label: "Architecture Builder", icon: Network, group: "Build" },
  { to: "/api-planner", label: "API Route Planner", icon: RouteIcon, group: "Build" },
  { to: "/schema-planner", label: "DB Schema Planner", icon: Database, group: "Build" },
  { to: "/challenges", label: "Build w/o Tutorial", icon: Swords, group: "Build" },
  { to: "/capstone", label: "Final Capstone", icon: Rocket, group: "Build" },
  { to: "/bugs", label: "Bug Journal", icon: Bug, group: "Build" },
  { to: "/revision", label: "Revision Queue", icon: RotateCw, group: "Build" },
  { to: "/safety", label: "Cost & Key Safety", icon: ShieldCheck, group: "Build" },
  { to: "/weekly", label: "Weekly Review", icon: CalendarCheck, group: "Career" },
  { to: "/readiness", label: "Job Readiness", icon: Trophy, group: "Career" },
  { to: "/skill-gap", label: "Skill Gap", icon: Crosshair, group: "Career" },
  { to: "/interview", label: "Interview Prep", icon: Brain, group: "Career" },
  { to: "/jobs", label: "Job Tracker", icon: Briefcase, group: "Career" },
  { to: "/branding", label: "Personal Branding", icon: User, group: "Career" },
  { to: "/checklist", label: "Job-Ready Checklist", icon: CheckSquare, group: "Career" },
  { to: "/notes", label: "Notes & Export", icon: Notebook, group: "Career" },
];

export function AppLayout({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [xp] = useXP();
  const { progress } = useProgress();
  const [settings, setSettings] = useSettings();
  const lvl = levelFromXP(xp.xp);
  const done = Object.values(progress).filter(Boolean).length;
  const totalTasks = DAYS.length * 5;
  const pct = Math.min(100, Math.round((done / totalTasks) * 100));

  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  return (
    <div className="dark min-h-dvh w-full bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <div className="pointer-events-none fixed inset-0 bg-aurora" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-25" aria-hidden="true" />
      <div className="relative flex min-h-dvh w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border surface">
          <Link
            to="/"
            aria-label="Learning OS home"
            className="flex items-center gap-2 px-5 py-5 border-b border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-flow shadow-glow">
              <Flame className="h-5 w-5 text-background" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Learning OS</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                AI · Cloud · Full-Stack
              </div>
            </div>
          </Link>

          <nav aria-label="Main navigation" className="flex-1 overflow-y-auto p-3 space-y-4">
            {groups.map((g) => (
              <div key={g} role="group" aria-labelledby={`nav-group-${g}`}>
                <div
                  id={`nav-group-${g}`}
                  className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  {g}
                </div>
                {NAV.filter((n) => n.group === g).map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="border-t border-border p-4 space-y-3">
            <div>
              <div
                id="mode-label"
                className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Mode
              </div>
              <div
                role="radiogroup"
                aria-labelledby="mode-label"
                className="grid grid-cols-2 gap-1 rounded-md border border-border bg-background/40 p-0.5"
              >
                {(["beginner", "normal"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={settings.mode === m}
                    onClick={() => setSettings((s) => ({ ...s, mode: m }))}
                    className={`rounded px-2 py-1 text-[11px] capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      settings.mode === m
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div
                id="pace-label"
                className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Pace
              </div>
              <div
                role="radiogroup"
                aria-labelledby="pace-label"
                className="grid grid-cols-3 gap-1 rounded-md border border-border bg-background/40 p-0.5"
              >
                {(["slow", "normal", "fast"] as const).map((p) => {
                  const hint = p === "slow" ? "1–2h/day" : p === "fast" ? "8–10h/day" : "3–4h/day";
                  return (
                    <button
                      key={p}
                      type="button"
                      role="radio"
                      aria-checked={settings.pace === p}
                      aria-label={`${p} pace, ${hint}`}
                      onClick={() => setSettings((s) => ({ ...s, pace: p }))}
                      className={`rounded px-1.5 py-1 text-[10px] capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        settings.pace === p
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={hint}
                    >
                      {p === "fast" ? "Fast" : p === "slow" ? "Slow" : "Normal"}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Level {lvl.level}</span>
                <span className="font-medium text-primary">{lvl.label}</span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Curriculum completion"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full bg-flow" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{xp.xp} XP</span>
                <span>{pct}% complete</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main id="main-content" className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="md:hidden sticky top-0 z-20 glass border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <Link
                to="/"
                aria-label="Learning OS home"
                className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Flame className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-semibold">Learning OS</span>
              </Link>
              <span className="text-xs text-muted-foreground">
                Level {lvl.level} · {xp.xp} XP
              </span>
            </div>
            <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto px-2 pb-2">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={pathname === n.to ? "page" : undefined}
                  className={`shrink-0 rounded-md px-3 py-1 text-xs border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    pathname === n.to
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
            {children ?? <Outlet />}
          </div>
          <DebugPanel />
        </main>
      </div>
    </div>
  );
}
