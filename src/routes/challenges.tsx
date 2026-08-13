import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { CHALLENGES, useChallengeStatus, type ChallengeStatus } from "@/lib/assessments";
import { Swords, Lightbulb } from "lucide-react";
import { fireConfetti } from "@/components/visuals";
import { useXP } from "@/lib/storage";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Build Without Tutorial · Learning OS" },
      {
        name: "description",
        content:
          "Build Without Tutorial — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud E",
      },
      { property: "og:title", content: "Build Without Tutorial · Learning OS" },
      {
        property: "og:description",
        content:
          "Build Without Tutorial — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud E",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const TONES: Record<ChallengeStatus, string> = {
  not_started: "border-border text-muted-foreground",
  tried: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  completed: "border-primary/40 bg-primary/10 text-primary",
  need_revision: "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

function Page() {
  const [status, setStatus] = useChallengeStatus();
  const [, setXP] = useXP();

  function setS(id: string, s: ChallengeStatus) {
    const prev = status[id];
    setStatus((st) => ({ ...st, [id]: s }));
    if (s === "completed" && prev !== "completed") {
      setXP((x) => ({ ...x, xp: x.xp + 75 }));
      fireConfetti();
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Challenge Mode"
        title="Build Without Tutorial"
        description="Re-build core features from memory. This is what separates 'I watched it' from 'I can do it'."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {CHALLENGES.map((c) => {
          const s = (status[c.id] ?? "not_started") as ChallengeStatus;
          return (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Week {c.week}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${TONES[s]}`}
                >
                  {s.replace("_", " ")}
                </span>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <Swords className="mt-0.5 h-4 w-4 text-primary" />
                <h3 className="font-semibold tracking-tight">{c.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.prompt}</p>
              <div className="mt-3 rounded-md border border-border bg-background/40 p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Success criteria
                </div>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {c.successCriteria.map((sc, i) => (
                    <li key={i}>• {sc}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                <span>{c.hint}</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1">
                {(["not_started", "tried", "completed", "need_revision"] as ChallengeStatus[]).map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() => setS(c.id, opt)}
                      className={`rounded-md border px-2 py-1.5 text-[10px] capitalize transition-colors ${s === opt ? TONES[opt] : "border-border text-muted-foreground hover:bg-muted"}`}
                    >
                      {opt.replace("_", " ")}
                    </button>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
