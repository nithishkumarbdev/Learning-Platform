# Release & Error Tracking Workflow

## Release identity

Every build stamps a single release string, `learning-os@<version>+<commit>`,
exposed three ways so a report can always be traced to a build:

- `src/lib/monitoring/release.ts` — `releaseId`, read from
  `VITE_APP_VERSION` / `VITE_APP_COMMIT` / `VITE_APP_ENV`.
- `x-app-release` response header on every request.
- `release` field on every error and breadcrumb payload sent to the tracker.

## Cutting a release

```bash
bun run release           # patch bump: verify -> bump -> build -> upload maps
bun run release minor
bun run release major
```

`scripts/release.sh` does, in order: lint, typecheck, test, version bump, build
with release metadata injected, source-map upload (only when
`SENTRY_AUTH_TOKEN` is set), then prints the commit/tag commands.

Manual equivalent:

```bash
bun run build:release
bun run sourcemaps:upload
git commit -am "release: v1.2.0" && git tag v1.2.0 && git push --follow-tags
```

## Source maps

`vite.config.ts` sets `build.sourcemap: "hidden"` — maps are emitted for upload
but no `sourceMappingURL` comment ships to the browser, so stack traces are
readable in the dashboard while the maps stay off the public site.
`scripts/upload-sourcemaps.sh` uploads them and then deletes every `*.map` from
`dist/` before deploy.

```bash
export SENTRY_AUTH_TOKEN=...   # never commit
export SENTRY_ORG=your-org
export SENTRY_PROJECT=learning-os
bun run sourcemaps:upload
```

## Error tracking

Client (`src/lib/monitoring/error-tracking.ts`), initialised once from
`src/routes/__root.tsx`:

- `window.onerror` and `unhandledrejection` handlers.
- React error boundary capture in the root `errorComponent`.
- Rolling breadcrumb trail (max 30) including route navigations.
- Batched, deduplicated delivery via `navigator.sendBeacon`, with a `fetch`
  fallback and a flush on `visibilitychange`.
- Client-side rate cap so an error loop cannot flood the endpoint.

Server ingest: `POST /api/public/errors`
(`src/routes/api/public/errors.ts`) — Zod-validated, 64 KB body cap, 30
requests/minute per IP, logs structured events and forwards to Sentry when
`SENTRY_DSN` is configured.

```bash
wrangler secret put SENTRY_DSN        # or AWS SSM for the container path
```

With no DSN set the endpoint still validates and logs, so local and
self-hosted deployments work without a third-party account.

## Verifying a release

```bash
curl -sI https://<host>/ | grep -i x-app-release          # expect learning-os@<version>+<commit>
find dist -name '*.map' | head                            # expect empty after upload
```

Then trigger a deliberate error in a scratch build and confirm the dashboard
shows it under the new release with un-minified frames and breadcrumbs.

## Rollback

```bash
npx wrangler rollback                                     # Cloudflare
aws ecs update-service --cluster learning-os --service web \
  --task-definition learning-os:<previous-revision>        # AWS
```

Note the `x-app-release` value you rolled back to and mark that release as the
current one in the tracker so incoming reports are attributed correctly.
