import { useState } from "react";
import { LifeBuoy, Copy, X } from "lucide-react";
import { useRevisions, nextDueFromStage } from "@/lib/extra";

export function StuckHelper({ topic, dayNum }: { topic: string; dayNum?: number }) {
  const [open, setOpen] = useState(false);
  const [confusing, setConfusing] = useState("");
  const [, setRevs] = useRevisions();
  const [copied, setCopied] = useState(false);

  const prompt = `I am stuck on "${topic}"${confusing ? ` — specifically: ${confusing}` : ""}. Do not solve everything. Ask me 3 questions to find what I don't understand, then explain only the missing part with a tiny example and one small practice task.`;

  function addToRevision() {
    setRevs((arr) => [
      ...arr,
      {
        id: `r_${Date.now()}`,
        topic,
        fromDay: dayNum ?? 0,
        note: confusing || "Stuck — needs revision",
        createdAt: Date.now(),
        nextDue: nextDueFromStage(0),
        stage: 0,
        done: false,
      },
    ]);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs text-warning hover:bg-warning/20"
      >
        <LifeBuoy className="h-3.5 w-3.5" /> I'm stuck
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-glow animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-warning">Stuck helper</div>
                <div className="text-lg font-semibold">{topic}</div>
              </div>
              <button
                aria-label="Close stuck helper"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 space-y-1.5 text-sm">
              <div>1. Pin down what's confusing in one line.</div>
              <div>2. Try the smallest example you can write.</div>
              <div>3. Read one beginner explanation.</div>
              <div>4. Watch one short video (5–10 min).</div>
              <div>5. Ask AI for a hint (not the answer).</div>
              <div>6. Build only one tiny part.</div>
              <div>7. Write what you understood in 5 lines.</div>
            </div>

            <textarea
              aria-label="What exactly is confusing?"
              value={confusing}
              onChange={(e) => setConfusing(e.target.value)}
              placeholder="What exactly is confusing?"
              className="mb-3 w-full rounded-md border border-border bg-background/40 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
              rows={2}
            />

            <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3 font-mono text-xs">
              {prompt}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(prompt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90"
              >
                <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy prompt"}
              </button>
              <button
                onClick={() => {
                  addToRevision();
                  setOpen(false);
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
              >
                Add to revision queue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
