import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Interview Prep · Learning OS" },
      {
        name: "description",
        content:
          "Mock interview questions and frameworks for explaining your AI Cloud Full-Stack projects.",
      },

      { property: "og:title", content: "Interview Prep · Learning OS" },
      {
        property: "og:description",
        content:
          "Mock interview questions and frameworks for explaining your AI Cloud Full-Stack projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Interview,
});

const QUESTIONS = [
  {
    topic: "Software",
    q: "Walk me through one Python script you wrote. What problem did it solve, and what would you change?",
  },
  {
    topic: "Full-Stack",
    q: "Explain how a request travels from your React UI to your database in your job tracker.",
  },
  { topic: "Auth", q: "How does JWT auth work in your task manager? Where can it go wrong?" },
  { topic: "DB", q: "Why PostgreSQL? Walk me through your schema and one query you optimized." },
  { topic: "Cloud", q: "Describe your AWS deployment. Which services and why? Cost controls?" },
  { topic: "Security", q: "Pick one OWASP Top 10 risk. How did you mitigate it in your API?" },
  { topic: "AI", q: "How does your AI Incident Summary API keep keys safe and handle failures?" },
  {
    topic: "Automation",
    q: "Design an end-to-end automation for a noisy alert source. Trigger → AI → action.",
  },
  {
    topic: "Capstone",
    q: "Whiteboard the architecture of your AI-Powered Cloud Security Monitoring Dashboard.",
  },
  {
    topic: "Behavioral",
    q: "Tell me about a time you used AI tools and what you did NOT trust them to do.",
  },
];

const STAR = `Use STAR:
- Situation: 1 sentence project + role.
- Task: what you owned.
- Action: 2–3 specific technical steps.
- Result: metric, deploy, or commit count.`;

function Interview() {
  return (
    <div>
      <PageHeader
        eyebrow="Interview"
        title="Practice explaining your work"
        description="If you can't explain it, you didn't really learn it. Use STAR + concrete metrics."
      />

      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm">
        <div className="font-semibold text-primary">Framework: STAR</div>
        <pre className="mt-2 whitespace-pre-wrap text-xs">{STAR}</pre>
        <button
          onClick={() => navigator.clipboard.writeText(STAR)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
        >
          <Copy className="h-3 w-3" /> Copy STAR template
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {QUESTIONS.map((q) => (
          <div key={q.q} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {q.topic}
            </div>
            <p className="mt-1 text-sm">{q.q}</p>
            <button
              onClick={() => navigator.clipboard.writeText(q.q)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-2 py-1 text-[11px] hover:bg-muted"
            >
              <Copy className="h-3 w-3" /> Copy question
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
