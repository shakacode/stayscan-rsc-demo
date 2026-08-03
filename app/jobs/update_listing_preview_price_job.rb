# frozen_string_literal: true

# Sets listings.preview_price to the cheapest channel's total for a default stay,
# so tiles/search have a price without a live quote. Writing
# preview_price fires the listings_to_search_row trigger.
class UpdateListingPreviewPriceJob < ApplicationJob
  queue_as :default

  DEFAULT_NIGHTS = 3
  DEFAULT_LEAD_DAYS = 30

  def perform(listing_id, nights: DEFAULT_NIGHTS, lead_days: DEFAULT_LEAD_DAYS)
    listing = Listing.find(listing_id)
    check_in = Date.current + lead_days
    check_out = check_in + nights

    totals = listing.listing_channels.map do |channel|
      Quote::Calculations::Total.call(channel:, check_in:, check_out:, adults: 2).total
    end

    listing.update!(preview_price: totals.min) if totals.any?
  end
end
