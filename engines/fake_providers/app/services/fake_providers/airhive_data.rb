# frozen_string_literal: true

module FakeProviders
  # Airhive raw schema: deeply NESTED objects; calendar is a per-day object array.
  module AirhiveData
    module_function

    def details(native_id)
      rng = Deterministic.rng("airhive", native_id, "details")
      beds = Synthetic.bedrooms(rng)
      {
        listing: {
          id: native_id,
          headline: Synthetic.title(rng),
          space: {
            bedrooms: beds,
            bathrooms: Synthetic.bathrooms(rng),
            beds: beds + rng.rand(0..2),
            accommodates: Synthetic.max_guests(rng, beds)
          },
          location: {
            lat: Synthetic.lat(rng),
            lng: Synthetic.lng(rng),
            city: Synthetic.city(rng),
            country: "United States"
          },
          host: { name: Synthetic.host_name(rng), is_superhost: rng.rand > 0.6 },
          description: Synthetic.description(rng),
          amenities: Synthetic.amenity_codes(rng).map { |code| { code: code, group: "standard" } },
          photos: Synthetic.photo_urls(rng, 15).map { |u| { url: u, caption: nil } }
        },
        pricing_summary: {
          base_nightly: Synthetic.base_price(rng),
          cleaning: rng.rand(40..160),
          currency: "USD"
        },
        ratings: { overall: Synthetic.rating(rng), count: Synthetic.review_count(rng) }
      }
    end

    def calendar(native_id, start_date, days)
      rng = Deterministic.rng("airhive", native_id, "calendar")
      {
        days: Synthetic.calendar_nights(rng, start_date, days: days).map do |night|
          {
            date: night[:date].iso8601,
            available: night[:available],
            price: night[:price],
            min_nights: night[:min_stay]
          }
        end
      }
    end

    def quote(native_id, check_in, check_out, guests)
      nights = (check_out - check_in).to_i
      cal = calendar(native_id, check_in, nights)[:days]
      {
        quote: {
          nightly_subtotal: cal.sum { |day| day[:price] },
          cleaning: Deterministic.rng("airhive", native_id, "clean").rand(40..160),
          guests: guests,
          currency: "USD"
        }
      }
    end

    def reviews(native_id)
      rng = Deterministic.rng("airhive", native_id, "reviews")
      {
        reviews: Array.new(Synthetic.review_count(rng).clamp(0, 8)) do
          { author: Synthetic.host_name(rng).split.first, stars: Synthetic.review_stars(rng), body: "Great stay." }
        end
      }
    end
  end
end
