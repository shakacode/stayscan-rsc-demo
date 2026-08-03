class CreateMaterializedAutocompleteLocations < ActiveRecord::Migration[7.2]
  def change
    create_view :materialized_autocomplete_locations, materialized: true
  end
end
