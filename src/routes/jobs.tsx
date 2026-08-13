import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useJobApps, type JobApp } from "@/lib/extra";
import { Briefcase, Plus, Trash2 } from "lucide-react";

const STATUSES: JobApp["status"][] = [
  "Saved",
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected",
];

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Job Application Tracker · Learning OS" },
      {
        name: "description",
        content:
          "Job Application Tracker — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud ",
      },
      { property: "og:title", content: "Job Application Tracker · Learning OS" },
      {
        property: "og:description",
        content:
          "Job Application Tracker — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud ",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Jobs,
});

function Jobs() {
  const [apps, setApps] = useJobApps();
  const [draft, setDraft] = useState<Partial<JobApp>>({ status: "Saved" });

  function add() {
    if (!draft.company || !draft.role) return;
    setApps((arr) => [
      {
        id: `j_${Date.now()}`,
        createdAt: Date.now(),
        company: draft.company!,
        role: draft.role!,
        link: draft.link ?? "",
        status: (draft.status as JobApp["status"]) ?? "Saved",
        resumeVersion: draft.resumeVersion ?? "",
        projectsUsed: draft.projectsUsed ?? "",
        notes: draft.notes ?? "",
        followUpDate: draft.followUpDate ?? "",
        interviewDate: draft.interviewDate ?? "",
        result: draft.result ?? "",
      },
      ...arr,
    ]);
    setDraft({ status: "Saved" });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Apply with intent"
        title="Job Application Tracker"
        description="Track every application, tie it to a portfolio project, plan your follow-up."
      />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-6">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-lg border border-border bg-card p-2 text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s}</div>
            <div className="text-lg font-semibold">{apps.filter((a) => a.status === s).length}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Briefcase className="h-4 w-4 text-primary" /> New application
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <input
            aria-label="Company"
            placeholder="Company"
            value={draft.company ?? ""}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <input
            aria-label="Role"
            placeholder="Role"
            value={draft.role ?? ""}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <input
            aria-label="Link"
            placeholder="Link"
            value={draft.link ?? ""}
            onChange={(e) => setDraft({ ...draft, link: e.target.value })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <select
            aria-label="Application status"
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as JobApp["status"] })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            aria-label="Resume version"
            placeholder="Resume version"
            value={draft.resumeVersion ?? ""}
            onChange={(e) => setDraft({ ...draft, resumeVersion: e.target.value })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <input
            aria-label="Projects used"
            placeholder="Projects used"
            value={draft.projectsUsed ?? ""}
            onChange={(e) => setDraft({ ...draft, projectsUsed: e.target.value })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <input
            aria-label="Follow-up date"
            placeholder="Follow-up date"
            value={draft.followUpDate ?? ""}
            onChange={(e) => setDraft({ ...draft, followUpDate: e.target.value })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <input
            aria-label="Interview date"
            placeholder="Interview date"
            value={draft.interviewDate ?? ""}
            onChange={(e) => setDraft({ ...draft, interviewDate: e.target.value })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <input
            aria-label="Result"
            placeholder="Result"
            value={draft.result ?? ""}
            onChange={(e) => setDraft({ ...draft, result: e.target.value })}
            className="rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
          />
          <textarea
            aria-label="Notes"
            placeholder="Notes"
            value={draft.notes ?? ""}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            className="md:col-span-3 rounded-md border border-border bg-background/40 px-2 py-1.5 text-xs"
            rows={2}
          />
        </div>
        <button
          onClick={add}
          className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Add application
        </button>
      </div>

      <div className="space-y-2">
        {apps.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">
                  {a.role} <span className="text-muted-foreground">· {a.company}</span>
                </div>
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {a.link}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Update application status"
                  value={a.status}
                  onChange={(e) =>
                    setApps((arr) =>
                      arr.map((x) =>
                        x.id === a.id ? { ...x, status: e.target.value as JobApp["status"] } : x,
                      ),
                    )
                  }
                  className="rounded-md border border-border bg-background/40 px-2 py-1 text-[11px]"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button
                  aria-label="Delete application"
                  onClick={() => setApps((arr) => arr.filter((x) => x.id !== a.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 grid gap-1.5 text-xs md:grid-cols-2">
              {a.projectsUsed && (
                <div>
                  <span className="text-muted-foreground">Projects:</span> {a.projectsUsed}
                </div>
              )}
              {a.resumeVersion && (
                <div>
                  <span className="text-muted-foreground">Resume:</span> {a.resumeVersion}
                </div>
              )}
              {a.followUpDate && (
                <div>
                  <span className="text-muted-foreground">Follow-up:</span> {a.followUpDate}
                </div>
              )}
              {a.interviewDate && (
                <div>
                  <span className="text-muted-foreground">Interview:</span> {a.interviewDate}
                </div>
              )}
              {a.notes && <div className="md:col-span-2 text-muted-foreground">{a.notes}</div>}
            </div>
          </div>
        ))}
        {apps.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No applications yet. Track every one — patterns appear after 10.
          </div>
        )}
      </div>
    </div>
  );
}
