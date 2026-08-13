import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PROMPTS } from "@/lib/prompts";
import { Copy, AlertTriangle, Bot } from "lucide-react";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "AI Prompt Library · Learning OS" },
      {
        name: "description",
        content:
          "Copyable, battle-tested AI prompts for learning, debugging, code review, DSA, cloud, security, automation, README and interviews.",
      },

      { property: "og:title", content: "AI Prompt Library · Learning OS" },
      {
        property: "og:description",
        content:
          "Copyable, battle-tested AI prompts for learning, debugging, code review, DSA, cloud, security, automation, README and interviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Prompts,
});

function Prompts() {
  const [cat, setCat] = useState<string>("All");
  const cats = ["All", ...Array.from(new Set(PROMPTS.map((p) => p.category)))];
  const list = cat === "All" ? PROMPTS : PROMPTS.filter((p) => p.category === cat);

  return (
    <div>
      <PageHeader
        eyebrow="AI Prompts"
        title="Copyable prompts that work"
        description="Replace [TOPIC] / [PROJECT] with your details. Use the right tool for the job."
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

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold tracking-tight">{p.title}</h3>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                {p.category}
              </span>
            </div>
            <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Bot className="h-3.5 w-3.5" /> Best with: {p.bestTool}
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-background/40 p-3 font-mono text-xs leading-relaxed">
              {p.body}
            </pre>
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => navigator.clipboard.writeText(p.body)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
              >
                <Copy className="h-3 w-3" /> Copy prompt
              </button>
              <span className="flex items-center gap-1.5 text-[11px] text-warning">
                <AlertTriangle className="h-3 w-3" /> {p.notFor}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
