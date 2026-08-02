#!/usr/bin/env bash
# Drive random seeded pages against prod-local at a target RPS for a fixed duration.
# The /listings/:id and /hosts/:id paths use random ids so they keep
# rendering fresh (the fixed paths warm the prerender cache) — the SSR load
# renderer-profile.js measures. Env-tune:
#
#   DURATION=120 RPS=10 script/memory-loadtest.sh
#   SNAPSHOT_EVERY=600 DURATION=3600 script/memory-loadtest.sh   # snapshot the worker every 10m
set -euo pipefail
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

BASE_URL="${BASE_URL:-http://localhost:3000}"
DURATION="${DURATION:-120}"                 # seconds
RPS="${RPS:-10}"                            # approx requests per second
MAX_LISTING_ID="${MAX_LISTING_ID:-3000}"
MAX_HOST_ID="${MAX_HOST_ID:-100}"
SNAPSHOT_EVERY="${SNAPSHOT_EVERY:-0}"       # seconds; 0 = off (SIGUSR2 the profiling worker)

rand_path() {
  case $(( RANDOM % 7 )) in
    0) echo "/" ;;
    1) echo "/s" ;;
    2) echo "/l/sy" ;;
    3) echo "/pricing" ;;
    4) echo "/faq" ;;
    5) echo "/listings/$(( (RANDOM % MAX_LISTING_ID) + 1 ))" ;;
    6) echo "/hosts/$(( (RANDOM % MAX_HOST_ID) + 1 ))" ;;
  esac
}

snapshot_worker() {
  local pid
  pid=$(pgrep -f 'node renderer-profile.js' | tail -1 || true)
  if [ -n "${pid:-}" ]; then
    kill -USR2 "$pid" && echo "[loadtest] SIGUSR2 -> renderer worker $pid"
  else
    echo "[loadtest] no renderer-profile.js worker to snapshot" >&2
  fi
}

interval=$(awk "BEGIN { printf \"%.3f\", 1 / $RPS }")
echo "[loadtest] $BASE_URL  duration=${DURATION}s  rps~${RPS}  snapshot_every=${SNAPSHOT_EVERY}s"

count=0
end=$(( SECONDS + DURATION ))
last_snapshot=$SECONDS
while [ "$SECONDS" -lt "$end" ]; do
  curl -s -o /dev/null -H "Accept-Encoding: gzip, br" "${BASE_URL}$(rand_path)" &
  count=$(( count + 1 ))
  if [ "$SNAPSHOT_EVERY" -gt 0 ] && [ $(( SECONDS - last_snapshot )) -ge "$SNAPSHOT_EVERY" ]; then
    snapshot_worker
    last_snapshot=$SECONDS
  fi
  sleep "$interval"
done
wait
echo "[loadtest] done — $count requests over ${DURATION}s"
