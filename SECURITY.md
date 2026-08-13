# Security Hardening

Scope note: the Learning OS keeps all learner data in `localStorage`, so it ships
without accounts. The controls below are split into what is **active today** and
what is **implemented and unit-tested as the account layer's foundation**, so the
security posture does not have to be retrofitted later.

## Active today

| Control                      | Where                                   | Value                                                      |
| ---------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| Security response headers    | `src/start.ts`                          | HSTS, CSP, `nosniff`, `SAMEORIGIN`, referrer & permissions |
| CSRF gate                    | `src/start.ts` + `lib/auth/csrf.server` | Origin check + signed double-submit on unsafe methods      |
| Telemetry endpoint hardening | `routes/api/public/errors.ts`           | Zod schema, 64 KB body cap, 30 req/min per IP              |
| Dependency patching          | `package.json` `overrides`              | `seroval` pinned past GHSA-mv8w-475r-vwqw                  |
| Release traceability         | `x-app-release` header                  | Every response identifies the build that produced it       |

Content-Security-Policy (production only, so Vite's dev HMR keeps working):

```
default-src 'self'; script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:;
connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self';
form-action 'self'; object-src 'none'
```

## Refresh-token rotation

`src/lib/auth/tokens.server.ts` implements the OWASP pattern **rotation with
reuse detection**:

```text
login          -> access(10m) + refresh(14d), familyId = F
refresh        -> old token marked consumed, new refresh issued, still family F
replay old     -> theft signal: entire family F revoked -> forced re-login
expired token  -> family revoked
```

- Refresh tokens are stored as SHA-256 hashes — a database dump yields no usable
  credentials.
- Comparisons use `timingSafeEqual`, so token checks are not a timing oracle.
- Access tokens are deliberately short-lived (10 min) so revocation converges.
- `RefreshTokenStore` is an interface; the in-memory implementation is swapped
  for a `refresh_tokens` table when accounts land — the rotation logic is
  unchanged.

Covered by `src/lib/__tests__/auth.test.ts` (rotation, reuse, expiry, unknown token).

## CSRF protection

Signed double-submit, layered on top of `SameSite`:

1. Server issues `__Host-los_csrf` = `<random>.<HMAC(random, SESSION_SECRET)>`.
2. Client echoes the value in `x-csrf-token`.
3. Server requires `header === cookie` **and** a valid HMAC, so a cookie-writing
   attacker still cannot forge a token.
4. `Origin`/`Referer` must match the target origin for POST/PUT/PATCH/DELETE.

`/api/public/*` is exempt (cookie-less ingest) and enforces schema validation and
rate limiting instead.

## Session cookie policy

`src/lib/auth/cookies.server.ts` is the single source of truth.

| Cookie            | httpOnly | sameSite | secure | maxAge | Purpose             |
| ----------------- | -------- | -------- | ------ | ------ | ------------------- |
| `__Host-los_at`   | yes      | lax      | prod   | 10 min | access token        |
| `__Host-los_rt`   | yes      | strict   | prod   | 14 d   | rotating refresh    |
| `__Host-los_csrf` | no       | lax      | prod   | 14 d   | double-submit token |

The `__Host-` prefix makes the browser reject the cookie unless it is `Secure`,
`Path=/` and has no `Domain` — a compromised subdomain cannot overwrite session
state.

## Secrets

`SESSION_SECRET` (HMAC key) and `SENTRY_DSN` are read **inside** handlers, never
at module scope, because Workers bind env per request. Store them with
`wrangler secret put` or AWS SSM; never in the repo or the image.

## Verification

```bash
bun run test                                  # rotation, CSRF, cookie policy
curl -sI https://<host>/ | grep -Ei 'strict-transport|content-security|x-app-release'
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://<host>/api/public/errors -d '{}'   # 400
```

## Security-header contract (verified in CI)

| Header | Value | Scope |
| ------ | ----- | ----- |
| `content-security-policy` | `default-src 'self'` … `object-src 'none'` | production |
| `strict-transport-security` | `max-age=63072000; includeSubDomains; preload` | production |
| `x-frame-options` | `SAMEORIGIN` | always |
| `x-content-type-options` | `nosniff` | always |
| `referrer-policy` | `strict-origin-when-cross-origin` | always |
| `permissions-policy` | `camera=(), microphone=(), geolocation=()` | always |
| `cross-origin-opener-policy` | `same-origin` | always |
| `x-app-release` | build id | always |
| `cache-control` | `private, no-store` on mutations, path policy on reads | always |

CSP/HSTS are production-only so Vite's dev HMR (inline eval + ws) keeps working.

Verify any environment:

```bash
bash scripts/verify-headers.sh https://your-host     # pass/fail per header
bun run e2e                                          # 20 e2e checks
E2E_BASE_URL=http://localhost:8080 E2E_ENV=production bunx playwright test e2e/security-headers.spec.ts
```

`GET /api/session` issues the signed CSRF cookie, `POST /api/session` is the
reference CSRF-gated mutation, `DELETE` clears it — all three are covered by
`e2e/session.spec.ts` and `e2e/csrf.spec.ts`.

## Automated quality gates

| Gate | Command | CI job |
| ---- | ------- | ------ |
| Lint · format · types · unit | `bun run verify` | `verify` |
| E2E (headers, CSRF, assessment, error paths) | `bun run e2e` | `e2e` |
| Production header contract | `bash scripts/verify-headers.sh` | `headers` |
| Lighthouse + Core Web Vitals thresholds | `bun run lhci` | `lighthouse` |
| Before/after vitals report | `bun run vitals:report` | `lighthouse` (job summary) |

Thresholds live in `.lighthouserc.json` (performance ≥ 0.85, a11y ≥ 0.95,
LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms). `bun run vitals:baseline` promotes the
current run to `.lighthouse-baseline.json`, and CI fails when a metric regresses
past the per-metric tolerance.
