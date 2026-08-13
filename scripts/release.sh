#!/usr/bin/env bash
# Cut a release: verify -> tag -> build with release metadata -> upload maps.
#
#   bun run release                # patch bump
#   bun run release minor
set -euo pipefail

BUMP="${1:-patch}"

echo "→ verifying"
bun run lint
bun run typecheck
bun run test

echo "→ bumping version ($BUMP)"
npm version "$BUMP" --no-git-tag-version >/dev/null
VERSION=$(node -p "require('./package.json').version")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo local)

echo "→ building learning-os@${VERSION}+${COMMIT}"
VITE_APP_VERSION="$VERSION" VITE_APP_COMMIT="$COMMIT" VITE_APP_ENV=production bun run build

if [ -n "${SENTRY_AUTH_TOKEN:-}" ]; then
  echo "→ uploading source maps"
  VITE_APP_VERSION="$VERSION" VITE_APP_COMMIT="$COMMIT" bash scripts/upload-sourcemaps.sh
else
  echo "→ SENTRY_AUTH_TOKEN unset, skipping source-map upload"
fi

echo "→ tagging v${VERSION}"
echo "   run: git commit -am \"release: v${VERSION}\" && git tag v${VERSION} && git push --follow-tags"
echo "✓ release learning-os@${VERSION}+${COMMIT} ready in dist/"
