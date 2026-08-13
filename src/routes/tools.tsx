import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TOOLS } from "@/lib/tools";
import { ExternalLink, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools Directory · Learning OS" },
      {
        name: "description",
        content:
          "Every AI, software, cloud and security tool you'll use across 84 days — with safety notes.",
      },

      { property: "og:title", content: "Tools Directory · Learning OS" },
      {
        property: "og:description",
        content:
          "Every AI, software, cloud and security tool you'll use across 84 days — with safety notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tools,
});

function Tools() {
  const [cat, setCat] = useState<string>("All");
  const cats = ["All", ...Array.from(new Set(TOOLS.map((t) => t.category)))];
  const list = useMemo(
    () => (cat === "All" ? TOOLS : TOOLS.filter((t) => t.category === cat)),
    [cat],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Your AI Cloud Full-Stack Toolbelt"
        description="Each tool has a clear purpose, beginner setup and a safety note."
        actions={
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
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <div key={t.name} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t.category}
                </div>
                <h3 className="mt-0.5 font-medium tracking-tight">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t.what}</p>
              </div>
              {t.url && (
                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <div>
                <b className="text-foreground">Why:</b>{" "}
                <span className="text-muted-foreground">{t.why}</span>
              </div>
              <div>
                <b className="text-foreground">When:</b>{" "}
                <span className="text-muted-foreground">{t.when}</span>
              </div>
              <div>
                <b className="text-foreground">Setup:</b>{" "}
                <span className="text-muted-foreground">{t.setup}</span>
              </div>
              <div>
                <b className="text-foreground">Tip:</b>{" "}
                <span className="text-muted-foreground">{t.tip}</span>
              </div>
              <div>
                <b className="text-foreground">Mistake:</b>{" "}
                <span className="text-muted-foreground">{t.mistake}</span>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-2 text-[11px]">
              <ShieldAlert className="h-3.5 w-3.5 text-warning mt-0.5" />
              <span>{t.safety}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
