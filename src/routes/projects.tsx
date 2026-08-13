import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PROJECTS } from "@/lib/projects";
import { useProgress } from "@/lib/storage";
import { Copy, Github, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects Tracker · Learning OS" },
      {
        name: "description",
        content:
          "Track each portfolio project: features, AI tools, automation, GitHub link, README and resume bullet.",
      },

      { property: "og:title", content: "Projects Tracker · Learning OS" },
      {
        property: "og:description",
        content:
          "Track each portfolio project: features, AI tools, automation, GitHub link, README and resume bullet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Projects,
});

function Projects() {
  const { progress, toggle } = useProgress();
  const [repos, setRepos] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("los_repos") ?? "{}");
    } catch {
      return {};
    }
  });
  const save = (id: string, url: string) => {
    const next = { ...repos, [id]: url };
    setRepos(next);
    localStorage.setItem("los_repos", JSON.stringify(next));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects Tracker"
        description="Every project is interview material. Push to GitHub, write a README, and ship a resume bullet."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {PROJECTS.map((p) => {
          const key = `proj.${p.id}`;
          const done = !!progress[key];
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {p.days}
                  </div>
                  <h3 className="mt-0.5 text-lg font-semibold tracking-tight">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.goal}</p>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                    done
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  {done ? "Done" : "Track"}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                <b className="text-foreground">Why:</b> {p.why}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border bg-background/40 p-2">
                  <div className="font-medium">Skills</div>
                  <div className="text-muted-foreground">{p.skills.join(", ")}</div>
                </div>
                <div className="rounded-md border border-border bg-background/40 p-2">
                  <div className="font-medium">Tools</div>
                  <div className="text-muted-foreground">{p.tools.join(", ")}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs font-medium">Features</div>
                <ul className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 text-xs">
                <b>AI tools:</b>{" "}
                <span className="text-muted-foreground">{p.aiTools.join(", ")}</span>
              </div>
              <div className="mt-1 text-xs">
                <b>Automation idea:</b>{" "}
                <span className="text-muted-foreground">{p.automation}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Github className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  aria-label="https://github.com/you/repo"
                  value={repos[p.id] ?? ""}
                  onChange={(e) => save(p.id, e.target.value)}
                  placeholder="https://github.com/you/repo"
                  className="w-full rounded-md border border-border bg-background/40 px-2 py-1 text-xs"
                />
              </div>
              <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs">
                <div className="font-medium text-primary">Resume bullet</div>
                <p className="mt-1">{p.resumeBullet}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(p.resumeBullet)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-[11px] hover:bg-muted"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
