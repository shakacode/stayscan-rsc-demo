// Profiling variant of renderer.js: one worker, no scheduled restarts, a
// 10s [HEAP] RSS/heap time series, and SIGUSR2 -> V8 heap snapshot. Use it in place
// of renderer.js while running a soak (script/memory-loadtest.sh) so leaks
// accumulate in a single attributable process and can be diffed offline with
// analyze-snapshots.js.
//
//   RENDERER_PORT=3800 RENDERER_PASSWORD=... node renderer-profile.js
//   kill -USR2 <worker-pid>   # writes tmp/heapsnapshots/heap-<pid>-<ts>.heapsnapshot

const v8 = require('v8');
const fs = require('fs');
const path = require('path');
const { reactOnRailsProNodeRenderer } = require('react-on-rails-pro-node-renderer');

process.env.RAILS_ENV ||= 'production';
process.env.SENTRY_DSN = '';

const SNAPSHOT_DIR = path.resolve(__dirname, 'tmp/heapsnapshots');
fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

const startedAt = Date.now();
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

// A time series a soak can plot: unbounded growth ⇒ leak, plateau ⇒ healthy.
setInterval(() => {
  const m = process.memoryUsage();
  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  console.log(
    `[HEAP] pid=${process.pid} t=${elapsed}s rss=${mb(m.rss)}MB ` +
      `heapUsed=${mb(m.heapUsed)}MB heapTotal=${mb(m.heapTotal)}MB external=${mb(m.external)}MB`,
  );
}, 10_000).unref();

// SIGUSR2 -> heap snapshot for before/after diffing. Take one after warmup and one
// after the soak, then: node analyze-snapshots.js <before> <after>.
process.on('SIGUSR2', () => {
  const file = path.join(SNAPSHOT_DIR, `heap-${process.pid}-${Date.now()}.heapsnapshot`);
  const out = fs.createWriteStream(file);
  v8.getHeapSnapshot().pipe(out);
  out.on('finish', () => console.log(`[HEAP] snapshot written: ${file}`));
});

reactOnRailsProNodeRenderer({
  serverBundleCachePath: path.resolve(__dirname, 'tmp/bundles'),
  port: process.env.RENDERER_PORT || 3800,
  password: process.env.RENDERER_PASSWORD,
  logLevel: process.env.RENDERER_LOG_LEVEL || 'info',
  workersCount: 1, // single worker so memory growth is attributable to one process
  // 24h in minutes — effectively "never restart" for any soak, while staying under
  // the 32-bit-ms setTimeout ceiling (RORP multiplies minutes by 60000).
  allWorkersRestartInterval: 1440,
  delayBetweenIndividualWorkerRestarts: 1440,
  supportModules: true,
});
