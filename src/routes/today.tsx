import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DAYS, TRACK_COLOR, type Day } from "@/lib/days";
import { useProgress, useXP, useSettings } from "@/lib/storage";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Copy,
  Github,
  ListChecks,
  Sparkles,
  AlertTriangle,
  Sun,
  CalendarPlus,
} from "lucide-react";

export const Route = createFileRoute("/today")({
  head: () => ({
    meta: [
      { title: "Today's Mission · Learning OS" },
      {
        name: "description",
        content: "Your AI-guided daily mission: learn, practice, build, commit.",
      },

      { property: "og:title", content: "Today's Mission · Learning OS" },
      {
        property: "og:description",
        content: "Your AI-guided daily mission: learn, practice, build, commit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Today,
});

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const XP_BY_KIND: Record<string, number> = {
  learn: 10,
  watch: 10,
  practice: 15,
  build: 50,
  dsa: 20,
  test: 20,
  github: 10,
  stretch: 25,
};

function Checkbox({ id }: { id: string }) {
  const { progress, toggle } = useProgress();
  const [, setXP] = useXP();
  const checked = !!progress[id];
  const kind = id.split(".")[1] ?? "learn";
  const reward = XP_BY_KIND[kind] ?? 10;
  return (
    <button
      onClick={() => {
        toggle(id);
        if (!checked) {
          setXP((x) => ({ ...x, xp: x.xp + reward }));
          if (kind === "build") {
            import("@/components/visuals").then((m) => m.fireConfetti());
          }
        }
      }}
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors ${
        checked
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      <CheckCircle2
        className={`h-3.5 w-3.5 ${checked ? "text-primary" : "text-muted-foreground"}`}
      />
      {checked ? `Done +${reward} XP` : `Mark done · +${reward} XP`}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] hover:bg-muted"
    >
      <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Today() {
  const { progress } = useProgress();
  const [settings] = useSettings();
  const current = useMemo<Day>(() => {
    for (const d of DAYS) if (!progress[`d${d.day}.build`]) return d;
    return DAYS[DAYS.length - 1];
  }, [progress]);
  const [dayNum, setDayNum] = useState<number>(current.day);
  const d = DAYS[dayNum - 1];

  const beginner = settings.mode === "beginner";
  const fast = settings.pace === "fast";
  const slow = settings.pace === "slow";
  // DSA is optional / "advanced for now" in Beginner mode or Slow pace
  const showDSA = !beginner && !slow;
  // Self-test is the only essential learn-check in slow pace
  const showWatch = !slow;
  const paceTime =
    settings.pace === "fast"
      ? "8h focused (Fast Track)"
      : settings.pace === "slow"
        ? "1–2h essentials only (Slow)"
        : "3–4h balanced (Normal)";

  return (
    <div>
      <PageHeader
        eyebrow={`Day ${d.day} · Week ${d.week} · ${d.track}`}
        title={d.topic}
        description={d.goal}
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              <button
                aria-label="Previous day"
                onClick={() => setDayNum(Math.max(1, dayNum - 1))}
                className="rounded-md px-2 py-1 text-xs hover:bg-muted"
              >
                ←
              </button>
              <span className="px-2 text-xs font-medium">Day {dayNum}</span>
              <button
                aria-label="Next day"
                onClick={() => setDayNum(Math.min(84, dayNum + 1))}
                className="rounded-md px-2 py-1 text-xs hover:bg-muted"
              >
                →
              </button>
            </div>
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs hover:bg-muted"
            >
              <ListChecks className="h-3.5 w-3.5" /> See all 84 days
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <span className="font-semibold text-primary">
          {beginner ? "Beginner Mode" : "Normal Mode"}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="capitalize">{settings.pace} pace</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {beginner
            ? "Simpler explanations, advanced/optional tasks hidden."
            : "Full workload with DSA, tests and stretch goals."}
        </span>
        <Link to="/roadmap" className="ml-auto text-primary hover:underline">
          Change in sidebar →
        </Link>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Why this matters
          </div>
          <p className="mt-1 text-sm">{d.why}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Today's pace
          </div>
          <p className="mt-1 text-sm">{paceTime}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{d.time}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Connection
          </div>
          <p className="mt-1 text-sm">{d.prev}</p>
          <p className="mt-1 text-xs text-muted-foreground">Next: {d.next}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Morning · Learn" icon={Sun}>
          <p className="mb-3 text-sm">{d.learn.summary}</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {d.learn.subtopics.map((s) => (
              <span
                key={s}
                className="rounded-md border border-border bg-background/40 px-2 py-0.5 text-[11px]"
              >
                {s}
              </span>
            ))}
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>📘 Resource: {d.learn.resource}</li>
            <li>
              🎬 YouTube: {d.watch.channel} — {d.watch.focus} (~{d.watch.mins} min)
            </li>
            <li>🧯 Skip for now: {d.learn.skip}</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Checkbox id={`d${d.day}.learn`} />
            {showWatch && <Checkbox id={`d${d.day}.watch`} />}
          </div>
        </Section>

        <Section title="Midday · Practice" icon={ListChecks}>
          <div className="text-sm">
            Tool: <span className="font-medium">{d.practice.tool}</span>
          </div>
          <ol className="mt-2 space-y-1 text-sm list-decimal pl-5">
            {d.practice.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="mt-3 rounded-md border border-border bg-background/40 p-3 text-xs">
            <div>
              <span className="text-muted-foreground">Expected output:</span> {d.practice.output}
            </div>
            <div className="mt-1 text-warning">⚠ Common mistake: {d.practice.mistake}</div>
          </div>
          <div className="mt-3">
            <Checkbox id={`d${d.day}.practice`} />
          </div>
        </Section>

        <Section title="Afternoon · Build" icon={ChevronRight}>
          <div className="mb-2 text-sm">
            Project: <span className="font-medium">{d.build.project}</span>
          </div>
          <div className="text-sm">Feature: {d.build.feature}</div>
          <ol className="mt-2 space-y-1 text-sm list-decimal pl-5">
            {d.build.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <Checkbox id={`d${d.day}.build`} />
          </div>
        </Section>

        <Section title="Evening · AI Review" icon={Bot}>
          <div className="text-sm">
            AI tool: <span className="font-medium">{d.ai.tool}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{d.ai.why}</p>
          <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 font-mono text-xs">
            {d.ai.prompt}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <CopyButton text={d.ai.prompt} />
            <span className="text-[11px] text-muted-foreground">{d.ai.how}</span>
          </div>
          <div className="mt-3 rounded-md border border-warning/20 bg-warning/5 p-2.5 text-[11px]">
            <div className="flex gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" /> {d.ai.safety}
            </div>
            <div className="mt-1 text-muted-foreground">Verify yourself: {d.ai.verify}</div>
          </div>
        </Section>

        {showDSA ? (
          <Section title="DSA · 30–45 min" icon={ListChecks}>
            <div className="text-sm">Topic: {d.dsa.topic}</div>
            <div className="text-sm">Problem type: {d.dsa.problemType}</div>
            <div className="text-xs text-muted-foreground">Resource: {d.dsa.resource}</div>
            <div className="mt-2 rounded-lg border border-border bg-background/40 p-3 text-xs font-mono">
              {d.dsa.hintPrompt}
            </div>
            <div className="mt-3 flex gap-2">
              <CopyButton text={d.dsa.hintPrompt} />
              <Checkbox id={`d${d.day}.dsa`} />
            </div>
          </Section>
        ) : (
          <Section title="DSA · Optional (hidden)" icon={ListChecks}>
            <p className="text-xs text-muted-foreground">
              Hidden because you're in{" "}
              <span className="text-foreground">{beginner ? "Beginner Mode" : "Slow pace"}</span>.
              DSA practice is queued for later — switch to Normal/Fast pace to unlock today's
              problem ({d.dsa.topic}).
            </p>
          </Section>
        )}

        {fast && (
          <Section title="Stretch Goal · Fast Track" icon={Sparkles}>
            <p className="text-sm">
              Push further on <span className="font-medium">{d.build.project}</span>: add a second
              small feature, write one automated test, and update the README diagram.
            </p>
            <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
              <li>Refactor one function using {d.ai.tool} review</li>
              <li>Add error handling around today's new code path</li>
              <li>Write a 3-line interview answer about what you built</li>
            </ul>
            <div className="mt-3">
              <Checkbox id={`d${d.day}.stretch`} />
            </div>
          </Section>
        )}

        <Section title="Test · Self-Check" icon={CheckCircle2}>
          <ul className="space-y-1 text-sm list-disc pl-5">
            {d.test.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <div className="mt-3">
            <Checkbox id={`d${d.day}.test`} />
          </div>
        </Section>

        <Section title="GitHub Commit" icon={Github}>
          <div className="text-sm">Files: {d.github.files}</div>
          <div className="mt-2 rounded-md border border-border bg-background/40 p-3 font-mono text-xs">
            git commit -m "{d.github.commitMsg}"
          </div>
          <div className="mt-1 text-xs text-muted-foreground">README: {d.github.readme}</div>
          <div className="mt-3 flex gap-2">
            <CopyButton text={`git commit -m "${d.github.commitMsg}"`} />
            <Checkbox id={`d${d.day}.github`} />
          </div>
        </Section>

        <Section title="Calendar / Notion Export" icon={CalendarPlus}>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => {
                const text = `# Day ${d.day} · ${d.topic}\n\n**Track:** ${d.track}\n**Project:** ${d.build.project}\n\n## Learn\n- ${d.learn.summary}\n- Resource: ${d.learn.resource}\n\n## Build\n- ${d.build.feature}\n\n## AI\n- Tool: ${d.ai.tool}\n- Prompt: ${d.ai.prompt}\n\n## Commit\n${d.github.commitMsg}`;
                navigator.clipboard.writeText(text);
              }}
              className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-left text-xs hover:bg-muted"
            >
              📋 Copy day as Notion Markdown
            </button>
            <button
              onClick={() => {
                const text = `Day ${d.day} · ${d.topic} — ${d.build.feature} (AI: ${d.ai.tool})`;
                navigator.clipboard.writeText(text);
              }}
              className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-left text-xs hover:bg-muted"
            >
              📅 Copy Google Calendar event text
            </button>
            <a
              href={`data:text/calendar;charset=utf-8,${encodeURIComponent(
                `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Learning OS Day ${d.day} - ${d.topic}\nDESCRIPTION:${d.build.feature}\nEND:VEVENT\nEND:VCALENDAR`,
              )}`}
              download={`day-${d.day}.ics`}
              className="block w-full rounded-md border border-border bg-background/40 px-3 py-2 text-left text-xs hover:bg-muted"
            >
              📥 Download .ics for today
            </a>
          </div>
        </Section>
      </div>

      <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-5 text-sm">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          <div>
            <div className="font-medium">Did you ship a real output today?</div>
            <p className="text-xs text-muted-foreground">
              Learning is incomplete until you build and commit something. Aim for one file/commit
              per day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
