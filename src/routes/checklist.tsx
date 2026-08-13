import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useFinalChecklist } from "@/lib/extra";
import { CheckCircle2, Trophy } from "lucide-react";

const GROUPS = [
  {
    title: "Portfolio",
    items: [
      "5+ GitHub projects",
      "3 clean READMEs with screenshots",
      "1 deployed full-stack app (live URL)",
      "1 AWS deployment with proof (screenshot/diagram)",
      "1 AI API project",
      "1 final capstone shipped",
      "1 security hardening report",
    ],
  },
  {
    title: "Career assets",
    items: [
      "Resume bullets ready for 3 roles",
      "LinkedIn profile updated",
      "Portfolio site updated",
      "Interview explanations rehearsed (STAR)",
      "GitHub profile README polished",
    ],
  },
  {
    title: "Engineering fundamentals",
    items: [
      "DSA basics practiced (30+ easy problems)",
      "Cloud cost safety understood",
      "API key safety understood",
      "AI coding safety understood (don't ship code you can't explain)",
      "OWASP Top 10 mapped to your own API",
      "Can write a Dockerfile from memory",
      "Can deploy to AWS without notes",
    ],
  },
];

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Final Job-Ready Checklist · Learning OS" },
      {
        name: "description",
        content:
          "Final Job-Ready Checklist — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Clou",
      },
      { property: "og:title", content: "Final Job-Ready Checklist · Learning OS" },
      {
        property: "og:description",
        content:
          "Final Job-Ready Checklist — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Clou",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checklist,
});

function Checklist() {
  const [state, setState] = useFinalChecklist();
  const all = GROUPS.flatMap((g) => g.items.map((it) => `${g.title}::${it}`));
  const done = all.filter((k) => state[k]).length;
  const pct = Math.round((done / all.length) * 100);
  const tier =
    pct >= 90
      ? { label: "Job Ready", color: "text-primary" }
      : pct >= 65
        ? { label: "Project Ready", color: "text-accent" }
        : pct >= 35
          ? { label: "Builder", color: "text-warning" }
          : { label: "Beginner", color: "text-muted-foreground" };

  return (
    <div>
      <PageHeader
        eyebrow="The finish line"
        title="Final Job-Ready Checklist"
        description="Cross these off and you're ready to apply with conviction."
      />

      <div className="mb-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Status</div>
            <div className={`text-3xl font-bold ${tier.color}`}>{tier.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {done}/{all.length} criteria complete
            </div>
          </div>
          <Trophy className={`h-12 w-12 ${tier.color}`} />
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-flow transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Beginner</span>
          <span>Builder</span>
          <span>Project Ready</span>
          <span>Job Ready</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {GROUPS.map((g) => {
          const c = g.items.filter((it) => state[`${g.title}::${it}`]).length;
          return (
            <div key={g.title} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">{g.title}</div>
                <div className="text-xs text-muted-foreground">
                  {c}/{g.items.length}
                </div>
              </div>
              <ul className="space-y-1.5">
                {g.items.map((it) => {
                  const k = `${g.title}::${it}`;
                  const ok = !!state[k];
                  return (
                    <li key={it}>
                      <button
                        onClick={() => setState((s) => ({ ...s, [k]: !s[k] }))}
                        className="flex w-full items-start gap-2 text-left text-sm"
                      >
                        <CheckCircle2
                          className={`mt-0.5 h-4 w-4 shrink-0 ${ok ? "text-primary" : "text-muted-foreground/50"}`}
                        />
                        <span className={ok ? "text-muted-foreground line-through" : ""}>{it}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
