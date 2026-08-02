// React on Rails Pro Node renderer launcher.
//
// This file lives at the repo ROOT (not client/) because it needs the root
// node_modules, and client/ can be deleted after a production build.
// Rails routes SSR here over HTTP (see config/initializers/react_on_rails_pro.rb);
// proving SSR is *remote* — not an in-process ExecJS fallback — is a hard
// requirement here.

// Default to production so a deploy that forgets to set RAILS_ENV still runs the
// renderer's fail-closed password check (an auth-less SSR endpoint on a non-loopback
// host is a real risk). Local dev sets RAILS_ENV=development explicitly (Procfile.dev).
process.env.RAILS_ENV ||= 'production';
// This demo never sends SSR errors anywhere.
process.env.SENTRY_DSN = '';

const path = require('path');
const { reactOnRailsProNodeRenderer } = require('react-on-rails-pro-node-renderer');

const config = {
  // Cache built server bundles under the app's tmp/ dir.
  serverBundleCachePath: path.resolve(__dirname, 'tmp/bundles'),
  port: process.env.RENDERER_PORT || 3800,
  // Shared secret the Rails app authenticates SSR requests with in production-like
  // runs (set by script/prod-local); undefined in dev where no password is used.
  password: process.env.RENDERER_PASSWORD,
  logLevel: process.env.RENDERER_LOG_LEVEL || 'info',
  workersCount: process.env.RENDERER_CONCURRENCY || 3,
  allWorkersRestartInterval: process.env.RENDERER_ALL_WORKERS_RESTART_INTERVAL || 45, // minutes
  delayBetweenIndividualWorkerRestarts:
    process.env.RENDERER_DELAY_BETWEEN_INDIVIDUAL_WORKER_RESTARTS || 6, // minutes
  supportModules: true,
};

// On CI/virtual hosts the CPU count is the host's, not the container's, which
// over-spawns workers. Cap it.
if (process.env.CI) {
  config.workersCount = 2;
}

reactOnRailsProNodeRenderer(config);
