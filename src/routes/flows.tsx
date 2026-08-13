import type { LucideIcon } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import {
  Code2,
  Cloud,
  ShieldCheck,
  Bot,
  Zap,
  Rocket,
  Github,
  TrendingUp,
  Database,
  Server,
  Bell,
} from "lucide-react";

export const Route = createFileRoute("/flows")({
  head: () => ({
    meta: [
      { title: "Visual Learning Flows · Learning OS" },
      {
        name: "description",
        content:
          "Animated visual flows for learning, AI APIs, automation, cloud, security, and DSA.",
      },

      { property: "og:title", content: "Visual Learning Flows · Learning OS" },
      {
        property: "og:description",
        content:
          "Animated visual flows for learning, AI APIs, automation, cloud, security, and DSA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Flows,
});

function Flow({
  title,
  description,
  nodes,
}: {
  title: string;
  description: string;
  nodes: { label: string; Icon: LucideIcon; tone?: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2 overflow-x-auto">
        {nodes.map((n, i) => (
          <div key={n.label} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-xl border bg-background/40 px-3 py-2 text-xs transition-all hover:-translate-y-0.5 ${
                n.tone ?? "border-border"
              }`}
              style={{ animation: `pulse 3s ${i * 0.1}s infinite` }}
            >
              <n.Icon className="h-4 w-4" />
              <span className="font-medium">{n.label}</span>
            </div>
            {i < nodes.length - 1 && <span className="text-primary">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Flows() {
  return (
    <div>
      <PageHeader
        eyebrow="Visual Flows"
        title="See the path, then walk it"
        description="High-level mental models. Bookmark these — you'll see them again in every project."
      />

      <div className="grid gap-5">
        <Flow
          title="Main Learning Flow"
          description="The full 84-day arc from first script to job-ready engineer."
          nodes={[
            { label: "Software", Icon: Code2, tone: "border-track-software/40" },
            { label: "Full-Stack", Icon: Code2, tone: "border-track-fullstack/40" },
            { label: "Cloud", Icon: Cloud, tone: "border-track-cloud/40" },
            { label: "Security", Icon: ShieldCheck, tone: "border-track-security/40" },
            { label: "AI", Icon: Bot, tone: "border-track-ai/40" },
            { label: "Automation", Icon: Zap, tone: "border-track-automation/40" },
            { label: "Capstone", Icon: Rocket, tone: "border-primary/40" },
            { label: "Portfolio", Icon: Github },
            { label: "Job Ready", Icon: TrendingUp },
          ]}
        />
        <Flow
          title="AI API Flow"
          description="How AI calls move through a real app without leaking keys."
          nodes={[
            { label: "Frontend input", Icon: Code2 },
            { label: "Backend API", Icon: Server },
            { label: ".env key", Icon: ShieldCheck },
            { label: "LLM API", Icon: Bot },
            { label: "Response", Icon: Bot },
            { label: "Database", Icon: Database },
            { label: "Dashboard", Icon: Code2 },
          ]}
        />
        <Flow
          title="AI Automation Flow"
          description="Triggers, AI, decisions, actions and notifications."
          nodes={[
            { label: "Trigger", Icon: Bell },
            { label: "Input", Icon: Code2 },
            { label: "AI process", Icon: Bot },
            { label: "Decision", Icon: ShieldCheck },
            { label: "Action", Icon: Zap },
            { label: "Notify", Icon: Bell },
            { label: "Store result", Icon: Database },
          ]}
        />
        <Flow
          title="AI Coding Flow (Safe)"
          description="Try → ask → build small → review → test → commit → document."
          nodes={[
            { label: "Requirement", Icon: Code2 },
            { label: "AI plan", Icon: Bot },
            { label: "Small change", Icon: Code2 },
            { label: "Review", Icon: ShieldCheck },
            { label: "Test", Icon: ShieldCheck },
            { label: "Commit", Icon: Github },
            { label: "Document", Icon: Code2 },
          ]}
        />
        <Flow
          title="Cloud Deployment Flow"
          description="Local → GitHub → AWS → public app."
          nodes={[
            { label: "Local app", Icon: Code2 },
            { label: "GitHub", Icon: Github },
            { label: "EC2 / S3", Icon: Cloud },
            { label: "IAM / SG", Icon: ShieldCheck },
            { label: "CloudWatch", Icon: Bell },
            { label: "Public app", Icon: Rocket },
          ]}
        />
        <Flow
          title="Security Flow"
          description="Every request gets validated, authed, and logged."
          nodes={[
            { label: "User input", Icon: Code2 },
            { label: "Validation", Icon: ShieldCheck },
            { label: "Auth", Icon: ShieldCheck },
            { label: "Database", Icon: Database },
            { label: "Logs", Icon: Bell },
            { label: "Security checks", Icon: ShieldCheck },
          ]}
        />
        <Flow
          title="DSA Flow"
          description="Don't memorize. Walk this for every problem."
          nodes={[
            { label: "Understand", Icon: Code2 },
            { label: "Brute force", Icon: Code2 },
            { label: "Pattern", Icon: Bot },
            { label: "Optimize", Icon: Zap },
            { label: "Code", Icon: Code2 },
            { label: "Test", Icon: ShieldCheck },
            { label: "Explain", Icon: TrendingUp },
          ]}
        />
      </div>

      {/* AI safe vs bad workflow */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <h3 className="font-semibold text-primary">✅ Safe AI workflow</h3>
          <ol className="mt-3 space-y-1.5 text-sm">
            <li>1. Try yourself first.</li>
            <li>2. Ask AI for an explanation.</li>
            <li>3. Build a small part.</li>
            <li>4. Ask AI to review.</li>
            <li>5. Test locally.</li>
            <li>6. Fix mistakes yourself.</li>
            <li>7. Write notes.</li>
            <li>8. Commit to GitHub.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="font-semibold text-destructive">❌ Bad AI workflow</h3>
          <ol className="mt-3 space-y-1.5 text-sm">
            <li>1. Ask AI to build the full project.</li>
            <li>2. Copy + paste.</li>
            <li>3. Don't understand the code.</li>
            <li>4. Can't explain in interview.</li>
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">
            ⚠ Don't paste API keys, don't blindly run commands, don't trust generated security code,
            don't let AI solve DSA for you, don't push code you can't explain.
          </p>
        </div>
      </div>
    </div>
  );
}
