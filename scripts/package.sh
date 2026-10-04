#!/usr/bin/env bash
# Builds the Chrome Web Store upload zip (extension files only).
set -euo pipefail
cd "$(dirname "$0")/.."
version=$(python3 -c "import json;print(json.load(open('manifest.json'))['version'])")
mkdir -p dist
out="dist/account-switcher-for-reddit-$version.zip"
rm -f "$out"
zip -q -r "$out" manifest.json background.js content.js popup.html popup.css popup.js icons -x '*.DS_Store'
echo "$out"
unzip -l "$out"
