# AI_NOTES.md

How AI was used to build the AI-Enabled Full-Stack Cloud Engineer Learning OS,
and where human judgement was required. Written for reviewers who want to know
what was generated, what was verified, and what the limits are.

## 1. Where AI helped

| Task | AI role | Human/verification step |
| --- | --- | --- |
| Curriculum design (84 days, 12 weeks, 9 tracks) | Drafted topic sequencing and weekly themes | Re-ordered so each day only depends on prior days; verified by unit tests that assert 84 sequential days and correct week mapping |
| Data models (`Day`, `Assessment`, `Project`, `Challenge`) | Proposed field shapes | Trimmed unused fields; enforced with TypeScript strict mode |
| Route scaffolding (29 pages) | Generated boilerplate route files | Route ids checked against filenames; each page given unique head metadata |
| Design system | Suggested palette and token names | Contrast checked; tokens centralised in `src/styles.css`, no hardcoded colours in components |
| Copywriting (goals, hints, mission text) | Drafted all instructional copy | Reviewed for accuracy; safety/cost notes added to any cloud or paid-API guidance |
| Tests | Drafted assertions | Extended to cover data integrity, not just happy paths |
| Docs (this file, README, CHANGELOG) | Drafted structure | Fact-checked against the actual codebase |

## 2. Prompt patterns that worked

- **Constraint-first prompts.** Stating the stack, the file layout and the
  forbidden patterns up front ("no `react-router-dom`, no `src/pages/`, tokens
  only") produced far fewer rewrites than open-ended requests.
- **One concern per pass.** Data model → UI → persistence → polish. Mixing them
  produced files that typechecked but contradicted each other.
- **"Show me the failure mode."** Asking the model to enumerate how a component
  breaks (SSR, empty state, cleared storage) surfaced the hydration bug in
  `useLocalStorage` described below.
- **Refactor prompts anchored to a rule**, e.g. "every route must export exactly
  one `Route` and no default export", are verifiable and therefore safe to apply
  in bulk.

## 3. Prompt patterns that failed

- Asking for "the whole app" in one shot: plausible but inconsistent naming,
  duplicated storage keys, and pages that imported helpers that never existed.
- Letting the model invent library imports. Toast helpers and auth hooks that do
  not exist in this template were suggested repeatedly; every import is now
  checked against `package.json` and the filesystem.
- Asking for "more features" without a data model — produced UI with nowhere to
  persist state.

## 4. Bugs AI introduced (and how they were fixed)

1. **Hydration mismatch in `useLocalStorage`.** The stored value was read inside
   the `useState` initializer, so server HTML and the first client render
   disagreed whenever data existed. Fixed by reading storage in an effect after
   mount and gating the write-back effect on a `hydrated` ref so defaults never
   overwrite saved data.
2. **Dead default export** in the architecture planner route
   (`export default function ArchitectureBuilder`) that duplicated the route
   component and was never imported. Removed.
3. **Incomplete page metadata.** Most routes shipped with only a `title`.
   Every content route now defines a unique description, `og:title`,
   `og:description`, `og:type` and `twitter:card`.

## 5. Human-only decisions

- No backend. A learning tracker that requires signup gets abandoned; local
  persistence was chosen deliberately over a database.
- Sequential-only curriculum: every day is unlocked by the previous day's
  output, which is why Beginner and Fast Track modes change *workload*, never
  order.
- Safety framing on cloud/AI tasks (free tiers, key handling, cost ceilings) was
  specified by hand — AI-generated tutorials routinely omit it.

## 6. Verification checklist used before shipping

- `tsc`-equivalent typecheck clean under `strict`.
- `bun run test` green.
- Production build succeeds.
- Every route reachable from the sidebar and rendering without console errors.
- Empty-state pass: cleared `localStorage`, then walked every page.
