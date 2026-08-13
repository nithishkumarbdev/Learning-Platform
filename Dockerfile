# ---- Build stage ---------------------------------------------------------
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock* bunfig.toml ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

# ---- Runtime stage ------------------------------------------------------
# The production build is a Cloudflare-Workers-compatible bundle, so it is
# served with workerd via wrangler rather than a bare Node process.
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g wrangler@4

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["wrangler", "dev", "-c", "dist/server/wrangler.json", "--ip", "0.0.0.0", "--port", "8080"]
