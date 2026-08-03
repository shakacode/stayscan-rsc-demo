// SSR-only globals (e.g. AbortController for MapLibre) — must load before any
// component module so map-bearing pages don't crash the RORP renderer worker.
import './serverPolyfills';
// import statement added by react_on_rails:generate_packs rake task
import '../generated/server-bundle-generated';
// Placeholder comment - auto-generated imports will be prepended here by react_on_rails:generate_packs
