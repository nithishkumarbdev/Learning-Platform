import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DAYS } from "@/lib/days";
import { useExplainBack, useRevisions, nextDueFromStage } from "@/lib/extra";
import { Brain, Star } from "lucide-react";

export const Route = createFileRoute("/explain")({
  head: () => ({
    meta: [
      { title: "Explain-Back Mode · Learning OS" },
      {
        name: "description",
        content:
          "Explain-Back Mode — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engine",
      },
      { property: "og:title", content: "Explain-Back Mode · Learning OS" },
      {
        property: "og:description",
        content:
          "Explain-Back Mode — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engine",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const PROMPTS = [
  "What did I learn?",
  "Why does it matter?",
  "Where is it used in real apps?",
  "How did I build with it today?",
  "What mistake should I avoid?",
  "How would I explain this in an interview?",
];

function Page() {
  const [explain, setExplain] = useExplainBack();
  const [, setRevs] = useRevisions();
  const [dayNum, setDayNum] = useState(1);
  const d = DAYS[dayNum - 1];
  const current = explain[`d${dayNum}`] ?? {
    dayId: `d${dayNum}`,
    rating: 3 as const,
    answers: ["", "", "", "", "", ""],
    updatedAt: 0,
  };

  function update(answers: string[], rating: 1 | 2 | 3 | 4 | 5) {
    const next = { dayId: `d${dayNum}`, rating, answers, updatedAt: Date.now() };
    setExplain((e) => ({ ...e, [`d${dayNum}`]: next }));
    if (rating < 3) {
      setRevs((rs) => {
        if (rs.some((r) => r.fromDay === dayNum)) return rs;
        return [
          ...rs,
          {
            id: `rev_${dayNum}_${Date.now()}`,
            topic: d.topic,
            fromDay: dayNum,
            note: answers[0] || "Self-rated below 3",
            createdAt: Date.now(),
            nextDue: nextDueFromStage(0),
            stage: 0,
            done: false,
          },
        ];
      });
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Active Recall"
        title="Explain-Back Mode"
        description="Teach what you learned. Self-ratings under 3 auto-add the topic to your revision queue."
        actions={
          <select
            aria-label="Select day"
            value={dayNum}
            onChange={(e) => setDayNum(Number(e.target.value))}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
          >
            {DAYS.map((d) => (
              <option key={d.day} value={d.day}>
                Day {d.day} · {d.topic}
              </option>
            ))}
          </select>
        }
      />

      <div className="mb-4 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="h-4 w-4 text-primary" /> Day {d.day} · {d.topic}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{d.goal}</div>
      </div>

      <div className="space-y-3">
        {PROMPTS.map((p, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-medium text-muted-foreground">{p}</div>
            <textarea
              aria-label="Type your answer in your own words..."
              rows={2}
              value={current.answers[i] ?? ""}
              onChange={(e) => {
                const a = [...current.answers];
                a[i] = e.target.value;
                update(a, current.rating);
              }}
              placeholder="Type your answer in your own words..."
              className="mt-2 w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Self-rating</div>
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => update(current.answers, r as 1 | 2 | 3 | 4 | 5)}
              className={`flex items-center gap-1 rounded-md border px-3 py-2 text-xs ${
                current.rating >= r
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${current.rating >= r ? "fill-current" : ""}`} /> {r}
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          1 = Don't understand · 3 = Can use with help · 5 = Could explain in an interview. Ratings
          below 3 auto-add this topic to your Revision Queue.
        </div>
      </div>
    </div>
  );
}
