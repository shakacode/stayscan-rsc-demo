# frozen_string_literal: true

# Read-only projection of a listing for search. Maintained entirely by the
# listings_to_search_row trigger; never written by app code.
class ListingSearchRow < ApplicationRecord
  self.primary_key = :listing_id

  belongs_to :listing
end
