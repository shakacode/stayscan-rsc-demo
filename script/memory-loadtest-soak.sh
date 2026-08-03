#!/usr/bin/env bash
# 60-minute renderer memory soak: a baseline heap snapshot, an hour of
# random-page load with a snapshot every 10 minutes, then a final snapshot. Diff
# the first and last with analyze-snapshots.js to attribute any growth.
#
# Prereq: renderer-profile.js is running (see docs/renderer-profiling.md) and
# prod-local is up. Vary the experiment via env, e.g.:
#   IMAGE_URL_CACHE_MODE=unbounded script/memory-loadtest-soak.sh
set -euo pipefail
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

worker=$(pgrep -f 'node renderer-profile.js' | tail -1 || true)
if [ -z "${worker:-}" ]; then
  echo "start renderer-profile.js first — see docs/renderer-profiling.md" >&2
  exit 1
fi

echo "[soak] baseline snapshot (worker $worker)"
kill -USR2 "$worker"
sleep 3

DURATION="${DURATION:-3600}" RPS="${RPS:-15}" SNAPSHOT_EVERY="${SNAPSHOT_EVERY:-600}" \
  script/memory-loadtest.sh

echo "[soak] final snapshot"
kill -USR2 "$worker"
sleep 3

echo "[soak] done. Diff the first and last snapshot:"
echo "  node analyze-snapshots.js \$(ls -t tmp/heapsnapshots/*.heapsnapshot | tail -1) \$(ls -t tmp/heapsnapshots/*.heapsnapshot | head -1)"
