import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DAYS, WEEK_THEMES } from "@/lib/days";
import { useProgress } from "@/lib/storage";
import { useBugs, useRevisions, useTimerSessions } from "@/lib/extra";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/weekly")({
  head: () => ({
    meta: [
      { title: "Weekly Review · Learning OS" },
      {
        name: "description",
        content:
          "Weekly Review — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engineer L",
      },
      { property: "og:title", content: "Weekly Review · Learning OS" },
      {
        property: "og:description",
        content:
          "Weekly Review — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engineer L",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Weekly,
});

type PostContext = {
  week: number;
  project: string;
  stack: string;
  lesson: string;
  next: string;
  topics: string;
};

const POST_TEMPLATES = [
  {
    kind: "Project completed",
    body: (ctx: PostContext) =>
      `🚀 Shipped ${ctx.project}!\n\nThis week I built [feature] using ${ctx.stack}. Biggest lesson: ${ctx.lesson || "[your lesson]"}\n\nGitHub: [link]\nWhat I'm learning next: ${ctx.next}`,
  },
  {
    kind: "Learning milestone",
    body: (ctx: PostContext) =>
      `Week ${ctx.week} of my AI Cloud Full-Stack journey is done ✅\n\nCovered: ${ctx.topics}\nBuilt: ${ctx.project}\nNext: ${ctx.next}\n\nIf you're learning the same path, what's tripping you up?`,
  },
  {
    kind: "Debugging lesson",
    body: () =>
      `Spent 2 hours on a bug today. The fix was 1 line.\n\nThe lesson: [what you learned about reading errors/docs/asking AI for hints]\n\nNow it's in my bug journal so I never burn that time again.`,
  },
  {
    kind: "Cloud deployment",
    body: () =>
      `First AWS deploy ✅\n\nStack: React frontend on S3, Node API on EC2, PostgreSQL on RDS, CloudWatch for logs.\nBiggest gotcha: [security group / IAM / billing]\n\nNot magic — just patience + checklists.`,
  },
  {
    kind: "AI project",
    body: () =>
      `Built an AI-powered [feature] this week.\n\nFlow: User input → Backend route → OpenAI/Claude API → response → saved to DB → displayed in dashboard.\nKey safety: API keys stay in .env, prompts validated server-side.\n\nGitHub: [link]`,
  },
  {
    kind: "Final capstone",
    body: () =>
      `Capstone done 🎯\n\nAI-Powered Cloud Security Monitoring Dashboard:\nReact · Node/FastAPI · PostgreSQL · AWS · Docker · OpenAI API\n\nDetects failed logins, summarizes incidents with AI, sends automated alerts.\n\nHappy to walk anyone through the architecture.`,
  },
];

const DEMO_SCRIPT = (project: string) => `# Demo: ${project}

## Intro (15s)
Hi, I'm [name]. This is ${project} — a [one-line description].

## Problem (20s)
[What real problem does this solve? Who hits it today?]

## Tech stack (15s)
Frontend: React + Tailwind. Backend: [Node/FastAPI]. Database: PostgreSQL. Cloud: AWS. AI: [OpenAI/Claude].

## Feature walkthrough (60–90s)
[Click through the 3–4 most important features. Show the AI feature last for impact.]

## Code structure (45s)
[Show folder layout. Highlight: routes, services, AI integration, validation, .env.]

## Deployment (30s)
[Show GitHub Actions / Docker / EC2 deploy. Mention: secrets in env, security groups locked down.]

## AI feature (30s)
[Show the AI flow: input → backend → API → response → UI. Mention prompt safety + verification.]

## Security feature (20s)
[Auth, input validation, rate limit. One sentence each.]

## What I learned (30s)
[2–3 honest lessons. Bugs you hit. What you'd do differently.]

## Future improvements (15s)
[Caching, tests, Kubernetes once you're ready, multi-tenant, etc.]

Total: ~5–6 minutes.`;

function Weekly() {
  const { progress } = useProgress();
  const [bugs] = useBugs();
  const [revs] = useRevisions();
  const [sessions] = useTimerSessions();

  // current week
  const current = DAYS.find((d) => !progress[`d${d.day}.build`]) ?? DAYS[DAYS.length - 1];
  const [week, setWeek] = useState(current.week);
  const days = DAYS.filter((d) => d.week === week);

  const stats = useMemo(() => {
    const buildDone = days.filter((d) => progress[`d${d.day}.build`]).length;
    const learnDone = days.filter((d) => progress[`d${d.day}.learn`]).length;
    const dsaDone = days.filter((d) => progress[`d${d.day}.dsa`]).length;
    const githubDone = days.filter((d) => progress[`d${d.day}.github`]).length;
    const testDone = days.filter((d) => progress[`d${d.day}.test`]).length;
    const completion = Math.round(((buildDone + learnDone + githubDone) / (days.length * 3)) * 100);

    const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const studyMin = Math.round(
      sessions.filter((s) => s.startedAt >= weekStart).reduce((a, s) => a + s.durationSec, 0) / 60,
    );
    const bugsFixed = bugs.filter((b) => b.fixed && b.createdAt >= weekStart).length;
    const revsDone = revs.filter((r) => r.done && r.createdAt >= weekStart).length;

    return {
      buildDone,
      learnDone,
      dsaDone,
      githubDone,
      testDone,
      completion,
      studyMin,
      bugsFixed,
      revsDone,
    };
  }, [days, progress, bugs, revs, sessions]);

  const score = Math.min(
    100,
    Math.round(
      (stats.buildDone * 12 +
        stats.githubDone * 8 +
        stats.learnDone * 4 +
        stats.dsaDone * 3 +
        stats.testDone * 3) /
        days.length /
        0.3,
    ),
  );

  const project = WEEK_THEMES[week]?.project ?? "—";
  const [tmpl, setTmpl] = useState(0);
  const post = POST_TEMPLATES[tmpl].body({
    week,
    project,
    stack: "React, Node, AWS, OpenAI",
    topics: days.map((d) => d.topic).join(", "),
    next: WEEK_THEMES[week + 1]?.title ?? "Wrap up + interview prep",
    lesson: "",
  });

  return (
    <div>
      <PageHeader
        eyebrow={`Week ${week} · ${WEEK_THEMES[week]?.title ?? ""}`}
        title="Weekly Review"
        description="Reflect. Score the week. Generate a LinkedIn post and demo script while it's fresh."
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <button
              aria-label="Previous week"
              onClick={() => setWeek(Math.max(1, week - 1))}
              className="rounded-md px-2 py-1 text-xs hover:bg-muted"
            >
              ←
            </button>
            <span className="px-2 text-xs">Week {week}</span>
            <button
              aria-label="Next week"
              onClick={() => setWeek(Math.min(12, week + 1))}
              className="rounded-md px-2 py-1 text-xs hover:bg-muted"
            >
              →
            </button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label="Build days" value={`${stats.buildDone}/${days.length}`} />
        <Mini label="GitHub days" value={`${stats.githubDone}/${days.length}`} />
        <Mini label="DSA days" value={`${stats.dsaDone}/${days.length}`} />
        <Mini label="Study minutes" value={`${stats.studyMin}m`} />
        <Mini label="Bugs fixed" value={stats.bugsFixed} />
        <Mini label="Topics revised" value={stats.revsDone} />
        <Mini label="Completion" value={`${stats.completion}%`} />
        <Mini label="Weekly score" value={`${score}/100`} accent />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">LinkedIn post generator</div>
            <button
              onClick={() => navigator.clipboard.writeText(post)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {POST_TEMPLATES.map((t, i) => (
              <button
                key={t.kind}
                onClick={() => setTmpl(i)}
                className={`rounded-md border px-2 py-1 text-[11px] ${tmpl === i ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
              >
                {t.kind}
              </button>
            ))}
          </div>
          <pre className="whitespace-pre-wrap rounded-md border border-border bg-background/40 p-3 text-xs">
            {post}
          </pre>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Demo video script — {project}</div>
            <button
              onClick={() => navigator.clipboard.writeText(DEMO_SCRIPT(project))}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap rounded-md border border-border bg-background/40 p-3 text-xs max-h-96 overflow-y-auto">
            {DEMO_SCRIPT(project)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-xl font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
