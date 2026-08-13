import { describe, it, expect, afterEach } from "vitest";

import { withHardenedHeaders } from "../http-headers.server";

const originalEnv = process.env.NODE_ENV;

function decorate(url: string, method = "GET", init?: ResponseInit) {
  const request = new Request(url, { method });
  return withHardenedHeaders(request, new Response("ok", init));
}

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

describe("security headers", () => {
  it("sets the always-on hardening headers", () => {
    const h = decorate("https://app.test/").headers;
    expect(h.get("x-content-type-options")).toBe("nosniff");
    expect(h.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(h.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(h.get("cross-origin-opener-policy")).toBe("same-origin");
    expect(h.get("permissions-policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(h.get("x-app-release")).toBeTruthy();
  });

  it("adds HSTS and a locked-down CSP in production only", () => {
    process.env.NODE_ENV = "production";
    const prod = decorate("https://app.test/").headers;
    expect(prod.get("strict-transport-security")).toContain("includeSubDomains");
    const csp = prod.get("content-security-policy") ?? "";
    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ]) {
      expect(csp).toContain(directive);
    }

    process.env.NODE_ENV = "development";
    const dev = decorate("https://app.test/").headers;
    expect(dev.get("strict-transport-security")).toBeNull();
    expect(dev.get("content-security-policy")).toBeNull();
  });

  it("never overwrites a CSP set further up the stack", () => {
    process.env.NODE_ENV = "production";
    const h = decorate("https://app.test/", "GET", {
      headers: { "content-security-policy": "default-src 'none'" },
    }).headers;
    expect(h.get("content-security-policy")).toBe("default-src 'none'");
  });

  it("marks mutating responses as private/no-store", () => {
    const h = decorate("https://app.test/api/session", "POST").headers;
    expect(h.get("cache-control")).toBe("private, no-store");
  });

  it("derives a cache policy from the pathname for reads", () => {
    const asset = decorate("https://app.test/_build/assets/app-abc123.js").headers;
    expect(asset.get("cache-control")).toContain("max-age");
    const page = decorate("https://app.test/roadmap").headers;
    expect(page.get("cache-control")).toBeTruthy();
    expect(page.get("vary")).toContain("accept-encoding");
  });

  it("preserves status and body while decorating", async () => {
    const request = new Request("https://app.test/nope");
    const response = withHardenedHeaders(request, new Response("missing", { status: 404 }));
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("missing");
  });
});
