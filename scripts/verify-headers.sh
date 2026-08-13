#!/usr/bin/env bash
# Verifies the full security-header contract against a running deployment.
#
#   bash scripts/verify-headers.sh                       # localhost:8080
#   bash scripts/verify-headers.sh https://your-host     # any environment
#
# Exit code 0 = every required header present with the expected value.
set -uo pipefail

BASE="${1:-http://localhost:8080}"
FAILED=0

headers() { curl -sSI "$1" | tr -d '\r' | tr 'A-Z' 'a-z'; }

check() { # check <header> <expected-substring> <blob> <label>
  local name="$1" expect="$2" blob="$3" label="$4"
  local line
  line="$(printf '%s\n' "$blob" | grep -i "^${name}:" | head -1)"
  if [ -z "$line" ]; then
    printf '  \033[31mMISSING\033[0m %s (%s)\n' "$name" "$label"
    FAILED=$((FAILED + 1))
  elif [ -n "$expect" ] && ! printf '%s' "$line" | grep -qi -- "$expect"; then
    printf '  \033[31mBAD    \033[0m %s -> %s (expected to contain: %s)\n' "$name" "${line#*: }" "$expect"
    FAILED=$((FAILED + 1))
  else
    printf '  \033[32mOK     \033[0m %s: %s\n' "$name" "${line#*: }"
  fi
}

echo "Verifying security headers on ${BASE}"
echo

DOC="$(headers "${BASE}/")"
echo "GET / (document)"
check "x-content-type-options" "nosniff" "$DOC" "MIME sniffing"
check "x-frame-options" "sameorigin" "$DOC" "clickjacking"
check "referrer-policy" "strict-origin-when-cross-origin" "$DOC" "referrer leakage"
check "permissions-policy" "camera=()" "$DOC" "powerful features"
check "cross-origin-opener-policy" "same-origin" "$DOC" "cross-origin isolation"
check "x-app-release" "" "$DOC" "release traceability"
check "cache-control" "" "$DOC" "cache policy"

case "$BASE" in
  https://*)
    check "strict-transport-security" "max-age=63072000" "$DOC" "HSTS"
    check "content-security-policy" "default-src 'self'" "$DOC" "CSP"
    ;;
  *)
    if printf '%s' "$DOC" | grep -qi '^content-security-policy:'; then
      check "content-security-policy" "default-src 'self'" "$DOC" "CSP (production build)"
      check "strict-transport-security" "max-age=63072000" "$DOC" "HSTS (production build)"
    else
      echo "  SKIP     content-security-policy / strict-transport-security (dev server, HTTP)"
    fi
    ;;
esac

echo
echo "POST /api/public/errors (mutating request)"
MUT="$(curl -sSI -X POST "${BASE}/api/public/errors" | tr -d '\r' | tr 'A-Z' 'a-z')"
check "cache-control" "no-store" "$MUT" "no caching of mutations"

echo
if [ "$FAILED" -gt 0 ]; then
  printf '\033[31m%d header check(s) failed\033[0m\n' "$FAILED"
  exit 1
fi
printf '\033[32mAll security header checks passed\033[0m\n'
