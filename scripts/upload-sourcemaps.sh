#!/usr/bin/env bash
# Upload hidden source maps for the current release, then delete them from dist/
# so they are never served publicly.
set -euo pipefail

: "${SENTRY_AUTH_TOKEN:?set SENTRY_AUTH_TOKEN}"
: "${SENTRY_ORG:?set SENTRY_ORG}"
: "${SENTRY_PROJECT:?set SENTRY_PROJECT}"

VERSION="${VITE_APP_VERSION:-$(node -p "require('./package.json').version")}"
COMMIT="${VITE_APP_COMMIT:-$(git rev-parse --short HEAD 2>/dev/null || echo local)}"
RELEASE="learning-os@${VERSION}+${COMMIT}"

npx @sentry/cli releases new "$RELEASE"
npx @sentry/cli releases set-commits "$RELEASE" --auto || true
npx @sentry/cli releases files "$RELEASE" upload-sourcemaps dist/client \
  --url-prefix '~/' --rewrite
npx @sentry/cli releases finalize "$RELEASE"

echo "→ stripping .map files from dist/"
find dist -name '*.map' -delete

echo "✓ source maps uploaded for $RELEASE"
