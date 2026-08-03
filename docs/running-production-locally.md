# Running the app in production mode locally

`script/prod-local` boots StayScan in `RAILS_ENV=production` on your machine with
**zero real secrets**, so we can study and benchmark the production stack — remote
SSR, prerender caching, compression, throttling — without deploying. This is the
**SSR baseline** the RSC migration measures against.

## Quick start

```bash
script/prod-local build     # full production precompile (sprockets + webpack via the RoR hook)
script/prod-local           # boot puma + renderer + sidekiq (Procfile.prod.local)
open http://localhost:3000
```

Rebuild assets (`script/prod-local build`) whenever frontend code changes — in
production mode nothing is compiled on the fly (`config.assets.compile = false`).

## Prerequisites

| Need | Why |
|---|---|
| PostgreSQL with `stayscan_development` seeded | prod-local reuses the seeded dev DB (`DATABASE_URL`) rather than a separate prod dataset. Seed with `bin/rails demo:reset`. |
| Node 22.12.0 on PATH | the out-of-process renderer (`renderer.js`). prod-local prepends `~/.nvm/versions/node/v22.12.0/bin`. |
| memcached (optional) | prerender + fragment caching. If it's up on `localhost:11211`, prod-local uses it; otherwise the app falls back to an in-process memory store. `memcached -d` to start. |
| `foreman` gem | runs `Procfile.prod.local`. |

## Environment (all set by the script — local-only, safe)

| Var | Value | Why it's safe / needed |
|---|---|---|
| `RAILS_ENV` / `NODE_ENV` | `production` | the whole point — production code paths. |
| `SECRET_KEY_BASE_DUMMY` | `1` | Rails mints an ephemeral key each boot, so no `credentials`/`master.key` is required. Sessions don't survive a restart — fine locally. |
| `DISABLE_FORCE_SSL` | `true` | production.rb keeps `force_ssl` on **unless** this is set; without it localhost would 301 to `https://` and break. |
| `RAILS_SERVE_STATIC_FILES` | `true` | puma serves the precompiled assets (no nginx locally). |
| `RENDERER_PASSWORD` | `prod-local-placeholder-secret` | shared secret puma and the renderer authenticate SSR with (required in production-like envs). Local-only placeholder. |
| `REACT_RENDERER_URL` | `http://localhost:3800` | where Rails sends SSR. |
| `DATABASE_URL` | `postgresql:///stayscan_development` | reuse the seeded dev DB. Override to point elsewhere. |
| `MEMCACHE_SERVERS` | `localhost:11211` *(only if reachable)* | switches the cache store to memcached. Absent → memory store. |

## What differs from real production

- No SSL-terminating proxy (`DISABLE_FORCE_SSL`); no CDN/asset host.
- Dummy secret key (`SECRET_KEY_BASE_DUMMY`), no encrypted credentials.
- Sidekiq/renderer run as plain foreman processes, not managed services.
- Reuses the dev database instead of a provisioned prod one.

Everything else — eager loading, `assets.compile=false`, caching on, remote
password-authenticated SSR, compression + throttling middleware — matches production.

## Processes (`Procfile.prod.local`)

- **web** — `puma -e production` on `$PORT` (default 3000), serving precompiled assets.
- **renderer** — `node renderer.js` on `$RENDERER_PORT` (default 3800), password-authenticated SSR.
- **sidekiq** — `sidekiq -e production`, draining background jobs.

## Profiling & benchmarks

Once prod-local is up, point the harnesses at it: `renderer-profile.js` for heap
snapshots, `script/memory-loadtest.sh` for soak tests, and `bench/vitals.mjs` for
web-vitals A/B runs (see `bench/README.md`).
