// Client-JS-bytes harness. Reports the JavaScript a given page path actually
// downloads — raw and brotli-compressed — by reading the webpack build artifacts
// (manifest.json + loadable-stats.json) rather than hitting a running server.
//
// "RSC ships less JavaScript to the browser" is the epic's central claim. This
// harness makes that claim measurable.
//
//   node bench/bundles.mjs --path /
//   node bench/bundles.mjs --path /s --path /listings/2
//   node bench/bundles.mjs --a public/packs --b ../ss-treatment/public/packs --path /
//
// The A/B mode mirrors bench/vitals.mjs: point --a and --b at two build
// directories (or two worktrees' public/packs) and the harness reports the
// Δ% per chunk and total.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { brotliCompressSync, constants as zlibConstants } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const collect = (name) => {
  const values = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === `--${name}` && args[i + 1]) values.push(args[i + 1]);
  }
  return values;
};
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const PATHS = collect('path');
if (!PATHS.length) PATHS.push('/');

const DIR_A = arg('a', join(PROJECT_ROOT, 'public/packs'));
const DIR_B = arg('b', null);

// ---------------------------------------------------------------------------
// Path → component mapping
//
// Each key is a URL path pattern. The value is the component name registered
// with ReactOnRails (matches the generated/<Name> entrypoint in the manifest)
// plus a list of async chunk-group names loaded via @loadable/component.
//
// Update this map when a new page or loadable split is added.
// ---------------------------------------------------------------------------

const PAGE_MAP = {
  '/': {
    component: 'Welcome',
    asyncChunks: ['components-BelowFold'],
  },
  '/s': {
    component: 'Browse',
    asyncChunks: ['engines-LeafletEngine', 'engines-MapLibreEngine'],
  },
  '/listings/:id': {
    component: 'ListingDetail',
    asyncChunks: [
      'modals-BookDirectRevealModal',
      'AmenitiesModal',
      'BookingInquiryModal',
      'MessageHostModal',
      'SharePricingModal',
      'NegotiationWizardModal',
      'OtherChannelsModal',
      'UsageLimitModalContainer',
      'ReportReviewModal',
      'PriceAlertModal',
    ],
  },
};

function matchPath(urlPath) {
  // Exact match first.
  if (PAGE_MAP[urlPath]) return PAGE_MAP[urlPath];
  // Pattern match: /listings/:id → /listings/*
  for (const [pattern, entry] of Object.entries(PAGE_MAP)) {
    const re = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
    if (re.test(urlPath)) return entry;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Build-artifact reader
// ---------------------------------------------------------------------------

function loadBuildDir(dir) {
  const manifestPath = join(dir, 'manifest.json');
  const statsPath = join(dir, 'loadable-stats.json');

  if (!existsSync(manifestPath)) {
    console.error(`\n  ✗ ${manifestPath} not found.`);
    console.error('    Run: yarn --cwd client install && bin/shakapacker');
    console.error('    (the harness reads a locally-built tree)\n');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const stats = existsSync(statsPath) ? JSON.parse(readFileSync(statsPath, 'utf8')) : null;

  return { dir, manifest, stats };
}

// ---------------------------------------------------------------------------
// Chunk resolution
//
// For a page path, the browser downloads the union of:
//   1. The `application` entrypoint (every page)
//   2. The `generated/<Component>` entrypoint (auto-loaded per-page pack)
//   3. Async chunks reachable via @loadable/component
//
// The entrypoints section in manifest.json lists JS assets per pack.
// The namedChunkGroups in loadable-stats.json lists assets per async group.
// ---------------------------------------------------------------------------

function resolveChunks(build, pageEntry) {
  const { manifest, stats, dir } = build;
  const entrypoints = manifest.entrypoints || {};

  // 1. application entrypoint JS assets
  const appAssets = entrypoints.application?.assets?.js || [];

  // 2. generated/<Component> entrypoint JS assets
  const componentKey = `generated/${pageEntry.component}`;
  const componentAssets = entrypoints[componentKey]?.assets?.js || [];
  if (!componentAssets.length) {
    console.error(`  ✗ No entrypoint "${componentKey}" in manifest — did the build run?`);
    process.exit(1);
  }

  // Union and deduplicate (preserving order from the component entrypoint,
  // which already includes shared chunks like runtime and vendors).
  const seen = new Set();
  const syncAssets = [];
  for (const asset of componentAssets) {
    if (!seen.has(asset)) { seen.add(asset); syncAssets.push(asset); }
  }
  for (const asset of appAssets) {
    if (!seen.has(asset)) { seen.add(asset); syncAssets.push(asset); }
  }

  // 3. Async chunks from @loadable/component
  const asyncAssets = [];
  const groups = stats?.namedChunkGroups || {};
  for (const chunkName of pageEntry.asyncChunks) {
    const group = groups[chunkName];
    if (!group) continue;
    const jsFiles = (group.assets || [])
      .map(a => typeof a === 'string' ? a : a.name)
      .filter(f => f.endsWith('.js'));
    for (const asset of jsFiles) {
      const prefixed = asset.startsWith('/') ? asset : `/packs/${asset}`;
      if (!seen.has(prefixed)) { seen.add(prefixed); asyncAssets.push(prefixed); }
    }
  }

  // Build per-chunk result: { name, file, rawBytes, brotliBytes }
  const chunks = [];
  const allAssets = [
    ...syncAssets.map(a => ({ asset: a, kind: 'sync' })),
    ...asyncAssets.map(a => ({ asset: a, kind: 'async' })),
  ];

  for (const { asset, kind } of allAssets) {
    // asset is like "/packs/js/runtime.js" — strip leading /packs/ to get disk path.
    const relative = asset.replace(/^\/packs\//, '');
    const filePath = join(dir, relative);
    if (!existsSync(filePath)) {
      chunks.push({ name: relative, kind, rawBytes: 0, brotliBytes: 0, missing: true });
      continue;
    }
    const raw = readFileSync(filePath);
    const br = brotliCompressSync(raw, {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY,
      },
    });
    chunks.push({ name: relative, kind, rawBytes: raw.length, brotliBytes: br.length });
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function fmtBytes(n) {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MiB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${n} B`;
}

function printReport(urlPath, chunks, label) {
  const prefix = label ? `[${label}] ` : '';
  console.log(`\n${prefix}## path=${urlPath}`);
  console.log(`${prefix}  ${'chunk'.padEnd(80)}  ${'kind'.padEnd(6)}  ${'raw'.padStart(12)}  ${'brotli'.padStart(12)}`);

  let totalRaw = 0, totalBr = 0;
  for (const c of chunks) {
    const name = c.missing ? `${c.name} (MISSING)` : c.name;
    console.log(`${prefix}  ${name.padEnd(80)}  ${c.kind.padEnd(6)}  ${fmtBytes(c.rawBytes).padStart(12)}  ${fmtBytes(c.brotliBytes).padStart(12)}`);
    totalRaw += c.rawBytes;
    totalBr += c.brotliBytes;
  }
  console.log(`${prefix}  ${'TOTAL'.padEnd(80)}  ${''.padEnd(6)}  ${fmtBytes(totalRaw).padStart(12)}  ${fmtBytes(totalBr).padStart(12)}`);
  return { totalRaw, totalBr };
}

function printAB(urlPath, chunksA, chunksB) {
  console.log(`\n## path=${urlPath}`);
  const header = `  ${'chunk'.padEnd(65)}  ${'A raw'.padStart(10)}  ${'A br'.padStart(10)}  ${'B raw'.padStart(10)}  ${'B br'.padStart(10)}  ${'Δ raw'.padStart(8)}  ${'Δ br'.padStart(8)}`;
  console.log(header);

  const mapA = new Map(chunksA.map(c => [c.name, c]));
  const mapB = new Map(chunksB.map(c => [c.name, c]));
  const allNames = [...new Set([...chunksA.map(c => c.name), ...chunksB.map(c => c.name)])];

  let totals = { aRaw: 0, aBr: 0, bRaw: 0, bBr: 0 };
  for (const name of allNames) {
    const a = mapA.get(name) || { rawBytes: 0, brotliBytes: 0, kind: '—' };
    const b = mapB.get(name) || { rawBytes: 0, brotliBytes: 0, kind: '—' };
    const dRaw = a.rawBytes ? `${((b.rawBytes - a.rawBytes) / a.rawBytes * 100).toFixed(1)}%` : '—';
    const dBr = a.brotliBytes ? `${((b.brotliBytes - a.brotliBytes) / a.brotliBytes * 100).toFixed(1)}%` : '—';
    console.log(`  ${name.padEnd(65)}  ${fmtBytes(a.rawBytes).padStart(10)}  ${fmtBytes(a.brotliBytes).padStart(10)}  ${fmtBytes(b.rawBytes).padStart(10)}  ${fmtBytes(b.brotliBytes).padStart(10)}  ${dRaw.padStart(8)}  ${dBr.padStart(8)}`);
    totals.aRaw += a.rawBytes; totals.aBr += a.brotliBytes;
    totals.bRaw += b.rawBytes; totals.bBr += b.brotliBytes;
  }
  const dTotRaw = totals.aRaw ? `${((totals.bRaw - totals.aRaw) / totals.aRaw * 100).toFixed(1)}%` : '—';
  const dTotBr = totals.aBr ? `${((totals.bBr - totals.aBr) / totals.aBr * 100).toFixed(1)}%` : '—';
  console.log(`  ${'TOTAL'.padEnd(65)}  ${fmtBytes(totals.aRaw).padStart(10)}  ${fmtBytes(totals.aBr).padStart(10)}  ${fmtBytes(totals.bRaw).padStart(10)}  ${fmtBytes(totals.bBr).padStart(10)}  ${dTotRaw.padStart(8)}  ${dTotBr.padStart(8)}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const buildA = loadBuildDir(DIR_A);
const buildB = DIR_B ? loadBuildDir(DIR_B) : null;

if (buildB) {
  console.log(`# Client JS bytes — A/B comparison`);
  console.log(`# A: ${DIR_A}`);
  console.log(`# B: ${DIR_B}`);
} else {
  console.log(`# Client JS bytes — ${DIR_A}`);
}

for (const urlPath of PATHS) {
  const pageEntry = matchPath(urlPath);
  if (!pageEntry) {
    console.error(`\n  ✗ Unknown path "${urlPath}". Known paths: ${Object.keys(PAGE_MAP).join(', ')}`);
    console.error('    Add the mapping to PAGE_MAP in bench/bundles.mjs');
    process.exit(1);
  }

  if (buildB) {
    const chunksA = resolveChunks(buildA, pageEntry);
    const chunksB = resolveChunks(buildB, pageEntry);
    printAB(urlPath, chunksA, chunksB);
  } else {
    const chunks = resolveChunks(buildA, pageEntry);
    printReport(urlPath, chunks);
  }
}
