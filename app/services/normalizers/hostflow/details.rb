# frozen_string_literal: true

module Normalizers
  module Hostflow
    class Details
      def self.call(raw)
        NormalizedDetails.new(
          title: raw["name"],
          description: raw["description"],
          bedrooms: raw["bedrooms"],
          bathrooms: raw["bathrooms"],
          beds: nil,
          max_guests: raw["max_occupancy"],
          lat: raw["latitude"],
          lng: raw["longitude"],
          city: nil,
          country: nil,
          host_name: raw["manager_name"],
          base_price: nil,
          cleaning_fee: nil,
          rating: raw["rating"],
          reviews_count: raw["reviews"],
          photos: Array(raw["image_urls"]),
          amenities: Array(raw["amenity_codes"]).map(&:to_i)
        )
      end
    end
  end
end
