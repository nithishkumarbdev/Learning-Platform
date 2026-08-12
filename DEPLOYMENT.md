# Production Deployment Guide

The Learning OS is a TanStack Start (React 19 + Vite 7) app with SSR. It builds
into `dist/` as an edge-compatible worker bundle plus static client assets, so it
deploys cleanly to **Cloudflare Workers** or to **AWS** (container or Amplify).

All learner data lives in `localStorage` — there is no database, no auth and no
outbound network dependency, which keeps deployment stateless and horizontally
scalable.

---

## 1. Prerequisites

| Tool     | Version | Notes                                            |
| -------- | ------- | ------------------------------------------------ |
| Bun      | ≥ 1.1   | primary package manager (`npm`/`pnpm` also work) |
| Node.js  | ≥ 20    | required by the AWS/Docker runtime image         |
| Wrangler | ≥ 4     | Cloudflare deploys and local worker serving      |
| Docker   | ≥ 24    | AWS container path                               |

```bash
bun install
bun run lint && bun run typecheck && bun run test
bun run build          # emits dist/
```

## 2. Environment setup

The app itself requires **no secrets**. Only build-time flags are used, and
only `VITE_`-prefixed variables reach the browser.

```bash
# .env.production  (never commit real secrets)
NODE_ENV=production
VITE_APP_NAME="AI-Enabled Full-Stack Cloud Engineer Learning OS"
VITE_PUBLIC_SITE_URL="https://learning-os.example.com"
```

Rules of thumb:

- Anything without the `VITE_` prefix stays server-side (`process.env`, read
  inside server handlers only — never at module scope).
- Store real secrets in the platform secret store (`wrangler secret put` or AWS
  Secrets Manager / SSM Parameter Store), never in the repo or the image.
- Set `VITE_PUBLIC_SITE_URL` per environment so canonical/OG URLs are correct.

---

## 3. Deploy to Cloudflare Workers (recommended)

The build target is already Cloudflare-compatible.

```bash
# one-time
bun add -d wrangler
npx wrangler login

# every release
bun run build
npx wrangler deploy
```

Minimal `wrangler.toml` at the repo root:

```toml
name = "learning-os"
main = "dist/server/index.mjs"
compatibility_date = "2026-01-01"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "dist/client"
binding = "ASSETS"

[vars]
VITE_PUBLIC_SITE_URL = "https://learning-os.example.com"
```

Useful commands:

```bash
npx wrangler dev                       # run the built worker locally
npx wrangler secret put MY_SECRET      # encrypted env var
npx wrangler deploy --env staging      # named environment
npx wrangler tail                      # live production logs
npx wrangler rollback                  # revert to the previous version
```

Custom domain: **Workers & Pages → your worker → Settings → Domains & Routes →
Add custom domain**. Cloudflare provisions TLS automatically.

### Cloudflare Pages alternative

```bash
npx wrangler pages deploy dist/client --project-name learning-os
```

Use this only if you want a purely static export; SSR routes require the Workers
path above.

---

## 4. Deploy to AWS

### 4a. Container: ECR + ECS Fargate (or App Runner)

The repo ships a multi-stage `Dockerfile` (Bun build → slim Node runtime).

```bash
export AWS_REGION=eu-west-1
export ACCOUNT=123456789012
export REPO=learning-os

aws ecr create-repository --repository-name $REPO --region $AWS_REGION
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com

docker build -t $REPO:latest .
docker tag $REPO:latest $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:latest
docker push $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:latest
```

Then either:

- **App Runner** (simplest): create a service from the ECR image, port `8080`,
  health check path `/`, and add env vars in the service configuration.
- **ECS Fargate**: register a task definition with the image, `containerPort:
8080`, 0.5 vCPU / 1 GB, log driver `awslogs`; put it behind an ALB target group
  with health check `/`, then front it with CloudFront for global caching.

```bash
aws ecs update-service --cluster learning-os --service web --force-new-deployment
```

Inject env vars from SSM in the task definition:

```json
"secrets": [
  { "name": "MY_SECRET", "valueFrom": "arn:aws:ssm:eu-west-1:123456789012:parameter/learning-os/MY_SECRET" }
]
```

### 4b. Static: S3 + CloudFront

Suitable when you do not need SSR.

```bash
bun run build
aws s3 sync dist/client s3://learning-os-web --delete \
  --cache-control "public,max-age=31536000,immutable" --exclude "index.html"
aws s3 cp dist/client/index.html s3://learning-os-web/index.html \
  --cache-control "no-cache"
aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXX --paths "/*"
```

Add a CloudFront Function or custom error response mapping `403/404 → /index.html`
so client-side routes resolve on refresh.

---

## 5. Local production verification

```bash
bun run build
bun run preview            # Vite preview server
docker compose up --build  # full production image on http://localhost:8080
curl -I http://localhost:8080/    # expect HTTP/1.1 200 with SSR HTML
```

---

## 6. Release checklist

- [ ] `bun run lint`, `bun run typecheck`, `bun run test` pass (CI enforces this)
- [ ] `bun run build` succeeds and `dist/` is fresh
- [ ] Env vars set for the target environment
- [ ] Production smoke test: `/`, `/today`, `/roadmap`, `/readiness`
- [ ] Debug panel (Ctrl/Cmd + Shift + D) shows LCP in the "good" band
- [ ] Rollback path confirmed (`wrangler rollback` or previous ECS task revision)

## 7. Troubleshooting

| Symptom                          | Cause                                | Fix                                                    |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------ |
| 404 on refresh of a deep link    | static host without SPA/SSR fallback | use the Workers/SSR path or map errors to `index.html` |
| `[unenv] ... is not implemented` | Node-only API in server code         | replace with a Web-standard or edge-safe API           |
| `process.env.X` undefined        | read at module scope                 | read inside the request handler                        |
| Stale assets after deploy        | CDN cache                            | invalidate CloudFront / purge Cloudflare cache         |
