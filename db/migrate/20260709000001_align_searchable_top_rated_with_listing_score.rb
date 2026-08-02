# frozen_string_literal: true

# The listing_search_rows.top_rated projection (used by the browse view "Top-rated only"
# filter) drifted from ListingScore#top_rated? (used by the tile/listing-detail view "Top rated"
# badge): v01 marked any rating>=4.7 + reviews>=10 listing, ignoring the trust
# requirement. v02 mirrors the model exactly. Backfill re-fires the trigger for
# every listing so the corrected value lands across the existing projection.
class AlignSearchableTopRatedWithListingScore < ActiveRecord::Migration[7.2]
  # CREATE OR REPLACE in place (create_function runs the versioned file's SQL) —
  # update_function would DROP first, which the dependent trigger forbids.
  def up
    create_function :listings_to_search_row_trigger, version: 2
    execute "UPDATE listings SET updated_at = now()"
  end

  def down
    create_function :listings_to_search_row_trigger, version: 1
    execute "UPDATE listings SET updated_at = now()"
  end
end
