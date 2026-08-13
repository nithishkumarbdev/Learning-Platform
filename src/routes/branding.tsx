import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useBranding } from "@/lib/extra";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "GitHub profile",
    items: [
      "Profile README with intro, skills, projects",
      "Pin 6 best repos (capstone, AI, cloud, full-stack, security, automation)",
      "Each repo has clean README + screenshots",
      "Bio mentions: AI · Cloud · Full-Stack",
      "Link to LinkedIn and portfolio",
      "Consistent commit history (green squares)",
    ],
  },
  {
    title: "LinkedIn",
    items: [
      'Headline: "Software Engineer | Full-Stack • Cloud • AI • Security"',
      "About: 3 short paragraphs (who, what you build, what you want)",
      "Featured: capstone project, demo video, GitHub",
      "Skills: React, Node/FastAPI, AWS, Docker, PostgreSQL, OpenAI/Claude APIs",
      "Weekly post about something you built",
      "Banner image showcasing your stack",
    ],
  },
  {
    title: "Portfolio website",
    items: [
      "Hero with one-line value proposition",
      "Top 4–6 projects with screenshots and live links",
      "Each project has: problem, stack, features, GitHub, demo",
      "Contact form / email",
      "About section with story",
      "Resume download",
    ],
  },
  {
    title: "Resume",
    items: [
      "1 page (or 2 if 5+ years)",
      "Header with name, role, links (GitHub, LinkedIn, portfolio)",
      "5–8 quantified bullets per project",
      "Skills grouped by domain",
      "Tailored per role applied to",
    ],
  },
];

const HEADLINES = [
  "Software Engineer | Full-Stack • Cloud • AI • Security",
  "AI Cloud Full-Stack Engineer | React • AWS • AI APIs • Secure Backend",
  "Full-Stack Developer with Cloud + AI Automation",
  "Junior Software Engineer | Building AI-powered cloud apps",
];

const ABOUT_IDEAS = [
  "I build full-stack apps that ship to production: React + Node/FastAPI, deployed on AWS, hardened against OWASP Top 10, and enhanced with AI APIs.",
  "Currently completing an 84-day intensive path covering software engineering, cloud, security, AI APIs, and automation — with one shipped project every two weeks.",
  "My capstone is an AI-powered cloud security monitoring dashboard: log ingestion, anomaly detection, LLM incident summaries, and automated alerts.",
];

export const Route = createFileRoute("/branding")({
  head: () => ({
    meta: [
      { title: "Personal Branding · Learning OS" },
      {
        name: "description",
        content:
          "Personal Branding — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engine",
      },
      { property: "og:title", content: "Personal Branding · Learning OS" },
      {
        property: "og:description",
        content:
          "Personal Branding — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engine",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Branding,
});

function Branding() {
  const [done, setDone] = useBranding();
  const [copied, setCopied] = useState("");

  return (
    <div>
      <PageHeader
        eyebrow="Make recruiters say yes before the call"
        title="Personal Branding"
        description="Your projects are only half the story. The other half is presenting them — GitHub, LinkedIn, portfolio, resume."
      />

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
            Headline ideas
          </div>
          {HEADLINES.map((h) => (
            <div
              key={h}
              className="mb-2 flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-sm"
            >
              <span>{h}</span>
              <button
                aria-label="Copy to clipboard"
                onClick={() => {
                  navigator.clipboard.writeText(h);
                  setCopied(h);
                  setTimeout(() => setCopied(""), 1200);
                }}
                className="text-muted-foreground hover:text-primary"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {copied && <div className="text-[11px] text-primary">Copied!</div>}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
            About section ideas
          </div>
          {ABOUT_IDEAS.map((a, i) => (
            <div
              key={i}
              className="mb-2 rounded-md border border-border bg-background/40 px-3 py-2 text-sm"
            >
              <p>{a}</p>
              <button
                onClick={() => navigator.clipboard.writeText(a)}
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => {
          const completed = s.items.filter((it) => done[`${s.title}::${it}`]).length;
          return (
            <div key={s.title} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">{s.title}</div>
                <div className="text-xs text-muted-foreground">
                  {completed}/{s.items.length}
                </div>
              </div>
              <ul className="space-y-1.5">
                {s.items.map((it) => {
                  const key = `${s.title}::${it}`;
                  const ok = !!done[key];
                  return (
                    <li key={it}>
                      <button
                        onClick={() => setDone((d) => ({ ...d, [key]: !d[key] }))}
                        className="flex w-full items-start gap-2 text-left text-sm"
                      >
                        <CheckCircle2
                          className={`mt-0.5 h-4 w-4 shrink-0 ${ok ? "text-primary" : "text-muted-foreground/50"}`}
                        />
                        <span className={ok ? "text-muted-foreground line-through" : ""}>{it}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
