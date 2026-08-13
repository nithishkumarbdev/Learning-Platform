import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RESOURCES } from "@/lib/resources";
import { useResourceStatus } from "@/lib/storage";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Hub · Learning OS" },
      {
        name: "description",
        content: "Curated, filterable learning resources for every track and week.",
      },

      { property: "og:title", content: "Resource Hub · Learning OS" },
      {
        property: "og:description",
        content: "Curated, filterable learning resources for every track and week.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourceHub,
});

function ResourceHub() {
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const [status, setStatus] = useResourceStatus();

  const cats = useMemo(() => ["All", ...Array.from(new Set(RESOURCES.map((r) => r.category)))], []);
  const list = useMemo(() => {
    return RESOURCES.filter(
      (r) =>
        (cat === "All" || r.category === cat) &&
        (q === "" ||
          r.name.toLowerCase().includes(q.toLowerCase()) ||
          r.bestFor.toLowerCase().includes(q.toLowerCase())),
    );
  }, [cat, q]);

  return (
    <div>
      <PageHeader
        eyebrow="Resource Hub"
        title="Where to learn each piece"
        description="Filter by track, search by topic. Track your status so you stop tab-hopping."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          aria-label="Search resources..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search resources..."
          className="w-full max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-md border px-2.5 py-1 text-xs ${
                cat === c
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => {
          const s = status[r.id] ?? "todo";
          return (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {r.category} · {r.type}
                  </div>
                  <h3 className="mt-0.5 font-medium tracking-tight">{r.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{r.bestFor}</p>
                </div>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                <span className="rounded border border-border bg-background/40 px-1.5 py-0.5">
                  {r.week}
                </span>
                <span className="rounded border border-border bg-background/40 px-1.5 py-0.5">
                  {r.time}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div>
                  <b className="text-foreground">First step:</b> {r.firstStep}
                </div>
                <div>
                  <b className="text-foreground">How:</b> {r.howToUse}
                </div>
                <div>
                  <b className="text-foreground">Skip:</b> {r.skip}
                </div>
              </div>
              <div className="mt-3 flex gap-1">
                {(["todo", "doing", "done"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setStatus({ ...status, [r.id]: opt })}
                    className={`flex-1 rounded-md border px-2 py-1 text-[11px] capitalize ${
                      s === opt
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
