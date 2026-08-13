import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DAYS } from "@/lib/days";
import { useProgress } from "@/lib/storage";
import { FOCUS_MODES, useFocus } from "@/lib/extra";
import { StuckHelper } from "@/components/StuckHelper";
import { Bot, Github, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Mode · Learning OS" },
      {
        name: "description",
        content:
          "Focus Mode — single-mission deep work sessions with timers, checklists and AI review prompts.",
      },
      { property: "og:title", content: "Focus Mode · Learning OS" },
      {
        property: "og:description",
        content:
          "Focus Mode — single-mission deep work sessions with timers, checklists and AI review prompts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Focus,
});

function Focus() {
  const { progress, toggle } = useProgress();
  const [focus, setFocus] = useFocus();
  const day = useMemo(() => {
    for (const d of DAYS) if (!progress[`d${d.day}.build`]) return d;
    return DAYS[DAYS.length - 1];
  }, [progress]);

  const tasks = [
    { id: `d${day.day}.learn`, label: `Learn: ${day.learn.summary}` },
    { id: `d${day.day}.practice`, label: `Practice: ${day.practice.output}` },
    { id: `d${day.day}.build`, label: `Build: ${day.build.feature}` },
    { id: `d${day.day}.test`, label: `Test: self-check` },
    { id: `d${day.day}.github`, label: `Commit: ${day.github.commitMsg}` },
  ];
  const doneCount = tasks.filter((t) => progress[t.id]).length;
  const next = tasks.find((t) => !progress[t.id]);
  const currentMode = FOCUS_MODES[focus.mode];

  return (
    <div>
      <PageHeader
        eyebrow="Focus Mode"
        title={`Day ${day.day} · ${day.topic}`}
        description="One mission. No distractions. Pick a session and ship."
      />

      <div className="mb-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.keys(FOCUS_MODES) as (keyof typeof FOCUS_MODES)[]).map((k) => {
          const m = FOCUS_MODES[k];
          const active = focus.mode === k;
          return (
            <button
              key={k}
              onClick={() => setFocus({ enabled: true, mode: k })}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active ? "border-primary/40 bg-primary/10" : "border-border hover:bg-muted"
              }`}
            >
              <div className="text-xs font-semibold">{m.label}</div>
              <div className="text-[11px] text-muted-foreground">{m.mins} min</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-primary/30 bg-card p-6 shadow-glow">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Current task
                </div>
                <div className="text-lg font-semibold">
                  {next?.label ?? "All tasks complete — great work."}
                </div>
              </div>
            </div>
            <StuckHelper topic={day.topic} dayNum={day.day} />
          </div>
          <ol className="space-y-2">
            {tasks.map((t, i) => {
              const done = !!progress[t.id];
              return (
                <li
                  key={t.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    done ? "border-primary/30 bg-primary/5" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => toggle(t.id)}
                    className={`grid h-6 w-6 place-items-center rounded-full border ${
                      done ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </button>
                  <span className={done ? "text-muted-foreground line-through" : ""}>
                    {t.label}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-flow transition-all"
              style={{ width: `${(doneCount / tasks.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Zap className="h-3.5 w-3.5" /> Session
            </div>
            <div className="text-2xl font-semibold">{currentMode.label}</div>
            <div className="text-xs text-muted-foreground">
              {currentMode.mins} minutes — use the timer bottom-right.
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Bot className="h-3.5 w-3.5" /> AI helper
            </div>
            <div className="text-sm font-medium">{day.ai.tool}</div>
            <div className="mt-2 rounded-md border border-border bg-background/40 p-2 font-mono text-[11px]">
              {day.ai.prompt}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Github className="h-3.5 w-3.5" /> Commit reminder
            </div>
            <div className="font-mono text-xs">git commit -m "{day.github.commitMsg}"</div>
          </div>
          <Link
            to="/today"
            className="block rounded-xl border border-border bg-card p-3 text-center text-xs hover:bg-muted"
          >
            Exit Focus Mode →
          </Link>
        </div>
      </div>
    </div>
  );
}
