import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useRevisions, nextDueFromStage, STAGE_DAYS, type RevisionItem } from "@/lib/extra";
import { Brain, Check, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/revision")({
  head: () => ({
    meta: [
      { title: "Revision Queue · Learning OS" },
      {
        name: "description",
        content:
          "Revision Queue — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engineer ",
      },
      { property: "og:title", content: "Revision Queue · Learning OS" },
      {
        property: "og:description",
        content:
          "Revision Queue — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engineer ",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Revision,
});

function Revision() {
  const [items, setItems] = useRevisions();
  const [draft, setDraft] = useState({ topic: "", note: "" });

  const due = items.filter((i) => !i.done && i.nextDue <= Date.now());
  const upcoming = items
    .filter((i) => !i.done && i.nextDue > Date.now())
    .sort((a, b) => a.nextDue - b.nextDue);
  const done = items.filter((i) => i.done);

  function add() {
    if (!draft.topic.trim()) return;
    setItems((arr) => [
      ...arr,
      {
        id: `r_${Date.now()}`,
        topic: draft.topic,
        fromDay: 0,
        note: draft.note,
        createdAt: Date.now(),
        nextDue: nextDueFromStage(0),
        stage: 0,
        done: false,
      },
    ]);
    setDraft({ topic: "", note: "" });
  }
  function revise(id: string) {
    setItems((arr) =>
      arr.map((i) => {
        if (i.id !== id) return i;
        const nextStage = Math.min(4, i.stage + 1) as 0 | 1 | 2 | 3 | 4;
        const isDone = nextStage >= 4;
        return {
          ...i,
          stage: nextStage,
          nextDue: isDone ? i.nextDue : nextDueFromStage(nextStage),
          done: isDone,
        };
      }),
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Spaced repetition · 1d → 3d → 7d → 14d"
        title="Revision Queue"
        description="Anything you mark for revision returns at the right interval. Confidence comes from spaced practice, not re-reading."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Due now" value={due.length} accent />
        <Stat label="Upcoming" value={upcoming.length} />
        <Stat label="Mastered" value={done.length} />
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-2 text-sm font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" /> Add a topic
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input
            aria-label="Topic"
            value={draft.topic}
            onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
            placeholder="Topic"
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <input
            aria-label="What confused you?"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="What confused you?"
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <button
            onClick={add}
            className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90"
          >
            Add
          </button>
        </div>
      </div>

      <Section
        title="Due today"
        items={due}
        onRevise={revise}
        onDelete={(id: string) => setItems((a) => a.filter((i) => i.id !== id))}
        emptyText="Nothing due — enjoy a clean queue."
      />
      <Section
        title="Upcoming"
        items={upcoming}
        onRevise={revise}
        onDelete={(id: string) => setItems((a) => a.filter((i) => i.id !== id))}
        emptyText="No upcoming items yet."
      />
      <Section
        title="Mastered"
        items={done}
        onRevise={revise}
        onDelete={(id: string) => setItems((a) => a.filter((i) => i.id !== id))}
        emptyText="Once you complete the 14-day stage, topics land here."
        muted
      />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
    >
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function Section({
  title,
  items,
  onRevise,
  onDelete,
  emptyText,
  muted,
}: {
  title: string;
  items: RevisionItem[];
  onRevise: (id: string) => void;
  onDelete: (id: string) => void;
  emptyText: string;
  muted?: boolean;
}) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <div
              key={i.id}
              className={`flex items-center gap-3 rounded-xl border p-3 ${muted ? "border-border opacity-70" : "border-border bg-card"}`}
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{i.topic}</div>
                {i.note && <div className="text-xs text-muted-foreground">{i.note}</div>}
                <div className="mt-1 text-[10px] text-muted-foreground">
                  Stage {i.stage + 1}/5 · next in {STAGE_DAYS[i.stage] ?? 14}d · due{" "}
                  {new Date(i.nextDue).toLocaleDateString()}
                </div>
              </div>
              {!i.done && (
                <button
                  onClick={() => onRevise(i.id)}
                  className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] text-primary hover:bg-primary/20"
                >
                  <Check className="inline h-3 w-3" /> Revised
                </button>
              )}
              <button
                aria-label="Delete revision item"
                onClick={() => onDelete(i.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
