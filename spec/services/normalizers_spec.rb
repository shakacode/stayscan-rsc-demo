# frozen_string_literal: true

require "rails_helper"

# Each provider's distinct raw schema -> the one shared normalized shape. Known
# fixtures in, exact normalized output out.
RSpec.describe "Normalizers" do
  describe "details translation across the provider schemas" do
    it "Airhive: pulls fields out of the NESTED schema" do
      raw = {
        "listing" => {
          "headline" => "Sunlit Villa", "space" => { "bedrooms" => 3, "bathrooms" => 2, "beds" => 4, "accommodates" => 6 },
          "location" => { "lat" => 8.9, "lng" => -140.4, "city" => "Kivora", "country" => "United States" },
          "host" => { "name" => "Kai Alana" }, "description" => "Sea-view hale.",
          "amenities" => [ { "code" => 1 }, { "code" => 5 } ],
          "photos" => [ { "url" => "a.jpg" }, { "url" => "b.jpg" } ]
        },
        "pricing_summary" => { "base_nightly" => 220, "cleaning" => 90 },
        "ratings" => { "overall" => 4.8, "count" => 41 }
      }

      d = Normalizers::Airhive::Details.call(raw)

      expect(d).to have_attributes(title: "Sunlit Villa", description: "Sea-view hale.", bedrooms: 3,
                                   max_guests: 6, city: "Kivora", base_price: 220, cleaning_fee: 90,
                                   rating: 4.8, reviews_count: 41)
      expect(d.photos).to eq(%w[a.jpg b.jpg])
      expect(d.amenities).to eq([ 1, 5 ])
    end

    it "Vacario: pulls fields out of the FLAT snake_case schema" do
      raw = { "title" => "Cozy Loft", "bedroom_count" => 2, "bathroom_count" => 1, "sleeps" => 4,
              "latitude" => 9.0, "longitude" => -140.5, "city_name" => "Marisel", "country_code" => "US",
              "owner_full_name" => "Nina Farrow", "nightly_rate_usd" => 175, "cleaning_fee_usd" => 60,
              "review_score" => 4.5, "review_count" => 12, "summary_text" => "Flat downtown.",
              "amenity_codes" => "2,4,6", "image_urls" => %w[x.jpg] }

      d = Normalizers::Vacario::Details.call(raw)

      expect(d).to have_attributes(title: "Cozy Loft", description: "Flat downtown.", bedrooms: 2,
                                   max_guests: 4, city: "Marisel", host_name: "Nina Farrow",
                                   base_price: 175, rating: 4.5, reviews_count: 12)
      expect(d.amenities).to eq([ 2, 4, 6 ])
    end

    it "Lodgeo: parses string-typed numbers out of the XML-ish schema" do
      raw = { "Property" => {
        "Name" => "Cliffside Hale", "Details" => { "Bedrooms" => "4", "Bathrooms" => "3", "MaxOccupancy" => "8" },
        "GeoLocation" => { "Latitude" => "8.85", "Longitude" => "-140.62" },
        "Locality" => { "City" => "Veska Reef", "Country" => "US" },
        "Rates" => { "BaseRate" => "310.00" }, "Guest" => { "Rating" => "4.6", "ReviewTotal" => "88" },
        "Description" => { "@format" => "text", "#text" => "Cliff-top escape." },
        "Amenities" => { "Code" => %w[3 7 9] },
        "Media" => { "Image" => %w[p.jpg] }
      } }

      d = Normalizers::Lodgeo::Details.call(raw)

      expect(d).to have_attributes(title: "Cliffside Hale", description: "Cliff-top escape.", bedrooms: 4,
                                   max_guests: 8, base_price: 310.0, rating: 4.6, reviews_count: 88)
      expect(d.lat).to eq(8.85)
      expect(d.amenities).to eq([ 3, 7, 9 ])
    end

    it "Hostflow: pulls fields out of the flat VRS schema" do
      raw = { "unit_id" => "hf-1", "name" => "Palm Studio", "bedrooms" => 2, "bathrooms" => 1,
              "max_occupancy" => 5, "latitude" => 8.88, "longitude" => -140.30,
              "manager_name" => "Owen Grover", "description" => "Direct-book studio.",
              "amenity_codes" => [ 1, 4, 9 ], "image_urls" => %w[h1.jpg h2.jpg], "rating" => 4.7, "reviews" => 33 }

      d = Normalizers::Hostflow::Details.call(raw)

      expect(d).to have_attributes(title: "Palm Studio", description: "Direct-book studio.", bedrooms: 2,
                                   max_guests: 5, host_name: "Owen Grover", rating: 4.7, reviews_count: 33)
      expect(d.amenities).to eq([ 1, 4, 9 ])
      expect(d.photos).to eq(%w[h1.jpg h2.jpg])
    end
  end

  describe "calendars: three different encodings -> the same per-night shape" do
    it "Airhive: per-day object array" do
      raw = { "days" => [
        { "date" => "2026-01-01", "available" => true, "price" => 100, "min_nights" => 1 },
        { "date" => "2026-01-02", "available" => false, "price" => 120, "min_nights" => 2 }
      ] }

      nights = Normalizers::Airhive::Calendar.call(raw).nights

      expect(nights.map(&:available)).to eq([ true, false ])
      expect(nights.map(&:price)).to eq([ 100, 120 ])
      expect(nights.first.date).to eq(Date.new(2026, 1, 1))
    end

    it "Vacario: date-range spans expanded to nights" do
      raw = { "availability" => [
        { "from" => "2026-01-01", "to" => "2026-01-04", "status" => "open", "rate" => 130, "min_stay" => 2 },
        { "from" => "2026-01-04", "to" => "2026-01-05", "status" => "booked", "rate" => 130, "min_stay" => 2 }
      ] }

      nights = Normalizers::Vacario::Calendar.call(raw).nights

      expect(nights.size).to eq(4)
      expect(nights.map(&:available)).to eq([ true, true, true, false ])
      expect(nights.map(&:date)).to eq((Date.new(2026, 1, 1)..Date.new(2026, 1, 4)).to_a)
    end

    it "Lodgeo: packed YN string + parallel CSV lists" do
      raw = { "Availability" => { "StartDate" => "2026-01-01", "Calendar" => "YNYY",
                                  "Prices" => "100,110,120,130", "MinStay" => "1,2,2,1" } }

      nights = Normalizers::Lodgeo::Calendar.call(raw).nights

      expect(nights.map(&:available)).to eq([ true, false, true, true ])
      expect(nights.map(&:price)).to eq([ 100, 110, 120, 130 ])
      expect(nights.map(&:min_stay)).to eq([ 1, 2, 2, 1 ])
    end

    it "Hostflow: parallel rate arrays zipped" do
      raw = { "start_date" => "2026-01-01", "nightly" => [ 90, 95 ], "available" => [ true, false ], "min_stay" => [ 1, 3 ] }

      nights = Normalizers::Hostflow::Calendar.call(raw).nights

      expect(nights.map(&:price)).to eq([ 90, 95 ])
      expect(nights.map(&:available)).to eq([ true, false ])
    end
  end

  it "translates real client responses end to end (HTTP -> parse -> normalize)" do
    raw = ChannelDataApi.new.vacario_details("vac-9", "unit-3")

    normalized = Normalizers::Vacario::Details.call(raw)

    expect(normalized.bedrooms).to eq(raw["bedroom_count"])
    expect(normalized.base_price).to eq(raw["nightly_rate_usd"])
  end
end
