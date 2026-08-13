import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CHEATSHEETS } from "@/lib/cheatsheets";
import { Copy, Search } from "lucide-react";

export const Route = createFileRoute("/cheatsheets")({
  head: () => ({
    meta: [
      { title: "Command Cheat Sheets · Learning OS" },
      {
        name: "description",
        content:
          "Command Cheat Sheets — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Eng",
      },
      { property: "og:title", content: "Command Cheat Sheets · Learning OS" },
      {
        property: "og:description",
        content:
          "Command Cheat Sheets — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Eng",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cheat,
});

function Cheat() {
  const [active, setActive] = useState(CHEATSHEETS[0].name);
  const [q, setQ] = useState("");
  const sheet = CHEATSHEETS.find((s) => s.name === active)!;
  const cmds = sheet.cmds.filter(
    (c) => !q || (c.cmd + c.what + c.example).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Recall fast. Type faster."
        title="Command Cheat Sheets"
        description="The 80% of commands you'll actually run during the 84-day path."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {CHEATSHEETS.map((s) => (
          <button
            key={s.name}
            onClick={() => setActive(s.name)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              active === s.name
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          aria-label={`Search ${sheet.name} commands`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${sheet.name} commands`}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {cmds.map((c, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono text-sm text-primary">{c.cmd}</code>
              <button
                onClick={() => navigator.clipboard.writeText(c.example)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <div className="mt-1 text-sm">{c.what}</div>
            <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background/40 p-2 text-[11px]">
              {c.example}
            </pre>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-foreground">When:</span> {c.when}
            </div>
            {c.mistake && <div className="text-xs text-warning">⚠ Mistake: {c.mistake}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
