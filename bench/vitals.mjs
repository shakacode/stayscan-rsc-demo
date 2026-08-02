// Web-vitals A/B harness. Loads the same path from two running servers,
// interleaving A/B/A/B… to cancel machine drift, and reports TTFB/FCP/LCP/CLS/DCL/
// Load as mean/median/sd plus the treatment-vs-baseline Δ%. This is how the RSC
// work is measured against the SSR baseline; the self-test runs baseline vs
// baseline and expects |Δ| within noise.
//
//   node bench/vitals.mjs --a http://localhost:3100 --b http://localhost:3300 --path /listings/2 --n 20
//   MOBILE=1 node bench/vitals.mjs ...            # 4x CPU throttle + slow-4G
//   CHROME_PATH=/path/to/chrome node bench/vitals.mjs ...
import puppeteer from 'puppeteer-core';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const A = arg('a', 'http://localhost:3000');
const B = arg('b', 'http://localhost:3000');
const PATHNAME = arg('path', '/');
const N = Number(arg('n', '20'));
const WARMUP = Number(arg('warmup', '3'));
const MOBILE = process.env.MOBILE === '1';
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const SETTLE_MS = 1200; // let LCP/CLS observers settle after load

const METRICS = ['ttfb', 'fcp', 'lcp', 'cls', 'dcl', 'load'];

// Installed before any page script runs: accumulate LCP (last entry) and CLS (sum).
function installObservers() {
  window.__vitals = { lcp: 0, cls: 0 };
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    window.__vitals.lcp = entries[entries.length - 1].startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
  }).observe({ type: 'layout-shift', buffered: true });
}

function readMetrics() {
  const nav = performance.getEntriesByType('navigation')[0];
  const fcp = performance.getEntriesByName('first-contentful-paint')[0];
  return {
    ttfb: nav ? nav.responseStart : 0,
    fcp: fcp ? fcp.startTime : 0,
    lcp: window.__vitals.lcp || 0,
    cls: window.__vitals.cls || 0,
    dcl: nav ? nav.domContentLoadedEventEnd : 0,
    load: nav ? nav.loadEventEnd : 0,
  };
}

async function measure(browser, url) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const client = await page.target().createCDPSession();
  if (MOBILE) {
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
    });
  }
  await page.evaluateOnNewDocument(installObservers);
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await new Promise((r) => setTimeout(r, SETTLE_MS));
  const m = await page.evaluate(readMetrics);
  await page.close();
  return m;
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const sd = (xs) => { const mu = mean(xs); return Math.sqrt(mean(xs.map((x) => (x - mu) ** 2))); };

async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const urlA = A.replace(/\/$/, '') + PATHNAME;
  const urlB = B.replace(/\/$/, '') + PATHNAME;
  const samples = { a: {}, b: {} };
  METRICS.forEach((k) => { samples.a[k] = []; samples.b[k] = []; });

  console.log(`vitals A/B — path=${PATHNAME}  n=${N} (+${WARMUP} warmup)  mobile=${MOBILE}`);
  console.log(`  A=${urlA}\n  B=${urlB}\n`);

  for (let i = 0; i < N + WARMUP; i++) {
    // Interleave, alternating who goes first, so neither variant owns the warm slot.
    const order = i % 2 === 0 ? ['a', 'b'] : ['b', 'a'];
    for (const which of order) {
      const m = await measure(browser, which === 'a' ? urlA : urlB);
      if (i >= WARMUP) METRICS.forEach((k) => samples[which][k].push(m[k]));
    }
    process.stdout.write(`\r  iteration ${i + 1}/${N + WARMUP}`);
  }
  process.stdout.write('\n\n');
  await browser.close();

  const pad = (s, n) => String(s).padStart(n);
  console.log(`${pad('metric', 8)} ${pad('A mean', 10)} ${pad('A med', 9)} ${pad('B mean', 10)} ${pad('B med', 9)} ${pad('Δ% (med)', 10)}`);
  for (const k of METRICS) {
    const a = samples.a[k]; const b = samples.b[k];
    const am = median(a); const bm = median(b);
    const delta = am === 0 ? 0 : ((bm - am) / am) * 100;
    const unit = k === 'cls' ? '' : 'ms';
    const fmt = (x) => (k === 'cls' ? x.toFixed(3) : Math.round(x) + unit);
    console.log(`${pad(k, 8)} ${pad(fmt(mean(a)), 10)} ${pad(fmt(am), 9)} ${pad(fmt(mean(b)), 10)} ${pad(fmt(bm), 9)} ${pad(delta.toFixed(1) + '%', 10)}  (A sd ${fmt(sd(a))})`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
