# Development Log / Changelog

All notable changes to the AI-Enabled Full-Stack Cloud Engineer Learning OS.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
versions are milestone-based rather than published releases.

## [1.0.0] — Production submission

### Added

- **Docker support**: multi-stage `Dockerfile` (Bun build → slim runtime),
  `docker-compose.yml` with an optional hot-reloading `dev` profile, and
  `.dockerignore`.
- **Test suite** (Vitest): curriculum integrity (84 sequential days, correct
  week mapping, complete mission payloads, track colour coverage), assessment
  answer-index validity, unique ids across projects and challenges,
  XP-to-level progression, and `cn` class merging.
- **Documentation**: professional `README.md`, `AI_NOTES.md` (AI usage, failure
  modes, human decisions), and this development log.
- **SEO metadata**: every content route now defines a unique description,
  `og:title`, `og:description`, `og:type` and `twitter:card`.

### Fixed

- **Hydration mismatch in `useLocalStorage`**: persisted values were read in the
  `useState` initializer, so SSR markup and the first client render diverged
  whenever data existed. Storage is now read in an effect after mount, and the
  write-back effect is gated on a `hydrated` ref so defaults cannot clobber
  saved progress.
- Removed a dead default export in the Architecture Builder route that
  duplicated the route component.

### Changed

- Normalised route `head()` blocks to a single multi-line shape.
- Documented the `useLocalStorage` contract and replaced silent empty `catch`
  blocks with explanatory comments.

## [0.4.0] — Premium add-on pack

### Added

- Focus Mode with Pomodoro timer (`StudyTimer`) and an "I am stuck" assistant
  (`StuckHelper`).
- Bug Journal, Revision Queue (spaced repetition), and Cheat Sheets.
- Skill Gap Analyzer targeting seven engineering roles.
- Architecture Diagram Builder, API Route Planner, Database Schema Planner
  (Markdown/SQL export).
- Weekly Review with auto-drafted LinkedIn post and demo script.
- Job-Ready Checklist, Job Application Tracker, Personal Branding page.
- Visual layer: animated phase flows, radial readiness gauges, 84-day streak
  heatmap, skill radar, confetti on build completion.

## [0.3.0] — Dynamic mission engine

### Added

- Auto-generated daily missions: Morning Learn, Midday Practice, Afternoon
  Build, Evening AI Review, each with real outputs and XP triggers.
- Beginner Mode and Fast Track Mode, plus slow/normal/fast pacing, wired into
  the sidebar; advanced optional tasks hide in Beginner/Slow.
- Weighted XP: Build +50, DSA/Test +20, Practice +15, others +10,
  Fast Track stretch goals +25.

## [0.2.0] — Core pages

### Added

- Dashboard, 84-Day Roadmap, Today's Mission, Visual Learning Flow, Resource
  Hub, Tools Directory, AI Prompt Library, Projects Tracker, Capstone, Job
  Readiness, Interview Prep, Notes & Export.
- `AppLayout` with sidebar navigation and XP/level progress.

## [0.1.0] — Foundation

### Added

- TanStack Start + React 19 + TypeScript + Tailwind v4 project skeleton.
- Dark-first semantic design system in `src/styles.css`.
- `localStorage` persistence layer (`storage.ts`) for progress, notes, XP and
  settings.
- 84-day curriculum data model across nine tracks (`days.ts`) and the resource,
  tool, prompt and project datasets.
