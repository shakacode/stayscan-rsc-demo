# frozen_string_literal: true

# Denormalized search table, keyed by listing id and maintained entirely
# by the listings_to_search_row trigger. Holds quantized values + an amenity
# bitmask for fast browse view geo/facet queries. Never written directly by app code.
class CreateListingSearchRows < ActiveRecord::Migration[7.2]
  def change
    create_table :listing_search_rows, id: false do |t|
      t.bigint :listing_id, null: false
      t.decimal :lat, precision: 10, scale: 6
      t.decimal :lng, precision: 10, scale: 6
      t.integer :preview_price_cents
      t.bigint :rating_sort_key
      t.integer :bathrooms_tenths
      t.integer :bedrooms
      t.integer :max_guests
      t.bit_varying :amenity_mask
      t.boolean :active, null: false, default: true
      t.boolean :active_browse, null: false, default: true
      t.boolean :book_direct, null: false, default: false
      t.boolean :top_rated, null: false, default: false
      t.datetime :updated_at
    end

    add_index :listing_search_rows, :listing_id, unique: true
    add_index :listing_search_rows, %i[lat lng]
  end
end
