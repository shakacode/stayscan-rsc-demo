# StayScan — a production-scale React Server Components testbed

An **open-source, from-scratch** demo app for investigating React Server Components (RSC) under
**React on Rails Pro**. It is a fictional travel-lodging **price-comparison aggregator**: one
property is offered through several booking channels, and the app aggregates them into a single
listing and compares prices.

It exists because small demos never surface the RSC problems that matter — renderer memory
growth, web-vitals regressions, hydration bugs, and build-toolchain pain only show up at real
complexity. This app deliberately reproduces that complexity. All brands, data, and content are
**fictional and synthetic**; nothing proprietary, no real data, no secrets.

Build strategy: **traditional SSR first, then migrate to RSC** — the migration itself is the
experiment, so the app is deliberately built as a complete traditional-SSR application before
any RSC code lands.

## Stack

Rails 7.2 · Ruby 3.4.8 · PostgreSQL 17 · Redis · memcached · React 19.2 ·
React on Rails (Pro) 17.0.0.rc.6 · shakapacker 10.1 (webpack 5) · Node 22.12 · yarn 1.
Frontend lives in `client/`; the Pro Node renderer runs from the repo root (`renderer.js`).

## Quick start

Prerequisites: Ruby 3.4.8, Node 22.12.0 (`.nvmrc`), yarn 1, Docker.

```bash
# 1. Backing services (postgres, redis, memcached, mailcatcher)
docker compose up -d

# 2. Install dependencies (Ruby + client/ + root node renderer)
bundle install
(cd client && yarn install)
yarn install

# 3. Create the database
bin/rails db:prepare

# 4. Seed demo data (~130 listings). Everything is generated and driven through the
#    real provider pipeline, so seeded data has passed through the production code path.
bin/rails demo:reset
# DEMO_PROFILE=full bin/rails demo:reset   # ~2600 listings, for load/performance work

# 5. Run the full dev stack (rails + webpack + server-bundle watch + renderer + sidekiq)
bin/dev
```

Then open:

| Page | URL |
|---|---|
| Home | http://localhost:3000/ |
| Browse (search, map, filters) | http://localhost:3000/s |
| Destination page | http://localhost:3000/l/sy |
| Listing detail (booking + price comparison) | http://localhost:3000/listings/1 |
| Host profile | http://localhost:3000/hosts/1 |
| SSR smoke page | http://localhost:3000/hello_world |

`bin/rails demo:verify` checks the seeded data still matches the shape the app expects.

### Credentials

No `config/credentials.yml.enc` ships with this repo — generate your own if you need one:

```bash
bin/rails credentials:edit     # creates config/master.key (gitignored) + the encrypted file
```

Nothing in the app currently reads encrypted credentials: `script/prod-local` runs the
production stack with `SECRET_KEY_BASE_DUMMY=1`, so you can boot production mode locally
without any secrets at all.

### React on Rails Pro license
Pro is a commercial dependency consumed from public registries; a license (JWT) is supplied via
the `REACT_ON_RAILS_PRO_LICENSE` environment variable. **Development works without one** — the
license status is `missing` but rendering is non-fatal (`bin/rails
react_on_rails_pro:verify_license` reports status). A license is required for production.

## Verify SSR goes through the renderer

```bash
bin/rails react_on_rails:generate_packs
NODE_ENV=development bin/shakapacker      # build client + server bundles
bash script/smoke-ssr.sh                  # renderer up → 200 + SSR markup; renderer down → 500
```
The "renderer down → 500" is intentional: SSR does **not** silently fall back to in-process
ExecJS, because this is a renderer testbed (`config.renderer_use_fallback_exec_js = false`).

## Checks (the same gates CI runs)

```bash
bundle exec rubocop                 # Ruby lint
(cd client && yarn lint)            # JS/JSX lint
bundle exec rspec                   # Ruby specs (unit + system)
(cd client && yarn test)            # jest (client)
bin/shakapacker                     # build client + server bundles
```

System specs drive a real browser against a live Puma server and the out-of-process Node
renderer, so build the bundles first. They run in both viewports
(`CAPYBARA_WINDOW_SIZE=mobile bundle exec rspec spec/system`).

## Further reading

- [`docs/running-production-locally.md`](docs/running-production-locally.md) — run the app in
  `RAILS_ENV=production` locally (the baseline used for performance comparisons).
- [`docs/renderer-profiling.md`](docs/renderer-profiling.md) — heap snapshots and memory
  profiling of the Node renderer.
- [`docs/experiments/`](docs/experiments/) — write-ups of individual investigations.
- [CONTRIBUTING.md](CONTRIBUTING.md) — conventions for changes.
