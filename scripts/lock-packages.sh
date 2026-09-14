#!/usr/bin/env bash
# Generate a standalone package-lock.json for each deployable package.
#
# The workspace root owns one lockfile for `npm ci` in CI. Docker images are
# built with the package directory as the context (api/, web/), so each needs a
# lockfile of its own. npm will not write one inside a workspace member, so
# resolve each package.json in a scratch directory and copy the result back.
set -euo pipefail
cd "$(dirname "$0")/.."
for pkg in api web; do
  [ -f "$pkg/package.json" ] || continue
  tmp=$(mktemp -d)
  cp "$pkg/package.json" "$tmp/package.json"
  (cd "$tmp" && npm install --package-lock-only --ignore-scripts --silent)
  cp "$tmp/package-lock.json" "$pkg/package-lock.json"
  rm -rf "$tmp"
  echo "wrote $pkg/package-lock.json"
done
