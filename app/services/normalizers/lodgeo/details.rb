# frozen_string_literal: true

module Normalizers
  module Lodgeo
    class Details
      def self.call(raw)
        p = raw.fetch("Property")
        details = p.fetch("Details")
        NormalizedDetails.new(
          title: p["Name"],
          description: p.dig("Description", "#text"),
          bedrooms: details["Bedrooms"].to_i,
          bathrooms: details["Bathrooms"].to_i,
          beds: nil,
          max_guests: details["MaxOccupancy"].to_i,
          lat: p.dig("GeoLocation", "Latitude").to_f,
          lng: p.dig("GeoLocation", "Longitude").to_f,
          city: p.dig("Locality", "City"),
          country: p.dig("Locality", "Country"),
          host_name: nil,
          base_price: p.dig("Rates", "BaseRate").to_f,
          cleaning_fee: nil,
          rating: p.dig("Guest", "Rating").to_f,
          reviews_count: p.dig("Guest", "ReviewTotal").to_i,
          photos: Array(p.dig("Media", "Image")),
          amenities: Array(p.dig("Amenities", "Code")).map(&:to_i)
        )
      end
    end
  end
end
