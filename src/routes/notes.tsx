import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DAYS } from "@/lib/days";
import { useNotes, useSettings, type SettingsState } from "@/lib/storage";
import { Bell, Calendar, FileDown, Copy } from "lucide-react";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes & Export · Learning OS" },
      {
        name: "description",
        content: "Your daily notes, plus reminders and one-click Notion/Calendar export.",
      },

      { property: "og:title", content: "Notes & Export · Learning OS" },
      {
        property: "og:description",
        content: "Your daily notes, plus reminders and one-click Notion/Calendar export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Notes,
});

function Notes() {
  const [notes, setNotes] = useNotes();
  const [settings, setSettings] = useSettings();
  const [dayNum, setDayNum] = useState(1);
  const day = DAYS[dayNum - 1];
  const value = notes[`d${day.day}`] ?? "";

  const md = useMemo(() => {
    return `# ${day.topic} (Day ${day.day})\n\n**Track:** ${day.track}\n**Project:** ${day.build.project}\n**AI tool:** ${day.ai.tool}\n\n## What I understood\n\n${value || "_(write here)_"}\n\n## Resources\n- ${day.learn.resource}\n- ${day.watch.channel}\n`;
  }, [day, value]);

  return (
    <div>
      <PageHeader
        eyebrow="Notes · Export · Reminders"
        title="Capture what you learned"
        description="Spaced-repetition starts with writing it down in your own words."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Mode</label>
            <select
              aria-label="Learning mode"
              value={settings.mode}
              onChange={(e) =>
                setSettings({ ...settings, mode: e.target.value as SettingsState["mode"] })
              }
              className="rounded-md border border-border bg-card px-2 py-1 text-xs"
            >
              <option value="beginner">Beginner</option>
              <option value="normal">Normal</option>
            </select>
            <label className="text-xs text-muted-foreground">Pace</label>
            <select
              aria-label="Daily pace"
              value={settings.pace}
              onChange={(e) =>
                setSettings({ ...settings, pace: e.target.value as SettingsState["pace"] })
              }
              className="rounded-md border border-border bg-card px-2 py-1 text-xs"
            >
              <option value="slow">Slow (1–2h)</option>
              <option value="normal">Normal (3–4h)</option>
              <option value="fast">Fast (8–10h)</option>
            </select>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Day notes</h3>
            <div className="flex items-center gap-1">
              <button
                aria-label="Previous day"
                onClick={() => setDayNum(Math.max(1, dayNum - 1))}
                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                ←
              </button>
              <span className="text-xs">Day {dayNum}</span>
              <button
                aria-label="Next day"
                onClick={() => setDayNum(Math.min(84, dayNum + 1))}
                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                →
              </button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {day.topic} · {day.track}
          </div>
          <textarea
            aria-label="What I understood, what confused me, bugs I fixed, commands learned, AI prompt I used..."
            value={value}
            onChange={(e) => setNotes({ ...notes, [`d${day.day}`]: e.target.value })}
            placeholder="What I understood, what confused me, bugs I fixed, commands learned, AI prompt I used..."
            className="mt-3 min-h-[260px] w-full rounded-lg border border-border bg-background/40 p-3 font-mono text-xs leading-relaxed focus:border-primary/40 focus:outline-none"
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <FileDown className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Export</h3>
            </div>
            <pre className="max-h-56 overflow-auto rounded-lg border border-border bg-background/40 p-3 text-xs">
              {md}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(md)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
              >
                <Copy className="h-3 w-3" /> Copy as Notion Markdown
              </button>
              <a
                href={`data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`}
                download={`day-${day.day}.md`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
              >
                <FileDown className="h-3 w-3" /> Download .md
              </a>
              <a
                href={`data:text/calendar;charset=utf-8,${encodeURIComponent(
                  `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Day ${day.day} - ${day.topic}\nDESCRIPTION:${day.build.feature}\nEND:VEVENT\nEND:VCALENDAR`,
                )}`}
                download={`day-${day.day}.ics`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
              >
                <Calendar className="h-3 w-3" /> Add to Calendar (.ics)
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Reminders</h3>
            </div>
            <ul className="space-y-1.5 text-sm">
              {[
                "Daily study reminder (1 mission/day)",
                "Daily DSA reminder (30–45 min)",
                "Daily GitHub push reminder",
                "Weekly review reminder",
                "Spaced-repetition revision reminder",
                "AWS cost reminder (stop EC2, check billing)",
                "Project deadline reminder",
                "Interview practice reminder",
              ].map((r) => (
                <li
                  key={r}
                  className="rounded-md border border-border bg-background/40 px-3 py-2 text-xs"
                >
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Tip: copy these into Google Calendar / Notion / your reminder app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
