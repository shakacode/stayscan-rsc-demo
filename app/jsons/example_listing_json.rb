# frozen_string_literal: true

# The "what's cheaper" example on the home page: one real aggregate_listing with
# its per-channel nightly prices so the hero can show the same stay costing
# different amounts across providers, and the savings from picking the cheapest.
class ExampleListingJson
  PROVIDER_LABELS = {
    "airhive" => "Airhive", "vacario" => "Vacario", "lodgeo" => "Lodgeo", "hostflow" => "Book direct"
  }.freeze

  def self.build
    listing = Listing.where(origin: "aggregated").where.not(title: nil)
                     .joins(:listing_channels).group(:id).having("COUNT(listing_channels.id) >= 2")
                     .order(:id).first
    listing && new(listing).as_json
  end

  def initialize(listing)
    @listing = listing
  end

  def as_json(*)
    channels = channel_prices
    cheapest = channels.min_by { |channel| channel[:nightlyFrom] }
    dearest = channels.max_by { |channel| channel[:nightlyFrom] }

    {
      id: @listing.id,
      title: @listing.title,
      city: @listing.city,
      photo: Array(@listing.photos).first,
      rating: @listing.blended_rating&.to_f,
      reviewsCount: @listing.reviews_count,
      channels: channels,
      cheapestProvider: cheapest && cheapest[:provider],
      savings: cheapest && dearest && (dearest[:nightlyFrom] - cheapest[:nightlyFrom]).to_i
    }
  end

  private

  def channel_prices
    @listing.listing_channels.filter_map do |channel|
      next unless channel.nightly_price_floor

      { provider: PROVIDER_LABELS.fetch(channel.provider_type, channel.provider_type.titleize),
        nightlyFrom: channel.nightly_price_floor.to_i }
    end.sort_by { |channel| channel[:nightlyFrom] }
  end
end
