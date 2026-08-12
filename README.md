# AI-Enabled Full-Stack Cloud Engineer Learning OS

A production-quality, offline-first learning operating system that turns a broad
ambition — "become a job-ready engineer across software, full-stack, cloud,
security and AI" — into an 84-day sequential program with daily missions,
practice tools, project tracking and job-readiness scoring.

Everything runs client-side. No account, no backend, no data leaves the browser:
progress, notes, XP and planner state persist in `localStorage`.

---

## Features

| Area | What it does |
| --- | --- |
| **Dashboard** | Level/XP, streak heatmap, next best action, phase flow overview |
| **84-Day Roadmap** | Sequential curriculum across 12 weekly themes and 9 tracks |
| **Today's Mission** | Auto-generated Morning Learn → Midday Practice → Afternoon Build → Evening AI Review, with XP per task |
| **Beginner / Fast Track modes** | Adjusts workload, hides advanced optional tasks, adds stretch goals |
| **Visual Learning Flow** | Animated phase map showing how each skill feeds the next |
| **Resource Hub / Tools Directory** | Curated free resources and tools with safety and cost notes |
| **AI Prompt Library** | Reusable prompts for learning, debugging, review and interviews |
| **Projects & Capstone Tracker** | Milestones for portfolio projects and the final capstone |
| **Job Readiness** | Radial readiness gauge, skill radar, checklist, application tracker |
| **Interview & Explain-Back** | Mock questions plus a "teach it back" drill |
| **Focus Mode** | Pomodoro timer, single-mission view, "I am stuck" assistant |
| **Bug Journal & Revision Queue** | Mistake tracking and spaced repetition |
| **Planners** | Architecture diagram, API route and database schema planners with SQL/Markdown export |
| **Weekly Review** | Auto-drafted LinkedIn post and demo script from your week's progress |
| **Cheat Sheets** | Fast reference for Git, Linux, Docker, SQL, AWS, Python and more |

---

## Tech stack

- **React 19** + **TypeScript** (strict)
- **TanStack Start / Router** — file-based routing with SSR
- **Vite 7** build pipeline
- **Tailwind CSS v4** with a semantic dark-first design system (`src/styles.css`)
- **shadcn/ui** primitives + **lucide-react** icons
- **Vitest** for unit tests
- **localStorage** for all persistence

---

## Getting started

```bash
bun install      # or: npm install
bun run dev      # http://localhost:8080
```

### Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Dev server with HMR |
| `bun run build` | Production build into `dist/` |
| `bun run preview` | Serve the production build locally |
| `bun run test` | Run the unit test suite |
| `bun run lint` | ESLint |

### Docker

```bash
docker compose up --build        # production image on http://localhost:8080
docker compose --profile dev up dev   # hot-reloading dev container on :8081
```

---

## Project structure

```text
src/
  routes/            file-based routes (one file per page)
    __root.tsx       app shell: head metadata, layout, error/404 boundaries
    index.tsx        dashboard
    today.tsx        daily mission engine
    roadmap.tsx      84-day plan
    ...              focus, bugs, revision, planners, jobs, branding, etc.
  components/
    AppLayout.tsx    sidebar navigation, XP/level bar, mode & pace switcher
    visuals.tsx      phase flow, readiness gauge, heatmap, skill radar, confetti
    StudyTimer.tsx   Pomodoro timer
    StuckHelper.tsx  guided unblocking assistant
    ui/              shadcn/ui primitives
  lib/
    days.ts          84-day curriculum data model
    assessments.ts   weekly assessments + build-without-tutorial challenges
    resources.ts     curated learning resources
    tools.ts         tool directory with cost/safety notes
    prompts.ts       AI prompt library
    projects.ts      portfolio project definitions
    storage.ts       localStorage hooks (progress, notes, XP, settings)
    extra.ts         planner/journal persistence helpers
  styles.css         design tokens and theme
```

---

## Design system

All colours, gradients and shadows are semantic tokens defined in
`src/styles.css` (`--background`, `--primary`, `--track-cloud`, …). Components
reference tokens only — never raw hex values or `text-white`/`bg-black` — so the
theme stays consistent and themable.

---

## Data & privacy

There is no server, database or analytics. Every keystroke stays in the
browser's `localStorage` under the `los_*` key namespace. Clearing site data
resets progress; the Notes page offers manual export for backups.

---

## Testing

```bash
bun run test
```

Tests cover the integrity of the 84-day curriculum (day/week sequencing,
complete mission payloads, track colour coverage), assessment answer validity,
unique ids across projects and challenges, XP-to-level progression, and the
class-merging utility.

---

## License

MIT.
