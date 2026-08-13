import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useLocalStorage } from "@/lib/storage";
import { Plus, X, Copy, Download } from "lucide-react";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture Builder · Learning OS" },
      {
        name: "description",
        content:
          "Architecture Builder — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Eng",
      },
      { property: "og:title", content: "Architecture Builder · Learning OS" },
      {
        property: "og:description",
        content:
          "Architecture Builder — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Eng",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const NODE_TYPES = [
  { type: "User", color: "border-blue-400/40 bg-blue-400/10 text-blue-300" },
  { type: "Frontend", color: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" },
  { type: "Backend", color: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  { type: "Database", color: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  { type: "Cloud", color: "border-violet-400/40 bg-violet-400/10 text-violet-300" },
  { type: "AI API", color: "border-pink-400/40 bg-pink-400/10 text-pink-300" },
  { type: "Automation", color: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
  { type: "Security", color: "border-red-400/40 bg-red-400/10 text-red-300" },
  { type: "Logs", color: "border-slate-400/40 bg-slate-400/10 text-slate-300" },
  { type: "Alerts", color: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
];

type Node = { id: string; type: string; label: string };

function Page() {
  const [nodes, setNodes] = useLocalStorage<Node[]>("los_arch_v1", [
    { id: "n1", type: "User", label: "User" },
    { id: "n2", type: "Frontend", label: "React Dashboard" },
    { id: "n3", type: "Backend", label: "FastAPI" },
    { id: "n4", type: "Database", label: "PostgreSQL" },
    { id: "n5", type: "AI API", label: "OpenAI Summary" },
  ]);
  const [draft, setDraft] = useState({ type: "Frontend", label: "" });

  function add() {
    if (!draft.label.trim()) return;
    setNodes((n) => [...n, { id: `n${Date.now()}`, type: draft.type, label: draft.label }]);
    setDraft({ ...draft, label: "" });
  }

  function exportMarkdown() {
    const text = `# Architecture\n\n\`\`\`\n${nodes.map((n) => `[${n.type}] ${n.label}`).join("\n  ↓\n")}\n\`\`\``;
    navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Planner"
        title="Architecture Diagram Builder"
        description="Sketch a data-flow diagram for your project. Export as markdown for your README."
        actions={
          <button
            onClick={exportMarkdown}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
          >
            <Copy className="h-3.5 w-3.5" /> Copy as Markdown
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Flow</h3>
          <div className="space-y-2">
            {nodes.map((n, i) => {
              const color = NODE_TYPES.find((t) => t.type === n.type)?.color ?? "border-border";
              return (
                <div key={n.id}>
                  <div
                    className={`flex items-center justify-between rounded-xl border p-4 ${color}`}
                  >
                    <div>
                      <div className="text-[10px] uppercase tracking-widest opacity-70">
                        {n.type}
                      </div>
                      <div className="mt-0.5 text-sm font-medium">{n.label}</div>
                    </div>
                    <button
                      aria-label="Remove node"
                      onClick={() => setNodes((ns) => ns.filter((x) => x.id !== n.id))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {i < nodes.length - 1 && (
                    <div className="my-1 text-center text-muted-foreground">↓</div>
                  )}
                </div>
              );
            })}
            {nodes.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Add nodes on the right to start your diagram.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card h-fit">
          <h3 className="mb-3 text-sm font-semibold">Add Node</h3>
          <select
            aria-label="Node type"
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value })}
            className="mb-2 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm"
          >
            {NODE_TYPES.map((t) => (
              <option key={t.type}>{t.type}</option>
            ))}
          </select>
          <input
            aria-label="Label (e.g. React Dashboard)"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Label (e.g. React Dashboard)"
            className="mb-2 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm"
          />
          <button
            onClick={add}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add to flow
          </button>

          <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            Templates
          </div>
          <button
            onClick={() =>
              setNodes([
                { id: "t1", type: "User", label: "User" },
                { id: "t2", type: "Frontend", label: "React" },
                { id: "t3", type: "Backend", label: "API" },
                { id: "t4", type: "Database", label: "Postgres" },
              ])
            }
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-left text-xs hover:bg-muted"
          >
            Full-Stack starter
          </button>
          <button
            onClick={() =>
              setNodes([
                { id: "c1", type: "User", label: "User" },
                { id: "c2", type: "Frontend", label: "Dashboard" },
                { id: "c3", type: "Backend", label: "FastAPI" },
                { id: "c4", type: "Database", label: "Postgres" },
                { id: "c5", type: "AI API", label: "OpenAI" },
                { id: "c6", type: "Automation", label: "n8n alert" },
                { id: "c7", type: "Cloud", label: "AWS EC2/S3" },
              ])
            }
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-left text-xs hover:bg-muted"
          >
            Capstone template
          </button>
        </div>
      </div>
    </div>
  );
}
