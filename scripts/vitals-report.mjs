#!/usr/bin/env node
// Turns the Lighthouse CI run in .lighthouseci/ into a per-deployment
// before/after Core Web Vitals report.
//
//   node scripts/vitals-report.mjs                 # writes vitals-report.md
//   node scripts/vitals-report.mjs --save-baseline # promotes the run to baseline
//
// The baseline (.lighthouse-baseline.json) is committed, so every CI run
// compares the current deployment against the last accepted one and fails when
// a metric regresses beyond the tolerance below.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const LHCI_DIR = ".lighthouseci";
const BASELINE = ".lighthouse-baseline.json";
const OUT = "vitals-report.md";

// A metric may drift this much before it counts as a regression.
const TOLERANCE = {
  "first-contentful-paint": 200,
  "largest-contentful-paint": 300,
  "cumulative-layout-shift": 0.02,
  "total-blocking-time": 100,
  "server-response-time": 150,
};
const METRICS = Object.keys(TOLERANCE);

function loadRuns() {
  if (!existsSync(LHCI_DIR)) {
    console.error(`${LHCI_DIR} not found — run \`bunx lhci autorun\` first.`);
    process.exit(1);
  }
  const runs = {};
  for (const file of readdirSync(LHCI_DIR).filter(
    (f) => f.startsWith("lhr-") && f.endsWith(".json"),
  )) {
    const lhr = JSON.parse(readFileSync(join(LHCI_DIR, file), "utf8"));
    const url = new URL(lhr.finalDisplayedUrl ?? lhr.requestedUrl).pathname;
    const sample = {
      performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
    };
    for (const metric of METRICS) sample[metric] = lhr.audits[metric]?.numericValue ?? null;
    (runs[url] ??= []).push(sample);
  }
  // median of the N runs per URL, per metric
  const median = {};
  for (const [url, samples] of Object.entries(runs)) {
    median[url] = {};
    for (const key of Object.keys(samples[0])) {
      const values = samples
        .map((s) => s[key])
        .filter((v) => v !== null)
        .sort((a, b) => a - b);
      median[url][key] = values.length ? values[Math.floor(values.length / 2)] : null;
    }
  }
  return median;
}

const fmt = (metric, value) =>
  value == null
    ? "—"
    : metric === "cumulative-layout-shift"
      ? value.toFixed(3)
      : `${Math.round(value)} ms`;

function delta(metric, before, after) {
  if (before == null || after == null) return { text: "—", regressed: false };
  const diff = after - before;
  const regressed = diff > TOLERANCE[metric];
  const sign = diff > 0 ? "+" : "";
  const shown = metric === "cumulative-layout-shift" ? diff.toFixed(3) : `${Math.round(diff)} ms`;
  return { text: `${sign}${shown}${regressed ? " ⚠️" : ""}`, regressed };
}

const current = loadRuns();

if (process.argv.includes("--save-baseline")) {
  writeFileSync(BASELINE, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`Baseline written to ${BASELINE}`);
  process.exit(0);
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
const lines = [
  "# Core Web Vitals — before / after",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
];
let regressions = 0;

for (const [url, after] of Object.entries(current).sort()) {
  const before = baseline[url] ?? {};
  lines.push(
    `## \`${url}\``,
    "",
    `Performance **${after.performance}** (baseline ${before.performance ?? "—"}) · Accessibility **${after.accessibility}**`,
    "",
    "| Metric | Before | After | Δ |",
    "| ------ | ------ | ----- | - |",
  );
  for (const metric of METRICS) {
    const d = delta(metric, before[metric], after[metric]);
    if (d.regressed) regressions += 1;
    lines.push(
      `| ${metric} | ${fmt(metric, before[metric])} | ${fmt(metric, after[metric])} | ${d.text} |`,
    );
  }
  lines.push("");
}

if (regressions > 0) {
  lines.push(`> ❌ ${regressions} metric(s) regressed beyond tolerance.`, "");
}

writeFileSync(OUT, `${lines.join("\n")}\n`);
console.log(lines.join("\n"));

if (regressions > 0) process.exit(1);
