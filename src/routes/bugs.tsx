import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Bug, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { BUG_CATEGORIES, MISTAKE_CATEGORIES, useBugs, useMistakes } from "@/lib/extra";

export const Route = createFileRoute("/bugs")({
  head: () => ({
    meta: [
      { title: "Bug Journal & Mistakes · Learning OS" },
      {
        name: "description",
        content:
          "Bug Journal & Mistakes — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud E",
      },
      { property: "og:title", content: "Bug Journal & Mistakes · Learning OS" },
      {
        property: "og:description",
        content:
          "Bug Journal & Mistakes — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud E",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Bugs,
});

function Bugs() {
  const [tab, setTab] = useState<"bugs" | "mistakes">("bugs");
  return (
    <div>
      <PageHeader
        eyebrow="Don't repeat the same mistake twice"
        title="Bug Journal & Mistake Tracker"
        description="Log every bug and every mistake. Pattern recognition makes you faster than tutorials."
      />
      <div className="mb-5 inline-flex rounded-lg border border-border bg-card p-1">
        <button
          onClick={() => setTab("bugs")}
          className={`rounded-md px-4 py-1.5 text-xs ${tab === "bugs" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
        >
          Bug Journal
        </button>
        <button
          onClick={() => setTab("mistakes")}
          className={`rounded-md px-4 py-1.5 text-xs ${tab === "mistakes" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
        >
          Mistake Tracker
        </button>
      </div>
      {tab === "bugs" ? <BugList /> : <MistakeList />}
    </div>
  );
}

function BugList() {
  const [bugs, setBugs] = useBugs();
  const [draft, setDraft] = useState({
    error: "",
    where: "",
    project: "",
    tried: "",
    cause: "",
    fix: "",
    aiPrompt: "",
    learned: "",
    revisitDate: "",
    category: BUG_CATEGORIES[0],
  });

  function add() {
    if (!draft.error.trim()) return;
    setBugs((arr) => [
      { id: `b_${Date.now()}`, createdAt: Date.now(), fixed: false, ...draft },
      ...arr,
    ]);
    setDraft({
      ...draft,
      error: "",
      where: "",
      tried: "",
      cause: "",
      fix: "",
      aiPrompt: "",
      learned: "",
    });
  }

  const stats = useMemo(() => {
    const map: Record<string, number> = {};
    bugs.forEach((b) => {
      map[b.category] = (map[b.category] ?? 0) + 1;
    });
    return { byCat: map, fixed: bugs.filter((b) => b.fixed).length, total: bugs.length };
  }, [bugs]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {bugs.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No bugs logged yet. Every error you log is faster knowledge tomorrow.
          </div>
        )}
        {bugs.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-border bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-widest">
                    {b.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                  {b.project && (
                    <span className="text-xs text-muted-foreground">· {b.project}</span>
                  )}
                </div>
                <div className="mt-1 font-mono text-sm">{b.error}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setBugs((arr) =>
                      arr.map((x) => (x.id === b.id ? { ...x, fixed: !x.fixed } : x)),
                    )
                  }
                  className={`rounded-md border px-2 py-1 text-[11px] ${b.fixed ? "border-primary/40 bg-primary/15 text-primary" : "border-border hover:bg-muted"}`}
                >
                  <CheckCircle2 className="inline h-3 w-3" /> {b.fixed ? "Fixed" : "Open"}
                </button>
                <button
                  aria-label="Delete bug entry"
                  onClick={() => setBugs((arr) => arr.filter((x) => x.id !== b.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
              {b.where && (
                <div>
                  <span className="text-muted-foreground">Where:</span> {b.where}
                </div>
              )}
              {b.tried && (
                <div>
                  <span className="text-muted-foreground">Tried:</span> {b.tried}
                </div>
              )}
              {b.cause && (
                <div>
                  <span className="text-muted-foreground">Root cause:</span> {b.cause}
                </div>
              )}
              {b.fix && (
                <div>
                  <span className="text-muted-foreground">Fix:</span> {b.fix}
                </div>
              )}
              {b.learned && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Learned:</span> {b.learned}
                </div>
              )}
              {b.revisitDate && (
                <div>
                  <span className="text-muted-foreground">Revisit:</span> {b.revisitDate}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Bug className="h-4 w-4 text-primary" /> New bug
          </div>
          <div className="space-y-2">
            <select
              aria-label="Bug category"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="w-full rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
            >
              {BUG_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {[
              ["error", "Error message"],
              ["where", "Where it happened"],
              ["project", "Project"],
              ["tried", "What I tried"],
              ["cause", "Root cause"],
              ["fix", "Final fix"],
              ["aiPrompt", "AI prompt used"],
              ["learned", "What I learned"],
              ["revisitDate", "Revisit date (YYYY-MM-DD)"],
            ].map(([k, label]) => (
              <input
                aria-label={label}
                key={k}
                placeholder={label}
                value={String(draft[k as keyof typeof draft] ?? "")}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                className="w-full rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
              />
            ))}
            <button
              onClick={add}
              className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Log bug
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Stats</div>
          <div className="text-sm">
            {stats.fixed}/{stats.total} fixed
          </div>
          <div className="mt-3 space-y-1">
            {Object.entries(stats.byCat)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, n]) => (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{cat}</span>
                  <span>{n}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MistakeList() {
  const [items, setItems] = useMistakes();
  const [draft, setDraft] = useState({
    category: MISTAKE_CATEGORIES[0],
    mistake: "",
    why: "",
    correct: "",
    prevention: "",
    related: "",
    revisitDate: "",
  });
  function add() {
    if (!draft.mistake.trim()) return;
    setItems((arr) => [
      { id: `m_${Date.now()}`, createdAt: Date.now(), fixed: false, ...draft },
      ...arr,
    ]);
    setDraft({ ...draft, mistake: "", why: "", correct: "", prevention: "", related: "" });
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No mistakes tracked yet. The fastest learners write down why they were wrong.
          </div>
        )}
        {items.map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-md border border-border bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-widest">
                  {m.category}
                </span>
                <div className="mt-1 font-semibold">{m.mistake}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setItems((arr) =>
                      arr.map((x) => (x.id === m.id ? { ...x, fixed: !x.fixed } : x)),
                    )
                  }
                  className={`rounded-md border px-2 py-1 text-[11px] ${m.fixed ? "border-primary/40 bg-primary/15 text-primary" : "border-border"}`}
                >
                  {m.fixed ? "Fixed" : "Track"}
                </button>
                <button
                  aria-label="Delete mistake entry"
                  onClick={() => setItems((arr) => arr.filter((x) => x.id !== m.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 grid gap-1.5 text-xs">
              {m.why && (
                <div>
                  <span className="text-muted-foreground">Why:</span> {m.why}
                </div>
              )}
              {m.correct && (
                <div>
                  <span className="text-muted-foreground">Correct way:</span> {m.correct}
                </div>
              )}
              {m.prevention && (
                <div>
                  <span className="text-muted-foreground">Prevention:</span> {m.prevention}
                </div>
              )}
              {m.related && (
                <div>
                  <span className="text-muted-foreground">Related concept:</span> {m.related}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4 h-fit">
        <div className="mb-3 text-sm font-semibold">New mistake</div>
        <select
          aria-label="Mistake category"
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          className="w-full rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs mb-2"
        >
          {MISTAKE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {[
          ["mistake", "Mistake"],
          ["why", "Why it happened"],
          ["correct", "Correct way"],
          ["prevention", "Prevention checklist"],
          ["related", "Related concept"],
          ["revisitDate", "Revisit (YYYY-MM-DD)"],
        ].map(([k, label]) => (
          <input
            aria-label={label}
            key={k}
            placeholder={label}
            value={String(draft[k as keyof typeof draft] ?? "")}
            onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
            className="mb-2 w-full rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
        ))}
        <button
          onClick={add}
          className="w-full rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:opacity-90"
        >
          Add mistake
        </button>
      </div>
    </div>
  );
}
