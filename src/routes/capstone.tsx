import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Rocket, Copy } from "lucide-react";

export const Route = createFileRoute("/capstone")({
  head: () => ({
    meta: [
      { title: "Final Capstone · Learning OS" },
      {
        name: "description",
        content:
          "AI-Powered Cloud Security Monitoring Dashboard — your portfolio-defining capstone.",
      },

      { property: "og:title", content: "Final Capstone · Learning OS" },
      {
        property: "og:description",
        content:
          "AI-Powered Cloud Security Monitoring Dashboard — your portfolio-defining capstone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Capstone,
});

const FEATURES = [
  "User login (JWT)",
  "Admin dashboard",
  "Log upload endpoint",
  "Log parser",
  "Failed login detection",
  "Suspicious IP detection",
  "AI incident summary",
  "Risk score",
  "Alert automation (n8n/Make/Zapier)",
  "Database persistence",
  "Cloud deployment notes (AWS)",
  "Docker setup",
  "README + architecture diagram",
  "Screenshots",
  "Resume bullet",
  "Interview explanation",
];

const ARCH = [
  "React Dashboard",
  "Backend API",
  "Database",
  "Log Upload",
  "Parser",
  "Failed Login Detection",
  "Suspicious IP Detection",
  "AI Incident Summary",
  "Alert Automation",
  "CloudWatch / AWS Logs",
  "Security Report",
  "GitHub Portfolio",
];

const RESUME =
  "Built an AI-powered cloud security monitoring dashboard using React, Node.js/FastAPI, AWS CloudWatch, Docker, PostgreSQL/Firebase, and AI APIs to detect suspicious log patterns, summarize incidents, and automate alerting workflows.";

function Capstone() {
  return (
    <div>
      <PageHeader
        eyebrow="Capstone · Day 78–84"
        title="AI-Powered Cloud Security Monitoring Dashboard"
        description="One project that proves the whole stack: full-stack + cloud + security + AI + automation."
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Architecture
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {ARCH.map((a, i) => (
            <div key={a} className="flex items-center gap-2">
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                {a}
              </div>
              {i < ARCH.length - 1 && <span className="text-primary">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card md:col-span-2">
          <h3 className="text-sm font-semibold">Feature checklist</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {FEATURES.map((f) => (
              <li key={f} className="rounded-md border border-border bg-background/40 p-2 text-xs">
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold">Tech stack</h3>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            <li>React + Tailwind</li>
            <li>Node.js/Express or FastAPI</li>
            <li>PostgreSQL or Firebase</li>
            <li>AWS EC2 / S3 / CloudWatch / IAM</li>
            <li>Docker + GitHub Actions</li>
            <li>OpenAI / Claude / Hugging Face</li>
            <li>n8n / Make / Zapier</li>
            <li>JWT, rate limiting, input validation</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center gap-2 text-primary">
          <Rocket className="h-4 w-4" />
          <h3 className="font-semibold">Resume bullet</h3>
        </div>
        <p className="mt-2 text-sm">{RESUME}</p>
        <button
          onClick={() => navigator.clipboard.writeText(RESUME)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
        >
          <Copy className="h-3 w-3" /> Copy resume bullet
        </button>
      </div>
    </div>
  );
}
