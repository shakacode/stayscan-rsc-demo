# frozen_string_literal: true

module FakeProviders
  # Lodgeo raw schema: XML-ish nested JSON (PascalCase keys, "@"-prefixed
  # attributes, string-typed numbers); calendar is a packed availability string.
  # The deep-link channel ref is deliberately NOT in the feed — it comes from a
  # separate endpoint (the lazy-resolution quirk).
  module LodgeoData
    module_function

    def details(native_id, native_unit_id)
      rng = Deterministic.rng("lodgeo", native_id, native_unit_id, "details")
      beds = Synthetic.bedrooms(rng)
      {
        Property: {
          "@id": native_id,
          "@unit": native_unit_id,
          Name: Synthetic.title(rng),
          Details: {
            Bedrooms: beds.to_s,
            Bathrooms: Synthetic.bathrooms(rng).to_s,
            MaxOccupancy: Synthetic.max_guests(rng, beds).to_s
          },
          GeoLocation: { Latitude: Synthetic.lat(rng).to_s, Longitude: Synthetic.lng(rng).to_s },
          Locality: { City: Synthetic.city(rng), Country: "US" },
          Rates: { BaseRate: format("%.2f", Synthetic.base_price(rng)), Currency: "USD" },
          Guest: { Rating: Synthetic.rating(rng).to_s, ReviewTotal: Synthetic.review_count(rng).to_s },
          Description: { "@format": "text", "#text": Synthetic.description(rng) },
          Amenities: { Code: Synthetic.amenity_codes(rng).map(&:to_s) },
          Media: { Image: Synthetic.photo_urls(rng, 10) }
        }
      }
    end

    # No deep-link ref in the feed — the provider assigns an opaque channel_ref
    # per (property, unit), returned lazily from this separate call.
    def channel_ref(native_id, native_unit_id)
      rng = Deterministic.rng("lodgeo", native_id, native_unit_id, "channel-ref")
      ref = rng.rand(36**8).to_s(36).rjust(8, "0")
      { Property: { "@id": native_id, ChannelRef: ref } }
    end

    def calendar(native_id, native_unit_id, start_date, days)
      rng = Deterministic.rng("lodgeo", native_id, native_unit_id, "calendar")
      nights = Synthetic.calendar_nights(rng, start_date, days: days)
      {
        Availability: {
          StartDate: start_date.iso8601,
          Calendar: nights.map { |night| night[:available] ? "Y" : "N" }.join,
          Prices: nights.map { |night| night[:price] }.join(","),
          MinStay: nights.map { |night| night[:min_stay] }.join(",")
        }
      }
    end

    def quote(native_id, native_unit_id, check_in, check_out, guests)
      rng = Deterministic.rng("lodgeo", native_id, native_unit_id, "calendar")
      nights = Synthetic.calendar_nights(rng, check_in, days: (check_out - check_in).to_i)
      {
        Quote: {
          "@id": native_id,
          RentTotal: format("%.2f", nights.sum { |night| night[:price] }),
          CleaningFee: format("%.2f", Deterministic.rng("lodgeo", native_id, native_unit_id, "clean").rand(30..140)),
          Guests: guests.to_s
        }
      }
    end

    def reviews(native_id, native_unit_id)
      rng = Deterministic.rng("lodgeo", native_id, native_unit_id, "reviews")
      {
        Reviews: {
          Review: Array.new(Synthetic.review_count(rng).clamp(0, 8)) do
            { Author: Synthetic.host_name(rng), Score: Synthetic.review_stars(rng).to_s, Text: "Wonderful." }
          end
        }
      }
    end
  end
end
