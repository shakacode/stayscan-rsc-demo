# Experiment 01 — image-URL cache memory (bounded vs unbounded)

**Purpose.** Validate the whole memory harness end-to-end *before* the RSC migration — prod-local, `renderer-profile.js`, `script/memory-loadtest.sh`,
`analyze-snapshots.js` — by making a known leak surface and confirming the tools
detect and attribute it.

**Leak surface.** `client/app/libs/imageUrl.js` memoizes derived image URLs in a
module-level `Map`. `IMAGE_URL_CACHE_MODE=bounded` (default) FIFO-caps it at 5,000
entries (evicts oldest-inserted); `unbounded` never evicts, so under SSR load it accumulates one entry per
unique `(photoKey, size, dpr)` the renderer ever produces.

## Method

```bash
# prod-local puma on :3000, profiling renderer on :3800
IMAGE_URL_CACHE_MODE=<mode> RENDERER_PORT=3800 RENDERER_PASSWORD=… node renderer-profile.js
# warm 20 renders → kill -USR2 <worker> (baseline) → 90s soak → kill -USR2 (final)
DURATION=90 RPS=15 script/memory-loadtest.sh
node analyze-snapshots.js <baseline> <final>
```

Same soak for each mode: ~1,300 requests of random seeded pages (listing-detail view / host / browse view /
home), random ids so most listing-detail pages miss the prerender cache and actually render. The
V8 heap snapshot forces a full GC, so its total is **retained** (live) heap — the
honest leak measure; `[HEAP] heapUsed` is pre-GC and includes reclaimable garbage.

## Result

| metric (renderer worker)        | bounded            | unbounded          |
|---------------------------------|--------------------|--------------------|
| `[HEAP] heapUsed` over the soak | oscillates 31–57MB, **settles back to ~31MB** | climbs **31.5 → 58.1MB** monotonically |
| retained heap (snapshot, post-GC) | 31.69 → **31.80MB (+0.10)** | 31.74 → **32.12MB (+0.37)** |
| top retained growers (analyze-snapshots.js) | concatenated-string +0.19, array +0.16 | concatenated-string +0.25, array +0.23, string +0.15 |

Both modes churn the same garbage during load, but **bounded returns to its
baseline** (the cap holds it flat) while **unbounded keeps ~3.7× more retained
growth** — and the growth is exactly where the cache lives: interned/concatenated
**strings** (the URL keys+values) and the **array** backing the `Map`. The harness
saw it, and `analyze-snapshots.js` attributed it.

## Reading it

The magnitude is small here on purpose: 90s over a **finite** 3,000-listing catalog
lets unbounded approach its working set while bounded plateaus at 5,000 entries, so
the gap is a few hundred KB. The effect amplifies with (a) the 60-minute soak
(`script/memory-loadtest-soak.sh`), and (b) a realistic **unbounded key space** —
e.g. real CDN URLs carrying per-request params — where unbounded never plateaus.
The point of experiment 01 isn't the size of *this* leak; it's that the harness
**reproduces, measures, and attributes** one — the capability the RSC migration depends on.

## Harness checklist (all exercised here)

- `renderer-profile.js` — single restart-free worker, 10s `[HEAP]` series, SIGUSR2 → snapshot. ✅
- `script/memory-loadtest.sh` — random-page load at a target RPS against prod-local. ✅
- `analyze-snapshots.js` — before/after diff, ranked growers by type + constructor. ✅
