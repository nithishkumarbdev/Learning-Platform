import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Error-ingest endpoint. Under /api/public/* so the browser can post without a
// session, and hardened accordingly: strict schema, size cap, per-IP rate
// limit, no PII echoed back.

const breadcrumbSchema = z.object({
  at: z.number(),
  category: z.enum(["navigation", "ui", "console", "fetch"]),
  message: z.string().max(300),
});

const envelopeSchema = z.object({
  release: z.string().max(200),
  version: z.string().max(50),
  commit: z.string().max(80),
  environment: z.string().max(40),
  at: z.number(),
  type: z.string().max(120),
  message: z.string().max(1_000),
  stack: z.string().max(20_000).optional(),
  url: z.string().max(2_000),
  userAgent: z.string().max(500),
  mechanism: z.enum(["onerror", "unhandledrejection", "manual", "react_error_boundary"]),
  handled: z.boolean(),
  breadcrumbs: z.array(breadcrumbSchema).max(20),
  extra: z.record(z.unknown()).optional(),
});

const MAX_BODY_BYTES = 64 * 1024;
const RATE_LIMIT = { windowMs: 60_000, max: 30 };
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

async function forwardToSentry(envelope: z.infer<typeof envelopeSchema>): Promise<boolean> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;

  // DSN shape: https://<publicKey>@<host>/<projectId>
  let endpoint: string;
  let publicKey: string;
  try {
    const parsed = new URL(dsn);
    publicKey = parsed.username;
    const projectId = parsed.pathname.replace(/^\//, "");
    endpoint = `${parsed.protocol}//${parsed.host}/api/${projectId}/store/`;
  } catch {
    console.error("SENTRY_DSN is malformed; error not forwarded");
    return false;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-sentry-auth": `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=learning-os/1.0`,
    },
    body: JSON.stringify({
      timestamp: envelope.at / 1000,
      platform: "javascript",
      release: envelope.release,
      environment: envelope.environment,
      level: envelope.handled ? "warning" : "error",
      logger: "browser",
      request: { url: envelope.url, headers: { "User-Agent": envelope.userAgent } },
      exception: {
        values: [
          {
            type: envelope.type,
            value: envelope.message,
            stacktrace: envelope.stack ? { frames: [], raw: envelope.stack } : undefined,
            mechanism: { type: envelope.mechanism, handled: envelope.handled },
          },
        ],
      },
      breadcrumbs: {
        values: envelope.breadcrumbs.map((b) => ({
          timestamp: b.at / 1000,
          category: b.category,
          message: b.message,
        })),
      },
      extra: envelope.extra,
    }),
  });

  return response.ok;
}

export const Route = createFileRoute("/api/public/errors")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";

        if (rateLimited(ip)) {
          return new Response(null, { status: 429, headers: { "retry-after": "60" } });
        }

        const raw = await request.text();
        if (raw.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

        let parsed: z.infer<typeof envelopeSchema>;
        try {
          parsed = envelopeSchema.parse(JSON.parse(raw));
        } catch {
          return new Response(null, { status: 400 });
        }

        try {
          const forwarded = await forwardToSentry(parsed);
          if (!forwarded) {
            // Structured log — picked up by `wrangler tail` / CloudWatch.
            console.error(
              JSON.stringify({
                kind: "client_error",
                release: parsed.release,
                environment: parsed.environment,
                type: parsed.type,
                message: parsed.message,
                url: parsed.url,
                mechanism: parsed.mechanism,
                handled: parsed.handled,
                stack: parsed.stack?.split("\n").slice(0, 12).join("\n"),
              }),
            );
          }
        } catch (error) {
          console.error("error-ingest failed", error);
        }

        return new Response(null, { status: 204 });
      },
    },
  },
});
