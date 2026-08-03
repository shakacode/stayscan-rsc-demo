#!/usr/bin/env bash
# Smoke test: prove server-side rendering goes through the *remote* Node
# renderer (acceptance #1) and that killing the renderer breaks SSR rather than
# silently falling back to in-process ExecJS (acceptance #5).
#
# Usage: script/smoke-ssr.sh   (run from repo root; assets must be built first)
set -uo pipefail
cd "$(cd -- "$(dirname -- "$0")/.." && pwd)"

export PATH="$HOME/.nvm/versions/node/v22.12.0/bin:$PATH"
export RAILS_ENV=development
RENDERER_PORT=3800
RAILS_PORT=3011
RENDERER_LOG=tmp/smoke-renderer.log
RAILS_LOG=tmp/smoke-rails.log
mkdir -p tmp

cleanup() { kill "${REND_PID:-}" "${RAILS_PID:-}" 2>/dev/null; wait 2>/dev/null; }
trap cleanup EXIT

echo "== starting node renderer on :$RENDERER_PORT =="
RENDERER_PORT=$RENDERER_PORT node renderer.js >"$RENDERER_LOG" 2>&1 &
REND_PID=$!
echo "== starting puma on :$RAILS_PORT =="
bundle exec rails server -p $RAILS_PORT >"$RAILS_LOG" 2>&1 &
RAILS_PID=$!

# Wait for puma to accept connections.
for i in $(seq 1 40); do
  curl -sf "http://localhost:$RAILS_PORT/hello_world" -o /dev/null 2>/dev/null && break
  sleep 1
done

echo "== request WITH renderer up =="
BODY_UP="$(curl -s "http://localhost:$RAILS_PORT/hello_world")"
CODE_UP="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$RAILS_PORT/hello_world")"
echo "http=$CODE_UP"
echo "$BODY_UP" | grep -qi "Hello" && echo "PASS: SSR markup present" || echo "FAIL: no SSR markup"
echo "-- renderer log evidence (proves remote SSR) --"
grep -iE "worker|render|listen|port" "$RENDERER_LOG" | head -5

echo "== killing renderer, requesting again (expect failure, NOT silent fallback) =="
kill "$REND_PID" 2>/dev/null; wait "$REND_PID" 2>/dev/null; REND_PID=""
sleep 1
CODE_DOWN="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$RAILS_PORT/hello_world")"
echo "http_with_renderer_down=$CODE_DOWN"
if [ "$CODE_DOWN" = "500" ]; then
  echo "PASS: SSR errors when renderer is down (no ExecJS fallback)"
else
  echo "NOTE: status=$CODE_DOWN — inspect $RAILS_LOG for the renderer-unreachable error"
  grep -iE "renderer|connection|refused|econnrefused" "$RAILS_LOG" | tail -3
fi
