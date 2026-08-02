# Profiling the Node renderer for memory

The out-of-process Node renderer (`renderer.js`) is where SSR memory lives. To hunt
leaks — most importantly before/after the RSC migration — swap it for the
profiling variant and drive load against prod-local.

## 1. Boot the profiling renderer

`renderer-profile.js` is `renderer.js` with three changes: **one worker** (so growth
is attributable to a single process), **no scheduled restarts** (so a leak
accumulates instead of being swept away), a **10s `[HEAP]` time series**, and a
**SIGUSR2 → heap-snapshot** handler.

```bash
# In place of the renderer in Procfile.prod.local (or standalone):
RENDERER_PORT=3800 RENDERER_PASSWORD=prod-local-placeholder-secret node renderer-profile.js
```

You'll see, every 10s:

```
[HEAP] pid=12345 t=30s rss=210.4MB heapUsed=98.1MB heapTotal=150.0MB external=12.3MB
```

Unbounded `rss`/`heapUsed` growth ⇒ a leak; a plateau ⇒ healthy.

## 2. Snapshot before and after a soak

```bash
WORKER=$(pgrep -f 'node renderer-profile.js' | tail -1)   # the worker, not the master

kill -USR2 $WORKER                       # baseline, after warmup
script/memory-loadtest.sh                # drive traffic (see below)
kill -USR2 $WORKER                       # after the soak
```

Snapshots land in `tmp/heapsnapshots/heap-<pid>-<ts>.heapsnapshot`.

## 3. Attribute the growth

```bash
node analyze-snapshots.js tmp/heapsnapshots/<before>.heapsnapshot tmp/heapsnapshots/<after>.heapsnapshot
```

It parses the V8 snapshots (no deps) and prints the object **types** and
**constructors** that grew the most:

```
total self_size:  before=71.20MB  after=118.60MB  delta=47.40MB

== By object name / constructor (top growers, delta MB) ==
    31.90   Buffer   (2.10 -> 34.00)
     6.20   Object   (18.4 -> 24.6)
     ...
```

The top rows name the leaking category — e.g. an unbounded image-URL cache shows up
as `Buffer`/`string` growth traceable to that module (see
`docs/experiments/01-image-url-cache-memory.md`).

## Notes

- Load either with `script/memory-loadtest.sh` (short) or its 60-minute soak variant
  for a slow leak.
- The master process also logs `[HEAP]`; use the **worker** pid for snapshots — it's
  the one that renders.
- Snapshots are large (tens of MB). `tmp/heapsnapshots/` is git-ignored.
