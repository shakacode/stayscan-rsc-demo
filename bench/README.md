# Web-vitals A/B harness (`bench/vitals.mjs`)

Measures a page's field-ish web vitals under two servers and reports the
treatment-vs-baseline delta. This is how the **RSC migration** is measured
against the **SSR baseline** — same page, same machine, two branches.

## Setup

Self-contained (keeps the repo-root `package.json` renderer-only):

```bash
cd bench && yarn install     # installs puppeteer-core (no bundled Chrome)
```

It drives the **system Chrome**; override with `CHROME_PATH` if it isn't at
`/usr/bin/google-chrome`.

## The two-worktrees / two-ports pattern

To compare two branches, run each in its own worktree + prod-local on its own port,
then point the harness at both:

```bash
# terminal 1 — baseline branch
git worktree add ../ss-baseline main && cd ../ss-baseline
PORT=3100 RENDERER_PORT=3810 script/prod-local build && PORT=3100 RENDERER_PORT=3810 script/prod-local

# terminal 2 — treatment branch
git worktree add ../ss-treatment my-rsc-branch && cd ../ss-treatment
PORT=3300 RENDERER_PORT=3830 script/prod-local build && PORT=3300 RENDERER_PORT=3830 script/prod-local

# terminal 3 — the A/B
node bench/vitals.mjs --a http://localhost:3100 --b http://localhost:3300 --path /listings/2 --n 20
```

## Running

```bash
node bench/vitals.mjs --a <baseUrl> --b <treatmentUrl> --path /listings/2 --n 20 --warmup 3
MOBILE=1 node bench/vitals.mjs ...        # 4x CPU throttle + slow-4G emulation
```

- `--n` measured iterations (**≥ 20** for stable medians), `--warmup` discarded leading runs.
- Iterations **interleave** A/B/A/B… and alternate which variant goes first, so neither
  owns the warm slot and slow machine drift cancels.
- Browser cache is disabled per navigation; the server-side prerender cache stays warm
  (that's the realistic repeat-visit path).
- Metrics: **TTFB, FCP, LCP, CLS, DCL, Load**, reported as mean / median / sd + **Δ% (median)**.

## Honesty check (the self-test)

Run **baseline vs baseline** (same URL for `--a` and `--b`): the medians should land
within noise. At small `--n` or on very fast (warm-cache, single-digit-ms) pages, TTFB
% swings on a few ms of jitter — use `--n 20+` and read the paint metrics (FCP/LCP/CLS),
which should be within a couple of percent. A large, consistent Δ there means the harness
(or the machine) is not stable enough to trust — fix that before reading a real A/B.

## Reading a result

A negative Δ% means the **treatment** was faster. Weigh it against the baseline `sd`:
a Δ smaller than a metric's noise band is not a real difference.
