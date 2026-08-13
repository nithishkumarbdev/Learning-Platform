import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ROLES } from "@/lib/extra";
import { useProgress } from "@/lib/storage";
import { DAYS } from "@/lib/days";
import { Target } from "lucide-react";

export const Route = createFileRoute("/skill-gap")({
  head: () => ({
    meta: [
      { title: "Skill Gap Analyzer · Learning OS" },
      {
        name: "description",
        content:
          "Skill Gap Analyzer — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engin",
      },
      { property: "og:title", content: "Skill Gap Analyzer · Learning OS" },
      {
        property: "og:description",
        content:
          "Skill Gap Analyzer — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engin",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SkillGap,
});

function SkillGap() {
  const [role, setRole] = useState<keyof typeof ROLES>("fullstack");
  const { progress } = useProgress();
  const r = ROLES[role];

  const skills = useMemo(
    () =>
      r.skills.map((s) => {
        const total = s.days.length;
        const done = s.days.filter(
          (d) => progress[`d${d}.build`] || progress[`d${d}.learn`],
        ).length;
        return { ...s, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
      }),
    [r, progress],
  );

  const overall = Math.round(skills.reduce((a, s) => a + s.pct, 0) / skills.length);
  const missing = skills.filter((s) => s.pct < 70).slice(0, 3);
  const next7 = (() => {
    const current = DAYS.find((d) => !progress[`d${d.day}.build`]) ?? DAYS[DAYS.length - 1];
    return DAYS.slice(current.day - 1, current.day - 1 + 7);
  })();

  return (
    <div>
      <PageHeader
        eyebrow="What you've earned vs what the role wants"
        title="Skill Gap Analyzer"
        description="Pick a target role. See which skills are covered, missing, and what to revise next."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(ROLES) as (keyof typeof ROLES)[]).map((k) => (
          <button
            key={k}
            onClick={() => setRole(k)}
            className={`rounded-lg border px-3 py-1.5 text-xs ${role === k ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
          >
            {ROLES[k].label}
          </button>
        ))}
      </div>

      <div className="mb-5 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Target role
            </div>
            <div className="text-2xl font-semibold">{r.label}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Overall match
            </div>
            <div className="text-3xl font-bold text-primary">{overall}%</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-flow transition-all" style={{ width: `${overall}%` }} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Required skills
          </div>
          {skills.map((s) => (
            <div key={s.name} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{s.name}</span>
                <span
                  className={`text-xs ${s.pct >= 70 ? "text-primary" : s.pct >= 40 ? "text-warning" : "text-destructive"}`}
                >
                  {s.done}/{s.total} days · {s.pct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${s.pct >= 70 ? "bg-primary" : s.pct >= 40 ? "bg-warning" : "bg-destructive"}`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                Proof days: {s.days.join(", ")}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" /> Top gaps
            </div>
            {missing.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                You're already strong on every required skill.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {missing.map((s) => (
                  <li key={s.name} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-warning" />
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Revisit days: {s.days.join(", ")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 text-sm font-semibold">Recommended next 7 days</div>
            <ol className="space-y-1 text-sm">
              {next7.map((d) => (
                <li key={d.day} className="flex items-center justify-between">
                  <span>
                    Day {d.day} — {d.topic}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{d.track}</span>
                </li>
              ))}
            </ol>
            <Link to="/today" className="mt-3 inline-block text-xs text-primary hover:underline">
              Open today's mission →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
