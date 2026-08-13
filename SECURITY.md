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
