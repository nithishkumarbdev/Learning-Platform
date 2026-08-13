import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useProgress } from "@/lib/storage";
import { PROJECTS } from "@/lib/projects";

export const Route = createFileRoute("/readiness")({
  head: () => ({
    meta: [
      { title: "Job Readiness · Learning OS" },
      {
        name: "description",
        content:
          "Track readiness across software, full-stack, cloud, security, AI, automation, portfolio.",
      },

      { property: "og:title", content: "Job Readiness · Learning OS" },
      {
        property: "og:description",
        content:
          "Track readiness across software, full-stack, cloud, security, AI, automation, portfolio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Readiness,
});

type Cat = { name: string; items: string[] };
const CATS: Cat[] = [
  { name: "Software", items: ["Python scripts", "Git/GitHub", "DSA basics", "APIs", "Debugging"] },
  { name: "Full-Stack", items: ["React", "Backend API", "Database", "Auth", "Dashboard"] },
  { name: "Cloud", items: ["EC2", "S3", "IAM", "CloudWatch", "Deployment"] },
  {
    name: "Cybersecurity",
    items: ["Validation", "JWT safety", "OWASP basics", "Rate limiting", "Logs"],
  },
  {
    name: "AI",
    items: ["ML basics", "AI APIs", "Prompt engineering", "Anomaly detection", "AI summaries"],
  },
  { name: "Automation", items: ["n8n/Make/Zapier", "Webhooks", "Alerts", "Reports"] },
  {
    name: "Portfolio",
    items: [
      "GitHub repos",
      "READMEs",
      "Screenshots",
      "Deployments",
      "Resume bullets",
      "Interview explanations",
    ],
  },
];

function Readiness() {
  const { progress, toggle } = useProgress();
  const overallPct = useMemo(() => {
    const total = CATS.reduce((a, c) => a + c.items.length, 0);
    const done = CATS.reduce(
      (a, c) => a + c.items.filter((i) => progress[`ready.${c.name}.${i}`]).length,
      0,
    );
    return Math.round((done / total) * 100);
  }, [progress]);

  const projectsDone = PROJECTS.filter((p) => progress[`proj.${p.id}`]).length;

  return (
    <div>
      <PageHeader
        eyebrow="Job Readiness"
        title={`You are ${overallPct}% job-ready`}
        description={`${projectsDone}/${PROJECTS.length} portfolio projects shipped. Tick each item only when you have evidence (commit, repo, screenshot, README).`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {CATS.map((c) => {
          const done = c.items.filter((i) => progress[`ready.${c.name}.${i}`]).length;
          const pct = Math.round((done / c.items.length) * 100);
          return (
            <div key={c.name} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold tracking-tight">{c.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {done}/{c.items.length} · {pct}%
                </span>
              </div>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-flow" style={{ width: `${pct}%` }} />
              </div>
              <ul className="space-y-1.5">
                {c.items.map((i) => {
                  const k = `ready.${c.name}.${i}`;
                  const v = !!progress[k];
                  return (
                    <li key={i}>
                      <button
                        onClick={() => toggle(k)}
                        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                          v
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <span>{i}</span>
                        <span className="text-[11px]">{v ? "Ready" : "Not yet"}</span>
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
