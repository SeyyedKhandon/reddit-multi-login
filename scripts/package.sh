#!/usr/bin/env bash
# Zips the already-built dist/ into the Chrome Web Store upload file.
# Run via `npm run package`, which builds first.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f dist/manifest.json ] || { echo "dist/ is missing - run 'npm run build' first" >&2; exit 1; }
version=$(node -p "require('./package.json').version")
built=$(node -p "require('./dist/manifest.json').version")
[ "$version" = "$built" ] || { echo "dist/ is stale: built $built, package.json says $version" >&2; exit 1; }
out="$PWD/release/account-switcher-for-reddit-$version.zip"
mkdir -p release
rm -f "$out" # zip updates an existing archive in place, which would keep stale files
# Zip from inside dist/ so manifest.json sits at the archive root, as the store requires.
(cd dist && zip -q -r -X "$out" . -x '*.DS_Store')
echo "$out"
unzip -l "$out"
