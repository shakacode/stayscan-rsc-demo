# frozen_string_literal: true

module Normalizers
  module Vacario
    class Details
      def self.call(raw)
        NormalizedDetails.new(
          title: raw["title"],
          description: raw["summary_text"],
          bedrooms: raw["bedroom_count"],
          bathrooms: raw["bathroom_count"],
          beds: nil,
          max_guests: raw["sleeps"],
          lat: raw["latitude"],
          lng: raw["longitude"],
          city: raw["city_name"],
          country: raw["country_code"],
          host_name: raw["owner_full_name"],
          base_price: raw["nightly_rate_usd"],
          cleaning_fee: raw["cleaning_fee_usd"],
          rating: raw["review_score"],
          reviews_count: raw["review_count"],
          photos: Array(raw["image_urls"]),
          amenities: raw["amenity_codes"].to_s.split(",").map(&:to_i)
        )
      end
    end
  end
end
