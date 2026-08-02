# frozen_string_literal: true

module Normalizers
  module Airhive
    class Details
      def self.call(raw)
        listing = raw.fetch("listing")
        space = listing.fetch("space")
        NormalizedDetails.new(
          title: listing["headline"],
          description: listing["description"],
          bedrooms: space["bedrooms"],
          bathrooms: space["bathrooms"],
          beds: space["beds"],
          max_guests: space["accommodates"],
          lat: listing.dig("location", "lat"),
          lng: listing.dig("location", "lng"),
          city: listing.dig("location", "city"),
          country: listing.dig("location", "country"),
          host_name: listing.dig("host", "name"),
          base_price: raw.dig("pricing_summary", "base_nightly"),
          cleaning_fee: raw.dig("pricing_summary", "cleaning"),
          rating: raw.dig("ratings", "overall"),
          reviews_count: raw.dig("ratings", "count"),
          photos: Array(listing["photos"]).map { |p| p["url"] },
          amenities: Array(listing["amenities"]).map { |a| a["code"] }
        )
      end
    end
  end
end
