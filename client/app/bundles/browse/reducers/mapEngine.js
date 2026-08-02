import { MAP_ENGINE_SET } from '../actions/types';

// Which map engine renders ('maplibre' | 'leaflet'), seeded from the feature_flags
// row so the engine flips with zero page-code changes. Defaults to the
// canonical 'leaflet' (matching FeatureFlag.map_engine and seedBrowseState).
export default function mapEngine(state = 'leaflet', action) {
  return action.type === MAP_ENGINE_SET ? action.engine : state;
}
