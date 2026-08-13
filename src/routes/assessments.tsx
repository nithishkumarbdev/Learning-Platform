import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ASSESSMENTS, useAssessmentScores, type AssessmentScore } from "@/lib/assessments";
import { CheckCircle2, XCircle, Trophy, BookOpen } from "lucide-react";
import { useXP } from "@/lib/storage";
import { fireConfetti } from "@/components/visuals";

export const Route = createFileRoute("/assessments")({
  head: () => ({
    meta: [
      { title: "Mini Assessments · Learning OS" },
      {
        name: "description",
        content:
          "Mini Assessments — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Enginee",
      },
      { property: "og:title", content: "Mini Assessments · Learning OS" },
      {
        property: "og:description",
        content:
          "Mini Assessments — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Enginee",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const [scores, setScores] = useAssessmentScores();
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow="Checkpoint"
        title="Mini Assessments"
        description="Auto-graded weekly checkpoints. 5 MCQs + practical tasks + project + explain-back."
      />

      {active === null ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ASSESSMENTS.map((a) => {
            const s = scores[a.week];
            const pct = s ? Math.round((s.correct / s.total) * 100) : null;
            return (
              <button
                key={a.week}
                onClick={() => setActive(a.week)}
                className="group rounded-xl border border-border bg-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Week {a.week}
                  </span>
                  {pct !== null && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${pct >= 80 ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                    >
                      {pct}%
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold tracking-tight">{a.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.topic}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <Quiz
          week={active}
          onClose={() => setActive(null)}
          onComplete={(score) => {
            setScores((prev) => ({ ...prev, [active]: score }));
            if (score.correct / score.total >= 0.8) fireConfetti();
          }}
        />
      )}
    </div>
  );
}

function Quiz({
  week,
  onClose,
  onComplete,
}: {
  week: number;
  onClose: () => void;
  onComplete: (s: AssessmentScore) => void;
}) {
  const a = ASSESSMENTS.find((x) => x.week === week)!;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [, setXP] = useXP();

  const correct = a.questions.filter((q) => answers[q.id] === q.answer).length;
  const total = a.questions.length;

  function submit() {
    setSubmitted(true);
    const score = { week, correct, total, answers, takenAt: Date.now() };
    onComplete(score);
    setXP((x) => ({ ...x, xp: x.xp + correct * 10 }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to checkpoints
        </button>
        {submitted && (
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Trophy className="h-3.5 w-3.5" /> {correct}/{total} · +{correct * 10} XP
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Week {a.week} Checkpoint
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{a.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{a.topic}</p>
      </div>

      {a.questions.map((q, idx) => (
        <div
          key={q.id}
          data-question={q.id}
          role="group"
          aria-label={`Question ${idx + 1}: ${q.q}`}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="text-xs text-muted-foreground">Q{idx + 1}</div>
          <h3 className="mt-1 font-medium">{q.q}</h3>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              const isAnswer = q.answer === i;
              const tone = submitted
                ? isAnswer
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : selected
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground"
                : selected
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border hover:bg-muted";
              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setAnswers((p) => ({ ...p, [q.id]: i }))}
                  className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${tone}`}
                >
                  {submitted && isAnswer && <CheckCircle2 className="h-4 w-4" />}
                  {submitted && !isAnswer && selected && <XCircle className="h-4 w-4" />}
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className="mt-3 rounded-md border border-border bg-background/40 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Why:</span> {q.explain}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={submit}
          disabled={Object.keys(answers).length < a.questions.length}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
        >
          Submit & Grade ({Object.keys(answers).length}/{a.questions.length} answered)
        </button>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-primary" /> Practical tasks
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {a.practical.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 text-sm font-semibold">Project task</div>
              <p className="text-sm text-muted-foreground">{a.projectTask}</p>
              <div className="mt-3 text-sm font-semibold">Explain-back</div>
              <p className="text-sm text-muted-foreground">{a.explainBack}</p>
              <div className="mt-3 text-sm font-semibold">GitHub</div>
              <p className="text-sm text-muted-foreground">{a.githubTask}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted"
          >
            Back to checkpoints
          </button>
        </>
      )}
    </div>
  );
}
