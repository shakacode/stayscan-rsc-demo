# frozen_string_literal: true

class Listing
  # First bookable check-in within the search horizon and a min-stay-respecting
  # check-out, read off the primary channel's bit-varying availability.
  class NextAvailableDates
    HORIZON_DAYS = 365

    def self.call(listing, from: Date.current)
      new(listing, from).call
    end

    def initialize(listing, from)
      @listing = listing
      @from = from
    end

    def call
      channel = @listing.listing_channels.first
      return nil unless channel

      check_in = (0..HORIZON_DAYS).lazy.map { |offset| @from + offset }
                                  .find { |date| channel.available_for_check_in?(date) }
      return nil unless check_in

      { check_in: check_in, check_out: check_in + (channel.minimum_stay(check_in) || 1) }
    end
  end
end
