# frozen_string_literal: true

# Simple key/enabled/payload feature flags. The browse view reads the map-engine
# flag to pick a map engine with zero page-code changes.
class FeatureFlag < ApplicationRecord
  MAP_ENGINES = %w[leaflet maplibre].freeze

  # Leaflet is the default engine (DOM-based, works everywhere incl. headless
  # tests); the flag flips it to MapLibre (WebGL) with no other changes.
  def self.map_engine
    engine = find_by(key: "map_engine")&.payload&.dig("engine")
    MAP_ENGINES.include?(engine) ? engine : "leaflet"
  end
end
