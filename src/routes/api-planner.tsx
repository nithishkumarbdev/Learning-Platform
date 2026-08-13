import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useLocalStorage } from "@/lib/storage";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/api-planner")({
  head: () => ({
    meta: [
      { title: "API Route Planner · Learning OS" },
      {
        name: "description",
        content:
          "API Route Planner — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engine",
      },
      { property: "og:title", content: "API Route Planner · Learning OS" },
      {
        property: "og:description",
        content:
          "API Route Planner — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud Engine",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type Route = {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  requestBody: string;
  responseBody: string;
  authRequired: boolean;
  validation: string;
  errors: string;
  testCase: string;
  status: "planned" | "wip" | "done";
  notes: string;
};

const METHOD_COLORS: Record<string, string> = {
  GET: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  POST: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  PUT: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  PATCH: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  DELETE: "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

function newRoute(): Route {
  return {
    id: `r${Date.now()}`,
    name: "",
    method: "GET",
    endpoint: "/api/",
    requestBody: "",
    responseBody: "",
    authRequired: false,
    validation: "",
    errors: "401, 400, 500",
    testCase: "",
    status: "planned",
    notes: "",
  };
}

function Page() {
  const [routes, setRoutes] = useLocalStorage<Route[]>("los_api_planner_v1", []);
  const [open, setOpen] = useState<string | null>(null);

  function update(id: string, patch: Partial<Route>) {
    setRoutes((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Planner"
        title="API Route Planner"
        description="Design each endpoint before you code it: method, body, auth, validation, errors, tests."
        actions={
          <button
            onClick={() => {
              const r = newRoute();
              setRoutes((rs) => [...rs, r]);
              setOpen(r.id);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New route
          </button>
        }
      />

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="text-xs text-muted-foreground">Request flow</div>
        <div className="mt-2 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            "Client",
            "Route",
            "Middleware (auth)",
            "Validation",
            "Controller",
            "Database",
            "Response",
          ].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                {s}
              </div>
              {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          ))}
        </div>
      </div>

      {routes.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No routes yet. Click "New route" to start planning your API.
        </div>
      )}

      <div className="space-y-3">
        {routes.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card shadow-card">
            <button
              onClick={() => setOpen(open === r.id ? null : r.id)}
              className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-4 text-left"
            >
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${METHOD_COLORS[r.method]}`}
              >
                {r.method}
              </span>
              <div className="min-w-0">
                <div className="truncate font-mono text-sm">{r.endpoint || "/api/..."}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {r.name || "(unnamed)"}
                </div>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] ${r.status === "done" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}
              >
                {r.status}
              </span>
            </button>

            {open === r.id && (
              <div className="grid gap-3 border-t border-border p-4 md:grid-cols-2">
                <Field label="Name">
                  <input
                    value={r.name}
                    onChange={(e) => update(r.id, { name: e.target.value })}
                    className={inp}
                  />
                </Field>
                <Field label="Method">
                  <select
                    value={r.method}
                    onChange={(e) => update(r.id, { method: e.target.value as Route["method"] })}
                    className={inp}
                  >
                    {Object.keys(METHOD_COLORS).map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Endpoint">
                  <input
                    value={r.endpoint}
                    onChange={(e) => update(r.id, { endpoint: e.target.value })}
                    className={`${inp} font-mono`}
                  />
                </Field>
                <Field label="Auth required">
                  <select
                    value={r.authRequired ? "yes" : "no"}
                    onChange={(e) => update(r.id, { authRequired: e.target.value === "yes" })}
                    className={inp}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes (JWT)</option>
                  </select>
                </Field>
                <Field label="Request body" full>
                  <textarea
                    rows={3}
                    value={r.requestBody}
                    onChange={(e) => update(r.id, { requestBody: e.target.value })}
                    className={`${inp} font-mono`}
                  />
                </Field>
                <Field label="Response body" full>
                  <textarea
                    rows={3}
                    value={r.responseBody}
                    onChange={(e) => update(r.id, { responseBody: e.target.value })}
                    className={`${inp} font-mono`}
                  />
                </Field>
                <Field label="Validation rules" full>
                  <textarea
                    rows={2}
                    value={r.validation}
                    onChange={(e) => update(r.id, { validation: e.target.value })}
                    className={inp}
                  />
                </Field>
                <Field label="Error handling">
                  <input
                    value={r.errors}
                    onChange={(e) => update(r.id, { errors: e.target.value })}
                    className={inp}
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={r.status}
                    onChange={(e) => update(r.id, { status: e.target.value as Route["status"] })}
                    className={inp}
                  >
                    <option value="planned">Planned</option>
                    <option value="wip">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </Field>
                <Field label="Test case" full>
                  <textarea
                    rows={2}
                    value={r.testCase}
                    onChange={(e) => update(r.id, { testCase: e.target.value })}
                    className={inp}
                  />
                </Field>
                <Field label="Notes" full>
                  <textarea
                    rows={2}
                    value={r.notes}
                    onChange={(e) => update(r.id, { notes: e.target.value })}
                    className={inp}
                  />
                </Field>
                <button
                  onClick={() => setRoutes((rs) => rs.filter((x) => x.id !== r.id))}
                  className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-md border border-destructive/30 px-3 py-2 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete route
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const inp = "w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm";
function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
