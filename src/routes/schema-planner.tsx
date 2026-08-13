import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useLocalStorage } from "@/lib/storage";
import { Plus, Trash2, Copy, Database } from "lucide-react";

export const Route = createFileRoute("/schema-planner")({
  head: () => ({
    meta: [
      { title: "Database Schema Planner · Learning OS" },
      {
        name: "description",
        content:
          "Database Schema Planner — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud ",
      },
      { property: "og:title", content: "Database Schema Planner · Learning OS" },
      {
        property: "og:description",
        content:
          "Database Schema Planner — practical, beginner-friendly tooling for full-stack, cloud, security and AI skills. Part of the 84-day AI-Enabled Full-Stack Cloud ",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type Column = { name: string; type: string; pk?: boolean; fk?: string; notes?: string };
type Table = { id: string; name: string; columns: Column[]; notes: string };

const STARTER: Table[] = [
  {
    id: "t_users",
    name: "users",
    notes: "Auth",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "email", type: "text" },
      { name: "password_hash", type: "text" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    id: "t_tasks",
    name: "tasks",
    notes: "User tasks",
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", fk: "users.id" },
      { name: "title", type: "text" },
      { name: "done", type: "boolean" },
    ],
  },
];

function Page() {
  const [tables, setTables] = useLocalStorage<Table[]>("los_schema_v1", STARTER);

  function addTable() {
    setTables((t) => [
      ...t,
      {
        id: `t_${Date.now()}`,
        name: "new_table",
        notes: "",
        columns: [{ name: "id", type: "uuid", pk: true }],
      },
    ]);
  }

  function updateTable(id: string, patch: Partial<Table>) {
    setTables((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function exportSQL() {
    const sql = tables
      .map((t) => {
        const cols = t.columns
          .map(
            (c) =>
              `  ${c.name} ${c.type}${c.pk ? " PRIMARY KEY" : ""}${c.fk ? ` REFERENCES ${c.fk.split(".")[0]}(${c.fk.split(".")[1]})` : ""}`,
          )
          .join(",\n");
        return `CREATE TABLE ${t.name} (\n${cols}\n);`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(sql);
  }

  const relations = tables.flatMap((t) =>
    t.columns.filter((c) => c.fk).map((c) => `${t.name}.${c.name} → ${c.fk}`),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Planner"
        title="Database Schema Planner"
        description="Design tables, columns, and relationships. Export as SQL for your migration."
        actions={
          <div className="flex gap-2">
            <button
              onClick={exportSQL}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
            >
              <Copy className="h-3.5 w-3.5" /> Copy SQL
            </button>
            <button
              onClick={addTable}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Add table
            </button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {tables.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <input
                aria-label="Table name"
                value={t.name}
                onChange={(e) => updateTable(t.id, { name: e.target.value })}
                className="flex-1 rounded-md border border-border bg-background/40 px-2 py-1 font-mono text-sm"
              />
              <button
                aria-label="Delete table"
                onClick={() => setTables((ts) => ts.filter((x) => x.id !== t.id))}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {t.columns.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                  <input
                    aria-label="Column name"
                    value={c.name}
                    onChange={(e) => {
                      const cols = [...t.columns];
                      cols[i] = { ...c, name: e.target.value };
                      updateTable(t.id, { columns: cols });
                    }}
                    className="rounded-md border border-border bg-background/40 px-2 py-1 font-mono text-xs"
                  />
                  <input
                    aria-label="Column type"
                    value={c.type}
                    onChange={(e) => {
                      const cols = [...t.columns];
                      cols[i] = { ...c, type: e.target.value };
                      updateTable(t.id, { columns: cols });
                    }}
                    className="rounded-md border border-border bg-background/40 px-2 py-1 font-mono text-xs"
                  />
                  <button
                    aria-label="Remove column"
                    onClick={() => {
                      const cols = t.columns.filter((_, j) => j !== i);
                      updateTable(t.id, { columns: cols });
                    }}
                    className="rounded-md px-2 text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                updateTable(t.id, { columns: [...t.columns, { name: "new_col", type: "text" }] })
              }
              className="mt-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] hover:bg-muted"
            >
              <Plus className="h-3 w-3" /> column
            </button>
          </div>
        ))}
      </div>

      {relations.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Relationships</h3>
          <ul className="space-y-1 font-mono text-xs text-muted-foreground">
            {relations.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
