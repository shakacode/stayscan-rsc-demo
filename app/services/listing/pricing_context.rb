# frozen_string_literal: true

class Listing
  # Decorator that precomputes the listing-detail view's per-channel pricing rows: the
  # "from" nightly price, a representative total for a sample stay, availability,
  # cheapest channel and savings. All pricing ARITHMETIC lives here so the JSON
  # builders stay pure (the reviewer greps the builders for math).
  class PricingContext
    Row = Data.define(:provider_type, :nightly_from, :sample_total, :available, :book_direct)

    SAMPLE_NIGHTS = 3

    def self.call(listing)
      new(listing).call
    end

    def initialize(listing)
      @listing = listing
    end

    def call
      rows = @listing.listing_channels.map { |channel| row_for(channel) }
      priced = rows.select(&:available)
      cheapest = priced.min_by(&:sample_total)
      dearest = priced.max_by(&:sample_total)

      {
        rows: rows,
        cheapest_provider: cheapest&.provider_type,
        sample_nights: SAMPLE_NIGHTS,
        savings: cheapest && dearest ? (dearest.sample_total - cheapest.sample_total).round(2) : 0
      }
    end

    private

    def row_for(channel)
      nightly = channel.nightly_price_floor || channel.nightly_price_default
      Row.new(
        provider_type: channel.provider_type,
        nightly_from: nightly&.to_i,
        sample_total: sample_total(channel, nightly),
        available: available?(channel),
        book_direct: channel.provider_type == "hostflow"
      )
    end

    # Representative total for a SAMPLE_NIGHTS stay: nightly * nights + fixed fees,
    # taxed. Real per-stay quotes come from the SQL total_price via the quote endpoint.
    def sample_total(channel, nightly)
      return nil unless nightly

      rent = nightly.to_d * SAMPLE_NIGHTS
      subtotal = rent + channel.static_fee.to_d
      (subtotal * (1 + channel.tax_rate.to_d)).round(2)
    end

    # Sellable if nights we hold no calendar for are assumed open, or if the
    # window we do hold has at least one night no blackout covers.
    def available?(channel)
      return true if channel.stay_availability_default

      window = channel.calendar_window
      return false if window.blank?

      blocked = channel.channel_blackouts.select(&:stay?)
                       .sum { |blackout| (blackout.during.end - blackout.during.first).to_i }
      blocked < (window.end - window.first).to_i
    end
  end
end
