# frozen_string_literal: true

# Read model over the materialized autocomplete view. Refresh with
# `AutocompleteLocation.refresh` after location/listing-count changes.
class AutocompleteLocation < ApplicationRecord
  self.table_name = "materialized_autocomplete_locations"

  def self.refresh
    Scenic.database.refresh_materialized_view(:materialized_autocomplete_locations, concurrently: false, cascade: false)
  end

  def readonly?
    true
  end
end
