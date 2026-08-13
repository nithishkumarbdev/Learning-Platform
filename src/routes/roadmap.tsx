import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DAYS, WEEK_THEMES, TRACK_COLOR } from "@/lib/days";
import { useProgress } from "@/lib/storage";
import { CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "84-Day Roadmap · Learning OS" },
      {
        name: "description",
        content:
          "Strict Day 1 → Day 84 sequence that takes you from beginner to AI Cloud Full-Stack Engineer.",
      },

      { property: "og:title", content: "84-Day Roadmap · Learning OS" },
      {
        property: "og:description",
        content:
          "Strict Day 1 → Day 84 sequence that takes you from beginner to AI Cloud Full-Stack Engineer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const { progress } = useProgress();
  const [trackFilter, setTrackFilter] = useState<string>("All");
  const tracks = ["All", ...Array.from(new Set(DAYS.map((d) => d.track)))];

  const weeks = useMemo(() => {
    const map: Record<number, typeof DAYS> = {};
    for (const d of DAYS) {
      if (trackFilter !== "All" && d.track !== trackFilter) continue;
      map[d.week] = map[d.week] ?? [];
      map[d.week].push(d);
    }
    return map;
  }, [trackFilter]);

  return (
    <div>
      <PageHeader
        eyebrow="84-Day Path"
        title="The Sequenced Roadmap"
        description="Each week builds on the previous one. Don't skip days — the sequence is the value."
        actions={
          <div className="flex flex-wrap gap-1">
            {tracks.map((t) => (
              <button
                key={t}
                onClick={() => setTrackFilter(t)}
                className={`rounded-md border px-3 py-1.5 text-xs ${
                  trackFilter === t
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-8">
        {Object.entries(weeks).map(([week, days]) => {
          const wn = Number(week);
          const theme = WEEK_THEMES[wn];
          return (
            <section key={week}>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Week {week}
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">{theme?.title}</h2>
                  <div className="text-xs text-muted-foreground">Project: {theme?.project}</div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {days.map((d) => {
                  const done = !!progress[`d${d.day}.build`];
                  return (
                    <Link
                      key={d.day}
                      to="/today"
                      className="group rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Day {d.day}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] ${TRACK_COLOR[d.track]}`}
                        >
                          {d.track}
                        </span>
                      </div>
                      <h3 className="font-medium tracking-tight">{d.topic}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.goal}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">AI: {d.ai.tool}</span>
                        <span
                          className={`flex items-center gap-1 ${done ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {done ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Circle className="h-3.5 w-3.5" />
                          )}
                          {done ? "Built" : "Open"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
