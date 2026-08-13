import type { LucideIcon } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useSafety } from "@/lib/extra";
import { CheckCircle2, Cloud, KeyRound, AlertTriangle } from "lucide-react";

const CLOUD = [
  "Billing alert created in AWS Billing Console",
  "Free Tier limits reviewed for EC2, S3, RDS",
  "EC2 instances stopped when not in use",
  "Unused EBS volumes deleted",
  "S3 public access reviewed (block by default)",
  "RDS stopped or deleted when not in use",
  "IAM users follow least-privilege policies",
  "CloudWatch alarms exist for cost & error spikes",
  "Root account MFA enabled",
  "Access keys rotated (never embedded in code)",
];

const APIK = [
  "All API keys stored only in .env",
  ".env added to .gitignore (and not in last commit)",
  "Keys never exposed in frontend bundle / VITE_* with secrets",
  "Keys never pasted into AI chat tools",
  "Backend proxy used for client → AI API calls",
  "Error messages don't echo secrets",
  "Keys rotated immediately if pushed by accident",
  "Separate dev/prod keys",
  "Rate limit + auth on routes that spend API credits",
];

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Cost & Key Safety · Learning OS" },
      {
        name: "description",
        content:
          "Cost & Key Safety — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engine",
      },
      { property: "og:title", content: "Cost & Key Safety · Learning OS" },
      {
        property: "og:description",
        content:
          "Cost & Key Safety — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engine",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Safety,
});

function Safety() {
  const [state, setState] = useSafety();

  function Panel({
    title,
    items,
    icon: Icon,
    accent,
  }: {
    title: string;
    items: string[];
    icon: LucideIcon;
    accent: string;
  }) {
    const completed = items.filter((it) => state[`${title}::${it}`]).length;
    const pct = Math.round((completed / items.length) * 100);
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`grid h-9 w-9 place-items-center rounded-lg ${accent}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground">
                {completed}/{items.length} · {pct}%
              </div>
            </div>
          </div>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-flow" style={{ width: `${pct}%` }} />
        </div>
        <ul className="space-y-1.5">
          {items.map((it) => {
            const k = `${title}::${it}`;
            const ok = !!state[k];
            return (
              <li key={it}>
                <button
                  onClick={() => setState((s) => ({ ...s, [k]: !s[k] }))}
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
  }

  return (
    <div>
      <PageHeader
        eyebrow="Don't get a $200 surprise bill"
        title="Safety Panels"
        description="Cloud and API keys are the two ways junior engineers leak money or secrets. Run these checklists before each project."
      />

      <div className="mb-5 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          <div>
            <div className="font-medium">
              Cloud learning is good — unused cloud resources cost money.
            </div>
            <p className="text-xs text-muted-foreground">
              If you spin up an EC2 to learn, stop or terminate it the same day. Set a billing alert
              at $5 minimum.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel
          title="AWS cost safety"
          items={CLOUD}
          icon={Cloud}
          accent="bg-track-cloud/15 text-track-cloud"
        />
        <Panel
          title="API key safety"
          items={APIK}
          icon={KeyRound}
          accent="bg-warning/15 text-warning"
        />
      </div>
    </div>
  );
}
