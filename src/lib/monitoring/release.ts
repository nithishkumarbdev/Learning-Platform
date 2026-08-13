/**
 * Release identity, shared by the error tracker, the debug panel and the
 * `x-app-release` response header so a stack trace can always be tied back to
 * the exact build that produced it.
 *
 * `VITE_APP_VERSION` / `VITE_APP_COMMIT` are injected at build time — see the
 * `release` script in package.json and RELEASE.md.
 */
export const RELEASE = {
  version: (import.meta.env.VITE_APP_VERSION as string | undefined) ?? "0.0.0-dev",
  commit: (import.meta.env.VITE_APP_COMMIT as string | undefined) ?? "local",
  environment:
    (import.meta.env.VITE_APP_ENV as string | undefined) ??
    (import.meta.env.PROD ? "production" : "development"),
} as const;

/** Sentry-style release identifier, e.g. `learning-os@1.2.0+ab12cd3`. */
export const releaseId = `learning-os@${RELEASE.version}+${RELEASE.commit}`;
